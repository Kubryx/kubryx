// Built by vsrupeshkumar
export const QIE_MAINNET = {
  chainId: '0x7C6',
  chainName: 'QIE Mainnet',
  rpcUrls: ['https://rpc.qie.digital'],
  nativeCurrency: { name: 'QIE', symbol: 'QIE', decimals: 18 },
  blockExplorerUrls: ['https://mainnet.qie.digital'],
}

export const WALLET_INSTALL_LINKS = {
  metamask: 'https://metamask.io/download/',
  phantom: 'https://phantom.app/',
  freighter: 'https://www.freighter.app/',
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export async function switchToQIE(): Promise<void> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed.')
  }
  const eth = (window as any).ethereum
  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: QIE_MAINNET.chainId }] })
  } catch (err: any) {
    if (err?.code === 4902) {
      await eth.request({ method: 'wallet_addEthereumChain', params: [QIE_MAINNET] })
    } else {
      throw err
    }
  }
}

export function isPhantomInstalled(): boolean {
  return typeof window !== 'undefined' && !!(window as any)?.solana?.isPhantom
}

export function isFreighterInstalled(): boolean {
  return typeof window !== 'undefined' && typeof (window as any)?.freighter !== 'undefined'
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof (window as any)?.ethereum !== 'undefined'
}

export type WalletKind = 'evm' | 'solana' | 'stellar'
const SS_KEYS: Record<WalletKind, string> = {
  evm: 'kubryx_wallet_evm',
  solana: 'kubryx_wallet_solana',
  stellar: 'kubryx_wallet_stellar',
}

export function persistWallet(kind: WalletKind, address: string) {
  if (typeof window === 'undefined') return
  try { sessionStorage.setItem(SS_KEYS[kind], address) } catch {}
}

export function loadWallet(kind: WalletKind): string {
  if (typeof window === 'undefined') return ''
  try { return sessionStorage.getItem(SS_KEYS[kind]) || '' } catch { return '' }
}

export function clearWallet(kind: WalletKind) {
  if (typeof window === 'undefined') return
  try { sessionStorage.removeItem(SS_KEYS[kind]) } catch {}
}

// ── Wallet connection helpers (added for the wallet integration) ──────────────

export function formatBalance(balance: string | null, symbol: string): string {
  if (!balance) return '—'
  return `${parseFloat(balance).toFixed(4)} ${symbol}`
}

export function getExplorerTxUrl(txHash: string, chainId: number): string {
  const map: Record<number, string> = {
    1:     'https://etherscan.io/tx/',
    42161: 'https://arbiscan.io/tx/',
    1990:  'https://mainnet.qie.digital/tx/',
  }
  return `${map[chainId] ?? 'https://etherscan.io/tx/'}${txHash}`
}

export function getSolanaExplorerUrl(txSig: string): string {
  return `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(value)
}

export function shortenHash(hash: string): string {
  if (!hash || hash.length < 10) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

// Convert a hex wei value (0x…) into a fixed-precision ether string.
export function weiHexToEther(hex: string, decimals = 4): string {
  try {
    const ONE_ETHER = BigInt('1000000000000000000') // 1e18
    const wei = BigInt(hex)
    const whole = wei / ONE_ETHER
    const frac = (wei % ONE_ETHER).toString().padStart(18, '0').slice(0, decimals)
    return `${whole.toString()}.${frac}`
  } catch {
    return (0).toFixed(decimals)
  }
}

export function timeAgo(input: string | Date | undefined): string {
  if (!input) return 'recent'
  const t = typeof input === 'string' ? new Date(input).getTime() : input.getTime()
  if (Number.isNaN(t)) return 'recent'
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
