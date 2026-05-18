type Variant = 'active' | 'complete' | 'revoked' | 'pending' | 'warning' | 'idle'

const STYLES: Record<Variant, { bg: string; fg: string; border: string }> = {
  active: { bg: 'rgba(34,197,94,0.1)', fg: '#22C55E', border: 'rgba(34,197,94,0.4)' },
  complete: { bg: 'rgba(59,130,246,0.1)', fg: '#60A5FA', border: 'rgba(59,130,246,0.4)' },
  revoked: { bg: 'rgba(239,68,68,0.1)', fg: '#F87171', border: 'rgba(239,68,68,0.4)' },
  pending: { bg: 'rgba(245,197,24,0.1)', fg: '#F5C518', border: 'rgba(245,197,24,0.4)' },
  warning: { bg: 'rgba(245,158,11,0.1)', fg: '#F59E0B', border: 'rgba(245,158,11,0.4)' },
  idle: { bg: 'rgba(156,163,175,0.1)', fg: '#9CA3AF', border: 'rgba(156,163,175,0.4)' },
}

export default function StatusBadge({
  status,
}: {
  status: string | undefined
}) {
  const v = (status?.toLowerCase() as Variant) || 'idle'
  const s = STYLES[v] || STYLES.idle
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'capitalize',
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.fg,
        }}
      />
      {status || 'unknown'}
    </span>
  )
}
