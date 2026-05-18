'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { fetchAnalytics } from '../../../lib/trustmesh-api'
import {
  fallbackAnalytics,
  type AnalyticsResponse,
} from '../../../lib/trustmesh-fallbacks'
import StatusBadge from '../_components/StatusBadge'
import LiveBadge from '../_components/LiveBadge'

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  complete: '#3B82F6',
  revoked: '#EF4444',
  pending: '#F5C518',
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))}m ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`
  return `${Math.round(diff / 86_400_000)}d ago`
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse>(fallbackAnalytics)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const res = await fetchAnalytics()
      if (cancelled) return
      setData(res.data)
      setIsLive(res.isLive)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const pieData = [
    { name: 'Active', value: data.jobStatusDist.active, key: 'active' },
    { name: 'Complete', value: data.jobStatusDist.complete, key: 'complete' },
    { name: 'Revoked', value: data.jobStatusDist.revoked, key: 'revoked' },
    { name: 'Pending', value: data.jobStatusDist.pending, key: 'pending' },
  ].filter((s) => s.value > 0)

  const metricCards = [
    { label: 'Total jobs', value: data.stats.totalJobs, color: '#F5C518' },
    { label: 'Active agents', value: data.stats.activeAgents, color: '#22C55E' },
    { label: 'Messages logged', value: data.stats.messagesLogged, color: '#60A5FA' },
    { label: 'Unauthorized actions', value: data.stats.unauthorizedActions, color: '#EF4444' },
  ]

  return (
    <main>
      <section
        className="dashboard-hero"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <p className="eyebrow">TrustMesh · Analytics</p>
          <h1>Mesh analytics</h1>
          <p className="silver-text">
            Live snapshot of job throughput, agent activity, and integrity violations.
          </p>
          <div style={{ marginTop: 12 }}>
            <LiveBadge isLive={isLive} />
          </div>
        </div>
      </section>

      <section
        className="dashboard-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        {metricCards.map((m) => (
          <article key={m.label} className="card">
            <p className="silver-text" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {m.label}
            </p>
            <p
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: m.color,
                margin: '8px 0 0',
                fontFamily: 'system-ui',
              }}
            >
              {loading ? '…' : m.value.toLocaleString()}
            </p>
          </article>
        ))}
      </section>

      <section
        className="dashboard-grid"
        style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'start' }}
      >
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Job status distribution</h2>
          {pieData.length === 0 ? (
            <p className="silver-text">No jobs yet.</p>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={88}
                    stroke="rgba(0,0,0,0.4)"
                    isAnimationActive={false}
                    label={(d: { name?: string; percent?: number }) =>
                      d?.percent !== undefined
                        ? `${d.name} ${(d.percent * 100).toFixed(0)}%`
                        : d?.name ?? ''
                    }
                  >
                    {pieData.map((s, i) => (
                      <Cell key={i} fill={STATUS_COLORS[s.key]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#080808',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: '#bbb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Agent activity (24h)</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyActivity} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: '#bbb', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fill: '#bbb', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#080808',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="messageCount"
                  stroke="#F5C518"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Top active jobs</h2>
          <span className="silver-text" style={{ fontSize: 11 }}>
            sorted by agent count
          </span>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Job ID', 'Owner', 'Agents', 'Status', 'Created'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 11,
                      color: '#bbb',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 11,
                    color: '#bbb',
                    textTransform: 'uppercase',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topJobs.map((j) => (
                <tr
                  key={j.jobId}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#F5C518' }}>
                    {j.jobId}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{j.owner}</td>
                  <td style={{ padding: '10px 12px' }}>{j.agentCount}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={j.status} />
                  </td>
                  <td style={{ padding: '10px 12px', color: '#bbb' }}>
                    {formatRelative(j.createdAt)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <Link
                      href={`/agents/jobs/${j.jobId}`}
                      className="gold-text"
                      style={{ fontSize: 12 }}
                    >
                      View ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
