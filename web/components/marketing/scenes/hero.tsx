'use client';

import { useEffect, useRef } from 'react';
import { animateCount } from '@/lib/animation';

const STATS = [
  { num: 4,     label: 'Capitals scored',      suffix: '' },
  { num: 5,     label: 'Integrated engines',   suffix: '' },
  { num: 20,    label: 'Quant + qual + ctx',   suffix: ' inputs' },
  { num: 14999, label: 'Calibration SMEs',     suffix: '' },
];

/**
 * Hero — calm opening.
 *
 * Eyebrow badge, serif headline with gold italic accent, two-line lead,
 * count-up stats. No word-by-word reveal, no scroll cue, no parallax —
 * those felt cinematic. Just clean composition + the informative count-up.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  // KPIs count up once on mount (informative, not decorative).
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
      id="hero"
      className="relative flex min-h-[88vh] flex-col items-center justify-center px-8 py-24 text-center"
    >
      <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-line bg-gold/[0.06] px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-gold backdrop-blur-glass">
        <span
          className="block h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow"
          style={{ boxShadow: '0 0 10px rgb(var(--gold))' }}
        />
        Value Intelligence Platform
      </div>

      <h1
        className="mb-6 font-serif font-normal leading-[0.96] text-gradient-headline"
        style={{ fontSize: 'clamp(3rem, 9vw, 7.75rem)', letterSpacing: '-0.04em' }}
      >
        What is my company
        <br />
        worth <span className="text-gradient-gold">today?</span>
      </h1>

      <p
        className="mb-4 max-w-[720px] leading-snug text-text-dim"
        style={{ fontSize: 'clamp(0.9375rem, 1.6vw, 1.1875rem)' }}
      >
        <em className="not-italic font-medium text-text">What drives that value.</em>
        {'  ·  '}
        <em className="not-italic font-medium text-text">Which actions could grow it</em>{' '}
        over the next 24–36 months.
      </p>

      <p
        className="max-w-[580px] leading-relaxed text-text-faint"
        style={{ fontSize: 'clamp(0.8125rem, 1.2vw, 0.9375rem)' }}
      >
        A decision assistant for SME entrepreneurs — built around essential data and the
        questions a strategist would ask. Not a calculator. Not management software. A
        platform that turns a small number of inputs into high-value strategic insight.
      </p>

      <div className="mt-16 flex flex-wrap justify-center gap-x-14 gap-y-8">
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
