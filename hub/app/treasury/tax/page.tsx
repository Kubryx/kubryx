// Built by vsrupeshkumar
'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { fetchTransactions, fetchTaxSummary } from '@/lib/palmflow-api'
import type { PFTaxSummary, PFTaxLot } from '@/lib/palmflow-api'
import { computeTaxLots } from '@/lib/portfolio/tracker'

const TEAL  = '#00E5CC'
const BG    = '#080810'
const CARD  = 'rgba(255,255,255,0.03)'
const BDR   = 'rgba(255,255,255,0.07)'
const MONO  = '"JetBrains Mono","Fira Code",monospace'
const GRN   = '#22C55E'
const RED   = '#EF4444'
const GOLD  = '#F59E0B'
const MUTED = 'rgba(255,255,255,0.4)'

const CURRENT_YEAR = new Date().getFullYear()

function fmtUsd(n: number, signed = false) {
  const abs = Math.abs(n)
  const str = `$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (!signed) return str
  return n >= 0 ? `+${str}` : `-${str}`
}

function gainColor(n: number) {
  return n > 0 ? GRN : n < 0 ? RED : MUTED
}

function termBadge(isLongTerm: boolean) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700,
      background: isLongTerm ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
      color: isLongTerm ? GRN : GOLD,
      border: `1px solid ${isLongTerm ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
    }}>
      {isLongTerm ? 'Long-term' : 'Short-term'}
    </span>
  )
}

