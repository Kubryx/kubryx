// Built by vsrupeshkumar
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/legacy', label: '🏛 Vault Home', exact: true },
  { href: '/legacy/upload', label: '📁 Upload', exact: false },
  { href: '/legacy/timeline', label: '📋 Timeline', exact: false },
  { href: '/legacy/heir', label: '🔐 Heir Access', exact: false },
  { href: '/legacy/validator', label: '⚖️ Validator', exact: false },
  { href: '/legacy/tokenization', label: '🪙 DLT Token', exact: false },
] as const

export default function LegacyNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        display: 'flex',
        gap: 6,
        padding: '14px 24px',
        borderBottom: '1px solid rgba(245,197,24,0.08)',
        flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#D97706',
          letterSpacing: '0.08em',
          marginRight: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span style={{ fontSize: 14 }}>🛡</span>
        Family Vault
      </span>
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              background: isActive ? 'rgba(245,197,24,0.12)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: isActive ? '#F5C518' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
