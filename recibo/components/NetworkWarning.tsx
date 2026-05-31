'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ARBITRUM_SEPOLIA_CHAIN_ID } from '@/lib/wagmi';

export default function NetworkWarning() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === ARBITRUM_SEPOLIA_CHAIN_ID) return null;

  return (
    <div style={{
      width: '100%', height: '48px', background: 'var(--bg3)',
      borderTop: '1px solid var(--border-accent)', borderBottom: '1px solid var(--border-accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
      position: 'sticky', top: '64px', zIndex: 90,
    }}>
      <span className="label">CAMBIA TU RED A ARBITRUM SEPOLIA</span>
      <button
        className="btn-ghost"
        onClick={() => switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID })}
        disabled={isPending}
      >
        {isPending ? 'CAMBIANDO···' : 'CAMBIAR AUTOMÁTICAMENTE →'}
      </button>
    </div>
  );
}
