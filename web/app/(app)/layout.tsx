import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/**
 * App shell — slim chrome with brand on the left and a methodology link
 * on the right. Auth pill removed; we keep the experience product-focused.
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
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <Link
            href="/companies"
            className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text transition-opacity hover:opacity-80"
          >
            <span className="block h-[18px] w-[18px] rounded-[4px] bg-gradient-to-br from-gold to-gold-soft" />
            VIP · Value Intelligence
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/method"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-1 px-3 py-1.5 text-[12px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text"
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
