'use client'

import { useState, useEffect } from 'react'
import { getFabricState } from './fabric-engine'
import { recordOSEvent } from './cross-tool-intelligence'

export interface StrategicRecommendation {
  id: string
  title: string
  description: string
  confidenceScore: number // %
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedSystems: string[]
  estimatedGain: number // % consensus gain
  reasoningTrail: string[]
}

export interface OperationalForecast {
  timeframe: '1-hour' | '24-hour' | '7-day'
  consensusTrajectory: number // %
  treasuryStability: number // %
  governanceVolatility: number // %
  regionalResilience: number // %
  ecosystemTrust: number // %
  aiConfidence: number // %
  recoveryReadiness: number // %
}

export interface MitigationPlan {
  title: string
  steps: string[]
  estimatedTimelineSeconds: number
  restorationCurve: ((consensusIndex: number) => number)[] // Latency/stability progression curves
}

export interface StrategicMemoryEpoch {
  id: string
  timestamp: string
  eventSummary: string
  stabilizationGain: number // %
  mitigationVector: string
}

export interface StrategicIntelligenceState {
  recommendations: StrategicRecommendation[]
  forecasts: OperationalForecast[]
  activeMitigationPlan: MitigationPlan | null
  memoryEpochs: StrategicMemoryEpoch[]
  strategicConfidence: number // %
}

// Deterministic generator helpers based on current network parameters
export function generateStrategicRecommendations(
  consensusIndex: number,
  regionalOutages: string[],
  activeVotesCount: number
): StrategicRecommendation[] {
  const recommendations: StrategicRecommendation[] = []

  // Case 1: Active outages
  if (regionalOutages.length > 0) {
    regionalOutages.forEach((region) => {
      recommendations.push({
        id: `rec-outage-${region}`,
        title: `Reroute traffic from degraded zone: ${region}`,
        description: `RPC latencies for ${region} are exceeding tolerances. Reroute 100% of transactions to designated failovers immediately.`,
        confidenceScore: 98.5,
        severity: 'critical',
        affectedSystems: ['RPC Load Balancers', 'Cross-chain Bridges'],
        estimatedGain: regionalOutages.length * 12.0,
        reasoningTrail: [
          `Detected latency ping timeouts at 9999ms.`,
          `Computed failover routing path matching healthy nodes.`,
          `Mitigation vector locked to designated target region.`
        ]
      })
    })
  }

  // Case 2: Consensus decay or lower quorums
  if (consensusIndex < 92) {
    recommendations.push({
      id: 'rec-quorum-scaling',
      title: 'Initialize sovereign validator quorum scaling',
      description: 'Global consensus quorums have drifted past the 95.0% tolerance barrier. Scale active node weights to restore equilibrium.',
      confidenceScore: 94.2,
      severity: 'high',
      affectedSystems: ['Validator Quorums', 'Sovereign Governance'],
      estimatedGain: 6.8,
      reasoningTrail: [
        `Global consensus index detected at ${consensusIndex}%.`,
        `Identified temporary validator drift during high TPS.`,
        `Recommended weighting amendment to stabilize quorums.`
      ]
    })
  }

  // Case 3: Economic imbalance
  if (activeVotesCount > 0) {
    recommendations.push({
      id: 'rec-treasury-balance',
      title: 'Deploy liquidity sweep payload',
      description: 'Active governance votes imply pending treasury shifts. Align payroll buffers with yield pools statefully.',
      confidenceScore: 89.4,
      severity: 'medium',
      affectedSystems: ['Treasury Payroll', 'Liquid sweeps'],
      estimatedGain: 4.5,
      reasoningTrail: [
        `Detected ${activeVotesCount} active KIP governance ballots.`,
        `Evaluated liquidity reserves for Solana and EVM.`,
        `Calculated sweep APY to offset gas imbalances.`
      ]
    })
  }

  // Default baseline recommendation
  recommendations.push({
    id: 'rec-baseline',
    title: 'Maintain nominal coordination parameters',
    description: 'System-wide metrics indicate stateful balance. Execute standard telemetry loops.',
    confidenceScore: 99.8,
    severity: 'low',
    affectedSystems: ['Telemetry Ingestion'],
    estimatedGain: 0.2,
    reasoningTrail: [
      `Aggregated infrastructure metrics represent nominal states.`,
      `Zero threat escalation alerts logged by cognition clusters.`,
      `Approved standard diagnostic sweep protocols.`
    ]
  })

  return recommendations
}

