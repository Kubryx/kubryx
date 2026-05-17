'use client'

import { useState, useEffect } from 'react'
import { publishEvent, recalculateConsensus } from './global-operations-engine'
import { recordOSEvent } from './cross-tool-intelligence'
import { toast } from './toast'

export type AgentStatus = 'nominal' | 'negotiating' | 'mitigating' | 'active_dispute'

export interface InstitutionalAgent {
  id: string
  name: string
  role: string
  status: AgentStatus
  confidence: number // %
  trustWeight: number // %
  influenceRate: number // %
  intent: string
  responsibility: string[]
}

export interface InterAgentNegotiation {
  id: string
  proposer: string
  responder: string
  topic: string
  consensusRequired: number // %
  currentAlignment: number // %
  status: 'pending' | 'agreed' | 'rejected' | 'disputed'
  timestamp: string
}

export interface DiplomaticRelation {
  fromAgent: string
  toAgent: string
  trustScore: number // %
  alignmentScore: number // %
}

export interface CivilizationState {
  agents: InstitutionalAgent[]
  negotiations: InterAgentNegotiation[]
  diplomaticRelations: DiplomaticRelation[]
  coalitionScore: number // %
  negotiationConfidence: number // %
  stabilizationAlignment: number // %
  activeConflict: string | null
}

const BASELINE_AGENTS: InstitutionalAgent[] = [
  {
    id: 'agent-treasury',
    name: 'Treasury Sovereign',
    role: 'Financial Reserve Custodian',
    status: 'nominal',
    confidence: 98.5,
    trustWeight: 95.0,
    influenceRate: 92.4,
    intent: 'APY stabilization and cross-chain reserve protection.',
    responsibility: ['liquidity stabilization', 'APY balancing', 'reserve protection', 'treasury confidence recovery']
  },
  {
    id: 'agent-gov',
    name: 'Governance Chancellor',
    role: 'Legislative Policy Harmonizer',
    status: 'nominal',
    confidence: 96.4,
    trustWeight: 92.0,
    influenceRate: 90.5,
    intent: 'Sovereign KIP consensus harmonization and multi-sig compliance.',
    responsibility: ['proposal stabilization', 'quorum negotiation', 'coalition balancing', 'governance influence coordination']
  },
  {
    id: 'agent-infra',
    name: 'Infrastructure Sentinel',
    role: 'RPC Topology Overlord',
    status: 'nominal',
    confidence: 99.2,
    trustWeight: 98.0,
    influenceRate: 96.8,
    intent: 'Continuous geo-routing checks and low-latency failovers.',
    responsibility: ['regional outage mitigation', 'validator stability', 'topology rerouting', 'resilience forecasting']
  },
  {
    id: 'agent-eco',
    name: 'Ecosystem Diplomat',
    role: 'External Protocol Ambassador',
    status: 'nominal',
    confidence: 95.0,
    trustWeight: 89.0,
    influenceRate: 88.2,
    intent: 'Cross-chain SDK alignment and validation node trust indexing.',
    responsibility: ['ecosystem trust recovery', 'protocol relations', 'partner confidence', 'institutional ecosystem scoring']
  },
  {
    id: 'agent-cog',
    name: 'Cognition Oracle',
    role: 'Strategic Heuristic Synthesizer',
    status: 'nominal',
    confidence: 97.8,
    trustWeight: 96.5,
    influenceRate: 94.6,
    intent: 'Zero-knowledge strategic audits and real-time threat interpretations.',
    responsibility: ['strategic reasoning', 'anomaly interpretation', 'confidence synthesis', 'operational forecasting']
  },
  {
    id: 'agent-recovery',
    name: 'Recovery Director',
    role: 'Cascading Healing Administrator',
    status: 'nominal',
    confidence: 99.6,
    trustWeight: 99.0,
    influenceRate: 97.4,
    intent: 'Orchestrating deterministic self-healing pipelines across consensus zones.',
    responsibility: ['autonomous healing orchestration', 'recovery sequencing', 'stabilization cascades', 'replay-safe restoration planning']
  }
]

const BASELINE_NEGOTIATIONS: InterAgentNegotiation[] = [
  {
    id: 'neg-1',
    proposer: 'Treasury Sovereign',
    responder: 'Governance Chancellor',
    topic: 'Automated 15% APY yield balance shift to Solana networks',
    consensusRequired: 90,
    currentAlignment: 94,
    status: 'agreed',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'neg-2',
    proposer: 'Infrastructure Sentinel',
    responder: 'Recovery Director',
    topic: 'Failover traffic migration from Frankfurt to Virginia ap-southeast nodes',
    consensusRequired: 95,
    currentAlignment: 98,
    status: 'agreed',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
]

let activeCivilizationState: CivilizationState = {
  agents: [...BASELINE_AGENTS],
  negotiations: [...BASELINE_NEGOTIATIONS],
  diplomaticRelations: [],
  coalitionScore: 98.4,
  negotiationConfidence: 97.6,
  stabilizationAlignment: 98.2,
  activeConflict: null
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(l => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_civilization_orchestration', JSON.stringify(activeCivilizationState))
    window.dispatchEvent(new Event('kubryx_civilization_update'))
  }
}

// Hydrate safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_civilization_orchestration')
    if (saved) {
      activeCivilizationState = JSON.parse(saved)
    } else {
      recalculateDiplomacy()
    }
  } catch {
    // ignore
  }
}

