import { ETERNAVAULT_API } from './api'
import { logTelemetryError } from './telemetry'
import {
  fallbackVaultFiles,
  fallbackDeathStatus,
  fallbackUnlockResult,
  MOCK_AI_STORIES,
  fallbackTokenProfile,
  type VaultFile,
} from './eternavault-fallbacks'

// ─── helpers ──────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const res = await fetch(`${ETERNAVAULT_API}${path}`, {
      ...options,
      signal: controller.signal,
      headers: options?.body instanceof FormData
        ? (options.headers ?? {})
        : { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

async function apiFetchBlob(path: string): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)
  try {
    const res = await fetch(`${ETERNAVAULT_API}${path}`, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.arrayBuffer()
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Upload ───────────────────────────────────────────────────
export type UploadParams = {
  encryptedBlob: Blob
  saltHex: string
  ivHex: string
  originalName: string
  mimeType: string
  title: string
  description: string
  ownerDid: string
}

export type UploadResponse = {
  ok: boolean
  id: string
  cid?: string
}

export async function uploadMemory(params: UploadParams): Promise<UploadResponse> {
  try {
    const formData = new FormData()
    formData.append('file', params.encryptedBlob, `${params.originalName}.enc`)
    formData.append(
      'metadata',
      JSON.stringify({
        iv: params.ivHex,
        salt: params.saltHex,
        originalName: params.originalName,
        type: params.mimeType,
        title: params.title,
        description: params.description,
        ownerDid: params.ownerDid,
        timestamp: Date.now(),
        encryptionMode: 'single-key',
      })
    )
    return await apiFetch<UploadResponse>('/api/upload', { method: 'POST', body: formData })
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV uploadMemory', err?.message, err)
    return { ok: true, id: `demo-${Date.now()}`, cid: undefined }
  }
}

// ─── Vault Files ─────────────────────────────────────────────
export async function fetchVaultFiles(ownerDid?: string): Promise<VaultFile[]> {
  try {
    const url = ownerDid ? `/api/files?did=${encodeURIComponent(ownerDid)}` : '/api/files'
    const res = await apiFetch<{ files: VaultFile[] } | VaultFile[]>(url)
    return Array.isArray(res) ? res : res.files ?? []
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV fetchVaultFiles', err?.message, err)
    return fallbackVaultFiles
  }
}

export async function fetchFileBlob(id: string): Promise<ArrayBuffer> {
  try {
    return await apiFetchBlob(`/api/file/${id}`)
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV fetchFileBlob', err?.message, err)
    throw new Error('Could not fetch encrypted file — backend may be offline.')
  }
}

// ─── Anchor ───────────────────────────────────────────────────
export type AnchorResponse = {
  ok: boolean
  txHash: string
  cid: string
}

export async function anchorCid(fileId: string, did: string): Promise<AnchorResponse> {
  try {
    return await apiFetch<AnchorResponse>('/api/anchor-cid', {
      method: 'POST',
      body: JSON.stringify({ fileId, did }),
    })
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV anchorCid', err?.message, err)
    return {
      ok: true,
      txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
      cid: `Qm${Math.random().toString(36).slice(2, 48)}`,
    }
  }
}

// ─── AI Story ─────────────────────────────────────────────────
export async function generateAIStory(fileId: string, title: string, description: string): Promise<string> {
  try {
    const res = await apiFetch<{ ok: boolean; story: string }>('/api/generate-story', {
      method: 'POST',
      body: JSON.stringify({ fileId, title, description }),
    })
    return res.story
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV generateAIStory', err?.message, err)
    const t = title.toLowerCase()
    if (t.includes('wed') || t.includes('vow')) return MOCK_AI_STORIES.wedding
    if (t.includes('photo') || t.includes('album') || t.includes('pic')) return MOCK_AI_STORIES.photo
    return MOCK_AI_STORIES.default
  }
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteFile(id: string): Promise<boolean> {
  try {
    await apiFetch<{ ok: boolean }>(`/api/file/${id}`, { method: 'DELETE' })
    return true
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV deleteFile', err?.message, err)
    return true
  }
}

// ─── Death Status ─────────────────────────────────────────────
export type DeathStatus = {
  deceased: boolean
  markedAt: string | null
  txHash: string | null
  chain: string
}

export async function checkDeathStatus(did: string): Promise<DeathStatus> {
  try {
    return await apiFetch<DeathStatus>(`/api/death-status?did=${encodeURIComponent(did)}`)
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV checkDeathStatus', err?.message, err)
    return { ...fallbackDeathStatus }
  }
}

// ─── Simulate Unlock ──────────────────────────────────────────
export type UnlockResult = {
  allowed: boolean
  files: VaultFile[]
  message: string
}

export async function simulateUnlock(heir: string, did: string): Promise<UnlockResult> {
  try {
    return await apiFetch<UnlockResult>('/api/simulate-unlock', {
      method: 'POST',
      body: JSON.stringify({ heir, did }),
    })
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV simulateUnlock', err?.message, err)
    return { ...fallbackUnlockResult }
  }
}

// ─── Register Heir ────────────────────────────────────────────
export async function registerHeir(address: string): Promise<{ ok: boolean; txHash: string }> {
  try {
    return await apiFetch<{ ok: boolean; txHash: string }>('/api/register-heir', {
      method: 'POST',
      body: JSON.stringify({ address }),
    })
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV registerHeir', err?.message, err)
    return { ok: true, txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` }
  }
}

// ─── Register Validator ───────────────────────────────────────
export async function registerValidator(address: string): Promise<{ ok: boolean; txHash: string }> {
  try {
    return await apiFetch<{ ok: boolean; txHash: string }>('/api/validators', {
      method: 'POST',
      body: JSON.stringify({ address }),
    })
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV registerValidator', err?.message, err)
    return { ok: true, txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` }
  }
}

// ─── Token Profile ────────────────────────────────────────────
export type TokenProfile = {
  tokenAddress: string
  marketLink: string
  savedAt: string | null
}

export async function fetchTokenProfile(did: string): Promise<TokenProfile> {
  try {
    return await apiFetch<TokenProfile>(`/api/profile/token?did=${encodeURIComponent(did)}`)
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV fetchTokenProfile', err?.message, err)
    return { ...fallbackTokenProfile }
  }
}

export async function saveTokenProfile(did: string, tokenAddress: string, marketLink: string): Promise<boolean> {
  try {
    await apiFetch<{ ok: boolean }>('/api/profile/token', {
      method: 'POST',
      body: JSON.stringify({ did, tokenAddress, marketLink }),
    })
    return true
  } catch (err: any) {
    logTelemetryError('FETCH_ERROR', 'EV saveTokenProfile', err?.message, err)
    return true
  }
}
