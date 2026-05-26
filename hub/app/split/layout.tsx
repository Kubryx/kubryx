// Built by vsrupeshkumar
import type { Metadata } from 'next'

const title = 'Bill Split — Kubryx'
const description = 'On-chain bill splitting on Stellar Soroban'
const url = 'https://kubryx.vercel.app/split'

export const metadata: Metadata = {
  metadataBase: new URL('https://kubryx.vercel.app'),
  title,
  description,
  openGraph: {
    title, description, url, siteName: 'Kubryx', type: 'website',
    images: [{ url: '/og-default.svg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-default.svg'] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
