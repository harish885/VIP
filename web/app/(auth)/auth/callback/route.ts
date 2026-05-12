import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * /auth/callback?code=...&next=...
 *
 * Where Supabase redirects after the user clicks a magic-link or
 * email-confirmation link. We swap the `code` for a session and bounce the
 * user to `next` (or /onboarding by default).
 *
 * Anything that goes wrong → /login?error=…
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Safe redirect: only allow relative paths.
  const target = next.startsWith('/') ? next : '/onboarding';
  return NextResponse.redirect(`${origin}${target}`);
}
