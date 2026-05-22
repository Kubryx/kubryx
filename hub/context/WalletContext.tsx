// Built by vsrupeshkumar
'use client'

import {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react'
import { NETWORKS } from '@/lib/networks'
import { weiHexToEther } from '@/lib/wallet-utils'

// ── Browser wallet typings ────────────────────────────────────────────────────
// Other tool pages declare their own (differing) `window.ethereum` / `window.solana`
// global shapes, so we deliberately avoid augmenting `Window` here and instead
// resolve the providers through narrowly-typed accessors.

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
}

interface PhantomProvider {
  isPhantom?: boolean
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

function getEthereum(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum
}

function getPhantom(): PhantomProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { solana?: PhantomProvider }).solana
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EVMWalletState {
  address: string | null
  chainId: number | null
  balance: string | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

export interface SolanaWalletState {
  address: string | null
  balance: string | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

export interface WalletContextType {
  evm: EVMWalletState
  connectEVM: () => Promise<void>
  disconnectEVM: () => void
  switchToNetwork: (chainIdHex: string, networkKey: string) => Promise<void>

  solana: SolanaWalletState
  connectSolana: () => Promise<void>
  disconnectSolana: () => void

  isAnyWalletConnected: boolean
  activeWalletAddress: string | null

  refreshBalances: () => Promise<void>
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultEVM: EVMWalletState = {
  address: null, chainId: null, balance: null,
  isConnecting: false, isConnected: false, error: null,
}

const defaultSolana: SolanaWalletState = {
  address: null, balance: null,
  isConnecting: false, isConnected: false, error: null,
}

const EVM_STORAGE_KEY = 'kubryx_evm_address'

const WalletContext = createContext<WalletContextType | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [evm, setEvm] = useState<EVMWalletState>(defaultEVM)
  const [solana, setSolana] = useState<SolanaWalletState>(defaultSolana)

  // ─ EVM helpers ─────────────────────────────────────────────────────────────

  async function loadEVMDetails(address: string) {
    try {
      const eth = getEthereum()
      if (!eth) return
      const chainIdHex = await eth.request({ method: 'eth_chainId' }) as string
      const balanceHex = await eth.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string
      setEvm({
        address,
        balance: weiHexToEther(balanceHex),
        chainId: parseInt(chainIdHex, 16),
        isConnecting: false, isConnected: true, error: null,
      })
      localStorage.setItem(EVM_STORAGE_KEY, address)
    } catch {
      setEvm(p => ({ ...p, isConnecting: false, error: 'Failed to load wallet' }))
    }
  }

  const disconnectEVM = useCallback(() => {
    setEvm(defaultEVM)
    try { localStorage.removeItem(EVM_STORAGE_KEY) } catch { /* noop */ }
  }, [])

  const connectEVM = useCallback(async () => {
    const eth = getEthereum()
    if (!eth) {
      if (typeof window !== 'undefined') window.open('https://metamask.io/download/', '_blank')
      setEvm(p => ({ ...p, error: 'MetaMask not installed' }))
      return
    }
    setEvm(p => ({ ...p, isConnecting: true, error: null }))
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
      if (accounts.length > 0) await loadEVMDetails(accounts[0])
      else setEvm(p => ({ ...p, isConnecting: false }))
    } catch (e) {
      const code = (e as { code?: number })?.code
      setEvm(p => ({
        ...p,
        isConnecting: false,
        error: code === 4001 ? 'Rejected by user' : 'Connection failed',
      }))
    }
  }, [])

  const switchToNetwork = useCallback(async (chainIdHex: string, networkKey: string) => {
    const eth = getEthereum()
    if (!eth) return
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (err) {
      // Network not in MetaMask — add it (QIE Mainnet is not bundled by default).
      if ((err as { code?: number })?.code === 4902) {
        const net = NETWORKS[networkKey as keyof typeof NETWORKS]
        if (!net || net.chainId == null) return
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: net.chainId,
            chainName: net.name,
            rpcUrls: [net.rpcUrl],
            blockExplorerUrls: [net.explorer],
            nativeCurrency: net.currency,
          }],
        })
      }
    }
  }, [])

  // ─ Solana helpers ──────────────────────────────────────────────────────────

  async function loadSolanaDetails(address: string) {
    try {
      const res = await fetch(NETWORKS.SOLANA_DEVNET.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address],
        }),
      })
      const json = await res.json()
      const lamports: number = json?.result?.value ?? 0
      setSolana({
        address,
        balance: (lamports / 1e9).toFixed(4),
        isConnecting: false, isConnected: true, error: null,
      })
    } catch {
      setSolana(p => ({ ...p, address, isConnecting: false, isConnected: true, error: null }))
    }
  }

  const disconnectSolana = useCallback(async () => {
    const ph = getPhantom()
    if (ph?.isPhantom) {
      try { await ph.disconnect() } catch { /* noop */ }
    }
    setSolana(defaultSolana)
  }, [])

  const connectSolana = useCallback(async () => {
    const ph = getPhantom()
    if (!ph?.isPhantom) {
      if (typeof window !== 'undefined') window.open('https://phantom.app/', '_blank')
      setSolana(p => ({ ...p, error: 'Phantom not installed' }))
      return
    }
    setSolana(p => ({ ...p, isConnecting: true, error: null }))
    try {
      const r = await ph.connect()
      await loadSolanaDetails(r.publicKey.toString())
    } catch (e) {
      setSolana(p => ({
        ...p,
        isConnecting: false,
        error: (e as { message?: string })?.message || 'Connection failed',
      }))
    }
  }, [])

  const refreshBalances = useCallback(async () => {
    if (evm.address) await loadEVMDetails(evm.address)
    if (solana.address) await loadSolanaDetails(solana.address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.address, solana.address])

  // ─ EVM auto-reconnect ──────────────────────────────────────────────────────
  useEffect(() => {
    const eth = getEthereum()
    if (!eth) return
    const saved = localStorage.getItem(EVM_STORAGE_KEY)
    if (!saved) return
    eth
      .request({ method: 'eth_accounts' })
      .then(result => {
        const accounts = result as string[]
        if (accounts.length > 0) loadEVMDetails(accounts[0])
        else disconnectEVM()
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─ EVM event listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const eth = getEthereum()
    if (!eth) return

    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[]
      if (!accounts || accounts.length === 0) disconnectEVM()
      else loadEVMDetails(accounts[0])
    }
    const onChain = (...args: unknown[]) => {
      const chainId = parseInt(args[0] as string, 16)
      // Reload full details (chainId + balance) for the newly-selected chain.
      const current = localStorage.getItem(EVM_STORAGE_KEY)
      if (current) loadEVMDetails(current)
      else setEvm(p => (p.isConnected ? { ...p, chainId } : p))
    }

    eth.on('accountsChanged', onAccounts)
    eth.on('chainChanged', onChain)
    return () => {
      eth.removeListener('accountsChanged', onAccounts)
      eth.removeListener('chainChanged', onChain)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─ Solana auto-reconnect + listeners ───────────────────────────────────────
  useEffect(() => {
    const ph = getPhantom()
    if (!ph?.isPhantom) return

    ph.connect({ onlyIfTrusted: true })
      .then(r => loadSolanaDetails(r.publicKey.toString()))
      .catch(() => {})

    const onDisconnect = () => setSolana(defaultSolana)
    const onAccountChanged = (...args: unknown[]) => {
      const pk = args[0] as { toString: () => string } | null
      if (pk) loadSolanaDetails(pk.toString())
      else setSolana(defaultSolana)
    }
    ph.on?.('disconnect', onDisconnect)
    ph.on?.('accountChanged', onAccountChanged)
    return () => {
      ph.removeListener?.('disconnect', onDisconnect)
      ph.removeListener?.('accountChanged', onAccountChanged)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <WalletContext.Provider value={{
      evm, connectEVM, disconnectEVM, switchToNetwork,
      solana, connectSolana, disconnectSolana,
      isAnyWalletConnected: evm.isConnected || solana.isConnected,
      activeWalletAddress: evm.address || solana.address,
      refreshBalances,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be inside WalletProvider')
  return ctx
}
