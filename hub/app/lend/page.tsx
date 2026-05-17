'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { fallbackLoans } from '../../lib/fallback'
import { toast } from '../../lib/toast'
import { loadWallet, persistWallet } from '../../lib/wallet-utils'
import DemoBanner from '../components/DemoBanner'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

const SUGGESTED_PROMPTS = [
  'Request AI-Negotiated Term Loan of 1,500 USDC for 6 Months',
  'Optimize my Borrowing Capacity and Interest Rate based on my Credit Passport Staking Boost',
  'Simulate collateralized Arbitrum debt yield structures with instant repayment paths',
]

// NOTE: NEXT_PUBLIC_GROQ_API_KEY is intentionally public-facing
// for demo fallback only. Rate limited by Groq free tier.
// Production: proxy through /api/chat route.
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''

const STATIC_AI_REPLY =
  "I'm currently offline. Based on your request, I'd suggest a 90-day loan at 4.2% APR with weekly repayments. Connect your backend for a personalized negotiation."

async function groqFallback(message: string): Promise<string> {
  if (!GROQ_KEY) return STATIC_AI_REPLY
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a DeFi loan negotiation AI for Kubryx. Help users understand loan terms, rates, and conditions on Ethereum L2 Arbitrum. Be concise and specific.' },
          { role: 'user', content: message },
        ],
      }),
    })
    const json = await res.json()
    return json?.choices?.[0]?.message?.content || STATIC_AI_REPLY
  } catch {
    return STATIC_AI_REPLY
  }
}

import { resilientRequest } from '../../lib/api-resilience'
import { logTelemetryError } from '../../lib/telemetry'

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
  timestamp?: Date
}

