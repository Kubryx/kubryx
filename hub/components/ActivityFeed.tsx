'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useDashboardActivity } from '@/hooks/useDashboardActivity'

const BORDER = 'rgba(255,255,255,0.08)'
const MUTED  = 'rgba(255,255,255,0.6)'
const MUTED2 = 'rgba(255,255,255,0.35)'
const GREEN  = '#10b981'
const MONO   = '"Fira Code","JetBrains Mono",monospace'

export default function ActivityFeed() {
  const { feed } = useDashboardActivity()

  return (
    <div style={{ margin: '24px', marginTop: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED2 }}>
            Live Activity Feed
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            Real-time network events
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20,
          background: `${GREEN}1a`, border: `1px solid ${GREEN}40`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: GREEN,
            boxShadow: `0 0 0 0 ${GREEN}`,
            animation: 'pulse 1.6s ease-out infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>Live</span>
        </div>
      </div>

      {/* Feed list */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: 8,
        maxHeight: 420,
        overflowY: 'auto',
      }}>
        <AnimatePresence initial={false}>
          {feed.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 16, height: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 12px 12px 14px',
                borderLeft: `2px solid ${item.protocolColor}`,
                borderRadius: 6,
                marginBottom: 4,
                background: 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: `${item.protocolColor}20`,
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 700,
                color: item.protocolColor,
              }}>
                {item.protocol[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.protocolColor }}>
                    {item.protocol}
                  </span>
                  <span style={{ fontSize: 12, color: '#fff' }}>
                    {item.action}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  {item.detail}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: MUTED2 }}>
                  <span style={{ fontFamily: MONO }}>{item.address}</span>
                  <span>·</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 ${GREEN}80; }
          70%  { box-shadow: 0 0 0 8px ${GREEN}00; }
          100% { box-shadow: 0 0 0 0 ${GREEN}00; }
        }
      `}</style>
    </div>
  )
}
