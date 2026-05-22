// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  fetchStaking,
  stakeNCRD,
  unstakeNCRD,
  type NcStakingData,
} from '../../../lib/neurocredit-api'
import { STAKING_TIERS, fallbackStaking, type StakingTier } from '../../../lib/neurocredit-fallbacks'
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
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
  justifyContent: 'center',
}

const btnDanger: React.CSSProperties = {
  background: 'transparent',
  color: '#F87171',
  border: '1px solid rgba(248,113,113,0.3)',
  borderRadius: 8,
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  marginBottom: 10,
  boxSizing: 'border-box',
}

function TierOrb({ tier }: { tier: StakingTier }) {
  const config = {
    None: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)', glow: 'transparent', label: '—', emoji: '' },
    Bronze: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)', glow: 'rgba(249,115,22,0.25)', label: 'Bronze', emoji: '🥉' },
    Silver: { bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.4)', glow: 'rgba(156,163,175,0.2)', label: 'Silver', emoji: '🥈' },
    Gold: { bg: 'rgba(245,197,24,0.12)', border: 'rgba(245,197,24,0.4)', glow: 'rgba(245,197,24,0.3)', label: 'Gold', emoji: '🥇' },
  }[tier]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: config.bg,
          border: `2px solid ${config.border}`,
          boxShadow: tier !== 'None' ? `0 0 32px ${config.glow}, 0 0 64px ${config.glow}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 42,
          animation: tier !== 'None' ? 'tierPulse 2.5s ease-in-out infinite' : 'none',
          transition: 'all 0.5s',
        }}
      >
        {config.emoji || '○'}
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
        {tier === 'None' ? 'No Tier' : `${config.emoji} ${config.label} Tier`}
      </p>
      <style>{`
        @keyframes tierPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  )
}

