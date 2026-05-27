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
import { WrongNetworkBanner } from '../../components/wallet/WrongNetwork'
import { readCreditScore, readPassportExists, readStakedAmount, readIntegrationTier } from '../../lib/contracts/creditPassport'
import { usePrices } from '../../hooks/usePrices'
import { useKubrykPlatform } from '../../context/KubrykPlatformContext'
import { getCreditTier, getVaultBoost, getStellarBoost, getTreasuryBoost } from '../../lib/platform/scoring'
import { PlatformModeBadge } from '../../components/ui/PlatformModeBadge'
import FeatureOverviewPanel from '../../components/ui/FeatureOverviewPanel'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CreditPassportVerifier from '../../components/credit/CreditPassportVerifier'

const historyData = [
  { month: 'Jan', score: 320 },
  { month: 'Feb', score: 450 },
  { month: 'Mar', score: 510 },
  { month: 'Apr', score: 580 },
  { month: 'May', score: 650 },
  { month: 'Jun', score: 650 },
]

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
  tooltip,
}: {
  value: number
  max: number
  color: string
  label: string
  displayValue: string
  tooltip?: string
}) {
  const pct = Math.max(0, Math.min((value / max) * 100, 100))
  return (
    <div style={{ marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }} title={tooltip}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: 'rgba(45,26,38,0.6)', cursor: tooltip ? 'help' : 'default' }}>{label}{tooltip && ' ⓘ'}</span>
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

