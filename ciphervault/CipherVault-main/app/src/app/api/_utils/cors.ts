export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function handleCors(req: Request) {
  const allowed = ['https://kubryx.vercel.app', 'http://localhost:3000']
  const origin = req.headers.get('origin')
  const originHeader = origin && allowed.includes(origin) ? origin : 'https://kubryx.vercel.app'
  return {
    'Access-Control-Allow-Origin': originHeader,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
