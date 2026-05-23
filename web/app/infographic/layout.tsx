import { HomeLink } from '@/components/chrome/home-link';

/**
 * Infographic layout.
 *
 * The `/infographic` page is project-material — a long, animated
 * scrollytelling exhibit that explains the platform in a presentation
 * setting. It is intentionally heavier than the rest of the product
 * and uses framer-motion + recharts, both of which are isolated to
 * this route. A small "Project material" chip in the top-right makes
 * it clear visitors are not in the main product.
 */
export default function InfographicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeLink variant="fixed" />
      <span className="fixed right-4 top-7 z-50 inline-flex items-center gap-1.5 rounded-full border border-purple/30 bg-purple/[0.10] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple backdrop-blur-glass sm:right-8">
        Project material · /infographic
      </span>
      {children}
    </>
  );
}
