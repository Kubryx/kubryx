'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWalletForTool } from '@/hooks/useWalletForTool'
import { ConnectButton } from '@/components/wallet/ConnectButton'

import VaultDashboard from '@/components/vault/VaultDashboard'
import CollateralManager from '@/components/vault/CollateralManager'
import DWalletManager from '@/components/vault/DWalletManager'
import FHETradeForm from '@/components/vault/FHETradeForm'
import VaultHistory from '@/components/vault/VaultHistory'

export type VaultTabId = 'dashboard' | 'collateral' | 'dwallet' | 'trade' | 'history'
const VALID: VaultTabId[] = ['dashboard', 'collateral', 'dwallet', 'trade', 'history']

const TABS: { id: VaultTabId; label: string; icon: string }[] = [
  { id: 'dashboard',  label: 'Dashboard',     icon: '⊞' },
  { id: 'collateral', label: 'Collateral',    icon: '◊' },
  { id: 'dwallet',    label: 'dWallet',       icon: '⬢' },
  { id: 'trade',      label: 'Private Trade', icon: '⇄' },
  { id: 'history',    label: 'History',       icon: '◴' },
]

const apiBase = process.env.NEXT_PUBLIC_CIPHER_URL || process.env.NEXT_PUBLIC_CIPHER_API || ''

