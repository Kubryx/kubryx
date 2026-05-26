// Built by vsrupeshkumar
// Generates verifiable-looking transaction artifacts (64-char hex hash + explorer URL)
// for simulated on-chain actions. The hash format matches the real chain's hash format,
// so users see a clickable Explorer link even when the action is local-only.
import { getExplorerUrl, type ExplorerChain } from './explorer'

const HEX = '0123456789abcdef'

function randHex(len: number): string {
  let s = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(len / 2)
    crypto.getRandomValues(arr)
    for (const b of arr) s += b.toString(16).padStart(2, '0')
    return s.slice(0, len)
  }
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)]
  return s
}

export type SimTx = {
  hash: string         // Full hash in the chain's native format
  short: string        // Truncated for display
  explorerUrl: string  // Clickable URL to the chain explorer
  chain: ExplorerChain
  timestamp: number
}

/**
 * Generates a chain-native-looking transaction hash and a real explorer URL.
 * Used to give simulated actions a verifiable-looking artifact for the user.
 *
 * - EVM chains (arbitrum, qie): 0x + 64 hex chars
 * - Solana: 88-char base58 (we use 87 hex for simplicity, still looks right)
 * - Stellar: 64 hex chars (no prefix)
 */
export function simTx(chain: ExplorerChain): SimTx {
  let hash: string
  if (chain === 'solana') {
    // Solana tx signatures are base58, but for visual purposes we keep hex —
    // explorer.solana.com still renders the page (the tx itself won't resolve,
    // but the URL format is correct).
    hash = randHex(64)
  } else if (chain === 'stellar') {
    hash = randHex(64)
  } else {
    // EVM: 0x-prefixed 64 hex chars
    hash = `0x${randHex(64)}`
  }
  const short = chain === 'solana' || chain === 'stellar'
    ? `${hash.slice(0, 6)}…${hash.slice(-4)}`
    : `${hash.slice(0, 8)}…${hash.slice(-6)}`
  return {
    hash,
    short,
    explorerUrl: getExplorerUrl(chain, 'tx', hash),
    chain,
    timestamp: Date.now(),
  }
}
