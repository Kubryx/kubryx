'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from '../../lib/toast'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

interface DevEndpoint {
  method: 'GET' | 'POST'
  path: string
  description: string
  params: string[]
  requestBody: Record<string, any>
  responseBody: Record<string, any>
}

export default function DevelopersPage() {
  const [activeCategory, setActiveCategory] = useState<'api' | 'webhooks' | 'chains'>('api')
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0)
  const [customPayload, setCustomPayload] = useState<string>('')
  const [mockResponse, setMockResponse] = useState<string>('')
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false)

  const endpoints: DevEndpoint[] = [
    {
      method: 'GET',
      path: '/api/score/{walletAddress}',
      description: 'Calculates the dynamic QIE multi-chain Creditblocks rating of a wallet.',
      params: ['walletAddress (string, required) - EVM public address'],
      requestBody: {},
      responseBody: {
        success: true,
        wallet: '0x321a...432b',
        score: 742,
        grade: 'A',
        ncrdStaked: 500,
        ncrdBalance: 1000,
        status: 'Active verified'
      }
    },
    {
      method: 'POST',
      path: '/api/agents/deploy',
      description: 'Verifies Phantom signatures and deploys stateful, autonomous worker agents on Solana.',
      params: ['walletAddress (string, required) - Solana wallet address', 'signature (string, required) - Detached Ed25519 signature proof'],
      requestBody: {
        wallet: '8xJ2...9vK2',
        signature: '3hKq7z...8wLp',
        agentType: 'TreasuryGuard',
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
        txHash: '5xRp9...3kMp'
      }
    },
    {
      method: 'POST',
      path: '/api/vaults/private-trade',
      description: 'Locks key metadata and executes cross-chain zero-knowledge trade streams via CipherVault routing.',
      params: [],
      requestBody: {
        fromChain: 'QIE Mainnet',
        toChain: 'Solana Devnet',
        asset: 'USDC',
        amount: '1,500',
        recipient: '8xJ2...9vK2'
      },
      responseBody: {
        success: true,
        tradeId: 'cipher-trade-0482',
        fromTxHash: '0x9482...ab2c',
        bridgeStatus: 'watching',
        privacyRating: 'Optimal zero-metadata'
      }
    }
  ]

  const activeEndpoint = endpoints[selectedEndpointIndex]

  function copyText(text: string) {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text)
      toast.success('JSON payload copied to clipboard')
    }
  }

  function handleTestEndpoint() {
    setTestingEndpoint(true)
    setMockResponse('')
    
    // Simulate endpoint delay
    setTimeout(() => {
      setMockResponse(JSON.stringify(activeEndpoint.responseBody, null, 2))
      setTestingEndpoint(false)
      toast.success('Mock API call successfully executed!')
    }, 800)
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

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* API Endpoint Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Developer Navigations</h2>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button 
                onClick={() => setActiveCategory('api')} 
                className="btn-outline" 
                style={{ flex: 1, borderColor: activeCategory === 'api' ? '#F5C518' : 'rgba(255,255,255,0.08)', fontSize: 12 }}
              >
                API Explorer
              </button>
              <button 
                onClick={() => setActiveCategory('webhooks')} 
                className="btn-outline" 
                style={{ flex: 1, borderColor: activeCategory === 'webhooks' ? '#F5C518' : 'rgba(255,255,255,0.08)', fontSize: 12 }}
              >
                Webhooks
              </button>
            </div>

            {activeCategory === 'api' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {endpoints.map((ep, idx) => {
                  const isActive = selectedEndpointIndex === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedEndpointIndex(idx); setMockResponse('') }}
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
                            fontSize: 9, 
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
                      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{ep.description.slice(0, 50)}…</p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#ccc', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p>Kubryx fires state alerts and RPC degradation signals directly to registered developer endpoints.</p>
                <div style={{ background: '#030303', border: '1px solid rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                  <h4 style={{ margin: '0 0 6px', color: '#F5C518', fontSize: 11 }}>Example Event Payload</h4>
                  <pre style={{ fontSize: 10, margin: 0, fontFamily: 'monospace', color: '#10B981' }}>
{`{
  "event": "TELEMETRY_RPC_ANOMALY",
  "timestamp": "2026-05-17T10:15:00Z",
  "data": {
    "source": "Solana Devnet",
    "latency": 980,
    "status": "degraded"
  }
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Explorer Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, gridColumn: 'span 2' }}>
          {activeCategory === 'api' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, background: activeEndpoint.method === 'POST' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: activeEndpoint.method === 'POST' ? '#3B82F6' : '#10B981', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                    {activeEndpoint.method}
                  </span>
                  <h2 style={{ fontSize: 18, margin: 0 }}>{activeEndpoint.path}</h2>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaa' }}>{activeEndpoint.description}</p>
              </div>

              {activeEndpoint.params.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 12, color: '#F5C518' }}>Parameters</h4>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#ccc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {activeEndpoint.params.map((p, i) => (
                      <li key={i} style={{ fontFamily: 'monospace' }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 12, color: '#F5C518' }}>Request Body (JSON)</h4>
                    {activeEndpoint.method === 'POST' && (
                      <button 
                        onClick={() => copyText(JSON.stringify(activeEndpoint.requestBody, null, 2))}
                        style={{ background: 'none', border: 'none', color: '#888', fontSize: 10, cursor: 'pointer' }}
                      >
                        [Copy]
                      </button>
                    )}
                  </div>
                  <pre 
                    style={{ 
                      margin: 0, 
                      padding: 12, 
                      background: '#030303', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: 8, 
                      fontSize: 11, 
                      fontFamily: 'monospace', 
                      color: '#ddd',
                      minHeight: 140,
                      overflowX: 'auto'
                    }}
                  >
                    {activeEndpoint.method === 'POST' 
                      ? JSON.stringify(activeEndpoint.requestBody, null, 2)
                      : '// No request body required'
                    }
                  </pre>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 12, color: '#10B981' }}>Mock Server Response</h4>
                    {mockResponse && (
                      <button 
                        onClick={() => copyText(mockResponse)}
                        style={{ background: 'none', border: 'none', color: '#888', fontSize: 10, cursor: 'pointer' }}
                      >
                        [Copy]
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
                      color: '#10B981',
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
                      <pre style={{ margin: 0 }}>{mockResponse}</pre>
                    ) : (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>Click "Send Test Call" to view confirmation.</span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleTestEndpoint}
                disabled={testingEndpoint}
                className="btn-gold" 
                style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: 12, height: 'auto' }}
              >
                {testingEndpoint ? 'Invoking Endpoint...' : '⚡ Send Test Call'}
              </button>
            </div>
          )}
        </div>
      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
