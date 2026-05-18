export default function LiveBadge({ isLive }: { isLive: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 500,
        background: isLive ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.03)',
        border: isLive
          ? '1px solid rgba(34,197,94,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        color: isLive ? '#22C55E' : '#bbb',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isLive ? '#22C55E' : '#bbb',
        }}
      />
      {isLive ? 'Live · TrustMesh API' : 'Demo data'}
    </span>
  )
}
