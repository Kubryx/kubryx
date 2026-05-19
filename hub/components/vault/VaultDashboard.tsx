'use client'

import {
  CIPHERVAULT_ACCENT,
  FALLBACK_VAULT_STATS,
  FALLBACK_CHAIN_BREAKDOWN,
  FALLBACK_MY_POSITIONS,
  FALLBACK_RECENT_ACTIVITY,
} from '@/lib/vault-fallbacks'

const ACCENT = CIPHERVAULT_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

function fmtUsd(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function VaultDashboard({
  walletAddress,
  privacyScore,
  onGoToCollateral,
  onGoToHistory,
}: {
  walletAddress?: string
  privacyScore?: number
  onGoToCollateral?: () => void
  onGoToHistory?: () => void
}) {
  const totalValue = FALLBACK_MY_POSITIONS.reduce((s, p) => s + p.value, 0)
  const availableToBorrow = Math.floor(totalValue * 0.667)
  const healthFactor = 2.48

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {FALLBACK_VAULT_STATS.map(s => (
          <div key={s.label} style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.changeKind === 'up' ? '#10b981' : s.changeKind === 'down' ? '#ef4444' : MUTED, marginTop: 8 }}>
              {s.changeKind === 'up' ? '↑ ' : s.changeKind === 'down' ? '↓ ' : '✓ '}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Chain breakdown + My vault */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 16,
      }}>
        {/* Chain breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Vault Overview
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Chain breakdown
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FALLBACK_CHAIN_BREAKDOWN.map(c => (
              <div key={c.symbol}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: `${c.color}25`, color: c.color,
                      display: 'grid', placeItems: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>{c.symbol[0]}</span>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{c.chain}</span>
                    <span style={{ fontSize: 11, color: MUTED2, fontFamily: MONO }}>{c.symbol}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#fff', fontWeight: 700, fontFamily: MONO }}>{c.value}</span>
                    <span style={{ fontSize: 11, color: MUTED2 }}>{c.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${c.pct}%`, height: '100%',
                    background: c.color, borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My vault summary */}
        <div style={{
          background: CARD,
          border: `1px solid ${ACCENT}40`,
          borderRadius: 12,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
                My Vault
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2, fontFamily: MONO }}>
                {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : 'Not connected'}
              </div>
            </div>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${ACCENT}25`, color: ACCENT,
              display: 'grid', placeItems: 'center', fontSize: 14,
            }}>◈</span>
          </div>

          <SummaryRow label="Collateral Deposited" value={fmtUsd(totalValue)} accent />
          <div style={{ fontSize: 11, color: MUTED2, marginBottom: 12, marginTop: -4, paddingLeft: 2 }}>
            {FALLBACK_MY_POSITIONS.map(p => `${p.amount} ${p.asset}`).join('  ·  ')}
          </div>
          <SummaryRow label="Available to Borrow" value={`${fmtUsd(availableToBorrow)} (LTV 66.6%)`} />
          <SummaryRow label="Outstanding Loans" value="$0" />
          <SummaryRow label="Health Factor" value={`${healthFactor.toFixed(2)} (Safe)`} color="#10b981" />
          {privacyScore !== undefined && (
            <SummaryRow label="Privacy Score" value={`${privacyScore} / 100`} color={ACCENT} />
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button onClick={onGoToCollateral} style={pillBtn(ACCENT, true)}>Deposit More</button>
            <button onClick={onGoToCollateral} style={pillBtn(ACCENT, false)}>Withdraw</button>
            <button onClick={onGoToHistory} style={pillBtn(ACCENT, false)}>History</button>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Recent Activity
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Across the vault
            </div>
          </div>
          <button onClick={onGoToHistory} style={{
            background: 'transparent', border: 'none',
            color: ACCENT, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            View all →
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FALLBACK_RECENT_ACTIVITY.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0',
              borderBottom: i < FALLBACK_RECENT_ACTIVITY.length - 1 ? `1px solid ${BORDER}` : 'none',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${a.color}20`, color: a.color,
                display: 'grid', placeItems: 'center',
                fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>{a.icon}</span>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, minWidth: 90 }}>{a.protocol}</span>
              <span style={{ flex: 1, fontSize: 12, color: MUTED }}>{a.detail}</span>
              <span style={{ fontSize: 11, color: MUTED2, fontFamily: MONO }}>{a.address}</span>
              <span style={{ fontSize: 11, color: MUTED2, minWidth: 64, textAlign: 'right' }}>{a.time}</span>
              <span style={{ color: '#10b981', fontSize: 12 }}>✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, accent, color }: { label: string; value: string; accent?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: MUTED }}>{label}</span>
      <span style={{ fontSize: accent ? 16 : 13, fontWeight: 700, color: color || '#fff', fontFamily: MONO }}>{value}</span>
    </div>
  )
}

function pillBtn(c: string, primary: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 12px', borderRadius: 8,
    background: primary ? c : 'transparent',
    border: `1px solid ${primary ? c : BORDER}`,
    color: primary ? '#fff' : MUTED,
    fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  }
}
