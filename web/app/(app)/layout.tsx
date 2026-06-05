import Link from 'next/link';
import { BookOpen, Search, LogOut } from 'lucide-react';
import { HomeLink } from '@/components/chrome/home-link';
import { CommandPalette } from '@/components/chrome/command-palette';
import { ThemeToggle } from '@/components/chrome/theme-toggle';
import { getUser } from '@/lib/auth';
import { signOutAction } from '@/app/(auth)/actions';

const NAV_LINK_CLASSES =
  'inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text sm:px-3';

/**
 * App shell — slim chrome with the VIP home button on the left, the
 * company search + methodology links in the middle, and the signed-in
 * user (email + sign out) on the right.
 *
 * The VIP mark uses the shared HomeLink component, so it behaves the same
 * way as on every other route group (marketing, auth) and always returns
 * the user to `/`.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <div className="relative min-h-screen">
      <header className="relative z-10 border-b border-line bg-bg-1/90 backdrop-blur-glass">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <HomeLink variant="inline" />
          </div>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Primary">
            <Link href="/companies" aria-label="Companies" title="Companies" className={NAV_LINK_CLASSES}>
              <Search size={13} />
              <span className="hidden sm:inline">Companies</span>
            </Link>
            <Link href="/how-it-works" aria-label="How it works" title="How it works" className={NAV_LINK_CLASSES}>
              <BookOpen size={13} />
              <span className="hidden sm:inline">How it works</span>
            </Link>
            <ThemeToggle />

            {user && (
              <div className="ml-1 flex items-center gap-1.5 border-l border-line pl-2.5 sm:ml-2 sm:pl-3">
                <span
                  className="hidden max-w-[180px] truncate font-mono text-[11px] text-text-faint md:inline"
                  title={user.email ?? undefined}
                >
                  {user.email}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    title="Sign out"
                    className={NAV_LINK_CLASSES}
                  >
                    <LogOut size={13} />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </form>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      {/* Global Cmd-K command palette — search + recent companies */}
      <CommandPalette />
    </div>
  );
}
