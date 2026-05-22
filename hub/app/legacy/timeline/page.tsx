// Built by vsrupeshkumar
'use client'

import { useEffect, useRef, useState } from 'react'
import { truncateAddress } from '../../../lib/wallet-utils'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { ConnectButton } from '../../../components/wallet/ConnectButton'
import {
  fetchVaultFiles,
  anchorCid,
  fetchFileBlob,
  generateAIStory,
  deleteFile,
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

function formatDate(ts: number | string | undefined): string {
  if (!ts) return 'Unknown date'
  const d = new Date(typeof ts === 'string' ? ts : ts)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function groupByDate(files: VaultFile[]): Record<string, VaultFile[]> {
  const groups: Record<string, VaultFile[]> = {}
  for (const f of files) {
    const key = formatDate(f.createdAt ?? (f as any).timestamp ?? f.uploadedAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(f)
  }
  return groups
}

function fileSizeLabel(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ─── Decrypt Modal ─────────────────────────────────────────────
function DecryptModal({
  file,
  onClose,
}: {
  file: VaultFile
  onClose: () => void
}) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleDecrypt() {
    if (!key) { toast.error('Enter your vault key'); return }
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
        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>
          🔓 Decrypt File
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 18px' }}>
          {file.title || file.originalName || file.name}
        </p>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.04em' }}>
          VAULT ENCRYPTION KEY
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && handleDecrypt()}
          placeholder="Enter your passphrase"
          autoFocus
          style={{
            width: '100%', padding: '10px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: '#fff', fontSize: 14,
            boxSizing: 'border-box', marginBottom: 16,
          }}
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
          <button
            onClick={onClose}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '10px 18px',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI Story Modal ────────────────────────────────────────────
function StoryModal({ file, onClose }: { file: VaultFile; onClose: () => void }) {
  const [story, setStory] = useState('')
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    generateAIStory(file.id, file.title ?? '', file.description ?? '')
      .then(setStory)
      .catch(() => setStory('Could not generate story. Try again later.'))
      .finally(() => setBusy(false))
  }, [file])

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
      <div style={{ ...card, maxWidth: 560, width: '100%', background: '#15161a', borderColor: 'rgba(167,139,250,0.25)' }}>
        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#A78BFA' }}>
          🧬 AI Legacy Story
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 18px' }}>
          {file.title || file.originalName || file.name}
        </p>
        {busy ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <span style={{
              display: 'inline-block', width: 24, height: 24,
              border: '2px solid rgba(167,139,250,0.3)',
              borderTop: '2px solid #A78BFA',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>Generating your story…</p>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>
            {story}
          </p>
        )}
        <button
          onClick={onClose}
          style={{
            background: 'rgba(167,139,250,0.12)', color: '#A78BFA',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: 8, padding: '9px 20px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ─── File Card ─────────────────────────────────────────────────
function FileCard({
  file,
  walletAddress,
  onDelete,
}: {
  file: VaultFile
  walletAddress: string
  onDelete: (id: string) => void
}) {
  const [anchorState, setAnchorState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [txHash, setTxHash] = useState('')
  const [showDecrypt, setShowDecrypt] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleAnchor() {
    setAnchorState('busy')
    try {
      const did = walletAddress ? `did:qie:${walletAddress}` : 'did:qie:anonymous'
      const res = await anchorCid(file.id, did)
      setTxHash(res.txHash)
      setAnchorState('done')
      toast.success('Anchored on QIE Mainnet')
    } catch {
      setAnchorState('idle')
      toast.error('Anchoring failed')
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${file.title || file.originalName || file.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteFile(file.id)
    toast.success('File deleted')
    onDelete(file.id)
  }

  const isAnchored = file.anchored || anchorState === 'done'

  return (
    <>
      {showDecrypt && <DecryptModal file={file} onClose={() => setShowDecrypt(false)} />}
      {showStory && <StoryModal file={file} onClose={() => setShowStory(false)} />}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>
            {(file.mimeType ?? file.type ?? '').startsWith('image') ? '🖼' :
             (file.mimeType ?? file.type ?? '').startsWith('video') ? '🎥' :
             (file.mimeType ?? file.type ?? '').startsWith('audio') ? '🎵' :
             (file.mimeType ?? file.type ?? '').startsWith('application/pdf') ? '📄' : '📁'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, margin: '0 0 2px', color: '#F5C518', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.title || file.originalName || file.name || 'Unnamed file'}
            </p>
            {file.description && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 6px', lineHeight: 1.5 }}>
                {file.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                {file.originalName ?? file.name}
              </span>
              {file.size && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                  {fileSizeLabel(file.size)}
                </span>
              )}
              {isAnchored && (
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 10,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                  color: '#22C55E', fontWeight: 600,
                }}>
                  ⛓ Anchored
                </span>
              )}
            </div>
            {txHash && (
              <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#22C55E', margin: '6px 0 0', wordBreak: 'break-all' }}>
                TX: {txHash}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {!isAnchored && (
            <button
              onClick={handleAnchor}
              disabled={anchorState === 'busy'}
              style={{
                background: 'rgba(34,197,94,0.08)',
                color: anchorState === 'busy' ? 'rgba(34,197,94,0.4)' : '#22C55E',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 7, padding: '6px 14px',
                fontSize: 11, fontWeight: 600, cursor: anchorState === 'busy' ? 'not-allowed' : 'pointer',
              }}
            >
              {anchorState === 'busy' ? 'Anchoring…' : '⛓ Anchor on QIE'}
            </button>
          )}
          <button
            onClick={() => setShowDecrypt(true)}
            style={{
              background: 'rgba(245,197,24,0.08)',
              color: '#F5C518',
              border: '1px solid rgba(245,197,24,0.25)',
              borderRadius: 7, padding: '6px 14px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            🔓 Download & Decrypt
          </button>
          <button
            onClick={() => setShowStory(true)}
            style={{
              background: 'rgba(167,139,250,0.08)',
              color: '#A78BFA',
              border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: 7, padding: '6px 14px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            🧬 AI Story
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'rgba(248,113,113,0.06)',
              color: deleting ? 'rgba(248,113,113,0.3)' : '#F87171',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 7, padding: '6px 14px',
              fontSize: 11, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            {deleting ? 'Deleting…' : '🗑 Delete'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────
export default function TimelinePage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [files, setFiles] = useState<VaultFile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    fetchVaultFiles(`did:qie:${wallet}`)
      .then(setFiles)
      .finally(() => setLoading(false))
  }, [wallet])

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const groups = groupByDate(files)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#D97706', marginBottom: 6 }}>
          VAULT TIMELINE
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          Your encrypted memories
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
          All files are encrypted with your vault key. Only you can decrypt them — unless your heirs unlock the legacy.
        </p>
      </header>

      {/* Wallet gate */}
      {!wallet ? (
        <div style={{
          ...card,
          textAlign: 'center',
          padding: '48px 24px',
          border: '1px solid rgba(245,197,24,0.15)',
          background: 'rgba(245,197,24,0.03)',
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🛡</p>
          <p style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
            Connect your wallet to view your vault
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px', lineHeight: 1.6 }}>
            Your timeline is associated with your QIE wallet address.
          </p>
          <ConnectButton type="evm" size="lg" />
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <span style={{
            display: 'inline-block', width: 28, height: 28,
            border: '2px solid rgba(245,197,24,0.2)',
            borderTop: '2px solid #F5C518',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
            Loading vault…
          </p>
        </div>
      ) : files.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
          <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>
            No memories yet
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
            Start by uploading your first encrypted memory.
          </p>
          <a
            href="/legacy/upload"
            style={{
              background: 'linear-gradient(135deg, #D97706, #F5C518)',
              color: '#0d0e11', border: 'none', borderRadius: 8,
              padding: '10px 22px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
            }}
          >
            📁 Upload Memories
          </a>
        </div>
      ) : (
        <>
          {/* Wallet info bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20, flexWrap: 'wrap', gap: 8,
          }}>
            <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {truncateAddress(wallet)} · QIE Mainnet
            </p>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {/* Date-grouped file cards */}
          {Object.entries(groups).map(([date, group]) => (
            <div key={date} style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
                {date}
              </p>
              {group.map((f) => (
                <FileCard key={f.id} file={f} walletAddress={wallet} onDelete={removeFile} />
              ))}
            </div>
          ))}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
