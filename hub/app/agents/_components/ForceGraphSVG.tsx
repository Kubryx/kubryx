'use client'

import { useMemo, useRef, useState, MouseEvent } from 'react'
import type { Job, AgentNode } from '../../../lib/trustmesh-fallbacks'

const STATUS_COLOR: Record<string, string> = {
  active: '#22C55E',
  complete: '#3B82F6',
  revoked: '#EF4444',
  pending: '#F5C518',
  warning: '#F59E0B',
  idle: '#9CA3AF',
}

type GraphNode = {
  id: string
  label: string
  group: 'job' | 'agent'
  color: string
  x: number
  y: number
  href?: string
}
type GraphLink = { source: string; target: string }

export default function ForceGraphSVG({
  jobs,
  nodes,
  width = 720,
  height = 420,
  onNodeClick,
}: {
  jobs: Job[]
  nodes: AgentNode[]
  width?: number
  height?: number
  onNodeClick?: (jobId: string) => void
}) {
  const { graphNodes, links } = useMemo(() => {
    // deterministic layout: jobs in a ring, agents around each job
    const cx = width / 2
    const cy = height / 2
    const rJob = Math.min(width, height) * 0.22
    const rAgent = Math.min(width, height) * 0.16
    const gn: GraphNode[] = []
    const gl: GraphLink[] = []

    jobs.forEach((job, ji) => {
      const angle = (ji / Math.max(1, jobs.length)) * Math.PI * 2
      const jx = cx + Math.cos(angle) * rJob
      const jy = cy + Math.sin(angle) * rJob
      gn.push({
        id: job.id,
        label: job.owner,
        group: 'job',
        color: STATUS_COLOR[job.status] || '#F5C518',
        x: jx,
        y: jy,
        href: `/agents/jobs/${job.id}`,
      })

      const myAgents = nodes.filter((n) => n.jobId === job.id)
      myAgents.forEach((agent, ai) => {
        const sub = ((ai + 1) / (myAgents.length + 1)) * Math.PI * 2
        const ax = jx + Math.cos(angle + sub * 0.6) * rAgent
        const ay = jy + Math.sin(angle + sub * 0.6) * rAgent
        gn.push({
          id: agent.id,
          label: agent.name,
          group: 'agent',
          color: STATUS_COLOR[agent.status] || '#F5C518',
          x: ax,
          y: ay,
          href: `/agents/jobs/${job.id}`,
        })
        gl.push({ source: job.id, target: agent.id })
      })
    })

    return { graphNodes: gn, links: gl }
  }, [jobs, nodes, width, height])

  const nodeById = useMemo(() => {
    const map = new Map<string, GraphNode>()
    graphNodes.forEach((n) => map.set(n.id, n))
    return map
  }, [graphNodes])

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number } | null>(null)

  function handleMouseDown(e: MouseEvent<SVGSVGElement>) {
    dragRef.current = { startX: e.clientX - pan.x, startY: e.clientY - pan.y }
  }
  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    setPan({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    })
  }
  function handleMouseUp() {
    dragRef.current = null
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 4,
          zIndex: 2,
        }}
      >
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
          style={zoomBtnStyle}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(z / 1.2, 0.4))}
          style={zoomBtnStyle}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
          style={zoomBtnStyle}
        >
          ⟲
        </button>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Agent mesh graph"
        style={{
          display: 'block',
          background:
            'radial-gradient(circle at 50% 50%, rgba(245,197,24,0.05), transparent 60%)',
          borderRadius: 12,
          cursor: dragRef.current ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center' }}
        >
          {links.map((l, i) => {
            const a = nodeById.get(l.source)
            const b = nodeById.get(l.target)
            if (!a || !b) return null
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(245,197,24,0.25)"
                strokeWidth={1.2}
              />
            )
          })}
          {graphNodes.map((n) => (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation()
                if (onNodeClick) {
                  const jobId =
                    n.group === 'job'
                      ? n.id
                      : links.find((l) => l.target === n.id)?.source
                  if (jobId) onNodeClick(jobId)
                }
              }}
            >
              <circle
                r={n.group === 'job' ? 10 : 6}
                fill={n.color}
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={n.group === 'job' ? 1.5 : 1}
                opacity={0.95}
              >
                <title>{n.label}</title>
              </circle>
              <text
                x={0}
                y={n.group === 'job' ? -14 : -10}
                textAnchor="middle"
                fontSize={n.group === 'job' ? 11 : 9}
                fill={n.group === 'job' ? '#F5C518' : 'rgba(255,255,255,0.7)'}
                style={{ pointerEvents: 'none', fontFamily: 'system-ui' }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

const zoomBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(8,8,8,0.7)',
  color: '#fff',
  fontSize: 14,
  lineHeight: 1,
  cursor: 'pointer',
}
