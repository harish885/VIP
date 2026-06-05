import { cn } from '@/lib/cn';

export interface GlyphCapital {
  key: 'fin' | 'tech' | 'human' | 'rel';
  score: number; // 0–100
}

const AXIS_COLOR: Record<GlyphCapital['key'], string> = {
  fin: 'rgb(var(--cap-fin))',
  tech: 'rgb(var(--cap-tech))',
  human: 'rgb(var(--cap-human))',
  rel: 'rgb(var(--cap-rel))',
};

// Axis order is fixed (Fin top, Tech right, H&O bottom, Rel left) so the
// same company always draws the same shape — that's what makes it a
// fingerprint rather than a chart.
const ORDER: GlyphCapital['key'][] = ['fin', 'tech', 'human', 'rel'];

/**
 * CapitalGlyph — a company's value fingerprint.
 *
 * The four capital scores drawn as a quadrilateral on fixed axes.
 * Strong financials pull the shape up; weak relational capital pinches
 * it left. No two diagnosed companies look alike, and a practiced eye
 * reads the imbalance before reading a single number.
 *
 * Pure SVG, theme-aware via the capital tokens, no animation — it's an
 * identity mark, not a dashboard widget. For the interactive version
 * see CapitalConstellation.
 */
export function CapitalGlyph({
  capitals,
  size = 40,
  className,
  title,
}: {
  capitals: GlyphCapital[];
  size?: number;
  className?: string;
  /** Accessible label; defaults to a score summary. */
  title?: string;
}) {
  const byKey = new Map(capitals.map((c) => [c.key, c]));
  const scores = ORDER.map((k) => byKey.get(k)?.score ?? 0);

  const C = 32; // center
  const R = 26; // max radius
  // Angles: top, right, bottom, left
  const ANGLES = [-90, 0, 90, 180].map((d) => (d * Math.PI) / 180);

  const pts = scores.map((s, i) => {
    const r = (Math.max(4, Math.min(100, s)) / 100) * R;
    return [C + r * Math.cos(ANGLES[i]!), C + r * Math.sin(ANGLES[i]!)] as const;
  });
  const path = `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')} Z`;

  const label =
    title ??
    `Capital fingerprint — financial ${scores[0]}, technological ${scores[1]}, human ${scores[2]}, relational ${scores[3]}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={label}
      className={cn('shrink-0', className)}
    >
      {/* Reference ring + axes — the "graph paper" under the shape */}
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgb(var(--line))" strokeWidth="1" />
      {ANGLES.map((a, i) => (
        <line
          key={i}
          x1={C}
          y1={C}
          x2={C + R * Math.cos(a)}
          y2={C + R * Math.sin(a)}
          stroke="rgb(var(--line-faint))"
          strokeWidth="1"
        />
      ))}
      {/* The fingerprint */}
      <path d={path} fill="rgb(var(--gold) / 0.16)" stroke="rgb(var(--gold))" strokeWidth="1.75" strokeLinejoin="round" />
      {/* Capital vertices, in their role colours */}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill={AXIS_COLOR[ORDER[i]!]} />
      ))}
    </svg>
  );
}
