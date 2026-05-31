'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { encodeInvoice } from '@/lib/invoiceCodec';
import { saveInvoice } from '@/lib/invoiceStore';
import { v4 as uuidv4 } from 'uuid';

export default function InvoiceCreator() {
  const [invoiceText, setInvoiceText] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fieldsFilledCount, setFieldsFilledCount] = useState(0);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [freelancerWallet, setFreelancerWallet] = useState('');

  const [generatedURL, setGeneratedURL] = useState('');
  const [copied, setCopied] = useState(false);

  const { address, isConnected } = useAccount();

  const handleParse = useCallback(async () => {
    if (!invoiceText.trim()) return;
    setParseLoading(true);
    setParseError(null);
    setFieldsFilledCount(0);
    
    try {
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceText }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error desconocido');
      }
      
      const data = await res.json();
      let filled = 0;
      
      if (data.clientName) { setClientName(data.clientName); filled++; }
      if (data.clientEmail) { setClientEmail(data.clientEmail); filled++; }
      if (data.description) { setDescription(data.description); filled++; }
      if (data.amountUSD) { setAmountUSD(String(data.amountUSD)); filled++; }
      if (data.dueDate) { setDueDate(data.dueDate); filled++; }
      
      setFieldsFilledCount(filled);
      
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Error al parsear');
    } finally {
      setParseLoading(false);
    }
  }, [invoiceText]);

  const useConnectedWallet = useCallback(() => {
    if (address) setFreelancerWallet(address);
  }, [address]);

  const amountUSDC6 = amountUSD 
    ? BigInt(Math.round(parseFloat(amountUSD) * 1_000_000)).toString()
    : '0';

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleGenerate = useCallback(() => {
    if (!description || !amountUSD || !isValidAddress(freelancerWallet)) return;
    
    const id = uuidv4();
    const payload = {
      id,
      to: freelancerWallet,
      amount: amountUSDC6,
      amountDisplay: `$${parseFloat(amountUSD).toFixed(2)}`,
      desc: description.slice(0, 80),
      client: clientName || 'Cliente',
      due: dueDate || '',
    };
    
    const encoded = encodeInvoice(payload);
    const url = `${window.location.origin}/pay?d=${encoded}`;
    
    saveInvoice({
      id,
      clientName: clientName || '',
      clientEmail: clientEmail || '',
      description,
      amountUSD: parseFloat(amountUSD),
      amountUSDC: amountUSDC6,
      dueDate,
      freelancerAddress: freelancerWallet,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentURL: url,
    });
    
    setGeneratedURL(url);
  }, [description, amountUSD, freelancerWallet, amountUSDC6, clientName, clientEmail, dueDate]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedURL]);

  const canGenerate = 
    description.trim().length > 0 && 
    parseFloat(amountUSD) > 0 && 
    isValidAddress(freelancerWallet);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left panel - Input */}
      <div className="w-full md:w-[48%] overflow-y-auto border-r border-white/10 p-6 md:p-12">
        <label className="block text-[#C8FF00] font-mono text-[11px] mb-2 uppercase">TEXTO DE FACTURA</label>
        <textarea 
          className="w-full min-h-[200px] bg-[#0D1017] border border-white/10 rounded-xl p-4 font-mono text-[13px] text-white focus:outline-none focus:border-[#C8FF00]/50 mb-4"
          placeholder="Pega aquí tu factura — texto de un PDF, un email, un CFDI, o un mensaje de WhatsApp..."
          value={invoiceText}
          onChange={(e) => setInvoiceText(e.target.value)}
        />
        
        <button
          onClick={handleParse}
          disabled={parseLoading || !invoiceText.trim()}
          className={`w-full h-[52px] rounded-full font-syne font-semibold text-black transition-all ${
            parseLoading ? 'bg-[#141820] text-[#C8FF00] border border-[#C8FF00]/30' : 'bg-[#C8FF00] hover:opacity-90'
          }`}
        >
          {parseLoading ? 'Analizando con Claude···' : 'Parsear con IA'}
        </button>

        {parseError && (
          <div className="mt-4 text-red-400 font-mono text-xs text-center">
            {parseError}
          </div>
        )}

        {fieldsFilledCount > 0 && (
          <div className="mt-6 mb-2 text-[#C8FF00] font-mono text-[11px] uppercase">
            IA COMPLETÓ {fieldsFilledCount} CAMPOS · REVISA ANTES DE CONTINUAR
          </div>
        )}

        <div className="space-y-6 mt-8">
          <div>
            <label className="block text-white/55 font-mono text-[11px] mb-2">NOMBRE DEL CLIENTE</label>
            <input 
              type="text"
              className="w-full bg-[#0D1017] border border-white/10 rounded-lg p-3 text-white font-dm focus:outline-none focus:border-[#C8FF00]/30"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/55 font-mono text-[11px] mb-2">EMAIL DEL CLIENTE</label>
            <input 
              type="email"
              className="w-full bg-[#0D1017] border border-white/10 rounded-lg p-3 text-white font-dm focus:outline-none focus:border-[#C8FF00]/30"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/55 font-mono text-[11px] mb-2">DESCRIPCIÓN DEL SERVICIO</label>
            <input 
              type="text"
              className="w-full bg-[#0D1017] border border-white/10 rounded-lg p-3 text-white font-dm focus:outline-none focus:border-[#C8FF00]/30"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/55 font-mono text-[11px] mb-2">MONTO (USD)</label>
            <input 
              type="number"
              className="w-full bg-[#0D1017] border border-white/10 rounded-lg p-3 text-white font-dm focus:outline-none focus:border-[#C8FF00]/30"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
            />
            <div className="mt-2 text-white/30 font-mono text-[10px] uppercase">
              EL MONTO SE COBRA EN USDC · 1 USDC = 1 USD
            </div>
          </div>
          <div>
            <label className="block text-white/55 font-mono text-[11px] mb-2">FECHA LÍMITE DE PAGO</label>
            <input 
              type="date"
              className="w-full bg-[#0D1017] border border-white/10 rounded-lg p-3 text-white font-dm focus:outline-none focus:border-[#C8FF00]/30"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white/55 font-mono text-[11px]">TU WALLET EN ARBITRUM</label>
              <button onClick={useConnectedWallet} className="text-[#C8FF00] font-mono text-[11px] hover:underline">
                Usar wallet conectada
              </button>
            </div>
            <input 
              type="text"
              className="w-full bg-[#0D1017] border border-white/10 rounded-lg p-3 text-white font-dm focus:outline-none focus:border-[#C8FF00]/30"
              value={freelancerWallet}
              onChange={(e) => setFreelancerWallet(e.target.value)}
            />
            <div className="mt-2 text-white/30 font-mono text-[10px] uppercase">
              EL CLIENTE PAGA DIRECTO A ESTA DIRECCIÓN · RECIBO NUNCA LA ALMACENA
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full h-[60px] rounded-full mt-10 font-syne font-semibold transition-all ${
            canGenerate ? 'bg-[#C8FF00] text-black hover:opacity-90' : 'bg-[#141820] text-white/30 cursor-not-allowed border border-white/10'
          }`}
        >
          {canGenerate ? 'Generar enlace de pago →' : 'COMPLETA LOS CAMPOS REQUERIDOS'}
        </button>

        {generatedURL && (
          <div className="mt-8 p-6 bg-[#0D1017] border border-[#C8FF00]/25 rounded-2xl animate-in slide-in-from-bottom-4">
            <div className="text-white font-mono text-sm break-all mb-6 p-4 bg-[#141820] rounded-xl">
              {generatedURL}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleCopy}
                className="flex-1 bg-[#C8FF00] text-black font-dm font-medium h-[48px] rounded-full hover:opacity-90 transition-opacity"
              >
                {copied ? '¡Copiado!' : 'Copiar enlace'}
              </button>
              <a 
                href={generatedURL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 border border-white/20 text-white font-dm font-medium h-[48px] rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                Abrir enlace →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Right panel - Preview */}
      <div className="w-full md:w-[52%] overflow-y-auto p-6 md:p-12 bg-[#05080F]">
        <div className="mb-8">
          <div className="text-white text-xl font-syne font-semibold">Vista previa del pago</div>
          <div className="text-[#C8FF00] font-mono text-[11px] uppercase mt-2">Lo que verá tu cliente</div>
        </div>

        <div className="bg-[#0D1017] rounded-3xl p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="text-white/55 font-mono text-[11px] uppercase mb-1">RECIBO DE PAGO</div>
          <div className="text-white font-mono text-sm mb-12 opacity-80">
            INV-{generatedURL ? generatedURL.slice(-8).toUpperCase() : 'XXXXXXXX'}
          </div>

          <div className="mb-12">
            <div className="text-white text-5xl md:text-7xl font-syne font-bold tracking-tight">
              ${parseFloat(amountUSD || '0').toFixed(2)}
            </div>
            <div className="text-[#C8FF00] font-mono text-sm mt-4">USDC · ARBITRUM SEPOLIA</div>
          </div>

          <div className="space-y-6 border-t border-white/10 pt-8 mb-12">
            <div className="flex justify-between items-start">
              <div className="text-white/40 font-mono text-[11px] w-32 uppercase">PARA</div>
              <div className="text-white font-mono text-sm text-right">
                {isValidAddress(freelancerWallet) 
                  ? `${freelancerWallet.slice(0,6)}...${freelancerWallet.slice(-4)}`
                  : '0x0000...0000'}
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="text-white/40 font-mono text-[11px] w-32 uppercase">DESCRIPCIÓN</div>
              <div className="text-white font-dm text-right flex-1 ml-4 break-words">
                {description || '—'}
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="text-white/40 font-mono text-[11px] w-32 uppercase">VENCE</div>
              <div className="text-white font-dm text-right">
                {dueDate 
                  ? new Date(dueDate + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </div>
            </div>
          </div>

          <div className="pointer-events-none opacity-50">
            <button className="w-full h-[60px] bg-white text-black rounded-full font-syne font-semibold text-lg cursor-not-allowed">
              Pagar con USDC
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-white/30 font-mono text-[10px] uppercase max-w-sm mx-auto">
          Los datos de pago se codifican en la URL. No hay base de datos.
        </div>
      </div>
    </div>
  );
}
