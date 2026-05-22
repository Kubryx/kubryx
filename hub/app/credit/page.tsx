'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  generateScore,
  fetchScoreBreakdown,
  predictScore,
  fetchOraclePrice,
  type NcBreakdown,
  type NcPrediction,
} from '../../lib/neurocredit-api'
import {
  getRating,
  fallbackBreakdown,
  SCENARIO_LABELS,
  SCENARIO_DESCRIPTIONS,
  type StakingTier,
} from '../../lib/neurocredit-fallbacks'
import {
  isMetaMaskInstalled,
  truncateAddress,
  WALLET_INSTALL_LINKS,
} from '../../lib/wallet-utils'
import { toast } from '../../lib/toast'
import { useWalletForTool } from '../../hooks/useWalletForTool'
import { useWallet } from '../../context/WalletContext'
import { ConnectButton } from '../../components/wallet/ConnectButton'

// ─── Gauge math ──────────────────────────────────────────────
const GAUGE_R = 90
const GAUGE_CX = 110
const GAUGE_CY = 110
const GAUGE_CIRC = 2 * Math.PI * GAUGE_R  // 565.49
const GAUGE_ARC = GAUGE_CIRC * 0.75       // 424.12

function gaugeLen(score: number) {
  return Math.max(0, Math.min((score / 1000) * GAUGE_ARC, GAUGE_ARC))
}

