'use client'

import { FormEvent, useEffect, useState } from 'react'
import { fallbackVaultTrades } from '../../lib/fallback'
import { toast } from '../../lib/toast'
import { loadWallet, persistWallet } from '../../lib/wallet-utils'
import DemoBanner from '../components/DemoBanner'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

type PhantomProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  signMessage?: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
}

declare global {
  interface Window {
    solana?: PhantomProvider & { isPhantom?: boolean }
  }
}

type Trade = {
  id?: string
  asset?: string
  amount?: string
  fromChain?: string
  toChain?: string
  status?: string
  bridgeStatus?: string
  createdAt?: string
}

type PrivacyScore = {
  score?: number
  breakdown?: Record<string, string | number>
}

const apiBase = process.env.NEXT_PUBLIC_CIPHER_URL || process.env.NEXT_PUBLIC_CIPHER_API || ''

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ChainBadge() {
  return (
    <span className="chain-badge">
      <span className="chain-dot" />
      Multi-chain
    </span>
  )
}

export default function VaultPage() {
  const [wallet, setWallet] = useState('')
  const [asset, setAsset] = useState('SOL')
  const [amount, setAmount] = useState('')
  const [fromChain, setFromChain] = useState('Solana')
  const [toChain, setToChain] = useState('QIE')
  const [zeroMetadata, setZeroMetadata] = useState(true)
  const [trades, setTrades] = useState<Trade[]>([])
  const [privacy, setPrivacy] = useState<PrivacyScore>({})
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = loadWallet('solana')
    if (saved) setWallet(saved)
  }, [])

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_CIPHER_API is not configured.')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch(`${apiBase}${path}`, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      })
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      return await response.json() as Promise<T>
    } finally {
      clearTimeout(timeout)
    }
  }

  async function connectWallet() {
    try {
      setError('')
      if (!window.solana?.isPhantom) throw new Error('Phantom is not installed.')
      const result = await window.solana.connect()
      const address = result.publicKey.toString()
      setWallet(address)
      persistWallet('solana', address)
      toast.success('Phantom connected')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to connect Phantom.'
      setError(msg)
      toast.error(msg)
    }
  }

  async function loadVault(pubkey: string) {
    try {
      setLoading(true)
      setError('')
      const [tradeData, scoreData] = await Promise.all([
        requestJson<Trade[] | { trades?: Trade[] }>(`/api/trades/${pubkey}`),
        requestJson<PrivacyScore>('/api/privacy/score'),
      ])
      setTrades(Array.isArray(tradeData) ? tradeData : tradeData.trades || [])
      setPrivacy(scoreData)
      setIsDemo(false)
    } catch {
      setTrades(fallbackVaultTrades as unknown as Trade[])
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }

  async function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Phantom before creating a private trade.')
      await requestJson('/api/trade/private', {
        method: 'POST',
        body: JSON.stringify({ asset, amount, fromChain: zeroMetadata ? 'zero-metadata' : fromChain, toChain }),
      })
      setMessage('Private trade submitted.')
      toast.success(`Private trade: ${amount} ${asset} → ${toChain}`)
      await loadVault(wallet)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to submit private trade.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await requestJson<{ status?: string }>('/health')
        setHealth(data.status === 'ok' ? 'ok' : 'down')
      } catch {
        setHealth('down')
      }
    }
    checkHealth()
  }, [])

  useEffect(() => {
    if (wallet) loadVault(wallet)
  }, [wallet])

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow">CipherVault</p>
          <h1>Private Vault</h1>
          <p className="silver-text">Route private trades across chains with zero metadata mode and live bridge status.</p>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 10, background: isDemo ? 'rgba(255, 255, 255, 0.03)' : 'rgba(34, 197, 94, 0.05)', border: isDemo ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(34, 197, 94, 0.3)', color: isDemo ? '#bbb' : '#22C55E', padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDemo ? '#bbb' : '#22C55E' }} />
              {isDemo ? 'Demo Mode' : 'Live Connection'}
            </span>
            <span style={{ fontSize: 10, background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.25)', color: '#C084FC', padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A855F7' }} />
              Solana Devnet
            </span>
          </div>
        </div>
        <div className="hero-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health === 'ok' ? 'Live' : 'Offline'}</span>
          <button className="btn-gold" onClick={connectWallet} aria-label={wallet ? `Connected as ${shortAddress(wallet)}` : 'Connect Phantom Wallet'}>{wallet ? shortAddress(wallet) : 'Connect Phantom'}</button>
        </div>
      </section>

      {isDemo && <DemoBanner />}
      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!wallet && <div className="card">Connect Phantom to open private trading controls.</div>}

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={submitTrade}>
          <h2>Private trade</h2>
          <label>Asset</label>
          <input value={asset} onChange={(event) => setAsset(event.target.value)} />
          <label>Amount</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} />
          <label>Destination chain</label>
          <select value={toChain} onChange={(event) => setToChain(event.target.value)}>
            <option>QIE</option>
            <option>Solana</option>
            <option>Stellar</option>
            <option>Arbitrum</option>
          </select>
          <label>Source chain</label>
          <select value={fromChain} onChange={(event) => setFromChain(event.target.value)}>
            <option>Solana</option>
            <option>QIE</option>
            <option>Stellar</option>
            <option>Arbitrum</option>
          </select>
          <label className="toggle-row">
            <input type="checkbox" checked={zeroMetadata} onChange={(event) => setZeroMetadata(event.target.checked)} />
            Zero metadata mode
          </label>
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Submit private trade'}</button>
        </form>

        <div className="card">
          <h2>Privacy score</h2>
          <strong className="gold-text" style={{ fontSize: 48 }}>{privacy.score ?? 0}</strong>
          <p className="silver-text">Score updates from CipherVault privacy analysis.</p>
          {privacy.breakdown && Object.entries(privacy.breakdown).map(([key, value]) => (
            <div className="metric-row" key={key}>
              <span>{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Pending trades and bridge status</h2>
        {loading ? (
          <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
        ) : trades.length === 0 ? (
          <EmptyState icon="🔀" title="No private trades" subtitle="Submit a trade above to see bridge status here." />
        ) : trades.map((trade, index) => (
          <article className="mini-card" key={trade.id || index}>
            <div>
              <p className="gold-text">{trade.amount || '0'} {trade.asset || asset}</p>
              <p className="silver-text">{trade.fromChain || fromChain} → {trade.toChain || toChain}</p>
              <p className="silver-text">{trade.createdAt || 'Queued now'}</p>
            </div>
            <div className="item-actions">
              <span className="status-pill">{trade.status || 'pending'}</span>
              <span className="status-pill">{trade.bridgeStatus || 'bridge watching'}</span>
            </div>
          </article>
        ))}
      </section>
      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