// ─── Market context card (live ETH price) ───────────────────
function MarketCard() {
  const { prices, loading } = usePrices(['ethereum'])
  const eth = prices['ethereum']
  const change24h = eth ? (eth.change24h ?? 0) : 0
  const isZero = eth !== undefined && change24h === 0
  const up = change24h > 0

  return (
    <div className="bento-card" style={{
      marginBottom: 24, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'rgba(98,126,234,0.12)', border: '1px solid rgba(98,126,234,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>◆</div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(45,26,38,0.45)', margin: 0 }}>
            ETHEREUM · COLLATERAL &amp; GAS CONTEXT
          </p>
          {eth ? (
            <p style={{ fontSize: 20, fontWeight: 700, color: '#2D1A26', margin: '4px 0 0', fontFamily: "'Syne', sans-serif" }}>
              ${eth.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8, color: isZero ? 'rgba(45,26,38,0.4)' : up ? '#16A34A' : '#EF4444' }}>
                {isZero ? '→' : up ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}%
              </span>
            </p>
          ) : (
            <div className={loading ? 'skeleton-row' : ''} style={{
              height: 22, width: 140, borderRadius: 6,
              background: 'rgba(45,26,38,0.08)', marginTop: 6,
            }} />
          )}
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'rgba(45,26,38,0.4)' }}>
        Live market data · Updated every 60s
      </span>
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

  const platform = useKubrykPlatform()

  const [score, setScore] = useState(650)
  const [explanation, setExplanation] = useState('Based on on-chain analysis')
  const [refreshTxHash, setRefreshTxHash] = useState('')
  const [breakdown, setBreakdown] = useState<NcBreakdown>(fallbackBreakdown)
  const [oraclePrice, setOraclePrice] = useState(2.45)
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [privacyStrict, setPrivacyStrict] = useState(false)
  const [onChain, setOnChain] = useState(false)
  const [passportExists, setPassportExists] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [stakedAmount, setStakedAmount] = useState('0')
  const [integrationTier, setIntegrationTier] = useState(0)
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null)
  const [passportVerifiedAt, setPassportVerifiedAt] = useState<number | null>(null)
  const [, setRefreshTick] = useState(0)
  
  // Moralis NFT API Integration
  const [moralisNfts, setMoralisNfts] = useState<any[]>([])
  const [moralisVerified, setMoralisVerified] = useState<boolean>(false)
  const [moralisPassport, setMoralisPassport] = useState<any>(null)
  const [loadingMoralis, setLoadingMoralis] = useState<boolean>(false)

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
      setOnChain(false)
      setPassportExists(null)
      setStakedAmount('0')
      setIntegrationTier(0)
      setLastRefreshed(null)
      setPassportVerifiedAt(null)
      setMoralisNfts([])
      setMoralisVerified(false)
      setMoralisPassport(null)
      return
    }
    loadDashboard(wallet)
  }, [wallet])

  async function loadDashboard(addr: string) {
    setLoading(true)
    setError('')
    try {
      const [bd] = await Promise.all([
        fetchScoreBreakdown(addr),
        fetchOraclePrice().then(setOraclePrice),
      ])
      setBreakdown(bd)
      setScore(bd.score)
      setIsDemo(bd.score === fallbackBreakdown.score && bd.baseScore === fallbackBreakdown.baseScore)
      const [exists, staked, tier] = await Promise.all([
        readPassportExists(addr),
        readStakedAmount(addr),
        readIntegrationTier(addr),
      ])
      setPassportExists(exists)
      setStakedAmount(staked)
      setIntegrationTier(tier)
      if (exists) setPassportVerifiedAt(Date.now())
      const chainScore = exists ? await readCreditScore(addr) : 0
      if (chainScore > 0) {
        setScore(chainScore)
        setOnChain(true)
        platform.setCredit(chainScore)
      } else {
        setOnChain(false)
        platform.setCredit(bd.score)
      }
      setLastRefreshed(Date.now())

      // Fetch Moralis NFT verification info
      setLoadingMoralis(true)
      try {
        const mvRes = await fetch(`/api/verify-nft?address=${addr}`)
        if (mvRes.ok) {
          const mvData = await mvRes.json()
          setMoralisNfts(mvData.nfts || [])
          setMoralisVerified(mvData.verified)
          setMoralisPassport(mvData.creditPassport)
        }
      } catch (err) {
        console.error('Failed to load Moralis NFTs:', err)
      } finally {
        setLoadingMoralis(false)
      }
    } finally {
      setLoading(false)
    }
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
    try {
      const res = await generateScore(wallet)
      setScore(res.score)
      setExplanation(res.explanation || 'Based on on-chain analysis')
      if (res.transactionHash) setRefreshTxHash(res.transactionHash)
      setIsDemo(!res.transactionHash)
      const [bd, exists, staked, tier] = await Promise.all([
        fetchScoreBreakdown(wallet),
        readPassportExists(wallet),
        readStakedAmount(wallet),
        readIntegrationTier(wallet),
      ])
      setBreakdown(bd)
      setPassportExists(exists)
      setStakedAmount(staked)
      setIntegrationTier(tier)
      if (exists) setPassportVerifiedAt(Date.now())
      const chainScore = await readCreditScore(wallet)
      if (chainScore > 0) {
        setScore(chainScore)
        setOnChain(true)
      }
      setLastRefreshed(Date.now())

      // Refresh Moralis NFT verification info
      setLoadingMoralis(true)
      try {
        const mvRes = await fetch(`/api/verify-nft?address=${wallet}`)
        if (mvRes.ok) {
          const mvData = await mvRes.json()
          setMoralisNfts(mvData.nfts || [])
          setMoralisVerified(mvData.verified)
          setMoralisPassport(mvData.creditPassport)
        }
      } catch (err) {
        console.error('Failed to refresh Moralis NFTs:', err)
      } finally {
        setLoadingMoralis(false)
      }

      toast.success(res.transactionHash ? 'Score refreshed on-chain' : 'Score refreshed (demo mode)')
    } finally {
      setLoading(false)
    }
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

  const TIER_NAMES: Record<number, string> = { 0: 'None', 1: 'Bronze', 2: 'Silver', 3: 'Gold' }
  const TIER_COLORS: Record<number, { bg: string; color: string; border: string }> = {
    0: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.3)' },
    1: { bg: 'rgba(245,158,11,0.1)', color: '#B45309', border: 'rgba(245,158,11,0.3)' },
    2: { bg: 'rgba(156,163,175,0.15)', color: '#6B7280', border: 'rgba(156,163,175,0.4)' },
    3: { bg: 'rgba(234,179,8,0.1)', color: '#A16207', border: 'rgba(234,179,8,0.35)' },
  }

  useEffect(() => {
    if (!lastRefreshed) return
    const id = setInterval(() => setRefreshTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [lastRefreshed])

  function secsAgo(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
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
          cursor: auto;
        }

        /* ── Custom Cursor ── */
        .custom-cursor-dot {
          display: none !important;
        }
        .custom-cursor-ring {
          display: none !important;
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

      <WrongNetworkBanner />

      {/* Main Container */}
      <main className="main-content">
        <div className="header-box">
          <div>
            <div className="page-eyebrow" style={{ justifyContent: 'flex-start', margin: '0 0 8px 0' }}>On-Chain Identity</div>
            <h1 className="page-title" style={{ textAlign: 'left', margin: 0 }}>Credit Passport</h1>
            <p className="page-subtitle" style={{ textAlign: 'left', margin: '12px 0 0 0', color: 'rgba(45,26,38,0.6)' }}>
              Generate your on-chain credit score as a soulbound NFT.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={isDemo ? 'badge-demo' : 'badge-live'}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isDemo ? '#f59e0b' : '#10b981', flexShrink: 0 }} />
              {isDemo ? 'Testnet Data' : 'Live Data'}
            </span>
            <span style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 20,
              background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)',
              color: '#B47814', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', flexShrink: 0 }} />
              QIE Mainnet
            </span>
            {onChain && (
              <span style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 20,
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
                color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                On-chain
              </span>
            )}
          </div>
        </div>

        {/* ── Platform Unlocks — cross-module benefits from this score ── */}
        {(() => {
          const tier = getCreditTier(score)
          const vBoost = getVaultBoost(platform.vaultActive)
          const sBoost = getStellarBoost(platform.stellarPayments)
          const tBoost = getTreasuryBoost(platform.treasuryValue)
          const totalBoost = vBoost + sBoost + tBoost
          return (
            <div style={{ marginBottom: 32, padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(45,26,38,0.08)', backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(45,26,38,0.4)', textTransform: 'uppercase' }}>Kubryx Platform Unlocks</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color }}>
                  {tier.name} Tier — {score}/1000
                </span>
                <PlatformModeBadge />
                {totalBoost > 0 && (
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 10px', borderRadius: 20 }}>
                    +{totalBoost} pts from platform activity
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                {[
                  { icon: '◎', label: 'AI Lending',    value: `${tier.lendingRate}% APR`,         sub: 'Your personalised rate',         color: '#F59E0B' },
                  { icon: '🔐', label: 'Private Vault', value: `${tier.vaultLTV}% LTV`,            sub: 'Max loan-to-value ratio',         color: '#14B8A6' },
                  { icon: '◇', label: 'Treasury Tier', value: tier.treasuryTier,                  sub: 'AI agent routing priority',       color: '#10B981' },
                  { icon: '◆', label: 'Bill Split',    value: tier.splitTrust,                    sub: 'Escrow & settlement speed',        color: '#3B82F6' },
                ].map(u => (
                  <div key={u.label} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(45,26,38,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{u.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: u.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{u.label}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(45,26,38,0.85)', marginBottom: 2 }}>{u.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(45,26,38,0.4)' }}>{u.sub}</div>
                  </div>
                ))}
              </div>
              {totalBoost > 0 && (
                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {vBoost > 0 && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', color: '#0D9488', fontWeight: 600 }}>🔐 Vault active +{vBoost} pts</span>}
                  {sBoost > 0 && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#2563EB', fontWeight: 600 }}>◆ {platform.stellarPayments} Stellar payments +{sBoost} pts</span>}
                  {tBoost > 0 && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontWeight: 600 }}>◇ Treasury ${(platform.treasuryValue ?? 0).toLocaleString()} +{tBoost} pts</span>}
                </div>
              )}
            </div>
          )
        })()}

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

            {/* No on-chain passport yet for this wallet */}
            {passportExists === false && !moralisVerified && (
              <div className="bento-card" style={{
                marginBottom: 24, padding: '24px 28px',
                background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.3)',
                borderLeft: '4px solid #F5A623',
                display: 'flex', alignItems: 'flex-start', gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: 'rgba(245,166,35,0.12)',
                  border: '1px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>📄</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#B47814', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>
                    No Credit Passport Found
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.65)', margin: 0, lineHeight: 1.7, maxWidth: 560 }}>
                    Your wallet does not yet have a Credit Passport NFT minted on QIE Mainnet.
                    Passports are issued by the Kubryx backend after sufficient on-chain activity is detected —
                    the score shown below is a <strong>demo preview</strong> until your passport is minted.
                    Interact with QIE Mainnet DeFi protocols to become eligible.
                  </p>
                </div>
              </div>
            )}

            {/* On-chain passport confirmed */}
            {(passportExists === true || moralisVerified === true) && (
              <div className="bento-card" style={{
                marginBottom: 24, padding: '14px 20px',
                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>Credit Passport Active</span>
                  <span style={{ fontSize: 12, color: 'rgba(45,26,38,0.4)', marginLeft: 10 }}>
                    {moralisVerified ? 'Verified on-chain via Moralis NFT API ✓' : 'On-chain ✓ · Verified ' + (passportVerifiedAt ? secsAgo(passportVerifiedAt) : '')}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 99,
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                  color: '#16A34A', fontWeight: 700, letterSpacing: '0.04em',
                }}>SOULBOUND NFT</span>
              </div>
            )}

            {/* Credit Passport Verifier (Prompt 2) */}
            {wallet && <CreditPassportVerifier walletAddress={wallet} />}

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
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Refreshing…
                    </span>
                  ) : '↻ Refresh Score'}
                </button>
                {lastRefreshed && (
                  <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.4)', margin: '6px 0 0', textAlign: 'center' }}>
                    Last refreshed: {secsAgo(lastRefreshed)}
                  </p>
                )}

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
                  { icon: '🛡', title: 'Stake NCRD', desc: 'Boost your credit score', href: '/credit/stake', accent: '#22C55E', tooltip: 'NCRD token not yet deployed — transactions will fail' },
                  { icon: '⚡', title: 'DeFi Demo', desc: 'See your borrowing power', href: '/credit/lending-demo', accent: '#F5A623' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="action-link-card" title={'tooltip' in item ? item.tooltip : undefined}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, background: `${item.accent}15`,
                      border: `1px solid ${item.accent}30`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 24, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: 15, color: item.accent }}>{item.title}{'tooltip' in item && <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.6 }}>⚠</span>}</p>
                      <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.5)', margin: '4px 0 0' }}>{item.desc}</p>
                    </div>
                    <span style={{ color: 'rgba(45,26,38,0.2)', fontSize: 20 }}>→</span>
                  </Link>
                ))}

                {/* Bottom stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                  <div className="bento-card" style={{ padding: '20px', minHeight: 0 }}>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.5)', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 8px' }}>
                      STAKED NCRD
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: stakedAmount === '0' || stakedAmount === '0.00' ? 'rgba(45,26,38,0.3)' : '#16A34A', margin: 0, fontFamily: "'Syne', sans-serif" }}>
                      {stakedAmount === '0' || stakedAmount === '0.00' ? '—' : stakedAmount}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.4)', margin: '4px 0 0' }}>
                      {stakedAmount === '0' || stakedAmount === '0.00' ? 'No tokens staked yet' : 'NCRD tokens'}
                    </p>
                  </div>
                  <div className="bento-card" style={{ padding: '20px', minHeight: 0 }}>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.5)', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 10px' }}>
                      INTEGRATION TIER
                    </p>
                    <span style={{
                      display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                      background: TIER_COLORS[integrationTier]?.bg,
                      color: TIER_COLORS[integrationTier]?.color,
                      border: `1px solid ${TIER_COLORS[integrationTier]?.border}`,
                    }}>
                      {TIER_NAMES[integrationTier] ?? 'None'}
                    </span>
                    <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.4)', margin: '6px 0 0' }}>
                      Boost: +{breakdown.stakingBoost ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Live market context ── */}
            <MarketCard />

            {/* ── Score Breakdown + Predictor row ── */}
            <div className="bento-grid">
              {/* Score Breakdown */}
              <div className="bento-card">
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#F5A623', margin: '0 0 24px' }}>
                  SCORE BREAKDOWN
                </p>
                <ProgressBar label="Base Score" value={breakdown.baseScore ?? 0} max={1000} color="#2D1A26" displayValue={String(breakdown.baseScore ?? 0)} tooltip="Your foundational score derived from on-chain activity including transaction volume, wallet age, and DeFi interactions." />
                <ProgressBar label="Staking Boost" value={breakdown.stakingBoost ?? 0} max={300} color="#16A34A" displayValue={`+${breakdown.stakingBoost ?? 0}`} tooltip="Bonus points earned by staking NCRD tokens. Higher stake = higher boost (max +300). Encourages long-term protocol participation." />
                <ProgressBar label="Oracle Penalty" value={breakdown.oraclePenalty ?? 0} max={200} color="#EF4444" displayValue={(breakdown.oraclePenalty ?? 0) === 0 ? '0' : `-${breakdown.oraclePenalty ?? 0}`} tooltip="Deduction applied when the QIE oracle price is below threshold or when anomalous on-chain behavior is detected." />

                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(45,26,38,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'rgba(45,26,38,0.5)', fontWeight: 500 }}>
                    {breakdown.baseScore ?? 0} + {breakdown.stakingBoost ?? 0} − {breakdown.oraclePenalty ?? 0} =
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

              {/* Historical Growth Chart */}
              <div className="bento-card" style={{ gridColumn: '1 / -1' }}>
                 <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#F5A623', margin: '0 0 16px' }}>
                  HISTORICAL CREDIT GROWTH
                </p>
                <div style={{ height: 200, width: '100%', marginLeft: -10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F5A623" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="rgba(45,26,38,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#FFFBF0', border: '1px solid #FEF08A', borderRadius: 8, fontSize: 13, color: '#2D1A26', fontWeight: 600 }}
                        itemStyle={{ color: '#F5A623' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#F5A623" fillOpacity={1} fill="url(#colorCredit)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bento-card" style={{ gridColumn: '1 / -1', background: 'rgba(245,166,35,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#F5A623', margin: '0 0 8px' }}>
                      ON-CHAIN PRIVACY PREFERENCES
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.6)', margin: 0, maxWidth: 600 }}>
                      Control which external chains the oracle is allowed to scan to generate your base score. 
                      Enabling strict mode masks your secondary wallet histories.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setPrivacyStrict(!privacyStrict); toast.success(`Privacy set to ${!privacyStrict ? 'Strict' : 'Public'}`) }}
                    style={{
                      background: privacyStrict ? '#16A34A' : '#E5E7EB',
                      border: 'none',
                      borderRadius: 999,
                      width: 52, height: 28,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: privacyStrict ? 26 : 2,
                      width: 24, height: 24, background: '#fff', borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'left 0.3s'
                    }} />
                  </button>
                </div>
              </div>

              {/* Verified Digital Identity (Moralis Web3 NFT API) */}
              <div className="bento-card" style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: '#F5A623', margin: '0 0 4px', textTransform: 'uppercase' }}>
                      Verified On-Chain Digital Identity
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.5)', margin: 0 }}>
                      Pulls and verifies Soulbound NFTs & digital assets via live Moralis Web3 NFT API across Arbitrum, Polygon, and Ethereum.
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '4px 12px', borderRadius: 20,
                    background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                    color: '#B47814', fontWeight: 600
                  }}>
                    Moralis Live Integration
                  </span>
                </div>

                {loadingMoralis ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ height: 160, borderRadius: 16, background: 'rgba(45,26,38,0.03)', border: '1px solid rgba(45,26,38,0.05)', animation: 'pulse 1.5s infinite' }} />
                    ))}
                  </div>
                ) : moralisNfts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(45,26,38,0.02)', borderRadius: 16, border: '1px dashed rgba(45,26,38,0.1)' }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>🖼️</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(45,26,38,0.6)', margin: '0 0 4px' }}>No NFTs Found</p>
                    <p style={{ fontSize: 12, color: 'rgba(45,26,38,0.4)', margin: 0 }}>No external digital identity NFTs found on Arbitrum, Polygon, or Ethereum for this wallet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {moralisNfts.map((nft, idx) => (
                      <div key={idx} style={{
                        borderRadius: 16, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(45,26,38,0.06)',
                        padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s',
                        cursor: 'default', backdropFilter: 'blur(4px)'
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#F5A623'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,26,38,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                        <div style={{
                          height: 120, borderRadius: 10, background: 'rgba(45,26,38,0.04)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
                        }}>
                          {nft.image ? (
                            <img src={nft.image} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none' }} />
                          ) : (
                            <span style={{ fontSize: 32 }}>🎫</span>
                          )}
                          <span style={{
                            position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700,
                            padding: '3px 8px', borderRadius: 20, background: 'rgba(45,26,38,0.8)', color: '#fff',
                            letterSpacing: '0.04em'
                          }}>
                            {nft.chainName}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#2D1A26', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {nft.name}
                          </p>
                          <p style={{ fontSize: 11, color: 'rgba(45,26,38,0.4)', margin: '0 0 6px', fontWeight: 600 }}>
                            {nft.symbol} #{nft.tokenId.length > 8 ? nft.tokenId.slice(0, 6) + '...' : nft.tokenId}
                          </p>
                          <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(45,26,38,0.35)', margin: 0, wordBreak: 'break-all' }}>
                            {nft.tokenAddress.slice(0, 6)}...{nft.tokenAddress.slice(-4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
      <FeatureOverviewPanel 
        title="Credit Passport"
        whatItIs="A decentralized reputation scoring registry. It aggregates a user's cross-chain transaction history, staking records, and vault balances to mint a Soulbound NFT (SB-NFT) on QIE Mainnet representing their creditworthiness."
        whyUseIt="In Web3, lending is almost entirely over-collateralized (e.g., you must deposit $150 to borrow $100) because there is no identity or credit mechanism. The Credit Passport allows users to leverage their historical reputation to unlock under-collateralized loans."
        whyEfficient="<ul><li><b>Rolling Score Estimator</b>: The client computes score projections locally before dispatching the on-chain minting tx, saving gas costs.</li><li><b>Dynamic Tiering</b>: The UI automatically shifts colors and badges based on the active score tier, providing instant user feedback.</li></ul>"
        whyBest="It is not just a static badge. The Credit Passport <b>actively unlocks benefits across other Kubryx modules</b>, including lower AI Lending APRs, higher Privacy Vault LTVs, and priority Treasury routing."
        themeColor="#F5A623"
      />
    </div>
  )
}
