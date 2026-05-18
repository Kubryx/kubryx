'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { fetchNodes } from '../../../lib/trustmesh-api'
import {
  fallbackNodes,
  type AgentNode,
  type NodesResponse,
  type AgentType,
  type NodeStatus,
} from '../../../lib/trustmesh-fallbacks'
import StatusBadge from '../_components/StatusBadge'
import LiveBadge from '../_components/LiveBadge'

type SortKey =
  | 'name'
  | 'wallet'
  | 'type'
  | 'jobId'
  | 'status'
  | 'spawnedAt'

const TYPES: (AgentType | 'all')[] = [
  'all',
  'planner',
  'executor',
  'analyzer',
  'trader',
  'confirmer',
]
const STATUSES: (NodeStatus | 'all')[] = [
  'all',
  'active',
  'revoked',
  'complete',
  'warning',
  'idle',
]

function truncate(s: string, n = 14) {
  if (!s) return ''
  return s.length > n ? `${s.slice(0, n - 2)}…` : s
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`
  return `${Math.round(diff / 86_400_000)}d ago`
}

export default function NodesPage() {
  const [data, setData] = useState<NodesResponse>(fallbackNodes)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<NodeStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'spawnedAt',
    dir: 'desc',
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const res = await fetchNodes()
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

  const filtered: AgentNode[] = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = data.nodes.filter((n) => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      if (typeFilter !== 'all' && n.type !== typeFilter) return false
      if (q && !n.name.toLowerCase().includes(q) && !n.wallet.toLowerCase().includes(q)) return false
      return true
    })
    const mul = sort.dir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      const av = String(a[sort.key] || '')
      const bv = String(b[sort.key] || '')
      return av.localeCompare(bv) * mul
    })
    return list
  }, [data, search, statusFilter, typeFilter, sort])

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
  }

  return (
    <main>
      <section
        className="dashboard-hero"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <p className="eyebrow">TrustMesh · Node registry</p>
          <h1>Node registry</h1>
          <p className="silver-text">
            Search and filter every agent. Click any row to see the full job graph.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <LiveBadge isLive={isLive} />
            <span style={{ fontSize: 11, color: '#fff', opacity: 0.7 }}>
              {filtered.length} of {data.total} agents
            </span>
          </div>
        </div>
      </section>

      <section className="card">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by .sol name or wallet address…"
            aria-label="Search nodes"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as NodeStatus | 'all')}
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AgentType | 'all')}
            aria-label="Filter by type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {(
                  [
                    ['name', 'Agent name'],
                    ['wallet', 'Wallet'],
                    ['type', 'Type'],
                    ['jobId', 'Job ID'],
                    ['status', 'Status'],
                    ['spawnedAt', 'Spawned'],
                  ] as [SortKey, string][]
                ).map(([k, label]) => (
                  <th
                    key={k}
                    onClick={() => toggleSort(k)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      color: '#bbb',
                      userSelect: 'none',
                    }}
                  >
                    {label}
                    {sort.key === k && (
                      <span style={{ marginLeft: 4 }}>
                        {sort.dir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ opacity: 0.4 }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td
                          key={j}
                          style={{ padding: '10px 12px' }}
                        >
                          <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((n) => (
                    <tr
                      key={n.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td style={{ padding: '10px 12px', color: '#F5C518', fontFamily: 'monospace' }}>
                        {n.name}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                        {truncate(n.wallet, 18)}
                      </td>
                      <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>
                        {n.type}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                        {truncate(n.jobId, 14)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <StatusBadge status={n.status} />
                      </td>
                      <td style={{ padding: '10px 12px', color: '#bbb', fontSize: 12 }}>
                        {relativeTime(n.spawnedAt)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <Link
                          href={`/agents/jobs/${n.jobId}`}
                          className="gold-text"
                          style={{ fontSize: 12 }}
                        >
                          View ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                    <p className="silver-text">No agents match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
