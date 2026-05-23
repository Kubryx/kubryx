// Built by vsrupeshkumar
import { NEUROCREDIT_API } from './api'
import { resilientRequest } from './api-resilience'
import { logTelemetryError } from './telemetry'
import {
  fallbackScore,
  fallbackBreakdown,
  fallbackStaking,
  ORACLE_PRICE_FALLBACK,
  fallbackLoanOffers,
  MOCK_AI_RESPONSES,
  type StakingTier,
} from './neurocredit-fallbacks'

export type NcScoreResponse = {
  address: string
  score: number
  riskBand: number
  explanation: string
  transactionHash: string
}

export type NcBreakdown = {
  score: number
  baseScore: number
  stakingBoost: number
  oraclePenalty: number
  stakingTier: StakingTier
  lastUpdated: string
}

export type NcPrediction = {
  currentScore: number
  predictedScore: number
  change: number
  explanation: string
  confidence: number
}

export type NcStakingData = {
  stakedAmount: number
  availableBalance: number
  currentTier: StakingTier
  scoreBoost: number
  progressToNextTier: number
  nextTierRequired: number
  nextTierName: string
}

export type NcLoanOffer = {
  id: string
  loanAmount: number
  interestRate: number
  collateralRequired: number
  duration: number
  ltv: number
  recommendation: string
}

export type NcChatResponse = {
  reply: string
  loanTerms: { amount: number; interestRate: number; duration: number; collateral: number } | null
  conversationId: string
}

export async function generateScore(address: string): Promise<NcScoreResponse> {
  try {
    return await resilientRequest<NcScoreResponse>(
      `${NEUROCREDIT_API}/api/score`,
      { method: 'POST', body: JSON.stringify({ address }) },
      `nc_score_${address}`
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC generateScore', err?.message, err)
    return { ...fallbackScore, address }
  }
}

export async function fetchScoreBreakdown(address: string): Promise<NcBreakdown> {
  try {
    return await resilientRequest<NcBreakdown>(
      `${NEUROCREDIT_API}/api/score/${address}`,
      {},
      `nc_breakdown_${address}`
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC fetchScoreBreakdown', err?.message, err)
    return { ...fallbackBreakdown }
  }
}

export async function predictScore(
  address: string,
  scenario: 'repayment' | 'staking' | 'transactions' | 'diversification'
): Promise<NcPrediction> {
  try {
    return await resilientRequest<NcPrediction>(
      `${NEUROCREDIT_API}/api/score-predictor`,
      { method: 'POST', body: JSON.stringify({ address, scenario }) }
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC predictScore', err?.message, err)
    const changes: Record<string, number> = { repayment: 70, staking: 50, transactions: 35, diversification: 45 }
    const explanations: Record<string, string> = {
      repayment: 'Repaying loans demonstrates financial reliability and boosts on-chain credit history.',
      staking: 'Staking 500 NCRD would qualify you for Bronze tier, adding a +50 score boost.',
      transactions: 'Increasing transaction volume improves your on-chain activity score.',
      diversification: 'Diversifying to 5+ assets reduces risk and improves your DeFi activity score.',
    }
    const change = changes[scenario] ?? 50
    return {
      currentScore: 650,
      predictedScore: 650 + change,
      change,
      explanation: explanations[scenario] ?? 'AI-modeled on-chain behavior prediction.',
      confidence: 0.85,
    }
  }
}

export async function fetchStaking(address: string): Promise<NcStakingData> {
  try {
    return await resilientRequest<NcStakingData>(
      `${NEUROCREDIT_API}/api/staking/${address}`,
      {},
      `nc_staking_${address}`
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC fetchStaking', err?.message, err)
    return { ...fallbackStaking }
  }
}

export async function stakeNCRD(address: string, amount: number): Promise<{ txHash: string; status: string }> {
  try {
    return await resilientRequest<{ txHash: string; status: string }>(
      `${NEUROCREDIT_API}/api/staking/stake`,
      { method: 'POST', body: JSON.stringify({ address, amount }) }
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC stakeNCRD', err?.message, err)
    return { txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`, status: 'pending' }
  }
}

export async function unstakeNCRD(address: string, amount: number): Promise<{ txHash: string; status: string }> {
  try {
    return await resilientRequest<{ txHash: string; status: string }>(
      `${NEUROCREDIT_API}/api/staking/unstake`,
      { method: 'POST', body: JSON.stringify({ address, amount }) }
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC unstakeNCRD', err?.message, err)
    return { txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`, status: 'pending' }
  }
}

export async function sendChat(
  message: string,
  address: string,
  conversationId?: string
): Promise<NcChatResponse> {
  try {
    return await resilientRequest<NcChatResponse>(
      `${NEUROCREDIT_API}/api/chat`,
      { method: 'POST', body: JSON.stringify({ message, address, conversationId }) }
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC sendChat', err?.message, err)
    return {
      reply: MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)],
      loanTerms: null,
      conversationId: conversationId ?? `mock-${Date.now()}`,
    }
  }
}

export async function fetchLendingOffers(
  address: string
): Promise<{ creditScore: number; offers: NcLoanOffer[] }> {
  try {
    return await resilientRequest<{ creditScore: number; offers: NcLoanOffer[] }>(
      `${NEUROCREDIT_API}/api/lending-demo/${address}`,
      {},
      `nc_offers_${address}`
    )
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC fetchLendingOffers', err?.message, err)
    return { creditScore: 650, offers: fallbackLoanOffers }
  }
}

export async function fetchOraclePrice(): Promise<number> {
  try {
    const r = await resilientRequest<{ price: number }>(`${NEUROCREDIT_API}/api/oracle/price`)
    return typeof r.price === 'number' ? r.price : ORACLE_PRICE_FALLBACK
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'NC fetchOraclePrice', err?.message, err)
    return ORACLE_PRICE_FALLBACK
  }
}
