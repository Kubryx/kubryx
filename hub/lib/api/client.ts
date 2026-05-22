// Built by vsrupeshkumar
import { logTelemetryError } from '../telemetry'
import { validateEnvironment } from '../security-isolation'
import { trackRPCFailure } from '../observability'

export type ChainType = 'QIE' | 'SOLANA' | 'STELLAR' | 'ARBITRUM'

export interface RPCNode {
  url: string
  latency: number
  healthy: boolean
}

// 1. Env-safe URLs & Fallbacks
export const API_ENDPOINTS = {
  ETERNALVAULT: process.env.NEXT_PUBLIC_ETERNALVAULT_URL || process.env.NEXT_PUBLIC_ETERNALVAULT_API || 'http://localhost:3000/api/eternalvault',
  LENDORA: process.env.NEXT_PUBLIC_LENDORA_URL || process.env.NEXT_PUBLIC_LENDORA_API || 'http://localhost:3000/api/lendora',
  TRUSTMESH: process.env.NEXT_PUBLIC_TRUSTMESH_URL || process.env.NEXT_PUBLIC_TRUSTMESH_API || 'http://localhost:3000/api/trustmesh',
  SHADOW: process.env.NEXT_PUBLIC_SHADOW_URL || process.env.NEXT_PUBLIC_SHADOW_API || 'http://localhost:3000/api/shadow',
  PALMFLOW: process.env.NEXT_PUBLIC_PALMFLOW_URL || process.env.NEXT_PUBLIC_PALMFLOW_API || 'http://localhost:3000/api/palmflow',
  CIPHER: process.env.NEXT_PUBLIC_CIPHER_URL || process.env.NEXT_PUBLIC_CIPHER_API || 'http://localhost:3000/api/cipher',
  CREDITBLOCKS: process.env.NEXT_PUBLIC_CREDITBLOCKS_URL || process.env.NEXT_PUBLIC_CREDITBLOCKS_API || 'https://creditblock-rs-backend.onrender.com'
}

