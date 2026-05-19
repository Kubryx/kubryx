'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FALLBACK_TOOLS, type ToolCard, type ToolStatus } from '@/lib/dashboard-fallbacks'

const BORDER = 'rgba(255,255,255,0.08)'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.35)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

const STATUS_STYLE: Record<ToolStatus, { label: string; bg: string; fg: string; border: string }> = {
  live: { label: 'LIVE',        bg: 'rgba(16,185,129,0.15)', fg: '#10b981', border: 'rgba(16,185,129,0.4)' },
  beta: { label: 'BETA',        bg: 'rgba(245,158,11,0.15)', fg: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
  soon: { label: 'COMING SOON', bg: 'rgba(255,255,255,0.06)', fg: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.15)' },
}

function Card({ tool }: { tool: ToolCard }) {
  const [hov, setHov] = useState(false)
  const disabled = tool.status === 'soon'
  const status = STATUS_STYLE[tool.status]

  const body = (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled ? `${tool.color}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hov && !disabled ? tool.color + '55' : BORDER}`,
        borderRadius: 12,
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.18s ease',
        transform: hov && !disabled ? 'scale(1.015)' : 'scale(1)',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {/* Top row: icon + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${tool.color}20`,
          display: 'grid', placeItems: 'center',
          fontSize: 16, fontWeight: 800,
          color: tool.color,
        }}>
          {tool.name[0]}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          padding: '3px 7px', borderRadius: 4,
          background: status.bg, color: status.fg,
          border: `1px solid ${status.border}`,
          fontFamily: MONO,
        }}>
          {status.label}
        </span>
      </div>

      {/* Name + description */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
          {tool.name}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>
          {tool.description}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
        {tool.stats.map(s => (
          <div key={s.label} style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: MUTED2, textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: MONO, marginTop: 2 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Launch hint */}
      {!disabled && (
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: hov ? tool.color : 'transparent',
          transition: 'color 0.18s',
          marginTop: -4,
        }}>
          Launch →
        </div>
      )}
    </div>
  )

  if (disabled) return <div>{body}</div>

  return (
    <Link href={tool.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {body}
    </Link>
  )
}

export default function ToolQuickAccess() {
  return (
    <div style={{ margin: '24px', marginTop: 0 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED2 }}>
            Operations Network
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            All 8 protocol tools
          </div>
        </div>
        <span style={{ fontSize: 11, color: MUTED2, fontFamily: MONO }}>8 tools · 1 coming</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {FALLBACK_TOOLS.map(tool => <Card key={tool.name} tool={tool} />)}
      </div>
    </div>
  )
}
