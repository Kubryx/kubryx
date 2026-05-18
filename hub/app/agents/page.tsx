'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchJobs } from '../../lib/trustmesh-api'
import {
  fallbackJobs,
  type JobsResponse,
} from '../../lib/trustmesh-fallbacks'
import { toast } from '../../lib/toast'
import { loadWallet, persistWallet } from '../../lib/wallet-utils'
import LiveBadge from './_components/LiveBadge'

type PhantomLike = {
  isPhantom?: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
}

function getPhantom(): PhantomLike | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { solana?: PhantomLike }).solana
}

const SECTIONS = [
  {
    href: '/agents/explorer',
    title: 'Jobs Explorer',
    desc: 'Browse every coordination job and see the live agent mesh as an interactive graph.',
    badge: 'Live',
  },
  {
    href: '/agents/nodes',
    title: 'Node Registry',
    desc: 'Search and filter every agent. Click any row to jump to its job graph.',
    badge: 'Searchable',
  },
  {
    href: '/agents/deploy',
    title: 'Deploy Wizard',
    desc: 'Three-step flow — configure, name identities, review — then sign and ship.',
    badge: '3 steps',
  },
  {
    href: '/agents/analytics',
    title: 'Analytics',
    desc: 'Throughput, status mix, hourly activity, and integrity violations at a glance.',
    badge: 'Charts',
  },
] as const

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function AgentsOverviewPage() {
  const [wallet, setWallet] = useState('')
  const [stats, setStats] = useState<JobsResponse['stats']>(fallbackJobs.stats)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const saved = loadWallet('solana')
    if (saved) setWallet(saved)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchJobs().then((res) => {
      if (cancelled) return
      setStats(res.data.stats)
      setIsLive(res.isLive)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function connectWallet() {
    try {
      const phantom = getPhantom()
      if (!phantom?.isPhantom) {
        toast.info('Phantom not detected — Explorer will run in demo mode')
        return
      }
      const result = await phantom.connect()
      const addr = result.publicKey.toString()
      setWallet(addr)
      persistWallet('solana', addr)
      toast.success('Phantom connected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not connect Phantom')
    }
  }

  return (
    <main>
      <section
        className="dashboard-hero"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <p className="eyebrow">TrustMesh on Kubryx</p>
          <h1>Every agent. Every decision. On chain.</h1>
          <p className="silver-text" style={{ maxWidth: 620 }}>
            Spawn signed Solana agents, chain delegation through a verifiable
            mesh, and audit every message on devnet. Five surfaces, one source
            of truth.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <LiveBadge isLive={isLive} />
            <span style={{ fontSize: 11, color: '#fff', opacity: 0.7 }}>
              {stats.activeCount} active · {stats.agentCount} agents · {stats.breachCount} breaches
            </span>
          </div>
        </div>
        <div className="hero-actions" style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-gold"
            onClick={connectWallet}
            aria-label={wallet ? `Connected as ${shortAddress(wallet)}` : 'Connect Phantom Wallet'}
          >
            {wallet ? shortAddress(wallet) : 'Connect Phantom'}
          </button>
          <Link href="/agents/deploy" className="btn-outline">
            Deploy mesh →
          </Link>
        </div>
      </section>

      <section
        className="dashboard-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{s.title}</h2>
              <span
                style={{
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: 'rgba(245,197,24,0.06)',
                  color: '#F5C518',
                  border: '1px solid rgba(245,197,24,0.25)',
                }}
              >
                {s.badge}
              </span>
            </div>
            <p className="silver-text" style={{ margin: 0, fontSize: 13 }}>
              {s.desc}
            </p>
            <span className="gold-text" style={{ fontSize: 12, marginTop: 8 }}>
              Open →
            </span>
          </Link>
        ))}
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>How TrustMesh works on Solana</h2>
        <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: '#ddd', margin: 0 }}>
          <li>
            <strong style={{ color: '#F5C518' }}>Deploy.</strong> An owner spawns a mandate with an Anchor program; each agent gets a deterministic SNS sub-name.
          </li>
          <li>
            <strong style={{ color: '#F5C518' }}>Delegate.</strong> Every agent-to-agent message is Ed25519-signed and posted to a coordination log on chain.
          </li>
          <li>
            <strong style={{ color: '#F5C518' }}>Verify.</strong> Anyone can replay the log, audit the decision tree, and confirm no unauthorized actions occurred.
          </li>
          <li>
            <strong style={{ color: '#F5C518' }}>Revoke.</strong> An owner can revoke the entire mesh in a single transaction; downstream agents stop accepting work.
          </li>
        </ol>
      </section>
    </main>
  )
}
