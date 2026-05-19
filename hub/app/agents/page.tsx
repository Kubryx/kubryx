'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadWallet, persistWallet } from '@/lib/wallet-utils'
import { toast } from '@/lib/toast'
import { fetchAnalytics } from '@/lib/trustmesh-api'
import TrustMeshHero from '@/components/agents/TrustMeshHero'
import TrustMeshTabBar, { type AgentsTabId } from '@/components/agents/TrustMeshTabBar'
import AgentDashboard from '@/components/agents/AgentDashboard'
import JobsExplorer from '@/components/agents/JobsExplorer'
import NodeRegistry from '@/components/agents/NodeRegistry'
import DeployWizard from '@/components/agents/DeployWizard'
import AgentAnalytics from '@/components/agents/AgentAnalytics'

type PhantomLike = {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
}
function getPhantom(): PhantomLike | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { solana?: PhantomLike }).solana
}

const VALID_TABS: AgentsTabId[] = ['dashboard', 'jobs', 'registry', 'deploy', 'analytics']

function AgentsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as AgentsTabId | null
  const initialTab: AgentsTabId = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'dashboard'

  const [activeTab, setActiveTab] = useState<AgentsTabId>(initialTab)
  const [wallet, setWallet] = useState('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    setWallet(loadWallet('solana') || '')
    fetchAnalytics().then(r => setIsLive(r.isLive)).catch(() => {})
  }, [])

  useEffect(() => {
    // Keep URL in sync with active tab (replace, no history clutter)
    const url = activeTab === 'dashboard' ? '/agents' : `/agents?tab=${activeTab}`
    router.replace(url, { scroll: false })
  }, [activeTab, router])

  async function handleConnectWallet() {
    const provider = getPhantom()
    if (!provider?.isPhantom) {
      toast.error('Phantom wallet not detected. Install from phantom.app')
      return
    }
    try {
      const res = await provider.connect()
      const addr = res.publicKey.toString()
      setWallet(addr)
      persistWallet('solana', addr)
      toast.success('Wallet connected')
    } catch {
      toast.error('Wallet connection cancelled')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <TrustMeshHero
        walletAddress={wallet}
        onConnectWallet={handleConnectWallet}
        isLive={isLive}
      />
      <TrustMeshTabBar active={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === 'dashboard' && <AgentDashboard />}
        {activeTab === 'jobs'      && <JobsExplorer />}
        {activeTab === 'registry'  && <NodeRegistry />}
        {activeTab === 'deploy'    && <DeployWizard />}
        {activeTab === 'analytics' && <AgentAnalytics />}
      </div>
    </div>
  )
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080808' }} />}>
      <AgentsPageInner />
    </Suspense>
  )
}
