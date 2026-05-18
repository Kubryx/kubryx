const STATIC_ALLOWED = [
  'https://kubryx.vercel.app',
  'https://kubryx-2xclq5gjr-vsrupeshoffl-5415s-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
]
const VERCEL_PREVIEW_RE = /^https:\/\/kubryx-[a-z0-9-]+\.vercel\.app$/i

function originAllowed(origin: string | null): string {
  if (origin && (STATIC_ALLOWED.includes(origin) || VERCEL_PREVIEW_RE.test(origin))) {
    return origin
  }
  return 'https://kubryx.vercel.app'
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function handleCors(req: Request) {
  const origin = req.headers.get('origin')
  return {
    'Access-Control-Allow-Origin': originAllowed(origin),
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
