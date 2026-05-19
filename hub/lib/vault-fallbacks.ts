/**
 * CipherVault /vault dashboard data.
 * Live trades come from NEXT_PUBLIC_CIPHER_API; this file holds the
 * dashboard chrome (stats, chain breakdown, dWallets, my positions, history)
 * that has no backend equivalent yet.
 */

export const CIPHERVAULT_ACCENT = '#14b8a6'

export type ChainBreakdown = {
  chain: string
  symbol: string
  value: string
  numericValue: number
  pct: number
  color: string
}

export const FALLBACK_CHAIN_BREAKDOWN: ChainBreakdown[] = [
  { chain: 'Bitcoin',  symbol: 'BTC', value: '$620M', numericValue: 620, pct: 50, color: '#f7931a' },
  { chain: 'Ethereum', symbol: 'ETH', value: '$440M', numericValue: 440, pct: 35, color: '#627eea' },
  { chain: 'Solana',   symbol: 'SOL', value: '$180M', numericValue: 180, pct: 15, color: '#9945ff' },
]

export type VaultStat = {
  label: string
  value: string
  change: string
  changeKind: 'up' | 'down' | 'neutral'
}

export const FALLBACK_VAULT_STATS: VaultStat[] = [
  { label: 'Total Value Locked', value: '$1.24B',  change: '+4.1%',     changeKind: 'up'      },
  { label: 'dWallets',           value: '12,491',  change: '+841 wk',   changeKind: 'up'      },
  { label: 'Private Txns',       value: '284,291', change: '+12.3%',    changeKind: 'up'      },
  { label: 'Avg Collat. Ratio',  value: '248%',    change: 'Healthy',   changeKind: 'neutral' },
]

export type MyAssetPosition = {
  asset: 'BTC' | 'ETH' | 'SOL'
  amount: number
  value: number
}

export const FALLBACK_MY_POSITIONS: MyAssetPosition[] = [
  { asset: 'BTC', amount: 1.2,   value: 51408 },
  { asset: 'ETH', amount: 4.8,   value: 10963 },
  { asset: 'SOL', amount: 220.0, value: 21604 },
]

export type DWallet = {
  id: number
  chain: 'BTC' | 'ETH' | 'SOL'
  address: string
  mpcStatus: string
  balance: string
  value: string
  createdAt: string
}

export const FALLBACK_DWALLETS: DWallet[] = [
  { id: 1, chain: 'BTC', address: 'bc1q9k4p3z8a2b7m1n0c5d6e8f3a1b2c4d5e7', mpcStatus: '3/3 active', balance: '1.2 BTC', value: '$51,408', createdAt: 'Jan 10' },
  { id: 2, chain: 'ETH', address: '0x3fAa12cD9b1c4e8f7a3b2d5e6f1c4a8b9d2e3f01', mpcStatus: '3/3 active', balance: '4.8 ETH', value: '$10,963', createdAt: 'Jan 08' },
]

export type AssetMeta = {
  symbol: 'BTC' | 'ETH' | 'SOL'
  name: string
  price: number
  icon: string
  balance: number
}

export const FALLBACK_ASSET_META: AssetMeta[] = [
  { symbol: 'BTC', name: 'Bitcoin',  price: 42840, icon: '₿', balance: 2.841 },
  { symbol: 'ETH', name: 'Ethereum', price: 2284,  icon: '♦', balance: 12.41 },
  { symbol: 'SOL', name: 'Solana',   price: 98.2,  icon: '◎', balance: 1240  },
]

export type HistoryRow = {
  id: string
  type: 'DEP' | 'WDR' | 'TRD' | 'REG'
  asset: string
  amount: string
  value: string
  status: 'completed' | 'pending' | 'failed'
  time: string
  txHash: string
  block: string
  mpcSig: string
  fheProof: string
}

const types: HistoryRow['type'][] = ['DEP', 'DEP', 'TRD', 'WDR', 'REG', 'DEP', 'TRD', 'WDR', 'DEP', 'TRD',
                                     'REG', 'DEP', 'TRD', 'WDR', 'DEP', 'TRD', 'DEP', 'WDR', 'TRD', 'REG']
const assets = ['BTC', 'ETH', 'SOL', 'BTC/ETH', 'ETH/SOL', 'SOL/BTC']

function hex(n: number) {
  let out = ''
  const chars = '0123456789abcdef'
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export const FALLBACK_HISTORY: HistoryRow[] = types.map((type, i) => {
  const asset = type === 'TRD' ? assets[3 + (i % 3)] : assets[i % 3]
  const isPrivate = type === 'TRD'
  const amt = (Math.random() * 5 + 0.1)
  return {
    id: `TX-${1000 - i}`,
    type,
    asset,
    amount: isPrivate ? 'Private' : type === 'REG' ? '—' : `${type === 'WDR' ? '-' : '+'}${amt.toFixed(2)}`,
    value: isPrivate ? 'Private' : type === 'REG' ? '—' : `${type === 'WDR' ? '-$' : '+$'}${Math.floor(amt * 5000).toLocaleString()}`,
    status: 'completed',
    time: `Jan ${Math.max(1, 15 - Math.floor(i / 2))} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    txHash: `0x${hex(6)}…${hex(6)}`,
    block: `${18_400_000 + i}`,
    mpcSig: `mpc#${hex(8)}`,
    fheProof: type === 'TRD' ? `zk#${hex(8)}` : '—',
  }
})

export type RecentActivity = {
  icon: string
  protocol: string
  detail: string
  address: string
  time: string
  color: string
}

export const FALLBACK_RECENT_ACTIVITY: RecentActivity[] = [
  { icon: '+', protocol: 'Deposit',     detail: '+2.4 ETH',           address: '0xab…12cd', time: '2m ago',  color: '#10b981' },
  { icon: '⬢', protocol: 'Register',    detail: 'dWallet #12491',     address: 'system',    time: '8m ago',  color: '#3b82f6' },
  { icon: '⇄', protocol: 'Trade',       detail: 'BTC/ETH Private FHE',address: '0xab…12cd', time: '15m ago', color: CIPHERVAULT_ACCENT },
  { icon: '−', protocol: 'Withdraw',    detail: '-0.5 BTC',           address: '0x9c…44ab', time: '1h ago',  color: '#ef4444' },
]
