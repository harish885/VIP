'use client';

import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

const QUESTIONS: { text: string; fill: 1 | 2 | 3 | 4 | 5 }[] = [
  { text: 'Founder dependency — how much does the business rely on you personally?', fill: 2 },
  { text: 'Management structure — depth and quality of the leadership team',         fill: 3 },
  { text: 'Digital maturity — automation, proprietary data, enabling systems',       fill: 2 },
  { text: 'Client portfolio quality — diversification, contract length, stickiness', fill: 3 },
  { text: 'Business model scalability — can revenue grow without proportional cost?',fill: 4 },
  { text: 'Network & partnerships — strategic relationships, ecosystem position',    fill: 3 },
];

const QUANTITATIVE = [
  'Revenue · last 3 years',
  'EBITDA & margins',
  '% recurring revenue',
  'Top-3 client concentration (%)',
  'Revenue CAGR',
  'Tech investment / revenue',
];

const CONTEXTUAL = [
  'Sector / vertical',
  'Lifecycle stage',
  'Distinctive assets',
  'M&A / exit history',
  'Stated objective & horizon',
];

export function InputEngine() {
  const rootRef = useReveal<HTMLDivElement>();

  return (
    <section id="input" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="Input engine"
        title="The questions the model knows how to ask."
        accent="knows how to ask."
        lead="Around 20 carefully chosen inputs — quantitative, qualitative, contextual. The smartest model isn't the one with the most variables. It's the one that selects the most relevant ones."
      />

      <div
        ref={rootRef}
        className="reveal grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]"
      >
        <div data-i={0} className="glass p-[30px]">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-md border border-purple/25 bg-purple/[0.12] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
              Qualitative · 1–5
            </span>
            <h3 className="font-serif text-[22px] font-medium tracking-tight">The questionnaire</h3>
          </div>
          {QUESTIONS.map((q, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3.5 border-b border-line-faint py-3.5 text-[13.5px] last:border-b-0 last:pb-0"
            >
              <span className="flex-1 leading-snug text-text">{q.text}</span>
              <div className="flex shrink-0 gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = n <= q.fill;
                  return (
                    <span
                      key={n}
                      className={`block h-4 w-4 rounded-full border ${
                        filled
                          ? 'border-purple bg-purple'
                          : 'border-line bg-white/[0.05]'
                      }`}
                      style={
                        filled
                          ? { boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)' }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div data-i={1} className="flex flex-col gap-[18px]">
          <div className="glass p-[30px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-md border border-blue/25 bg-blue/[0.12] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-blue">
                Quantitative
              </span>
              <h3 className="font-serif text-[22px] font-medium tracking-tight">Hard numbers</h3>
            </div>
            <div className="grid gap-2.5">
              {QUANTITATIVE.map((q) => (
                <div
                  key={q}
                  className="flex items-center gap-3 rounded-[10px] border border-line-faint bg-black/20 px-3.5 py-2.5 text-[12.5px] text-text-dim transition-all duration-300 hover:translate-x-1 hover:border-line hover:bg-black/35"
                >
                  <span
                    className="block h-1.5 w-1.5 shrink-0 rounded-full bg-blue"
                    style={{ boxShadow: '0 0 8px rgb(var(--blue))' }}
                  />
                  {q}
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-[30px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-md border border-green/25 bg-green/[0.12] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-green">
                Contextual
              </span>
              <h3 className="font-serif text-[22px] font-medium tracking-tight">Where you sit</h3>
            </div>
            <div className="grid gap-2.5">
              {CONTEXTUAL.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-3 rounded-[10px] border border-line-faint bg-black/20 px-3.5 py-2.5 text-[12.5px] text-text-dim transition-all duration-300 hover:translate-x-1 hover:border-line hover:bg-black/35"
                >
                  <span
                    className="block h-1.5 w-1.5 shrink-0 rounded-full bg-green"
                    style={{ boxShadow: '0 0 8px rgb(var(--green))' }}
                  />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
