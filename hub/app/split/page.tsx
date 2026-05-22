'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { toast } from '../../lib/toast'
import { getExplorerUrl } from '../../lib/explorer'
import { useWalletForTool } from '../../hooks/useWalletForTool'
import { ConnectButton } from '../../components/wallet/ConnectButton'

type SplitRecord = {
  id: string
  amount: number
  participants: string[]
  paid: string[]
  createdAt: string
}

// 4 Initial Settled Demo Bills for the timeline
const INITIAL_SETTLED_BILLS = [
  {
    id: 'settled-1',
    name: 'Gourmet Goa Feast',
    date: 'May 18, 2026',
    amount: '180.00 USDC',
    participants: 6,
    txHash: 'SCXK7FEAST8A2B',
  },
  {
    id: 'settled-2',
    name: 'Weekend Resort Stay',
    date: 'May 12, 2026',
    amount: '450.00 USDC',
    participants: 4,
    txHash: 'SCXK2RESORT8A2B',
  },
  {
    id: 'settled-3',
    name: 'Concert Tickets',
    date: 'May 05, 2026',
    amount: '120.00 USDC',
    participants: 3,
    txHash: 'SCXK9TICKET8A2B',
  },
  {
    id: 'settled-4',
    name: 'Co-working Office Desks',
    date: 'Apr 28, 2026',
    amount: '300.00 USDC',
    participants: 5,
    txHash: 'SCXK4COWORK8A2B',
  }
]

