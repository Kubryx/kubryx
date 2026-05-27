// Built by vsrupeshkumar
'use client'
import { useEffect, useState } from 'react'

interface Protocol {
  name: string
  logo: string
  tvl: number
  change_1d: number | null
  category: string
}

export default function DefiTVLWidget() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTVL()
    const interval = setInterval(fetchTVL, 60000) // Refresh every 60s
    return () => clearInterval(interval)
  }, [])

  async function fetchTVL() {
    try {
      const res = await fetch('https://api.llama.fi/protocols')
      if (!res.ok) throw new Error('Failed to fetch DefiLlama protocols')
      const data = await res.json()
      
      // Filter top 8 lending or CDP protocols
      const filtered = (data as Protocol[])
        .filter(p => p.category === 'Lending' || p.category === 'CDP')
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, 8)

      setProtocols(filtered)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load DefiLlama TVL data')
    } finally {
      setLoading(false)
    }
  }

  function formatTVL(val: number) {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
    return `$${val.toLocaleString()}`
  }

  return (
    <div style={{
      maxWidth: 400, width: '100%', margin: '24px auto 0', padding: '24px 20px',
      background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: 24,
      boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981',
            animation: 'pulse 1.8s infinite'
          }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E1B4B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live DeFi Lending Markets
          </h3>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6366F1', background: 'rgba(99, 102, 241, 0.08)', padding: '2px 8px', borderRadius: 20 }}>
          TVL Tracker
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '40%', background: 'rgba(99,102,241,0.06)', borderRadius: 4, animation: 'pulse 1.5s infinite', marginBottom: 4 }} />
                <div style={{ height: 8, width: '20%', background: 'rgba(99,102,241,0.04)', borderRadius: 3, animation: 'pulse 1.5s infinite' }} />
              </div>
              <div style={{ height: 14, width: 48, background: 'rgba(99,102,241,0.06)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 12, padding: 12, fontSize: 12, color: '#DC2626', textAlign: 'center' }}>
          ⚠️ {error} · <button onClick={fetchTVL} style={{ background: 'none', border: 'none', color: '#DC2626', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Retry</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {protocols.map((p) => {
            const up = (p.change_1d ?? 0) >= 0
            return (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(99,102,241,0.04)', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.15)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={p.logo} alt={p.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(99,102,241,0.1)' }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B', margin: 0 }}>{p.name}</p>
                    <p style={{ fontSize: 10, color: 'rgba(30,27,75,0.45)', margin: 0 }}>{p.category}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>{formatTVL(p.tvl)}</p>
                  {p.change_1d !== null && (
                    <p style={{ fontSize: 10, fontWeight: 600, color: up ? '#059669' : '#DC2626', margin: 0 }}>
                      {up ? '+' : ''}{p.change_1d.toFixed(2)}% (24h)
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer Attribution */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(99, 102, 241, 0.08)', marginTop: 16, paddingTop: 12 }}>
        <span style={{ fontSize: 10, color: 'rgba(30,27,75,0.4)', fontWeight: 500 }}>
          Refreshes every 60s
        </span>
        <span style={{ fontSize: 10, color: '#6366F1', fontWeight: 600 }}>
          Data by DefiLlama 🦙
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
      `}</style>
    </div>
  )
}
