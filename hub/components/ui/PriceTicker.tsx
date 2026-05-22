// Built by vsrupeshkumar
'use client'

import { usePrices } from '@/hooks/usePrices'

const COINS: { id: string; symbol: string }[] = [
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'arbitrum', symbol: 'ARB' },
]

function formatPrice(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Horizontal live-price ticker for the dashboard.
 * QIE has no CoinGecko listing, so it always renders "—".
 */
export function PriceTicker() {
  const { prices, loading } = usePrices(['ethereum', 'solana', 'arbitrum'])

  return (
    <div className="flex items-center gap-5 flex-wrap rounded-xl bg-black/40 border border-white/10 text-white px-4 py-2.5">
      {/* Refresh indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${loading ? 'animate-pulse' : ''}`}
        />
        <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">
          Live Prices
        </span>
      </div>

      {COINS.map((coin) => {
        const p = prices[coin.id]
        const up = p ? p.change24h >= 0 : true
        return (
          <div key={coin.id} className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/70">{coin.symbol}</span>
            {p ? (
              <>
                <span className="text-sm font-semibold tabular-nums">
                  {formatPrice(p.usd)}
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    up ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {up ? '▲' : '▼'} {Math.abs(p.change24h).toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="h-3.5 w-20 rounded bg-white/10 animate-pulse" />
            )}
          </div>
        )
      })}

      {/* QIE — no CoinGecko listing */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white/70">QIE</span>
        <span className="text-sm text-white/30">—</span>
      </div>
    </div>
  )
}
