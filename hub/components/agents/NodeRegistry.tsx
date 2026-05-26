// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { fetchNodes, fetchJobs } from '@/lib/trustmesh-api'
import {
  fallbackNodes,
  fallbackJobs,
  type AgentNode,
  type AgentType,
  type NodeStatus,
  type NodesResponse,
  type JobsResponse,
} from '@/lib/trustmesh-fallbacks'
import { TRUSTMESH_ACCENT } from '@/lib/agents-fallbacks'

const ACCENT = TRUSTMESH_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'
const PAGE_SIZE = 10

const STATUS_COLOR: Record<string, string> = {
  active: '#10b981',
  complete: '#3b82f6',
  revoked: '#ef4444',
  pending: '#f59e0b',
  warning: '#f59e0b',
  idle: '#9CA3AF',
}

const TYPES: (AgentType | 'all')[] = ['all', 'planner', 'executor', 'analyzer', 'trader', 'confirmer']
const STATUSES: (NodeStatus | 'all')[] = ['all', 'active', 'revoked', 'complete', 'warning', 'idle']

function shortAddr(addr: string, head = 6, tail = 4) {
  if (!addr) return ''
  return addr.length > head + tail + 1 ? `${addr.slice(0, head)}…${addr.slice(-tail)}` : addr
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`
  return `${Math.round(diff / 86_400_000)}d ago`
}

export default function NodeRegistry() {
  const [data, setData] = useState<NodesResponse>(fallbackNodes)
  const [jobsRes, setJobsRes] = useState<JobsResponse>(fallbackJobs)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<NodeStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AgentNode | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchNodes(), fetchJobs()]).then(([nr, jr]) => {
      if (cancelled) return
      setData(nr.data)
      setJobsRes(jr.data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.nodes.filter(n => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      if (typeFilter !== 'all' && n.type !== typeFilter) return false
      if (q && !n.name.toLowerCase().includes(q) && !n.wallet.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, search, statusFilter, typeFilter])

  useEffect(() => { setPage(0) }, [search, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard?.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(k => (k === key ? null : k)), 1400)
  }

  function exportCSV() {
    const header = 'agent_id,name,wallet,type,job_id,status,spawned_at\n'
    const rows = filtered.map(n => [n.id, n.name, n.wallet, n.type, n.jobId, n.status, n.spawnedAt].join(',')).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Agent Coordinator-nodes-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: 28, position: 'relative' }}>
      {/* Filter bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr auto',
        gap: 10,
        marginBottom: 16,
      }}>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search agents by name, ID, SNS…"
          style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${BORDER}`,
            color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as NodeStatus | 'all')}
          style={selectStyle}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as AgentType | 'all')}
          style={selectStyle}
        >
          {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
        </select>
        <button
          onClick={exportCSV}
          style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'transparent', border: `1px solid ${BORDER}`,
            color: MUTED, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Agent ID', 'SNS Name', 'Status', 'Type', 'Job ID', 'Pubkey', 'Spawned'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: MUTED2 }}>Loading…</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: MUTED2 }}>No agents match.</td></tr>
              ) : pageItems.map(n => {
                const copyKey = `${n.id}-pubkey`
                return (
                  <tr
                    key={n.id}
                    onClick={() => setSelected(n)}
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      background: selected?.id === n.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (selected?.id !== n.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (selected?.id !== n.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <td style={tdStyle}><span style={{ fontFamily: MONO, color: ACCENT }}>{n.id}</span></td>
                    <td style={tdStyle}>{n.name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 8px', borderRadius: 4,
                        background: `${STATUS_COLOR[n.status]}20`,
                        color: STATUS_COLOR[n.status],
                        fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_COLOR[n.status] }} />
                        {n.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textTransform: 'capitalize', color: MUTED }}>{n.type}</td>
                    <td style={tdStyle}><span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>{shortAddr(n.jobId, 8, 4)}</span></td>
                    <td style={tdStyle}>
                      <button
                        onClick={e => { e.stopPropagation(); copyToClipboard(n.wallet, copyKey) }}
                        style={{
                          background: 'transparent', border: 'none',
                          fontFamily: MONO, fontSize: 11, color: MUTED,
                          cursor: 'pointer', padding: 0,
                        }}
                        title="Click to copy"
                      >
                        {copiedKey === copyKey ? <span style={{ color: '#10b981' }}>Copied!</span> : shortAddr(n.wallet)}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, color: MUTED2, fontSize: 12 }}>{relativeTime(n.spawnedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderTop: `1px solid ${BORDER}`,
        }}>
          <span style={{ fontSize: 12, color: MUTED2 }}>
            {filtered.length === 0 ? '0' : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)}`} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={pageBtn(page === 0)}>← Prev</button>
            <span style={{ fontSize: 12, color: MUTED, padding: '4px 10px' }}>Page {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pageBtn(page >= totalPages - 1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Slide-in detail panel */}
      {selected && (
        <DetailPanel
          node={selected}
          jobs={jobsRes.jobs}
          onClose={() => setSelected(null)}
          onCopy={copyToClipboard}
          copiedKey={copiedKey}
        />
      )}
    </div>
  )
}

function DetailPanel({
  node,
  jobs,
  onClose,
  onCopy,
  copiedKey,
}: {
  node: AgentNode
  jobs: JobsResponse['jobs']
  onClose: () => void
  onCopy: (val: string, key: string) => void
  copiedKey: string | null
}) {
  const nodeJobs = jobs.filter(j => j.id === node.jobId)
  const copyKey = `panel-${node.id}-pubkey`
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 60, animation: 'fadeIn 0.18s ease',
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 360, maxWidth: '90vw',
        background: '#0C0C0C',
        borderLeft: `1px solid ${BORDER}`,
        zIndex: 61,
        padding: 24,
        overflowY: 'auto',
        animation: 'slideIn 0.22s ease',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', color: MUTED,
          fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 16,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${ACCENT}25`, border: `1px solid ${ACCENT}45`,
            color: ACCENT, fontSize: 16, fontWeight: 800,
            display: 'grid', placeItems: 'center',
          }}>{node.name[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{node.name}</div>
            <div style={{ fontSize: 11, color: STATUS_COLOR[node.status], display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[node.status] }} />
              {node.status} · Solana Devnet
            </div>
          </div>
        </div>

        <DetailRow label="Agent ID" value={node.id} mono />
        <DetailRow label="SNS Name" value={node.name} />
        <DetailRow label="Type"     value={node.type} />
        <DetailRow label="Job ID"   value={node.jobId} mono />
        <DetailRow label="Spawned"  value={relativeTime(node.spawnedAt)} />

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 6 }}>
            Pubkey
          </div>
          <button
            onClick={() => onCopy(node.wallet, copyKey)}
            style={{
              width: '100%', textAlign: 'left',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: '10px 12px',
              fontFamily: MONO, fontSize: 12, color: '#fff',
              cursor: 'pointer',
              wordBreak: 'break-all',
            }}
          >
            {copiedKey === copyKey ? <span style={{ color: '#10b981' }}>Copied to clipboard ✓</span> : node.wallet}
          </button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 8 }}>
            Linked Jobs
          </div>
          {nodeJobs.length === 0 ? (
            <div style={{ fontSize: 12, color: MUTED }}>No jobs linked yet.</div>
          ) : nodeJobs.map(j => (
            <Link
              key={j.id}
              href={`/agents/jobs/${j.id}`}
              style={{
                display: 'block', textDecoration: 'none',
                padding: '8px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,0.03)', marginBottom: 6,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 11, color: ACCENT }}>{j.id}</div>
              <div style={{ fontSize: 12, color: '#fff', marginTop: 2 }}>{j.owner}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {j.description}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a
            href={`https://explorer.solana.com/address/${node.wallet}?cluster=devnet`}
            target="_blank" rel="noreferrer"
            style={{
              padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${BORDER}`,
              color: '#fff', textDecoration: 'none',
              fontSize: 12, textAlign: 'center',
            }}
          >
            View on Solana Explorer ↗
          </a>
          <Link
            href={`/agents/jobs/${node.jobId}`}
            style={{
              padding: '10px 14px', borderRadius: 8,
              background: ACCENT, color: '#fff', textDecoration: 'none',
              fontSize: 12, fontWeight: 600, textAlign: 'center',
            }}
          >
            Jump to Job Graph →
          </Link>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideIn { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        `}</style>
      </aside>
    </>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 11, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#fff', fontFamily: mono ? MONO : 'inherit', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: `1px solid ${BORDER}`,
  fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: MUTED2,
  background: 'rgba(255,255,255,0.02)',
}
const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#fff',
}
const selectStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${BORDER}`,
  color: '#fff', fontSize: 13, outline: 'none',
  textTransform: 'capitalize',
}
function pageBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: 6,
    background: 'transparent', border: `1px solid ${BORDER}`,
    color: disabled ? MUTED2 : '#fff', fontSize: 12,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }
}