export function recalculateDiplomacy() {
  const wave = Math.sin(Date.now() / 20000) * 2.0
  const agents = activeCivilizationState.agents
  const relations: DiplomaticRelation[] = []

  for (let i = 0; i < agents.length; i++) {
    for (let j = 0; j < agents.length; j++) {
      if (i !== j) {
        const trustScore = Math.min(100, Math.max(10, parseFloat((94.5 + wave - (agents[i].status === 'active_dispute' ? 25.0 : 0)).toFixed(1))))
        const alignmentScore = Math.min(100, Math.max(10, parseFloat((95.0 + wave * 0.5 - (agents[j].status === 'active_dispute' ? 20.0 : 0)).toFixed(1))))
        relations.push({
          fromAgent: agents[i].name,
          toAgent: agents[j].name,
          trustScore,
          alignmentScore
        })
      }
    }
  }

  // Recalculate metrics based on agent statuses
  const activeDisputes = agents.filter(a => a.status === 'active_dispute').length
  const coalitionScore = Math.min(100, Math.max(10, parseFloat((98.4 - activeDisputes * 22.0 + wave * 0.8).toFixed(1))))
  const negotiationConfidence = Math.min(100, Math.max(10, parseFloat((97.6 - activeDisputes * 15.0 + wave).toFixed(1))))
  const stabilizationAlignment = Math.min(100, Math.max(10, parseFloat((98.2 - activeDisputes * 18.0 - (activeCivilizationState.activeConflict ? 10 : 0)).toFixed(1))))

  activeCivilizationState = {
    ...activeCivilizationState,
    diplomaticRelations: relations,
    coalitionScore,
    negotiationConfidence,
    stabilizationAlignment
  }
}

// 1. Trigger Coalition Instability
export function triggerCoalitionInstability() {
  activeCivilizationState.agents = activeCivilizationState.agents.map(a => {
    if (a.id === 'agent-eco' || a.id === 'agent-gov') {
      return { ...a, status: 'active_dispute', confidence: 62.5 }
    }
    return { ...a, status: 'negotiating' }
  })

  activeCivilizationState.activeConflict = 'Ecosystem trust scoring mismatch between Chancellor and Diplomat.'
  
  // Publish agents events
  publishEvent(
    'kubryx_agent_conflict',
    JSON.stringify({ agents: ['Governance Chancellor', 'Ecosystem Diplomat'], cause: 'coalition_drift' }),
    'Conflict Escalated: Ecosystem Diplomat disputes Chancellor quorum weighting updates.'
  )
  
  publishEvent(
    'kubryx_coalition_update',
    JSON.stringify({ coalitionScore: 42.5 }),
    'Coalition Instability Alarm: Ecosystem validation node trust scores decoupled!'
  )

  recalculateDiplomacy()
  notifyListeners()
  toast.error('Coalition instability triggered: Agent disputes active!')
}

// 2. Simulate Governance Deadlock
export function simulateGovernanceDeadlock() {
  activeCivilizationState.agents = activeCivilizationState.agents.map(a => {
    if (a.id === 'agent-gov' || a.id === 'agent-treasury') {
      return { ...a, status: 'active_dispute', confidence: 54.0 }
    }
    return a
  })

  activeCivilizationState.activeConflict = 'Treasury sweep gating vetoed by Governance Chancellor.'

  publishEvent(
    'kubryx_agent_conflict',
    JSON.stringify({ agents: ['Governance Chancellor', 'Treasury Sovereign'] }),
    'Deadlock Warning: Chancellor blocks Treasury Sovereign automated APY rebalancing sweep.'
  )

  publishEvent(
    'kubryx_agent_negotiation',
    JSON.stringify({ proposer: 'Treasury Sovereign', status: 'disputed' }),
    'Negotiation Gating: APY realignment swept back into legislative deadlock.'
  )

  recalculateDiplomacy()
  notifyListeners()
  toast.warning('Governance deadlock active: Multi-sig sweeping paused.')
}

