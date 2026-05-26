// Built by vsrupeshkumar
'use client'

import { useEffect, useState } from 'react'

type TourStep = {
  title: string
  description: string
  highlightId?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Kubryx OS',
    description: 'Kubryx is a premium, unified blockchain operating system comprising 8 built-in financial and AI tools. Let’s take a 1-minute tour of your command center.',
  },
  {
    title: 'Multi-Chain Wallet Hub',
    description: 'Connect your MetaMask (EVM), Phantom (Solana), or Freighter (Stellar) wallets instantly. Once connected, you can sign transactions cryptographically with real explorer-linked confirmations.',
    highlightId: 'wallet-connector-section',
  },
  {
    title: 'The 8 Built-In Tools',
    description: 'Launch tools like CreditBlocks, Family Vault, Bill Split, and AI Lending directly. Each card lists its respective blockchain network—from QIE Mainnet to Stellar Testnet and Solana Devnet.',
    highlightId: 'command-tools-grid',
  },
  {
    title: 'Live SLA & Latency Diagnostics',
    description: 'View real-time response speeds and SLA uptime statistics for every connected backend. Kubryx measures API roundtrips dynamically.',
    highlightId: 'command-tools-grid',
  },
  {
    title: 'System Telemetry Logs',
    description: 'Check localized network diagnostics, RPC anomalies, and wallet connection rejections instantly. The Telemetry console records operations to keep developers and investors fully informed.',
    highlightId: 'telemetry-console-section',
  },
  {
    title: 'Demo & Presentation Safeties',
    description: 'Kubryx is built to be "always presentation-ready". If a backend or wallet is unavailable, the UI automatically enters Demo Mode with deterministic mock data, ensuring a flawless showcase.',
  },
]

export default function OnboardingTour() {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('kubryx_onboarded')
      if (!completed) {
        // First visit: Auto-start after a short delay
        const timer = setTimeout(() => setActive(true), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  useEffect(() => {
    if (!active) {
      removeHighlights()
      return
    }

    const step = TOUR_STEPS[stepIndex]
    removeHighlights()

    if (step?.highlightId) {
      const el = document.getElementById(step.highlightId)
      if (el) {
        el.style.position = 'relative'
        el.style.zIndex = '99999'
        el.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 20px rgba(245, 197, 24, 0.6)'
        el.style.transition = 'box-shadow 0.3s ease, z-index 0.3s ease'
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [active, stepIndex])

  function removeHighlights() {
    TOUR_STEPS.forEach((s) => {
      if (s.highlightId) {
        const el = document.getElementById(s.highlightId)
        if (el) {
          el.style.zIndex = ''
          el.style.boxShadow = ''
        }
      }
    })
  }

  function handleNext() {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1)
    }
  }

  function handleSkip() {
    handleComplete()
  }

  function handleComplete() {
    setActive(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kubryx_onboarded', 'true')
    }
  }

  function handleRestart() {
    setStepIndex(0)
    setActive(true)
  }

  if (!active) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          gap: 8
        }}
      >
        <button
          onClick={handleRestart}
          className="btn-outline"
          aria-label="Restart onboarding tour"
          style={{
            padding: '8px 14px',
            fontSize: 12,
            background: '#070707',
            borderColor: 'rgba(245, 197, 24, 0.4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>📖</span> Tour Guide
        </button>
      </div>
    )
  }

  const step = TOUR_STEPS[stepIndex]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99998,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: step?.highlightId ? 'transparent' : 'rgba(0, 0, 0, 0.65)',
        backdropFilter: step?.highlightId ? 'none' : 'blur(4px)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: '90%',
          maxWidth: 420,
          background: '#0a0a0a',
          border: '1px solid rgba(245, 197, 24, 0.45)',
          borderRadius: 12,
          padding: '24px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.85), inset 0 0 12px rgba(245, 197, 24, 0.05)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'fadeUp 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F5C518', fontWeight: 700 }}>
            Step {stepIndex + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              fontSize: 11,
              padding: 4,
            }}
            aria-label="Skip onboarding tour"
          >
            Skip
          </button>
        </div>

        <h3 className="gold-text" style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>
          {step.title}
        </h3>

        <p className="silver-text" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          {step.description}
        </p>

        {/* Tip helper tailored dynamically to target sections */}
        {step.highlightId === 'wallet-connector-section' && (
          <div style={{ padding: 10, background: 'rgba(245,197,24,0.02)', borderLeft: '3px solid #F5C518', fontSize: 11, borderRadius: '0 4px 4px 0' }}>
            💡 <strong>Wallet Tips:</strong><br />
            • <em>MetaMask</em> asks you to confirm network switching to QIE Mainnet (1990).<br />
            • <em>Phantom</em> signs cryptographic handshakes with ed25519 signatures.<br />
            • <em>Freighter</em> packages splits directly into signed Soroban Transaction XDR envelopes.
          </div>
        )}

        {step.highlightId === 'command-tools-grid' && (
          <div style={{ padding: 10, background: 'rgba(245,197,24,0.02)', borderLeft: '3px solid #F5C518', fontSize: 11, borderRadius: '0 4px 4px 0' }}>
            💡 <strong>Interactive Actions:</strong><br />
            • Click <strong>Open Tool</strong> to access the specialized execution UI.<br />
            • Click <strong>↻</strong> on any card to refresh connection latencies instantly.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <button
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className="btn-outline"
            style={{
              opacity: stepIndex === 0 ? 0.3 : 1,
              cursor: stepIndex === 0 ? 'default' : 'pointer',
              padding: '6px 12px',
              fontSize: 12,
            }}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="btn-outline"
            style={{
              padding: '6px 16px',
              fontSize: 12,
              borderColor: '#F5C518',
              color: '#F5C518',
              fontWeight: 600,
            }}
          >
            {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
