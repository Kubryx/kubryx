'use client'

import { CIPHERVAULT_ACCENT } from '@/lib/vault-fallbacks'

const ACCENT = CIPHERVAULT_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.35)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

function short(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}` }

export default function CipherVaultHero({
  walletAddress,
  onConnectWallet,
  onDeposit,
  isLive,
  isDemo,
}: {
  walletAddress?: string
  onConnectWallet?: () => void
  onDeposit?: () => void
  isLive?: boolean
  isDemo?: boolean
}) {
  return (
    <div style={{
      background: '#0C0C0C',
      borderBottom: `1px solid ${BORDER}`,
      padding: '24px 28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: MUTED2, fontFamily: MONO, marginBottom: 14 }}>
        <span>Kubryx</span>
        <span>›</span>
        <span style={{ color: ACCENT }}>CipherVault</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${ACCENT}25`, border: `1px solid ${ACCENT}45`,
              display: 'grid', placeItems: 'center',
              fontSize: 20, color: ACCENT, fontWeight: 800,
            }}>◈</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'Georgia, "Playfair Display", serif', letterSpacing: '-0.01em', lineHeight: 1 }}>
                CipherVault
              </div>
              <div style={{ fontSize: 12, color: MUTED2, marginTop: 4 }}>
                Cross-Chain Privacy Vault · MPC + FHE
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: MUTED, maxWidth: 640, marginTop: 10, marginBottom: 14, lineHeight: 1.6 }}>
            Deposit collateral across BTC, ETH, and SOL. Register MPC-secured dWallets.
            Execute private FHE-encrypted trades.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Pill color={ACCENT}   label="MPC Secured"  pulse={false} />
            <Pill color="#a855f7"  label="FHE Private"  pulse={false} />
            <Pill color={isDemo ? '#f59e0b' : '#10b981'} label={isDemo ? 'Demo Data' : 'Live Connection'} pulse={false} />
            <Pill color={isLive ? '#10b981' : '#f59e0b'} label={isLive ? 'Multi-chain Live' : 'Multi-chain Offline'} pulse={!!isLive} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onConnectWallet}
            style={{
              padding: '10px 16px', borderRadius: 8,
              border: `1px solid ${BORDER}`, background: 'transparent',
              color: walletAddress ? ACCENT : MUTED, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: walletAddress ? MONO : 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {walletAddress ? short(walletAddress) : 'Connect Wallet'}
          </button>
          <button
            onClick={onDeposit}
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: ACCENT, color: '#fff',
              fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0e9488' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ACCENT }}
          >
            + Deposit →
          </button>
        </div>
      </div>
    </div>
  )
}

function Pill({ color, label, pulse }: { color: string; label: string; pulse: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: color,
        animation: pulse ? 'pulse-vault 1.6s ease-out infinite' : 'none',
      }} />
      {label}
      <style>{`
        @keyframes pulse-vault {
          0%   { box-shadow: 0 0 0 0 ${color}80; }
          70%  { box-shadow: 0 0 0 6px ${color}00; }
          100% { box-shadow: 0 0 0 0 ${color}00; }
        }
      `}</style>
    </span>
  )
}
