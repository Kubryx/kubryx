// Built by vsrupeshkumar
'use client'

import { useState } from 'react'
import { CIPHERVAULT_ACCENT, FALLBACK_DWALLETS, type DWallet } from '@/lib/vault-fallbacks'

const ACCENT = CIPHERVAULT_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

const CHAIN_COLOR: Record<string, string> = {
  BTC: '#f7931a',
  ETH: '#627eea',
  SOL: '#9945ff',
}

function short(addr: string, head = 8, tail = 6) {
  return addr.length > head + tail + 1 ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : addr
}

export default function DWalletManager({ walletAddress }: { walletAddress?: string }) {
  const [wallets, setWallets] = useState<DWallet[]>(FALLBACK_DWALLETS)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const [chain, setChain] = useState<'BTC' | 'ETH' | 'SOL'>('BTC')
  const [mpc, setMpc] = useState<'2-of-3' | '3-of-5'>('2-of-3')
  const [label, setLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState<DWallet | null>(null)

  function copy(addr: string, id: number) {
    navigator.clipboard?.writeText(addr)
    setCopiedId(id)
    setTimeout(() => setCopiedId(c => (c === id ? null : c)), 1400)
  }

  async function simulateRegister() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1100))
    const newWallet: DWallet = {
      id: wallets.length + 1,
      chain,
      address: chain === 'BTC'
        ? `bc1q${Math.random().toString(36).slice(2, 38)}`
        : `0x${Math.random().toString(16).slice(2, 42)}`,
      mpcStatus: `${mpc} active`,
      balance: chain === 'BTC' ? '0.0 BTC' : chain === 'ETH' ? '0.0 ETH' : '0.0 SOL',
      value: '$0',
      createdAt: 'just now',
    }
    setRegistered(newWallet)
    setWallets(w => [...w, newWallet])
    setSubmitting(false)
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Info banner */}
      <div style={{
        background: `${ACCENT}10`,
        border: `1px solid ${ACCENT}30`,
        borderRadius: 12,
        padding: 18,
        display: 'flex',
        gap: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `${ACCENT}25`, color: ACCENT,
          display: 'grid', placeItems: 'center', fontSize: 16,
          flexShrink: 0,
        }}>ℹ</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>What is a dWallet?</div>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
            A dWallet is an MPC-secured wallet where the private key is split across multiple parties.
            No single party can sign alone — your assets stay private and safe.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16 }}>
        {/* My dWallets */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              My dWallets
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              {wallets.length} active
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wallets.map(w => (
              <div key={w.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: `${CHAIN_COLOR[w.chain]}25`,
                    color: CHAIN_COLOR[w.chain],
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>{w.chain[0]}</span>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>dWallet #{w.id}</span>
                  <span style={{ fontSize: 11, color: MUTED2 }}>· {w.chain}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981' }}>● {w.mpcStatus}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {short(w.address)}
                  </span>
                  <button onClick={() => copy(w.address, w.id)} style={{
                    fontSize: 10, color: copiedId === w.id ? '#10b981' : ACCENT,
                    background: `${(copiedId === w.id ? '#10b981' : ACCENT)}15`,
                    border: `1px solid ${(copiedId === w.id ? '#10b981' : ACCENT)}40`,
                    borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
                    fontWeight: 600,
                  }}>
                    {copiedId === w.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 15, color: '#fff', fontWeight: 700, fontFamily: MONO }}>{w.balance}</span>
                  <span style={{ fontSize: 12, color: MUTED }}>{w.value}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED2 }}>Created: {w.createdAt}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={pillBtn(ACCENT, true)}>Sign Transaction</button>
                  <button style={pillBtn(ACCENT, false)}>View on Explorer ↗</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Register New dWallet
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              MPC custody setup
            </div>
          </div>

          {registered ? (
            <div style={{
              padding: 18, background: '#10b98112', border: '1px solid #10b98140',
              borderRadius: 10, textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, color: '#10b981', marginBottom: 6 }}>✓</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                dWallet #{registered.id} registered
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{registered.chain} · {registered.mpcStatus}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: ACCENT, wordBreak: 'break-all', padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginTop: 8 }}>
                {short(registered.address, 12, 8)}
              </div>
              <button onClick={() => setRegistered(null)} style={{ ...primaryBtn, marginTop: 14 }}>Register Another</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Chain">
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['BTC', 'ETH', 'SOL'] as const).map(c => (
                    <button key={c} onClick={() => setChain(c)} style={{
                      flex: 1, padding: '8px 12px', borderRadius: 8,
                      background: chain === c ? `${CHAIN_COLOR[c]}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${chain === c ? CHAIN_COLOR[c] : BORDER}`,
                      color: chain === c ? CHAIN_COLOR[c] : MUTED,
                      fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="MPC Configuration">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(['2-of-3', '3-of-5'] as const).map(m => (
                    <button key={m} onClick={() => setMpc(m)} style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                      background: mpc === m ? `${ACCENT}10` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${mpc === m ? ACCENT : BORDER}`,
                      color: '#fff', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      <span style={{ fontWeight: 700, color: mpc === m ? ACCENT : '#fff' }}>{m}</span>
                      <span style={{ marginLeft: 8, color: MUTED2, fontSize: 11 }}>
                        {m === '2-of-3' ? '(Recommended)' : '(High Security)'}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Label (optional)">
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. Primary Trading"
                  style={inputStyle}
                />
              </Field>

              <button onClick={simulateRegister} disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.5 : 1 }}>
                {submitting
                  ? 'Generating MPC shares…'
                  : walletAddress ? 'Register dWallet' : 'Simulate Registration (Demo)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

function pillBtn(c: string, primary: boolean): React.CSSProperties {
  return {
    padding: '6px 12px', borderRadius: 6,
    background: primary ? c : 'transparent',
    border: `1px solid ${primary ? c : BORDER}`,
    color: primary ? '#fff' : MUTED,
    fontSize: 11, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${BORDER}`,
  color: '#fff', fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
}

const primaryBtn: React.CSSProperties = {
  padding: '12px 18px', borderRadius: 8,
  background: ACCENT, color: '#fff',
  border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
}
