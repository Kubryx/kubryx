// Built by vsrupeshkumar
// ─── Core Types ────────────────────────────────────────────────────────────────

export type PFAgent = {
  id: string; name: string; type: string; status: 'active'|'idle'|'error'
  allocation: number; efficiency: number; resourceUsed: number
  lastAction: string; rating: number; tasks: number; pnlDelta?: string
}

export type PFStream = {
  id: string; recipientName: string; role: string; wallet: string
  ratePerHour: number; token: string; status: 'active'|'paused'; totalStreamed: number; region: string
}

export type PFHistoryItem = {
  id: string; event: string; agent: string; type: 'payment'|'deposit'|'withdrawal'
  amount: string; status: 'Finalized'|'Pending'; blockchain: string; timestamp: string
}

export type PFPolicy = {
  id: string; name: string; description: string; threshold: number|string
  unit: string; policyType: 'spending'|'yield'|'risk'; status: 'active'|'paused'
}

// ─── New Extended Types ─────────────────────────────────────────────────────────

export type PFAsset = {
  symbol: string; name: string; amount: number; usdValue: number
  network: string; percentage: number; color: string
  explorerUrl?: string
}

export type PFWallet = {
  id: string; address: string; network: string; balance: number
  symbol: string; usdValue: number; label: string
}

export type PFTransaction = {
  id: string; type: 'payment'|'swap'|'deposit'|'withdrawal'
  from: string; to: string; fromAsset: string; toAsset?: string
  fromAmount: number; toAmount?: number; usdValue: number
  status: 'completed'|'pending'|'failed'
  fee: number; timestamp: string; network: string; txHash: string
  blockNumber?: number; memo?: string; error?: string
}

export type PFSwapRoute = {
  id: string; from: string; to: string; fromNetwork: string; toNetwork: string
  steps: { protocol: string; network: string; priceImpact: number; fee: number }[]
  totalCost: number; executionTime: number; expectedOutput: number; slippage: number
  confidence: number; label: string
}

export type PFPaymentRequest = {
  id: string; amount: number; asset: string; network: string
  description: string; status: 'pending'|'paid'|'expired'
  shareLink: string; createdAt: string; expiresAt: string
}

export type PFPortfolio = {
  totalValue: number; change24h: number; change24hPercent: number
  wallets: number; assets: PFAsset[]; monthlySent: number; gasSaved: number
}

export type PFAgentAI = {
  id: string; name: string; role: string; status: 'online'|'offline'
  lastActivity: string; operations: number; color: string
}

export type PFAnalyticsData = {
  totalSent: number; totalReceived: number; gasSpent: number; gasSaved: number
  transactionCount: number; successRate: number
  volumeTrend: { date: string; sent: number; received: number }[]
  assetComposition: { asset: string; amount: number; percentage: number; color: string }[]
  networkDistribution: { network: string; percentage: number; count: number; color: string }[]
  topRecipients: { address: string; amount: number; count: number; percentage: number }[]
}

export type PFSettings = {
  displayName: string; email: string; preferredNetwork: string
  defaultAsset: string; defaultToken: string
  twoFactorEnabled: boolean; autoSign: boolean; confirmTimeout: string
  paymentLimitsEnabled: boolean; dailyLimit: number; singleLimit: number
  notifyPaymentSent: boolean; notifyPaymentReceived: boolean
  notifyPaymentFailed: boolean; notifyLargeTransaction: boolean
  aiRoutingEnabled: boolean; aiOptimization: string; autonomousAgents: boolean
  stealthMode: boolean; privacyPool: boolean
}

// ─── Workforce Agents (existing PalmFlow agents) ────────────────────────────────

