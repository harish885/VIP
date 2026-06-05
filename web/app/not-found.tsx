import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { HomeLink } from '@/components/chrome/home-link';
import { ThemeToggle } from '@/components/chrome/theme-toggle';

export const metadata = { title: 'Not found' };

/**
 * 404 — written in the product's own register. An asset that can't be
 * found can't be valued; say so, then point at the two useful exits.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <HomeLink variant="fixed" />
      <ThemeToggle className="fixed right-4 top-6 z-50 sm:right-8" />

      <main className="w-full max-w-[560px]">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
          Error 404 · No data in scope
        </div>
        <h1 className="mt-4 font-serif text-[40px] font-medium leading-[1.05] tracking-tight text-text sm:text-[52px]">
          This asset could not <span className="text-gradient-gold italic">be valued.</span>
        </h1>
        <p className="mt-4 max-w-[46ch] text-[14.5px] leading-7 text-text-dim">
          The page you requested isn&rsquo;t in the calibration set — it may have
          moved, or it never filed with us in the first place. No multiple,
          no SQF, no GF. The honest output is: not found.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-md border border-gold/55 bg-gold/[0.14] px-4 py-2.5 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/[0.22]"
          >
            <Search size={14} /> Search the 14,999 companies
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-bg-1 px-4 py-2.5 text-[13px] font-semibold text-text-dim transition-colors hover:border-line-2 hover:text-text"
          >
            Back to home <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-10 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          V = EBITDA × M × SQF × GF · undefined for this URL
        </div>
      </main>
    </div>
  );
}
