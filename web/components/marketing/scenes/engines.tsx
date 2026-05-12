'use client';

import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

const ENGINES = [
  { n: '01 · INPUT',     title: 'Input Engine',         body: 'Quantitative data + a short, information-dense questionnaire. ~20 inputs total.' },
  { n: '02 · SCORE',     title: 'Scoring Model',        body: 'Per-capital scores, overall quality, risk index, scalability index. Peer-relative percentiles.' },
  {
    n: '03 · VALUE',
    title: 'Valuation Logic',
    body: null as string | null,
    bodyJsx: <>V = EBITDA × M<sub>sector</sub> × SQF × GF. Calibrated against 14,999 Italian SMEs.</>,
  },
  { n: '04 · ACT',       title: 'Recommendation',       body: 'Top 3 highest-impact actions over 24–36 months. Ranked by Return on Value (ROV).' },
  {
    n: '05 · SIMULATE',
    title: 'Simulation Engine',
    body: 'Interactive what-if: how does my value move if I lift this lever by 20%?',
    upgrade: true,
  },
] as const;

export function Engines() {
  const rootRef = useReveal<HTMLDivElement>();

  return (
    <section id="engines" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="Platform anatomy"
        title="Five engines. End to end."
        accent="End to end."
        lead="Each is a named, inspectable module — not a black box. The fifth is the conceptual upgrade: interactive what-if scenarios."
      />

      <div
        ref={rootRef}
        className="reveal grid grid-cols-2 gap-3.5 lg:grid-cols-5"
      >
        {ENGINES.map((e, i) => {
          const isUpgrade = 'upgrade' in e && e.upgrade;
          return (
            <div
              key={e.n}
              data-i={i}
              className={`glass relative bg-bg-1 px-[22px] py-[26px] transition-all duration-300 ease-out hover:-translate-y-1 ${
                isUpgrade ? 'border-gold/30' : 'hover:border-cyan'
              }`}
              style={
                isUpgrade
                  ? {
                      background:
                        'linear-gradient(135deg, rgb(var(--bg-1)), rgba(245, 165, 36, 0.06))',
                    }
                  : undefined
              }
            >
              <span
                aria-hidden
                className={`absolute right-[22px] top-6 block h-1.5 w-1.5 rounded-full ${
                  isUpgrade ? 'bg-gold' : 'bg-cyan'
                }`}
                style={{
                  boxShadow: isUpgrade
                    ? '0 0 10px rgb(var(--gold))'
                    : '0 0 10px rgb(var(--cyan))',
                }}
              />
              <div
                className={`mb-3.5 font-mono text-[11px] font-bold tracking-[0.1em] ${
                  isUpgrade ? 'text-gold' : 'text-cyan'
                }`}
              >
                {e.n}
              </div>
              <h4 className="mb-2.5 font-serif text-[18px] font-medium tracking-tight">{e.title}</h4>
              <p className="text-[12.5px] leading-snug text-text-dim">
                {e.body ?? ('bodyJsx' in e ? e.bodyJsx : null)}
              </p>
              {isUpgrade && (
                <span className="mt-3.5 inline-block rounded-md bg-gold/[0.12] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
                  Upgrade
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
