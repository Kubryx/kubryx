'use client'

import { useState, useEffect } from 'react'
import { recordOSEvent } from './cross-tool-intelligence'
import { toast } from './toast'

export type KubryxEventType =
  | 'kubryx_global_update'
  | 'kubryx_region_outage'
  | 'kubryx_recovery_trigger'
  | 'kubryx_governance_vote'
  | 'kubryx_treasury_shift'
  | 'kubryx_ecosystem_alert'
  | 'kubryx_simulation_replay'
  | 'kubryx_policy_update'
  | 'kubryx_cognition_signal'
  | 'kubryx_protocol_sync'
  | 'kubryx_agent_negotiation'
  | 'kubryx_agent_conflict'
  | 'kubryx_coalition_update'
  | 'kubryx_diplomatic_shift'
  | 'kubryx_recovery_alignment'
  | 'kubryx_institutional_alert'
  | 'kubryx_sovereign_recommendation'

export interface OperationalEvent {
  id: string
  type: KubryxEventType
  timestamp: string
  payload: string
  description: string
}

export interface ReplaySnapshot {
  id: string
  timestamp: string
  consensusIndex: number
  regionalOutages: string[]
  activeGovernanceVotes: number
  aiConfidence: number
  infrastructureHealth: number
  description: string
}

export interface GlobalOperationsState {
  consensusIndex: number // %
  infrastructureHealth: number // %
  governanceParticipation: number // %
  ecosystemTrust: number // %
  treasuryStability: number // %
  protocolCoordination: number // %
  resilienceScore: number // %
  aiConfidence: number // %
  latencyEquilibrium: number // %
  recoveryReadiness: number // %
  
  regionalOutages: string[] // Active outage regions
  events: OperationalEvent[]
  snapshots: ReplaySnapshot[]
  driftIndex: number // %
  stabilizationFactor: number // %
}

const DEFAULT_EVENTS: OperationalEvent[] = [
  {
    id: 'evt-init',
    type: 'kubryx_global_update',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    payload: JSON.stringify({ status: 'nominal', activeNodes: 8 }),
    description: 'Sovereign coordination network successfully initialized.'
  }
]

const DEFAULT_SNAPSHOTS: ReplaySnapshot[] = [
  {
    id: 'snap-baseline',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    consensusIndex: 98.2,
    regionalOutages: [],
    activeGovernanceVotes: 2,
    aiConfidence: 96.5,
    infrastructureHealth: 99.4,
    description: 'Operational consensus baseline snapshot.'
  }
]

let globalState: GlobalOperationsState = {
  consensusIndex: 98.2,
  infrastructureHealth: 99.4,
  governanceParticipation: 95.0,
  ecosystemTrust: 97.5,
  treasuryStability: 96.8,
  protocolCoordination: 98.6,
  resilienceScore: 99.2,
  aiConfidence: 96.5,
  latencyEquilibrium: 98.4,
  recoveryReadiness: 99.0,
  regionalOutages: [],
  events: [...DEFAULT_EVENTS],
  snapshots: [...DEFAULT_SNAPSHOTS],
  driftIndex: 1.2,
  stabilizationFactor: 99.4
}

const eventListeners = new Map<KubryxEventType, Set<(event: OperationalEvent) => void>>()
const stateListeners = new Set<() => void>()

function notifyStateListeners() {
  stateListeners.forEach(l => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(globalState))
    window.dispatchEvent(new Event('kubryx_global_ops_update'))
  }
}

// Hydrate safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_global_ops_layer')
    if (saved) {
      globalState = JSON.parse(saved)
    }
  } catch {
    // ignore
  }
}

// Global Event Bus Implementation
export function publishEvent(type: KubryxEventType, payload: string, description: string) {
  const newEvent: OperationalEvent = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    timestamp: new Date().toISOString(),
    payload,
    description
  }

  // Update events list
  globalState = {
    ...globalState,
    events: [newEvent, ...globalState.events].slice(0, 50) // Keep last 50
  }

  // Calculate live operational consensus dynamically
  recalculateConsensus()

  // Notify Event Listeners
  const listeners = eventListeners.get(type)
  if (listeners) {
    listeners.forEach(callback => callback(newEvent))
  }

  notifyStateListeners()
  recordOSEvent('Global Operations Layer', `[${type}] ${description}`, 'Event Bus')
}

export function subscribeToEvent(type: KubryxEventType, callback: (event: OperationalEvent) => void) {
  if (!eventListeners.has(type)) {
    eventListeners.set(type, new Set())
  }
  eventListeners.get(type)!.add(callback)
}

export function unsubscribeFromEvent(type: KubryxEventType, callback: (event: OperationalEvent) => void) {
  const listeners = eventListeners.get(type)
  if (listeners) {
    listeners.delete(callback)
  }
}

export function replayEvents(type?: KubryxEventType): OperationalEvent[] {
  if (type) {
    return globalState.events.filter(e => e.type === type)
  }
  return globalState.events
}

