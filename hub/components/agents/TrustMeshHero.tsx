// Built by vsrupeshkumar
'use client'

import { TRUSTMESH_ACCENT, TRUSTMESH_PROGRAM_ID } from '@/lib/agents-fallbacks'

const ACCENT = TRUSTMESH_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.35)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

function short(addr: string) {
  return `${addr.slice(0, 5)}…${addr.slice(-5)}`
}

export default function TrustMeshHero({
  walletAddress,
  onConnectWallet,
  isLive,
}: {
  walletAddress?: string
  onConnectWallet?: () => void
  isLive?: boolean
}) {
  return (
    <div style={{
      background: '#0C0C0C',
      borderBottom: `1px solid ${BORDER}`,
      padding: '24px 28px',
    }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: MUTED2, fontFamily: MONO, marginBottom: 14,
      }}>
        <span>Kubryx</span>
        <span>›</span>
        <span style={{ color: ACCENT }}>Agent Coordinator</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 480px' }}>
          {/* Title + icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${ACCENT}25`, border: `1px solid ${ACCENT}45`,
              display: 'grid', placeItems: 'center',
              fontSize: 20, color: ACCENT, fontWeight: 800,
            }}>⬡</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'Georgia, "Playfair Display", serif', letterSpacing: '-0.01em', lineHeight: 1 }}>
                Agent Coordinator
              </div>
              <div style={{ fontSize: 12, color: MUTED2, marginTop: 4 }}>
                AI Agent Coordination · Solana Devnet
              </div>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: 13, color: MUTED, maxWidth: 640, marginTop: 10, marginBottom: 14, lineHeight: 1.6 }}>
            Every agent. Every decision. On chain. Spawn signed Solana agents, chain delegation through a
            verifiable mesh, and audit every message on devnet.
          </p>

          {/* Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontFamily: MONO, color: MUTED2,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
              padding: '4px 8px', borderRadius: 6,
            }}>
              Program: {short(TRUSTMESH_PROGRAM_ID)}
            </span>
            <Pill color="#f59e0b" label="Demo Data" pulse={false} />
            <Pill color={isLive ? '#10b981' : '#f59e0b'} label={isLive ? 'Devnet Live' : 'Devnet Offline'} pulse={!!isLive} />
          </div>
        </div>

        {/* Action buttons */}
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
            {walletAddress ? short(walletAddress) : 'Connect Phantom'}
          </button>
          <a
            href="/agents?tab=deploy"
            style={{
              padding: '10px 16px', borderRadius: 8,
              background: ACCENT, color: '#fff',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#5254cc' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ACCENT }}
          >
            Deploy Mesh →
          </a>
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
        animation: pulse ? 'pulse-hero 1.6s ease-out infinite' : 'none',
      }} />
      {label}
      <style>{`
        @keyframes pulse-hero {
          0%   { box-shadow: 0 0 0 0 ${color}80; }
          70%  { box-shadow: 0 0 0 6px ${color}00; }
          100% { box-shadow: 0 0 0 0 ${color}00; }
        }
      `}</style>
    </span>
  )
}
