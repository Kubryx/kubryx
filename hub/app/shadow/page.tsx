'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { fallbackShadowAgents } from '../../lib/fallback'
import { toast } from '../../lib/toast'
import { loadWallet, persistWallet } from '../../lib/wallet-utils'
import ExecutiveWalkthrough from '../components/ExecutiveWalkthrough'
import CommandPalette from '../components/CommandPalette'

// ─── Types ───────────────────────────────────────────────────────────────────

type PhantomProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  isPhantom?: boolean
}

type ShadowAgent = { agentType?: string; type?: string; name?: string; status?: string; lastAction?: string; time?: string }
type FeedItem = { id: string; agentType: string; action: string; timestamp: string }

// ─── Constants ───────────────────────────────────────────────────────────────

const apiBase = process.env.NEXT_PUBLIC_SHADOW_URL || process.env.NEXT_PUBLIC_SHADOW_API || ''

const P = '#A855F7', PL = '#C084FC', GOLD = '#F5C518', GRN = '#22C55E'
const RED = '#EF4444', ORG = '#F97316', BLU = '#60A5FA'
const BG = '#060608', MONO = '"JetBrains Mono","Fira Code","Courier New",monospace'
const CARD = 'rgba(255,255,255,0.025)', BORDER = 'rgba(255,255,255,0.07)'

const DEPTS = [
  { type:'cfo',         name:'CFO Agent',         icon:'💰', role:'Treasury oversight, rebalancing & capital allocation', color:GOLD, bg:'rgba(245,197,24,0.06)',   bd:'rgba(245,197,24,0.25)',   metric:'12,480.50', unit:'SOL',    label:'Treasury Balance',   action:'Rebalance treasury' },
  { type:'payroll',     name:'Payroll Agent',      icon:'💸', role:'Real-time SOL salary streaming to team wallets',       color:GRN,  bg:'rgba(34,197,94,0.06)',    bd:'rgba(34,197,94,0.25)',    metric:'0.00034',   unit:'SOL/s',  label:'Stream Rate',        action:'Process payroll batch' },
  { type:'compliance',  name:'Compliance Agent',   icon:'⚖️', role:'Regulatory rule enforcement & AML screening',         color:BLU,  bg:'rgba(96,165,250,0.06)',   bd:'rgba(96,165,250,0.25)',   metric:'347',       unit:'rules',  label:'Rules Checked',      action:'Run compliance sweep' },
  { type:'audit',       name:'Audit Agent',        icon:'🔍', role:'Immutable transaction logging & on-chain audit trail', color:PL,   bg:'rgba(192,132,252,0.06)', bd:'rgba(192,132,252,0.25)', metric:'1,847',     unit:'txns',   label:'Txns Logged',        action:'Run full audit' },
  { type:'procurement', name:'Procurement Agent',  icon:'🛒', role:'Vendor management & automated purchase orders',       color:ORG,  bg:'rgba(249,115,22,0.06)',   bd:'rgba(249,115,22,0.25)',   metric:'3',         unit:'orders', label:'Pending POs',        action:'Process pending POs' },
  { type:'tax',         name:'Tax Agent',          icon:'📋', role:'On-chain tax liability estimation & filing prep',      color:'#F472B6', bg:'rgba(244,114,182,0.06)', bd:'rgba(244,114,182,0.25)', metric:'0.082', unit:'SOL',   label:'Est. Liability',     action:'Calculate liability' },
  { type:'risk',        name:'Risk Agent',         icon:'🛡',  role:'Real-time anomaly detection & threat monitoring',     color:RED,  bg:'rgba(239,68,68,0.06)',    bd:'rgba(239,68,68,0.25)',    metric:'2',         unit:'/ 10',   label:'Threat Level',       action:'Run threat scan' },
] as const