export const PF_AGENTS: PFAgent[] = [
  { id:'a1', name:'Arbitrage Hunter', type:'DeFi Specialist',               status:'active', allocation:500,   efficiency:100, resourceUsed:0,     lastAction:'Arbitrage cycle on Solana DEXs for PUSD pairs',         rating:4.9, tasks:24, pnlDelta:'+2.1%' },
  { id:'a2', name:'Atlas',            type:'Product AI',                     status:'active', allocation:1000,  efficiency:100, resourceUsed:0,     lastAction:'Product roadmap analysis and sprint planning complete',  rating:5.0, tasks:12 },
  { id:'a3', name:'Arbitrage Hunter', type:'DeFi Specialist',               status:'active', allocation:500,   efficiency:100, resourceUsed:0.45,  lastAction:'Triangular arbitrage PUSD/USDC/SOL executed',           rating:4.9, tasks:18, pnlDelta:'+90.3%' },
  { id:'a4', name:'Arbitrage Hunter', type:'DeFi Specialist',               status:'active', allocation:500,   efficiency:100, resourceUsed:1.8,   lastAction:'4-hour cycle on Orca, Raydium, Jupiter',                rating:4.9, tasks:31, pnlDelta:'+15.2%' },
  { id:'a5', name:'Risk Manager',     type:'Risk Manager',                   status:'active', allocation:5000,  efficiency:100, resourceUsed:10,    lastAction:'Emergency lock engaged: velocity anomaly detected',      rating:5.0, tasks:8 },
  { id:'a6', name:'Treasury Analyst', type:'Treasury Analyst',               status:'active', allocation:100,   efficiency:100, resourceUsed:5,     lastAction:'Capital allocation optimized: 60/40 split',             rating:5.0, tasks:14 },
  { id:'a7', name:'Marketing AI',     type:'Autonomous Ad Buying & Growth',  status:'idle',   allocation:25000, efficiency:100, resourceUsed:18200, lastAction:'Ad campaigns paused pending budget review',             rating:4.8, tasks:45 },
  { id:'a8', name:'Product AI',       type:'Treasury Strategy & Allocation', status:'active', allocation:50000, efficiency:100, resourceUsed:12450, lastAction:'Yield strategy rebalancing in progress',                rating:4.9, tasks:124 },
]

// ─── AI Intelligence Agents (7-agent system) ────────────────────────────────────

export const PF_AGENTS_AI: PFAgentAI[] = [
  { id:'aegis',   name:'Aegis',   role:'Security Monitor',  status:'online', lastActivity:'Monitoring 247 tx/min for anomalies',           operations:1847, color:'#EF4444' },
  { id:'nomad',   name:'Nomad',   role:'Payment Router',    status:'online', lastActivity:'Optimized route: SOL→USDC via Raydium, saved 23%', operations:3201, color:'#60A5FA' },
  { id:'sentinel',name:'Sentinel',role:'Compliance Auditor',status:'online', lastActivity:'Audit trail verified — 12 blocks finalized',     operations:892,  color:'#F59E0B' },
  { id:'wraith',  name:'Wraith',  role:'Stealth Handler',   status:'online', lastActivity:'Camouflage routing simulation complete',         operations:412,  color:'#8B5CF6' },
  { id:'oracle',  name:'Oracle',  role:'Price Feed',        status:'online', lastActivity:'SOL/USD: $124.82 (+2.1%) — feed live',           operations:9420, color:'#06B6D4' },
  { id:'phantom', name:'Phantom', role:'Transaction Executor',status:'online',lastActivity:'Batch execution: 8 txs finalized in 0.4s',      operations:2100, color:'#A855F7' },
  { id:'echo',    name:'Echo',    role:'Activity Logger',   status:'online', lastActivity:'Indexed 1,247 operations to immutable log',      operations:18200,color:'#22C55E' },
]

// ─── Payroll Streams ────────────────────────────────────────────────────────────

export const PF_STREAMS: PFStream[] = [
  { id:'s1', recipientName:'Alex Rivera', role:'Full Stack Developer', wallet:'7xKp...9mQZ', ratePerHour:54, token:'PUSD', status:'paused', totalStreamed:469.8547, region:'Global' },
]

// ─── Transaction History ─────────────────────────────────────────────────────────

