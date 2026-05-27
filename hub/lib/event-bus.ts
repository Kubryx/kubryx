// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'
import { updateIntelligenceState, recordOSEvent } from './cross-tool-intelligence'
import { logTelemetryError } from './telemetry'
import { toast } from './toast'
import { updatePlatformState } from './platform-engine'
import { updateOrgState } from './org-context'

export interface AutomationRule {
  id: string
  title: string
  trigger: string
  action: string
  description: string
  active: boolean
  lastTriggered?: string
  timesTriggered: number
}

export interface EventLog {
  id: string
  eventName: string
  triggerText: string
  actionText: string
  timestamp: string
  status: 'propagated' | 'triggered' | 'skipped'
  details: string
}

export interface EventBusState {
  rules: AutomationRule[]
  logs: EventLog[]
  isSimulating: boolean
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'rule-suspicious',
    title: 'Stealth Executive Suite Intrusion Guard',
    trigger: 'suspicious_wallet_activity',
    action: 'notify_shadow_os',
    description: 'If suspicious wallet activity is detected, automatically escalate alert, notify Stealth Executive Suite and rotate secure key vaults.',
    active: true,
    timesTriggered: 0,
  },
  {
    id: 'rule-liquidity',
    title: 'Treasury Deficit Safe Guard',
    trigger: 'treasury_liquidity_drop',
    action: 'trigger_lending_warning',
    description: 'If treasury balances drop below 2000 SOL, trigger an automated low-interest lending credit warning via Lendora AI.',
    active: true,
    timesTriggered: 0,
  },
  {
    id: 'rule-staking',
    title: 'NCRD APY Staking Yield Sweep',
    trigger: 'staking_apy_rise',
    action: 'suggest_treasury_rebalance',
    description: 'If staking APY on QIE Mainnet rises above 12%, recommend a treasury sweep rebalance via the AI Command Panel.',
    active: true,
    timesTriggered: 0,
  },
  {
    id: 'rule-telemetry',
    title: 'Telemetry SLA Outage Diagnostics',
    trigger: 'telemetry_anomalies_spike',
    action: 'trigger_diagnostics_alert',
    description: 'If operational anomaly counts exceed 40 triggers, activate regional failover backup nodes and record diagnostics.',
    active: true,
    timesTriggered: 0,
  },
]

const DEFAULT_LOGS: EventLog[] = [
  {
    id: 'log-init-1',
    eventName: 'Platform Bootstrapped',
    triggerText: 'System hydration',
    actionText: 'Initialize Event Bus rules',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    status: 'propagated',
    details: 'Hydrated 4 active automation rules successfully in local memory storage.'
  }
]

let globalState: EventBusState = {
  rules: DEFAULT_RULES,
  logs: DEFAULT_LOGS,
  isSimulating: false,
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((l) => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_event_bus', JSON.stringify(globalState))
    window.dispatchEvent(new Event('kubryx_event_bus_update'))
  }
}

// Hydrate from localStorage
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_event_bus')
    if (saved) {
      const parsed = JSON.parse(saved)
      globalState = {
        rules: parsed.rules || DEFAULT_RULES,
        logs: parsed.logs || DEFAULT_LOGS,
        isSimulating: false,
      }
    }
  } catch {
    // ignore
  }
}

export function getEventBusState() {
  return globalState
}

export function updateEventBusState(updater: (prev: EventBusState) => Partial<EventBusState>) {
  const diff = updater(globalState)
  globalState = { ...globalState, ...diff }
  notifyListeners()
}

export function useEventBus() {
  const [state, setState] = useState<EventBusState>({ ...globalState })

  useEffect(() => {
    const handler = () => setState({ ...globalState })
    listeners.add(handler)

    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_event_bus_update', handler)
    }

    return () => {
      listeners.delete(handler)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_event_bus_update', handler)
      }
    }
  }, [])

  return state
}

