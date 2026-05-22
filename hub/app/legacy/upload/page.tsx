// Built by vsrupeshkumar
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { encryptFile } from '../../../lib/eternavault-encryption'
import { uploadMemory } from '../../../lib/eternavault-api'
import {
  isMetaMaskInstalled,
  truncateAddress,
  WALLET_INSTALL_LINKS,
} from '../../../lib/wallet-utils'
import { toast } from '../../../lib/toast'
import { useWalletForTool } from '../../../hooks/useWalletForTool'
import { ConnectButton } from '../../../components/wallet/ConnectButton'

const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '24px 26px',
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
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.6)',
  marginBottom: 6,
  letterSpacing: '0.04em',
}

export default function UploadPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [vaultKey, setVaultKey] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'encrypting' | 'uploading' | 'done' | 'error'>('idle')
  const [uploadId, setUploadId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])


  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!vaultKey) { toast.error('Enter a vault encryption key'); return }
    if (vaultKey.length < 8) { toast.error('Key should be at least 8 characters'); return }
    if (!file) { toast.error('Select a file to encrypt'); return }

    try {
      setStatus('encrypting')
      const { encryptedBlob, saltHex, ivHex } = await encryptFile(file, vaultKey)

      setStatus('uploading')
      const res = await uploadMemory({
        encryptedBlob,
        saltHex,
        ivHex,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        title: title.trim(),
        description: description.trim(),
        ownerDid: wallet ? `did:qie:${wallet}` : 'did:qie:anonymous',
      })

      setUploadId(res.id)
      setStatus('done')
      setVaultKey('')
      setFile(null)
      setTitle('')
      setDescription('')
      toast.success(`Memory uploaded! ID: ${res.id}`)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message || 'Upload failed — check your connection.')
      toast.error('Upload failed')
    }
  }

  function reset() {
    setStatus('idle')
    setUploadId('')
    setErrorMsg('')
  }

  const busy = status === 'encrypting' || status === 'uploading'

  return (
    <main style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#D97706', marginBottom: 6 }}>
          UPLOAD MEMORY
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          Upload an encrypted memory
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
          Files are encrypted locally in your browser using AES-GCM-256 before being sent to the backend.{' '}
          <strong style={{ color: 'rgba(255,255,255,0.65)' }}>The server never sees your plaintext.</strong>
        </p>
      </header>

      {/* Encryption info */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        {[
          { label: 'AES-GCM-256', color: '#60A5FA' },
          { label: 'PBKDF2 / SHA-256', color: '#60A5FA' },
          { label: '100,000 iterations', color: '#60A5FA' },
          { label: 'Zero-knowledge', color: '#22C55E' },
        ].map((b) => (
          <span
            key={b.label}
            style={{
              fontSize: 10,
              padding: '3px 10px',
              borderRadius: 12,
              background: `${b.color}12`,
              border: `1px solid ${b.color}30`,
              color: b.color,
              fontWeight: 600,
            }}
          >
            {b.label}
          </span>
        ))}
      </div>

      {/* Success state */}
      {status === 'done' && (
        <div
          style={{
            ...card,
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.25)',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 18, fontFamily: SERIF, fontWeight: 700, color: '#22C55E', margin: '0 0 8px' }}>
            ✅ Memory uploaded successfully!
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>
            Vault Entry ID:{' '}
            <code style={{ fontFamily: 'monospace', color: '#F5C518', fontSize: 12 }}>{uploadId}</code>
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
            Your file is encrypted and stored. Only you (and your heirs, when the time comes) can decrypt it.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/legacy/timeline"
              style={{
                background: 'linear-gradient(135deg, #D97706, #F5C518)',
                color: '#0d0e11',
                border: 'none',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              📋 View in Timeline
            </Link>
            <button
              onClick={reset}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {status !== 'done' && (
        <form onSubmit={handleSubmit}>
          <div style={card}>
            {/* Vault Key */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>VAULT ENCRYPTION KEY *</label>
              <input
                type="password"
                value={vaultKey}
                onChange={(e) => setVaultKey(e.target.value)}
                placeholder="Enter a secure passphrase"
                autoComplete="new-password"
                style={inputStyle}
                disabled={busy}
              />
              <p
                style={{
                  fontSize: 11,
                  color: '#F97316',
                  margin: '6px 0 0',
                  background: 'rgba(249,115,22,0.06)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  lineHeight: 1.5,
                }}
              >
                ⚠️ Do not lose this key — your memories cannot be decrypted without it. Keep it in a safe place (password manager, physical backup, etc.)
              </p>
            </div>

            {/* File upload */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>SELECT FILE *</label>
              <div
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#F5C518' : file ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 10,
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'rgba(245,197,24,0.04)' : file ? 'rgba(34,197,94,0.04)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <p style={{ fontSize: 28, marginBottom: 8 }}>{file ? '✅' : '📁'}</p>
                {file ? (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#22C55E', margin: '0 0 4px' }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown type'}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                      Any file type accepted — will be encrypted client-side
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={onFileInput}
                style={{ display: 'none' }}
              />
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>MEMORY TITLE (OPTIONAL)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 'Wedding toast, First recital, Family photo album'"
                style={inputStyle}
                disabled={busy}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>MEMORY DESCRIPTION (OPTIONAL)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context so heirs understand why this matters to you"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                disabled={busy}
              />
            </div>

            {/* Error */}
            {status === 'error' && errorMsg && (
              <div
                style={{
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#F87171',
                }}
              >
                ❌ {errorMsg}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={busy}
                style={{
                  background: busy ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #D97706, #F5C518)',
                  color: busy ? 'rgba(255,255,255,0.5)' : '#0d0e11',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {status === 'encrypting' && (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Encrypting…
                  </>
                )}
                {status === 'uploading' && (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Uploading…
                  </>
                )}
                {(status === 'idle' || status === 'error') && '🔒 Encrypt & Upload'}
              </button>
              <Link
                href="/legacy"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 13,
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(255,255,255,0.2)',
                }}
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      )}

      {/* Wallet connect */}
      {installed && !wallet && (
        <div
          style={{
            ...card,
            marginTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            padding: '14px 18px',
            background: 'rgba(245,197,24,0.04)',
            border: '1px solid rgba(245,197,24,0.15)',
          }}
        >
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Connect wallet to anchor memories on QIE Mainnet
          </p>
          <ConnectButton type="evm" size="lg" />
        </div>
      )}

      {wallet && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12, fontFamily: 'monospace' }}>
          Wallet: {truncateAddress(wallet)} · QIE Mainnet
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
