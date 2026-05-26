// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from '../../lib/toast'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'
import { getTelemetryErrors } from '../../lib/telemetry'
import { usePlatformState } from '../../lib/platform-engine'

interface DevEndpoint {
  id: string
  method: 'GET' | 'POST'
  path: string
  description: string
  tool: string
  params: { name: string; type: string; required: boolean; description: string }[]
  requestBody: Record<string, any>
  responseBody: Record<string, any>
}

interface WebhookSchema {
  event: string
  description: string
  payload: Record<string, any>
}

const ENDPOINTS: DevEndpoint[] = [
  {
    id: 'ep-score',
    method: 'GET',
    path: '/api/score/{walletAddress}',
    tool: 'CreditBlocks',
    description: 'Calculates the dynamic QIE multi-chain Creditblocks rating of a wallet.',
    params: [
      { name: 'walletAddress', type: 'string', required: true, description: 'EVM public wallet address on QIE Mainnet' }
    ],
    requestBody: {},
    responseBody: {
      success: true,
      wallet: '0x08DA91C81cebD27d181cA732615379f185FbFb51',
      score: 742,
      grade: 'A',
      ncrdStaked: 500,
      ncrdBalance: 1000,
      timestamp: '2026-05-17T19:34:17Z',
      status: 'Active verified'
    }
  },
  {
    id: 'ep-deploy',
    method: 'POST',
    path: '/api/agents/deploy',
    tool: 'Agent Coordinator',
    description: 'Verifies Phantom signatures and deploys stateful, autonomous worker agents on Solana.',
    params: [
      { name: 'wallet', type: 'string', required: true, description: 'Solana wallet address' },
      { name: 'agentType', type: 'string', required: true, description: 'Agent class, e.g. Yield Operations HubGuard, RiskEscalator' },
      { name: 'parameters', type: 'object', required: true, description: 'Runtime frequency and trigger configurations' }
    ],
    requestBody: {
      wallet: '8xJ25Kq8p5wLz9vK2...',
      agentType: 'Yield Operations HubGuard',
      parameters: {
        alertThreshold: '150 SOL',
        frequencySeconds: 60
      }
    },
    responseBody: {
      success: true,
      agentId: 'sol-agent-88402',
      status: 'deployed',
      signatureVerified: true,
      explorerUrl: 'https://explorer.solana.com/address/sol-agent-88402?cluster=devnet',
      txHash: '5xRp9KqL2zWpM1nB9wLp3kMp...'
    }
  },
  {
    id: 'ep-private-trade',
    method: 'POST',
    path: '/api/vaults/private-trade',
    tool: 'Private Vault',
    description: 'Locks key metadata and executes cross-chain zero-knowledge trade streams via Private vault routing.',
    params: [
      { name: 'fromChain', type: 'string', required: true, description: 'Source blockchain' },
      { name: 'toChain', type: 'string', required: true, description: 'Destination blockchain' },
      { name: 'amount', type: 'number', required: true, description: 'Asset quantum to trade' }
    ],
    requestBody: {
      fromChain: 'QIE Mainnet',
      toChain: 'Solana Devnet',
      asset: 'USDC',
      amount: 1500,
      recipient: '8xJ25Kq8p5wLz9vK2...'
    },
    responseBody: {
      success: true,
      tradeId: 'cipher-trade-0482',
      fromTxHash: '0x94827c1f8a2bc54d92ef...',
      bridgeStatus: 'watching',
      privacyRating: 'Optimal zero-metadata key routing active'
    }
  },
  {
    id: 'ep-payroll',
    method: 'POST',
    path: '/api/treasury/stream',
    tool: 'Yield Operations Hub',
    description: 'Deploys a multi-sig smart flow that streams real-time payroll balances to employee wallets.',
    params: [
      { name: 'recipient', type: 'string', required: true, description: 'Solana payout address' },
      { name: 'ratePerSec', type: 'number', required: true, description: 'SOL streams rate per second' }
    ],
    requestBody: {
      recipient: 'Ge8pKq7zWp8xLz9vK...',
      ratePerSec: 0.00045,
      token: 'SOL',
      title: 'Senior Protocol Contributor Payroll Stream'
    },
    responseBody: {
      success: true,
      streamId: 'stream-8849',
      active: true,
      explorerUrl: 'https://explorer.solana.com/tx/3hKq7zWp...devnet',
      streamParameters: {
        recipient: 'Ge8pKq7zWp8xLz9vK...',
        ratePerSec: 0.00045
      }
    }
  }
]