// 3. Initiate Sovereign Negotiation
export function initiateSovereignNegotiation() {
  // Push a new negotiation item
  const nextId = `neg-${Date.now()}`
  const newNeg: InterAgentNegotiation = {
    id: nextId,
    proposer: 'Cognition Oracle',
    responder: 'Treasury Sovereign',
    topic: 'Optimizing NCRD staking sweeps based on consensus latency stability forecasts',
    consensusRequired: 92,
    currentAlignment: 88,
    status: 'pending',
    timestamp: new Date().toISOString()
  }

  activeCivilizationState.negotiations = [newNeg, ...activeCivilizationState.negotiations].slice(0, 15)

  publishEvent(
    'kubryx_agent_negotiation',
    JSON.stringify(newNeg),
    'Diplomatic Intent: Cognition Oracle proposes automated NCRD yield staking optimization.'
  )

  recalculateDiplomacy()
  notifyListeners()
  toast.success('Sovereign negotiation initiated: Oracle proposal pending.')
}

// 4. Replay Diplomatic Crisis
export function replayDiplomaticCrisis() {
  activeCivilizationState.agents = activeCivilizationState.agents.map(a => {
    if (a.id === 'agent-infra' || a.id === 'agent-eco') {
      return { ...a, status: 'active_dispute', confidence: 48.2 }
    }
    return { ...a, status: 'negotiating' }
  })

  activeCivilizationState.activeConflict = 'Infrastructure Sentinels refuse third-party validation node connections.'

  publishEvent(
    'kubryx_diplomatic_shift',
    JSON.stringify({ crisis: 'validator_partition' }),
    'Ecosystem Crisis: Diplomatic trust decay computed across connected EVM and SVM bridges.'
  )

  publishEvent(
    'kubryx_agent_conflict',
    JSON.stringify({ agents: ['Infrastructure Sentinel', 'Ecosystem Diplomat'] }),
    'Security Alarm: Sentinel terminates untrusted bridge handshakes.'
  )

  recalculateDiplomacy()
  notifyListeners()
  toast.error('Diplomatic crisis active: Partner trust score degraded!')
}

// 5. Stabilize Institutional Trust
export function stabilizeInstitutionalTrust() {
  activeCivilizationState.agents = activeCivilizationState.agents.map(a => {
    if (a.status === 'active_dispute' || a.status === 'negotiating') {
      return { ...a, status: 'nominal', confidence: 97.5 }
    }
    return a
  })

  activeCivilizationState.activeConflict = null

  // Push an alignment success
  publishEvent(
    'kubryx_recovery_alignment',
    JSON.stringify({ aligned: true }),
    'Sovereign Realignment: Autonomous Recovery Director resolved all active agent disputes.'
  )

  publishEvent(
    'kubryx_diplomatic_shift',
    JSON.stringify({ status: 'stabilized' }),
    'Diplomatic Accord: Multi-agent confidence metrics stabilized to nominal indexes.'
  )

  recalculateDiplomacy()
  notifyListeners()
  toast.success('Institutional trust successfully stabilized!')
}

// 6. Restore Coalition Equilibrium
export function restoreCoalitionEquilibrium() {
  activeCivilizationState.agents = BASELINE_AGENTS.map(a => ({ ...a }))
  activeCivilizationState.negotiations = [...BASELINE_NEGOTIATIONS]
  activeCivilizationState.activeConflict = null

  // Reset localStorage variables
  if (typeof window !== 'undefined') {
    const savedOps = localStorage.getItem('kubryx_global_ops_layer')
    const ops = savedOps ? JSON.parse(savedOps) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
    ops.consensusIndex = 98.2
    ops.regionalOutages = []
    
    // Add protocol sync event
    const syncEvt = {
      id: `evt-${Date.now()}`,
      type: 'kubryx_protocol_sync',
      payload: JSON.stringify({ synced: true }),
      description: 'Coalition Equilibrium Restored: Authoritative parameters reset to nominal baseline.',
      timestamp: new Date().toISOString()
    }
    ops.events = [syncEvt, ...(ops.events || [])]
    localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(ops))
    window.dispatchEvent(new Event('kubryx_global_ops_update'))
    window.dispatchEvent(new Event('kubryx_fabric_update'))
  }

  publishEvent(
    'kubryx_coalition_update',
    JSON.stringify({ status: 'equilibrium_secured' }),
    'Sovereign Harmony Secured: Central civilization coordination restored.'
  )

  recalculateDiplomacy()
  notifyListeners()
  toast.success('Coalition equilibrium successfully secured!')
}

export function useCivilizationOrchestration() {
  const [state, setState] = useState<CivilizationState>({ ...activeCivilizationState })

  useEffect(() => {
    const handler = () => setState({ ...activeCivilizationState })
    listeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_civilization_update', handler)
    }

    const interval = setInterval(() => {
      recalculateDiplomacy()
      notifyListeners()
    }, 4000)

    return () => {
      listeners.delete(handler)
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_civilization_update', handler)
      }
    }
  }, [])

  return {
    ...state,
    triggerInstability: triggerCoalitionInstability,
    simulateDeadlock: simulateGovernanceDeadlock,
    initiateNegotiation: initiateSovereignNegotiation,
    replayCrisis: replayDiplomaticCrisis,
    stabilizeTrust: stabilizeInstitutionalTrust,
    restoreEquilibrium: restoreCoalitionEquilibrium
  }
}
