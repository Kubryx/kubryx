// Built by vsrupeshkumar
'use client'

import { useEffect, useState } from 'react'
import { fetchPrices } from '@/lib/api/coingecko'

export interface PriceInfo {
  usd: number
  change24h: number
}

export type Prices = Record<string, PriceInfo>

/**
 * Subscribes to CoinGecko prices for the given coin ids.
 * Fetches on mount and refreshes every 60 seconds.
 */
export function usePrices(coinIds: string[]) {
  const [prices, setPrices] = useState<Prices>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stable dependency — re-subscribe only when the actual id set changes.
  const idsKey = [...coinIds].sort().join(',')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const raw = await fetchPrices(idsKey.split(','))
        if (!active) return
        const mapped: Prices = {}
        for (const [id, v] of Object.entries(raw)) {
          mapped[id] = { usd: v.usd, change24h: v.usd_24h_change }
        }
        setPrices(mapped)
        setError(null)
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Failed to load prices')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 60_000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [idsKey])

  return { prices, loading, error }
}
