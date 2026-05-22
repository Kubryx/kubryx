// Built by vsrupeshkumar
// Credit Passport contract interactions (QIE Mainnet, Chain ID 1990).
// Signatures verified against the deployed source in creditblocks/contracts.
// Every function tries the real on-chain call first and silently falls back
// to a safe default on any error — it never throws, so the UI cannot crash.

import { CONTRACTS } from './abis'
import { ethCall, encodeCall, decodeUint256 } from './rpc'

/** A wrapper around window.ethereum's eth_sendTransaction, supplied by the page. */
export type SendTransaction = (tx: Record<string, unknown>) => Promise<string>

// NCRD uses 18 decimals.
const ONE = BigInt(10) ** BigInt(18)

function formatTokens(raw: bigint): string {
  const whole = raw / ONE
  const frac = (raw % ONE).toString().padStart(18, '0').slice(0, 2)
  return `${whole.toString()}.${frac}`
}

function toBaseUnits(amount: string): string {
  const [w, f = ''] = amount.trim().split('.')
  const frac = (f + '0'.repeat(18)).slice(0, 18)
  return (BigInt(w || '0') * ONE + BigInt(frac || '0')).toString()
}

/**
 * Reads the on-chain credit score (0–1000) from CreditPassportNFT.getScore().
 * getScore returns a ScoreView struct { uint16 score; uint8 riskBand;
 * uint64 lastUpdated } — ABI-encoded as 3 words; word[0] is the score.
 * Read-only. Returns 0 when there is no passport / the call fails.
 */
export async function readCreditScore(address: string): Promise<number> {
  try {
    const data = encodeCall('getScore(address)', address)
    const result = await ethCall(CONTRACTS.CreditPassportNFT, data)
    const score = Number(decodeUint256(result)) // word[0] = score
    return Number.isFinite(score) && score >= 0 ? score : 0
  } catch (e) {
    console.error('[creditPassport] readCreditScore failed:', e)
    return 0
  }
}

/**
 * Returns true if a credit passport NFT has been minted for this wallet.
 * passportIdOf returns the token id (0 = no passport yet — the Kubryx
 * backend mints passports after on-chain activity is detected).
 */
export async function readPassportExists(address: string): Promise<boolean> {
  try {
    const data = encodeCall('passportIdOf(address)', address)
    const result = await ethCall(CONTRACTS.CreditPassportNFT, data)
    return decodeUint256(result) > BigInt(0)
  } catch (e) {
    console.error('[creditPassport] readPassportExists failed:', e)
    return false
  }
}

/**
 * Reads the NCRD amount staked by an address from NeuroCredStaking.
 * stakedAmount(address) returns a uint256 (18 decimals). Read-only.
 * Returns "0" on failure.
 */
export async function readStakedAmount(address: string): Promise<string> {
  try {
    const data = encodeCall('stakedAmount(address)', address)
    const result = await ethCall(CONTRACTS.NeuroCredStaking, data)
    return formatTokens(decodeUint256(result))
  } catch (e) {
    console.error('[creditPassport] readStakedAmount failed:', e)
    return '0'
  }
}

/**
 * Reads the integration tier from NeuroCredStaking.integrationTier(address).
 * Returns a uint8: 0 = None, 1 = Bronze (500+ NCRD), 2 = Silver (2,000+),
 * 3 = Gold (10,000+). Read-only. Returns 0 on failure.
 */
export async function readIntegrationTier(address: string): Promise<number> {
  try {
    const data = encodeCall('integrationTier(address)', address)
    const result = await ethCall(CONTRACTS.NeuroCredStaking, data)
    const tier = Number(decodeUint256(result))
    return tier >= 0 && tier <= 3 ? tier : 0
  } catch (e) {
    console.error('[creditPassport] readIntegrationTier failed:', e)
    return 0
  }
}

/**
 * Stakes NCRD tokens via NeuroCredStaking.stake(uint256).
 * ⚠ Will revert on-chain until a real NCRD ERC-20 token is deployed — the
 * staking contract currently points at an address with no contract code.
 * Returns the transaction hash, or '' on failure.
 */
export async function stakeTokens(
  address: string,
  amount: string,
  sendTransaction: SendTransaction,
): Promise<string> {
  try {
    const data = encodeCall('stake(uint256)', toBaseUnits(amount))
    return await sendTransaction({
      from: address,
      to: CONTRACTS.NeuroCredStaking,
      data,
    })
  } catch (e) {
    console.error('[creditPassport] stakeTokens failed:', e)
    return ''
  }
}

/**
 * Unstakes NCRD tokens via NeuroCredStaking.unstake(uint256).
 * ⚠ Same caveat as stakeTokens — reverts on-chain until NCRD is deployed.
 * Returns the transaction hash, or '' on failure.
 */
export async function unstakeTokens(
  address: string,
  amount: string,
  sendTransaction: SendTransaction,
): Promise<string> {
  try {
    const data = encodeCall('unstake(uint256)', toBaseUnits(amount))
    return await sendTransaction({
      from: address,
      to: CONTRACTS.NeuroCredStaking,
      data,
    })
  } catch (e) {
    console.error('[creditPassport] unstakeTokens failed:', e)
    return ''
  }
}