// Strategic Snapshots
export function takeOperationsSnapshot(description: string): ReplaySnapshot {
  const newSnapshot: ReplaySnapshot = {
    id: `snap-${Date.now()}`,
    timestamp: new Date().toISOString(),
    consensusIndex: globalState.consensusIndex,
    regionalOutages: [...globalState.regionalOutages],
    activeGovernanceVotes: globalState.events.filter(e => e.type === 'kubryx_governance_vote').length,
    aiConfidence: globalState.aiConfidence,
    infrastructureHealth: globalState.infrastructureHealth,
    description: description || 'Automatic operational checkpoint'
  }

  globalState = {
    ...globalState,
    snapshots: [newSnapshot, ...globalState.snapshots]
  }

  notifyStateListeners()
  publishEvent('kubryx_simulation_replay', JSON.stringify(newSnapshot), `Archived operational snapshot: "${description}"`)
  return newSnapshot
}

export function restoreOperationsSnapshot(id: string) {
  const matched = globalState.snapshots.find(s => s.id === id)
  if (!matched) return

  globalState = {
    ...globalState,
    consensusIndex: matched.consensusIndex,
    aiConfidence: matched.aiConfidence,
    infrastructureHealth: matched.infrastructureHealth,
    regionalOutages: [...matched.regionalOutages]
  }

  notifyStateListeners()
  publishEvent('kubryx_simulation_replay', JSON.stringify({ snapshotId: id }), `Restored operations system parameters to snap: ${matched.description}`)
  toast.success(`Restored historic state snapshot: ${matched.description}`)
}

// Dynamic Recalculation Engine
export function recalculateConsensus() {
  // Deterministic factors with drift waves
  const wave = Math.sin(Date.now() / 10000) * 0.5
  
  // Calculate impacts of outages
  const outagePenalty = globalState.regionalOutages.length * 12 // -12% per region outage
  const infrastructureHealth = Math.max(10, parseFloat((99.4 - outagePenalty + wave).toFixed(1)))
  const aiConfidence = Math.max(20, parseFloat((96.5 - globalState.regionalOutages.length * 5 + wave).toFixed(1)))
  const ecosystemTrust = Math.max(15, parseFloat((97.5 - globalState.regionalOutages.length * 8 + wave).toFixed(1)))
  
  // Combine factors logically
  const factors = [
    infrastructureHealth,
    globalState.governanceParticipation,
    ecosystemTrust,
    globalState.treasuryStability,
    globalState.protocolCoordination,
    globalState.resilienceScore,
    aiConfidence,
    globalState.latencyEquilibrium,
    globalState.recoveryReadiness
  ]
  
  const rawAverage = factors.reduce((a, b) => a + b, 0) / factors.length
  const consensusIndex = parseFloat(rawAverage.toFixed(1))
  const driftIndex = parseFloat((1.2 + Math.abs(wave) * 3).toFixed(1))

  globalState = {
    ...globalState,
    consensusIndex,
    infrastructureHealth,
    aiConfidence,
    ecosystemTrust,
    driftIndex
  }
}

// Regional Outage Trigger and Recovery
export function triggerGlobalRegionOutage(regionName: string) {
  if (globalState.regionalOutages.includes(regionName)) return

  globalState = {
    ...globalState,
    regionalOutages: [...globalState.regionalOutages, regionName]
  }

  publishEvent(
    'kubryx_region_outage',
    JSON.stringify({ region: regionName, timestamp: new Date().toISOString() }),
    `Simulated catastrophic regional outage active for: ${regionName}`
  )

  // Recovery trigger loop
  setTimeout(() => {
    restoreGlobalRegion(regionName)
  }, 5000)
}

export function restoreGlobalRegion(regionName: string) {
  if (!globalState.regionalOutages.includes(regionName)) return

  globalState = {
    ...globalState,
    regionalOutages: globalState.regionalOutages.filter(r => r !== regionName)
  }

  publishEvent(
    'kubryx_recovery_trigger',
    JSON.stringify({ region: regionName, timestamp: new Date().toISOString() }),
    `Autonomous healing consensus fully resolved regional outage for: ${regionName}`
  )
  toast.success(`Autonomous recovery complete: restored region ${regionName}!`)
}

export function useGlobalOperations() {
  const [state, setState] = useState<GlobalOperationsState>({ ...globalState })

  useEffect(() => {
    const handler = () => setState({ ...globalState })
    stateListeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_global_ops_update', handler)
    }

    // Baseline drift fluctuations
    const interval = setInterval(() => {
      recalculateConsensus()
      notifyStateListeners()
    }, 4000)

    return () => {
      stateListeners.delete(handler)
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_global_ops_update', handler)
      }
    }
  }, [])

  return {
    ...state,
    publish: publishEvent,
    takeSnapshot: takeOperationsSnapshot,
    restoreSnapshot: restoreOperationsSnapshot,
    triggerOutage: triggerGlobalRegionOutage,
    restoreRegion: restoreGlobalRegion
  }
}
