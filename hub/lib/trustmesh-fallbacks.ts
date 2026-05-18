export type JobStatus = 'active' | 'complete' | 'revoked' | 'pending' | 'warning'
export type NodeStatus = 'active' | 'revoked' | 'complete' | 'warning' | 'idle'
export type AgentType = 'planner' | 'executor' | 'analyzer' | 'trader' | 'confirmer'

export type Job = {
  id: string
  owner: string
  status: JobStatus
  description: string
  createdAt: string
  agentCount?: number
}

export type AgentNode = {
  id: string
  name: string
  wallet: string
  type: AgentType
  jobId: string
  status: NodeStatus
  spawnedAt: string
}

export type AgentTreeNode = {
  role: string
  name: string
  status: 'running' | 'idle' | 'stopped'
  message: string
  children?: AgentTreeNode[]
}

export type CoordinationEvent = {
  timestamp: string
  from: string
  to: string
  message: string
  txHash: string
  level: 'success' | 'warning' | 'error'
}

export type JobDetail = {
  id: string
  owner: string
  status: JobStatus
  description: string
  duration: string
  nodesActive: number
  agentTree: AgentTreeNode
  coordinationLog: CoordinationEvent[]
}

export type JobsResponse = {
  jobs: Job[]
  stats: { activeCount: number; agentCount: number; breachCount: number }
}

export type NodesResponse = {
  nodes: AgentNode[]
  total: number
}

export type AnalyticsResponse = {
  stats: {
    totalJobs: number
    activeAgents: number
    messagesLogged: number
    unauthorizedActions: number
  }
  jobStatusDist: { active: number; complete: number; revoked: number; pending: number }
  hourlyActivity: { hour: string; messageCount: number }[]
  topJobs: { jobId: string; owner: string; agentCount: number; status: JobStatus; createdAt: string }[]
}

const now = () => new Date().toISOString()
const minutesAgo = (mins: number) =>
  new Date(Date.now() - mins * 60_000).toISOString()
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString()

export const fallbackJobs: JobsResponse = {
  jobs: [
    {
      id: 'job_a4f8d2',
      owner: 'alice.sol',
      status: 'active',
      description: 'Rebalance SOL/USDC portfolio to target 60/40 allocation',
      createdAt: hoursAgo(2),
      agentCount: 3,
    },
    {
      id: 'job_b7c9e3',
      owner: 'bob.sol',
      status: 'active',
      description: 'Monitor DAO proposal feed and surface high-impact votes',
      createdAt: hoursAgo(4),
      agentCount: 2,
    },
    {
      id: 'job_c2e1f7',
      owner: 'carol.sol',
      status: 'complete',
      description: 'Quarterly tax estimate for Treasury operations',
      createdAt: hoursAgo(28),
      agentCount: 4,
    },
    {
      id: 'job_d9a3b8',
      owner: 'dave.sol',
      status: 'revoked',
      description: 'Off-chain data feed (failed verification)',
      createdAt: hoursAgo(48),
      agentCount: 2,
    },
    {
      id: 'job_e5f8c1',
      owner: 'eve.sol',
      status: 'pending',
      description: 'NFT royalty distribution preflight',
      createdAt: minutesAgo(8),
      agentCount: 2,
    },
    {
      id: 'job_f1d4a2',
      owner: 'alice.sol',
      status: 'active',
      description: 'Auto-compound yield from Marinade staking rewards',
      createdAt: hoursAgo(11),
      agentCount: 3,
    },
  ],
  stats: { activeCount: 3, agentCount: 13, breachCount: 2 },
}

