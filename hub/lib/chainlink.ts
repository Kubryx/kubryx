// Built by vsrupeshkumar
// Chainlink Price Feeds integration helper using ethers.js
import { ethers } from 'ethers'

const FEEDS: Record<string, string> = {
  ETH: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  BTC: '0x6ce185860a4963106506C203335A2910413708e9',
  SOL: '0x24ceA4b8ce57cdA33e5C2197d3aAE4313DE5a5f0',
  LINK: '0x86E53CF1B873D1676110dac36195fD6C52B02c72',
}

const ABI = [
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
]

export async function getChainlinkPrice(pair: string): Promise<number> {
  const symbol = pair.toUpperCase()
  const address = FEEDS[symbol]
  if (!address) {
    throw new Error(`Unsupported Chainlink price feed pair: ${pair}`)
  }

  const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_RPC
  if (!rpcUrl) {
    throw new Error('NEXT_PUBLIC_ARBITRUM_RPC environment variable is not defined')
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(address, ABI, provider)
    
    // Call latestRoundData()
    const [, answer] = await contract.latestRoundData()
    
    // Chainlink price feeds usually have 8 decimals for USD pairs
    return Number(answer) / 1e8
  } catch (err) {
    console.error(`[chainlink] Error fetching price for ${pair}:`, err)
    // Return standard mock/fallback if RPC or query fails
    const fallbacks: Record<string, number> = { ETH: 3125.50, BTC: 64250.00, SOL: 142.20, LINK: 13.80 }
    return fallbacks[symbol] || 0
  }
}