// ─── Sub-components ───────────────────────────────────────────
function CreditGauge({ score, loading }: { score: number; loading: boolean }) {
  const [animLen, setAnimLen] = useState(0)

  useEffect(() => {
    if (loading) { setAnimLen(0); return }
    const t = setTimeout(() => setAnimLen(gaugeLen(score)), 120)
    return () => clearTimeout(t)
  }, [score, loading])

  const { label, color } = getRating(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg viewBox="0 0 220 220" width={220} height={220}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5A623" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={16}
            strokeDasharray={`${GAUGE_ARC} 999`}
            strokeLinecap="round"
            transform={`rotate(135 ${GAUGE_CX} ${GAUGE_CY})`}
          />
          {/* Active arc */}
          <circle
            cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={16}
            strokeDasharray={`${animLen} 999`}
            strokeLinecap="round"
            transform={`rotate(135 ${GAUGE_CX} ${GAUGE_CY})`}
            filter="url(#gaugeGlow)"
            style={{ transition: 'stroke-dasharray 1.3s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {loading ? (
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(245, 166, 35, 0.2)',
                borderTop: '3px solid #F5A623',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : (
            <>
              <p style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, margin: 0, color: '#2D1A26', letterSpacing: '-2px', fontFamily: "'Syne', sans-serif" }}>
                {score}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(45,26,38,0.45)', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>/ 1000</p>
            </>
          )}
        </div>
      </div>

      {/* Rating badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '5px 16px',
          borderRadius: 20,
          background: `${color}18`,
          border: `1px solid ${color}45`,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ProgressBar({
  value,
  max,
  color,
  label,
  displayValue,
}: {
  value: number
  max: number
  color: string
  label: string
  displayValue: string
}) {
  const pct = Math.max(0, Math.min((value / max) * 100, 100))
  return (
    <div style={{ marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: 'rgba(45,26,38,0.6)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: '#2D1A26' }}>{displayValue}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(45,26,38,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 99,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}

// ─── Style helpers ───────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #FEF08A',
  borderRadius: 24,
  padding: '28px 24px',
  boxShadow: '0 4px 24px rgba(245, 166, 35, 0.05)',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
}

const btnPrimary: React.CSSProperties = {
  background: '#F5A623',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 9999,
  padding: '14px 32px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: '0 4px 14px rgba(245, 166, 35, 0.22)',
  transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
}

const btnOutline: React.CSSProperties = {
  background: 'transparent',
  color: '#2D1A26',
  border: '1px solid #F5A623',
  borderRadius: 9999,
  padding: '10px 24px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'transform 0.2s, background-color 0.2s',
}

// ─── Page ─────────────────────────────────────────────────────
export default function CreditDashboard() {
  // Wallet state now comes from the global wallet context.
  const { address, isConnected, expectedNetwork } = useWalletForTool()
  const { disconnectEVM } = useWallet()
  const wallet = address ?? ''

  const [score, setScore] = useState(650)
  const [explanation, setExplanation] = useState('Based on on-chain analysis')
  const [refreshTxHash, setRefreshTxHash] = useState('')
  const [breakdown, setBreakdown] = useState<NcBreakdown>(fallbackBreakdown)
  const [oraclePrice, setOraclePrice] = useState(2.45)
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  const [scenario, setScenario] = useState('')
  const [prediction, setPrediction] = useState<NcPrediction | null>(null)
  const [predicting, setPredicting] = useState(false)

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])

  useEffect(() => {
    setMounted(true)
    fetchOraclePrice().then(setOraclePrice)

    // Custom cursor mechanics
    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  // Smooth trail for cursor
  useEffect(() => {
    if (!mounted) return
    let animationFrameId: number
    const updateTrail = () => {
      setCursorTrail(prev => {
        const dx = cursorPos.x - prev.x
        const dy = cursorPos.y - prev.y
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18
        }
      })
      animationFrameId = requestAnimationFrame(updateTrail)
    }
    updateTrail()
    return () => cancelAnimationFrame(animationFrameId)
  }, [cursorPos, mounted])

  useEffect(() => {
    if (!wallet) {
      // Disconnected — reset back to demo defaults.
      setScore(650)
      setBreakdown(fallbackBreakdown)
      setRefreshTxHash('')
      setPrediction(null)
      setIsDemo(false)
      return
    }
    loadDashboard(wallet)
  }, [wallet])

  async function loadDashboard(addr: string) {
    setLoading(true)
    setError('')
    const [bd] = await Promise.all([
      fetchScoreBreakdown(addr),
      fetchOraclePrice().then(setOraclePrice),
    ])
    setBreakdown(bd)
    setScore(bd.score)
    setIsDemo(bd.score === fallbackBreakdown.score && bd.baseScore === fallbackBreakdown.baseScore)
    setLoading(false)
  }

  function disconnect() {
    disconnectEVM()
    toast.success('Wallet disconnected')
  }

  async function refreshScore() {
    if (!isConnected || !wallet) return
    setLoading(true)
    setRefreshTxHash('')
    setError('')
    const res = await generateScore(wallet)
    setScore(res.score)
    setExplanation(res.explanation || 'Based on on-chain analysis')
    if (res.transactionHash) setRefreshTxHash(res.transactionHash)
    setIsDemo(!res.transactionHash)
    // Also refresh breakdown
    const bd = await fetchScoreBreakdown(wallet)
    setBreakdown(bd)
    setLoading(false)
    toast.success(res.transactionHash ? 'Score refreshed on-chain' : 'Score refreshed (demo mode)')
  }

  async function runPredictor() {
    if (!scenario || !isConnected || !wallet) return
    setPredicting(true)
    setPrediction(null)
    const res = await predictScore(wallet, scenario as any)
    setPrediction(res)
    setPredicting(false)
  }

  const stakingTierLabel = (tier: StakingTier) => {
    if (tier === 'None') return 'None'
    return tier
  }

  // Float circles rendering helpers
  const floatingCircles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 26) + 8, // 8px - 34px
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 6) + 9, // 9s - 15s
      delay: Math.floor(Math.random() * 4),
      opacity: (Math.random() * 0.15 + 0.10).toFixed(2)
    }))
  }, [])

  return (
    <div className="premium-container">
      {/* Google Fonts Link */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500;600&family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />

      {/* Embedded Vanilla CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom Font Imports fallback */
        .premium-container {
          background-color: #FFFBF0;
          color: #2D1A26;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
          cursor: none;
        }

        /* ── Custom Cursor ── */
        .custom-cursor-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          background-color: #F5A623;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease-out;
        }
        .custom-cursor-ring {
          position: fixed;
          width: 24px;
          height: 24px;
          border: 1.5px solid #F5A623;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(245, 166, 35, 0.03);
        }
        a:hover ~ .custom-cursor-ring,
        button:hover ~ .custom-cursor-ring,
        input:hover ~ .custom-cursor-ring,
        select:hover ~ .custom-cursor-ring {
          width: 32px;
          height: 32px;
          border-color: #FBBF24;
          background-color: rgba(251, 191, 36, 0.08);
        }

        /* Hide cursor on mobile devices */
        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring {
            display: none !important;
          }
          .premium-container {
            cursor: auto !important;
          }
        }

        /* ── Floating Circles ── */
        .floating-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .float-bubble {
          position: absolute;
          background-color: #FEF08A;
          border-radius: 50%;
          animation: driftBubble linear infinite;
        }
        @keyframes driftBubble {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-30px) translateX(15px) rotate(120deg); }
          66% { transform: translateY(15px) translateX(-20px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }

        /* ── CSS Dot Grid Texture ── */
        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #FEF08A 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Global Layout Resets ── */
        header.nav-bar {
          background-color: #FFFFFF;
          border-bottom: 1px solid #FEF08A;
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-family: 'Dancing Script', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #2D1A26;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sparkle-icon {
          color: #F5A623;
          font-size: 14px;
        }

        /* ── Main Content ── */
        .main-content {
          padding: 60px 40px 100px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .header-box {
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .eyebrow {
          font-family: 'Dancing Script', cursive;
          color: #F5A623;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .title-syne {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 5vw, 48px);
          color: #2D1A26;
          font-weight: 700;
          line-height: 1.1;
          margin: 0;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .bento-card {
          background: #FFFFFF;
          border: 1px solid #FEF08A;
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 4px 24px rgba(245, 166, 35, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(245, 166, 35, 0.15);
        }

        .action-link-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: #FFFFFF;
          border: 1px solid #FEF08A;
          border-radius: 20px;
          margin-bottom: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .action-link-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(245, 166, 35, 0.1);
          border-color: #F5A623;
        }
      `}} />

      {mounted && (
        <>
          <div className="custom-cursor-dot" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }} />
          <div className="custom-cursor-ring" style={{ left: `${cursorTrail.x}px`, top: `${cursorTrail.y}px` }} />
        </>
      )}

      {/* Floating Background Effects */}
      <div className="dot-grid-overlay" />
      <div className="floating-container">
        {floatingCircles.map(circle => (
          <div
            key={circle.id}
            className="float-bubble"
            style={{
              width: circle.size,
              height: circle.size,
              left: `${circle.left}%`,
              top: `${circle.top}%`,
              animationDuration: `${circle.duration}s`,
              animationDelay: `${circle.delay}s`,
              opacity: circle.opacity,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <header className="nav-bar">
        <div className="nav-logo">
          Kubryx <span className="sparkle-icon">✦</span>
        </div>
        <div>
          <Link href="/dashboard" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: '#2D1A26',
            textDecoration: 'none',
          }}>
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        <div className="header-box">
          <div>
            <div className="eyebrow">On-Chain Identity</div>
            <h1 className="title-syne">Credit Passport</h1>
            <p style={{ color: 'rgba(45,26,38,0.6)', marginTop: 12, fontSize: 15 }}>
              Generate your on-chain credit score as a soulbound NFT.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 20,
              background: isDemo ? 'rgba(45,26,38,0.04)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${isDemo ? 'rgba(45,26,38,0.1)' : 'rgba(34,197,94,0.3)'}`,
              color: isDemo ? 'rgba(45,26,38,0.6)' : '#16A34A',
              display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDemo ? '#888' : '#16A34A', flexShrink: 0 }} />
              {isDemo ? 'Demo Mode' : 'Live Data'}
            </span>
            <span style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 20,
              background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
              color: '#B47814', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', flexShrink: 0 }} />
              QIE Mainnet
            </span>
          </div>
        </div>

        {/* ── No MetaMask ── */}
        {!installed && (
          <div className="bento-card" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <p style={{ color: 'rgba(45,26,38,0.7)', marginBottom: 16 }}>MetaMask is required to use Credit Passport.</p>
            <a href={WALLET_INSTALL_LINKS.metamask} target="_blank" rel="noopener noreferrer" style={btnPrimary}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = '#EAB308' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = '#F5A623' }}>
              Install MetaMask
            </a>
          </div>
        )}

        {/* ── Connect wallet ── */}
        {installed && !wallet && (
          <div className="bento-card" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,166,35,0.1)',
              border: '1px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: 32,
            }}>🧠</div>
            <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Connect your wallet</p>
            <p style={{ fontSize: 14, color: 'rgba(45,26,38,0.5)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
              Connect MetaMask on {expectedNetwork?.name ?? 'QIE Mainnet'} (Chain ID{' '}
              {expectedNetwork?.chainIdDecimal ?? 1990}) to generate your credit score.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ConnectButton type="evm" size="lg" />
            </div>
            {error && <p style={{ color: '#EF4444', marginTop: 12, fontSize: 13 }}>{error}</p>}
          </div>
        )}

        {/* ── Connected Dashboard ── */}
        {wallet && (
          <>
            {/* Wallet bar */}
            <div className="bento-card" style={{
              marginBottom: 24, display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px 24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#F5A623',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff'
                }}>👤</div>
                <span style={{ fontFamily: "monospace", fontSize: 14, color: '#2D1A26', fontWeight: 500 }}>
                  {truncateAddress(wallet)}
                </span>
              </div>
              <button onClick={disconnect} style={btnOutline}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'rgba(245,166,35,0.08)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent' }}>
                Disconnect
              </button>
            </div>

            {/* ── Main 2-col layout ── */}
            <div className="bento-grid" style={{ marginBottom: 24 }}>
              {/* Score Gauge panel */}
              <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <CreditGauge score={score} loading={loading} />
                <p style={{ fontSize: 14, color: 'rgba(45,26,38,0.6)', textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
                  {explanation}. Stake NCRD to boost your score further.
                </p>

                <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                  onClick={refreshScore} disabled={loading}
                  onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#EAB308' }}
                  onMouseLeave={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#F5A623' }}>
                  {loading ? 'Refreshing…' : '↻ Refresh Score'}
                </button>

                {refreshTxHash && (
                  <div style={{
                    width: '100%', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 12, padding: '12px 16px', fontSize: 12
                  }}>
                    <p style={{ color: '#16A34A', fontWeight: 600, margin: '0 0 6px' }}>On-chain Verified ✓</p>
                    <p style={{ fontFamily: 'monospace', color: 'rgba(45,26,38,0.6)', margin: 0, wordBreak: 'break-all' }}>
                      Tx: {refreshTxHash.slice(0, 18)}…{refreshTxHash.slice(-8)}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '🧠', title: 'Credit Passport', desc: 'Get personalized loan offers', href: '/credit/lend', accent: '#8B5CF6' },
                  { icon: '🛡', title: 'Stake NCRD', desc: 'Boost your credit score', href: '/credit/stake', accent: '#22C55E' },
                  { icon: '⚡', title: 'DeFi Demo', desc: 'See your borrowing power', href: '/credit/lending-demo', accent: '#F5A623' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="action-link-card">
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, background: `${item.accent}15`,
                      border: `1px solid ${item.accent}30`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 24, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: 15, color: item.accent }}>{item.title}</p>
                      <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.5)', margin: '4px 0 0' }}>{item.desc}</p>
                    </div>
                    <span style={{ color: 'rgba(45,26,38,0.2)', fontSize: 20 }}>→</span>
                  </Link>
                ))}

                {/* Bottom stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                  <div className="bento-card" style={{ padding: '20px', minHeight: 0 }}>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.5)', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 8px' }}>
                      ORACLE PRICE
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#3B82F6', margin: 0, fontFamily: "'Syne', sans-serif" }}>
                      ${oraclePrice.toFixed(2)}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.4)', margin: '4px 0 0' }}>QIE / USD</p>
                  </div>
                  <div className="bento-card" style={{ padding: '20px', minHeight: 0 }}>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.5)', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 8px' }}>
                      STAKING TIER
                    </p>
                    <p style={{
                        fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif", margin: 0,
                        color: breakdown.stakingTier === 'Gold' ? '#F5C518' : breakdown.stakingTier === 'Silver' ? '#9CA3AF' : breakdown.stakingTier === 'Bronze' ? '#F97316' : 'rgba(45,26,38,0.4)',
                      }}>
                      {stakingTierLabel(breakdown.stakingTier)}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.4)', margin: '6px 0 0' }}>
                      Boost: +{breakdown.stakingBoost}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Score Breakdown + Predictor row ── */}
            <div className="bento-grid">
              {/* Score Breakdown */}
              <div className="bento-card">
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#F5A623', margin: '0 0 24px' }}>
                  SCORE BREAKDOWN
                </p>
                <ProgressBar label="Base Score" value={breakdown.baseScore} max={1000} color="#2D1A26" displayValue={String(breakdown.baseScore)} />
                <ProgressBar label="Staking Boost" value={breakdown.stakingBoost} max={300} color="#16A34A" displayValue={`+${breakdown.stakingBoost}`} />
                <ProgressBar label="Oracle Penalty" value={breakdown.oraclePenalty} max={200} color="#EF4444" displayValue={breakdown.oraclePenalty === 0 ? '0' : `-${breakdown.oraclePenalty}`} />
                
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(45,26,38,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'rgba(45,26,38,0.5)', fontWeight: 500 }}>
                    {breakdown.baseScore} + {breakdown.stakingBoost} − {breakdown.oraclePenalty} =
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#F5A623', fontFamily: "'Syne', sans-serif" }}>{score}</span>
                </div>
                {breakdown.lastUpdated && (
                  <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.3)', marginTop: 12 }}>
                    Updated: {new Date(breakdown.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Score Predictor */}
              <div className="bento-card">
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#F5A623', margin: '0 0 24px' }}>
                  SCORE PREDICTOR
                </p>
                <div style={{ marginBottom: 16 }}>
                  <select value={scenario} onChange={(e) => { setScenario(e.target.value); setPrediction(null) }}
                    style={{
                      width: '100%', padding: '14px 16px', background: '#FFFBF0', border: '1px solid #FEF08A',
                      borderRadius: 12, color: scenario ? '#2D1A26' : 'rgba(45,26,38,0.4)', fontSize: 14,
                      cursor: 'pointer', appearance: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}>
                    <option value="" disabled>Select an action to simulate...</option>
                    {Object.entries(SCENARIO_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label} — {SCENARIO_DESCRIPTIONS[key]}</option>
                    ))}
                  </select>
                </div>

                <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: !scenario || predicting ? 0.6 : 1 }}
                  onClick={runPredictor} disabled={!scenario || predicting}
                  onMouseEnter={(e) => { if (!(!scenario || predicting)) (e.target as HTMLElement).style.backgroundColor = '#EAB308' }}
                  onMouseLeave={(e) => { if (!(!scenario || predicting)) (e.target as HTMLElement).style.backgroundColor = '#F5A623' }}>
                  {predicting ? 'Simulating…' : 'Predict Score Change'}
                </button>

                {prediction && (
                  <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: '20px' }}>
                    <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, margin: '0 0 12px' }}>
                      If you: {SCENARIO_LABELS[scenario]}
                    </p>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.5)', margin: '0 0 4px', fontWeight: 600 }}>Current</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#2D1A26', margin: 0, fontFamily: "'Syne', sans-serif" }}>{prediction.currentScore}</p>
                      </div>
                      <span style={{ fontSize: 24, color: 'rgba(45,26,38,0.2)' }}>→</span>
                      <div>
                        <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.5)', margin: '0 0 4px', fontWeight: 600 }}>Predicted</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: '#16A34A', margin: 0, fontFamily: "'Syne', sans-serif" }}>
                          {prediction.predictedScore}{' '}
                          <span style={{ fontSize: 15, fontWeight: 600 }}>
                            ({prediction.change >= 0 ? '+' : ''}{prediction.change})
                          </span>
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.6)', margin: 0, lineHeight: 1.5 }}>
                      {prediction.explanation}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.3)', margin: '12px 0 0', fontWeight: 500 }}>
                      Confidence: {Math.round(prediction.confidence * 100)}%
                    </p>
                  </div>
                )}

                {!prediction && !predicting && (
                  <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.4)', marginTop: 20, textAlign: 'center' }}>
                    Select a scenario to see how on-chain actions affect your QIE credit rating.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}
