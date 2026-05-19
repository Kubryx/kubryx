'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchJobs, fetchAnalytics } from '@/lib/trustmesh-api'
import {
  fallbackJobs,
  fallbackAnalytics,
  type Job,
  type JobsResponse,
  type AnalyticsResponse,
} from '@/lib/trustmesh-fallbacks'
import { DASH_STAT_PLACEHOLDERS, HOW_IT_WORKS, TRUSTMESH_ACCENT } from '@/lib/agents-fallbacks'
import MiniMesh from './MiniMesh'

const ACCENT = TRUSTMESH_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

const STATUS_COLOR: Record<string, string> = {
  active: '#10b981',
  complete: '#3b82f6',
  revoked: '#ef4444',
  pending: '#f59e0b',
  warning: '#f59e0b',
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`
  return `${Math.round(diff / 86_400_000)}d ago`
}

export default function AgentDashboard() {
  const [jobsRes, setJobsRes] = useState<JobsResponse>(fallbackJobs)
  const [analytics, setAnalytics] = useState<AnalyticsResponse>(fallbackAnalytics)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchJobs(), fetchAnalytics()]).then(([jr, ar]) => {
      if (cancelled) return
      setJobsRes(jr.data)
      setAnalytics(ar.data)
    })
    return () => { cancelled = true }
  }, [])

  const stats = [
    { ...DASH_STAT_PLACEHOLDERS[0], value: String(analytics.stats.activeAgents) },
    { ...DASH_STAT_PLACEHOLDERS[1], value: analytics.stats.totalJobs.toLocaleString() },
    DASH_STAT_PLACEHOLDERS[2],
    DASH_STAT_PLACEHOLDERS[3],
  ]

  const recentJobs: Job[] = jobsRes.jobs.slice(0, 6)

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.changeKind === 'up' ? '#10b981' : s.changeKind === 'down' ? '#10b981' : MUTED, marginTop: 8 }}>
              {s.changeKind === 'up' ? '↑ ' : s.changeKind === 'down' ? '↓ ' : '✓ '}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Mesh + Recent jobs side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 16,
      }}>
        {/* Mini mesh card */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
                Live Mesh Topology
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                {analytics.stats.activeAgents.toLocaleString()} nodes active
              </div>
            </div>
            <Link href="/agents/explorer" style={{
              fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 600,
            }}>
              Open Explorer →
            </Link>
          </div>
          <MiniMesh height={300} />
        </div>

        {/* Recent jobs feed */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
              Recent Jobs
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Coordination feed
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentJobs.map(j => (
              <Link key={j.id} href={`/agents/jobs/${j.id}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: STATUS_COLOR[j.status] || MUTED,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#fff', fontFamily: MONO }}>{j.id}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {j.owner} · {j.description}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, color: STATUS_COLOR[j.status] || MUTED,
                  textTransform: 'capitalize', flexShrink: 0,
                }}>
                  {j.status}
                </span>
                <span style={{ fontSize: 10, color: MUTED2, flexShrink: 0, minWidth: 50, textAlign: 'right' }}>
                  {relativeTime(j.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How TrustMesh works */}
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: 24,
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
            How TrustMesh works
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            Deploy → Delegate → Verify → Revoke
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} style={{
              padding: 16,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${ACCENT}25`, border: `1px solid ${ACCENT}45`,
                color: ACCENT, fontSize: 12, fontWeight: 700,
                display: 'grid', placeItems: 'center',
                marginBottom: 10,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{step.title}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
