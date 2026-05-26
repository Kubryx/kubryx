// Built by vsrupeshkumar
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, ArrowUp, ArrowRight, ArrowUpRight, Check, X, Search, RefreshCw, Lock } from 'lucide-react'
import Navbar from './components/Navbar'
import LiveStatsStrip from '@/components/ui/LiveStatsStrip'
import { useTrustMesh as useTrustMeshForStats } from '@/hooks/useTrustMesh'

// ─── Animation variants ───────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

// ─── Hooks ───────────────────────────────────────────────────
function useWindowWidth(): number {
  const [w, setW] = useState(1200)
  useEffect(() => {
    setW(window.innerWidth)
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

function useCountUp(target: number, active: boolean): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const t0 = performance.now()
    const dur = 1400
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setV(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target])
  return v
}

// ─── Data ────────────────────────────────────────────────────
const TOOLS = [
  { icon: '◈', name: 'Credit Passport', href: '/credit', tagline: 'AI Credit Scoring', desc: 'Generate your on-chain credit score as a soulbound NFT. Every DeFi protocol reads your score with a single contract call.', chain: 'QIE', chainColor: '#F5A623', badge: 'Identity' },
  { icon: '⬟', name: 'Family Vault', href: '/legacy', tagline: 'Encrypted Inheritance', desc: 'Store your most important files with AES-GCM encryption. Heirs unlock access on-chain after validator attestation.', chain: 'QIE', chainColor: '#F5A623', badge: 'Security' },
  { icon: '⬡', name: 'Agent Coordinator', href: '/agents', tagline: 'AI Agent Coordination', desc: 'Deploy AI agents with verified on-chain identities. Every delegation is Ed25519 signed and permanently logged.', chain: 'Solana', chainColor: '#9945FF', badge: 'AI' },
  { icon: '🔐', name: 'Private Vault', href: '/vault', tagline: 'Cross-Chain Privacy', desc: 'Trade assets across chains with complete privacy. Zero transaction metadata exposed to any observer.', chain: 'Multi', chainColor: '#06B6D4', badge: 'Privacy' },
  { icon: '◆', name: 'Bill Split', href: '/split', tagline: 'On-Chain Bill Splitting', desc: 'Split bills using smart contracts on Stellar. Multi-wallet support with automatic settlement on full payment.', chain: 'Stellar', chainColor: '#3B82F6', badge: 'Payments' },
  { icon: '◎', name: 'AI Lending', href: '/lend', tagline: 'DeFi Loan Negotiation', desc: 'AI agents negotiate your loan terms in natural language. Zero-knowledge credit verification. L2 settlement.', chain: 'ETH L2', chainColor: '#6366F1', badge: 'DeFi' },
  { icon: '◇', name: 'Yield Operations Hub', href: '/treasury', tagline: 'Autonomous Yield Management', desc: 'AI agents manage your treasury, stream payroll per-second, enforce governance, and optimize yield automatically.', chain: 'Solana', chainColor: '#10B981', badge: 'Yield' },
  { icon: '▲', name: 'Stealth Execution Suite', href: '/shadow', tagline: 'Invisible Operations', desc: 'Run your entire financial organization invisibly on-chain. Seven specialized AI agents. Fully autonomous.', chain: 'Solana', chainColor: '#64748B', badge: 'Enterprise' },
]

const STATS = [
  { value: 8, suffix: '+', label: 'Powerful tools in one platform' },
  { value: 4, suffix: '', label: 'Blockchains: QIE · Solana · Stellar · ETH' },
  { value: 7, suffix: '+', label: 'Live backends with on-chain data' },
]

const FEATURES = [
  { num: '01', title: 'One Wallet. Every Tool.', desc: 'Connect MetaMask, Phantom, or Freighter once per chain. Access every tool instantly without reconnecting.' },
  { num: '02', title: 'Real On-Chain Data Only', desc: 'Every number, every score, every transaction comes from live deployed smart contracts. Zero mock data.' },
  { num: '03', title: 'AI Runs Every Tool', desc: 'Credit scoring, loan negotiation, agent coordination, Yield Operations Hub management — AI powers every feature.' },
  { num: '04', title: 'Four Chains, One Dashboard', desc: 'QIE, Solana, Stellar, and Ethereum L2 — all accessible from one unified interface without switching apps.' },
]

const CHAINS = [
  { name: 'QIE Mainnet', id: 'Chain ID: 1990', color: '#F5A623', glyph: '⬡', tools: 'Credit Passport · Family Vault' },
  { name: 'Solana', id: 'Mainnet Beta', color: '#9945FF', glyph: '◎', tools: 'Agent Coordinator · Yield Operations Hub · Stealth Execution Suite' },
  { name: 'Stellar', id: 'Soroban', color: '#3B82F6', glyph: '✦', tools: 'Bill Split' },
  { name: 'Ethereum L2', id: 'Arbitrum', color: '#6366F1', glyph: '◆', tools: 'AI Lending · Private Vault' },
]

const TESTIMONIALS = [
  { quote: 'Credit Passport issues a soulbound NFT on QIE Mainnet. Any DeFi protocol can verify your score with a single on-chain read — no oracles, no off-chain trust.', name: 'Credit Passport', title: 'QIE Mainnet · Chain ID 1990', avatar: '◈' },
  { quote: 'Agent Coordinator logs every AI delegation as an Ed25519-signed Solana account. Rogue or hallucinating agents cannot act without a valid on-chain proof of authority.', name: 'Agent Coordinator', title: 'Solana Devnet · TrustMesh Protocol', avatar: '⬡' },
  { quote: 'Stealth Execution Suite runs CFO, Payroll, Compliance, Audit, Procurement, Tax and Risk agents autonomously. The entire corporate stack, invisible on-chain.', name: 'Stealth Execution Suite', title: 'Solana · 7 Autonomous AI Agents', avatar: '▲' },
]

const LOGOS = ['QIE Network', 'Solana', 'Stellar', 'Ethereum', 'Arbitrum', 'Anchor Protocol', 'Soroban', 'Groq']

const CHAIN_SWATCHES: Record<string, string> = {
  'QIE Network': 'linear-gradient(135deg,#F5C518,#FFA800)',
  'Solana': 'linear-gradient(135deg,#9945FF,#14F195)',
  'Stellar': 'linear-gradient(135deg,#3B82F6,#06B6D4)',
  'Ethereum': 'linear-gradient(135deg,#6366F1,#8B5CF6)',
  'Arbitrum': 'linear-gradient(135deg,#2D374B,#28A0F0)',
  'Anchor Protocol': 'linear-gradient(135deg,#4A6CFE,#A5B4FC)',
  'Soroban': 'linear-gradient(135deg,#000,#3B82F6)',
  'Groq': 'linear-gradient(135deg,#FF6B35,#F5A623)',
}

// ─── Shared utility components ────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'block', width: 24, height: 1, background: 'linear-gradient(90deg, #3B5BFA, #8B5CF6, #EC4899)' }} />
      <span className="gradient-text" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        {children}
      </span>
    </div>
  )
}

