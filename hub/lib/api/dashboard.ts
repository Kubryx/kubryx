// Built by vsrupeshkumar

import { fetchSolanaSlot } from './solana'
import { fetchStellarAccount } from './stellar'
import { fetchPrices } from './coingecko'

const STELLAR_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_STELLAR_PUBLIC_KEY ||
  'GBTZHFZG4JLUQEOMOUVHZCHHLXO26UHN4JXY4T376LXNI56O2IPGIBCC'

export interface BackendStatus {
  name: string
  url: string
  isLive: boolean
  latency: number | null
}

export interface DashboardStats {
  backendsLive: number
  backendsTotal: number
  backends: BackendStatus[]
  solanaSlot: number
  stellarBalance: string
  stellarIsLive: boolean
  prices: { eth: number; sol: number; arb: number }
  lastUpdated: Date
  isLive: boolean
}

const BACKENDS: { name: string; url: string }[] = [
  { name: 'CreditBlock', url: 'https://creditblock-rs-backend.onrender.com/health' },
  { name: 'Yield Operations Hub', url: 'https://kubryx-palmflow.onrender.com/health' },
  { name: 'Stealth Executive Suite', url: 'https://kubryx-shadow.onrender.com/health' },
  { name: 'SyncSplit',   url: 'https://kubryx-syncsplit.onrender.com/health'        },
  { name: 'TrustMesh',   url: 'https://kubryx-trustmesh.onrender.com/health'        },
]

async function checkBackend(name: string, url: string): Promise<BackendStatus> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 5000)
  const start = Date.now()
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    const latency = Date.now() - start
    return { name, url, isLive: res.ok, latency: res.ok ? latency : null }
  } catch {
    return { name, url, isLive: false, latency: null }
  } finally {
    clearTimeout(t)
  }
}

const SAFE_DEFAULTS: DashboardStats = {
  backendsLive: 0,
  backendsTotal: 6,
  backends: BACKENDS.map(b => ({ ...b, isLive: false, latency: null })),
  solanaSlot: 0,
  stellarBalance: '0',
  stellarIsLive: false,
  prices: { eth: 0, sol: 0, arb: 0 },
  lastUpdated: new Date(),
  isLive: false,
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [backendResults, solanaResult, stellarResult, pricesResult] = await Promise.allSettled([
      Promise.all(BACKENDS.map(b => checkBackend(b.name, b.url))),
      fetchSolanaSlot(),
      fetchStellarAccount(STELLAR_PUBLIC_KEY),
      fetchPrices(['ethereum', 'solana', 'arbitrum']),
    ])

    const backends: BackendStatus[] =
      backendResults.status === 'fulfilled'
        ? backendResults.value
        : BACKENDS.map(b => ({ ...b, isLive: false, latency: null }))

    const liveCount = backends.filter(b => b.isLive).length

    const solanaSlot = solanaResult.status === 'fulfilled' ? solanaResult.value : 0

    const stellar =
      stellarResult.status === 'fulfilled'
        ? { balance: stellarResult.value.balance, isLive: true }
        : { balance: '0', isLive: false }

    const priceMap = pricesResult.status === 'fulfilled' ? pricesResult.value : {}

    return {
      backendsLive: liveCount,
      backendsTotal: 6,
      backends,
      solanaSlot,
      stellarBalance: stellar.balance,
      stellarIsLive: stellar.isLive,
      prices: {
        eth: priceMap['ethereum']?.usd ?? 0,
        sol: priceMap['solana']?.usd ?? 0,
        arb: priceMap['arbitrum']?.usd ?? 0,
      },
      lastUpdated: new Date(),
      isLive: liveCount >= 3,
    }
  } catch {
    return { ...SAFE_DEFAULTS, lastUpdated: new Date() }
  }
}
