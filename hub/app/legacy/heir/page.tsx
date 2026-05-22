// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  isMetaMaskInstalled,
  truncateAddress,
} from '../../../lib/wallet-utils'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { ConnectButton } from '../../../components/wallet/ConnectButton'
import {
  checkDeathStatus,
  simulateUnlock,
  registerHeir,
  fetchFileBlob,
} from '../../../lib/eternavault-api'
import { decryptBuffer, downloadDecryptedFile } from '../../../lib/eternavault-encryption'
import { toast } from '../../../lib/toast'
import type { VaultFile } from '../../../lib/eternavault-fallbacks'

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

// ─── Decrypt modal for heir files ─────────────────────────────
function HeirDecryptModal({ file, onClose }: { file: VaultFile; onClose: () => void }) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleDecrypt() {
    if (!key) { toast.error('Enter the vault key'); return }
    setBusy(true)
    try {
      const buf = await fetchFileBlob(file.id)
      const plain = await decryptBuffer(buf, key)
      downloadDecryptedFile(plain, file.originalName ?? file.name ?? 'file', file.mimeType ?? file.type ?? 'application/octet-stream')
      toast.success('File decrypted — downloading')
      onClose()
    } catch {
      toast.error('Decryption failed — wrong key or corrupted file')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...card, maxWidth: 440, width: '100%', background: '#15161a', borderColor: 'rgba(245,197,24,0.2)' }}>
        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>🔓 Decrypt Inherited File</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 18px' }}>
          {file.title || file.originalName || file.name}
        </p>
        <label style={labelStyle}>VAULT KEY (PROVIDED BY THE DECEASED)</label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && handleDecrypt()}
          placeholder="Enter the vault passphrase"
          autoFocus
          style={{ ...inputStyle, marginBottom: 16 }}
          disabled={busy}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleDecrypt}
            disabled={busy}
            style={{
              flex: 1,
              background: busy ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #D97706, #F5C518)',
              color: busy ? 'rgba(255,255,255,0.4)' : '#0d0e11',
              border: 'none', borderRadius: 8, padding: '10px 0',
              fontSize: 13, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Decrypting…' : 'Decrypt & Download'}
          </button>
          <button onClick={onClose} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 18px', fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────
export default function HeirPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [ownerDid, setOwnerDid] = useState('')
  const [vaultKey, setVaultKey] = useState('')
  const [checking, setChecking] = useState(false)
  const [unlocked, setUnlocked] = useState<null | { allowed: boolean; files: VaultFile[]; message: string }>(null)
  const [deathStatus, setDeathStatus] = useState<null | { deceased: boolean; markedAt: string | null; txHash: string | null; chain: string }>(null)
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null)
  const [registerAddr, setRegisterAddr] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerResult, setRegisterResult] = useState('')
  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])


  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!ownerDid.trim()) { toast.error("Enter the owner's DID or wallet address"); return }
    const did = ownerDid.trim().startsWith('did:') ? ownerDid.trim() : `did:qie:${ownerDid.trim()}`
    setChecking(true)
    setUnlocked(null)
    setDeathStatus(null)
    try {
      const [death, unlock] = await Promise.all([
        checkDeathStatus(did),
        simulateUnlock(wallet || 'anonymous', did),
      ])
      setDeathStatus(death)
      setUnlocked(unlock)
    } catch (err: any) {
      toast.error(err?.message || 'Check failed')
    } finally {
      setChecking(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!registerAddr.trim()) { toast.error('Enter an heir address'); return }
    setRegistering(true)
    setRegisterResult('')
    try {
      const res = await registerHeir(registerAddr.trim())
      setRegisterResult(res.txHash)
      toast.success('Heir registered on QIE Mainnet')
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#D97706', marginBottom: 6 }}>
          HEIR ACCESS
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          Heir Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
          If you have been designated as an heir, enter the vault owner's DID to check death status and unlock access when the time is right.
        </p>
      </header>

      {/* Wallet connect prompt */}
      {!wallet && installed && (
        <div style={{ ...card, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '14px 18px', background: 'rgba(245,197,24,0.04)', border: '1px solid rgba(245,197,24,0.15)' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Connect your heir wallet to proceed
          </p>
          <ConnectButton type="evm" size="lg" />
        </div>
      )}

      {wallet && (
        <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
          Heir wallet: {truncateAddress(wallet)} · QIE Mainnet
        </p>
      )}

      {/* Unlock check form */}
      <div style={{ ...card, marginBottom: 20 }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
          🔐 Check Vault Access
        </p>
        <form onSubmit={handleUnlock}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>VAULT OWNER DID OR WALLET ADDRESS</label>
            <input
              type="text"
              value={ownerDid}
              onChange={(e) => setOwnerDid(e.target.value)}
              placeholder="did:qie:0x… or 0x…"
              style={inputStyle}
              disabled={checking}
            />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '6px 0 0' }}>
              The wallet address of the person whose legacy you are accessing.
            </p>
          </div>
          <button
            type="submit"
            disabled={checking}
            style={{
              background: checking ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #D97706, #F5C518)',
              color: checking ? 'rgba(255,255,255,0.4)' : '#0d0e11',
              border: 'none', borderRadius: 8, padding: '10px 24px',
              fontSize: 13, fontWeight: 700, cursor: checking ? 'not-allowed' : 'pointer',
            }}
          >
            {checking ? 'Checking…' : 'Check Vault Access'}
          </button>
        </form>
      </div>

      {/* Death status result */}
      {deathStatus && (
        <div style={{
          ...card,
          marginBottom: 16,
          background: deathStatus.deceased ? 'rgba(248,113,113,0.06)' : 'rgba(34,197,94,0.06)',
          border: `1px solid ${deathStatus.deceased ? 'rgba(248,113,113,0.25)' : 'rgba(34,197,94,0.25)'}`,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: deathStatus.deceased ? '#F87171' : '#22C55E', margin: '0 0 6px' }}>
            {deathStatus.deceased ? '⚰️ Legacy status: ACTIVATED' : '💚 Legacy status: ACTIVE — Owner is living'}
          </p>
          {deathStatus.markedAt && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
              Activated: {new Date(deathStatus.markedAt).toLocaleDateString()}
            </p>
          )}
          {deathStatus.txHash && (
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', margin: 0, wordBreak: 'break-all' }}>
              TX: {deathStatus.txHash}
            </p>
          )}
        </div>
      )}

      {/* Unlock result */}
      {unlocked && (
        <div style={{
          ...card,
          marginBottom: 20,
          background: unlocked.allowed ? 'rgba(245,197,24,0.05)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${unlocked.allowed ? 'rgba(245,197,24,0.2)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: unlocked.allowed ? '#F5C518' : 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
            {unlocked.allowed ? '🔓 Access Granted' : '🔒 Access Denied'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 14px' }}>
            {unlocked.message}
          </p>
          {unlocked.allowed && unlocked.files.length > 0 && (
            <>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', letterSpacing: '0.04em' }}>
                ACCESSIBLE FILES ({unlocked.files.length})
              </p>
              {unlocked.files.map((f) => (
                <div key={f.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', marginBottom: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#F5C518', margin: 0 }}>
                      {f.title || f.originalName || f.name}
                    </p>
                    {f.description && (
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{f.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedFile(f)}
                    style={{
                      background: 'rgba(245,197,24,0.1)', color: '#F5C518',
                      border: '1px solid rgba(245,197,24,0.25)',
                      borderRadius: 6, padding: '6px 14px',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    🔓 Decrypt
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Register heir section */}
      <div style={{ ...card }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
          👨‍👩‍👧‍👦 Register an Heir
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', lineHeight: 1.5 }}>
          As a vault owner, register another wallet address as your heir on LegacyVault.sol.
        </p>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>HEIR WALLET ADDRESS</label>
            <input
              type="text"
              value={registerAddr}
              onChange={(e) => setRegisterAddr(e.target.value)}
              placeholder="0x…"
              style={inputStyle}
              disabled={registering}
            />
          </div>
          <button
            type="submit"
            disabled={registering}
            style={{
              background: registering ? 'rgba(255,255,255,0.08)' : 'rgba(245,197,24,0.12)',
              color: registering ? 'rgba(255,255,255,0.4)' : '#F5C518',
              border: '1px solid rgba(245,197,24,0.3)',
              borderRadius: 8, padding: '10px 22px',
              fontSize: 13, fontWeight: 600, cursor: registering ? 'not-allowed' : 'pointer',
            }}
          >
            {registering ? 'Registering…' : '⛓ Register Heir On-Chain'}
          </button>
          {registerResult && (
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#22C55E', marginTop: 10, wordBreak: 'break-all' }}>
              TX: {registerResult}
            </p>
          )}
        </form>
      </div>

      {selectedFile && <HeirDecryptModal file={selectedFile} onClose={() => setSelectedFile(null)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