export const PF_HISTORY: PFHistoryItem[] = [
  { id:'h1',  event:'Arbitrage cycle on Solana DEXs — PUSD monitoring',       agent:'Arbitrage Hunter',  type:'payment',    amount:'1.8 PUSD',     status:'Finalized', blockchain:'Internal', timestamp:'5/19/2026, 1:25:44 PM' },
  { id:'h2',  event:'4-hour Arbitrage Hunter cycle on Orca, Raydium, Jupiter', agent:'Arbitrage Hunter',  type:'payment',    amount:'0.25 PUSD',    status:'Finalized', blockchain:'Internal', timestamp:'5/19/2026, 1:25:30 PM' },
  { id:'h3',  event:'Triangular arbitrage PUSD/USDC/SOL',                      agent:'Arbitrage Hunter',  type:'payment',    amount:'0.2 PUSD',     status:'Finalized', blockchain:'Internal', timestamp:'5/19/2026, 1:19:31 PM' },
  { id:'h4',  event:'Initial funding from Treasury',                            agent:'Risk Manager',      type:'deposit',    amount:'5,000 PUSD',   status:'Finalized', blockchain:'Internal', timestamp:'5/19/2026, 9:53:38 AM' },
  { id:'h5',  event:'Initial funding from Treasury',                            agent:'Treasury Analyst',  type:'deposit',    amount:'100 PUSD',     status:'Finalized', blockchain:'Internal', timestamp:'5/19/2026, 9:51:49 AM' },
  { id:'h6',  event:'Ad Credits Purchase',                                      agent:'Marketing AI',      type:'payment',    amount:'250 PUSD',     status:'Finalized', blockchain:'Internal', timestamp:'5/18/2026, 3:42:11 PM' },
  { id:'h7',  event:'Initial funding from Treasury',                            agent:'Marketing AI',      type:'deposit',    amount:'25,000 PUSD',  status:'Finalized', blockchain:'Internal', timestamp:'5/18/2026, 10:00:00 AM' },
  { id:'h8',  event:'Yield optimization rebalance — Kamino/Raydium/Jito',      agent:'Product AI',        type:'payment',    amount:'1,200 PUSD',   status:'Finalized', blockchain:'Internal', timestamp:'5/17/2026, 4:15:00 PM' },
  { id:'h9',  event:'Kamino lending protocol deposit',                          agent:'Treasury Analyst',  type:'deposit',    amount:'3,500 PUSD',   status:'Finalized', blockchain:'Internal', timestamp:'5/16/2026, 8:30:00 AM' },
  { id:'h10', event:'Payroll stream disbursement — Alex Rivera',                agent:'Payroll System',    type:'payment',    amount:'469.85 PUSD',  status:'Finalized', blockchain:'Internal', timestamp:'5/15/2026, 9:00:00 AM' },
  { id:'h11', event:'Initial funding from Treasury',                            agent:'Product AI',        type:'deposit',    amount:'50,000 PUSD',  status:'Finalized', blockchain:'Internal', timestamp:'5/13/2026, 12:00:00 PM' },
  { id:'h12', event:'Risk sentinel: daily threshold reset',                     agent:'Risk Manager',      type:'withdrawal', amount:'0 PUSD',       status:'Finalized', blockchain:'Internal', timestamp:'5/13/2026, 8:00:00 AM' },
]

// ─── Full Transactions (multi-chain) ───────────────────────────────────────────

