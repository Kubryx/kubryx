'use client'

import { useState, useEffect } from 'react'

export interface ChainMetadata {
  id: string
  name: string
  chainId?: string
  explorerUrl: string
  rpcUrl: string
  status: 'healthy' | 'degraded' | 'congested' | 'offline'
}

export type SimulationScenario =
  | 'none'
  | 'degraded_rpc'
  | 'chain_congestion'
  | 'suspicious_activity'
  | 'treasury_imbalance'
  | 'loan_risk_escalation'
  | 'telemetry_anomaly_spikes'

export interface SimulationProfile {
  id: SimulationScenario
  name: string
  description: string
  symptoms: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface OperationalAnalytics {
  aiRequestsProcessed: number
  transactionsObserved: number
  walletConnectionsCount: number
  backendUptimeTrends: Record<string, number> // tool -> percentage
  chainActivityRates: Record<string, number> // chain -> active transactions/sec
  telemetryAnomalyCount: number
  averageLatency: number
  fallbackActivations: number
}

// 1. Centralized Chain Metadata
export const CHAIN_REGISTRY: Record<string, ChainMetadata> = {
  qie: {
    id: 'qie',
    name: 'QIE Mainnet',
    chainId: '1990',
    explorerUrl: 'https://mainnet.qie.info',
    rpcUrl: 'https://rpc.qie.info',
    status: 'healthy',
  },
  solana: {
    id: 'solana',
    name: 'Solana Devnet',
    explorerUrl: 'https://explorer.solana.com',
    rpcUrl: 'https://api.devnet.solana.com',
    status: 'healthy',
  },
  stellar: {
    id: 'stellar',
    name: 'Stellar Testnet',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    rpcUrl: 'https://horizon-testnet.stellar.org',
    status: 'healthy',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: '42161',
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    status: 'healthy',
  },
}

// 2. Interactive Simulation Scenarios
export const SIMULATION_SCENARIOS: SimulationProfile[] = [
  {
    id: 'none',
    name: 'Nominal Operational State',
    description: 'All pipelines operate normally under production-grade SLA parameters (45ms).',
    symptoms: ['Optimal gateway response times', 'Zero error backoffs', 'Normal security baseline'],
    severity: 'low',
  },
  {
    id: 'degraded_rpc',
    name: 'Degraded RPC Gateway Infrastructure',
    description: 'Simulates high request failure bounds on remote EVM and Solana RPC nodes.',
    symptoms: ['Average latency spikes to 950ms', 'Cache fallback layers activate automatically', 'Telemetry registers RETRY_BACKOFF alerts'],
    severity: 'medium',
  },
  {
    id: 'chain_congestion',
    name: 'Chain Congestion & Mempool Saturation',
    description: 'Simulates severe network delay and high gas limits on Ethereum-based layers.',
    symptoms: ['Transaction confirmation times delayed by 180s', 'Estimated gas prices spike by 400%', 'Arbitrum bridge timeouts detected'],
    severity: 'medium',
  },
  {
    id: 'suspicious_activity',
    name: 'Suspicious Wallet Keys & Key Compromise',
    description: 'Simulates rapid token routing attempts from blacklisted high-risk contracts.',
    symptoms: ['Private Vault locks routing key locks', 'Security score falls to CRITICAL', 'Security console fires RPC_DEGRADATION warnings'],
    severity: 'high',
  },
  {
    id: 'treasury_imbalance',
    name: 'Treasury Asset Disparity & Drift Warning',
    description: 'Simulates severe automated payroll mismatch between active multi-sig stream balances.',
    symptoms: ['Treasury AI issues rebalance request', 'Debt threshold warning triggered', 'Asset allocation drift score exceeds 15%'],
    severity: 'medium',
  },
  {
    id: 'loan_risk_escalation',
    name: 'AI Lending Risk Level Escalation',
    description: 'Simulates massive default rate trends under sudden high yield market drops.',
    symptoms: ['Lendora AI triggers loan health freeze', 'Credit Passport staking requirement doubles', 'Repayment window narrows to 14 days'],
    severity: 'high',
  },
  {
    id: 'telemetry_anomaly_spikes',
    name: 'Telemetry Diagnostics Spike Anomalies',
    description: 'Simulates a high volume of server failures due to remote cold restarts.',
    symptoms: ['Anomaly logs exceed 45 triggers', 'Visual telemetry dashboard flashes warnings', 'Offline backup servers take routing precedence'],
    severity: 'critical',
  },
]

// Default analytics values
const DEFAULT_ANALYTICS: OperationalAnalytics = {
  aiRequestsProcessed: 2840,
  transactionsObserved: 1145,
  walletConnectionsCount: 3,
  backendUptimeTrends: {
    'CreditBlocks': 99.98,
    'Legacy Vault': 99.95,
    'SyncSplit': 99.99,
    'AI Lending': 98.85,
    'Agent Mesh': 99.92,
    'Shadow OS': 99.97,
    'Treasury AI': 99.94,
    'Private Vault': 99.96,
  },
  chainActivityRates: {
    'QIE Mainnet': 14.5,
    'Solana Devnet': 285.2,
    'Stellar Testnet': 84.8,
    'Arbitrum': 48.6,
  },
  telemetryAnomalyCount: 0,
  averageLatency: 45,
  fallbackActivations: 0,
}

// Client-side singleton state
interface PlatformState {
  activeScenario: SimulationScenario
  analytics: OperationalAnalytics
  chains: Record<string, ChainMetadata>
}

let platformState: PlatformState = {
  activeScenario: 'none',
  analytics: { ...DEFAULT_ANALYTICS },
  chains: { ...CHAIN_REGISTRY },
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((l) => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_platform_state', JSON.stringify(platformState))
    window.dispatchEvent(new Event('kubryx_platform_update'))
  }
}

// Initialize safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_platform_state')
    if (saved) {
      platformState = {
        ...platformState,
        ...JSON.parse(saved),
      }
    }
  } catch {
    // ignore
  }
}

