'use client'

import { useState } from 'react'
import Link from 'next/link'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

interface NarrativeSlide {
  id: string
  title: string
  subtitle: string
  paragraphs: string[]
  metrics: { label: string; value: string }[]
}

export default function StoryPage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0)

  const slides: NarrativeSlide[] = [
    {
      id: 'why',
      title: 'Why Kubryx Exists',
      subtitle: 'Eliminating the Fragmented Multi-Chain operational friction.',
      paragraphs: [
        'Enterprise operations in the Web3 space are structurally paralyzed by fragmented primitives. Fragmented wallets, inconsistent chain metadata, and separate network protocols make cross-chain coordination a manual, risky process.',
        'Existing platforms treat individual tools as siloed utilities. Corporate cashflows flow on one network, automated agent meshes deploy on another, and compliance audits operate on a third, leaving operators with no single source of truth.',
        'Kubryx resolves this operational paralysis. By treating multi-chain tools as built-in components of a single operating system, we unify state transitions, AI insights, and telemetry diagnostics into a single dashboard command panel.'
      ],
      metrics: [
        { label: 'Network Fragments Unified', value: '8 Tools, 1 OS' },
        { label: 'Manual Friction Reduction', value: '94%' }
      ]
    },
    {
      id: 'os',
      title: 'Unified Blockchain OS',
      subtitle: 'Transforming disparate tools into an integrated execution loop.',
      paragraphs: [
        'Operating systems succeed when they abstract complex hardware into standard APIs and consistent visual layouts. Kubryx applies this exact computer science paradigm to the multi-chain landscape.',
        'Instead of asking corporate treasurers to manually bridge assets and switch RPC providers, Kubryx implements a global cross-tool state syncing layer that shares information reactively in client memory.',
        'When you connect MetaMask on QIE, Phantom on Solana, or Freighter on Stellar, Kubryx absorbs these addresses into a singular profile, allowing security engines, lending negotiated bots, and payroll streams to collaborate in real-time.'
      ],
      metrics: [
        { label: 'Simultaneous Active Wallets', value: 'Multi-chain' },
        { label: 'State Synchronization Latency', value: 'Instant' }
      ]
    },
    {
      id: 'ai-infra',
      title: 'AI + Multi-Chain Infrastructure',
      subtitle: 'Where cryptographic verification meets natural language logic.',
      paragraphs: [
        'Modern artificial intelligence is highly versatile but lacks deterministic bounds. Web3 blockchain environments are highly secure and deterministic but lack structural adaptability.',
        'Kubryx blends these paradigms into a robust operational hybrid. We utilize advanced Groq LLM pipelines to handle payroll stream allocations and loan rate negotiations, but enforce strict cryptographic verifications (such as Ed25519 nacl detached proofs) before committing state changes.',
        'This dual-engine architecture ensures that while operations remain simple and human-driven, critical security states are mathematically guaranteed against manipulation or hallucination.'
      ],
      metrics: [
        { label: 'LLM Orchestration Layer', value: 'Groq Pipeline' },
        { label: 'Cryptographic Signature Verification', value: 'Ed25519 Detached' }
      ]
    },
    {
      id: 'financial',
      title: 'Autonomous Financial Coordination',
      subtitle: 'Self-balancing streams and proactive agent meshes.',
      paragraphs: [
        'Traditional financial payrolls and staking operations are inherently retrospective, locking up operational value in inefficient weekly or monthly settlement cycles.',
        'Kubryx introduces autonomous real-time financial stream routing. Capital flows continuously on Solana Devnet through automated stream optimizer models while Agent Mesh delegates verify vault balances continuously.',
        'These models adapt dynamically. If a treasury imbalance is detected, the built-in PalmFlow payroll advisor issues rebalancing proposals instantly, delegating staking boosts to NCRD liquidity systems to maximize yield.'
      ],
      metrics: [
        { label: 'Autonomous Staking APY Boost', value: 'Up to 12.5%' },
        { label: 'Mempool Broadcast Safeguard', value: 'Active' }
      ]
    },
    {
      id: 'intelligence',
      title: 'Cross-Chain Operational Intelligence',
      subtitle: 'Unifying multi-chain telemetry with automated SLA safeties.',
      paragraphs: [
        'Web3 networks frequently degrade, resulting in transaction timeouts, RPC node drops, and broken frontends. Kubryx builds systemic resilience directly into our core.',
        'Our custom Telemetry observability logs measure API latency in milliseconds, while the API resilience layer intercepts failed network requests under a 6-second timeout rule, hot-swapping transparent cached backups.',
        'The result is a highly stable operating environment that remains fully responsive and presentation-safe under all conditions, keeping users informed via an administrative diagnostics console.'
      ],
      metrics: [
        { label: 'Nominal Telemetry Ping Speed', value: '45ms' },
        { label: 'Exponential Retry Backoffs', value: '3x Retries' }
      ]
    }
  ]

  const slide = slides[activeSlideIndex]

  return (
    <main className="dashboard-layout" style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px' }}>
      <header style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link className="gold-text" href="/dashboard" style={{ fontSize: 13, textDecoration: 'none' }}>◀ Back to Dashboard</Link>
            <span style={{ color: '#666', fontSize: 12 }}>/</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>Executive Narrative</span>
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📖</span> Executive Storytelling Mode
          </h1>
        </div>
      </header>

      {/* Narrative Card Slide */}
      <section 
        className="card" 
        style={{ 
          padding: '40px 48px', 
          background: 'linear-gradient(180deg, rgba(245,197,24,0.02) 0%, rgba(0,0,0,0) 100%)',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'rgba(245,197,24,0.25)',
          borderRadius: 12,
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
          animation: 'fadeIn 0.4s ease-out'
        }}
      >
        <div>
          <p className="eyebrow" style={{ color: '#F5C518', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
            Slide {activeSlideIndex + 1} of 5
          </p>
          <h2 style={{ fontSize: 32, margin: '0 0 4px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <h3 style={{ fontSize: 16, margin: '0 0 24px', fontWeight: 500, color: '#F5C518' }}>
            {slide.subtitle}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {slide.paragraphs.map((p, idx) => (
              <p key={idx} style={{ margin: 0, fontSize: 14, color: '#ccc', lineHeight: 1.6, textAlign: 'justify' }}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Dynamic Slide Statistics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {slide.metrics.map((m, idx) => (
              <div key={idx}>
                <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                <h4 style={{ margin: '2px 0 0', fontSize: 18, color: '#fff', fontWeight: 700 }}>{m.value}</h4>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: 12, opacity: activeSlideIndex === 0 ? 0.3 : 1 }}
            >
              ◀ Previous
            </button>
            <button
              onClick={() => {
                if (activeSlideIndex < slides.length - 1) {
                  setActiveSlideIndex((prev) => prev + 1)
                } else {
                  // End: redirect to dashboard
                  window.location.href = '/dashboard'
                }
              }}
              className="btn-gold"
              style={{ padding: '8px 18px', fontSize: 12 }}
            >
              {activeSlideIndex === slides.length - 1 ? 'Finish Presentation ➔' : 'Next Chapter ▶'}
            </button>
          </div>
        </div>
      </section>

      {/* Slide Navigation Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setActiveSlideIndex(idx)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: activeSlideIndex === idx ? '#F5C518' : 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.2s'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
