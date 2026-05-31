'use client';

import { useEffect, useState } from 'react';
import {
  Shield, TrendingUp, Split, Zap, Lock, Bot, Heart, EyeOff,
} from 'lucide-react';
import { ECOSYSTEM_TOOLS } from '@/lib/ecosystem-tools';

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Shield, TrendingUp, Split, Zap, Lock, Bot, Heart, EyeOff,
};

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function EcosystemSidebar({ selectedId, onSelect }: Props) {
  const [hasActivity, setHasActivity] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const keys = Object.keys(localStorage).filter(
        k => k.startsWith('recibo_inv_') || k.startsWith('kubryx_inv_')
      );
      setHasActivity(keys.length > 0);
    } catch {}
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ── Desktop: slim left bar ── */}
      <aside
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 52,
          zIndex: 40,
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(45,35,35,0.1)',
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {/* Ruphex K logo */}
        <a
          href="https://kubryx.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="Ruphex Financial OS"
          style={{ display: 'block', marginBottom: 10, textDecoration: 'none' }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #3B5BFA, #8B5CF6)',
            display: 'grid', placeItems: 'center',
            fontSize: 13, fontWeight: 900, color: '#fff',
          }}>
            K
          </div>
        </a>

        {/* Thin divider */}
        <div style={{
          width: 28, height: 1,
          background: 'rgba(45,35,35,0.1)',
          marginBottom: 8,
        }} />

        {/* Tool icon list */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          padding: '0 6px',
        }}>
          {ECOSYSTEM_TOOLS.map(tool => {
            const IconComp = ICON_MAP[tool.icon];
            const isActive = selectedId === tool.id;
            return (
              <div key={tool.id} style={{ position: 'relative', width: '100%' }}>
                <button
                  onClick={() => onSelect(tool.id)}
                  onMouseEnter={() => setTooltip(tool.id)}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    width: '100%',
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: isActive ? `${tool.color}15` : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseOver={e => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = 'rgba(45,35,35,0.05)';
                  }}
                  onMouseOut={e => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {IconComp && (
                    <IconComp
                      size={16}
                      color={isActive ? tool.color : 'rgba(45,35,35,0.45)'}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  )}
                  {/* Active indicator — left bar */}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 2,
                      borderRadius: 2,
                      background: tool.color,
                    }} />
                  )}
                  {/* Small dot */}
                  <span style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: tool.color,
                    opacity: isActive ? 1 : 0.5,
                  }} />
                </button>

                {/* Tooltip */}
                {tooltip === tool.id && (
                  <div style={{
                    position: 'absolute',
                    left: 'calc(100% + 10px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#2D2323',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 60,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {tool.name}
                    {/* arrow */}
                    <span style={{
                      position: 'absolute',
                      right: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderRight: '5px solid #2D2323',
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom: activity dot */}
        <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {hasActivity && (
            <div
              title="Invoice activity"
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 5px #22C55E',
                animation: 'kpulse 2s infinite',
              }}
            />
          )}
        </div>
      </aside>

      {/* ── Mobile: bottom icon strip ── */}
      <div
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 40,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(45,35,35,0.1)',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 4px',
        }}
      >
        {ECOSYSTEM_TOOLS.map(tool => {
          const IconComp = ICON_MAP[tool.icon];
          const isActive = selectedId === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: 36,
                height: 44,
                borderRadius: 8,
                background: isActive ? `${tool.color}15` : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {IconComp && (
                <IconComp
                  size={16}
                  color={isActive ? tool.color : 'rgba(45,35,35,0.4)'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              )}
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: tool.color,
                opacity: 0.7,
              }} />
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes kpulse {
          0%,100% { opacity:1; }
          50% { opacity:0.3; }
        }
      `}</style>
    </>
  );
}
