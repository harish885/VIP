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
      className="fixed right-4 top-6 z-50 inline-flex max-w-[56vw] items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.10] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-glass transition-all hover:-translate-y-0.5 hover:bg-gold/[0.18] sm:right-8 sm:max-w-none sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-eyebrow"
    >
      <Search size={13} strokeWidth={2.25} className="shrink-0" />
      <span className="min-[390px]:hidden">Find</span>
      <span className="hidden min-[390px]:inline sm:hidden">Find company</span>
      <span className="hidden sm:inline">Find a company</span>
      <ArrowRight size={11} strokeWidth={2.5} className="shrink-0" />
    </Link>
  );
}
