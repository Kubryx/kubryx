'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWalletForTool } from '@/hooks/useWalletForTool'
import { ConnectButton } from '@/components/wallet/ConnectButton'

// Child components that handle the actual logic and forms
import LendDashboard from '@/components/lend/LendDashboard'
import LoanPortfolio from '@/components/lend/LoanPortfolio'
import BorrowForm from '@/components/lend/BorrowForm'
import LendForm from '@/components/lend/LendForm'
import LendMarkets from '@/components/lend/LendMarkets'

export type LendTabId = 'dashboard' | 'loans' | 'borrow' | 'lend' | 'markets'

const apiBase = process.env.NEXT_PUBLIC_LENDORA_URL || process.env.NEXT_PUBLIC_LENDORA_API || ''
const VALID: LendTabId[] = ['dashboard', 'loans', 'borrow', 'lend', 'markets']

function CountUp({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const duration = 1200
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress * (2 - progress)
      setVal(Math.floor(ease * end))
      if (progress < 1) requestAnimationFrame(animate)
      else setVal(end)
    }
    requestAnimationFrame(animate)
  }, [end])
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>
}

function CountUpDecimal({ end, decimals = 1, prefix = '', suffix = '' }: { end: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const duration = 1200
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress * (2 - progress)
      setVal(ease * end)
      if (progress < 1) requestAnimationFrame(animate)
      else setVal(end)
    }
    requestAnimationFrame(animate)
  }, [end])
  return <span>{prefix}{val.toFixed(decimals)}{suffix}</span>
}

function SectionDivider({ bg = '#EEF2FF' }: { bg?: string }) {
  return (
    <div className="section-divider">
      <div className="divider-line" />
      <div className="divider-star-container" style={{ backgroundColor: bg }}>
        <span className="divider-star">✧</span>
      </div>
    </div>
  )
}

