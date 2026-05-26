// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import { recordOSEvent } from './cross-tool-intelligence'
import { toast } from './toast'

export interface ChronicleEpoch {
  id: string
  epochName: string
  timestamp: string
  sovereigntyLevel: number
  activeThreatCount: number
  cognitiveClarity: number
  eventSummary: string
}

export interface ReasoningCluster {
  id: string
  nodeName: string
  attentionWeight: number // %
  prioritizedAnomaly: string
  heuristicRule: string
  cognitionScore: number // %
}

export interface LivingTelemetry {
  mempoolPressure: number // tps
  networkCongestion: number // %
  rpcFluctuationRate: number // ms drift
  entropyIndex: number // %
  validatorParticipation: number // %
  stabilizationForecast: number // %
  healingScore: number // %
}

export interface CognitionState {
  livingTelemetry: LivingTelemetry
  clusters: ReasoningCluster[]
  chronicle: ChronicleEpoch[]
  ecosystemScore: number // %
  orchestrationPressure: number // %
  healingSimulationActive: boolean
}

const DEFAULT_CHRONICLE: ChronicleEpoch[] = [
  {
    id: 'epoch-01',
    epochName: 'Bootstrap & Zero-State Alignment',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    sovereigntyLevel: 94.2,
    activeThreatCount: 0,
    cognitiveClarity: 90,
    eventSummary: 'Initial bootstrapping of cryptographic keys, establishing EVM-Soroban synchronizations, and loading fallback caches.'
  },
  {
    id: 'epoch-02',
    epochName: 'Sovereign Operations Layer Deployed',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    sovereigntyLevel: 98.4,
    activeThreatCount: 1,
    cognitiveClarity: 95,
    eventSummary: 'Successfully deployed sovereign quorums, mapping multi-sig sweeps and activating threat forecasts.'
  }
]

const DEFAULT_CLUSTERS: ReasoningCluster[] = [
  { id: 'cog-01', nodeName: 'QIE Mainnet Observer', attentionWeight: 35, prioritizedAnomaly: 'Regional RPC latency spikes', heuristicRule: 'If average RPC response > 900ms, isolate node and reroute via SG cache.', cognitionScore: 98.4 },
  { id: 'cog-02', nodeName: 'Solana Devnet Watchdog', attentionWeight: 25, prioritizedAnomaly: 'Mempool congestion variance', heuristicRule: 'If pending queues exceed 1200 tps, elevate transaction gas limits.', cognitionScore: 95.2 },
  { id: 'cog-03', nodeName: 'Stellar Soroban Auditor', attentionWeight: 20, prioritizedAnomaly: 'Staking yield allocation splits', heuristicRule: 'If APY pool drifts past 15%, suggest multi-party split re-balancing.', cognitionScore: 99.1 },
  { id: 'cog-04', nodeName: 'Arbitrum One Bridge Guard', attentionWeight: 20, prioritizedAnomaly: 'Suspicious certificate proxy traces', heuristicRule: 'Force zero-metadata key locks if signature keys mismatch registry.', cognitionScore: 92.8 }
]

const INITIAL_TELEMETRY: LivingTelemetry = {
  mempoolPressure: 450,
  networkCongestion: 14.8,
  rpcFluctuationRate: 15,
  entropyIndex: 8.2,
  validatorParticipation: 99.4,
  stabilizationForecast: 98.2,
  healingScore: 99.8
}

let cognitionState: CognitionState = {
  livingTelemetry: { ...INITIAL_TELEMETRY },
  clusters: [...DEFAULT_CLUSTERS],
  chronicle: [...DEFAULT_CHRONICLE],
  ecosystemScore: 97.4,
  orchestrationPressure: 22.5,
  healingSimulationActive: false
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(l => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_cognition_ops', JSON.stringify(cognitionState))
    window.dispatchEvent(new Event('kubryx_cognition_update'))
  }
}

// Hydrate safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_cognition_ops')
    if (saved) {
      cognitionState = JSON.parse(saved)
    }
  } catch {
    // ignore
  }
}

export function getCognitionState(): CognitionState {
  return cognitionState
}

