'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface BitsoPanelProps {
  visible: boolean;
  amountDisplay: string;
}

export default function BitsoPanel({ visible, amountDisplay }: BitsoPanelProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || address) return;
    
    setLoading(true);
    fetch('/api/bitso-address')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.fallback) {
          setFallbackMessage(data.message);
          setAddress(data.address);
        } else {
          setAddress(data.address);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [visible, address]);

  if (!visible) return null;

  return (
    <div className="mt-8 overflow-hidden transition-all duration-380 ease-out border border-[#C8FF00]/30 rounded-2xl bg-[#0D1017] shadow-[0_0_48px_rgba(200,255,0,0.08)]">
      <div className="p-8">
        <h3 className="text-2xl text-white font-syne font-semibold mb-2">Retira tu USDC a Bitso</h3>
        <p className="text-white/55 font-dm text-sm mb-6">
          Tu USDC ya está en tu wallet. Deposítalo en Bitso para convertir a pesos mexicanos y transferir a tu CLABE.
        </p>

        {loading ? (
          <div className="text-[#C8FF00] font-mono text-xs">Generando dirección de depósito...</div>
        ) : error ? (
          <div className="text-red-400 font-mono text-xs uppercase">Error: {error}</div>
        ) : address ? (
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={address} size={160} />
            </div>
            
            <div className="flex-1 w-full">
              <div className="text-[10px] text-white/55 font-mono mb-2 uppercase">Escanea con tu wallet · USDC en Arbitrum</div>
              <div className="bg-[#141820] p-4 rounded-xl mb-4 font-mono text-sm text-[#C8FF00] break-all border border-white/10">
                {address}
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-[#C8FF00] text-black font-dm font-medium text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity w-full md:w-auto"
              >
                {copied ? '¡Copiado!' : 'Copiar dirección'}
              </button>

              {fallbackMessage && (
                <div className="mt-4 text-orange-400 font-mono text-xs">{fallbackMessage}</div>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 pt-6 border-t border-white/10 text-white/30 font-mono text-[10px] uppercase">
          Una vez que el USDC llega a Bitso, la conversión a MXN es procesada automáticamente. Los fondos aparecen en tu cuenta en 1–2 horas.
        </div>
      </div>
    </div>
  );
}
