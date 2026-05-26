// Built by vsrupeshkumar
// Cross-module platform state — persists across page navigations via localStorage.
// Every Kubryx module writes its live data here; other modules read it.
'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type PlatformState = {
  creditScore:      number | null   // 0-1000, from Credit Passport (QIE)
  vaultActive:      boolean | null  // true = active vault on QIE
  vaultOwner:       string | null   // 0x…
  stellarBalance:   number | null   // XLM, from Stellar Testnet
  stellarPayments:  number | null   // total Stellar transactions
  treasuryValue:    number | null   // USD, from PalmFlow
  solanaSlot:       number | null   // live block, from TrustMesh
  isDemoMode:       boolean         // true until real wallet data is written
}

type PlatformActions = {
  setCredit:     (score: number) => void
  setVault:      (active: boolean, owner?: string) => void
  setStellar:    (balance: number, payments: number) => void
  setTreasury:   (value: number) => void
  setSolanaSlot: (slot: number) => void
}

type PlatformCtxValue = PlatformState & PlatformActions

const Ctx = createContext<PlatformCtxValue | null>(null)

const KEY = 'kubryx_platform_state'
const TTL_MS = 24 * 60 * 60 * 1000

const DEMO_STATE: PlatformState = {
  creditScore: 742, vaultActive: true, vaultOwner: '0x270A...E8fc8',
  stellarBalance: 9999.99, stellarPayments: 12, treasuryValue: 850,
  solanaSlot: 461676776, isDemoMode: true,
}

function load(): PlatformState {
  if (typeof window === 'undefined') return { ...DEMO_STATE }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEMO_STATE }
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > TTL_MS) { localStorage.removeItem(KEY); return { ...DEMO_STATE } }
    return { ...DEMO_STATE, ...data }
  } catch { return { ...DEMO_STATE } }
}

function save(s: PlatformState) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), data: s })) } catch {}
}

export function KubrykPlatformProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformState>(() => load())

  const patch = useCallback((p: Partial<PlatformState>) => {
    setState(prev => { const next = { ...prev, ...p }; save(next); return next })
  }, [])

  const setCredit     = useCallback((score: number)                     => patch({ creditScore: score, isDemoMode: false }), [patch])
  const setVault      = useCallback((active: boolean, owner?: string)   => patch({ vaultActive: active, vaultOwner: owner ?? null, isDemoMode: false }), [patch])
  const setStellar    = useCallback((balance: number, payments: number) => patch({ stellarBalance: balance, stellarPayments: payments, isDemoMode: false }), [patch])
  const setTreasury   = useCallback((value: number)                     => patch({ treasuryValue: value, isDemoMode: false }), [patch])
  const setSolanaSlot = useCallback((slot: number)                      => patch({ solanaSlot: slot, isDemoMode: false }), [patch])

  return (
    <Ctx.Provider value={{ ...state, setCredit, setVault, setStellar, setTreasury, setSolanaSlot }}>
      {children}
    </Ctx.Provider>
  )
}

export function useKubrykPlatform() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useKubrykPlatform must be used within KubrykPlatformProvider')
  return ctx
}