// 2. RPC Nodes with Native Failovers
export const RPC_NODES: Record<ChainType, RPCNode[]> = {
  QIE: [
    { url: process.env.NEXT_PUBLIC_QIE_RPC || 'https://mainnet.qie.digital/api/eth-rpc', latency: 0, healthy: true },
    { url: 'https://rpc2.qie.space', latency: 0, healthy: true }
  ],
  SOLANA: [
    { url: process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com', latency: 0, healthy: true },
    { url: 'https://api.mainnet-beta.solana.com', latency: 0, healthy: true }
  ],
  STELLAR: [
    { url: process.env.NEXT_PUBLIC_STELLAR_RPC || 'https://soroban-testnet.stellar.org', latency: 0, healthy: true },
    { url: 'https://friendbot.stellar.org', latency: 0, healthy: true }
  ],
  ARBITRUM: [
    { url: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://sepolia-rollup.arbitrum.io/rpc', latency: 0, healthy: true },
    { url: 'https://arb-sepolia.g.allthatnode.com', latency: 0, healthy: true }
  ]
}

export class APIResilienceError extends Error {
  constructor(public type: 'TIMEOUT' | 'BAD_STATUS' | 'OFFLINE' | 'PARSE_ERROR', message: string, public details?: any) {
    super(message)
    this.name = 'APIResilienceError'
  }
}

// Keep track of runtime RPC latencies dynamically
if (typeof window !== 'undefined') {
  validateEnvironment()
  setInterval(async () => {
    for (const chain of Object.keys(RPC_NODES) as ChainType[]) {
      for (const node of RPC_NODES[chain]) {
        const start = Date.now()
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000)
          await fetch(node.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          node.latency = Date.now() - start
          node.healthy = true
        } catch {
          node.healthy = false
          node.latency = 9999
        }
      }
    }
    window.dispatchEvent(new CustomEvent('kubryx_rpc_health_update'))
  }, 15000)
}

// 3. Centralized API Resilient Client
export const apiClient = {
  async get<T>(url: string, options?: RequestInit, cacheKey?: string, maxRetries = 2): Promise<T> {
    return this.request<T>(url, { method: 'GET', ...options }, cacheKey, maxRetries)
  },

  async post<T>(url: string, body: any, options?: RequestInit, cacheKey?: string, maxRetries = 2): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    }, cacheKey, maxRetries)
  },

  async request<T>(url: string, options?: RequestInit, cacheKey?: string, maxRetries = 2): Promise<T> {
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      if (cacheKey) {
        const cached = localStorage.getItem(`stale_cache_${cacheKey}`)
        if (cached) {
          logTelemetryError('FETCH_ERROR', `API [Offline Fallback: ${cacheKey}]`, 'System is offline, serving stale cache data.')
          return JSON.parse(cached) as T
        }
      }
      throw new APIResilienceError('OFFLINE', 'No internet connection detected.')
    }

    let attempt = 0
    while (attempt <= maxRetries) {
      const controller = new AbortController()
      const signal = options?.signal || controller.signal
      const timeoutId = setTimeout(() => controller.abort(), 6000) // 6s timeout

      try {
        const res = await fetch(url, {
          ...options,
          signal,
          headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {})
          }
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
          throw new APIResilienceError(
            'BAD_STATUS',
            `HTTP ${res.status}: ${res.statusText}`,
            { status: res.status, url }
          )
        }

        const data = await res.json() as T

        if (cacheKey && typeof window !== 'undefined') {
          localStorage.setItem(`stale_cache_${cacheKey}`, JSON.stringify(data))
        }

        return data
      } catch (err: any) {
        clearTimeout(timeoutId)
        const isTimeout = err.name === 'AbortError'
        const errorType = isTimeout ? 'TIMEOUT' : (err instanceof APIResilienceError ? err.type : 'BAD_STATUS')
        const errorMsg = isTimeout ? 'Gateway Timeout' : err.message || 'Network anomaly'

        if (attempt === maxRetries) {
          logTelemetryError(
            'FETCH_ERROR',
            `API Final Failure [${url.slice(0, 45)}]`,
            `All ${maxRetries + 1} retries failed: ${errorMsg}`,
            { attempt, errorType, url }
          )

          if (cacheKey && typeof window !== 'undefined') {
            const cached = localStorage.getItem(`stale_cache_${cacheKey}`)
            if (cached) {
              logTelemetryError('FETCH_ERROR', `API [Stale Fallback: ${cacheKey}]`, 'Utilizing stale cache data for resilience.')
              return JSON.parse(cached) as T
            }
          }
          throw new APIResilienceError(errorType, errorMsg, err)
        }

        const delay = Math.pow(2, attempt) * 200
        await new Promise((resolve) => setTimeout(resolve, delay))
        attempt++
      }
    }

    throw new APIResilienceError('TIMEOUT', 'Request timed out after max retries.')
  }
}

// 4. Centralized resilient RPC Read client with automatic node failover routing
export const rpcClient = {
  async read<T>(
    chain: ChainType,
    method: string,
    params: any[],
    fallbackData: T
  ): Promise<T> {
    const nodes = RPC_NODES[chain]
    for (const node of nodes) {
      if (!node.healthy) continue
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s RPC query timeout
        const res = await fetch(node.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params
          }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!res.ok) continue
        const json = await res.json()
        if (json.error) {
          throw new Error(json.error.message || 'RPC payload error')
        }
        return json.result as T
      } catch (err: any) {
        logTelemetryError(
          'RPC_ERROR',
          `RPC Query Failed [${chain}]`,
          `Node ${node.url} failed: ${err.message || err}. Attempting failover node...`
        )
        trackRPCFailure(chain, node.url, err.message || 'Connection anomaly')
      }
    }

    // All RPC nodes failed: serve deterministic cached/offline fallback parameters
    logTelemetryError(
      'RPC_ERROR',
      `RPC Total Failure [${chain}]`,
      `All RPC nodes failed or timed out. Serving deterministic fallback parameters.`
    )
    trackRPCFailure(chain, 'ALL_NODES', 'Total outage, serving fallback parameters')
    return fallbackData
  }
}
