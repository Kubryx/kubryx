export interface InvoicePayload {
  id: string;
  to: string;
  amount: string;       // USDC in 6-decimal units as string
  amountDisplay: string; // "$300.00"
  desc: string;
  client: string;
  due: string;
}

export function encodeInvoice(payload: InvoicePayload): string {
  const safe = {
    ...payload,
    desc: payload.desc.slice(0, 80),
    client: payload.client.slice(0, 60),
  };
  const json = JSON.stringify(safe);
  // btoa only handles Latin1, use encodeURIComponent first for Unicode safety
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encodeURIComponent(encoded);
}

export function decodeInvoice(raw: string): InvoicePayload | null {
  try {
    const decoded = decodeURIComponent(raw);
    const json = decodeURIComponent(escape(atob(decoded)));
    const parsed = JSON.parse(json) as InvoicePayload;
    
    // Validate required fields
    if (!parsed.id || !parsed.to || !parsed.amount || !parsed.amountDisplay) {
      return null;
    }
    
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(parsed.to)) {
      return null;
    }
    
    // Validate amount is a numeric string
    if (isNaN(Number(parsed.amount))) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}
