export const NEUROCREDIT_API =
  process.env.NEXT_PUBLIC_NEUROCREDIT_API ||
  process.env.NEXT_PUBLIC_CREDITBLOCKS_API ||
  'https://kubryx-creditblocks-api.onrender.com'

export const ETERNAVAULT_API =
  process.env.NEXT_PUBLIC_ETERNAVAULT_API ||
  process.env.NEXT_PUBLIC_ETERNALVAULT_API ||
  'https://kubryx-eternalvault.onrender.com'

export const ETERNALVAULT_API = process.env.NEXT_PUBLIC_ETERNALVAULT_API || ''
export const LENDORA_API = process.env.NEXT_PUBLIC_LENDORA_API || ''
export const TRUSTMESH_API = process.env.NEXT_PUBLIC_TRUSTMESH_API || ''
export const SHADOW_API = process.env.NEXT_PUBLIC_SHADOW_API || ''
export const PALMFLOW_API = process.env.NEXT_PUBLIC_PALMFLOW_API || ''
export const CIPHER_API = process.env.NEXT_PUBLIC_CIPHER_API || ''
export const STELLAR_RPC =
  process.env.NEXT_PUBLIC_STELLAR_RPC || 'https://soroban-testnet.stellar.org'
export const CREDITBLOCKS_API =
  process.env.NEXT_PUBLIC_CREDITBLOCKS_API ||
  'https://creditblock-rs-backend.onrender.com'
