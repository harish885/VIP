import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * HomeLink — the top-left "VIP" home button.
 *
 * Single source of truth for the chrome brand mark across every route
 * group. Always navigates to `/` so users can reach home from any page
 * (marketing, auth, app).
 *
 * Two presentations:
 *   · variant="fixed"  — floats top-left over the page (marketing, auth)
 *   · variant="inline" — sits inline inside a header bar (app shell)
 */
export function HomeLink({
  variant = 'fixed',
  className,
}: {
  variant?: 'fixed' | 'inline';
  className?: string;
}) {
  const base =
    'group flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-text transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-md';

  const placement =
    variant === 'fixed'
      ? 'fixed left-4 top-6 z-50 sm:left-8'
      : 'min-w-0 shrink-0';

  return (
    <Link
      href="/"
      aria-label="VIP · Home"
      className={cn(base, placement, className)}
    >
      <span
        aria-hidden
        className="block h-[20px] w-[20px] shrink-0 rounded-[5px] border border-text/10 bg-text"
      />
      <span className="text-[12px] tracking-[0.22em] sm:text-[13px]">VIP</span>
    </Link>
  );
}
