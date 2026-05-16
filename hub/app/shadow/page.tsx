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

type ShadowAgent = {
  agentType?: string
  name?: string
  status?: string
  lastAction?: string
}

type FeedItem = {
  id?: string
  agentType?: string
  action?: string
  timestamp?: string
}

const apiBase = process.env.NEXT_PUBLIC_SHADOW_API || ''

const departments = [
  ['cfo', 'CFO Agent', 'Treasury overview'],
  ['payroll', 'Payroll Agent', 'Stream payments per second'],
  ['compliance', 'Compliance Agent', 'Rule checks'],
  ['audit', 'Audit Agent', 'Transaction log'],
  ['procurement', 'Procurement Agent', 'Vendor payments'],
  ['tax', 'Tax Agent', 'Liability estimates'],
  ['risk', 'Risk Agent', 'Anomaly alerts'],
]

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

export default function ShadowPage() {
  const [wallet, setWallet] = useState('')
  const [orgName, setOrgName] = useState('')
  const [admin, setAdmin] = useState('')
  const [agents, setAgents] = useState<ShadowAgent[]>([])
  const [activity, setActivity] = useState<FeedItem[]>([])
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_SHADOW_API is not configured.')
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
      const pubkey = result.publicKey.toString()
      setWallet(pubkey)
      setAdmin(pubkey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect Phantom.')
    }
  }

  async function loadShadowData(pubkey?: string) {
    try {
      setLoading(true)
      setError('')
      const [statusData, activityData] = await Promise.all([
        requestJson<ShadowAgent[] | { agents?: ShadowAgent[] }>('/api/agents/status'),
        requestJson<FeedItem[] | { activity?: FeedItem[] }>('/api/activity'),
        pubkey ? requestJson(`/api/org/${pubkey}`).catch(() => null) : Promise.resolve(null),
      ])
      setAgents(Array.isArray(statusData) ? statusData : statusData.agents || [])
      setActivity(Array.isArray(activityData) ? activityData : activityData.activity || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Shadow OS data.')
    } finally {
      setLoading(false)
    }
  }

  async function setupOrg(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Phantom before setting up an organization.')
      await requestJson('/api/org/setup', {
        method: 'POST',
        body: JSON.stringify({ name: orgName, admin }),
      })
      setMessage('Organization configured.')
      await loadShadowData(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to set up organization.')
    } finally {
      setLoading(false)
    }
  }

  async function triggerAgent(agentType: string, action: string) {
    try {
      setLoading(true)
      setError('')
      await requestJson('/api/agents/trigger', {
        method: 'POST',
        body: JSON.stringify({ agentType, action, params: { admin: wallet } }),
      })
      setMessage(`${action} triggered.`)
      await loadShadowData(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to trigger agent.')
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
    loadShadowData()
  }, [])

  const statusByType = new Map(agents.map((agent) => [agent.agentType || agent.name || '', agent]))

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">ShadowLedger</p>
          <h1>Shadow OS</h1>
          <p className="silver-text">Coordinate seven AI departments for treasury, payroll, compliance, audit, procurement, tax, and risk.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health}</span>
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect Phantom'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!apiBase && <div className="card error-card">NEXT_PUBLIC_SHADOW_API is not configured.</div>}
      {!wallet && <div className="card">Connect Phantom to administer Shadow OS.</div>}

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={setupOrg}>
          <h2>Organization setup</h2>
          <label>Organization name</label>
          <input value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="Kubryx Operations" />
          <label>Admin wallet</label>
          <input value={admin} onChange={(event) => setAdmin(event.target.value)} placeholder="Solana admin wallet" />
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Save organization'}</button>
        </form>
        <div className="card">
          <h2>Global activity</h2>
          {activity.length === 0 && <p className="silver-text">All agent actions appear in this feed.</p>}
          {activity.map((item, index) => (
            <article className="mini-card" key={item.id || index}>
              <p className="gold-text">{item.agentType || 'Shadow agent'}</p>
              <p>{item.action || 'Action recorded'}</p>
              <p className="silver-text">{item.timestamp || 'Just now'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="agent-grid">
        {departments.map(([agentType, name, action]) => {
          const agent = statusByType.get(agentType) || statusByType.get(name)
          return (
            <article className="card" key={agentType}>
              <div className="metric-row">
                <h2>{name}</h2>
                <span className="status-pill">{agent?.status || 'standby'}</span>
              </div>
              <p className="silver-text">{action}</p>
              <p>{agent?.lastAction || 'Ready for trigger.'}</p>
              <button className="btn-outline" onClick={() => triggerAgent(agentType, action)} disabled={loading || !wallet}>Trigger</button>
            </article>
          )
        })}
      </section>
    </main>
  )
}
