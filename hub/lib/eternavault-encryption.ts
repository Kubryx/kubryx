// Client-side AES-GCM-256 encryption with PBKDF2/SHA-256 key derivation.
// Vault key NEVER leaves the browser — only encrypted blobs are sent to the backend.

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16
const IV_BYTES = 12

/** Derive a 256-bit AES-GCM key from a passphrase and salt via PBKDF2/SHA-256. */
async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export type EncryptResult = {
  /** Full encrypted buffer: [16-byte salt][12-byte IV][ciphertext] */
  encryptedBuffer: ArrayBuffer
  encryptedBlob: Blob
  /** Salt as lowercase hex string (for metadata) */
  saltHex: string
  /** IV as lowercase hex string (for metadata) */
  ivHex: string
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Encrypt a File client-side using AES-GCM-256.
 * Layout of returned buffer: [salt (16 B)][iv (12 B)][ciphertext (N B)]
 */
export async function encryptFile(file: File, passphrase: string): Promise<EncryptResult> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES)) as Uint8Array<ArrayBuffer>
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES)) as Uint8Array<ArrayBuffer>
  const key = await deriveKey(passphrase, salt)
  const fileBuffer = await file.arrayBuffer()
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, fileBuffer)

  const full = new Uint8Array(SALT_BYTES + IV_BYTES + ciphertext.byteLength)
  full.set(salt, 0)
  full.set(iv, SALT_BYTES)
  full.set(new Uint8Array(ciphertext), SALT_BYTES + IV_BYTES)

  const encryptedBuffer = full.buffer
  return {
    encryptedBuffer,
    encryptedBlob: new Blob([encryptedBuffer], { type: 'application/octet-stream' }),
    saltHex: toHex(salt),
    ivHex: toHex(iv),
  }
}

/**
 * Decrypt an encrypted buffer (as returned by GET /api/file/{id}) using a passphrase.
 * Expects layout: [salt (16 B)][iv (12 B)][ciphertext (N B)]
 */
export async function decryptBuffer(
  encryptedBuffer: ArrayBuffer,
  passphrase: string
): Promise<ArrayBuffer> {
  const data = new Uint8Array(encryptedBuffer)
  if (data.byteLength <= SALT_BYTES + IV_BYTES) {
    throw new Error('Encrypted buffer is too short — invalid or corrupted file.')
  }
  const salt = data.slice(0, SALT_BYTES) as Uint8Array<ArrayBuffer>
  const iv = data.slice(SALT_BYTES, SALT_BYTES + IV_BYTES) as Uint8Array<ArrayBuffer>
  const ciphertext = data.slice(SALT_BYTES + IV_BYTES) as Uint8Array<ArrayBuffer>
  const key = await deriveKey(passphrase, salt)
  try {
    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, ciphertext)
  } catch {
    throw new Error('Decryption failed — wrong vault key or corrupted file.')
  }
}

/** Trigger a browser download of a decrypted ArrayBuffer. */
export function downloadDecryptedFile(plaintext: ArrayBuffer, originalName: string, mimeType = 'application/octet-stream') {
  const blob = new Blob([plaintext], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = originalName
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a) }, 1000)
}
