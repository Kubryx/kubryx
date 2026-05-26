// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'

export interface ProfileState {
  creditScore: string
  activeVaults: number
  activeAgents: number
  treasuryBalance: string
  ncrdStaked: number
  ncrdBalance: number
  activeLoansCount: number
  staleAgentAlert: boolean
}

export interface AIMemory {
  lastLendingNegotiation?: string
  lastAgentTask?: string
  lastProposalCreated?: string
  suspiciousActivityFlag: boolean
}

export interface OSActivity {
  id: string
  tool: string
  action: string
  wallet?: string
  timestamp: string
  chain: string
  explorerUrl?: string
}

export interface RecommendationCard {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'warning' | 'tip' | 'governance'
  actionText: string
  actionHref: string
}

export interface IntelligenceState {
  profile: ProfileState
  memory: AIMemory
  demoActive: boolean
  demoStep: number
  activityFeed: OSActivity[]
}

const DEFAULT_STATE: IntelligenceState = {
  profile: {
    creditScore: '742',
    activeVaults: 1,
    activeAgents: 1,
    treasuryBalance: '12,480 SOL',
    ncrdStaked: 500,
    ncrdBalance: 1000,
    activeLoansCount: 1,
    staleAgentAlert: false,
  },
  memory: {
    suspiciousActivityFlag: false,
  },
  demoActive: false,
  demoStep: 0,
  activityFeed: [],
}

// Client-side singleton state
let globalState = { ...DEFAULT_STATE }
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((l) => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_os_intelligence', JSON.stringify(globalState))
    // Dispatch cross-tab/window event
    window.dispatchEvent(new Event('kubryx_os_update'))
  }
}

// Load initial state safely on client
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_os_intelligence')
    if (saved) {
      globalState = { ...DEFAULT_STATE, ...JSON.parse(saved) }
    }
  } catch {
    // ignore
  }
}

export function getIntelligenceState(): IntelligenceState {
  return globalState
}

export function updateIntelligenceState(updater: (prev: IntelligenceState) => Partial<IntelligenceState>) {
  const diff = updater(globalState)
  globalState = { ...globalState, ...diff }
  notifyListeners()
}

export function useCrossToolIntelligence() {
  const [state, setState] = useState<IntelligenceState>({ ...globalState })

  useEffect(() => {
    const handler = () => setState({ ...globalState })
    listeners.add(handler)
    
    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_os_update', handler)
    }
    
    return () => {
      listeners.delete(handler)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_os_update', handler)
      }
    }
  }, [])

  return state
}

// Dynamic context-aware financial insights & suggestions
export function getRecommendedActions(state: IntelligenceState): RecommendationCard[] {
  const cards: RecommendationCard[] = []

  // 1. Credit-to-lending intelligence
  const score = parseInt(state.profile.creditScore) || 0
  if (score >= 700 && state.profile.activeLoansCount === 0) {
    cards.push({
      id: 'insight-lend-credit',
      title: 'Defi Credit Opportunity',
      description: `Your verified Credit Passport score is high (${score} Grade A). You are pre-approved for low-interest Arbitrum loans.`,
      type: 'opportunity',
      actionText: 'Open AI Lending Desk',
      actionHref: '/lend',
    })
  }

  // 2. Treasury-to-staking optimization
  const balanceStr = state.profile.treasuryBalance.replace(/[^0-9.]/g, '')
  const balance = parseFloat(balanceStr) || 0
  if (balance > 1000) {
    cards.push({
      id: 'insight-treasury-staking',
      title: 'NCRD APY Rebalancing',
      description: 'Optimize idle Treasury balances. Allocating 150 SOL to NCRD staking yields 12.5% APY in automated rewards.',
      type: 'opportunity',
      actionText: 'Stake NCRD Tokens',
      actionHref: '/credit',
    })
  }

  // 3. Security Warning: Suspicious activities or lack of vault claims
  if (state.memory.suspiciousActivityFlag) {
    cards.push({
      id: 'warn-suspicious-wallet',
      title: 'Security Alert: Active Threat',
      description: 'Private Vault monitored suspicious routing attempts from an unauthorized RPC. Lock zero-metadata routing keys.',
      type: 'warning',
      actionText: 'Secure Private Vault',
      actionHref: '/vault',
    })
  }

  // 4. Agent Mesh automation recommendation
  if (state.profile.activeVaults > 0 && state.profile.activeAgents === 0) {
    cards.push({
      id: 'tip-agent-vault',
      title: 'Automate Vault Safeguards',
      description: 'No Solana agents are active. Deploy a TreasuryGuard agent to monitor EternalVault status every 60 seconds.',
      type: 'tip',
      actionText: 'Configure Agent Mesh',
      actionHref: '/agents',
    })
  }

  // 5. General tip if everything is healthy
  if (cards.length === 0) {
    cards.push({
      id: 'tip-dashboard-tour',
      title: 'Launch Dashboard Tour',
      description: 'Explore the multi-chain dashboard. Connect Freighter, Phantom, and MetaMask to run cryptographically verified routines.',
      type: 'tip',
      actionText: 'Replay Tour',
      actionHref: '#tour',
    })
  }

  return cards
}

