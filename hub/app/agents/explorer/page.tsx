'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchJobs, fetchNodes } from '../../../lib/trustmesh-api'
import type {
  Job,
  AgentNode,
  JobsResponse,
  NodesResponse,
} from '../../../lib/trustmesh-fallbacks'
import {
  fallbackJobs,
  fallbackNodes,
} from '../../../lib/trustmesh-fallbacks'
import StatusBadge from '../_components/StatusBadge'
import LiveBadge from '../_components/LiveBadge'
import ForceGraphSVG from '../_components/ForceGraphSVG'

type FilterMode = 'all' | 'active' | 'revoked'

function truncate(s: string, n = 10) {
  if (!s) return ''
  return s.length > n ? `${s.slice(0, n - 2)}…` : s
}

export default function ExplorerPage() {
  const router = useRouter()
  const [jobsRes, setJobsRes] = useState<JobsResponse>(fallbackJobs)
  const [nodesRes, setNodesRes] = useState<NodesResponse>(fallbackNodes)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [jr, nr] = await Promise.all([fetchJobs(), fetchNodes()])
      if (cancelled) return
      setJobsRes(jr.data)
      setNodesRes(nr.data)
      setIsLive(jr.isLive && nr.isLive)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredJobs = useMemo<Job[]>(() => {
    if (filter === 'all') return jobsRes.jobs
    if (filter === 'active') return jobsRes.jobs.filter((j) => j.status === 'active')
    return jobsRes.jobs.filter((j) => j.status === 'revoked')
  }, [jobsRes, filter])

  const graphNodes: AgentNode[] = nodesRes.nodes

  return (
    <main>
      <section
        className="dashboard-hero"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <p className="eyebrow">TrustMesh · Explorer</p>
          <h1>Every Agent. Every Decision. On chain.</h1>
          <p className="silver-text">
            Inspect live coordination jobs and the agent mesh behind each one.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <LiveBadge isLive={isLive} />
            <span
              style={{
                fontSize: 11,
                color: '#fff',
                opacity: 0.7,
              }}
            >
              {jobsRes.stats.activeCount} active · {jobsRes.stats.agentCount} agents · {jobsRes.stats.breachCount} breaches
            </span>
          </div>
        </div>
        <div className="hero-actions" style={{ display: 'flex', gap: 8 }}>
          <Link href="/agents/deploy" className="btn-gold">
            New Job
          </Link>
        </div>
      </section>

      <section
        className="dashboard-grid"
        style={{
          gridTemplateColumns: 'minmax(280px, 360px) 1fr',
          alignItems: 'start',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Jobs</h2>
            <span className="silver-text" style={{ fontSize: 11 }}>
              {filteredJobs.length} / {jobsRes.jobs.length}
            </span>
          </div>
          <div
            role="tablist"
            aria-label="Job filter"
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {(['all', 'active', 'revoked'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                role="tab"
                aria-selected={filter === mode}
                onClick={() => setFilter(mode)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  background: filter === mode ? '#F5C518' : 'transparent',
                  color: filter === mode ? '#080808' : '#fff',
                  fontWeight: filter === mode ? 600 : 400,
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="stack-list" style={{ maxHeight: 480, overflowY: 'auto' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="mini-card"
                    style={{
                      opacity: 0.4,
                      animation: 'pulse 1.4s ease-in-out infinite',
                    }}
                  >
                    <div style={{ height: 14, width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                    <div style={{ height: 10, width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 6 }} />
                  </div>
                ))
              : filteredJobs.length === 0 ? (
                  <p className="silver-text" style={{ padding: '12px 0' }}>
                    No jobs match this filter.
                  </p>
                ) : (
                  filteredJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/agents/jobs/${job.id}`}
                      className="mini-card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div>
                        <p className="gold-text" style={{ margin: 0, fontFamily: 'monospace', fontSize: 12 }}>
                          {truncate(job.id, 14)}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12 }}>{job.owner}</p>
                        <p className="silver-text" style={{ margin: '4px 0 0', fontSize: 11 }}>
                          {job.description.length > 60 ? job.description.slice(0, 57) + '…' : job.description}
                        </p>
                      </div>
                      <div className="item-actions">
                        <StatusBadge status={job.status} />
                        <span className="gold-text" style={{ fontSize: 11 }}>Open ↗</span>
                      </div>
                    </Link>
                  ))
                )}
          </div>
          <Link
            href="/agents/deploy"
            className="btn-gold"
            style={{ marginTop: 12, textAlign: 'center', display: 'block' }}
          >
            + New Job
          </Link>
        </div>

        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <h2 style={{ margin: 0 }}>Mesh graph</h2>
            <p className="silver-text" style={{ fontSize: 11, margin: 0 }}>
              {jobsRes.stats.activeCount} active · {jobsRes.stats.agentCount} agents · {jobsRes.stats.breachCount} breaches
            </p>
          </div>
          <ForceGraphSVG
            jobs={jobsRes.jobs}
            nodes={graphNodes}
            onNodeClick={(jobId) => router.push(`/agents/jobs/${jobId}`)}
          />
          <p className="silver-text" style={{ fontSize: 11, marginTop: 8 }}>
            Drag to pan, use + / − / ⟲ to zoom. Click a node to open its job.
          </p>
        </div>
      </section>
    </main>
  )
}