function LendInner() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = (params.get('tab') as LendTabId) || 'dashboard'
  const [tab, setTab] = useState<LendTabId>(VALID.includes(initial) ? initial : 'dashboard')
  // Wallet state now comes from the global wallet context.
  const { address, isConnected, connect } = useWalletForTool()
  const wallet = address ?? ''
  const [isLive, setIsLive] = useState(false)
  const [prefillAsset, setPrefillAsset] = useState<string | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  // Custom Cursor
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  useEffect(() => {
    setMounted(true)
    if (!apiBase) return
    fetch(`${apiBase}/health`).then(r => r.ok && r.json()).then(d => setIsLive(d?.status === 'ok')).catch(() => {})

    const moveCursor = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  useEffect(() => {
    if (!mounted) return
    let animationFrameId: number
    const updateTrail = () => {
      setCursorTrail(prev => {
        const dx = cursorPos.x - prev.x
        const dy = cursorPos.y - prev.y
        return { x: prev.x + dx * 0.18, y: prev.y + dy * 0.18 }
      })
      animationFrameId = requestAnimationFrame(updateTrail)
    }
    updateTrail()
    return () => cancelAnimationFrame(animationFrameId)
  }, [cursorPos, mounted])

  useEffect(() => {
    router.replace(tab === 'dashboard' ? '/lend' : `/lend?tab=${tab}`, { scroll: false })
  }, [tab, router])

  // Floating circles mapping for background
  const floatingCircles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 30) + 12,
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 8) + 10,
      delay: Math.floor(Math.random() * 5),
      opacity: (Math.random() * 0.15 + 0.05).toFixed(2)
    }))
  }, [])

  const TABS = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'markets', label: 'Markets' },
    { id: 'loans', label: 'My Loans' },
    { id: 'borrow', label: 'Borrow' },
    { id: 'lend', label: 'Supply' }
  ] as const;

  return (
    <div className="lend-container">
      {/* Google Fonts Link */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&family=Fira+Code:wght@400&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        .lend-container {
          background-color: #EEF2FF;
          color: #1E1B4B;
          font-family: 'Outfit', sans-serif;
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
          background-color: #6366F1;
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
          border: 1.5px solid #6366F1;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(99, 102, 241, 0.03);
        }
        a:hover ~ .custom-cursor-ring,
        button:hover ~ .custom-cursor-ring,
        input:hover ~ .custom-cursor-ring {
          width: 32px;
          height: 32px;
          border-color: #4F46E5;
          background-color: rgba(79, 70, 229, 0.08);
        }

        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring { display: none !important; }
          .lend-container { cursor: auto !important; }
        }

        /* ── Floating Background Elements ── */
        .floating-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .float-bubble {
          position: absolute;
          background: linear-gradient(135deg, #818CF8, #6366F1);
          border-radius: 50%;
          animation: driftBubble linear infinite;
        }
        @keyframes driftBubble {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-40px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(20px) translateX(-30px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }
        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #818CF8 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }
        .stripe-bg {
          background-image: repeating-linear-gradient(45deg, #C7D2FE 0px, #C7D2FE 1px, transparent 1px, transparent 12px);
          opacity: 0.2;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* ── Navbar ── */
        .nav-bar {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #E0E7FF;
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 600;
          color: #312E81;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sparkle-icon { color: #6366F1; font-size: 16px; }
        
        .btn-pill-brand {
          background-color: #6366F1;
          color: #FFFFFF;
          border: none;
          padding: 10px 24px;
          border-radius: 9999px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
        }
        .btn-pill-brand:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
          background-color: #4F46E5;
        }

        /* ── Hero Section ── */
        .hero-section {
          padding: 100px 20px 80px 20px;
          text-align: center;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #6366F1;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .hero-title {
          font-size: clamp(48px, 6vw, 72px);
          color: #1E1B4B;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          max-width: 900px;
          letter-spacing: -0.02em;
        }
        .hero-title span { color: #6366F1; }
        .hero-subtext {
          font-size: 18px;
          line-height: 1.6;
          color: #4338CA;
          max-width: 600px;
          margin-bottom: 40px;
          font-weight: 400;
        }

        /* ── Bento Stats ── */
        .stats-grid-container {
          padding: 0 40px 60px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-card {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.6);
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
          backdrop-filter: blur(12px);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
        }
        .stat-card.style-1 { background: rgba(255, 255, 255, 0.8); }
        .stat-card.style-2 { background: linear-gradient(135deg, rgba(224, 231, 255, 0.8), rgba(255, 255, 255, 0.8)); }
        .stat-card.style-3 { background: rgba(255, 255, 255, 0.9); }
        .stat-card.style-4 { background: #6366F1; color: white; border-color: #4F46E5; }

        .stat-number {
          font-weight: 700;
          font-size: 40px;
          color: #312E81;
          margin: 8px 0;
          line-height: 1.1;
        }
        .stat-card.style-4 .stat-number { color: #FFFFFF; }
        .stat-label {
          font-size: 14px;
          color: #6366F1;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-card.style-4 .stat-label { color: #E0E7FF; }

        /* ── Tabs ── */
        .tab-container {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
          position: relative;
          z-index: 10;
        }
        .tab-btn {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 12px 28px;
          border-radius: 9999px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: #4338CA;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .tab-btn:hover { background: rgba(255, 255, 255, 0.9); transform: translateY(-1px); }
        .tab-btn.active {
          background: #6366F1;
          color: white;
          border-color: #6366F1;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
        }

        /* ── Glass Content Wrapper & Inverter Hack ── */
        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto 100px;
          padding: 0 40px;
          position: relative;
          z-index: 10;
        }

        /* 
          IMPORTANT: The original Lend components are styled for dark mode (#080808 background, #111111 cards).
          To seamlessly integrate them into our premium light aesthetic without altering their source code,
          we use a filter inversion strategy. Invert(1) swaps light/dark, while hue-rotate(180deg) restores
          the original color hues (so greens stay green, reds stay red, and indigos stay roughly indigo).
        */
        .dark-to-light-inverter {
          filter: invert(1) hue-rotate(180deg) brightness(1.05) contrast(1.02);
          border-radius: 24px;
          overflow: hidden;
          background: #000; /* Pre-inverted base color */
          box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15);
        }
        
        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 60px 0;
          position: relative;
          z-index: 10;
        }
        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
          width: 60%;
        }
        .divider-star-container {
          position: absolute;
          padding: 0 20px;
          color: #6366F1;
          font-size: 20px;
        }
      `}} />

      {/* Custom Cursor Elements */}
      {mounted && (
        <>
          <div className="custom-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
          <div className="custom-cursor-ring" style={{ left: cursorTrail.x, top: cursorTrail.y }} />
        </>
      )}

      {/* Floating Background Effects */}
      <div className="dot-grid-overlay" />
      <div className="floating-container">
        {floatingCircles.map(c => (
          <div
            key={c.id}
            className="float-bubble"
            style={{
              width: c.size, height: c.size, left: `${c.left}%`, top: `${c.top}%`,
              animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s`,
              opacity: c.opacity
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <header className="nav-bar">
        <div className="nav-logo">
          <span className="sparkle-icon">✧</span>
          Kubryx Lend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6366F1', fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isLive ? '#10b981' : '#f59e0b', boxShadow: isLive ? '0 0 8px #10b981' : 'none' }} />
            {isLive ? 'Network Live' : 'Connecting...'}
          </div>
          <ConnectButton type="evm" size="lg" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="eyebrow">DeFi Loan Negotiation</div>
        <h1 className="hero-title">
          Smart Liquidity.<br />
          <span>Automated Terms.</span>
        </h1>
        <p className="hero-subtext">
          Supply assets to earn dynamic yields, or borrow with AI-optimized collateralization rates. Powered by Layer 2 smart escrows for instant settlement.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-pill-brand" style={{ padding: '16px 36px', fontSize: '16px' }} onClick={() => setTab('lend')}>
            Start Earning
          </button>
          <button className="btn-pill-brand" style={{ padding: '16px 36px', fontSize: '16px', background: 'white', color: '#6366F1', border: '1px solid #E0E7FF' }} onClick={() => setTab('borrow')}>
            Request Loan
          </button>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <div className="stats-grid-container">
        <div className="stripe-bg" style={{ borderRadius: 24 }} />
        <div className="stats-grid">
          <div className="stat-card style-1">
            <div className="stat-label">Total Volume</div>
            <div className="stat-number">
              $<CountUp end={84} />M+
            </div>
            <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>↑ 12.4% this week</div>
          </div>
          <div className="stat-card style-2">
            <div className="stat-label">Avg. Supply APY</div>
            <div className="stat-number">
              <CountUpDecimal end={9.2} decimals={1} />%
            </div>
            <div style={{ fontSize: 13, color: '#4338CA', fontWeight: 500 }}>Auto-compounding</div>
          </div>
          <div className="stat-card style-3">
            <div className="stat-label">Active Markets</div>
            <div className="stat-number">
              <CountUp end={24} />
            </div>
            <div style={{ fontSize: 13, color: '#6366F1', fontWeight: 500 }}>Across 4 networks</div>
          </div>
          <div className="stat-card style-4">
            <div className="stat-label">AI Negotiations</div>
            <div className="stat-number">
              <CountUp end={12} />k+
            </div>
            <div style={{ fontSize: 13, color: '#E0E7FF', fontWeight: 500 }}>Terms settled instantly</div>
          </div>
        </div>
      </div>

      <SectionDivider bg="#EEF2FF" />

      {/* Content Area */}
      <div className="content-wrapper" id="app-core">
        <div className="tab-container">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* The child components are inverted to match the light theme seamlessly */}
        <div className="dark-to-light-inverter">
          {tab === 'dashboard' && <LendDashboard onGoToBorrow={() => setTab('borrow')} onGoToLoans={() => setTab('loans')} />}
          {tab === 'loans'     && <LoanPortfolio isConnected={isConnected} />}
          {tab === 'borrow'    && <BorrowForm walletAddress={wallet} isConnected={isConnected} onConnect={connect} />}
          {tab === 'lend'      && <LendForm walletAddress={wallet} prefillAsset={prefillAsset} />}
          {tab === 'markets'   && <LendMarkets onSupply={(a) => { setPrefillAsset(a); setTab('lend') }} onBorrow={() => setTab('borrow')} />}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}

export default function LendPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#EEF2FF' }} />}>
      <LendInner />
    </Suspense>
  )
}
