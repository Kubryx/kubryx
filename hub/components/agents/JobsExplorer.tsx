// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchJobs, fetchNodes } from '@/lib/trustmesh-api'
import {
  fallbackJobs,
  fallbackNodes,
  type Job,
  type JobsResponse,
  type NodesResponse,
} from '@/lib/trustmesh-fallbacks'
import ForceGraphSVG from '@/app/agents/_components/ForceGraphSVG'
import { TRUSTMESH_ACCENT } from '@/lib/agents-fallbacks'

const ACCENT = TRUSTMESH_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

type FilterMode = 'all' | 'active' | 'complete' | 'revoked' | 'pending'

const STATUS_COLOR: Record<string, string> = {
  active: '#10b981',
  complete: '#3b82f6',
  revoked: '#ef4444',
  pending: '#f59e0b',
  warning: '#f59e0b',
}

export default function JobsExplorer() {
  const router = useRouter()
  const [jobsRes, setJobsRes] = useState<JobsResponse>(fallbackJobs)
  const [nodesRes, setNodesRes] = useState<NodesResponse>(fallbackNodes)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [jr, nr] = await Promise.all([fetchJobs(), fetchNodes()])
      if (cancelled) return
      setJobsRes(jr.data)
      setNodesRes(nr.data)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo<Job[]>(() => {
    let list = jobsRes.jobs
    if (filter !== 'all') list = list.filter(j => j.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(j => j.id.toLowerCase().includes(q) || j.owner.toLowerCase().includes(q) || j.description.toLowerCase().includes(q))
    }
    return list
  }, [jobsRes, filter, search])

  return (
    <div style={{ padding: 28 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 360px) 1fr',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* Left — filter + job list */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 16,
        }}>
          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search job ID, agent name…"
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`,
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              marginBottom: 10,
            }}
          />

          {/* Filter pills */}
          <div style={{
            display: 'flex', gap: 4, padding: 4,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8, marginBottom: 12,
            flexWrap: 'wrap',
          }}>
            {(['all', 'active', 'complete', 'revoked', 'pending'] as FilterMode[]).map(m => {
              const isActive = filter === m
              return (
                <button
                  key={m}
                  onClick={() => setFilter(m)}
                  style={{
                    flex: 1, minWidth: 56,
                    padding: '5px 8px', borderRadius: 6,
                    border: 'none',
                    background: isActive ? ACCENT : 'transparent',
                    color: isActive ? '#fff' : MUTED,
                    fontSize: 11, fontWeight: isActive ? 600 : 500,
                    textTransform: 'capitalize', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {m}
                </button>
              )
            })}
          </div>

          <div style={{ fontSize: 11, color: MUTED2, marginBottom: 8 }}>
            {filtered.length} of {jobsRes.jobs.length} jobs
          </div>

          {/* Job list */}
          <div style={{
            maxHeight: 480,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            {loading ? (
              <div style={{ color: MUTED2, fontSize: 12, padding: 20, textAlign: 'center' }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: MUTED2, fontSize: 12, padding: 20, textAlign: 'center' }}>No jobs match.</div>
            ) : (
              filtered.map(job => {
                const isSel = selectedJob === job.id
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job.id)}
                    onDoubleClick={() => router.push(`/agents/jobs/${job.id}`)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: isSel ? `${ACCENT}15` : 'transparent',
                      border: `1px solid ${isSel ? `${ACCENT}55` : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: ACCENT }}>{job.id}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        background: `${STATUS_COLOR[job.status] || MUTED}25`,
                        color: STATUS_COLOR[job.status] || MUTED,
                        textTransform: 'capitalize',
                      }}>
                        {job.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#fff', marginTop: 4 }}>{job.owner}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.description}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right — graph */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase' }}>
                Agent Coordinator
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                {jobsRes.stats.activeCount} active · {jobsRes.stats.agentCount} agents · {jobsRes.stats.breachCount} breaches
              </div>
            </div>
            {selectedJob && (
              <Link href={`/agents/jobs/${selectedJob}`} style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>
                Open {selectedJob} →
              </Link>
            )}
          </div>
          <ForceGraphSVG
            jobs={jobsRes.jobs}
            nodes={nodesRes.nodes}
            onNodeClick={(jobId) => setSelectedJob(jobId)}
            height={460}
          />
          <p style={{ fontSize: 11, color: MUTED2, marginTop: 10 }}>
            Drag to pan, use the + / − / ⟲ controls to zoom. Click a node to select its job; double-click a job in the list to open its detail page.
          </p>
        </div>
      </div>
    </div>
  )
}
