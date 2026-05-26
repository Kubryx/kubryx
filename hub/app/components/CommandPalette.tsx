// Built by vsrupeshkumar
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCrossToolIntelligence, updateIntelligenceState } from '../../lib/cross-tool-intelligence'
import { clearTelemetryErrors } from '../../lib/telemetry'
import { toast } from '../../lib/toast'
import {
  triggerCoalitionInstability,
  simulateGovernanceDeadlock,
  initiateSovereignNegotiation,
  replayDiplomaticCrisis,
  stabilizeInstitutionalTrust,
  restoreCoalitionEquilibrium
} from '../../lib/civilization-orchestration-engine'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  category: 'Navigation' | 'Actions' | 'Wallets' | 'Telemetry'
  action: () => void
}

export default function CommandPalette() {
  const router = useRouter()
  const { demoActive } = useCrossToolIntelligence()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const commands: CommandItem[] = [
    { id: 'nav-executive', title: 'Open Sovereign Executive Command', subtitle: 'Highest-level command interface, global indicators, threat matrices & snap restores', category: 'Navigation', action: () => router.push('/executive') },
    { id: 'nav-governance', title: 'Open Protocol Governance Center', subtitle: 'Submit KIP proposals, cast votes, and trace ZK policy quorums', category: 'Navigation', action: () => router.push('/governance') },
    { id: 'nav-policies', title: 'Open Infrastructure Policy Registry', subtitle: 'Review boundary guardrails, telemetry escalations & conflict tracks', category: 'Navigation', action: () => router.push('/policies') },
    { id: 'nav-coordination', title: 'Open Protocol Coordination Layer', subtitle: 'Cross-chain operational synchronization, mesh topologies & event traces', category: 'Navigation', action: () => router.push('/coordination') },
    { id: 'nav-operations', title: 'Open Executive Operations Mission Control', subtitle: 'Global risk scores, incident traces & AI recommendations', category: 'Navigation', action: () => router.push('/operations') },
    { id: 'nav-protocols', title: 'Open Protocol Control Center', subtitle: 'Coordinate QIE, Solana, Stellar & Arbitrum sync environments', category: 'Navigation', action: () => router.push('/protocols') },
    { id: 'nav-dash', title: 'Open Dashboard Command Center', subtitle: 'View system health & stats', category: 'Navigation', action: () => router.push('/dashboard') },
    { id: 'nav-integrations', title: 'Open Ecosystem Integration Hub', subtitle: 'View connected chains, wallets & AI metadata', category: 'Navigation', action: () => router.push('/integrations') },
    { id: 'nav-analytics', title: 'Open Advanced Analytics Lab', subtitle: 'Rolling chain TPS & latency trends', category: 'Navigation', action: () => router.push('/analytics') },
    { id: 'nav-performance', title: 'Open System Performance Center', subtitle: 'Uptime SLA, heap size & route loading speeds', category: 'Navigation', action: () => router.push('/performance') },
    { id: 'nav-architecture', title: 'Open Architecture View', subtitle: 'Interactive SVG system topology model', category: 'Navigation', action: () => router.push('/architecture') },
    { id: 'nav-developers', title: 'Open Developer Console', subtitle: 'Interactive REST API & SDK explorer', category: 'Navigation', action: () => router.push('/developers') },
    { id: 'nav-ecosystem', title: 'Open Developer Ecosystem Portal', subtitle: 'Simulate webhooks, payloads, event schemes & REST models', category: 'Navigation', action: () => router.push('/ecosystem') },
    { id: 'nav-security', title: 'Open Security Command Center', subtitle: 'Simulate anomalies & verify trusted signing keys', category: 'Navigation', action: () => router.push('/security') },
    { id: 'nav-story', title: 'Open Executive Storytelling Mode', subtitle: 'Immersive slide presentation for accelerators', category: 'Navigation', action: () => router.push('/story') },
    { id: 'nav-credit', title: 'Open Credit Passport Score', subtitle: 'View soulbound NFT & NCRD APYs', category: 'Navigation', action: () => router.push('/credit') },
    { id: 'nav-lend', title: 'Open AI Lending Desk', subtitle: 'Negotiate interest rates statefully', category: 'Navigation', action: () => router.push('/lend') },
    { id: 'nav-split', title: 'Open Bill Split payments', subtitle: 'Stellar Soroban multi-party splits', category: 'Navigation', action: () => router.push('/split') },
    { id: 'nav-agents', title: 'Open Solana Agent Coordinator', subtitle: 'Deploy & delegate autonomous workers', category: 'Navigation', action: () => router.push('/agents') },
    { id: 'nav-Yield Operations Hub', title: 'Open Yield Operations Hub Manager', subtitle: 'Payroll streaming & governance', category: 'Navigation', action: () => router.push('/treasury') },
    { id: 'nav-shadow', title: 'Open Stealth Execution Suite Console', subtitle: 'Command 7 corporate AI departments', category: 'Navigation', action: () => router.push('/shadow') },
    { id: 'nav-vault', title: 'Open Private Vault Secure Trades', subtitle: 'Zero-metadata secure bridge trades', category: 'Navigation', action: () => router.push('/vault') },
    { id: 'nav-legacy', title: 'Open Family Vault Inheritance', subtitle: 'Self-claiming secure heir lockers', category: 'Navigation', action: () => router.push('/legacy') },

    {
      id: 'act-demo',
      title: 'Launch Executive Presentation Mode',
      subtitle: 'Start guided showcase for judges & investors',
      category: 'Actions',
      action: () => {
        updateIntelligenceState(() => ({ demoActive: true, demoStep: 0 }))
        router.push('/dashboard')
        toast.success('Executive Showcase Started')
      }
    },
    {
      id: 'act-suspicious',
      title: 'Flag Suspicious Wallet Activity',
      subtitle: 'Simulate private key threat for security demo',
      category: 'Actions',
      action: () => {
        updateIntelligenceState((prev) => ({ memory: { ...prev.memory, suspiciousActivityFlag: true } }))
        toast.warning('Threat simulation triggered. Inspect recommendations.')
      }
    },
    {
      id: 'act-clear-suspicious',
      title: 'Resolve Security Alerts',
      subtitle: 'Reset wallet key signatures and clear warnings',
      category: 'Actions',
      action: () => {
        updateIntelligenceState((prev) => ({ memory: { ...prev.memory, suspiciousActivityFlag: false } }))
        toast.success('System environment secured')
      }
    },

    {
      id: 'tel-console',
      title: 'Open System Telemetry Console',
      subtitle: 'Scroll to developer logs on Dashboard',
      category: 'Telemetry',
      action: () => {
        router.push('/dashboard')
        setTimeout(() => {
          const el = document.getElementById('telemetry-console-section')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    },
    {
      id: 'tel-clear',
      title: 'Purge Developer Telemetry Logs',
      subtitle: 'Flush localStorage trace registries',
      category: 'Telemetry',
      action: () => {
        clearTelemetryErrors()
        toast.success('Diagnostics telemetry wiped clean')
      }
    },
    {
      id: 'strat-fail',
      title: 'Simulate Strategic Failure Cascade',
      subtitle: 'Simulate a multi-region outage and degrade quorums statefully',
      category: 'Actions',
      action: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('kubryx_global_ops_layer')
          const state = saved ? JSON.parse(saved) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
          state.consensusIndex = 40.0
          state.regionalOutages = ['Singapore (ap-southeast-1)', 'Frankfurt (eu-central-1)']
          const newEvt = {
            id: `evt-${Date.now()}`,
            type: 'kubryx_region_outage',
            payload: JSON.stringify({ active: true, degradedRegions: state.regionalOutages }),
            description: 'Strategic Simulation: degradation triggered by Command Palette.',
            timestamp: new Date().toISOString()
          }
          state.events = [newEvt, ...(state.events || [])]
          localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(state))
          window.dispatchEvent(new Event('kubryx_global_ops_update'))
          window.dispatchEvent(new Event('kubryx_fabric_update'))
          toast.error('Strategic failover simulation started: 2 regions offline!')
        }
      }
    },
    {
      id: 'strat-mitigate',
      title: 'Trigger Mitigation Cascade',
      subtitle: 'Execute state-healing quorums and recover parameters',
      category: 'Actions',
      action: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('kubryx_global_ops_layer')
          const state = saved ? JSON.parse(saved) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
          state.consensusIndex = 98.2
          state.regionalOutages = []
          const newEvt = {
            id: `evt-${Date.now()}`,
            type: 'kubryx_recovery_trigger',
            payload: JSON.stringify({ resolved: true }),
            description: 'Strategic Mitigation: sovereign restoration consensus sweep successful.',
            timestamp: new Date().toISOString()
          }
          state.events = [newEvt, ...(state.events || [])]
          localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(state))
          window.dispatchEvent(new Event('kubryx_global_ops_update'))
          window.dispatchEvent(new Event('kubryx_fabric_update'))
          toast.success('Self-healing quorums deployed. Operational balance restored.')
        }
      }
    },
    {
      id: 'strat-collapse',
      title: 'Forecast Consensus Collapse',
      subtitle: 'Set consensus to 12% temporarily to audit decay risk paths',
      category: 'Actions',
      action: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('kubryx_global_ops_layer')
          const state = saved ? JSON.parse(saved) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
          state.consensusIndex = 12.0
          const newEvt = {
            id: `evt-${Date.now()}`,
            type: 'kubryx_policy_update',
            payload: JSON.stringify({ alert: 'quorums_offline' }),
            description: 'Entropy Alarm: predicted consensus decay path triggered.',
            timestamp: new Date().toISOString()
          }
          state.events = [newEvt, ...(state.events || [])]
          localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(state))
          window.dispatchEvent(new Event('kubryx_global_ops_update'))
          toast.warning('Consensus collapse forecasted! Multi-sig quorum at 12%!')
        }
      }
    },
    {
      id: 'strat-crisis',
      title: 'Replay Governance Crisis',
      subtitle: 'Dispatch parallel high-pressure proposal votes statefully',
      category: 'Actions',
      action: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('kubryx_global_ops_layer')
          const state = saved ? JSON.parse(saved) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
          const newEvt = {
            id: `evt-${Date.now()}`,
            type: 'kubryx_governance_vote',
            payload: JSON.stringify({ conflict: true }),
            description: 'Crisis Replay: high-pressure voting sweep initiated on KIP.',
            timestamp: new Date().toISOString()
          }
          state.events = [newEvt, ...(state.events || [])]
          localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(state))
          window.dispatchEvent(new Event('kubryx_global_ops_update'))
          toast.warning('Governance crisis replayed statefully!')
        }
      }
    },
    {
      id: 'strat-stabilize',
      title: 'Stabilize Yield Operations Hub Confidence',
      subtitle: 'Deploy APY sweep sweepers to balance cashflows',
      category: 'Actions',
      action: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('kubryx_global_ops_layer')
          const state = saved ? JSON.parse(saved) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
          const newEvt = {
            id: `evt-${Date.now()}`,
            type: 'kubryx_treasury_shift',
            payload: JSON.stringify({ balanced: true }),
            description: 'Yield Operations Hub Balanced: stabilization APY sweep dispatched.',
            timestamp: new Date().toISOString()
          }
          state.events = [newEvt, ...(state.events || [])]
          localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(state))
          window.dispatchEvent(new Event('kubryx_global_ops_update'))
          toast.success('Yield Operations Hub rebalancing sweep dispatched!')
        }
      }
    },
    {
      id: 'strat-equilibrium',
      title: 'Restore Operational Equilibrium',
      subtitle: 'Re-align global matrices back to 98.2% baseline consensus',
      category: 'Actions',
      action: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('kubryx_global_ops_layer')
          const state = saved ? JSON.parse(saved) : { consensusIndex: 98.2, regionalOutages: [], events: [] }
          state.consensusIndex = 98.2
          state.regionalOutages = []
          const newEvt = {
            id: `evt-${Date.now()}`,
            type: 'kubryx_protocol_sync',
            payload: JSON.stringify({ sync: true }),
            description: 'Equilibrium Secured: system state synced statefully.',
            timestamp: new Date().toISOString()
          }
          state.events = [newEvt, ...(state.events || [])]
          localStorage.setItem('kubryx_global_ops_layer', JSON.stringify(state))
          window.dispatchEvent(new Event('kubryx_global_ops_update'))
          window.dispatchEvent(new Event('kubryx_fabric_update'))
          toast.success('Global operational equilibrium successfully secured!')
        }
      }
    },
    {
      id: 'civ-instability',
      title: 'trigger coalition instability',
      subtitle: 'Simulate a diplomatic dispute that degrades the coalition stability rate',
      category: 'Actions',
      action: () => {
        triggerCoalitionInstability()
      }
    },
    {
      id: 'civ-deadlock',
      title: 'simulate governance deadlock',
      subtitle: 'Veto automated APY sweeps to trigger legislative deadlocks',
      category: 'Actions',
      action: () => {
        simulateGovernanceDeadlock()
      }
    },
    {
      id: 'civ-negotiate',
      title: 'initiate sovereign negotiation',
      subtitle: 'Dispatch a pending proposal to optimize NCRD staking yields',
      category: 'Actions',
      action: () => {
        initiateSovereignNegotiation()
      }
    },
    {
      id: 'civ-crisis',
      title: 'replay diplomatic crisis',
      subtitle: 'Degrade inter-agent trust parameters statefully to replay a crisis',
      category: 'Actions',
      action: () => {
        replayDiplomaticCrisis()
      }
    },
    {
      id: 'civ-stabilize',
      title: 'stabilize institutional trust',
      subtitle: 'Realign all disputed agents and restore nominal diplomatic scores',
      category: 'Actions',
      action: () => {
        stabilizeInstitutionalTrust()
      }
    },
    {
      id: 'civ-equilibrium',
      title: 'restore coalition equilibrium',
      subtitle: 'Re-sync all autonomous agents back to nominal baseline equilibrium',
      category: 'Actions',
      action: () => {
        restoreCoalitionEquilibrium()
      }
    }
  ]

  // Filter commands by search match
  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        setSearch('')
        setActiveIndex(0)
      }

      if (!isOpen) return

      // Handle Key Navigation
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[activeIndex]) {
          filtered[activeIndex].action()
          setIsOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, activeIndex])

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: 20, right: 140, zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-outline"
          aria-label="Open Command Palette"
          style={{
            padding: '8px 14px',
            fontSize: 12,
            background: '#070707',
            borderColor: 'rgba(245, 197, 24, 0.4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>⌘</span> Search OS <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>Ctrl+K</kbd>
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        boxSizing: 'border-box'
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '90%',
          maxWidth: 550,
          background: '#0a0a0a',
          border: '1px solid rgba(245, 197, 24, 0.45)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 0 15px rgba(245, 197, 24, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 18, marginRight: 10, color: 'rgba(255,255,255,0.4)' }}>🔍</span>
          <input
            autoFocus
            type="text"
            placeholder="Search commands, navigate tools, simulate actions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0) }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 15,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12 }}
            aria-label="Close command search"
          >
            [Esc]
          </button>
        </div>

        {/* Option Items List */}
        <div style={{ maxHeight: 350, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#666', padding: '24px 0', margin: 0 }}>No matching commands found.</p>
          ) : (
            filtered.map((cmd, index) => {
              const isSelected = index === activeIndex
              return (
                <div
                  key={cmd.id}
                  onClick={() => { cmd.action(); setIsOpen(false) }}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isSelected ? 'rgba(245, 197, 24, 0.1)' : 'transparent',
                    border: isSelected ? '1px solid rgba(245, 197, 24, 0.35)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div>
                    <h5 style={{ margin: 0, fontSize: 13, color: isSelected ? '#F5C518' : '#fff', fontWeight: 600 }}>{cmd.title}</h5>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: isSelected ? '#fff' : '#888', opacity: 0.8 }}>{cmd.subtitle}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      background: 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#F5C518' : '#aaa',
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 700
                    }}
                  >
                    {cmd.category}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{ padding: '8px 16px', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 14, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          <span>⌨ <kbd>↑↓</kbd> to navigate</span>
          <span>⏎ to execute</span>
          <span><kbd>Esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  )
}
