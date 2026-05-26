// Built by vsrupeshkumar
// Light-themed Daily Briefing card for the dashboard.
// Calls /api/briefing which proxies CryptoCompare + CryptoPanic + NewsAPI in
// parallel, then asks Groq for a 3-bullet markets summary.
'use client'

import { useEffect, useState } from 'react'

type Headline = {
  title: string
  url: string
  source: string
  publishedAt: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

type BriefingResponse = {
  summary: string[]
  headlines: Headline[]
  sources: { name: string; ok: boolean; error?: string; count: number }[]
  generatedAt: string
}

const INK    = '#0A0F2E'
const MUTED  = 'rgba(15,23,42,0.62)'
const MUTED2 = 'rgba(15,23,42,0.4)'
const BORDER = 'rgba(15,23,42,0.08)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`
  return `${Math.round(diff / 86_400_000)}d ago`
}

function sentimentColor(s?: Headline['sentiment']): string {
  if (s === 'positive') return '#10b981'
  if (s === 'negative') return '#ef4444'
  return '#94A3B8'
}

export default function DailyBriefing() {
  const [data, setData] = useState<BriefingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    try {
      const res = await fetch('/api/briefing', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load briefing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 15 * 60 * 1_000) // refresh every 15 min
    return () => clearInterval(id)
  }, [])

  const liveSources = data?.sources.filter(s => s.ok).map(s => s.name) ?? []

  return (
    <div style={{ margin: '0 24px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: MUTED2, textTransform: 'uppercase' }}>
            Daily Briefing · AI Markets Pulse
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginTop: 2 }}>
            What moved today, across crypto
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: MUTED, fontFamily: MONO, flexWrap: 'wrap' }}>
          {liveSources.length > 0 ? (
            <>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                {liveSources.length} {liveSources.length === 1 ? 'source' : 'sources'} · Groq Llama-3.3
              </span>
              {data?.generatedAt && <span>· {relativeTime(data.generatedAt)}</span>}
              <button
                onClick={() => { setLoading(true); load() }}
                style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: 0, fontFamily: MONO }}
                title="Force refresh"
              >
                ↻ refresh
              </button>
            </>
          ) : loading ? (
            <span>Fetching headlines…</span>
          ) : (
            <span style={{ color: '#ef4444' }}>No sources reachable</span>
          )}
        </div>
      </div>

      {/* Source status row — only shows when something failed, helps you diagnose */}
      {data && data.sources.some(s => !s.ok) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {data.sources.map(s => (
            <span
              key={s.name}
              title={s.error || `${s.count} headlines`}
              style={{
                fontSize: 10, fontWeight: 700, fontFamily: MONO,
                padding: '3px 10px', borderRadius: 999,
                background: s.ok ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                border: `1px solid ${s.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: s.ok ? '#10b981' : '#ef4444',
              }}
            >
              {s.ok ? `✓ ${s.name} (${s.count})` : `✗ ${s.name}: ${(s.error || 'failed').slice(0, 40)}`}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
        gap: 16,
      }}>
        {/* AI summary panel — left */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(236,72,153,0.06))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 18,
          padding: 22,
          boxShadow: '0 8px 28px rgba(99,102,241,0.12)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 200,
        }}>
          {/* corner glow */}
          <div aria-hidden style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.25), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.16em',
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(99,102,241,0.15)',
              color: '#6366f1', textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 12 }}>✦</span> AI Analyst
            </div>

            {loading && !data && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: 14, background: 'rgba(15,23,42,0.06)', borderRadius: 6, width: `${85 - i * 8}%`, animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                ))}
                <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
              </div>
            )}

            {data && data.summary.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.summary.map((line, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.55, color: INK, fontWeight: 500 }}>
                    <span style={{
                      flexShrink: 0,
                      width: 22, height: 22, borderRadius: 8,
                      background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                      color: '#fff', fontSize: 11, fontWeight: 800,
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 4px 10px rgba(99,102,241,0.35)',
                    }}>
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}

            {data && data.summary.length === 0 && !loading && (
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                {error
                  ? `Briefing unavailable: ${error}`
                  : 'Headlines loaded but AI summary failed. Set GROQ_API_KEY to enable bullets.'}
              </div>
            )}
          </div>
        </div>

        {/* Headlines list — right */}
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${BORDER}`,
          borderRadius: 18,
          padding: 6,
          boxShadow: '0 4px 18px rgba(15,23,42,0.05)',
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {loading && !data && (
            <div style={{ padding: 14 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ height: 16, background: 'rgba(15,23,42,0.05)', borderRadius: 6, marginBottom: 10, width: `${90 - i * 5}%` }} />
              ))}
            </div>
          )}

          {data?.headlines.length === 0 && !loading && (
            <div style={{ padding: 16, fontSize: 12, color: MUTED2 }}>No headlines yet — sources are warming up.</div>
          )}

          {data?.headlines.map((h, i) => (
            <a
              key={`${h.url}-${i}`}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                transition: 'background 0.15s',
                borderBottom: i < (data.headlines.length - 1) ? `1px solid ${BORDER}` : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                flexShrink: 0,
                width: 6, height: 6, borderRadius: '50%',
                background: sentimentColor(h.sentiment),
                marginTop: 7,
                boxShadow: `0 0 6px ${sentimentColor(h.sentiment)}80`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.4 }}>
                  {h.title}
                </div>
                <div style={{ fontSize: 10, color: MUTED2, marginTop: 4, fontFamily: MONO, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>{h.source}</span>
                  <span>·</span>
                  <span>{relativeTime(h.publishedAt)}</span>
                </div>
              </div>
              <span style={{ flexShrink: 0, color: MUTED2, fontSize: 12, marginTop: 2 }}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