const WEBHOOK_SCHEMAS: WebhookSchema[] = [
  {
    event: 'telemetry.rpc_anomaly',
    description: 'Triggered when remote blockchain RPC latency breaches nominal SLA bounds.',
    payload: {
      event: 'telemetry.rpc_anomaly',
      timestamp: '2026-05-17T19:34:17Z',
      data: {
        source: 'Solana Devnet',
        measuredLatencyMs: 980,
        status: 'degraded',
        failoverActivated: true
      }
    }
  },
  {
    event: 'security.key_compromise_threat',
    description: 'Triggered by Private Vault threat analyzers when unauthorized routing attempts match high-risk contracts.',
    payload: {
      event: 'security.key_compromise_threat',
      timestamp: '2026-05-17T19:34:17Z',
      data: {
        unauthorizedAddress: '0x992B95C85cebE27d181cA...',
        riskLevel: 'CRITICAL',
        mitigationAction: 'ROUTING_KEY_LOCKDOWN'
      }
    }
  },
  {
    event: 'treasury.balance_drift',
    description: 'Triggered by PalmFlow AI scheduler when payroll stream balances slip out of compliance bands.',
    payload: {
      event: 'treasury.balance_drift',
      timestamp: '2026-05-17T19:34:17Z',
      data: {
        activeStreams: 2,
        driftPercentage: 16.4,
        rebalanceActionRecommended: true
      }
    }
  }
]

