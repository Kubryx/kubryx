// Built by vsrupeshkumar
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href:'/treasury',                label:'Home',          exact:true  },
  { href:'/treasury/dashboard',      label:'📊 Dashboard',  exact:true  },
  { href:'/treasury/send',           label:'💸 Send',       exact:true  },
  { href:'/treasury/receive',        label:'📥 Receive',    exact:true  },
  { href:'/treasury/swap',           label:'🔄 Swap',       exact:true  },
  { href:'/treasury/transactions',   label:'📋 Txns',       exact:false },
  { href:'/treasury/agents',         label:'🤖 Workforce',  exact:false },
  { href:'/treasury/payroll',        label:'💰 Payroll',    exact:false },
  { href:'/treasury/yield',          label:'📈 Yield',      exact:false },
  { href:'/treasury/analytics',      label:'📉 Analytics',  exact:false },
  { href:'/treasury/pnl',            label:'📊 P&L',        exact:false },
  { href:'/treasury/tax',            label:'🧾 Tax',         exact:false },
  { href:'/treasury/policy',         label:'🛡 Policy',     exact:false },
  { href:'/treasury/history',        label:'🕒 History',    exact:false },
  { href:'/treasury/marketplace',    label:'🏪 Store',      exact:false },
  { href:'/treasury/settings',       label:'⚙️ Settings',  exact:false },
] as const

const TEAL = '#00E5CC'

export default function TreasuryNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      display:'flex', gap:4, padding:'10px 20px',
      borderBottom:'1px solid rgba(0,229,204,0.1)',
      flexWrap:'wrap', background:'rgba(5,5,15,0.85)',
      backdropFilter:'blur(14px)', position:'sticky', top:0, zIndex:40,
      alignItems:'center',
    }}>
      <span style={{ fontSize:11, fontWeight:800, color:TEAL, letterSpacing:'0.1em', marginRight:8, display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ fontSize:14 }}>⚡</span>PALMFLOW
      </span>
      <span style={{ fontSize:9, color:'rgba(255,255,255,0.2)', marginRight:4, letterSpacing:'0.05em' }}>Neural OS v4.2</span>
      {ITEMS.map(item => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} style={{
            padding:'4px 10px', borderRadius:16, fontSize:10,
            fontWeight: active ? 700 : 400, textDecoration:'none',
            background: active ? `rgba(0,229,204,0.12)` : 'transparent',
            border:`1px solid ${active ? 'rgba(0,229,204,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: active ? TEAL : 'rgba(255,255,255,0.45)',
            transition:'all 0.2s', whiteSpace:'nowrap',
          }}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
