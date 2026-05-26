// Built by vsrupeshkumar
// Daily crypto briefing — pulls headlines from 2 free news sources in
// parallel, dedupes by title, then asks Groq to produce a 3-bullet summary.
// Everything runs server-side so the API keys never leave the route.
//
// Sources:
//   - CryptoCompare News  (no key, always queried — aggregates ~50 outlets)
//   - NewsAPI             (NEWSAPI_KEY, optional)
//
// CryptoPanic's free developer tier was discontinued in April 2026, so
// we no longer query it. Add new free sources here as they appear.
//
// Response is cached in-memory for 30 minutes to stay under free-tier limits.
import { NextResponse } from 'next/server'

// Force this route to run dynamically on every request — without this,
// Next.js's App Router can statically pre-render GET routes and serve
// empty data forever, since the fetches happen at build time.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const CACHE_MS = 30 * 60 * 1_000  // 30 minutes
const FETCH_TIMEOUT_MS = 8_000
const UA = 'Kubryx/1.0 (briefing-aggregator)'

export type Headline = {
  title: string
  url: string
  source: string
  publishedAt: string  // ISO
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export type BriefingResponse = {
  summary: string[]
  headlines: Headline[]
  sources: { name: string; ok: boolean; error?: string; count: number }[]
  generatedAt: string
}

let cache: { data: BriefingResponse; expires: number } | null = null

function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  return fetch(url, {
    ...init,
    signal: ctrl.signal,
    headers: { 'User-Agent': UA, Accept: 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  }).finally(() => clearTimeout(t))
}

async function fetchCryptoCompare(): Promise<Headline[]> {
  const res = await fetchWithTimeout('https://min-api.cryptocompare.com/data/v2/news/?lang=EN')
  if (!res.ok) throw new Error(`CryptoCompare HTTP ${res.status}`)
  const json = await res.json() as { Data?: Array<{ title: string; url: string; source: string; published_on: number }> }
  const rows = json.Data ?? []
  if (rows.length === 0) throw new Error('CryptoCompare returned 0 items')
  return rows.slice(0, 12).map(d => ({
    title: d.title,
    url: d.url,
    source: d.source || 'CryptoCompare',
    publishedAt: new Date(d.published_on * 1000).toISOString(),
  }))
}

async function fetchNewsApi(key: string): Promise<Headline[]> {
  // NewsAPI dev tier sometimes returns HTTP 200 with status:"error" in body.
  // The X-Api-Key header is more reliable than the apiKey URL param.
  const url = 'https://newsapi.org/v2/everything?q=crypto+OR+blockchain+OR+defi&language=en&sortBy=publishedAt&pageSize=12'
  const res = await fetchWithTimeout(url, { headers: { 'X-Api-Key': key } })
  const json = await res.json() as {
    status?: string
    message?: string
    articles?: Array<{ title: string; url: string; publishedAt: string; source?: { name?: string } }>
  }
  if (json.status === 'error') throw new Error(`NewsAPI: ${json.message || 'error'}`)
  if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`)
  return (json.articles ?? [])
    .filter(d => d.title && d.title !== '[Removed]' && d.url)
    .slice(0, 12)
    .map(d => ({
      title: d.title,
      url: d.url,
      source: d.source?.name || 'NewsAPI',
      publishedAt: d.publishedAt,
    }))
}

function dedupe(headlines: Headline[]): Headline[] {
  const seen = new Set<string>()
  const out: Headline[] = []
  for (const h of headlines) {
    const key = h.title.toLowerCase().replace(/[^\w\s]/g, '').slice(0, 60)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(h)
  }
  return out
}

async function summarizeWithGroq(headlines: Headline[]): Promise<string[]> {
  const key = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!key || headlines.length === 0) return []

  const list = headlines.slice(0, 12)
    .map((h, i) => `${i + 1}. [${h.source}] ${h.title}`)
    .join('\n')

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 14_000)
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a Kubryx markets analyst. Given crypto news headlines, produce exactly 3 short bullet points capturing the most material market signals. Each bullet must be under 18 words, lead with a chain/asset/protocol name in bold-equivalent prose, and avoid speculation. Output ONLY a JSON array of 3 strings, no prose, no markdown.',
          },
          { role: 'user', content: `Today's headlines:\n${list}\n\nReturn JSON array of 3 bullets.` },
        ],
      }),
    })
    if (!res.ok) return []
    const json = await res.json()
    const raw = json?.choices?.[0]?.message?.content ?? ''
    // Try to extract a JSON array from the model output.
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed: unknown = JSON.parse(match[0])
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, 3)
  } catch {
    return []
  } finally {
    clearTimeout(t)
  }
}

export async function GET() {
  if (cache && Date.now() < cache.expires) {
    return NextResponse.json(cache.data)
  }

  const newsApiKey = process.env.NEWSAPI_KEY || ''

  const results = await Promise.allSettled([
    fetchCryptoCompare(),
    newsApiKey ? fetchNewsApi(newsApiKey) : Promise.reject(new Error('NEWSAPI_KEY not set')),
  ])

  const sourceNames = ['CryptoCompare', 'NewsAPI']
  const sources = results.map((r, i) => {
    if (r.status === 'fulfilled') {
      const count = (r.value as Headline[]).length
      return { name: sourceNames[i], ok: count > 0, count }
    }
    const err = r.reason instanceof Error ? r.reason.message : String(r.reason)
    return { name: sourceNames[i], ok: false, count: 0, error: err }
  })

  // Diagnostic log — visible in the dev server terminal and Vercel logs.
  console.log('[briefing] sources:', sources.map(s => `${s.name}=${s.ok ? s.count : `ERR(${s.error})`}`).join(' '))

  const combined: Headline[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') combined.push(...r.value)
  }

  // Sort by publishedAt desc, then dedupe, then keep top 12.
  combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const headlines = dedupe(combined).slice(0, 12)
  const summary = await summarizeWithGroq(headlines)

  const payload: BriefingResponse = {
    summary,
    headlines,
    sources,
    generatedAt: new Date().toISOString(),
  }
  cache = { data: payload, expires: Date.now() + CACHE_MS }
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
