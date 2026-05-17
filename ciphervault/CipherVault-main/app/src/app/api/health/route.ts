import { NextResponse } from 'next/server'
import { handleCors } from '../_utils/cors'

export async function GET(req: Request) {
  return NextResponse.json({ status: 'ok', service: 'ciphervault' }, { headers: handleCors(req) })
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: handleCors(req) })
}
