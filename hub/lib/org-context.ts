// Built by vsrupeshkumar
'use client'

import { useState, useEffect } from 'react'

export type OrgRole = 'Admin' | 'Treasury Manager' | 'Risk Analyst' | 'Operations' | 'Auditor'

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  workspaces: Workspace[]
}

export interface TeamActivity {
  id: string
  user: string
  role: OrgRole
  action: string
  timestamp: string
  orgId: string
  workspaceId: string
}

export interface OperationalAlert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  orgId: string
  timestamp: string
  resolved: boolean
}

export interface OrgState {
  currentOrgId: string
  currentWorkspaceId: string
  currentRole: OrgRole
  organizations: Organization[]
  roles: OrgRole[]
  teamActivity: TeamActivity[]
  operationalAlerts: OperationalAlert[]
  tenantUptimeScores: Record<string, number>
  tenantRiskThresholds: Record<string, number>
}

const DEFAULT_ORGS: Organization[] = [
  {
    id: 'org-acme',
    name: 'Acme Protocol',
    slug: 'acme',
    workspaces: [
      { id: 'ws-acme-treasury', name: 'Treasury Operations', slug: 'treasury', description: 'Multi-sig payroll & stream streaming operations' },
      { id: 'ws-acme-staking', name: 'Ecosystem Staking', slug: 'staking', description: 'NCRD verification & high-yield staking vaults' },
      { id: 'ws-acme-audits', name: 'Security Audits', slug: 'audits', description: 'Zero-metadata audit logging and compliance checkups' },
    ],
  },
  {
    id: 'org-shadow',
    name: 'Stealth Executive Suite DAO',
    slug: 'shadow-dao',
    workspaces: [
      { id: 'ws-shadow-gov', name: 'Governance Operations', slug: 'governance', description: 'Automated executive voting and corporate department grids' },
      { id: 'ws-shadow-telemetry', name: 'Telemetry Diagnostics', slug: 'telemetry', description: 'RPC routing, latency tracing, and telemetry anomaly logs' },
      { id: 'ws-shadow-compliance', name: 'Compliance Desk', slug: 'compliance', description: 'Key verification and localized security threshold settings' },
    ],
  },
  {
    id: 'org-eternal',
    name: 'Eternal Fund',
    slug: 'eternal-fund',
    workspaces: [
      { id: 'ws-eternal-yield', name: 'Yield Harvesting', slug: 'yield', description: 'Defi Credit lending desk negotiations' },
      { id: 'ws-eternal-vaults', name: 'Venture Vaults', slug: 'vaults', description: 'Self-claiming locker allocations and bridge tracking' },
    ],
  },
]

const DEFAULT_TEAM_ACTIVITIES: TeamActivity[] = [
  { id: 'act-1', user: 'Alice', role: 'Treasury Manager', action: 'initiated a $120k yield sweep on QIE Mainnet', timestamp: new Date(Date.now() - 4 * 60000).toISOString(), orgId: 'org-acme', workspaceId: 'ws-acme-treasury' },
  { id: 'act-2', user: 'Bob', role: 'Operations', action: 'matched payroll streams on Solana Devnet', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), orgId: 'org-acme', workspaceId: 'ws-acme-treasury' },
  { id: 'act-3', user: 'Charlie', role: 'Risk Analyst', action: 'approved LTV threshold transition to 78% on Lendora', timestamp: new Date(Date.now() - 32 * 60000).toISOString(), orgId: 'org-acme', workspaceId: 'ws-acme-treasury' },
  { id: 'act-4', user: 'David', role: 'Admin', action: 'revised private key verification thresholds', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), orgId: 'org-acme', workspaceId: 'ws-acme-audits' },
  { id: 'act-5', user: 'Emma', role: 'Auditor', action: 'extracted zero-metadata bridge audit logs', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), orgId: 'org-acme', workspaceId: 'ws-acme-audits' },
  
  { id: 'act-6', user: 'Fiona', role: 'Admin', action: 'deployed corporate StealthGuard agent configuration', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), orgId: 'org-shadow', workspaceId: 'ws-shadow-gov' },
  { id: 'act-7', user: 'George', role: 'Auditor', action: 'flagged latency anomaly spikes on regional nodes', timestamp: new Date(Date.now() - 18 * 60000).toISOString(), orgId: 'org-shadow', workspaceId: 'ws-shadow-telemetry' },
  { id: 'act-8', user: 'Hannah', role: 'Risk Analyst', action: 'triggered diagnostic trace on degraded RPCs', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), orgId: 'org-shadow', workspaceId: 'ws-shadow-telemetry' },
  
  { id: 'act-9', user: 'Ian', role: 'Treasury Manager', action: 'negotiated a 4.2% AI Lending loan baseline', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), orgId: 'org-eternal', workspaceId: 'ws-eternal-yield' },
  { id: 'act-10', user: 'Jack', role: 'Operations', action: 'released self-claiming locker to emergency heir address', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), orgId: 'org-eternal', workspaceId: 'ws-eternal-vaults' },
]

