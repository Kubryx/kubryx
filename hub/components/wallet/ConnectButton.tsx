// Built by vsrupeshkumar
'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, LogOut, Copy, CheckCheck } from 'lucide-react'
import { useWallet } from '@/context/WalletContext'
import { WalletModal } from './WalletModal'

interface Props {
  type?: 'evm' | 'solana' | 'auto'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  toolColor?: string   // tool accent color for border glow on connect
}

export function ConnectButton({
  type = 'auto',
  size = 'md',
  className = '',
  toolColor = '#F5C518',
}: Props) {
  const { evm, solana, connectEVM, connectSolana, disconnectEVM, disconnectSolana } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const isSolana = type === 'solana'
  const wallet = isSolana ? solana : evm
  const { isConnected, isConnecting, address, balance } = wallet

  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  }

  function truncate(a: string) {
    return `${a.slice(0, 6)}...${a.slice(-4)}`
  }

  async function copy() {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function disconnect() {
    if (isSolana) disconnectSolana()
    else disconnectEVM()
    setShowDropdown(false)
  }

  // ─ Not connected ───────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <>
        <button
          disabled={isConnecting}
          onClick={() => {
            if (type === 'auto') setShowModal(true)
            else if (isSolana) connectSolana()
            else connectEVM()
          }}
          className={`
            flex items-center rounded-full font-medium transition-all duration-200
            bg-[#F5C518] text-[#080808] hover:bg-[#e6b800] active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeMap[size]} ${className}
          `}
        >
          <Wallet size={13} />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {showModal && (
          <WalletModal
            onClose={() => setShowModal(false)}
            onConnectEVM={async () => { await connectEVM(); setShowModal(false) }}
            onConnectSolana={async () => { await connectSolana(); setShowModal(false) }}
          />
        )}
      </>
    )
  }

  // ─ Connected ───────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(v => !v)}
        className={`
          flex items-center rounded-full font-medium transition-all duration-200
          bg-white/8 border border-white/12 text-white hover:bg-white/12
          ${sizeMap[size]} ${className}
        `}
        style={{ borderColor: `${toolColor}40` }}
      >
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
        <span className="font-mono text-xs" style={{ fontFamily: '"Fira Code", monospace' }}>
          {address ? truncate(address) : ''}
        </span>
        {balance && (
          <span className="text-white/40 text-xs hidden sm:inline">
            {parseFloat(balance).toFixed(3)} {isSolana ? 'SOL' : 'ETH'}
          </span>
        )}
        <ChevronDown
          size={11}
          className={`text-white/40 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 z-50 bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden">

            {/* Address block */}
            <div className="p-4 border-b border-white/8">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs text-white/40">
                  {isSolana ? 'Phantom · Solana Devnet' : 'MetaMask · Chain ' + evm.chainId}
                </span>
              </div>
              <p className="text-sm text-white break-all leading-relaxed" style={{ fontFamily: '"Fira Code", monospace' }}>
                {address}
              </p>
              {balance && (
                <p className="text-xs text-white/40 mt-1.5">
                  Balance: {balance} {isSolana ? 'SOL' : 'ETH'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-2 space-y-0.5">
              <button
                onClick={copy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                {copied
                  ? <CheckCheck size={13} className="text-[#10b981]" />
                  : <Copy size={13} />
                }
                {copied ? 'Copied!' : 'Copy Address'}
              </button>

              <button
                onClick={disconnect}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#ef4444] hover:bg-red-500/8 transition-colors"
              >
                <LogOut size={13} />
                Disconnect Wallet
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
