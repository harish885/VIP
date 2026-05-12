import Link from 'next/link';

/**
 * Auth route-group layout — centered card on a calm gradient background.
 * No marketing chrome (no side-nav, no scroll progress, no particles).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      {/* Calm radial background — just a subtle gold + cyan vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245, 165, 36, 0.10), transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(6, 182, 212, 0.06), transparent 60%)
          `,
        }}
      />

      {/* Brand mark — clickable home link */}
      <Link
        href="/"
        className="absolute left-8 top-6 z-50 flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text transition-opacity hover:opacity-80"
      >
        <span
          className="block h-[18px] w-[18px] rounded-[4px] bg-gradient-to-br from-gold to-gold-soft"
          style={{ boxShadow: '0 0 16px rgba(245, 165, 36, 0.6)' }}
        />
        VIP · Value Intelligence
      </Link>

      <div className="relative z-10 w-full max-w-[440px]">{children}</div>
    </div>
  );
}