export const PF_TRANSACTIONS: PFTransaction[] = [
  { id:'t1',  type:'payment',    from:'7xKp...9mQZ', to:'5a8c...9f2b', fromAsset:'USDC', fromAmount:100,    usdValue:100,     status:'completed', fee:0.25, timestamp:'5/19/2026, 3:30 PM', network:'Solana',   txHash:'3xFg...8mPq', blockNumber:312847210 },
  { id:'t2',  type:'swap',       from:'SOL',         to:'USDC',         fromAsset:'SOL',  toAsset:'USDC',    fromAmount:10,    toAmount:1245,     usdValue:1245,    status:'completed', fee:0.50, timestamp:'5/19/2026, 2:15 PM', network:'Solana',   txHash:'7yRt...4kWs', blockNumber:312847100 },
  { id:'t3',  type:'deposit',    from:'External',    to:'Treasury',     fromAsset:'ETH',  fromAmount:5,      usdValue:14920,   status:'completed', fee:0,    timestamp:'5/18/2026, 10:00 AM',network:'Ethereum', txHash:'1aZp...9nVm', blockNumber:19841200 },
  { id:'t4',  type:'withdrawal', from:'Treasury',    to:'0x5a8c...9f2b',fromAsset:'USDT', fromAmount:1000,   usdValue:1000,    status:'pending',   fee:3.00, timestamp:'5/18/2026, 4:45 PM', network:'Ethereum', txHash:'9bQw...2jXl' },
  { id:'t5',  type:'payment',    from:'7xKp...9mQZ', to:'Payroll',      fromAsset:'PUSD', fromAmount:469.85, usdValue:469.85,  status:'completed', fee:0.10, timestamp:'5/18/2026, 9:00 AM', network:'Solana',   txHash:'4cHu...7oYk', blockNumber:312840900 },
  { id:'t6',  type:'swap',       from:'MATIC',       to:'USDC',         fromAsset:'MATIC',toAsset:'USDC',    fromAmount:500,   toAmount:498,      usdValue:498,     status:'completed', fee:0.20, timestamp:'5/17/2026, 5:00 PM', network:'Polygon',  txHash:'2dIv...5pZj', blockNumber:55812300 },
  { id:'t7',  type:'payment',    from:'Treasury',    to:'0x1a29...3b7e',fromAsset:'DAI',  fromAmount:5000,   usdValue:5000,    status:'completed', fee:1.50, timestamp:'5/17/2026, 2:30 PM', network:'Arbitrum', txHash:'6eJw...3qAi', blockNumber:207485120 },
  { id:'t8',  type:'deposit',    from:'Vault',       to:'Treasury',     fromAsset:'SOL',  fromAmount:25,     usdValue:3120,    status:'completed', fee:0,    timestamp:'5/16/2026, 11:00 AM',network:'Solana',   txHash:'8fKx...1rBh', blockNumber:312819400 },
  { id:'t9',  type:'payment',    from:'Treasury',    to:'Marketing',    fromAsset:'PUSD', fromAmount:250,    usdValue:250,     status:'completed', fee:0.05, timestamp:'5/16/2026, 3:00 PM', network:'Solana',   txHash:'0gLy...9sCg', blockNumber:312815600 },
  { id:'t10', type:'swap',       from:'ETH',         to:'USDC',         fromAsset:'ETH',  toAsset:'USDC',    fromAmount:2,     toAmount:5984,     usdValue:5984,    status:'failed',    fee:2.10, timestamp:'5/15/2026, 8:45 PM', network:'Ethereum', txHash:'5hMz...6tDf', error:'Slippage tolerance exceeded' },
]

// ─── Swap Routes ───────────────────────────────────────────────────────────────

export const PF_SWAP_ROUTES: PFSwapRoute[] = [
  {
    id:'r1', from:'SOL', to:'USDC', fromNetwork:'Solana', toNetwork:'Solana', label:'Raydium (Fastest)',
    steps:[{ protocol:'Raydium AMM', network:'Solana', priceImpact:0.2, fee:0.50 }],
    totalCost:0.50, executionTime:30, expectedOutput:1245.00, slippage:0.5, confidence:99,
  },
  {
    id:'r2', from:'SOL', to:'USDC', fromNetwork:'Solana', toNetwork:'Solana', label:'Orca (Cheapest)',
    steps:[{ protocol:'Orca Whirlpool', network:'Solana', priceImpact:0.15, fee:0.45 }],
    totalCost:0.45, executionTime:45, expectedOutput:1244.40, slippage:0.5, confidence:97,
  },
  {
    id:'r3', from:'SOL', to:'USDC', fromNetwork:'Solana', toNetwork:'Ethereum', label:'Bridge + Uniswap',
    steps:[
      { protocol:'Wormhole Bridge', network:'Solana→ETH', priceImpact:0.1, fee:5.00 },
      { protocol:'Uniswap V3', network:'Ethereum', priceImpact:0.3, fee:0.50 },
    ],
    totalCost:5.50, executionTime:180, expectedOutput:1239.50, slippage:0.5, confidence:91,
  },
]

// ─── Payment Requests ──────────────────────────────────────────────────────────

export const PF_PAYMENT_REQUESTS: PFPaymentRequest[] = [
  { id:'pr1', amount:100,  asset:'USDC', network:'Solana',   description:'Q2 services payment',   status:'pending', shareLink:'https://kubryx.vercel.app/pay?req=pr1', createdAt:'5/18/2026', expiresAt:'6/17/2026' },
  { id:'pr2', amount:5,    asset:'SOL',  network:'Solana',   description:'Dev bounty reward',      status:'paid',    shareLink:'https://kubryx.vercel.app/pay?req=pr2', createdAt:'5/17/2026', expiresAt:'6/16/2026' },
  { id:'pr3', amount:1000, asset:'USDT', network:'Ethereum', description:'Infrastructure invoice', status:'pending', shareLink:'https://kubryx.vercel.app/pay?req=pr3', createdAt:'5/15/2026', expiresAt:'6/14/2026' },
]

