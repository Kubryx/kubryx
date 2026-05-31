'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Bot, Zap, Landmark, ArrowRight, ArrowUpRight } from 'lucide-react';
import GoogleTranslate from '@/components/GoogleTranslate';

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400 border-2 border-stone-900 text-stone-900 font-semibold text-sm mb-6 shadow-[3px_3px_0px_#2D2323]"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
    {children}
  </motion.div>
);

const HeroShape = () => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 2, -2, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="w-[280px] h-[380px] bg-white border-2 border-stone-900 rounded-3xl shadow-[6px_6px_0px_#2D2323] p-6 flex flex-col justify-between relative z-10"
      >
        <div className="flex justify-between items-center border-b-2 border-stone-900/10 pb-4">
          <div className="w-8 h-8 rounded-full bg-[#FF6B6B] border-2 border-stone-900" />
          <div className="h-4 w-20 bg-stone-900/10 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-stone-900/5 rounded-full" />
          <div className="h-4 w-3/4 bg-stone-900/5 rounded-full" />
          <div className="h-20 w-full rounded-xl bg-yellow-400/30 border-2 border-stone-900 flex flex-col items-center justify-center gap-2">
            <span className="text-xs text-stone-900/50 font-bold uppercase tracking-wider">Total</span>
            <span className="text-2xl font-bold text-[#FF6B6B]">$500.00 USDC</span>
          </div>
        </div>
        <div className="h-10 w-full rounded-lg bg-stone-900/5 border border-stone-900/10" />
      </motion.div>

      {/* Floating Pills */}
      <motion.div
        animate={{ x: [-5, 5, -5], y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
        className="absolute top-10 left-10 md:-left-4 px-4 py-2 bg-white rounded-full shadow-[3px_3px_0px_#2D2323] border-2 border-stone-900 font-bold text-sm text-stone-900 z-20 flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" /> USDC
      </motion.div>

      <motion.div
        animate={{ x: [5, -5, 5], y: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 right-10 md:-right-8 px-4 py-2 bg-yellow-400 rounded-full shadow-[3px_3px_0px_#2D2323] border-2 border-stone-900 font-bold text-sm text-stone-900 z-20 flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-stone-900" /> Arbitrum
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#FF8A65] rounded-full shadow-[3px_3px_0px_#2D2323] border-2 border-stone-900 font-bold text-sm text-white z-20 flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-white" /> Bitso
      </motion.div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-start z-10 text-left">
          <Eyebrow>AI-Powered Payments for LATAM</Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(48px,6vw,80px)] font-bold leading-[1.05] tracking-tight mb-6"
          >
            Get Paid in USDC,<br />
            <span className="text-accent">Instantly.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-stone-900/70 mb-8 max-w-lg leading-relaxed"
          >
            Turn any client email or PDF into an instant crypto payment link. No banks, no 8% fees. Parse, generate, and off-ramp to local fiat in seconds.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {['⚡ 100% On-Chain', '🤖 AI Invoice Parser', '🏦 Direct Fiat Off-ramp'].map((pill) => (
              <div key={pill} className="px-4 py-1.5 rounded-full bg-white border-2 border-stone-900 text-sm font-semibold text-stone-900 shadow-[2px_2px_0px_#2D2323]">
                {pill}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/dashboard" className="btn-primary px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2">
              Launch App <ArrowRight size={20} />
            </Link>
            <button className="btn-ghost px-8 py-4 rounded-2xl font-bold text-lg">
              Read the Docs
            </button>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <HeroShape />
        </motion.div>
      </div>
    </section>
  );
};

const TrustBar = () => {
  return (
    <div className="w-full py-8 border-y-2 border-stone-900 bg-yellow-400/30 overflow-hidden flex items-center">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="flex whitespace-nowrap gap-16 font-mono text-sm font-bold uppercase tracking-widest text-stone-900/50"
      >
        {Array(5).fill('Powered by: Arbitrum · Bitso Business · Groq AI · Ethereum Mexico · Next.js · Wagmi').map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </motion.div>
    </div>
  );
};

const CountUp = ({ to, label }: { to: number | string, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="text-6xl md:text-8xl font-bold tracking-tighter text-[#FF6B6B]"
      >
        {to}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-stone-900/60 font-medium max-w-[200px]"
      >
        {label}
      </motion.div>
    </div>
  );
};

const Stats = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-16 justify-items-center md:justify-items-start">
        <CountUp to="0%" label="Transaction Fees taken by Recibo" />
        <CountUp to="< 3s" label="Average settlement time on Arbitrum" />
        <CountUp to="100%" label="Non-custodial & Permissionless" />
      </div>
    </section>
  );
};

const Tools = () => {
  const features = [
    {
      icon: <Bot className="text-[#FF6B6B]" size={32} />,
      title: "AI Invoice Parsing",
      desc: "Paste raw text from a client email. Groq AI instantly extracts the amount, dates, and converts local LATAM currencies to USD."
    },
    {
      icon: <Zap className="text-[#FF8A65]" size={32} />,
      title: "Smart Payment Links",
      desc: "Send the client a unique URL. They connect their wallet and pay the exact USDC amount via a secure Arbitrum smart contract."
    },
    {
      icon: <Landmark className="text-yellow-500" size={32} />,
      title: "Bitso Integration",
      desc: "Don't leave your money on-chain. Route your USDC directly to Bitso and withdraw to your Mexican bank account via SPEI/CLABE."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Three steps. <span className="text-accent">One seamless flow.</span></h2>
        <p className="text-lg text-stone-900/60 max-w-2xl mx-auto">Stop bouncing between platforms. Recibo unifies invoicing, crypto settlement, and fiat off-ramping into a single interface.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="module-card p-8 flex flex-col gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/40 border-2 border-stone-900 flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-stone-900/70 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Features = () => {
  const benefits = [
    { num: '01', title: 'Zero KYC Required', desc: 'Connect your wallet and start charging. No endless verification forms.' },
    { num: '02', title: 'Borderless', desc: 'Accept payments from the US, Europe, or anywhere in seconds.' },
    { num: '03', title: 'Institutional Grade Security', desc: 'Funds move directly from client to you. We never hold custody.' },
  ];

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky top-32">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            Why freelancers choose Recibo.
          </h2>
          <p className="text-xl text-stone-900/70 max-w-md">
            Stop losing 8% to PayPal and waiting 5 business days for wire transfers. It's your money, you should keep all of it.
          </p>
        </div>

        <div className="bg-yellow-400/30 rounded-[2.5rem] p-8 md:p-12 border-2 border-stone-900 shadow-[6px_6px_0px_#2D2323] relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-12">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="flex gap-6"
              >
                <div className="font-mono text-2xl font-bold text-[#FF6B6B]/60">{b.num}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{b.title}</h3>
                  <p className="text-stone-900/70 text-lg leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const DashboardPreview = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <Eyebrow>Sneak Peek</Eyebrow>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything in one place.</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-5xl"
        style={{ perspective: '1600px' }}
      >
        <div
          className="w-full bg-white rounded-2xl shadow-[8px_8px_0px_#2D2323] overflow-hidden border-2 border-stone-900"
          style={{ transform: 'rotateX(8deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Fake Header */}
          <div className="h-12 bg-amber-50 border-b-2 border-stone-900 flex items-center px-4 gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF6B6B] border border-stone-900" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 border border-stone-900" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 border border-stone-900" />
            </div>
          </div>
          
          {/* Fake Content */}
          <div className="p-8 text-stone-900 grid md:grid-cols-[250px_1fr] gap-8 h-[500px]">
            {/* Sidebar */}
            <div className="flex flex-col gap-4 border-r-2 border-stone-900/10 pr-4">
              <div className="text-stone-900/40 text-xs font-bold uppercase tracking-wider mb-2">Menu</div>
              {['Dashboard', 'Invoices', 'Clients', 'Settings'].map(t => (
                <div key={t} className="px-4 py-2 rounded-lg bg-amber-50 border border-stone-900/10 font-medium">{t}</div>
              ))}
            </div>
            
            {/* Main Area */}
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-stone-900/50 text-sm mb-1">Total Volume (30d)</div>
                  <div className="text-4xl font-bold">$4,200 <span className="text-stone-900/40">USDC</span></div>
                </div>
                <div className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg font-bold text-sm border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">New Invoice</div>
              </div>

              <div className="bg-amber-50 rounded-xl border-2 border-stone-900 p-4">
                <div className="text-stone-900/40 text-sm font-bold mb-4 px-2">Recent Payments</div>
                <div className="flex flex-col gap-2">
                  {[
                    { c: 'Acme Corp', a: '$1,500.00', s: 'Paid' },
                    { c: 'Global Tech', a: '$2,400.00', s: 'Paid' },
                    { c: 'Startup Inc', a: '$300.00', s: 'Pending' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-stone-900/10">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B6B] border-2 border-stone-900" />
                        <span className="font-medium">{row.c}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-sm">{row.a}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${row.s === 'Paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-700' : 'bg-yellow-100 text-amber-700 border-amber-700'}`}>
                          {row.s}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const FooterCTA = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Ready to take control of your freelance income?
        </h2>
        <Link href="/dashboard" className="btn-primary px-12 py-6 rounded-2xl font-bold text-xl flex items-center gap-3">
          Launch App Now <ArrowUpRight size={24} />
        </Link>
      </div>
    </section>
  );
};

export default function MarketingLanding() {
  return (
    <main className="grain min-h-screen font-[var(--font-jakarta)] text-stone-900 overflow-hidden bg-[#FFF9F0]">
      
      {/* Minimal Header */}
      <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto right-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B6B] border-2 border-stone-900 flex items-center justify-center text-white shadow-[2px_2px_0px_#2D2323]">
            R
          </div>
          Recibo
        </Link>
        <div className="flex items-center gap-4">
          <GoogleTranslate />
          <button className="hidden md:block font-semibold text-sm hover:text-[#FF6B6B] transition-colors">Docs</button>
          <Link href="/dashboard" className="btn-ghost px-5 py-2.5 rounded-full font-semibold text-sm">
            App
          </Link>
        </div>
      </nav>

      <Hero />
      <TrustBar />
      <Stats />
      <Tools />
      <Features />
      <DashboardPreview />
      <FooterCTA />

      {/* Hackathon Banner */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="relative w-full rounded-[2.5rem] overflow-hidden h-64 md:h-80 flex items-center justify-center shadow-[6px_6px_0px_#2D2323] border-2 border-stone-900 bg-white">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 md:opacity-30 mix-blend-multiply"
            style={{ backgroundImage: 'url("/eth-mexico.png")' }}
          />
          <div className="absolute inset-0 bg-[#FFF9F0]/80" />
          
          <div className="relative z-10 text-center px-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900">
              Built for <span className="text-accent">Ethereum Mexico 2026</span> Hackathon
            </h2>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 text-stone-900/60 text-xs md:text-sm border-t-2 border-stone-900 max-w-7xl mx-auto text-center flex flex-col gap-6">
        <div className="font-semibold text-stone-900 flex flex-col gap-1">
          <p>© {new Date().getFullYear()}</p>
          <p>vsrupeshkumar (Blockchain engineer/Quantum researcher)</p>
          <p>Anand (Full-stack developer/Back-end developer/Smart contract engineer)</p>
          <p>Mansi (Full-stack developer/Blockchain engineer/UI engineer)</p>
          <p>All Rights Reserved.</p>
        </div>
        
        <p className="leading-relaxed max-w-4xl mx-auto">
          This platform, including its source code, system architecture, infrastructure design, backend systems, frontend implementation, APIs, databases, UI/UX, production workflows, and all related intellectual property, was designed and developed by the team: vsrupeshkumar, anand & mansi as Architect, System Designer, Frontend Developer, Backend Developer, and Production Engineer.
        </p>

        <p className="leading-relaxed max-w-4xl mx-auto">
          Unauthorized copying, reproduction, modification, redistribution, reverse engineering, resale, or commercial use of this platform or any portion of its codebase or architecture is strictly prohibited without explicit prior written permission from the author.
        </p>

        <p className="leading-relaxed max-w-4xl mx-auto">
          Any unauthorized use may result in legal action under applicable copyright and intellectual property laws.
        </p>
      </footer>
    </main>
  );
}
