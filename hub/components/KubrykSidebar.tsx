// Built by vsrupeshkumar
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { TOOLS as TOOL_REGISTRY } from '../lib/tools'
import { WalletPill } from './wallet/WalletPill'

const GOLD = '#F5C518'
const BG = '#080808'
const BORDER = 'rgba(255,255,255,0.08)'
const MONO = '"Fira Code","JetBrains Mono",monospace'

/* Nav items derived from the central tool registry (lib/tools.ts) so names
   and colors stay consistent across the whole platform. */
const TOOLS = TOOL_REGISTRY.map(t => ({
  icon: t.icon,
  name: t.name,
  href: t.route,
  color: t.color,
  desc: t.tagline,
}))

interface Props {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  isMobile: boolean
}

export default function KubrykSidebar({ collapsed, onToggle, mobileOpen, onMobileClose, isMobile }: Props) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const w = isMobile ? 280 : collapsed ? 80 : 280
  const visible = isMobile ? mobileOpen : true
  const transform = isMobile
    ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)')
    : 'translateX(0)'

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 49 }}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: w,
        background: BG,
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'width 0.22s ease, transform 0.22s ease',
        transform,
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed && !isMobile ? '20px 0' : '20px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          minHeight: 72,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${GOLD}, #D4A017)`,
            display: 'grid', placeItems: 'center',
            fontSize: 18, fontWeight: 900, color: '#0A0F2E',
          }}>K</div>
          {(!collapsed || isMobile) && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>Kubryx</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', marginTop: 2, fontFamily: MONO }}>FINANCIAL OS</div>
            </div>
          )}
        </div>

        {/* Dashboard link */}
        <div style={{ padding: collapsed && !isMobile ? '10px 8px' : '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
          <Link href="/dashboard" style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed && !isMobile ? '8px' : '9px 12px',
            borderRadius: 10,
            background: pathname === '/dashboard' ? `${GOLD}18` : 'transparent',
            border: `1px solid ${pathname === '/dashboard' ? GOLD + '40' : 'transparent'}`,
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 18, color: pathname === '/dashboard' ? GOLD : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>⊞</span>
            {(!collapsed || isMobile) && (
              <span style={{ fontSize: 13, fontWeight: 600, color: pathname === '/dashboard' ? GOLD : 'rgba(255,255,255,0.65)' }}>
                Dashboard
              </span>
            )}
          </Link>
        </div>

        {/* Tool Nav */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed && !isMobile ? '12px 8px' : '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          {(!collapsed || isMobile) && (
            <div style={{
              fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '4px 8px', marginBottom: 4, fontFamily: MONO,
            }}>Tools</div>
          )}
          {TOOLS.map(tool => {
            const active = isActive(tool.href)
            return (
              <Link key={tool.href} href={tool.href} style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed && !isMobile ? '10px' : '9px 12px',
                borderRadius: 10,
                background: active ? `${tool.color}18` : 'transparent',
                border: `1px solid ${active ? tool.color + '35' : 'transparent'}`,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: active ? `${tool.color}25` : 'rgba(255,255,255,0.06)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 14,
                  color: active ? tool.color : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s',
                }}>{tool.icon}</span>
                {(!collapsed || isMobile) && (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? tool.color : 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', lineHeight: 1.2, marginTop: 1 }}>
                        {tool.desc}
                      </div>
                    </div>
                    {active && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tool.color, flexShrink: 0 }} />
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Wallet — connect button or connected address pill */}
        {(!collapsed || isMobile) && <WalletPill />}

        {/* Quick stats */}
        {(!collapsed || isMobile) && (
          <div style={{
            margin: '0 12px 12px',
            padding: 12,
            borderRadius: 12,
            background: `${GOLD}10`,
            border: `1px solid ${GOLD}25`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontFamily: MONO }}>
              Platform
            </div>
            {[
              { label: 'Tools', value: '8' },
              { label: 'Chains', value: '4' },
              { label: 'Status', value: 'Live' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: MONO }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}` }}>
            <button onClick={onToggle} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              padding: collapsed ? '9px' : '9px 12px',
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              background: 'transparent',
              color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              fontSize: 12,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>{collapsed ? '→' : '←'}</span>
              {!collapsed && <span>Collapse sidebar</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
