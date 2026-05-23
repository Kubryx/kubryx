// Built by vsrupeshkumar
// Raw JSON-RPC client for Solana Devnet — no @solana/web3.js dependency.
// Uses fetch + AbortController only.

import { DEVNET_JOB_PDAS, TRUSTMESH_DEVNET_URL } from '../trustmesh-seeds'

const RPC = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || TRUSTMESH_DEVNET_URL

async function rpcPost<T>(method: string, params: unknown[], timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
    const json = await res.json()
    if (json.error) throw new Error(json.error.message ?? 'RPC error')
    return json.result as T
  } finally {
    clearTimeout(t)
  }
}

export async function fetchSolanaSlot(): Promise<number> {
  const slot = await rpcPost<number>('getSlot', [])
  return slot
}

export async function fetchAccountInfo(pubkey: string): Promise<string | null> {
  type RpcResult = { value: { data: [string, string] } | null }
  const result = await rpcPost<RpcResult>('getAccountInfo', [pubkey, { encoding: 'base64' }])
  return result?.value?.data?.[0] ?? null
}

export type OnChainJobAccount = {
  pda: string
  description: string
  ownerSolName: string
  template: string
  owner: string
  templateId: number
  budgetLamports: bigint
  budgetSol: string
  status: number
  agentCount: number
  createdAt: Date
  isLive: true
}

export type JobAccountFallback = {
  pda: string
  description: string
  ownerSolName: string
  template: string
  budgetSol: string
  isLive: false
}

export type JobAccountResult = OnChainJobAccount | JobAccountFallback

// jobAccount Borsh layout (offsets):
//   0-7:   discriminator [u8;8]  — skip
//   8-39:  owner pubkey  [u8;32]
//  40-71:  jobId         [u8;32]
//  72-103: descriptionHash [u8;32]
//  104:    template      u8
//  105-112: budgetLamports u64 LE
//  113:    status        u8
//  114-115: agentCount   u16 LE
//  116-123: createdAt    i64 LE
//  124:    bump          u8
function decodeJobAccount(b64: string): Omit<OnChainJobAccount, 'pda' | 'description' | 'ownerSolName' | 'template'> {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  if (raw.length < 125) throw new Error(`Account data too short: ${raw.length}`)
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength)

  // owner pubkey — base58 encode the 32 bytes
  const ownerBytes = raw.slice(8, 40)
  const owner = encodeBase58(ownerBytes)

  const templateId = view.getUint8(104)
  const budgetLamports = view.getBigUint64(105, true)
  const budgetSol = (Number(budgetLamports) / 1e9).toFixed(4)
  const status = view.getUint8(113)
  const agentCount = view.getUint16(114, true)
  const createdAtSec = view.getBigInt64(116, true)
  const createdAt = new Date(Number(createdAtSec) * 1000)

  return { owner, templateId, budgetLamports, budgetSol, status, agentCount, createdAt, isLive: true }
}

// Minimal base58 encoder for Solana pubkey display
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function encodeBase58(bytes: Uint8Array): string {
  let n = BigInt(0)
  for (const b of bytes) n = (n << BigInt(8)) + BigInt(b)
  let result = ''
  while (n > BigInt(0)) {
    result = BASE58_ALPHABET[Number(n % BigInt(58))] + result
    n = n / BigInt(58)
  }
  for (const b of bytes) {
    if (b !== 0) break
    result = '1' + result
  }
  return result
}

export async function fetchJobAccount(seed: typeof DEVNET_JOB_PDAS[number]): Promise<JobAccountResult> {
  try {
    const b64 = await fetchAccountInfo(seed.pda)
    if (!b64) return { pda: seed.pda, description: seed.description, ownerSolName: seed.ownerSolName, template: seed.template, budgetSol: seed.budgetSol, isLive: false }
    const decoded = decodeJobAccount(b64)
    return {
      pda: seed.pda,
      description: seed.description,
      ownerSolName: seed.ownerSolName,
      template: seed.template,
      ...decoded,
    }
  } catch {
    return { pda: seed.pda, description: seed.description, ownerSolName: seed.ownerSolName, template: seed.template, budgetSol: seed.budgetSol, isLive: false }
  }
}

export async function fetchAllJobAccounts(): Promise<JobAccountResult[]> {
  return Promise.all(DEVNET_JOB_PDAS.map(seed => fetchJobAccount(seed)))
}

export const JOB_STATUS_LABEL: Record<number, string> = {
  0: 'active',
  1: 'complete',
  2: 'revoked',
}