// ─── Portfolio ─────────────────────────────────────────────────────────────────

export const PF_PORTFOLIO: PFPortfolio = {
  totalValue: 1245678.90, change24h: 61574.25, change24hPercent: 5.2,
  wallets: 5, monthlySent: 45320.50, gasSaved: 23.4,
  assets: [
    { symbol:'PUSD', name:'PalmFlow USD',    amount:999945,  usdValue:999945,  network:'Solana',   percentage:80.3, color:'#00E5CC' },
    { symbol:'SOL',  name:'Solana',          amount:100.5,   usdValue:12562,   network:'Solana',   percentage:1.0,  color:'#A855F7' },
    { symbol:'ETH',  name:'Ethereum',        amount:10.2,    usdValue:30479,   network:'Ethereum', percentage:2.4,  color:'#60A5FA' },
    { symbol:'USDC', name:'USD Coin',        amount:25000,   usdValue:25000,   network:'Ethereum', percentage:2.0,  color:'#22C55E' },
    { symbol:'DAI',  name:'Dai Stablecoin',  amount:5000,    usdValue:5000,    network:'Arbitrum', percentage:0.4,  color:'#F59E0B' },
    { symbol:'MATIC',name:'Polygon',         amount:500,     usdValue:495,     network:'Polygon',  percentage:0.04, color:'#8B5CF6' },
  ],
}

export const PF_WALLETS: PFWallet[] = [
  { id:'w1', address:'7xKp3mR9nQZ2vA1bY6wE4cF8dH0jL5', network:'Solana',   balance:100.5,  symbol:'SOL',  usdValue:12562,  label:'Main Treasury' },
  { id:'w2', address:'0x1a29c4e5f6b7d8e9f0a1b2c3d4e5f6b7', network:'Ethereum', balance:10.2,   symbol:'ETH',  usdValue:30479,  label:'ETH Reserve' },
  { id:'w3', address:'0x5a8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e', network:'Arbitrum', balance:5000,   symbol:'DAI',  usdValue:5000,   label:'Payroll Vault' },
  { id:'w4', address:'0x9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e', network:'Polygon',  balance:500,    symbol:'MATIC',usdValue:495,    label:'Gas Reserve' },
  { id:'w5', address:'5k7jPmN8rS3tU9vX1wY4zA0bC2dE6fG',  network:'Solana',   balance:999945, symbol:'PUSD', usdValue:999945, label:'Operations Wallet' },
]

// ─── Analytics ─────────────────────────────────────────────────────────────────

export const PF_ANALYTICS: PFAnalyticsData = {
  totalSent: 125450, totalReceived: 89200, gasSpent: 2450, gasSaved: 567.50,
  transactionCount: 247, successRate: 99.2,
  volumeTrend: [
    { date:'May 1',  sent:2100, received:1800 },
    { date:'May 3',  sent:4500, received:3200 },
    { date:'May 5',  sent:3800, received:5100 },
    { date:'May 7',  sent:6200, received:2900 },
    { date:'May 9',  sent:5100, received:4400 },
    { date:'May 11', sent:7800, received:6200 },
    { date:'May 13', sent:9200, received:5800 },
    { date:'May 15', sent:11400,received:8900 },
    { date:'May 17', sent:8700, received:7200 },
    { date:'May 19', sent:12000,received:9600 },
  ],
  assetComposition: [
    { asset:'PUSD',  amount:999945, percentage:80.3, color:'#00E5CC' },
    { asset:'ETH',   amount:30479,  percentage:2.4,  color:'#60A5FA' },
    { asset:'USDC',  amount:25000,  percentage:2.0,  color:'#22C55E' },
    { asset:'SOL',   amount:12562,  percentage:1.0,  color:'#A855F7' },
    { asset:'DAI',   amount:5000,   percentage:0.4,  color:'#F59E0B' },
    { asset:'MATIC', amount:495,    percentage:0.04, color:'#8B5CF6' },
  ],
  networkDistribution: [
    { network:'Solana',   percentage:72, count:178, color:'#A855F7' },
    { network:'Ethereum', percentage:18, count:44,  color:'#60A5FA' },
    { network:'Arbitrum', percentage:6,  count:15,  color:'#06B6D4' },
    { network:'Polygon',  percentage:4,  count:10,  color:'#8B5CF6' },
  ],
  topRecipients: [
    { address:'0x5a8c...9f2b', amount:45200, count:23, percentage:36.0 },
    { address:'0x1a29...3b7e', amount:32100, count:18, percentage:25.6 },
    { address:'7xKp...9mQZ',   amount:18900, count:11, percentage:15.1 },
    { address:'0x9b0c...4e5f', amount:12340, count:8,  percentage:9.8 },
    { address:'5k7j...6fG',    amount:8200,  count:6,  percentage:6.5 },
  ],
}

