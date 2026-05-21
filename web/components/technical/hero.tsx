'use client';

import { useEffect, useRef } from 'react';
import { animateCount } from '@/lib/animation';

const STATS = [
  { num: 7,     label: 'Migrations',         suffix: '' },
  { num: 10,    label: 'DB tables + views',  suffix: '' },
  { num: 6,     label: 'Scoring stages',     suffix: '' },
  { num: 14999, label: 'Calibration rows',   suffix: '' },
];

const CHIPS = [
  'Next.js 14', 'TypeScript strict', 'Tailwind', 'React Hook Form', 'Zod', 'GSAP',
  'Supabase', 'Postgres 15', 'PL/pgSQL', 'RLS', 'JSONB', 'Python · pandas', 'psycopg',
];

export function TechHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>('[data-count]');
    if (!els) return;
    const tweens = Array.from(els).map((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? '';
      return animateCount(el, target, { suffix });
    });
    return () => tweens.forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={rootRef}
      id="tech-hero"
      className="relative flex min-h-[80vh] flex-col items-center justify-center px-8 py-24 text-center"
    >
      <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-line bg-purple/[0.06] px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-purple backdrop-blur-glass">
        <span
          className="block h-1.5 w-1.5 rounded-full bg-purple animate-pulse-glow"
          style={{ boxShadow: '0 0 10px rgb(var(--purple))' }}
        />
        Technical architecture
      </div>

      <h1
        className="mb-6 font-serif font-normal leading-[0.96] text-gradient-headline"
        style={{ fontSize: 'clamp(2.5rem, 7vw, 6.5rem)', letterSpacing: '-0.04em' }}
      >
        How <span className="text-gradient-gold">V</span> gets computed.
      </h1>

      <p
        className="mb-12 max-w-[680px] leading-relaxed text-text-dim"
        style={{ fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)' }}
      >
        From AIDA xlsx files to the rendered headline number. Every table, view,
        RPC, server action, Zod schema, weighted mean and clamp — laid out in
        scroll order. Strict TypeScript end to end, no untyped JSON in the hot path.
      </p>

      <div className="mb-14 flex max-w-[820px] flex-wrap justify-center gap-2">
        {CHIPS.map((c) => (
          <span
            key={c}
            className="rounded-full border border-line bg-bg-1/70 px-3 py-1 font-mono text-[11px] text-text-dim backdrop-blur-sm"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-x-14 gap-y-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div
              className="font-mono font-bold leading-none tracking-tight"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                backgroundImage: 'linear-gradient(180deg, rgb(var(--gold)), #d97706)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.02em',
              }}
              data-count={s.num}
              data-suffix={s.suffix}
            >
              0
            </div>
            <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
