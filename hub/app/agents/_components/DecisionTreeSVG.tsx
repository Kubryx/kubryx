'use client'

import type { AgentTreeNode } from '../../../lib/trustmesh-fallbacks'

type LayoutNode = AgentTreeNode & {
  x: number
  y: number
  width: number
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 76
const LEVEL_GAP = 110
const SIBLING_GAP = 24

const STATUS_COLOR: Record<string, string> = {
  running: '#22C55E',
  idle: '#F5C518',
  stopped: '#EF4444',
}

function measureWidth(node: AgentTreeNode): number {
  if (!node.children || node.children.length === 0) return NODE_WIDTH
  const childrenWidth = node.children
    .map(measureWidth)
    .reduce((a, b) => a + b, 0)
  const gaps = (node.children.length - 1) * SIBLING_GAP
  return Math.max(NODE_WIDTH, childrenWidth + gaps)
}

function layout(
  node: AgentTreeNode,
  x: number,
  y: number,
  out: LayoutNode[] = [],
  edges: { x1: number; y1: number; x2: number; y2: number }[] = [],
): { out: LayoutNode[]; edges: typeof edges } {
  const w = measureWidth(node)
  const nodeX = x + w / 2
  out.push({ ...node, x: nodeX, y, width: NODE_WIDTH })

  if (node.children && node.children.length > 0) {
    let cursor = x
    for (const child of node.children) {
      const childW = measureWidth(child)
      const childCenter = cursor + childW / 2
      edges.push({
        x1: nodeX,
        y1: y + NODE_HEIGHT,
        x2: childCenter,
        y2: y + LEVEL_GAP,
      })
      layout(child, cursor, y + LEVEL_GAP, out, edges)
      cursor += childW + SIBLING_GAP
    }
  }
  return { out, edges }
}

export default function DecisionTreeSVG({ root }: { root: AgentTreeNode }) {
  const totalWidth = measureWidth(root)
  const { out, edges } = layout(root, 0, 0)
  const totalHeight = (out.reduce((m, n) => Math.max(m, n.y), 0) || 0) + NODE_HEIGHT

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        width={Math.max(totalWidth, 600)}
        height={totalHeight + 20}
        viewBox={`-20 -10 ${totalWidth + 40} ${totalHeight + 30}`}
        role="img"
        aria-label="Agent decision tree"
        style={{ display: 'block' }}
      >
        {edges.map((e, i) => (
          <path
            key={i}
            d={`M ${e.x1} ${e.y1} C ${e.x1} ${(e.y1 + e.y2) / 2}, ${e.x2} ${
              (e.y1 + e.y2) / 2
            }, ${e.x2} ${e.y2}`}
            stroke="rgba(245,197,24,0.4)"
            strokeWidth={1.4}
            fill="none"
          />
        ))}
        {out.map((n, i) => (
          <g
            key={i}
            transform={`translate(${n.x - NODE_WIDTH / 2}, ${n.y})`}
          >
            <rect
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={10}
              fill="rgba(8,8,8,0.85)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
            <circle
              cx={14}
              cy={16}
              r={5}
              fill={STATUS_COLOR[n.status] || '#9CA3AF'}
            />
            <text
              x={26}
              y={20}
              fill="#F5C518"
              fontSize={11}
              fontWeight={600}
              fontFamily="system-ui"
            >
              {n.role}
            </text>
            <text
              x={12}
              y={42}
              fill="#fff"
              fontSize={12}
              fontFamily="system-ui"
            >
              {n.name.length > 28 ? n.name.slice(0, 25) + '…' : n.name}
            </text>
            <text
              x={12}
              y={62}
              fill="rgba(255,255,255,0.55)"
              fontSize={10}
              fontFamily="system-ui"
            >
              {n.message.length > 36
                ? n.message.slice(0, 33) + '…'
                : n.message}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
