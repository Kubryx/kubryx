'use client';

import { useEffect, useRef } from 'react';
import {
  Shield, TrendingUp, Split, Zap, Lock, Bot, Heart, EyeOff,
  X, ExternalLink, ArrowRight,
} from 'lucide-react';
import { EcosystemTool } from '@/lib/ecosystem-tools';

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Shield, TrendingUp, Split, Zap, Lock, Bot, Heart, EyeOff,
};

interface Props {
  tool: EcosystemTool | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EcosystemPanel({ tool, isOpen, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const IconComp = tool ? ICON_MAP[tool.icon] : null;

  return (
    <>
      {/* Subtle backdrop — sits between page and panel, but below sidebar (z-38) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 38,
            background: 'rgba(45,35,35,0.06)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            transition: 'opacity 0.25s',
          }}
          onClick={onClose}
        />
      )}

      {/* ── Desktop panel ── */}
      <div
        ref={panelRef}
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          bottom: 16,
          width: 320,
          zIndex: 45,
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid rgba(45,35,35,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(24px) scale(0.97)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {tool && <PanelContent tool={tool} onClose={onClose} IconComp={IconComp} />}
      </div>

      {/* ── Mobile panel (slides up) ── */}
      <div
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: 56,
          left: 8,
          right: 8,
          zIndex: 45,
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '16px 16px 12px 12px',
          border: '1px solid rgba(45,35,35,0.1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          maxHeight: '62vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% + 64px))',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {tool && <PanelContent tool={tool} onClose={onClose} IconComp={IconComp} />}
      </div>
    </>
  );
}

function PanelContent({
  tool,
  onClose,
  IconComp,
}: {
  tool: EcosystemTool;
  onClose: () => void;
  IconComp: React.FC<{ size?: number; color?: string; strokeWidth?: number }> | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(45,35,35,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Icon */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${tool.color}12`,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}>
              {IconComp && <IconComp size={18} color={tool.color} strokeWidth={2} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#2D2323',
                  letterSpacing: '-0.01em',
                }}>
                  {tool.name}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: tool.status === 'live' ? '#DCFCE7' : '#FEF9C3',
                  color: tool.status === 'live' ? '#15803D' : '#854D0E',
                }}>
                  {tool.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(45,35,35,0.4)', marginTop: 1 }}>
                {tool.chain} · {tool.description}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(45,35,35,0.06)',
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(45,35,35,0.1)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(45,35,35,0.06)'}
          >
            <X size={13} strokeWidth={2.2} color="rgba(45,35,35,0.6)" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>

        {/* Title + description */}
        <div>
          <h3 style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#2D2323',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}>
            {tool.previewTitle}
          </h3>
          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'rgba(45,35,35,0.6)',
            margin: 0,
          }}>
            {tool.previewDescription}
          </p>
        </div>

        {/* Stats — 3 small chips in a row */}
        <div style={{ display: 'flex', gap: 6 }}>
          {tool.previewStats.map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              background: `${tool.color}08`,
              borderRadius: 8,
              padding: '8px 6px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: tool.color,
                letterSpacing: '-0.01em',
                marginBottom: 2,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(45,35,35,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Connection line */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '10px 12px',
          background: `${tool.color}08`,
          borderRadius: 10,
          borderLeft: `3px solid ${tool.color}`,
        }}>
          <ArrowRight size={13} color={tool.color} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              color: tool.color,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 3,
            }}>
              Connects to invoices
            </div>
            <p style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#2D2323',
              margin: 0,
              lineHeight: 1.45,
            }}>
              {tool.howItConnects}
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(45,35,35,0.07)',
        flexShrink: 0,
      }}>
        <a
          href="https://kubryx.vercel.app/invoice"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '10px 0',
            borderRadius: 10,
            background: tool.color,
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
          onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          Use {tool.name} in Ruphex
          <ExternalLink size={13} strokeWidth={2.2} />
        </a>
        <p style={{
          textAlign: 'center',
          fontSize: 10,
          color: 'rgba(45,35,35,0.3)',
          margin: '8px 0 0',
          letterSpacing: '0.04em',
        }}>
          All 8 tools live inside kubryx.vercel.app
        </p>
      </div>
    </div>
  );
}
