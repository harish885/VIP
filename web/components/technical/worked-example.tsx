'use client';

import { useEffect, useRef } from 'react';
import { animateCount } from '@/lib/animation';
import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';

/**
 * Walked-through V derivation against a real AIDA company shape.
 * Numbers are illustrative — they match the HUNI ITALIANA snapshot we
 * actually see in the dashboard (Revenue €14.4M, EBITDA €3.19M, NACE 3101).
 * Qualitative answers are illustrative defaults; the actual 1–5 answers
 * vary per submission.
 */

const STAGES = [
  {
    title: 'Stage 1 · Derive 12 metrics',
    rows: [
      ['ebitda_margin_pct',          '3.19M / 14.4M × 100',             '21.9%'],
      ['revenue_cagr_2y_pct',        '√(14.4 / 12.0) − 1',              '9.5%'],
      ['top3_client_concentration',  'linMap(Q9 = 4 → 1..5 → 80..25%)', '38.8%'],
      ['recurring_revenue_pct',      '10 + (Q9 + Q13)/2 × 10  (4 + 4)', '50%'],
      ['tech_investment_ratio_pct',  'AIDA R&D missing → Q-proxy',      '3.2%'],
      ['founder_independence_pct',   'LIKERT_TO_PCT[4]',                '82'],
      ['management_score_pct',       'LIKERT_TO_PCT[3]',                '65'],
      ['digital_maturity_pct',       'LIKERT_TO_PCT[3]',                '65'],
      ['client_portfolio_quality_pct', 'LIKERT_TO_PCT[4]',              '82'],
      ['business_scalability_pct',   'LIKERT_TO_PCT[3]',                '65'],
      ['network_partnerships_pct',   'LIKERT_TO_PCT[4]',                '82'],
    ],
  },
  {
    title: 'Stage 2 · Peer percentiles (lookup or synthetic prior)',
    rows: [
      ['ebitda_margin',          'top quartile among machinery SMEs', '85'],
      ['revenue_cagr',           'mid-upper cohort',                  '65'],
      ['recurring_revenue',      'better-than-median subscription mix','70'],
      ['client_concentration_inv','40% top-3 → only mid cohort',       '60'],
      ['digital_maturity',       'mid cohort',                         '50'],
      ['tech_investment',        '3.2% R&D > median',                  '70'],
      ['founder_independence',   'pass-through 0–100',                 '82'],
      ['client_portfolio',       'pass-through 0–100',                 '82'],
      ['network',                'pass-through 0–100',                 '82'],
    ],
  },
  {
    title: 'Stage 3 · Weighted means inside each capital',
    rows: [
      ['Financial',     '0.30·85 + 0.25·65 + 0.20·70 + 0.25·60',  '71'],
      ['Technological', '0.55·50 + 0.45·70',                       '59'],
      ['Human & Org',   '0.40·82 + 0.35·65 + 0.25·65',             '70'],
      ['Relational',    '0.40·82 + 0.30·82 + 0.30·70',             '78'],
    ],
  },
  {
    title: 'Stage 4 · Composite CQS + SQF',
    rows: [
      ['CQS', '0.35·71 + 0.20·59 + 0.25·70 + 0.20·78', '70'],
      ['SQF', 'clamp(0.6 + (70/100) × 0.8, 0.6, 1.4)', '1.16'],
    ],
  },
  {
    title: 'Stage 5 · Growth Factor',
    rows: [
      ['gf_base',              '1.0 + clamp(9.5%, −30%, 50%) × 0.4', '1.038'],
      ['lifecycle_modifier',   'Maturity → 1.00',                    '1.00'],
      ['scalability_modifier', '0.92 + (3 − 1) × 0.03',              '0.98'],
      ['GF',                   'clamp(1.038 × 1.00 × 0.98, 0.7, 1.5)','1.02'],
    ],
  },
  {
    title: 'Stage 6 · Final V',
    rows: [
      ['M_sector lookup',  'NACE 31xx miss → sector "Manufacturing"',   '6.7×'],
      ['Illiquidity disc.', '× 0.75',                                    '5.0×'],
      ['V',                'EBITDA × M × SQF × GF = 3.19M × 5.0 × 1.16 × 1.02', '€18.9M'],
      ['V_low',            'V × 0.90',                                  '€17.0M'],
      ['V_high',           'V × 1.12',                                  '€21.2M'],
      ['Top-3 ΔV sum',     '+12% (client conc) +9% (recurring) +7% (mgmt)','+28%'],
      ['V_potential',      'V × 1.28',                                  '€24.2M'],
      ['value_gap_pct',    '(V_pot − V) / V × 100',                     '+28%'],
    ],
  },
];

export function WorkedExample() {
  const sectionRef = useRef<HTMLElement>(null);
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll<HTMLElement>('[data-bigcount]');
    if (!els) return;
    const tweens = Array.from(els).map((el) => {
      const target = Number(el.dataset.bigcount);
      const decimals = Number(el.dataset.decimals ?? 1);
      const prefix = el.dataset.prefix ?? '';
      const suffix = el.dataset.suffix ?? '';
      return animateCount(el, target, { prefix, suffix, decimals, duration: 1.8 });
    });
    return () => tweens.forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="example"
      className="relative mx-auto max-w-[1180px] px-8 py-28"
    >
      <SceneHeader
        eyebrow="Worked example"
        title="One company, six stages."
        accent="six stages."
        lead="HUNI ITALIANA — S.P.A. NACE 3101, Manufacturing, 38 employees, €14.4M revenue, €3.19M EBITDA. Watch the value emerge."
      />

      {/* Headline result */}
      <div ref={ref} className="reveal mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        <ResultCell label="V (current)"   value={18.9} prefix="€"  suffix="M" />
        <ResultCell label="V range"       value={21.2} prefix="€"  suffix="M" sub="low €17.0M – high" />
        <ResultCell label="V potential"   value={24.2} prefix="€"  suffix="M" sub="after Top-3 actions" />
        <ResultCell label="Value gap"     value={28}   prefix="+"  suffix="%" decimals={0} sub="distance to potential" />
      </div>

      <div className="space-y-4">
        {STAGES.map((s, i) => (
          <article
            key={s.title}
            className="rounded-2xl border border-line bg-bg-1/80 p-6 backdrop-blur-sm"
            data-i={i}
          >
            <h3 className="mb-3 font-serif text-[17px] font-medium tracking-tight text-text">
              {s.title}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
                    <th className="border-b border-line py-2 pr-4">Field</th>
                    <th className="border-b border-line py-2 pr-4">Formula</th>
                    <th className="border-b border-line py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows.map(([field, formula, value]) => (
                    <tr key={field} className="text-[12.5px]">
                      <td className="border-b border-line-faint py-2 pr-4 font-mono text-text-dim">{field}</td>
                      <td className="border-b border-line-faint py-2 pr-4 font-mono text-text-faint">{formula}</td>
                      <td className="border-b border-line-faint py-2 text-right font-mono font-bold text-text">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResultCell({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 1,
  sub,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  sub?: string;
}) {
  return (
    <div className="bg-bg-1 px-5 py-5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div
        className="mt-2 font-serif text-[30px] font-medium leading-none tracking-tight text-text"
        data-bigcount={value}
        data-decimals={decimals}
        data-prefix={prefix}
        data-suffix={suffix}
      >
        {prefix}0{suffix}
      </div>
      {sub && <div className="mt-1.5 text-[11.5px] text-text-faint">{sub}</div>}
    </div>
  );
}
