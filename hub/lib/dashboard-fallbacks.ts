export type ChartPoint = {
  date: string
  operations: number
  transactions: number
}

export type DashStats = {
  tools: number
  toolsSub: string
  chains: number
  chainsSub: string
  mockData: string
  mockDataSub: string
  uptime: string
  uptimeSub: string
}

export const DASH_STATS: DashStats = {
  tools: 8,
  toolsSub: '+2 this Q',
  chains: 4,
  chainsSub: 'Multi-chain',
  mockData: '0',
  mockDataSub: '100% live',
  uptime: '∞',
  uptimeSub: '30d streak',
}

/* 30-day daily activity */
export const ACTIVITY_30D: ChartPoint[] = [
  { date: 'Apr 20', operations: 1180, transactions: 820 },
  { date: 'Apr 21', operations: 1350, transactions: 895 },
  { date: 'Apr 22', operations: 1240, transactions: 830 },
  { date: 'Apr 23', operations: 1520, transactions: 980 },
  { date: 'Apr 24', operations: 1410, transactions: 910 },
  { date: 'Apr 25', operations: 1280, transactions: 860 },
  { date: 'Apr 26', operations: 1190, transactions: 790 },
  { date: 'Apr 27', operations: 1620, transactions: 1050 },
  { date: 'Apr 28', operations: 1480, transactions: 940 },
  { date: 'Apr 29', operations: 1360, transactions: 885 },
  { date: 'Apr 30', operations: 1290, transactions: 850 },
  { date: 'May 1',  operations: 1580, transactions: 1020 },
  { date: 'May 2',  operations: 1720, transactions: 1100 },
  { date: 'May 3',  operations: 1550, transactions: 995 },
  { date: 'May 4',  operations: 1420, transactions: 920 },
  { date: 'May 5',  operations: 1340, transactions: 875 },
  { date: 'May 6',  operations: 1260, transactions: 820 },
  { date: 'May 7',  operations: 1680, transactions: 1080 },
  { date: 'May 8',  operations: 1790, transactions: 1150 },
  { date: 'May 9',  operations: 1650, transactions: 1060 },
  { date: 'May 10', operations: 1520, transactions: 980 },
  { date: 'May 11', operations: 1450, transactions: 935 },
  { date: 'May 12', operations: 1380, transactions: 890 },
  { date: 'May 13', operations: 1760, transactions: 1130 },
  { date: 'May 14', operations: 1840, transactions: 1190 },
  { date: 'May 15', operations: 1710, transactions: 1100 },
  { date: 'May 16', operations: 1590, transactions: 1020 },
  { date: 'May 17', operations: 1480, transactions: 950 },
  { date: 'May 18', operations: 1620, transactions: 1045 },
  { date: 'May 19', operations: 1680, transactions: 1080 },
]

/* 7-day subset */
export const ACTIVITY_7D: ChartPoint[] = ACTIVITY_30D.slice(-7)

/* All-time (90 days, represented as monthly aggregates + recent) */
export const ACTIVITY_ALL: ChartPoint[] = [
  { date: 'Feb 19', operations: 880,  transactions: 600 },
  { date: 'Feb 26', operations: 940,  transactions: 640 },
  { date: 'Mar 5',  operations: 990,  transactions: 680 },
  { date: 'Mar 12', operations: 1050, transactions: 720 },
  { date: 'Mar 19', operations: 1090, transactions: 745 },
  { date: 'Mar 26', operations: 1140, transactions: 780 },
  { date: 'Apr 2',  operations: 1200, transactions: 820 },
  { date: 'Apr 9',  operations: 1320, transactions: 870 },
  { date: 'Apr 16', operations: 1280, transactions: 850 },
  { date: 'Apr 23', operations: 1450, transactions: 935 },
  { date: 'Apr 30', operations: 1290, transactions: 850 },
  { date: 'May 7',  operations: 1680, transactions: 1080 },
  { date: 'May 14', operations: 1840, transactions: 1190 },
  { date: 'May 19', operations: 1680, transactions: 1080 },
]

/* ──────────────────────────────────────────────────────
   Live activity feed (rotates client-side via hook)
   ────────────────────────────────────────────────────── */
export type FeedItemType =
  | 'deploy' | 'deposit' | 'withdraw' | 'loan'
  | 'credit' | 'legacy'  | 'swap'     | 'shadow'

export type FeedItem = {
  id: string
  protocol: string
  protocolColor: string
  action: string
  detail: string
  address: string
  timestamp: string
  type: FeedItemType
}