// Phase 1 & 4: Living Infrastructure Behaviors loop
export function triggerLivingFluctuation() {
  // Deterministic pseudo-random updates
  const drift = (Math.sin(Date.now() / 10000) + 1) / 2 // 0 to 1 wave
  const noise = (Math.cos(Date.now() / 2500) * 0.1)

  const mempoolPressure = Math.floor(400 + drift * 250 + noise * 50)
  const networkCongestion = parseFloat((12 + drift * 25 + noise * 5).toFixed(1))
  const rpcFluctuationRate = Math.floor(12 + drift * 45 + noise * 10)
  const entropyIndex = parseFloat((6 + drift * 14 + noise * 2).toFixed(1))
  const validatorParticipation = parseFloat((99.8 - drift * 4 - noise * 1).toFixed(1))
  
  // Adaptive forecast
  const stabilizationForecast = parseFloat((95 + Math.cos(Date.now() / 5000) * 4).toFixed(1))

  cognitionState = {
    ...cognitionState,
    livingTelemetry: {
      mempoolPressure,
      networkCongestion,
      rpcFluctuationRate,
      entropyIndex,
      validatorParticipation,
      stabilizationForecast,
      healingScore: cognitionState.livingTelemetry.healingScore
    },
    ecosystemScore: parseFloat((92 + Math.sin(Date.now() / 8000) * 6).toFixed(1)),
    orchestrationPressure: parseFloat((15 + drift * 45).toFixed(1))
  }

  notifyListeners()
}

// Phase 5: Chronicle state archiving
export function archiveEpoch(epochName: string, eventSummary: string) {
  const newEpoch: ChronicleEpoch = {
    id: `epoch-${Date.now()}`,
    epochName,
    timestamp: new Date().toISOString(),
    sovereigntyLevel: parseFloat((94 + Math.random() * 5).toFixed(1)),
    activeThreatCount: Math.floor(Math.random() * 2),
    cognitiveClarity: Math.floor(88 + Math.random() * 10),
    eventSummary
  }

  cognitionState = {
    ...cognitionState,
    chronicle: [newEpoch, ...cognitionState.chronicle]
  }

  notifyListeners()
  recordOSEvent('Chronicle Archive', `Archived system maturity epoch: "${epochName}"`, 'Operational Archive')
  toast.success(`Epoch archived successfully: ${epochName}`)
}

// Phase 8: Advanced Resilience / Self Healing
export function triggerSelfHealingSimulation() {
  if (cognitionState.healingSimulationActive) return

  cognitionState = {
    ...cognitionState,
    healingSimulationActive: true
  }
  notifyListeners()
  toast.warning('Initializing self-healing simulation...')

  // Stepwise restoration steps
  setTimeout(() => {
    cognitionState = {
      ...cognitionState,
      livingTelemetry: {
        ...cognitionState.livingTelemetry,
        healingScore: 84.5
      }
    }
    notifyListeners()
  }, 1000)

  setTimeout(() => {
    cognitionState = {
      ...cognitionState,
      livingTelemetry: {
        ...cognitionState.livingTelemetry,
        healingScore: 94.8
      }
    }
    notifyListeners()
  }, 2000)

  setTimeout(() => {
    cognitionState = {
      ...cognitionState,
      livingTelemetry: {
        ...cognitionState.livingTelemetry,
        healingScore: 99.8
      },
      healingSimulationActive: false
    }
    notifyListeners()
    recordOSEvent('Resilience Intelligence', 'Self-healing consensus algorithms successfully corrected node drifts.', 'Security Guard')
    toast.success('Self-healing consensus restoration complete!')
  }, 3500)
}

export function useCognition() {
  const [state, setState] = useState<CognitionState>({ ...cognitionState })

  useEffect(() => {
    const handler = () => setState({ ...cognitionState })
    listeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_cognition_update', handler)
    }

    // Dynamic living loop simulation
    const interval = setInterval(() => {
      triggerLivingFluctuation()
    }, 3000)

    return () => {
      listeners.delete(handler)
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_cognition_update', handler)
      }
    }
  }, [])

  return {
    ...state,
    archiveMaturityEpoch: archiveEpoch,
    triggerSelfHealing: triggerSelfHealingSimulation
  }
}
