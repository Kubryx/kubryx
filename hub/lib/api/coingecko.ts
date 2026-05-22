// Built by vsrupeshkumar
// CoinGecko live price fetcher with a 60-second in-memory cache.
// The API key (if any) is read from the environment — never hard-coded.

const BASE_URL = 'https://api.coingecko.com/api/v3'
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || ''
const CACHE_TTL = 60_000 // 60 seconds

export interface CoinPrice {
  usd: number
  usd_24h_change: number
}

export type PriceMap = Record<string, CoinPrice>

interface CacheEntry {
  data: PriceMap
  ts: number
}

// Keyed by the sorted id list + vsCurrency, so different queries cache separately.
const cache = new Map<string, CacheEntry>()

/**
 * Fetches simple prices + 24h change for the given CoinGecko coin ids.
 * Results are cached for 60s. On a network/HTTP error the last cached value
 * is returned if available; otherwise the error is thrown.
 *
 * Note: QIE has no CoinGecko listing — never pass it here.
 */
export async function fetchPrices(
  ids: string[],
  vsCurrency = 'usd',
): Promise<PriceMap> {
  const cacheKey = [...ids].sort().join(',') + ':' + vsCurrency
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  try {
    const url =
      `${BASE_URL}/simple/price` +
      `?ids=${encodeURIComponent(ids.join(','))}` +
      `&vs_currencies=${encodeURIComponent(vsCurrency)}` +
      `&include_24hr_change=true`

    const headers: Record<string, string> = { accept: 'application/json' }
    if (API_KEY) headers['x-cg-demo-api-key'] = API_KEY

    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`)

    const json = (await res.json()) as Record<string, Record<string, number>>
    const data: PriceMap = {}
    for (const id of ids) {
      const row = json[id]
      if (row) {
        data[id] = {
          usd: row[vsCurrency] ?? 0,
          usd_24h_change: row[`${vsCurrency}_24h_change`] ?? 0,
        }
      }
    }

    cache.set(cacheKey, { data, ts: Date.now() })
    return data
  } catch (err) {
    if (cached) return cached.data
    throw err
  }
}
