// Built by vsrupeshkumar
'use client'

import { useWalletForTool } from '@/hooks/useWalletForTool'
import { useToolInfo } from '@/hooks/useToolInfo'
import { ConnectButton } from './ConnectButton'

export function WalletPill() {
  const { isConnected, address, balance, isSolana, expectedNetwork } = useWalletForTool()
  const tool = useToolInfo()

  function truncate(a: string) {
    return `${a.slice(0, 5)}...${a.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="mx-3 mb-3">
        <ConnectButton
          type={isSolana ? 'solana' : 'evm'}
          size="sm"
          className="w-full justify-center"
          toolColor={tool?.color}
        />
      </div>
    )
  }

  return (
    <div
      className="mx-3 mb-3 p-3 rounded-xl bg-white/4 border border-white/8 hover:bg-white/6 transition-colors cursor-default"
      style={{ borderColor: tool ? `${tool.color}25` : undefined }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse flex-shrink-0" />
        <span
          className="text-xs text-white/65 truncate"
          style={{ fontFamily: '"Fira Code", monospace' }}
        >
          {address ? truncate(address) : ''}
        </span>
      </div>
      {balance && (
        <p className="text-xs text-white/30 pl-4">
          {parseFloat(balance).toFixed(3)} {isSolana ? 'SOL' : 'ETH'}
        </p>
      )}
      <p
        className="text-xs text-white/20 pl-4 mt-0.5"
        style={{ fontFamily: '"Fira Code", monospace' }}
      >
        {isSolana ? 'Solana Devnet' : (expectedNetwork?.name ?? 'EVM Network')}
      </p>
    </div>
  )
}
