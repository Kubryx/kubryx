// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  sendChat,
  fetchScoreBreakdown,
  type NcChatResponse,
} from '../../../lib/neurocredit-api'
import { getRating, fallbackBreakdown, CHAT_GREETING } from '../../../lib/neurocredit-fallbacks'
import {
  isMetaMaskInstalled,
  truncateAddress,
  WALLET_INSTALL_LINKS,
} from '../../../lib/wallet-utils'
import { toast } from '../../../lib/toast'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { useWallet } from '../../../context/WalletContext'
import { ConnectButton } from '../../../components/wallet/ConnectButton'

// ─── Gauge math ───────────────────────────────────────────────
const GAUGE_R = 56
const GAUGE_CX = 64
const GAUGE_CY = 64
const GAUGE_CIRC = 2 * Math.PI * GAUGE_R
const GAUGE_ARC = GAUGE_CIRC * 0.75

// ─── Style helpers ────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '20px 22px',
}

const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #8B5CF6, #3B5BFA)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
}

type ChatMsg = { role: 'user' | 'ai'; content: string; ts: Date }

function MiniGauge({ score }: { score: number }) {
  const [animLen, setAnimLen] = useState(0)
  const activeLen = Math.max(0, Math.min((score / 1000) * GAUGE_ARC, GAUGE_ARC))

  useEffect(() => {
    const t = setTimeout(() => setAnimLen(activeLen), 150)
    return () => clearTimeout(t)
  }, [activeLen])

  const { label, color } = getRating(score)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
        <svg viewBox="0 0 128 128" width={128} height={128}>
          <defs>
            <linearGradient id="miniGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B5BFA" />
            </linearGradient>
          </defs>
          <circle
            cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
            fill="none" stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
            strokeDasharray={`${GAUGE_ARC} 999`}
            strokeLinecap="round"
            transform={`rotate(135 ${GAUGE_CX} ${GAUGE_CY})`}
          />
          <circle
            cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
            fill="none" stroke="url(#miniGaugeGrad)"
            strokeWidth={10}
            strokeDasharray={`${animLen} 999`}
            strokeLinecap="round"
            transform={`rotate(135 ${GAUGE_CX} ${GAUGE_CY})`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1 }}>{score}</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', margin: '1px 0 0' }}>/ 1000</p>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 6px', fontWeight: 700, letterSpacing: '0.07em' }}>
          CREDIT SCORE
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 16,
            background: `${color}18`,
            border: `1px solid ${color}40`,
            marginBottom: 8,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Score retrieved from blockchain</p>
      </div>
    </div>
  )
}

export default function LendPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const { disconnectEVM } = useWallet()
  const wallet = address ?? ''
  const [score, setScore] = useState(650)
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [convId, setConvId] = useState<string | undefined>(undefined)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])

  useEffect(() => {
    addAIMsg(CHAT_GREETING)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load the score breakdown whenever a wallet is connected.
  useEffect(() => {
    if (wallet) fetchScoreBreakdown(wallet).then((bd) => setScore(bd.score)).catch(() => {})
  }, [wallet])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  function addAIMsg(content: string) {
    setMsgs((prev) => [...prev, { role: 'ai', content, ts: new Date() }])
  }

  function disconnectWallet() {
    disconnectEVM()
    setScore(650)
    setMsgs([])
    setConvId(undefined)
    addAIMsg(CHAT_GREETING)
    toast.success('Wallet disconnected')
  }

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setMsgs((prev) => [...prev, { role: 'user', content: text, ts: new Date() }])
    setInput('')
    setSending(true)
    const res: NcChatResponse = await sendChat(text, wallet || '0x0000', convId)
    if (res.conversationId) setConvId(res.conversationId)
    addAIMsg(res.reply)
    setSending(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#8B5CF6', marginBottom: 4 }}>
          AI LENDING
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Credit Passport: AI-Negotiated Lending</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
          Chat with AI to get personalized loan terms based on your Credit Passport score
        </p>
      </header>

      {/* No MetaMask */}
      {!installed && (
        <div style={{ ...card, textAlign: 'center', marginBottom: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>MetaMask is required for wallet-linked loans.</p>
          <a href={WALLET_INSTALL_LINKS.metamask} target="_blank" rel="noopener noreferrer"
            style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-flex' }}>
            Install MetaMask
          </a>
        </div>
      )}

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,320px) 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: Score + wallet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <MiniGauge score={score} />
          </div>

          {installed && !wallet ? (
            <div style={{ ...card, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                Connect wallet for personalized rates
              </p>
              <ConnectButton type="evm" size="lg" />
            </div>
          ) : wallet ? (
            <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                {truncateAddress(wallet)}
              </span>
              <button
                onClick={disconnectWallet}
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}
              >
                Disconnect
              </button>
            </div>
          ) : null}

          <div style={{ ...card, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>
              HOW IT WORKS
            </p>
            {[
              'Ask about any loan amount',
              'AI references your on-chain score',
              'Get tailored interest rates',
              'Accept terms directly on-chain',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#A78BFA',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat */}
        <div
          style={{
            ...card,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 520,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #3B5BFA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🧠
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Credit Passport AI Assistant</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22C55E',
                    boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 11, color: '#22C55E' }}>Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: 300,
            }}
            className="hide-scrollbar"
          >
            {msgs.length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40 }}>
                Starting conversation…
              </p>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideIn 0.2s ease-out',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background:
                      m.role === 'user'
                        ? 'rgba(139,92,246,0.15)'
                        : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: m.role === 'user' ? '#E9D5FF' : 'rgba(255,255,255,0.85)',
                  }}
                >
                  {m.content}
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '4px 4px 0' }}>
                  {m.ts.toLocaleTimeString()}
                </p>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px 14px 14px 4px',
                    padding: '10px 16px',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  {[0, 0.15, 0.3].map((d, i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.4)',
                        animation: `bounce 0.9s ease-in-out ${d}s infinite`,
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '14px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: 10,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message… (Enter to send)"
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
              }}
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              style={{
                ...btnPrimary,
                opacity: sending || !input.trim() ? 0.5 : 1,
                padding: '10px 16px',
              }}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media (max-width: 700px) {
          main > div[style] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
