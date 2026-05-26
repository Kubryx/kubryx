// Built by vsrupeshkumar
// Light-themed live stats ribbon for the landing page hero.
// Pulls real CoinGecko prices and Solana slot every few seconds so the very
// first thing a visitor sees is provably live data, not marketing copy.
'use client'

import { useEffect, useState } from 'react'
import { usePrices } from '@/hooks/usePrices'
import { useTrustMesh } from '@/hooks/useTrustMesh'

type Cell = {
  label: string
  value: string
  sub: string
  swatch: string
}

export default function LiveStatsStrip() {
  const { prices } = usePrices(['ethereum', 'solana', 'stellar', 'arbitrum', 'bitcoin'])
  const mesh = useTrustMesh()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4_000)
    return () => clearInterval(id)
  }, [])

  function fmt(usd: number | undefined, decimals = 2): string {
    if (!usd) return '—'
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }

  function change(c: number | undefined): { text: string; up: boolean } {
    if (c === undefined || c === null) return { text: '0.00%', up: true }
    return { text: `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`, up: c >= 0 }
  }

  const eth = prices.ethereum
  const sol = prices.solana
  const xlm = prices.stellar
  const arb = prices.arbitrum

  const cells: Cell[] = [
    { label: 'Solana Devnet', value: mesh.currentSlot > 0 ? `slot ${mesh.currentSlot.toLocaleString()}` : 'connecting…', sub: mesh.isLive ? `${mesh.jobs.length} on-chain jobs` : 'reconnecting', swatch: '#9945FF' },
    { label: 'ETH',           value: fmt(eth?.usd, 0), sub: change(eth?.change24h).text, swatch: '#6366F1' },
    { label: 'SOL',           value: fmt(sol?.usd, 2), sub: change(sol?.change24h).text, swatch: '#14F195' },
    { label: 'XLM',           value: fmt(xlm?.usd, 4), sub: change(xlm?.change24h).text, swatch: '#3B82F6' },
    { label: 'ARB',           value: fmt(arb?.usd, 3), sub: change(arb?.change24h).text, swatch: '#28A0F0' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      alignItems: 'stretch',
      flexWrap: 'wrap',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(15,23,42,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
    }}>
      <style>{`@keyframes lss-pulse { 0%{transform:translateX(-100%);opacity:1} 100%{transform:translateX(100%);opacity:0} }`}</style>

      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 130,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.8)' }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live</span>
      </div>

      {cells.map((c, i) => (
        <div key={c.label} style={{
          flex: 1,
          minWidth: 130,
          padding: '12px 18px',
          borderLeft: i > 0 ? '1px solid rgba(15,23,42,0.08)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <span
            key={tick + i}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: 2,
              background: c.swatch,
              animation: 'lss-pulse 1.6s ease-out',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.swatch }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(15,23,42,0.5)', textTransform: 'uppercase' }}>
              {c.label}
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0A0F2E', fontFamily: '"Fira Code","JetBrains Mono",monospace', letterSpacing: '-0.01em' }}>
            {c.value}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(15,23,42,0.55)', fontWeight: 500, marginTop: 2 }}>
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
