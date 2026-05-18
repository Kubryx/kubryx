'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/agents', label: 'Overview' },
  { href: '/agents/explorer', label: 'Explorer' },
  { href: '/agents/nodes', label: 'Node Registry' },
  { href: '/agents/deploy', label: 'Deploy' },
  { href: '/agents/analytics', label: 'Analytics' },
]

export default function AgentsTabs() {
  const pathname = usePathname() || '/agents'
  return (
    <nav
      aria-label="TrustMesh sections"
      style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        marginTop: 16,
        padding: 6,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      {TABS.map((tab) => {
        const active =
          tab.href === '/agents'
            ? pathname === '/agents'
            : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              color: active ? '#080808' : '#fff',
              background: active ? '#F5C518' : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
