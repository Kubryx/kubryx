// Built by vsrupeshkumar
// API Route to fetch live Chainlink prices securely from server side
import { NextResponse } from 'next/server'
import { getChainlinkPrice } from '@/lib/chainlink'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAIRS = ['ETH', 'BTC', 'SOL', 'LINK']

export async function GET() {
  try {
    const promises = PAIRS.map(async (pair) => {
      const price = await getChainlinkPrice(pair)
      return { pair, price }
    })
    const results = await Promise.all(promises)
    const prices = results.reduce((acc, curr) => {
      acc[curr.pair] = curr.price
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ prices, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[api/chainlink] failed to get prices:', err)
    return NextResponse.json({ error: 'Failed to retrieve prices' }, { status: 500 })
  }
}
