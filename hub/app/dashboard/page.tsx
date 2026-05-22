// Built by vsrupeshkumar
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import {
  ACTIVITY_30D, ACTIVITY_7D, ACTIVITY_1D, ACTIVITY_ALL, DASH_STATS,
} from '@/lib/dashboard-fallbacks'
import type { ChartPoint } from '@/lib/dashboard-fallbacks'
import ActivityFeed from '@/components/ActivityFeed'
import ToolQuickAccess from '@/components/ToolQuickAccess'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { WrongNetworkBanner } from '@/components/wallet/WrongNetwork'

/* ── Theme ──────────────────────────────────────────── */
const BG      = '#0a0e27'
const SIDE    = '#0c1232'
const ACCENT  = '#6366f1'
const PINK    = '#ec4899'
const CYAN    = '#06b6d4'
const GREEN   = '#10b981'
const BORDER  = 'rgba(255,255,255,0.08)'
const MONO    = '"Fira Code","JetBrains Mono",monospace'
const MUTED   = 'rgba(255,255,255,0.6)'
const MUTED2  = 'rgba(255,255,255,0.35)'

/* ── Navigation items ───────────────────────────────── */
const NAV = [
  { icon: '◉', label: 'Overview',        href: '/dashboard' },
  { icon: '◈', label: 'Credit Passport', href: '/credit'    },
  { icon: '⬟', label: 'Family vault',    href: '/legacy'    },
  { icon: '⬡', label: 'Agent co-ordinator',      href: '/agents'    },
  { icon: '🔐', label: 'Private Vault',   href: '/vault'     },
  { icon: '◆', label: 'Bill split',       href: '/split'     },
  { icon: '◎', label: 'AI Lending',      href: '/lend'      },
  { icon: '◇', label: 'Yield Operations Hub',     href: '/treasury'  },
  { icon: '▲', label: 'Stealth Execution Suite',       href: '/shadow'    },
]

type TimeRange = '1D' | '7D' | '30D' | 'All'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

function chartDataForRange(range: TimeRange): ChartPoint[] {
  if (range === '1D')  return ACTIVITY_1D
  if (range === '7D')  return ACTIVITY_7D
  if (range === 'All') return ACTIVITY_ALL
  return ACTIVITY_30D
}

/* ── Sidebar ────────────────────────────────────────── */
function DashSidebar({
  mobileOpen, onMobileClose, wallet, onDisconnect, isMobile,
}: {
  mobileOpen: boolean
  onMobileClose: () => void
  wallet: string
  onDisconnect: () => void
  isMobile: boolean
}) {
  const pathname = usePathname()

  const transform = isMobile
    ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
    : 'translateX(0)'

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 49 }}
        />
      )}
      <aside style={{
        position: isMobile ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0,
        width: 250,
        background: SIDE,
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        flexShrink: 0,
        transform,
        transition: 'transform 0.22s ease',
        height: isMobile ? '100vh' : '100%',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '20px 16px 16px',
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`,
            display: 'grid', placeItems: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
          }}>K</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Kubryx</span>
        </div>

        {/* Nav items */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onMobileClose : undefined}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : MUTED,
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  if (!active) (e.currentTarget as HTMLElement).style.color = MUTED
                }}
              >
                <span style={{ width: 18, textAlign: 'center', fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Wallet card */}
        <div style={{ padding: 16 }}>
          <div style={{
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: 8,
            padding: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(139,92,246,0.85)', letterSpacing: '0.14em', marginBottom: 6 }}>
              WALLET
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: '#fff', marginBottom: 4 }}>
              {wallet
                ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
                : '0x9F3C…E3A1'}
            </div>
            <div style={{ fontSize: 11, color: MUTED2, marginBottom: 10 }}>
              QIE • Solana • Stellar • ETH
            </div>
            <button
              onClick={onDisconnect}
              style={{
                background: 'transparent', border: 'none',
                color: MUTED2, fontSize: 11, cursor: 'pointer', padding: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED2)}
            >
              Disconnect
            </button>
          </div>

          {/* Subtle footer glow */}
          <div style={{
            marginTop: 16,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)`,
          }} />
        </div>
      </aside>
    </>
  )
}

/* ── Stat card ──────────────────────────────────────── */
const STAT_CARDS = [
  { label: 'Active Tools',  value: DASH_STATS.tools.toString(),  sub: DASH_STATS.toolsSub,    bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.25)',  subColor: '#A5B4FC' },
  { label: 'Chains',        value: DASH_STATS.chains.toString(), sub: DASH_STATS.chainsSub,   bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.25)',   subColor: '#67E8F9' },
  { label: 'Mock Data',     value: DASH_STATS.mockData,          sub: DASH_STATS.mockDataSub, bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)',  subColor: '#6EE7B7' },
  { label: 'Uptime',        value: DASH_STATS.uptime,            sub: DASH_STATS.uptimeSub,   bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)',  subColor: '#FDBA74' },
]

