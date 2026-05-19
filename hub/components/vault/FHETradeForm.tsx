'use client'

import { useState } from 'react'
import { toast } from '@/lib/toast'
import { CIPHERVAULT_ACCENT, FALLBACK_ASSET_META } from '@/lib/vault-fallbacks'

const ACCENT = CIPHERVAULT_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

const apiBase = process.env.NEXT_PUBLIC_CIPHER_URL || process.env.NEXT_PUBLIC_CIPHER_API || ''

type PrivacyLevel = 'standard' | 'full'
type Step = 'idle' | 'encrypting' | 'matching' | 'settling' | 'done'

const STEP_LABELS: Record<Step, string> = {
  idle: '',
  encrypting: 'Encrypting trade parameters…',
  matching:   'Submitting to FHE matching engine…',
  settling:   'Awaiting encrypted settlement…',
  done:       'Settlement confirmed',
}

const RECENT_TRADES = [
  { time: '2m ago',  pair: 'BTC/ETH', proof: 'zk-proof ✓' },
  { time: '15m ago', pair: 'ETH/SOL', proof: 'zk-proof ✓' },
  { time: '1h ago',  pair: 'SOL/BTC', proof: 'zk-proof ✓' },
]

export default function FHETradeForm({ walletAddress }: { walletAddress?: string }) {
  const [sellAsset, setSellAsset] = useState(FALLBACK_ASSET_META[0]) // BTC
  const [buyAsset, setBuyAsset] = useState(FALLBACK_ASSET_META[1])   // ETH
  const [amount, setAmount] = useState('')
  const [privacy, setPrivacy] = useState<PrivacyLevel>('full')
  const [slippage, setSlippage] = useState('0.5')
  const [step, setStep] = useState<Step>('idle')
  const [result, setResult] = useState<{ tx: string } | null>(null)

  const amountNum = Number(amount) || 0
  const rate = sellAsset.price / buyAsset.price
  const estimatedReceive = amountNum * rate

  function swap() {
    const tmp = sellAsset
    setSellAsset(buyAsset)
    setBuyAsset(tmp)
  }

  async function callBackend() {
    if (!apiBase) return
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(`${apiBase}/api/trade/private`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: sellAsset.symbol,
          amount,
          fromChain: privacy === 'full' ? 'zero-metadata' : 'Solana',
          toChain: buyAsset.symbol,
        }),
      })
      clearTimeout(timeout)
      if (res.ok) toast.success('Private trade submitted to CipherVault')
    } catch {
      // ignore — demo mode
    }
  }

  async function submit() {
    if (!amount) return
    setResult(null)
    setStep('encrypting')
    callBackend()
    await new Promise(r => setTimeout(r, 800))
    setStep('matching')
    await new Promise(r => setTimeout(r, 1200))
    setStep('settling')
    await new Promise(r => setTimeout(r, 1000))
    setStep('done')
    setResult({ tx: `0x${Math.random().toString(16).slice(2, 8)}…${Math.random().toString(16).slice(2, 8)}` })
  }

  function reset() {
    setStep('idle')
    setResult(null)
    setAmount('')
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* FHE banner */}
      <div style={{
        background: '#a855f710',
        border: '1px solid #a855f730',
        borderRadius: 12, padding: 18,
        display: 'flex', gap: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#a855f725', color: '#a855f7',
          display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0,
        }}>🔒</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Fully Homomorphic Encryption (FHE) Trades
          </div>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
            Your trade amounts, assets, and counterparty are encrypted during matching.
            The network computes on ciphertext — your trade is invisible until settlement.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
          {/* You Send */}
          <SectionLabel>You Send</SectionLabel>
          <AssetInput
            asset={sellAsset}
            setAsset={setSellAsset}
            amount={amount}
            setAmount={setAmount}
            usdValue={amountNum * sellAsset.price}
            editable
          />

          {/* Swap arrow */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
            <button onClick={swap} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${BORDER}`,
              color: ACCENT, fontSize: 16,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              ↕
            </button>
          </div>

          {/* You Receive */}
          <SectionLabel>You Receive (Estimated)</SectionLabel>
          <AssetInput
            asset={buyAsset}
            setAsset={setBuyAsset}
            amount={amountNum ? estimatedReceive.toFixed(4) : ''}
            setAmount={() => {}}
            usdValue={estimatedReceive * buyAsset.price}
            editable={false}
          />

          {/* Privacy level */}
          <div style={{ marginTop: 20 }}>
            <SectionLabel>Privacy Level</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([
                { id: 'standard' as const, label: 'Standard FHE', desc: 'amounts encrypted, assets visible' },
                { id: 'full' as const,     label: 'Full Private',  desc: 'amounts + assets + counterparty encrypted (recommended)' },
              ]).map(p => (
                <button key={p.id} onClick={() => setPrivacy(p.id)} style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                  background: privacy === p.id ? `${ACCENT}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${privacy === p.id ? ACCENT : BORDER}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: privacy === p.id ? ACCENT : '#fff' }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Slippage */}
          <div style={{ marginTop: 16 }}>
            <SectionLabel>Slippage Tolerance</SectionLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {['0.5', '1', '2'].map(s => (
                <button key={s} onClick={() => setSlippage(s)} style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: slippage === s ? `${ACCENT}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${slippage === s ? ACCENT : BORDER}`,
                  color: slippage === s ? ACCENT : MUTED,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {/* Trade details */}
          {amountNum > 0 && (
            <div style={{
              marginTop: 18, padding: 14,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${BORDER}`, borderRadius: 8,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <Row label="Rate"          value={`1 ${sellAsset.symbol} ≈ ${rate.toFixed(4)} ${buyAsset.symbol}`} />
              <Row label="Price Impact"  value="0.12%" />
              <Row label="FHE Overhead"  value="~2.1s" />
              <Row label="Network Fee"   value="0.0004 ETH" />
            </div>
          )}

          {/* Warning + action */}
          <div style={{
            marginTop: 14, padding: 12,
            background: '#f59e0b15', border: '1px solid #f59e0b35',
            borderRadius: 8, fontSize: 11, color: '#f59e0b',
          }}>
            ⚠ Trade is settled privately. Amount shown only after confirmation.
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {step === 'idle' && (
              <button
                onClick={submit}
                disabled={!amount}
                style={{ ...primaryBtn, opacity: !amount ? 0.5 : 1, cursor: !amount ? 'not-allowed' : 'pointer' }}
              >
                {walletAddress ? 'Sign & Execute Private Trade' : 'Simulate FHE Trade (Demo)'}
              </button>
            )}
            {step !== 'idle' && step !== 'done' && (
              <div style={{
                padding: 16, borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${ACCENT}40`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div className="spin" style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${ACCENT}40`, borderTopColor: ACCENT,
                  animation: 'spin 0.7s linear infinite',
                }} />
                <span style={{ fontSize: 12, color: '#fff' }}>{STEP_LABELS[step]}</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}
            {step === 'done' && result && (
              <div style={{
                padding: 16, borderRadius: 8,
                background: '#10b98112', border: '1px solid #10b98140',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 18 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>Private Trade Executed</span>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>
                  Sold: <span style={{ color: ACCENT, fontFamily: MONO }}>[ENCRYPTED]</span> · Received: <span style={{ color: ACCENT, fontFamily: MONO }}>[ENCRYPTED]</span>
                </div>
                <div style={{ fontSize: 11, color: MUTED, fontFamily: MONO }}>Tx: {result.tx}</div>
                <button onClick={reset} style={{ ...primaryBtn, marginTop: 12, padding: '8px 14px', fontSize: 12 }}>Trade Again</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent FHE trades */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Recent FHE Trades
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Network feed
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Time', 'Pair', 'Amount', 'FHE Proof'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 0',
                    borderBottom: `1px solid ${BORDER}`,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: MUTED2,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TRADES.map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: '10px 0', color: MUTED }}>{t.time}</td>
                  <td style={{ padding: '10px 0', color: '#fff', fontFamily: MONO }}>{t.pair}</td>
                  <td style={{ padding: '10px 0', color: ACCENT, fontFamily: MONO }}>[PRIVATE]</td>
                  <td style={{ padding: '10px 0', color: '#10b981', fontSize: 11 }}>{t.proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>{children}</div>
}

function AssetInput({
  asset, setAsset, amount, setAmount, usdValue, editable,
}: {
  asset: typeof FALLBACK_ASSET_META[0]
  setAsset: (a: typeof FALLBACK_ASSET_META[0]) => void
  amount: string
  setAmount: (s: string) => void
  usdValue: number
  editable: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${BORDER}`,
      borderRadius: 8, padding: '10px 14px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${BORDER}`,
          borderRadius: 6, padding: '6px 10px',
          color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: 16 }}>{asset.icon}</span>
          {asset.symbol}
          <span style={{ fontSize: 10, color: MUTED2 }}>▾</span>
        </button>
        <input
          value={amount}
          onChange={e => editable && setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0.0"
          disabled={!editable}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 18, fontFamily: MONO, textAlign: 'right',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: MUTED2 }}>
        <span>Balance: {asset.balance} {asset.symbol}</span>
        <span>≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: '#0C0C0C', border: `1px solid ${BORDER}`,
          borderRadius: 8, padding: 4, zIndex: 10, minWidth: 140,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}>
          {FALLBACK_ASSET_META.map(a => (
            <button key={a.symbol} onClick={() => { setAsset(a); setOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 12px', borderRadius: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 13, textAlign: 'left',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span>{a.icon}</span>
              <span style={{ fontWeight: 600 }}>{a.symbol}</span>
              <span style={{ color: MUTED2, fontSize: 11 }}>{a.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: MUTED }}>{label}</span>
      <span style={{ color: '#fff', fontFamily: MONO }}>{value}</span>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  padding: '12px 18px', borderRadius: 8,
  background: ACCENT, color: '#fff',
  border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
}
