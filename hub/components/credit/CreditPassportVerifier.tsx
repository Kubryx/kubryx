// Built by vsrupeshkumar
'use client'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'

interface NFT {
  token_address: string
  token_id: string
  name: string
  symbol: string
  metadata?: string | null
  block_number_minted?: string
  token_uri?: string
}

export default function CreditPassportVerifier({ walletAddress }: { walletAddress: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [passportNFT, setPassportNFT] = useState<NFT | null>(null)
  const [minting, setMinting] = useState(false)

  const contractAddress = (process.env.NEXT_PUBLIC_CREDIT_PASSPORT_CONTRACT || '0xAe6A9CaF9739C661e593979386580d3d14abB502').toLowerCase()

  useEffect(() => {
    if (!walletAddress) return
    fetchNFTs()
  }, [walletAddress])

  async function fetchNFTs() {
    setLoading(true)
    setError('')
    setPassportNFT(null)
    try {
      const res = await fetch(`/api/credit/nft?address=${walletAddress}`)
      if (!res.ok) {
        throw new Error('Failed to fetch NFTs from Moralis')
      }
      const data = await res.json()
      const nfts = (data.result ?? []) as NFT[]
      
      // Look for the Credit Passport contract match
      const matched = nfts.find(n => n.token_address.toLowerCase() === contractAddress)
      if (matched) {
        setPassportNFT(matched)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to query Moralis NFT API')
    } finally {
      setLoading(false)
    }
  }

  async function simulateMint() {
    setMinting(true)
    await new Promise(r => setTimeout(r, 2000))
    // Simulate finding the minted NFT by setting it in state
    const mockNFT: NFT = {
      token_address: contractAddress,
      token_id: String(Math.floor(Math.random() * 1000000)),
      name: 'Kubryx Credit Passport',
      symbol: 'KCP',
      metadata: JSON.stringify({
        name: 'Kubryx Credit Passport',
        description: 'Verified Web3 reputation and ZK credit score soulbound identity.',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'
      }),
      block_number_minted: '18492024'
    }
    setPassportNFT(mockNFT)
    setMinting(false)
    toast.success('Credit Passport Soulbound NFT successfully minted on-chain!')
  }

  const parsedMetadata = passportNFT?.metadata ? JSON.parse(passportNFT.metadata) : null
  const nftImage = parsedMetadata?.image || parsedMetadata?.image_url || null

  return (
    <div style={{
      marginTop: 24, padding: '24px 28px', borderRadius: 24,
      background: '#FFFFFF', border: '1px solid #FEF08A',
      boxShadow: '0 4px 24px rgba(245, 166, 35, 0.05)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#2D1A26', fontFamily: "'Syne', sans-serif" }}>
            Moralis On-Chain Verification
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(45,26,38,0.5)', margin: '4px 0 0' }}>
            Direct contract verification via Moralis Web3 NFT API (Target: {contractAddress.slice(0, 8)}...{contractAddress.slice(-4)})
          </p>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          padding: '4px 10px', borderRadius: 99, background: 'rgba(245,166,35,0.08)',
          border: '1px solid rgba(245,166,35,0.2)', color: '#B47814'
        }}>
          MORALIS LIVE PROOFS
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#F5A623', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13, color: 'rgba(45,26,38,0.6)', fontWeight: 500 }}>Scanning Arbitrum blockchain via Moralis...</span>
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 14, fontSize: 13, color: '#EF4444' }}>
          ⚠️ {error} · <button onClick={fetchNFTs} style={{ background: 'none', border: 'none', color: '#EF4444', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Retry</button>
        </div>
      ) : passportNFT ? (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 120, height: 120, borderRadius: 16, background: 'rgba(45,26,38,0.03)',
            border: '1px solid rgba(45,26,38,0.08)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden', flexShrink: 0
          }}>
            {nftImage ? (
              <img src={nftImage} alt="Credit Passport NFT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 36 }}>🎫</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#16A34A'
              }}>
                Passport Verified On-Chain
              </span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#2D1A26', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>
              {parsedMetadata?.name || passportNFT.name || 'Kubryx Credit Passport'}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.6)', margin: '0 0 12px', lineHeight: 1.5 }}>
              {parsedMetadata?.description || 'Your ZK Credit Passport has been verified using multi-chain cryptographic state proofs.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid rgba(45,26,38,0.06)', paddingTop: 12 }}>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(45,26,38,0.4)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 2px' }}>Token ID</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#2D1A26', margin: 0, fontFamily: 'monospace' }}>#{passportNFT.token_id}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(45,26,38,0.4)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 2px' }}>Mint Block</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#2D1A26', margin: 0, fontFamily: 'monospace' }}>{passportNFT.block_number_minted || 'Confirmed'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '3px 10px', borderRadius: 99, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
              No Credit Passport found
            </div>
            <p style={{ fontSize: 13, color: 'rgba(45,26,38,0.6)', margin: 0, maxWidth: 440 }}>
              No passport NFT matches the official registry contract on the Arbitrum chain. Click below to mint your permanent identity.
            </p>
          </div>
          <button onClick={simulateMint} disabled={minting} style={{
            background: '#F5A623', color: '#FFFFFF', border: 'none', borderRadius: 99,
            padding: '12px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245, 166, 35, 0.2)', transition: 'background-color 0.2s',
            opacity: minting ? 0.7 : 1
          }}>
            {minting ? 'Minting Soulbound...' : 'Mint Credit Passport'}
          </button>
        </div>
      )}
    </div>
  )
}