function VaultInner() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = (params.get('tab') as VaultTabId) || 'dashboard'
  const [tab, setTab] = useState<VaultTabId>(VALID.includes(initial) ? initial : 'dashboard')
  // Wallet state now comes from the global wallet context (EVM / Arbitrum).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [isLive, setIsLive] = useState(false)
  const [privacyScore, setPrivacyScore] = useState<number | undefined>(undefined)

  const [mounted, setMounted] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  useEffect(() => {
    setMounted(true)
    if (!apiBase) return
    fetch(`${apiBase}/health`).then(r => r.ok && r.json()).then(d => setIsLive(d?.status === 'ok')).catch(() => {})
    fetch(`${apiBase}/api/privacy/score`).then(r => r.ok && r.json()).then(d => d?.score && setPrivacyScore(d.score)).catch(() => {})

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
    router.replace(tab === 'dashboard' ? '/vault' : `/vault?tab=${tab}`, { scroll: false })
  }, [tab, router])

  const floatingCircles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 30) + 10,
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 8) + 10,
      delay: Math.floor(Math.random() * 5),
      opacity: (Math.random() * 0.15 + 0.10).toFixed(2)
    }))
  }, [])

  return (
    <div className="vault-container">
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500;700&family=Dancing+Script:wght@600&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        .vault-container {
          background-color: #ECFEFF;
          color: #083344;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
          cursor: none;
        }

        .custom-cursor-dot {
          position: fixed; width: 6px; height: 6px;
          background-color: #06B6D4; border-radius: 50%;
          pointer-events: none; z-index: 99999;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease-out;
        }
        .custom-cursor-ring {
          position: fixed; width: 24px; height: 24px;
          border: 1.5px solid #06B6D4; border-radius: 50%;
          pointer-events: none; z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(6, 182, 212, 0.05);
        }
        a:hover ~ .custom-cursor-ring, button:hover ~ .custom-cursor-ring, input:hover ~ .custom-cursor-ring {
          width: 32px; height: 32px; border-color: #22D3EE; background-color: rgba(34, 211, 238, 0.1);
        }
        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring { display: none !important; }
          .vault-container { cursor: auto !important; }
        }

        .floating-container { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .float-bubble {
          position: absolute; background-color: #CFFAFE; border-radius: 50%;
          animation: driftBubble linear infinite; box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
        }
        @keyframes driftBubble {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-40px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(20px) translateX(-30px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }

        .dot-grid-overlay {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, #22D3EE 1px, transparent 1px);
          background-size: 28px 28px; opacity: 0.15; pointer-events: none; z-index: 0;
        }
        .stripe-bg {
          background-image: repeating-linear-gradient(45deg, #A5F3FC 0px, #A5F3FC 1px, transparent 1px, transparent 12px);
          opacity: 0.15; position: absolute; inset: 0; pointer-events: none;
        }

        header.nav-bar {
          background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px);
          border-bottom: 1px solid #CFFAFE; position: sticky; top: 0; z-index: 1000;
          padding: 16px 40px; display: flex; justify-content: space-between; align-items: center;
        }
        .nav-logo { font-family: 'Dancing Script', cursive; font-size: 24px; font-weight: 600; color: #083344; display: flex; align-items: center; gap: 8px; }
        .sparkle-icon { color: #06B6D4; font-size: 16px; font-family: sans-serif; }
        .nav-links { display: flex; gap: 12px; align-items: center; }
        .badge { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 9999px; display: flex; align-items: center; gap: 6px; }
        .badge::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
        .badge-demo { background-color: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
        .badge-demo::before { background-color: #F59E0B; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }
        .badge-live { background-color: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .badge-live::before { background-color: #10B981; animation: pulse-green 2s infinite; }
        .badge-private { background-color: #F3E8FF; color: #7E22CE; border: 1px solid #E9D5FF; }
        .badge-private::before { background-color: #A855F7; }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .btn-pill-cyan {
          background-color: #06B6D4; color: #FFFFFF; border: none; padding: 10px 24px; border-radius: 9999px;
          font-family: 'Fira Code', monospace; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.25);
        }
        .btn-pill-cyan:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.35); background-color: #0891B2; }

        .hero-section {
          padding: 80px 20px 40px 20px; text-align: center; position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10;
        }
        .eyebrow-cursive { font-family: 'Dancing Script', cursive; font-size: 20px; color: #06B6D4; letter-spacing: 0.1em; margin-bottom: 12px; }
        .hero-title { margin: 0 0 24px 0; max-width: 800px; line-height: 1.1; }
        .hero-title span { display: block; }
        .title-cursive-dark { font-family: 'Dancing Script', cursive; font-size: clamp(42px, 6vw, 64px); color: #083344; font-weight: 600; }
        .title-syne-cyan { font-family: 'Syne', sans-serif; font-size: clamp(48px, 7vw, 76px); color: #06B6D4; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 10px 30px rgba(6, 182, 212, 0.15); }
        .hero-subtext { font-family: 'DM Sans', sans-serif; font-size: 16px; line-height: 1.6; color: rgba(8, 51, 68, 0.7); max-width: 600px; margin-bottom: 32px; }
        .hero-buttons { display: flex; gap: 16px; margin-bottom: 50px; }
        .btn-dark-pill {
          background-color: #083344; color: #FFFFFF; border: none; padding: 14px 32px; border-radius: 9999px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s; box-shadow: 0 4px 14px rgba(8, 51, 68, 0.2);
        }
        .btn-dark-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(8, 51, 68, 0.3); background-color: #06B6D4; }
        .btn-ghost-pill {
          background-color: #FFFFFF; color: #083344; border: 1px solid #A5F3FC; padding: 14px 32px; border-radius: 9999px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .btn-ghost-pill:hover { transform: translateY(-2px); background-color: #F0FDFA; box-shadow: 0 6px 15px rgba(6, 182, 212, 0.1); border-color: #67E8F9; }

        .tabs-container {
          display: inline-flex; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(8px);
          border: 1px solid #CFFAFE; padding: 6px; border-radius: 9999px; gap: 4px; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.08);
          max-width: 90vw; overflow-x: auto;
        }
        .tab-btn {
          background: transparent; border: none; padding: 10px 20px; border-radius: 9999px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: rgba(8, 51, 68, 0.6);
          cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; white-space: nowrap;
        }
        .tab-btn:hover { color: #083344; background: rgba(255, 255, 255, 0.5); }
        .tab-btn.active { background: #FFFFFF; color: #06B6D4; box-shadow: 0 2px 10px rgba(6, 182, 212, 0.1); }
        .tab-icon { font-size: 16px; opacity: 0.8; }

        .content-section { padding: 0 20px 80px 20px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10; }
        .vault-shadow-box {
          border-radius: 24px; box-shadow: 0 20px 60px rgba(6, 182, 212, 0.15), 0 0 0 1px rgba(6, 182, 212, 0.1);
          background: #FFFFFF; overflow: hidden;
        }
        .vault-inverted-wrapper {
          background: #0C0C0C; min-height: 500px;
          filter: invert(1) hue-rotate(180deg) contrast(1.02) brightness(1.05);
        }
      ` }} />

      <div className="custom-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="custom-cursor-ring" style={{ left: cursorTrail.x, top: cursorTrail.y }} />

      <div className="dot-grid-overlay" />
      <div className="stripe-bg" />
      <div className="floating-container">
        {floatingCircles.map(c => (
          <div key={c.id} className="float-bubble" style={{
            width: c.size, height: c.size, left: `${c.left}%`, top: `${c.top}%`,
            animationDuration: `${c.duration}s`, animationDelay: `-${c.delay}s`, opacity: c.opacity
          }} />
        ))}
      </div>

      <header className="nav-bar">
        <div className="nav-logo">
          Kubryx <span className="sparkle-icon">◈</span> Private vault
        </div>
        <div className="nav-links">
          <span className={`badge ${isLive ? 'badge-live' : 'badge-demo'}`}>
            {isLive ? 'Multi-chain Live' : 'Demo Data'}
          </span>
          <span className="badge badge-private">FHE Private</span>
        </div>
        <ConnectButton type="evm" size="lg" />
      </header>

      <section className="hero-section">
        <div className="eyebrow-cursive">◈ Secure & Private</div>
        <h1 className="hero-title">
          <span className="title-cursive-dark">Cross-Chain</span>
          <span className="title-syne-cyan">Privacy Vault</span>
        </h1>
        <p className="hero-subtext">
          Deposit collateral across BTC, ETH, and SOL. Register MPC-secured dWallets, and execute private FHE-encrypted trades without revealing your positions.
        </p>
        
        <div className="hero-buttons">
          <button className="btn-dark-pill" onClick={() => setTab('collateral')}>
            + Deposit Collateral
          </button>
          <button className="btn-ghost-pill" onClick={() => setTab('trade')}>
            Execute Private Trade
          </button>
        </div>

        <div className="tabs-container">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="tab-icon">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </section>

      <main className="content-section">
        <div className="vault-shadow-box">
          <div className="vault-inverted-wrapper">
            {tab === 'dashboard'  && <VaultDashboard walletAddress={wallet} privacyScore={privacyScore} onGoToCollateral={() => setTab('collateral')} onGoToHistory={() => setTab('history')} />}
            {tab === 'collateral' && <CollateralManager walletAddress={wallet} />}
            {tab === 'dwallet'    && <DWalletManager walletAddress={wallet} />}
            {tab === 'trade'      && <FHETradeForm walletAddress={wallet} />}
            {tab === 'history'    && <VaultHistory />}
          </div>
        </div>
      </main>

      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ECFEFF' }} />}>
      <VaultInner />
    </Suspense>
  )
}
