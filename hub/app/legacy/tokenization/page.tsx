// Built by vsrupeshkumar
'use client'

import { useEffect, useState } from 'react'
import { truncateAddress } from '../../../lib/wallet-utils'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { ConnectButton } from '../../../components/wallet/ConnectButton'
import { fetchTokenProfile, saveTokenProfile } from '../../../lib/eternavault-api'
import { toast } from '../../../lib/toast'

const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '20px 22px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
  letterSpacing: '0.04em',
}

const INFO_CARDS = [
  {
    icon: '🪙',
    title: 'QIEDEX Token',
    desc: 'Link your QIEDEX token address so heirs can access DLT-linked vault components.',
    color: '#F5C518',
  },
  {
    icon: '📈',
    title: 'Market Access',
    desc: 'Attach a market link (QIEDEX DEX, external exchange) for token price discovery.',
    color: '#22C55E',
  },
  {
    icon: '🔗',
    title: 'On-Chain Identity',
    desc: 'Token address is stored against your DID — publicly verifiable, privately managed.',
    color: '#60A5FA',
  },
]

export default function TokenizationPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [tokenAddress, setTokenAddress] = useState('')
  const [marketLink, setMarketLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!wallet) return
    const did = `did:qie:${wallet}`
    setLoading(true)
    fetchTokenProfile(did)
      .then((profile) => {
        setTokenAddress(profile.tokenAddress || '')
        setMarketLink(profile.marketLink || '')
        setSavedAt(profile.savedAt)
      })
      .finally(() => setLoading(false))
  }, [wallet])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!wallet) { toast.error('Connect your wallet first'); return }
    if (!tokenAddress.trim()) { toast.error('Enter a token contract address'); return }
    const did = `did:qie:${wallet}`
    setSaving(true)
    try {
      await saveTokenProfile(did, tokenAddress.trim(), marketLink.trim())
      setSavedAt(new Date().toISOString())
      toast.success('Token profile saved')
    } catch (err: any) {
      toast.error(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleClear() {
    setTokenAddress('')
    setMarketLink('')
    setSavedAt(null)
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#D97706', marginBottom: 6 }}>
          DLT TOKENIZATION
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          Link your QIEDEX Token
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
          Attach a token contract address and market link to your vault identity. Your heirs will be able to locate and access your DLT assets.
        </p>
      </header>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {INFO_CARDS.map((c) => (
          <div key={c.title} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: c.color, margin: 0 }}>{c.title}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Wallet connect */}
      {!wallet && (
        <div style={{ ...card, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '14px 18px', background: 'rgba(245,197,24,0.04)', border: '1px solid rgba(245,197,24,0.15)' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Connect wallet to load/save your token profile
          </p>
          <ConnectButton type="evm" size="lg" />
        </div>
      )}

      {/* Token form */}
      <div style={{ ...card, marginBottom: 20 }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
          🪙 Token Profile
        </p>

        {loading ? (
          <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-block', width: 18, height: 18,
              border: '2px solid rgba(245,197,24,0.2)',
              borderTop: '2px solid #F5C518',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Loading profile…</span>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>TOKEN CONTRACT ADDRESS *</label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x… (QIEDEX token contract)"
                style={inputStyle}
                disabled={saving || !wallet}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '5px 0 0' }}>
                The ERC-20 or native token contract on QIE Mainnet.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>MARKET LINK (OPTIONAL)</label>
              <input
                type="url"
                value={marketLink}
                onChange={(e) => setMarketLink(e.target.value)}
                placeholder="https://qiedex.finance/token/0x…"
                style={inputStyle}
                disabled={saving || !wallet}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '5px 0 0' }}>
                A URL to the token's trading pair or market page.
              </p>
            </div>

            {savedAt && (
              <p style={{ fontSize: 11, color: '#22C55E', margin: '0 0 14px' }}>
                ✅ Last saved: {new Date(savedAt).toLocaleString()}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={saving || !wallet}
                style={{
                  background: saving || !wallet ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #D97706, #F5C518)',
                  color: saving || !wallet ? 'rgba(255,255,255,0.4)' : '#0d0e11',
                  border: 'none', borderRadius: 8,
                  padding: '10px 24px', fontSize: 13, fontWeight: 700,
                  cursor: saving || !wallet ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                {saving && (
                  <span style={{
                    width: 13, height: 13,
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTop: '2px solid rgba(0,0,0,0.7)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                )}
                {saving ? 'Saving…' : '💾 Save Token Profile'}
              </button>
              {(tokenAddress || marketLink) && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: 'transparent', color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '10px 18px',
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Wallet info */}
      {wallet && (
        <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
          {truncateAddress(wallet)} · QIE Mainnet
        </p>
      )}

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(245,197,24,0.03)',
        border: '1px solid rgba(245,197,24,0.10)',
        borderRadius: 10,
        padding: '14px 16px',
        marginTop: 20,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.7 }}>
          🪙 QIEDEX is the native decentralised exchange of the QIE Mainnet ecosystem. Token profile data is stored server-side, linked to your DID, and shared only with verified heirs once legacy is activated.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