function GradBtn({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex' }}>
      <Link href={href} className={`btn-gradient ${className}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        borderRadius: 999, padding: '12px 28px', fontSize: 15,
        fontWeight: 700, textDecoration: 'none', color: '#fff',
      }}>
        {children}
      </Link>
    </motion.div>
  )
}

function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-flex' }}>
      <Link href={href} className="btn-ghost" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        borderRadius: 999, padding: '12px 28px', fontSize: 15,
        fontWeight: 600, textDecoration: 'none', color: '#0A0F2E',
      }}>
        {children}
      </Link>
    </motion.div>
  )
}

// ─── HERO ────────────────────────────────────────────────────
function FloatingPill({ label, color, style, delay }: { label: string; color: string; style: React.CSSProperties; delay: number }) {
  return (
    <div className="float-anim" style={{ position: 'absolute', animationDelay: `${delay}s`, ...style }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
        borderRadius: 999, padding: '6px 14px 6px 8px',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 10px 30px rgba(15,23,42,0.1)',
      }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: color, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.6)' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0A0F2E' }}>{label}</span>
      </div>
    </div>
  )
}

function HeroShape() {
  return (
    <div style={{ position: 'relative', width: 'min(540px, 90vw)', aspectRatio: '1/1' }}>
      {/* Spinning orb ring */}
      <div className="spin-slow" style={{ position: 'absolute', inset: 0 }}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `rotate(${deg}deg) translateY(-46%)` }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: ['#8B5CF6','#3B5BFA','#EC4899','#C084FC','#06B6D4','#F43F5E'][i],
              boxShadow: '0 8px 24px rgba(139,92,246,0.35), inset 0 0 14px rgba(255,255,255,0.6)',
              opacity: 0.85,
            }} />
          </div>
        ))}
      </div>

      {/* Glass binocular shape */}
      <div className="float-anim" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'relative', width: '78%', aspectRatio: '1/1' }}>
          <div style={{
            position: 'absolute', left: '-2%', top: '12%', width: '62%', height: '76%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.55), rgba(59,91,250,0.35))',
            border: '1.5px solid rgba(255,255,255,0.7)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 30px 80px -20px rgba(139,92,246,0.45), inset 0 0 60px rgba(255,255,255,0.35)',
          }} />
          <div style={{
            position: 'absolute', right: '-2%', top: '12%', width: '62%', height: '76%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.5), rgba(192,132,252,0.4))',
            border: '1.5px solid rgba(255,255,255,0.7)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 30px 80px -20px rgba(236,72,153,0.4), inset 0 0 60px rgba(255,255,255,0.35)',
          }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)', width: '26%', height: '26%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, rgba(255,255,255,0.7) 30%, rgba(192,132,252,0) 70%)',
            filter: 'blur(0.5px)',
          }} />
        </div>
      </div>

      {/* Chain pills */}
      <FloatingPill label="QIE" color="#F5C518" style={{ top: '8%', left: '-6%' }} delay={0} />
      <FloatingPill label="Solana" color="#9945FF" style={{ top: '12%', right: '-4%' }} delay={1.2} />
      <FloatingPill label="Stellar" color="#3B82F6" style={{ bottom: '10%', left: '2%' }} delay={2.4} />
      <FloatingPill label="ETH L2" color="#6366F1" style={{ bottom: '6%', right: '-8%' }} delay={1.6} />
    </div>
  )
}

function Hero() {
  const w = useWindowWidth()
  const isMobile = w < 768
  return (
    <section className="hero-bg grain" id="platform" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '0 0 auto', height: 1, background: 'rgba(255,255,255,0.4)' }} />
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: isMobile ? '120px 20px 80px' : '176px 24px 128px',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 1fr',
        gap: isMobile ? 48 : 48, alignItems: 'center',
      }}>
        {/* Left */}
        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 28 }}>
          <motion.div variants={fadeUp}><Eyebrow>Multi-chain AI financial super-app</Eyebrow></motion.div>
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(44px, 7.4vw, 88px)', lineHeight: 1.02, fontWeight: 900, color: '#0A0F2E', letterSpacing: '-0.035em', margin: 0 }}>
            <span style={{ display: 'block' }}>The Financial OS</span>
            <span style={{ display: 'block' }}>for <span className="gradient-text">Web3</span></span>
            <span style={{ display: 'block', fontWeight: 700, color: 'rgba(10,15,46,0.8)' }}>&amp; Beyond</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize: 18, lineHeight: 1.65, color: '#475569', maxWidth: 520, margin: 0 }}>
            Eight powerful tools. Credit scoring, inheritance vaults, private trading, DeFi lending, Yield Operations Hub automation, and AI agents — all on-chain in one unified platform.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { icon: '🔗', color: '#3B5BFA', label: '4 Blockchains' },
              { icon: '✓', color: '#10B981', label: '100% On-Chain Data' },
              { icon: '🤖', color: '#8B5CF6', label: 'AI-Powered Tools' },
            ].map(pill => (
              <div key={pill.label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.9)', borderRadius: 999,
                padding: '7px 14px',
                boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                fontSize: 13, fontWeight: 600, color: '#0A0F2E',
              }}>
                <span style={{ fontSize: 14 }}>{pill.icon}</span>
                {pill.label}
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <GhostBtn href="#tools">Explore All Tools</GhostBtn>
            <GradBtn href="/dashboard">Launch App <ArrowRight size={17} strokeWidth={2.2} /></GradBtn>
          </motion.div>
          <motion.div variants={fadeUp} style={{ width: '100%' }}>
            <LiveStatsStrip />
          </motion.div>
        </motion.div>

        {/* Right shape */}
        {!isMobile && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <HeroShape />
          </motion.div>
        )}
      </div>
      <div style={{ position: 'absolute', inset: '0 0 0 auto', bottom: 0, height: 96, background: 'linear-gradient(to bottom, transparent, white)', pointerEvents: 'none' }} />
    </section>
  )
}

// ─── TRUST BAR ────────────────────────────────────────────────
function TrustBar() {
  const doubled = [...LOGOS, ...LOGOS]
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '40px 0', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 24 }}>
        Powered by world-class blockchain infrastructure
      </div>
      <div style={{ position: 'relative' }}>
        <div className="marquee" style={{ display: 'flex', alignItems: 'center', gap: 56, whiteSpace: 'nowrap', width: 'max-content' }}>
          {doubled.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.5 }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: CHAIN_SWATCHES[name] || '#94A3B8', flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>{name}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', inset: '0 0 0 auto', left: 0, width: 80, background: 'linear-gradient(to right, #fff, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '0 0 0 auto', right: 0, width: 80, background: 'linear-gradient(to left, #fff, transparent)', pointerEvents: 'none' }} />
      </div>
    </section>
  )
}

// ─── STATS ────────────────────────────────────────────────────
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const count = useCountUp(value, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true) }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: 'clamp(56px, 7vw, 88px)', fontWeight: 900, color: '#0A0F2E', lineHeight: 1, letterSpacing: '-0.04em' }}>
        {count}{suffix}
      </div>
      <div style={{ marginTop: 12, fontSize: 14.5, color: '#64748B', maxWidth: 220, margin: '12px auto 0', lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

function LiveJobCounter() {
  const mesh = useTrustMeshForStats()
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const targetVal = Math.max(mesh.jobs.length, 7)
  const count = useCountUp(targetVal, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true) }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: 'clamp(56px, 7vw, 88px)', fontWeight: 900, color: '#0A0F2E', lineHeight: 1, letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
        {count}
        <span style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#10b981', fontWeight: 800 }}>+</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 14.5, color: '#64748B', maxWidth: 240, margin: '12px auto 0', lineHeight: 1.4 }}>
        Live agent jobs on Solana Devnet
        <div style={{ marginTop: 6, fontSize: 11, fontFamily: '"Fira Code","JetBrains Mono",monospace', color: mesh.isLive ? '#10b981' : '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: mesh.isLive ? '#10b981' : '#94A3B8', boxShadow: mesh.isLive ? '0 0 6px #10b981' : 'none' }} />
          {mesh.isLive && mesh.currentSlot > 0 ? `slot ${mesh.currentSlot.toLocaleString()}` : 'connecting…'}
        </div>
      </div>
    </div>
  )
}

function Stats() {
  return (
    <section style={{ background: '#fff', padding: '96px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', gap: 0 }} className="grid grid-cols-1 md:grid-cols-3">
        <StatCounter value={STATS[0].value} suffix={STATS[0].suffix} label={STATS[0].label} />
        <div style={{ width: 1, height: 80, background: '#E2E8F0', margin: '0 auto' }} className="hidden md:block" />
        <StatCounter value={STATS[1].value} suffix={STATS[1].suffix} label={STATS[1].label} />
        <div style={{ width: 1, height: 80, background: '#E2E8F0', margin: '0 auto' }} className="hidden md:block" />
        <LiveJobCounter />
      </div>
    </section>
  )
}

// ─── TOOLS GRID ───────────────────────────────────────────────
function ToolCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const colSpan = index < 2 ? 3 : 2
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      style={{ gridColumn: `span ${colSpan}` }}
    >
      <Link href={tool.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          className="module-card"
          style={{
            background: '#fff', border: '1px solid #E2E8F0', borderRadius: 24,
            padding: 32, height: '100%', cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = tool.chainColor + '66' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0' }}
        >
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 48, height: 48, borderRadius: 16, display: 'grid', placeItems: 'center',
                fontSize: 22, background: tool.chainColor + '22', color: tool.chainColor,
              }}>{tool.icon}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#16A34A' }}>Live</span>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 999, background: '#EEF2FF', color: '#3B5BFA',
            }}>{tool.badge}</span>
          </div>

          {/* Body */}
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.02em', margin: '0 0 4px' }}>{tool.name}</h3>
          <div style={{ fontSize: 13, fontWeight: 700, color: tool.chainColor, marginBottom: 12 }}>{tool.tagline}</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#64748B', margin: 0 }}>{tool.desc}</p>

          {/* Bottom */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: tool.chainColor + '1a', color: tool.chainColor,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tool.chainColor }} />
              {tool.chain}
            </span>
            <span className="btn-gradient" style={{
              width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
              boxShadow: '0 8px 20px -6px rgba(139,92,246,0.5)',
            }}>
              <ArrowUpRight size={16} strokeWidth={2.4} color="#fff" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Tools() {
  const w = useWindowWidth()
  const cols = w < 768 ? 1 : w < 1024 ? 4 : 6
  return (
    <section id="tools" style={{ padding: '112px 0', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #F5F7FF 0%, #EEF2FF 100%)' }}>
      <div style={{ position: 'absolute', top: -80, left: -80, width: 384, height: 384, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,132,252,0.45), transparent 65%)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -128, right: 0, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,91,250,0.35), transparent 65%)', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, marginBottom: 56 }}>
          <motion.div variants={fadeUp}><Eyebrow>Our Platform</Eyebrow></motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5.2vw, 60px)', fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>
            Eight tools. <span className="gradient-text">One platform.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#64748B', maxWidth: 600, margin: 0 }}>
            Every tool is live, deployed, and production-ready — wired into one unified wallet, one identity layer, one dashboard.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}
        >
          {TOOLS.map((tool, i) => <ToolCard key={tool.name} tool={tool} index={i} />)}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
          <GradBtn href="/credit">Explore All Tools <ArrowRight size={17} strokeWidth={2.2} /></GradBtn>
        </motion.div>
      </div>
    </section>
  )
}

// ─── FEATURES ────────────────────────────────────────────────
function Features() {
  const w = useWindowWidth()
  const isMobile = w < 1024
  return (
    <section style={{ background: '#fff', padding: '112px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr', gap: isMobile ? 48 : 56, alignItems: 'flex-start' }}>
        {/* Left */}
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 128 }}>
          <motion.div variants={fadeUp}><Eyebrow>Why Kubryx</Eyebrow></motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.04 }}>
            Powerful tools,<br />all in <span className="gradient-text">one place.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 18, lineHeight: 1.65, color: '#64748B', maxWidth: 440, margin: 0 }}>
            One wallet. One platform. Eight blockchain tools working together seamlessly across the chains you already use.
          </motion.p>
          <motion.div variants={fadeUp}><GradBtn href="/credit">Start exploring <ArrowRight size={17} strokeWidth={2.2} /></GradBtn></motion.div>
        </motion.div>

        {/* Right */}
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #EEF2FF 100%)', border: '1px solid #E0E7FF', borderRadius: 28, padding: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.num} variants={fadeUp} style={{
              display: 'flex', gap: 24, padding: '28px 24px',
              borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(139,92,246,0.15)' : 'none',
            }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  fontWeight: 900, fontSize: 15, color: '#fff',
                  background: 'linear-gradient(135deg, #3B5BFA, #8B5CF6 60%, #EC4899)',
                  boxShadow: '0 10px 24px -8px rgba(139,92,246,0.6)',
                }}>
                  {f.num}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.02em', margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#64748B', margin: 0 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CHAINS ──────────────────────────────────────────────────
function Chains() {
  const w = useWindowWidth()
  const cols = w < 640 ? 1 : w < 1024 ? 2 : 4
  return (
    <section id="chains" style={{ padding: '112px 24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #EDE9FE 0%, #E0F2FE 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none', background: 'radial-gradient(60% 60% at 80% 20%, #fce7f3, transparent 60%)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
          <motion.div variants={fadeUp}><Eyebrow>Multi-chain</Eyebrow></motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>
            Built natively on <span className="gradient-text">4 blockchains.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#64748B', maxWidth: 560, margin: 0 }}>
            One wallet across them all. Pick a tool — Kubryx routes the call to the right chain automatically.
          </motion.p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {CHAINS.map(c => (
            <motion.div key={c.name} variants={fadeUp} className="module-card"
              style={{ background: '#fff', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 24, padding: 28, textAlign: 'center', boxShadow: '0 8px 30px -12px rgba(15,23,42,0.12)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = c.color + '66' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.8)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, display: 'grid', placeItems: 'center', margin: '0 auto 20px', fontSize: 24, fontWeight: 900, color: '#fff', background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`, boxShadow: `0 16px 30px -10px ${c.color}80` }}>
                {c.glyph}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.02em' }}>{c.name}</div>
              <div style={{ fontSize: 12.5, fontFamily: 'var(--font-mono, monospace)', fontWeight: 500, color: '#94A3B8', margin: '4px 0 16px' }}>{c.id}</div>
              <div style={{ paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>Tools</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0A0F2E', lineHeight: 1.4 }}>{c.tools}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── DASHBOARD PREVIEW ────────────────────────────────────────
function ActivityChart() {
  const W = 600, H = 160
  const pts = (seed: number) => {
    const a: number[] = []
    let v = 50 + seed * 6
    for (let i = 0; i <= 30; i++) {
      v += (Math.sin(i * 0.6 + seed) * 14) + (Math.cos(i * 0.3) * 6) + (seed === 1 ? 2 : seed === 2 ? 1.4 : 1)
      a.push(Math.max(8, Math.min(H - 12, v)))
    }
    return a
  }
  const toPath = (arr: number[], fill = false) => {
    const step = W / (arr.length - 1)
    let d = ''
    for (let i = 0; i < arr.length; i++) {
      const x = i * step
      const y = H - arr[i]
      if (i === 0) d += `M ${x} ${y}`
      else {
        const px = (i - 1) * step
        const py = H - arr[i - 1]
        const cx = (px + x) / 2
        d += ` C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`
      }
    }
    if (fill) d += ` L ${W} ${H} L 0 ${H} Z`
    return d
  }
  const a = pts(1), b = pts(2), c = pts(3)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }}>
      <defs>
        <linearGradient id="fillA" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" /><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fillB" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.25" /><stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(p => <line key={p} x1="0" x2={W} y1={H * p} y2={H * p} stroke="rgba(255,255,255,0.05)" />)}
      <path d={toPath(a, true)} fill="url(#fillA)" />
      <path d={toPath(b, true)} fill="url(#fillB)" />
      <path d={toPath(a)} stroke="#A78BFA" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={toPath(b)} stroke="#F472B6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={toPath(c)} stroke="#22D3EE" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="3 3" />
    </svg>
  )
}

