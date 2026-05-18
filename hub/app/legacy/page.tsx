'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  isMetaMaskInstalled,
  truncateAddress,
  switchToQIE,
  loadWallet,
  persistWallet,
  clearWallet,
  WALLET_INSTALL_LINKS,
  QIE_MAINNET,
} from '../../lib/wallet-utils'
import { toast } from '../../lib/toast'

// ─── Style helpers ────────────────────────────────────────────
const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(245,197,24,0.1)',
  borderRadius: 14,
  padding: '20px 22px',
}

const btnGold: React.CSSProperties = {
  background: 'linear-gradient(135deg, #D97706, #F5C518)',
  color: '#0d0e11',
  border: 'none',
  borderRadius: 30,
  padding: '12px 28px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
}

const btnOutline: React.CSSProperties = {
  background: 'transparent',
  color: '#F5C518',
  border: '1px solid rgba(245,197,24,0.4)',
  borderRadius: 30,
  padding: '11px 28px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
}

const btnDark: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.8)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 30,
  padding: '11px 28px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
}

export default function LegacyLandingPage() {
  const [wallet, setWallet] = useState('')
  const [error, setError] = useState('')

  const installed = useMemo(() => (typeof window === 'undefined' ? true : isMetaMaskInstalled()), [])

  useEffect(() => {
    const saved = loadWallet('evm')
    if (saved) setWallet(saved)
  }, [])

  async function connect() {
    setError('')
    try {
      if (!isMetaMaskInstalled()) throw new Error('MetaMask is not installed.')
      await switchToQIE()
      const accounts = (await (window as any).ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      const address = accounts[0] || ''
      setWallet(address)
      persistWallet('evm', address)
      toast.success('Connected to QIE Mainnet')
    } catch (err: any) {
      const msg = err?.message || 'Unable to connect.'
      setError(msg)
      toast.error(msg)
    }
  }

  function disconnect() {
    setWallet('')
    clearWallet('evm')
    toast.success('Wallet disconnected')
  }

  return (
    <main style={{ padding: '0' }}>
      {/* ── Hero ── */}
      <section
        style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(217,119,6,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
          <span
            style={{
              fontSize: 11,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22C55E',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
            QIE Mainnet enabled
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60A5FA',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600,
            }}
          >
            🔒 Encryption: AES-GCM-256
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900,
            lineHeight: 1.15,
            maxWidth: 780,
            margin: '0 0 20px',
            background: 'linear-gradient(135deg, #F5C518 20%, #FDE68A 60%, #F5C518 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
          }}
        >
          EternaVault – Where Identity Meets Eternity
        </h1>

        <p
          style={{
            fontSize: 17,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 620,
            lineHeight: 1.65,
            margin: '0 0 16px',
            position: 'relative',
          }}
        >
          Encrypt your memories client-side, anchor them on QIE Mainnet, and empower your heirs to access them only when the time is right.
        </p>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.35)',
            maxWidth: 540,
            lineHeight: 1.6,
            margin: '0 0 40px',
            position: 'relative',
          }}
        >
          Your memories are encrypted in your browser before ever leaving your device. Only your heirs can decrypt them when the time is right.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
          <Link href="/legacy/upload" style={btnGold}>
            📁 Upload Memories
          </Link>
          <Link href="/legacy/heir" style={btnOutline}>
            🔐 Heir Dashboard
          </Link>
        </div>

        <div style={{ position: 'relative' }}>
          {wallet ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  padding: '8px 16px',
                }}
              >
                {truncateAddress(wallet)} · {QIE_MAINNET.chainName}
              </span>
              <button
                onClick={disconnect}
                style={{ ...btnDark, padding: '8px 16px', fontSize: 12 }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connect} style={btnDark}>
              🔗 Connect Wallet
            </button>
          )}
          {error && (
            <p style={{ color: '#F87171', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>
          )}
          {!installed && (
            <a
              href={WALLET_INSTALL_LINKS.metamask}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btnDark, marginTop: 8, fontSize: 13 }}
            >
              Install MetaMask
            </a>
          )}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section style={{ padding: '0 24px 60px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            {
              icon: '🔒',
              title: 'Client-Side Encryption',
              desc: 'AES-GCM-256 with PBKDF2/SHA-256 key derivation. Your passphrase never leaves your browser.',
              color: '#60A5FA',
            },
            {
              icon: '⛓',
              title: 'On-Chain Anchoring',
              desc: 'File references anchored on QIE Mainnet via LegacyVault.sol. Tamper-proof audit trail.',
              color: '#22C55E',
            },
            {
              icon: '👨‍👩‍👧‍👦',
              title: 'Heir Governance',
              desc: 'Register heirs and validators on-chain. Access unlocks only when legacy is activated.',
              color: '#F5C518',
            },
            {
              icon: '🧬',
              title: 'AI Legacy Stories',
              desc: 'AI generates a personal narrative from your memory metadata for your heirs to cherish.',
              color: '#A78BFA',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              style={{
                ...card,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 28 }}>{feat.icon}</span>
              <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: feat.color, margin: 0 }}>
                {feat.title}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick navigation ── */}
      <section style={{ padding: '0 24px 60px', maxWidth: 1000, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
          VAULT SECTIONS
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { href: '/legacy/upload', icon: '📁', label: 'Upload Memories', desc: 'Encrypt & store files' },
            { href: '/legacy/timeline', icon: '📋', label: 'Timeline', desc: 'All your encrypted files' },
            { href: '/legacy/heir', icon: '🔐', label: 'Heir Access', desc: 'Unlock inherited vault' },
            { href: '/legacy/validator', icon: '⚖️', label: 'Validator', desc: 'Register & verify events' },
            { href: '/legacy/tokenization', icon: '🪙', label: 'DLT Token', desc: 'Link QIEDEX token' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...card,
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                transition: 'border-color 0.2s',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: '#F5C518' }}>{item.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{item.desc}</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section style={{ padding: '0 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div
          style={{
            background: 'rgba(245,197,24,0.04)',
            border: '1px solid rgba(245,197,24,0.12)',
            borderRadius: 12,
            padding: '16px 20px',
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.7 }}>
            ⚠️ This application uses client-side encryption (AES-GCM-256) for all memories. Your vault key is your
            responsibility — back it up securely (password manager, physical backup). In a full deployment,
            connecting your QIE wallet lets you register heirs and anchor file references on-chain via
            LegacyVault.sol.
          </p>
        </div>
      </section>
    </main>
  )
}