export const fallbackNodes: NodesResponse = {
  nodes: [
    {
      id: 'node_1',
      name: 'planner.alice.sol',
      wallet: '7xKXa8q...4j2nP',
      type: 'planner',
      jobId: 'job_a4f8d2',
      status: 'active',
      spawnedAt: hoursAgo(2),
    },
    {
      id: 'node_2',
      name: 'executor.alice.sol',
      wallet: '9aBcDe7...8mnHk',
      type: 'executor',
      jobId: 'job_a4f8d2',
      status: 'active',
      spawnedAt: hoursAgo(2),
    },
    {
      id: 'node_3',
      name: 'confirmer.alice.sol',
      wallet: '4PqRs6T...vCxZy',
      type: 'confirmer',
      jobId: 'job_a4f8d2',
      status: 'active',
      spawnedAt: hoursAgo(2),
    },
    {
      id: 'node_4',
      name: 'planner.bob.sol',
      wallet: '2GhJkL5...wFdEr',
      type: 'planner',
      jobId: 'job_b7c9e3',
      status: 'active',
      spawnedAt: hoursAgo(4),
    },
    {
      id: 'node_5',
      name: 'analyzer.bob.sol',
      wallet: '5MnOpQ8...rTyUi',
      type: 'analyzer',
      jobId: 'job_b7c9e3',
      status: 'active',
      spawnedAt: hoursAgo(4),
    },
    {
      id: 'node_6',
      name: 'planner.carol.sol',
      wallet: '6WeRtY9...oPaSd',
      type: 'planner',
      jobId: 'job_c2e1f7',
      status: 'complete',
      spawnedAt: hoursAgo(28),
    },
    {
      id: 'node_7',
      name: 'executor.carol.sol',
      wallet: '3FgHjK4...lMnBv',
      type: 'executor',
      jobId: 'job_c2e1f7',
      status: 'complete',
      spawnedAt: hoursAgo(28),
    },
    {
      id: 'node_8',
      name: 'trader.carol.sol',
      wallet: '8QwErT2...yUiOp',
      type: 'trader',
      jobId: 'job_c2e1f7',
      status: 'complete',
      spawnedAt: hoursAgo(28),
    },
    {
      id: 'node_9',
      name: 'confirmer.carol.sol',
      wallet: '1AsDfG6...hJkLx',
      type: 'confirmer',
      jobId: 'job_c2e1f7',
      status: 'complete',
      spawnedAt: hoursAgo(28),
    },
    {
      id: 'node_10',
      name: 'planner.dave.sol',
      wallet: '0ZxCvB3...nMlKj',
      type: 'planner',
      jobId: 'job_d9a3b8',
      status: 'revoked',
      spawnedAt: hoursAgo(48),
    },
    {
      id: 'node_11',
      name: 'analyzer.dave.sol',
      wallet: 'AnLkMj7...UyTrE',
      type: 'analyzer',
      jobId: 'job_d9a3b8',
      status: 'warning',
      spawnedAt: hoursAgo(48),
    },
    {
      id: 'node_12',
      name: 'planner.eve.sol',
      wallet: 'PoLkMnB...8jHgF',
      type: 'planner',
      jobId: 'job_e5f8c1',
      status: 'idle',
      spawnedAt: minutesAgo(8),
    },
    {
      id: 'node_13',
      name: 'executor.eve.sol',
      wallet: 'QwErTy7...uIoPa',
      type: 'executor',
      jobId: 'job_e5f8c1',
      status: 'idle',
      spawnedAt: minutesAgo(8),
    },
  ],
  total: 13,
}

