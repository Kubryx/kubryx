'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { PriceBadge } from '@/components/ui/PriceBadge'

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Payment Routing',
    desc: '7 specialized AI agents optimize every transaction for cost, speed, and privacy.',
    detail: 'Automatic multi-hop routing, slippage protection, 23% avg gas savings',
    color: '#10B981',
  },
  {
    icon: '💼',
    title: 'Yield Operations Hub Management',
    desc: 'Real-time portfolio view across all blockchains and wallets.',
    detail: 'Asset allocation, yield tracking, risk analysis, predictive simulations',
    color: '#059669',
  },
  {
    icon: '🔄',
    title: 'Seamless Swaps',
    desc: 'Multi-chain DEX integration with intelligent route optimization.',
    detail: 'Raydium, Jupiter, Orca, Uniswap — instant price quotes',
    color: '#34D399',
  },
  {
    icon: '⚡',
    title: 'Automated Payments',
    desc: 'Recurring payments, payroll, and scheduled transfers on autopilot.',
    detail: 'Daily/weekly/monthly schedules, batch payments, multi-recipient',
    color: '#047857',
  },
]

const STATS = [
  { label: 'Yield Operations Hub Managed', value: '$1.2M+' },
  { label: 'AI Agents Online', value: '7' },
  { label: 'Chains Supported', value: '8+' },
  { label: 'Gas Saved (Avg)', value: '23%' },
]

const SUPPORTED = [
  { name:'Solana',   symbol:'SOL',   color:'#10B981' },
  { name:'Ethereum', symbol:'ETH',   color:'#60A5FA' },
  { name:'Arbitrum', symbol:'ARB',   color:'#06B6D4' },
  { name:'Polygon',  symbol:'MATIC', color:'#8B5CF6' },
  { name:'Base',     symbol:'BASE',  color:'#3B82F6' },
  { name:'Optimism', symbol:'OP',    color:'#EF4444' },
]

