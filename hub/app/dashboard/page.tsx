'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type PhantomProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  signMessage?: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
}

type FreighterProvider = {
  isConnected?: () => Promise<boolean>
  getAddress?: () => Promise<string>
  getPublicKey?: () => Promise<string>
  signTransaction?: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
    solana?: PhantomProvider & { isPhantom?: boolean }
    freighter?: FreighterProvider
  }
}

type Health = 'checking' | 'ok' | 'down'

type ActivityItem = {
  id?: string
  timestamp?: string
  tool: string
  action: string
  wallet?: string
}

const tools = [
  { name: 'CreditBlocks', href: '/credit', chain: 'QIE Mainnet', env: process.env.NEXT_PUBLIC_CREDITBLOCKS_API },
  { name: 'Legacy Vault', href: '/legacy', chain: 'QIE Mainnet', env: process.env.NEXT_PUBLIC_ETERNALVAULT_API },
  { name: 'SyncSplit', href: '/split', chain: 'Stellar Testnet', env: process.env.NEXT_PUBLIC_STELLAR_RPC, rpc: true },
  { name: 'AI Lending', href: '/lend', chain: 'Arbitrum', env: process.env.NEXT_PUBLIC_LENDORA_API },
  { name: 'Agent Mesh', href: '/agents', chain: 'Solana Devnet', env: process.env.NEXT_PUBLIC_TRUSTMESH_API },
  { name: 'Shadow OS', href: '/shadow', chain: 'Solana Devnet', env: process.env.NEXT_PUBLIC_SHADOW_API },
  { name: 'Treasury AI', href: '/treasury', chain: 'Solana Devnet', env: process.env.NEXT_PUBLIC_PALMFLOW_API },
  { name: 'Private Vault', href: '/vault', chain: 'Multi-chain', env: process.env.NEXT_PUBLIC_CIPHER_API },
]

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ChainBadge({ chain }: { chain: string }) {
  return (
    <span className="chain-badge">
      <span className="chain-dot" />
      {chain}
    </span>
  )
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export default function DashboardPage() {
  const [ethWallet, setEthWallet] = useState('')
  const [solWallet, setSolWallet] = useState('')
  const [stellarWallet, setStellarWallet] = useState('')
  const [health, setHealth] = useState<Record<string, Health>>({})
  const [creditScore, setCreditScore] = useState('0')
  const [activeVaults, setActiveVaults] = useState(0)
  const [activeAgents, setActiveAgents] = useState(0)
  const [treasuryBalance, setTreasuryBalance] = useState('0 SOL')
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const primaryWallet = useMemo(() => ethWallet || solWallet || stellarWallet, [ethWallet, solWallet, stellarWallet])

  async function connectMetaMask() {
    try {
      setError('')
      if (!window.ethereum) throw new Error('MetaMask is not installed.')
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      setEthWallet(accounts[0] || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect MetaMask.')
    }
  }

  async function connectPhantom() {
    try {
      setError('')
      if (!window.solana?.isPhantom) throw new Error('Phantom is not installed.')
      const result = await window.solana.connect()
      setSolWallet(result.publicKey.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect Phantom.')
    }
  }

  async function connectFreighter() {
    try {
      setError('')
      if (!window.freighter) throw new Error('Freighter is not installed.')
      const connected = window.freighter.isConnected ? await window.freighter.isConnected() : true
      if (!connected) throw new Error('Freighter is locked or not connected.')
      const address = window.freighter.getAddress ? await window.freighter.getAddress() : await window.freighter.getPublicKey?.()
      setStellarWallet(address || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect Freighter.')
    }
  }

  async function loadHealth() {
    const next: Record<string, Health> = {}
    await Promise.all(tools.map(async (tool) => {
      try {
        next[tool.name] = 'checking'
        if (!tool.env) throw new Error('Missing env')
        if (tool.rpc) {
          await fetchJson(tool.env, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'getHealth', params: {} }),
          })
        } else {
          const data = await fetchJson<{ status?: string }>(`${tool.env}/health`)
          if (data.status && data.status !== 'ok') throw new Error('Health check failed')
        }
        next[tool.name] = 'ok'
      } catch {
        next[tool.name] = 'down'
      }
    }))
    setHealth(next)
  }

  async function loadStats() {
    try {
      setLoading(true)
      setError('')
      const feed: ActivityItem[] = []

      if (process.env.NEXT_PUBLIC_CREDITBLOCKS_API && ethWallet) {
        const score = await fetchJson<{ score?: string | number }>(`${process.env.NEXT_PUBLIC_CREDITBLOCKS_API}/api/score/${ethWallet}`).catch(() => null)
        if (score?.score !== undefined) setCreditScore(String(score.score))
      }

      if (process.env.NEXT_PUBLIC_ETERNALVAULT_API && ethWallet) {
        const vaultData = await fetchJson<unknown>(`${process.env.NEXT_PUBLIC_ETERNALVAULT_API}/api/vaults/${ethWallet}`).catch(() => null)
        const vaults = Array.isArray(vaultData) ? vaultData : (vaultData as { vaults?: unknown[] } | null)?.vaults || []
        setActiveVaults(vaults.length)
        vaults.slice(0, 3).forEach((item, index) => feed.push({ tool: 'Legacy Vault', action: `Vault ${(item as { status?: string }).status || 'active'}`, wallet: ethWallet, id: `vault-${index}` }))
      }

      if (process.env.NEXT_PUBLIC_TRUSTMESH_API && solWallet) {
        const agentData = await fetchJson<unknown>(`${process.env.NEXT_PUBLIC_TRUSTMESH_API}/api/agents/${solWallet}`).catch(() => null)
        const agents = Array.isArray(agentData) ? agentData : (agentData as { agents?: unknown[] } | null)?.agents || []
        setActiveAgents(agents.length)
        const agentFeed = await fetchJson<unknown>(`${process.env.NEXT_PUBLIC_TRUSTMESH_API}/api/activity/${solWallet}`).catch(() => null)
        const items = Array.isArray(agentFeed) ? agentFeed : (agentFeed as { activity?: unknown[] } | null)?.activity || []
        items.slice(0, 4).forEach((item, index) => feed.push({ tool: 'Agent Mesh', action: (item as { action?: string }).action || 'Agent action', wallet: solWallet, timestamp: (item as { timestamp?: string }).timestamp, id: `agent-${index}` }))
      }

      if (process.env.NEXT_PUBLIC_PALMFLOW_API && solWallet) {
        const treasury = await fetchJson<{ totalBalance?: string; balance?: string }>(`${process.env.NEXT_PUBLIC_PALMFLOW_API}/api/treasury/${solWallet}`).catch(() => null)
        setTreasuryBalance(treasury?.totalBalance || treasury?.balance || '0 SOL')
      }

      const activitySources = [
        { tool: 'Shadow OS', url: process.env.NEXT_PUBLIC_SHADOW_API ? `${process.env.NEXT_PUBLIC_SHADOW_API}/api/activity` : '', wallet: solWallet },
        { tool: 'Treasury AI', url: process.env.NEXT_PUBLIC_PALMFLOW_API && solWallet ? `${process.env.NEXT_PUBLIC_PALMFLOW_API}/api/payroll/${solWallet}` : '', wallet: solWallet },
        { tool: 'Private Vault', url: process.env.NEXT_PUBLIC_CIPHER_API && solWallet ? `${process.env.NEXT_PUBLIC_CIPHER_API}/api/trades/${solWallet}` : '', wallet: solWallet },
      ]

      await Promise.all(activitySources.map(async (source) => {
        if (!source.url) return
        const data = await fetchJson<unknown>(source.url).catch(() => null)
        const items = Array.isArray(data) ? data : (data as { activity?: unknown[]; streams?: unknown[]; trades?: unknown[] } | null)?.activity || (data as { streams?: unknown[] } | null)?.streams || (data as { trades?: unknown[] } | null)?.trades || []
        items.slice(0, 3).forEach((item, index) => feed.push({
          tool: source.tool,
          action: (item as { action?: string; status?: string }).action || (item as { status?: string }).status || 'Activity recorded',
          wallet: source.wallet,
          timestamp: (item as { timestamp?: string; createdAt?: string }).timestamp || (item as { createdAt?: string }).createdAt,
          id: `${source.tool}-${index}`,
        }))
      }))

      setActivity(feed.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || ''))))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard stats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  useEffect(() => {
    loadStats()
  }, [ethWallet, solWallet, stellarWallet])

  return (
    <main className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link className="logo" href="/">Kubryx</Link>
        <div className="card wallet-card">
          <h2>Wallets</h2>
          <button className="btn-outline" onClick={connectMetaMask}>{ethWallet ? shortAddress(ethWallet) : 'MetaMask'}</button>
          <button className="btn-outline" onClick={connectPhantom}>{solWallet ? shortAddress(solWallet) : 'Phantom'}</button>
          <button className="btn-outline" onClick={connectFreighter}>{stellarWallet ? shortAddress(stellarWallet) : 'Freighter'}</button>
        </div>
        <nav className="sidebar-nav">
          {tools.map((tool) => <Link key={tool.name} href={tool.href}>{tool.name}</Link>)}
        </nav>
      </aside>

      <section className="dashboard-main">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Command Center</p>
            <h1>Unified Dashboard</h1>
            <p className="silver-text">One health, activity, and wallet view across all Kubryx tools.</p>
          </div>
          <button className="btn-gold" onClick={loadStats} disabled={loading}>{loading ? <span className="spinner" /> : 'Refresh'}</button>
        </section>

        {error && <div className="card error-card">{error}</div>}
        {!primaryWallet && <div className="card">Connect at least one wallet to populate personalized stats and activity.</div>}

        <section className="stats-grid">
          <div className="card"><p>Credit Score</p><strong className="gold-text">{creditScore}</strong></div>
          <div className="card"><p>Active Vaults</p><strong className="gold-text">{activeVaults}</strong></div>
          <div className="card"><p>Active Agents</p><strong className="gold-text">{activeAgents}</strong></div>
          <div className="card"><p>Treasury Balance</p><strong className="gold-text">{treasuryBalance}</strong></div>
        </section>

        <section className="tool-grid">
          {tools.map((tool) => (
            <article className="card" key={tool.name}>
              <div className="metric-row">
                <h2>{tool.name}</h2>
                <span className={`health-badge ${health[tool.name] === 'ok' ? 'is-live' : 'is-down'}`}>
                  <span className="chain-dot" />
                  {health[tool.name] || 'checking'}
                </span>
              </div>
              <ChainBadge chain={tool.chain} />
              <Link className="btn-outline" href={tool.href}>Open tool</Link>
            </article>
          ))}
        </section>

        <section className="card">
          <h2>Unified activity</h2>
          {loading && <span className="spinner" />}
          {!loading && activity.length === 0 && <p className="silver-text">Recent backend activity appears here after wallets connect.</p>}
          {activity.map((item, index) => (
            <article className="mini-card" key={item.id || index}>
              <div>
                <p className="gold-text">{item.tool}</p>
                <p>{item.action}</p>
              </div>
              <div className="item-actions">
                <span className="silver-text">{item.wallet ? shortAddress(item.wallet) : 'system'}</span>
                <span className="silver-text">{item.timestamp || 'recent'}</span>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}