type SummaryCardProps = { label: string; value: string; sub: string; color: string; note?: string }
function SummaryCard({ label, value, sub, color, note }: SummaryCardProps) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: MONO }}>{value}</div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>{sub}</div>
      {note && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

export default function TaxPage() {
  const [summary, setSummary] = useState<PFTaxSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear]       = useState(CURRENT_YEAR)
  const [filter, setFilter]   = useState<'all'|'short'|'long'>('all')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchTaxSummary(year),
      fetchTransactions({ limit: 500 }).then(r => r.transactions),
    ]).then(([s, txns]) => {
      const liveLots = computeTaxLots(txns)
      if (liveLots.length > 0) {
        const shortGain  = liveLots.filter(l => !l.isLongTerm && l.gain > 0).reduce((a, l) => a + l.gain, 0)
        const shortLoss  = liveLots.filter(l => !l.isLongTerm && l.gain < 0).reduce((a, l) => a + l.gain, 0)
        const longGain   = liveLots.filter(l =>  l.isLongTerm && l.gain > 0).reduce((a, l) => a + l.gain, 0)
        const longLoss   = liveLots.filter(l =>  l.isLongTerm && l.gain < 0).reduce((a, l) => a + l.gain, 0)
        setSummary({
          ...s,
          shortTermGain:  shortGain,
          shortTermLoss:  Math.abs(shortLoss),
          longTermGain:   longGain,
          longTermLoss:   Math.abs(longLoss),
          netShortTerm:   shortGain + shortLoss,
          netLongTerm:    longGain  + longLoss,
          netCapitalGain: shortGain + shortLoss + longGain + longLoss,
          lots: liveLots as PFTaxLot[],
        })
      } else {
        setSummary(s)
      }
    }).finally(() => setLoading(false))
  }, [year])

  const lots = useMemo(() => {
    if (!summary) return []
    let list = summary.lots
    if (filter === 'short') list = list.filter(l => !l.isLongTerm)
    if (filter === 'long')  list = list.filter(l =>  l.isLongTerm)
    return list
  }, [summary, filter])

  const visibleLots = showAll ? lots : lots.slice(0, 10)

  function exportCSV() {
    if (!summary) return
    const header = 'Asset,Buy Date,Sell Date,Amount,Cost Basis,Proceeds,Gain/Loss,Holding Days,Term,Tx Hash,Network'
    const rows = summary.lots.map(l =>
      `"${l.asset}","${l.buyDate}","${l.sellDate}","${l.amount}","$${l.costBasis.toFixed(2)}","$${l.proceeds.toFixed(2)}","${fmtUsd(l.gain, true)}","${l.holdingDays}","${l.isLongTerm ? 'Long-term' : 'Short-term'}","${l.txHash}","${l.network}"`
    ).join('\n')
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv' })
    const el = document.createElement('a')
    el.href = URL.createObjectURL(blob)
    el.download = `tax_report_${year}.csv`
    el.click()
    toast.success(`Tax report ${year} exported`)
  }

  const s = summary

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '24px', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: TEAL, fontFamily: MONO, letterSpacing: '0.1em', marginBottom: 4 }}>PALMFLOW AI / FINANCIAL TRACKER</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Tax Report</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: MUTED }}>FIFO capital gains/losses — short-term and long-term</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => (
            <button key={y} onClick={() => setYear(y)} style={{
              padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: year === y ? 700 : 400, cursor: 'pointer',
              background: year === y ? `rgba(0,229,204,0.12)` : 'transparent',
              border: `1px solid ${year === y ? 'rgba(0,229,204,0.35)' : BDR}`,
              color: year === y ? TEAL : MUTED,
            }}>{y}</button>
          ))}
          <button onClick={exportCSV} disabled={loading} style={{
            padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: `rgba(0,229,204,0.08)`, border: `1px solid rgba(0,229,204,0.25)`, color: TEAL,
            opacity: loading ? 0.5 : 1,
          }}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SummaryCard label="Net Capital Gain" value={loading ? '—' : fmtUsd(s?.netCapitalGain ?? 0, true)} sub={`Tax year ${year}`} color={gainColor(s?.netCapitalGain ?? 0)} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SummaryCard label="Short-term Gain" value={loading ? '—' : fmtUsd(s?.netShortTerm ?? 0, true)} sub="≤ 365 days · taxed as income" color={gainColor(s?.netShortTerm ?? 0)} note="Subject to ordinary income tax rates" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SummaryCard label="Long-term Gain" value={loading ? '—' : fmtUsd(s?.netLongTerm ?? 0, true)} sub="> 365 days · preferred rate" color={gainColor(s?.netLongTerm ?? 0)} note="0%, 15%, or 20% depending on income" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SummaryCard label="Total Tax Lots" value={loading ? '—' : String(s?.lots.length ?? 0)} sub="FIFO matched disposals" color={TEAL} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SummaryCard label="Total Proceeds" value={loading ? '—' : fmtUsd((s?.lots ?? []).reduce((a, l) => a + l.proceeds, 0))} sub="sum of all disposals" color="rgba(255,255,255,0.7)" />
        </motion.div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 11, color: 'rgba(245,158,11,0.8)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
        <span>This report is for informational purposes only and is not tax advice. Consult a qualified tax professional. Crypto tax rules vary by jurisdiction. This uses FIFO cost-basis accounting.</span>
      </div>

      {/* Tax Lots Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Capital Gains / Loss Lots — {year}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all','short','long'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 10, fontWeight: filter === f ? 700 : 400, cursor: 'pointer',
                background: filter === f ? `rgba(0,229,204,0.12)` : 'transparent',
                border: `1px solid ${filter === f ? 'rgba(0,229,204,0.35)' : BDR}`,
                color: filter === f ? TEAL : MUTED,
              }}>
                {f === 'all' ? 'All' : f === 'short' ? 'Short-term' : 'Long-term'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: MUTED, fontSize: 13 }}>Loading tax lots…</div>
        ) : lots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: MUTED, fontSize: 13 }}>
            No taxable events found for {year}. Taxable events are triggered when you sell or swap non-stable assets.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BDR}` }}>
                  {['Asset', 'Amount', 'Buy Date', 'Sell Date', 'Days Held', 'Term', 'Cost Basis', 'Proceeds', 'Gain / Loss', 'G/L %', 'Network'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleLots.map(lot => (
                  <tr key={lot.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '10px 10px', fontWeight: 700 }}>{lot.asset}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO }}>{lot.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
                    <td style={{ padding: '10px 10px', color: MUTED, fontSize: 11 }}>{lot.buyDate}</td>
                    <td style={{ padding: '10px 10px', color: MUTED, fontSize: 11 }}>{lot.sellDate}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO }}>{lot.holdingDays}d</td>
                    <td style={{ padding: '10px 10px' }}>{termBadge(lot.isLongTerm)}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO, color: MUTED }}>${lot.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO }}>${lot.proceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO, fontWeight: 700, color: gainColor(lot.gain) }}>{fmtUsd(lot.gain, true)}</td>
                    <td style={{ padding: '10px 10px', fontFamily: MONO, color: gainColor(lot.gainPct) }}>{lot.gainPct >= 0 ? '+' : ''}{lot.gainPct.toFixed(1)}%</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: MUTED }}>{lot.network}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lots.length > 10 && (
          <button onClick={() => setShowAll(v => !v)} style={{
            marginTop: 12, width: '100%', padding: '8px', borderRadius: 8,
            background: 'transparent', border: `1px solid ${BDR}`, color: MUTED,
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>
            {showAll ? 'Show less' : `View all ${lots.length} lots`}
          </button>
        )}
      </motion.div>

    </div>
  )
}