const DEFAULT_ALERTS: OperationalAlert[] = [
  { id: 'al-1', title: 'Rebalance Opportunity', description: 'Acme Protocol: Treasury APY rebalance recommended. Allocate 150 SOL to NCRD staking to capture 12.5% APY.', severity: 'warning', orgId: 'org-acme', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), resolved: false },
  { id: 'al-2', title: 'Unauthorized Connection Detected', description: 'Stealth Executive Suite DAO: Monitored suspicious routing attempts from an unauthorized RPC. Lock zero-metadata routing keys.', severity: 'critical', orgId: 'org-shadow', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), resolved: false },
  { id: 'al-3', title: 'Staking Verification', description: 'Acme Protocol: Active QIE Mainnet staking pools updated. Verify smart contract parameters.', severity: 'info', orgId: 'org-acme', timestamp: new Date(Date.now() - 50 * 60000).toISOString(), resolved: false },
  { id: 'al-4', title: 'Yield Stream Optimization', description: 'Eternal Fund: Staking APY risen to 14.5% — consider sweeping venture vaults.', severity: 'info', orgId: 'org-eternal', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), resolved: false },
]

const DEFAULT_STATE: OrgState = {
  currentOrgId: 'org-acme',
  currentWorkspaceId: 'ws-acme-treasury',
  currentRole: 'Admin',
  organizations: DEFAULT_ORGS,
  roles: ['Admin', 'Treasury Manager', 'Risk Analyst', 'Operations', 'Auditor'],
  teamActivity: DEFAULT_TEAM_ACTIVITIES,
  operationalAlerts: DEFAULT_ALERTS,
  tenantUptimeScores: {
    'org-acme': 99.98,
    'org-shadow': 98.42,
    'org-eternal': 99.95
  },
  tenantRiskThresholds: {
    'org-acme': 15,
    'org-shadow': 30,
    'org-eternal': 8
  }
}

let globalState = { ...DEFAULT_STATE }
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((l) => l())
  if (typeof window !== 'undefined') {
    localStorage.setItem('kubryx_org_context', JSON.stringify(globalState))
    window.dispatchEvent(new Event('kubryx_org_update'))
  }
}

// Load initial state safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('kubryx_org_context')
    if (saved) {
      const parsed = JSON.parse(saved)
      globalState = {
        ...DEFAULT_STATE,
        currentOrgId: parsed.currentOrgId || DEFAULT_STATE.currentOrgId,
        currentWorkspaceId: parsed.currentWorkspaceId || DEFAULT_STATE.currentWorkspaceId,
        currentRole: parsed.currentRole || DEFAULT_STATE.currentRole,
        // Preserve alert resolution state if saved
        operationalAlerts: parsed.operationalAlerts || DEFAULT_STATE.operationalAlerts,
      }
    }
  } catch {
    // ignore
  }
}

export function getOrgState(): OrgState {
  return globalState
}

export function updateOrgState(updater: (prev: OrgState) => Partial<OrgState>) {
  const diff = updater(globalState)
  globalState = { ...globalState, ...diff }
  
  // Auto switch workspace if active org was switched and active workspace does not belong to new org
  const activeOrg = globalState.organizations.find(o => o.id === globalState.currentOrgId)
  if (activeOrg) {
    const belongs = activeOrg.workspaces.some(w => w.id === globalState.currentWorkspaceId)
    if (!belongs && activeOrg.workspaces.length > 0) {
      globalState.currentWorkspaceId = activeOrg.workspaces[0].id
    }
  }
  
  notifyListeners()
}

export function useOrgContext() {
  const [state, setState] = useState<OrgState>({ ...globalState })

  useEffect(() => {
    const handler = () => setState({ ...globalState })
    listeners.add(handler)
    
    if (typeof window !== 'undefined') {
      window.addEventListener('kubryx_org_update', handler)
    }
    
    return () => {
      listeners.delete(handler)
      if (typeof window !== 'undefined') {
        window.removeEventListener('kubryx_org_update', handler)
      }
    }
  }, [])

  return state
}

export function resolveAlert(alertId: string) {
  updateOrgState((prev) => ({
    operationalAlerts: prev.operationalAlerts.map(a => a.id === alertId ? { ...a, resolved: true } : a)
  }))
}

export function recordTeamEvent(user: string, role: OrgRole, action: string) {
  const newAct: TeamActivity = {
    id: `team-act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user,
    role,
    action,
    timestamp: new Date().toISOString(),
    orgId: globalState.currentOrgId,
    workspaceId: globalState.currentWorkspaceId,
  }
  
  updateOrgState((prev) => ({
    teamActivity: [newAct, ...prev.teamActivity].slice(0, 100)
  }))
}
