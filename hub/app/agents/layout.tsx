import type { Metadata } from 'next'

const title = 'TrustMesh — Kubryx'
const description =
  'Every agent. Every decision. On chain. Coordinate, verify, and audit autonomous Solana agents.'
const url = 'https://kubryx.vercel.app/agents'

export const metadata: Metadata = {
  metadataBase: new URL('https://kubryx.vercel.app'),
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    siteName: 'Kubryx',
    type: 'website',
    images: [{ url: '/og-default.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-default.svg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
