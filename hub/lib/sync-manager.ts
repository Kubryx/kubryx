import { useEffect, useState } from 'react'
import { getRPCBlockState, RPCBlockState } from './blockchain-connector'
import { ChainType } from './api/client'
import { publishEvent } from './global-operations-engine'
import { logTelemetryError } from './telemetry'

export interface HeartbeatStatus {
  chain: ChainType
  blockNumber: number
  healthy: boolean
  latency: number
}

// Unified global state listeners to avoid duplicate loops
const heartbeatListeners = new Set<(status: HeartbeatStatus[]) => void>()
let currentHeartbeats: HeartbeatStatus[] = [
  { chain: 'QIE', blockNumber: 42104, healthy: true, latency: 12 },
  { chain: 'SOLANA', blockNumber: 1054238, healthy: true, latency: 45 },
  { chain: 'STELLAR', blockNumber: 42104, healthy: true, latency: 50 },
  { chain: 'ARBITRUM', blockNumber: 1042, healthy: true, latency: 125 }
]

let isPollingStarted = false

// Coordinated single polling layer across all chains
export function startCoordinatedPolling() {
  if (isPollingStarted || typeof window === 'undefined') return
  isPollingStarted = true

  setInterval(async () => {
    const nextStates: HeartbeatStatus[] = []
    
    for (const chain of ['QIE', 'SOLANA', 'STELLAR', 'ARBITRUM'] as ChainType[]) {
      try {
        const state = await getRPCBlockState(chain)
        nextStates.push({
          chain,
          blockNumber: state.blockNumber,
          healthy: state.avgLatency < 2000,
          latency: state.avgLatency
        })
      } catch (err: any) {
        logTelemetryError('RPC_ERROR', `Sync Heartbeat Failed [${chain}]`, `Heartbeat node request dropped: ${err.message || err}`)
        nextStates.push({
          chain,
          blockNumber: 0,
          healthy: false,
          latency: 9999
        })
      }
    }

    currentHeartbeats = nextStates
    heartbeatListeners.forEach(listener => listener(currentHeartbeats))

    // Broadcast system heartbeat alignment
    window.dispatchEvent(new CustomEvent('kubryx_rpc_heartbeat', { detail: currentHeartbeats }))
  }, 10000) // Poll every 10 seconds (optimal for RPC safety)
}

// 2. React Hook to hook into coordinated real-time updates safely
export function useRealtimeSync() {
  const [heartbeats, setHeartbeats] = useState<HeartbeatStatus[]>([...currentHeartbeats])

  useEffect(() => {
    startCoordinatedPolling()

    const handler = (status: HeartbeatStatus[]) => {
      setHeartbeats([...status])
    }

    heartbeatListeners.add(handler)

    // Listen to real-time custom WebSocket event simulation
    const wsHandler = (e: any) => {
      const payload = e.detail
      publishEvent(
        'kubryx_protocol_sync',
        JSON.stringify(payload),
        `Live Transaction Listener: Detected dynamic mempool signature ${payload.signature.slice(0, 10)}...`
      )
    }

    window.addEventListener('kubryx_ws_tx_event', wsHandler)

    return () => {
      heartbeatListeners.delete(handler)
      window.removeEventListener('kubryx_ws_tx_event', wsHandler)
    }
  }, [])

  return {
    heartbeats,
    isFullySynchronized: heartbeats.every(h => h.healthy)
  }
}

// 3. Simulated persistent WebSockets that feed live transactions into the telemetry pool
export function simulateWebSocketStream() {
  if (typeof window === 'undefined') return

  // Every 12 seconds, push a live transaction event
  setInterval(() => {
    const signature = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    const txEvent = new CustomEvent('kubryx_ws_tx_event', {
      detail: {
        signature,
        timestamp: new Date().toISOString(),
        gasUsed: '0.00021 SOL',
        chain: Math.random() > 0.5 ? 'SOLANA' : 'QIE'
      }
    })
    window.dispatchEvent(txEvent)
  }, 12000)
}
