// Built by vsrupeshkumar
// All network (chain) configuration for Kubryx wallet connectivity.

export const NETWORKS = {

  ETHEREUM: {
    chainId: '0x1',
    chainIdDecimal: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    explorerTx: 'https://etherscan.io/tx/',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: '#627eea',
    type: 'evm' as const,
  },

  ARBITRUM: {
    chainId: '0xa4b1',
    chainIdDecimal: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    explorerTx: 'https://arbiscan.io/tx/',
    currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    color: '#28a0f0',
    type: 'evm' as const,
  },

  QIE: {
    chainId: '0x7c6',       // decimal: 1990
    chainIdDecimal: 1990,
    name: 'QIE Mainnet',
    shortName: 'QIE',
    rpcUrl: 'https://rpc.qie.space',
    explorer: 'https://mainnet.qie.digital',
    explorerTx: 'https://mainnet.qie.digital/tx/',
    currency: { name: 'QIE', symbol: 'QIE', decimals: 18 },
    color: '#F5C518',
    type: 'evm' as const,
  },

  SOLANA_DEVNET: {
    chainId: null,
    chainIdDecimal: null,
    name: 'Solana Devnet',
    shortName: 'Solana',
    rpcUrl: 'https://api.devnet.solana.com',
    explorer: 'https://explorer.solana.com/?cluster=devnet',
    explorerTx: 'https://explorer.solana.com/tx/',
    currency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
    color: '#9945ff',
    type: 'solana' as const,
  },
}

export type NetworkKey = keyof typeof NETWORKS
export type NetworkConfig = (typeof NETWORKS)[NetworkKey]

// Which route uses which network
export const TOOL_NETWORKS: Record<string, NetworkKey> = {
  '/dashboard': 'QIE',
  '/credit':    'QIE',           // Credit Passport
  '/legacy':    'QIE',           // Family Vault
  '/agents':    'SOLANA_DEVNET', // Agent Co-ordinator
  '/vault':     'ARBITRUM',      // Private Vault
  '/split':     'QIE',           // Bill Split
  '/lend':      'ARBITRUM',      // AI Lending
  '/treasury':  'SOLANA_DEVNET', // Yield Operations Hub
  '/shadow':    'SOLANA_DEVNET', // Stealth Execution Suite
}

// EVM tools (use MetaMask)
export const EVM_TOOLS = [
  '/dashboard', '/credit', '/legacy', '/vault', '/split', '/lend',
]

// Solana tools (use Phantom)
export const SOLANA_TOOLS = [
  '/agents', '/treasury', '/shadow',
]

// Get network type for a route
export function getWalletTypeForRoute(route: string): 'evm' | 'solana' {
  return SOLANA_TOOLS.includes(route) ? 'solana' : 'evm'
}

// Get network config for a route
export function getNetworkForRoute(route: string): NetworkConfig {
  const key = TOOL_NETWORKS[route]
  return key ? NETWORKS[key] : NETWORKS.QIE
}

// Find an EVM network config by its decimal chain id
export function getNetworkByChainId(chainId: number | null): NetworkConfig | null {
  if (chainId == null) return null
  const found = Object.values(NETWORKS).find(
    n => n.chainIdDecimal != null && n.chainIdDecimal === chainId,
  )
  return found ?? null
}
