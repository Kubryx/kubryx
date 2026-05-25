// Built by vsrupeshkumar
// Core crypto financial tracker: cost basis, P&L, tax lots — pure functions, no side effects.

import type { PFTransaction, PFAsset } from '../palmflow-fallbacks'

// Map display symbol → CoinGecko id for price lookups
export const SYMBOL_TO_COINGECKO: Record<string, string> = {
  SOL:   'solana',
  ETH:   'ethereum',
  MATIC: 'matic-network',
  ARB:   'arbitrum',
  BTC:   'bitcoin',
  AVAX:  'avalanche-2',
  BNB:   'binancecoin',
}

// Stablecoins always trade at $1
const STABLECOINS = new Set(['USDC','USDT','DAI','BUSD','PUSD','FRAX','TUSD','USDP'])

export function isStablecoin(symbol: string) {
  return STABLECOINS.has(symbol.toUpperCase())
}

// ─── Cost Basis (average cost) ────────────────────────────────────────────────

export type CostBasisEntry = {
  asset: string
  totalUnits: number
  totalCost: number    // USD paid to acquire all units
  avgCost: number      // USD per unit
  buys: { date: string; units: number; pricePerUnit: number; txId: string }[]
}

export function computeAvgCostBasis(
  txns: PFTransaction[],
  asset: string,
): CostBasisEntry {
  const sym = asset.toUpperCase()
  const buys: CostBasisEntry['buys'] = []
  let totalUnits = 0
  let totalCost = 0

  for (const t of txns) {
    if (t.status !== 'completed') continue

    if (t.type === 'deposit' && t.fromAsset.toUpperCase() === sym) {
      const units = t.fromAmount
      const pricePerUnit = units > 0 ? t.usdValue / units : 0
      totalUnits += units
      totalCost  += t.usdValue
      buys.push({ date: t.timestamp, units, pricePerUnit, txId: t.id })
    }

    if (t.type === 'swap' && t.toAsset?.toUpperCase() === sym && t.toAmount) {
      const units = t.toAmount
      const pricePerUnit = units > 0 ? t.usdValue / units : 0
      totalUnits += units
      totalCost  += t.usdValue
      buys.push({ date: t.timestamp, units, pricePerUnit, txId: t.id })
    }
  }

  return {
    asset: sym,
    totalUnits,
    totalCost,
    avgCost: totalUnits > 0 ? totalCost / totalUnits : 0,
    buys,
  }
}

// ─── Unrealized P&L ───────────────────────────────────────────────────────────

export type UnrealizedPnLEntry = {
  symbol: string
  name: string
  amount: number
  currentPrice: number    // USD
  currentValue: number    // amount × currentPrice
  avgCost: number         // USD per unit (from transactions, or usdValue/amount)
  totalCost: number       // what we paid for the current holding
  unrealizedPnL: number   // currentValue - totalCost
  unrealizedPnLPct: number
  network: string
  color: string
  isStable: boolean
}

export function computeUnrealizedPnL(
  assets: PFAsset[],
  txns: PFTransaction[],
  prices: Record<string, { usd: number }>,
): UnrealizedPnLEntry[] {
  return assets.map(a => {
    const sym = a.symbol.toUpperCase()
    const stable = isStablecoin(sym)

    let currentPrice: number
    if (stable) {
      currentPrice = 1
    } else {
      const cgId = SYMBOL_TO_COINGECKO[sym]
      currentPrice = cgId && prices[cgId]?.usd ? prices[cgId].usd : (a.usdValue / (a.amount || 1))
    }

    const currentValue = a.amount * currentPrice

    const basis = computeAvgCostBasis(txns, sym)
    // If we have buy history use it; otherwise estimate from current portfolio data
    const avgCost  = basis.totalUnits > 0 ? basis.avgCost  : (stable ? 1 : currentPrice * 0.82)
    const totalCost = basis.totalUnits > 0 ? basis.totalCost : avgCost * a.amount

    const unrealizedPnL    = currentValue - totalCost
    const unrealizedPnLPct = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0

    return {
      symbol: sym, name: a.name, amount: a.amount,
      currentPrice, currentValue, avgCost, totalCost,
      unrealizedPnL, unrealizedPnLPct,
      network: a.network, color: a.color, isStable: stable,
    }
  })
}

// ─── Realized P&L ─────────────────────────────────────────────────────────────

export type RealizedTrade = {
  id: string
  fromAsset: string
  toAsset: string
  fromAmount: number
  toAmount: number
  proceeds: number       // USD value of what was received
  costBasis: number      // USD we paid for what was sold
  realizedPnL: number
  realizedPnLPct: number
  timestamp: string
  txHash: string
  network: string
}

