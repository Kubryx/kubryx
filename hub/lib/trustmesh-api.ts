import {
  fallbackJobs,
  fallbackNodes,
  fallbackJobDetail,
  fallbackAnalytics,
  type JobsResponse,
  type NodesResponse,
  type JobDetail,
  type AnalyticsResponse,
} from './trustmesh-fallbacks'

const apiBase =
  process.env.NEXT_PUBLIC_TRUSTMESH_URL ||
  process.env.NEXT_PUBLIC_TRUSTMESH_API ||
  ''

const DEFAULT_TIMEOUT_MS = 8_000

async function getJson<T>(path: string): Promise<T> {
  if (!apiBase) throw new Error('NEXT_PUBLIC_TRUSTMESH_URL not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  try {
    const res = await fetch(`${apiBase}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!apiBase) throw new Error('NEXT_PUBLIC_TRUSTMESH_URL not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export type FetchResult<T> = { data: T; isLive: boolean; error?: string }

function asFallback<T>(data: T, error: unknown): FetchResult<T> {
  return {
    data,
    isLive: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

export async function fetchJobs(): Promise<FetchResult<JobsResponse>> {
  try {
    const data = await getJson<JobsResponse>('/api/v1/jobs')
    if (!data?.jobs) throw new Error('Malformed response')
    return { data, isLive: true }
  } catch (err) {
    return asFallback(fallbackJobs, err)
  }
}

export async function fetchJobById(
  id: string,
): Promise<FetchResult<JobDetail>> {
  try {
    const data = await getJson<JobDetail>(
      `/api/v1/jobs/${encodeURIComponent(id)}`,
    )
    if (!data?.id) throw new Error('Malformed response')
    return { data, isLive: true }
  } catch (err) {
    return asFallback(fallbackJobDetail(id), err)
  }
}

export async function fetchNodes(): Promise<FetchResult<NodesResponse>> {
  try {
    const data = await getJson<NodesResponse>('/api/v1/nodes')
    if (!Array.isArray(data?.nodes)) throw new Error('Malformed response')
    return { data, isLive: true }
  } catch (err) {
    return asFallback(fallbackNodes, err)
  }
}

export async function fetchAnalytics(): Promise<
  FetchResult<AnalyticsResponse>
> {
  try {
    const data = await getJson<AnalyticsResponse>('/api/v1/analytics')
    if (!data?.stats) throw new Error('Malformed response')
    return { data, isLive: true }
  } catch (err) {
    return asFallback(fallbackAnalytics, err)
  }
}

export type DeployPayload = {
  description: string
  agents: { role: string; name: string; type: string }[]
  budget: number
  walletAddress: string
}

export type DeployResponse = {
  jobId: string
  txHash: string
  status: 'pending' | 'submitted' | 'failed'
}

export async function deployJob(
  payload: DeployPayload,
): Promise<FetchResult<DeployResponse>> {
  try {
    const data = await postJson<DeployResponse>(
      '/api/v1/jobs/deploy',
      payload,
    )
    if (!data?.jobId) throw new Error('Malformed response')
    return { data, isLive: true }
  } catch (err) {
    const mock: DeployResponse = {
      jobId: `job_demo_${Date.now().toString(36).slice(-6)}`,
      txHash: `mock_${Date.now().toString(36)}`,
      status: 'submitted',
    }
    return asFallback(mock, err)
  }
}