export default function DevelopersPage() {
  const { analytics } = usePlatformState()
  const [activeCategory, setActiveCategory] = useState<'api' | 'webhooks' | 'schemas' | 'logs'>('api')
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0)
  const [customPayload, setCustomPayload] = useState<string>('')
  const [mockResponse, setMockResponse] = useState<string>('')
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false)
  
  // Timeline UI metrics
  const [gatewayStatus, setGatewayStatus] = useState<number>(200)
  const [timelineMetrics, setTimelineMetrics] = useState<{ dns: number; tcp: number; proxy: number; roundtrip: number } | null>(null)
  
  // Validation alert messages
  const [validationAlert, setValidationAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // Webhook Simulator
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/kubryx-webhooks')
  const [selectedWebhookIndex, setSelectedWebhookIndex] = useState(0)
  const [webhookLogs, setWebhookLogs] = useState<{ id: string; event: string; status: 'delivered' | 'failed'; timestamp: string; payload: string }[]>([])
  const [sendingWebhook, setSendingWebhook] = useState(false)

  const activeEndpoint = ENDPOINTS[selectedEndpointIndex]

  // Initialize payload input when endpoint shifts
  useEffect(() => {
    setCustomPayload(JSON.stringify(activeEndpoint.requestBody, null, 2))
    setMockResponse('')
    setValidationAlert(null)
    setTimelineMetrics(null)
  }, [selectedEndpointIndex])

  function handlePayloadChange(value: string) {
    setCustomPayload(value)
    
    // Auto validate JSON formatting
    try {
      if (!value.trim()) {
        setValidationAlert(null)
        return
      }
      const parsed = JSON.parse(value)
      
      // Perform simple schema checking
      if (activeEndpoint.method === 'POST') {
        const missingKeys = Object.keys(activeEndpoint.requestBody).filter(
          k => !(k in parsed)
        )
        if (missingKeys.length > 0) {
          setValidationAlert({
            type: 'error',
            message: `Linter warning: Missing recommended keys: [${missingKeys.join(', ')}]`
          })
          return
        }
      }
      
      setValidationAlert({
        type: 'success',
        message: 'JSON structure compliant. Validator checks successful.'
      })
    } catch (e: any) {
      setValidationAlert({
        type: 'error',
        message: `JSON syntax error: ${e.message}`
      })
    }
  }

  function handleTestEndpoint() {
    // 1. Verify JSON validity before execution
    try {
      if (activeEndpoint.method === 'POST') {
        JSON.parse(customPayload)
      }
    } catch {
      toast.error('Cannot invoke mock: JSON payload is invalid.')
      return
    }

    setTestingEndpoint(true)
    setMockResponse('')
    setTimelineMetrics(null)
    
    // Simulate timeline metrics based on Gateway Status simulation
    const responseDelay = gatewayStatus === 200 ? 60 + Math.floor(Math.random() * 20) : gatewayStatus === 429 ? 12 : 980
    
    setTimeout(() => {
      if (gatewayStatus === 200) {
        setMockResponse(JSON.stringify(activeEndpoint.responseBody, null, 2))
        setTimelineMetrics({
          dns: 4,
          tcp: 8,
          proxy: responseDelay - 12,
          roundtrip: responseDelay
        })
        toast.success('Mock API call executed successfully!')
      } else if (gatewayStatus === 429) {
        setMockResponse(JSON.stringify({
          error: 'RateLimitExceeded',
          code: 429,
          message: 'Client request rate exceeds threshold limit (100req/sec). Backoff active.'
        }, null, 2))
        setTimelineMetrics({
          dns: 2,
          tcp: 3,
          proxy: 7,
          roundtrip: 12
        })
        toast.error('API Gateway Rate Limit Exceeded')
      } else {
        setMockResponse(JSON.stringify({
          error: 'ServiceUnavailable',
          code: 503,
          message: 'Remote blockchain node timeout. Ingestion fallback failover engaged.'
        }, null, 2))
        setTimelineMetrics({
          dns: 4,
          tcp: 12,
          proxy: 964,
          roundtrip: 980
        })
        toast.warning('RPC Gateway Error: Engaged Fallback registries.')
      }
      
      setTestingEndpoint(false)
    }, 600)
  }

  function handleSendWebhook() {
    if (!webhookUrl.trim()) {
      toast.error('Please specify a destination webhook endpoint.')
      return
    }

    setSendingWebhook(true)
    const activeHook = WEBHOOK_SCHEMAS[selectedWebhookIndex]

    setTimeout(() => {
      const newLog = {
        id: `wh-log-${Date.now()}`,
        event: activeHook.event,
        status: 'delivered' as const,
        timestamp: new Date().toLocaleTimeString(),
        payload: JSON.stringify(activeHook.payload, null, 2)
      }
      setWebhookLogs(prev => [newLog, ...prev])
      setSendingWebhook(false)
      toast.success(`Webhook event [${activeHook.event}] dispatched!`)
    }, 800)
  }

  function copyText(text: string) {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text)
      toast.success('Text copied to clipboard')
    }
  }

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Back to Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Developer Portal</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🛠️</span> Kubryx Developer Platform
          </h1>
        </div>
      </header>

      {/* Gateway Status Controller Card */}
      <section className="card" style={{ marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(180deg, rgba(245, 197, 24, 0.02) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(245, 197, 24, 0.2)' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, color: '#F5C518', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gateway Simulation Controller
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#ccc' }}>
            Toggle simulated response headers and latency states to test client handler robustness.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <button 
            onClick={() => { setGatewayStatus(200); toast.success('API Gateway Status: 200 OK') }}
            className="btn-outline" 
            style={{ 
              borderColor: gatewayStatus === 200 ? '#10B981' : 'rgba(255,255,255,0.08)', 
              background: gatewayStatus === 200 ? 'rgba(16,185,129,0.05)' : 'transparent',
              color: gatewayStatus === 200 ? '#10B981' : '#fff',
              fontSize: 12
            }}
          >
            ● 200 OK (Nominal)
          </button>
          
          <button 
            onClick={() => { setGatewayStatus(429); toast.success('API Gateway Status: 429 Rate Limited') }}
            className="btn-outline" 
            style={{ 
              borderColor: gatewayStatus === 429 ? '#EF4444' : 'rgba(255,255,255,0.08)', 
              background: gatewayStatus === 429 ? 'rgba(239,68,68,0.05)' : 'transparent',
              color: gatewayStatus === 429 ? '#EF4444' : '#fff',
              fontSize: 12
            }}
          >
            ⚠ 429 Rate Limited
          </button>
          
          <button 
            onClick={() => { setGatewayStatus(503); toast.success('API Gateway Status: 503 RPC Degraded') }}
            className="btn-outline" 
            style={{ 
              borderColor: gatewayStatus === 503 ? '#F5C518' : 'rgba(255,255,255,0.08)', 
              background: gatewayStatus === 503 ? 'rgba(245,197,24,0.05)' : 'transparent',
              color: gatewayStatus === 503 ? '#F5C518' : '#fff',
              fontSize: 12
            }}
          >
            🛑 503 RPC Degradation
          </button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Left Navigations Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Platform Explorer</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {[
                { id: 'api', label: 'API Endpoint Explorer', icon: '⚡' },
                { id: 'webhooks', label: 'Webhook Simulator', icon: '📬' },
                { id: 'schemas', label: 'Event Schema Browser', icon: '📜' },
                { id: 'logs', label: 'Diagnostics Trace Logs', icon: '📊' }
              ].map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id as any); setMockResponse('') }} 
                  className="btn-outline" 
                  style={{ 
                    justifyContent: 'flex-start',
                    gap: 10,
                    fontSize: 12,
                    borderColor: activeCategory === cat.id ? '#F5C518' : 'rgba(255,255,255,0.08)',
                    background: activeCategory === cat.id ? 'rgba(245,197,24,0.04)' : 'transparent',
                    color: activeCategory === cat.id ? '#F5C518' : '#fff'
                  }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* List endpoints if active category is api */}
            {activeCategory === 'api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>End Points</span>
                {ENDPOINTS.map((ep, idx) => {
                  const isActive = selectedEndpointIndex === idx
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpointIndex(idx)}
                      className="btn-outline"
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 4,
                        borderColor: isActive ? '#F5C518' : 'rgba(255,255,255,0.08)',
                        background: isActive ? 'rgba(245,197,24,0.04)' : '#000'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span 
                          style={{ 
                            fontSize: 8, 
                            fontWeight: 800, 
                            color: ep.method === 'POST' ? '#3B82F6' : '#10B981',
                            background: ep.method === 'POST' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                            padding: '1px 5px',
                            borderRadius: 3
                          }}
                        >
                          {ep.method}
                        </span>
                        <strong style={{ fontSize: 12, color: isActive ? '#F5C518' : '#fff' }}>{ep.path}</strong>
                      </div>
                      <span style={{ fontSize: 9, opacity: 0.6, background: 'rgba(255,255,255,0.04)', padding: '1px 4px', borderRadius: 2 }}>
                        {ep.tool}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Active Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, gridColumn: 'span 2' }}>
          
          {/* 1. API Endpoints Workspace */}
          {activeCategory === 'api' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Endpoint Header */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, background: activeEndpoint.method === 'POST' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: activeEndpoint.method === 'POST' ? '#3B82F6' : '#10B981', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                    {activeEndpoint.method}
                  </span>
                  <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>{activeEndpoint.path}</h2>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ccc' }}>{activeEndpoint.description}</p>
              </div>

              {/* Param definitions */}
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: 12, color: '#F5C518', textTransform: 'uppercase' }}>Parameters</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeEndpoint.params.map((p) => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 6 }}>
                      <span>
                        <code style={{ color: '#F5C518', fontWeight: 600 }}>{p.name}</code>
                        <span style={{ color: '#666', fontSize: 10, marginLeft: 6 }}>({p.type})</span>
                        {p.required && <span style={{ color: '#EF4444', fontSize: 9, marginLeft: 6, fontWeight: 800 }}>REQUIRED</span>}
                      </span>
                      <span style={{ color: '#888' }}>{p.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload Linter & Validation Alert */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontSize: 12, color: '#F5C518', textTransform: 'uppercase' }}>Request Body (Payload Editor)</h4>
                  {activeEndpoint.method === 'POST' && (
                    <span style={{ fontSize: 10, color: '#888' }}>JSON compliant linter active</span>
                  )}
                </div>

                <textarea
                  value={customPayload}
                  onChange={(e) => handlePayloadChange(e.target.value)}
                  disabled={activeEndpoint.method === 'GET'}
                  style={{
                    width: '100%',
                    height: 120,
                    padding: 12,
                    background: '#040404',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: activeEndpoint.method === 'GET' ? '#666' : '#10B981',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    outline: 'none',
                    resize: 'none'
                  }}
                />

                {validationAlert && (
                  <div 
                    style={{ 
                      marginTop: 8, 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      fontSize: 11,
                      background: validationAlert.type === 'error' ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)',
                      border: `1px solid ${validationAlert.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                      color: validationAlert.type === 'error' ? '#EF4444' : '#10B981'
                    }}
                  >
                    {validationAlert.message}
                  </div>
                )}
              </div>

              {/* HTTP Request / Response Timeline UI */}
              {timelineMetrics && (
                <div style={{ background: '#040404', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 14 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 11, color: '#F5C518', textTransform: 'uppercase' }}>
                    API roundtrip Execution Timeline
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                      <span style={{ color: '#888', display: 'block', marginBottom: 2 }}>DNS Lookup</span>
                      <strong>{timelineMetrics.dns}ms</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                      <span style={{ color: '#888', display: 'block', marginBottom: 2 }}>TCP Handshake</span>
                      <strong>{timelineMetrics.tcp}ms</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                      <span style={{ color: '#888', display: 'block', marginBottom: 2 }}>Gateway Proxy</span>
                      <strong>{timelineMetrics.proxy}ms</strong>
                    </div>
                    <div style={{ background: 'rgba(245,197,24,0.03)', border: '1px solid rgba(245,197,24,0.2)', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                      <span style={{ color: '#F5C518', display: 'block', marginBottom: 2 }}>Total Roundtrip</span>
                      <strong style={{ color: '#F5C518' }}>{timelineMetrics.roundtrip}ms</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Endpoint Invoker Mock Output */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontSize: 12, color: '#10B981', textTransform: 'uppercase' }}>
                    Response Payload (HTTP {gatewayStatus})
                  </h4>
                  {mockResponse && (
                    <button 
                      onClick={() => copyText(mockResponse)}
                      style={{ background: 'none', border: 'none', color: '#888', fontSize: 10, cursor: 'pointer' }}
                    >
                      [Copy JSON]
                    </button>
                  )}
                </div>
                
                <div 
                  style={{ 
                    padding: 12, 
                    background: '#030303', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: 8, 
                    fontSize: 11, 
                    fontFamily: 'monospace', 
                    color: gatewayStatus === 200 ? '#10B981' : gatewayStatus === 429 ? '#EF4444' : '#F5C518',
                    minHeight: 140,
                    overflowX: 'auto',
                    display: 'flex',
                    alignItems: testingEndpoint ? 'center' : 'flex-start',
                    justifyContent: testingEndpoint ? 'center' : 'flex-start'
                  }}
                >
                  {testingEndpoint ? (
                    <span className="spinner" />
                  ) : mockResponse ? (
                    <pre style={{ margin: 0, width: '100%' }}>{mockResponse}</pre>
                  ) : (
                    <span style={{ color: '#666', fontStyle: 'italic' }}>
                      Click "Send Mock Request" below to trigger mock routing execution.
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button 
                  onClick={handleTestEndpoint}
                  disabled={testingEndpoint}
                  className="btn-gold" 
                  style={{ padding: '10px 20px', fontSize: 12, height: 'auto' }}
                >
                  {testingEndpoint ? 'Routing Proxy...' : '⚡ Send Mock Request'}
                </button>
                {activeEndpoint.path.includes('{') && (
                  <span style={{ fontSize: 10, color: '#666' }}>
                    * Automatically resolves path placeholders using connected wallets.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 2. Webhooks Simulator Workspace */}
          {activeCategory === 'webhooks' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>Webhook Simulator Engine</h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ccc' }}>
                  Register destination URLs to receive live simulated operational alerts and anomaly alerts.
                </p>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#F5C518', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Destination Webhook URL
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#040404',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#F5C518', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                    Select Simulated Hook Event
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {WEBHOOK_SCHEMAS.map((sch, i) => (
                      <button
                        key={sch.event}
                        onClick={() => setSelectedWebhookIndex(i)}
                        className="btn-outline"
                        style={{
                          textAlign: 'left',
                          fontSize: 12,
                          padding: '10px 12px',
                          borderColor: selectedWebhookIndex === i ? '#F5C518' : 'rgba(255,255,255,0.08)',
                          background: selectedWebhookIndex === i ? 'rgba(245,197,24,0.04)' : 'transparent',
                          color: selectedWebhookIndex === i ? '#F5C518' : '#fff'
                        }}
                      >
                        <strong>{sch.event}</strong>
                        <span style={{ display: 'block', fontSize: 10, color: '#888', marginTop: 2, fontWeight: 'normal' }}>
                          {sch.description}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSendWebhook}
                    disabled={sendingWebhook}
                    className="btn-gold"
                    style={{ marginTop: 14, padding: '8px 16px', fontSize: 12, height: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {sendingWebhook ? <span className="spinner" /> : '📬'} Trigger Test Webhook
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: '#F5C518', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                    Webhook Propagations logs
                  </label>
                  <div 
                    style={{ 
                      padding: 12, 
                      background: '#030303', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: 8,
                      maxHeight: 280,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    {webhookLogs.length === 0 ? (
                      <p style={{ margin: 0, fontStyle: 'italic', color: '#666', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                        No webhooks dispatched yet. Click "Trigger Test Webhook".
                      </p>
                    ) : (
                      webhookLogs.map((log) => (
                        <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                            <strong style={{ color: '#10B981' }}>{log.event}</strong>
                            <span style={{ color: '#888' }}>{log.timestamp}</span>
                          </div>
                          <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '1px 4px', borderRadius: 2 }}>
                            {log.status.toUpperCase()}
                          </span>
                          <pre style={{ margin: '4px 0 0', padding: 6, background: '#080808', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 4, fontSize: 9, fontFamily: 'monospace', color: '#ccc', overflowX: 'auto' }}>
                            {log.payload}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Event Schema Browser */}
          {activeCategory === 'schemas' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>Unified Event Schema Browser</h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ccc' }}>
                  Kubryx orchestrates cross-tool states using standard structured schemas. Review specifications.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    title: 'Telemetry Partition Ingestion Payload',
                    desc: 'Recorded when regional checks trace failures, partitioned by active organization and workspace contexts.',
                    schema: `{\n  "id": "err-1715975...",\n  "timestamp": "2026-05-17T19:34:17.000Z",\n  "source": "MetaMask Wallet",\n  "type": "WALLET_ERROR",\n  "message": "Signature verification timeout",\n  "context": {\n    "orgId": "org-acme",\n    "workspaceId": "ws-acme-Yield Operations Hub",\n    "role": "Yield Operations Hub Manager"\n  }\n}`
                  },
                  {
                    title: 'Cross-Tool Intelligence OS State Action',
                    desc: 'Fired chronologically when organizational operations trigger automation rules across tools.',
                    schema: `{\n  "id": "os-evt-171597...",\n  "tool": "Stealth Execution Suite",\n  "action": "Triggered CFO bot allocation review",\n  "wallet": "0x08DA91C8...",\n  "chain": "QIE Mainnet",\n  "timestamp": "2026-05-17T19:34:17.000Z",\n  "explorerUrl": "https://mainnet.qie.info/address/..."\n}`
                  }
                ].map((sch) => (
                  <div key={sch.title} style={{ padding: 12, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 13, color: '#F5C518' }}>{sch.title}</h4>
                    <p style={{ margin: '4px 0 10px', fontSize: 11, color: '#888' }}>{sch.desc}</p>
                    <pre style={{ margin: 0, padding: 8, background: '#040404', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 4, fontSize: 9, fontFamily: 'monospace', color: '#10B981', overflowX: 'auto' }}>
                      {sch.schema}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Diagnostics Trace Logs */}
          {activeCategory === 'logs' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>Unified Diagnostics Trace Logs</h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ccc' }}>
                  Live API gateway telemetry trace logs tracking client interactions and backend latency.
                </p>
              </div>

              <div 
                style={{ 
                  maxHeight: 320, 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 8,
                  background: '#030303',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: 12
                }}
              >
                <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#666', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                  <span style={{ width: 60 }}>METHOD</span>
                  <span style={{ width: 150 }}>ENDPOINT</span>
                  <span style={{ width: 60 }}>STATUS</span>
                  <span style={{ width: 70 }}>LATENCY</span>
                  <span style={{ flex: 1 }}>CLIENT AGENT</span>
                </div>
                
                {[
                  { m: 'POST', path: '/api/vaults/private-trade', status: 200, lat: 24, agent: 'Chrome/125.0 - window.solana' },
                  { m: 'GET', path: '/api/score/0x08DA91C8...', status: 200, lat: 85, agent: 'Firefox/124.0 - window.ethereum' },
                  { m: 'POST', path: '/api/agents/deploy', status: 200, lat: 15, agent: 'Chrome/125.0 - window.solana' },
                  { m: 'POST', path: '/api/treasury/stream', status: gatewayStatus, lat: timelineMetrics?.roundtrip || 45, agent: 'MobileSafari/17.4 - Freighter' }
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'monospace', color: log.status === 200 ? '#10B981' : '#EF4444', paddingBottom: 4 }}>
                    <span style={{ width: 60, fontWeight: 'bold' }}>{log.m}</span>
                    <span style={{ width: 150, color: '#fff' }}>{log.path}</span>
                    <span style={{ width: 60 }}>{log.status}</span>
                    <span style={{ width: 70, color: '#F5C518' }}>{log.lat}ms</span>
                    <span style={{ flex: 1, color: '#666', fontSize: 10 }}>{log.agent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
