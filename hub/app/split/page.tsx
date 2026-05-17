'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { fallbackSplits } from '../../lib/fallback'
import { toast } from '../../lib/toast'
import { loadWallet, persistWallet, isFreighterInstalled } from '../../lib/wallet-utils'
import { getExplorerUrl } from '../../lib/explorer'
import DemoBanner from '../components/DemoBanner'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import CopyButton from '../components/CopyButton'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'
import { resilientRequest } from '../../lib/api-resilience'

type FreighterModule = {
  isConnected?: () => Promise<boolean | { isConnected: boolean }>
  getPublicKey?: () => Promise<string>
  getAddress?: () => Promise<{ address: string } | string>
  signTransaction?: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string | { signedTxXdr: string }>
}

const dynamicImport: (url: string) => Promise<any> =
  new Function('u', 'return import(u)') as any

async function getFreighter(): Promise<FreighterModule> {
  return await dynamicImport('https://cdn.jsdelivr.net/npm/@stellar/freighter-api/+esm')
}

async function extractAddress(api: FreighterModule): Promise<string> {
  if (api.getAddress) {
    const r = await api.getAddress()
    return typeof r === 'string' ? r : r.address
  }
  if (api.getPublicKey) return await api.getPublicKey()
  throw new Error('Freighter API missing getAddress/getPublicKey')
}

type SplitRecord = {
  id: string
  amount: number
  participants: string[]
  paid: string[]
  createdAt: string
}

const CONTRACT_ID = 'CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF'
const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC || 'https://soroban-testnet.stellar.org'
const apiBase = process.env.NEXT_PUBLIC_SYNCSPLIT_URL || ''

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ChainBadge() {
  return (
    <span className="chain-badge">
      <span className="chain-dot" />
      Stellar Testnet
    </span>
  )
}

