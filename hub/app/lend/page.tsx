'use client'

import { FormEvent, useEffect, useState } from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

type Loan = {
  id?: string
  loanId?: string
  amount?: string
  duration?: string
  status?: string
  rate?: string
  dueDate?: string
}

type ChatMessage = {
  role: 'user' | 'ai'
  text: string
}

const apiBase = process.env.NEXT_PUBLIC_LENDORA_API || ''

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ChainBadge() {
  return (
    <span className="chain-badge">
      <span className="chain-dot" />
      Arbitrum
    </span>
  )
}

export default function LendPage() {
  const [wallet, setWallet] = useState('')
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [purpose, setPurpose] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [terms, setTerms] = useState('')
  const [loans, setLoans] = useState<Loan[]>([])
  const [repayLoanId, setRepayLoanId] = useState('')
  const [repayAmount, setRepayAmount] = useState('')
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_LENDORA_API is not configured.')
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
      if (!window.ethereum) throw new Error('MetaMask is not installed.')
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      setWallet(accounts[0] || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect MetaMask.')
    }
  }

  async function loadLoans(address: string) {
    try {
      setLoading(true)
      setError('')
      const data = await requestJson<Loan[] | { loans?: Loan[] }>(`/api/loans/${address}`)
      setLoans(Array.isArray(data) ? data : data.loans || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load loans.')
    } finally {
      setLoading(false)
    }
  }

  async function negotiate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect MetaMask before negotiating.')
      const userText = chatInput || `I need $${amount} for ${duration} months for ${purpose}.`
      setChat((current) => [...current, { role: 'user', text: userText }])
      const data = await requestJson<{ response?: string; terms?: string }>('/api/negotiate', {
        method: 'POST',
        body: JSON.stringify({ message: userText, walletAddress: wallet, loanParams: { amount, duration, purpose } }),
      })
      const aiText = data.response || data.terms || 'Terms generated. Review and accept when ready.'
      setTerms(data.terms || aiText)
      setChat((current) => [...current, { role: 'ai', text: aiText }])
      setChatInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to negotiate loan terms.')
    } finally {
      setLoading(false)
    }
  }

  async function createLoan() {
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect MetaMask before creating a loan.')
      await requestJson('/api/loans/create', {
        method: 'POST',
        body: JSON.stringify({ borrower: wallet, amount, duration, terms }),
      })
      setMessage('Loan created from accepted terms.')
      await loadLoans(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create loan.')
    } finally {
      setLoading(false)
    }
  }

  async function repayLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      await requestJson('/api/loans/repay', {
        method: 'POST',
        body: JSON.stringify({ loanId: repayLoanId, amount: repayAmount }),
      })
      setMessage('Repayment submitted.')
      if (wallet) await loadLoans(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to repay loan.')
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
    if (wallet) loadLoans(wallet)
  }, [wallet])

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Lendora AI</p>
          <h1>AI lending desk</h1>
          <p className="silver-text">Negotiate borrower terms, create active loans, and handle repayments from one panel.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health}</span>
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect MetaMask'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!apiBase && <div className="card error-card">NEXT_PUBLIC_LENDORA_API is not configured.</div>}
      {!wallet && <div className="card">Connect MetaMask to negotiate and manage loans.</div>}

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={negotiate}>
          <h2>Loan request</h2>
          <label>Amount</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="500" />
          <label>Duration</label>
          <input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="3 months" />
          <label>Purpose</label>
          <input value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Working capital" />
          <label>Negotiation message</label>
          <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="I need $500 for 3 months" />
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Negotiate terms'}</button>
        </form>

        <div className="card">
          <h2>AI negotiation</h2>
          <div className="stack-list">
            {chat.length === 0 && <p className="silver-text">Messages and AI terms appear here.</p>}
            {chat.map((item, index) => (
              <article className="mini-card" key={`${item.role}-${index}`}>
                <p className="gold-text">{item.role === 'ai' ? 'AI' : 'You'}</p>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="button-row">
            <button className="btn-gold" onClick={createLoan} disabled={!terms || loading}>Accept</button>
            <button className="btn-outline" onClick={() => setChatInput('Counter offer: reduce the rate and extend the repayment grace period.')}>Counter offer</button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h2>Active loans</h2>
          {loading && <span className="spinner" />}
          {!loading && loans.length === 0 && <p className="silver-text">No active loans found.</p>}
          {loans.map((loan, index) => (
            <article className="mini-card" key={loan.id || loan.loanId || index}>
              <p className="gold-text">{loan.amount || 'Loan'} · {loan.rate || 'AI priced'}</p>
              <p className="silver-text">{loan.duration || loan.dueDate || 'Duration pending'}</p>
              <span className="status-pill">{loan.status || 'active'}</span>
            </article>
          ))}
        </div>
        <form className="card form-panel" onSubmit={repayLoan}>
          <h2>Repayment</h2>
          <label>Loan ID</label>
          <input value={repayLoanId} onChange={(event) => setRepayLoanId(event.target.value)} />
          <label>Amount</label>
          <input value={repayAmount} onChange={(event) => setRepayAmount(event.target.value)} />
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Repay'}</button>
        </form>
      </section>
    </main>
  )
}
