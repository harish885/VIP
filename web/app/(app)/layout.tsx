import Link from 'next/link';
import { BookOpen, Sparkles, Search } from 'lucide-react';
import { HomeLink } from '@/components/chrome/home-link';

/**
 * App shell — slim chrome with the VIP home button on the left, a quick
 * link to the company search, and the methodology links on the right.
 *
 * The VIP mark uses the shared HomeLink component, so it behaves the same
 * way as on every other route group (marketing, auth) and always returns
 * the user to `/`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 18% 0%, rgba(176, 122, 26, 0.05), transparent 65%),
            radial-gradient(ellipse 60% 60% at 90% 25%, rgba(21, 127, 137, 0.04), transparent 65%)
          `,
        }}
      />

      <header className="relative z-10 border-b border-line bg-bg-1/85 backdrop-blur-glass">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <HomeLink variant="inline" />
            <Link
              href="/companies"
              className="hidden items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 py-1.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:inline-flex"
            >
              <Search size={13} />
              Companies
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 py-1.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:px-3"
            >
              <Sparkles size={13} />
              How it works
            </Link>
            <Link
              href="/method"
              className="hidden items-center gap-1.5 rounded-md border border-line bg-bg-1 px-3 py-1.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:inline-flex"
            >
              <BookOpen size={13} />
              How scores are calculated
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}
