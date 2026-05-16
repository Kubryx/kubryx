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

type TreasuryData = {
  totalBalance?: string
  balance?: string
  inflows?: string
  outflows?: string
  apy?: string
}

type PayrollStream = {
  id?: string
  recipient?: string
  ratePerSecond?: string
  token?: string
  status?: string
}

const apiBase = process.env.NEXT_PUBLIC_PALMFLOW_API || ''

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ChainBadge() {
  return (
    <span className="chain-badge">
      <span className="chain-dot" />
      Solana Devnet
    </span>
  )
}

export default function TreasuryPage() {
  const [wallet, setWallet] = useState('')
  const [treasury, setTreasury] = useState<TreasuryData>({})
  const [streams, setStreams] = useState<PayrollStream[]>([])
  const [recipient, setRecipient] = useState('')
  const [ratePerSecond, setRatePerSecond] = useState('')
  const [token, setToken] = useState('SOL')
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [vote, setVote] = useState('yes')
  const [advisorInput, setAdvisorInput] = useState('')
  const [advisor, setAdvisor] = useState<string[]>([])
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_PALMFLOW_API is not configured.')
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

  async function loadTreasury(pubkey: string) {
    try {
      setLoading(true)
      setError('')
      const [treasuryData, payrollData] = await Promise.all([
        requestJson<TreasuryData>(`/api/treasury/${pubkey}`),
        requestJson<PayrollStream[] | { streams?: PayrollStream[] }>(`/api/payroll/${pubkey}`),
      ])
      setTreasury(treasuryData)
      setStreams(Array.isArray(payrollData) ? payrollData : payrollData.streams || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load treasury.')
    } finally {
      setLoading(false)
    }
  }

  async function addPayroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      await requestJson('/api/payroll/add', {
        method: 'POST',
        body: JSON.stringify({ recipient, ratePerSecond, token }),
      })
      setMessage('Payroll stream added.')
      if (wallet) await loadTreasury(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add payroll stream.')
    } finally {
      setLoading(false)
    }
  }

  async function createProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      await requestJson('/api/governance/propose', {
        method: 'POST',
        body: JSON.stringify({ title: proposalTitle, description: proposalDescription, vote }),
      })
      setMessage('Governance proposal submitted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit proposal.')
    } finally {
      setLoading(false)
    }
  }

  async function askAdvisor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      const data = await requestJson<{ response?: string; advice?: string }>('/api/ai/advise', {
        method: 'POST',
        body: JSON.stringify({ message: advisorInput, treasuryData: treasury }),
      })
      setAdvisor((current) => [data.response || data.advice || 'Advisor response received.', ...current])
      setAdvisorInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to get AI advice.')
    } finally {
      setLoading(false)
    }
  }

  async function rebalance() {
    setMessage('Yield optimizer rebalance queued.')
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
    if (wallet) loadTreasury(wallet)
  }, [wallet])

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">PalmFlow</p>
          <h1>Treasury AI</h1>
          <p className="silver-text">Monitor balances, stream payroll, govern spending, optimize yield, and ask the AI advisor.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health}</span>
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect Phantom'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!apiBase && <div className="card error-card">NEXT_PUBLIC_PALMFLOW_API is not configured.</div>}
      {!wallet && <div className="card">Connect Phantom to load treasury balances and streams.</div>}

      <section className="stats-grid">
        <div className="card"><p>Total balance</p><strong className="gold-text">{treasury.totalBalance || treasury.balance || '0 SOL'}</strong></div>
        <div className="card"><p>Inflows</p><strong className="gold-text">{treasury.inflows || '0'}</strong></div>
        <div className="card"><p>Outflows</p><strong className="gold-text">{treasury.outflows || '0'}</strong></div>
        <div className="card"><p>Current APY</p><strong className="gold-text">{treasury.apy || '0%'}</strong></div>
      </section>

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={addPayroll}>
          <h2>Payroll streaming</h2>
          <label>Recipient</label>
          <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Solana wallet" />
          <label>Rate per second</label>
          <input value={ratePerSecond} onChange={(event) => setRatePerSecond(event.target.value)} placeholder="0.0001" />
          <label>Token</label>
          <select value={token} onChange={(event) => setToken(event.target.value)}>
            <option>SOL</option>
            <option>PUSD</option>
          </select>
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Add stream'}</button>
        </form>
        <form className="card form-panel" onSubmit={createProposal}>
          <h2>Governance</h2>
          <label>Proposal title</label>
          <input value={proposalTitle} onChange={(event) => setProposalTitle(event.target.value)} />
          <label>Description</label>
          <textarea value={proposalDescription} onChange={(event) => setProposalDescription(event.target.value)} />
          <label>Vote</label>
          <select value={vote} onChange={(event) => setVote(event.target.value)}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="abstain">Abstain</option>
          </select>
          <button className="btn-gold" disabled={loading || !wallet}>Create proposal</button>
        </form>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h2>Active streams</h2>
          {streams.length === 0 && <p className="silver-text">No active payroll streams.</p>}
          {streams.map((stream, index) => (
            <article className="mini-card" key={stream.id || index}>
              <p className="gold-text">{stream.ratePerSecond || '0'} {stream.token || 'SOL'} / sec</p>
              <p className="silver-text">{stream.recipient ? shortAddress(stream.recipient) : 'Recipient pending'}</p>
              <span className="status-pill">{stream.status || 'active'}</span>
            </article>
          ))}
        </div>
        <form className="card form-panel" onSubmit={askAdvisor}>
          <h2>AI advisor</h2>
          <textarea value={advisorInput} onChange={(event) => setAdvisorInput(event.target.value)} placeholder="How should we rebalance this week?" />
          <div className="button-row">
            <button className="btn-gold" disabled={loading || !wallet}>Ask advisor</button>
            <button type="button" className="btn-outline" onClick={rebalance}>Rebalance</button>
          </div>
          {advisor.map((item, index) => <p key={index}>{item}</p>)}
        </form>
      </section>
    </main>
  )
}
