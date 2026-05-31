'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { encodeInvoice } from '@/lib/invoiceCodec';
import { saveInvoice } from '@/lib/invoiceStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import GoogleTranslate from '@/components/GoogleTranslate';

export default function Landing() {
  const [invoiceText, setInvoiceText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [clientName, setClientName] = useState('');
  const [amountUSD, setAmountUSD] = useState(0);
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const { address } = useAccount();

  const handleGenerate = useCallback(async () => {
    if (!invoiceText.trim()) {
      toast.error('Please paste some invoice details first.');
      return;
    }
    if (!address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceText }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      
      const parsedClient = data.clientName || 'Unknown Client';
      const parsedAmount = parseFloat(data.amountUSD) || 0;
      const parsedDesc = data.description || 'Invoice Payment';
      const parsedEmail = data.clientEmail || '';
      const parsedDueDate = data.dueDate || '';
      
      setClientName(parsedClient);
      setAmountUSD(parsedAmount);
      setDescription(parsedDesc);

      const id = uuidv4();
      const amountUSDC = BigInt(Math.round(parsedAmount * 1_000_000)).toString();
      
      const payload = {
        id, 
        to: address,
        amount: amountUSDC,
        amountDisplay: `$${parsedAmount.toFixed(2)}`,
        desc: parsedDesc.slice(0, 80),
        client: parsedClient,
        due: parsedDueDate,
      };
      
      const encoded = encodeInvoice(payload);
      const link = `${window.location.origin}/pay?d=${encoded}`;
      
      saveInvoice({
        id, 
        clientName: parsedClient, 
        clientEmail: parsedEmail, 
        description: parsedDesc,
        amountUSD: parsedAmount, 
        amountUSDC,
        dueDate: parsedDueDate, 
        freelancerAddress: address,
        status: 'pending', 
        createdAt: new Date().toISOString(),
        paymentURL: link,
      });
      
      setUrl(link);
      setStep(2);
      toast.success('Smart link generated successfully!');
      
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  }, [invoiceText, address]);

  const handleCopyLink = useCallback(async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success('Payment link copied to clipboard!');
  }, [url]);

  return (
    <main className="grain min-h-screen flex flex-col font-[var(--font-jakarta)] relative text-stone-900 bg-[#FFF9F0]">
      <nav className="flex items-center justify-between px-6 py-4 relative z-10 w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B6B] border-2 border-stone-900 flex items-center justify-center text-white shadow-[2px_2px_0px_#2D2323]">
            R
          </div>
          Recibo
        </Link>
        <div className="flex items-center gap-4">
          <GoogleTranslate />
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-3xl mx-auto text-center">
        
        <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400 border-2 border-stone-900 text-stone-900 font-semibold text-sm mb-6 shadow-[3px_3px_0px_#2D2323]">
          AI-Powered Payments for LATAM
        </p>
        
        <h1 className="page-title mb-6 leading-tight">
          Get Paid in <span className="text-accent">USDC</span>, Instantly.
        </h1>
        
        <p className="text-stone-900/65 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Turn any client email or PDF into an instant crypto payment link. No banks, no 8% fees.
        </p>

        <div className="module-card w-full p-6 md:p-8 text-left relative overflow-hidden bg-white">
          {step === 1 ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B6B]">
                  <Bot size={18} />
                  <span>AI Invoice Parser</span>
                </div>
                {!address && (
                  <span className="text-xs font-semibold text-stone-900 bg-yellow-400 px-2 py-1 rounded-md border border-stone-900">
                    Wallet required to receive funds
                  </span>
                )}
              </div>
              
              <textarea 
                className="w-full h-40 p-4 bg-amber-50 border-2 border-stone-900 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 transition-all text-stone-900"
                placeholder="Paste invoice details, client email, or terms here..."
                value={invoiceText}
                onChange={(e) => setInvoiceText(e.target.value)}
              />
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !address}
                className="btn-primary w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_#2D2323]"
              >
                {isGenerating ? 'Analyzing with Groq...' : 'Generate Smart Link'}
                {!isGenerating && <ArrowRight size={20} />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b-2 border-stone-900/10 pb-4">
                <div className="flex flex-col">
                  <span className="text-sm text-stone-900/60 uppercase tracking-wider font-semibold mb-1">Receipt for</span>
                  <span className="text-xl font-bold">{clientName || 'Unknown Client'}</span>
                </div>
                <div className="badge-network">
                  Arbitrum Network
                </div>
              </div>

              <div className="flex flex-col gap-2 py-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-stone-900/70 font-medium truncate pr-4">{description || 'Invoice Payment'}</span>
                  <span className="font-semibold whitespace-nowrap">${amountUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-900/60">Platform Fee</span>
                  <span className="text-[#FF6B6B] font-semibold">0%</span>
                </div>
                <div className="h-px bg-stone-900/10 my-2" />
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total (USDC)</span>
                  <span className="text-accent">${amountUSD.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1 py-3 rounded-2xl font-semibold"
                >
                  Edit
                </button>
                <button 
                  className="btn-primary flex-[2] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  onClick={handleCopyLink}
                >
                  Copy Payment Link
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 flex items-center justify-center gap-6 md:gap-10 text-stone-900/50 text-sm font-semibold uppercase tracking-wider flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">
            <ShieldCheck size={18} className="text-[#FF6B6B]" />
            <span>Arbitrum</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">
            <ShieldCheck size={18} className="text-[#FF8A65]" />
            <span>Bitso</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">
            <ShieldCheck size={18} className="text-stone-900" />
            <span>Groq AI</span>
          </div>
        </div>

      </section>
    </main>
  );
}