// Propagate an event
export function fireEvent(trigger: string, customDetails?: string) {
  const matchedRules = globalState.rules.filter(r => r.trigger === trigger && r.active)
  
  if (matchedRules.length === 0) {
    const skipLog: EventLog = {
      id: `evt-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventName: trigger.replace(/_/g, ' ').toUpperCase(),
      triggerText: trigger,
      actionText: 'None matched',
      timestamp: new Date().toISOString(),
      status: 'skipped',
      details: customDetails || 'Event propagated, but no active matching automation rule was found.'
    }
    updateEventBusState((prev) => ({ logs: [skipLog, ...prev.logs].slice(0, 100) }))
    return
  }

  matchedRules.forEach((rule) => {
    // 1. Mark rule triggered
    updateEventBusState((prev) => ({
      rules: prev.rules.map(r => r.id === rule.id ? { ...r, timesTriggered: r.timesTriggered + 1, lastTriggered: new Date().toISOString() } : r)
    }))

    // 2. Perform side-effects based on active action
    let effectDetails = ''
    
    if (rule.action === 'notify_shadow_os') {
      effectDetails = 'Triggered threat response. Notified Stealth Executive Suite compliance CFO and Risk bots.'
      updateIntelligenceState((prev) => ({
        memory: { ...prev.memory, suspiciousActivityFlag: true }
      }))
      updatePlatformState(() => ({ activeScenario: 'suspicious_activity' }))
      recordOSEvent('Stealth Executive Suite', 'Triggered threat response. Rotate secure key vaults.', 'Solana')
      toast.warning('Threat detected! Stealth Executive Suite has locked down the private key vaults.')
    }
    
    else if (rule.action === 'trigger_lending_warning') {
      effectDetails = 'Treasury balances below 2000 SOL. Fired Q-Loan Lending Desk pre-approval warning.'
      updateIntelligenceState((prev) => ({
        profile: {
          ...prev.profile,
          treasuryBalance: '1,420 SOL', // Drop treasury
          activeLoansCount: 0 // Reset loans to prompt lending
        }
      }))
      updatePlatformState(() => ({ activeScenario: 'treasury_imbalance' }))
      recordOSEvent('AI Lending', 'Fired Q-Loan pre-approved low-interest capital check.', 'Arbitrum')
      toast.info('Lending Warning: Treasury liquidity drops. Open Lendora to negotiate rates.')
    }
    
    else if (rule.action === 'suggest_treasury_rebalance') {
      effectDetails = 'NCRD staking rates spiked. Transmitted APY rebalance recommendation to organizational dashboard.'
      updateIntelligenceState((prev) => ({
        profile: {
          ...prev.profile,
          treasuryBalance: '14,800 SOL' // Spike treasury balance to trigger rebalance suggestion
        }
      }))
      updateOrgState((prev) => ({
        operationalAlerts: prev.operationalAlerts.map(a => a.id === 'al-1' ? { ...a, resolved: false, timestamp: new Date().toISOString() } : a)
      }))
      recordOSEvent('Yield Operations Hub', 'Staking rates rise. Rebalancing recommendation dispatched.', 'Solana')
      toast.success('Yield Spike: APY rises. Stake NCRD on QIE to secure yield.')
    }
    
    else if (rule.action === 'trigger_diagnostics_alert') {
      effectDetails = 'Server diagnostic anomaly count > 40. Activated regional failover backup nodes.'
      updatePlatformState((prev) => ({
        activeScenario: 'telemetry_anomaly_spikes',
        analytics: {
          ...prev.analytics,
          telemetryAnomalyCount: 48,
          averageLatency: 920,
          fallbackActivations: prev.analytics.fallbackActivations + 2
        }
      }))
      logTelemetryError('RPC_ERROR', 'EventBus Autopilot', 'Diagnostics Stress Simulation Outage Intercepted', { trigger: 'telemetry_anomalies_spike' })
      recordOSEvent('Telemetry Core', 'Regional outages detected. Diagnostics logs generated.', 'Multi-chain')
      toast.error('Diagnostics Alert: Outage detected. Regional backup hot-swap active.')
    }

    // 3. Write event execution log
    const fireLog: EventLog = {
      id: `evt-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventName: rule.title,
      triggerText: rule.trigger,
      actionText: rule.action,
      timestamp: new Date().toISOString(),
      status: 'triggered',
      details: `${rule.description} Execution Details: ${effectDetails}`
    }

    updateEventBusState((prev) => ({ logs: [fireLog, ...prev.logs].slice(0, 100) }))
  })
}

// Reset trigger history
export function resetRules() {
  updateEventBusState((prev) => ({
    rules: prev.rules.map(r => ({ ...r, timesTriggered: 0, lastTriggered: undefined })),
    logs: [
      {
        id: `evt-log-${Date.now()}`,
        eventName: 'Rule Reset',
        triggerText: 'Manual trigger',
        actionText: 'Clear stats',
        timestamp: new Date().toISOString(),
        status: 'propagated',
        details: 'Manual automation logs and rule telemetry counts cleared.'
      }
    ]
  }))
  toast.success('Automation rule logs cleared')
}

// Toggle rule
export function toggleRule(ruleId: string) {
  updateEventBusState((prev) => ({
    rules: prev.rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r)
  }))
  toast.success('Rule state updated')
}
