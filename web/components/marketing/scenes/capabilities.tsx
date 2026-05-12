'use client';

import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

const CAPS = [
  { num: '01 — Estimate',  title: 'Estimate value',     body: 'Credible methodology calibrated to real SMEs — not a naive EBITDA × multiple.' },
  { num: '02 — Score',     title: 'Score quality',      body: 'Multi-dimensional scoring across the four capitals, normalised to peer group.' },
  { num: '03 — Diagnose',  title: 'Surface drivers',    body: 'Which factors create value. Which silently erode it. Both, transparently named.' },
  { num: '04 — Prescribe', title: 'Recommend actions',  body: 'Top 3 highest-impact levers over 24–36 months, ranked by Return on Value.' },
  { num: '05 — Deliver',   title: 'Deliver simply',     body: 'One dashboard. Designed for the entrepreneur — not the data scientist.' },
];

export function Capabilities() {
  const rowRef = useReveal<HTMLDivElement>();

  return (
    <section id="capabilities" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="What it must do"
        title="Five capabilities. One platform."
        accent="One platform."
        lead="VIP isn't a research artefact. It's a working tool with five non-negotiable jobs — defined by the brief and reflected in every line of the model."
      />
      <div
        ref={rowRef}
        className="reveal grid grid-cols-2 gap-[14px] md:grid-cols-3 lg:grid-cols-5"
      >
        {CAPS.map(({ num, title, body }, i) => (
          <div
            key={num}
            data-i={i}
            className="glass relative overflow-hidden px-[22px] py-[26px] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-line-2"
          >
            <div className="mb-3.5 font-mono text-[11px] font-bold tracking-[0.1em] text-cyan">
              {num}
            </div>
            <h4 className="mb-2 text-[16px] font-semibold leading-tight tracking-tight">{title}</h4>
            <p className="text-[12.5px] leading-snug text-text-dim">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
