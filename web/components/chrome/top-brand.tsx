/**
 * TopBrand — small brand mark in the top-left.
 * Server component. Pure presentation, no interactivity.
 */
export function TopBrand() {
  return (
    <div
      className="fixed left-4 top-6 z-50 flex max-w-[42vw] items-center gap-2 font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.22em] text-text sm:left-8 sm:max-w-none sm:gap-2.5 sm:text-[11px] sm:tracking-eyebrow"
    >
      <span
        className="block h-[18px] w-[18px] shrink-0 rounded-[4px] bg-gradient-to-br from-gold to-gold-soft"
        style={{ boxShadow: '0 0 16px rgba(176, 122, 26, 0.30)' }}
      />
      <span className="sm:hidden">VIP</span>
      <span className="hidden sm:inline">VIP · Value Intelligence</span>
    </div>
  );
}
