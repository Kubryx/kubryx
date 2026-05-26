'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWalletForTool } from '@/hooks/useWalletForTool'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { WrongNetworkBanner } from '@/components/wallet/WrongNetwork'
import { PriceBadge } from '@/components/ui/PriceBadge'

import { readLegacyVault, type LegacyVaultState } from '@/lib/contracts/eternalVault'
import { ColdStartBanner } from '@/components/ui/ColdStartBanner'
import { useKubrykPlatform } from '@/context/KubrykPlatformContext'
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
  const platform = useKubrykPlatform()
  const [healthStatus, setHealthStatus] = useState<'checking' | 'live' | 'demo'>('checking')
  const [retryAttempt, setRetryAttempt] = useState(0)
  const isLive = healthStatus === 'live'
  const [privacyScore, setPrivacyScore] = useState<number | undefined>(undefined)
  const [vaultState, setVaultState] = useState<LegacyVaultState | null>(null)

  const [mounted, setMounted] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  useEffect(() => {
    setMounted(true)

    async function tryHealth() {
      if (!apiBase) { setHealthStatus('demo'); return }
      for (let attempt = 0; attempt < 3; attempt++) {
        setRetryAttempt(attempt + 1)
        try {
          const ctrl = new AbortController()
          const t = setTimeout(() => ctrl.abort(), 8000)
          const r = await fetch(`${apiBase}/health`, { signal: ctrl.signal })
          clearTimeout(t)
          if (r.ok) {
            const d = await r.json()
            if (d?.status === 'ok') { setHealthStatus('live'); return }
          }
        } catch {
          // retry
        }
      }
      setHealthStatus('demo')
    }
    tryHealth()

    if (apiBase) {
      const ctrl2 = new AbortController()
      const t2 = setTimeout(() => ctrl2.abort(), 8000)
      fetch(`${apiBase}/api/privacy/score`, { signal: ctrl2.signal })
        .then(r => r.ok && r.json()).then(d => d?.score && setPrivacyScore(d.score)).catch(() => {})
        .finally(() => clearTimeout(t2))
    }

    const moveCursor = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  useEffect(() => {
    let mounted = true
    readLegacyVault(wallet || undefined)
      .then(s => {
        if (mounted) {
          setVaultState(s)
          if (s) platform.setVault(true, s.owner)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [wallet]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <span className={healthStatus === 'live' ? 'badge-live' : 'badge-demo'}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: healthStatus === 'live' ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
            {healthStatus === 'checking' ? `Connecting… (${retryAttempt}/3)` : healthStatus === 'live' ? 'Multi-chain Live' : 'Testnet Data'}
          </span>
          {vaultState && (
            <span className="badge badge-live" style={{ background: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0' }}>
              ⬤ On-Chain · QIE Mainnet
            </span>
          )}
          <span className="badge badge-private">FHE Private</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <PriceBadge coinId="ethereum" label="ETH" />
          <PriceBadge coinId="arbitrum" label="ARB" />
          <ConnectButton type="evm" size="lg" />
        </div>
      </header>

      <WrongNetworkBanner />

      {healthStatus === 'demo' && apiBase && (
        <div style={{ padding: '8px 20px 0' }}>
          <ColdStartBanner serviceName="CipherVault" onRetry={() => {
            setHealthStatus('checking')
            setRetryAttempt(0)
            const run = async () => {
              if (!apiBase) { setHealthStatus('demo'); return }
              for (let attempt = 0; attempt < 3; attempt++) {
                setRetryAttempt(attempt + 1)
                try {
                  const ctrl = new AbortController()
                  const t = setTimeout(() => ctrl.abort(), 8000)
                  const r = await fetch(`${apiBase}/health`, { signal: ctrl.signal })
                  clearTimeout(t)
                  if (r.ok) { const d = await r.json(); if (d?.status === 'ok') { setHealthStatus('live'); return } }
                } catch { /* retry */ }
              }
              setHealthStatus('demo')
            }
            run()
          }} />
        </div>
      )}

      <section className="hero-section">
        <div className="page-eyebrow">◈ Secure & Private</div>
        <h1 className="page-title">
          Cross-Chain Privacy Vault
        </h1>
        <p className="page-subtitle">
          Deposit collateral across BTC, ETH, and SOL. Register MPC-secured dWallets, and execute private FHE-encrypted trades without revealing your positions.
        </p>
        
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => setTab('collateral')}>
            + Deposit Collateral
          </button>
          <button className="btn-outline" onClick={() => setTab('trade')}>
            Execute Private Trade
          </button>
        </div>

        {wallet && vaultState === null && (
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 12, color: 'rgba(8,51,68,0.45)', fontWeight: 500 }}>
            Vault is empty — no on-chain state found for this address
          </div>
        )}

        {vaultState && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ fontSize: 12, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid #CFFAFE', color: '#083344', fontWeight: 600, fontFamily: 'Fira Code, monospace' }}>
              Owner: {vaultState.owner.slice(0, 8)}…{vaultState.owner.slice(-6)}
            </div>
            <div style={{ fontSize: 12, padding: '8px 16px', borderRadius: 999, background: vaultState.deceased ? '#FEE2E2' : '#D1FAE5', border: `1px solid ${vaultState.deceased ? '#FECACA' : '#A7F3D0'}`, color: vaultState.deceased ? '#DC2626' : '#059669', fontWeight: 600 }}>
              {vaultState.deceased ? '⚠ Legacy Mode Active' : '✓ Vault Active'}
            </div>
            {vaultState.unlockDate && (
              <div style={{ fontSize: 12, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid #CFFAFE', color: '#083344', fontWeight: 600 }}>
                Unlock: {vaultState.unlockDate.toLocaleDateString()}
              </div>
            )}
            {vaultState.canAccess !== null && (
              <div style={{ fontSize: 12, padding: '8px 16px', borderRadius: 999, background: vaultState.canAccess ? '#D1FAE5' : '#FEF3C7', border: `1px solid ${vaultState.canAccess ? '#A7F3D0' : '#FDE68A'}`, color: vaultState.canAccess ? '#059669' : '#D97706', fontWeight: 600 }}>
                {vaultState.canAccess ? '✓ You have access' : '◎ Access pending'}
              </div>
            )}
          </div>
        )}
        {(vaultState || platform.vaultActive) && (
          <div style={{ fontSize: 12, padding: '6px 16px', borderRadius: 999, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', color: '#7C3AED', fontWeight: 600, marginBottom: 12 }}>
            🔐 Active vault → +85 pts to your Kubryx Credit Score
          </div>
        )}
        <div style={{ fontSize: 12, padding: '5px 14px', borderRadius: 999, background: platform.isDemoMode ? 'rgba(107,114,128,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${platform.isDemoMode ? 'rgba(107,114,128,0.3)' : 'rgba(16,185,129,0.3)'}`, color: platform.isDemoMode ? '#9CA3AF' : '#10b981', fontWeight: 600, marginBottom: 20, display: 'inline-block' }}>
          {platform.isDemoMode ? '◎ Demo · Connect wallet for live data' : '⬤ Live · Wallet Connected'}
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
            {tab === 'dashboard'  && <VaultDashboard walletAddress={wallet} privacyScore={privacyScore} vaultState={vaultState} onGoToCollateral={() => setTab('collateral')} onGoToHistory={() => setTab('history')} />}
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
