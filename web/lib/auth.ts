import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * getUser — server-side helper to fetch the current user.
 *
 * `supabase.auth.getUser()` verifies the JWT against the Supabase Auth server
 * (vs `getSession()` which just reads the cookie). Use this whenever the
 * decision matters (RLS-protected query, server action, page guard).
 *
 * Returns `null` if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * getUserOrRedirect — server-side guard. Returns the user, or redirects to
 * /login. Use in server components inside the (app) route group as a last
 * line of defence even though middleware already redirects.
 *
 * `next/navigation`'s `redirect` returns `never`, so TypeScript narrows the
 * post-call path to `User` automatically.
 */
export async function getUserOrRedirect(): Promise<User> {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}
