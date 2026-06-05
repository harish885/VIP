import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

/**
 * Auth guards are ON: /companies (the whole app surface), /dashboard,
 * /diagnostic and /onboarding require a session. Flip to `false` to go
 * back to the open academic-demo mode.
 */
const ENFORCE_AUTH_GUARDS = true;

/**
 * updateSession
 *
 * Two jobs:
 *   1. Refresh the Supabase session cookie so a logged-in user doesn't get
 *      kicked out mid-flow.
 *   2. Route-guard /dashboard, /onboarding, /login, /signup (only when
 *      ENFORCE_AUTH_GUARDS is true).
 *
 * Important: per @supabase/ssr docs, DO NOT run code between
 * `createServerClient` and `supabase.auth.getUser()`. Anything else can race
 * with the session refresh and leave the browser with a stale cookie.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database, 'vip'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'vip' },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Triggers cookie refresh. Keep this immediately after createServerClient.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!ENFORCE_AUTH_GUARDS) {
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;
  const PROTECTED_PREFIXES = ['/companies', '/dashboard', '/diagnostic', '/onboarding'];
  const AUTH_PREFIXES = ['/login', '/signup'];

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth      = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuth) {
    // Pivot: send signed-in users straight to the company search;
    // the legacy /dashboard route just re-redirects there anyway.
    const url = request.nextUrl.clone();
    url.pathname = '/companies';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
