'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fallbackShadowAgents } from '../../lib/fallback'
import { toast } from '../../lib/toast'
import { useWalletForTool } from '../../hooks/useWalletForTool'
import { ConnectButton } from '../../components/wallet/ConnectButton'
import { PriceBadge } from '../../components/ui/PriceBadge'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

// ─── Types ───────────────────────────────────────────────────────────────────

type ShadowAgent = { agentType?: string; type?: string; name?: string; status?: string; lastAction?: string; time?: string }
type FeedItem = { id: string; agentType: string; action: string; timestamp: string }

// ─── Constants ───────────────────────────────────────────────────────────────

const apiBase = process.env.NEXT_PUBLIC_SHADOW_URL || process.env.NEXT_PUBLIC_SHADOW_API || ''

const P = '#64748B', PL = '#94A3B8', GOLD = '#EAB308', GRN = '#10B981'
const RED = '#EF4444', ORG = '#F97316', BLU = '#3B82F6'
const BG = '#F8FAFC', MONO = '"JetBrains Mono","Fira Code","Courier New",monospace'
const CARD = 'rgba(255,255,255,0.85)', BORDER = 'rgba(255,255,255,0.6)'

const DEPTS = [
  { type:'cfo',         name:'CFO Agent',         icon:'💰', role:'Yield Operations Hub oversight, rebalancing & capital allocation', color:'#EAB308', bg:'#FEF9C3', bd:'#FEF08A', metric:'12,480.50', unit:'SOL',    label:'Yield Operations Hub Balance',   action:'Rebalance Yield Operations Hub' },
  { type:'payroll',     name:'Payroll Agent',      icon:'💸', role:'Real-time SOL salary streaming to team wallets',       color:'#10B981', bg:'#D1FAE5', bd:'#A7F3D0', metric:'0.00034',   unit:'SOL/s',  label:'Stream Rate',        action:'Process payroll batch' },
  { type:'compliance',  name:'Compliance Agent',   icon:'⚖️', role:'Regulatory rule enforcement & AML screening',         color:'#3B82F6', bg:'#DBEAFE', bd:'#BFDBFE', metric:'347',       unit:'rules',  label:'Rules Checked',      action:'Run compliance sweep' },
  { type:'audit',       name:'Audit Agent',        icon:'🔍', role:'Immutable transaction logging & on-chain audit trail', color:'#8B5CF6', bg:'#EDE9FE', bd:'#DDD6FE', metric:'1,847',     unit:'txns',   label:'Txns Logged',        action:'Run full audit' },
  { type:'procurement', name:'Procurement Agent',  icon:'🛒', role:'Vendor management & automated purchase orders',       color:'#F97316', bg:'#FFEDD5', bd:'#FED7AA', metric:'3',         unit:'orders', label:'Pending POs',        action:'Process pending POs' },
  { type:'tax',         name:'Tax Agent',          icon:'📋', role:'On-chain tax liability estimation & filing prep',      color:'#F43F5E', bg:'#FFE4E6', bd:'#FECDD3', metric:'0.082', unit:'SOL',   label:'Est. Liability',     action:'Calculate liability' },
  { type:'risk',        name:'Risk Agent',         icon:'🛡',  role:'Real-time anomaly detection & threat monitoring',     color:'#EF4444', bg:'#FEE2E2', bd:'#FECACA', metric:'2',         unit:'/ 10',   label:'Threat Level',       action:'Run threat scan' },
] as const

