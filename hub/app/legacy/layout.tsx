import type { Metadata } from 'next'
import LegacyNav from './_components/LegacyNav'

const title = 'EternaVault — Kubryx'
const description = 'Encrypted digital legacy vault on QIE Mainnet — preserve memories for your heirs'
const url = 'https://kubryx.vercel.app/legacy'

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
  twitter: { card: 'summary_large_image', title, description, images: ['/og-default.svg'] },
}

export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#0d0e11',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <LegacyNav />
      {children}
    </div>
  )
}
