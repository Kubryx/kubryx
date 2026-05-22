// Built by vsrupeshkumar
'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import KubrykSidebar from '../../components/KubrykSidebar'
import TopBar from '../../components/TopBar'
import { WalletProvider } from '../../context/WalletContext'
import { WrongNetworkBanner } from '../../components/wallet/WrongNetwork'

/* Paths that render inside the hub shell (sidebar + topbar).
   /dashboard is self-contained — it owns its own sidebar. */
const HUB_PREFIXES: string[] = [
  '/credit', '/legacy', '/agents', '/vault', '/split', '/lend', '/treasury', '/shadow',
  '/performance', '/architecture', '/developers', '/governance', '/operations', '/executive',
  '/security', '/coordination', '/policies', '/integrations', '/ecosystem', '/analytics',
  '/story', '/protocols'
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const showShell = HUB_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))

  /* WalletProvider wraps every hub route (shell + the self-contained
     /dashboard) so useWallet works platform-wide. The landing page renders
     inside it too — harmless, the provider has no effect until used. */
  if (!showShell) return <WalletProvider>{children}</WalletProvider>

  /* sidebar occupies fixed space; main content shifts right */
  const sidebarWidth = isMobile ? 0 : (collapsed ? 80 : 280)

  return (
    <WalletProvider>
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex' }}>
      {mounted && (
        <KubrykSidebar
          collapsed={isMobile ? false : collapsed}
          onToggle={() => setCollapsed(v => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          isMobile={isMobile}
        />
      )}

      <div style={{
        marginLeft: mounted ? sidebarWidth : 0,
        transition: 'margin-left 0.22s ease',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}>
        {mounted && (
          <TopBar
            onMobileToggle={() => setMobileOpen(v => !v)}
            isMobile={isMobile}
          />
        )}
        <main style={{ flex: 1 }}>
          {/* Route-aware wrong-network warning — shows for any tool whose
              required chain differs from the connected EVM wallet's chain. */}
          <WrongNetworkBanner />
          {children}
        </main>
      </div>
    </div>
    </WalletProvider>
  )
}