export function generatePredictiveForecasts(
  consensusIndex: number,
  regionalOutages: string[]
): OperationalForecast[] {
  const outagePenalty = regionalOutages.length * 8.0
  const wave = Math.sin(Date.now() / 15000) * 1.5

  return [
    {
      timeframe: '1-hour',
      consensusTrajectory: Math.min(100, Math.max(10, parseFloat((consensusIndex + 1.2 + wave).toFixed(1)))),
      treasuryStability: Math.min(100, Math.max(10, parseFloat((96.8 + wave).toFixed(1)))),
      governanceVolatility: Math.max(0, parseFloat((4.5 - regionalOutages.length * 0.5 + Math.abs(wave)).toFixed(1))),
      regionalResilience: Math.min(100, Math.max(10, parseFloat((99.2 - outagePenalty).toFixed(1)))),
      ecosystemTrust: Math.min(100, Math.max(10, parseFloat((97.5 - regionalOutages.length * 4.0).toFixed(1)))),
      aiConfidence: Math.min(100, Math.max(10, parseFloat((96.5 - regionalOutages.length * 2.0 + wave).toFixed(1)))),
      recoveryReadiness: 99.0
    },
    {
      timeframe: '24-hour',
      consensusTrajectory: Math.min(100, Math.max(10, parseFloat((consensusIndex + 3.5 - regionalOutages.length * 2.0).toFixed(1)))),
      treasuryStability: 97.2,
      governanceVolatility: 3.2,
      regionalResilience: Math.min(100, Math.max(10, parseFloat((99.4 - regionalOutages.length * 2.0).toFixed(1)))),
      ecosystemTrust: Math.min(100, Math.max(10, parseFloat((98.0 - regionalOutages.length * 1.5).toFixed(1)))),
      aiConfidence: 97.5,
      recoveryReadiness: 99.4
    },
    {
      timeframe: '7-day',
      consensusTrajectory: 99.0,
      treasuryStability: 98.4,
      governanceVolatility: 1.5,
      regionalResilience: 99.8,
      ecosystemTrust: 99.2,
      aiConfidence: 98.8,
      recoveryReadiness: 99.8
    }
  ]
}

export function generateMitigationPlan(regionalOutages: string[]): MitigationPlan | null {
  if (regionalOutages.length === 0) return null

  const targetRegion = regionalOutages[0]
  return {
    title: `Sovereign mitigation routing plan for degraded region: ${targetRegion}`,
    steps: [
      `Step 1: Terminate active communication requests on degraded zone: ${targetRegion}.`,
      `Step 2: Initialize transaction routing redirection matching Designated Targets.`,
      `Step 3: Trigger multi-sig consensus updates across secondary validator zones.`,
      `Step 4: Execute final ledger recovery check and synchronize network indices.`
    ],
    estimatedTimelineSeconds: 4,
    restorationCurve: [
      (consensusIndex: number) => consensusIndex, 
      (consensusIndex: number) => consensusIndex + 4.0, 
      (consensusIndex: number) => consensusIndex + 8.0, 
      (consensusIndex: number) => 98.2
    ]
  }
}

const DEFAULT_EPOCHS: StrategicMemoryEpoch[] = [
  {
    id: 'epoch-strat-01',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    eventSummary: 'Auto-mitigated validator drift during simulated consensus stress test.',
    stabilizationGain: 8.5,
    mitigationVector: 'RPC Weight Adjustments'
  }
]

export function useStrategicIntelligence() {
  const [state, setState] = useState<StrategicIntelligenceState>({
    recommendations: [],
    forecasts: [],
    activeMitigationPlan: null,
    memoryEpochs: [...DEFAULT_EPOCHS],
    strategicConfidence: 98.5
  })

  useEffect(() => {
    function loadState() {
      if (typeof window === 'undefined') return

      try {
        const savedGlobal = localStorage.getItem('kubryx_global_ops_layer')
        const globalState = savedGlobal ? JSON.parse(savedGlobal) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
        
        const activeVotes = globalState.events ? globalState.events.filter((e: any) => e.type === 'kubryx_governance_vote').length : 2
        const consensus = globalState.consensusIndex || 98.2
        const outages = globalState.regionalOutages || []

        const recs = generateStrategicRecommendations(consensus, outages, activeVotes)
        const fc = generatePredictiveForecasts(consensus, outages)
        const plan = generateMitigationPlan(outages)

        // Evaluate strategic confidence
        const strategicConfidence = Math.max(40, parseFloat((98.5 - outages.length * 15.0 + Math.sin(Date.now() / 12000) * 1.0).toFixed(1)))

        // Hydrate persistent epochs safely
        const savedEpochs = localStorage.getItem('kubryx_strategic_intelligence_epochs')
        const epochs = savedEpochs ? JSON.parse(savedEpochs) : [...DEFAULT_EPOCHS]

        setState(prev => ({
          ...prev,
          recommendations: recs,
          forecasts: fc,
          activeMitigationPlan: plan,
          memoryEpochs: epochs,
          strategicConfidence
        }))
      } catch {
        // ignore
      }
    }

    loadState()

    const handleGlobalUpdate = () => {
      loadState()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_global_ops_update', handleGlobalUpdate)
      window.addEventListener('kubryx_fabric_update', handleGlobalUpdate)
    }

    const interval = setInterval(loadState, 4000)

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_global_ops_update', handleGlobalUpdate)
        window.removeEventListener('kubryx_fabric_update', handleGlobalUpdate)
      }
      clearInterval(interval)
    }
  }, [])

  function archiveStrategicEpoch(summary: string, gain: number, vector: string) {
    const newEpoch: StrategicMemoryEpoch = {
      id: `epoch-strat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventSummary: summary,
      stabilizationGain: gain,
      mitigationVector: vector
    }

    setState(prev => {
      const nextEpochs = [newEpoch, ...prev.memoryEpochs]
      if (typeof window !== 'undefined') {
        localStorage.setItem('kubryx_strategic_intelligence_epochs', JSON.stringify(nextEpochs))
      }
      recordOSEvent('Strategic Intelligence', `Archived strategic learning epoch: "${summary}"`, 'Strategic Memory')
      return {
        ...prev,
        memoryEpochs: nextEpochs
      }
    })
  }

  return {
    ...state,
    archiveEpoch: archiveStrategicEpoch
  }
}
