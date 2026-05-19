'use client'

import { useEffect, useRef, useState } from 'react'
import { FALLBACK_ACTIVITY_FEED, type FeedItem } from '@/lib/dashboard-fallbacks'

const STAMPS = ['just now', '4s ago', '12s ago', '24s ago', '38s ago', '1m ago', '2m ago', '3m ago', '4m ago', '5m ago']

export function useDashboardActivity() {
  const [feed, setFeed] = useState<FeedItem[]>(FALLBACK_ACTIVITY_FEED)
  const counter = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFeed(prev => {
        const last = prev[prev.length - 1]
        const rest = prev.slice(0, -1)
        counter.current += 1
        const fresh: FeedItem = { ...last, id: `${last.id}-${counter.current}`, timestamp: 'just now' }
        const rotated = [fresh, ...rest].map((item, i) => ({
          ...item,
          timestamp: i === 0 ? 'just now' : STAMPS[Math.min(i, STAMPS.length - 1)],
        }))
        return rotated
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return { feed }
}
