// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePlatformState, CHAIN_REGISTRY } from '../../lib/platform-engine'
import { useAutonomousOps } from '../../lib/autonomous-ops'
import { toast } from '../../lib/toast'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

export default function ProtocolsPage() {
  const { currentMode, activeScenario, analytics } = usePlatformState()
  const { operationalRiskScore, infrastructureConfidenceScore } = useAutonomousOps()
  const [ticks, setTicks] = useState(0)

  // Simulation fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Protocol Registry Data
  const protocols = [
    {
      id: 'ncrd-staking',
      name: 'CreditBlocks Staking Stream',
      chain: 'QIE Mainnet',
      address: '0x8892...f812',
      explorer: 'https://mainnet.qie.info/address/0x8892e210141f893d9382103f19102928812f812',
      tvl: '$4.82M',
      utilization: '64.2%',
      health: 'Nominal',
      sync: 'Synchronized',
      syncColor: '#10B981'
    },
    {
      id: 'solana-agent-registry',
      name: 'Solana Autonomous Agent Registry',
      chain: 'Solana Devnet',
      address: 'Ag3M...92Jk',
      explorer: 'https://explorer.solana.com/address/Ag3M928310f81a8c9288301828381928310192Jk?cluster=devnet',
      tvl: '$1.45M',
      utilization: activeScenario === 'loan_risk_escalation' ? '92.4%' : '48.6%',
      health: activeScenario === 'loan_risk_escalation' ? 'Exposure Warning' : 'Nominal',
      sync: 'Synchronized',
      syncColor: '#10B981'
    },
    {
      id: 'stellar-billsplit-vault',
      name: 'Bill Split Settlement Desk',
      chain: 'Stellar Testnet',
      address: 'GBB3...O8R4',
      explorer: 'https://stellar.expert/explorer/testnet/account/GBB32831828381029381028301823018GBB3O8R4',
      tvl: '$920K',
      utilization: activeScenario === 'chain_congestion' ? '88.6%' : '31.2%',
      health: activeScenario === 'chain_congestion' ? 'Mempool Backlog' : 'Nominal',
      sync: activeScenario === 'chain_congestion' ? 'Sync Lagging' : 'Synchronized',
      syncColor: activeScenario === 'chain_congestion' ? '#F5C518' : '#10B981'
    },
    {
      id: 'arbitrum-Protocol Borrow Engine-desk',
      name: 'Protocol Borrow Engine High-Yield Desk',
      chain: 'Arbitrum One',
      address: '0x99A3...B840',
      explorer: 'https://arbiscan.io/address/0x99A32101238491028382910283012838192B840',
      tvl: '$2.18M',
      utilization: activeScenario === 'degraded_rpc' ? '12.4%' : '78.2%',
      health: activeScenario === 'degraded_rpc' ? 'Degraded RPC' : 'Nominal',
      sync: activeScenario === 'degraded_rpc' ? 'Retry Backoff' : 'Synchronized',
      syncColor: activeScenario === 'degraded_rpc' ? '#EC4899' : '#10B981'
    }
  ]

  // Network RPC quality pings
  const getRpcStatus = (chainKey: string) => {
    let quality = 99.8
    let latency = 45

    if (activeScenario === 'degraded_rpc') {
      if (chainKey === 'solana' || chainKey === 'arbitrum') {
        quality = 74.2
        latency = 950
      }
    } else if (activeScenario === 'chain_congestion') {
      if (chainKey === 'qie' || chainKey === 'stellar') {
        quality = 88.6
        latency = 310
      }
    } else if (activeScenario === 'telemetry_anomaly_spikes') {
      quality = 92.4
      latency = 120
    }

    // Fluctuations
    quality -= (ticks % 3) * 0.1
    latency += (ticks % 5) - 2

    return {
      quality: quality.toFixed(1),
      latency: Math.max(12, latency)
    }
  }

  function handleTriggerSync() {
    toast.success('Triggered multi-chain network epoch synchronization sweep.')
  }

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Back to Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Protocol Control Center</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🌐</span> Protocol Control Center
          </h1>
        </div>
        
        <button 
          onClick={handleTriggerSync}
          className="btn-gold" 
          style={{ padding: '8px 16px', fontSize: 12, height: 'auto' }}
        >
          🔄 Sync Environments
        </button>
      </header>

      {/* Network Metrics Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { key: 'qie', name: 'QIE Mainnet', badge: '1990', explorer: CHAIN_REGISTRY.qie.explorerUrl },
          { key: 'solana', name: 'Solana Devnet', badge: 'SVM', explorer: CHAIN_REGISTRY.solana.explorerUrl },
          { key: 'stellar', name: 'Stellar Testnet', badge: 'Soroban', explorer: CHAIN_REGISTRY.stellar.explorerUrl },
          { key: 'arbitrum', name: 'Arbitrum One', badge: 'EVM L2', explorer: CHAIN_REGISTRY.arbitrum.explorerUrl }
        ].map((chain) => {
          const stats = getRpcStatus(chain.key)
          const isDanger = parseFloat(stats.quality) < 85
          const isWarning = parseFloat(stats.quality) >= 85 && parseFloat(stats.quality) < 95

          return (
            <article key={chain.key} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong style={{ fontSize: 13, color: '#fff' }}>{chain.name}</strong>
                <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4, color: '#F5C518' }}>
                  {chain.badge}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#888' }}>RPC SLA Quality:</span>
                  <strong style={{ color: isDanger ? '#EF4444' : isWarning ? '#F5C518' : '#10B981' }}>
                    {stats.quality}%
                  </strong>
                </div>

                {/* Progress bar represent RPC quality */}
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${stats.quality}%`, 
                      background: isDanger ? '#EF4444' : isWarning ? '#F5C518' : '#10B981',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: '#888' }}>Latency Ping:</span>
                  <strong style={{ color: stats.latency > 350 ? '#EF4444' : '#fff' }}>
                    {stats.latency}ms
                  </strong>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Status</span>
                  <span style={{ 
                    fontSize: 8, 
                    fontWeight: 800, 
                    border: `1px solid ${isDanger ? '#EF4444' : isWarning ? '#F5C518' : '#10B981'}`,
                    color: isDanger ? '#EF4444' : isWarning ? '#F5C518' : '#10B981',
                    padding: '1px 5px',
                    borderRadius: 4,
                    textTransform: 'uppercase'
                  }}>
                    {isDanger ? 'Degraded SLA' : isWarning ? 'Drifting Anomaly' : 'Synchronized'}
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {/* Main Grid: Communication Topology and Protocol Registries */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, alignItems: 'stretch' }}>
        
        {/* Environment Synchronization Visualization Topology */}
        <article className="card" style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>⛓ Multi-Chain Coordination Topology</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
            Visualizes real-time autonomous routing pathways and epoch sync layers managed by Kubryx.
          </p>

          <div style={{ flex: 1, position: 'relative', background: '#040404', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            {/* Background SVG Grid for infrastructure feel */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Animated Lines connecting central hub to chains */}
              <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(245,197,24,0.3)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="rgba(168,85,247,0.3)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="rgba(59,130,246,0.3)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(236,72,153,0.3)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {/* Central Coordination Node */}
            <div 
              style={{ 
                position: 'absolute',
                zIndex: 10,
                width: 75,
                height: 75,
                borderRadius: '50%',
                background: '#080808',
                border: '2px solid #F5C518',
                boxShadow: '0 0 20px rgba(245,197,24,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                padding: 6
              }}
            >
              <strong style={{ fontSize: 9, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kubryx</strong>
              <span style={{ fontSize: 8, color: '#F5C518', fontWeight: 800 }}>CORE v8.0</span>
            </div>

            {/* Node 1: QIE (Top-Left) */}
            <div style={{ position: 'absolute', left: '12%', top: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#0a0a0a', border: '1px solid rgba(245,197,24,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                👑
              </div>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>QIE EVM</span>
              <span style={{ fontSize: 8, color: '#10B981' }}>● SYNCHRONIZED</span>
            </div>

            {/* Node 2: Solana Devnet (Top-Right) */}
            <div style={{ position: 'absolute', right: '12%', top: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#0a0a0a', border: `1px solid ${activeScenario === 'degraded_rpc' ? '#EF4444' : 'rgba(168,85,247,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                👻
              </div>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>Solana SVM</span>
              <span style={{ fontSize: 8, color: activeScenario === 'degraded_rpc' ? '#EF4444' : '#10B981' }}>
                {activeScenario === 'degraded_rpc' ? '● DEGRADED' : '● SYNCHRONIZED'}
              </span>
            </div>

            {/* Node 3: Stellar Soroban (Bottom-Left) */}
            <div style={{ position: 'absolute', left: '12%', bottom: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#0a0a0a', border: `1px solid ${activeScenario === 'chain_congestion' ? '#F5C518' : 'rgba(59,130,246,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                🚀
              </div>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>Stellar</span>
              <span style={{ fontSize: 8, color: activeScenario === 'chain_congestion' ? '#F5C518' : '#10B981' }}>
                {activeScenario === 'chain_congestion' ? '● MEMPOOL LAG' : '● SYNCHRONIZED'}
              </span>
            </div>

            {/* Node 4: Arbitrum One (Bottom-Right) */}
            <div style={{ position: 'absolute', right: '12%', bottom: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#0a0a0a', border: '1px solid rgba(236,72,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                🍭
              </div>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>Arbitrum L2</span>
              <span style={{ fontSize: 8, color: '#10B981' }}>● SYNCHRONIZED</span>
            </div>

            {/* Status Overlay ribbon */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 4, padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9 }}>
              <span style={{ color: '#888' }}>Epoch synchronization: <strong style={{ color: '#fff' }}>298,401</strong></span>
              <span style={{ color: '#10B981' }}>SLA Confidence: {infrastructureConfidenceScore}%</span>
            </div>

          </div>
        </article>

        {/* Protocol Registry Cards */}
        <article className="card" style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>📋 Verified Multi-Chain Contract Registry</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
            List of certified corporate protocol smart contracts managed directly via Kubryx secure key stores.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
            {protocols.map((protocol) => (
              <div 
                key={protocol.id}
                style={{ 
                  padding: 12, 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <strong style={{ fontSize: 12, color: '#fff' }}>{protocol.name}</strong>
                    <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.04)', color: '#aaa', padding: '1px 5px', borderRadius: 4 }}>
                      {protocol.chain}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#888', marginTop: 4 }}>
                    <span>Address: <a className="gold-text" href={protocol.explorer} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontFamily: 'monospace' }}>{protocol.address} ↗</a></span>
                    <span>TVL: <strong style={{ color: '#fff' }}>{protocol.tvl}</strong></span>
                    <span>Utilization: <strong style={{ color: '#fff' }}>{protocol.utilization}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ 
                    fontSize: 8, 
                    background: 'rgba(255,255,255,0.02)', 
                    color: protocol.syncColor, 
                    border: `1px solid ${protocol.syncColor}`, 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    fontWeight: 800, 
                    textTransform: 'uppercase' 
                  }}>
                    {protocol.sync}
                  </span>
                  <span style={{ fontSize: 9, color: '#888' }}>{protocol.health}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

      </section>

      {/* Explorer linked activity overview */}
      <section className="card">
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>🔍 Cross-Chain Telemetry Activity Log</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
          Deep-linked epoch block verification streams checking transaction finality.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { time: '14:38:12', chain: 'Solana Devnet', event: 'Autonomous Worker Signature Verified', hash: '5sJk...92La', link: 'https://explorer.solana.com/tx/5sJk28310f81829a?cluster=devnet' },
            { time: '14:37:44', chain: 'QIE Mainnet', event: 'Bill Split Settlement Multi-Party Stream Opened', hash: '0x38...892e', link: 'https://mainnet.qie.info/tx/0x38283818291028a3819c9e8e2c01928' },
            { time: '14:36:20', chain: 'Arbitrum One', event: 'Staking Exposure Allocation Balanced', hash: '0x81...012e', link: 'https://arbiscan.io/tx/0x812e9283181829c38182103f191029' }
          ].map((item, idx) => (
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
                <span style={{ color: '#666' }}>{item.time}</span>
                <span style={{ color: '#F5C518', fontWeight: 'bold', width: 100 }}>{item.chain}</span>
                <span style={{ color: '#ccc' }}>{item.event}</span>
              </div>
              <a className="gold-text" href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontFamily: 'monospace' }}>
                {item.hash} ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
