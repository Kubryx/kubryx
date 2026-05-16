'use client'

import { FormEvent, useEffect, useState } from 'react'

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

const apiBase = process.env.NEXT_PUBLIC_CIPHER_API || ''

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
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_CIPHER_API is not configured.')
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    })
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return response.json() as Promise<T>
  }

  async function connectWallet() {
    try {
      setError('')
      if (!window.solana?.isPhantom) throw new Error('Phantom is not installed.')
      const result = await window.solana.connect()
      setWallet(result.publicKey.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect Phantom.')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load private vault.')
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
      await loadVault(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit private trade.')
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
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">CipherVault</p>
          <h1>Private Vault</h1>
          <p className="silver-text">Route private trades across chains with zero metadata mode and live bridge status.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health}</span>
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect Phantom'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!apiBase && <div className="card error-card">NEXT_PUBLIC_CIPHER_API is not configured.</div>}
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
          <strong className="gold-text">{privacy.score ?? 0}</strong>
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
        {loading && <span className="spinner" />}
        {!loading && trades.length === 0 && <p className="silver-text">No private trades found.</p>}
        {trades.map((trade, index) => (
          <article className="mini-card" key={trade.id || index}>
            <div>
              <p className="gold-text">{trade.amount || '0'} {trade.asset || asset}</p>
              <p className="silver-text">{trade.fromChain || fromChain} to {trade.toChain || toChain}</p>
              <p className="silver-text">{trade.createdAt || 'Queued now'}</p>
            </div>
            <div className="item-actions">
              <span className="status-pill">{trade.status || 'pending'}</span>
              <span className="status-pill">{trade.bridgeStatus || 'bridge watching'}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
