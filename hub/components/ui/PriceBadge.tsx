// Built by vsrupeshkumar
'use client'

import { usePrices } from '@/hooks/usePrices'

interface Props {
  /** CoinGecko coin id, e.g. "ethereum", "solana", "arbitrum". */
  coinId: string
  /** Short display label, e.g. "ETH". */
  label: string
}

function formatPrice(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Compact inline price badge for a single coin — used on tool pages.
 * Shows a skeleton shimmer while the first fetch is in flight.
 */
export function PriceBadge({ coinId, label }: Props) {
  const { prices, loading } = usePrices([coinId])
  const p = prices[coinId]

  if (!p) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1"
        aria-busy={loading}
      >
        <span className="text-xs font-bold text-white/70">{label}</span>
        <span className="h-3 w-16 rounded bg-white/10 animate-pulse" />
      </span>
    )
  }

  const up = p.change24h >= 0
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1">
      <span className="text-xs font-bold text-white/70">{label}</span>
      <span className="text-sm font-semibold text-white tabular-nums">
        {formatPrice(p.usd)}
      </span>
      <span
        className={`text-[11px] tabular-nums ${up ? 'text-emerald-400/70' : 'text-red-400/70'}`}
      >
        {up ? '▲' : '▼'} {Math.abs(p.change24h).toFixed(2)}%
      </span>
    </span>
  )
}