const POOL: Omit<FeedItem,'id'|'timestamp'>[] = [
  { agentType:'CFO Agent',         action:'Yield Operations Hub rebalanced — moved 120 SOL to reserve pool' },
  { agentType:'Payroll Agent',     action:'Streamed 0.42 SOL to 6 active recipients' },
  { agentType:'Compliance Agent',  action:'47 AML rules checked — 0 violations detected' },
  { agentType:'Audit Agent',       action:'Transaction audit complete: 23 txns verified' },
  { agentType:'Risk Agent',        action:'Threat scan complete — threat level: LOW (2/10)' },
  { agentType:'Tax Agent',         action:'Q3 liability estimate updated: 0.082 SOL' },
  { agentType:'Procurement Agent', action:'Vendor invoice #INV-0047 queued for approval' },
  { agentType:'CFO Agent',         action:'Capital allocation: 60% operations, 40% reserve' },
  { agentType:'Compliance Agent',  action:'Wallet GxKP...8fZr flagged for manual review' },
  { agentType:'Audit Agent',       action:'Immutable log snapshot saved at block 284,392' },
  { agentType:'Risk Agent',        action:'Anomaly detected and resolved: duplicate tx attempt' },
  { agentType:'Payroll Agent',     action:'New recipient added at 0.00012 SOL/s stream rate' },
  { agentType:'Procurement Agent', action:'PO #PO-2024-0091 approved: 8.5 SOL disbursed' },
  { agentType:'Tax Agent',         action:'Annual filing draft prepared — jurisdiction: US' },
  { agentType:'CFO Agent',         action:'Yield optimization: 2,000 SOL deployed to lending' },
]

function ts() {
  const n = new Date()
  return `${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}:${n.getSeconds().toString().padStart(2,'0')}`
}
function sColor(s: string) { return s==='active'?'#10B981':s==='idle'?'#F59E0B':s==='alert'?'#EF4444':'#94A3B8' }

// ─── AgentCard ────────────────────────────────────────────────────────────────

