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
          radial-gradient(ellipse 60% 50% at 20% 0%, rgba(176, 122, 26, 0.05), transparent 60%),
          radial-gradient(ellipse 60% 60% at 90% 30%, rgba(21, 127, 137, 0.05), transparent 60%),
          radial-gradient(ellipse 70% 50% at 50% 100%, rgba(91, 95, 214, 0.05), transparent 60%)
        `,
      }}
    />
  );
}
