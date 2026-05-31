export interface FullInvoice {
  id: string;
  clientName: string;
  clientEmail: string;
  description: string;
  amountUSD: number;
  amountUSDC: string;
  dueDate: string;
  freelancerAddress: string;
  status: 'pending' | 'paid';
  createdAt: string;
  paymentURL: string;
  payTxHash?: string;
  approveTxHash?: string;
}

const KEY = (id: string) => `recibo_inv_${id}`;

export const saveInvoice = (inv: FullInvoice) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY(inv.id), JSON.stringify(inv));
};

export const getInvoice = (id: string): FullInvoice | null => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEY(id)) ?? 'null'); } catch { return null; }
};

export const listInvoices = (): FullInvoice[] => {
  if (typeof window === 'undefined') return [];
  const items: FullInvoice[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('recibo_inv_')) {
      try {
        const v = localStorage.getItem(k);
        if (v) items.push(JSON.parse(v));
      } catch {}
    }
  }
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const markPaid = (id: string, payTxHash: string, approveTxHash?: string) => {
  const inv = getInvoice(id);
  if (inv) saveInvoice({ ...inv, status: 'paid', payTxHash, approveTxHash });
};
