'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { listInvoices, FullInvoice } from '@/lib/invoiceStore';

export default function HistoryPage() {
  const [invoices, setInvoices] = useState<FullInvoice[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInvoices(listInvoices());
    setLoaded(true);
  }, []);

  const copyLink = async (id: string, url: string) => {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 24px 96px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
          <div>
            <p className="label" style={{ marginBottom: '8px' }}>RECIBO · /HISTORY</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Mis facturas
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
              Las facturas se guardan localmente en tu navegador.
            </p>
          </div>
          <Link href="/dashboard" className="btn-primary">
            Nueva factura →
          </Link>
        </div>

        {!loaded && (
          <p style={{ fontFamily: 'var(--font-data)', color: 'var(--accent)' }}>Cargando···</p>
        )}

        {loaded && invoices.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
            <p className="label-accent" style={{ marginBottom: '12px' }}>SIN FACTURAS AÚN</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              No has generado ninguna factura
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '380px', margin: '0 auto 24px' }}>
              Crea tu primera factura y compártela con tu cliente. El enlace de pago aparecerá aquí.
            </p>
            <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-flex' }}>
              Crear primera factura →
            </Link>
          </div>
        )}

        {loaded && invoices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.map((inv) => (
              <div key={inv.id} className="card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>
                        INV-{inv.id.slice(0, 8).toUpperCase()}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--white)', fontWeight: 500, marginBottom: '4px' }}>
                      {inv.description || '—'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted)' }}>
                      {inv.clientName || 'Cliente'} · vence {inv.dueDate || '—'} · creado {fmtDate(inv.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                      ${inv.amountUSD.toFixed(2)}
                    </p>
                    <p className="label-accent" style={{ marginTop: '2px' }}>USDC</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => copyLink(inv.id, inv.paymentURL)}
                    style={{ height: '38px', fontSize: '13px', padding: '0 20px' }}
                  >
                    {copiedId === inv.id ? 'Copiado ✓' : 'Copiar enlace'}
                  </button>
                  <a
                    href={inv.paymentURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ height: '38px', fontSize: '13px', padding: '0 20px' }}
                  >
                    Abrir →
                  </a>
                  {inv.payTxHash && (
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${inv.payTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      style={{ alignSelf: 'center' }}
                    >
                      TX EN ARBISCAN ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'paid' }) {
  const isPaid = status === 'paid';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '2px 10px', borderRadius: 'var(--r-pill)',
      background: isPaid ? 'rgba(200,255,0,0.10)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${isPaid ? 'rgba(200,255,0,0.25)' : 'rgba(255,255,255,0.10)'}`,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: isPaid ? 'var(--accent)' : 'rgba(255,255,255,0.40)',
      }} />
      <span className="label" style={{ color: isPaid ? 'var(--accent)' : 'var(--muted)' }}>
        {isPaid ? 'PAGADO' : 'PENDIENTE'}
      </span>
    </span>
  );
}
