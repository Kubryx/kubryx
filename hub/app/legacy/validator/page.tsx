// Built by vsrupeshkumar
'use client'

import { useState } from 'react'
import { truncateAddress } from '../../../lib/wallet-utils'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { ConnectButton } from '../../../components/wallet/ConnectButton'
import { registerValidator } from '../../../lib/eternavault-api'
import { toast } from '../../../lib/toast'

const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '20px 22px',
}

const ROLES = [
  {
    icon: '⚖️',
    title: 'Confirm death events',
    desc: 'Attest on-chain that a vault owner has passed, triggering legacy unlock.',
    color: '#F5C518',
  },
  {
    icon: '🔍',
    title: 'Verify heir identity',
    desc: 'Confirm that an heir wallet address belongs to the intended beneficiary.',
    color: '#60A5FA',
  },
  {
    icon: '📜',
    title: 'Witness legacy activation',
    desc: 'Co-sign the on-chain transaction that opens vault access to heirs.',
    color: '#22C55E',
  },
  {
    icon: '🛡',
    title: 'Prevent fraud',
    desc: 'Multiple validator signatures required before any vault unlock is finalised.',
    color: '#A78BFA',
  },
]

export default function ValidatorPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [registering, setRegistering] = useState(false)
  const [txHash, setTxHash] = useState('')

  async function handleRegister() {
    if (!wallet) { toast.error('Connect your wallet first'); return }
    setRegistering(true)
    setTxHash('')
    try {
      const res = await registerValidator(wallet)
      setTxHash(res.txHash)
      toast.success('Registered as validator on QIE Mainnet')
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#D97706', marginBottom: 6 }}>
          VALIDATOR DASHBOARD
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          Register as a Legacy Validator
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
          Validators form the trust layer of EternaVault. By registering on LegacyVault.sol, you can attest to death events and authorize heir access.
        </p>
      </header>

      {/* Roles grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        {ROLES.map((r) => (
          <div key={r.title} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 24 }}>{r.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: r.color, margin: 0 }}>{r.title}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Wallet + Registration panel */}
      <div style={{ ...card, marginBottom: 20 }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
          ⛓ On-Chain Registration
        </p>

        {!wallet ? (
          <>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Connect your QIE wallet to register your address in LegacyVault.sol as a trusted validator.
            </p>
            <ConnectButton type="evm" size="lg" />
          </>
        ) : (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.2)',
              marginBottom: 16, flexWrap: 'wrap',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {truncateAddress(wallet)}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>· QIE Mainnet</span>
            </div>

            {txHash ? (
              <div style={{
                padding: '14px 16px', borderRadius: 10,
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#22C55E', margin: '0 0 6px' }}>
                  ✅ Registered as Validator
                </p>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', margin: 0, wordBreak: 'break-all' }}>
                  TX: {txHash}
                </p>
                <a
                  href={`https://mainnet.qie.digital/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#F5C518', marginTop: 8, display: 'inline-block' }}
                >
                  View on Explorer ↗
                </a>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                style={{
                  background: registering ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #D97706, #F5C518)',
                  color: registering ? 'rgba(255,255,255,0.4)' : '#0d0e11',
                  border: 'none', borderRadius: 8,
                  padding: '11px 26px', fontSize: 14, fontWeight: 700,
                  cursor: registering ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                {registering && (
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTop: '2px solid rgba(0,0,0,0.7)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                )}
                {registering ? 'Registering…' : '⚖️ Register as Validator'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Info disclaimer */}
      <div style={{
        background: 'rgba(245,197,24,0.04)',
        border: '1px solid rgba(245,197,24,0.12)',
        borderRadius: 12,
        padding: '16px 18px',
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.7 }}>
          ⚠️ In a production deployment, validator registration is permissioned. Validators must be vetted legal or trusted parties. This demo allows any wallet to register for testing purposes. A minimum of 2 validator signatures is required per legacy activation event.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
