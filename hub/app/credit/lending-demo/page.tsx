// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  fetchLendingOffers,
  fetchScoreBreakdown,
  type NcLoanOffer,
} from '../../../lib/neurocredit-api'
import { getRating, fallbackLoanOffers } from '../../../lib/neurocredit-fallbacks'
import {
  isMetaMaskInstalled,
  truncateAddress,
  WALLET_INSTALL_LINKS,
} from '../../../lib/wallet-utils'
import { toast } from '../../../lib/toast'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { useWallet } from '../../../context/WalletContext'
import { ConnectButton } from '../../../components/wallet/ConnectButton'

// ─── Style helpers ────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '20px 22px',
}

const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #8B5CF6, #3B5BFA)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

function StatPill({ label, value, color = '#fff' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.07em', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: 16, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  )
}

function OfferCard({ offer, index, score }: { offer: NcLoanOffer; index: number; score: number }) {
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const labels = ['Recommended for your risk profile', 'Best value', 'Available based on your score']
  const accentColors = ['#8B5CF6', '#22C55E', '#F5C518']
  const accent = accentColors[index % accentColors.length]

  async function accept() {
    setAccepting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setAccepted(true)
    setAccepting(false)
    toast.success(`Offer accepted — $${offer.loanAmount.toLocaleString()} at ${offer.interestRate}% APR`)
  }

  return (
    <div
      style={{
        ...card,
        border: `1px solid ${accent}30`,
        background: `${accent}08`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accent}00, ${accent}, ${accent}00)`,
        }}
      />

      {/* Badge */}
      <span
        style={{
          display: 'inline-block',
          fontSize: 10,
          padding: '3px 10px',
          borderRadius: 12,
          background: `${accent}18`,
          border: `1px solid ${accent}40`,
          color: accent,
          fontWeight: 600,
          alignSelf: 'flex-start',
        }}
      >
        {offer.recommendation || labels[index]}
      </span>

      {/* Amount */}
      <div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', fontWeight: 700, letterSpacing: '0.07em' }}>
          LOAN AMOUNT
        </p>
        <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0 }}>
          ${offer.loanAmount.toLocaleString()}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatPill label="INTEREST RATE" value={`${offer.interestRate}%`} color="#60A5FA" />
        <StatPill label="DURATION" value={`${offer.duration} months`} color="rgba(255,255,255,0.7)" />
        <StatPill
          label="COLLATERAL"
          value={`$${offer.collateralRequired.toLocaleString()}`}
          color="rgba(255,255,255,0.6)"
        />
        <StatPill label="LTV RATIO" value={`${offer.ltv}%`} color="rgba(255,255,255,0.6)" />
      </div>

      {/* Accept button */}
      {accepted ? (
        <div
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#22C55E',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          ✓ Offer Accepted
        </div>
      ) : (
        <button
          onClick={accept}
          disabled={accepting}
          style={{
            ...btnPrimary,
            background: `linear-gradient(135deg, ${accent}CC, ${accent})`,
            width: '100%',
            justifyContent: 'center',
            opacity: accepting ? 0.7 : 1,
          }}
        >
          {accepting ? 'Processing…' : 'Accept Offer'}
        </button>
      )}
    </div>
  )
}

export default function LendingDemoPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const { disconnectEVM } = useWallet()
  const wallet = address ?? ''
  const [score, setScore] = useState(0)
  const [offers, setOffers] = useState<NcLoanOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [hasScore, setHasScore] = useState(false)

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])

  // Load lending offers whenever a wallet is connected.
  useEffect(() => {
    if (wallet) loadOffers(wallet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  async function loadOffers(addr: string) {
    setLoading(true)
    const [bd, lendingData] = await Promise.all([
      fetchScoreBreakdown(addr),
      fetchLendingOffers(addr),
    ])
    setScore(lendingData.creditScore || bd.score)
    setOffers(lendingData.offers.length ? lendingData.offers : fallbackLoanOffers)
    setHasScore(true)
    setLoading(false)
  }

  function disconnect() {
    disconnectEVM()
    setScore(0)
    setOffers([])
    setHasScore(false)
    toast.success('Wallet disconnected')
  }

  const { label: ratingLabel, color: ratingColor } = getRating(score || 650)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#8B5CF6', marginBottom: 4 }}>
          DEFI LENDING
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>DeFi Lending Demo</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
          See how your credit score affects borrowing terms
        </p>
      </header>

      {/* No MetaMask */}
      {!installed && (
        <div style={{ ...card, textAlign: 'center', padding: '40px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>MetaMask Required</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Install MetaMask to see personalized lending terms.
          </p>
          <a href={WALLET_INSTALL_LINKS.metamask} target="_blank" rel="noopener noreferrer"
            style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-flex' }}>
            Install MetaMask
          </a>
        </div>
      )}

      {/* Not connected — STATE A */}
      {installed && !wallet && (
        <div style={{ ...card, textAlign: 'center', padding: '60px 24px' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 36,
            }}
          >
            💳
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Generate Credit Score First</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Generate your credit score to see personalized lending terms tailored to your on-chain profile.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <ConnectButton type="evm" size="lg" />
            <Link
              href="/credit"
              style={{
                ...btnPrimary,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                display: 'inline-flex',
              }}
            >
              Generate Credit Score
            </Link>
          </div>
        </div>
      )}

      {/* Connected — STATE B */}
      {wallet && (
        <>
          {/* Wallet bar */}
          <div
            style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '12px 18px', marginBottom: 20 }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              {truncateAddress(wallet)}
            </span>
            <button
              onClick={disconnect}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}
            >
              Disconnect
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{ ...card, height: 340, background: 'rgba(255,255,255,0.02)', animation: 'pulse 2s infinite' }}
                />
              ))}
            </div>
          ) : hasScore ? (
            <>
              {/* Score summary bar */}
              <div
                style={{
                  ...card,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 20,
                  padding: '14px 20px',
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Your credit score:</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>{score}</p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 12px',
                    borderRadius: 14,
                    background: `${ratingColor}18`,
                    border: `1px solid ${ratingColor}40`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ratingColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: ratingColor }}>{ratingLabel}</span>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                YOUR PERSONALIZED LOAN OFFERS
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
                {offers.map((offer, i) => (
                  <OfferCard key={offer.id} offer={offer} index={i} score={score} />
                ))}
              </div>

              {/* Score impact note */}
              <div
                style={{
                  ...card,
                  background: 'rgba(139,92,246,0.04)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  padding: '14px 18px',
                }}
              >
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
                  💡 Higher credit score = better rates and lower collateral requirements.
                  Your current score ({score}) qualifies for all three offers. Stake NCRD to boost your score and unlock better terms.
                </p>
              </div>
            </>
          ) : null}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  )
}
