// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePlatformState } from '../../lib/platform-engine'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

interface IntegrationItem {
  id: string
  name: string
  category: 'Blockchain' | 'Wallet' | 'AI Systems' | 'Telemetry' | 'Reliability' | 'Security'
  status: 'active' | 'degraded' | 'congested' | 'inactive'
  latency: string
  logo: string
  description: string
  metadata: {
    endpoint?: string
    contractAddress?: string
    version?: string
    payloadExample?: string
    nodeType?: string
  }
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'chain-qie',
    name: 'QIE Mainnet',
    category: 'Blockchain',
    status: 'active',
    latency: '85ms',
    logo: '⬡',
    description: 'Secures high-speed L1 decentralized transaction logs and NFT minting workflows.',
    metadata: {
      endpoint: 'https://mainnet.qie.digital/api/eth-rpc',
      contractAddress: '0x08DA91C81cebD27d181cA732615379f185FbFb51',
      version: 'v1.4.2',
      payloadExample: '{\n  "jsonrpc": "2.0",\n  "method": "eth_getBalance",\n  "params": ["0x...", "latest"],\n  "id": 1990\n}',
      nodeType: 'Validator'
    }
  },
  {
    id: 'chain-solana',
    name: 'Solana Devnet',
    category: 'Blockchain',
    status: 'active',
    latency: '24ms',
    logo: '👻',
    description: 'High-speed payment streaming and autonomous agent coordination pipelines.',
    metadata: {
      endpoint: 'https://api.devnet.solana.com',
      version: 'v1.18.15',
      payloadExample: '{\n  "method": "getBalance",\n  "params": ["pubkeyString"]\n}',
      nodeType: 'RPC Node'
    }
  },
  {
    id: 'chain-stellar',
    name: 'Stellar Testnet',
    category: 'Blockchain',
    status: 'active',
    latency: '62ms',
    logo: '🚀',
    description: 'Soroban smart contract multi-party Split billing and secure escrow settlement.',
    metadata: {
      endpoint: 'https://horizon-testnet.stellar.org',
      version: 'v20.4.0',
      payloadExample: '{\n  "_links": { "self": { "href": "https://..." } }\n}',
      nodeType: 'Horizon Gateway'
    }
  },
  {
    id: 'chain-arbitrum',
    name: 'Arbitrum One',
    category: 'Blockchain',
    status: 'active',
    latency: '15ms',
    logo: '⬟',
    description: 'Low-interest decentralized L2 lending capital and collateral escrow lockers.',
    metadata: {
      endpoint: 'https://arb1.arbitrum.io/rpc',
      contractAddress: '0x992B95C85cebE27d181cA732615379f185FbFb51',
      version: 'nitro-v3.0',
      payloadExample: '{\n  "method": "eth_estimateGas",\n  "params": [{ "to": "0x..." }]\n}',
      nodeType: 'Rollup Sequencer'
    }
  },
  {
    id: 'wallet-metamask',
    name: 'MetaMask Extension',
    category: 'Wallet',
    status: 'active',
    latency: 'Local',
    logo: '🦊',
    description: 'Soulbound NFT authorization and staking multi-sig validations for EVM layers.',
    metadata: {
      endpoint: 'window.ethereum',
      version: 'v11.16.2',
      payloadExample: 'await window.ethereum.request({\n  method: "wallet_switchEthereumChain",\n  params: [{ chainId: "0x7c6" }]\n})'
    }
  },
  {
    id: 'wallet-phantom',
    name: 'Phantom App',
    category: 'Wallet',
    status: 'active',
    latency: 'Local',
    logo: '👻',
    description: 'Ed25519 nacl key signing buffers for Solana Yield Operations Hub streamers and agents.',
    metadata: {
      endpoint: 'window.solana',
      version: 'v24.2.1',
      payloadExample: 'const resp = await window.solana.connect();\nconsole.log(resp.publicKey.toString());'
    }
  },
  {
    id: 'wallet-freighter',
    name: 'Freighter Wallet',
    category: 'Wallet',
    status: 'active',
    latency: 'Local',
    logo: '🚀',
    description: 'Stellar Soroban XDR transaction authorization handshake bridges.',
    metadata: {
      endpoint: 'window.freighter',
      version: 'v2.10.4',
      payloadExample: 'const address = await window.freighter.getAddress();'
    }
  },
  {
    id: 'ai-Protocol Borrow Engine',
    name: 'Protocol Borrow Engine AI Advisor',
    category: 'AI Systems',
    status: 'active',
    latency: '45ms',
    logo: '🧠',
    description: 'Lending Desk dynamic credit scorecard auditor and Natural Language negotiator.',
    metadata: {
      endpoint: '/api/chat (Groq API)',
      version: 'llama-3.3-70b-versatile',
      payloadExample: '{\n  "message": "Negotiate loan for 500 NCRD",\n  "wallet": "0x..."\n}'
    }
  },
  {
    id: 'ai-palmflow',
    name: 'PalmFlow Planner',
    category: 'AI Systems',
    status: 'active',
    latency: '82ms',
    logo: '🌱',
    description: 'Automated Yield Operations Hub streams scheduler and yield rebalancing planner.',
    metadata: {
      endpoint: '/api/treasury/planner',
      version: 'llama-3.3-70b-versatile',
      payloadExample: '{\n  "balance": "12,480 SOL",\n  "optimize": true\n}'
    }
  },
  {
    id: 'ai-shadow',
    name: 'Stealth Execution Suite Departments',
    category: 'AI Systems',
    status: 'active',
    latency: '110ms',
    logo: '🥷',
    description: 'Decentralized corporate mesh orchestrating CFO, Compliance, Audit, and HR agents.',
    metadata: {
      endpoint: '/api/shadow/mesh',
      version: 'mixtral-8x7b-instruct',
      payloadExample: '{\n  "command": "Perform Yield Operations Hub compliance check",\n  "departments": ["CFO", "Compliance"]\n}'
    }
  },
  {
    id: 'telemetry-pings',
    name: 'Regional RPC Pings',
    category: 'Telemetry',
    status: 'active',
    latency: '45ms',
    logo: '⚡',
    description: 'Continuous health check pings analyzing cross-chain nodes average roundtrip time.',
    metadata: {
      endpoint: '/api/telemetry/pings',
      version: 'v2.0.4',
      payloadExample: '{\n  "nodesChecked": 4,\n  "successCount": 4,\n  "avgResponseTime": 45\n}'
    }
  },
  {
    id: 'telemetry-sentry',
    name: 'Resilience Diagnostics',
    category: 'Telemetry',
    status: 'active',
    latency: 'Nominal',
    logo: '🛡️',
    description: 'Client error tracer capturing key rejection alerts and RPC timeouts.',
    metadata: {
      endpoint: 'localStorage (kubryx_telemetry_errors)',
      version: 'v3.1.2',
      payloadExample: '{\n  "type": "FETCH_ERROR",\n  "source": "MetaMask",\n  "message": "User rejected the request"\n}'
    }
  },
  {
    id: 'reliability-fallback',
    name: 'Fallback Ingestion Registries',
    category: 'Reliability',
    status: 'active',
    latency: 'Local',
    logo: '💾',
    description: 'Offline failover buffers returning local mock datasets when RPC pipelines timeout.',
    metadata: {
      endpoint: 'lib/fallback.ts',
      version: 'v1.0.0',
      payloadExample: 'export const fallbackCreditScore = {\n  score: 742,\n  grade: "A",\n  history: [710, 720, 742]\n}'
    }
  },
  {
    id: 'security-soulbound',
    name: 'Soulbound Registry',
    category: 'Security',
    status: 'active',
    latency: '95ms',
    logo: '📜',
    description: 'Verifies decentralized identity scorecards minted directly on QIE layers.',
    metadata: {
      endpoint: '0x08DA91C81cebD27d181cA732615379f185FbFb51',
      version: 'ERC-5114 (Soulbound)',
      payloadExample: '{\n  "owner": "0x...",\n  "score": 742,\n  "mintedAt": "2026-05-17T19:34:17Z"\n}'
    }
  }
]

