// Built by vsrupeshkumar
'use client'
import { useState } from 'react'
import { LENDORA_ACCENT, FALLBACK_LOANS, FALLBACK_SUPPLY, FALLBACK_MY_POSITIONS } from '@/lib/lend-fallbacks'

const A = LENDORA_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD = '#111111'
const MUTED = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

type Mode = 'borrow' | 'lend'
const healthColor = (h: number) => h >= 2 ? '#10b981' : h >= 1.2 ? '#f59e0b' : '#ef4444'

export default function LoanPortfolio({ isConnected = false }: { isConnected?: boolean }) {
  const [mode, setMode] = useState<Mode>('borrow')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Action buttons (repay / withdraw / claim) require a connected wallet.
  const gate = (s: React.CSSProperties): React.CSSProperties =>
    isConnected ? s : { ...s, opacity: 0.4, cursor: 'not-allowed' }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
        {(['borrow', 'lend'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 18px', borderRadius: 8,
            background: mode === m ? A : 'transparent', color: mode === m ? '#fff' : MUTED,
            border: 'none', fontSize: 13, fontWeight: mode === m ? 600 : 500,
            cursor: 'pointer', textTransform: 'capitalize',
          }}>{m === 'borrow' ? 'Borrowing' : 'Lending'}</button>
        ))}
      </div>

      {mode === 'borrow' ? (
        <>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>{['Loan ID', 'Asset', 'Amount', 'APR', 'Health', 'Due', 'Action'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {FALLBACK_LOANS.map(l => (
                  <>
                    <tr key={l.id} onClick={() => setExpanded(e => e === l.id ? null : l.id)} style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}>
                      <td style={{ ...td, fontFamily: MONO, color: A }}>{l.id}</td>
                      <td style={td}>{l.asset}</td>
                      <td style={{ ...td, fontFamily: MONO }}>{l.amount}</td>
                      <td style={{ ...td, color: '#10b981' }}>{l.apr} {l.aiNegotiated && <span style={{ fontSize: 10, color: A }}>🤖</span>}</td>
                      <td style={{ ...td, color: healthColor(l.health), fontFamily: MONO }}>{l.health}</td>
                      <td style={{ ...td, color: MUTED }}>{l.due}</td>
                      <td style={td}><button onClick={e => e.stopPropagation()} disabled={!isConnected} style={gate(smallBtn)}>Repay</button></td>
                    </tr>
                    {expanded === l.id && (
                      <tr key={`${l.id}-d`}>
                        <td colSpan={7} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            <Det label="Collateral" v={l.collateral} />
                            <Det label="LTV" v={`${l.ltv}% (Safe < 80%)`} />
                            <Det label="Liquidation Price" v={`${l.liqPrice} (current: ${l.currentPrice})`} />
                            <Det label="AI Negotiated" v={`Yes · Rate ${l.apr}`} />
                            <Det label="ZK Credit" v={l.zkProof} />
                            <Det label="Arbitrum Tx" v={l.tx} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 12 }}>Collateral Backing</div>
            {FALLBACK_MY_POSITIONS.collateral.map(c => (
              <div key={c.asset} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#fff' }}>{c.asset}: {c.amount} (${c.value.toLocaleString()})</span>
                  <span style={{ color: MUTED, fontFamily: MONO }}>LTV {c.ltv}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${c.ltv}%`, height: '100%', background: c.ltv < 60 ? '#10b981' : c.ltv < 80 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>
            ))}
            <button disabled={!isConnected} style={gate({ ...smallBtn, marginTop: 12 })}>+ Add Collateral</button>
          </div>
        </>
      ) : (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Pool', 'Asset', 'Supplied', 'APY', 'Earned', 'Started', 'Action'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {FALLBACK_SUPPLY.map(s => (
                <tr key={s.pool} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ ...td, fontFamily: MONO, color: A }}>{s.pool}</td>
                  <td style={td}>{s.asset}</td>
                  <td style={{ ...td, fontFamily: MONO }}>{s.supplied}</td>
                  <td style={{ ...td, color: '#10b981' }}>{s.apy}</td>
                  <td style={{ ...td, color: '#10b981', fontFamily: MONO }}>{s.earned}</td>
                  <td style={{ ...td, color: MUTED }}>{s.started}</td>
                  <td style={td}>
                    <button disabled={!isConnected} style={gate(smallBtn)}>Withdraw</button>
                    <button disabled={!isConnected} style={gate({ ...smallBtn, marginLeft: 6 })}>Claim</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} style={{ ...td, color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Unclaimed: $312</td>
                <td colSpan={2} style={{ ...td, textAlign: 'right' }}>
                  <button disabled={!isConnected} style={gate({ padding: '6px 14px', borderRadius: 6, background: A, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' })}>Claim All →</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Det({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#fff', fontFamily: MONO }}>{v}</div>
    </div>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', borderBottom: `1px solid ${BORDER}`,
  fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: MUTED2, background: 'rgba(255,255,255,0.02)',
}
const td: React.CSSProperties = { padding: '12px 16px', color: '#fff' }
const smallBtn: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 6, background: 'transparent',
  border: `1px solid ${BORDER}`, color: A, fontSize: 11, fontWeight: 600, cursor: 'pointer',
}
