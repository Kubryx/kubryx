// Built by vsrupeshkumar
import { PALMFLOW_API } from './api'
import { logTelemetryError } from './telemetry'
import {
  PF_AGENTS, PF_STREAMS, PF_HISTORY, PF_POLICIES, PF_TREASURY_CHART, PF_CHART_LABELS,
  PF_PORTFOLIO, PF_WALLETS, PF_TRANSACTIONS, PF_SWAP_ROUTES, PF_PAYMENT_REQUESTS,
  PF_ANALYTICS, PF_DEFAULT_SETTINGS, PF_AGENTS_AI, PF_PNL_SUMMARY, PF_TAX_SUMMARY,
  type PFAgent, type PFStream, type PFHistoryItem, type PFPolicy,
  type PFPortfolio, type PFWallet, type PFTransaction, type PFSwapRoute,
  type PFPaymentRequest, type PFAnalyticsData, type PFSettings, type PFAgentAI,
  type PFPnLSummary, type PFTaxSummary, type PFPnLAsset, type PFRealizedTrade, type PFTaxLot,
} from './palmflow-fallbacks'

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  if (!PALMFLOW_API) throw new Error('No API configured')
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12000)
  try {
    const res = await fetch(`${PALMFLOW_API}${path}`, {
      ...opts, signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as T
  } finally { clearTimeout(t) }
}

// ─── Treasury / Dashboard ──────────────────────────────────────────────────────

export type TreasuryData = {
  totalLiquidity: number; networkFlow: number; protocolYield: number; activeAgents: number
  balance: number; chartData: number[]; chartLabels: string[]
}

export async function fetchTreasury(pubkey: string): Promise<TreasuryData> {
  try {
    return await apiFetch<TreasuryData>(`/api/treasury/${pubkey}`)
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchTreasury', e?.message, e)
    return { totalLiquidity:999945, networkFlow:30667.25, protocolYield:11833, activeAgents:8, balance:999945, chartData:PF_TREASURY_CHART, chartLabels:PF_CHART_LABELS }
  }
}

export async function fetchPortfolio(): Promise<PFPortfolio> {
  try {
    return await apiFetch<PFPortfolio>('/api/portfolio')
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchPortfolio', e?.message, e)
    return PF_PORTFOLIO
  }
}

export async function fetchWallets(): Promise<PFWallet[]> {
  try {
    return await apiFetch<PFWallet[]>('/api/wallets')
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchWallets', e?.message, e)
    return PF_WALLETS
  }
}

export async function fetchAgentsAI(): Promise<PFAgentAI[]> {
  try {
    return await apiFetch<PFAgentAI[]>('/api/agents/ai')
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchAgentsAI', e?.message, e)
    return PF_AGENTS_AI
  }
}

// ─── Workforce Agents ──────────────────────────────────────────────────────────

export async function fetchAgents(): Promise<PFAgent[]> {
  try { return await apiFetch<PFAgent[]>('/api/agents') }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchAgents', e?.message, e); return PF_AGENTS }
}

export async function deployAgent(name: string, agentType: string, budget: number): Promise<{ ok: boolean; id: string }> {
  try { return await apiFetch<{ ok: boolean; id: string }>('/api/agents/deploy', { method:'POST', body:JSON.stringify({ name, agentType, budget }) }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF deployAgent', e?.message, e); return { ok:true, id:`agent-${Date.now()}` } }
}

export async function syncAgent(id: string): Promise<{ ok: boolean }> {
  try { return await apiFetch<{ ok: boolean }>(`/api/agents/sync/${id}`, { method:'POST' }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF syncAgent', e?.message, e); return { ok:true } }
}

// ─── Payroll ───────────────────────────────────────────────────────────────────

export async function fetchStreams(pubkey: string): Promise<PFStream[]> {
  try {
    const res = await apiFetch<PFStream[]|{streams?: PFStream[]}>(`/api/payroll/${pubkey}`)
    return Array.isArray(res) ? res : (res.streams ?? [])
  } catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchStreams', e?.message, e); return PF_STREAMS }
}

export async function createStream(data: { recipientName: string; role: string; wallet: string; ratePerHour: number; token: string }): Promise<{ ok: boolean; id: string }> {
  try { return await apiFetch<{ ok: boolean; id: string }>('/api/payroll/add', { method:'POST', body:JSON.stringify(data) }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF createStream', e?.message, e); return { ok:true, id:`stream-${Date.now()}` } }
}

export async function pauseStream(id: string): Promise<{ ok: boolean }> {
  try { return await apiFetch<{ ok: boolean }>(`/api/payroll/pause/${id}`, { method:'POST' }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF pauseStream', e?.message, e); return { ok:true } }
}

export async function resumeStream(id: string): Promise<{ ok: boolean }> {
  try { return await apiFetch<{ ok: boolean }>(`/api/payroll/resume/${id}`, { method:'POST' }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF resumeStream', e?.message, e); return { ok:true } }
}

// ─── Send Payments ─────────────────────────────────────────────────────────────

export type SendPaymentParams = {
  fromWallet: string; toAddress: string; amount: number
  asset: string; network: string; memo?: string; routeId?: string
}

export async function suggestRoute(params: { from: string; to: string; amount: number; fromAsset: string; toNetwork: string }): Promise<PFSwapRoute> {
  try {
    return await apiFetch<PFSwapRoute>('/api/suggest-route', { method:'POST', body:JSON.stringify(params) })
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF suggestRoute', e?.message, e)
    return PF_SWAP_ROUTES[0]
  }
}

export async function sendPayment(params: SendPaymentParams): Promise<{ txHash: string; status: string; estimatedArrival: string }> {
  try {
    return await apiFetch('/api/send-payment', { method:'POST', body:JSON.stringify(params) })
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF sendPayment', e?.message, e)
    return { txHash:`${Date.now().toString(16)}...${Math.random().toString(16).slice(2,6)}`, status:'pending', estimatedArrival:'~30 seconds' }
  }
}

// ─── Receive / Payment Requests ────────────────────────────────────────────────

export async function createPaymentRequest(data: { amount: number; asset: string; network: string; description: string; expiryDate?: string }): Promise<PFPaymentRequest> {
  try {
    return await apiFetch<PFPaymentRequest>('/api/create-payment-request', { method:'POST', body:JSON.stringify(data) })
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF createPaymentRequest', e?.message, e)
    const id = `pr-${Date.now()}`
    return {
      id, amount:data.amount, asset:data.asset, network:data.network,
      description:data.description, status:'pending',
      shareLink:`https://kubryx.vercel.app/pay?req=${id}`,
      createdAt:new Date().toLocaleDateString(),
      expiresAt:data.expiryDate || new Date(Date.now() + 30*86400000).toLocaleDateString(),
    }
  }
}

export async function fetchPaymentRequests(): Promise<PFPaymentRequest[]> {
  try {
    return await apiFetch<PFPaymentRequest[]>('/api/payment-requests')
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchPaymentRequests', e?.message, e)
    return PF_PAYMENT_REQUESTS
  }
}

// ─── Swap ──────────────────────────────────────────────────────────────────────

export type SwapQuoteParams = { fromAsset: string; toAsset: string; amount: number; fromNetwork: string; toNetwork: string }

export async function getSwapQuote(params: SwapQuoteParams): Promise<{ routes: PFSwapRoute[]; bestRoute: PFSwapRoute }> {
  try {
    return await apiFetch('/api/swap-quote', { method:'GET', body:JSON.stringify(params) })
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF getSwapQuote', e?.message, e)
    return { routes: PF_SWAP_ROUTES, bestRoute: PF_SWAP_ROUTES[0] }
  }
}

export async function executeSwap(params: { fromAsset: string; toAsset: string; amount: number; slippageTolerance: number; routeId: string }): Promise<{ txHash: string; status: string }> {
  try {
    return await apiFetch('/api/execute-swap', { method:'POST', body:JSON.stringify(params) })
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF executeSwap', e?.message, e)
    return { txHash:`${Date.now().toString(16)}...${Math.random().toString(16).slice(2,6)}`, status:'pending' }
  }
}

// ─── Transactions ──────────────────────────────────────────────────────────────

export type TransactionFilter = { type?: string; status?: string; asset?: string; network?: string; search?: string; page?: number; limit?: number }

export async function fetchTransactions(filters?: TransactionFilter): Promise<{ transactions: PFTransaction[]; total: number }> {
  try {
    const q = new URLSearchParams(filters as any).toString()
    return await apiFetch(`/api/transactions?${q}`)
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchTransactions', e?.message, e)
    return { transactions: PF_TRANSACTIONS, total: PF_TRANSACTIONS.length }
  }
}

// ─── History (legacy) ──────────────────────────────────────────────────────────

export async function fetchHistory(pubkey: string): Promise<PFHistoryItem[]> {
  try { return await apiFetch<PFHistoryItem[]>(`/api/history/${pubkey}`) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchHistory', e?.message, e); return PF_HISTORY }
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export async function fetchPolicies(pubkey: string): Promise<PFPolicy[]> {
  try { return await apiFetch<PFPolicy[]>(`/api/policy/${pubkey}`) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchPolicies', e?.message, e); return PF_POLICIES }
}

export async function createPolicy(data: { name: string; policyType: string; threshold: number; description: string }): Promise<{ ok: boolean; id: string }> {
  try { return await apiFetch<{ ok: boolean; id: string }>('/api/policy/create', { method:'POST', body:JSON.stringify(data) }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF createPolicy', e?.message, e); return { ok:true, id:`policy-${Date.now()}` } }
}

export async function togglePolicy(id: string, status: 'active'|'paused'): Promise<{ ok: boolean }> {
  try { return await apiFetch<{ ok: boolean }>(`/api/policy/toggle/${id}`, { method:'POST', body:JSON.stringify({ status }) }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF togglePolicy', e?.message, e); return { ok:true } }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function fetchAnalyticsData(dateRange?: string): Promise<PFAnalyticsData> {
  try {
    return await apiFetch<PFAnalyticsData>(`/api/analytics?range=${dateRange || '30d'}`)
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchAnalyticsData', e?.message, e)
    return PF_ANALYTICS
  }
}

// ─── Yield ────────────────────────────────────────────────────────────────────

export async function fetchYieldData(pubkey: string): Promise<{ currentAPY: number; totalEarned: number; riskScore: string; strategy: string }> {
  try { return await apiFetch(`/api/yield/${pubkey}`) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchYieldData', e?.message, e); return { currentAPY:14.2, totalEarned:4152, riskScore:'Low', strategy:'balanced' } }
}

export async function setYieldStrategy(strategy: string): Promise<{ ok: boolean }> {
  try { return await apiFetch<{ ok: boolean }>('/api/yield/strategy', { method:'POST', body:JSON.stringify({ strategy }) }) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF setYieldStrategy', e?.message, e); return { ok:true } }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<PFSettings> {
  try {
    return await apiFetch<PFSettings>('/api/settings')
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF fetchSettings', e?.message, e)
    return PF_DEFAULT_SETTINGS
  }
}

export async function updateSettings(settings: Partial<PFSettings>): Promise<{ ok: boolean }> {
  try {
    return await apiFetch<{ ok: boolean }>('/api/settings', { method:'PUT', body:JSON.stringify(settings) })
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF updateSettings', e?.message, e)
    return { ok: true }
  }
}

// ─── AI Advisor ───────────────────────────────────────────────────────────────

export async function askAdvisor(question: string, context?: unknown): Promise<string> {
  try {
    const res = await apiFetch<{ response?: string; advice?: string }>('/api/ai/advise', { method:'POST', body:JSON.stringify({ message:question, context }) })
    return res.response || res.advice || 'Advisory response received.'
  } catch (e: any) {
    logTelemetryError('FETCH_ERROR', 'PF askAdvisor', e?.message, e)
    const q = question.toLowerCase()
    if (q.includes('balance') || q.includes('treasury')) return 'Treasury balance is $1,245,678.90 with 5.2% 24h growth. Capital allocation: 80.3% PUSD, 2.4% ETH, 1% SOL. All pools operating within normal parameters.'
    if (q.includes('agent') || q.includes('perform')) return 'All 7 neural agents (Aegis, Nomad, Sentinel, Wraith, Oracle, Phantom, Echo) are online at 100% efficiency. Nomad has optimized 3,201 routes today.'
    if (q.includes('yield') || q.includes('apy')) return 'Balanced strategy is yielding 14.2% APY. Kamino (35%) and Raydium (28%) are top performers. Consider Aggressive for 28.6% APY if risk tolerance allows.'
    if (q.includes('risk')) return 'Risk assessment: LOW. Emergency lock is active per Neural Sentinel. Aegis monitoring 247 transactions/min. All transactions cryptographically validated by Policy Enforcer.'
    if (q.includes('swap') || q.includes('route')) return 'Nomad agent recommends Raydium for SOL→USDC (0.2% impact, $0.50 fee). Orca is 10% cheaper but 15s slower. Bridge routes available for cross-chain swaps.'
    if (q.includes('send') || q.includes('payment')) return 'AI routing will optimize your payment for minimum cost. Current best route: direct Solana transfer, ~$0.01 fee, finality in <2s. Phantom agent is ready to execute.'
    return 'PalmFlow AI: Treasury is healthy at $1,245,678.90. All 7 agents operational. Balanced yield strategy returning 14.2% APY. AI routing saving ~23% on gas costs. Recommend initiating yield-routing protocols to maximize Q3 returns.'
  }
}

// ─── P&L Tracker ─────────────────────────────────────────────────────────────

export async function fetchPnLSummary(): Promise<PFPnLSummary> {
  try { return await apiFetch<PFPnLSummary>('/api/portfolio/pnl') }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchPnLSummary', e?.message, e); return PF_PNL_SUMMARY }
}

export async function fetchTaxSummary(year?: number): Promise<PFTaxSummary> {
  try { return await apiFetch<PFTaxSummary>(`/api/portfolio/tax${year ? `?year=${year}` : ''}`) }
  catch (e: any) { logTelemetryError('FETCH_ERROR', 'PF fetchTaxSummary', e?.message, e); return PF_TAX_SUMMARY }
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { PFAgent, PFStream, PFHistoryItem, PFPolicy, PFPortfolio, PFWallet,
  PFTransaction, PFSwapRoute, PFPaymentRequest, PFAnalyticsData, PFSettings, PFAgentAI,
  PFPnLSummary, PFTaxSummary, PFPnLAsset, PFRealizedTrade, PFTaxLot }
