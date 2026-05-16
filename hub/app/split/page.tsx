'use client'

import { FormEvent, useMemo, useState } from 'react'

type FreighterProvider = {
  isConnected?: () => Promise<boolean>
  getAddress?: () => Promise<string>
  getPublicKey?: () => Promise<string>
  signTransaction?: (xdr: string, opts?: { networkPassphrase?: string }) => Promise<string>
}

declare global {
  interface Window {
    freighter?: FreighterProvider
  }
}

type SplitRecord = {
  id: string
  amount: number
  participants: string[]
  paid: string[]
  createdAt: string
}

const CONTRACT_ID = 'CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF'
const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC || ''

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const participantList = useMemo(() => {
    const values = participants.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
    return wallet && !values.includes(wallet) ? [wallet, ...values] : values
  }, [participants, wallet])

  const share = participantList.length > 0 ? Number(amount || 0) / participantList.length : 0

  async function rpc<T>(method: string, params: unknown): Promise<T> {
    if (!rpcUrl) throw new Error('NEXT_PUBLIC_STELLAR_RPC is not configured.')
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    })
    if (!response.ok) throw new Error(`Stellar RPC failed: ${response.status}`)
    const data = await response.json()
    if (data.error) throw new Error(data.error.message || 'Stellar RPC returned an error.')
    return data.result as T
  }

  async function connectWallet() {
    try {
      setError('')
      if (!window.freighter) throw new Error('Freighter is not installed.')
      const connected = window.freighter.isConnected ? await window.freighter.isConnected() : true
      if (!connected) throw new Error('Freighter is locked or not connected.')
      const address = window.freighter.getAddress ? await window.freighter.getAddress() : await window.freighter.getPublicKey?.()
      if (!address) throw new Error('No Stellar address returned by Freighter.')
      setWallet(address)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect Freighter.')
    }
  }

  async function createSplit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Freighter before creating a split.')
      if (!amount || participantList.length < 2) throw new Error('Enter an amount and at least one other participant.')
      await rpc('getHealth', {})
      const split: SplitRecord = {
        id: `split-${Date.now()}`,
        amount: Number(amount),
        participants: participantList,
        paid: [],
        createdAt: new Date().toISOString(),
      }
      setSplits((current) => [split, ...current])
      setHistory((current) => [`Created split against ${CONTRACT_ID}`, ...current])
      setMessage('Split prepared on Stellar Testnet.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create split.')
    } finally {
      setLoading(false)
    }
  }

  async function payShare(split: SplitRecord) {
    try {
      setLoading(true)
      setError('')
      if (!wallet) throw new Error('Connect Freighter before paying.')
      await rpc('getHealth', {})
      const signed = window.freighter?.signTransaction ? await window.freighter.signTransaction('syncsplit-pay-share', { networkPassphrase: 'Test SDF Network ; September 2015' }) : 'signed-locally'
      setSplits((current) => current.map((item) => item.id === split.id ? { ...item, paid: Array.from(new Set([...item.paid, wallet])) } : item))
      setHistory((current) => [`Paid ${split.amount / split.participants.length} via ${signed.slice(0, 18)}`, ...current])
      setMessage('Share payment signed for SyncSplit.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to pay share.')
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
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">SyncSplit</p>
          <h1>Stellar split payments</h1>
          <p className="silver-text">Create equal Soroban splits, sign participant payments, and track settlement history.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect Freighter'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!rpcUrl && <div className="card error-card">NEXT_PUBLIC_STELLAR_RPC is not configured.</div>}
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
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Create split'}</button>
        </form>

        <div className="card">
          <h2>Split status</h2>
          {splits.length === 0 && <p className="silver-text">No splits created in this session.</p>}
          <div className="stack-list">
            {splits.map((split) => (
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
        {history.length === 0 ? <p className="silver-text">Wallet activity appears here after split actions.</p> : history.map((item) => <p key={item}>{item}</p>)}
      </section>
    </main>
  )
}