export default function StakePage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const { disconnectEVM } = useWallet()
  const wallet = address ?? ''
  const [data, setData] = useState<NcStakingData>(fallbackStaking)
  const [loading, setLoading] = useState(false)
  const [stakeAmt, setStakeAmt] = useState('')
  const [unstakeAmt, setUnstakeAmt] = useState('')
  const [txHash, setTxHash] = useState('')

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])

  // Load staking data whenever a wallet is connected.
  useEffect(() => {
    if (wallet) loadStaking(wallet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  async function loadStaking(addr: string) {
    setLoading(true)
    const d = await fetchStaking(addr)
    setData(d)
    setLoading(false)
  }

  function disconnect() {
    disconnectEVM()
    setData(fallbackStaking)
    setTxHash('')
    toast.success('Wallet disconnected')
  }

  async function handleStake() {
    const amount = parseFloat(stakeAmt)
    if (!wallet || isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return }
    if (amount > data.availableBalance) { toast.error('Insufficient balance'); return }
    setLoading(true)
    setTxHash('')
    const res = await stakeNCRD(wallet, amount)
    setTxHash(res.txHash)
    toast.success(`Staked ${amount} NCRD`)
    setStakeAmt('')
    // Optimistic update
    setData((prev) => ({
      ...prev,
      stakedAmount: prev.stakedAmount + amount,
      availableBalance: prev.availableBalance - amount,
    }))
    await loadStaking(wallet)
    setLoading(false)
  }

  async function handleUnstake() {
    const amount = parseFloat(unstakeAmt)
    if (!wallet || isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return }
    if (amount > data.stakedAmount) { toast.error('Exceeds staked amount'); return }
    setLoading(true)
    setTxHash('')
    const res = await unstakeNCRD(wallet, amount)
    setTxHash(res.txHash)
    toast.success(`Unstaked ${amount} NCRD`)
    setUnstakeAmt('')
    setData((prev) => ({
      ...prev,
      stakedAmount: prev.stakedAmount - amount,
      availableBalance: prev.availableBalance + amount,
    }))
    await loadStaking(wallet)
    setLoading(false)
  }

  const tierColor = (tier: StakingTier) => {
    if (tier === 'Gold') return '#F5C518'
    if (tier === 'Silver') return '#9CA3AF'
    if (tier === 'Bronze') return '#F97316'
    return 'rgba(255,255,255,0.25)'
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#8B5CF6', marginBottom: 4 }}>
          NCRD STAKING
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Stake NCRD</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
          Stake NCRD tokens to boost your credit score
        </p>
      </header>

      {/* No MetaMask */}
      {!installed && (
        <div style={{ ...card, textAlign: 'center', marginBottom: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>MetaMask is required.</p>
          <a href={WALLET_INSTALL_LINKS.metamask} target="_blank" rel="noopener noreferrer" style={btnPrimary}>
            Install MetaMask
          </a>
        </div>
      )}

      {installed && !wallet && (
        <div style={{ ...card, textAlign: 'center', padding: '40px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛡</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Connect wallet to stake</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Connect MetaMask on QIE Mainnet to stake NCRD tokens.
          </p>
          <ConnectButton type="evm" size="lg" />
        </div>
      )}

      {wallet && (
        <>
          {/* Wallet bar */}
          <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '12px 18px', marginBottom: 20 }}>
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

          {/* Tier orb + stats */}
          <div style={{ ...card, marginBottom: 20, textAlign: 'center' }}>
            <TierOrb tier={data.currentTier} />

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'STAKED', value: `${data.stakedAmount} NCRD`, color: '#A78BFA' },
                { label: 'AVAILABLE', value: `${data.availableBalance} NCRD`, color: 'rgba(255,255,255,0.7)' },
                { label: 'CURRENT TIER', value: data.currentTier, color: tierColor(data.currentTier) },
                { label: 'SCORE BOOST', value: `+${data.scoreBoost}`, color: '#22C55E' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', margin: '0 0 6px' }}>{s.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Progress to next tier */}
            {data.nextTierName && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                  <span>Progress to {data.nextTierName}</span>
                  <span>{data.progressToNextTier.toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${data.progressToNextTier}%`,
                      background: 'linear-gradient(90deg, #8B5CF6, #3B5BFA)',
                      borderRadius: 99,
                      transition: 'width 1s',
                    }}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>
                  Need {data.nextTierRequired.toLocaleString()} more NCRD for {data.nextTierName} tier
                </p>
              </div>
            )}
          </div>

          {/* Stake / Unstake panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={card}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Stake NCRD</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Increase your credit score by staking tokens</p>
              <input
                type="number"
                placeholder="Amount to stake"
                value={stakeAmt}
                min={0}
                onChange={(e) => setStakeAmt(e.target.value)}
                style={input}
              />
              <button
                style={{ ...btnPrimary, opacity: loading || !stakeAmt ? 0.6 : 1 }}
                onClick={handleStake}
                disabled={loading || !stakeAmt}
              >
                {loading ? 'Processing…' : 'Stake'}
              </button>
            </div>

            <div style={card}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Unstake NCRD</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Unstaking reduces your score boost</p>
              <input
                type="number"
                placeholder="Amount to unstake"
                value={unstakeAmt}
                min={0}
                onChange={(e) => setUnstakeAmt(e.target.value)}
                style={input}
              />
              <button
                style={{ ...btnDanger, opacity: loading || !unstakeAmt || data.stakedAmount === 0 ? 0.5 : 1 }}
                onClick={handleUnstake}
                disabled={loading || !unstakeAmt || data.stakedAmount === 0}
              >
                {loading ? 'Processing…' : 'Unstake'}
              </button>
            </div>
          </div>

          {/* TX hash */}
          {txHash && (
            <div style={{ ...card, marginBottom: 20, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <p style={{ color: '#A78BFA', fontWeight: 600, fontSize: 13, margin: '0 0 4px' }}>Transaction confirmed ✓</p>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, wordBreak: 'break-all' }}>
                {txHash}
              </p>
            </div>
          )}

          {/* Tier benefits */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
            TIER BENEFITS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {(Object.entries(STAKING_TIERS) as [StakingTier, typeof STAKING_TIERS.Bronze][]).map(([tier, cfg]) => {
              const isCurrent = data.currentTier === tier
              const isLocked = !isCurrent && data.stakedAmount < cfg.required
              return (
                <div
                  key={tier}
                  style={{
                    ...card,
                    border: `1px solid ${isCurrent ? `${cfg.color}50` : 'rgba(255,255,255,0.08)'}`,
                    background: isCurrent ? `${cfg.color}0C` : 'rgba(255,255,255,0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <p style={{ fontSize: 20, marginBottom: 6 }}>{cfg.emoji}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: cfg.color, margin: '0 0 4px' }}>{tier}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 8px' }}>
                    Requires {cfg.required.toLocaleString()} NCRD
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#22C55E', margin: '0 0 10px' }}>
                    +{cfg.boost} score boost
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 10,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: isCurrent
                        ? `${cfg.color}20`
                        : isLocked
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(34,197,94,0.1)',
                      border: `1px solid ${isCurrent ? `${cfg.color}40` : isLocked ? 'rgba(255,255,255,0.1)' : 'rgba(34,197,94,0.3)'}`,
                      color: isCurrent ? cfg.color : isLocked ? 'rgba(255,255,255,0.3)' : '#22C55E',
                      fontWeight: 600,
                    }}
                  >
                    {isCurrent ? '✓ Current Tier' : isLocked ? '🔒 Locked' : '↑ Upgrade Available'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
