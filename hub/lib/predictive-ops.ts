// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import { getPlatformState } from './platform-engine'

export interface PredictiveMetrics {
  chainName: string
  forecastLatency: number[] // 5 hours forecast intervals
  forecastImbalanceProbability: number // 0-100%
  reliabilityOutlook: 'Optimal' | 'Unstable Forecast' | 'Degradation Imminent'
  healthConfidenceCurve: number[] // e.g. [99, 98, 97, 95, 92]
}

export interface PredictiveAdvisory {
  id: string
  category: 'Infrastructure' | 'Security' | 'Liquidity' | 'General'
  advisoryText: string
  probability: number // e.g. 78%
  suggestedAction: string
  impactLevel: 'low' | 'medium' | 'high'
}

export interface PredictiveOpsState {
  chainOutlooks: PredictiveMetrics[]
  advisories: PredictiveAdvisory[]
  aggregateStressIndex: number // 0-100%
  overallForecastUptime: number // %
  lastCalculated: string
}

const DEFAULT_OUTLOOKS: PredictiveMetrics[] = [
  { chainName: 'QIE Mainnet', forecastLatency: [42, 45, 48, 44, 43], forecastImbalanceProbability: 2, reliabilityOutlook: 'Optimal', healthConfidenceCurve: [99.8, 99.8, 99.7, 99.8, 99.9] },
  { chainName: 'Solana Devnet', forecastLatency: [280, 450, 920, 680, 310], forecastImbalanceProbability: 64, reliabilityOutlook: 'Unstable Forecast', healthConfidenceCurve: [98.5, 96.2, 91.4, 93.8, 97.4] },
  { chainName: 'Stellar Testnet', forecastLatency: [110, 115, 120, 118, 114], forecastImbalanceProbability: 8, reliabilityOutlook: 'Optimal', healthConfidenceCurve: [99.9, 99.9, 99.8, 99.9, 99.9] },
  { chainName: 'Arbitrum One', forecastLatency: [95, 180, 340, 210, 105], forecastImbalanceProbability: 25, reliabilityOutlook: 'Optimal', healthConfidenceCurve: [99.5, 98.7, 97.2, 98.5, 99.2] }
]

const DEFAULT_ADVISORIES: PredictiveAdvisory[] = [
  {
    id: 'adv-201',
    category: 'Infrastructure',
    advisoryText: 'Predictive analytics indicate Solana RPC node regional response limits may degrade by 180ms due to anticipated validators stress loads.',
    probability: 72,
    suggestedAction: 'Divert low-priority transaction sweeps through auxiliary node relays.',
    impactLevel: 'medium'
  },
  {
    id: 'adv-202',
    category: 'Liquidity',
    advisoryText: 'Venture staking pools show an early delta allocation drift trend. High risk of 15% imbalance within the next 4 hours.',
    probability: 85,
    suggestedAction: 'Deploy a rebalance instruction to PalmFlow staking optimizer queues.',
    impactLevel: 'high'
  }
]

let predictiveState: PredictiveOpsState = {
  chainOutlooks: [...DEFAULT_OUTLOOKS],
  advisories: [...DEFAULT_ADVISORIES],
  aggregateStressIndex: 8,
  overallForecastUptime: 99.8,
  lastCalculated: new Date().toISOString()
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(l => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_predictive_ops', JSON.stringify(predictiveState))
    window.dispatchEvent(new Event('kubryx_predictive_update'))
  }
}

// Hydrate safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_predictive_ops')
    if (saved) {
      predictiveState = JSON.parse(saved)
    }
  } catch {
    // ignore
  }
}

export function getPredictiveOpsState(): PredictiveOpsState {
  return predictiveState
}

