// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePlatformState } from '../../lib/platform-engine'
import { useOrgContext } from '../../lib/org-context'
import { useAgentEconomy } from '../../lib/agent-economy'
import { usePredictiveOps } from '../../lib/predictive-ops'
import { useGlobalMemory } from '../../lib/global-memory'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

export default function CoordinationPage() {
  const { currentMode, activeScenario, analytics } = usePlatformState()
  const { currentOrgId, currentWorkspaceId, organizations, tenantUptimeScores } = useOrgContext()
  const { agents, tasks, balanceWorkloads, propagateTask } = useAgentEconomy()
  const { chainOutlooks, advisories, aggregateStressIndex } = usePredictiveOps()
  const { snapshots, createSnapshot } = useGlobalMemory()

  // Coordination Replay System States
  const [replayActive, setReplayActive] = useState(false)
  const [replayTick, setReplayTick] = useState(0)
  const [bottleneckDetected, setBottleneckDetected] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  
  // Custom Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskRole, setNewTaskRole] = useState<any>('Yield Operations Hub Agent')
  const [newTaskChain, setNewTaskChain] = useState('QIE Mainnet')

  const activeOrg = organizations.find(o => o.id === currentOrgId) || organizations[0]
  const activeWorkspace = activeOrg.workspaces.find(w => w.id === currentWorkspaceId) || activeOrg.workspaces[0]
  
  // Dynamic Replay Loop Simulation
  useEffect(() => {
    if (!replayActive) return
    const interval = setInterval(() => {
      setReplayTick(prev => (prev + 1) % 6)
    }, 2500)
    return () => clearInterval(interval)
  }, [replayActive])

  // Latency Bottleneck Detection
  useEffect(() => {
    // If scenario indicates bad latency or stress index is high
    if (activeScenario === 'degraded_rpc' || activeScenario === 'latency_crisis' || aggregateStressIndex > 40) {
      setBottleneckDetected(true)
    } else {
      setBottleneckDetected(false)
    }
  }, [activeScenario, aggregateStressIndex])

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    propagateTask(newTaskTitle, newTaskRole, newTaskChain, 'medium')
    setNewTaskTitle('')
  }

  // Network coordination propagation logs
  const propagationLogs = [
    { time: '00ms', text: 'Task dispatched to agent economy mesh.' },
    { time: '12ms', text: 'Consensus verified by Zero-Knowledge signature certificates.' },
    { time: '45ms', text: 'Multichain state sync block emitted.' },
    { time: '180ms', text: 'Stellar transaction ledger successfully split payout.' },
    { time: '340ms', text: 'EVM Mainnet lock verified.' }
  ]

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      
      {/* Header Panel */}
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Coordination Center</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🔗</span> Distributed Protocol Coordination
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setReplayActive(!replayActive)}
            className="btn-outline"
            style={{
              padding: '8px 16px',
              fontSize: 12,
              borderColor: replayActive ? '#F5C518' : 'rgba(255,255,255,0.15)',
              color: replayActive ? '#F5C518' : '#aaa',
              background: replayActive ? 'rgba(245,197,24,0.05)' : '#000'
            }}
          >
            {replayActive ? '⏸ Stop Replay' : '▶ Coordination Replay Mode'}
          </button>
          
          <button
            onClick={balanceWorkloads}
            className="btn-gold"
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            ⚖️ Workload Balance
          </button>
        </div>
      </header>

      {/* Alarms and Posture Indicators */}
      {bottleneckDetected && (
        <section 
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'pulse 2s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong style={{ color: '#EF4444', fontSize: 13 }}>SLA BOTTLENECK DETECTED</strong>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#ccc' }}>
                Multi-chain synchronization latency has degraded past critical thresholds. Cache failover loops activated.
              </p>
            </div>
          </div>
          <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>
            Risk Score: {aggregateStressIndex}%
          </span>
        </section>
      )}

      {/* Main Core Dashboard Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>
        
        {/* Left Side: Topology Graph and Dependency Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Visual SVG Dependency Grid */}
          <article className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🌐 Multi-Chain Communication Mesh</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                  Interactive dependency graph mapping agent propagation paths across mainnet nodes.
                </p>
              </div>
              <span style={{ fontSize: 10, color: '#888' }}>Replay Step: <strong style={{ color: '#F5C518' }}>{replayTick + 1}/6</strong></span>
            </div>

            <div style={{ position: 'relative', height: 280, background: '#030303', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 8, overflow: 'hidden' }}>
              <svg viewBox="0 0 500 280" style={{ width: '100%', height: '100%' }}>
                
                {/* Connection paths */}
                <line x1="80" y1="140" x2="250" y2="60" stroke={replayTick === 1 ? '#F5C518' : 'rgba(255,255,255,0.05)'} strokeWidth={replayTick === 1 ? 3 : 1} />
                <line x1="80" y1="140" x2="250" y2="220" stroke={replayTick === 2 ? '#F5C518' : 'rgba(255,255,255,0.05)'} strokeWidth={replayTick === 2 ? 3 : 1} />
                <line x1="250" y1="60" x2="420" y2="140" stroke={replayTick === 3 ? '#F5C518' : 'rgba(255,255,255,0.05)'} strokeWidth={replayTick === 3 ? 3 : 1} />
                <line x1="250" y1="220" x2="420" y2="140" stroke={replayTick === 4 ? '#F5C518' : 'rgba(255,255,255,0.05)'} strokeWidth={replayTick === 4 ? 3 : 1} />
                <line x1="80" y1="140" x2="420" y2="140" stroke={replayTick === 5 ? '#F5C518' : 'rgba(255,255,255,0.05)'} strokeWidth={replayTick === 5 ? 3 : 1} />

                {/* Animated propagation signal packets */}
                {replayActive && (
                  <circle r="4" fill="#F5C518">
                    <animateMotion
                      dur="5s"
                      repeatCount="indefinite"
                      path="M 80 140 L 250 60 L 420 140 L 250 220 L 80 140 Z"
                    />
                  </circle>
                )}

                {/* Core Nodes */}
                {[
                  { id: 'node-qie', x: 80, y: 140, name: 'QIE Gateway', color: '#10B981' },
                  { id: 'node-sol', x: 250, y: 60, name: 'Solana Devnet', color: bottleneckDetected ? '#EF4444' : '#10B981' },
                  { id: 'node-stellar', x: 250, y: 220, name: 'Stellar Testnet', color: '#10B981' },
                  { id: 'node-arb', x: 420, y: 140, name: 'Arbitrum One', color: '#10B981' }
                ].map((node) => {
                  const isHovered = selectedNode === node.id
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHovered ? 16 : 12}
                        fill="#0a0a0a"
                        stroke={isHovered ? '#F5C518' : node.color}
                        strokeWidth="2"
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <text
                        x={node.x}
                        y={node.y + 26}
                        fill="#fff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {node.name}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Node Metadata Detail Overlay */}
              {selectedNode && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(7,7,7,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    padding: 10,
                    width: 180,
                    fontSize: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ color: '#F5C518' }}>
                      {selectedNode === 'node-qie' ? 'QIE Mainnet' : selectedNode === 'node-sol' ? 'Solana Devnet' : selectedNode === 'node-stellar' ? 'Stellar Testnet' : 'Arbitrum One'}
                    </strong>
                    <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 10, cursor: 'pointer' }}>Close</button>
                  </div>
                  <span style={{ display: 'block', color: '#aaa', marginBottom: 2 }}>Average Latency: {selectedNode === 'node-sol' && bottleneckDetected ? '920ms' : '45ms'}</span>
                  <span style={{ display: 'block', color: '#aaa' }}>Consistency Score: 99.8%</span>
                </div>
              )}
            </div>
          </article>

          {/* Cross-Chain Operational Sync Matrix */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>📊 Multi-Chain Synchronization Matrix</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Real-time synchronization status monitoring across distinct ledger topologies.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {chainOutlooks.map((out) => (
                <div 
                  key={out.chainName}
                  style={{
                    padding: 12,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ fontSize: 12, color: '#fff' }}>{out.chainName}</strong>
                    <span 
                      style={{ 
                        fontSize: 8, 
                        background: out.reliabilityOutlook === 'Optimal' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', 
                        color: out.reliabilityOutlook === 'Optimal' ? '#10B981' : '#EF4444', 
                        padding: '1px 5px', 
                        borderRadius: 4,
                        fontWeight: 'bold'
                      }}
                    >
                      {out.reliabilityOutlook}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 4 }}>
                    <span>Forecast Latency:</span>
                    <strong style={{ color: '#ccc' }}>{out.forecastLatency[0]}ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginTop: 4 }}>
                    <span>Imbalance Probability:</span>
                    <strong style={{ color: '#ccc' }}>{out.forecastImbalanceProbability}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </article>

        </div>

        {/* Right Side: Distributed Agent Coordination Registries & Task Queues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Active Distributed Agents */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🤖 Distributed Agent Registries</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              8 automated digital twin agents running stateful operational role assignments.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
              {agents.map((ag) => (
                <div 
                  key={ag.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 6,
                    fontSize: 11
                  }}
                >
                  <div>
                    <strong style={{ color: '#fff' }}>{ag.name}</strong>
                    <span style={{ display: 'block', fontSize: 9, color: '#888' }}>{ag.role}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 'bold', color: ag.workload > 80 ? '#EF4444' : '#F5C518' }}>
                      Load: {ag.workload}%
                    </span>
                    <span style={{ fontSize: 9, color: '#888' }}>Trust: {ag.trustScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Task Propagation Form */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>⚙️ Propagate Operational Task</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Delegate multi-chain telemetry tasks statefully to autonomous registries.
            </p>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Audit Soroban pay payout allocations"
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#040404',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: 11,
                  outline: 'none'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select
                  value={newTaskRole}
                  onChange={(e) => setNewTaskRole(e.target.value as any)}
                  style={{
                    padding: '8px 8px',
                    borderRadius: 6,
                    background: '#040404',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: 11,
                    outline: 'none'
                  }}
                >
                  <option value="Yield Operations Hub Agent">Yield Operations Hub Agent</option>
                  <option value="Risk Agent">Risk Agent</option>
                  <option value="Security Agent">Security Agent</option>
                  <option value="Compliance Agent">Compliance Agent</option>
                </select>

                <select
                  value={newTaskChain}
                  onChange={(e) => setNewTaskChain(e.target.value)}
                  style={{
                    padding: '8px 8px',
                    borderRadius: 6,
                    background: '#040404',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: 11,
                    outline: 'none'
                  }}
                >
                  <option value="QIE Mainnet">QIE Mainnet</option>
                  <option value="Solana Devnet">Solana Devnet</option>
                  <option value="Stellar Testnet">Stellar Testnet</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{ padding: '8px 16px', fontSize: 11, fontWeight: 'bold' }}
              >
                Propagate Task
              </button>
            </form>
          </article>

        </div>

      </section>

      {/* Event Tracer & Lineage Logs */}
      <section className="card" style={{ padding: 18 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🔍 Real-time Event Cascade & Trace Log</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
          Historical decision lineage and sub-second multi-sig event tracking.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'monospace', fontSize: 11 }}>
          {propagationLogs.map((log, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                gap: 16,
                padding: '6px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                color: idx === replayTick ? '#F5C518' : '#888',
                background: idx === replayTick ? 'rgba(245,197,24,0.02)' : 'transparent',
                borderRadius: 4,
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ color: idx === replayTick ? '#F5C518' : '#555', width: 50 }}>[{log.time}]</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