// Log a chronological event safely into OS activity feed
export function recordOSEvent(tool: string, action: string, chain: string, wallet?: string, explorerUrl?: string) {
  const newEvent: OSActivity = {
    id: `os-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tool,
    action,
    wallet,
    chain,
    explorerUrl,
    timestamp: new Date().toISOString(),
  }
  
  updateIntelligenceState((prev) => {
    const list = [newEvent, ...prev.activityFeed].slice(0, 100) // Keep rolling 100
    return { activityFeed: list }
  })
}

// EXECUTIVE SHOWCASE SCRIPTED TOUR STEPS
export interface WalkthroughStep {
  title: string
  route: string
  instructions: string
  tip: string
  actionLabel?: string
}

export const SHOWCASE_FLOW: WalkthroughStep[] = [
  {
    title: '1. Unified Dashboard Command Center',
    route: '/dashboard',
    instructions: 'Observe real-time roundtrip latency (e.g. 45ms) and SLA uptime checkups across all tools. Keep wallets connected to feed dynamic streams.',
    tip: '💡 Investor Demo: Everything runs on stateful memories. Pings keep the backends fully primed.',
  },
  {
    title: '2. Credit Passport (Soulbound NFT & APY Staking)',
    route: '/credit',
    instructions: 'Calculate dynamic credit score grades on QIE Mainnet. Stake NCRD tokens statefully to earn auto-yield in our memory registry.',
    tip: '💡 Judge Note: Connecting MetaMask verifies network parameters dynamically under Chain ID 1990.',
  },
  {
    title: '3. Lendora AI (Negotiation & Arbitrum Loans)',
    route: '/lend',
    instructions: 'Communicate with the AI credit advisor. The advisor dynamically reads user credit score profiles to approve mock loans.',
    tip: '💡 Tech Focus: If backend services are offline, a secure local fallback handles natural language models seamlessly.',
  },
  {
    title: '4. PalmFlow AI (Treasury & Multi-Sig Streams)',
    route: '/treasury',
    instructions: 'Monitor real-time payroll inflow/outflow streams on Solana Devnet. Use the Yield Optimizer to balance treasury assets.',
    tip: '💡 UX Polish: Features smooth micro-animations and zero layout shifts during rebalances.',
  },
  {
    title: '5. Shadow OS (AI Corporate Orchestrations)',
    route: '/shadow',
    instructions: 'Trigger and command 7 automated corporate departments including CFO, Risk, Audits, and Compliance bots.',
    tip: '💡 Presentation Power: Showcases deterministic execution loops even with high network latency.',
  },
  {
    title: '6. Executive Operations Center',
    route: '/operations',
    instructions: 'Review systemic risk indicators, infrastructure SLA dials, the global node map, and explainable Autonomous AI Recommendations.',
    tip: '💡 AI Intelligence: The persistent AI memory retains threads, applied recommendations, and incident histories locally.',
  },
  {
    title: '7. Protocol Control Center',
    route: '/protocols',
    instructions: 'Observe active synchronization states across QIE Mainnet, Solana Devnet, Stellar Testnet, and Arbitrum One in a unified visual topology.',
    tip: '💡 Multichain Power: Deep-links direct queries to live block explorers for each network environment.',
  },
  {
    title: '8. Protocol Coordination Layer',
    route: '/coordination',
    instructions: 'Test dynamic event propagation mesh loops, check multi-chain sync matrix parameters, and trigger workload balancing across 8 nodes.',
    tip: '💡 Coordination Edge: Provides real-time transaction cascade tracing and bottleneck alerts.',
  },
  {
    title: '9. Protocol Governance Center',
    route: '/governance',
    instructions: 'Submit proposal KIPs, simulate voting propagation, cast votes, and trace ZK decision lineages statefully.',
    tip: '💡 Decentralized Power: Fast-forward simulation validates governance consensus loops instantly.',
  },
  {
    title: '10. Infrastructure Policy Center',
    route: '/policies',
    instructions: 'Review boundary guardrails, trace conflict detectors, and replay telemetry escalation rules dynamically.',
    tip: '💡 Safe Sandboxes: Assures absolute mathematical isolation from production-grade databases.',
  },
  {
    title: '11. Sovereign Executive Command Board',
    route: '/executive',
    instructions: 'The highest-level cockpit. Balance incentives, monitor advanced threat matrix simulators, and restore historic global snapshots statefully.',
    tip: '💡 Ultimate Executive Control: Integrates telemetry, quorums, economics, and memory in a premium interface.',
  },
  {
    title: '12. Developer Ecosystem Portal',
    route: '/ecosystem',
    instructions: 'Explore the webhook playground, dispatch simulated payload traces, and review SDK integration models.',
    tip: '💡 Platform Maturity: Provides a unified environment playground that makes the platform deployable at scale.',
  },
  {
    title: '13. Telemetry Console & Diagnostics Logs',
    route: '/dashboard#telemetry',
    instructions: 'Inspect the system console at the bottom of your command panel to view real-time RPC failures, gateway classifications, or backoffs.',
    tip: '💡 SLA Proof: Proves complete architectural reliability under real server environments.',
  },
]
