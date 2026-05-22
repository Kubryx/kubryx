// Built by vsrupeshkumar
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { ConnectButton } from './wallet/ConnectButton'
import { NetworkBadge } from './wallet/NetworkBadge'

const GOLD = '#F5C518'
const BG = '#080808'
const BORDER = 'rgba(255,255,255,0.08)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

const BREADCRUMB_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  split: 'Bill split',
  credit: 'Credit Passport',
  legacy: 'Family vault',
  agents: 'Agent co-ordinator',
  vault: 'Private vault',
  lend: 'Protocol Borrow Engine',
  treasury: 'PalmFlow AI',
  shadow: 'ShadowLedger',
  send: 'Send',
  receive: 'Receive',
  swap: 'Swap',
  transactions: 'Transactions',
  analytics: 'Analytics',
  settings: 'Settings',
}

interface Props {
  onMobileToggle: () => void
  isMobile: boolean
}

export default function TopBar({ onMobileToggle, isMobile }: Props) {
  const pathname = usePathname()
  const [notifOpen, setNotifOpen] = useState(false)

  const parts = pathname.split('/').filter(Boolean)
  const crumbs = parts.map((p, i) => ({
    label: BREADCRUMB_NAMES[p] || p.charAt(0).toUpperCase() + p.slice(1),
    href: '/' + parts.slice(0, i + 1).join('/'),
  }))

  return (
    <header style={{
      height: 60,
      borderBottom: `1px solid ${BORDER}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      background: BG,
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>

      {/* Mobile hamburger */}
      {isMobile && (
        <button onClick={onMobileToggle} style={{
          background: 'none',
          border: `1px solid ${BORDER}`,
          color: 'rgba(255,255,255,0.5)',
          borderRadius: 8,
          width: 36, height: 36,
          display: 'grid', placeItems: 'center',
          cursor: 'pointer',
          fontSize: 16,
          flexShrink: 0,
        }}>☰</button>
      )}

      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
          Hub
        </Link>
        {crumbs.map((c, i) => (
          <span key={c.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>/</span>
            {i === crumbs.length - 1 ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: GOLD, whiteSpace: 'nowrap' }}>{c.label}</span>
            ) : (
              <Link href={c.href} style={{ textDecoration: 'none', fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Live network badge — reflects the wallet's actual chain */}
        {!isMobile && <NetworkBadge />}

        {/* System status */}
        {!isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 8,
            border: '1px solid rgba(34,197,94,0.25)',
            background: 'rgba(34,197,94,0.08)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, color: '#86EFAC', fontWeight: 600 }}>All Live</span>
          </div>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(v => !v)} style={{
            width: 36, height: 36,
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            fontSize: 15,
            position: 'relative',
          }}>
            🔔
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: GOLD, border: '1.5px solid #080808',
            }} />
          </button>
          {notifOpen && (
            <div style={{
              position: 'absolute', top: 44, right: 0, width: 280,
              background: '#0C0C0C', border: `1px solid ${BORDER}`,
              borderRadius: 12, overflow: 'hidden', zIndex: 100,
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 700, color: '#fff' }}>
                Notifications
              </div>
              {[
                { icon: '◇', msg: 'PalmFlow: Yield Operations Hub rebalanced', time: '2m ago', color: '#10b981' },
                { icon: '◈', msg: 'Credit Passport: Score updated to 742', time: '15m ago', color: '#06b6d4' },
                { icon: '⬡', msg: 'Agent co-ordinator: Agent deployed', time: '1h ago', color: '#6366f1' },
              ].map((n, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px', borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span style={{ fontSize: 16, color: n.color, flexShrink: 0 }}>{n.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{n.msg}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontFamily: MONO }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallet connect / connected pill */}
        <ConnectButton type="auto" size="sm" />
      </div>
    </header>
  )
}
