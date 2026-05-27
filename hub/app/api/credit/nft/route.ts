// Built by vsrupeshkumar
// API route to query Moralis NFT endpoint for a wallet address (Prompt 2)
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')
  if (!address || !/^0x[a-f0-9]{40}$/i.test(address)) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 })
  }

  const apiKey = process.env.MORALIS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'MORALIS_API_KEY not configured' }, { status: 503 })
  }

  try {
    const moralisUrl = `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=arbitrum&limit=10`
    const res = await fetch(moralisUrl, {
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      console.error(`[moralis-nft] fetch failed: HTTP ${res.status}`)
      return NextResponse.json({ error: `Moralis returned HTTP ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[moralis-nft] error querying Moralis:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
