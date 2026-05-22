// Built by vsrupeshkumar
'use client'

import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWalletForTool } from '@/hooks/useWalletForTool'
import { useToolInfo } from '@/hooks/useToolInfo'

export function WrongNetworkBanner() {
  const { isWrongNetwork, expectedNetwork, switchToCorrectNetwork } = useWalletForTool()
  const tool = useToolInfo()

  return (
    <AnimatePresence>
      {isWrongNetwork && expectedNetwork && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mx-4 sm:mx-6 mt-4 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#f59e0b]/8 border border-[#f59e0b]/18">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0" />
              <div>
                <p className="text-sm text-[#f59e0b] font-medium leading-none mb-0.5">
                  Wrong Network
                </p>
                <p className="text-xs text-white/45">
                  {tool?.name ?? 'This tool'} requires{' '}
                  <span className="text-white/70">{expectedNetwork.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={switchToCorrectNetwork}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#f59e0b] text-[#080808] text-xs font-semibold hover:bg-[#e6a800] transition-colors whitespace-nowrap"
            >
              Switch Network
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