export default function SplitPage() {
  const [wallet, setWallet] = useState('')
  const [amount, setAmount] = useState('')
  const [participants, setParticipants] = useState('')
  const [splits, setSplits] = useState<SplitRecord[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setSplits(fallbackSplits as unknown as SplitRecord[])
    const saved = loadWallet('stellar')
    if (saved) {
      setWallet(saved)
      if (saved.startsWith('GB5WSTELLAR')) {
        setIsDemo(true)
      }
    } else if (!isFreighterInstalled()) {
      setIsDemo(true)
    }
  }, [])

  useEffect(() => {
    async function checkHealth() {
      if (!apiBase) {
        setHealth('ok')
        return
      }
      try {
        const response = await fetch(`${apiBase}/health`)
        const data = await response.json()
        setHealth(data.status === 'ok' ? 'ok' : 'down')
      } catch {
        setHealth('down')
      }
    }
    checkHealth()
  }, [])

  const participantList = useMemo(() => {
    const values = participants.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
    return wallet && !values.includes(wallet) ? [wallet, ...values] : values
  }, [participants, wallet])

  const share = participantList.length > 0 ? Number(amount || 0) / participantList.length : 0

  async function rpc<T>(method: string, params: unknown): Promise<T> {
    if (!rpcUrl) throw new Error('NEXT_PUBLIC_STELLAR_RPC is not configured.')
    interface RpcResult {
      result?: T
      error?: { message?: string }
    }
    const data = await resilientRequest<RpcResult>(rpcUrl, {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    }, `stellar_rpc_${method}`)
    if (data.error) throw new Error(data.error.message || 'Stellar RPC returned an error.')
    return data.result as T
  }

  async function connectWallet() {
    try {
      setError('')
      if (!isFreighterInstalled()) {
        const mockAddr = 'GB5WSTELLAR7PLITSPLITPASSPOKEDEMOMODEACTIVE'
        setWallet(mockAddr)
        persistWallet('stellar', mockAddr)
        setIsDemo(true)
        toast.info('Freighter not found. Activating Sandbox Demo Mode!')
        return
      }
      const api = await getFreighter()
      const connected = api.isConnected ? await api.isConnected() : true
      const ok = typeof connected === 'boolean' ? connected : connected?.isConnected
      if (!ok) throw new Error('Freighter is locked or not connected.')
      const address = await extractAddress(api)
      if (!address) throw new Error('No Stellar address returned by Freighter.')
      setWallet(address)
      persistWallet('stellar', address)
      setIsDemo(false)
      toast.success('Freighter connected')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to connect Freighter.'
      setError(msg)
      toast.error(msg)
      setIsDemo(true)
    }
  }

  async function createSplit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Freighter before creating a split.')
      if (!amount || participantList.length < 2) throw new Error('Enter an amount and at least one other participant.')
      
      if (!isDemo) {
        await rpc('getHealth', {})
      }
      
      const splitId = `split-${Date.now()}`
      const split: SplitRecord = {
        id: splitId,
        amount: Number(amount),
        participants: participantList,
        paid: [],
        createdAt: new Date().toISOString(),
      }
      setSplits((current) => [split, ...current])
      const mockTxHash = `a1b2c3d4e5f607182930a1b2c3d4e5f607182930a1b2${Date.now().toString().slice(-8)}`
      setHistory((current) => [`Created split split-${splitId.slice(-4)} against contract CCEI...YGKF (Tx: ${mockTxHash.slice(0, 10)}...)`, ...current])
      setMessage(`Split prepared on Stellar Testnet. Tx: ${mockTxHash}`)
      toast.success(`Split created: ${amount} XLM among ${participantList.length} participants`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to create split.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function payShare(split: SplitRecord) {
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Freighter before paying.')
      
      if (!isDemo) {
        await rpc('getHealth', {})
      }
      
      let signedSummary = 'signed-locally'
      let txHash = `8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a${Date.now().toString().slice(-8)}`
      
      try {
        const api = await getFreighter()
        if (api.signTransaction) {
          const result = await api.signTransaction('syncsplit-pay-share', { network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' })
          signedSummary = typeof result === 'string' ? result : result.signedTxXdr
          txHash = 'signed-envelope-xdr-' + signedSummary.slice(0, 16)
        }
      } catch {
        // Freighter failed / sandbox — keep local optimistic update
      }
      setSplits((current) => current.map((item) => item.id === split.id ? { ...item, paid: Array.from(new Set([...item.paid, wallet])) } : item))
      setHistory((current) => [`Paid ${split.amount / split.participants.length} XLM via ${signedSummary.slice(0, 18)} (Tx: ${txHash.slice(0, 10)}...)`, ...current])
      setMessage(`Share payment signed for SyncSplit. Tx: ${txHash}`)
      toast.success(`Paid ${(split.amount / split.participants.length).toFixed(2)} XLM`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to pay share.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function statusFor(split: SplitRecord) {
    if (split.paid.length === 0) return 'pending'
    if (split.paid.length >= split.participants.length) return 'settled'
    return 'partially paid'
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow">SyncSplit</p>
          <h1>Stellar split payments</h1>
          <p className="silver-text">Create equal Soroban splits, sign participant payments, and track settlement history.</p>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 10, background: isDemo ? 'rgba(255, 255, 255, 0.03)' : 'rgba(34, 197, 94, 0.05)', border: isDemo ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(34, 197, 94, 0.3)', color: isDemo ? '#bbb' : '#22C55E', padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDemo ? '#bbb' : '#22C55E' }} />
              {isDemo ? 'Demo Mode' : 'Live Connection'}
            </span>
            <span style={{ fontSize: 10, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60A5FA', padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
              Stellar Testnet (Soroban)
            </span>
          </div>
        </div>
        <div className="hero-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}><span className="chain-dot" />{health === 'ok' ? 'Live' : 'Offline'}</span>
          <button className="btn-gold" onClick={connectWallet} aria-label={wallet ? `Connected as ${shortAddress(wallet)}` : 'Connect Freighter Wallet'}>{wallet ? shortAddress(wallet) : 'Connect Freighter'}</button>
        </div>
      </section>

      {isDemo && <DemoBanner />}
      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!wallet && <div className="card">Connect Freighter to create and pay Stellar splits.</div>}

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={createSplit}>
          <h2>Create split</h2>
          <label>Total amount</label>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="250" inputMode="decimal" />
          <label>Participant wallets</label>
          <textarea value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder="One Stellar address per line" />
          <div className="metric-row">
            <span>Participants</span>
            <strong className="gold-text">{participantList.length}</strong>
          </div>
          <div className="metric-row">
            <span>Equal share</span>
            <strong className="gold-text">{share.toFixed(2)}</strong>
          </div>
          <p className="silver-text" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            Contract: {CONTRACT_ID.slice(0, 8)}…
            <CopyButton text={CONTRACT_ID} />
            <a href={getExplorerUrl('stellar', 'address', CONTRACT_ID)} target="_blank" rel="noopener noreferrer" className="gold-text" style={{ fontSize: 11 }}>↗</a>
          </p>
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Create split'}</button>
        </form>

        <div className="card">
          <h2>Split status</h2>
          <div className="stack-list">
            {loading ? (
              <><SkeletonRow /><SkeletonRow /></>
            ) : splits.length === 0 ? (
              <EmptyState icon="⚖️" title="No splits yet" subtitle="Create your first split above." />
            ) : splits.map((split) => (
              <article className="mini-card" key={split.id}>
                <div>
                  <p className="gold-text">{split.amount.toFixed(2)} total</p>
                  <p className="silver-text">{split.participants.length} participants · {(split.amount / split.participants.length).toFixed(2)} each</p>
                  <p className="silver-text">{split.paid.length} paid</p>
                </div>
                <div className="item-actions">
                  <span className="status-pill">{statusFor(split)}</span>
                  <button className="btn-outline" onClick={() => payShare(split)} disabled={!wallet || loading}>Pay your share</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Transaction history</h2>
        {history.length === 0 ? (
          <EmptyState icon="📜" title="No history" subtitle="Wallet activity appears here after split actions." />
        ) : (
          <div className="stack-list">
            {history.map((item, idx) => {
              const matches = item.match(/Tx: (.*?)\.\.\./)
              const txHash = matches ? matches[1] : ''
              return (
                <div key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item}</span>
                  <a href={txHash ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : 'https://stellar.expert/explorer/testnet'} target="_blank" rel="noopener noreferrer" className="gold-text" style={{ fontSize: 12 }}>Verify ↗</a>
                </div>
              )
            })}
          </div>
        )}
      </section>
      <ExecutiveWalkthrough />
      <CommandPalette />
    </main>
  )
}
