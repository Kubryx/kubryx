// Built by vsrupeshkumar
'use client'
import { useState } from 'react'
import { LENDORA_ACCENT, FALLBACK_SUPPLY_POOLS } from '@/lib/lend-fallbacks'
import { simTx, type SimTx } from '@/lib/sim-tx'

const A = LENDORA_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD = '#111111'
const MUTED = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

export default function LendForm({ walletAddress, prefillAsset }: { walletAddress?: string; prefillAsset?: string }) {
  const [asset, setAsset] = useState(prefillAsset || 'USDC')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ amount: string; asset: string; apy: string; tx: SimTx } | null>(null)

  const pool = FALLBACK_SUPPLY_POOLS.find(p => p.asset === asset) || FALLBACK_SUPPLY_POOLS[0]
  const amountNum = Number(amount) || 0
  const apyNum = parseFloat(pool.apy)
  const annual = amountNum * apyNum / 100
  const monthly = annual / 12

  async function simulate() {
    if (!amount) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSuccess({ amount, asset, apy: pool.apy, tx: simTx('arbitrum') })
    setSubmitting(false)
  }

  if (success) {
    return (
      <div style={{ padding: 28, maxWidth: 620, margin: '40px auto' }}>
        <div style={{ background: CARD, border: '1px solid #10b98140', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: '#10b98125', color: '#10b981', fontSize: 28, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>✓</div>
          <h2 style={{ fontSize: 22, color: '#fff', fontFamily: 'Georgia, "Playfair Display", serif' }}>Supply Successful</h2>
          <p style={{ color: MUTED, fontSize: 13, margin: '8px 0 22px' }}>
            Supplied <b>{success.amount} {success.asset}</b> · earning <b style={{ color: '#10b981' }}>{success.apy} APY</b>
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, fontSize: 12, color: MUTED, marginBottom: 16, fontFamily: MONO, textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Arbitrum Tx</div>
            <div style={{ wordBreak: 'break-all', color: '#fff' }}>{success.tx.hash}</div>
            <a href={success.tx.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              View on Arbiscan ↗
            </a>
          </div>
          <button onClick={() => { setSuccess(null); setAmount('') }} style={primaryBtn}>Supply More</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 10 }}>Supply Asset</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
          {FALLBACK_SUPPLY_POOLS.map(p => (
            <button key={p.asset} onClick={() => setAsset(p.asset)} style={{
              padding: 14, borderRadius: 10,
              background: asset === p.asset ? `${A}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${asset === p.asset ? A : BORDER}`,
              cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.asset}</div>
              <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, fontWeight: 700 }}>{p.apy} APY</div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Amount to Supply</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
          <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 18, fontFamily: MONO }} />
          <span style={{ fontSize: 13, color: MUTED, fontFamily: MONO }}>{asset}</span>
          <button onClick={() => setAmount('10000')} style={{ fontSize: 10, color: A, fontWeight: 700, background: `${A}15`, border: `1px solid ${A}40`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>MAX</button>
        </div>

        {amountNum > 0 && (
          <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: MUTED2, textTransform: 'uppercase', marginBottom: 4 }}>Supply Preview</div>
            <Row label="Annual Earnings"   value={`$${annual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="#10b981" />
            <Row label="Monthly Earnings"  value={`$${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
            <Row label="Pool Utilization"  value={`${pool.util}%`} color={pool.util > 80 ? '#ef4444' : pool.util > 60 ? '#f59e0b' : '#10b981'} />
            <Row label="Withdrawal"        value="Anytime (liquidity permitting)" />
            <Row label="Receive"           value={`${amountNum.toLocaleString()} a${asset}`} />
          </div>
        )}

        <button onClick={simulate} disabled={!amount || submitting} style={{ ...primaryBtn, marginTop: 16, opacity: !amount || submitting ? 0.5 : 1 }}>
          {submitting ? 'Submitting…' : walletAddress ? `Supply ${asset}` : 'Simulate Supply (Demo)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {FALLBACK_SUPPLY_POOLS.map(p => (
          <div key={p.asset} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>POOL-{p.asset[0]} ({p.asset})</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginTop: 6 }}>{p.apy}</div>
            <div style={{ fontSize: 11, color: MUTED2, marginTop: 4 }}>TVL: {p.tvl} · Util: {p.util}%</div>
            <button onClick={() => setAsset(p.asset)} style={{ marginTop: 10, padding: '6px 12px', borderRadius: 6, background: 'transparent', border: `1px solid ${A}40`, color: A, fontSize: 11, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Supply →</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: MUTED }}>{label}</span>
      <span style={{ color: color || '#fff', fontFamily: MONO }}>{value}</span>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  width: '100%', padding: '12px 18px', borderRadius: 8,
  background: A, color: '#fff', border: 'none',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
}
