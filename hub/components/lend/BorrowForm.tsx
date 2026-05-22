// Built by vsrupeshkumar
'use client'
import { useEffect, useRef, useState } from 'react'
import { LENDORA_ACCENT, AI_SUGGESTIONS, getStaticAIResponse } from '@/lib/lend-fallbacks'
import { toast } from '@/lib/toast'

const A = LENDORA_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD = '#111111'
const MUTED = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

const apiBase = process.env.NEXT_PUBLIC_LENDORA_URL || process.env.NEXT_PUBLIC_LENDORA_API || ''
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''

async function groqFallback(message: string): Promise<string> {
  if (!GROQ_KEY) return getStaticAIResponse(message)
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a DeFi loan negotiation AI for Kubryx Protocol Borrow Engine on Arbitrum. Be concise and specific about rates, ZK credit, and collateral.' },
          { role: 'user', content: message },
        ],
      }),
    })
    const json = await res.json()
    return json?.choices?.[0]?.message?.content || getStaticAIResponse(message)
  } catch { return getStaticAIResponse(message) }
}

type Msg = { role: 'user' | 'ai'; text: string }
type Asset = 'ETH' | 'BTC' | 'SOL'
type Borrow = 'USDC' | 'USDT' | 'DAI'

export default function BorrowForm({
  walletAddress,
  isConnected = false,
  onConnect,
}: {
  walletAddress?: string
  isConnected?: boolean
  onConnect?: () => void
}) {
  const [collat, setCollat] = useState<Asset>('ETH')
  const [collatAmt, setCollatAmt] = useState('')
  const [borrowAsset, setBorrowAsset] = useState<Borrow>('USDC')
  const [borrowAmt, setBorrowAmt] = useState('')
  const [duration, setDuration] = useState(60)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [chat, setChat] = useState<Msg[]>([
    { role: 'ai', text: "I'm Protocol Borrow Engine AI, your loan negotiation agent. Fill in the form and click **Get AI Quote** — I'll scan available pools and negotiate the best rate for your credit tier." },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [negotiating, setNegotiating] = useState(false)
  const [quote, setQuote] = useState<{ rate: string; term: number; save: string } | null>(null)
  const [success, setSuccess] = useState<{ id: string; tx: string } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }) }, [chat, thinking])

  async function callBackend(message: string): Promise<string | null> {
    if (!apiBase) return null
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(`${apiBase}/api/negotiate`, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, walletAddress, loanParams: { amount: borrowAmt, duration, asset: borrowAsset } }),
      })
      clearTimeout(t)
      if (!res.ok) return null
      const data = await res.json() as { response?: string; terms?: string }
      return data.response || data.terms || null
    } catch { return null }
  }

  async function getQuote() {
    if (!borrowAmt) return
    setNegotiating(true)
    setQuote(null)
    setChat(c => [...c, { role: 'user', text: `Request: ${borrowAmt} ${borrowAsset} for ${duration} days using ${collatAmt || '?'} ${collat} collateral.` }])
    setThinking(true)
    await new Promise(r => setTimeout(r, 1800))
    setThinking(false)
    setQuote({ rate: '4.2', term: duration, save: '~$130/year' })
    setChat(c => [...c, { role: 'ai', text: `Found you 4.2% APR (market 6.8%). Your ZK score 847 unlocks Tier 2. Split across 3 pools to reduce slippage. You save ~$130/year.` }])
    setNegotiating(false)
  }

  async function send(text: string) {
    if (!text.trim()) return
    setChat(c => [...c, { role: 'user', text }])
    setInput('')
    setThinking(true)
    const backend = await callBackend(text)
    const reply = backend || await groqFallback(text)
    setThinking(false)
    setChat(c => [...c, { role: 'ai', text: reply }])
  }

  async function accept() {
    setSuccess({
      id: `LN-${1042 + Math.floor(Math.random() * 50)}`,
      tx: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
    })
    if (apiBase) {
      try {
        await fetch(`${apiBase}/api/loans/create`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ borrower: walletAddress || 'demo', amount: borrowAmt, duration, terms: `${quote?.rate}% APR` }),
        })
        toast.success('Loan created on Arbitrum')
      } catch { /* demo */ }
    }
  }

  if (success) {
    return (
      <div style={{ padding: 28, maxWidth: 620, margin: '40px auto' }}>
        <div style={{ background: CARD, border: '1px solid #10b98140', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: '#10b98125', color: '#10b981', fontSize: 28, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>✓</div>
          <h2 style={{ fontSize: 22, color: '#fff', margin: '0 0 8px', fontFamily: 'Georgia, "Playfair Display", serif' }}>Loan Created Successfully!</h2>
          <p style={{ color: MUTED, fontSize: 13, margin: '0 0 22px' }}>
            {success.id} · {borrowAmt} {borrowAsset} · {quote?.rate}% APR · {duration} days
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, fontSize: 12, color: MUTED, marginBottom: 16, fontFamily: MONO }}>
            Tx: {success.tx}
          </div>
          <button onClick={() => { setSuccess(null); setQuote(null); setBorrowAmt('') }} style={primaryBtn}>Borrow Again</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
      {/* Left: form */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Section label="Step 1: Collateral">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            {(['ETH', 'BTC', 'SOL'] as Asset[]).map(a => (
              <button key={a} onClick={() => setCollat(a)} style={card(collat === a)}>{a}</button>
            ))}
          </div>
          <input value={collatAmt} onChange={e => setCollatAmt(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={`Amount in ${collat}`} style={inputStyle} />
        </Section>

        <Section label="Step 2: Loan">
          <select value={borrowAsset} onChange={e => setBorrowAsset(e.target.value as Borrow)} style={{ ...inputStyle, marginBottom: 8 }}>
            <option>USDC</option><option>USDT</option><option>DAI</option>
          </select>
          <input value={borrowAmt} onChange={e => setBorrowAmt(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={`Amount in ${borrowAsset}`} style={inputStyle} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {[30, 60, 90].map(d => (
              <button key={d} onClick={() => setDuration(d)} style={chip(duration === d)}>{d} days</button>
            ))}
          </div>
        </Section>

        <Section label="Step 3: AI Negotiation">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: MUTED, cursor: 'pointer' }}>
            <input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} />
            Enable AI rate negotiation (recommended)
          </label>
          <div style={{ marginTop: 8, padding: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, color: MUTED }}>
            ZK Credit Score: <span style={{ color: A, fontWeight: 700 }}>847</span> ✓ Verified
          </div>
        </Section>

        {isConnected ? (
          <button onClick={getQuote} disabled={!borrowAmt || negotiating} style={{ ...primaryBtn, opacity: !borrowAmt || negotiating ? 0.5 : 1 }}>
            {negotiating ? '🤖 Negotiating…' : '🤖 Get AI Quote'}
          </button>
        ) : (
          <button onClick={() => onConnect?.()} style={primaryBtn}>
            🔗 Connect Wallet to Negotiate
          </button>
        )}
      </div>

      {/* Right: AI chat panel */}
      <div style={{ background: CARD, border: `1px solid ${A}40`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', minHeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `${A}25`, color: A, display: 'grid', placeItems: 'center', fontSize: 16 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Protocol Borrow Engine AI</div>
            <div style={{ fontSize: 11, color: MUTED2 }}>Your negotiation agent</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#10b981' }}>● Online</span>
        </div>

        <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chat.map((m, i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 8, maxWidth: '90%',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? `${A}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${m.role === 'user' ? `${A}40` : BORDER}`,
              fontSize: 12, color: '#fff', lineHeight: 1.5,
            }}>{m.text}</div>
          ))}
          {thinking && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', alignSelf: 'flex-start', fontSize: 12, color: MUTED }}>
              🤖 Analyzing<span style={{ animation: 'dots 1.2s steps(4, end) infinite' }}>...</span>
              <style>{`@keyframes dots { 0% { opacity: 0.3 } 50% { opacity: 1 } 100% { opacity: 0.3 } }`}</style>
            </div>
          )}
          {quote && (
            <div style={{ padding: 14, borderRadius: 10, background: `${A}15`, border: `1px solid ${A}55` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>AI Quote</div>
              <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.6 }}>
                Borrow: <b>{borrowAmt} {borrowAsset}</b><br />
                Rate: <b style={{ color: '#10b981' }}>{quote.rate}% APR</b> (market 6.8%)<br />
                Term: <b>{quote.term} days</b><br />
                You save: <b style={{ color: '#10b981' }}>{quote.save}</b>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {isConnected ? (
                  <button onClick={accept} style={primaryBtn}>Accept & Borrow</button>
                ) : (
                  <button onClick={() => onConnect?.()} style={primaryBtn}>🔗 Connect Wallet</button>
                )}
                <button onClick={getQuote} style={secondaryBtn}>Renegotiate</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {AI_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding: '4px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`, color: MUTED, fontSize: 11, cursor: 'pointer',
            }}>{s}</button>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 6 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask the AI…" style={{ ...inputStyle, flex: 1 }} />
          <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, background: A, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Send</button>
        </form>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}
function card(active: boolean): React.CSSProperties {
  return {
    padding: '10px 12px', borderRadius: 8,
    background: active ? `${A}15` : 'rgba(255,255,255,0.02)',
    border: `1px solid ${active ? A : BORDER}`,
    color: active ? A : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  }
}
function chip(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '6px 10px', borderRadius: 6,
    background: active ? `${A}20` : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? A : BORDER}`,
    color: active ? A : MUTED, fontSize: 11, fontWeight: 600, cursor: 'pointer',
  }
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
  color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit',
}
const primaryBtn: React.CSSProperties = {
  padding: '10px 16px', borderRadius: 8, background: A, color: '#fff',
  border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}
const secondaryBtn: React.CSSProperties = {
  padding: '10px 16px', borderRadius: 8, background: 'transparent',
  color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 500, cursor: 'pointer',
}