export const PF_DEFAULT_SETTINGS: PFSettings = {
  displayName: 'Treasury Admin', email: 'admin@kubryx.io', preferredNetwork: 'Solana',
  defaultAsset: 'PUSD', defaultToken: 'PUSD',
  twoFactorEnabled: false, autoSign: false, confirmTimeout: '1m',
  paymentLimitsEnabled: false, dailyLimit: 10000, singleLimit: 5000,
  notifyPaymentSent: true, notifyPaymentReceived: true,
  notifyPaymentFailed: true, notifyLargeTransaction: true,
  aiRoutingEnabled: true, aiOptimization: 'balanced', autonomousAgents: false,
  stealthMode: false, privacyPool: false,
}

// ─── Activity feed pool ────────────────────────────────────────────────────────

export const PF_ACTIVITY_POOL = [
  { agent:'AGENT YXEF', action:'Arbitrage cycle on Solana DEXs for PUSD pairs initiated' },
  { agent:'AGENT OR7W', action:'4-hour Arbitrage Hunter cycle on Orca, Raydium, Jupiter' },
  { agent:'AGENT OR7W', action:'Triangular arbitrage PUSD/USDC/SOL — yield: +0.003%' },
  { agent:'AGENT Y40Q', action:'Initial funding from Treasury — allocation confirmed' },
  { agent:'AGENT RQ9O', action:'Initial funding from Treasury — Solana vault initialized' },
  { agent:'AGENT ZKXY', action:'Risk sentinel velocity threshold reset to baseline levels' },
  { agent:'AGENT 8TPN', action:'Capital rebalance: Kamino 35%, Raydium 28%, Jito 20%' },
  { agent:'AGENT M2WQ', action:'Marketing campaign budget consumed: 18,200 PUSD utilized' },
  { agent:'AGENT PFAX', action:'Payroll stream paused pending budget review authorization' },
  { agent:'AGENT YXEF', action:'Micro-arbitrage identified: PUSD/USDC spread on Orca DEX' },
  { agent:'AGENT 7GBN', action:'Neural advisor recommendation applied: rebalance executed' },
  { agent:'AGENT KRMT', action:'Emergency reserve threshold maintained at 30% of treasury' },
]

export const PF_POLICIES: PFPolicy[] = [
  { id:'p1', name:'Global Emergency Lock', description:'Emergency Lock: Abnormal spending velocity detected.',  threshold:0,    unit:'PUSD', policyType:'spending', status:'active' },
  { id:'p2', name:'Daily Spending Cap',    description:'Maximum PUSD an agent can spend per 24 hours.',        threshold:1000, unit:'PUSD', policyType:'spending', status:'active' },
  { id:'p3', name:'Emergency Reserve',     description:'Keep 30% of treasury in liquid reserve at all times.', threshold:0.3,  unit:'PUSD', policyType:'risk',     status:'paused' },
]

export const PF_TREASURY_CHART = [220000, 450000, 780000, 999945, 920000, 880000, 999945]
export const PF_CHART_LABELS = ['May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18', 'May 19']

