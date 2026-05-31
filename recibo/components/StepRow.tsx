'use client';

interface StepRowProps {
  number: string;
  label: string;
  sublabel?: string;
  status: 'pending' | 'active' | 'complete';
  disabled?: boolean;
}

export default function StepRow({ number, label, sublabel, status, disabled }: StepRowProps) {
  return (
    <div>
      <div
        className={`step-row ${status} ${disabled ? 'disabled' : ''}`}
        style={{ marginBottom: sublabel ? '6px' : 0 }}
      >
        <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: status === 'complete' ? 'var(--accent-fg)' : 'var(--faint)', minWidth: '24px' }}>
          {number}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, flex: 1 }}>
          {label}
        </span>
        <span className="label" style={{ color: status === 'complete' ? 'var(--accent-fg)' : 'var(--faint)' }}>
          {status === 'pending' ? 'PENDIENTE' : status === 'active' ? 'EN CURSO' : 'COMPLETADO'}
        </span>
      </div>
      {sublabel && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--faint)', lineHeight: 1.55, padding: '0 4px', marginTop: '4px' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
