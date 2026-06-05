/**
 * BrandMark — the VIP logo tile.
 *
 * A "V" whose right arm rises past its origin, ending in a point — the
 * value trajectory the platform exists to find. Gold on near-black,
 * matching the product's gold/ink identity. Same artwork as the favicon
 * (web/app/icon.svg); keep the two in sync.
 */
export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="vip-mark-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#a66f18" />
          <stop offset="0.6" stopColor="#ca9743" />
          <stop offset="1" stopColor="#e0b566" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#181a1f" />
      <path
        d="M16 22 L28.5 46 L47.5 11.5"
        fill="none"
        stroke="url(#vip-mark-g)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
