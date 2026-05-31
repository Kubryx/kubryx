'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { decodeInvoice, InvoicePayload } from '@/lib/invoiceCodec';
import { erc20Abi, reciboAbi } from '@/lib/abi';
import { ARBITRUM_SEPOLIA_CHAIN_ID, USDC_ADDRESS, CONTRACT_ADDRESS } from '@/lib/wagmi';
import BitsoPanel from '@/components/BitsoPanel';
import StepRow from '@/components/StepRow';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type PaymentState =
  | 'idle'
  | 'wrong_network'
  | 'ready'
  | 'checking_balance'
  | 'insufficient_balance'
  | 'approving'
  | 'approve_confirming'
  | 'approve_done'
  | 'paying'
  | 'pay_confirming'
  | 'paid'
  | 'error';

function PaymentContent() {
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<InvoicePayload | null>(null);
  const [decodeError, setDecodeError] = useState(false);

  useEffect(() => {
    const d = searchParams.get('d');
    if (!d) { setDecodeError(true); return; }
    const decoded = decodeInvoice(d);
    if (!decoded) { setDecodeError(true); return; }
    setInvoice(decoded);
  }, [searchParams]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectChain = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isCorrectChain },
  });

  const invoiceAmount = invoice ? BigInt(invoice.amount) : BigInt(0);
  const hasEnoughBalance = usdcBalance !== undefined && usdcBalance >= invoiceAmount;

  const { data: currentAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && CONTRACT_ADDRESS ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address && isCorrectChain && !!CONTRACT_ADDRESS },
  });

  const isAlreadyApproved = currentAllowance !== undefined && currentAllowance >= invoiceAmount;

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: approveIsPending,
    error: approveWriteError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: approveIsConfirming,
    isSuccess: approveIsConfirmed,
    error: approveReceiptError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const handleApprove = useCallback(() => {
    if (!invoice || !CONTRACT_ADDRESS) return;
    writeApprove({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, invoiceAmount],
    });
  }, [invoice, invoiceAmount, writeApprove]);

  const {
    writeContract: writePay,
    data: payTxHash,
    isPending: payIsPending,
    error: payWriteError,
    reset: resetPay,
  } = useWriteContract();

  const {
    isLoading: payIsConfirming,
    isSuccess: payIsConfirmed,
    error: payReceiptError,
  } = useWaitForTransactionReceipt({
    hash: payTxHash,
  });

  const handlePay = useCallback(() => {
    if (!invoice || !CONTRACT_ADDRESS) return;
    
    // Convert UUID to bytes32
    const invoiceIdBytes32 = `0x${invoice.id.replace(/-/g, '').slice(0, 32).padEnd(64, '0')}` as `0x${string}`;
    
    writePay({
      address: CONTRACT_ADDRESS,
      abi: reciboAbi,
      functionName: 'payInvoice',
      args: [invoiceIdBytes32, invoice.to as `0x${string}`, invoiceAmount],
    });
  }, [invoice, invoiceAmount, writePay]);

  const paymentState: PaymentState = (() => {
    if (!isConnected) return 'idle';
    if (!isCorrectChain) return 'wrong_network';
    if (payIsConfirmed) return 'paid';
    if (payIsConfirming) return 'pay_confirming';
    if (payIsPending) return 'paying';
    if (approveIsConfirmed || isAlreadyApproved) return 'approve_done';
    if (approveIsConfirming) return 'approve_confirming';
    if (approveIsPending) return 'approving';
    if (usdcBalance === undefined) return 'checking_balance';
    if (!hasEnoughBalance) return 'insufficient_balance';
    return 'ready';
  })();

  const activeError = approveWriteError || approveReceiptError || payWriteError || payReceiptError;

  const getErrorMessage = (error: Error): string => {
    const msg = error.message.toLowerCase();
    if (msg.includes('user rejected') || msg.includes('denied')) 
      return 'Transacción rechazada en tu wallet.';
    if (msg.includes('insufficient funds')) 
      return 'Fondos insuficientes para el gas.';
    if (msg.includes('transfer failed')) 
      return 'La transferencia de USDC falló. Verifica tu saldo y aprobación.';
    if (msg.includes('network') || msg.includes('timeout')) 
      return 'Error de red. Verifica tu conexión e intenta de nuevo.';
    return 'Error en la transacción. Intenta de nuevo.';
  };

  const buttonConfig = {
    idle: { label: 'Conecta tu wallet para continuar', handler: undefined, disabled: true },
    wrong_network: { label: 'Cambia a Arbitrum Sepolia', handler: () => switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }), disabled: false },
    ready: { label: 'Aprobar USDC →', handler: handleApprove, disabled: false },
    checking_balance: { label: 'Verificando saldo···', handler: undefined, disabled: true },
    insufficient_balance: { label: 'Saldo insuficiente de USDC', handler: undefined, disabled: true },
    approving: { label: 'Esperando confirmación en tu wallet···', handler: undefined, disabled: true },
    approve_confirming: { label: 'Confirmando aprobación···', handler: undefined, disabled: true },
    approve_done: { label: 'Confirmar Pago →', handler: handlePay, disabled: false },
    paying: { label: 'Esperando confirmación en tu wallet···', handler: undefined, disabled: true },
    pay_confirming: { label: 'Procesando en Arbitrum···', handler: undefined, disabled: true },
    paid: { label: 'Pago Confirmado ✓', handler: undefined, disabled: true },
    error: { label: 'Reintentar', handler: () => { resetApprove(); resetPay(); }, disabled: false },
  }[activeError ? 'error' : paymentState];

  const step1Status = (() => {
    if (['idle', 'wrong_network', 'ready', 'insufficient_balance', 'checking_balance'].includes(paymentState)) return 'pending';
    if (['approving', 'approve_confirming'].includes(paymentState)) return 'active';
    return 'complete';
  })();

  const step2Status = (() => {
    if (['paid'].includes(paymentState)) return 'complete';
    if (['paying', 'pay_confirming'].includes(paymentState)) return 'active';
    return 'pending';
  })();

  useEffect(() => {
    if (paymentState === 'paid') {
      refetchBalance();
    }
  }, [paymentState, refetchBalance]);

  if (decodeError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl text-white font-syne font-semibold mb-4">Enlace inválido</h2>
        <p className="text-white/55 font-dm max-w-md mx-auto">
          Este enlace de pago no es válido o ha expirado. Solicita un nuevo enlace al freelancer.
        </p>
      </div>
    );
  }

  if (!invoice) return <div className="p-12 text-center text-[#C8FF00] font-mono">Cargando factura···</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-syne text-white font-bold">Realizar pago</h1>
        <ConnectButton showBalance={false} />
      </div>

      {!isCorrectChain && isConnected && (
        <div className="bg-[#141820] text-center py-3 mb-6 rounded-lg text-sm font-mono text-white/80">
          CAMBIA TU RED A ARBITRUM SEPOLIA · 
          <button onClick={() => switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID })} className="text-[#C8FF00] ml-2 hover:underline">
            CAMBIAR AUTOMÁTICAMENTE →
          </button>
        </div>
      )}

      <div className="bg-[#0D1017] rounded-3xl p-8 border border-white/5 shadow-2xl mb-8">
        <div className="text-white/55 font-mono text-[11px] uppercase mb-8">RECIBO DE PAGO · {invoice.id.split('-')[0]}</div>
        
        <div className="text-white text-5xl md:text-7xl font-syne font-bold tracking-tight mb-2">
          {invoice.amountDisplay}
        </div>
        <div className="text-[#C8FF00] font-mono text-sm mb-12">USDC · ARBITRUM SEPOLIA</div>

        <div className="space-y-4 border-t border-white/10 pt-8 mb-8">
          <div className="flex justify-between">
            <span className="text-white/40 font-mono text-[11px] uppercase">PARA</span>
            <span className="text-white font-mono text-sm">{invoice.to}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40 font-mono text-[11px] uppercase">DESCRIPCIÓN</span>
            <span className="text-white font-dm">{invoice.desc}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40 font-mono text-[11px] uppercase">VENCE</span>
            <span className="text-white font-dm">{invoice.due}</span>
          </div>
          {isConnected && isCorrectChain && (
            <div className="flex justify-between border-t border-white/5 pt-4 mt-4">
              <span className="text-white/40 font-mono text-[11px] uppercase">TU SALDO USDC</span>
              <span className={`font-mono text-sm ${hasEnoughBalance ? 'text-[#C8FF00]' : 'text-red-400'}`}>
                {usdcBalance !== undefined ? `${(Number(usdcBalance) / 1_000_000).toFixed(2)} USDC` : '···'}
                {!hasEnoughBalance && usdcBalance !== undefined && ' (INSUFICIENTE)'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <StepRow 
          number="01" 
          label="APROBAR GASTO DE USDC" 
          status={step1Status} 
          sublabel="Tu wallet necesita autorizar que el contrato de Recibo pueda transferir exactamente este monto en USDC. Es un requisito estándar de Ethereum."
        />
        <StepRow 
          number="02" 
          label="CONFIRMAR PAGO" 
          status={step2Status} 
          sublabel="El USDC se transfiere directo de tu wallet a la del freelancer. El contrato emite un evento como recibo permanente."
        />
      </div>

      <div className="text-center">
        <button
          onClick={buttonConfig.handler}
          disabled={buttonConfig.disabled}
          className={`w-full h-[60px] rounded-full font-syne font-semibold text-lg transition-all ${
            paymentState === 'paid' ? 'bg-[#C8FF00] text-black cursor-default' :
            buttonConfig.disabled ? 'bg-[#141820] text-white/50 cursor-not-allowed border border-white/10' :
            activeError ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' :
            'bg-white text-black hover:bg-[#C8FF00] hover:text-black'
          }`}
        >
          {buttonConfig.label}
        </button>
        
        {activeError && (
          <div className="mt-4 text-red-400 font-mono text-[11px] uppercase">
            ERROR · {getErrorMessage(activeError)}
          </div>
        )}
      </div>

      {paymentState === 'paid' && (
        <div className="mt-8 space-y-3">
          {approveTxHash && (
            <div className="bg-[#0D1017] p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <span className="text-white/40 font-mono text-[11px]">TX APROBACIÓN</span>
              <a href={`https://sepolia.arbiscan.io/tx/${approveTxHash}`} target="_blank" rel="noreferrer" className="text-[#C8FF00] font-mono text-xs hover:underline">
                {approveTxHash.slice(0, 10)}...{approveTxHash.slice(-8)}
              </a>
            </div>
          )}
          {payTxHash && (
            <div className="bg-[#0D1017] p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <span className="text-white/40 font-mono text-[11px]">TX PAGO</span>
              <a href={`https://sepolia.arbiscan.io/tx/${payTxHash}`} target="_blank" rel="noreferrer" className="text-[#C8FF00] font-mono text-xs hover:underline">
                {payTxHash.slice(0, 10)}...{payTxHash.slice(-8)}
              </a>
            </div>
          )}
          
          <BitsoPanel visible={true} amountDisplay={invoice.amountDisplay} />
        </div>
      )}
    </div>
  );
}

export default function PayPage() {
  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#C8FF00] font-mono">Cargando···</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
