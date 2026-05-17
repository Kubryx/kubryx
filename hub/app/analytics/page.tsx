'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePlatformState } from '../../lib/platform-engine'
import { useGlobalOperations } from '../../lib/global-operations-engine'
import { useFabric } from '../../lib/fabric-engine'
import { useStrategicIntelligence } from '../../lib/strategic-intelligence-engine'
import { useCivilizationOrchestration } from '../../lib/civilization-orchestration-engine'
import { toast } from '../../lib/toast'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts'

export default function AnalyticsPage() {
  const { currentMode, activeScenario, analytics } = usePlatformState()
  
  // Connect to Fabric and Global state synchronizations
  const { regions } = useFabric()
  const { consensusIndex, driftIndex, aiConfidence } = useGlobalOperations()

  // Connect to Strategic Intelligence Layer
  const { forecasts, strategicConfidence } = useStrategicIntelligence()

  // Connect to Civilization Orchestration Layer
  const {
    agents,
    diplomaticRelations,
    coalitionScore,
    negotiationConfidence,
    stabilizationAlignment,
    activeConflict
  } = useCivilizationOrchestration()

  const [ticks, setTicks] = useState<number>(0)
  
  // Rolling latency datasets
  const [latencyData, setLatencyData] = useState<{ name: string; latency: number; fallback: number }[]>([
    { name: '10s ago', latency: 45, fallback: 0 },
    { name: '8s ago', latency: 46, fallback: 0 },
    { name: '6s ago', latency: 44, fallback: 0 },
    { name: '4s ago', latency: 45, fallback: 0 },
    { name: '2s ago', latency: 45, fallback: 0 },
    { name: 'Now', latency: 45, fallback: 0 }
  ])

  // Rolling chain TPS data
  const [tpsData, setTpsData] = useState<{ name: string; QIE: number; Solana: number; Stellar: number; Arbitrum: number }[]>([
    { name: '10s ago', QIE: 14, Solana: 280, Stellar: 84, Arbitrum: 48 },
    { name: '8s ago', QIE: 15, Solana: 288, Stellar: 85, Arbitrum: 49 },
    { name: '6s ago', QIE: 13, Solana: 284, Stellar: 82, Arbitrum: 47 },
    { name: '4s ago', QIE: 14, Solana: 290, Stellar: 86, Arbitrum: 50 },
    { name: 'Now', QIE: 14.5, Solana: 285.2, Stellar: 84.8, Arbitrum: 48.6 }
  ])

  // Rolling Coalition Stability data
  const [coalitionData, setCoalitionData] = useState<{ name: string; coalition: number; alignment: number }[]>([
    { name: '10s ago', coalition: 98.4, alignment: 98.2 },
    { name: '8s ago', coalition: 98.2, alignment: 98.1 },
    { name: '6s ago', coalition: 98.5, alignment: 98.3 },
    { name: '4s ago', coalition: 98.3, alignment: 98.2 },
    { name: '2s ago', coalition: 98.4, alignment: 98.2 },
    { name: 'Now', coalition: 98.4, alignment: 98.2 }
  ])

  // AI distributions dataset
  const aiData = [
    { name: 'QIE Passports', requests: 480 },
    { name: 'Solana Streams', requests: 920 },
    { name: 'Lending Negot.', requests: 840 },
    { name: 'Shadow CFO Audit', requests: 600 }
  ]

  // Wallet trends dataset
  const walletData = [
    { name: 'MetaMask (EVM)', active: 450, transactions: 1200 },
    { name: 'Phantom (Solana)', active: 890, transactions: 2400 },
    { name: 'Freighter (Stellar)', active: 310, transactions: 850 }
  ]

  // Dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1)
      
      const currentLat = analytics.averageLatency
      const currentFallback = analytics.fallbackActivations
      const timeStr = `${new Date().toLocaleTimeString().slice(-8)}`
      
      // Update Latency Chart
      setLatencyData((prev) => {
        const next = [...prev, { name: timeStr, latency: currentLat, fallback: currentFallback }]
        return next.slice(-8) // Keep rolling 8
      })

      // Update TPS Chart
      setTpsData((prev) => {
        const rates = analytics.chainActivityRates
        const next = [
          ...prev,
          {
            name: timeStr,
            QIE: rates['QIE Mainnet'] || 14.5,
            Solana: rates['Solana Devnet'] || 285.2,
            Stellar: rates['Stellar Testnet'] || 84.8,
            Arbitrum: rates['Arbitrum'] || 48.6
          }
        ]
        return next.slice(-8)
      })

      // Update Coalition Chart
      setCoalitionData((prev) => {
        const next = [
          ...prev,
          {
            name: timeStr,
            coalition: coalitionScore,
            alignment: stabilizationAlignment
          }
        ]
        return next.slice(-8)
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [analytics, coalitionScore, stabilizationAlignment])

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      
      {/* Header Panel */}
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Predictive Analytics Lab</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📈</span> Predictive Analytics & Volatility Lab
          </h1>
        </div>

        <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
          <span style={{ fontSize: 10, color: '#888', display: 'block' }}>Operational Resiliency</span>
          <strong style={{ fontSize: 16, color: '#F5C518' }}>{strategicConfidence}%</strong>
        </div>
      </header>

      {/* Volatility Overview Panels */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        
        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Consensus Trajectory</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#F5C518' }}>
              {consensusIndex}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Continuous RPC voting synchronization rate</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Operational Drift Rate</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#fff' }}>
              ±{driftIndex}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Sinusoidal latency entropy fluctuations</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>AI Confidence Threshold</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#10B981' }}>
              {aiConfidence}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Cognitive threat scoring accuracy index</span>
        </article>

        <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Regional Resilience</span>
            <strong style={{ display: 'block', fontSize: 28, fontWeight: 800, marginTop: 4, color: '#F5C518' }}>
              {forecasts[0]?.regionalResilience || 99.2}%
            </strong>
          </div>
          <span style={{ fontSize: 9, color: '#888', marginTop: 10 }}>Multi-region RPC failover readiness rate</span>
        </article>

      </section>

      {/* PHASE 13 — COALITION STABILITY & DIPLOMATIC VOLATILITY ANALYTICS */}
      <section className="card" style={{ padding: 18, marginBottom: 24, border: '1px solid rgba(245,197,24,0.3)', background: 'rgba(0,0,0,0.3)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#F5C518' }}>🏛️ Coalition Stability & Diplomatic Volatility</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
          Visualizes real-time coalition metrics, multi-agent resilience scoring, conflict forecasting, and detailed institutional trust heatmaps.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          
          {/* Coalition Stability Trends */}
          <div style={{ height: 260, background: '#020202', padding: 14, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Coalition Stability Trajectory</span>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={coalitionData}>
                  <defs>
                    <linearGradient id="coalitionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C518" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#666" fontSize={9} />
                  <YAxis stroke="#666" fontSize={9} domain={[30, 100]} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(245,197,24,0.3)', color: '#fff', fontSize: 10 }} />
                  <Area type="monotone" dataKey="coalition" name="Stability" stroke="#F5C518" fillOpacity={1} fill="url(#coalitionGrad)" />
                  <Area type="monotone" dataKey="alignment" name="Alignment" stroke="#10B981" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Institutional Trust Heatmap */}
          <div style={{ background: '#020202', padding: 14, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Institutional Trust & Diplomacy Matrix</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {diplomaticRelations.slice(0, 9).map((rel, idx) => {
                const isLow = rel.trustScore < 75
                return (
                  <div 
                    key={idx} 
                    style={{
                      padding: 8,
                      background: isLow ? 'rgba(239,68,68,0.04)' : 'rgba(245,197,24,0.01)',
                      border: isLow ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.02)',
                      borderRadius: 4,
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: 9, color: '#fff', fontWeight: 'bold' }}>
                      {rel.fromAgent.split(' ')[0]} ⇄ {rel.toAgent.split(' ')[0]}
                    </span>
                    <strong style={{ display: 'block', fontSize: 12, color: isLow ? '#EF4444' : '#F5C518', margin: '4px 0' }}>
                      {rel.trustScore}% Trust
                    </strong>
                    <span style={{ display: 'block', fontSize: 8, color: '#666' }}>Align: {rel.alignmentScore}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conflict Forecasting & Multi-Agent Resilience Scoring */}
          <div style={{ background: '#020202', padding: 14, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Agent Conflict Forecasting</span>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>Veto Probability Risk:</span>
                  <strong style={{ color: activeConflict ? '#EF4444' : '#10B981' }}>{activeConflict ? '94.2% (HIGH)' : '4.5% (LOW)'}</strong>
                </div>
                <div style={{ height: 4, background: '#0a0a0a', borderRadius: 2, marginTop: 4 }}>
                  <div style={{ width: activeConflict ? '94.2%' : '4.5%', background: activeConflict ? '#EF4444' : '#10B981', height: '100%' }} />
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Multi-Agent Resilience Scoring</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 8, background: '#050505', borderRadius: 4, border: '1px solid rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: 8, color: '#666', display: 'block' }}>Alignment Gating</span>
                  <strong style={{ fontSize: 14, color: '#fff' }}>{stabilizationAlignment}%</strong>
                </div>
                <div style={{ padding: 8, background: '#050505', borderRadius: 4, border: '1px solid rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: 8, color: '#666', display: 'block' }}>Quorum Negotiation</span>
                  <strong style={{ fontSize: 14, color: '#F5C518' }}>{negotiationConfidence}%</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Grid of Dynamic Charts */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* 1. Rolling Latency Trends AreaChart */}
        <article className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>⚡ API Gateway Latency & Failovers</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
            Measures response speed (ms) and fallback activations. Spikes indicate active simulated RPC congestion.
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5C518" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} unit="ms" />
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(245,197,24,0.3)', color: '#fff', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="latency" name="Latency" stroke="#F5C518" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 2. Rolling Chain activity LineChart */}
        <article className="card" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>🌐 Multi-Chain Transaction Rates (TPS)</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
            Rolling transactions per second processed across connected EVM, SVM, and Stellar smart nodes.
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tpsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                <Line type="monotone" dataKey="Solana" stroke="#A855F7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Stellar" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Arbitrum" stroke="#EC4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="QIE" stroke="#F5C518" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 3. AI Query Distribution BarChart */}
        <article className="card" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>🧠 AI Orchestration Query Distribution</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
            Measures Natural Language negotiation loops and automated audit streams dispatched to AI nodes.
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                <Bar dataKey="requests" name="Queries" fill="#F5C518" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 4. Wallet Connection & Ingestion Trends */}
        <article className="card" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>🦊 Active Wallet Handshake Densities</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
            Correlates connected wallet extensions with aggregate verified cryptographic transaction loops.
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={walletData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                <Bar dataKey="active" name="Active Extension" fill="#F5C518" />
                <Bar dataKey="transactions" name="Verified Handshakes" fill="#4B5563" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

      </section>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
