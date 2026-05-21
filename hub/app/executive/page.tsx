// Built by vsrupeshkumar
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSovereignOps } from '../../lib/sovereign-ops'
import { useEconomicOps } from '../../lib/economic-ops'
import { useGlobalMemory } from '../../lib/global-memory'
import { usePlatformState } from '../../lib/platform-engine'
import { useAutonomousOps } from '../../lib/autonomous-ops'
import { useCognition } from '../../lib/cognition-engine'
import { useFabric } from '../../lib/fabric-engine'
import { useGlobalOperations } from '../../lib/global-operations-engine'
import { useStrategicIntelligence } from '../../lib/strategic-intelligence-engine'
import { useCivilizationOrchestration } from '../../lib/civilization-orchestration-engine'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

export default function ExecutivePage() {
  const { proposals, sovereigntyIndex, consensusStability, quorumIntegrity, threats, toggleThreat } = useSovereignOps()
  const { treasuryEquilibriumIndex, treasuryPressureLevel, rebalanceIncentives } = useEconomicOps()
  const { snapshots: memSnapshots, restoreSnapshot: memRestore } = useGlobalMemory()
  const { activeScenario, currentMode } = usePlatformState()
  const { operationalRiskScore, infrastructureConfidenceScore } = useAutonomousOps()

  // Cognition Engine integrations
  const { livingTelemetry, clusters, chronicle, ecosystemScore, orchestrationPressure, healingSimulationActive, archiveMaturityEpoch, triggerSelfHealing } = useCognition()

  // Fabric Engine integrations
  const { regions, compatibility, maturityScore, ecosystemTrustForecast, failoverInProgress, toggleOutage } = useFabric()

  // Global Operations State Synchronization Hook
  const { 
    consensusIndex, 
    infrastructureHealth, 
    driftIndex, 
    aiConfidence, 
    events: globalEvents, 
    takeSnapshot: globalTakeSnapshot, 
    restoreSnapshot: globalRestoreSnapshot,
    snapshots: globalCheckpoints 
  } = useGlobalOperations()

  // Strategic Intelligence Hook
  const {
    recommendations,
    forecasts,
    activeMitigationPlan,
    memoryEpochs,
    strategicConfidence,
    archiveEpoch
  } = useStrategicIntelligence()

  // Civilization Orchestration Hook
  const {
    agents,
    negotiations,
    diplomaticRelations,
    coalitionScore,
    negotiationConfidence,
    stabilizationAlignment,
    activeConflict,
    triggerInstability,
    simulateDeadlock,
    initiateNegotiation,
    replayCrisis,
    stabilizeTrust,
    restoreEquilibrium
  } = useCivilizationOrchestration()

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null)
  
  // Custom Epoch Form
  const [epochNameInput, setEpochNameInput] = useState('')
  const [epochSummaryInput, setEpochSummaryInput] = useState('')
  const [showEpochModal, setShowEpochModal] = useState(false)

  // Custom Snapshot Name Form
  const [snapNameInput, setSnapNameInput] = useState('')

  function handleRestore(id: string) {
    globalRestoreSnapshot(id)
    setSelectedSnapshotId(id)
    setTimeout(() => {
      setSelectedSnapshotId(null)
    }, 2000)
  }

  function handleTakeSnapshot(e: React.FormEvent) {
    e.preventDefault()
    if (!snapNameInput.trim()) return
    globalTakeSnapshot(snapNameInput)
    setSnapNameInput('')
  }

  function handleArchiveEpoch(e: React.FormEvent) {
    e.preventDefault()
    if (!epochNameInput.trim() || !epochSummaryInput.trim()) return
    archiveMaturityEpoch(epochNameInput, epochSummaryInput)
    setEpochNameInput('')
    setEpochSummaryInput('')
    setShowEpochModal(false)
  }

  const activePolicyQueueCount = proposals.filter(p => p.status === 'voting').length
  const activeThreatsCount = threats.filter(t => t.compromiseSimulationActive).length

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      
      {/* Header Panel */}
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Executive Control Board</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👑</span> Sovereign Executive Command Board
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={triggerSelfHealing}
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: 12, borderColor: 'rgba(16,185,129,0.3)', color: '#10B981' }}
            disabled={healingSimulationActive}
          >
            {healingSimulationActive ? '🧬 Healing System...' : '🛡️ Trigger Self-Healing'}
          </button>
          <button
            onClick={() => setShowEpochModal(true)}
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            ✍️ Archive Maturity Epoch
          </button>
          <button
            onClick={rebalanceIncentives}
            className="btn-gold"
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            ⚖️ Balance Incentives
          </button>
        </div>
      </header>

      {/* Strategic Intelligence Console Panel */}
      <section className="card" style={{ padding: 18, marginBottom: 24, border: '1px solid rgba(245,197,24,0.25)', background: 'rgba(245,197,24,0.01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#F5C518', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🧠</span> Autonomous Strategic Intelligence Console
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>
              Operates predictive scenario forecasts, AI strategic recommendations, and multi-step sovereign mitigation plans.
            </p>
          </div>
          <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: '#888', display: 'block' }}>Strategic Confidence</span>
            <strong style={{ fontSize: 16, color: '#F5C518' }}>{strategicConfidence}%</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          
          {/* AI Recommendation Feed */}
          <div style={{ background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6, padding: 14 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Recommendation Feed</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, maxHeight: 180, overflowY: 'auto' }}>
              {recommendations.map((rec) => (
                <div key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                    <strong style={{ color: '#fff' }}>{rec.title}</strong>
                    <span style={{ color: '#F5C518' }}>+{rec.estimatedGain}% Gain</span>
                  </div>
                  <span style={{ display: 'block', fontSize: 10, color: '#888' }}>{rec.description}</span>
                  <div style={{ display: 'flex', gap: 6, fontSize: 8, color: '#666', marginTop: 4, fontFamily: 'monospace' }}>
                    <span>Severity: <strong style={{ color: rec.severity === 'critical' ? '#EF4444' : '#aaa' }}>{rec.severity}</strong></span>
                    <span>Confidence: {rec.confidenceScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous Mitigation Timeline */}
          <div style={{ background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6, padding: 14 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mitigation Planner</span>
            {activeMitigationPlan ? (
              <div style={{ marginTop: 8 }}>
                <strong style={{ display: 'block', fontSize: 12, color: '#EF4444', marginBottom: 6 }}>{activeMitigationPlan.title}</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeMitigationPlan.steps.map((step, idx) => (
                    <div key={idx} style={{ fontSize: 10, color: '#ccc', display: 'flex', gap: 6 }}>
                      <span style={{ color: '#F5C518' }}>✔</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <span style={{ display: 'block', fontSize: 9, color: '#666', marginTop: 8 }}>Restoration Curve: 4s Autonomous Healing Target</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6, paddingTop: 20 }}>
                <span style={{ fontSize: 24 }}>🛡️</span>
                <span style={{ fontSize: 11, marginTop: 4 }}>Nominal: zero regional outages active.</span>
              </div>
            )}
          </div>

          {/* Strategic Risk Heatmap & Projections */}
          <div style={{ background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6, padding: 14 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consensus Forecast Matrix</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
              {forecasts.map((f) => (
                <div key={f.timeframe} style={{ padding: 8, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 4, textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: 10, color: '#F5C518' }}>{f.timeframe}</strong>
                  <strong style={{ display: 'block', fontSize: 14, color: '#fff', margin: '4px 0' }}>{f.consensusTrajectory}%</strong>
                  <span style={{ fontSize: 8, color: '#666' }}>Consensus</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginTop: 12 }}>
              <span>resilience: <strong style={{ color: '#aaa' }}>{forecasts[0]?.regionalResilience}%</strong></span>
              <span>ecosystem trust: <strong style={{ color: '#aaa' }}>{forecasts[0]?.ecosystemTrust}%</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* PHASE 13 - EXECUTIVE CIVILIZATION COMMAND CENTER */}
      <section className="card" style={{ padding: 18, marginBottom: 24, border: '1px solid rgba(245,197,24,0.3)', background: 'rgba(0,0,0,0.4)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#F5C518', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏛️</span> Executive Civilization Command Center
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>
              Civilization-scale multi-agent coordination system. 6 institutional agents harmonizing protocol-scale economies and infrastructures statefully.
            </p>
          </div>

          {/* Interactive Simulation Panel */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={initiateNegotiation} className="btn-outline" style={{ padding: '6px 12px', fontSize: 10 }}>🤝 Propose Action</button>
            <button onClick={simulateDeadlock} className="btn-outline" style={{ padding: '6px 12px', fontSize: 10, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}>⚠️ Deadlock</button>
            <button onClick={triggerInstability} className="btn-outline" style={{ padding: '6px 12px', fontSize: 10, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}>💥 Trigger Drift</button>
            <button onClick={replayCrisis} className="btn-outline" style={{ padding: '6px 12px', fontSize: 10, color: '#F5C518', borderColor: 'rgba(245,197,24,0.2)' }}>⚡ Replay Crisis</button>
            <button onClick={stabilizeTrust} className="btn-outline" style={{ padding: '6px 12px', fontSize: 10, color: '#10B981', borderColor: 'rgba(16,185,129,0.2)' }}>🛡️ Stabilize Trust</button>
            <button onClick={restoreEquilibrium} className="btn-gold" style={{ padding: '6px 12px', fontSize: 10 }}>🔄 Restore Equilibrium</button>
          </div>
        </header>

        {/* Global Coalition Stability Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
          <div style={{ padding: 12, background: '#020202', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Coalition Stability Score</span>
            <strong style={{ display: 'block', fontSize: 24, color: '#F5C518', marginTop: 4 }}>{coalitionScore}%</strong>
            <span style={{ fontSize: 8, color: '#666', display: 'block', marginTop: 4 }}>Harmonized agent alignment</span>
          </div>

          <div style={{ padding: 12, background: '#020202', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Negotiation Confidence</span>
            <strong style={{ display: 'block', fontSize: 24, color: '#10B981', marginTop: 4 }}>{negotiationConfidence}%</strong>
            <span style={{ fontSize: 8, color: '#666', display: 'block', marginTop: 4 }}>Agreement threshold safety</span>
          </div>

          <div style={{ padding: 12, background: '#020202', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Stabilization Alignment</span>
            <strong style={{ display: 'block', fontSize: 24, color: '#fff', marginTop: 4 }}>{stabilizationAlignment}%</strong>
            <span style={{ fontSize: 8, color: '#666', display: 'block', marginTop: 4 }}>Policy check integrity</span>
          </div>

          <div style={{ padding: 12, background: '#020202', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Active Crisis Conflict</span>
            <strong style={{ display: 'block', fontSize: 11, color: activeConflict ? '#EF4444' : '#10B981', marginTop: 8, minHeight: 30, overflow: 'hidden' }}>
              {activeConflict || 'Nominal Equilibrium Secured'}
            </strong>
          </div>
        </div>

        {/* Autonomous Agent Command Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginBottom: 18 }}>
          {agents.map((agent) => (
            <div 
              key={agent.id}
              style={{
                padding: 14,
                background: '#020202',
                border: '1px solid rgba(255,255,255,0.03)',
                borderTop: agent.status === 'active_dispute' ? '2px solid #EF4444' : '2px solid #F5C518',
                borderRadius: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <strong style={{ fontSize: 13, color: '#fff', display: 'block' }}>{agent.name}</strong>
                  <span style={{ fontSize: 9, color: '#666' }}>{agent.role}</span>
                </div>
                <span 
                  style={{
                    fontSize: 8,
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    background: agent.status === 'active_dispute' ? 'rgba(239,68,68,0.1)' : 'rgba(245,197,24,0.1)',
                    color: agent.status === 'active_dispute' ? '#EF4444' : '#F5C518'
                  }}
                >
                  {agent.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, margin: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: 6 }}>
                <span>Confidence: <strong style={{ color: '#fff' }}>{agent.confidence}%</strong></span>
                <span>Trust: <strong style={{ color: '#fff' }}>{agent.trustWeight}%</strong></span>
                <span>Influence: <strong style={{ color: '#fff' }}>{agent.influenceRate}%</strong></span>
              </div>

              <span style={{ display: 'block', fontSize: 10, color: '#888', fontStyle: 'italic', marginBottom: 8 }}>
                Intent: {agent.intent}
              </span>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {agent.responsibility.map((resp, idx) => (
                  <span key={idx} style={{ fontSize: 8, background: 'rgba(255,255,255,0.03)', color: '#aaa', padding: '1px 4px', borderRadius: 3 }}>
                    {resp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Diplomacy Stream & Sovereign Negotiation Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
          
          <div style={{ background: '#020202', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6, padding: 14 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Sovereign Negotiation Feed</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto' }}>
              {negotiations.map((neg) => (
                <div key={neg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <strong style={{ color: '#fff' }}>{neg.topic}</strong>
                    <span 
                      style={{ 
                        fontSize: 8, 
                        fontWeight: 'bold', 
                        color: neg.status === 'agreed' ? '#10B981' : neg.status === 'disputed' ? '#EF4444' : '#F5C518',
                        textTransform: 'uppercase'
                      }}
                    >
                      {neg.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginTop: 4 }}>
                    <span>Proposer: <strong style={{ color: '#aaa' }}>{neg.proposer}</strong> • Responder: <strong style={{ color: '#aaa' }}>{neg.responder}</strong></span>
                    <span>Alignment: {neg.currentAlignment}% / {neg.consensusRequired}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#020202', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6, padding: 14 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Institutional Diplomacy Stream</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
              {diplomaticRelations.slice(0, 8).map((rel, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <strong style={{ color: '#fff' }}>{rel.fromAgent.split(' ')[0]}</strong>
                    <span style={{ color: '#666' }}>⇄</span>
                    <strong style={{ color: '#fff' }}>{rel.toAgent.split(' ')[0]}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span>Trust: <strong style={{ color: '#F5C518' }}>{rel.trustScore}%</strong></span>
                    <span>Align: <strong style={{ color: '#10B981' }}>{rel.alignmentScore}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Global Consensus Monitor & Stability Meter Dashboard */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 24 }}>
        
        {/* Consensus Stability Meter */}
        <article className="card" style={{ padding: 18, display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.01)', border: '4px solid rgba(245,197,24,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Consensus</span>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#F5C518' }}>{consensusIndex}%</strong>
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '4px solid #F5C518', borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: `rotate(${consensusIndex * 3.6}deg)`, transition: 'transform 0.5s ease' }} />
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Consensus Stability Monitor</span>
            <h3 style={{ margin: '4px 0', fontSize: 18, fontWeight: 800, color: '#fff' }}>Sovereign Sync Network Status</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.4 }}>
              Authoritative operational confidence metric computed dynamically across multi-region quorums, ledger synchronization trust, and AI validation backoffs.
            </p>
          </div>
        </article>

        {/* Operational Drift Detection */}
        <article className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Drift Detection</span>
              <span style={{ fontSize: 9, background: 'rgba(239,68,68,0.08)', color: '#EF4444', padding: '2px 6px', borderRadius: 4 }}>ACTIVE WAVE</span>
            </div>
            <strong style={{ display: 'block', fontSize: 26, fontWeight: 800, marginTop: 6, color: '#fff' }}>
              ±{driftIndex}% drift rate
            </strong>
          </div>
          <span style={{ fontSize: 10, color: '#888' }}>Sinusoidal fluctuation targeting APY sweep boundaries.</span>
        </article>

      </section>

      {/* Living Infrastructure Telemetry Dashboard Indicators */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        
        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sovereignty & Ecosystem</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#F5C518' }}>
              {sovereigntyIndex}% / {ecosystemScore}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Sovereign Index & Interdependency Health</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mempool Pressure</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#fff' }}>
              {livingTelemetry.mempoolPressure} TPS
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Entropy Index: <strong style={{ color: '#ccc' }}>{livingTelemetry.entropyIndex}%</strong></span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orchestration Pressure</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#10B981' }}>
              {orchestrationPressure}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Stabilization Forecast: <strong style={{ color: '#F5C518' }}>{livingTelemetry.stabilizationForecast}%</strong></span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maturity & Trust Forecast</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#F5C518' }}>
              {maturityScore}% / {ecosystemTrustForecast}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Active Failovers: <strong style={{ color: failoverInProgress ? '#EF4444' : '#10B981' }}>{failoverInProgress ? 'YES (Rerouting)' : 'None'}</strong></span>
        </article>

      </section>

      {/* Deployment Realism Zone Mapping Map */}
      <section className="card" style={{ padding: 18, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🌍 Active Deployment Zones & Infrastructure Regions</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
          Real-time RPC latency mapping, geo-balancing resilience scores, and simulated regional outage controllers.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {regions.map((region) => (
            <div 
              key={region.name}
              style={{
                padding: 14,
                background: region.status === 'outage' ? 'rgba(239,68,68,0.03)' : 'rgba(255,255,255,0.01)',
                border: region.status === 'outage' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.03)',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 8
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 13, color: '#fff' }}>{region.name}</strong>
                  <span style={{ fontSize: 9, color: '#888', fontFamily: 'monospace' }}>{region.zone}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8 }}>
                  <span style={{ color: '#888' }}>Latency:</span>
                  <strong style={{ color: region.status === 'outage' ? '#EF4444' : '#10B981' }}>
                    {region.status === 'outage' ? 'OFFLINE' : `${region.latency}ms`}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: '#888' }}>Resilience:</span>
                  <strong style={{ color: '#aaa' }}>{region.resilienceScore}%</strong>
                </div>

                <div style={{ fontSize: 10, color: '#666', marginTop: 4, fontFamily: 'monospace' }}>
                  Failover Target: {region.failoverTarget}
                </div>
              </div>

              <button
                onClick={() => toggleOutage(region.name)}
                className="btn-outline"
                style={{
                  padding: '4px',
                  fontSize: 10,
                  width: '100%',
                  borderColor: region.status === 'outage' ? '#10B981' : 'rgba(239,68,68,0.25)',
                  color: region.status === 'outage' ? '#10B981' : '#EF4444',
                  marginTop: 6
                }}
              >
                {region.status === 'outage' ? '🔌 Power On Region' : '💥 Simulate Outage'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Main Panel Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>
        
        {/* Left Side: Living behaviors, cognition, and graphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Sovereign state timeline stream */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>⛓️ Sovereign Global Event Bus Timeline</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Continuous, event-driven ledger stream logging governance proposals, regional shifts, and webhook playground dispatches.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
              {globalEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.01)',
                    borderLeft: '2px solid #F5C518',
                    borderRadius: '0 6px 6px 0',
                    fontSize: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', color: '#F5C518', fontSize: 10 }}>[{evt.type}]</span>
                    <span style={{ fontSize: 9, color: '#666' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: '#fff' }}>{evt.description}</div>
                </div>
              ))}
            </div>
          </article>

          {/* Distributed Cognition & situational awareness */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🧠 Distributed Operational Cognition Layer</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Specialized heuristic reasoning clusters scanning active network events and prioritizations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {clusters.map((cluster) => (
                <div 
                  key={cluster.id}
                  style={{
                    padding: 14,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, color: '#fff' }}>{cluster.nodeName}</strong>
                    <span style={{ fontSize: 10, background: 'rgba(245,197,24,0.06)', color: '#F5C518', padding: '2px 6px', borderRadius: 4 }}>
                      Cognition Confidence: {cluster.cognitionScore}%
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    <span>Prioritized Threat/Anomaly: </span>
                    <strong style={{ color: '#F5C518' }}>{cluster.prioritizedAnomaly}</strong>
                  </div>

                  <div style={{ fontSize: 10, color: '#777', fontFamily: 'monospace', marginTop: 6, padding: '4px 8px', background: '#040404', borderRadius: 4 }}>
                    Heuristic Rule: {cluster.heuristicRule}
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Living Volatility & Drift Graphs */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>📈 Live Volatility & Drift Indicators</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Continuous telemetry fluctuations reflecting mempool capacity waves and RPC congestion indexes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              
              <div style={{ background: '#030303', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6, padding: 12 }}>
                <span style={{ fontSize: 10, color: '#888' }}>Validator Reliability Drift</span>
                <strong style={{ display: 'block', fontSize: 20, color: '#fff', margin: '4px 0' }}>
                  {livingTelemetry.validatorParticipation}%
                </strong>
                <div style={{ height: 4, background: '#0a0a0a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${livingTelemetry.validatorParticipation}%`, background: '#F5C518', height: '100%' }} />
                </div>
              </div>

              <div style={{ background: '#030303', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6, padding: 12 }}>
                <span style={{ fontSize: 10, color: '#888' }}>RPC Ingestion Congestion</span>
                <strong style={{ display: 'block', fontSize: 20, color: '#fff', margin: '4px 0' }}>
                  {livingTelemetry.rpcFluctuationRate}ms
                </strong>
                <div style={{ height: 4, background: '#0a0a0a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, livingTelemetry.rpcFluctuationRate / 5)}%`, background: '#EF4444', height: '100%' }} />
                </div>
              </div>

            </div>
          </article>

        </div>

        {/* Right Side: Snapshots, security simulations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Active security threat simulations */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🛡️ Active Security & Telemetry Threat Simulations</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Simulate threat scenarios statefully to evaluate automatic boundary recovery and security policy locks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {threats.map((threat) => (
                <div 
                  key={threat.vector} 
                  style={{
                    padding: 12,
                    background: threat.compromiseSimulationActive ? 'rgba(239,68,68,0.03)' : 'rgba(255,255,255,0.01)',
                    border: threat.compromiseSimulationActive ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 12, color: '#fff' }}>{threat.vector}</strong>
                    <span style={{ display: 'block', fontSize: 8, color: '#888', marginTop: 2 }}>
                      Severity: {threat.severity} • Likelihood: {threat.likelihood}%
                    </span>
                  </div>

                  <button
                    onClick={() => toggleThreat(threat.vector)}
                    className="btn-outline"
                    style={{
                      padding: '4px 10px',
                      fontSize: 10,
                      height: 'auto',
                      borderColor: threat.compromiseSimulationActive ? '#10B981' : 'rgba(239,68,68,0.25)',
                      color: threat.compromiseSimulationActive ? '#10B981' : '#EF4444'
                    }}
                  >
                    {threat.compromiseSimulationActive ? 'Resolve threat' : 'Trigger Threat'}
                  </button>
                </div>
              ))}
            </div>
          </article>

          {/* Historical state snapshots */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>💾 Global Strategic Memory Archive Checkpoints</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Compare historical consensus states and restore parameters statefully.
            </p>

            <form onSubmit={handleTakeSnapshot} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input 
                type="text"
                value={snapNameInput}
                onChange={(e) => setSnapNameInput(e.target.value)}
                placeholder="Checkpoint label..."
                required
                style={{ flex: 1, padding: '6px 10px', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, borderRadius: 6, outline: 'none' }}
              />
              <button type="submit" className="btn-outline" style={{ padding: '6px 12px', fontSize: 11, minWidth: 100 }}>📸 Take Snap</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {globalCheckpoints.map((snap) => {
                const isRestoring = selectedSnapshotId === snap.id
                return (
                  <div 
                    key={snap.id}
                    style={{
                      padding: 12,
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 12, color: '#fff' }}>{snap.description}</strong>
                      <span style={{ display: 'block', fontSize: 9, color: '#888', marginTop: 2 }}>
                        Captured: {new Date(snap.timestamp).toLocaleString()} • Consensus Score: {snap.consensusIndex}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleRestore(snap.id)}
                      className="btn-gold"
                      style={{ padding: '4px 10px', fontSize: 11, height: 'auto' }}
                      disabled={isRestoring}
                    >
                      {isRestoring ? '⌛ Restoring...' : '🔄 Restore State'}
                    </button>
                  </div>
                )
              })}
            </div>
          </article>

        </div>

      </section>

      {/* Epoch Archive Modal */}
      {showEpochModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '90%', maxWidth: 450, padding: 24, border: '1px solid rgba(245,197,24,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Archive Maturity Epoch</h3>
              <button onClick={() => setShowEpochModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleArchiveEpoch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Epoch Name</label>
                <input 
                  type="text"
                  value={epochNameInput}
                  onChange={(e) => setEpochNameInput(e.target.value)}
                  placeholder="e.g. Core Staking Quorum Upgrade"
                  required
                  style={{ width: '100%', padding: '8px 12px', background: '#040404', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, borderRadius: 6, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Maturity Chronicle Summary</label>
                <textarea 
                  value={epochSummaryInput}
                  onChange={(e) => setEpochSummaryInput(e.target.value)}
                  placeholder="Summarize the core structural upgrades, compliance additions, or performance adjustments..."
                  required
                  rows={4}
                  style={{ width: '100%', padding: '8px 12px', background: '#040404', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, borderRadius: 6, outline: 'none', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{ padding: '10px', fontSize: 12, fontWeight: 'bold', marginTop: 8 }}
              >
                Archive Epoch statefully
              </button>
            </form>
          </div>
        </div>
      )}

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
