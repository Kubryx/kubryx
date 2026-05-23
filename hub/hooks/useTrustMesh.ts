// Built by vsrupeshkumar
'use client'

import { useEffect, useState } from 'react'
import {
  fetchAllJobAccounts,
  fetchSolanaSlot,
  type JobAccountResult,
  type OnChainJobAccount,
} from '@/lib/api/solana'

export type { JobAccountResult, OnChainJobAccount }

export type TrustMeshState = {
  jobs: JobAccountResult[]
  currentSlot: number
  loading: boolean
  error: string | null
  isLive: boolean
}

const INITIAL: TrustMeshState = {
  jobs: [],
  currentSlot: 0,
  loading: true,
  error: null,
  isLive: false,
}

export function useTrustMesh(): TrustMeshState {
  const [state, setState] = useState<TrustMeshState>(INITIAL)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [jobs, slot] = await Promise.all([fetchAllJobAccounts(), fetchSolanaSlot()])
        if (!active) return
        const isLive = jobs.some(j => j.isLive)
        setState({ jobs, currentSlot: slot, loading: false, error: null, isLive })
      } catch (e) {
        if (!active) return
        setState(prev => ({
          ...prev,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to reach Solana Devnet',
        }))
      }
    }

    load()
    const interval = setInterval(load, 30_000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return state
}
