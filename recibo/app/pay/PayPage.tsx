'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  useAccount, useChainId,
  useReadContract, useWriteContract, useWaitForTransactionReceipt,
} from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { decodeInvoice, InvoicePayload } from '@/lib/invoiceCodec';
import { erc20Abi, reciboAbi } from '@/lib/abi';
import { ARBITRUM_SEPOLIA_CHAIN_ID, USDC_ADDRESS, CONTRACT_ADDRESS } from '@/lib/wagmi';
import Nav from '@/components/Nav';
import NetworkWarning from '@/components/NetworkWarning';
import StepRow from '@/components/StepRow';
import BitsoPanel from '@/components/BitsoPanel';
import { markPaid } from '@/lib/invoiceStore';

type Phase = 'idle' | 'approving' | 'approve_confirming' | 'approved' | 'paying' | 'pay_confirming' | 'paid';

function invoiceIdToBytes32(id: string): `0x${string}` {
  return keccak256(stringToBytes(id));
}

function getErrorMessage(err: unknown): string {
  if (!err) return '';
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('User rejected') || msg.includes('User denied')) return 'Rechazaste la transacción en tu wallet';
  if (msg.length > 120) return msg.slice(0, 120) + '…';
  return msg;
}

export default function PayPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('d') ?? '';

  const invoice: InvoicePayload | null = useMemo(() => raw ? decodeInvoice(raw) : null, [raw]);
  const decodeError = raw !== '' && invoice === null;

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const onCorrectChain = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;

  // On-chain paid status check
  const { data: onChainPaid, isLoading: isCheckingPaid } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: reciboAbi,
    functionName: 'paid',
    args: invoice ? [invoiceIdToBytes32(invoice.id)] : undefined,
    query: { enabled: !!invoice && onCorrectChain },
  });

  const [phase, setPhase] = useState<Phase>('idle');
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [payTxHash, setPayTxHash] = useState<`0x${string}` | undefined>();
  const [activeError, setActiveError] = useState<unknown>(null);

  // Sync phase with on-chain state
  useEffect(() => {
    if (onChainPaid) setPhase('paid');
  }, [onChainPaid]);

  // Balance and allowance reads
  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && onCorrectChain },
  });

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && CONTRACT_ADDRESS ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS && onCorrectChain },
  });

  const amountBig = invoice ? BigInt(invoice.amount) : BigInt(0);
  const hasEnoughBalance = balance !== undefined && balance >= amountBig;
  const isApproved = allowance !== undefined && allowance >= amountBig;
  const balanceDisplay = balance !== undefined ? `$${(Number(balance) / 1_000_000).toFixed(2)} USDC` : '—';

  useEffect(() => {
    if (isApproved && phase === 'idle') setPhase('approved');
  }, [isApproved, phase]);

  // Write hooks
  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writePay } = useWriteContract();

  // Receipt watchers
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    query: { enabled: !!approveTxHash },
  });

  const { isSuccess: payConfirmed } = useWaitForTransactionReceipt({
    hash: payTxHash,
    query: { enabled: !!payTxHash },
  });

  useEffect(() => {
    if (approveConfirmed && phase === 'approve_confirming') setPhase('approved');
  }, [approveConfirmed, phase]);

  useEffect(() => {
    if (payConfirmed && phase === 'pay_confirming' && invoice) {
      markPaid(invoice.id, payTxHash ?? '', approveTxHash);
      setPhase('paid');
    }
  }, [payConfirmed, phase, invoice, payTxHash, approveTxHash]);

  const doApprove = useCallback(async () => {
    if (!invoice || !CONTRACT_ADDRESS) return;
    setActiveError(null);
    setPhase('approving');
    try {
      const hash = await writeApprove({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, amountBig],
      });
      setApproveTxHash(hash);
      setPhase('approve_confirming');
    } catch (e) {
      setActiveError(e);
      setPhase('idle');
    }
  }, [invoice, amountBig, writeApprove]);

  const doPay = useCallback(async () => {
    if (!invoice || !CONTRACT_ADDRESS) return;
    setActiveError(null);
    setPhase('paying');
    try {
      const hash = await writePay({
        address: CONTRACT_ADDRESS,
        abi: reciboAbi,
        functionName: 'payInvoice',
        args: [invoiceIdToBytes32(invoice.id), invoice.to as `0x${string}`, amountBig],
      });
      setPayTxHash(hash);
      setPhase('pay_confirming');
    } catch (e) {
      setActiveError(e);
      setPhase('approved');
    }
  }, [invoice, amountBig, writePay]);

  // Step status derivation
  const step1Status: 'pending' | 'active' | 'complete' =
    phase === 'paid' || phase === 'approved' || phase === 'paying' || phase === 'pay_confirming'
      ? 'complete'
      : phase === 'approving' || phase === 'approve_confirming'
        ? 'active'
        : 'pending';

  const step2Status: 'pending' | 'active' | 'complete' =
    phase === 'paid'
      ? 'complete'
      : phase === 'paying' || phase === 'pay_confirming'
        ? 'active'
        : 'pending';

  // Button config
  const buttonConfig = useMemo(() => {
    if (!isConnected) return { label: 'Conecta tu wallet para continuar', disabled: true, handler: undefined };
    if (!onCorrectChain) return { label: 'Cambia a Arbitrum Sepolia', disabled: true, handler: undefined };
    if (isCheckingPaid) return { label: 'Verificando estado en cadena···', disabled: true, handler: undefined };
    if (!CONTRACT_ADDRESS) return { label: 'Contrato no configurado', disabled: true, handler: undefined };
    if (!hasEnoughBalance && phase !== 'paid') return { label: 'Saldo USDC insuficiente', disabled: true, handler: undefined };
    if (phase === 'paid') return { label: 'Pago confirmado ✓', disabled: true, handler: undefined };
    if (phase === 'approving') return { label: 'Esperando confirmación···', disabled: true, handler: undefined };
    if (phase === 'approve_confirming') return { label: 'Confirmando aprobación en cadena···', disabled: true, handler: undefined };
    if (phase === 'paying') return { label: 'Esperando confirmación···', disabled: true, handler: undefined };
    if (phase === 'pay_confirming') return { label: 'Procesando pago en Arbitrum···', disabled: true, handler: undefined };
    if (phase === 'approved') return { label: 'Confirmar pago →', disabled: false, handler: doPay };
    return { label: 'Aprobar USDC →', disabled: false, handler: doApprove };
  }, [isConnected, onCorrectChain, isCheckingPaid, hasEnoughBalance, phase, doApprove, doPay]);

  if (decodeError) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Nav />
        <div style={{ maxWidth: '520px', margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
          <div className="card">
            <p className="label-accent" style={{ marginBottom: '12px' }}>ENLACE INVÁLIDO</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
              Este enlace no es válido
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.65 }}>
              El enlace de pago no es válido o ha expirado. Solicita un nuevo enlace al freelancer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Nav />
        <div style={{ paddingTop: '160px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-data)', color: 'var(--accent)' }}>Cargando factura···</p>
        </div>
      </div>
    );
  }

  const isLoadingState = ['approving', 'approve_confirming', 'paying', 'pay_confirming'].includes(phase);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <NetworkWarning />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '120px 24px 96px' }}>
        {/* Invoice card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span className="label">RECIBO DE PAGO</span>
            <span className="mono" style={{ color: 'var(--faint)', fontSize: '11px' }}>
              INV-{invoice.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="divider" />

          <div style={{ textAlign: 'center', margin: '28px 0' }}>
            <p className="label" style={{ marginBottom: '8px' }}>TOTAL A PAGAR</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,6vw,72px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {invoice.amountDisplay}
            </p>
            <p className="label-accent" style={{ marginTop: '6px' }}>USDC · ARBITRUM SEPOLIA</p>
          </div>
          <div className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([
              ['PARA:', `${invoice.to.slice(0, 6)}···${invoice.to.slice(-4)}`, 'var(--font-data)'],
              ['CLIENTE:', invoice.client || '—', 'var(--font-body)'],
              ['DESCRIPCIÓN:', invoice.desc || '—', 'var(--font-body)'],
              ['VENCE:', invoice.due || '—', 'var(--font-body)'],
              ['RED:', 'Arbitrum Sepolia', 'var(--font-body)'],
            ] as const).map(([k, v, font]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <span className="label">{k}</span>
                <span style={{ fontFamily: font, fontSize: '13px', color: 'var(--muted)', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Balance row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', background: 'var(--bg3)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-input)',
          marginTop: '16px',
        }}>
          <span className="label">TU SALDO USDC EN ARBITRUM</span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '14px', color: 'var(--white)' }}>
            {!isConnected ? '—' : balanceDisplay}
            {isConnected && balance !== undefined && !hasEnoughBalance && (
              <span className="label" style={{ marginLeft: '8px', color: 'var(--white)' }}>INSUFICIENTE</span>
            )}
          </span>
        </div>

        {/* Step rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '32px 0' }}>
          <StepRow
            number="01"
            label="APROBAR GASTO DE USDC"
            sublabel="Tu wallet autoriza el monto exacto. Requisito estándar de Ethereum — no es un cobro adicional."
            status={step1Status}
          />
          <StepRow
            number="02"
            label="CONFIRMAR PAGO"
            sublabel="El USDC se transfiere directo a la wallet del freelancer. El contrato emite un evento como recibo permanente."
            status={step2Status}
            disabled={step1Status !== 'complete'}
          />
        </div>

        {/* Action button */}
        <button
          onClick={buttonConfig.handler ?? undefined}
          disabled={buttonConfig.disabled}
          className={phase === 'paid' ? '' : 'btn-primary'}
          style={{
            width: '100%', height: '60px', fontSize: '16px',
            fontWeight: 600, borderRadius: 'var(--r-pill)',
            ...(phase === 'paid' ? {
              background: 'var(--accent)', color: 'var(--accent-fg)',
              border: 'none', cursor: 'default',
              fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            } : {}),
            ...(isLoadingState ? {
              background: 'var(--bg3)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-data)',
              fontSize: '13px',
              letterSpacing: '0.02em',
            } : {}),
          }}
        >
          {buttonConfig.label}
        </button>

        {activeError !== null && (
          <p className="label" style={{ marginTop: '12px', color: 'var(--white)', textAlign: 'center' }}>
            ERROR · {getErrorMessage(activeError)}
          </p>
        )}

        {/* Tx hashes */}
        {(approveTxHash || payTxHash) && (
          <div style={{ marginTop: '16px', padding: '20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-input)' }}>
            {approveTxHash && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: payTxHash ? '10px' : 0 }}>
                <span className="label">TX APROBACIÓN:</span>
                <a href={`https://sepolia.arbiscan.io/tx/${approveTxHash}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--accent)', textDecoration: 'underline' }}>
                  {approveTxHash.slice(0, 10)}···{approveTxHash.slice(-6)} ↗
                </a>
              </div>
            )}
            {payTxHash && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label">TX PAGO:</span>
                <a href={`https://sepolia.arbiscan.io/tx/${payTxHash}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--accent)', textDecoration: 'underline' }}>
                  {payTxHash.slice(0, 10)}···{payTxHash.slice(-6)} ↗
                </a>
              </div>
            )}
          </div>
        )}

        <BitsoPanel visible={phase === 'paid'} amountDisplay={invoice.amountDisplay} />
      </div>
    </div>
  );
}
