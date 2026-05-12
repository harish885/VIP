import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

/**
 * Top-right CTA on the marketing site.
 *
 * Currently in demo mode — always links to /companies (the search-first
 * entry point added in the pivot). When we re-enable auth (see middleware
 * ENFORCE_AUTH_GUARDS flag), swap this for the session-aware version.
 */
export function AuthCta() {
  return (
    <Link
      href="/companies"
      className="fixed right-8 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.10] px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-gold backdrop-blur-glass transition-all hover:-translate-y-0.5 hover:bg-gold/[0.18]"
    >
      <Search size={13} strokeWidth={2.25} />
      Find a company
      <ArrowRight size={11} strokeWidth={2.5} />
    </Link>
  );
}
