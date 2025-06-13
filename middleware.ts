import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Define public paths (unauthenticated access allowed)
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/reset-password',
  '/pricing',
  '/api/auth/callback', // Optional: If using Supabase OAuth callback
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths to proceed without session check
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return new Response(null, { status: 204 }) // Skip updateSession
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match all paths except for the following:
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
