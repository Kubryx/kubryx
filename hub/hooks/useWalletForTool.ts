// Built by vsrupeshkumar
'use client'

import { usePathname } from 'next/navigation'
import { useWallet } from '@/context/WalletContext'
import { SOLANA_TOOLS, TOOL_NETWORKS, NETWORKS } from '@/lib/networks'

/**
 * Route-aware wallet hook. Resolves the correct wallet (EVM or Solana) for the
 * tool the user is currently viewing, and reports whether the connected EVM
 * wallet is on the network that tool expects.
 */
export function useWalletForTool() {
  const pathname = usePathname()
  const { evm, solana, connectEVM, connectSolana, switchToNetwork } = useWallet()

  const route = '/' + (pathname?.split('/')[1] ?? '')
  const isSolana = SOLANA_TOOLS.includes(route)
  const wallet = isSolana ? solana : evm
  const connect = isSolana ? connectSolana : connectEVM

  const expectedNetworkKey = TOOL_NETWORKS[route]
  const expectedNetwork = expectedNetworkKey ? NETWORKS[expectedNetworkKey] : null

  const isWrongNetwork = Boolean(
    !isSolana &&
    evm.isConnected &&
    expectedNetwork &&
    expectedNetwork.chainIdDecimal != null &&
    evm.chainId !== expectedNetwork.chainIdDecimal,
  )

  async function switchToCorrectNetwork() {
    if (!expectedNetwork || expectedNetwork.chainId == null || !expectedNetworkKey) return
    await switchToNetwork(expectedNetwork.chainId, expectedNetworkKey)
  }

  return {
    evm,
    solana,
    wallet,
    connect,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    address: wallet.address,
    balance: wallet.balance,
    isSolana,
    isEVM: !isSolana,
    isWrongNetwork,
    expectedNetwork,
    expectedNetworkKey,
    switchToCorrectNetwork,
    route,
  }
}
