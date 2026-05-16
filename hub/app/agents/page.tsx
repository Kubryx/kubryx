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

type Agent = {
  id?: string
  agentId?: string
  name?: string
  role?: string
  status?: string
  lastAction?: string
}

type Activity = {
  id?: string
  action?: string
  signature?: string
  timestamp?: string
}

const apiBase = process.env.NEXT_PUBLIC_TRUSTMESH_API || ''
const PROGRAM_ID = '66DXeSqBccWxWWw9S21vxe2Mvvqqkmw5KsK5jqA42quz'

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

export default function AgentsPage() {
  const [wallet, setWallet] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [permissions, setPermissions] = useState('')
  const [task, setTask] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_TRUSTMESH_API is not configured.')
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

  async function loadAgents(pubkey: string) {
    try {
      setLoading(true)
      setError('')
      const [agentData, activityData] = await Promise.all([
        requestJson<Agent[] | { agents?: Agent[] }>(`/api/agents/${pubkey}`),
        requestJson<Activity[] | { activity?: Activity[] }>(`/api/activity/${pubkey}`),
      ])
      setAgents(Array.isArray(agentData) ? agentData : agentData.agents || [])
      setActivity(Array.isArray(activityData) ? activityData : activityData.activity || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load agents.')
    } finally {
      setLoading(false)
    }
  }

  async function deployAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Phantom before deploying an agent.')
      await requestJson('/api/agents/deploy', {
        method: 'POST',
        body: JSON.stringify({ owner: wallet, name, role, permissions: permissions.split(',').map((item) => item.trim()).filter(Boolean) }),
      })
      setMessage('Agent deployed.')
      await loadAgents(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to deploy agent.')
    } finally {
      setLoading(false)
    }
  }

  async function delegateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet || !selectedAgent) throw new Error('Select an agent and connect Phantom.')
      const encoded = new TextEncoder().encode(task)
      const signed = await window.solana?.signMessage?.(encoded, 'utf8')
      const signature = signed ? Array.from(signed.signature).join(',') : 'unsigned-preview'
      await requestJson('/api/agents/delegate', {
        method: 'POST',
        body: JSON.stringify({ agentId: selectedAgent, task, signature }),
      })
      setMessage('Task delegated with Ed25519 signature.')
      await loadAgents(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delegate task.')
    } finally {
      setLoading(false)
    }
  }

  async function revokeAgent(agent: Agent) {
    try {
      setLoading(true)
      setError('')
      await requestJson('/api/agents/revoke', {
        method: 'POST',
        body: JSON.stringify({ agentId: agent.id || agent.agentId }),
      })
      setMessage('Agent revoked.')
      if (wallet) await loadAgents(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to revoke agent.')
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
    if (wallet) loadAgents(wallet)
  }, [wallet])

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">TrustMesh</p>
          <h1>Agent Mesh</h1>
          <p className="silver-text">Deploy signed Solana agents, delegate work, inspect activity, and revoke access.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health}</span>
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect Phantom'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!apiBase && <div className="card error-card">NEXT_PUBLIC_TRUSTMESH_API is not configured.</div>}
      {!wallet && <div className="card">Connect Phantom to deploy and manage Solana agents.</div>}

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={deployAgent}>
          <h2>Deploy agent</h2>
          <label>Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Treasury Scout" />
          <label>Role</label>
          <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Monitor payments" />
          <label>Permissions</label>
          <input value={permissions} onChange={(event) => setPermissions(event.target.value)} placeholder="read, delegate, notify" />
          <p className="silver-text">Program: {PROGRAM_ID}</p>
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Deploy agent'}</button>
        </form>

        <form className="card form-panel" onSubmit={delegateTask}>
          <h2>Delegate task</h2>
          <label>Agent</label>
          <select value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value)}>
            <option value="">Select agent</option>
            {agents.map((agent, index) => <option key={agent.id || agent.agentId || index} value={agent.id || agent.agentId}>{agent.name || `Agent ${index + 1}`}</option>)}
          </select>
          <label>Task</label>
          <textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Reconcile today's treasury activity" />
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Delegate'}</button>
        </form>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h2>Active agents</h2>
          {loading && <span className="spinner" />}
          {!loading && agents.length === 0 && <p className="silver-text">No agents deployed yet.</p>}
          {agents.map((agent, index) => (
            <article className="mini-card" key={agent.id || agent.agentId || index}>
              <div>
                <p className="gold-text">{agent.name || `Agent ${index + 1}`}</p>
                <p>{agent.role || 'Autonomous delegate'}</p>
                <p className="silver-text">{agent.lastAction || 'No recent action'}</p>
              </div>
              <div className="item-actions">
                <span className="status-pill">{agent.status || 'active'}</span>
                <button className="btn-outline" onClick={() => revokeAgent(agent)} disabled={loading}>Revoke</button>
              </div>
            </article>
          ))}
        </div>
        <div className="card">
          <h2>Signed activity</h2>
          {activity.length === 0 && <p className="silver-text">Ed25519 signed actions appear here.</p>}
          {activity.map((item, index) => (
            <article className="mini-card" key={item.id || index}>
              <p className="gold-text">{item.action || 'Agent action'}</p>
              <p className="silver-text">{item.signature || 'signature pending'}</p>
              <p className="silver-text">{item.timestamp || 'Just now'}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
