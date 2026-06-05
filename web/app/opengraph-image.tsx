import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VIP — Value Intelligence Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Site-wide Open Graph card, generated at the edge.
 *
 * Ink panel, gold rising-V mark (same artwork as the favicon), the
 * formula spelled out in mono — the brand in one frame. Per-company
 * cards are intentionally NOT generated: valuations sit behind auth
 * and should never leak into link previews.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0e1014',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#181a1f" stroke="#2c323a" strokeWidth="1" />
            <path
              d="M16 22 L28.5 46 L47.5 11.5"
              fill="none"
              stroke="#ca9743"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              fontSize: 28,
              letterSpacing: '0.3em',
              color: '#9ea5b2',
              fontWeight: 700,
            }}
          >
            VIP
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              color: '#e9ecf0',
              fontWeight: 600,
              maxWidth: 900,
            }}
          >
            Value intelligence for one company at a time.
          </div>
          <div style={{ fontSize: 26, color: '#9ea5b2', maxWidth: 820 }}>
            Strategic enterprise valuation for Italian SMEs — sourced, scored, and
            ranked into the three moves that close the value gap.
          </div>
        </div>

        {/* Formula footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #2c323a',
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: '#d4a24c',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            V = EBITDA × M × SQF × GF
          </div>
          <div style={{ fontSize: 20, color: '#7e8592', letterSpacing: '0.15em' }}>
            CALIBRATED ON 14,999 ITALIAN SMEs
          </div>
        </div>
      </div>
    ),
    size,
  );
}
