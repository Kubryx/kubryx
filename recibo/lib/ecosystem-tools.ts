export interface EcosystemTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'live' | 'demo';
  chain: string;
  href: string;
  previewTitle: string;
  previewDescription: string;
  previewStats: { label: string; value: string }[];
  howItConnects: string;
}

export const ECOSYSTEM_TOOLS: EcosystemTool[] = [
  {
    id: 'credit',
    name: 'Credit Passport',
    description: 'On-chain credit scoring',
    icon: 'Shield',
    color: '#F59E0B',
    status: 'live',
    chain: 'QIE Mainnet',
    href: 'https://kubryx.vercel.app/invoice',
    previewTitle: 'Your On-Chain Credit Score',
    previewDescription:
      'Every USDC invoice you receive builds your on-chain credit history. Get a soulbound NFT credit score that unlocks better lending rates.',
    previewStats: [
      { label: 'Score Range', value: '300–850' },
      { label: 'NFT Type', value: 'Soulbound' },
      { label: 'Chain', value: 'QIE Mainnet' },
    ],
    howItConnects: 'Invoice payments build your credit score',
  },
  {
    id: 'lend',
    name: 'AI Lending',
    description: 'Borrow against your USDC',
    icon: 'TrendingUp',
    color: '#10B981',
    status: 'demo',
    chain: 'Arbitrum',
    href: 'https://kubryx.vercel.app/lend',
    previewTitle: 'Instant Liquidity on Your USDC',
    previewDescription:
      'Use your credit score to unlock undercollateralized loans. AI agents negotiate the best rates automatically.',
    previewStats: [
      { label: 'Gold Tier Rate', value: '6.8% APR' },
      { label: 'Platinum Rate', value: '4.2% APR' },
      { label: 'Max LTV', value: '85%' },
    ],
    howItConnects: 'Use received USDC as collateral',
  },
  {
    id: 'split',
    name: 'Bill Split',
    description: 'Split invoices on-chain',
    icon: 'Split',
    color: '#8B5CF6',
    status: 'live',
    chain: 'Stellar',
    href: 'https://kubryx.vercel.app/split',
    previewTitle: 'Split Any Invoice Instantly',
    previewDescription:
      'Working with multiple clients? Split the invoice amount automatically via Stellar smart contracts.',
    previewStats: [
      { label: 'Network', value: 'Stellar' },
      { label: 'Settlement', value: 'Instant' },
      { label: 'Parties', value: 'Up to 10' },
    ],
    howItConnects: 'Split invoice payments between parties',
  },
  {
    id: 'treasury',
    name: 'Yield Hub',
    description: 'Earn yield on USDC',
    icon: 'Zap',
    color: '#F97316',
    status: 'live',
    chain: 'Solana',
    href: 'https://kubryx.vercel.app/treasury',
    previewTitle: 'Put Your USDC to Work',
    previewDescription:
      'AI agents automatically move your USDC into the highest-yielding Arbitrum protocols. Set it and forget it.',
    previewStats: [
      { label: 'Avg APY', value: '8–15%' },
      { label: 'Strategy', value: 'Auto' },
      { label: 'Chain', value: 'Solana Devnet' },
    ],
    howItConnects: 'Auto-compound USDC after receiving payment',
  },
  {
    id: 'vault',
    name: 'Private Vault',
    description: 'Secure cross-chain assets',
    icon: 'Lock',
    color: '#06B6D4',
    status: 'live',
    chain: 'Arbitrum',
    href: 'https://kubryx.vercel.app/vault',
    previewTitle: 'Bank-Grade Asset Security',
    previewDescription:
      'Store and protect your USDC earnings in a private vault with zero transaction metadata exposed.',
    previewStats: [
      { label: 'Encryption', value: 'AES-GCM' },
      { label: 'Chain', value: 'Arbitrum One' },
      { label: 'Privacy', value: 'Full' },
    ],
    howItConnects: 'Secure your USDC earnings privately',
  },
  {
    id: 'agents',
    name: 'AI Agents',
    description: 'Automate your finances',
    icon: 'Bot',
    color: '#EC4899',
    status: 'live',
    chain: 'Solana',
    href: 'https://kubryx.vercel.app/agents',
    previewTitle: 'AI Agents Working For You',
    previewDescription:
      'Deploy AI agents that automatically manage your invoices, follow up on payments, and optimize your DeFi positions.',
    previewStats: [
      { label: 'Active Agents', value: '3' },
      { label: 'Network', value: 'Solana Devnet' },
      { label: 'Actions', value: 'Verified On-chain' },
    ],
    howItConnects: 'Agents auto-follow-up on unpaid invoices',
  },
  {
    id: 'legacy',
    name: 'Family Vault',
    description: 'Encrypted inheritance',
    icon: 'Heart',
    color: '#EF4444',
    status: 'live',
    chain: 'Multi-chain',
    href: 'https://kubryx.vercel.app/legacy',
    previewTitle: 'Protect Your Earnings Forever',
    previewDescription:
      'Store important documents and pass USDC earnings to heirs securely with on-chain inheritance protocols.',
    previewStats: [
      { label: 'Encryption', value: 'AES-GCM' },
      { label: 'Access', value: 'On-chain attestation' },
      { label: 'Storage', value: 'IPFS' },
    ],
    howItConnects: 'Secure invoice earnings for inheritance',
  },
  {
    id: 'shadow',
    name: 'Stealth Suite',
    description: 'Private transactions',
    icon: 'EyeOff',
    color: '#6B7280',
    status: 'live',
    chain: 'Solana',
    href: 'https://kubryx.vercel.app/shadow',
    previewTitle: 'Invisible Enterprise Operations',
    previewDescription:
      'Run your entire financial stack privately. 7 specialized AI agents handle CFO, Payroll, Compliance, and Tax autonomously.',
    previewStats: [
      { label: 'AI Agents', value: '7 Specialized' },
      { label: 'Operations', value: 'Autonomous' },
      { label: 'Privacy', value: 'Full stealth' },
    ],
    howItConnects: 'Process invoices with full privacy',
  },
];
