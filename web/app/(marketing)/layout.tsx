import { HomeLink } from '@/components/chrome/home-link';
import { AuthCta } from '@/components/chrome/auth-cta';
import { ThemeToggle } from '@/components/chrome/theme-toggle';

/**
 * Marketing route-group layout.
 *
 * Quiet, professional. No smooth-scroll inertia, no particles, no floating
 * side-nav dots. Just the static backdrop, the shared VIP home button on
 * the left, and the theme toggle + session CTA on the right.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeLink variant="fixed" />
      <div className="fixed right-4 top-6 z-50 flex items-center gap-2 sm:right-8">
        <ThemeToggle />
        <AuthCta />
      </div>

      <main className="relative z-10">{children}</main>
    </>
  );
}
