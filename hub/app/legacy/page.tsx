'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  isMetaMaskInstalled,
  truncateAddress,
  WALLET_INSTALL_LINKS,
} from '../../lib/wallet-utils'
import { toast } from '../../lib/toast'
import { useWalletForTool } from '../../hooks/useWalletForTool'
import { useWallet } from '../../context/WalletContext'
import { ConnectButton } from '../../components/wallet/ConnectButton'

export default function LegacyLandingPage() {
  // Wallet state now comes from the global wallet context.
  const { address } = useWalletForTool()
  const { disconnectEVM } = useWallet()
  const wallet = address ?? ''

  const [mounted, setMounted] = useState(false)

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])

  useEffect(() => {
    setMounted(true)

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

  function disconnect() {
    disconnectEVM()
    toast.success('Wallet disconnected')
  }

  // Float circles rendering helpers
  const floatingCircles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 30) + 10,
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 8) + 12,
      delay: Math.floor(Math.random() * 5),
      opacity: (Math.random() * 0.12 + 0.08).toFixed(2)
    }))
  }, [])

  return (
    <div className="legacy-container">
      {/* Google Fonts Link */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=DM+Sans:wght@400;500;600&family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        .legacy-container {
          background-color: #FAFAFA;
          color: #1A1A1A;
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
          background-color: #D97706;
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
          border: 1.5px solid #D97706;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(217, 119, 6, 0.03);
        }
        a:hover ~ .custom-cursor-ring,
        button:hover ~ .custom-cursor-ring {
          width: 32px;
          height: 32px;
          border-color: #F5C518;
          background-color: rgba(245, 197, 24, 0.08);
        }

        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring { display: none !important; }
          .legacy-container { cursor: auto !important; }
        }

        /* ── Background ── */
        .legacy-bg-glow {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(245, 197, 24, 0.15) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #FDE68A 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }

        .float-bubble {
          position: absolute;
          background: linear-gradient(135deg, #F5C518, #FDE68A);
          border-radius: 50%;
          animation: driftBubble linear infinite;
          z-index: 0;
        }
        @keyframes driftBubble {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-40px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(20px) translateX(-30px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }

        /* ── Typography ── */
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-cursive {
          font-family: 'Dancing Script', cursive;
        }

        /* ── Nav ── */
        header.nav-bar {
          background-color: rgba(250, 250, 250, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(245, 197, 24, 0.3);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-size: 22px;
          font-weight: 700;
          color: #1A1A1A;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Buttons ── */
        .btn-gold {
          background: linear-gradient(135deg, #F5C518, #D97706);
          color: #FFFFFF;
          border: none;
          border-radius: 9999px;
          padding: 14px 36px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
        }
        
        .btn-outline-gold {
          background: transparent;
          color: #D97706;
          border: 1px solid #D97706;
          border-radius: 9999px;
          padding: 13px 36px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          transition: transform 0.2s, background 0.2s;
        }
        .btn-outline-gold:hover {
          transform: translateY(-2px);
          background: rgba(217, 119, 6, 0.05);
        }

        /* ── Cards ── */
        .glass-card {
          background: #FFFFFF;
          border: 1px solid rgba(245, 197, 24, 0.4);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          z-index: 10;
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 50px rgba(217, 119, 6, 0.1);
        }
      `}} />

      {mounted && (
        <>
          <div className="custom-cursor-dot" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }} />
          <div className="custom-cursor-ring" style={{ left: `${cursorTrail.x}px`, top: `${cursorTrail.y}px` }} />
        </>
      )}

      <div className="legacy-bg-glow" />
      <div className="dot-grid-overlay" />
      
      {floatingCircles.map(circle => (
        <div
          key={circle.id}
          className="float-bubble"
          style={{
            width: circle.size, height: circle.size,
            left: `${circle.left}%`, top: `${circle.top}%`,
            animationDuration: `${circle.duration}s`,
            animationDelay: `${circle.delay}s`,
            opacity: circle.opacity,
          }}
        />
      ))}

      {/* Navigation */}
      <header className="nav-bar">
        <div className="nav-logo font-serif">
          Family vault <span style={{ color: '#D97706', fontSize: 18 }}>✦</span>
        </div>
        <Link href="/dashboard" style={{
          fontSize: 14, fontWeight: 500, color: '#1A1A1A', textDecoration: 'none',
        }}>
          ← Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10, padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80, maxWidth: 840, margin: '0 auto 80px' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, padding: '6px 16px', borderRadius: 20,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
              QIE Mainnet
            </span>
            <span style={{
              fontSize: 12, padding: '6px 16px', borderRadius: 20,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600
            }}>
              🔒 AES-GCM-256
            </span>
          </div>

          <h1 className="font-serif" style={{
            fontSize: 'clamp(42px, 6vw, 68px)', fontWeight: 800, margin: '0 0 24px', lineHeight: 1.15,
            color: '#1A1A1A'
          }}>
            Where Identity <br/> <i style={{ color: '#D97706' }}>Meets Eternity.</i>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(26,26,26,0.6)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 40px' }}>
            Encrypt your memories client-side, anchor them on QIE Mainnet, and empower your heirs to access them only when the time is right.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link href="/legacy/upload" className="btn-gold">
              📁 Upload Memories
            </Link>
            <Link href="/legacy/heir" className="btn-outline-gold">
              🔐 Heir Dashboard
            </Link>
          </div>

          {/* Wallet State */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {wallet ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFFFFF', padding: '8px 16px', borderRadius: 24, border: '1px solid rgba(245,197,24,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>
                  {truncateAddress(wallet)}
                </span>
                <button onClick={disconnect} style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 8px' }}>
                  Disconnect
                </button>
              </div>
            ) : (
              <ConnectButton type="evm" size="lg" />
            )}
          </div>
          {!installed && (
            <a href={WALLET_INSTALL_LINKS.metamask} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 12, color: '#D97706', fontSize: 14, fontWeight: 500 }}>
              Install MetaMask to connect
            </a>
          )}
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 80 }}>
          {[
            { icon: '🔒', title: 'Client-Side Encryption', desc: 'AES-GCM-256 with PBKDF2. Your passphrase never leaves your browser.', color: '#2563EB' },
            { icon: '⛓', title: 'On-Chain Anchoring', desc: 'File references anchored on QIE Mainnet. Tamper-proof audit trail.', color: '#16A34A' },
            { icon: '👨‍👩‍👧‍👦', title: 'Heir Governance', desc: 'Register heirs and validators on-chain. Access unlocks only when activated.', color: '#D97706' },
            { icon: '🧬', title: 'AI Legacy Stories', desc: 'AI generates a personal narrative from your metadata for heirs to cherish.', color: '#9333EA' },
          ].map((feat) => (
            <div key={feat.title} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: 36 }}>{feat.icon}</span>
              <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: feat.color, margin: 0 }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(26,26,26,0.6)', margin: 0, lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Vault Navigation Links */}
        <div style={{ maxWidth: 900, margin: '0 auto 60px' }}>
          <p className="font-cursive" style={{ fontSize: 20, color: '#D97706', textAlign: 'center', marginBottom: 24 }}>
            Explore the Vault
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { href: '/legacy/upload', icon: '📁', label: 'Upload Memories', desc: 'Encrypt & store files securely' },
              { href: '/legacy/timeline', icon: '📋', label: 'Timeline', desc: 'Browse all encrypted files' },
              { href: '/legacy/heir', icon: '🔐', label: 'Heir Access', desc: 'Unlock an inherited vault' },
              { href: '/legacy/validator', icon: '⚖️', label: 'Validator', desc: 'Register & verify death events' },
              { href: '/legacy/tokenization', icon: '🪙', label: 'DLT Token', desc: 'Link QIEDEX asset token' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                background: '#FFFFFF', border: '1px solid rgba(245, 197, 24, 0.3)', borderRadius: 16,
                padding: '20px', display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#1A1A1A' }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: 'rgba(26,26,26,0.5)', margin: '4px 0 0' }}>{item.desc}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: 'rgba(217, 119, 6, 0.4)', fontSize: 20 }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)',
          borderRadius: 16, padding: '24px', maxWidth: 800, margin: '0 auto', textAlign: 'center'
        }}>
          <p style={{ fontSize: 13, color: 'rgba(26,26,26,0.6)', margin: 0, lineHeight: 1.6 }}>
            ⚠️ This application uses client-side encryption (AES-GCM-256) for all memories. Your vault key is your
            responsibility — back it up securely. In a full deployment,
            connecting your QIE wallet lets you register heirs and anchor file references on-chain via
            LegacyVault.sol.
          </p>
        </div>

      </main>
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}
