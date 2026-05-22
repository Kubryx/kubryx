// Built by vsrupeshkumar
'use client'

import { AlertTriangle } from 'lucide-react'
import { useWalletForTool } from '@/hooks/useWalletForTool'
import { NETWORKS, getNetworkByChainId } from '@/lib/networks'

export function NetworkBadge() {
  const { evm, isSolana, isConnected, isWrongNetwork } = useWalletForTool()

  if (!isConnected) return null

  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f59e0b]/12 border border-[#f59e0b]/25 text-[#f59e0b] text-xs font-medium">
        <AlertTriangle size={10} />
        Wrong Network
      </div>
    )
  }

  // Find current network name
  const currentNet = isSolana
    ? NETWORKS.SOLANA_DEVNET
    : getNetworkByChainId(evm.chainId)

  const name = currentNet?.shortName ?? `Chain ${evm.chainId}`
  const color = currentNet?.color ?? '#10b981'

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
      style={{
        background: `${color}12`,
        borderColor: `${color}25`,
        color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      {name}
    </div>
  )
}