export function getPlatformState() {
  return platformState
}

export function updatePlatformState(updater: (prev: PlatformState) => Partial<PlatformState>) {
  const diff = updater(platformState)
  platformState = { ...platformState, ...diff }
  notifyListeners()
}

// Reactive Hook
export function usePlatformState() {
  const [state, setState] = useState<PlatformState>({ ...platformState })

  useEffect(() => {
    const handler = () => setState({ ...platformState })
    listeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_platform_update', handler)
    }

    return () => {
      listeners.delete(handler)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_platform_update', handler)
      }
    }
  }, [])

  // Auto fluctuate analytics slightly to make the system feel organic and fully alive!
  useEffect(() => {
    if (typeof window === 'undefined') return
    const interval = setInterval(() => {
      updatePlatformState((prev) => {
        const scenario = prev.activeScenario
        
        let latencyBase = 45
        let telemetryAnomalies = 0
        let fallbackBase = prev.analytics.fallbackActivations

        if (scenario === 'degraded_rpc') {
          latencyBase = 950 + Math.floor(Math.random() * 80)
          telemetryAnomalies = 14 + Math.floor(Math.random() * 5)
          fallbackBase += Math.random() > 0.6 ? 1 : 0
        } else if (scenario === 'chain_congestion') {
          latencyBase = 320 + Math.floor(Math.random() * 40)
        } else if (scenario === 'telemetry_anomaly_spikes') {
          latencyBase = 180 + Math.floor(Math.random() * 30)
          telemetryAnomalies = 48 + Math.floor(Math.random() * 10)
          fallbackBase += 2
        } else if (scenario === 'suspicious_activity') {
          telemetryAnomalies = 4
        }

        return {
          analytics: {
            ...prev.analytics,
            aiRequestsProcessed: prev.analytics.aiRequestsProcessed + (Math.random() > 0.3 ? 1 : 0),
            transactionsObserved: prev.analytics.transactionsObserved + (Math.random() > 0.5 ? 1 : 0),
            averageLatency: Math.max(15, latencyBase + Math.floor(Math.sin(Date.now() / 10000) * 10)),
            telemetryAnomalyCount: telemetryAnomalies,
            fallbackActivations: fallbackBase,
            chainActivityRates: {
              'QIE Mainnet': Number((14.5 + Math.sin(Date.now() / 5000) * 1.5).toFixed(1)),
              'Solana Devnet': Number((285.2 + Math.sin(Date.now() / 4000) * 20).toFixed(1)),
              'Stellar Testnet': Number((84.8 + Math.sin(Date.now() / 6000) * 5).toFixed(1)),
              'Arbitrum': Number((48.6 + Math.sin(Date.now() / 7000) * 3).toFixed(1)),
            }
          }
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return state
}
