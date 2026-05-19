'use client'

import { useMemo, useState } from 'react'
import {
  CIPHERVAULT_ACCENT,
  FALLBACK_ASSET_META,
  FALLBACK_MY_POSITIONS,
  type AssetMeta,
} from '@/lib/vault-fallbacks'

const ACCENT = CIPHERVAULT_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

type Mode = 'deposit' | 'withdraw'

function healthColor(ratio: number) {
  if (ratio >= 200) return '#10b981'
  if (ratio >= 120) return '#f59e0b'
  return '#ef4444'
}

export default function CollateralManager({ walletAddress }: { walletAddress?: string }) {
  const [mode, setMode] = useState<Mode>('deposit')
  const [selected, setSelected] = useState<AssetMeta>(FALLBACK_ASSET_META[1]) // ETH default
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<null | { amount: string; usd: number; tx: string }>(null)

  const amountNum = Number(amount) || 0
  const usdValue = amountNum * selected.price

  const totalCurrentUsd = FALLBACK_MY_POSITIONS.reduce((s, p) => s + p.value, 0)
  const ratioCurrent = 248
  const ratioAfter = useMemo(() => {
    if (!amountNum) return ratioCurrent
    const delta = mode === 'deposit' ? usdValue : -usdValue
    return Math.max(0, Math.round((totalCurrentUsd + delta) / totalCurrentUsd * ratioCurrent))
  }, [amountNum, mode, usdValue, totalCurrentUsd])

  const healthCurrent = ratioCurrent / 100
  const healthAfter = ratioAfter / 100

  async function simulate() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSuccess({
      amount: `${amount} ${selected.symbol}`,
      usd: usdValue,
      tx: `0x${Math.random().toString(16).slice(2, 8)}…${Math.random().toString(16).slice(2, 8)}`,
    })
    setSubmitting(false)
  }

  function reset() {
    setSuccess(null)
    setAmount('')
  }

  if (success) {
    return (
      <div style={{ padding: 28, maxWidth: 640, margin: '40px auto' }}>
        <div style={{
          background: CARD, border: `1px solid #10b98140`, borderRadius: 12, padding: 32, textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: '#10b98125', border: '1px solid #10b98155',
            color: '#10b981', fontSize: 28,
            display: 'grid', placeItems: 'center', margin: '0 auto 16px',
          }}>✓</div>
          <h2 style={{ fontSize: 22, color: '#fff', margin: '0 0 8px', fontFamily: 'Georgia, "Playfair Display", serif' }}>
            Collateral {mode === 'deposit' ? 'Deposited' : 'Withdrawn'}
          </h2>
          <p style={{ color: MUTED, fontSize: 13, margin: '0 0 22px' }}>
            {success.amount} · ${success.usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, marginBottom: 20, textAlign: 'left' }}>
            <DetailRow label="Vault Health" value={`${ratioAfter}%`} color={healthColor(ratioAfter)} />
            <DetailRow label="Transaction" value={success.tx} mono />
          </div>
          <button onClick={reset} style={primaryBtn}>Make Another Transaction</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mode toggle */}
      <div style={{
        display: 'inline-flex',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${BORDER}`,
        borderRadius: 10, padding: 4,
        alignSelf: 'flex-start',
      }}>
        {(['deposit', 'withdraw'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: mode === m ? ACCENT : 'transparent',
              color: mode === m ? '#fff' : MUTED,
              border: 'none', fontSize: 13,
              fontWeight: mode === m ? 600 : 500,
              cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Form */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
          {/* Asset cards */}
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 8 }}>Select Asset</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {FALLBACK_ASSET_META.map(asset => {
              const isSel = selected.symbol === asset.symbol
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelected(asset)}
                  style={{
                    background: isSel ? `${ACCENT}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSel ? ACCENT : BORDER}`,
                    borderRadius: 10, padding: 14,
                    cursor: 'pointer', transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, color: isSel ? ACCENT : '#fff' }}>{asset.icon}</span>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{asset.symbol}</span>
                  </div>
                  <div style={{ fontSize: 11, color: MUTED2, marginTop: 2 }}>{asset.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 6, fontFamily: MONO }}>
                    ${asset.price.toLocaleString()}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Amount */}
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>Amount</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: '10px 14px',
          }}>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.0"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 18, fontFamily: MONO,
              }}
            />
            <span style={{ fontSize: 13, color: MUTED, fontFamily: MONO }}>{selected.symbol}</span>
            <button
              onClick={() => setAmount(String(selected.balance))}
              style={{
                fontSize: 10, color: ACCENT, fontWeight: 700,
                background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`,
                borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
              }}
            >MAX</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED2, marginTop: 6 }}>
            <span>Balance: {selected.balance} {selected.symbol}</span>
            <span>≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>

          {/* Impact */}
          <div style={{
            marginTop: 18, padding: 14,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${BORDER}`, borderRadius: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED2, marginBottom: 8 }}>
              Collateral Impact
            </div>
            <ImpactRow label="Current Ratio"  current={`${ratioCurrent}%`} after={`${ratioAfter}%`} better={mode === 'deposit' ? ratioAfter > ratioCurrent : ratioAfter < ratioCurrent} />
            <ImpactRow label="Health Factor"  current={healthCurrent.toFixed(2)} after={healthAfter.toFixed(2)} color={healthColor(ratioAfter)} />
          </div>

          {/* Warning */}
          <div style={{
            marginTop: 14, padding: 12,
            background: '#f59e0b15', border: '1px solid #f59e0b35',
            borderRadius: 8, fontSize: 12, color: '#f59e0b',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            ⚠ {mode === 'deposit'
              ? 'Assets are locked in MPC custody. Withdrawal requires a 2-of-3 signature.'
              : 'Withdrawal will reduce your borrowing capacity. Ensure health factor stays above 1.2.'}
          </div>

          {/* Action */}
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={simulate}
              disabled={!amount || submitting}
              style={{ ...primaryBtn, opacity: !amount || submitting ? 0.5 : 1, cursor: !amount || submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? (mode === 'deposit' ? 'Encrypting transaction…' : 'Verifying MPC signature…') : (walletAddress ? `${mode === 'deposit' ? 'Deposit' : 'Withdraw'} ${selected.symbol}` : `Simulate ${mode === 'deposit' ? 'Deposit' : 'Withdraw'} (Demo)`)}
            </button>
          </div>
        </div>

        {/* My positions */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              My Positions
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Locked collateral
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Asset', 'Amount', 'Value', 'Status'].map(h => (
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
              {FALLBACK_MY_POSITIONS.map(p => (
                <tr key={p.asset} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: '12px 0', fontFamily: MONO, color: ACCENT }}>{p.asset}</td>
                  <td style={{ padding: '12px 0', color: '#fff' }}>{p.amount}</td>
                  <td style={{ padding: '12px 0', color: '#fff', fontFamily: MONO }}>${p.value.toLocaleString()}</td>
                  <td style={{ padding: '12px 0', color: '#10b981', fontSize: 11 }}>✓ Locked</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ padding: '14px 0', fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Total
                </td>
                <td style={{ padding: '14px 0', fontSize: 14, color: '#fff', fontFamily: MONO, fontWeight: 700 }}>
                  ${totalCurrentUsd.toLocaleString()}
                </td>
                <td style={{ padding: '14px 0', fontSize: 11, color: '#10b981' }}>LTV 66.6%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ImpactRow({ label, current, after, better, color }: { label: string; current: string; after: string; better?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
      <span style={{ fontSize: 12, color: MUTED }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 12 }}>
        <span style={{ color: MUTED2 }}>{current}</span>
        <span style={{ color: MUTED2 }}>→</span>
        <span style={{ color: color || (better ? '#10b981' : '#fff'), fontWeight: 700 }}>
          {after}
        </span>
      </span>
    </div>
  )
}

function DetailRow({ label, value, color, mono }: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 11, color: MUTED2 }}>{label}</span>
      <span style={{ fontSize: 12, color: color || '#fff', fontFamily: mono ? MONO : 'inherit', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  padding: '12px 18px', borderRadius: 8,
  background: ACCENT, color: '#fff',
  border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
}
