import Link from 'next/link';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

/**
 * Top-right CTA on the marketing site.
 *
 * Currently in demo mode — always links to /dashboard. When we re-enable
 * auth (see middleware ENFORCE_AUTH_GUARDS flag), swap this for the
 * session-aware version that shows "Sign in / Get started" or "Dashboard"
 * depending on auth state.
 */
export function AuthCta() {
  return (
    <Link
      href="/dashboard"
      className="fixed right-8 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.10] px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-gold backdrop-blur-glass transition-all hover:-translate-y-0.5 hover:bg-gold/[0.18]"
    >
      <LayoutDashboard size={13} strokeWidth={2.25} />
      Open Dashboard
      <ArrowRight size={11} strokeWidth={2.5} />
    </Link>
  );
}