export const MARKETPLACE_AGENTS = [
  { name:'Arbitrage Hunter',   role:'DeFi Specialist',    efficiency:98, complexity:'High',   price:'Free',         rating:4.9, category:'DeFi',       desc:'Continuously monitors Solana DEXs for PUSD arbitrage opportunities across Orca, Raydium and Jupiter.' },
  { name:'Liquidity Optimizer',role:'LP Manager',         efficiency:96, complexity:'High',   price:'Free',         rating:4.7, category:'DeFi',       desc:'Maximizes LP positions across Solana AMMs with auto-compounding and rebalancing.' },
  { name:'Flash Loan Executor',role:'DeFi Arbitrageur',   efficiency:91, complexity:'Expert', price:'200 PUSD/mo',  rating:4.6, category:'DeFi',       desc:'Executes flash loan arbitrage strategies across multiple Solana protocols for zero-capital profits.' },
  { name:'Sentinel v1',        role:'Security AI',        efficiency:100,complexity:'High',   price:'Free',         rating:5.0, category:'Security',   desc:'Behavioral ML model that detects anomalous transaction patterns and triggers emergency locks.' },
  { name:'Fraud Watchdog',     role:'Anomaly Detector',   efficiency:99, complexity:'High',   price:'Free',         rating:4.9, category:'Security',   desc:'Real-time fraud detection using on-chain pattern recognition and wallet graph analysis.' },
  { name:'Growth Engine',      role:'Marketing AI',       efficiency:94, complexity:'Medium', price:'100 PUSD/mo',  rating:4.8, category:'Marketing',  desc:'Autonomous social growth campaigns and community engagement optimization.' },
  { name:'Narrative AI',       role:'Content Strategist', efficiency:88, complexity:'Medium', price:'75 PUSD/mo',   rating:4.5, category:'Marketing',  desc:'Generates protocol narratives, documentation, and community content at scale.' },
  { name:'Treasury Oracle',    role:'Analytics Engine',   efficiency:97, complexity:'High',   price:'150 PUSD/mo',  rating:4.9, category:'Analytics',  desc:'Deep treasury analytics with predictive modeling and risk-adjusted yield forecasting.' },
  { name:'Risk Modeler',       role:'Quantitative AI',    efficiency:94, complexity:'Expert', price:'200 PUSD/mo',  rating:4.7, category:'Analytics',  desc:'Quantitative risk modeling with VaR calculations and portfolio stress testing.' },
  { name:'Audit Trail',        role:'Compliance AI',      efficiency:100,complexity:'Medium', price:'Free',         rating:5.0, category:'Compliance', desc:'Cryptographically signed immutable audit logs for every treasury operation.' },
  { name:'Policy Enforcer',    role:'Guardrail Agent',    efficiency:100,complexity:'High',   price:'Free',         rating:5.0, category:'Compliance', desc:'Enforces neural laws cryptographically on every transaction before execution.' },
  { name:'Cloud Cost AI',      role:'DevOps Optimizer',   efficiency:89, complexity:'Medium', price:'100 PUSD/mo',  rating:4.6, category:'DevOps',     desc:'Monitors and optimizes cloud infrastructure costs for AI agent operations.' },
]

// ─── P&L Tracker Types & Fallbacks ────────────────────────────────────────────

export type PFPnLAsset = {
  symbol: string
  name: string
  amount: number
  avgCost: number          // USD per unit paid
  currentPrice: number     // live USD price
  currentValue: number
  totalCost: number
  unrealizedPnL: number
  unrealizedPnLPct: number
  network: string
  color: string
  isStable: boolean
}

export type PFRealizedTrade = {
  id: string
  fromAsset: string; toAsset: string
  fromAmount: number; toAmount: number
  proceeds: number; costBasis: number
  realizedPnL: number; realizedPnLPct: number
  timestamp: string; txHash: string; network: string
}

export type PFPnLSummary = {
  totalUnrealizedPnL: number
  totalUnrealizedPnLPct: number
  totalRealizedPnL: number
  totalPortfolioValue: number
  totalCostBasis: number
  assets: PFPnLAsset[]
  trades: PFRealizedTrade[]
}

