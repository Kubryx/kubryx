'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadWallet, persistWallet } from '@/lib/wallet-utils'
import { toast } from '@/lib/toast'
import CipherVaultHero from '@/components/vault/CipherVaultHero'
import CipherVaultTabBar, { type VaultTabId } from '@/components/vault/CipherVaultTabBar'
import VaultDashboard from '@/components/vault/VaultDashboard'
import CollateralManager from '@/components/vault/CollateralManager'
import DWalletManager from '@/components/vault/DWalletManager'
import FHETradeForm from '@/components/vault/FHETradeForm'
import VaultHistory from '@/components/vault/VaultHistory'

type PhantomProvider = { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> }
declare global { interface Window { solana?: PhantomProvider } }

const apiBase = process.env.NEXT_PUBLIC_CIPHER_URL || process.env.NEXT_PUBLIC_CIPHER_API || ''
const VALID: VaultTabId[] = ['dashboard', 'collateral', 'dwallet', 'trade', 'history']

function VaultInner() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = (params.get('tab') as VaultTabId) || 'dashboard'
  const [tab, setTab] = useState<VaultTabId>(VALID.includes(initial) ? initial : 'dashboard')
  const [wallet, setWallet] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [privacyScore, setPrivacyScore] = useState<number | undefined>(undefined)

  useEffect(() => {
    setWallet(loadWallet('solana') || '')
    if (!apiBase) return
    fetch(`${apiBase}/health`).then(r => r.ok && r.json()).then(d => setIsLive(d?.status === 'ok')).catch(() => {})
    fetch(`${apiBase}/api/privacy/score`).then(r => r.ok && r.json()).then(d => d?.score && setPrivacyScore(d.score)).catch(() => {})
  }, [])

  useEffect(() => {
    router.replace(tab === 'dashboard' ? '/vault' : `/vault?tab=${tab}`, { scroll: false })
  }, [tab, router])

  async function connect() {
    if (!window.solana?.isPhantom) { toast.error('Phantom not detected'); return }
    try {
      const r = await window.solana.connect()
      const addr = r.publicKey.toString()
      setWallet(addr); persistWallet('solana', addr); toast.success('Wallet connected')
    } catch { toast.error('Connection cancelled') }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <CipherVaultHero
        walletAddress={wallet}
        onConnectWallet={connect}
        onDeposit={() => setTab('collateral')}
        isLive={isLive}
        isDemo={!isLive}
      />
      <CipherVaultTabBar active={tab} onChange={setTab} />
      <div>
        {tab === 'dashboard'  && <VaultDashboard walletAddress={wallet} privacyScore={privacyScore} onGoToCollateral={() => setTab('collateral')} onGoToHistory={() => setTab('history')} />}
        {tab === 'collateral' && <CollateralManager walletAddress={wallet} />}
        {tab === 'dwallet'    && <DWalletManager />}
        {tab === 'trade'      && <FHETradeForm walletAddress={wallet} />}
        {tab === 'history'    && <VaultHistory />}
      </div>
    </div>
  )
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080808' }} />}>
      <VaultInner />
    </Suspense>
  )
}
