'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Server actions for the auth route group.
 *
 * All four follow the same pattern:
 *   1. Parse FormData
 *   2. Call the appropriate Supabase Auth method
 *   3. Return { ok, error? } so the calling form can render inline feedback
 *      — OR redirect on success.
 *
 * `'use server'` is at the file scope, so every export here is a Server
 * Action callable from a client form.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Sign up with email + password.
 *
 * Behaviour depends on the Supabase project's "Confirm email" setting:
 *   - If OFF: account is created and session is immediately established →
 *     we redirect to /onboarding.
 *   - If ON: account is created but inert until the user clicks the email
 *     link → we redirect to /verify?email=... to show "check your inbox".
 */
export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || null },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) return { ok: false, error: error.message };

  // Session established immediately → confirmations are off.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/onboarding');
  }

  // Otherwise the user needs to click the email link first.
  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

/**
 * Sign in with email + password.
 */
export async function signInAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  redirect(next.startsWith('/') ? next : '/dashboard');
}

/**
 * Send a magic-link email — alternative to password sign-in.
 */
export async function signInWithMagicLinkAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!email) return { ok: false, error: 'Email is required.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) return { ok: false, error: error.message };

  redirect(`/verify?email=${encodeURIComponent(email)}&mode=magic`);
}

/**
 * Sign out and bounce home.
 */
export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Resolve the site URL for email redirects.
 * Falls back to localhost in dev; on Vercel reads NEXT_PUBLIC_SITE_URL or
 * the auto-injected VERCEL_URL.
 */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