const POOL: Omit<FeedItem,'id'|'timestamp'>[] = [
  { agentType:'CFO Agent',         action:'Treasury rebalanced — moved 120 SOL to reserve pool' },
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
function shorten(a: string) { return `${a.slice(0,6)}…${a.slice(-4)}` }
function sColor(s: string) { return s==='active'?GRN:s==='idle'?ORG:s==='alert'?RED:'rgba(255,255,255,0.35)' }

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
    <article style={{
      background: dept.bg, border: `1px solid ${dept.bd}`,
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${dept.color}55,transparent)` }} />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>{dept.icon}</span>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:dept.color, margin:0 }}>{dept.name}</p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.38)', margin:0 }}>{dept.role}</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:sColor(status), boxShadow:isActive?`0 0 6px ${sColor(status)}`:'none' }} />
          <span style={{ fontSize:10, color:sColor(status), fontWeight:600, textTransform:'uppercase' }}>{status}</span>
        </div>
      </div>

      {/* Metric */}
      <div style={{ background:'rgba(0,0,0,0.22)', borderRadius:8, padding:'10px 13px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{dept.label}</p>
          <p style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0, fontFamily:MONO }}>
            {stealth ? '●●●●●' : dept.metric}
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginLeft:4 }}>{dept.unit}</span>
          </p>
        </div>
        <span style={{ fontSize:24, opacity:0.15 }}>{dept.icon}</span>
      </div>

      {/* Last action */}
      <div>
        <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', margin:'0 0 3px', letterSpacing:'0.04em' }}>LAST ACTION</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', margin:0, lineHeight:1.45 }}>
          {stealth ? '[ REDACTED — STEALTH ACTIVE ]' : lastAction}
        </p>
        {agent?.time && <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', margin:'3px 0 0', fontFamily:MONO }}>{agent.time}</p>}
      </div>

      {/* Button */}
      <button
        onClick={handle}
        disabled={!enabled || busy || pageLoading}
        style={{
          background: busy ? 'rgba(255,255,255,0.04)' : `${dept.color}14`,
          color: busy ? 'rgba(255,255,255,0.35)' : dept.color,
          border: `1px solid ${dept.color}35`,
          borderRadius:8, padding:'8px 0', fontSize:12, fontWeight:600,
          cursor: !enabled || busy || pageLoading ? 'not-allowed' : 'pointer',
          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
        }}
      >
        {busy
          ? <><span style={{ width:10, height:10, border:`1.5px solid ${dept.color}40`, borderTop:`1.5px solid ${dept.color}`, borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />Executing…</>
          : <>▶ Trigger</>}
      </button>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShadowPage() {
  const [wallet,  setWallet]  = useState('')
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

  useEffect(() => {
    const saved = loadWallet('solana')
    if (saved) { setWallet(saved); setAdmin(saved) }
  }, [])

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

  async function connectWallet() {
    try {
      const phantom = (window as any).solana as PhantomProvider | undefined
      if (!phantom?.isPhantom) throw new Error('Phantom wallet is not installed.')
      const res = await phantom.connect()
      const pk = res.publicKey.toString()
      setWallet(pk); setAdmin(pk)
      persistWallet('solana', pk)
      toast.success('Phantom connected to Shadow OS')
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Could not connect.'
      setError(m); toast.error(m)
    }
  }

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
    <div style={{ background:BG, minHeight:'100vh', color:'#fff', fontFamily:'"Inter",system-ui,sans-serif', position:'relative' }}>

      {/* Grid texture */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:'linear-gradient(rgba(168,85,247,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.018) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:1300, margin:'0 auto', padding:'0 24px 60px' }}>

        {/* ── Top Bar ── */}
        <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:'1px solid rgba(168,85,247,0.12)', flexWrap:'wrap', gap:8, position:'sticky', top:0, background:`${BG}ee`, backdropFilter:'blur(14px)', zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18 }}>🌑</span>
            <span style={{ fontSize:13, fontWeight:800, color:P, letterSpacing:'0.1em' }}>SHADOW OS</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.06em' }}>NEXUS v2.0</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            {/* Live / Demo */}
            <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:isDemo?'rgba(255,255,255,0.03)':'rgba(34,197,94,0.07)', border:`1px solid ${isDemo?'rgba(255,255,255,0.1)':'rgba(34,197,94,0.28)'}`, color:isDemo?'rgba(255,255,255,0.38)':GRN, display:'flex', alignItems:'center', gap:5, fontWeight:600 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:isDemo?'rgba(255,255,255,0.28)':GRN, boxShadow:isDemo?'none':`0 0 5px ${GRN}` }} />
              {isDemo?'Demo Mode':'Live'}
            </span>
            {/* Solana */}
            <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:'rgba(168,85,247,0.07)', border:'1px solid rgba(168,85,247,0.22)', color:PL, display:'flex', alignItems:'center', gap:5, fontWeight:600 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:P }} />Solana Devnet
            </span>
            {/* Health */}
            <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:health==='ok'?'rgba(34,197,94,0.06)':'rgba(239,68,68,0.06)', border:`1px solid ${health==='ok'?'rgba(34,197,94,0.22)':'rgba(239,68,68,0.22)'}`, color:health==='ok'?GRN:RED, display:'flex', alignItems:'center', gap:5, fontWeight:600 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:health==='ok'?GRN:RED }} />
              {health==='checking'?'Connecting…':health==='ok'?'API Online':'API Offline'}
            </span>
            {/* Stealth */}
            <button onClick={()=>setStealth(s=>!s)} style={{ fontSize:10, padding:'3px 11px', borderRadius:20, cursor:'pointer', background:stealth?'rgba(239,68,68,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${stealth?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.1)'}`, color:stealth?RED:'rgba(255,255,255,0.45)', fontWeight:600 }}>
              {stealth?'🔴 STEALTH ON':'⚫ Stealth Off'}
            </button>
            {/* Wallet */}
            <button onClick={connectWallet} style={{ fontSize:11, padding:'6px 14px', borderRadius:20, cursor:'pointer', background:wallet?'rgba(168,85,247,0.1)':'rgba(168,85,247,0.18)', border:`1px solid ${wallet?'rgba(168,85,247,0.38)':'rgba(168,85,247,0.55)'}`, color:PL, fontWeight:600, fontFamily:wallet?MONO:'inherit' }}>
              {wallet ? shorten(wallet) : '🔗 Connect Phantom'}
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section style={{ padding:'36px 0 26px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:P, letterSpacing:'0.14em', margin:'0 0 8px' }}>SHADOWLEDGER NEXUS</p>
              <h1 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:900, margin:'0 0 10px', lineHeight:1.15, background:`linear-gradient(135deg,#fff 20%,${PL} 80%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Shadow OS — Autonomous Corporate AI
              </h1>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.48)', maxWidth:560, lineHeight:1.65, margin:0 }}>
                Orchestrate 7 invisible AI departments across treasury, payroll, compliance, audit, procurement, tax and risk on Solana.
              </p>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={()=>setOrgOpen(o=>!o)} style={{ background:`linear-gradient(135deg,${P},#7C3AED)`, color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                {orgOpen ? '✕ Close Setup' : '⚙ Setup Organization'}
              </button>
              <button onClick={()=>loadData(wallet||undefined)} disabled={loading} style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.65)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer' }}>
                {loading ? '⟳ Loading…' : '↻ Refresh'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Alerts ── */}
        {error && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:RED }}>❌ {error}</div>}
        {message && <div style={{ background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:GRN }}>✅ {message}</div>}
        {!wallet && <div style={{ background:'rgba(168,85,247,0.05)', border:'1px solid rgba(168,85,247,0.18)', borderRadius:10, padding:'11px 16px', marginBottom:16, fontSize:13, color:PL }}>🔗 Connect Phantom to enable agent triggers and org management.</div>}

        {/* ── Stats Strip ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Treasury Balance',   value: stealth?'●●●●●':'12,480.50 SOL', icon:'💰', color:GOLD },
            { label:'Active Agents',       value:`${agents.filter(a=>(a.status||'active')==='active').length||6} / 7`,         icon:'🤖', color:GRN },
            { label:'SOL Streamed Today',  value: stealth?'●●●●●':`${streamed.toFixed(4)} SOL`, icon:'💸', color:PL },
            { label:'Threat Level',        value:'2 / 10 — LOW',                                icon:'🛡', color:GRN },
          ].map(s=>(
            <div key={s.label} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:'13px 15px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.32)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</p>
                <p style={{ fontSize:14, fontWeight:700, color:s.color, margin:0, fontFamily:MONO }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Org Setup (collapsible) ── */}
        {orgOpen && (
          <div style={{ background:'rgba(168,85,247,0.04)', border:'1px solid rgba(168,85,247,0.18)', borderRadius:14, padding:'20px 22px', marginBottom:22 }}>
            <p style={{ fontSize:13, fontWeight:700, color:PL, margin:'0 0 16px' }}>⚙ Organization Setup</p>
            <form onSubmit={setupOrg} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12, alignItems:'end' }}>
              <div>
                <label style={{ display:'block', fontSize:10, color:'rgba(255,255,255,0.38)', marginBottom:6, letterSpacing:'0.05em' }}>ORGANIZATION NAME</label>
                <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="Shadow DAO" style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(168,85,247,0.28)', borderRadius:8, color:'#fff', fontSize:13, boxSizing:'border-box', outline:'none' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:10, color:'rgba(255,255,255,0.38)', marginBottom:6, letterSpacing:'0.05em' }}>ADMIN WALLET (SOLANA)</label>
                <input value={admin} onChange={e=>setAdmin(e.target.value)} placeholder="Solana public key" style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(168,85,247,0.28)', borderRadius:8, color:'#fff', fontSize:13, fontFamily:MONO, boxSizing:'border-box', outline:'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ background:`linear-gradient(135deg,${P},#7C3AED)`, color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:loading?'not-allowed':'pointer', whiteSpace:'nowrap' }}>
                {loading?'⟳ Saving…':'💾 Save'}
              </button>
            </form>
          </div>
        )}

        {/* ── Treasury + Activity ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, marginBottom:22 }}>

          {/* Treasury */}
          <div style={{ background:'rgba(245,197,24,0.04)', border:'1px solid rgba(245,197,24,0.18)', borderRadius:14, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:700, color:GOLD, margin:0 }}>💰 Treasury Overview</p>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontFamily:MONO }}>CFO AGENT MANAGED</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:'24h Inflow',      value:'+420.00 SOL', color:GRN  },
                { label:'24h Outflow',     value:'-180.00 SOL', color:RED  },
                { label:'Reserve Pool',    value:'4,992.20 SOL', color:GOLD },
                { label:'Operations Pool', value:'7,488.30 SOL', color:BLU  },
              ].map(m=>(
                <div key={m.label} style={{ background:'rgba(0,0,0,0.22)', borderRadius:8, padding:'9px 12px' }}>
                  <p style={{ fontSize:9, color:'rgba(255,255,255,0.32)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.04em' }}>{m.label}</p>
                  <p style={{ fontSize:15, fontWeight:700, color:m.color, margin:0, fontFamily:MONO }}>{stealth?'●●●●●':m.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                <div style={{ width:'60%', height:'100%', borderRadius:3, background:`linear-gradient(90deg,${GOLD},${ORG})` }} />
              </div>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', whiteSpace:'nowrap' }}>60% Ops / 40% Reserve</span>
            </div>
            {/* Payroll streams */}
            <div style={{ padding:'11px 13px', background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.18)', borderRadius:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <p style={{ fontSize:11, fontWeight:700, color:GRN, margin:0 }}>💸 Active Payroll Streams</p>
                <span style={{ fontSize:10, color:GRN, fontFamily:MONO }}>{stealth?'●●● SOL/s':`${RATE} SOL/s total`}</span>
              </div>
              {[{ r:'Dev Team', v:'0.00023 SOL/s' },{ r:'Marketing', v:'0.00011 SOL/s' }].map(s=>(
                <div key={s.r} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:3 }}>
                  <span>{s.r}</span>
                  <span style={{ fontFamily:MONO }}>{stealth?'●●●':s.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px 22px', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <p style={{ fontSize:13, fontWeight:700, color:PL, margin:0 }}>📡 Global Activity Feed</p>
              {isDemo && <span style={{ fontSize:9, color:GRN, fontFamily:MONO, display:'flex', alignItems:'center', gap:4 }}><span style={{ width:5, height:5, borderRadius:'50%', background:GRN, boxShadow:`0 0 4px ${GRN}`, display:'inline-block' }} />LIVE SIM</span>}
            </div>
            <div ref={feedRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:7, maxHeight:340 }}>
              {activity.length === 0
                ? <div style={{ textAlign:'center', padding:'32px 0' }}><p style={{ fontSize:28, margin:'0 0 8px' }}>📡</p><p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', margin:0 }}>No activity yet.</p></div>
                : activity.map((item, i)=>(
                  <div key={item.id||i} style={{ padding:'8px 10px', background:i===0?'rgba(168,85,247,0.06)':'rgba(255,255,255,0.018)', border:`1px solid ${i===0?'rgba(168,85,247,0.14)':'rgba(255,255,255,0.04)'}`, borderRadius:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:PL }}>{item.agentType}</span>
                      <span style={{ fontSize:9, color:'rgba(255,255,255,0.22)', fontFamily:MONO }}>{item.timestamp}</span>
                    </div>
                    <p style={{ fontSize:11, color:stealth?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.62)', margin:0, lineHeight:1.45 }}>
                      {stealth?'■■■■ ■■■■■■ ■■■ ■■■■■■■':item.action}
                    </p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── Agent Grid ── */}
        <section style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', margin:0, letterSpacing:'0.1em' }}>AI DEPARTMENT GRID — 7 AUTONOMOUS AGENTS</p>
            {!wallet && !isDemo && <p style={{ fontSize:10, color:'rgba(255,255,255,0.28)', margin:0 }}>Connect wallet to enable triggers</p>}
          </div>
          {loading
            ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
                {DEPTS.map(d=><div key={d.type} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, height:190, animation:'pulse 1.5s ease-in-out infinite' }} />)}
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
                {DEPTS.map(dept=>{
                  const key = dept.type.toLowerCase()
                  const agent = byType.get(key) || byType.get(dept.name.toLowerCase().replace(' agent',''))
                  return <AgentCard key={dept.type} dept={dept} agent={agent} onTrigger={triggerAgent} pageLoading={loading} enabled={!!wallet||isDemo} stealth={stealth} />
                })}
              </div>
          }
        </section>

        {/* ── Simulation + Stealth ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>

          {/* Simulation */}
          <div style={{ background:'rgba(96,165,250,0.04)', border:'1px solid rgba(96,165,250,0.18)', borderRadius:14, padding:'20px 22px' }}>
            <p style={{ fontSize:13, fontWeight:700, color:BLU, margin:'0 0 18px' }}>📊 Treasury Simulation</p>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
              {[
                { label:'Treasury Size (SOL)', min:1000, max:100000, step:500, val:simT, set:setSimT },
                { label:'Monthly Burn (SOL)',   min:10,   max:5000,  step:10,  val:simB, set:setSimB },
                { label:'Payroll Recipients',   min:1,    max:50,    step:1,   val:simR, set:setSimR },
              ].map(s=>(
                <div key={s.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <label style={{ fontSize:10, color:'rgba(255,255,255,0.38)', letterSpacing:'0.04em' }}>{s.label}</label>
                    <span style={{ fontSize:11, color:BLU, fontFamily:MONO, fontWeight:700 }}>{s.val}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e=>s.set(Number(e.target.value))} style={{ width:'100%', accentColor:BLU }} />
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:'Runway',       value:`${runway} mo`,          color:runway>12?GRN:runway>6?ORG:RED },
                { label:'Risk Score',   value:`${riskPct}/100`,        color:riskPct<30?GRN:riskPct<60?ORG:RED },
                { label:'Q4 Forecast',  value:q4>0?`${Math.round(q4)}`:'DEFICIT', color:q4>0?GRN:RED },
              ].map(m=>(
                <div key={m.label} style={{ background:'rgba(0,0,0,0.28)', borderRadius:10, padding:'12px 10px', textAlign:'center' }}>
                  <p style={{ fontSize:9, color:'rgba(255,255,255,0.32)', margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.04em' }}>{m.label}</p>
                  <p style={{ fontSize:18, fontWeight:800, color:m.color, margin:0, fontFamily:MONO }}>{m.value}</p>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'rgba(255,255,255,0.28)', marginBottom:4 }}><span>LOW RISK</span><span>HIGH RISK</span></div>
              <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                <div style={{ width:`${riskPct}%`, height:'100%', borderRadius:3, background:`linear-gradient(90deg,${GRN},${ORG},${RED})`, transition:'width 0.4s' }} />
              </div>
            </div>
          </div>

          {/* Stealth Card */}
          <div style={{ background:stealth?'rgba(239,68,68,0.07)':'rgba(255,255,255,0.02)', border:`1px solid ${stealth?'rgba(239,68,68,0.32)':BORDER}`, borderRadius:14, padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:13, fontWeight:700, color:stealth?RED:'rgba(255,255,255,0.55)', margin:0 }}>🕵️ Stealth Mode</p>
              {stealth && <span style={{ fontSize:9, color:RED, fontFamily:MONO, fontWeight:700, letterSpacing:'0.1em' }}>● ACTIVE</span>}
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', margin:0, lineHeight:1.6 }}>When active, financial amounts, wallet addresses and agent activity are masked — ideal for screen sharing or public demos.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {['Mask wallet addresses','Redact treasury balances','Redact activity logs','Blur agent metrics'].map(item=>(
                <div key={item} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:stealth?'rgba(255,255,255,0.65)':'rgba(255,255,255,0.32)' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:stealth?RED:'rgba(255,255,255,0.14)', flexShrink:0 }} />{item}
                </div>
              ))}
            </div>
            <button onClick={()=>setStealth(s=>!s)} style={{ background:stealth?RED:'rgba(168,85,247,0.14)', color:stealth?'#fff':PL, border:`1px solid ${stealth?RED:'rgba(168,85,247,0.32)'}`, borderRadius:8, padding:'10px 0', fontSize:12, fontWeight:700, cursor:'pointer', width:'100%' }}>
              {stealth?'🔴 Disable Stealth Mode':'⚫ Enable Stealth Mode'}
            </button>

            {/* Compliance quick summary */}
            <div style={{ padding:'12px 14px', background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.16)', borderRadius:10 }}>
              <p style={{ fontSize:11, fontWeight:700, color:GRN, margin:'0 0 8px' }}>⚖️ Compliance Summary</p>
              {[{ k:'AML Rules', v:'347 / 347 passed' },{ k:'KYC Flags', v:'0 active' },{ k:'Last Sweep', v:'2m ago' }].map(r=>(
                <div key={r.k} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.48)', marginTop:4 }}>
                  <span>{r.k}</span><span style={{ fontFamily:MONO, color:'rgba(255,255,255,0.65)' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ExecutiveWalkthrough />
      <CommandPalette />

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.35; } 50% { opacity:0.6; } }
      `}</style>
    </div>
  )
}
