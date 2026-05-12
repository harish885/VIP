/**
 * BgGlow — three soft radial gradients sitting behind everything.
 *
 * Static — no mouse-reactivity, no rAF loop. Server component. The slow
 * tri-color wash gives the page depth without being decorative.
 */
export function BgGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 20% 0%, rgba(245, 165, 36, 0.10), transparent 60%),
          radial-gradient(ellipse 60% 60% at 90% 30%, rgba(6, 182, 212, 0.07), transparent 60%),
          radial-gradient(ellipse 70% 50% at 50% 100%, rgba(168, 85, 247, 0.07), transparent 60%)
        `,
      }}
    />
  );
}
