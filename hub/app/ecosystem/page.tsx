'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGlobalOperations, KubryxEventType } from '../../lib/global-operations-engine'
import { useStrategicIntelligence } from '../../lib/strategic-intelligence-engine'
import { useCivilizationOrchestration, InstitutionalAgent, InterAgentNegotiation } from '../../lib/civilization-orchestration-engine'
import { toast } from '../../lib/toast'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

interface WebhookEvent {
  id: string
  name: string
  payload: string
  description: string
}

const DEFAULT_WEBHOOKS: WebhookEvent[] = [
  {
    id: 'evt-01',
    name: 'validator.drift_detected',
    description: 'Triggered when a validator node latency spikes or drifts past trust tolerances.',
    payload: JSON.stringify({
      event: 'validator.drift_detected',
      timestamp: new Date().toISOString(),
      data: {
        nodeId: 'val-04',
        driftLatencyMs: 125,
        confidenceThreshold: 90.0,
        resilienceStatus: 'degraded'
      }
    }, null, 2)
  },
  {
    id: 'evt-02',
    name: 'treasury.imbalance_logged',
    description: 'Dispatched when cross-chain payroll streams drift past the 15% balance gap guardrail.',
    payload: JSON.stringify({
      event: 'treasury.imbalance_logged',
      timestamp: new Date().toISOString(),
      data: {
        solanaReserve: 120500,
        qieReserve: 240900,
        driftRatio: '14.8%',
        actionRecommended: 'USDC rebalancing trigger'
      }
    }, null, 2)
  },
  {
    id: 'evt-03',
    name: 'consensus.healing_completed',
    description: 'Triggered upon successful recovery propagation of the self-healing validator consensus waves.',
    payload: JSON.stringify({
      event: 'consensus.healing_completed',
      timestamp: new Date().toISOString(),
      data: {
        recoveryEpoch: 'epoch-03',
        restorationTimeMs: 3500,
        healthRestored: '99.8%'
      }
    }, null, 2)
  }
]

