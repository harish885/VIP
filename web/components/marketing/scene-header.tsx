'use client';

import { useReveal } from '@/lib/use-reveal';

/**
 * SceneHeader — the eyebrow + serif headline + lead paragraph block at the
 * top of every marketing scene. Splits the title around an optional `accent`
 * substring and renders the accent in gold italic.
 *
 * Fades up on scroll-into-view via the .reveal CSS class.
 */
export function SceneHeader({
  eyebrow,
  title,
  accent,
  lead,
}: {
  eyebrow: string;
  title: string;
  /** Substring of `title` to render as the gold italic accent. */
  accent?: string;
  lead?: string;
}) {
  const ref = useReveal<HTMLDivElement>();

  let before = title;
  let highlight = '';
  let after = '';
  if (accent && title.includes(accent)) {
    const idx = title.indexOf(accent);
    before = title.slice(0, idx);
    highlight = accent;
    after = title.slice(idx + accent.length);
  }

  return (
    <div ref={ref} className="reveal mx-auto mb-20 max-w-[760px] text-center">
      <div className="mb-4 inline-block rounded-full border border-cyan/20 bg-cyan/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
        {eyebrow}
      </div>
      <h2
        className="font-serif font-normal leading-[1.05] text-gradient-headline"
        style={{
          fontSize: 'clamp(1.625rem, 3.4vw, 2.625rem)',
          letterSpacing: '-0.025em',
        }}
      >
        {before}
        {highlight && <span className="text-gradient-gold">{highlight}</span>}
        {after}
      </h2>
      {lead && (
        <p
          className="mt-5 text-text-dim"
          style={{ fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)', lineHeight: 1.6 }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
