import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { validateEnv, env } from '@/lib/env';

export const runtime = 'nodejs';

interface ParsedInvoice {
  clientName: string | null;
  clientEmail: string | null;
  description: string | null;
  amountUSD: number | null;
  dueDate: string | null;
  notes: string | null;
}

export async function POST(req: NextRequest) {
  try {
    validateEnv();
    
    const body = await req.json();
    const { invoiceText } = body as { invoiceText: string };
    
    if (!invoiceText || invoiceText.trim().length < 5) {
      return NextResponse.json(
        { error: 'Texto de factura muy corto o vacío' },
        { status: 400 }
      );
    }
    
    if (invoiceText.length > 8000) {
      return NextResponse.json(
        { error: 'Texto demasiado largo. Máximo 8000 caracteres.' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const client = new Anthropic({ apiKey: env.anthropicKey });

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Updated to match current sonnet model version
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Eres un asistente de facturación para freelancers en América Latina.
Extrae los campos del siguiente texto de factura.

REGLAS IMPORTANTES:
- Si el monto está escrito en palabras (ej: "trescientos dólares"), conviértelo a número (300)
- Si ves montos en MXN, ARS, COP, BRL u otras monedas LATAM, conviértelos a USD usando tasas aproximadas razonables y anota la conversión en el campo "notes"
- MXN: divide entre 17. ARS: divide entre 900. COP: divide entre 4000. BRL: divide entre 5.
- Si hay IVA o impuestos mencionados, inclúyelos en el monto total
- El campo "dueDate" debe ser YYYY-MM-DD. Si dice "a 30 días" o "net 30", calcula desde hoy: ${today}
- Si dice "inmediato" o "al recibir", usa la fecha de hoy: ${today}
- Si no encuentras un campo, usa null. Nunca inventes datos.
- El monto debe ser un número, no un string. Si no hay monto claro, usa null.

Responde SOLO con JSON válido. Sin texto antes ni después. Sin backticks. Sin markdown.

{
  "clientName": string | null,
  "clientEmail": string | null,
  "description": string | null,
  "amountUSD": number | null,
  "dueDate": string | null,
  "notes": string | null
}

TEXTO DE FACTURA:
${invoiceText}`
      }]
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Strip any markdown fences Claude might add despite instructions
    const cleaned = rawText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsed: ParsedInvoice;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Claude response was not valid JSON:', cleaned);
      return NextResponse.json(
        { error: 'La IA no pudo estructurar la respuesta. Intenta con un texto más claro.' },
        { status: 422 }
      );
    }

    // Sanitize: ensure amountUSD is a number or null
    if (parsed.amountUSD !== null && typeof parsed.amountUSD !== 'number') {
      parsed.amountUSD = parseFloat(String(parsed.amountUSD).replace(/[^0-9.]/g, '')) || null;
    }

    // Sanitize: ensure dueDate is YYYY-MM-DD or null
    if (parsed.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.dueDate)) {
      parsed.dueDate = null;
    }

    return NextResponse.json(parsed);
    
  } catch (error) {
    console.error('parse-invoice error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
