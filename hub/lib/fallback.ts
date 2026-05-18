export const fallbackCreditScore = {
  score: 742,
  grade: 'A',
  wallet: '0x0000...0000',
  history: [680, 695, 710, 725, 738, 742],
  factors: {
    transactionHistory: 88,
    walletAge: 76,
    defiActivity: 91,
    repaymentRate: 95,
  },
  nftMinted: false,
  lastUpdated: new Date().toISOString(),
}

export const fallbackVaults = [
  {
    id: 'vault-demo-1',
    owner: '0x0000...0000',
    heir: '0x1111...1111',
    status: 'locked',
    unlockDate: '2030-01-01',
    createdAt: new Date().toISOString(),
  },
]

export const fallbackAgents = [
  {
    id: 'agent-demo-1',
    name: 'TreasuryGuard',
    role: 'treasury_monitor',
    status: 'active',
    lastAction: 'Monitored 3 transactions',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agent-demo-2',
    name: 'ComplianceBot',
    role: 'compliance',
    status: 'active',
    lastAction: 'Verified 12 wallets',
    createdAt: new Date().toISOString(),
  },
]

export const fallbackLoans = [
  {
    id: 'loan-demo-1',
    borrower: '0x0000...0000',
    amount: 500,
    duration: '90 days',
    interestRate: '4.2%',
    status: 'active',
    repaidAmount: 125,
    createdAt: new Date().toISOString(),
  },
]

export const fallbackTreasury = {
  balance: 12480.5,
  inflow30d: 4200.0,
  outflow30d: 1800.0,
  yield: 6.8,
  streams: [
    { recipient: 'Dev Team', ratePerSecond: 0.00023, token: 'SOL', active: true },
    { recipient: 'Marketing', ratePerSecond: 0.00011, token: 'SOL', active: true },
  ],
}

export const fallbackShadowAgents = [
  { type: 'CFO',        status: 'active', lastAction: 'Treasury rebalanced',      time: '2m ago' },
  { type: 'Payroll',    status: 'active', lastAction: 'Streamed 0.42 SOL',        time: '1m ago' },
  { type: 'Compliance', status: 'active', lastAction: 'All checks passed',        time: '5m ago' },
  { type: 'Audit',      status: 'active', lastAction: '47 txns logged',           time: '3m ago' },
  { type: 'Procurement',status: 'idle',   lastAction: 'Awaiting approval',        time: '12m ago' },
  { type: 'Tax',        status: 'active', lastAction: 'Liability: 0.08 SOL',      time: '8m ago' },
  { type: 'Risk',       status: 'active', lastAction: 'No anomalies detected',    time: '1m ago' },
]

export const fallbackSplits = [
  {
    id: 'split-demo-1',
    amount: 100,
    currency: 'XLM',
    participants: ['G...AAA', 'G...BBB', 'G...CCC'],
    sharePerPerson: 33.33,
    status: 'pending',
    paid: ['G...AAA'],
    createdAt: new Date().toISOString(),
  },
]

export const fallbackVaultTrades = [
  {
    id: 'trade-demo-1',
    asset: 'wBTC → USDC',
    amount: 0.25,
    privacyScore: 94,
    chain: 'Multi',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
]
