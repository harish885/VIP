import { HomeLink } from '@/components/chrome/home-link';
import { AuthCta } from '@/components/chrome/auth-cta';

/**
 * Marketing route-group layout.
 *
 * Quiet, professional. No smooth-scroll inertia, no particles, no floating
 * side-nav dots. Just the static backdrop, the shared VIP home button on
 * the left and the "Find a company" CTA on the right.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeLink variant="fixed" />
      <AuthCta />

      <main className="relative z-10">{children}</main>
    </>
  );
}
