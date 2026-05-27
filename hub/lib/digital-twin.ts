// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import { getPlatformState, updatePlatformState, SimulationScenario } from './platform-engine'
import { getEventBusState, fireEvent, EventLog } from './event-bus'
import { updateAutonomousOpsState, triggerAutonomousRecalculation } from './autonomous-ops'
import { toast } from './toast'

export interface TwinScenarioProfile {
  id: SimulationScenario
  name: string
  description: string
  cascadeSteps: string[]
  narrativeText: string
  riskImpact: number
  resilienceUptime: number
}

export const TWIN_SCENARIOS: TwinScenarioProfile[] = [
  {
    id: 'none',
    name: 'Nominal Sandbox Environment',
    description: 'System-wide pipelines operate normally within healthy bounds.',
    cascadeSteps: ['All regional RPC nodes active.', 'Uptime SLA verified at 99.98%.', 'Telemetry monitors quiet.'],
    narrativeText: 'Digital finance channels remain synchronized. AI assistants maintain maximum yield confidence indices.',
    riskImpact: 4,
    resilienceUptime: 99.98
  },
  {
    id: 'degraded_rpc',
    name: 'RPC Failure Cascade Simulation',
    description: 'Simulates a chain-reaction response failure across EVM L2 and Solana SVM networks.',
    cascadeSteps: [
      '00ms: Arbitrum regional gateway fails standard transaction ping.',
      '04ms: Solana Devnet RPC latency crosses 900ms threshold.',
      '08ms: Gateway Cache Fallback Layer automatically assumes routing priorities.',
      '12ms: Telemetry monitors fire high-severity RETRY_BACKOFF diagnostics alerts.'
    ],
    narrativeText: 'Stealth Executive Suite flagged elevated anomaly density after repeated RPC degradation. Cache layers absorbed transaction load, maintaining 98.42% SLA.',
    riskImpact: 35,
    resilienceUptime: 98.42
  },
  {
    id: 'chain_congestion',
    name: 'Congestion & Mempool Saturation Simulation',
    description: 'Models maximum structural limits on gas prices and transaction propagation delays.',
    cascadeSteps: [
      '00ms: Stellar Testnet block time drifts past 180s limits.',
      '03ms: Gas price estimates surge 400% on active EVM routing bridges.',
      '06ms: SyncSplit batch queues delay due to pool saturation.',
      '09ms: Autonomous Gas Optimizer restricts transaction pack sizes.'
    ],
    narrativeText: 'Mempool limits saturated following multi-chain yield sprints, prompting immediate Soroban splitting adjustments.',
    riskImpact: 45,
    resilienceUptime: 99.12
  },
  {
    id: 'suspicious_activity',
    name: 'Wallet Threat Key Compromise Simulation',
    description: 'Triggers active multi-sig private key compromised isolation sequence.',
    cascadeSteps: [
      '00ms: Blacklisted EVM signature detected attempt on Private Vault bridge.',
      '02ms: Security console drops posture metrics to CRITICAL.',
      '04ms: Automated Key Lock blocks routing certificate keys.',
      '06ms: Multi-sig co-signers receive secure ledger isolation alerts.'
    ],
    narrativeText: 'Private Vault isolated high-risk keys after detecting rapid anomalous EVM transfer signatures, securing institutional assets.',
    riskImpact: 85,
    resilienceUptime: 99.95
  },
  {
    id: 'treasury_imbalance',
    name: 'Treasury Stress Allocation Drift Simulation',
    description: 'Simulates active payroll disparity and automated yield allocation drifts.',
    cascadeSteps: [
      '00ms: Asset allocation drift exceeds 15% between QIE and Solana desks.',
      '02ms: Solana treasury pools hit cash flow saturation limits.',
      '04ms: QIE Mainnet staking yields expand, prompting delta rebalance.',
      '06ms: Rebalance recommendation dispatched to executive command dashboard.'
    ],
    narrativeText: 'Treasury liquidity declined after lending utilization increased, triggering delta-neutral yield re-staking optimization.',
    riskImpact: 25,
    resilienceUptime: 99.96
  },
  {
    id: 'loan_risk_escalation',
    name: 'AI Lending Default Risk Volatility Simulation',
    description: 'Models default rates spikes under high volatility DeFi yield drops.',
    cascadeSteps: [
      '00ms: Peer-pool loan default rates exceed 5.4% boundary limits.',
      '03ms: Credit Passport staking requirement doubles automatically.',
      '06ms: Lendora AI freezes dynamic loan capitalizations.',
      '09ms: Loan grace repayment windows narrow to 14 days.'
    ],
    narrativeText: 'Agent Mesh deployment frequency increased following treasury rebalance recommendations to secure outstanding loan exposures.',
    riskImpact: 60,
    resilienceUptime: 98.85
  },
  {
    id: 'telemetry_anomaly_spikes',
    name: 'Multi-Chain Latency Crisis Simulation',
    description: 'Models server failures under rapid multi-node regional packet drops.',
    cascadeSteps: [
      '00ms: Anomaly triggers cross 45 active logs inside Performance Center.',
      '02ms: Regional SLAs degrade, flashing telemetry warnings.',
      '04ms: Automated failover routes active to offline backup relays.',
      '06ms: Diagnostics telemetry logs cleared and synchronized with secure node storage.'
    ],
    narrativeText: 'Multi-chain latency crisis triggered automated failovers to regional backup relays, preventing systemic network blackouts.',
    riskImpact: 75,
    resilienceUptime: 95.84
  },
  {
    id: 'treasury_depletion',
    name: 'Treasury Depletion Cascade',
    description: 'Simulates active cascading failure and dynamic liquidity drain across multi-sig nodes.',
    cascadeSteps: [
      '00ms: Multi-sig vault reserve drain threshold breached.',
      '03ms: Automated smart streams default block executed.',
      '06ms: Collateralized lending buffers decrease 45%.',
      '09ms: Emergency liquidity sweeps trigger rebalance.'
    ],
    narrativeText: 'Treasury depletion simulation triggered automated asset sweeps and locked active loan distributions.',
    riskImpact: 90,
    resilienceUptime: 94.20
  },
  {
    id: 'latency_crisis',
    name: 'Chain-Wide Latency Crisis',
    description: 'Models cascading network-wide dropouts with peak latencies above 5000ms.',
    cascadeSteps: [
      '00ms: Network packet delivery rate drops to 45%.',
      '03ms: RPC node endpoints average timeout exceeds 5000ms.',
      '06ms: State synchronization engine registers buffer inconsistencies.',
      '09ms: Dynamic consensus routing redirects queries to regional offline relays.'
    ],
    narrativeText: 'Chain-wide latency crisis simulated 5000ms network timeouts, diverting traffic to low-level cache endpoints.',
    riskImpact: 92,
    resilienceUptime: 90.10
  },
  {
    id: 'wallet_compromise',
    name: 'Wallet Compromise Chain Reaction',
    description: 'Simulates cascading wallet drainage vectors across multi-chain private vault locks.',
    cascadeSteps: [
      '00ms: Malicious EVM transaction co-signature attempt intercepted.',
      '02ms: Vault key lock certificate revoked autonomously.',
      '04ms: Zero-metadata private routing shieds standard wallets.',
      '06ms: Smart contract stream locks activated across 4 protocols.'
    ],
    narrativeText: 'Wallet compromise chain reaction isolated all multi-chain private keys, successfully stopping any asset outflow.',
    riskImpact: 99,
    resilienceUptime: 99.80
  },
  {
    id: 'telemetry_storm',
    name: 'Telemetry Anomaly Storm',
    description: 'Triggers a synthetic packet storm flooding telemetry ingestion buffers.',
    cascadeSteps: [
      '00ms: Analytics endpoints flood with 500+ synthetic telemetry triggers.',
      '03ms: Diagnostics server ingress buffer registers peak overflow warnings.',
      '06ms: Load-balancer diverts telemetry streams to auxiliary processors.',
      '09ms: Log buffers automatically clear state registries.'
    ],
    narrativeText: 'Telemetry anomaly storm simulated high stress logs traffic, testing memory optimization auto-clears.',
    riskImpact: 78,
    resilienceUptime: 97.40
  },
  {
    id: 'coordination_failure',
    name: 'AI Coordination Failure',
    description: 'Models synchronization loss between AI agents and smart contract state locks.',
    cascadeSteps: [
      '00ms: Multi-agent coordination heartbeat signals timed out.',
      '03ms: Workload balance engine loses active worker registration metrics.',
      '06ms: Stalled task queue flags coordination warnings.',
      '09ms: Core re-sync trigger re-establishes distributed communication mesh.'
    ],
    narrativeText: 'AI coordination failure simulated lost agent communication, auto-triggering mesh health heartbeat recals.',
    riskImpact: 70,
    resilienceUptime: 98.50
  },
  {
    id: 'rpc_fragmentation',
    name: 'RPC Fragmentation Scenario',
    description: 'Models isolated regional state splits where distinct RPCs return inconsistent block states.',
    cascadeSteps: [
      '00ms: Block height disparity drifts past 4 block threshold across L2 RPCs.',
      '03ms: Chain consistency monitor registers consensus discrepancies.',
      '06ms: Dynamic state routing locks compromised nodes out of sync.',
      '09ms: Re-consensus pipeline re-establishes healthy RPC baseline.'
    ],
    narrativeText: 'RPC fragmentation simulation isolated drifted block nodes, securing system transaction validity.',
    riskImpact: 85,
    resilienceUptime: 93.80
  }
]

