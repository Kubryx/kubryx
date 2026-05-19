'use client'

import { useMemo, useState } from 'react'
import { CIPHERVAULT_ACCENT, FALLBACK_HISTORY, type HistoryRow } from '@/lib/vault-fallbacks'

const ACCENT = CIPHERVAULT_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

const TYPE_COLOR: Record<HistoryRow['type'], string> = {
  DEP: '#10b981', WDR: '#ef4444', TRD: ACCENT, REG: '#3b82f6',
}

export default function VaultHistory() {
  const [typeFilter, setTypeFilter] = useState<'all' | HistoryRow['type']>('all')
  const [assetFilter, setAssetFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const assets = useMemo(() => Array.from(new Set(FALLBACK_HISTORY.map(r => r.asset))), [])
  const filtered = useMemo(() => FALLBACK_HISTORY.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (assetFilter !== 'all' && r.asset !== assetFilter) return false
    return true
  }), [typeFilter, assetFilter])

  function exportCSV() {
    const header = 'id,type,asset,amount,value,status,time,tx\n'
    const body = filtered.map(r => [r.id, r.type, r.asset, r.amount, r.value, r.status, r.time, r.txHash].join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `vault-history-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 16 }}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | HistoryRow['type'])} style={selectStyle}>
          <option value="all">All Types</option>
          <option value="DEP">Deposits</option>
          <option value="WDR">Withdrawals</option>
          <option value="TRD">Trades</option>
          <option value="REG">Registrations</option>
        </select>
        <select value={assetFilter} onChange={e => setAssetFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Assets</option>
          {assets.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select style={selectStyle} defaultValue="30d">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <button onClick={exportCSV} style={{
          padding: '10px 16px', borderRadius: 8, background: 'transparent',
          border: `1px solid ${BORDER}`, color: MUTED, fontSize: 12, cursor: 'pointer',
        }}>Export CSV</button>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Type', 'Asset/Pair', 'Amount', 'Value', 'Status', 'Time'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <>
                <tr key={r.id} onClick={() => setExpanded(e => e === r.id ? null : r.id)}
                    style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4,
                      background: `${TYPE_COLOR[r.type]}20`, color: TYPE_COLOR[r.type],
                      fontSize: 11, fontWeight: 700, fontFamily: MONO,
                    }}>{r.type}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: MONO }}>{r.asset}</td>
                  <td style={tdStyle}>{r.amount}</td>
                  <td style={{ ...tdStyle, fontFamily: MONO }}>{r.value}</td>
                  <td style={{ ...tdStyle, color: '#10b981' }}>✓ Done</td>
                  <td style={{ ...tdStyle, color: MUTED, fontSize: 12 }}>{r.time}</td>
                </tr>
                {expanded === r.id && (
                  <tr key={`${r.id}-d`}>
                    <td colSpan={6} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        <Detail label="Tx Hash" value={r.txHash} />
                        <Detail label="Block" value={r.block} />
                        <Detail label="MPC Signature" value={r.mpcSig} />
                        <Detail label="FHE Proof" value={r.fheProof} />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: '#fff' }}>{value}</div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px',
  borderBottom: `1px solid ${BORDER}`,
  fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: MUTED2,
  background: 'rgba(255,255,255,0.02)',
}
const tdStyle: React.CSSProperties = { padding: '12px 16px', color: '#fff' }
const selectStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${BORDER}`,
  color: '#fff', fontSize: 13, outline: 'none',
}
