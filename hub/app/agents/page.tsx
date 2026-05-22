'use client'

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWalletForTool } from '@/hooks/useWalletForTool'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { PriceBadge } from '@/components/ui/PriceBadge'

// Sub-components for tabs
import AgentDashboard from '@/components/agents/AgentDashboard'
import JobsExplorer from '@/components/agents/JobsExplorer'
import NodeRegistry from '@/components/agents/NodeRegistry'
import DeployWizard from '@/components/agents/DeployWizard'
import AgentAnalytics from '@/components/agents/AgentAnalytics'

type AgentsTabId = 'dashboard' | 'jobs' | 'registry' | 'deploy' | 'analytics'
const VALID_TABS: AgentsTabId[] = ['dashboard', 'jobs', 'registry', 'deploy', 'analytics']

function AgentsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as AgentsTabId | null
  const initialTab: AgentsTabId = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'dashboard'

  const [activeTab, setActiveTab] = useState<AgentsTabId>(initialTab)
  // Wallet state now comes from the global wallet context (Solana / Devnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''

  const [mounted, setMounted] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  useEffect(() => {
    setMounted(true)

    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
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
    const url = activeTab === 'dashboard' ? '/agents' : `/agents?tab=${activeTab}`
    router.replace(url, { scroll: false })
  }, [activeTab, router])

  const floatingCircles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 30) + 10,
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 8) + 10,
      delay: Math.floor(Math.random() * 5),
      opacity: (Math.random() * 0.15 + 0.05).toFixed(2)
    }))
  }, [])

  const tabs: { id: AgentsTabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'jobs', label: 'Jobs Explorer' },
    { id: 'registry', label: 'Node Registry' },
    { id: 'deploy', label: 'Deploy Agent' },
    { id: 'analytics', label: 'Analytics' }
  ]

  return (
    <div className="agentmesh-container">
      {/* Google Fonts Link */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&family=Dancing+Script:wght@600&family=Fira+Code:wght@400&display=swap" rel="stylesheet" />

      {/* Embedded Vanilla CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .agentmesh-container {
          background-color: #FAF5FF;
          color: #1A1025;
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
          background-color: #9945FF;
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
          border: 1.5px solid #9945FF;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(153, 69, 255, 0.03);
        }
        a:hover ~ .custom-cursor-ring,
        button:hover ~ .custom-cursor-ring,
        input:hover ~ .custom-cursor-ring,
        .tab-item:hover ~ .custom-cursor-ring {
          width: 32px;
          height: 32px;
          border-color: #B87AFF;
          background-color: rgba(184, 122, 255, 0.08);
        }

        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring { display: none !important; }
          .agentmesh-container { cursor: auto !important; }
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
          background-color: #D6AEFF;
          border-radius: 50%;
          animation: driftBubble linear infinite;
        }
        @keyframes driftBubble {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-40px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(20px) translateX(-30px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }

        /* ── CSS Dot Grid Texture ── */
        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #D6AEFF 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Diagonal Stripes (Hero Background) ── */
        .stripe-bg {
          background-image: repeating-linear-gradient(
            45deg, #F3E8FF 0px, #F3E8FF 1px, transparent 1px, transparent 16px
          );
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Top Nav / Hero Area ── */
        .hero-section {
          padding: 80px 20px 60px 20px;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .eyebrow-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 18px;
          color: #9945FF;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(40px, 5.5vw, 64px);
          color: #1A1025;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 20px;
          max-width: 800px;
          letter-spacing: -0.02em;
        }
        .hero-title span {
          color: #9945FF;
        }
        .hero-subtext {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: rgba(26, 16, 37, 0.7);
          max-width: 600px;
          margin-bottom: 32px;
        }

        .connect-btn {
          background-color: #9945FF;
          color: #FFFFFF;
          border: none;
          padding: 14px 32px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          box-shadow: 0 4px 16px rgba(153, 69, 255, 0.25);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(153, 69, 255, 0.35);
          background-color: #B87AFF;
        }
        .wallet-badge {
          background-color: #FFFFFF;
          border: 1px solid #D6AEFF;
          padding: 10px 24px;
          border-radius: 9999px;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          color: #9945FF;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(153, 69, 255, 0.08);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .status-dot.offline {
          background-color: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        /* ── Glassmorphism Tab Bar ── */
        .tab-bar-wrapper {
          display: flex;
          justify-content: center;
          position: sticky;
          top: 20px;
          z-index: 100;
          margin-bottom: 40px;
          padding: 0 20px;
        }
        .tab-bar {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(214, 174, 255, 0.5);
          border-radius: 9999px;
          padding: 6px;
          display: flex;
          gap: 4px;
          box-shadow: 0 8px 32px rgba(153, 69, 255, 0.08);
        }
        .tab-item {
          background: transparent;
          border: none;
          padding: 10px 20px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(26, 16, 37, 0.65);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tab-item:hover {
          color: #9945FF;
          background: rgba(243, 232, 255, 0.5);
        }
        .tab-item.active {
          background: #9945FF;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(153, 69, 255, 0.2);
        }

        /* ── Main Content Area ── */
        .content-area {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px 80px 20px;
          position: relative;
          z-index: 2;
        }
        
        /* Overriding any potential dark backgrounds from subcomponents for the premium light aesthetic */
        .content-area > div {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #F3E8FF;
          box-shadow: 0 12px 40px rgba(153, 69, 255, 0.06);
          overflow: hidden;
        }
      `}} />

      {/* Background Elements */}
      <div className="stripe-bg" />
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
              opacity: circle.opacity
            }}
          />
        ))}
      </div>

      {/* Custom Cursor */}
      {mounted && (
        <>
          <div className="custom-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
          <div className="custom-cursor-ring" style={{ left: cursorTrail.x, top: cursorTrail.y }} />
        </>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="eyebrow-cursive">
          ✦ Agent co-ordinator Protocol
        </div>
        <h1 className="hero-title">
          Agent <span>Coordination</span>
        </h1>
        <p className="hero-subtext">
          Deploy, manage, and scale AI agents on the Solana network. Experience seamless on-chain execution with our premium orchestration layer.
        </p>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PriceBadge coinId="solana" label="SOL" />
          <ConnectButton type="solana" size="lg" />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar-wrapper">
        <div className="tab-bar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {activeTab === 'dashboard' && <AgentDashboard />}
        {activeTab === 'jobs'      && <JobsExplorer />}
        {activeTab === 'registry'  && <NodeRegistry />}
        {activeTab === 'deploy'    && <DeployWizard walletAddress={wallet} />}
        {activeTab === 'analytics' && <AgentAnalytics />}
      </div>
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF5FF' }} />}>
      <AgentsPageInner />
    </Suspense>
  )
}
