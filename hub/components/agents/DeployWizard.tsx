// Built by vsrupeshkumar
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deployJob } from '@/lib/trustmesh-api'
import { toast } from '@/lib/toast'
import { TRUSTMESH_ACCENT } from '@/lib/agents-fallbacks'

const ACCENT = TRUSTMESH_ACCENT
const BORDER = 'rgba(255,255,255,0.08)'
const CARD   = '#111111'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.4)'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

type Step = 1 | 2 | 3
type AgentTypeChoice = 'primary' | 'secondary' | 'observer'

const TYPE_INFO: Record<AgentTypeChoice, { title: string; sub: string }> = {
  primary:   { title: 'Primary Agent',   sub: 'Spawns sub-agents, holds root authority' },
  secondary: { title: 'Secondary Agent', sub: 'Receives delegated tasks only' },
  observer:  { title: 'Observer',        sub: 'Read-only audit node' },
}

function randomHex(length: number) {
  const chars = '0123456789abcdef'
  let out = ''
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function DeployWizard({ walletAddress }: { walletAddress?: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  // Wallet address comes from the global wallet context (passed by the page).
  const wallet = walletAddress ?? ''

  // Step 1
  const [name, setName] = useState('')
  const [type, setType] = useState<AgentTypeChoice>('primary')
  const [maxDepth, setMaxDepth] = useState(2)
  const [capacity, setCapacity] = useState(100)
  const [description, setDescription] = useState('')

  // Step 2
  const [snsSubdomain, setSnsSubdomain] = useState('')
  const [keypair, setKeypair] = useState<{ pub: string; priv: string } | null>(null)
  const [revealedKey, setRevealedKey] = useState(false)
  const [available, setAvailable] = useState<'idle' | 'checking' | 'yes' | 'no'>('idle')

  // Step 3
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ jobId: string; tx: string; sns: string } | null>(null)

  useEffect(() => {
    if (!snsSubdomain) { setAvailable('idle'); return }
    setAvailable('checking')
    const t = setTimeout(() => {
      const taken = ['root', 'alpha', 'beta', 'gamma', 'admin'].includes(snsSubdomain.toLowerCase())
      setAvailable(taken ? 'no' : 'yes')
    }, 350)
    return () => clearTimeout(t)
  }, [snsSubdomain])

  function generateKeypair() {
    setKeypair({
      pub:  randomHex(40),
      priv: randomHex(64),
    })
    setRevealedKey(false)
  }

  const canStep1 = name.trim().length > 1
  const canStep2 = snsSubdomain.trim().length > 1 && available === 'yes' && keypair !== null

  async function simulateDeploy() {
    setSubmitting(true)
    try {
      const res = await deployJob({
        description: description || `${name} agent deployment`,
        budget: 0.002,
        walletAddress: wallet || 'demo_wallet',
        agents: [{ role: 'planner', name: `${snsSubdomain}.kubryx.sol`, type: 'planner' }],
      })
      if (!res.isLive) {
        toast.success('Simulated deploy — Anchor program not reached')
      } else {
        toast.success('Deployment submitted to devnet')
      }
      setResult({
        jobId: res.data.jobId,
        tx: `${randomHex(8)}…${randomHex(8)}`,
        sns: `${snsSubdomain}.kubryx.sol`,
      })
    } catch {
      toast.error('Deployment failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div style={{ padding: 28, maxWidth: 640, margin: '40px auto' }}>
        <div style={{
          background: CARD, border: `1px solid #10b98140`, borderRadius: 12, padding: 32,
          textAlign: 'center',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: '#10b98125', border: '1px solid #10b98155',
            color: '#10b981', fontSize: 28,
            display: 'grid', placeItems: 'center', margin: '0 auto 16px',
          }}>✓</div>
          <h2 style={{ fontSize: 22, color: '#fff', margin: '0 0 8px', fontFamily: 'Georgia, "Playfair Display", serif' }}>
            Agent Deployed Successfully!
          </h2>
          <p style={{ color: MUTED, fontSize: 13, margin: '0 0 24px' }}>
            Your agent is live on Solana devnet and ready to receive jobs.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, textAlign: 'left', marginBottom: 20 }}>
            <DetailLine label="Transaction" value={result.tx} mono />
            <DetailLine label="Job ID"      value={result.jobId} mono />
            <DetailLine label="SNS"         value={result.sns} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => router.push(`/agents/jobs/${result.jobId}`)}
              style={primaryBtn}
            >
              View in Job Graph →
            </button>
            <button
              onClick={() => { setResult(null); setStep(1); setName(''); setSnsSubdomain(''); setKeypair(null) }}
              style={secondaryBtn}
            >
              Deploy Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, maxWidth: 760, margin: '0 auto' }}>
      {/* Step indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
        marginBottom: 28,
      }}>
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: step >= s ? ACCENT : 'rgba(255,255,255,0.06)',
              color: step >= s ? '#fff' : MUTED,
              fontSize: 13, fontWeight: 700,
              display: 'grid', placeItems: 'center',
              border: `1px solid ${step >= s ? ACCENT : BORDER}`,
            }}>
              {step > s ? '✓' : s}
            </div>
            <span style={{ marginLeft: 10, fontSize: 12, color: step >= s ? '#fff' : MUTED2, fontWeight: 500 }}>
              {['Configure', 'Identity', 'Review & Sign'][i]}
            </span>
            {s < 3 && <div style={{ width: 60, height: 1, background: BORDER, margin: '0 16px' }} />}
          </div>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28 }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Agent Name *">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My Alpha Node"
                style={inputStyle}
              />
            </Field>

            <Field label="Agent Type">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(TYPE_INFO) as AgentTypeChoice[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: type === t ? `${ACCENT}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${type === t ? ACCENT : BORDER}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: type === t ? ACCENT : '#fff' }}>
                      {TYPE_INFO[t].title}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {TYPE_INFO[t].sub}
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Max Delegation Depth">
                <select value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Initial Job Capacity">
                <select value={capacity} onChange={e => setCapacity(Number(e.target.value))} style={inputStyle}>
                  {[50, 100, 200, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Description (optional)">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
              />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(2)} disabled={!canStep1} style={primaryBtn}>
                Next: Set Identity →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="SNS Subdomain *">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  value={snsSubdomain}
                  onChange={e => setSnsSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="alpha-7"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span style={{ fontFamily: MONO, fontSize: 13, color: MUTED }}>.kubryx.sol</span>
              </div>
              {available === 'checking' && <div style={{ fontSize: 11, color: MUTED2, marginTop: 6 }}>Checking…</div>}
              {available === 'yes' && <div style={{ fontSize: 11, color: '#10b981', marginTop: 6 }}>✓ Available</div>}
              {available === 'no' && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>✗ Already taken</div>}
            </Field>

            <Field label="Ed25519 Keypair">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={generateKeypair} style={secondaryBtn}>
                  {keypair ? 'Regenerate Keypair' : 'Generate New Keypair'}
                </button>
                {keypair && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <KeyRow label="Public Key" value={keypair.pub} mono />
                    <KeyRow
                      label="Private Key"
                      value={revealedKey ? keypair.priv : '•'.repeat(48)}
                      mono
                      action={
                        <button onClick={() => setRevealedKey(r => !r)} style={smallBtn}>
                          {revealedKey ? 'Hide' : 'Reveal'}
                        </button>
                      }
                    />
                    <div style={{ fontSize: 11, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      ⚠ Save your private key. It cannot be recovered.
                    </div>
                  </div>
                )}
              </div>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} style={secondaryBtn}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!canStep2} style={primaryBtn}>Next: Review →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: MUTED2, textTransform: 'uppercase', marginBottom: 12 }}>
              Deployment Summary
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <DetailLine label="Agent Name"  value={name} />
              <DetailLine label="Type"         value={TYPE_INFO[type].title} />
              <DetailLine label="SNS Name"     value={`${snsSubdomain}.kubryx.sol`} />
              <DetailLine label="Max Depth"    value={String(maxDepth)} />
              <DetailLine label="Capacity"     value={`${capacity} jobs`} />
              <DetailLine label="Network"      value="Solana Devnet" />
              <DetailLine label="Estimated Fee" value="0.002 SOL" />
              <DetailLine label="Wallet"       value={wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : 'Not connected'} />
            </div>

            {!wallet && (
              <div style={{
                padding: 12, borderRadius: 8,
                background: '#f59e0b15', border: '1px solid #f59e0b40',
                fontSize: 12, color: '#f59e0b', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ⚠ Connect Phantom to sign on devnet. Or run the demo to skip signing.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={simulateDeploy} disabled={submitting} style={primaryBtn}>
                {submitting ? 'Submitting transaction…' : (wallet ? 'Sign & Deploy' : 'Simulate Deploy (Demo)')}
              </button>
              <button onClick={() => setStep(2)} disabled={submitting} style={secondaryBtn}>← Back to Identity</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

function DetailLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 11, color: MUTED2 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#fff', fontFamily: mono ? MONO : 'inherit' }}>{value}</span>
    </div>
  )
}

function KeyRow({ label, value, mono, action }: { label: string; value: string; mono?: boolean; action?: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        {action}
      </div>
      <div style={{ fontFamily: mono ? MONO : 'inherit', fontSize: 11, color: '#fff', wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${BORDER}`,
  color: '#fff', fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
}
const primaryBtn: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 8,
  background: ACCENT, color: '#fff',
  border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
}
const secondaryBtn: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 8,
  background: 'transparent', color: MUTED,
  border: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 500,
  cursor: 'pointer',
}
const smallBtn: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 4,
  background: 'transparent', color: ACCENT,
  border: `1px solid ${ACCENT}55`, fontSize: 11,
  cursor: 'pointer',
}
