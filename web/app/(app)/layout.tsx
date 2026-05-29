import Link from 'next/link';
import { BookOpen, Sparkles, Search } from 'lucide-react';
import { HomeLink } from '@/components/chrome/home-link';
import { CommandPalette } from '@/components/chrome/command-palette';

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
      <header className="relative z-10 border-b border-line bg-bg-1/90 backdrop-blur-glass">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <HomeLink variant="inline" />
          </div>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Primary">
            <Link
              href="/companies"
              aria-label="Companies"
              title="Companies"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:px-3"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Companies</span>
            </Link>
            <Link
              href="/how-it-works"
              aria-label="How it works"
              title="How it works"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:px-3"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">How it works</span>
            </Link>
            <Link
              href="/method"
              aria-label="Method"
              title="Method"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:px-3"
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Method</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      {/* Global Cmd-K command palette — search + recent companies */}
      <CommandPalette />
    </div>
  );
}