function StatCard({ card }: { card: typeof STAT_CARDS[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? card.bg : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? card.border : BORDER}`,
        borderRadius: 10,
        padding: '16px 18px',
        transform: hov ? 'scale(1.025)' : 'scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED2, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
        {card.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
          {card.value}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: card.subColor }}>
          {card.sub}
        </span>
      </div>
    </div>
  )
}

/* ── Protocol Activity (chart + controls) ───────────── */
const TOOLTIP_STYLE = {
  contentStyle: { background: '#0f1430', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: MUTED2 },
  itemStyle: { color: '#fff' },
}

function ProtocolActivity() {
  const [range, setRange] = useState<TimeRange>('30D')
  const [data, setData] = useState<ChartPoint[]>(ACTIVITY_30D)
  const [mounted, setMounted] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  function changeRange(r: TimeRange) {
    setRange(r)
    setFadeKey(k => k + 1)
    setData(chartDataForRange(r))
  }

  return (
    <div style={{ margin: '24px', marginTop: 0 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED2 }}>
            Protocol Activity
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            Last {range === '1D' ? '24 hours' : range === '7D' ? '7 days' : range === '30D' ? '30 days' : 'all time'}
          </div>
        </div>
        {/* Time range buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['1D', '7D', '30D', 'All'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => changeRange(r)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${range === r ? ACCENT : BORDER}`,
                background: range === r ? `${ACCENT}25` : 'transparent',
                color: range === r ? '#fff' : MUTED2,
                fontSize: 12, fontWeight: range === r ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div key={fadeKey} style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: '20px 16px 12px',
        marginTop: 12,
        animation: 'fadein 0.3s ease',
      }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PINK} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={PINK} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CYAN} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: MUTED2, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: MUTED2, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}`}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="operations"
                name="Operations"
                stroke={PINK}
                strokeWidth={2}
                fill="url(#pinkGrad)"
                dot={false}
                activeDot={{ r: 4, fill: PINK }}
              />
              <Area
                type="monotone"
                dataKey="transactions"
                name="Transactions"
                stroke={CYAN}
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#cyanGrad)"
                dot={false}
                activeDot={{ r: 4, fill: CYAN }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED2, fontSize: 12 }}>
            Loading chart…
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 24, marginTop: 12, justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MUTED }}>
            <span style={{ width: 20, height: 2, background: PINK, display: 'inline-block' }} />
            Operations
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MUTED }}>
            <span style={{ width: 20, height: 2, background: CYAN, display: 'inline-block', borderTop: `2px dashed ${CYAN}` }} />
            Transactions
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Search ─────────────────────────────────────────── */
function SearchBar() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const results = q.trim()
    ? NAV.filter(n => n.label.toLowerCase().includes(q.toLowerCase()))
    : []

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${open ? 'rgba(99,102,241,0.5)' : BORDER}`,
        borderRadius: 8, padding: '7px 12px',
        transition: 'border-color 0.15s',
      }}>
        <span style={{ fontSize: 13, color: MUTED2 }}>🔍</span>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
          placeholder="search tools"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 13, width: 160,
          }}
        />
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#0f1430', border: `1px solid ${BORDER}`,
          borderRadius: 8, overflow: 'hidden', zIndex: 100,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          {results.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { setOpen(false); setQ('') }}
              style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', fontSize: 13, color: MUTED,
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                ;(e.currentTarget as HTMLElement).style.color = '#fff'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = MUTED
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main page ──────────────────────────────────────── */
export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [wallet, setWallet] = useState('0x9F3CE3A1')
  const [greeting] = useState(getGreeting)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function handleDisconnect() {
    setWallet('')
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: BG,
      color: '#fff',
      fontFamily: '"Inter",system-ui,sans-serif',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <DashSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        wallet={wallet}
        onDisconnect={handleDisconnect}
        isMobile={isMobile}
      />

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          flexShrink: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: `1px solid ${BORDER}`,
          background: BG,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          gap: 12,
        }}>
          {/* Left — mobile hamburger + greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(v => !v)} style={{
                background: 'none', border: `1px solid ${BORDER}`, color: MUTED,
                borderRadius: 8, width: 36, height: 36, display: 'grid', placeItems: 'center',
                cursor: 'pointer', fontSize: 16, flexShrink: 0,
              }}>☰</button>
            )}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED2, marginBottom: 2 }}>
                Overview
              </div>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {greeting}, Alex.
              </div>
            </div>
          </div>

          {/* Right — search + status + wallet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isMobile && <SearchBar />}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: `${GREEN}1a`, border: `1px solid ${GREEN}40`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: GREEN, whiteSpace: 'nowrap' }}>
                {isMobile ? 'Live' : 'All systems live'}
              </span>
            </div>
            <ConnectButton type="auto" size="sm" />
          </div>
        </header>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Wrong-network warning (dashboard expects QIE Mainnet) */}
          <WrongNetworkBanner />

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: 12,
            padding: '20px 24px 0',
          }}>
            {STAT_CARDS.map(card => <StatCard key={card.label} card={card} />)}
          </div>

          {/* Protocol activity chart */}
          <ProtocolActivity />

          {/* Live activity feed */}
          <ActivityFeed />

          {/* Tool quick-access grid */}
          <ToolQuickAccess />
        </div>
      </div>

      {/* Fade-in keyframe (inline) */}
      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  )
}
