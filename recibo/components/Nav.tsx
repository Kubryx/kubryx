'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.65)',
    transition: 'color 200ms',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px',
      background: 'rgba(5,8,15,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      transition: 'border-color 300ms ease',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <rect x="2" y="1" width="14" height="18" rx="2" stroke="#C8FF00" strokeWidth="1.5"/>
          <line x1="5" y1="6" x2="13" y2="6" stroke="#C8FF00" strokeWidth="1.2"/>
          <line x1="5" y1="9.5" x2="13" y2="9.5" stroke="#C8FF00" strokeWidth="1.2"/>
          <line x1="5" y1="13" x2="10" y2="13" stroke="#C8FF00" strokeWidth="1.2"/>
          <circle cx="17" cy="17" r="4" fill="#C8FF00"/>
          <path d="M15.2 17L16.4 18.2L18.8 15.8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>
          Recibo
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link href="/" style={linkStyle}>Inicio</Link>
        <Link href="/dashboard" style={linkStyle}>Crear factura</Link>
        <Link href="/history" style={linkStyle}>Mis facturas</Link>
      </div>

      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus="address"
      />
    </nav>
  );
}