export default function TreasuryLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  useEffect(() => {
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
  }, [cursorPos])

  /* particle canvas background */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number }
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`
        ctx.fill()
      })
      /* draw connections */
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const floatingCircles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
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
    <div className="Yield Operations Hub-container">
      {/* Google Fonts Link */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500;600;700&family=Dancing+Script:wght@600&family=Fira+Code:wght@400&display=swap" rel="stylesheet" />

      {/* Embedded Vanilla CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .Yield Operations Hub-container {
          background-color: #F0FDF4;
          color: #064E3B;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
          cursor: none;
        }

        .custom-cursor-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          background-color: #10B981;
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
          border: 1.5px solid #10B981;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(16, 185, 129, 0.03);
        }
        a:hover ~ .custom-cursor-ring,
        button:hover ~ .custom-cursor-ring,
        input:hover ~ .custom-cursor-ring,
        textarea:hover ~ .custom-cursor-ring {
          width: 32px;
          height: 32px;
          border-color: #34D399;
          background-color: rgba(52, 211, 153, 0.08);
        }

        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring {
            display: none !important;
          }
          .Yield Operations Hub-container {
            cursor: auto !important;
          }
        }

        .floating-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .float-bubble {
          position: absolute;
          background-color: #D1FAE5;
          border-radius: 50%;
          animation: driftBubble linear infinite;
        }
        @keyframes driftBubble {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-30px) translateX(15px) rotate(120deg); }
          66% { transform: translateY(15px) translateX(-20px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }

        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #A7F3D0 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }

        .hero-section {
          padding: 90px 20px 80px 20px;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .eyebrow-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 18px;
          color: #10B981;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .hero-title {
          margin: 12px 0 24px 0;
          max-width: 800px;
          line-height: 1.25;
        }
        .title-syne-emerald {
          font-family: 'Syne', sans-serif;
          font-size: clamp(40px, 6vw, 66px);
          color: #10B981;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .title-cursive-dark {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(38px, 5.5vw, 58px);
          color: #064E3B;
          font-weight: 600;
        }
        .hero-subtext {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: rgba(6, 78, 59, 0.70);
          max-width: 600px;
          margin-bottom: 32px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 50px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-emerald-pill {
          background-color: #10B981;
          color: #FFFFFF;
          border: none;
          padding: 14px 32px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.22);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-emerald-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.32);
          background-color: #059669;
        }
        .btn-dark-pill {
          background-color: #064E3B;
          color: #FFFFFF;
          border: none;
          padding: 14px 32px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-dark-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(6, 78, 59, 0.25);
          background-color: #10B981;
        }
        .btn-ghost-pill {
          background-color: transparent;
          color: #064E3B;
          border: 1px solid #6EE7B7;
          padding: 14px 32px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-ghost-pill:hover {
          transform: translateY(-2px);
          background-color: rgba(110, 231, 183, 0.15);
        }

        .stats-grid-container {
          padding: 0 24px;
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 80px;
        }
        .stat-card {
          border-radius: 24px;
          border: 1px solid rgba(167, 243, 208, 0.6);
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
          box-shadow: 0 4px 24px rgba(16, 185, 129, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background-color: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15);
          border-color: #34D399;
        }
        .stat-eyebrow {
          font-family: 'Dancing Script', cursive;
          font-size: 18px;
          color: #10B981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stat-number {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 3.5vw, 42px);
          color: #064E3B;
          margin: 12px 0;
          line-height: 1.1;
        }
        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(6, 78, 59, 0.65);
          font-weight: 500;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 80px;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(12px);
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.5);
        }
        .feature-icon {
          font-size: 36px;
          margin-bottom: 20px;
          background: rgba(16, 185, 129, 0.1);
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }
        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #064E3B;
          margin-bottom: 12px;
        }
        .feature-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(6, 78, 59, 0.7);
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .feature-detail {
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          color: #059669;
          background: rgba(16, 185, 129, 0.08);
          padding: 10px 14px;
          border-radius: 10px;
          line-height: 1.5;
        }

        .chains-container {
          text-align: center;
          margin-bottom: 80px;
        }
        .chains-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: rgba(6, 78, 59, 0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 24px;
          font-weight: 600;
        }
        .chains-list {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .chain-pill {
          padding: 10px 20px;
          border-radius: 9999px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          background: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .chain-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }
        .chain-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #064E3B;
        }
        .chain-symbol {
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          color: #10B981;
          font-weight: 500;
        }
        
        .quick-actions-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 32px;
          padding: 48px;
          text-align: center;
          backdrop-filter: blur(16px);
          margin-bottom: 80px;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.08);
        }
        .qa-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #064E3B;
          margin-bottom: 12px;
        }
        .qa-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: rgba(6, 78, 59, 0.65);
          margin-bottom: 32px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .footer-note {
          text-align: center;
          padding-bottom: 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: rgba(6, 78, 59, 0.4);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }
      `}} />

      {/* Custom Cursor Rendering */}
      <div 
        className="custom-cursor-dot" 
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }} 
      />
      <div 
        className="custom-cursor-ring" 
        style={{ left: `${cursorTrail.x}px`, top: `${cursorTrail.y}px` }} 
      />

      {/* Floating Circles */}
      <div className="floating-container">
        {floatingCircles.map(c => (
          <div
            key={c.id}
            className="float-bubble"
            style={{
              width: `${c.size}px`,
              height: `${c.size}px`,
              left: `${c.left}%`,
              top: `${c.top}%`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              opacity: c.opacity as any
            }}
          />
        ))}
      </div>

      <div className="dot-grid-overlay" />
      
      {/* Animated particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Hero */}
        <section className="hero-section">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="eyebrow-cursive" style={{ justifyContent: 'center' }}>
              ✦ Autonomous Yield Operations Hub OS
            </div>

            <h1 className="hero-title">
              <span className="title-cursive-dark">Run Your Organization's</span>
              <br />
              <span className="title-syne-emerald">Finances Invisibly On-Chain</span>
            </h1>

            <p className="hero-subtext" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              AI agents manage payments, optimize routing, and execute Yield Operations Hub operations autonomously.
              PalmFlow AI — the Autonomous Financial Operating System for DAOs and enterprises.
            </p>

            {/* CTAs */}
            <div className="hero-buttons">
              <PriceBadge coinId="solana" label="SOL" />
              <ConnectButton type="solana" size="lg" />
              <Link href="/treasury/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-dark-pill"
                >
                  📊 View Dashboard
                </motion.button>
              </Link>
              <Link href="/treasury/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-ghost-pill"
                >
                  🎯 Try Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid-container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="stats-grid"
          >
            {STATS.map((s, idx) => (
              <div key={s.label} className="stat-card">
                <div>
                  <div className="stat-eyebrow">✦ Metric {idx + 1}</div>
                  <div className="stat-number">{s.value}</div>
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section className="stats-grid-container">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i + 0.4, duration: 0.5 }}
                className="feature-card"
              >
                <div className="feature-icon" style={{ color: f.color }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
                <div className="feature-detail" style={{ color: f.color }}>{f.detail}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Supported Chains */}
        <section className="stats-grid-container">
          <div className="chains-container">
            <div className="chains-title">Multi-Chain Support</div>
            <div className="chains-list">
              {SUPPORTED.map(c => (
                <div key={c.name} className="chain-pill">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                  <span className="chain-name">{c.name}</span>
                  <span className="chain-symbol" style={{ color: c.color }}>{c.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="stats-grid-container">
          <div className="quick-actions-card">
            <div className="eyebrow-cursive" style={{ justifyContent: 'center' }}>Get Started</div>
            <h2 className="qa-title">Ready to automate your Yield Operations Hub?</h2>
            <p className="qa-desc">
              Connect your wallet and let AI agents manage your finances autonomously.
            </p>
            <div className="hero-buttons" style={{ marginBottom: 0 }}>
              {[
                { href:'/treasury/dashboard', label:'📊 Dashboard',  color: '#10B981' },
                { href:'/treasury/send',      label:'💸 Send',       color: '#059669' },
                { href:'/treasury/receive',   label:'📥 Receive',    color: '#064E3B' },
                { href:'/treasury/swap',      label:'🔄 Swap',       color: '#34D399' },
                { href:'/treasury/analytics', label:'📉 Analytics',  color: '#047857' },
              ].map(a => (
                <Link key={a.href} href={a.href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '12px 24px', borderRadius: '12px', border: `1px solid ${a.color}44`, background: 'rgba(255,255,255,0.8)', color: a.color, fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {a.label}
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="footer-note">
          PalmFlow AI is a production-ready financial OS. Connect your wallet to start managing Yield Operations Hub operations.
          All operations are non-custodial — your keys, your funds.
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}
