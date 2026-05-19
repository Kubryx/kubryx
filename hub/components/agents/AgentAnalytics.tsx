'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { fetchAnalytics } from '@/lib/trustmesh-api'
import { fallbackAnalytics, type AnalyticsResponse } from '@/lib/trustmesh-fallbacks'
import {
  TRUSTMESH_ACCENT,
  FALLBACK_VIOLATIONS,
  FALLBACK_LEADERS,
  FALLBACK_HOURLY_JOBS,
} from '@/lib/agents-fallbacks'

const ACCENT = TRUSTMESH_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

const STATUS_COLORS: Record<string, string> = {
  active:   '#10b981',
  complete: '#3b82f6',
  revoked:  '#ef4444',
  pending:  '#f59e0b',
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  warning:  '#f59e0b',
  info:     '#3b82f6',
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#080808', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 },
  labelStyle: { color: MUTED2 },
  itemStyle: { color: '#fff' },
}

export default function AgentAnalytics() {
  const [data, setData] = useState<AnalyticsResponse>(fallbackAnalytics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAnalytics().then(res => {
      if (cancelled) return
      setData(res.data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const pieData = [
    { name: 'Completed', value: data.jobStatusDist.complete, key: 'complete' },
    { name: 'Running',   value: data.jobStatusDist.active,   key: 'active' },
    { name: 'Failed',    value: data.jobStatusDist.revoked,  key: 'revoked' },
    { name: 'Pending',   value: data.jobStatusDist.pending,  key: 'pending' },
  ].filter(d => d.value > 0)

  const totalJobs = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {[
          { label: 'Total Jobs',           value: data.stats.totalJobs.toLocaleString(),         color: ACCENT },
          { label: 'Active Agents',        value: data.stats.activeAgents.toLocaleString(),      color: '#10b981' },
          { label: 'Messages Logged',      value: data.stats.messagesLogged.toLocaleString(),    color: '#3b82f6' },
          { label: 'Unauthorized Actions', value: data.stats.unauthorizedActions.toLocaleString(), color: '#ef4444' },
        ].map(m => (
          <div key={m.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              {m.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: m.color, marginTop: 6, letterSpacing: '-0.02em' }}>
              {loading ? '…' : m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Bar + Donut */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 16,
      }}>
        {/* Hourly throughput bar chart */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Job Throughput
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Last 24 hours · hourly
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={FALLBACK_HOURLY_JOBS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: MUTED2, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: MUTED2, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="jobs" fill={ACCENT} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Status Mix
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Distribution
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value" nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={56} outerRadius={88}
                  stroke="rgba(0,0,0,0.4)"
                  isAnimationActive={false}
                >
                  {pieData.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLORS[s.key]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: MUTED }}
                  formatter={(v: string) => <span style={{ color: MUTED }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: '38%', left: 0, right: 0,
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{totalJobs}</div>
              <div style={{ fontSize: 10, color: MUTED2, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Violations log */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
            Integrity Violations
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            Last 7 days
          </div>
        </div>
        <div style={{
          padding: 14, borderRadius: 8,
          background: '#10b98112', border: '1px solid #10b98140',
          fontSize: 13, color: '#10b981', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ No critical violations detected
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Warnings
        </div>
        {FALLBACK_VIOLATIONS.map(v => (
          <div key={`${v.agent}-${v.date}`} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: SEVERITY_COLOR[v.severity],
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: ACCENT, minWidth: 70 }}>{v.agent}</span>
            <span style={{ flex: 1, fontSize: 13, color: '#fff' }}>{v.detail}</span>
            <span style={{ fontSize: 11, color: MUTED2 }}>{v.date}</span>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
            Top Agents Leaderboard
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            By jobs completed
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Rank', 'Agent', 'Jobs', 'Integrity', 'Uptime'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  borderBottom: `1px solid ${BORDER}`,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: MUTED2,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FALLBACK_LEADERS.map(r => (
              <tr key={r.agent}>
                <td style={{ padding: '10px 12px', color: r.rank <= 3 ? '#F5C518' : MUTED, fontWeight: 700 }}>
                  #{r.rank}
                </td>
                <td style={{ padding: '10px 12px', fontFamily: MONO, color: ACCENT, fontSize: 12 }}>{r.agent}</td>
                <td style={{ padding: '10px 12px', color: '#fff', fontFamily: MONO, fontSize: 12 }}>{r.jobs.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#10b981', fontSize: 12 }}>{r.integrity}</td>
                <td style={{ padding: '10px 12px', color: MUTED, fontSize: 12 }}>{r.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
