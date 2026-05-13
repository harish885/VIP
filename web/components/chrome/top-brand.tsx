/**
 * TopBrand — small brand mark in the top-left.
 * Server component. Pure presentation, no interactivity.
 */
export function TopBrand() {
  return (
    <div
      className="fixed left-8 top-6 z-50 flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text"
    >
      <span
        className="block h-[18px] w-[18px] rounded-[4px] bg-gradient-to-br from-gold to-gold-soft"
        style={{ boxShadow: '0 0 16px rgba(176, 122, 26, 0.30)' }}
      />
      VIP · Value Intelligence
    </div>
  );
}
