export type VaultFile = {
  id: string
  originalName: string
  title: string
  description: string
  uploadedAt: string
  cid: string | null
  anchored: boolean
  anchorTxHash: string | null
  ownerDid: string
  // Optional API response extras
  name?: string
  mimeType?: string
  type?: string
  size?: number
  createdAt?: string
  timestamp?: number
}

export const fallbackVaultFiles: VaultFile[] = [
  {
    id: 'demo-file-1',
    originalName: 'wedding-vows.pdf',
    title: 'Wedding Vows',
    description: 'Our vows from May 18, 2018 — a testament to our commitment.',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    cid: 'QmX2bGhj8f3kM9nPqr1wT4uVeZ5sYoK7LdCvBwAsEpHiJ',
    anchored: true,
    anchorTxHash: '0x4a7f2e9c1b3d8a6e0f5c2b7d4a1e9f3c8b2d7a6e',
    ownerDid: 'did:qie:0x0000',
  },
  {
    id: 'demo-file-2',
    originalName: 'family-album-2023.jpg',
    title: 'Family Photo Album 2023',
    description: 'Photographs from our family gathering last summer.',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cid: null,
    anchored: false,
    anchorTxHash: null,
    ownerDid: 'did:qie:0x0000',
  },
  {
    id: 'demo-file-3',
    originalName: 'video-message.mp4',
    title: 'Video Message to My Children',
    description: 'A personal message for my children to watch when the time comes.',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cid: null,
    anchored: false,
    anchorTxHash: null,
    ownerDid: 'did:qie:0x0000',
  },
]

export const fallbackDeathStatus = {
  deceased: false,
  markedAt: null as string | null,
  txHash: null as string | null,
  chain: 'QIE Mainnet',
}

export const fallbackUnlockResult = {
  allowed: false,
  files: [] as VaultFile[],
  message: 'Legacy has not been activated. Please check back when the time comes.',
}

export const MOCK_AI_STORIES: Record<string, string> = {
  default:
    "This memory captures a profound moment in your family's journey. Carefully preserved through client-side encryption, it stands as a bridge between generations — a testament to the love and foresight invested in leaving something meaningful behind. The recipient of this legacy will feel the depth of thought you poured into safeguarding this piece of your story for them.",
  wedding:
    'On that day, words became a promise and a promise became forever. These vows represent not just the beginning of a shared life, but a living document of love — to be revisited by those who came after, so they may understand the foundation upon which their family was built.',
  photo:
    'A photograph is a moment defying time. This collection of images tells the unwritten chapters of your life: the laughter between sentences, the quiet dignity of ordinary days, the faces that made every moment worth remembering. May those who receive this treasure find themselves in these frames.',
}

export const fallbackTokenProfile = {
  tokenAddress: '',
  marketLink: '',
  savedAt: null as string | null,
}
