// Built by vsrupeshkumar
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { fetchPortfolio, fetchAgentsAI } from '@/lib/palmflow-api'
import type { PFPortfolio, PFAgentAI } from '@/lib/palmflow-api'
import { PF_ACTIVITY_POOL } from '@/lib/palmflow-fallbacks'
import { useKubrykPlatform } from '@/context/KubrykPlatformContext'
import { getCreditTier } from '@/lib/platform/scoring'

const TEAL = '#00E5CC'
const BG = '#080810'
const CARD = 'rgba(255,255,255,0.03)'
const BDR = 'rgba(255,255,255,0.07)'
const MONO = '"JetBrains Mono","Fira Code",monospace'

type FeedItem = { id: string; agent: string; action: string; ts: string }
function nowTs() { return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }) }

function AddrCell({ addr }: { addr: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(addr).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }
  const short = addr.length > 20 ? `${addr.slice(0,8)}...${addr.slice(-6)}` : addr
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:MONO, fontSize:11, color:'rgba(255,255,255,0.5)' }}>
      {short}
      <button onClick={copy} style={{ background:'none', border:'none', cursor:'pointer', fontSize:10, color:copied ? TEAL : 'rgba(255,255,255,0.3)', padding:0 }}>
        {copied ? '✓' : '⎘'}
      </button>
    </span>
  )
}

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PFPortfolio | null>(null)
  const [agents, setAgents] = useState<PFAgentAI[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ticker, setTicker] = useState(1245678.90)
  const poolIdx = useRef(0)
  const platform = useKubrykPlatform()

  useEffect(() => {
    Promise.all([fetchPortfolio(), fetchAgentsAI()]).then(([p, a]) => {
      setPortfolio(p); setAgents(a); setLoading(false)
      setFeed(PF_ACTIVITY_POOL.slice(0, 5).map((x, i) => ({ ...x, id:`f${i}`, ts: nowTs() })))
      if (p?.totalValue) platform.setTreasury(p.totalValue)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ticker pulse */
  useEffect(() => {
    const id = setInterval(() => {
      setTicker(v => v + (Math.random() - 0.48) * 120)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  /* activity feed */
  useEffect(() => {
    const id = setInterval(() => {
      const item = PF_ACTIVITY_POOL[poolIdx.current % PF_ACTIVITY_POOL.length]
      poolIdx.current++
      setFeed(f => [{ ...item, id:`f${Date.now()}`, ts: nowTs() }, ...f.slice(0, 14)])
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const p = portfolio
  const kpis = [
    { label: 'Total Assets',      value: p ? `${p.assets.length}` : '—',              sub: 'different assets',   icon: '🗂️', color: TEAL },
    { label: 'Wallets',           value: p ? `${p.wallets}` : '—',                    sub: 'connected wallets',  icon: '👛',  color: '#A855F7' },
    { label: 'Monthly Payments',  value: p ? `$${p.monthlySent.toLocaleString()}` : '—', sub: 'this month',      icon: '📤', color: '#60A5FA' },
    { label: 'Gas Saved (AI)',    value: p ? `${p.gasSaved}%` : '—',                  sub: 'via AI routing',     icon: '⚡', color: '#22C55E' },
  ]

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '24px', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: TEAL, fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 4 }}>PALMFLOW AI / DASHBOARD</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Yield Operations Hub Dashboard</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Your organization's real-time financial overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { href: '/treasury/send',    label: '💸 Send',    color: '#22C55E' },
            { href: '/treasury/receive', label: '📥 Receive', color: '#60A5FA' },
            { href: '/treasury/swap',    label: '🔄 Swap',    color: '#A855F7' },
          ].map(b => (
            <Link key={b.href} href={b.href}>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${b.color}44`, background: `${b.color}0f`, color: b.color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {b.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Total Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.06), rgba(168,85,247,0.04))', border: `1px solid rgba(0,229,204,0.2)`, borderRadius: 16, padding: '28px 32px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>Total Yield Operations Hub Value</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: TEAL, fontFamily: MONO, letterSpacing: '-0.02em' }}>
            ${ticker.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 13, color: '#22C55E', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>↑ +{(p?.change24hPercent ?? 0).toFixed(1) || '5.2'}%</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>24h · +${(p?.change24h ?? 0).toLocaleString() || '61,574'}</span>
          </div>
        </div>
        <div style={{ fontSize: 48 }}>💰</div>
      </motion.div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: MONO }}>{loading ? '—' : k.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{k.sub}</div>
              </div>
              <span style={{ fontSize: 20 }}>{k.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Platform Identity — cross-module credit signal */}
      {(() => {
        const tier = getCreditTier(platform.creditScore)
        const signals = [
          platform.vaultActive     && { label: '🔐 Vault',   note: '+85 pts',        color: '#A855F7' },
          platform.stellarPayments && { label: '⭐ Stellar', note: `${platform.stellarPayments} txns`, color: '#F472B6' },
          platform.solanaSlot      && { label: '◎ Solana',  note: `slot #${platform.solanaSlot.toLocaleString()}`, color: '#9945FF' },
        ].filter(Boolean) as { label: string; note: string; color: string }[]
        return (
          <div style={{ background: `linear-gradient(135deg, ${tier.bg}, rgba(0,229,204,0.03))`, border: `1px solid ${tier.border}`, borderRadius: 12, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, fontFamily: MONO, letterSpacing: '0.05em' }}>
                {tier.name.toUpperCase()} TIER
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: MONO }}>
                {platform.creditScore !== null ? platform.creditScore : '—'}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/1000</span>
              </span>
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
              {signals.length ? signals.map(s => (
                <span key={s.label} style={{ fontSize: 10, padding: '2px 10px', borderRadius: 999, background: `${s.color}15`, border: `1px solid ${s.color}33`, color: s.color, fontFamily: MONO }}>
                  {s.label} · {s.note}
                </span>
              )) : <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Connect vault, Stellar & Solana to boost your credit score</span>}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: MONO }}>{tier.treasuryTier}</div>
            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 999, background: platform.isDemoMode ? 'rgba(107,114,128,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${platform.isDemoMode ? 'rgba(107,114,128,0.3)' : 'rgba(16,185,129,0.3)'}`, color: platform.isDemoMode ? '#9CA3AF' : '#10b981', fontWeight: 600, fontFamily: MONO }}>
              {platform.isDemoMode ? '◎ Demo · Connect wallet for live data' : '⬤ Live · Wallet Connected'}
            </span>
          </div>
        )
      })()}

      {/* Asset table + Agents panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

        {/* Asset Allocation */}
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Portfolio Breakdown</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BDR}` }}>
                  {['Asset', 'Amount', 'USD Value', 'Network', '% Portfolio', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(p?.assets || []).map(a => (
                  <tr key={a.symbol} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, display: 'inline-block' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: a.color, fontFamily: MONO }}>{a.symbol}</div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: MONO, color: 'rgba(255,255,255,0.8)' }}>{a.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', fontFamily: MONO, fontWeight: 600 }}>${a.usdValue.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{a.network}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', minWidth: 60 }}>
                          <div style={{ height: 4, borderRadius: 2, background: a.color, width: `${a.percentage}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: a.color, fontFamily: MONO, minWidth: 36 }}>{a.percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href="/treasury/swap">
                          <button style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid rgba(0,229,204,0.3)`, background: 'rgba(0,229,204,0.06)', color: TEAL, fontSize: 10, cursor: 'pointer' }}>Swap</button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={6} style={{ padding: '10px 8px', color: 'rgba(255,255,255,0.15)', fontFamily: MONO }}>Loading...</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Agents panel */}
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Active Agents</div>
            <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}>
              {agents.length} Online
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agents.map(a => (
              <div key={a.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, borderLeft: `3px solid ${a.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.status === 'online' ? '#22C55E' : '#EF4444', display: 'inline-block' }} />
                    <span style={{ fontSize: 9, color: a.status === 'online' ? '#22C55E' : '#EF4444' }}>{a.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{a.role}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{a.lastActivity}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 3, fontFamily: MONO }}>{a.operations.toLocaleString()} ops</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed + Live Ops */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Activity Feed */}
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, display: 'inline-block' }} />
            Real-Time Intelligence Feed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {feed.map(f => (
              <div key={f.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.015)', borderRadius: 6, borderLeft: `2px solid ${TEAL}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: TEAL, fontFamily: MONO }}>{f.agent}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{f.ts}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{f.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { href:'/treasury/send',       label:'💸 Send Payment', color:'#22C55E', desc:'Transfer funds to any address' },
              { href:'/treasury/receive',     label:'📥 Receive',      color:'#60A5FA', desc:'Create payment requests + QR' },
              { href:'/treasury/swap',        label:'🔄 Swap Assets',  color:'#A855F7', desc:'AI-optimized DEX routing' },
              { href:'/treasury/pnl',         label:'📈 P&L Tracker',  color:TEAL,      desc:'Unrealized & realized gains per asset' },
              { href:'/treasury/tax',         label:'🧾 Tax Report',   color:'#F59E0B', desc:'FIFO capital gains, short/long-term' },
              { href:'/treasury/analytics',   label:'📉 Analytics',    color:'#6366F1', desc:'Volume, flows & network breakdown' },
              { href:'/treasury/payroll',     label:'💰 Payroll',      color:'#10B981', desc:'Manage streaming payments' },
              { href:'/treasury/settings',    label:'⚙️ Settings',     color:'rgba(255,255,255,0.5)', desc:'Configure preferences' },
            ].map(a => (
              <Link key={a.href} href={a.href}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${BDR}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: a.color, marginBottom: 4 }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