function SectionDivider({ bg = '#FFF0F7' }: { bg?: string }) {
  return (
    <div className="section-divider">
      <div className="divider-line" />
      <div className="divider-star-container" style={{ backgroundColor: bg }}>
        <span className="divider-star">✦</span>
      </div>
    </div>
  )
}

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  
  useEffect(() => {
    const duration = 1200
    const startTime = performance.now()
    
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress * (2 - progress)
      setVal(Math.floor(ease * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setVal(end)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end])
  
  return <span>{val.toLocaleString()}{suffix}</span>
}

function CountUpDecimal({ end, decimals = 1, prefix = '', suffix = '' }: { end: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  
  useEffect(() => {
    const duration = 1200
    const startTime = performance.now()
    
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress * (2 - progress)
      setVal(ease * end)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setVal(end)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end])
  
  return <span>{prefix}{val.toFixed(decimals)}{suffix}</span>
}

export default function SyncSplitPage() {
  // Wallet state now comes from the global wallet context (EVM / QIE Mainnet).
  const { address, isConnected } = useWalletForTool()
  const wallet = address ?? ''
  const [mounted, setMounted] = useState(false)

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorTrail, setCursorTrail] = useState({ x: -100, y: -100 })

  // Form States
  const [billName, setBillName] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('USDC')
  const [participantInput, setParticipantInput] = useState('')
  const [participants, setParticipants] = useState<string[]>([])

  // Submit Simulation States
  const [submitState, setSubmitState] = useState<'idle' | 'creating' | 'anchoring' | 'success'>('idle')
  const [progress, setProgress] = useState(0)
  const [createdBill, setCreatedBill] = useState<{ name: string, total: string, currency: string, splitsCount: number, contract: string, link: string } | null>(null)

  // List of active bills
  const [splits, setSplits] = useState<SplitRecord[]>([
    {
      id: 'split-1',
      amount: 340.00,
      participants: [
        'GB5WSTELLAR7PLITSPLITPASSPOKEDEMOMODEACTIVE', // You ✦
        'GA6WSTEL222222222222222222222222222222222222',
        'GD7WSTEL333333333333333333333333333333333333',
        'GC4WSTEL444444444444444444444444444444444444'
      ],
      paid: [
        'GB5WSTELLAR7PLITSPLITPASSPOKEDEMOMODEACTIVE',
        'GA6WSTEL222222222222222222222222222222222222',
        'GD7WSTEL333333333333333333333333333333333333'
      ],
      createdAt: '2026-05-15T12:00:00Z'
    },
    {
      id: 'split-2',
      amount: 120.00,
      participants: [
        'GB5WSTELLAR7PLITSPLITPASSPOKEDEMOMODEACTIVE',
        'GA6WSTEL222222222222222222222222222222222222',
        'GD7WSTEL333333333333333333333333333333333333',
        'GC4WSTEL444444444444444444444444444444444444'
      ],
      paid: [
        'GB5WSTELLAR7PLITSPLITPASSPOKEDEMOMODEACTIVE',
        'GA6WSTEL222222222222222222222222222222222222',
        'GD7WSTEL333333333333333333333333333333333333',
        'GC4WSTEL444444444444444444444444444444444444'
      ],
      createdAt: '2026-05-10T14:30:00Z'
    },
    {
      id: 'split-3',
      amount: 48.00,
      participants: [
        'GA6WSTEL222222222222222222222222222222222222', // Created by someone else
        'GB5WSTELLAR7PLITSPLITPASSPOKEDEMOMODEACTIVE', // You ✦ (Owe)
        'GD7WSTEL333333333333333333333333333333333333'
      ],
      paid: [
        'GA6WSTEL222222222222222222222222222222222222'
      ],
      createdAt: '2026-05-18T09:15:00Z'
    }
  ])

  // Filters State
  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'owe' | 'paid'>('all')

  // Setup mount flags and custom cursor trackers
  useEffect(() => {
    setMounted(true)

    // Custom cursor mechanics
    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  // Smooth trail for cursor
  useEffect(() => {
    if (!mounted) return
    let animationFrameId: number
    const updateTrail = () => {
      setCursorTrail(prev => {
        const dx = cursorPos.x - prev.x
        const dy = cursorPos.y - prev.y
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18
        }
      })
      animationFrameId = requestAnimationFrame(updateTrail)
    }
    updateTrail()
    return () => cancelAnimationFrame(animationFrameId)
  }, [cursorPos, mounted])

  // Scroll to anchor function
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Participants logic (auto-includes wallet as Participant 1 "You ✦")
  const participantList = useMemo(() => {
    const list = [...participants]
    if (wallet && !list.includes(wallet)) {
      list.unshift(wallet)
    }
    return list
  }, [participants, wallet])

  // Real-time calculation share
  const share = useMemo(() => {
    const amt = Number(amount || 0)
    if (participantList.length === 0) return 0
    return amt / participantList.length
  }, [amount, participantList])

  // Add participant to list
  const addParticipant = () => {
    if (!participantInput) return
    const cleaned = participantInput.trim()
    if (cleaned.length < 15) {
      toast.error('Please enter a valid Stellar wallet address')
      return
    }
    if (participantList.includes(cleaned)) {
      toast.error('Participant already added')
      return
    }
    setParticipants(prev => [...prev, cleaned])
    setParticipantInput('')
    toast.success('Participant added to bill')
  }

  // Remove participant
  const removeParticipant = (address: string) => {
    if (address === wallet) {
      toast.error('You cannot remove yourself from the bill')
      return
    }
    setParticipants(prev => prev.filter(p => p !== address))
    toast.info('Participant removed')
  }

  // Trigger form submission split flow simulation
  const handleCreateBillSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      toast.error('Connect your wallet to authorize escrows.')
      return
    }
    if (!billName) {
      toast.error('Enter a bill description or name')
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid bill amount')
      return
    }
    if (participantList.length < 2) {
      toast.error('Add at least 1 other participant to split with')
      return
    }

    setSubmitState('creating')
    setProgress(0)

    // Progress Simulation Phase 1: Escrow Contract Generation (800ms)
    let start1 = performance.now()
    const runPhase1 = (now: number) => {
      const elapsed = now - start1
      const pct = Math.min((elapsed / 800) * 45, 45)
      setProgress(pct)
      if (elapsed < 800) {
        requestAnimationFrame(runPhase1)
      } else {
        setSubmitState('anchoring')
        // Progress Simulation Phase 2: Anchor on Stellar Network (1000ms)
        let start2 = performance.now()
        const runPhase2 = (now2: number) => {
          const elapsed2 = now2 - start2
          const pct2 = 45 + Math.min((elapsed2 / 1000) * 55, 55)
          setProgress(pct2)
          if (elapsed2 < 1000) {
            requestAnimationFrame(runPhase2)
          } else {
            // Anchor complete, set success
            const mockContract = `SCXK${Math.random().toString(36).substring(2, 8).toUpperCase()}8A2B`
            const randomSlug = Math.random().toString(36).substring(2, 6).toLowerCase()
            setCreatedBill({
              name: billName,
              total: Number(amount).toFixed(2),
              currency: selectedCurrency,
              splitsCount: participantList.length,
              contract: mockContract,
              link: `syncsplit.app/bill/${randomSlug}`
            })

            // Inject the new bill optimistically in active list
            const newBill: SplitRecord = {
              id: `split-${Date.now()}`,
              amount: Number(amount),
              participants: participantList,
              paid: [wallet], // Auto-paid by builder
              createdAt: new Date().toISOString()
            }
            setSplits(prev => [newBill, ...prev])
            setSubmitState('success')
            toast.success('✦ Soroban smart escrow deployed!')
          }
        }
        requestAnimationFrame(runPhase2)
      }
    }
    requestAnimationFrame(runPhase1)
  }

  // Clear builder and reset
  const resetForm = () => {
    setBillName('')
    setAmount('')
    setParticipants([])
    setSubmitState('idle')
    setProgress(0)
    setCreatedBill(null)
  }

  // Pay share on a bill
  const payBillShare = (billId: string) => {
    if (!isConnected) {
      toast.error('Connect your wallet first!')
      return
    }
    
    // Simulate transaction signatures
    toast.info('Requesting transaction signature via Freighter...')
    setTimeout(() => {
      setSplits(prev => prev.map(bill => {
        if (bill.id === billId) {
          return {
            ...bill,
            paid: Array.from(new Set([...bill.paid, wallet]))
          }
        }
        return bill
      }))
      toast.success('✦ Escrow payment completed and cleared on-chain!')
    }, 1000)
  }

  // Helper status checkers
  const getBillStatus = (bill: SplitRecord) => {
    const paidCount = bill.paid.length
    const totalCount = bill.participants.length
    if (paidCount === totalCount) return 'Fully paid'
    if (bill.paid.includes(wallet)) return 'Waiting for others'
    return 'You owe'
  }

  const getStatusColor = (status: string) => {
    if (status === 'Fully paid') return '#10b981' // green
    if (status === 'Waiting for others') return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  // Filter dynamic bills list
  const filteredBills = useMemo(() => {
    return splits.filter(bill => {
      const status = getBillStatus(bill)
      if (activeFilter === 'all') return true
      if (activeFilter === 'waiting') return status === 'Waiting for others'
      if (activeFilter === 'owe') return status === 'You owe'
      if (activeFilter === 'paid') return status === 'Fully paid'
      return true
    })
  }, [splits, activeFilter, wallet])

  // Float circles rendering helpers
  const floatingCircles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 26) + 8, // 8px - 34px
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      duration: Math.floor(Math.random() * 6) + 9, // 9s - 15s
      delay: Math.floor(Math.random() * 4),
      opacity: (Math.random() * 0.15 + 0.10).toFixed(2)
    }))
  }, [])

  return (
    <div className="Bill split-container">
      {/* Google Fonts Link */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&family=Dancing+Script:wght@600&family=Fira+Code:wght@400&display=swap" rel="stylesheet" />

      {/* Embedded Vanilla CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom Font Imports fallback */
        .Bill split-container {
          background-color: #FFF0F7;
          color: #2D1A26;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
          cursor: none;
        }

        /* ── Custom Cursor ── */
        .custom-cursor-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          background-color: #F472B6;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease-out;
        }
        .custom-cursor-ring {
          position: fixed;
          width: 24px;
          height: 24px;
          border: 1.5px solid #F472B6;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          background-color: rgba(244, 114, 182, 0.03);
        }
        a:hover ~ .custom-cursor-ring,
        button:hover ~ .custom-cursor-ring,
        input:hover ~ .custom-cursor-ring,
        textarea:hover ~ .custom-cursor-ring {
          width: 32px;
          height: 32px;
          border-color: #E879F9;
          background-color: rgba(232, 121, 249, 0.08);
        }

        /* Hide cursor on mobile devices */
        @media (max-width: 768px) {
          .custom-cursor-dot, .custom-cursor-ring {
            display: none !important;
          }
          .Bill split-container {
            cursor: auto !important;
          }
        }

        /* ── Floating Circles ── */
        .floating-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .float-bubble {
          position: absolute;
          background-color: #FBCFE8;
          border-radius: 50%;
          animation: driftBubble linear infinite;
        }
        @keyframes driftBubble {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) translateX(15px) rotate(120deg);
          }
          66% {
            transform: translateY(15px) translateX(-20px) rotate(240deg);
          }
          100% {
            transform: translateY(0px) translateX(0px) rotate(360deg);
          }
        }

        /* ── CSS Dot Grid Texture ── */
        .dot-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #FBCFE8 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Diagonal Stripes (Featured Sections) ── */
        .stripe-bg {
          background-image: repeating-linear-gradient(
            45deg, #F9A8D4 0px, #F9A8D4 1px, transparent 1px, transparent 12px
          );
          opacity: 0.04;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* ── Global Layout Resets ── */
        header.nav-bar {
          background-color: #FFFFFF;
          border-bottom: 1px solid #FBCFE8;
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-family: 'Dancing Script', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #2D1A26;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sparkle-icon {
          color: #F472B6;
          font-size: 14px;
        }
        .nav-links {
          display: flex;
          gap: 28px;
        }
        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #2D1A26;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: #F472B6;
        }
        .btn-pill-pink {
          background-color: #F472B6;
          color: #FFFFFF;
          border: none;
          padding: 10px 24px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          box-shadow: 0 4px 14px rgba(244, 114, 182, 0.22);
        }
        .btn-pill-pink:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(244, 114, 182, 0.32);
          background-color: #E879F9;
        }

        /* ── Hero Section ── */
        .hero-section {
          padding: 90px 20px 110px 20px;
          text-align: center;
          position: relative;
          background-color: #FFF0F7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .eyebrow-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 16px;
          color: #F472B6;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .hero-title {
          margin: 12px 0 24px 0;
          max-width: 800px;
          line-height: 1.25;
        }
        .hero-title span {
          display: block;
        }
        .title-cursive-dark {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(38px, 5.5vw, 56px);
          color: #2D1A26;
          font-weight: 600;
        }
        .title-syne-pink {
          font-family: 'Syne', sans-serif;
          font-size: clamp(40px, 6vw, 62px);
          color: #F472B6;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .hero-subtext {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(45, 26, 38, 0.70);
          max-width: 580px;
          margin-bottom: 28px;
        }
        .pull-quote {
          font-family: 'Dancing Script', cursive;
          font-size: 20px;
          color: #F472B6;
          margin-bottom: 36px;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          margin-bottom: 60px;
        }
        .btn-dark-pill {
          background-color: #2D1A26;
          color: #FFFFFF;
          border: none;
          padding: 14px 32px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
        }
        .btn-dark-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(45, 26, 38, 0.25);
          background-color: #F472B6;
        }
        .btn-ghost-pill {
          background-color: transparent;
          color: #2D1A26;
          border: 1px solid #F9A8D4;
          padding: 14px 32px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }
        .btn-ghost-pill:hover {
          transform: translateY(-2px);
          background-color: rgba(249, 168, 212, 0.15);
        }
        .scroll-indicator {
          width: 44px;
          height: 44px;
          background-color: #FBCFE8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #2D1A26;
          font-size: 18px;
          animation: bounceIndicator 1.8s infinite;
          transition: background-color 0.2s;
        }
        .scroll-indicator:hover {
          background-color: #F9A8D4;
        }
        @keyframes bounceIndicator {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* ── Bento Stats Grid ── */
        .stats-grid-container {
          padding: 0 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .stat-card {
          border-radius: 24px;
          border: 1px solid #FBCFE8;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
          box-shadow: 0 4px 24px rgba(244, 114, 182, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(244, 114, 182, 0.15);
        }
        .stat-card.style-1 { background-color: #FFF0F7; }
        .stat-card.style-2 { background-color: #FFFFFF; }
        .stat-card.style-3 { background: linear-gradient(135deg, #FBCFE8, #FFF0F7); }
        .stat-card.style-4 { background-color: #F9A8D4; border-color: #F472B6; }

        .stat-eyebrow {
          font-family: 'Dancing Script', cursive;
          font-size: 13px;
          color: #F472B6;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .stat-card.style-4 .stat-eyebrow {
          color: #2D1A26;
        }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 3.5vw, 42px);
          color: #2D1A26;
          margin: 12px 0;
          line-height: 1.1;
        }
        .stat-card.style-3 .stat-number {
          color: #F472B6;
        }

        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(45, 26, 38, 0.65);
        }

        /* ── Page Section Heading ── */
        .section-header {
          text-align: center;
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 32px;
          color: #2D1A26;
          margin-top: 4px;
        }
        .section-underline {
          width: 48px;
          height: 2.5px;
          background-color: #F9A8D4;
          margin-top: 12px;
          border-radius: 9px;
        }

        /* ── How It Works Row ── */
        .how-works-section {
          padding: 80px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .how-works-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          position: relative;
        }
        /* Dashed connecting line */
        .how-works-row::after {
          content: "";
          position: absolute;
          top: 72px;
          left: 15%;
          right: 15%;
          height: 2px;
          border-top: 2.5px dashed #FBCFE8;
          z-index: 0;
        }
        .process-card {
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          border-radius: 24px;
          padding: 40px 32px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .process-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(244, 114, 182, 0.12);
        }
        .process-card.featured {
          background: linear-gradient(135deg, #FBCFE8, #FFF0F7);
          border-color: #F472B6;
        }
        .process-card.left-accent {
          border-left: 3.5px solid #F9A8D4;
        }
        .process-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 24px;
          color: #F472B6;
          box-shadow: 0 4px 12px rgba(244, 114, 182, 0.06);
        }
        .process-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #2D1A26;
          margin: 8px 0;
        }
        .process-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          line-height: 1.65;
          color: rgba(45, 26, 38, 0.65);
        }

        /* ── Section Dividers ── */
        .section-divider {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 70px 0;
          width: 100%;
        }
        .divider-line {
          position: absolute;
          width: 100%;
          height: 1px;
          background-color: #FBCFE8;
          z-index: 1;
        }
        .divider-star-container {
          position: relative;
          padding: 0 18px;
          z-index: 2;
        }
        .divider-star {
          color: #F472B6;
          font-size: 16px;
        }

        /* ── Create A Bill Section (Tertiary Blush bg) ── */
        .create-bill-section {
          background-color: #FFE4F0;
          padding: 90px 40px;
          position: relative;
        }
        .form-card {
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          border-radius: 24px;
          padding: 40px 48px;
          max-width: 720px;
          margin: 0 auto;
          box-shadow: 0 8px 32px rgba(244, 114, 182, 0.12);
          position: relative;
          z-index: 5;
        }
        .form-group {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .form-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #2D1A26;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .form-sublabel {
          font-family: 'Dancing Script', cursive;
          font-size: 13.5px;
          color: #F472B6;
          margin-left: 6px;
        }
        .input-text {
          width: 100%;
          border: 1px solid #FBCFE8;
          border-radius: 12px;
          padding: 12px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          color: #2D1A26;
          background-color: #FFF0F7;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-text:focus {
          outline: none;
          border-color: #F472B6;
          box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.15);
        }
        
        .currency-input-row {
          display: flex;
          width: 100%;
          gap: 12px;
        }
        .select-currency {
          background-color: #FBCFE8;
          border: 1px solid #FBCFE8;
          border-radius: 12px;
          padding: 0 18px;
          font-family: 'Dancing Script', cursive;
          font-weight: 600;
          font-size: 15px;
          color: #2D1A26;
          cursor: pointer;
        }
        .select-currency:focus {
          outline: none;
        }

        .input-address-row {
          display: flex;
          width: 100%;
          gap: 12px;
        }
        .input-address {
          flex: 1;
          font-family: 'Fira Code', monospace;
          font-size: 12.5px;
        }
        .btn-add-pill {
          background-color: #F472B6;
          color: #FFFFFF;
          border: none;
          padding: 0 24px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-add-pill:hover {
          background-color: #E879F9;
        }

        /* Participant chips list */
        .chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .p-chip {
          background-color: #FBCFE8;
          border: 1px solid #F9A8D4;
          color: #2D1A26;
          border-radius: 9999px;
          padding: 6px 14px;
          font-size: 12.5px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .p-chip.is-you {
          background-color: #F9A8D4;
          font-weight: 500;
        }
        .chip-name {
          font-family: 'Dancing Script', cursive;
          font-weight: 600;
        }
        .chip-addr {
          font-family: 'Fira Code', monospace;
          font-size: 10.5px;
          opacity: 0.8;
        }
        .chip-remove {
          border: none;
          background: none;
          color: #2D1A26;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          padding: 0 2px;
        }

        /* ── Split Preview ── */
        .split-preview {
          background: linear-gradient(135deg, #F9A8D4, #FBCFE8);
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          margin: 28px 0;
          box-sizing: border-box;
          color: #2D1A26;
        }
        .preview-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
        }
        .preview-pay-large {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #2D1A26;
        }
        .split-visual-bar {
          display: flex;
          height: 16px;
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 18px;
          background-color: rgba(45, 26, 38, 0.08);
          border: 1px solid rgba(45, 26, 38, 0.05);
        }
        .split-segment {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          color: #2D1A26;
          border-right: 1px solid rgba(255, 255, 255, 0.35);
        }
        .split-segment:last-child {
          border-right: none;
        }

        /* Submit full width split-zone button */
        .btn-submit-container {
          width: 100%;
          display: flex;
          border-radius: 9999px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(45, 26, 38, 0.12);
          transition: transform 0.2s;
          cursor: pointer;
        }
        .btn-submit-container:hover {
          transform: translateY(-1px);
        }
        .btn-submit-left {
          background-color: #2D1A26;
          color: #FFFFFF;
          flex: 1;
          border: none;
          padding: 16px 28px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
        }
        .btn-submit-right {
          background-color: #F472B6;
          width: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 18px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-submit-container:hover .btn-submit-right {
          background-color: #E879F9;
        }
        
        .secured-note {
          font-family: 'Dancing Script', cursive;
          font-size: 13.5px;
          color: rgba(45, 26, 38, 0.55);
          text-align: center;
          margin-top: 12px;
          width: 100%;
          display: block;
        }

        /* ── Progress Animation Overlay ── */
        .progress-overlay-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }
        .progress-step-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #2D1A26;
          margin-bottom: 8px;
        }
        .progress-step-caption {
          font-family: 'Dancing Script', cursive;
          font-size: 14.5px;
          color: #F472B6;
          margin-bottom: 24px;
        }
        .progress-bar-track {
          width: 100%;
          max-width: 320px;
          height: 6px;
          background-color: #FBCFE8;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-bar-fill {
          height: 100%;
          background-color: #F472B6;
          border-radius: 9999px;
          transition: width 0.15s linear;
        }
        .progress-pct-label {
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          color: rgba(45, 26, 38, 0.6);
        }

        /* Success state card */
        .success-state-container {
          background-color: #FFFFFF;
          border: 1.5px solid #F472B6;
          border-radius: 20px;
          padding: 32px;
          text-align: left;
        }
        .success-badge {
          font-family: 'Dancing Script', cursive;
          font-size: 18px;
          color: #F472B6;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .success-detail-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #FBCFE8;
          padding: 10px 0;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #2D1A26;
        }
        .success-detail-row:last-of-type {
          border-bottom: none;
        }
        .success-label {
          font-weight: 500;
        }
        .success-value-mono {
          font-family: 'Fira Code', monospace;
          font-size: 11.5px;
        }
        .btn-copy-success {
          background-color: #FBCFE8;
          border: none;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          margin-left: 6px;
        }
        .share-link-box {
          background-color: #FFF0F7;
          border: 1px solid #FBCFE8;
          border-radius: 12px;
          padding: 14px 16px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .share-link-text {
          font-family: 'Fira Code', monospace;
          font-size: 12.5px;
          color: #2D1A26;
        }
        .btn-copy-link {
          background: none;
          border: none;
          color: #F472B6;
          font-family: 'Dancing Script', cursive;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        }
        .success-btn-row {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .btn-success-main {
          background-color: #2D1A26;
          color: #FFFFFF;
          border: none;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-success-sub {
          background-color: transparent;
          color: #2D1A26;
          border: 1px solid #FBCFE8;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 13px;
          cursor: pointer;
        }

        /* ── Active Bills Section ── */
        .active-bills-section {
          padding: 80px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .filter-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 40px;
        }
        .filter-btn {
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          color: #2D1A26;
          border-radius: 9999px;
          padding: 8px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }
        .filter-btn.active {
          background-color: #F472B6;
          color: #FFFFFF;
          border-color: #F472B6;
        }
        .bills-list-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .bill-item-card {
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 4px 16px rgba(244, 114, 182, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bill-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(244, 114, 182, 0.16);
        }
        .bill-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .bill-name-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .bill-name-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #2D1A26;
        }
        .bill-tag-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 12.5px;
          color: #F472B6;
          margin-top: 2px;
        }
        .status-dot-chip {
          border-radius: 9999px;
          padding: 4px 12px;
          font-size: 10.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .status-dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .bill-amount-large {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #2D1A26;
        }
        .bill-participants-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: rgba(45, 26, 38, 0.6);
          margin-bottom: 18px;
        }

        .payment-progress-container {
          margin: 16px 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .progress-label-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 12.5px;
          color: #F472B6;
          margin-bottom: 6px;
        }
        .progress-bar-track-small {
          width: 100%;
          height: 7px;
          background-color: #FBCFE8;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .progress-bar-fill-small {
          height: 100%;
          background-color: #F472B6;
          border-radius: 9999px;
          transition: width 0.8s ease-out;
        }
        .progress-stats-row {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          color: rgba(45, 26, 38, 0.55);
        }

        .avatars-row {
          display: flex;
          margin: 12px 0 20px 0;
        }
        .avatar-circle-wrapper {
          position: relative;
          width: 32px;
          height: 32px;
          margin-left: -8px;
        }
        .avatar-circle-wrapper:first-child {
          margin-left: 0;
        }
        .avatar-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #FFE4F0;
          border: 1.5px solid #FBCFE8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-family: 'DM Sans', sans-serif;
          font-weight: bold;
          color: #2D1A26;
        }
        .avatar-status-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          color: #FFFFFF;
          border: 1px solid #FFFFFF;
        }

        .bill-card-bottom {
          border-top: 1px dashed #FBCFE8;
          padding-top: 18px;
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bill-dates-mono {
          font-family: 'Fira Code', monospace;
          font-size: 10.5px;
          color: rgba(45, 26, 38, 0.55);
        }
        .btn-pay-share {
          background-color: #F472B6;
          color: #FFFFFF;
          border: none;
          padding: 8px 18px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-pay-share:hover {
          background-color: #E879F9;
        }
        .btn-view-details {
          background-color: transparent;
          color: rgba(45, 26, 38, 0.6);
          border: 1px solid #FBCFE8;
          padding: 8px 18px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          cursor: pointer;
        }

        /* ── Settlement Tracker Timeline ── */
        .settlement-section {
          background-color: #FFF0F7;
          padding: 80px 40px;
        }
        .timeline-container {
          max-width: 720px;
          margin: 40px auto 0 auto;
          position: relative;
        }
        /* Vertical connection line */
        .timeline-container::after {
          content: "";
          position: absolute;
          top: 20px;
          bottom: 20px;
          left: 20px;
          width: 2px;
          border-left: 2px dashed #FBCFE8;
          z-index: 0;
        }
        .timeline-item {
          display: flex;
          position: relative;
          z-index: 1;
          margin-bottom: 36px;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-left-node {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #FFF0F7;
          border: 1.5px solid #FBCFE8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F472B6;
          font-size: 14px;
          flex-shrink: 0;
          margin-right: 24px;
          box-shadow: 0 4px 12px rgba(244, 114, 182, 0.05);
        }
        .timeline-card {
          flex: 1;
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          border-left: 3.5px solid #10b981;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 16px rgba(244, 114, 182, 0.04);
        }
        .timeline-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .timeline-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #2D1A26;
        }
        .timeline-card-date {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: rgba(45, 26, 38, 0.55);
        }
        .timeline-card-mid {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: rgba(45, 26, 38, 0.70);
          margin-bottom: 12px;
        }
        .timeline-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .timeline-tx-hash {
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          color: rgba(45, 26, 38, 0.55);
        }
        .timeline-explorer-link {
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          color: #F472B6;
          text-decoration: none;
          font-weight: 500;
        }
        .timeline-explorer-link:hover {
          text-decoration: underline;
        }

        .timeline-end-quote {
          font-family: 'Dancing Script', cursive;
          font-size: 16.5px;
          color: #F472B6;
          text-align: center;
          margin-top: 40px;
          display: block;
        }

        /* ── Technical Under The Hood Section ── */
        .tech-section {
          background-color: #FFE4F0;
          padding: 85px 40px;
          position: relative;
        }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
          max-width: 900px;
          margin: 0 auto;
        }
        .tech-card {
          background-color: #FFFFFF;
          border: 1px solid #FBCFE8;
          border-radius: 20px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
          box-shadow: 0 4px 16px rgba(244, 114, 182, 0.05);
          transition: transform 0.3s ease;
        }
        .tech-card:hover {
          transform: translateY(-4px);
        }
        .tech-card.featured {
          background: linear-gradient(135deg, #F9A8D4, #FBCFE8);
          border-color: #F472B6;
        }
        .tech-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #FFF0F7;
          border: 1px solid #FBCFE8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #F472B6;
          margin-bottom: 16px;
        }
        .tech-card.featured .tech-icon-circle {
          background-color: #2D1A26;
          color: #FFFFFF;
          border: none;
        }
        .tech-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #2D1A26;
          margin-bottom: 6px;
        }
        .tech-card-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          line-height: 1.6;
          color: rgba(45, 26, 38, 0.65);
          margin-bottom: 16px;
        }
        .tech-chip-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 12px;
          background-color: #FFF0F7;
          border: 1.5px solid #FBCFE8;
          border-radius: 9999px;
          padding: 3px 12px;
          align-self: flex-start;
        }
        .tech-card.featured .tech-chip-cursive {
          background-color: #2D1A26;
          color: #FFFFFF;
          border: none;
        }

        /* ── contrasted Plum Footer ── */
        footer.plum-footer {
          background-color: #2D1A26;
          color: #FFFFFF;
          padding: 60px 40px 40px 40px;
          position: relative;
        }
        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(251, 207, 232, 0.15);
          padding-bottom: 40px;
          margin-bottom: 30px;
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .footer-logo {
          font-family: 'Dancing Script', cursive;
          font-size: 22px;
          color: #F472B6;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .footer-tagline {
          font-family: 'Dancing Script', cursive;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.55);
        }
        .footer-links-row {
          display: flex;
          gap: 32px;
        }
        .footer-link {
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #F472B6;
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-left-mono {
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
        }
        .footer-right-cursive {
          font-family: 'Dancing Script', cursive;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.35);
        }

        /* ── Responsive Styling ── */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .how-works-row {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .how-works-row::after {
            display: none;
          }
          .bills-list-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .tech-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          header.nav-bar {
            padding: 16px 20px;
          }
          .nav-links {
            display: none; /* simple responsive toggle mockup */
          }
          .hero-section {
            padding: 60px 16px 80px 16px;
          }
          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 280px;
          }
          .stats-grid-container {
            padding: 0 20px;
          }
          .how-works-section {
            padding: 60px 20px;
          }
          .create-bill-section {
            padding: 60px 20px;
          }
          .form-card {
            padding: 30px 20px;
          }
          .active-bills-section {
            padding: 60px 20px;
          }
          .bills-list-grid {
            grid-template-columns: 1fr;
          }
          .settlement-section {
            padding: 60px 20px;
          }
          .timeline-card {
            padding: 16px;
          }
          .footer-top {
            flex-direction: column;
            gap: 24px;
            align-items: center;
            text-align: center;
          }
          .footer-links-row {
            flex-wrap: wrap;
            justify-content: center;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      ` }} />

      {/* Custom glowing cursor elements */}
      <div 
        className="custom-cursor-dot" 
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }} 
      />
      <div 
        className="custom-cursor-ring" 
        style={{ left: `${cursorTrail.x}px`, top: `${cursorTrail.y}px` }} 
      />

      {/* Floating particles background texture */}
      <div className="floating-container">
        {floatingCircles.map(c => (
          <div 
            key={c.id}
            className="float-bubble"
            style={{
              width: `${c.size}px`,
              height: `${c.size}px`,
              left: `${c.left}%`,
              top: `${c.top}%`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              opacity: c.opacity
            }}
          />
        ))}
      </div>
      <div className="dot-grid-overlay" />

      {/* NAVBAR */}
      <header className="nav-bar">
        <div className="nav-logo">
          <span className="sparkle-icon">✦</span> Bill split
        </div>
        <nav className="nav-links">
          <a href="#how-it-works" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}>How it Works</a>
          <a href="#create-bill" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('create-bill') }}>Create Bill</a>
          <a href="#active-bills" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('active-bills') }}>My Bills</a>
          <a href="#settlement" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('settlement') }}>Settlement</a>
          <a href={getExplorerUrl('stellar', 'address', 'CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF')} target="_blank" rel="noopener noreferrer" className="nav-link">Stellar Network</a>
        </nav>
        <div>
          <ConnectButton type="evm" size="lg" />
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="eyebrow-cursive">
          ✦ built on stellar soroban
        </div>
        <h1 className="hero-title">
          <span className="title-cursive-dark">Split every bill,</span>
          <span className="title-syne-pink">trustlessly,</span>
          <span className="title-cursive-dark">on-chain.</span>
        </h1>
        <p className="hero-subtext">
          No more awkward reminders. No more trust issues. Bill split uses Stellar Soroban smart contracts to lock everyone's share in escrow — and releases the full amount only when every participant has paid.
        </p>
        <div className="pull-quote">
          "Your share. Your wallet. Your chain."
        </div>
        <div className="hero-buttons">
          <button className="btn-dark-pill" onClick={() => scrollTo('create-bill')}>Create a Bill</button>
          <button className="btn-ghost-pill" onClick={() => scrollTo('active-bills')}>View Active Bills</button>
        </div>
        <div className="scroll-indicator" onClick={() => scrollTo('stats')}>
          ↓
        </div>
      </section>

      {/* STATS ROW (4 Bento Tiles) */}
      <section id="stats" className="stats-grid-container" style={{ paddingBottom: '40px' }}>
        <div className="stats-grid">
          <div className="stat-card style-1">
            <div className="stat-eyebrow">✦ Bills Created</div>
            <div className="stat-number">
              {mounted ? <CountUp end={28104} /> : '0'}
            </div>
            <div className="stat-label">on Stellar</div>
          </div>
          <div className="stat-card style-2">
            <div className="stat-eyebrow">✦ Total Settled</div>
            <div className="stat-number" style={{ color: '#F472B6' }}>
              {mounted ? <CountUpDecimal end={4.2} decimals={1} prefix="$" suffix="M" /> : '0'}
            </div>
            <div className="stat-label">auto-settled</div>
          </div>
          <div className="stat-card style-3">
            <div className="stat-eyebrow">✦ Avg Split Size</div>
            <div className="stat-number">
              {mounted ? <CountUpDecimal end={84.0} decimals={0} prefix="$" /> : '0'}
            </div>
            <div className="stat-label">per participant</div>
          </div>
          <div className="stat-card style-4">
            <div className="stat-eyebrow">✦ Wallets Active</div>
            <div className="stat-number">
              {mounted ? <CountUp end={9847} /> : '0'}
            </div>
            <div className="stat-label">this month</div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-works-section">
        <div className="section-header">
          <div className="eyebrow-cursive">✦ the process</div>
          <h2 className="section-title">Three steps to a settled bill</h2>
          <div className="section-underline" />
        </div>

        <div className="how-works-row">
          <div className="process-card left-accent">
            <div className="process-icon-circle">✦</div>
            <div className="eyebrow-cursive">step one</div>
            <h3 className="process-title">Create the Bill</h3>
            <p className="process-body">
              Enter the total amount, add participant wallet addresses, and set the split. Equal shares, always.
            </p>
          </div>
          <div className="process-card featured">
            <div className="process-icon-circle">👛</div>
            <div className="eyebrow-cursive" style={{ color: '#2D1A26' }}>step two</div>
            <h3 className="process-title">Everyone Pays</h3>
            <p className="process-body">
              Each participant connects their Stellar wallet and pays exactly their share into the escrow contract.
            </p>
          </div>
          <div className="process-card left-accent">
            <div className="process-icon-circle">✓</div>
            <div className="eyebrow-cursive">step three</div>
            <h3 className="process-title">Auto-Settlement</h3>
            <p className="process-body">
              Once every share is paid, the smart contract releases the full amount to the recipient automatically. No manual action needed.
            </p>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider bg="#FFE4F0" />

      {/* CREATE A BILL (MAIN ACTION FORM) */}
      <section id="create-bill" className="create-bill-section">
        <div className="stripe-bg" />
        
        <div className="section-header">
          <div className="eyebrow-cursive">✦ split something</div>
          <h2 className="section-title">Create a new bill</h2>
          <div className="section-underline" />
        </div>

        <div className="form-card">
          {submitState === 'idle' && (
            <form onSubmit={handleCreateBillSubmit}>
              <div className="form-group">
                <label className="form-label">Bill Name</label>
                <input 
                  type="text" 
                  className="input-text" 
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  placeholder="Dinner at Ciao, Goa trip, Movie night..." 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Bill Amount</label>
                <div className="currency-input-row">
                  <input 
                    type="number" 
                    className="input-text" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    step="any"
                    min="0"
                  />
                  <select 
                    className="select-currency"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="USDC">USDC ▾</option>
                    <option value="XLM">XLM ▾</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Participant Wallet Addresses
                  <span className="form-sublabel">add everyone who owes</span>
                </label>
                <div className="input-address-row">
                  <input 
                    type="text" 
                    className="input-text input-address" 
                    value={participantInput}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    placeholder="Stellar wallet address (starts with G...)" 
                  />
                  <button 
                    type="button" 
                    className="btn-add-pill"
                    onClick={addParticipant}
                  >
                    + Add
                  </button>
                </div>

                <div className="chips-container">
                  <div className="p-chip is-you">
                    <span className="chip-name">You ✦</span>
                    <span className="chip-addr">{wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'GB5W...ACTIVE'}</span>
                  </div>
                  {participants.map((addr, idx) => (
                    <div key={idx} className="p-chip">
                      <span className="chip-name">Participant {idx + 2}</span>
                      <span className="chip-addr">{`${addr.slice(0, 6)}...${addr.slice(-4)}`}</span>
                      <button 
                        type="button" 
                        className="chip-remove"
                        onClick={() => removeParticipant(addr)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Split Preview */}
              <div className="split-preview">
                <div className="preview-row">
                  <span>Total Bill:</span>
                  <strong>{amount ? Number(amount).toFixed(2) : '0.00'} {selectedCurrency}</strong>
                </div>
                <div className="preview-row">
                  <span>Participants:</span>
                  <strong>{participantList.length}</strong>
                </div>
                <div className="preview-row" style={{ marginTop: '12px', borderTop: '1.5px solid rgba(45,26,38,0.1)', paddingTop: '12px' }}>
                  <span>Each Pays:</span>
                  <span className="preview-pay-large">{share.toFixed(2)} {selectedCurrency}</span>
                </div>

                {/* Visual Segment Bar */}
                <div className="split-visual-bar">
                  {participantList.map((addr, idx) => {
                    const colors = ['#F9A8D4', '#FBCFE8', '#F472B6', '#E879F9']
                    const bg = colors[idx % colors.length]
                    const initials = idx === 0 ? 'YOU' : `P${idx + 1}`
                    return (
                      <div 
                        key={idx} 
                        className="split-segment" 
                        style={{ flex: 1, backgroundColor: bg }}
                        title={addr}
                      >
                        {initials}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Payment Deadline
                  <span className="form-sublabel">optional — leave blank for no expiry</span>
                </label>
                <input type="date" className="input-text" style={{ padding: '10px 16px' }} />
              </div>

              {isConnected ? (
                <div className="btn-submit-container" onClick={handleCreateBillSubmit}>
                  <button type="submit" className="btn-submit-left">
                    Create Bill on Stellar
                  </button>
                  <div className="btn-submit-right">
                    →
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                  <ConnectButton type="evm" size="lg" />
                </div>
              )}
              <span className="secured-note">Secured by Stellar Soroban escrow contract</span>
            </form>
          )}

          {/* Creation Progress Simulation */}
          {(submitState === 'creating' || submitState === 'anchoring') && (
            <div className="progress-overlay-container">
              <div className="progress-step-title">
                {submitState === 'creating' ? 'Creating escrow contract...' : 'Anchoring bill on Stellar...'}
              </div>
              <div className="progress-step-caption">
                ✦ generating stellar soroban state
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-pct-label">{Math.floor(progress)}%</div>
            </div>
          )}

          {/* Success Card State */}
          {submitState === 'success' && createdBill && (
            <div className="success-state-container">
              <div className="success-badge">
                ✦ Bill Created Successfully!
              </div>

              <div className="success-detail-row">
                <span className="success-label">Bill Description:</span>
                <span>{createdBill.name}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Total Amount:</span>
                <strong>{createdBill.total} {createdBill.currency}</strong>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Splits:</span>
                <strong>{createdBill.splitsCount} × {(Number(createdBill.total) / createdBill.splitsCount).toFixed(2)} {createdBill.currency}</strong>
              </div>
              <div className="success-detail-row">
                <span className="success-label">Contract Escrow:</span>
                <span>
                  <strong className="success-value-mono">{createdBill.contract}</strong>
                  <button className="btn-copy-success" onClick={() => { navigator.clipboard.writeText(createdBill.contract); toast.success('Contract copied!') }}>Copy</button>
                </span>
              </div>

              <div className="share-link-box">
                <span className="share-link-text">{createdBill.link}</span>
                <button className="btn-copy-link" onClick={() => { navigator.clipboard.writeText(createdBill.link); toast.success('Link copied!') }}>Copy ✦</button>
              </div>

              <div className="success-btn-row">
                <button className="btn-success-main" onClick={() => { scrollTo('active-bills'); setSubmitState('idle') }}>View Bill →</button>
                <button className="btn-success-sub" onClick={resetForm}>Create Another</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider />

      {/* ACTIVE BILLS SECTION */}
      <section id="active-bills" className="active-bills-section">
        <div className="section-header">
          <div className="eyebrow-cursive">✦ in progress</div>
          <h2 className="section-title">Your active bills</h2>
          <div className="section-underline" />
        </div>

        <div className="filter-row">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All ✦</button>
          <button className={`filter-btn ${activeFilter === 'waiting' ? 'active' : ''}`} onClick={() => setActiveFilter('waiting')}>Waiting for others</button>
          <button className={`filter-btn ${activeFilter === 'owe' ? 'active' : ''}`} onClick={() => setActiveFilter('owe')}>You owe</button>
          <button className={`filter-btn ${activeFilter === 'paid' ? 'active' : ''}`} onClick={() => setActiveFilter('paid')}>Fully paid</button>
        </div>

        <div className="bills-list-grid">
          {filteredBills.map((bill) => {
            const status = getBillStatus(bill)
            const color = getStatusColor(status)
            const total = bill.amount
            const splitCount = bill.participants.length
            const perPerson = total / splitCount
            const paidAmt = bill.paid.length * perPerson
            const percentPaid = (bill.paid.length / splitCount) * 100

            return (
              <div 
                key={bill.id} 
                className="bill-item-card"
                style={{ borderLeft: `3.5px solid ${color}` }}
              >
                <div>
                  <div className="bill-card-top">
                    <div className="bill-name-header">
                      <span className="bill-name-title">{bill.id === 'split-1' ? 'Goa Trip — January' : bill.id === 'split-2' ? 'Dinner at The Table' : 'Netflix + Spotify Bundle'}</span>
                      <span className="bill-tag-cursive">{bill.id === 'split-1' ? 'travel' : bill.id === 'split-2' ? 'dinner' : 'entertainment'}</span>
                    </div>
                    <span className="status-dot-chip" style={{ color: color, backgroundColor: `${color}12` }}>
                      <span className="status-dot-indicator" style={{ backgroundColor: color }} />
                      {status}
                    </span>
                  </div>

                  <div className="bill-amount-large">${total.toFixed(2)} USDC</div>
                  <div className="bill-participants-subtitle">split between {splitCount} people × ${perPerson.toFixed(2)}</div>

                  {/* Payment Progress Bar */}
                  <div className="payment-progress-container">
                    <span className="progress-label-cursive">payment progress</span>
                    <div className="progress-bar-track-small">
                      <div className="progress-bar-fill-small" style={{ width: `${percentPaid}%` }} />
                    </div>
                    <div className="progress-stats-row">
                      {bill.paid.length} of {splitCount} paid · ${paidAmt.toFixed(0)} of ${total.toFixed(0)} collected
                    </div>
                  </div>

                  {/* Participant Avatars Row */}
                  <div className="avatars-row">
                    {bill.participants.map((addr, idx) => {
                      const isParticipantPaid = bill.paid.includes(addr)
                      const isYou = addr === wallet
                      const initials = isYou ? 'YOU' : `P${idx + 1}`
                      return (
                        <div key={idx} className="avatar-circle-wrapper" title={addr}>
                          <div className="avatar-node" style={{ border: isYou ? '1.5px solid #F472B6' : '1.5px solid #FBCFE8' }}>
                            {initials}
                          </div>
                          <div 
                            className="avatar-status-badge"
                            style={{ 
                              backgroundColor: isParticipantPaid ? '#10b981' : '#f59e0b',
                            }}
                          >
                            {isParticipantPaid ? '✓' : '⏳'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bill-card-bottom">
                  <span className="bill-dates-mono">Created May 15 · Due Jun 01</span>
                  {status === 'You owe' ? (
                    isConnected ? (
                      <button className="btn-pay-share" onClick={() => payBillShare(bill.id)}>Pay My Share →</button>
                    ) : (
                      <ConnectButton type="evm" size="sm" />
                    )
                  ) : (
                    <button className="btn-view-details">View Details</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider bg="#FFF0F7" />

      {/* SETTLEMENT TRACKER */}
      <section id="settlement" className="settlement-section">
        <div className="section-header">
          <div className="eyebrow-cursive">✦ settlement history</div>
          <h2 className="section-title">Every bill, settled on-chain</h2>
          <div className="section-underline" />
        </div>

        <div className="timeline-container">
          {INITIAL_SETTLED_BILLS.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-left-node">✦</div>
              <div className="timeline-card">
                <div className="timeline-card-top">
                  <span className="timeline-card-title">{item.name}</span>
                  <span className="timeline-card-date">{item.date}</span>
                </div>
                <div className="timeline-card-mid">
                  {item.amount} · {item.participants} participants · Stellar Soroban
                </div>
                <div className="timeline-card-bottom">
                  <span className="timeline-tx-hash">Tx: {item.txHash}</span>
                  <a 
                    href={getExplorerUrl('stellar', 'address', 'CCEIBX7TF3OY5CWE5GDGZPFNNTIRTLLHDYJ4NQG4YLWYTNURUZ4YGKGF')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="timeline-explorer-link"
                  >
                    View on Stellar Explorer ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <span className="timeline-end-quote">"Every settlement is permanent, transparent, and trustless. ✦"</span>
      </section>

      {/* Section Divider */}
      <SectionDivider bg="#FFE4F0" />

      {/* TECHNICAL UNDER THE HOOD */}
      <section className="tech-section">
        <div className="stripe-bg" />

        <div className="section-header">
          <div className="eyebrow-cursive">✦ under the hood</div>
          <h2 className="section-title">Powered by Stellar Soroban</h2>
          <div className="section-underline" />
        </div>

        <div className="tech-grid">
          <div className="tech-card">
            <div>
              <div className="tech-icon-circle">🔒</div>
              <h3 className="tech-card-title">Smart Escrow</h3>
              <p className="tech-card-body">
                Every bill creates a dedicated Soroban smart contract. Funds are locked until all participants pay — then auto-released.
              </p>
            </div>
            <span className="tech-chip-cursive">Soroban · Stellar</span>
          </div>

          <div className="tech-card">
            <div>
              <div className="tech-icon-circle">🏷️</div>
              <h3 className="tech-card-title">On-Chain Bill Metadata</h3>
              <p className="tech-card-body">
                Bill details, participant list, and payment status are stored using Token-2022 metadata — fully on-chain, forever.
              </p>
            </div>
            <span className="tech-chip-cursive">Token-2022</span>
          </div>

          <div className="tech-card featured">
            <div>
              <div className="tech-icon-circle">✓</div>
              <h3 className="tech-card-title" style={{ color: '#2D1A26' }}>Zero-Click Settlement</h3>
              <p className="tech-card-body" style={{ color: '#2D1A26' }}>
                When the final participant pays, the contract triggers automatic settlement. No manual action. No delays.
              </p>
            </div>
            <span className="tech-chip-cursive">Automated</span>
          </div>

          <div className="tech-card">
            <div>
              <div className="tech-icon-circle">👛</div>
              <h3 className="tech-card-title">Any Stellar Wallet</h3>
              <p className="tech-card-body">
                Participants can pay from any Stellar-compatible wallet. Freighter, Lobstr, xBull — all supported out of the box.
              </p>
            </div>
            <span className="tech-chip-cursive">Freighter · Lobstr</span>
          </div>
        </div>
      </section>

      {/* contrasted Plum Footer */}
      <footer className="plum-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              ✦ Bill split
            </div>
            <div className="footer-tagline">
              "Split bills. Build trust. On Stellar. ✦"
            </div>
          </div>
          <div className="footer-links-row">
            <a href="#how-it-works" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}>How it Works</a>
            <a href="#create-bill" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('create-bill') }}>Create Bill</a>
            <a href="#active-bills" className="footer-link" onClick={(e) => { e.preventDefault(); scrollTo('active-bills') }}>View Bills</a>
            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="footer-link">Stellar Explorer</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-left-mono">
            Built on Stellar Soroban · Soroban Testnet
          </div>
          <div className="footer-right-cursive">
            Part of the Kubryx Sovereign Operations Network • Built by vsrupeshkumar
          </div>
        </div>
      </footer>
    </div>
  )
}
