/**
 * @deprecated Cinematic mode removed. Marketing scenes now fade in via the
 * IntersectionObserver-based `useReveal` hook + `.reveal` CSS class — no
 * GSAP timelines, no Lenis smooth-scroll.
 *
 * Safe to delete this file. Kept as a stub so any orphaned imports
 * surface as a clear no-op rather than a missing-module error.
 *
 *   rm web/components/providers/marketing-providers.tsx
 *   (and remove the empty providers/ directory)
 */
export function MarketingProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