export const PF_PNL_SUMMARY: PFPnLSummary = {
  totalUnrealizedPnL: 184320.50,
  totalUnrealizedPnLPct: 17.36,
  totalRealizedPnL: 8240.75,
  totalPortfolioValue: 1245678.90,
  totalCostBasis: 1061358.40,
  assets: [
    { symbol:'SOL',   name:'Solana',        amount:100.5, avgCost:88.20,  currentPrice:124.99, currentValue:12561.50, totalCost:8861.10,  unrealizedPnL:3700.40,   unrealizedPnLPct:41.8, network:'Solana',   color:'#A855F7', isStable:false },
    { symbol:'ETH',   name:'Ethereum',      amount:10.2,  avgCost:2490.00,currentPrice:2988.00,currentValue:30477.60, totalCost:25398.00, unrealizedPnL:5079.60,   unrealizedPnLPct:20.0, network:'Ethereum', color:'#60A5FA', isStable:false },
    { symbol:'MATIC', name:'Polygon',       amount:500,   avgCost:0.62,   currentPrice:0.99,   currentValue:495.00,   totalCost:310.00,   unrealizedPnL:185.00,    unrealizedPnLPct:59.7, network:'Polygon',  color:'#8B5CF6', isStable:false },
    { symbol:'PUSD',  name:'PalmFlow USD',  amount:999945,avgCost:1.00,   currentPrice:1.00,   currentValue:999945,   totalCost:999945,   unrealizedPnL:0,         unrealizedPnLPct:0,    network:'Solana',   color:'#00E5CC', isStable:true  },
    { symbol:'USDC',  name:'USD Coin',      amount:25000, avgCost:1.00,   currentPrice:1.00,   currentValue:25000,    totalCost:25000,    unrealizedPnL:0,         unrealizedPnLPct:0,    network:'Ethereum', color:'#22C55E', isStable:true  },
    { symbol:'DAI',   name:'Dai',           amount:5000,  avgCost:1.00,   currentPrice:1.00,   currentValue:5000,     totalCost:5000,     unrealizedPnL:0,         unrealizedPnLPct:0,    network:'Arbitrum', color:'#F59E0B', isStable:true  },
  ],
  trades: [
    { id:'r1', fromAsset:'SOL',  toAsset:'USDC', fromAmount:10,  toAmount:1245,  proceeds:1245,  costBasis:882,   realizedPnL:363,   realizedPnLPct:41.2, timestamp:'5/19/2026, 2:15 PM', txHash:'7yRt...4kWs', network:'Solana'  },
    { id:'r2', fromAsset:'MATIC',toAsset:'USDC', fromAmount:500, toAmount:498,   proceeds:498,   costBasis:310,   realizedPnL:188,   realizedPnLPct:60.6, timestamp:'5/17/2026, 5:00 PM', txHash:'2dIv...5pZj', network:'Polygon' },
  ],
}

// ─── Tax Report Types & Fallbacks ─────────────────────────────────────────────

export type PFTaxLot = {
  id: string
  asset: string
  buyDate: string; sellDate: string
  amount: number
  buyPricePerUnit: number; sellPricePerUnit: number
  costBasis: number; proceeds: number
  gain: number; gainPct: number
  holdingDays: number; isLongTerm: boolean
  txHash: string; network: string
}

export type PFTaxSummary = {
  taxYear: number
  shortTermGain: number    // held ≤ 365 days
  longTermGain: number     // held > 365 days
  totalGain: number
  shortTermLoss: number
  longTermLoss: number
  netShortTerm: number
  netLongTerm: number
  netCapitalGain: number
  lots: PFTaxLot[]
}

export const PF_TAX_SUMMARY: PFTaxSummary = {
  taxYear: 2026,
  shortTermGain:  4842.60,
  longTermGain:   5120.30,
  totalGain:      9962.90,
  shortTermLoss:  0,
  longTermLoss:   1722.15,
  netShortTerm:   4842.60,
  netLongTerm:    3398.15,
  netCapitalGain: 8240.75,
  lots: [
    { id:'lot1', asset:'SOL',   buyDate:'2/14/2026, 10:00 AM', sellDate:'5/19/2026, 2:15 PM', amount:10,  buyPricePerUnit:88.20,  sellPricePerUnit:124.50, costBasis:882.00,  proceeds:1245.00,  gain:363.00,  gainPct:41.2, holdingDays:94,  isLongTerm:false, txHash:'7yRt...4kWs', network:'Solana'  },
    { id:'lot2', asset:'MATIC', buyDate:'1/8/2026, 9:30 AM',   sellDate:'5/17/2026, 5:00 PM', amount:500, buyPricePerUnit:0.62,   sellPricePerUnit:0.996,  costBasis:310.00,  proceeds:498.00,   gain:188.00,  gainPct:60.6, holdingDays:129, isLongTerm:false, txHash:'2dIv...5pZj', network:'Polygon' },
    { id:'lot3', asset:'ETH',   buyDate:'4/20/2025, 2:00 PM',  sellDate:'5/18/2026, 10:00 AM',amount:5,   buyPricePerUnit:2490.00, sellPricePerUnit:2984.00,costBasis:12450.00,proceeds:14920.00, gain:2470.00, gainPct:19.8, holdingDays:393, isLongTerm:true,  txHash:'1aZp...9nVm', network:'Ethereum'},
  ],
}
