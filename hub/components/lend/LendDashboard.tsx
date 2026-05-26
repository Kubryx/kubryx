// Built by vsrupeshkumar
'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts'
import { LENDORA_ACCENT, FALLBACK_LEND_STATS, FALLBACK_MY_POSITIONS, FALLBACK_RATE_HISTORY, FALLBACK_AI_ACTIVITY } from '@/lib/lend-fallbacks'
import { useKubrykPlatform } from '@/context/KubrykPlatformContext'
import { getCreditTier } from '@/lib/platform/scoring'

const A = LENDORA_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD = '#111111'
const MUTED = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

const healthColor = (h: number) => h >= 2 ? '#10b981' : h >= 1.2 ? '#f59e0b' : '#ef4444'

export default function LendDashboard({ onGoToBorrow, onGoToLoans }: { onGoToBorrow?: () => void; onGoToLoans?: () => void }) {
  const m = FALLBACK_MY_POSITIONS
  const platform = useKubrykPlatform()
  const tier = getCreditTier(platform.creditScore)
  const liveScore = platform.creditScore
  const TIER_RATES: Record<string, number> = { Platinum: 4.2, Gold: 6.8, Silver: 9.5, Bronze: 13.2, Unrated: 18.9 }
  const customRate = TIER_RATES[tier.name] ?? 18.9
  const liveRate = `${customRate.toFixed(1)}% APR`
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Credit Passport integration banner */}
      <div style={{ background: `linear-gradient(135deg, ${tier.bg}, rgba(0,229,204,0.03))`, border: `1px solid ${tier.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: tier.color, fontFamily: MONO }}>{tier.name.toUpperCase()} TIER</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: MONO }}>{liveScore !== null ? `${liveScore}/1000` : '—'}</span>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 11, color: MUTED, flex: 1 }}>Borrow rate: <span style={{ color: tier.color, fontWeight: 700 }}>{liveRate}</span> · Vault LTV: <span style={{ color: tier.color, fontWeight: 700 }}>{tier.vaultLTV}%</span></span>
        {liveScore === null && <span style={{ fontSize: 10, color: MUTED2 }}>Connect Credit Passport to see your rate</span>}
        <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 999, background: platform.isDemoMode ? 'rgba(107,114,128,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${platform.isDemoMode ? 'rgba(107,114,128,0.3)' : 'rgba(16,185,129,0.3)'}`, color: platform.isDemoMode ? '#9CA3AF' : '#10b981', fontWeight: 600, fontFamily: MONO }}>
          {platform.isDemoMode ? '◎ Demo · Connect wallet for live data' : '⬤ Live · Wallet Connected'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {FALLBACK_LEND_STATS.map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.kind === 'up' ? '#10b981' : '#ef4444', marginTop: 8 }}>
              {s.kind === 'up' ? '↑ ' : '↓ '}{s.change}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>Rate History</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>30 days · supply vs borrow</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={FALLBACK_RATE_HISTORY}>
              <defs>
                <linearGradient id="sup" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A} stopOpacity={0.3} /><stop offset="95%" stopColor={A} stopOpacity={0} /></linearGradient>
                <linearGradient id="bor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: MUTED2, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: MUTED2, fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ background: '#080808', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="supplyAPY" name="Supply APY" stroke={A} fill="url(#sup)" strokeWidth={2} />
              <Area type="monotone" dataKey="borrowAPR" name="Borrow APR" stroke="#ef4444" fill="url(#bor)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: CARD, border: `1px solid ${A}40`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 14 }}>My Positions</div>
          <Row label="Borrowed" value={`${m.borrowed} @ avg 4.2%`} />
          <Row label="Supplied" value={`${m.supplied} @ avg 9.4%`} />
          <Row label="Net APY"  value={m.netAPY} color="#10b981" />
          <Row label="Health"   value={`${m.healthFactor} Safe`} color={healthColor(m.healthFactor)} />
          <Row label="Credit Score" value={liveScore !== null ? `${liveScore} / 1000` : `${m.creditScore} / 1000`} color={tier.color} />
          <Row label="Your Borrow Rate" value={liveScore !== null ? liveRate : '—'} color={tier.color} />
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={onGoToLoans} style={btn(A, true)}>Manage Loans</button>
            <button onClick={onGoToBorrow} style={btn(A, false)}>Borrow</button>
          </div>
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 12 }}>🤖 AI Negotiation Activity</div>
        {FALLBACK_AI_ACTIVITY.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < FALLBACK_AI_ACTIVITY.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span style={{ flex: 1, fontSize: 13, color: '#fff' }}>{a.detail}</span>
            <span style={{ fontSize: 11, color: MUTED2, fontFamily: MONO }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 13, color: color || '#fff', fontWeight: 700, fontFamily: MONO }}>{value}</span>
    </div>
  )
}

function btn(c: string, primary: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '8px 12px', borderRadius: 8,
    background: primary ? c : 'transparent', border: `1px solid ${primary ? c : BORDER}`,
    color: primary ? '#fff' : MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer',
  }
}
