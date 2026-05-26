// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
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
      id: 'works',
      title: 'How Kubryx Works',
      subtitle: 'A single operating system coordinating decentralized state transitions.',
      paragraphs: [
        'Corporate finance is severely bottlenecked by multi-chain friction. Individual networks are isolated silos with disparate wallet abstractions, RPC latency profiles, and non-standard contract parameters.',
        'Kubryx resolves this by treating blockchain environments as integrated operational channels of a single unified OS. We absorb active wallet contexts reactively, allowing distinct tools to share synchronized parameters in client memory.',
        'This allows Yield Operations Hub desks, autonomous staking models, and secure vaults to collaborate seamlessly without manual bridging, complex network switches, or custom orchestration code.'
      ],
      metrics: [
        { label: 'Built-in Tools', value: '8 Tools, 1 OS' },
        { label: 'Integration Layer', value: 'Unified Context' }
      ]
    },
    {
      id: 'ai-coord',
      title: 'AI-Assisted Coordination',
      subtitle: 'Where natural language orchestration meets mathematical certainty.',
      paragraphs: [
        'Conventional automation rules are rigid, fragile, and fail to adapt during volatile market conditions. Standard AI agents, conversely, lack cryptographic safety guarantees.',
        'Kubryx blends these paradigms into a high-security coordination layer. Advanced LLM pipelines analyze complex liquidity states and negotiate rates, but every transaction must pass detached Freighter XDR or Phantom Ed25519 signature checks before execution.',
        'This dual-engine model provides corporate operators with intuitive narrative control while guaranteeing absolute cryptographic vault isolation against external exploits or AI hallucinations.'
      ],
      metrics: [
        { label: 'Orchestration Engine', value: 'Autonomous LLM' },
        { label: 'Cryptographic Bound', value: 'Ed25519 Detached' }
      ]
    },
    {
      id: 'auto-infra',
      title: 'Autonomous Infrastructure',
      subtitle: 'Self-healing SLA nodes and dynamic telemetry protection.',
      paragraphs: [
        'Web3 regional nodes are prone to frequent packet dropouts and memory congestion. Kubryx builds systemic resilience directly into our core telemetry layer.',
        'Our custom diagnostics suite monitors RPC response speeds in milliseconds. If a regional node suffers a cold restart or latency spike, a 6-second abort threshold intercepts the query and auto-routes traffic through cache failovers.',
        'This maintains continuous corporate uptime and guarantees a reliable, presentation-safe showcase under simulated latency or node outages.'
      ],
      metrics: [
        { label: 'Nominal Gateway SLA', value: '45ms' },
        { label: 'Resilience Uptime', value: '99.98%' }
      ]
    },
    {
      id: 'cross-chain-intel',
      title: 'Cross-Chain Operational Intelligence',
      subtitle: 'Correlating multi-chain event buses to orchestrate liquid flows.',
      paragraphs: [
        'Staking and lending yields fluctuate continuously across EVM L2 and Soroban environments. Retrospective periodic sweeps lock up critical capital.',
        'Kubryx coordinates an autonomous cross-chain event bus that listens to gas limits and yields. When a staking APY spikes on QIE, the engine dispatches optimized rebalance proposals to corporate stakeholders.',
        'These recommendations are accompanied by detailed event causality chains and confidence estimates, allowing teams to execute complex asset sweeps instantly.'
      ],
      metrics: [
        { label: 'Supported Chains', value: 'QIE, Solana, Stellar, Arbitrum' },
        { label: 'Cross-Chain Bus Uptime', value: '100% Core' }
      ]
    },
    {
      id: 'future-finance',
      title: 'Future of Organizational Finance',
      subtitle: 'Next-generation digital twins and continuous yield streaming.',
      paragraphs: [
        'Modern Yield Operations Hub assets demand continuous operational execution. Kubryx envisions a future where multi-party payroll streams, debt optimization pools, and AI nodes operate autonomously.',
        'To stress-test these scenarios safely, Kubryx integrates an isolated Digital Twin framework. Executives can simulate heavy congestions, key compromise compromises, and RPC cascades to verify automated AI safeties in sandboxed sandboxes.',
        'By combining physical execution with synthetic twin simulations, Kubryx empowers enterprises and DAOs with unprecedented control over digital assets and liquid flows.'
      ],
      metrics: [
        { label: 'Sandbox Simulation profiles', value: '12 Scenarios' },
        { label: 'Investor Showcase Uptime', value: 'Certified' }
      ]
    },
    {
      id: 'sovereign-ops',
      title: 'Operational Sovereignty',
      subtitle: 'A decentralized, independent network governing autonomous digital resources.',
      paragraphs: [
        'Traditional infrastructure relies on centralized third-party hosting, vulnerable to administrative shifts, domain blockages, and single-point routing failures.',
        'Kubryx introduces Operational Sovereignty by establishing a decentralized, self-governing consensus mesh. Nodes continuously verify quorum signatures, validate execution parameters, and maintain an independent operational state.',
        'This ensures that key corporate assets, multi-sig streams, and yield protocols remain fully resilient and sovereign against external network partitionings or centralized outages.'
      ],
      metrics: [
        { label: 'Sovereignty Index', value: '98.4%' },
        { label: 'Consensus Quorum', value: 'Validator Mesh' }
      ]
    },
    {
      id: 'ai-governed',
      title: 'AI-Governed Coordination & Network Policies',
      subtitle: 'Rigorous machine-speed logic gated by ZK policy lineages.',
      paragraphs: [
        'AI agent automation must be bound by clear operational parameters to prevent transaction drifts, liquidity drains, or resource misallocations during extreme volatility.',
        'Our Infrastructure Policy Engine establishes stateful telemetry escalation rules, resource constraint boundaries, and simulation safety sandboxes. These policies are traced dynamically in our governance registry.',
        'Every automated decision leaves a clear, immutable lineage trace, allowing developers and compliance teams to audit AI-agent behavior with absolute logical explainability.'
      ],
      metrics: [
        { label: 'Conflict Detection', value: 'Automated Trackers' },
        { label: 'Policy Registers', value: 'Zero-Knowledge Trace' }
      ]
    },
    {
      id: 'digital-ops',
      title: 'Digital Operational Networks & Future Economies',
      subtitle: 'Simulating decentralized liquidity equilibrium at protocol scale.',
      paragraphs: [
        'As protocol-scale finance scales, multi-chain liquidity must migrate dynamically to counter yield changes, gas spikes, and network congestions.',
        'Kubryx balances these flows through our Autonomous Economic Coordination engine. The engine models dynamic pool flows and calculates coordinate rewards to incentivize healthy liquidity distributions.',
        'By matching machine-speed yield balancing with mathematical equilibrium indexes, we construct a sovereign operational layer capable of serving the next generation of global DAOs and protocols.'
      ],
      metrics: [
        { label: 'Equilibrium Index', value: '94.6%' },
        { label: 'Rewards Pool', value: 'NCRD Incentives' }
      ]
    },
    {
      id: 'infra-coordination',
      title: 'The Infrastructure Coordination Era',
      subtitle: 'Moving past isolated cloud boxes towards synchronized global ledgers.',
      paragraphs: [
        'Static hosting model setups are vulnerable to network fragmentation, DNS blocking, and localized routing outages.',
        'Kubryx heralds a new operational standard by establishing an independent, self-governing consensus mesh. Nodes continuously verify transaction quorums, calibrate latency targets, and maintain localized state databases.',
        'This guarantees absolute permanence and multi-cloud resilience, allowing organizations to run digital twin payroll systems with complete operational isolation.'
      ],
      metrics: [
        { label: 'Coordination Weight', value: 'Validator Mesh' },
        { label: 'Nominal Sync', value: '45ms target' }
      ]
    },
    {
      id: 'ai-native-fabric',
      title: 'AI-Native Operational Fabric',
      subtitle: 'Orchestrating multi-chain state routes with rigorous zero-knowledge policies.',
      paragraphs: [
        'Traditional automation rules are rigid, fragile, and fail to adapt during extreme volatility. LLMs, conversely, lack cryptographic safeguards.',
        'Our Infrastructure Policy Engine resolves this by binding autonomous agent allocations within deterministic boundaries (such as a 50k USDC sweep limit). Every routing recommendation leaves a ZK decision trace in our governance registry.',
        'This allows operators to review machine-speed mitigations with complete logical explainability and absolute defense confidence.'
      ],
      metrics: [
        { label: 'Policy Gating', value: 'ZK Decision Lineage' },
        { label: 'Escalation Rules', value: 'USDC Thresholds' }
      ]
    },
    {
      id: 'beyond-saas',
      title: 'Beyond SaaS Operations',
      subtitle: 'A decentralized, independent network governing autonomous digital resources.',
      paragraphs: [
        'Conventional SaaS dashboards are passive observers, capturing retrospective data without the power to execute self-correcting transactions.',
        'Kubryx balances resources proactively through the Autonomous Economic Coordination engine. The engine models liquidity pools dynamically and adjust reward levels to correct multi-chain yield imbalances.',
        'By matching machine-speed adjustments with mathematical equilibrium scores, we present a resilient operational layer capable of serving global DAOs and protocols.'
      ],
      metrics: [
        { label: 'Ecosystem APY', value: 'Dynamic Rewards' },
        { label: 'Maturity Score', value: '98.4%' }
      ]
    },
    {
      id: 'sovereign-coordination',
      title: 'The Sovereign Coordination Layer',
      subtitle: 'Binding isolated blockchain environments into a unified state registry.',
      paragraphs: [
        'As organizations scale across EVM, Solana, and Soroban Stellar, infrastructure data becomes highly fragmented.',
        'Kubryx solves this by implementing our stateful Global Operations Engine, which synchronizes telemetry updates, governance votes, and transaction sweeps into a single, authoritative ledger.',
        'This creates a resilient coordination network that allows protocols and DAOs to coordinate assets with complete operational permanence.'
      ],
      metrics: [
        { label: 'Sync Registry', value: 'Event-Driven' },
        { label: 'State Latency', value: 'Sub-second' }
      ]
    },
    {
      id: 'operational-consensus',
      title: 'Operational Consensus Systems',
      subtitle: 'Dynamically computing network health and multi-region quorum reliability.',
      paragraphs: [
        'Traditional systems rely on simple uptime scores that ignore consensus drift and validator state discrepancies.',
        'Our Operational Consensus Index continuously aggregates infrastructure status, governance rates, and AI confidence indices.',
        'By matching telemetry metrics with real-time consensus calculations, we ensure that operators always have an explainable, institutional view of ecosystem health.'
      ],
      metrics: [
        { label: 'Consensus Score', value: 'Dynamic Index' },
        { label: 'Audit Baseline', value: '98.4%' }
      ]
    },
    {
      id: 'ai-governed-infra',
      title: 'AI-Governed Infrastructure',
      subtitle: 'Delegating high-throughput operations within rigorous policy constraints.',
      paragraphs: [
        'Autonomous agents excel at fast transaction execution but need safety guardrails to protect capital.',
        'Kubryx embeds agents within our deterministic Infrastructure Policy Engine, which automatically enforces limits, checks consensus drift, and logs decision rationale in zero-knowledge decision chains.',
        'This establishes a secure sandbox where machine intelligence performs sweeps while preserving absolute operator override control.'
      ],
      metrics: [
        { label: 'Agent Coordinator', value: 'Heuristic Gating' },
        { label: 'Override Control', value: '100% Secure' }
      ]
    },
    {
      id: 'self-healing-economies',
      title: 'Self-Healing Digital Economies',
      subtitle: 'Automating consensus adjustments and multi-chain liquidity sweeps.',
      paragraphs: [
        'During market volatility, liquid sweeps must execute instantly to prevent yield imbalance cascading across bridges.',
        'Our Autonomous Recovery engine automatically simulates consensus restoration and initializes recovery propagation across all active regions.',
        'This resolves degraded nodes statefully, stabilizing the network index and preserving optimal APY incentives for enterprise pools.'
      ],
      metrics: [
        { label: 'Healing Time', value: '4s Recovery' },
        { label: 'Resilience Score', value: '99.2%' }
      ]
    },
    {
      id: 'protocol-civilization',
      title: 'Protocol Civilization Scale',
      subtitle: 'Powering the next era of decentralized sovereign organizational operations.',
      paragraphs: [
        'We are moving past passive web dashboards towards autonomous, permanently synchronized operational networks.',
        'Kubryx represents the pinnacle of this shift, providing enterprises, DAOs, and developers with a complete, single-product operating system.',
        'With state-of-the-art aesthetics and absolute mathematical reliability, Kubryx is fully prepared to orchestrate the next chapter of digital finance.'
      ],
      metrics: [
        { label: 'Scale Target', value: 'Enterprise Permanent' },
        { label: 'Product Status', value: 'Accelerator Ready' }
      ]
    },
    {
      id: 'strategic-infra',
      title: 'The Strategic Infrastructure Era',
      subtitle: 'Transitioning from active monitoring to predictive planning and autonomous control.',
      paragraphs: [
        'Passive telemetry matrices are no longer sufficient to govern global scale organizational systems.',
        'Our newly integrated Strategic Intelligence Layer continuously runs simulations, audits volatility, and outputs immediate high-integrity rerouting strategies.',
        'By linking monitoring with predictive planning engines, we create an immune system for decentralized digital assets.'
      ],
      metrics: [
        { label: 'Strategic Layer', value: 'Active Realtime' },
        { label: 'Simulation Target', value: 'Zero Latency' }
      ]
    },
    {
      id: 'autonomous-sovereign',
      title: 'Autonomous Sovereign Coordination',
      subtitle: 'Unifying multi-region quorums under permanent event bus protocols.',
      paragraphs: [
        'Decentralized quorums are highly vulnerable during regional latency spikes or consensus partition attacks.',
        'Kubryx resolves this by coordinating the Global Event Bus statefully, triggering deterministic, multi-step mitigation sequences across secondary validator zones.',
        'This guarantees that transaction sweeps and payroll distributions continue executing with absolute mathematical safety.'
      ],
      metrics: [
        { label: 'Coordination Model', value: 'Event-Driven' },
        { label: 'Outage Tolerance', value: 'Failover Active' }
      ]
    },
    {
      id: 'ai-native-decision',
      title: 'AI-Native Decision Systems',
      subtitle: 'Enforcing zero-knowledge policies across parallelized Agent Coordinator networks.',
      paragraphs: [
        'Machine intelligence must be gated inside secure boundaries to prevent collateral state corruption.',
        'Our AI Recommendation Feed checks active policies dynamically, producing deterministic, replay-safe reasoning trails for all proposed balance sweeps.',
        'This presents a perfect synergy where operators maintain high-level supervision while algorithms operate at machine speed.'
      ],
      metrics: [
        { label: 'Gating Standard', value: 'ZK Rationale' },
        { label: 'Assessment Speed', value: 'Sub-second' }
      ]
    },
    {
      id: 'predictive-civilization',
      title: 'Predictive Operational Civilizations',
      subtitle: 'Forecasting consensus trajectories across standard 1h, 24h, and 7d horizons.',
      paragraphs: [
        'Ecosystems succeed when they can predict failures before they cascade into multi-chain bridges.',
        'We execute high-fidelity scenario projections, evaluating consensus trends, Yield Operations Hub pressures, and governance volatilities statefully.',
        'This empowers operators to proactively deploy mitigation keys, preventing consensus collapse and maintaining premium reliability.'
      ],
      metrics: [
        { label: 'Forecast Horizon', value: '7-Day Maximum' },
        { label: 'Confidence Index', value: '98.5%' }
      ]
    },
    {
      id: 'self-optimizing-economies',
      title: 'Self-Optimizing Digital Economies',
      subtitle: 'Balancing incentive curves statefully in response to live operational anomalies.',
      paragraphs: [
        'Traditional reward systems fail to adjust yield buffers dynamically when network congestion rises.',
        'Kubryx bridges this gap by coordinating incentive sweeps in direct response to the global consensus health and regional volatility.',
        'The resulting self-balancing ecosystem represents the pinnacle of operational intelligence for future global protocols.'
      ],
      metrics: [
        { label: 'Adjustment Cycle', value: 'Continuous Sine' },
        { label: 'Resilience Score', value: '99.4%' }
      ]
    },
    {
      id: 'civilization-coordination',
      title: 'The Civilization Coordination Layer',
      subtitle: 'Transforming sovereign nodes into a civilization-scale multi-agent operational network.',
      paragraphs: [
        'The conventional view of blockchain operations limits itself to simple REST queries, retrospective accounting, and singular wallets. As global operations scale, systems demand an infrastructure capable of coordination at the speed of thought.',
        'Kubryx moves past these constraints by orchestrating a civilization-scale network where autonomous institutional entities coordinate, negotiate, and align statefully.',
        'Every participant is bound by rigorous, decentralized consensus rules, creating a permanent layer of protocol trust and sovereign operational stability.'
      ],
      metrics: [
        { label: 'Coordinating Agents', value: '6 Sovereign Nodes' },
        { label: 'Ecosystem Alignment', value: 'Stateful Consensus' }
      ]
    },
    {
      id: 'autonomous-agents',
      title: 'Autonomous Institutional Agents',
      subtitle: 'Decentralizing operational logic across specialized, self-governing agents.',
      paragraphs: [
        'Monolithic operational controls are single points of failure. In Kubryx, coordination is delegated to six autonomous institutional agents.',
        'The Yield Operations Hub Sovereign governs asset flows, the Governance Chancellor propagates policies, the Infrastructure Sentinel protects regions, and the Ecosystem Diplomat harmonizes protocols.',
        'Together with the Cognition Oracle and Recovery Director, they coordinate actions in real-time, matching high-throughput execution with complete logical integrity.'
      ],
      metrics: [
        { label: 'Agent Roles', value: 'Specialized Gating' },
        { label: 'Active Intent Rate', value: 'Continuous Cycle' }
      ]
    },
    {
      id: 'protocol-diplomacy',
      title: 'Protocol Diplomacy Systems',
      subtitle: 'Negotiating asset allocations, consensus weightings, and regional quorums statefully.',
      paragraphs: [
        'When network friction occurs, standard protocols fail back to rigid outages or human manual overrides. Kubryx introduces Protocol Diplomacy.',
        'Agents statefully propose, evaluate, and finalize negotiations on yield sweeps, RPC balancing, and security hardening on a centralized event stream.',
        'By weighting trust matrices and diplomatic alignments dynamically, the platform resolves inter-agent disputes before they affect core business operations.'
      ],
      metrics: [
        { label: 'Diplomatic Streams', value: 'Real-time Event Bus' },
        { label: 'Dispute Safety Limit', value: 'Automated Recovery' }
      ]
    },
    {
      id: 'distributed-cognition',
      title: 'Distributed Sovereign Cognition',
      subtitle: 'Enforcing zero-knowledge policy boundaries across parallel multi-agent quorums.',
      paragraphs: [
        'Machine-speed optimization without policy gating creates vulnerability. In Kubryx, all agent decisions must align with strict, zero-knowledge constraints.',
        'The Distributed Cognition Engine continuously evaluates regional anomalies and applies rules to prevent state drifts or unauthorized balance reallocations.',
        'This Synergizes maximum logical autonomy with absolute operator control, providing premium safety for enterprise digital assets.'
      ],
      metrics: [
        { label: 'Cognition Confidence', value: '98.5% Accuracy' },
        { label: 'Decision Trace Gating', value: 'ZK Rationale' }
      ]
    },
    {
      id: 'self-governing-economies',
      title: 'Self-Governing Operational Economies',
      subtitle: 'The culmination of the single-product operational operating system.',
      paragraphs: [
        'With permanently synchronized global engines, predictive forecasting layers, and a multi-agent civilization mesh, Kubryx completes its vision.',
        'We have transformed corporate finance from fragmented SaaS widgets into a living, resilient, sovereign operational intelligence network.',
        'Fully optimized, certified accelerator-ready, and strategically fortified, Kubryx is prepared to govern the decentralized future.'
      ],
      metrics: [
        { label: 'Ecosystem Status', value: 'Post-SaaS Sovereign' },
        { label: 'Investor Showcase Uptime', value: '100% Certified' }
      ]
    }
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length])

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
            Slide {activeSlideIndex + 1} of {slides.length}
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
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
