'use client';

import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

type CapColor = 'cap-fin' | 'cap-tech' | 'cap-human' | 'cap-rel';

const CAPITALS: {
  name: React.ReactNode;
  weight: string;
  target: string;
  color: CapColor;
  rgb: string;
  desc: string;
  tags: string[];
}[] = [
  {
    name: <>Financial<br />Capital</>,
    weight: '35%',
    target: '35%',
    color: 'cap-fin',
    rgb: '59, 130, 246',
    desc: 'How the business performs financially today. The dominant lens — but never the only one.',
    tags: ['EBITDA', 'Revenue growth', 'Recurring revenue', 'Free cash flow', 'Client concentration'],
  },
  {
    name: <>Technological<br />Capital</>,
    weight: '20%',
    target: '20%',
    color: 'cap-tech',
    rgb: '168, 85, 247',
    desc: 'Digital maturity, automation, proprietary data, IP. The hard infrastructure that underwrites scalability.',
    tags: ['Digital maturity', 'Automation', 'Proprietary data', 'Enabling systems', 'IP'],
  },
  {
    name: <>Human &amp;<br />Organisational</>,
    weight: '25%',
    target: '25%',
    color: 'cap-human',
    rgb: '249, 115, 22',
    desc: 'Management depth, founder dependency, processes, transferability. Critical for SME succession risk.',
    tags: ['Management structure', 'Founder dependency', 'Processes', 'Culture', 'Transferability'],
  },
  {
    name: <>Relational<br />Capital</>,
    weight: '20%',
    target: '20%',
    color: 'cap-rel',
    rgb: '34, 197, 94',
    desc: 'Network, partnerships, brand, ecosystem. Drives growth, market reach, and negotiating power.',
    tags: ['Network quality', 'Strategic partnerships', 'Brand', 'Ecosystem', 'Reputation'],
  },
];

export function Capitals() {
  const stageRef = useReveal<HTMLDivElement>();

  return (
    <section id="capitals" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="Conceptual architecture"
        title="An SME's value is the sum of four capitals."
        accent="four capitals."
        lead="Not purely financial. Each lens captures a distinct dimension of strategic quality — and the platform scores all four, weighted for manufacturing."
      />
      <div ref={stageRef} className="reveal grid grid-cols-1 gap-5 md:grid-cols-2">
        {CAPITALS.map((c, i) => (
          <article
            key={c.weight + c.color}
            data-i={i}
            className="glass relative overflow-hidden px-8 py-9 transition-transform duration-500 ease-out hover:-translate-y-1"
          >
            <span aria-hidden className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: `rgb(${c.rgb})` }} />
            <span
              aria-hidden
              className="pointer-events-none absolute right-[-30%] top-[-50%] h-[200%] w-[60%] opacity-10"
              style={{ background: `radial-gradient(circle, rgb(${c.rgb}), transparent 65%)` }}
            />

            <header className="relative mb-4 flex items-start justify-between gap-5">
              <div className="font-serif text-[26px] font-medium leading-tight tracking-tight">
                {c.name}
              </div>
              <div
                className="font-mono text-[38px] font-bold leading-none tracking-tighter"
                style={{ color: `rgb(${c.rgb})` }}
              >
                {c.weight}
              </div>
            </header>

            <p className="relative mb-5 text-[14.5px] leading-relaxed text-text-dim">{c.desc}</p>

            <div className="relative mb-5 flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-line bg-white/[0.04] px-2.5 py-1 text-[11px] text-text-dim"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="relative h-[5px] overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="cap-fill h-full rounded-full"
                style={{
                  width: c.target,
                  background: `linear-gradient(90deg, rgb(${c.rgb}), color-mix(in srgb, rgb(${c.rgb}) 60%, white))`,
                  boxShadow: `0 0 12px rgb(${c.rgb})`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
