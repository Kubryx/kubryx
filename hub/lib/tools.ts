// Built by vsrupeshkumar
// Central registry of every Kubryx tool — names, chains, colors, wallet types.

export interface ToolConfig {
  route: string
  name: string
  tagline: string
  description: string
  icon: string
  category: string
  chain: string
  status: 'Live' | 'Beta' | 'Soon'
  color: string
  walletType: 'evm' | 'solana'
  networkKey: string
}

export const TOOLS: ToolConfig[] = [
  {
    route: '/credit',
    name: 'Credit Passport',
    tagline: 'AI Credit Scoring',
    description: 'Generate your on-chain credit score as a soulbound NFT. Every DeFi protocol reads your score with a single contract call.',
    icon: '◈',
    category: 'Identity',
    chain: 'QIE',
    status: 'Live',
    color: '#06b6d4',
    walletType: 'evm',
    networkKey: 'QIE',
  },
  {
    route: '/legacy',
    name: 'Family Vault',
    tagline: 'Encrypted Inheritance',
    description: 'Store your most important files with AES-GCM encryption. Heirs unlock access on-chain after validator attestation.',
    icon: '⬟',
    category: 'Security',
    chain: 'QIE',
    status: 'Live',
    color: '#f43f5e',
    walletType: 'evm',
    networkKey: 'QIE',
  },
  {
    route: '/agents',
    name: 'Agent Co-ordinator',
    tagline: 'AI Agent Coordination',
    description: 'Deploy AI agents with verified on-chain identities. Every delegation is Ed25519 signed and permanently logged.',
    icon: '⬡',
    category: 'AI',
    chain: 'Solana',
    status: 'Live',
    color: '#6366f1',
    walletType: 'solana',
    networkKey: 'SOLANA_DEVNET',
  },
  {
    route: '/vault',
    name: 'Private Vault',
    tagline: 'Cross-Chain Privacy',
    description: 'Trade assets across chains with complete privacy. Zero transaction metadata exposed to any observer.',
    icon: '🔐',
    category: 'Privacy',
    chain: 'Multi',
    status: 'Live',
    color: '#14b8a6',
    walletType: 'evm',
    networkKey: 'ARBITRUM',
  },
  {
    route: '/split',
    name: 'Bill Split',
    tagline: 'On-Chain Bill Splitting',
    description: 'Split bills using smart contracts on Stellar. Multi-wallet support with automatic settlement on full payment.',
    icon: '◆',
    category: 'Payments',
    chain: 'Stellar',
    status: 'Live',
    color: '#3b82f6',
    walletType: 'evm',
    networkKey: 'QIE',
  },
  {
    route: '/lend',
    name: 'AI Lending',
    tagline: 'DeFi Loan Negotiation',
    description: 'AI agents negotiate your loan terms in natural language. Zero-knowledge credit verification. L2 settlement.',
    icon: '◎',
    category: 'DeFi',
    chain: 'ETH L2',
    status: 'Live',
    color: '#f59e0b',
    walletType: 'evm',
    networkKey: 'ARBITRUM',
  },
  {
    route: '/treasury',
    name: 'Yield Operations Hub',
    tagline: 'Autonomous Yield Operations',
    description: 'AI agents manage your Yield Operations Hub, stream payroll per-second, enforce governance, and optimize yield automatically.',
    icon: '◇',
    category: 'Yield',
    chain: 'Solana',
    status: 'Live',
    color: '#10b981',
    walletType: 'solana',
    networkKey: 'SOLANA_DEVNET',
  },
  {
    route: '/shadow',
    name: 'Stealth Execution Suite',
    tagline: 'Invisible Operations',
    description: 'Run your entire financial organization invisibly on-chain. Seven specialized AI agents. Fully autonomous.',
    icon: '▲',
    category: 'Enterprise',
    chain: 'Solana',
    status: 'Live',
    color: '#8b5cf6',
    walletType: 'solana',
    networkKey: 'SOLANA_DEVNET',
  },
]

export function getToolByRoute(route: string): ToolConfig | undefined {
  return TOOLS.find(t => t.route === route)
}

export function getToolColor(route: string): string {
  return getToolByRoute(route)?.color ?? '#F5C518'
}

export function getToolName(route: string): string {
  return getToolByRoute(route)?.name ?? 'Kubryx'
}
