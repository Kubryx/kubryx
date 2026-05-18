'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { fetchJobById } from '../../../../lib/trustmesh-api'
import {
  fallbackJobDetail,
  type JobDetail,
} from '../../../../lib/trustmesh-fallbacks'
import { toast } from '../../../../lib/toast'
import StatusBadge from '../../_components/StatusBadge'
import LiveBadge from '../../_components/LiveBadge'
import DecisionTreeSVG from '../../_components/DecisionTreeSVG'

const LEVEL_COLORS: Record<string, string> = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const jobId = params?.id ?? ''
  const [detail, setDetail] = useState<JobDetail>(() => fallbackJobDetail(jobId))
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFullLog, setShowFullLog] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const res = await fetchJobById(jobId)
      if (cancelled) return
      setDetail(res.data)
      setIsLive(res.isLive)
      setLoading(false)
    }
    if (jobId) load()
    return () => {
      cancelled = true
    }
  }, [jobId])

  const sortedLog = useMemo(
    () =>
      [...detail.coordinationLog].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [detail],
  )
  const visibleLog = showFullLog ? sortedLog : sortedLog.slice(0, 5)

  function exportAudit() {
    const blob = new Blob([JSON.stringify(detail, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${detail.id}_audit.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Audit log downloaded')
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      toast.success('Share link copied')
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  async function revokeAll() {
    if (!confirm('Revoke ALL agents in this job? This is irreversible on devnet.'))
      return
    try {
      setRevoking(true)
      // Optimistic UI — real revoke would call POST /api/v1/jobs/:id/revoke
      setDetail((d) => ({ ...d, status: 'revoked' }))
      toast.success('Revocation request submitted')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <main>
      <Link
        href="/agents/explorer"
        style={{ fontSize: 12, color: '#bbb', textDecoration: 'none' }}
      >
        ← Back to explorer
      </Link>

      <section
        className="card"
        style={{ marginTop: 12 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Job</p>
            <h1
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                margin: '4px 0',
                color: '#F5C518',
              }}
            >
              {detail.id}
            </h1>
            <p style={{ margin: '4px 0' }}>{detail.description}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={detail.status} />
              <LiveBadge isLive={isLive} />
              <span className="silver-text" style={{ fontSize: 12 }}>
                Owner: <span style={{ color: '#F5C518' }}>{detail.owner}</span>
              </span>
              <span className="silver-text" style={{ fontSize: 12 }}>
                Duration: {detail.duration}
              </span>
              <span className="silver-text" style={{ fontSize: 12 }}>
                Nodes active: {detail.nodesActive}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="dashboard-grid"
        style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start' }}
      >
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Decision tree</h2>
          {loading ? (
            <div style={{ height: 320, opacity: 0.5 }} className="silver-text">
              Loading decision tree…
            </div>
          ) : (
            <DecisionTreeSVG root={detail.agentTree} />
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Coordination log</h2>
            <span className="silver-text" style={{ fontSize: 11 }}>
              {sortedLog.length} events
            </span>
          </div>
          <div
            style={{
              marginTop: 12,
              maxHeight: 420,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {visibleLog.map((e, i) => (
              <article
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${LEVEL_COLORS[e.level]}33`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: LEVEL_COLORS[e.level], fontWeight: 600 }}>
                    {e.level.toUpperCase()}
                  </span>
                  <span className="silver-text">{formatTime(e.timestamp)}</span>
                </div>
                <p style={{ margin: '6px 0 4px', fontSize: 12 }}>{e.message}</p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    opacity: 0.75,
                  }}
                >
                  <span>
                    {e.from} → {e.to}
                  </span>
                  <a
                    href={`https://solscan.io/tx/${e.txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-text"
                  >
                    {e.txHash.slice(0, 10)}… ↗
                  </a>
                </div>
              </article>
            ))}
            {sortedLog.length === 0 && (
              <p className="silver-text" style={{ fontSize: 12 }}>
                No coordination events yet.
              </p>
            )}
          </div>
          {sortedLog.length > 5 && (
            <button
              type="button"
              onClick={() => setShowFullLog((v) => !v)}
              className="btn-outline"
              style={{ marginTop: 12, width: '100%' }}
            >
              {showFullLog
                ? 'Hide historical ledger'
                : 'View full historical ledger'}
            </button>
          )}
        </div>
      </section>

      <section
        className="card"
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={copyShareLink}
          className="btn-outline"
        >
          {shareCopied ? '✓ Link copied' : 'Share link'}
        </button>
        <button
          type="button"
          onClick={exportAudit}
          className="btn-outline"
        >
          Export audit log (JSON)
        </button>
        <button
          type="button"
          onClick={revokeAll}
          disabled={revoking || detail.status === 'revoked'}
          style={{
            padding: '8px 16px',
            background: '#EF4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: revoking || detail.status === 'revoked' ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            opacity: revoking || detail.status === 'revoked' ? 0.5 : 1,
          }}
        >
          {detail.status === 'revoked'
            ? 'Already revoked'
            : revoking
              ? 'Revoking…'
              : 'Revoke all agents'}
        </button>
      </section>
    </main>
  )
}
