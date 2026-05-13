'use client';

import { TrendingUp } from 'lucide-react';
import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

const GLOSSARY = [
  { k: 'EBITDA',           v: '3-year normalised operating performance, smoothed for one-offs.' },
  { k: 'M_sector',         v: 'Sector multiple, adjusted for SME size and illiquidity.' },
  { k: 'SQF · 0.6–1.4',    v: 'Strategic Quality Factor from the four-capital scoring.' },
  { k: 'GF · 0.7–1.5',     v: 'Growth Factor — CAGR plus quality of growth.' },
];

export function Formula() {
  const stageRef = useReveal<HTMLDivElement>();

  return (
    <section id="formula" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="Valuation logic"
        title="One transparent formula. No black boxes."
        accent="No black boxes."
        lead="Per-company value is built up from peer-relative scores across four capitals. Hover any variable to see what's behind it."
      />

      <div
        ref={stageRef}
        className="reveal glass-strong relative overflow-hidden p-[clamp(28px,4vw,44px)] text-center"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(176, 122, 26, 0.04), transparent 60%)',
          }}
        />

        <div className="relative">
          <div className="mb-7 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text-faint">
            — core valuation formula —
          </div>

          <div
            className="font-mono font-semibold leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3rem)', letterSpacing: '-0.01em' }}
          >
            <span>V</span>
            <span className="mx-3.5 font-normal text-text-faint">=</span>
            <span
              className="cursor-help text-gold transition-colors duration-300 hover:text-cyan"
              title="3-year normalised operating performance, smoothed for one-offs."
            >
              EBITDA
            </span>
            <span className="mx-3.5 font-normal text-text-faint">×</span>
            <span
              className="cursor-help text-gold transition-colors duration-300 hover:text-cyan"
              title="Sector multiple, adjusted for SME size and illiquidity."
            >
              M<sub>sector</sub>
            </span>
            <span className="mx-3.5 font-normal text-text-faint">×</span>
            <span
              className="cursor-help text-gold transition-colors duration-300 hover:text-cyan"
              title="Strategic Quality Factor (0.6–1.4) from the four-capital scoring."
            >
              SQF
            </span>
            <span className="mx-3.5 font-normal text-text-faint">×</span>
            <span
              className="cursor-help text-gold transition-colors duration-300 hover:text-cyan"
              title="Growth Factor (0.7–1.5) — CAGR plus quality of growth (organic vs episodic)."
            >
              GF
            </span>
          </div>

          <div className="relative mt-11 grid grid-cols-1 gap-3.5 text-left md:grid-cols-2 lg:grid-cols-4">
            {GLOSSARY.map((g, i) => (
              <div
                key={g.k}
                data-i={i}
                className="rounded-[14px] border border-line bg-bg-2/60 p-4 transition-all duration-300 hover:border-gold hover:bg-gold/[0.04]"
              >
                <div className="mb-1.5 font-mono text-[13px] font-bold text-gold">{g.k}</div>
                <div className="text-[12.5px] leading-snug text-text-dim">{g.v}</div>
              </div>
            ))}
          </div>

          <div className="relative mt-11 flex items-center gap-5 rounded-[16px] border border-green/25 bg-gradient-to-br from-green/[0.08] to-green/[0.02] p-7 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-green/15 text-green">
              <TrendingUp size={22} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="font-serif text-[22px] font-medium leading-tight tracking-tight text-green">
                Value Gap
              </div>
              <div className="mt-1 text-[13.5px] leading-relaxed text-text-dim">
                The distance between today&rsquo;s value and the optimised potential the recommended
                actions could unlock.{' '}
                <em className="not-italic font-medium text-text">
                  This is the platform&rsquo;s true differentiating insight.
                </em>
              </div>
              <div className="mt-2 inline-block rounded-lg bg-bg-2/70 px-3 py-2 font-mono text-[13px] font-semibold text-green">
                Value Gap = Optimised Potential Value − Current Value
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
