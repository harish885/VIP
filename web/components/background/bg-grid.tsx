/**
 * BgGrid — a subtle fixed grid pattern behind everything.
 * Radial mask fades it out at the edges so it never competes with content.
 * Server component (no interactivity).
 */
export function BgGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        WebkitMaskImage:
          'radial-gradient(ellipse 100% 80% at 50% 30%, #000 30%, transparent 75%)',
        maskImage:
          'radial-gradient(ellipse 100% 80% at 50% 30%, #000 30%, transparent 75%)',
      }}
    />
  );
}
