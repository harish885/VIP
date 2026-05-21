'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { ShieldCheck, Database, Cpu, RotateCcw, Cookie, ArrowRight } from 'lucide-react';

const HOPS = [
  {
    icon: ShieldCheck,
    title: 'DiagnosticSchema.safeParse(input)',
    detail: 'Zod schema, 19 fields. 1–5 Likerts coerced to z.number().int().min(1).max(5). Type-narrow → q: DiagnosticInput.',
    file: 'lib/diagnostic-schema.ts',
    color: 'cyan',
  },
  {
    icon: Database,
    title: 'getCompanySnapshot(service, taxCode)',
    detail: 'Read AIDA factsheet from view aida_company_snapshot. Required — revenues + EBITDA come from here, not from the form.',
    file: 'lib/aida.ts',
    color: 'purple',
  },
  {
    icon: Database,
    title: 'ensureCompanyRow(...)',
    detail: 'INSERT INTO vip.companies (user_id NULL in demo) ON CONFLICT (tax_code) DO UPDATE → returns company.id.',
    file: 'actions.ts',
    color: 'purple',
  },
  {
    icon: Cpu,
    title: 'buildScoringInput({ diagnostic, snapshot })',
    detail: 'Merge AIDA quant (rev_y1/2/3, ebitda, ebitda_margin) + Q-driven proxies (top3 concentration, recurring %, R&D ratio). Returns ScoringInput.',
    file: 'lib/scoring/company-input.ts',
    color: 'gold',
  },
  {
    icon: Database,
    title: 'INSERT INTO vip.submissions',
    detail: '~30 columns. All quant + 6 legacy qual + 11 new q_* qual. Returns the new submission.id (UUID).',
    file: 'actions.ts',
    color: 'purple',
  },
  {
    icon: Cpu,
    title: 'runScoring(scoringInput, { peerGroupName, naceCode, supabase })',
    detail: '6-stage pipeline runs synchronously in Node. Stage 2 calls vip.percentile_in_peer_group via supabase.rpc(); other stages are pure functions.',
    file: 'lib/scoring/index.ts',
    color: 'gold',
  },
  {
    icon: Cpu,
    title: 'buildRecommendations({ scoring, naceCode })',
    detail: 'Filters ACTION_CATALOGUE by fires_when(scoring). For each candidate: simulate ΔSQF/ΔGF → recompute V → rank by ROV. Keep top 3, sort by ΔV%.',
    file: 'lib/scoring/recommendations.ts',
    color: 'gold',
  },
  {
    icon: Cpu,
    title: 'computeValuation({ ebitda, m, sqf, gf, top3_uplift_pct_sum })',
    detail: 'Re-runs Stage 6 with the top-3 uplift sum so v_potential_eur and value_gap_pct reflect the recommendation set.',
    file: 'lib/scoring/valuation.ts',
    color: 'gold',
  },
  {
    icon: Database,
    title: 'INSERT INTO vip.valuations + recommendations',
    detail: 'Persist v_current/low/high/potential, sqf, gf, capitals, flags, quality_score, risk_index, scalability_index. Recommendations linked via valuation_id.',
    file: 'actions.ts',
    color: 'purple',
  },
  {
    icon: Cookie,
    title: 'cookies().set(`vip_company_submission_${taxCode}`, id)',
    detail: 'httpOnly, sameSite=lax, 7-day TTL. Lets the dashboard land on the exact freshly-computed valuation even without auth.',
    file: 'actions.ts',
    color: 'amber',
  },
  {
    icon: RotateCcw,
    title: 'redirect(`/companies/${taxCode}?submitted=${id}`)',
    detail: 'Server redirect throws NEXT_REDIRECT. Browser GETs the workspace route — which re-enters the lifecycle on the previous section.',
    file: 'actions.ts',
    color: 'amber',
  },
];

const COLOR_CLASSES: Record<string, { bg: string; text: string; ring: string }> = {
  cyan:   { bg: 'bg-cyan/[0.10]',   text: 'text-cyan',   ring: 'border-cyan/40'   },
  purple: { bg: 'bg-purple/[0.10]', text: 'text-purple', ring: 'border-purple/40' },
  gold:   { bg: 'bg-gold/[0.10]',   text: 'text-gold',   ring: 'border-gold/40'   },
  amber:  { bg: 'bg-amber/[0.10]',  text: 'text-amber',  ring: 'border-amber/40'  },
};

export function SubmissionFlow() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="submission" className="relative mx-auto max-w-[1240px] px-8 py-28">
      <SceneHeader
        eyebrow="Submission pipeline"
        title="11 hops in one server action."
        accent="one server action."
        lead="submitCompanyDiagnosticAction(taxCode, input) runs in a single Node process. No queue, no Edge Function, no Deno. Reads + writes are explicit SQL through the typed Supabase client."
      />

      <div ref={ref} className="reveal grid grid-cols-1 gap-3 lg:grid-cols-2">
        {HOPS.map((h, i) => {
          const Icon = h.icon;
          const c = COLOR_CLASSES[h.color]!;
          return (
            <div
              key={i}
              data-i={i % 6}
              className={`relative flex gap-4 rounded-xl border ${c.ring} bg-bg-1/80 p-5 backdrop-blur-sm`}
            >
              <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-eyebrow ${c.text}`}>
                    Hop {i + 1}
                  </span>
                  <span className="font-mono text-[10.5px] text-text-faint">{h.file}</span>
                </div>
                <div className="mt-1 break-all font-mono text-[13px] font-semibold text-text">
                  {h.title}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-text-dim">{h.detail}</p>
              </div>
              {i < HOPS.length - 1 && (
                <ArrowRight size={14} className="absolute -bottom-3 right-6 text-text-faint" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
