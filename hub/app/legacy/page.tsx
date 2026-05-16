'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

type Vault = {
  id?: string
  vaultId?: string
  heir?: string
  owner?: string
  unlockDate?: string
  status?: 'locked' | 'unlocked' | 'claimed' | string
  fileName?: string
  createdAt?: string
}

const QIE_MAINNET = {
  chainId: '0x7C6',
  chainName: 'QIE Mainnet',
  rpcUrls: ['https://rpc.qie.digital'],
  nativeCurrency: { name: 'QIE', symbol: 'QIE', decimals: 18 },
  blockExplorerUrls: ['https://mainnet.qie.digital'],
}

const apiBase = process.env.NEXT_PUBLIC_ETERNALVAULT_API || ''

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ChainBadge() {
  return (
    <span className="chain-badge">
      <span className="chain-dot" />
      QIE Mainnet
    </span>
  )
}

export default function LegacyPage() {
  const [wallet, setWallet] = useState('')
  const [heir, setHeir] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [unlockCondition, setUnlockCondition] = useState('date')
  const [file, setFile] = useState<File | null>(null)
  const [vaults, setVaults] = useState<Vault[]>([])
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const hasApi = useMemo(() => Boolean(apiBase), [])

  async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('NEXT_PUBLIC_ETERNALVAULT_API is not configured.')
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    })
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return response.json() as Promise<T>
  }

  async function connectWallet() {
    try {
      setError('')
      if (!window.ethereum) throw new Error('MetaMask is not installed.')
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [QIE_MAINNET] })
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      setWallet(accounts[0] || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect MetaMask.')
    }
  }

  async function loadVaults(address: string) {
    try {
      setLoading(true)
      setError('')
      const data = await requestJson<Vault[] | { vaults?: Vault[] }>(`/api/vaults/${address}`)
      setVaults(Array.isArray(data) ? data : data.vaults || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load vaults.')
    } finally {
      setLoading(false)
    }
  }

  async function encryptFile(selected: File) {
    const bytes = await selected.arrayBuffer()
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes)
    const rawKey = await crypto.subtle.exportKey('raw', key)

    return {
      name: selected.name,
      type: selected.type,
      size: selected.size,
      iv: Array.from(iv),
      key: btoa(String.fromCharCode(...new Uint8Array(rawKey))),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    }
  }

  async function createVault(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')
      if (!wallet) throw new Error('Connect MetaMask before creating a vault.')
      if (!file) throw new Error('Choose a file to encrypt.')
      if (!heir) throw new Error('Enter an heir wallet address.')
      const encryptedFile = await encryptFile(file)
      await requestJson('/api/vaults/create', {
        method: 'POST',
        body: JSON.stringify({ owner: wallet, heir, file: encryptedFile, unlockDate, unlockCondition }),
      })
      setMessage('Encrypted vault created.')
      setFile(null)
      await loadVaults(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create vault.')
    } finally {
      setLoading(false)
    }
  }

  async function claimVault(vault: Vault) {
    try {
      setLoading(true)
      setError('')
      await requestJson('/api/vaults/claim', {
        method: 'POST',
        body: JSON.stringify({ vaultId: vault.id || vault.vaultId, heir: wallet }),
      })
      setMessage('Claim submitted.')
      await loadVaults(wallet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to claim vault.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function checkHealth() {
      try {
        if (!apiBase) throw new Error('Missing API')
        const data = await requestJson<{ status?: string }>('/health')
        setHealth(data.status === 'ok' ? 'ok' : 'down')
      } catch {
        setHealth('down')
      }
    }
    checkHealth()
  }, [])

  useEffect(() => {
    if (wallet) loadVaults(wallet)
  }, [wallet])

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] || null)
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">EternalVault</p>
          <h1>Legacy Vault</h1>
          <p className="silver-text">Encrypt inheritance files in-browser, assign heirs, and monitor QIE unlock status.</p>
        </div>
        <div className="hero-actions">
          <ChainBadge />
          <span className={`health-badge ${health === 'ok' ? 'is-live' : 'is-down'}`}>
            <span className="chain-dot" />
            {health === 'checking' ? 'Checking' : health === 'ok' ? 'Healthy' : 'Offline'}
          </span>
          <button className="btn-gold" onClick={connectWallet}>{wallet ? shortAddress(wallet) : 'Connect MetaMask'}</button>
        </div>
      </section>

      {error && <div className="card error-card">{error}</div>}
      {message && <div className="card success-card">{message}</div>}
      {!hasApi && <div className="card error-card">NEXT_PUBLIC_ETERNALVAULT_API is not configured.</div>}
      {!wallet && <div className="card">Connect MetaMask to create encrypted vaults and see heir claims.</div>}

      <section className="dashboard-grid">
        <form className="card form-panel" onSubmit={createVault}>
          <h2>Create encrypted vault</h2>
          <label>Encrypted file</label>
          <input type="file" onChange={onFileChange} />
          <label>Heir wallet</label>
          <input value={heir} onChange={(event) => setHeir(event.target.value)} placeholder="0x..." />
          <label>Unlock condition</label>
          <select value={unlockCondition} onChange={(event) => setUnlockCondition(event.target.value)}>
            <option value="date">Date based</option>
            <option value="validator">Validator attestation</option>
          </select>
          <label>Unlock date</label>
          <input type="date" value={unlockDate} onChange={(event) => setUnlockDate(event.target.value)} />
          <button className="btn-gold" disabled={loading || !wallet}>{loading ? <span className="spinner" /> : 'Create vault'}</button>
        </form>

        <div className="card">
          <h2>Your vaults</h2>
          {loading && <span className="spinner" />}
          {!loading && vaults.length === 0 && <p className="silver-text">No vaults found for this wallet.</p>}
          <div className="stack-list">
            {vaults.map((vault, index) => (
              <article className="mini-card" key={vault.id || vault.vaultId || index}>
                <div>
                  <p className="gold-text">{vault.fileName || `Vault ${index + 1}`}</p>
                  <p className="silver-text">Heir: {vault.heir ? shortAddress(vault.heir) : 'Not assigned'}</p>
                  <p className="silver-text">Unlock: {vault.unlockDate || 'Validator attestation'}</p>
                </div>
                <div className="item-actions">
                  <span className="status-pill">{vault.status || 'locked'}</span>
                  <button className="btn-outline" onClick={() => claimVault(vault)} disabled={!wallet || loading}>Claim</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