export const FALLBACK_ACTIVITY_FEED: FeedItem[] = [
  { id: 'f1',  protocol: 'TrustMesh',    protocolColor: '#6366f1', action: 'Agent deployed',      detail: 'Alpha-7 Node',        address: '0x3f…8a2b', timestamp: '2s ago',  type: 'deploy'  },
  { id: 'f2',  protocol: 'CipherVault',  protocolColor: '#14b8a6', action: 'Collateral deposit',  detail: '2.4 ETH locked',      address: '0xab…12cd', timestamp: '8s ago',  type: 'deposit' },
  { id: 'f3',  protocol: 'PalmFlow AI',  protocolColor: '#10b981', action: 'AI route executed',   detail: 'SOL → USDC swap',     address: '0x7e…f3a1', timestamp: '15s ago', type: 'swap'    },
  { id: 'f4',  protocol: 'Lendora',      protocolColor: '#f59e0b', action: 'Loan negotiated',     detail: '$12,400 at 4.2%',     address: '0x9c…2b44', timestamp: '23s ago', type: 'loan'    },
  { id: 'f5',  protocol: 'NeuroCredit',  protocolColor: '#06b6d4', action: 'Credit score update', detail: 'Score: 847 (+12)',    address: '0x1d…77cc', timestamp: '41s ago', type: 'credit'  },
  { id: 'f6',  protocol: 'EternaVault',  protocolColor: '#f43f5e', action: 'Legacy file anchored',detail: 'CID: Qm3f…8a2b',      address: '0x44…9e12', timestamp: '1m ago',  type: 'legacy'  },
  { id: 'f7',  protocol: 'SyncSplit',    protocolColor: '#3b82f6', action: 'Bill settled',        detail: '$340 split 4 ways',   address: '0x2a…b891', timestamp: '2m ago',  type: 'deposit' },
  { id: 'f8',  protocol: 'TrustMesh',    protocolColor: '#6366f1', action: 'Job completed',       detail: 'Inference Task #2241',address: '0x3f…8a2b', timestamp: '3m ago',  type: 'deploy'  },
  { id: 'f9',  protocol: 'ShadowLedger', protocolColor: '#8b5cf6', action: 'Operation logged',    detail: 'Stealth tx confirmed',address: '0xcc…1f3e', timestamp: '4m ago',  type: 'shadow'  },
  { id: 'f10', protocol: 'CipherVault',  protocolColor: '#14b8a6', action: 'FHE trade executed',  detail: 'BTC/ETH · Private',   address: '0xab…12cd', timestamp: '5m ago',  type: 'swap'    },
]

/* ──────────────────────────────────────────────────────
   Tool quick-access cards
   ────────────────────────────────────────────────────── */
export type ToolStatus = 'live' | 'beta' | 'soon'

export type ToolCard = {
  name: string
  href: string
  description: string
  color: string
  status: ToolStatus
  stats: { label: string; value: string }[]
}

export const FALLBACK_TOOLS: ToolCard[] = [
  { name: 'TrustMesh',    href: '/agents',   description: 'AI Agent Coordination on Solana', color: '#6366f1', status: 'live', stats: [{ label: 'Agents',    value: '847'     }, { label: 'TVL',       value: '$284M'    }] },
  { name: 'CipherVault',  href: '/vault',    description: 'Cross-Chain Privacy Vault',       color: '#14b8a6', status: 'live', stats: [{ label: 'Locked',    value: '$1.2B'   }, { label: 'dWallets',  value: '12.4K'    }] },
  { name: 'SyncSplit',    href: '/split',    description: 'Bill Splitting on Stellar',       color: '#3b82f6', status: 'live', stats: [{ label: 'Bills',     value: '28.1K'   }, { label: 'Settled',   value: '$4.2M'    }] },
  { name: 'Lendora',      href: '/lend',     description: 'AI DeFi Loan Negotiation',        color: '#f59e0b', status: 'live', stats: [{ label: 'Loans',     value: '3,291'   }, { label: 'TVL',       value: '$180M'    }] },
  { name: 'NeuroCredit',  href: '/credit',   description: 'Credit Passport on QIE',          color: '#06b6d4', status: 'beta', stats: [{ label: 'Passports', value: '9,847'   }, { label: 'Avg Score', value: '724'      }] },
  { name: 'EternaVault',  href: '/legacy',   description: 'Digital Legacy Vault on QIE',     color: '#f43f5e', status: 'beta', stats: [{ label: 'Vaults',    value: '2,104'   }, { label: 'Assets',    value: '$8.9M'    }] },
  { name: 'PalmFlow AI',  href: '/treasury', description: 'Autonomous Financial OS',         color: '#10b981', status: 'live', stats: [{ label: 'Routed',    value: '$920M'   }, { label: 'Agents',    value: '7 active' }] },
  { name: 'ShadowLedger', href: '/shadow',   description: 'Invisible Operations on Solana',  color: '#8b5cf6', status: 'soon', stats: [{ label: 'Ops',       value: 'Stealth' }, { label: 'Status',    value: 'Coming'   }] },
]

/* 1-day (24 hourly points) */
export const ACTIVITY_1D: ChartPoint[] = [
  { date: '00:00', operations: 38, transactions: 26 },
  { date: '01:00', operations: 32, transactions: 22 },
  { date: '02:00', operations: 28, transactions: 18 },
  { date: '03:00', operations: 24, transactions: 16 },
  { date: '04:00', operations: 26, transactions: 17 },
  { date: '05:00', operations: 34, transactions: 23 },
  { date: '06:00', operations: 48, transactions: 32 },
  { date: '07:00', operations: 58, transactions: 39 },
  { date: '08:00', operations: 65, transactions: 44 },
  { date: '09:00', operations: 72, transactions: 49 },
  { date: '10:00', operations: 69, transactions: 46 },
  { date: '11:00', operations: 74, transactions: 50 },
  { date: '12:00', operations: 68, transactions: 46 },
  { date: '13:00', operations: 71, transactions: 48 },
  { date: '14:00', operations: 76, transactions: 51 },
  { date: '15:00', operations: 80, transactions: 54 },
  { date: '16:00', operations: 75, transactions: 51 },
  { date: '17:00', operations: 66, transactions: 44 },
  { date: '18:00', operations: 59, transactions: 40 },
  { date: '19:00', operations: 54, transactions: 36 },
  { date: '20:00', operations: 50, transactions: 34 },
  { date: '21:00', operations: 47, transactions: 31 },
  { date: '22:00', operations: 43, transactions: 29 },
  { date: '23:00', operations: 39, transactions: 27 },
]