export default function IntegrationsPage() {
  const { activeScenario, analytics } = usePlatformState()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<IntegrationItem[]>(INTEGRATIONS)

  // Dynamically update states based on global active scenario
  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        let status: IntegrationItem['status'] = 'active'
        let latency = item.latency

        if (activeScenario === 'degraded_rpc') {
          if (item.category === 'Blockchain' || item.category === 'Telemetry') {
            status = 'degraded'
            latency = item.latency !== 'Local' ? `${parseInt(item.latency) * 8}ms` : 'Local'
          }
        } else if (activeScenario === 'chain_congestion') {
          if (item.name === 'QIE Mainnet' || item.name === 'Arbitrum One') {
            status = 'congested'
            latency = `${parseInt(item.latency) * 4}ms`
          }
        } else if (activeScenario === 'suspicious_activity') {
          if (item.id === 'security-soulbound') {
            status = 'degraded'
          }
        } else if (activeScenario === 'telemetry_anomaly_spikes') {
          if (item.category === 'Telemetry' || item.category === 'AI Systems') {
            status = 'degraded'
          }
        }

        return { ...item, status, latency }
      })
    )
  }, [activeScenario])

  const categories = ['All', 'Blockchain', 'Wallet', 'AI Systems', 'Telemetry', 'Reliability', 'Security']

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const getStatusColor = (status: IntegrationItem['status']) => {
    switch (status) {
      case 'active': return '#10B981'
      case 'degraded': return '#F5C518'
      case 'congested': return '#EC4899'
      case 'inactive': return '#EF4444'
      default: return '#888'
    }
  }

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Back to Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Integrations Hub</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🔌</span> Ecosystem Integration Hub
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 10, background: 'rgba(245, 197, 24, 0.05)', border: '1px solid rgba(245, 197, 24, 0.25)', color: '#F5C518', padding: '5px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C518' }} />
            API Gateway SLA: {analytics.averageLatency}ms
          </span>
        </div>
      </header>

      {/* Connection Flow Diagram (Aesthetic Visual Overlay) */}
      <section className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🌐</span> Platform Connection Topology
        </h2>
        <p style={{ fontSize: 12, color: '#888', marginTop: -4, marginBottom: 20 }}>
          Real-time routing bridge linking wallet pass-throughs, multi-chain validators, AI orchestrations, and regional health monitors.
        </p>
        
        {/* Dynamic Topology Chart */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'relative', 
            padding: '24px 10px', 
            background: 'rgba(255,255,255,0.01)', 
            border: '1px solid rgba(255,255,255,0.04)', 
            borderRadius: 8,
            overflowX: 'auto',
            gap: 20
          }}
        >
          {/* Layer 1: Wallets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>1. WALLETS</span>
            <div style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12, textAlign: 'center' }}>🦊 MetaMask</div>
            <div style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12, textAlign: 'center' }}>👻 Phantom</div>
            <div style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12, textAlign: 'center' }}>🚀 Freighter</div>
          </div>

          {/* Connection Lines (CSS stylized arrows) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 40, height: 100 }}>
            <span style={{ fontSize: 16, color: '#F5C518', animation: 'float 3s ease-in-out infinite' }}>🔀</span>
            <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, rgba(245,197,24,0.1) 0%, #F5C518 50%, rgba(245,197,24,0.1) 100%)', marginTop: 8 }} />
          </div>

          {/* Layer 2: API Gateway */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>2. SECURE KUBRYX OS GATEWAY</span>
            <div style={{ padding: '16px 20px', background: '#0a0a0a', border: '2px solid #F5C518', borderRadius: 8, fontSize: 13, textAlign: 'center', fontWeight: 'bold', color: '#F5C518', boxShadow: '0 0 15px rgba(245,197,24,0.15)' }}>
              Unified API Proxy
              <span style={{ display: 'block', fontSize: 9, color: '#fff', opacity: 0.6, marginTop: 4, fontWeight: 'normal' }}>
                Hydration Cache Active
              </span>
            </div>
          </div>

          {/* Connection Lines */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 40, height: 100 }}>
            <span style={{ fontSize: 16, color: '#F5C518', animation: 'float 3s ease-in-out infinite' }}>⚡</span>
            <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, rgba(245,197,24,0.1) 0%, #F5C518 50%, rgba(245,197,24,0.1) 100%)', marginTop: 8 }} />
          </div>

          {/* Layer 3: Blockchains & AI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>3. BACKEND & CHAINS</span>
            <div style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, textAlign: 'center' }}>🧠 Groq AI Orchestrator</div>
            <div style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, textAlign: 'center' }}>⬡ QIE / Arbitrum</div>
            <div style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, textAlign: 'center' }}>🚀 Stellar / Solana</div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderColor: selectedCategory === cat ? '#F5C518' : 'rgba(255,255,255,0.08)',
                background: selectedCategory === cat ? 'rgba(245,197,24,0.06)' : 'transparent',
                color: selectedCategory === cat ? '#F5C518' : '#fff'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#0a0a0a',
            color: '#fff',
            fontSize: 13,
            minWidth: 200,
            outline: 'none'
          }}
        />
      </section>

      {/* Grid Content */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filteredItems.length === 0 ? (
          <p style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
            No integrations found matching your filters.
          </p>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id
            const sColor = getStatusColor(item.status)
            return (
              <div 
                key={item.id} 
                className="card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 12, 
                  background: '#0c0c0c',
                  border: isExpanded ? '1px solid #F5C518' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.2s',
                  position: 'relative'
                }}
              >
                {/* Top Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{item.logo}</span>
                    <div>
                      <h3 style={{ fontSize: 15, margin: 0, fontWeight: 700, color: '#fff' }}>{item.name}</h3>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <span 
                    style={{ 
                      fontSize: 8, 
                      fontWeight: 800, 
                      color: sColor, 
                      border: `1px solid ${sColor}`, 
                      background: `${sColor}0c`,
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: '#ccc', margin: 0, lineHeight: 1.4 }}>
                  {item.description}
                </p>

                {/* Substats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8, marginTop: 4 }}>
                  <span>Latency: <strong className="gold-text">{item.latency}</strong></span>
                  {item.metadata.version && (
                    <span>Version: <strong className="silver-text">{item.metadata.version}</strong></span>
                  )}
                </div>

                {/* Action trigger */}
                <button 
                  onClick={() => toggleExpand(item.id)}
                  className="btn-outline"
                  style={{ 
                    marginTop: 8, 
                    fontSize: 10, 
                    padding: '5px 10px', 
                    alignSelf: 'stretch', 
                    textAlign: 'center',
                    background: isExpanded ? 'rgba(245,197,24,0.04)' : 'transparent',
                    borderColor: isExpanded ? '#F5C518' : 'rgba(255,255,255,0.15)',
                    color: isExpanded ? '#F5C518' : '#fff'
                  }}
                >
                  {isExpanded ? '▲ Collapse Metadata' : '▼ View Technical Metadata'}
                </button>

                {/* Expanded metadata card */}
                {isExpanded && (
                  <div 
                    style={{ 
                      marginTop: 10, 
                      padding: '10px 12px', 
                      background: '#040404', 
                      border: '1px solid rgba(255,255,255,0.06)', 
                      borderRadius: 6,
                      fontSize: 11,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      wordBreak: 'break-all'
                    }}
                  >
                    {item.metadata.endpoint && (
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 9, textTransform: 'uppercase' }}>Endpoint</span>
                        <code style={{ color: '#F5C518', fontSize: 10, fontFamily: 'monospace' }}>{item.metadata.endpoint}</code>
                      </div>
                    )}
                    {item.metadata.contractAddress && (
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 9, textTransform: 'uppercase' }}>Contract</span>
                        <code style={{ color: '#fff', fontSize: 10, fontFamily: 'monospace' }}>{item.metadata.contractAddress}</code>
                      </div>
                    )}
                    {item.metadata.nodeType && (
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 9, textTransform: 'uppercase' }}>Node Class</span>
                        <span style={{ color: '#fff', fontSize: 11 }}>{item.metadata.nodeType}</span>
                      </div>
                    )}
                    {item.metadata.payloadExample && (
                      <div>
                        <span style={{ color: '#888', display: 'block', fontSize: 9, textTransform: 'uppercase', marginBottom: 4 }}>Payload / Method</span>
                        <pre 
                          style={{ 
                            background: '#0a0a0a', 
                            padding: '6px 8px', 
                            borderRadius: 4, 
                            border: '1px solid rgba(255,255,255,0.04)',
                            margin: 0, 
                            fontSize: 9,
                            fontFamily: 'monospace',
                            color: '#10B981',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {item.metadata.payloadExample}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
