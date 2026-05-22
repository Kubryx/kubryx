// Built by vsrupeshkumar
'use client'

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onClose: () => void
  onConnectEVM: () => void
  onConnectSolana: () => void
}

export function WalletModal({ onClose, onConnectEVM, onConnectSolana }: Props) {
  const hasMetaMask = typeof window !== 'undefined'
    && !!(window as unknown as { ethereum?: unknown }).ethereum
  const hasPhantom = typeof window !== 'undefined'
    && !!(window as unknown as { solana?: { isPhantom?: boolean } }).solana?.isPhantom

  const options = [
    {
      id: 'metamask',
      name: 'MetaMask',
      emoji: '🦊',
      description: 'Connect to QIE Mainnet, Arbitrum, Ethereum',
      tools: ['Credit Passport', 'Family Vault', 'Private Vault', 'AI Lending', 'Bill Split'],
      color: '#F5841F',
      detected: hasMetaMask,
      installUrl: 'https://metamask.io/download/',
      onClick: onConnectEVM,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      emoji: '👻',
      description: 'Connect to Solana Devnet',
      tools: ['Agent Co-ordinator', 'Yield Operations Hub', 'Stealth Execution Suite'],
      color: '#9945ff',
      detected: hasPhantom,
      installUrl: 'https://phantom.app/',
      onClick: onConnectSolana,
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-[#0C0C0C] border border-white/10 rounded-2xl w-full max-w-[440px] shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8">
            <div>
              <h2 className="text-lg text-white font-semibold">Connect Wallet</h2>
              <p className="text-xs text-white/40 mt-0.5">Choose your wallet provider</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {/* Options */}
          <div className="p-4 space-y-3">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={opt.detected ? opt.onClick : () => window.open(opt.installUrl, '_blank')}
                className="w-full p-4 rounded-xl border border-white/8 hover:border-white/18 bg-white/2 hover:bg-white/5 transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}28` }}
                  >
                    {opt.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium">{opt.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        opt.detected
                          ? 'text-[#10b981] bg-[#10b981]/10'
                          : 'text-[#f59e0b] bg-[#f59e0b]/10'
                      }`}>
                        {opt.detected ? '● Detected' : 'Not installed'}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-2">{opt.description}</p>

                    {/* Tool tags */}
                    <div className="flex flex-wrap gap-1">
                      {opt.tools.map(t => (
                        <span
                          key={t}
                          className="text-xs text-white/25 bg-white/4 px-1.5 py-0.5 rounded"
                          style={{ fontFamily: '"Fira Code", monospace' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-1">
            <p className="text-xs text-white/20 text-center leading-relaxed">
              Your private keys never leave your wallet.
              Kubryx only reads your public address.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
