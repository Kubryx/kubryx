'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePlatformState } from '../../lib/platform-engine'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

interface TechLayer {
  id: string
  name: string
  icon: string
  description: string
  technologies: string[]
  components: string[]
}

export default function ArchitecturePage() {
  const { activeScenario, analytics } = usePlatformState()
  const [selectedLayer, setSelectedLayer] = useState<string>('core')
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const layers: TechLayer[] = [
    {
      id: 'core',
      name: '1. Core OS Layer',
      icon: '⚙️',
      description: 'The foundation orchestrator managing client-side navigation, fault-tolerant proxy routing, local storage rotation, and the global reactive event loop.',
      technologies: ['Next.js Turbopack', 'React Hydration Protectors', 'Client Singleton Stores'],
      components: ['Dashboard Router', 'State Synchronizer', 'Resilience Gateway'],
    },
    {
      id: 'ai',
      name: '2. AI Intelligence Layer',
      icon: '🧠',
      description: 'Unified AI orchestrator powered by dynamic multi-prompt templates and stale cache models. Context is shared globally across credit calculation, stream optimizer, and loan negotiator.',
      technologies: ['Groq LLaMA-3 Pipeline', 'Dynamic Prompt Builders', 'Contextual Rebalancing Engine'],
      components: ['Lendora Negotiator', 'PalmFlow Payroll Advisor', 'Shadow Corporate Agents'],
    },
    {
      id: 'blockchain',
      name: '3. Blockchain Connectivity Layer',
      icon: '🔗',
      description: 'Direct multi-chain RPC bridge for state changes. Compiles freighter XDR envelopes, Phantom signMessage payloads, and QIE MetaMask transaction pipelines.',
      technologies: ['Freighter API', 'MetaMask Web3 Provider', 'Tweetnacl Cryptography'],
      components: ['Soroban split contract', 'QIE Soulbound NFT', 'Solana Devnet state records'],
    },
    {
      id: 'telemetry',
      name: '4. Telemetry & Reliability Layer',
      icon: '🛡️',
      description: 'Observability suite logging RPC call performance in milliseconds, managing exponential backoff retries, and serving stale local cache structures to achieve high SLA availability.',
      technologies: ['6-Second AbortController', 'Exponential Backoff Algorithms', 'Telemetry Cache Overlay'],
      components: ['API Resilience Layer', 'localStorage Diagnostics Console', 'Uptime Estimator'],
    },
    {
      id: 'security',
      name: '5. Security & Wallet Layer',
      icon: '🔑',
      description: 'Protects key routing paths, validates Phantom signature authenticity via detatched verifying protocols, and isolates zero-metadata transactions.',
      technologies: ['Ed25519 nacl signatures', 'Zero-Metadata Routing keys', 'EVM chain switching checks'],
      components: ['Phantom Ed25519 Verifier', 'Staking lockup modules', 'Private Vault bridge checks'],
    },
    {
      id: 'dashboard',
      name: '6. Unified Dashboard Layer',
      icon: '📊',
      description: 'The executive command center aggregate showing roundtrip response latencies, active contract trackers, command execution consoles, and system analytics graphs.',
      technologies: ['CSS Flexboards', 'Custom SVG Canvas', 'Dynamic State Listeners'],
      components: ['Unified SLA Matrix', 'Activity Event Timeline', 'Action Recommendation board'],
    },
  ]

  const nodes = [
    { id: 'wallet', label: 'Multi-Wallet Layer', layer: 'security', x: 250, y: 350 },
    { id: 'resilience', label: 'Resilience Layer', layer: 'telemetry', x: 250, y: 220 },
    { id: 'ai-os', label: 'AI OS Context', layer: 'ai', x: 250, y: 90 },
    
    // Tools
    { id: 'credit', label: 'CreditBlocks', layer: 'blockchain', x: 80, y: 150 },
    { id: 'lend', label: 'AI Lending', layer: 'ai', x: 80, y: 230 },
    { id: 'split', label: 'SyncSplit', layer: 'blockchain', x: 80, y: 310 },
    
    { id: 'agents', label: 'Agent Mesh', layer: 'security', x: 420, y: 150 },
    { id: 'shadow', label: 'Shadow OS', layer: 'ai', x: 420, y: 230 },
    { id: 'treasury', label: 'Treasury AI', layer: 'blockchain', x: 420, y: 310 },
    
    // Global Console & Dash
    { id: 'console', label: 'Telemetry Console', layer: 'telemetry', x: 140, y: 410 },
    { id: 'dashboard-node', label: 'Unified Dashboard', layer: 'dashboard', x: 360, y: 410 },
  ]

  const connections = [
    { from: 'wallet', to: 'resilience', type: 'secure' },
    { from: 'resilience', to: 'ai-os', type: 'data' },
    
    { from: 'ai-os', to: 'credit', type: 'intelligence' },
    { from: 'ai-os', to: 'lend', type: 'intelligence' },
    { from: 'ai-os', to: 'shadow', type: 'intelligence' },
    { from: 'ai-os', to: 'treasury', type: 'intelligence' },
    
    { from: 'resilience', to: 'split', type: 'health' },
    { from: 'resilience', to: 'agents', type: 'health' },
    { from: 'resilience', to: 'vault', type: 'health' },
    
    { from: 'wallet', to: 'console', type: 'log' },
    { from: 'wallet', to: 'dashboard-node', type: 'log' },
  ]

  const currentLayer = layers.find((l) => l.id === selectedLayer) || layers[0]

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Back to Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>OS Architecture</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🏛️</span> OS Architecture View
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, background: 'rgba(245, 197, 24, 0.1)', color: '#F5C518', border: '1px solid rgba(245, 197, 24, 0.3)', padding: '4px 10px', borderRadius: 20 }}>
            Topology Model V2.5
          </span>
          {activeScenario !== 'none' && (
            <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: 20 }}>
              Simulation Active
            </span>
          )}
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Interactive SVG Canvas */}
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>Interactive Topology Map</h2>
            <span style={{ fontSize: 11, color: '#888' }}>Hover nodes to trace pathways</span>
          </div>
          
          <div style={{ position: 'relative', width: '100%', background: '#030303', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 8, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <svg 
              viewBox="0 0 500 450" 
              style={{ width: '100%', height: '100%', maxHeight: 440 }}
            >
              {/* Pulsing connections */}
              {connections.map((c, i) => {
                const fNode = nodes.find((n) => n.id === c.from)
                const tNode = nodes.find((n) => n.id === c.to)
                if (!fNode || !tNode) return null
                
                const isHighlighted = 
                  selectedLayer === fNode.layer || 
                  selectedLayer === tNode.layer ||
                  hoveredNode === fNode.id ||
                  hoveredNode === tNode.id

                return (
                  <g key={i}>
                    <line
                      x1={fNode.x}
                      y1={fNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={isHighlighted ? '#F5C518' : 'rgba(255,255,255,0.08)'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={c.type === 'secure' ? '4 2' : undefined}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    {isHighlighted && (
                      <circle r="3" fill="#F5C518">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path={`M ${fNode.x} ${fNode.y} L ${tNode.x} ${tNode.y}`}
                        />
                      </circle>
                    )}
                  </g>
                )
              })}

              {/* Node Circles */}
              {nodes.map((n) => {
                const isSelected = selectedLayer === n.layer
                const isHovered = hoveredNode === n.id
                
                let fill = '#0a0a0a'
                let stroke = 'rgba(255,255,255,0.15)'
                
                if (isSelected || isHovered) {
                  fill = 'rgba(245, 197, 24, 0.1)'
                  stroke = '#F5C518'
                } else if (n.layer === 'security') {
                  stroke = 'rgba(239, 68, 68, 0.4)'
                } else if (n.layer === 'telemetry') {
                  stroke = 'rgba(34, 197, 94, 0.4)'
                }

                return (
                  <g 
                    key={n.id}
                    onMouseEnter={() => setHoveredNode(n.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedLayer(n.layer)}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.id === 'ai-os' || n.id === 'wallet' ? 24 : 18}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1}
                      style={{ transition: 'all 0.2s' }}
                    />
                    {(isSelected || isHovered) && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={n.id === 'ai-os' || n.id === 'wallet' ? 30 : 24}
                        fill="none"
                        stroke="#F5C518"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                        className="pulse-circle"
                      />
                    )}
                    <text
                      x={n.x}
                      y={n.y + (n.id === 'ai-os' || n.id === 'wallet' ? 36 : 30)}
                      textAnchor="middle"
                      fill={isSelected || isHovered ? '#F5C518' : '#aaa'}
                      fontSize="9"
                      fontWeight={isSelected || isHovered ? 700 : 400}
                      fontFamily="monospace"
                      style={{ transition: 'all 0.2s' }}
                    >
                      {n.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Sidebar layer details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>OS System Layers</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {layers.map((layer) => {
                const isActive = selectedLayer === layer.id
                return (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className="btn-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      textAlign: 'left',
                      borderColor: isActive ? '#F5C518' : 'rgba(255,255,255,0.08)',
                      background: isActive ? 'rgba(245,197,24,0.05)' : '#070707',
                      color: isActive ? '#F5C518' : '#ccc',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{layer.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{layer.name}</span>
                    <span>{isActive ? '▼' : '▶'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '3px solid #F5C518' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#fff' }}>{currentLayer.name}</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#ccc', lineHeight: 1.4 }}>{currentLayer.description}</p>
            
            <h4 style={{ margin: '14px 0 6px', fontSize: 11, color: '#F5C518', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Stack Techs</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {currentLayer.technologies.map((t, idx) => (
                <span key={idx} style={{ fontSize: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, color: '#aaa' }}>{t}</span>
              ))}
            </div>

            <h4 style={{ margin: '14px 0 6px', fontSize: 11, color: '#F5C518', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layer Components</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {currentLayer.components.map((c, idx) => (
                <span key={idx} style={{ fontSize: 10, background: 'rgba(245,197,24,0.05)', border: '1px solid rgba(245,197,24,0.15)', padding: '2px 8px', borderRadius: 4, color: '#fff' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .pulse-circle {
          animation: mapPulse 2s infinite ease-out;
          transform-origin: center;
        }
        @keyframes mapPulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
