import Link from 'next/link';
import { Search, LogIn, ArrowRight } from 'lucide-react';
import { getUser } from '@/lib/auth';

const BASE_CLASSES =
  'inline-flex max-w-[56vw] items-center gap-1.5 rounded-md border border-line bg-bg-1/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-dim backdrop-blur-glass transition-colors hover:border-line-2 hover:text-text sm:max-w-none sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.2em]';

/**
 * Top-right CTA on the marketing site. Session-aware:
 *
 *   · signed out → "Sign in"        → /login
 *   · signed in  → "Find a company" → /companies
 *
 * Server component — reads the session via lib/auth.
 */
export async function AuthCta() {
  const user = await getUser();

  if (!user) {
    return (
      <Link href="/login" className={BASE_CLASSES}>
        <LogIn size={13} strokeWidth={2.25} className="shrink-0" />
        <span>Sign in</span>
        <ArrowRight size={11} strokeWidth={2.5} className="shrink-0" />
      </Link>
    );
  }

  return (
    <Link href="/companies" className={BASE_CLASSES}>
      <Search size={13} strokeWidth={2.25} className="shrink-0" />
      <span className="min-[390px]:hidden">Find</span>
      <span className="hidden min-[390px]:inline sm:hidden">Find company</span>
      <span className="hidden sm:inline">Find a company</span>
      <ArrowRight size={11} strokeWidth={2.5} className="shrink-0" />
    </Link>
  );
}
