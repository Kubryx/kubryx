'use client'

import { CIPHERVAULT_ACCENT } from '@/lib/vault-fallbacks'

export type VaultTabId = 'dashboard' | 'collateral' | 'dwallet' | 'trade' | 'history'

const TABS: { id: VaultTabId; label: string; icon: string }[] = [
  { id: 'dashboard',  label: 'Dashboard',     icon: '⊞' },
  { id: 'collateral', label: 'Collateral',    icon: '◊' },
  { id: 'dwallet',    label: 'dWallet',       icon: '⬢' },
  { id: 'trade',      label: 'Private Trade', icon: '⇄' },
  { id: 'history',    label: 'History',       icon: '◴' },
]

const BORDER = 'rgba(255,255,255,0.08)'
const MUTED  = 'rgba(255,255,255,0.55)'

export default function CipherVaultTabBar({
  active,
  onChange,
}: {
  active: VaultTabId
  onChange: (tab: VaultTabId) => void
}) {
  return (
    <nav style={{
      display: 'flex', gap: 0, padding: '0 16px',
      background: '#0C0C0C',
      borderBottom: `1px solid ${BORDER}`,
      overflowX: 'auto',
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 16px',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${isActive ? CIPHERVAULT_ACCENT : 'transparent'}`,
              color: isActive ? CIPHERVAULT_ACCENT : MUTED,
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = MUTED }}
          >
            <span style={{ opacity: 0.8 }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
