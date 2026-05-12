import { BgGrid } from '@/components/background/bg-grid';
import { BgGlow } from '@/components/background/bg-glow';
import { TopBrand } from '@/components/chrome/top-brand';
import { AuthCta } from '@/components/chrome/auth-cta';

/**
 * Marketing route-group layout.
 *
 * Quiet, professional. No smooth-scroll inertia, no particles, no floating
 * side-nav dots. Just the static backdrop + the two chrome pieces (brand
 * and dashboard CTA), then the page scrolls naturally with native browser
 * behaviour.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BgGrid />
      <BgGlow />

      <TopBrand />
      <AuthCta />

      <main className="relative z-10">{children}</main>
    </>
  );
}
