/**
 * TrustMesh /agents dashboard extras.
 * Live data (jobs, nodes, analytics) comes from trustmesh-api + trustmesh-fallbacks.
 * This file holds ONLY the new Dashboard-tab UI strings that don't exist there.
 */

export const TRUSTMESH_ACCENT = '#6366f1'
export const TRUSTMESH_PROGRAM_ID = '66DXeXt9oTgQ2nMCFjsiCDFTPq8XBxgFR4urvg42quz'

export type DashStat = {
  label: string
  value: string
  change: string
  changeKind: 'up' | 'down' | 'neutral'
}

export const DASH_STAT_PLACEHOLDERS: DashStat[] = [
  { label: 'Active Agents',  value: '847',     change: '+23 today', changeKind: 'up'      },
  { label: 'Jobs (24h)',     value: '12,491',  change: '+8.2%',     changeKind: 'up'      },
  { label: 'Mesh Integrity', value: '99.7%',   change: 'Healthy',   changeKind: 'neutral' },
  { label: 'Avg Latency',    value: '142ms',   change: '-12ms',     changeKind: 'down'    },
]

export type HowStep = { title: string; description: string }

export const HOW_IT_WORKS: HowStep[] = [
  { title: 'Deploy',   description: 'Spawn a signed Anchor program on Solana devnet with an SNS identity.' },
  { title: 'Delegate', description: 'Authorize sub-agents with bounded scopes and time-locked permissions.' },
  { title: 'Verify',   description: 'Every message is Ed25519-signed and logged on-chain for full audit.' },
  { title: 'Revoke',   description: 'Pull authority instantly. Revocations propagate through the mesh.' },
]

export type ViolationLog = {
  severity: 'critical' | 'warning' | 'info'
  agent: string
  detail: string
  date: string
}

export const FALLBACK_VIOLATIONS: ViolationLog[] = [
  { severity: 'warning', agent: 'AGT-004', detail: 'Exceeded job capacity (44/40)', date: 'Jan 15' },
  { severity: 'warning', agent: 'AGT-007', detail: 'Signature timeout',            date: 'Jan 12' },
  { severity: 'info',    agent: 'AGT-019', detail: 'Delegation depth exceeded',    date: 'Jan 10' },
]

export type LeaderRow = {
  rank: number
  agent: string
  jobs: number
  integrity: string
  uptime: string
}

export const FALLBACK_LEADERS: LeaderRow[] = [
  { rank: 1, agent: 'alpha-7',  jobs: 4291, integrity: '100.0%', uptime: '99.8%' },
  { rank: 2, agent: 'beta-3',   jobs: 2841, integrity: '99.9%',  uptime: '99.1%' },
  { rank: 3, agent: 'delta-2',  jobs: 1204, integrity: '99.7%',  uptime: '98.4%' },
  { rank: 4, agent: 'gamma-1',  jobs:  891, integrity: '99.5%',  uptime: '97.6%' },
  { rank: 5, agent: 'epsilon-5',jobs:  742, integrity: '99.2%',  uptime: '97.0%' },
]

/* Hourly job throughput for the bar chart on the Analytics tab */
export const FALLBACK_HOURLY_JOBS = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  jobs: Math.floor(180 + Math.sin(i / 3.6) * 90 + Math.random() * 60),
}))