const apiBase = process.env.NEXT_PUBLIC_LENDORA_URL || process.env.NEXT_PUBLIC_LENDORA_API || ''

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
  const [aiTyping, setAiTyping] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat, aiTyping])

  useEffect(() => {
    const saved = loadWallet('evm')
    if (saved) setWallet(saved)
  }, [])

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_LENDORA_API is not configured.')
    const sanitizedPath = path.replace(/[^a-zA-Z0-9]/g, '_')
    return resilientRequest<T>(`${apiBase}${path}`, options, `lend_${sanitizedPath}`)
  }

  async function connectWallet() {
    try {
      setError('')
      if (!window.ethereum) throw new Error('MetaMask is not installed.')
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      const address = accounts[0] || ''
      setWallet(address)
      persistWallet('evm', address)
      toast.success('MetaMask connected')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to connect MetaMask.'
      setError(msg)
      toast.error(msg)
    }
  }

  async function loadLoans(address: string) {
    try {
      setLoading(true)
      setError('')
      const data = await requestJson<Loan[] | { loans?: Loan[] }>(`/api/loans/${address}`)
      setLoans(Array.isArray(data) ? data : data.loans || [])
      setIsDemo(false)
    } catch {
      setLoans(fallbackLoans as unknown as Loan[])
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }

  function streamAiResponse(fullText: string) {
    setAiTyping(true)
    let currentText = ''
    const words = fullText.split(' ')
    let i = 0
    
    // Add empty message to be filled
    setChat((current) => [...current, { role: 'ai', text: '', timestamp: new Date() }])
    
    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? '' : ' ') + words[i]
        setChat((current) => {
          const next = [...current]
          if (next.length > 0) {
            next[next.length - 1] = {
              ...next[next.length - 1],
              text: currentText
            }
          }
          return next
        })
        i++
      } else {
        clearInterval(interval)
        setAiTyping(false)
      }
    }, 45)
  }

  async function negotiate(event?: FormEvent<HTMLFormElement>) {
    if (event) event.preventDefault()
    const userText = chatInput || `I need $${amount} for ${duration} months for ${purpose}.`
    if (!userText.trim()) return
    setError('')
    setChat((current) => [...current, { role: 'user', text: userText, timestamp: new Date() }])
    setChatInput('')
    setAiTyping(true)
    try {
      const data = await requestJson<{ response?: string; terms?: string }>('/api/negotiate', {
        method: 'POST',
        body: JSON.stringify({ message: userText, walletAddress: wallet, loanParams: { amount, duration, purpose } }),
      })
      const aiText = data.response || data.terms || 'Terms generated. Review and accept when ready.'
      setTerms(data.terms || aiText)
      streamAiResponse(aiText)
      setIsDemo(false)
    } catch {
      const aiText = await groqFallback(userText)
      streamAiResponse(aiText)
      setIsDemo(true)
    }
  }

  function sendSuggested(text: string) {
    setChatInput(text)
    setTimeout(() => {
      // Direct call negotiate using simulated chatInput value
      const userText = text
      setError('')
      setChat((current) => [...current, { role: 'user', text: userText, timestamp: new Date() }])
      setChatInput('')
      setAiTyping(true)
      
      // Perform negotiation directly
      requestJson<{ response?: string; terms?: string }>('/api/negotiate', {
        method: 'POST',
        body: JSON.stringify({ message: userText, walletAddress: wallet, loanParams: { amount, duration, purpose } }),
      }).then(data => {
        const aiText = data.response || data.terms || 'Terms generated. Review and accept when ready.'
        setTerms(data.terms || aiText)
        streamAiResponse(aiText)
        setIsDemo(false)
      }).catch(() => {
        groqFallback(userText).then(aiText => {
          streamAiResponse(aiText)
          setIsDemo(true)
        })
      })
    }, 0)
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
      toast.success('Loan created on Arbitrum')
      await loadLoans(wallet)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to create loan.'
      setError(msg)
      toast.error(msg)
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
      toast.success('Repayment submitted')
      if (wallet) await loadLoans(wallet)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to repay loan.'
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
    if (wallet) loadLoans(wallet)
  }, [wallet])

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow">Lendora AI</p>
          <h1>AI lending desk</h1>
          <p className="silver-text">Negotiate borrower terms, create active loans, and handle repayments from one panel.</p>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 10, background: isDemo ? 'rgba(255, 255, 255, 0.03)' : 'rgba(34, 197, 94, 0.05)', border: isDemo ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(34, 197, 94, 0.3)', color: isDemo ? '#bbb' : '#22C55E', padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDemo ? '#bbb' : '#22C55E' }} />
              {isDemo ? 'Demo Mode' : 'Live Connection'}
            </span>
            <span style={{ fontSize: 10, background: 'rgba(245, 197, 24, 0.05)', border: '1px solid rgba(245, 197, 24, 0.25)', color: '#F5C518', padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C518' }} />
              Arbitrum (42161)
            </span>
          </div>
        </div>
        <div className="hero-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health === 'ok' ? 'Live' : 'Offline'}</span>
          <button className="btn-gold" onClick={connectWallet} aria-label={wallet ? `Connected as ${shortAddress(wallet)}` : 'Connect MetaMask Wallet'}>{wallet ? shortAddress(wallet) : 'Connect MetaMask'}</button>
        </div>
      </section>

      {isDemo && <DemoBanner />}
      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
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
          {chat.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              <p className="silver-text" style={{ fontSize: 12 }}>Try one:</p>
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} className="btn-outline" style={{ textAlign: 'left', fontSize: 13 }} onClick={() => sendSuggested(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
          <div ref={chatScrollRef} className="stack-list" style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chat.map((item, index) => (
              <div key={`${item.role}-${index}`} style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 14,
                  border: `1px solid ${item.role === 'user' ? '#F5C518' : 'rgba(255,255,255,0.2)'}`,
                  background: item.role === 'user' ? 'rgba(245,197,24,0.08)' : 'rgba(255,255,255,0.04)',
                  fontSize: 14,
                }}>{item.text}</div>
                <p style={{ fontSize: 11, opacity: 0.5, marginTop: 2, textAlign: item.role === 'user' ? 'right' : 'left' }}>
                  {(item.timestamp || new Date()).toLocaleTimeString()}
                </p>
              </div>
            ))}
            {aiTyping && (
              <div style={{ alignSelf: 'flex-start', fontSize: 13, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 6 }}>
                AI is negotiating
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F5C518', animation: 'pulseDot 1.2s infinite' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F5C518', animation: 'pulseDot 1.2s infinite 0.2s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F5C518', animation: 'pulseDot 1.2s infinite 0.4s' }} />
                </span>
              </div>
            )}
          </div>
          <div className="button-row" style={{ marginTop: 10 }}>
            <button className="btn-gold" onClick={createLoan} disabled={!terms || loading}>Accept</button>
            <button className="btn-outline" onClick={() => setChatInput('Counter offer: reduce the rate and extend the repayment grace period.')}>Counter offer</button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h2>Active loans</h2>
          {loading ? (
            <><SkeletonRow /><SkeletonRow /></>
          ) : loans.length === 0 ? (
            <EmptyState icon="💰" title="No active loans" subtitle="Negotiate terms above to create a loan." />
          ) : loans.map((loan, index) => (
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
      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
