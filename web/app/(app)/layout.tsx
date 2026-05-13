import Link from 'next/link';

/**
 * Authenticated-app layout (currently in demo mode — no auth required).
 *
 * Renders a slim top bar with the brand + a "Demo Mode" pill.
 * When we re-enable auth, swap the pill for the user's name + sign-out.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background — very subtle warm wash that suits the light theme */}
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

      {/* Top bar */}
      <header className="relative z-10 border-b border-line bg-bg-1/85 backdrop-blur-glass">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text transition-opacity hover:opacity-80"
          >
            <span className="block h-[18px] w-[18px] rounded-[4px] bg-gradient-to-br from-gold to-gold-soft" />
            VIP · Value Intelligence
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.07] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
              <span className="block h-1.5 w-1.5 rounded-full bg-cyan" />
              Demo Mode
            </span>
            <Link
              href="/"
              className="rounded-md border border-line bg-bg-1 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-dim transition-all hover:border-line-2 hover:text-text"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}