export function computeRealizedPnL(
  txns: PFTransaction[],
): RealizedTrade[] {
  const trades: RealizedTrade[] = []
  // Build running cost basis map per asset (chronological order)
  const runningAvg: Record<string, { units: number; cost: number }> = {}

  const sorted = [...txns].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  for (const t of sorted) {
    if (t.status !== 'completed') continue

    // Record buys for running average
    if (t.type === 'deposit' && t.fromAmount > 0) {
      const sym = t.fromAsset.toUpperCase()
      const r = runningAvg[sym] ?? { units: 0, cost: 0 }
      r.units += t.fromAmount
      r.cost  += t.usdValue
      runningAvg[sym] = r
    }

    if (t.type === 'swap' && t.toAsset && t.toAmount) {
      const buy = t.toAsset.toUpperCase()
      const sell = t.fromAsset.toUpperCase()

      // Record buy side
      const rb = runningAvg[buy] ?? { units: 0, cost: 0 }
      rb.units += t.toAmount
      rb.cost  += t.usdValue
      runningAvg[buy] = rb

      // Compute P&L on sell side (non-stablecoin → anything)
      if (!isStablecoin(sell)) {
        const rs = runningAvg[sell]
        const avgCostPerUnit = rs && rs.units > 0 ? rs.cost / rs.units : 0
        const costBasis = avgCostPerUnit * t.fromAmount
        const proceeds  = t.usdValue
        const realizedPnL = proceeds - costBasis
        const realizedPnLPct = costBasis > 0 ? (realizedPnL / costBasis) * 100 : 0

        trades.push({
          id: t.id,
          fromAsset: sell, toAsset: buy,
          fromAmount: t.fromAmount, toAmount: t.toAmount ?? 0,
          proceeds, costBasis, realizedPnL, realizedPnLPct,
          timestamp: t.timestamp, txHash: t.txHash, network: t.network,
        })

        // Reduce running units after sale
        if (rs) {
          rs.units -= t.fromAmount
          rs.cost   = rs.units > 0 ? rs.units * avgCostPerUnit : 0
        }
      }
    }
  }

  return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// ─── Tax Lots (FIFO) ──────────────────────────────────────────────────────────

export type TaxLot = {
  id: string
  asset: string
  buyDate: string
  sellDate: string
  amount: number
  buyPricePerUnit: number
  sellPricePerUnit: number
  costBasis: number
  proceeds: number
  gain: number
  gainPct: number
  holdingDays: number
  isLongTerm: boolean   // held > 365 days
  txHash: string
  network: string
}

export function computeTaxLots(txns: PFTransaction[]): TaxLot[] {
  const sorted = [...txns].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // FIFO queues per asset
  const queues: Record<string, { date: string; pricePerUnit: number; units: number; txId: string }[]> = {}

  const lots: TaxLot[] = []

  for (const t of sorted) {
    if (t.status !== 'completed') continue

    // Acquisitions
    if (t.type === 'deposit' && t.fromAmount > 0 && !isStablecoin(t.fromAsset)) {
      const sym = t.fromAsset.toUpperCase()
      queues[sym] = queues[sym] ?? []
      queues[sym].push({ date: t.timestamp, pricePerUnit: t.usdValue / t.fromAmount, units: t.fromAmount, txId: t.id })
    }
    if (t.type === 'swap' && t.toAsset && t.toAmount && !isStablecoin(t.toAsset)) {
      const sym = t.toAsset.toUpperCase()
      queues[sym] = queues[sym] ?? []
      queues[sym].push({ date: t.timestamp, pricePerUnit: t.usdValue / t.toAmount, units: t.toAmount, txId: t.id })
    }

    // Disposals (swap out or withdrawal of non-stable)
    const disposeAsset = t.type === 'swap' ? t.fromAsset : t.type === 'withdrawal' ? t.fromAsset : null
    if (disposeAsset && !isStablecoin(disposeAsset) && t.fromAmount > 0) {
      const sym = disposeAsset.toUpperCase()
      const queue = queues[sym] ?? []
      let unitsToDispose = t.fromAmount
      const sellPricePerUnit = t.usdValue / t.fromAmount

      while (unitsToDispose > 0 && queue.length > 0) {
        const lot = queue[0]
        const matchedUnits = Math.min(lot.units, unitsToDispose)
        const costBasis = matchedUnits * lot.pricePerUnit
        const proceeds  = matchedUnits * sellPricePerUnit
        const gain      = proceeds - costBasis

        const buyTs  = new Date(lot.date)
        const sellTs = new Date(t.timestamp)
        const holdingDays = Math.max(0, Math.floor((sellTs.getTime() - buyTs.getTime()) / 86_400_000))

        lots.push({
          id: `${lot.txId}-${t.id}`,
          asset: sym,
          buyDate: lot.date, sellDate: t.timestamp,
          amount: matchedUnits,
          buyPricePerUnit: lot.pricePerUnit, sellPricePerUnit,
          costBasis, proceeds, gain,
          gainPct: costBasis > 0 ? (gain / costBasis) * 100 : 0,
          holdingDays, isLongTerm: holdingDays > 365,
          txHash: t.txHash, network: t.network,
        })

        lot.units -= matchedUnits
        unitsToDispose -= matchedUnits
        if (lot.units <= 0) queue.shift()
      }
    }
  }

  return lots.sort((a, b) => new Date(b.sellDate).getTime() - new Date(a.sellDate).getTime())
}

// ─── Net Flow ─────────────────────────────────────────────────────────────────

export type NetFlowSummary = {
  totalIn: number      // deposits + swap-ins
  totalOut: number     // payments + withdrawals
  totalFees: number
  netFlow: number      // totalIn - totalOut - totalFees
  byAsset: Record<string, { in: number; out: number }>
}

export function computeNetFlow(txns: PFTransaction[]): NetFlowSummary {
  let totalIn = 0, totalOut = 0, totalFees = 0
  const byAsset: Record<string, { in: number; out: number }> = {}

  for (const t of txns) {
    if (t.status !== 'completed') continue
    totalFees += t.fee ?? 0

    const sym = t.fromAsset.toUpperCase()
    byAsset[sym] = byAsset[sym] ?? { in: 0, out: 0 }

    if (t.type === 'deposit') {
      totalIn += t.usdValue
      byAsset[sym].in += t.usdValue
    } else if (t.type === 'payment' || t.type === 'withdrawal') {
      totalOut += t.usdValue
      byAsset[sym].out += t.usdValue
    }
  }

  return { totalIn, totalOut, totalFees, netFlow: totalIn - totalOut - totalFees, byAsset }
}