export interface SimulationTrace {
  timestamp: string
  step: string
  status: 'info' | 'warning' | 'critical' | 'resolved'
}

export function injectDigitalTwinScenario(scenarioId: SimulationScenario) {
  const matched = TWIN_SCENARIOS.find(s => s.id === scenarioId)
  if (!matched) return

  // 1. Update Platform Scenario
  updatePlatformState(() => ({
    activeScenario: scenarioId
  }))

  // 2. Trigger Event Bus corresponding Event
  let eventTrigger = ''
  if (scenarioId === 'degraded_rpc') eventTrigger = 'telemetry_anomalies_spike'
  else if (scenarioId === 'chain_congestion') eventTrigger = 'staking_apy_rise'
  else if (scenarioId === 'suspicious_activity') eventTrigger = 'suspicious_wallet_activity'
  else if (scenarioId === 'treasury_imbalance') eventTrigger = 'treasury_liquidity_drop'
  else if (scenarioId === 'telemetry_anomaly_spikes') eventTrigger = 'telemetry_anomalies_spike'
  else if (scenarioId === 'treasury_depletion') eventTrigger = 'treasury_liquidity_drop'
  else if (scenarioId === 'wallet_compromise') eventTrigger = 'suspicious_wallet_activity'
  else if (scenarioId === 'latency_crisis') eventTrigger = 'telemetry_anomalies_spike'
  else if (scenarioId === 'telemetry_storm') eventTrigger = 'telemetry_anomalies_spike'
  
  if (eventTrigger) {
    fireEvent(eventTrigger, `[Digital Twin Simulation] Injecting cascade event for scenario: ${matched.name}`)
  }

  // 3. Force Autonomous Recalculation
  triggerAutonomousRecalculation()

  // 4. Dispatch simulated trace logs to Performance Center
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('twin_scenario_injected', { detail: { scenarioId, matched } }))
  }

  toast.success(`Injected Digital Twin: ${matched.name}`)
}

export function useDigitalTwin() {
  const [activeTwinScenario, setActiveTwinScenario] = useState<SimulationScenario>('none')
  const plat = getPlatformState()

  useEffect(() => {
    setActiveTwinScenario(plat.activeScenario)

    const handler = () => {
      const currentPlat = getPlatformState()
      setActiveTwinScenario(currentPlat.activeScenario)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_platform_update', handler)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_platform_update', handler)
      }
    }
  }, [plat.activeScenario])

  const activeProfile = TWIN_SCENARIOS.find(s => s.id === activeTwinScenario) || TWIN_SCENARIOS[0]

  return {
    activeTwinScenario,
    activeProfile,
    allScenarios: TWIN_SCENARIOS,
    injectScenario: injectDigitalTwinScenario
  }
}
