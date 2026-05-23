import { HomeLink } from '@/components/chrome/home-link';

/**
 * Auth route-group layout — centered card on a calm gradient background.
 * The shared VIP HomeLink sits in the top-left so the user can always get
 * back to `/`.
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
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(176, 122, 26, 0.05), transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(21, 127, 137, 0.05), transparent 60%)
          `,
        }}
      />

      <HomeLink variant="fixed" />

      <div className="relative z-10 w-full max-w-[440px]">{children}</div>
    </div>
  );
}