export default function EcosystemPage() {
  const { 
    consensusIndex, 
    events: globalEvents, 
    snapshots: globalCheckpoints, 
    publish, 
    restoreSnapshot 
  } = useGlobalOperations()

  // Connect to Strategic Intelligence Layer
  const { recommendations, forecasts, activeMitigationPlan } = useStrategicIntelligence()

  // Connect to Civilization Orchestration Layer
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

  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent>(DEFAULT_WEBHOOKS[0])
  const [targetUrl, setTargetUrl] = useState('https://api.enterprise.dao/webhooks/kubryx')
  const [inspectPayload, setInspectPayload] = useState<string | null>(null)
  const [triggering, setTriggering] = useState(false)

  // Simulator Inputs
  const [customPayload, setCustomPayload] = useState('{\n  "status": "nominal",\n  "active": true\n}')
  const [customEventType, setCustomEventType] = useState<KubryxEventType>('kubryx_ecosystem_alert')
  const [customEventDesc, setCustomEventDesc] = useState('Custom ecosystem webhook telemetry dispatch.')

  // Strategic Explorer State
  const [selectedForecastTimeframe, setSelectedForecastTimeframe] = useState<'1-hour' | '24-hour' | '7-day'>('1-hour')

  // Phase 13 Sandbox States
  const [selectedSandboxAgent, setSelectedSandboxAgent] = useState<InstitutionalAgent>(agents[0])
  const [selectedSandboxNeg, setSelectedSandboxNeg] = useState<InterAgentNegotiation>(negotiations[0] || {
    id: 'neg-dummy',
    proposer: 'System',
    responder: 'All',
    topic: 'Quorum sync test',
    consensusRequired: 90,
    currentAlignment: 90,
    status: 'agreed',
    timestamp: new Date().toISOString()
  })
  const [simEventType, setSimEventType] = useState<
    | 'kubryx_agent_negotiation'
    | 'kubryx_agent_conflict'
    | 'kubryx_coalition_update'
    | 'kubryx_diplomatic_shift'
    | 'kubryx_recovery_alignment'
    | 'kubryx_institutional_alert'
    | 'kubryx_sovereign_recommendation'
  >('kubryx_agent_negotiation')
  const [simEventDesc, setSimEventDesc] = useState('Diplomatic agreement secured statefully.')

  function handleTriggerWebhook() {
    setTriggering(true)
    setTimeout(() => {
      setTriggering(false)
      setInspectPayload(selectedWebhook.payload)
      
      // Dispatch statefully to event bus
      publish(
        'kubryx_ecosystem_alert',
        selectedWebhook.payload,
        `Webhook payload dispatched: "${selectedWebhook.name}"`
      )
      toast.success(`Dispatched webhook event: ${selectedWebhook.name}`)
    }, 800)
  }

  function handleSendCustom() {
    if (!customPayload.trim() || !customEventDesc.trim()) return
    publish(customEventType, customPayload, customEventDesc)
    toast.success(`Dispatched custom event [${customEventType}]`)
  }

  function handleDispatchDiplomaticEvent() {
    publish(
      simEventType as any,
      JSON.stringify({ agent: selectedSandboxAgent.name, alignment: stabilizationAlignment }),
      `Diplomatic Sandbox Dispatch: ${simEventDesc}`
    )
    toast.success(`Dispatched agent event: ${simEventType}`)
  }

  const activeForecast = forecasts.find(f => f.timeframe === selectedForecastTimeframe) || forecasts[0]

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      
      {/* Header Panel */}
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Developer Portal</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>💻</span> Developer Portal & Webhooks Playground
          </h1>
        </div>

        <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
          <span style={{ fontSize: 10, color: '#888', display: 'block' }}>Operational Consensus</span>
          <strong style={{ fontSize: 16, color: '#F5C518' }}>{consensusIndex}%</strong>
        </div>
      </header>

      {/* Strategic Intelligence Explorer Section */}
      <section className="card" style={{ padding: 18, marginBottom: 24, border: '1px solid rgba(245,197,24,0.25)', background: 'rgba(245,197,24,0.01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F5C518', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🧠</span> Strategic Forecast & Scenario Payload Explorer
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>
              Inspect live REST API JSON schemas dynamically mapping consensus waves and mitigation restoration curves.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['1-hour', '24-hour', '7-day'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setSelectedForecastTimeframe(t)}
                className={selectedForecastTimeframe === t ? "btn-gold" : "btn-outline"}
                style={{ padding: '4px 10px', fontSize: 10, height: 'auto' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ padding: 10, background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <span style={{ fontSize: 9, color: '#888' }}>Consensus Trajectory</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#fff', marginTop: 4 }}>{activeForecast?.consensusTrajectory}%</strong>
            </div>
            <div style={{ padding: 10, background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <span style={{ fontSize: 9, color: '#888' }}>Treasury Stability</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#fff', marginTop: 4 }}>{activeForecast?.treasuryStability}%</strong>
            </div>
            <div style={{ padding: 10, background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <span style={{ fontSize: 9, color: '#888' }}>Governance Volatility</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#fff', marginTop: 4 }}>{activeForecast?.governanceVolatility}%</strong>
            </div>
            <div style={{ padding: 10, background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <span style={{ fontSize: 9, color: '#888' }}>Regional Resilience</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#fff', marginTop: 4 }}>{activeForecast?.regionalResilience}%</strong>
            </div>
            <div style={{ padding: 10, background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <span style={{ fontSize: 9, color: '#888' }}>Ecosystem Trust</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#fff', marginTop: 4 }}>{activeForecast?.ecosystemTrust}%</strong>
            </div>
            <div style={{ padding: 10, background: '#020202', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 6 }}>
              <span style={{ fontSize: 9, color: '#888' }}>AI Confidence Rate</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#fff', marginTop: 4 }}>{activeForecast?.aiConfidence}%</strong>
            </div>
          </div>

          <div style={{ background: '#020202', padding: 12, borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>REST API Payload Response</span>
            <pre style={{ flex: 1, margin: 0, padding: 8, background: '#050505', color: '#10B981', fontSize: 9, fontFamily: 'monospace', overflowX: 'auto', borderRadius: 4 }}>
{JSON.stringify({
  status: 'success',
  timeframe: selectedForecastTimeframe,
  metrics: {
    consensusTrajectory: activeForecast?.consensusTrajectory,
    treasuryStability: activeForecast?.treasuryStability,
    governanceVolatility: activeForecast?.governanceVolatility,
    regionalResilience: activeForecast?.regionalResilience,
    ecosystemTrust: activeForecast?.ecosystemTrust,
    aiConfidence: activeForecast?.aiConfidence
  },
  mitigationAvailable: !!activeMitigationPlan
}, null, 2)}
            </pre>
          </div>

        </div>
      </section>

      {/* Main Grid splits */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>
        
        {/* Left Side: Webhook Simulation Playgrounds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Simulated Webhook Playgrounds */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🔌 Live Enterprise Webhook Simulation Sandbox</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Select a preconfigured payload schema, designate your local webhook endpoints, and trigger real-time dispatch checks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Designated Webhook Endpoint</label>
                  <input 
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, borderRadius: 6, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Select Event Payload Schema</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {DEFAULT_WEBHOOKS.map((hook) => (
                      <div 
                        key={hook.id} 
                        onClick={() => setSelectedWebhook(hook)}
                        style={{
                          padding: 10,
                          background: selectedWebhook.id === hook.id ? 'rgba(245,197,24,0.06)' : 'rgba(255,255,255,0.01)',
                          border: selectedWebhook.id === hook.id ? '1px solid #F5C518' : '1px solid rgba(255,255,255,0.04)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <strong style={{ display: 'block', fontSize: 11, color: selectedWebhook.id === hook.id ? '#F5C518' : '#fff' }}>{hook.name}</strong>
                        <span style={{ fontSize: 9, color: '#888' }}>{hook.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleTriggerWebhook}
                  className="btn-gold"
                  style={{ width: '100%', padding: 10, fontSize: 12, marginTop: 8 }}
                  disabled={triggering}
                >
                  {triggering ? '⚡ Dispatched Payload...' : '🔌 Dispatch Webhook Payload'}
                </button>
              </div>

              {/* Inspect Webhook Panel */}
              <div style={{ background: '#020202', padding: 14, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Payload Schema Inspector</span>
                <pre style={{ flex: 1, margin: 0, padding: 8, background: '#050505', color: '#F5C518', fontSize: 10, fontFamily: 'monospace', overflowX: 'auto', borderRadius: 4, minHeight: 200 }}>
                  {inspectPayload || selectedWebhook.payload}
                </pre>
              </div>

            </div>
          </article>

          {/* PHASE 13 — MULTI-AGENT DEVELOPER REPLAY & DEBUGGER SANDBOX */}
          <article className="card" style={{ padding: 18, border: '1px solid rgba(245,197,24,0.3)', background: 'rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#F5C518' }}>🏛️ Multi-Agent Developer Replay & Debugger Sandbox</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Simulate inter-agent event dispatches, verify negotiation payloads, and debug multi-agent coalition matrices statefully.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* Agent Selector Tree */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Select Agent Replay Context</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedSandboxAgent(agent)}
                        style={{
                          padding: '6px 8px',
                          background: selectedSandboxAgent.id === agent.id ? 'rgba(245,197,24,0.06)' : 'rgba(255,255,255,0.01)',
                          border: selectedSandboxAgent.id === agent.id ? '1px solid #F5C518' : '1px solid rgba(255,255,255,0.03)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontSize: 10
                        }}
                      >
                        <span style={{ color: selectedSandboxAgent.id === agent.id ? '#F5C518' : '#fff', fontWeight: 'bold' }}>{agent.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diplomatic Event Dispatch Form */}
                <div style={{ padding: 10, background: '#020202', borderRadius: 6, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ display: 'block', fontSize: 10, color: '#888', marginBottom: 6 }}>Trigger Diplomatic Event Simulation</span>
                  
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <select
                      value={simEventType}
                      onChange={(e: any) => setSimEventType(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', background: '#050505', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 10, borderRadius: 4, outline: 'none' }}
                    >
                      <option value="kubryx_agent_negotiation">kubryx_agent_negotiation</option>
                      <option value="kubryx_agent_conflict">kubryx_agent_conflict</option>
                      <option value="kubryx_coalition_update">kubryx_coalition_update</option>
                      <option value="kubryx_diplomatic_shift">kubryx_diplomatic_shift</option>
                      <option value="kubryx_recovery_alignment">kubryx_recovery_alignment</option>
                      <option value="kubryx_institutional_alert">kubryx_institutional_alert</option>
                      <option value="kubryx_sovereign_recommendation">kubryx_sovereign_recommendation</option>
                    </select>

                    <button onClick={handleDispatchDiplomaticEvent} className="btn-gold" style={{ padding: '4px 10px', fontSize: 9 }}>🚀 Dispatch</button>
                  </div>

                  <input
                    type="text"
                    value={simEventDesc}
                    onChange={(e) => setSimEventDesc(e.target.value)}
                    placeholder="Describe custom sandbox trigger context..."
                    style={{ width: '100%', padding: '4px 8px', background: '#050505', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 10, borderRadius: 4, outline: 'none' }}
                  />
                </div>

                {/* Coalition Debugger Log */}
                <div style={{ padding: 10, background: '#020202', borderRadius: 6, border: '1px solid rgba(255,255,255,0.03)', fontSize: 11 }}>
                  <span style={{ display: 'block', fontSize: 10, color: '#888', marginBottom: 6 }}>Coalition Debugger State Dump</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Active Dispute Conflict:</span>
                    <strong style={{ color: activeConflict ? '#EF4444' : '#10B981' }}>{activeConflict ? 'YES' : 'NONE'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Coalition Consensus Index:</span>
                    <strong style={{ color: '#F5C518' }}>{coalitionScore}% Score</strong>
                  </div>
                </div>

              </div>

              {/* Negotiation & Telemetry Explorer Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                
                {/* Negotiation Payload selector */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Active Negotiations List</label>
                  <select
                    value={selectedSandboxNeg.id}
                    onChange={(e) => {
                      const matched = negotiations.find(n => n.id === e.target.value)
                      if (matched) setSelectedSandboxNeg(matched)
                    }}
                    style={{ width: '100%', padding: '6px 10px', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, borderRadius: 6, outline: 'none', marginBottom: 8 }}
                  >
                    {negotiations.map((neg) => (
                      <option key={neg.id} value={neg.id}>{neg.topic.slice(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                {/* Negotiation Payload Inspector */}
                <div style={{ flex: 1, background: '#020202', padding: 10, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Negotiation Payload Inspector</span>
                  <pre style={{ flex: 1, margin: 0, padding: 6, background: '#050505', color: '#10B981', fontSize: 9, fontFamily: 'monospace', overflowX: 'auto', borderRadius: 4 }}>
{JSON.stringify({
  negotiationId: selectedSandboxNeg.id,
  topic: selectedSandboxNeg.topic,
  proposer: selectedSandboxNeg.proposer,
  responder: selectedSandboxNeg.responder,
  alignmentRatio: `${selectedSandboxNeg.currentAlignment}%`,
  requiredConsensus: `${selectedSandboxNeg.consensusRequired}%`,
  agreementStatus: selectedSandboxNeg.status,
  timestamp: selectedSandboxNeg.timestamp
}, null, 2)}
                  </pre>
                </div>

              </div>

            </div>
          </article>

          {/* Webhook API dispatch playground */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>⛓️ Custom Event Dispatch Playground</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Craft custom events and dispatches to test localized network state listeners and boundary checks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSendCustom(); }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Select Target Event Type</label>
                  <select
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value as KubryxEventType)}
                    style={{ width: '100%', padding: '6px 10px', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, borderRadius: 6, outline: 'none' }}
                  >
                    <option value="kubryx_ecosystem_alert">kubryx_ecosystem_alert</option>
                    <option value="kubryx_region_outage">kubryx_region_outage</option>
                    <option value="kubryx_recovery_trigger">kubryx_recovery_trigger</option>
                    <option value="kubryx_governance_vote">kubryx_governance_vote</option>
                    <option value="kubryx_treasury_shift">kubryx_treasury_shift</option>
                    <option value="kubryx_policy_update">kubryx_policy_update</option>
                    <option value="kubryx_cognition_signal">kubryx_cognition_signal</option>
                    <option value="kubryx_protocol_sync">kubryx_protocol_sync</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Event Description</label>
                  <input 
                    type="text"
                    value={customEventDesc}
                    onChange={(e) => setCustomEventDesc(e.target.value)}
                    required
                    style={{ width: '100%', padding: '6px 10px', background: '#040404', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, borderRadius: 6, outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-outline" style={{ padding: 10, fontSize: 12, marginTop: 8 }}>⚡ Propagate Custom Event</button>
              </form>

              <div style={{ background: '#020202', padding: 14, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Custom Payload (JSON)</label>
                <textarea 
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  rows={6}
                  style={{ flex: 1, padding: 8, background: '#050505', color: '#10B981', fontSize: 10, fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, outline: 'none', resize: 'none' }}
                />
              </div>

            </div>
          </article>

        </div>

        {/* Right Side: Global strategic memory archives, checkpoints, recovery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Active Global Operations Event Bus Timelines */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>⛓️ Global Operations State Stream</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Real-time dispatches routed across the central global event synchronization layer.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
              {globalEvents.slice(0, 10).map((evt) => (
                <div 
                  key={evt.id} 
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.01)',
                    borderLeft: '2px solid #F5C518',
                    borderRadius: '0 4px 4px 0',
                    fontSize: 11
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#666', marginBottom: 2 }}>
                    <span>[{evt.type}]</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span style={{ color: '#fff', fontSize: 11 }}>{evt.description}</span>
                </div>
              ))}
            </div>
          </article>

          {/* Historical state snapshots */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>💾 Historic State Restore Console</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Compare and restore historical consensus checkpoint parameters statefully.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {globalCheckpoints.map((snap) => (
                <div 
                  key={snap.id}
                  style={{
                    padding: 10,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 11, color: '#fff' }}>{snap.description}</strong>
                    <span style={{ display: 'block', fontSize: 8, color: '#888', marginTop: 2 }}>
                      Consensus: {snap.consensusIndex}% • Votes: {snap.activeGovernanceVotes}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      restoreSnapshot(snap.id)
                      toast.success(`Restored snap state: "${snap.description}"`)
                    }}
                    className="btn-gold" 
                    style={{ padding: '3px 8px', fontSize: 10, height: 'auto' }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </article>

          {/* Operational API topology */}
          <article className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🏛️ Event Schema & API Topology</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              High-level structural outline of the sovereign operational fabric pathways.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 11 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,197,24,0.06)', border: '1px solid #F5C518', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 10, color: '#F5C518' }}>1</div>
                <div>
                  <strong style={{ color: '#fff' }}>Telemetry Ingestion Bus</strong>
                  <span style={{ display: 'block', fontSize: 9, color: '#888' }}>Monitors pings, latencies and packet overflows</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,197,24,0.06)', border: '1px solid #F5C518', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 10, color: '#F5C518' }}>2</div>
                <div>
                  <strong style={{ color: '#fff' }}>Cognitive Prioritizations</strong>
                  <span style={{ display: 'block', fontSize: 9, color: '#888' }}>Heuristic clusters analyze situational awareness indexes</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,197,24,0.06)', border: '1px solid #F5C518', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 10, color: '#F5C518' }}>3</div>
                <div>
                  <strong style={{ color: '#fff' }}>Consensus Policy Gating</strong>
                  <span style={{ display: 'block', fontSize: 9, color: '#888' }}>Enforces maximum drifts, block thresholds and key locks</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,197,24,0.06)', border: '1px solid #F5C518', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: 10, color: '#F5C518' }}>4</div>
                <div>
                  <strong style={{ color: '#fff' }}>Sovereign Edge execution</strong>
                  <span style={{ display: 'block', fontSize: 9, color: '#888' }}>Reroutes regional loads automatically across 5 deployment zones</span>
                </div>
              </div>
            </div>
          </article>

        </div>

      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
