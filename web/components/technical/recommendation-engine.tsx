'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';

const STEPS = [
  {
    n: 1,
    title: 'Filter ACTION_CATALOGUE',
    body: 'Each entry exposes fires_when(scoring: ScoringResult) → boolean. e.g. the client-concentration action fires when input.top3_client_concentration > 50, founder-handover when founder_independence < 40.',
    code: 'ACTION_CATALOGUE.filter((a) => a.fires_when(scoring))',
  },
  {
    n: 2,
    title: 'Simulate ΔSQF / ΔGF',
    body: 'Each action declares delta_sqf, delta_gf (numbers, additive). The engine pretends the action shipped: newSqf = sqf + ΔSQF; newGf = gf + ΔGF.',
    code: 'const newSqf = clamp(scoring.composite.sqf + a.delta_sqf, 0.6, 1.4)\nconst newGf  = clamp(scoring.growth.gf  + a.delta_gf,  0.7, 1.5)',
  },
  {
    n: 3,
    title: 'Re-run Stage 6',
    body: 'computeValuation() is called again with the post-action SQF and GF. Same pure function used elsewhere. Returns newV.',
    code: 'const { v_current_eur: newV } = computeValuation({\n  ebitda_eur, m_sector, sqf: newSqf, gf: newGf,\n})',
  },
  {
    n: 4,
    title: 'Score via ROV',
    body: 'Return on Value = ΔV% per unit of effort × time. Stated objective (Growth / De-risk / Sell) re-weights the score so a seller-ready owner gets different priorities than a founder building for the long run.',
    code: 'v_uplift_pct = (newV − baseV) / baseV × 100\nrov_score    = (v_uplift_pct / (effort × months)) × objective_weight',
  },
  {
    n: 5,
    title: 'Pick top 3, re-sort by ΔV',
    body: 'Top 3 by ROV. Then resorted by raw v_uplift_pct descending so the dashboard shows the biggest-money move first.',
    code: 'const top3 = candidates.sort(byRov).slice(0, 3).sort(byUplift)',
  },
];

export function RecommendationEngineSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="rov" className="relative mx-auto max-w-[1180px] px-8 py-28">
      <SceneHeader
        eyebrow="Recommendation engine"
        title="ROV-ranked, objective-weighted."
        accent="objective-weighted."
        lead="Ranking actions is itself a valuation problem. Each action is simulated through the same pipeline, then scored by ΔV per unit of effort and re-weighted by the entrepreneur's stated objective."
      />

      <div ref={ref} className="reveal space-y-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            data-i={s.n - 1}
            className="grid grid-cols-1 gap-6 rounded-2xl border border-line bg-bg-1/80 p-7 backdrop-blur-sm md:grid-cols-[80px_1fr_minmax(320px,460px)]"
          >
            <div
              className="font-serif font-medium leading-none tracking-tight text-purple"
              style={{ fontSize: '2.75rem' }}
            >
              {s.n}
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-medium tracking-tight text-text">
                {s.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-dim">{s.body}</p>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-bg-2/70 px-4 py-3 font-mono text-[11.5px] leading-[1.7] text-text">
              <code>{s.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
