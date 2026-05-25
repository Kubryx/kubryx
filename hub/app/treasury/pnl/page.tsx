// Built by vsrupeshkumar
'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { fetchPortfolio, fetchTransactions } from '@/lib/palmflow-api'
import type { PFPortfolio, PFTransaction } from '@/lib/palmflow-api'
import { fetchPnLSummary } from '@/lib/palmflow-api'
import type { PFPnLSummary } from '@/lib/palmflow-api'
import { usePrices } from '@/hooks/usePrices'
import {
  computeUnrealizedPnL,
  computeRealizedPnL,
  SYMBOL_TO_COINGECKO,
} from '@/lib/portfolio/tracker'

const TEAL  = '#00E5CC'
const BG    = '#080810'
const CARD  = 'rgba(255,255,255,0.03)'
const BDR   = 'rgba(255,255,255,0.07)'
const MONO  = '"JetBrains Mono","Fira Code",monospace'
const GRN   = '#22C55E'
const RED   = '#EF4444'
const MUTED = 'rgba(255,255,255,0.4)'

function fmtUsd(n: number, signed = false) {
  const abs = Math.abs(n)
  const str = `$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (!signed) return str
  return n >= 0 ? `+${str}` : `-${str}`
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function pnlColor(n: number) {
  return n > 0 ? GRN : n < 0 ? RED : MUTED
}

function short(s: string) {
  return s.length > 18 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s
}

export default function PnLPage() {
  const [summary, setSummary]       = useState<PFPnLSummary | null>(null)
  const [portfolio, setPortfolio]   = useState<PFPortfolio | null>(null)
  const [txns, setTxns]             = useState<PFTransaction[]>([])
  const [loading, setLoading]       = useState(true)
  const [range, setRange]           = useState<'7d'|'30d'|'90d'|'all'>('all')
  const [showRealizedAll, setShowRealizedAll] = useState(false)

  const coinIds = Object.values(SYMBOL_TO_COINGECKO)
  const { prices } = usePrices(coinIds)

  useEffect(() => {
    Promise.all([
      fetchPnLSummary(),
      fetchPortfolio(),
      fetchTransactions({ limit: 200 }).then(r => r.transactions),
    ]).then(([s, p, t]) => {
      setSummary(s)
      setPortfolio(p)
      setTxns(t)
    }).finally(() => setLoading(false))
  }, [])

  // Compute live P&L from real portfolio + live prices + transaction history
  const liveAssets = useMemo(() => {
    if (!portfolio || !prices || Object.keys(prices).length === 0) return summary?.assets ?? []
    return computeUnrealizedPnL(portfolio.assets, txns, prices)
  }, [portfolio, prices, txns, summary])

  const liveTrades = useMemo(() => computeRealizedPnL(txns), [txns])

  const totalUnrealized = liveAssets.reduce((s, a) => s + a.unrealizedPnL, 0)
  const totalValue      = liveAssets.reduce((s, a) => s + a.currentValue, 0)
  const totalCost       = liveAssets.reduce((s, a) => s + a.totalCost, 0)
  const totalUnrPct     = totalCost > 0 ? (totalUnrealized / totalCost) * 100 : 0
  const totalRealized   = liveTrades.reduce((s, t) => s + t.realizedPnL, 0)
  const totalPnL        = totalUnrealized + totalRealized

  const visibleTrades = showRealizedAll ? liveTrades : liveTrades.slice(0, 5)

  function exportCSV() {
    const header = 'Asset,Amount,Avg Cost (USD),Current Price,Current Value,Unrealized P&L,Unrealized P&L %'
    const rows = liveAssets.map(a =>
      `"${a.symbol}","${a.amount}","$${a.avgCost.toFixed(4)}","$${a.currentPrice.toFixed(4)}","$${a.currentValue.toFixed(2)}","${fmtUsd(a.unrealizedPnL, true)}","${fmtPct(a.unrealizedPnLPct)}"`
    ).join('\n')
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv' })
    const el = document.createElement('a')
    el.href = URL.createObjectURL(blob)
    el.download = 'pnl_report.csv'
    el.click()
    toast.success('P&L report exported')
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '24px', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: TEAL, fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 4 }}>PALMFLOW AI / FINANCIAL TRACKER</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Profit & Loss</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED }}>Unrealized + realized gains across all holdings</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['7d','30d','90d','all'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: range === r ? 700 : 400, cursor: 'pointer',
              background: range === r ? `rgba(0,229,204,0.12)` : 'transparent',
              border: `1px solid ${range === r ? 'rgba(0,229,204,0.35)' : BDR}`,
              color: range === r ? TEAL : MUTED,
            }}>{r === 'all' ? 'All Time' : r}</button>
          ))}
          <button onClick={exportCSV} style={{
            padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: `rgba(0,229,204,0.08)`, border: `1px solid rgba(0,229,204,0.25)`, color: TEAL,
          }}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Summary KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Portfolio Value', value: loading ? '—' : `$${totalValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`, sub: 'live market value', color: TEAL },
          { label: 'Total Cost Basis',      value: loading ? '—' : `$${totalCost.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`, sub: 'what you paid',    color: 'rgba(255,255,255,0.7)' },
          { label: 'Unrealized P&L',        value: loading ? '—' : fmtUsd(totalUnrealized, true), sub: fmtPct(totalUnrPct),  color: pnlColor(totalUnrealized) },
          { label: 'Realized P&L',          value: loading ? '—' : fmtUsd(totalRealized, true),   sub: `${liveTrades.length} trades`, color: pnlColor(totalRealized) },
          { label: 'Total P&L',             value: loading ? '—' : fmtUsd(totalPnL, true),        sub: 'unrealized + realized', color: pnlColor(totalPnL) },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color, fontFamily: MONO }}>{k.value}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Unrealized P&L per asset */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Unrealized P&L by Asset</div>
          <span style={{ fontSize: 11, color: MUTED }}>Prices update every 60s via CoinGecko</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BDR}` }}>
                {['Asset', 'Holdings', 'Avg Cost', 'Current Price', 'Current Value', 'Cost Basis', 'Unrealized P&L', 'P&L %', 'Network'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: MUTED, fontSize: 12 }}>Loading positions…</td></tr>
              ) : liveAssets.map(a => (
                <tr key={a.symbol} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, display: 'inline-block', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.symbol}</div>
                        <div style={{ fontSize: 10, color: MUTED }}>{a.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO }}>{a.amount.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO, color: MUTED }}>
                    {a.isStable ? '$1.0000' : `$${a.avgCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO }}>
                    {a.isStable ? '$1.0000' : `$${a.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO, fontWeight: 600 }}>
                    ${a.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO, color: MUTED }}>
                    ${a.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO, fontWeight: 700, color: pnlColor(a.unrealizedPnL) }}>
                    {a.isStable ? '—' : fmtUsd(a.unrealizedPnL, true)}
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: MONO, color: pnlColor(a.unrealizedPnLPct) }}>
                    {a.isStable ? '—' : fmtPct(a.unrealizedPnLPct)}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: MUTED }}>{a.network}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Realized P&L trades */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Realized P&L — Trade History</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Gains/losses locked in from completed swaps</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: pnlColor(totalRealized), fontFamily: MONO }}>{fmtUsd(totalRealized, true)}</div>
            <div style={{ fontSize: 10, color: MUTED }}>total realized</div>
          </div>
        </div>

        {visibleTrades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: MUTED, fontSize: 13 }}>
            No completed swaps found — realized P&L appears when you sell or swap non-stable assets.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BDR}` }}>
                  {['Trade', 'Amount Sold', 'Cost Basis', 'Proceeds', 'Realized P&L', 'P&L %', 'Date', 'Network'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleTrades.map(t => (
                  <tr key={t.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ fontWeight: 600 }}>{t.fromAsset} → {t.toAsset}</div>
                      <div style={{ fontSize: 10, color: MUTED, fontFamily: MONO }}>{short(t.txHash)}</div>
                    </td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO }}>{t.fromAmount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {t.fromAsset}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO, color: MUTED }}>${t.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO }}>${t.proceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO, fontWeight: 700, color: pnlColor(t.realizedPnL) }}>{fmtUsd(t.realizedPnL, true)}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO, color: pnlColor(t.realizedPnLPct) }}>{fmtPct(t.realizedPnLPct)}</td>
                    <td style={{ padding: '10px 10px', color: MUTED, fontSize: 11 }}>{t.timestamp}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: MUTED }}>{t.network}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {liveTrades.length > 5 && (
          <button onClick={() => setShowRealizedAll(v => !v)} style={{
            marginTop: 12, width: '100%', padding: '8px', borderRadius: 8,
            background: 'transparent', border: `1px solid ${BDR}`, color: MUTED,
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>
            {showRealizedAll ? 'Show less' : `View all ${liveTrades.length} trades`}
          </button>
        )}
      </motion.div>

    </div>
  )
}
