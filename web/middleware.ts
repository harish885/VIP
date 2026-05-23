import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js middleware — runs on every request the matcher matches.
 *
 * Currently in "demo mode" — auth route-guards are disabled so anyone can
 * visit /dashboard and /onboarding without signing in. updateSession still
 * runs to keep the Supabase session cookie fresh if a user IS logged in.
 *
 * Hot paths that don't need session refresh on every hit short-circuit
 * here:
 *   · /api/companies/search — typeahead autocomplete fires per keystroke.
 *     It uses the service-role client server-side, never reads the user
 *     session, so we let it through without paying the auth round-trip.
 *
 * To re-enable gating later, flip the flag at the top of
 * lib/supabase/middleware.ts.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/companies/search')) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
