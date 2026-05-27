// Built by vsrupeshkumar
// Silently pings every Render backend every 4 minutes to prevent cold-start
// delays during demos. Fire-and-forget — never throws, never blocks UI.
'use client'

import { useCallback, useEffect } from 'react'

// All env reads must be literal so Next.js can inline them at build time.
const BACKENDS: Array<{ name: string; url: string | undefined }> = [
  { name: 'CreditBlocks', url: process.env.NEXT_PUBLIC_CREDITBLOCKS_URL },
  { name: 'Cipher',       url: process.env.NEXT_PUBLIC_CIPHER_URL       },
  { name: 'EternalVault', url: process.env.NEXT_PUBLIC_ETERNALVAULT_URL },
  { name: 'Lendora',      url: process.env.NEXT_PUBLIC_LENDORA_URL      },
  { name: 'Yield Operations Hub', url: process.env.NEXT_PUBLIC_PALMFLOW_URL     },
  { name: 'Stealth Executive Suite', url: process.env.NEXT_PUBLIC_SHADOW_URL       },
  { name: 'SyncSplit',    url: process.env.NEXT_PUBLIC_SYNCSPLIT_URL    },
  { name: 'TrustMesh',    url: process.env.NEXT_PUBLIC_TRUSTMESH_URL    },
]

async function pingBackend(url: string): Promise<void> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12_000)
  try {
    await fetch(`${url}/health`, { signal: ctrl.signal })
  } catch {
    // silent — purpose is just to wake Render instances
  } finally {
    clearTimeout(t)
  }
}

export function useBackendWarmup(): void {
  const warmAll = useCallback(() => {
    for (const b of BACKENDS) {
      if (b.url) pingBackend(b.url)
    }
  }, [])

  useEffect(() => {
    warmAll()
    const id = setInterval(warmAll, 4 * 60 * 1_000)
    return () => clearInterval(id)
  }, [warmAll])
}
