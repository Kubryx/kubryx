// Built by vsrupeshkumar
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePlatformState } from '../../lib/platform-engine'
import { useOrgContext } from '../../lib/org-context'
import { useAutonomousOps, applyRecommendation, dismissRecommendation, addInteractionThread, clearMemory } from '../../lib/autonomous-ops'
import { useDigitalTwin } from '../../lib/digital-twin'
import { toast } from '../../lib/toast'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

export default function OperationsPage() {
  const { currentMode, activeScenario } = usePlatformState()
  const { currentOrgId, currentWorkspaceId, organizations } = useOrgContext()
  const {
    recommendations,
    aiMemory,
    operationalRiskScore,
    infrastructureConfidenceScore,
    aiOrchestrationHealth,
    activeAutomationCount,
    liveAnomalyDensity,
    walletTrustState,
    resilienceStatus,
    lastRecalculated
  } = useAutonomousOps()
  
  const { activeProfile, injectScenario } = useDigitalTwin()

  // Expanded "Why this recommendation?" expander states
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null)
  
  // AI memory assistant chat input
  const [userInput, setUserInput] = useState('')

  const activeOrg = organizations.find(o => o.id === currentOrgId) || organizations[0]
  const activeWorkspace = activeOrg.workspaces.find(w => w.id === currentWorkspaceId) || activeOrg.workspaces[0]

  const activeRecommendations = recommendations.filter(r => !r.applied && !r.dismissed)

  function handleSendChatMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!userInput.trim()) return

    const question = userInput
    setUserInput('')
    addInteractionThread('user', question)

    // AI dynamic reasoning response simulating contextual memory
    setTimeout(() => {
      let reply = `Executing trace lookup inside ${activeOrg.name} (${activeWorkspace.name}). `
      
      if (question.toLowerCase().includes('risk') || question.toLowerCase().includes('score')) {
        reply += `The current Operational Risk Score is ${operationalRiskScore}%, reflecting ${liveAnomalyDensity} active network anomalies and a status of "${resilienceStatus}".`
      } else if (question.toLowerCase().includes('recommend') || question.toLowerCase().includes('suggestion')) {
        reply += `I have queued ${activeRecommendations.length} active recommendation(s) in the ops deck, notably "${activeRecommendations[0]?.title || 'yield optimization'}" with a confidence metric of ${activeRecommendations[0]?.confidence || 95}%.`
      } else if (question.toLowerCase().includes('anomal') || question.toLowerCase().includes('outage') || question.toLowerCase().includes('rpc')) {
        if (activeScenario !== 'none') {
          reply += `Alert: System is currently running the "${activeProfile.name}" twin scenario. Anomaly trace indicates packet drifts on active nodes.`
        } else {
          reply += `Telemetry checks confirm nominal state. All 25 regional gateway endpoints report 100% uptime SLA.`
        }
      } else {
        reply += `Memory log confirms active session "${aiMemory.continuitySessionId}". All tools (Bill Split, Protocol Borrow Engine AI, Solana Agent Coordinator) are connected and synchronized under role context.`
      }

      addInteractionThread('assistant', reply)
      toast.success('AI Command Sync completed.')
    }, 800)
  }

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Back to Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Operations Center</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🎛️</span> Executive Operations Center
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={clearMemory}
            className="btn-outline" 
            style={{ padding: '8px 16px', fontSize: 12, height: 'auto' }}
          >
            🧹 Wipe Memory
          </button>
          <Link 
            href="/protocols"
            className="btn-gold" 
            style={{ padding: '8px 16px', fontSize: 12, height: 'auto', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            ⛓ Protocol Deck
          </Link>
        </div>
      </header>

      {/* Main SLA Indicators Dashboard Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        
        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Risk</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: operationalRiskScore > 50 ? '#EF4444' : operationalRiskScore > 20 ? '#F5C518' : '#10B981' }}>
              {operationalRiskScore}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>
            {operationalRiskScore > 50 ? '🔴 High Risk Anomaly State' : operationalRiskScore > 20 ? '🟡 Drifting Latency Warning' : '🟢 Nominal System Posture'}
          </span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Infrastructure SLA</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: infrastructureConfidenceScore < 98 ? '#EF4444' : '#fff' }}>
              {infrastructureConfidenceScore}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Uptime Confidence Rate</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Orchestration Health</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#F5C518' }}>
              {aiOrchestrationHealth}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Context Synchronized</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resilience Status</span>
            <strong style={{ display: 'block', fontSize: 22, fontWeight: 800, marginTop: 8, color: resilienceStatus === 'Nominal' ? '#10B981' : '#F5C518' }}>
              {resilienceStatus}
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Active Automations: {activeAutomationCount}</span>
        </article>

      </section>

      {/* Main Command Center Layout */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 24 }}>
        
        {/* Left Side: Node Operational Map & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Operational Map Matrix */}
          <article className="card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🗺 Global Infrastructure Operational Map</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Connected regional routing nodes managing decentralized Multi-Chain epoch sync states.
            </p>

            <div style={{ height: 200, background: '#040404', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              
              {/* Fake abstract visual grid represent map nodes */}
              <div style={{ display: 'flex', gap: 40, alignItems: 'center', zIndex: 5 }}>
                {[
                  { name: 'London Gateway', ip: 'rpc-lon-1', lat: '12ms', status: 'online', dot: '#10B981' },
                  { name: 'New York Relay', ip: 'rpc-nyc-4', lat: activeScenario === 'degraded_rpc' ? '920ms' : '42ms', status: activeScenario === 'degraded_rpc' ? 'lagging' : 'online', dot: activeScenario === 'degraded_rpc' ? '#F5C518' : '#10B981' },
                  { name: 'Singapore Hub', ip: 'rpc-sg-9', lat: activeScenario === 'chain_congestion' ? '310ms' : '88ms', status: activeScenario === 'chain_congestion' ? 'backlogged' : 'online', dot: activeScenario === 'chain_congestion' ? '#F5C518' : '#10B981' }
                ].map((node) => (
                  <div key={node.ip} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', background: node.dot, boxShadow: `0 0 10px ${node.dot}` }} />
                      <span style={{ position: 'absolute', inset: -4, border: `1px solid ${node.dot}`, borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>{node.name}</span>
                    <span style={{ fontSize: 9, color: '#888', fontFamily: 'monospace' }}>{node.ip} ({node.lat})</span>
                  </div>
                ))}
              </div>

              {/* Status footer inside map container */}
              <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                <span>Region coverage: 100%</span>
                <span>Active Anomalies: {liveAnomalyDensity}</span>
              </div>
            </div>
          </article>

          {/* Autonomous Recommendation Queue */}
          <article className="card" style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🧠 Autonomous Recommendation Queue</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
              Explainable AI recommendations derived automatically from active multi-chain telemetry.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeRecommendations.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>
                  <span style={{ fontSize: 32 }}>⬡</span>
                  <p style={{ margin: '6px 0 0', fontSize: 12 }}>No active recommendations pending. System optimized.</p>
                </div>
              ) : (
                activeRecommendations.map((rec) => {
                  const isExpanded = expandedRecId === rec.id
                  return (
                    <div 
                      key={rec.id}
                      style={{
                        padding: 16,
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: `4px solid ${rec.impact === 'high' ? '#EF4444' : '#F5C518'}`,
                        borderRadius: '0 8px 8px 0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <strong style={{ fontSize: 13, color: '#fff' }}>{rec.title}</strong>
                            <span style={{ fontSize: 9, background: 'rgba(245,197,24,0.06)', color: '#F5C518', padding: '1px 5px', borderRadius: 4 }}>
                              Confidence: {rec.confidence}%
                            </span>
                          </div>
                          <span style={{ fontSize: 10, color: '#888' }}>Tool: <strong style={{ color: '#ccc' }}>{rec.tool}</strong></span>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => {
                              applyRecommendation(rec.id)
                              toast.success(`Executed: ${rec.title}`)
                            }}
                            className="btn-gold"
                            style={{ padding: '4px 10px', fontSize: 11, height: 'auto' }}
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => dismissRecommendation(rec.id)}
                            className="btn-outline"
                            style={{ padding: '4px 10px', fontSize: 11, height: 'auto' }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>

                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#ccc', lineHeight: 1.4 }}>{rec.description}</p>

                      {/* Why explanation expander */}
                      <button
                        onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#F5C518',
                          fontSize: 11,
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {isExpanded ? '▼ Hide explainability trace' : '▶ Why this recommendation?'}
                      </button>

                      {isExpanded && (
                        <div 
                          style={{ 
                            marginTop: 12, 
                            padding: 12, 
                            background: '#040404', 
                            border: '1px solid rgba(255,255,255,0.04)', 
                            borderRadius: 6,
                            fontSize: 11
                          }}
                        >
                          <div style={{ marginBottom: 10 }}>
                            <strong style={{ color: '#F5C518', display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                              AI Reasoning Summary
                            </strong>
                            <p style={{ margin: 0, color: '#aaa', lineHeight: 1.4 }}>{rec.whyExplanation}</p>
                          </div>

                          <div>
                            <strong style={{ color: '#F5C518', display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                              Event Causality Chain
                            </strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 10, color: '#888' }}>
                              {rec.causalityChain.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                                  <span style={{ color: '#F5C518' }}>[{idx + 1}]</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )
                })
              )}
            </div>
          </article>

        </div>

        {/* Right Side: AI Assistant & Memory Continuity Thread */}
        <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🧠</span> AI Operational Memory
            </h3>
            <span style={{ fontSize: 10, color: '#888', display: 'block' }}>
              Persistent contextual thread • Session: <strong style={{ color: '#F5C518' }}>{aiMemory.continuitySessionId}</strong>
            </span>
          </div>

          {/* Dialogue Threads */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 12, 
              maxHeight: 380, 
              paddingRight: 6,
              marginBottom: 16
            }}
          >
            {aiMemory.interactionThreads.map((thread, idx) => {
              const isAssistant = thread.role === 'assistant'
              return (
                <div 
                  key={idx}
                  style={{
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isAssistant ? 'rgba(255,255,255,0.02)' : 'rgba(245,197,24,0.06)',
                    border: `1px solid ${isAssistant ? 'rgba(255,255,255,0.04)' : 'rgba(245,197,24,0.2)'}`,
                    fontSize: 11
                  }}
                >
                  <span style={{ display: 'block', fontSize: 8, color: '#888', marginBottom: 2 }}>
                    {isAssistant ? '🧠 KUBRYX AI' : '👤 USER'} • {new Date(thread.timestamp).toLocaleTimeString()}
                  </span>
                  <p style={{ margin: 0, color: '#fff', lineHeight: 1.4 }}>{thread.text}</p>
                </div>
              )
            })}
          </div>

          {/* Interactive Chat Form */}
          <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about active risk vectors, TVL, or anomalies..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 6,
                background: '#040404',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 11,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn-gold"
              style={{ padding: '0 16px', fontSize: 11, height: 'auto' }}
            >
              Ask AI
            </button>
          </form>

          {/* Operational history stats */}
          <div style={{ marginTop: 16, background: '#040404', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, padding: 10, fontSize: 10 }}>
            <strong style={{ color: '#888', textTransform: 'uppercase', fontSize: 9 }}>Applied History</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {aiMemory.historicalRecommendations.length === 0 ? (
                <span style={{ color: '#666', fontStyle: 'italic' }}>No recommendations applied in this session.</span>
              ) : (
                aiMemory.historicalRecommendations.slice(-3).map((h, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                    <span>✔ {h.title}</span>
                    <span style={{ color: '#666' }}>{h.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

      </section>

      {/* Incident summaries timeline */}
      <section className="card">
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🔍 System-Level Incident Tracing</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
          Historical logs capturing digital twin simulation cascades, telemetry outpaces, and auto-restorations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {aiMemory.pastAnomalies.length === 0 ? (
            <div style={{ padding: 12, textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: 11 }}>
              No incidents registered. Active telemetry reports nominal SLA.
            </div>
          ) : (
            aiMemory.pastAnomalies.slice(-5).map((inc, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  padding: '6px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#666' }}>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                  <span style={{ color: '#EF4444', fontWeight: 'bold' }}>INCIDENT #{100 + idx}</span>
                  <span style={{ color: '#ccc' }}>{inc.details}</span>
                </div>
                <span style={{ color: '#F5C518', fontFamily: 'monospace' }}>
                  Twin Replay
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