export function triggerPredictiveRecalculation() {
  const plat = getPlatformState()
  const scenario = plat.activeScenario

  let stress = 8
  let aggregateUptime = 99.8
  const outlooks = JSON.parse(JSON.stringify(DEFAULT_OUTLOOKS)) as PredictiveMetrics[]
  const advisories: PredictiveAdvisory[] = []

  // Dynamic forecasting offsets based on active Digital Twin Scenario
  if (scenario === 'degraded_rpc') {
    stress = 42
    aggregateUptime = 98.42
    outlooks[1].forecastLatency = [920, 1150, 1400, 1850, 2100] // Severe spike
    outlooks[1].reliabilityOutlook = 'Degradation Imminent'
    outlooks[1].healthConfidenceCurve = [91.4, 88.5, 82.4, 76.8, 68.2]
    
    advisories.push({
      id: 'adv-rpc-fail',
      category: 'Infrastructure',
      advisoryText: 'RPC latency spikes forecast to persist across Solana nodes. Peak response delays exceeding 2 seconds highly probable.',
      probability: 94,
      suggestedAction: 'Lock continuous routing on local cached memory fallbacks.',
      impactLevel: 'high'
    })
  } else if (scenario === 'chain_congestion') {
    stress = 54
    aggregateUptime = 99.12
    outlooks[2].forecastLatency = [120, 180, 240, 310, 450] // Stellar delays
    outlooks[2].reliabilityOutlook = 'Unstable Forecast'
    outlooks[2].healthConfidenceCurve = [99.2, 98.1, 96.5, 94.2, 91.8]

    advisories.push({
      id: 'adv-congestion',
      category: 'Liquidity',
      advisoryText: 'Transaction queue saturation forecast models point to mempool queues block time increasing past 180s limits.',
      probability: 88,
      suggestedAction: 'Enable dynamic gas pricing override profiles inside multi-sig envelope split routing.',
      impactLevel: 'high'
    })
  } else if (scenario === 'suspicious_activity') {
    stress = 88
    aggregateUptime = 99.95
    outlooks[0].reliabilityOutlook = 'Unstable Forecast'
    outlooks[0].healthConfidenceCurve = [99.8, 97.4, 94.1, 88.5, 78.4]

    advisories.push({
      id: 'adv-compromise',
      category: 'Security',
      advisoryText: 'Security incident cascade models anticipate unauthorized signature validation threats expanding across multiple EVM bridges.',
      probability: 99,
      suggestedAction: 'Deploy high-priority isolated certificate locks to isolate compromised keys.',
      impactLevel: 'high'
    })
  } else if (scenario === 'treasury_imbalance') {
    stress = 32
    aggregateUptime = 99.96
    outlooks[1].forecastImbalanceProbability = 82
    outlooks[1].reliabilityOutlook = 'Unstable Forecast'

    advisories.push({
      id: 'adv-imbalance',
      category: 'Liquidity',
      advisoryText: 'Continuous stream allocations show severe balance discrepancy between Solana and EVM mainnets.',
      probability: 91,
      suggestedAction: 'Rebalance idle SOL treasury buffers to NCRD staking yields immediately.',
      impactLevel: 'medium'
    })
  } else if (scenario === 'loan_risk_escalation') {
    stress = 68
    aggregateUptime = 98.85
    outlooks[3].healthConfidenceCurve = [98.5, 94.2, 88.6, 81.4, 72.5]
    outlooks[3].reliabilityOutlook = 'Degradation Imminent'

    advisories.push({
      id: 'adv-default',
      category: 'Security',
      advisoryText: 'Default rate projection indicates outstanding Lendora pool balances risk defaults approaching 6.8%.',
      probability: 79,
      suggestedAction: 'Narrow outstanding repayment grace duration settings on active smart contract streams.',
      impactLevel: 'high'
    })
  }

  // Fallback defaults if list is empty
  if (advisories.length === 0) {
    advisories.push(...DEFAULT_ADVISORIES)
  }

  predictiveState = {
    chainOutlooks: outlooks,
    advisories,
    aggregateStressIndex: stress,
    overallForecastUptime: aggregateUptime,
    lastCalculated: new Date().toISOString()
  }

  notifyListeners()
}

export function usePredictiveOps() {
  const [state, setState] = useState<PredictiveOpsState>({ ...predictiveState })

  useEffect(() => {
    const handler = () => setState({ ...predictiveState })
    listeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_predictive_update', handler)
      window.addEventListener('kubryx_platform_update', triggerPredictiveRecalculation)
      
      // Calculate initial state
      triggerPredictiveRecalculation()
    }

    return () => {
      listeners.delete(handler)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_predictive_update', handler)
        window.removeEventListener('kubryx_platform_update', triggerPredictiveRecalculation)
      }
    }
  }, [])

  return state
}