function AgentCard({
  dept, agent, onTrigger, pageLoading, enabled, stealth,
}: {
  dept: typeof DEPTS[number]
  agent: ShadowAgent | undefined
  onTrigger: (type: string, action: string) => Promise<void>
  pageLoading: boolean
  enabled: boolean
  stealth: boolean
}) {
  const [busy, setBusy] = useState(false)
  const status = agent?.status || 'active'
  const lastAction = agent?.lastAction || 'Ready for trigger.'
  const isActive = status === 'active'

  async function handle() {
    if (!enabled || busy || pageLoading) return
    setBusy(true)
    try { await onTrigger(dept.type, dept.action) } finally { setBusy(false) }
  }

  return (
    <motion.article 
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(100, 116, 139, 0.12)' }}
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden',
        borderTop: `4px solid ${dept.color}`
      }}
    >
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background: dept.bg, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            {dept.icon}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{dept.name}</p>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{dept.role}</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:sColor(status), boxShadow:isActive?`0 0 8px ${sColor(status)}`:'none' }} />
        </div>
      </div>

      {/* Metric */}
      <div style={{ background:'#F8FAFC', borderRadius:12, padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', border: '1px solid #E2E8F0' }}>
        <div>
          <p style={{ fontSize:11, color:'#64748B', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight: 600 }}>{dept.label}</p>
          <p style={{ fontSize:24, fontWeight:800, color:'#0F172A', margin:0, fontFamily:MONO }}>
            {stealth ? '●●●●●' : dept.metric}
            <span style={{ fontSize:12, color:'#64748B', marginLeft:6 }}>{dept.unit}</span>
          </p>
        </div>
      </div>

      {/* Last action */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize:11, color:'#64748B', margin:'0 0 4px', letterSpacing:'0.04em', fontWeight: 600 }}>LAST ACTION</p>
        <p style={{ fontSize:13, color:'#334155', margin:0, lineHeight:1.5, fontWeight: 500 }}>
          {stealth ? '[ REDACTED — STEALTH ACTIVE ]' : lastAction}
        </p>
        {agent?.time && <p style={{ fontSize:11, color:'#94A3B8', margin:'6px 0 0', fontFamily:MONO }}>{agent.time}</p>}
      </div>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handle}
        disabled={!enabled || busy || pageLoading}
        style={{
          background: busy ? '#E2E8F0' : dept.bg,
          color: busy ? '#94A3B8' : dept.color,
          border: `1px solid ${dept.bd}`,
          borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700,
          cursor: !enabled || busy || pageLoading ? 'not-allowed' : 'pointer',
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.2s'
        }}
      >
        {busy
          ? <><span style={{ width:12, height:12, border:`2px solid ${dept.color}40`, borderTop:`2px solid ${dept.color}`, borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />Executing…</>
          : <>▶ Trigger Action</>}
      </motion.button>
    </motion.article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShadowPage() {
  // Wallet state now comes from the global wallet context (Solana / Devnet).
  const { address } = useWalletForTool()
  const wallet = address ?? ''
  const [orgName, setOrgName] = useState('')
  const [admin,   setAdmin]   = useState('')
  const [agents,  setAgents]  = useState<ShadowAgent[]>([])
  const [activity,setActivity]= useState<FeedItem[]>([])
  const [health,  setHealth]  = useState<'checking'|'ok'|'down'>('checking')
  const [loading, setLoading] = useState(false)
  const [isDemo,  setIsDemo]  = useState(false)
  const [error,   setError]   = useState('')
  const [message, setMessage] = useState('')
  const [stealth, setStealth] = useState(false)
  const [orgOpen, setOrgOpen] = useState(false)

  // Simulation
  const [simT, setSimT] = useState(12480)
  const [simB, setSimB] = useState(350)
  const [simR, setSimR] = useState(8)

  // Payroll ticker
  const [streamed, setStreamed] = useState(0.42)
  const RATE = 0.00034

  const poolIdx = useRef(0)
  const feedRef = useRef<HTMLDivElement>(null)

  // ── Load ──────────────────────────────────────────────────────

  // Seed the org admin field from the connected wallet (still user-editable).
  useEffect(() => {
    if (wallet) setAdmin(wallet)
  }, [wallet])

  async function req<T>(path: string, opts?: RequestInit): Promise<T> {
    if (!apiBase) throw new Error('Backend not configured')
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 10000)
    try {
      const res = await fetch(`${apiBase}${path}`, {
        ...opts, signal: ctrl.signal,
        headers: { 'Content-Type':'application/json', ...(opts?.headers||{}) },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json() as T
    } finally { clearTimeout(t) }
  }

  const loadDemo = useCallback(() => {
    setAgents(fallbackShadowAgents as unknown as ShadowAgent[])
    const init: FeedItem[] = POOL.slice(0, 6).map((p,i) => ({ ...p, id:`i${i}`, timestamp:ts() }))
    setActivity(init)
    setIsDemo(true)
  }, [])

  async function loadData(pubkey?: string) {
    setLoading(true); setError('')
    try {
      const [sd, ad] = await Promise.all([
        req<ShadowAgent[]|{agents?:ShadowAgent[]}>('/api/agents/status'),
        req<FeedItem[]|{activity?:FeedItem[]}>('/api/activity'),
        pubkey ? req(`/api/org/${pubkey}`).catch(()=>null) : Promise.resolve(null),
      ])
      setAgents(Array.isArray(sd) ? sd : (sd as any).agents||[])
      setActivity(Array.isArray(ad) ? ad : (ad as any).activity||[])
      setIsDemo(false)
    } catch { loadDemo() }
    finally { setLoading(false) }
  }

  useEffect(() => {
    async function init() {
      try { const d = await req<{status?:string}>('/health'); setHealth((d as any).status==='ok'?'ok':'down') }
      catch { setHealth('down') }
      await loadData()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-append activity in demo
  useEffect(() => {
    if (!isDemo) return
    const id = setInterval(() => {
      const item: FeedItem = { ...POOL[poolIdx.current % POOL.length], id:`a${Date.now()}`, timestamp:ts() }
      poolIdx.current++
      setActivity(p => [item, ...p.slice(0, 29)])
      if (feedRef.current) feedRef.current.scrollTop = 0
    }, 4000)
    return () => clearInterval(id)
  }, [isDemo])

  // Payroll ticker
  useEffect(() => {
    const id = setInterval(() => setStreamed(p => p + RATE), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Actions ───────────────────────────────────────────────────

  async function setupOrg(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!wallet && !isDemo) { toast.error('Connect Phantom first.'); return }
    setLoading(true); setError('')
    try {
      if (!isDemo) await req('/api/org/setup', { method:'POST', body:JSON.stringify({ name:orgName, admin }) })
      setMessage(`Organization "${orgName||'Shadow DAO'}" configured${isDemo?' (demo)':''}.`)
      toast.success('Organization saved')
      setOrgOpen(false)
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Setup failed.'
      setError(m); toast.error(m)
    } finally { setLoading(false) }
  }

  async function triggerAgent(type: string, action: string): Promise<void> {
    try {
      if (!isDemo) await req('/api/agents/trigger', { method:'POST', body:JSON.stringify({ agentType:type, action, params:{ admin:wallet } }) })
      const item: FeedItem = {
        id: `t${Date.now()}`,
        agentType: DEPTS.find(d=>d.type===type)?.name || type,
        action: `Manual trigger: ${action}`,
        timestamp: ts(),
      }
      setActivity(p => [item, ...p.slice(0,49)])
      toast.success(`${type.toUpperCase()} agent triggered`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Trigger failed')
    }
  }

  // ── Computed ──────────────────────────────────────────────────

  const byType = new Map(agents.map(a => [(a.agentType||a.type||a.name||'').toLowerCase().replace(' agent',''), a]))
  const totalBurn = simB + simR * 0.05 * 30
  const runway = totalBurn > 0 ? Math.floor(simT / totalBurn) : 999
  const riskPct = Math.min(100, Math.round((totalBurn / simT) * 1200))
  const q4 = simT - 3 * totalBurn

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="shadow-container">
      {/* Grid texture */}
      <div className="dot-grid-overlay" />

      {/* Floating Shapes */}
      <div className="floating-container">
         <div className="float-shape" style={{ width: 300, height: 300, top: '10%', left: '-5%', animationDuration: '25s' }} />
         <div className="float-shape" style={{ width: 400, height: 400, top: '40%', right: '-10%', animationDuration: '30s', animationDelay: '-5s' }} />
         <div className="float-shape" style={{ width: 200, height: 200, bottom: '10%', left: '20%', animationDuration: '20s', animationDelay: '-10s' }} />
      </div>

      {/* Top Bar */}
      <header className="nav-bar" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width: 36, height: 36, background: '#0F172A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌑</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize:14, fontWeight:800, color:'#0F172A', letterSpacing:'0.1em' }}>Stealth Execution Suite</span>
            <span style={{ fontSize:10, color:'#64748B', letterSpacing:'0.06em', fontWeight: 600 }}>NEXUS v2.0</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          {/* Live / Demo */}
          <span style={{ fontSize:12, padding:'6px 14px', borderRadius:999, background:isDemo?'#F1F5F9':'#D1FAE5', border:`1px solid ${isDemo?'#E2E8F0':'#A7F3D0'}`, color:isDemo?'#64748B':'#10B981', display:'flex', alignItems:'center', gap:6, fontWeight:700 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:isDemo?'#94A3B8':'#10B981', boxShadow:isDemo?'none':`0 0 6px #10B981` }} />
            {isDemo?'Demo Mode':'Live'}
          </span>
          {/* Solana */}
          <span style={{ fontSize:12, padding:'6px 14px', borderRadius:999, background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#475569', display:'flex', alignItems:'center', gap:6, fontWeight:700 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#64748B' }} />Solana Devnet
          </span>
          {/* Health */}
          <span style={{ fontSize:12, padding:'6px 14px', borderRadius:999, background:health==='ok'?'#D1FAE5':'#FEE2E2', border:`1px solid ${health==='ok'?'#A7F3D0':'#FECACA'}`, color:health==='ok'?'#10B981':'#EF4444', display:'flex', alignItems:'center', gap:6, fontWeight:700 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:health==='ok'?'#10B981':'#EF4444' }} />
            {health==='checking'?'Connecting…':health==='ok'?'API Online':'API Offline'}
          </span>
          {/* Stealth */}
          <button onClick={()=>setStealth(s=>!s)} style={{ fontSize:12, padding:'6px 16px', borderRadius:999, cursor:'pointer', background:stealth?'#FEF2F2':'#FFFFFF', border:`1px solid ${stealth?'#FECACA':'#E2E8F0'}`, color:stealth?'#EF4444':'#64748B', fontWeight:700, transition: 'all 0.2s' }} onMouseOver={e => !stealth && (e.currentTarget.style.background = '#F8FAFC')} onMouseOut={e => !stealth && (e.currentTarget.style.background = '#FFFFFF')}>
            {stealth?'🔴 STEALTH ON':'⚫ Stealth Off'}
          </button>
          {/* Wallet */}
          <PriceBadge coinId="solana" label="SOL" />
          <ConnectButton type="solana" size="lg" />
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: '0 24px 60px' }}>
        
        {/* Hero */}
        <section className="hero-section" style={{ textAlign: 'center', padding: '60px 20px 40px', position: 'relative', zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#FFFFFF', borderRadius: 999, border: '1px solid #E2E8F0', marginBottom: 24, boxShadow: '0 4px 12px rgba(100, 116, 139, 0.05)' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', letterSpacing: '0.1em' }}>SHADOWLEDGER NEXUS</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: '#0F172A', margin: '0 auto 24px', lineHeight: 1.1, maxWidth: 900, letterSpacing: '-0.02em' }}>
              Autonomous Corporate AI <br/>
              <span style={{ color: '#64748B' }}>on Solana.</span>
            </h1>
            <p style={{ fontSize: 18, color: '#475569', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Orchestrate 7 invisible AI departments across Yield Operations Hub, payroll, compliance, audit, procurement, tax and risk.
            </p>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={()=>setOrgOpen(o=>!o)} className="btn-primary">
                {orgOpen ? '✕ Close Setup' : '⚙ Setup Organization'}
              </button>
              <button onClick={()=>loadData(wallet||undefined)} disabled={loading} className="btn-secondary">
                {loading ? '⟳ Loading…' : '↻ Refresh Status'}
              </button>
            </div>
          </motion.div>
        </section>

        {/* Alerts */}
        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'16px 20px', marginBottom:24, fontSize:14, fontWeight: 600, color:'#EF4444' }}>❌ {error}</motion.div>}
        {message && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:'16px 20px', marginBottom:24, fontSize:14, fontWeight: 600, color:'#10B981' }}>✅ {message}</motion.div>}
        {!wallet && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:'16px 20px', marginBottom:24, fontSize:14, fontWeight: 600, color:'#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔗</span> Connect Phantom to enable agent triggers and org management.
        </motion.div>}

        {/* Stats Strip */}
        <div className="bento-grid" style={{ marginBottom: 40 }}>
          {[
            { label:'Yield Operations Hub Balance',   value: stealth?'●●●●●':'12,480.50 SOL', icon:'💰', color:'#EAB308', bg:'#FEF9C3' },
            { label:'Active Agents',       value:`${agents.filter(a=>(a.status||'active')==='active').length||6} / 7`,         icon:'🤖', color:'#10B981', bg:'#D1FAE5' },
            { label:'SOL Streamed Today',  value: stealth?'●●●●●':`${streamed.toFixed(4)} SOL`, icon:'💸', color:'#3B82F6', bg:'#DBEAFE' },
            { label:'Threat Level',        value:'2 / 10 — LOW',                                icon:'🛡', color:'#10B981', bg:'#D1FAE5' },
          ].map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={s.label} 
              className="glass-card" 
              style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ background: s.bg, width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: MONO }}>{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Org Setup */}
        {orgOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card" style={{ padding:'32px', marginBottom:40, borderTop: '4px solid #64748B' }}>
            <p style={{ fontSize:18, fontWeight:800, color:'#0F172A', margin:'0 0 24px' }}>⚙ Organization Setup</p>
            <form onSubmit={setupOrg} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:24, alignItems:'end' }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight: 700, color:'#64748B', marginBottom:8, letterSpacing:'0.05em' }}>ORGANIZATION NAME</label>
                <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="Shadow DAO" style={{ width:'100%', padding:'14px 16px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, color:'#0F172A', fontSize:14, fontWeight: 500, boxSizing:'border-box', outline:'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#64748B'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight: 700, color:'#64748B', marginBottom:8, letterSpacing:'0.05em' }}>ADMIN WALLET (SOLANA)</label>
                <input value={admin} onChange={e=>setAdmin(e.target.value)} placeholder="Solana public key" style={{ width:'100%', padding:'14px 16px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, color:'#0F172A', fontSize:14, fontWeight: 500, fontFamily:MONO, boxSizing:'border-box', outline:'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#64748B'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <button type="submit" disabled={loading} style={{ background:'#0F172A', color:'#fff', border:'none', borderRadius:12, padding:'14px 32px', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', whiteSpace:'nowrap', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#1E293B'} onMouseOut={e => e.currentTarget.style.background = '#0F172A'}>
                {loading?'⟳ Saving…':'💾 Save Configuration'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Yield Operations Hub + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 40 }}>
          {/* Yield Operations Hub */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24 }}>
              <p style={{ fontSize:18, fontWeight:800, color:'#0F172A', margin:0 }}>💰 Yield Operations Hub Overview</p>
              <span style={{ fontSize:11, color:'#64748B', fontFamily:MONO, background: '#F1F5F9', padding: '4px 12px', borderRadius: 999 }}>CFO AGENT MANAGED</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom: 24 }}>
              {[
                { label:'24h Inflow',      value:'+420.00 SOL', color:'#10B981', bg:'#D1FAE5'  },
                { label:'24h Outflow',     value:'-180.00 SOL', color:'#EF4444', bg:'#FEE2E2'  },
                { label:'Reserve Pool',    value:'4,992.20 SOL', color:'#EAB308', bg:'#FEF9C3' },
                { label:'Operations Pool', value:'7,488.30 SOL', color:'#3B82F6', bg:'#DBEAFE'  },
              ].map(m=>(
                <div key={m.label} style={{ background:'#F8FAFC', border: '1px solid #E2E8F0', borderRadius:16, padding:'16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                    <p style={{ fontSize:11, color:'#64748B', margin:0, textTransform:'uppercase', letterSpacing:'0.04em', fontWeight: 600 }}>{m.label}</p>
                  </div>
                  <p style={{ fontSize:20, fontWeight:800, color: '#0F172A', margin:0, fontFamily:MONO }}>{stealth?'●●●●●':m.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: 24 }}>
              <div style={{ flex:1, height:8, borderRadius:4, background:'#E2E8F0', overflow:'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1 }} style={{ height:'100%', borderRadius:4, background:`linear-gradient(90deg, #EAB308, #F97316)` }} />
              </div>
              <span style={{ fontSize:12, fontWeight: 600, color:'#64748B', whiteSpace:'nowrap' }}>60% Ops / 40% Reserve</span>
            </div>
            {/* Payroll streams */}
            <div style={{ padding:'20px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0 }}>💸 Active Payroll Streams</p>
                <span style={{ fontSize:13, color:'#10B981', fontFamily:MONO, fontWeight: 700 }}>{stealth?'●●● SOL/s':`${RATE} SOL/s total`}</span>
              </div>
              {[{ r:'Dev Team', v:'0.00023 SOL/s' },{ r:'Marketing', v:'0.00011 SOL/s' }].map(s=>(
                <div key={s.r} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#64748B', marginTop:8, fontWeight: 500 }}>
                  <span>{s.r}</span>
                  <span style={{ fontFamily:MONO, color: '#0F172A' }}>{stealth?'●●●':s.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="glass-card" style={{ padding:'32px', display:'flex', flexDirection:'column', height: '100%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <p style={{ fontSize:18, fontWeight:800, color:'#0F172A', margin:0 }}>📡 Global Activity Feed</p>
              {isDemo && <span style={{ fontSize:11, color:'#10B981', fontFamily:MONO, fontWeight: 600, display:'flex', alignItems:'center', gap:6, background: '#D1FAE5', padding: '4px 12px', borderRadius: 999 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981', boxShadow:`0 0 6px #10B981`, display:'inline-block' }} />LIVE SIM
              </span>}
            </div>
            <div ref={feedRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, maxHeight: 420, paddingRight: 8 }}>
              {activity.length === 0
                ? <div style={{ textAlign:'center', padding:'40px 0' }}><p style={{ fontSize:32, margin:'0 0 12px' }}>📡</p><p style={{ fontSize:14, color:'#64748B', margin:0 }}>No activity yet.</p></div>
                : <AnimatePresence>
                    {activity.map((item, i)=>(
                      <motion.div 
                        key={item.id||i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ padding:'16px', background: i===0?'#F1F5F9':'#FFFFFF', border:`1px solid ${i===0?'#CBD5E1':'#E2E8F0'}`, borderRadius:12 }}
                      >
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <span style={{ fontSize:12, fontWeight:700, color: i===0?'#0F172A':'#64748B' }}>{item.agentType}</span>
                          <span style={{ fontSize:11, color:'#94A3B8', fontFamily:MONO }}>{item.timestamp}</span>
                        </div>
                        <p style={{ fontSize:13, color:stealth?'#CBD5E1':'#334155', margin:0, lineHeight:1.5, fontWeight: 500 }}>
                          {stealth?'■■■■ ■■■■■■ ■■■ ■■■■■■■':item.action}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
              }
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <section style={{ marginBottom:40 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>AI Department Grid</h2>
            {!wallet && !isDemo && <p style={{ fontSize:13, color:'#64748B', margin:0, fontWeight: 500 }}>Connect wallet to enable triggers</p>}
          </div>
          {loading
            ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
                {DEPTS.map(d=><div key={d.type} className="glass-card" style={{ height:260, animation:'pulse 1.5s ease-in-out infinite', background: '#F1F5F9' }} />)}
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
                {DEPTS.map(dept=>{
                  const key = dept.type.toLowerCase()
                  const agent = byType.get(key) || byType.get(dept.name.toLowerCase().replace(' agent',''))
                  return <AgentCard key={dept.type} dept={dept} agent={agent} onTrigger={triggerAgent} pageLoading={loading} enabled={!!wallet||isDemo} stealth={stealth} />
                })}
              </div>
          }
        </section>

        {/* Simulation + Stealth */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(400px,1fr))', gap:24, marginBottom: 40 }}>
          {/* Simulation */}
          <div className="glass-card" style={{ padding:'32px' }}>
            <p style={{ fontSize:18, fontWeight:800, color:'#0F172A', margin:'0 0 24px' }}>📊 Yield Operations Hub Simulation</p>
            <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:32 }}>
              {[
                { label:'Yield Operations Hub Size (SOL)', min:1000, max:100000, step:500, val:simT, set:setSimT },
                { label:'Monthly Burn (SOL)',   min:10,   max:5000,  step:10,  val:simB, set:setSimB },
                { label:'Payroll Recipients',   min:1,    max:50,    step:1,   val:simR, set:setSimR },
              ].map(s=>(
                <div key={s.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <label style={{ fontSize:12, fontWeight: 600, color:'#64748B', letterSpacing:'0.02em' }}>{s.label}</label>
                    <span style={{ fontSize:13, color:'#0F172A', fontFamily:MONO, fontWeight:700 }}>{s.val.toLocaleString()}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e=>s.set(Number(e.target.value))} style={{ width:'100%', accentColor: '#64748B' }} />
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:24 }}>
              {[
                { label:'Runway',       value:`${runway} mo`,          color:runway>12?'#10B981':runway>6?'#F59E0B':'#EF4444' },
                { label:'Risk Score',   value:`${riskPct}/100`,        color:riskPct<30?'#10B981':riskPct<60?'#F59E0B':'#EF4444' },
                { label:'Q4 Forecast',  value:q4>0?`${Math.round(q4).toLocaleString()}`:'DEFICIT', color:q4>0?'#10B981':'#EF4444' },
              ].map(m=>(
                <div key={m.label} style={{ background:'#F8FAFC', border: '1px solid #E2E8F0', borderRadius:16, padding:'16px 12px', textAlign:'center' }}>
                  <p style={{ fontSize:11, color:'#64748B', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.04em', fontWeight: 600 }}>{m.label}</p>
                  <p style={{ fontSize:20, fontWeight:800, color:m.color, margin:0, fontFamily:MONO }}>{m.value}</p>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight: 700, color:'#94A3B8', marginBottom:8 }}><span>LOW RISK</span><span>HIGH RISK</span></div>
              <div style={{ height:8, borderRadius:4, background:'#E2E8F0', overflow:'hidden' }}>
                <div style={{ width:`${riskPct}%`, height:'100%', borderRadius:4, background:`linear-gradient(90deg, #10B981, #F59E0B, #EF4444)`, transition:'width 0.4s' }} />
              </div>
            </div>
          </div>

          {/* Stealth Card */}
          <div className="glass-card" style={{ padding:'32px', display:'flex', flexDirection:'column', gap:20, border: stealth ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:18, fontWeight:800, color:stealth?'#EF4444':'#0F172A', margin:0 }}>🕵️ Stealth Mode</p>
              {stealth && <span style={{ fontSize:11, color:'#EF4444', fontFamily:MONO, fontWeight:700, letterSpacing:'0.1em', background: '#FEE2E2', padding: '4px 12px', borderRadius: 999 }}>● ACTIVE</span>}
            </div>
            <p style={{ fontSize:14, color:'#475569', margin:0, lineHeight:1.6, fontWeight: 500 }}>When active, financial amounts, wallet addresses and agent activity are masked — ideal for screen sharing or public demos.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, flex: 1 }}>
              {['Mask wallet addresses','Redact Yield Operations Hub balances','Redact activity logs','Blur agent metrics'].map(item=>(
                <div key={item} style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, fontWeight: 600, color:stealth?'#0F172A':'#64748B' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:stealth?'#EF4444':'#CBD5E1', flexShrink:0 }} />{item}
                </div>
              ))}
            </div>
            
            <button onClick={()=>setStealth(s=>!s)} style={{ background:stealth?'#EF4444':'#F8FAFC', color:stealth?'#fff':'#0F172A', border:stealth?'none':'1px solid #E2E8F0', borderRadius:12, padding:'14px 0', fontSize:14, fontWeight:700, cursor:'pointer', width:'100%', transition: 'all 0.2s', boxShadow: stealth ? '0 4px 12px rgba(239, 68, 68, 0.25)' : 'none' }}>
              {stealth?'🔴 Disable Stealth Mode':'⚫ Enable Stealth Mode'}
            </button>

            {/* Compliance quick summary */}
            <div style={{ padding:'20px', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:16, marginTop: 8 }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#10B981', margin:'0 0 12px' }}>⚖️ Compliance Summary</p>
              {[{ k:'AML Rules', v:'347 / 347 passed' },{ k:'KYC Flags', v:'0 active' },{ k:'Last Sweep', v:'2m ago' }].map(r=>(
                <div key={r.k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#64748B', marginTop:8, fontWeight: 600 }}>
                  <span>{r.k}</span><span style={{ fontFamily:MONO, color:'#0F172A' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <ExecutiveWalkthrough />
      <CommandPalette />

      <style>{`
        .shadow-container {
          background-color: #F8FAFC;
          background-image: radial-gradient(at 0% 0%, #F1F5F9 0px, transparent 50%),
                            radial-gradient(at 100% 0%, #E2E8F0 0px, transparent 50%);
          color: #0F172A;
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
        }

        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.4;
          pointer-events: none;
          z-index: 0;
        }

        .floating-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .float-shape {
          position: absolute;
          background: linear-gradient(135deg, rgba(100,116,139,0.1), rgba(100,116,139,0.02));
          border-radius: 50%;
          animation: drift linear infinite;
          backdrop-filter: blur(8px);
        }

        @keyframes drift {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-40px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(20px) translateX(-30px) rotate(240deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(100, 116, 139, 0.08);
        }

        .nav-bar {
          background: rgba(248, 250, 252, 0.8);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(100, 116, 139, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 16px 40px;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .btn-primary {
          background-color: #0F172A;
          color: #FFFFFF;
          border: none;
          padding: 14px 32px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
          background-color: #1E293B;
        }

        .btn-secondary {
          background-color: #FFFFFF;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          padding: 14px 32px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          background-color: #F8FAFC;
          border-color: #CBD5E1;
        }

        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
      `}</style>

      <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: 'inherit', opacity: 0.6, fontWeight: 500 }}>
        Built by vsrupeshkumar
      </div>
    </div>
  )
}
