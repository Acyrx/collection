import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match all paths except for the following:
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
