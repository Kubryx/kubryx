'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { TRUSTMESH_ACCENT } from '@/lib/agents-fallbacks'

type Node = d3.SimulationNodeDatum & {
  id: string
  label: string
  kind: 'root' | 'primary' | 'secondary'
}
type Link = { source: string; target: string }

const NODES: Node[] = [
  { id: 'root',    label: 'Root',   kind: 'root' },
  { id: 'alpha7',  label: 'α-7',    kind: 'primary' },
  { id: 'beta3',   label: 'β-3',    kind: 'primary' },
  { id: 'gamma1',  label: 'γ-1',    kind: 'primary' },
  { id: 'delta9',  label: 'δ-9',    kind: 'secondary' },
  { id: 'epsilon', label: 'ε-2',    kind: 'secondary' },
  { id: 'zeta4',   label: 'ζ-4',    kind: 'secondary' },
  { id: 'eta8',    label: 'η-8',    kind: 'secondary' },
  { id: 'theta1',  label: 'θ-1',    kind: 'secondary' },
  { id: 'iota5',   label: 'ι-5',    kind: 'secondary' },
]

const LINKS: Link[] = [
  { source: 'root', target: 'alpha7' },
  { source: 'root', target: 'beta3' },
  { source: 'root', target: 'gamma1' },
  { source: 'alpha7', target: 'delta9' },
  { source: 'alpha7', target: 'epsilon' },
  { source: 'beta3', target: 'zeta4' },
  { source: 'beta3', target: 'eta8' },
  { source: 'gamma1', target: 'theta1' },
  { source: 'gamma1', target: 'iota5' },
]

export default function MiniMesh({ width = 480, height = 280 }: { width?: number; height?: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const nodes = NODES.map(n => ({ ...n }))
    const links = LINKS.map(l => ({ ...l }))

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, d3.SimulationLinkDatum<Node>>(
        links.map(l => ({ source: l.source, target: l.target }))
      ).id(d => d.id).distance(60).strength(0.6))
      .force('charge', d3.forceManyBody<Node>().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<Node>().radius(d => (d.kind === 'root' ? 28 : d.kind === 'primary' ? 20 : 16)))

    const g = svg.append('g')

    const link = g.append('g')
      .attr('stroke', `${TRUSTMESH_ACCENT}55`)
      .attr('stroke-width', 1)
      .selectAll<SVGLineElement, d3.SimulationLinkDatum<Node>>('line')
      .data(simulation.force<d3.ForceLink<Node, d3.SimulationLinkDatum<Node>>>('link')!.links())
      .join('line')

    const nodeGroup = g.append('g')
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')

    nodeGroup.append('circle')
      .attr('r', d => (d.kind === 'root' ? 18 : d.kind === 'primary' ? 12 : 8))
      .attr('fill', d => (d.kind === 'root' ? '#F5C518' : d.kind === 'primary' ? TRUSTMESH_ACCENT : `${TRUSTMESH_ACCENT}80`))
      .attr('stroke', 'rgba(255,255,255,0.85)')
      .attr('stroke-width', d => (d.kind === 'root' ? 2 : 1))
      .attr('opacity', 0.95)
      .style('filter', d => (d.kind === 'root' ? 'drop-shadow(0 0 8px #F5C51866)' : `drop-shadow(0 0 6px ${TRUSTMESH_ACCENT}55)`))

    nodeGroup.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.kind === 'root' ? -24 : d.kind === 'primary' ? -18 : -14))
      .attr('fill', d => (d.kind === 'root' ? '#F5C518' : 'rgba(255,255,255,0.7)'))
      .attr('font-size', d => (d.kind === 'root' ? 11 : 9))
      .attr('font-family', 'system-ui')
      .style('pointer-events', 'none')

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x ?? 0)
        .attr('y1', d => (d.source as Node).y ?? 0)
        .attr('x2', d => (d.target as Node).x ?? 0)
        .attr('y2', d => (d.target as Node).y ?? 0)

      nodeGroup.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [width, height])

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{
        display: 'block',
        background: `radial-gradient(circle at 50% 50%, ${TRUSTMESH_ACCENT}15, transparent 65%)`,
        borderRadius: 12,
      }}
    />
  )
}