function DashFrame() {
  const sideItems = [['◉', 'Overview', true], ['◈', 'Credit Passport'], ['⬟', 'Family Vault'], ['⬡', 'Agent Coordinator'], ['🔐', 'Private Vault'], ['◆', 'Bill Split'], ['◎', 'AI Lending'], ['◇', 'Yield Operations Hub'], ['▲', 'Stealth Execution Suite']]
  return (
    <div className="dash-tilt" style={{ maxWidth: 960, margin: '0 auto', borderRadius: 22, overflow: 'hidden', boxShadow: '0 50px 120px -30px rgba(15,23,42,0.45)', background: '#0A0F2E', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0E1535', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: '6px 12px', fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-mono, monospace)' }}>
          <Lock size={11} strokeWidth={2.2} /> kubryx.vercel.app/dashboard
        </div>
        <RefreshCw size={14} strokeWidth={2.2} color="#94A3B8" />
      </div>

      {/* App */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 520 }}>
        {/* Sidebar */}
        <aside style={{ background: '#0C1232', borderRight: '1px solid rgba(255,255,255,0.05)', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#3B5BFA,#EC4899)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 900, color: '#fff' }}>K</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Kubryx</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sideItems.map(([icon, name, active]) => (
              <div key={String(name)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#fff' : '#94A3B8',
              }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span>{name}</span>
              </div>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', padding: 12, borderRadius: 12, background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', color: '#C4B5FD' }}>Wallet</div>
            <div style={{ fontSize: 12.5, fontFamily: 'var(--font-mono, monospace)', color: '#fff', marginTop: 4 }}>0x9F…E3A1</div>
            <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 4 }}>QIE · Solana · Stellar · ETH</div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>Overview</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginTop: 2 }}>Good afternoon, Alex.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 999, fontSize: 12, color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono, monospace)' }}>
                <Search size={12} strokeWidth={2.2} /> search tools
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.1)', color: '#86EFAC' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} /> All systems live
              </div>
            </div>
          </div>

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[['8', 'Tools', '+2 this Q'], ['4', 'Chains', 'Multi-chain'], ['0', 'Mock Data', '100% live'], ['∞', 'Uptime', '30d streak']].map(([n, label, sub], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#475569', fontWeight: 700 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{n}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#4ADE80' }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#475569', fontWeight: 700 }}>Protocol Activity</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>Last 30 days</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['1D','7D','30D','All'].map(t => (
                  <span key={t} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: t === '30D' ? 'rgba(255,255,255,0.1)' : 'transparent', color: t === '30D' ? '#fff' : '#475569' }}>{t}</span>
                ))}
              </div>
            </div>
            <ActivityChart />
          </div>
        </main>
      </div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <section style={{ padding: '112px 0', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #EEF2FF 0%, #E0F2FE 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none', background: 'radial-gradient(40% 30% at 50% 20%, #fce7f3 0%, transparent 60%)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <motion.div variants={fadeUp}><Eyebrow>Live Product</Eyebrow></motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>
            See it in <span className="gradient-text">action.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#64748B', maxWidth: 480, margin: 0 }}>
            A unified dashboard across all 8 tools — every chain, every signal, in a single view.
          </motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}>
          <DashFrame />
        </motion.div>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────
function Testimonials() {
  const w = useWindowWidth()
  const cols = w < 768 ? 1 : 3
  return (
    <section style={{ background: '#F9FAFB', padding: '112px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, maxWidth: 700 }}>
          <motion.div variants={fadeUp}><Eyebrow>How It Works</Eyebrow></motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>
            Three tools. Three chains.<br /><span className="gradient-text">One platform.</span>
          </motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.article key={i} variants={fadeUp} className="module-card" style={{ position: 'relative', background: '#fff', borderRadius: 24, border: '1px solid rgba(226,232,240,0.7)', padding: 28, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 10px 30px -15px rgba(15,23,42,0.15)' }}>
              <p style={{ position: 'relative', fontSize: 16, fontWeight: 500, lineHeight: 1.65, color: '#334155', letterSpacing: '-0.01em', margin: 0 }}>{t.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid #F1F5F9', marginTop: 'auto' }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 22, background: `linear-gradient(135deg, ${['#3B5BFA','#8B5CF6','#EC4899'][i]}, #8B5CF6 80%)` }}>{t.avatar}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0F2E', letterSpacing: '-0.01em' }}>{t.name}</div>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>{t.title}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── PRICING ─────────────────────────────────────────────────
function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#3B5BFA22,#EC489922)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
        <Check size={12} strokeWidth={3} color="#3B5BFA" />
      </span>
      <span style={{ fontSize: 14.5, color: '#475569' }}>{text}</span>
    </div>
  )
}
function BulletLight({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
        <Check size={12} strokeWidth={3} color="#fff" />
      </span>
      <span style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.9)' }}>{text}</span>
    </div>
  )
}

function Pricing() {
  const w = useWindowWidth()
  const cols = w < 1024 ? 1 : 3
  return (
    <section id="launch" style={{ background: '#fff', padding: '112px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 56 }}>
          <motion.div variants={fadeUp}><Eyebrow>Get Started</Eyebrow></motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>
            Start building. <span className="gradient-text">Scale confidently.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#64748B', maxWidth: 480, margin: 0 }}>
            Open source today. Multi-chain forever. Pick the lane that matches where you are.
          </motion.p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20, alignItems: 'stretch' }}>
          {/* Explorer */}
          <motion.div variants={fadeUp} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 26, padding: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#F1F5F9', color: '#64748B', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>Open Source</span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.02em' }}>Explorer</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#0A0F2E', lineHeight: 1, letterSpacing: '-0.04em', marginTop: 12 }}>Free</div>
              <div style={{ fontSize: 13.5, color: '#94A3B8', marginTop: 8 }}>Forever, for everyone</div>
            </div>
            <div style={{ flex: 1 }}>
              {['Credit Passport tool', 'Family Vault tool', 'QIE Mainnet access', 'Read-only dashboard'].map(f => <Bullet key={f} text={f} />)}
            </div>
            <GhostBtn href="#launch">Start exploring</GhostBtn>
          </motion.div>

          {/* Builder — featured */}
          <motion.div variants={fadeUp} className="featured-glow" style={{ background: '#fff', borderRadius: 26, padding: 36, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>Most Popular</span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.02em' }}>Builder</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#0A0F2E', lineHeight: 1, letterSpacing: '-0.04em', marginTop: 12 }}>$0</div>
              <div style={{ fontSize: 13.5, color: '#94A3B8', marginTop: 8 }}>Currently free — open beta</div>
            </div>
            <div style={{ flex: 1 }}>
              {['All 8 tools included', 'All 4 blockchains', 'Real wallet connection', 'AI features enabled', 'Full dashboard access'].map(f => <Bullet key={f} text={f} />)}
            </div>
            <GradBtn href="/dashboard">Launch App <ArrowRight size={17} strokeWidth={2.2} /></GradBtn>
          </motion.div>

          {/* Enterprise */}
          <motion.div variants={fadeUp} style={{ background: 'linear-gradient(160deg, #3B5BFA 0%, #4F46E5 55%, #312E81 100%)', borderRadius: 26, padding: 36, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none', background: 'radial-gradient(50% 50% at 90% 10%, #EC4899 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>Custom</span>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Enterprise</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em', marginTop: 12 }}>Contact Us</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Tailored deployments</div>
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              {['Custom chain deployment', 'Private instance', 'SLA guarantee', 'Priority support', 'White-label options'].map(f => <BulletLight key={f} text={f} />)}
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ position: 'relative' }}>
              <a href="mailto:vijayakumarsasikalarupeshkumar@gmail.com?subject=Kubryx%20Enterprise%20Inquiry" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 999, border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '12px 24px', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}>
                Talk to us <ArrowRight size={17} strokeWidth={2.2} />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────
function FinalCTA() {
  const w = useWindowWidth()
  const isMobile = w < 768
  return (
    <section style={{ background: '#fff', padding: '0 24px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, padding: isMobile ? 40 : 64, background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', opacity: 0.3, background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -128, left: -64, width: 384, height: 384, borderRadius: '50%', opacity: 0.2, background: 'radial-gradient(circle, #3B5BFA 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: 40, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>
                  <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> Live now
                </div>
                <h3 style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.04, margin: '0 0 20px' }}>Ready to build on Kubryx?</h3>
                <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 480, lineHeight: 1.65, margin: 0 }}>
                  One platform. Eight tools. Four blockchains. Start now — no credit card, no API keys, no waitlist.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 999, background: '#fff', color: '#0A0F2E', fontWeight: 700, padding: '16px 28px', fontSize: 15, textDecoration: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)' }}>
                    <span className="gradient-text">Launch App</span>
                    <ArrowRight size={17} strokeWidth={2.4} color="#0A0F2E" />
                  </Link>
                </motion.div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────
type FooterLink = { label: string; href: string; external?: boolean }
const FOOTER_COLS: Record<string, FooterLink[]> = {
  PLATFORM: [
    { label: 'Credit Passport',            href: '/credit'   },
    { label: 'Family Vault',               href: '/legacy'   },
    { label: 'Agent Coordinator',          href: '/agents'   },
    { label: 'Private Vault',              href: '/vault'    },
    { label: 'Bill Split',                 href: '/split'    },
    { label: 'AI Lending',                 href: '/lend'     },
    { label: 'Yield Operations Hub',       href: '/treasury' },
    { label: 'Stealth Execution Suite',    href: '/shadow'   },
  ],
  CHAINS: [
    { label: 'QIE Mainnet',  href: 'https://mainnet.qie.info',                          external: true },
    { label: 'Solana',       href: 'https://explorer.solana.com/?cluster=devnet',       external: true },
    { label: 'Stellar',      href: 'https://stellar.expert/explorer/testnet',           external: true },
    { label: 'Ethereum L2',  href: 'https://arbiscan.io',                               external: true },
  ],
  RESOURCES: [
    { label: 'Smart Contracts', href: '/protocols'    },
    { label: 'API Docs',        href: '/developers'   },
    { label: 'Architecture',    href: '/architecture' },
  ],
  COMPANY: [
    { label: 'About',     href: '/story'    },
    { label: 'Ecosystem', href: '/ecosystem' },
    { label: 'Contact',   href: 'mailto:vijayakumarsasikalarupeshkumar@gmail.com', external: true },
  ],
}

function Footer() {
  return (
    <footer id="company" style={{ position: 'relative', background: '#0A0F2E', color: '#fff' }}>
      <div style={{ position: 'absolute', inset: '0 0 auto', height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 200, opacity: 0.3, filter: 'blur(48px)', background: 'radial-gradient(ellipse, #8B5CF6 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 40px', position: 'relative' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #3B5BFA, #8B5CF6 55%, #EC4899)' }}>K</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Kubryx</span>
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}>
              Launch App <ArrowRight size={15} strokeWidth={2.4} />
            </Link>

          </div>
        </div>

        {/* Links grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 40, padding: '56px 0' }}>
          {Object.entries(FOOTER_COLS).map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: 11.5, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(139,92,246,0.7)', marginBottom: 16 }}>{title}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(l => {
                  const linkStyle: React.CSSProperties = { fontSize: 14, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }
                  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#fff')
                  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#94A3B8')
                  return (
                    <li key={l.label}>
                      {l.external ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{l.label}</a>
                      ) : (
                        <Link href={l.href} style={linkStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{l.label}</Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant wordmark */}
        <div style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            fontSize: 'clamp(60px, 14vw, 220px)',
            fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
            userSelect: 'none',
          }}>
            Kubryx
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, lineHeight: 1.6, color: 'rgba(148,163,184,0.7)', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>© 2026 vsrupeshkumar. All Rights Reserved.</div>
          <p style={{ margin: 0 }}>This platform, including its source code, system architecture, infrastructure design, backend systems, frontend implementation, APIs, databases, UI/UX, production workflows, and all related intellectual property, was independently designed and developed by vsrupeshkumar as Founder, Architect, System Designer, Frontend Developer, Backend Developer, and Production Engineer.</p>
          <p style={{ margin: 0 }}>Unauthorized copying, reproduction, modification, redistribution, reverse engineering, resale, or commercial use of this platform or any portion of its codebase or architecture is strictly prohibited without explicit prior written permission from the author.</p>
          <p style={{ margin: 0 }}>Any unauthorized use may result in legal action under applicable copyright and intellectual property laws.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── EXTRAS ──────────────────────────────────────────────────
function CookieBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem('kbx_cookie_ok')) setTimeout(() => setShow(true), 1200)
  }, [])
  if (!show) return null
  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 60, maxWidth: 360, background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 20px 50px -10px rgba(15,23,42,0.25)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#FCE7F3,#EDE9FE)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>🍪</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0F2E' }}>A quick note about cookies</div>
        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>We use cookies to improve your experience and remember your wallet preferences.</div>
      </div>
      <button onClick={() => { localStorage.setItem('kbx_cookie_ok', '1'); setShow(false) }} className="btn-gradient" style={{ borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, color: '#fff' }}>
        Okay
      </button>
    </div>
  )
}

function ChatButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        aria-label="Chat"
        className="btn-gradient"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 18px 40px -10px rgba(139,92,246,0.55)', color: '#fff' }}
      >
        {open ? <X size={22} strokeWidth={2.4} /> : <MessageCircle size={22} strokeWidth={2.4} />}
      </motion.button>
      <div style={{ position: 'fixed', bottom: 96, right: 24, zIndex: 60, width: 320, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', transform: open ? 'scale(1)' : 'scale(0.95)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'all 0.2s', transformOrigin: 'bottom right' }}>
        <div style={{ padding: 16, background: 'linear-gradient(135deg,#3B5BFA,#8B5CF6 55%,#EC4899)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>✨</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Ask Kubryx</div>
              <div style={{ fontSize: 11.5, opacity: 0.8 }}>Average reply ~3 min</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 16px 4px', fontSize: 13.5, color: '#64748B' }}>Questions about a specific tool, chain, or the API? Drop a note.</div>
        <div style={{ padding: '8px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E2E8F0', borderRadius: 999, padding: '8px 12px' }}>
            <input style={{ flex: 1, fontSize: 13.5, border: 'none', outline: 'none', background: 'transparent' }} placeholder="Type a message..." />
            <button className="btn-gradient" style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ScrollTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <motion.button
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{ position: 'fixed', bottom: 96, right: 100, zIndex: 60, width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px -8px rgba(15,23,42,0.25)', pointerEvents: show ? 'auto' : 'none' }}
    >
      <ArrowUp size={16} strokeWidth={2.4} color="#0A0F2E" />
    </motion.button>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ background: '#fff', color: '#0A0F2E' }}>
      <Navbar />
      <Hero />
      <TrustBar />
      <Stats />
      <Tools />
      <Features />
      <Chains />
      <DashboardPreview />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
      <CookieBanner />
      <ChatButton />
      <ScrollTop />
    </div>
  )
}