export function fallbackJobDetail(jobId: string): JobDetail {
  const job =
    fallbackJobs.jobs.find((j) => j.id === jobId) ?? fallbackJobs.jobs[0]
  return {
    id: job.id,
    owner: job.owner,
    status: job.status,
    description: job.description,
    duration: '2h 14m',
    nodesActive: 3,
    agentTree: {
      role: 'HUMAN INTENT',
      name: job.owner,
      status: 'running',
      message: 'Initial mandate verified on-chain',
      children: [
        {
          role: 'LEAD PLANNER',
          name: `planner.${job.owner}`,
          status: 'running',
          message: 'Decomposed mandate into 3 sub-tasks',
          children: [
            {
              role: 'EXECUTOR',
              name: `executor.${job.owner}`,
              status: 'running',
              message: 'Submitted swap intent · 2.5 SOL → USDC',
            },
            {
              role: 'ANALYZER',
              name: `analyzer.${job.owner}`,
              status: 'idle',
              message: 'Waiting for executor receipt',
            },
          ],
        },
        {
          role: 'CONFIRMER',
          name: `confirmer.${job.owner}`,
          status: 'running',
          message: 'Verifying signatures on slot 384,201',
        },
      ],
    },
    coordinationLog: [
      {
        timestamp: minutesAgo(1),
        from: 'confirmer',
        to: 'planner',
        message: 'VERIFICATION SUCCESS · slot 384,201 signed',
        txHash: '5KJp9L2x8...QnVbWr',
        level: 'success',
      },
      {
        timestamp: minutesAgo(3),
        from: 'executor',
        to: 'analyzer',
        message: 'Receipt forwarded for analysis',
        txHash: '3FgH7Kj1m...rBvCx',
        level: 'success',
      },
      {
        timestamp: minutesAgo(6),
        from: 'planner',
        to: 'executor',
        message: 'Issue swap intent · 2.5 SOL → USDC',
        txHash: '8WqErT4n...PoLkM',
        level: 'success',
      },
      {
        timestamp: minutesAgo(12),
        from: 'analyzer',
        to: 'planner',
        message: 'WARNING · slippage tolerance above 1%',
        txHash: '2QzXcV5b...NmLkJ',
        level: 'warning',
      },
      {
        timestamp: minutesAgo(18),
        from: 'planner',
        to: 'confirmer',
        message: 'Sub-mandate spawned: confirmer.alice.sol',
        txHash: '7TyUiO3p...AsDfG',
        level: 'success',
      },
      {
        timestamp: minutesAgo(25),
        from: 'human',
        to: 'planner',
        message: 'Mandate submitted: Rebalance SOL/USDC',
        txHash: '1HjKlM9n...EeRrT',
        level: 'success',
      },
    ],
  }
}

export const fallbackAnalytics: AnalyticsResponse = {
  stats: {
    totalJobs: 6,
    activeAgents: 13,
    messagesLogged: 184,
    unauthorizedActions: 2,
  },
  jobStatusDist: { active: 3, complete: 1, revoked: 1, pending: 1 },
  hourlyActivity: Array.from({ length: 24 }, (_, i) => {
    const hour = ((new Date().getHours() - 23 + i + 24) % 24)
      .toString()
      .padStart(2, '0')
    const base = 4 + Math.round(Math.sin(i / 3) * 3 + Math.cos(i / 5) * 2)
    const spike = i === 14 ? 18 : i === 9 ? 22 : 0
    return { hour: `${hour}:00`, messageCount: Math.max(0, base + spike) }
  }),
  topJobs: fallbackJobs.jobs.slice(0, 6).map((j) => ({
    jobId: j.id,
    owner: j.owner,
    agentCount: j.agentCount ?? 0,
    status: j.status,
    createdAt: j.createdAt,
  })),
}

export const meshTemplates = [
  {
    id: 'portfolio_rebalancer',
    name: 'Portfolio Rebalancer',
    description:
      'Watches target allocations and triggers safe rebalances via Jupiter routing.',
    roles: ['planner', 'executor', 'confirmer'] as AgentType[],
  },
  {
    id: 'dao_voter',
    name: 'DAO Voter',
    description:
      'Aggregates governance proposals and signs structured votes per policy.',
    roles: ['planner', 'analyzer', 'confirmer'] as AgentType[],
  },
  {
    id: 'data_fetcher',
    name: 'Data Fetcher',
    description:
      'Pulls off-chain feeds, signs payloads, and verifies on-chain delivery.',
    roles: ['planner', 'analyzer'] as AgentType[],
  },
]
