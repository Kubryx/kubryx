'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  meshTemplates,
  type AgentType,
} from '../../../lib/trustmesh-fallbacks'
import { deployJob } from '../../../lib/trustmesh-api'
import { loadWallet } from '../../../lib/wallet-utils'
import { toast } from '../../../lib/toast'
import LiveBadge from '../_components/LiveBadge'
import DecisionTreeSVG from '../_components/DecisionTreeSVG'

type WizardAgent = { role: string; subName: string; type: AgentType }

const AGENT_TYPES: AgentType[] = [
  'planner',
  'executor',
  'analyzer',
  'trader',
  'confirmer',
]

const STEPS = ['Configure', 'Identities', 'Review'] as const
type Step = (typeof STEPS)[number]

const ROLE_LABEL: Record<AgentType, string> = {
  planner: 'LEAD PLANNER',
  executor: 'EXECUTOR',
  analyzer: 'ANALYZER',
  trader: 'TRADER',
  confirmer: 'CONFIRMER',
}

export default function DeployPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('Configure')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState(0.25)
  const [templateId, setTemplateId] = useState<string>('portfolio_rebalancer')
  const [wallet, setWallet] = useState<string>('')
  const [agents, setAgents] = useState<WizardAgent[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setWallet(loadWallet('solana') || '')
  }, [])

  // Seed agent identities from the selected template
  useEffect(() => {
    const tpl = meshTemplates.find((t) => t.id === templateId)
    if (!tpl) return
    setAgents(
      tpl.roles.map((role) => ({
        role,
        subName: role,
        type: role,
      })),
    )
  }, [templateId])

  const stepIndex = STEPS.indexOf(step)

  const baseSol = wallet ? wallet.slice(0, 4).toLowerCase() : 'yourwallet'
  const previewName = (a: WizardAgent) =>
    `${a.subName || a.role}.${baseSol}.sol`

  const treePreview = useMemo(() => {
    const planner = agents.find((a) => a.type === 'planner')
    const others = agents.filter((a) => a.type !== 'planner')
    return {
      role: 'HUMAN INTENT',
      name: wallet ? wallet.slice(0, 6) + '…' : 'connect wallet',
      status: 'running' as const,
      message: description || 'Describe the coordination objective',
      children: planner
        ? [
            {
              role: ROLE_LABEL[planner.type],
              name: previewName(planner),
              status: 'idle' as const,
              message: 'Awaiting deployment',
              children: others.map((a) => ({
                role: ROLE_LABEL[a.type],
                name: previewName(a),
                status: 'idle' as const,
                message: 'Awaiting deployment',
              })),
            },
          ]
        : others.map((a) => ({
            role: ROLE_LABEL[a.type],
            name: previewName(a),
            status: 'idle' as const,
            message: 'Awaiting deployment',
          })),
    }
  }, [agents, description, wallet])

  const totalCost = useMemo(() => {
    const rent = 0.002 * agents.length
    const registration = 0.001 * agents.length
    const buffer = budget
    return { rent, registration, buffer, total: rent + registration + buffer }
  }, [agents, budget])

  function canAdvanceFromConfigure() {
    return description.trim().length >= 8 && budget > 0
  }
  function canAdvanceFromIdentities() {
    return agents.length > 0 && agents.every((a) => a.subName.trim().length > 0)
  }

  function addAgent() {
    setAgents((cur) => [
      ...cur,
      { role: 'agent', subName: 'agent' + (cur.length + 1), type: 'analyzer' },
    ])
  }
  function removeAgent(i: number) {
    setAgents((cur) => cur.filter((_, idx) => idx !== i))
  }
  function updateAgent(i: number, patch: Partial<WizardAgent>) {
    setAgents((cur) => cur.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))
  }

  async function deploy() {
    try {
      setSubmitting(true)
      const payload = {
        description,
        budget,
        walletAddress: wallet || 'demo_wallet',
        agents: agents.map((a) => ({
          role: a.role,
          name: previewName(a),
          type: a.type,
        })),
      }
      const res = await deployJob(payload)
      if (!res.isLive) {
        toast.success('Demo deploy — TrustMesh API unreachable, mock job created')
      } else {
        toast.success('Mesh deployment submitted')
      }
      setTimeout(() => router.push(`/agents/jobs/${res.data.jobId}`), 600)
    } catch (e) {
      toast.error('Deployment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <section
        className="dashboard-hero"
        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <p className="eyebrow">TrustMesh · Deploy</p>
          <h1>Spin up an agent mesh</h1>
          <p className="silver-text">
            Three steps from intent to verified on-chain coordination.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <LiveBadge isLive={false} />
            {wallet ? (
              <span style={{ fontSize: 11, color: '#bbb' }}>
                Wallet: {wallet.slice(0, 6)}…{wallet.slice(-4)}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: '#F59E0B' }}>
                No wallet connected — will deploy in demo mode
              </span>
            )}
          </div>
        </div>
      </section>

      {/* progress bar */}
      <section className="card">
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background:
                  i <= stepIndex ? '#F5C518' : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#bbb' }}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              style={{ color: i === stepIndex ? '#F5C518' : '#bbb' }}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </section>

      <section
        className="dashboard-grid"
        style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}
      >
        <div className="card">
          {step === 'Configure' && (
            <>
              <h2 style={{ marginTop: 0 }}>Configure deployment</h2>
              <label>Job description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the coordination objective. e.g. Rebalance SOL/USDC portfolio to 60/40 daily."
                rows={3}
              />
              <label style={{ marginTop: 16 }}>Mesh template</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {meshTemplates.map((t) => {
                  const active = t.id === templateId
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      style={{
                        textAlign: 'left',
                        padding: 12,
                        borderRadius: 10,
                        border: active
                          ? '1px solid #F5C518'
                          : '1px solid rgba(255,255,255,0.1)',
                        background: active
                          ? 'rgba(245,197,24,0.06)'
                          : 'rgba(255,255,255,0.02)',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: active ? '#F5C518' : '#fff',
                          fontWeight: 600,
                        }}
                      >
                        {t.name}
                      </p>
                      <p className="silver-text" style={{ margin: '6px 0', fontSize: 11 }}>
                        {t.description}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: '#bbb' }}>
                        {t.roles.join(' · ')}
                      </p>
                    </button>
                  )
                })}
              </div>
              <label>Budget in SOL</label>
              <input
                type="number"
                value={budget}
                step={0.05}
                min={0.05}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 24,
                }}
              >
                <button
                  type="button"
                  className="btn-gold"
                  disabled={!canAdvanceFromConfigure()}
                  onClick={() => setStep('Identities')}
                >
                  Next step →
                </button>
              </div>
            </>
          )}

          {step === 'Identities' && (
            <>
              <h2 style={{ marginTop: 0 }}>Identities</h2>
              <p className="silver-text" style={{ marginTop: 0 }}>
                Each agent registers a deterministic SNS sub-name under your wallet.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agents.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr auto',
                      gap: 8,
                      alignItems: 'center',
                      padding: 10,
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>Role</p>
                      <input
                        value={a.role}
                        onChange={(e) => updateAgent(i, { role: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>Sub-name</p>
                      <input
                        value={a.subName}
                        onChange={(e) => updateAgent(i, { subName: e.target.value })}
                        style={{ width: '100%' }}
                      />
                      <p style={{ fontSize: 10, color: '#F5C518', margin: '4px 0 0', fontFamily: 'monospace' }}>
                        {previewName(a)}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>Type</p>
                      <select
                        value={a.type}
                        onChange={(e) => updateAgent(i, { type: e.target.value as AgentType })}
                        style={{ width: '100%' }}
                      >
                        {AGENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAgent(i)}
                      title="Remove"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#F87171',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAgent}
                  className="btn-outline"
                  style={{ alignSelf: 'flex-start' }}
                >
                  + Add agent
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginTop: 24,
                }}
              >
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep('Configure')}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn-gold"
                  disabled={!canAdvanceFromIdentities()}
                  onClick={() => setStep('Review')}
                >
                  Review →
                </button>
              </div>
            </>
          )}

          {step === 'Review' && (
            <>
              <h2 style={{ marginTop: 0 }}>Review and deploy</h2>
              <div className="mini-card" style={{ marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>Description</p>
                <p style={{ margin: '4px 0 0' }}>{description}</p>
              </div>
              <div className="mini-card" style={{ marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>Agents ({agents.length})</p>
                <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, fontFamily: 'monospace' }}>
                  {agents.map((a, i) => (
                    <li key={i}>
                      <span style={{ color: '#F5C518' }}>{previewName(a)}</span>
                      <span style={{ color: '#bbb', marginLeft: 6 }}>· {a.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mini-card" style={{ marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>Cost estimate</p>
                <table style={{ width: '100%', marginTop: 6, fontSize: 12 }}>
                  <tbody>
                    <tr>
                      <td>Rent</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{totalCost.rent.toFixed(4)} SOL</td>
                    </tr>
                    <tr>
                      <td>Registration</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{totalCost.registration.toFixed(4)} SOL</td>
                    </tr>
                    <tr>
                      <td>Operating buffer</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{totalCost.buffer.toFixed(4)} SOL</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td style={{ fontWeight: 600 }}>Total</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#F5C518', fontWeight: 600 }}>
                        {totalCost.total.toFixed(4)} SOL
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginTop: 24,
                }}
              >
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep('Identities')}
                >
                  ← Back to identities
                </button>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={deploy}
                  disabled={submitting}
                >
                  {submitting ? 'Deploying…' : 'Deploy'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Agent tree preview</h2>
            <span
              style={{
                fontSize: 11,
                color:
                  canAdvanceFromIdentities() && canAdvanceFromConfigure()
                    ? '#22C55E'
                    : '#F59E0B',
              }}
            >
              {canAdvanceFromIdentities() && canAdvanceFromConfigure()
                ? 'Ready to deploy'
                : 'Incomplete'}
            </span>
          </div>
          <p className="silver-text" style={{ fontSize: 11, marginTop: 4 }}>
            Updates as you configure. Names locked at deploy.
          </p>
          <div style={{ marginTop: 12 }}>
            <DecisionTreeSVG root={treePreview} />
          </div>
        </div>
      </section>
    </main>
  )
}
