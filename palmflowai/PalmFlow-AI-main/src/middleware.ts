import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const STATIC_ALLOWED_ORIGINS = [
  "https://kubryx.vercel.app",
  "https://kubryx-2xclq5gjr-vsrupeshoffl-5415s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];
const VERCEL_PREVIEW_RE = /^https:\/\/kubryx-[a-z0-9-]+\.vercel\.app$/i;

function corsHeadersFor(origin: string | null): Record<string, string> {
  const allowed =
    origin && (STATIC_ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW_RE.test(origin))
      ? origin
      : "https://kubryx.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith("/api");
  const origin = request.headers.get("origin");
  const corsHeaders = corsHeadersFor(origin);

  // Health check and any other unauthenticated routes must bypass Supabase
  // session refresh — otherwise a missing NEXT_PUBLIC_SUPABASE_URL env var
  // throws and Render's health probe sees 500.
  if (path === "/api/health") {
    return NextResponse.next();
  }

  if (isApiRoute && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  let response: NextResponse;
  try {
    response = await updateSession(request);
  } catch (err) {
    console.warn("[middleware] supabase updateSession failed:", err);
    response = NextResponse.next();
  }

  if (isApiRoute) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
