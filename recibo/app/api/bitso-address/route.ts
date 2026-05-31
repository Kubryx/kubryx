import { NextResponse } from 'next/server';
import { validateEnv, env } from '@/lib/env';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
  try {
    validateEnv();
    
    const nonce = Date.now().toString();
    const method = 'GET';
    const path = '/api/v3/funding_destination/?fund_currency=USDCARB';
    const message = `${nonce}${method}${path}`;
    
    const signature = crypto
      .createHmac('sha256', env.bitsoSecret)
      .update(message)
      .digest('hex');
    
    const authHeader = `Bitso ${env.bitsoKey}:${nonce}:${signature}`;
    
    const bitsoRes = await fetch(`https://api.bitso.com${path}`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    if (!bitsoRes.ok) {
      console.error('Bitso API error:', bitsoRes.status, await bitsoRes.text());
      // Return a fallback for demo purposes if Bitso API fails
      return NextResponse.json({
        address: '0x0000000000000000000000000000000000000000',
        fallback: true,
        message: 'Bitso API no disponible. Usa la dirección de tu cuenta Bitso manualmente.',
      });
    }
    
    const data = await bitsoRes.json();
    const address = data?.payload?.account_identifier?.value || 
                    data?.payload?.deposit_address ||
                    null;
    
    if (!address) {
      return NextResponse.json(
        { error: 'No se pudo obtener la dirección de depósito' },
        { status: 422 }
      );
    }
    
    return NextResponse.json({ address });
    
  } catch (error) {
    console.error('bitso-address error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
