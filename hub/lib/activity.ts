// Built by vsrupeshkumar
import {
  ETERNALVAULT_API,
  TRUSTMESH_API,
  SHADOW_API,
  PALMFLOW_API,
  CIPHER_API,
} from './api'

export interface ActivityItem {
  id: string
  tool: string
  toolColor: string
  action: string
  wallet: string
  timestamp: string
  chain: string
  txHash?: string
  explorerUrl?: string
}

type Source = {
  tool: string
  toolColor: string
  chain: string
  url: string
}

async function fetchWithTimeout(url: string, ms = 4000): Promise<any> {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  try {
    const res = await fetch(url, { signal: c.signal })
    if (!res.ok) throw new Error(String(res.status))
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  return data.activity || data.streams || data.trades || data.items || data.vaults || data.agents || []
}

export async function fetchAllActivity(walletAddress: string): Promise<ActivityItem[]> {
  if (!walletAddress) return []
  const sources: Source[] = [
    ETERNALVAULT_API && { tool: 'Legacy Vault', toolColor: '#F5A623', chain: 'QIE Mainnet',   url: `${ETERNALVAULT_API}/api/vaults/${walletAddress}` },
    TRUSTMESH_API     && { tool: 'Agent Mesh',  toolColor: '#9945FF', chain: 'Solana Devnet', url: `${TRUSTMESH_API}/api/activity/${walletAddress}` },
    SHADOW_API        && { tool: 'Stealth Executive Suite', toolColor: '#64748B', chain: 'Solana Devnet', url: `${SHADOW_API}/api/activity` },
    PALMFLOW_API      && { tool: 'Yield Operations Hub', toolColor: '#10B981', chain: 'Solana Devnet', url: `${PALMFLOW_API}/api/payroll/${walletAddress}` },
    CIPHER_API        && { tool: 'Private Vault', toolColor: '#06B6D4', chain: 'Multi-chain', url: `${CIPHER_API}/api/trades/${walletAddress}` },
  ].filter(Boolean) as Source[]

  const settled = await Promise.allSettled(sources.map((s) => fetchWithTimeout(s.url)))

  const items: ActivityItem[] = []
  settled.forEach((result, idx) => {
    if (result.status !== 'fulfilled') return
    const source = sources[idx]
    extractItems(result.value).slice(0, 10).forEach((raw: any, i: number) => {
      items.push({
        id: raw.id || `${source.tool}-${i}`,
        tool: source.tool,
        toolColor: source.toolColor,
        chain: source.chain,
        action: raw.action || raw.status || raw.type || 'Activity recorded',
        wallet: raw.wallet || walletAddress,
        timestamp: raw.timestamp || raw.createdAt || new Date().toISOString(),
        txHash: raw.txHash || raw.signature,
        explorerUrl: raw.explorerUrl,
      })
    })
  })

  items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
  return items.slice(0, 50)
}
