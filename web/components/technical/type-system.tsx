'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { ArrowDown } from 'lucide-react';

const CHAIN = [
  {
    label: 'supabase gen types',
    file: 'lib/database.types.ts',
    body: 'Generated. `Database[\'vip\'][\'Tables\'][\'valuations\'][\'Row\']` is the source of truth for everything downstream.',
    code: 'npx supabase gen types typescript --schema vip,public --linked > lib/database.types.ts',
  },
  {
    label: 'Typed clients',
    file: 'lib/supabase/{client,server,service,middleware}.ts',
    body: 'createClient<Database, \'vip\'>(...) so .from(\'valuations\') is keyed against the vip schema.',
    code: 'createClient<Database, \'vip\'>(URL, KEY, { db: { schema: \'vip\' } })',
  },
  {
    label: 'Zod questionnaire',
    file: 'lib/diagnostic-schema.ts',
    body: 'export const DiagnosticSchema = z.object({…}). z.infer<typeof DiagnosticSchema> = DiagnosticInput.',
    code: 'type DiagnosticInput = z.infer<typeof DiagnosticSchema>',
  },
  {
    label: 'Bridge type',
    file: 'lib/scoring/company-input.ts',
    body: 'ScoringInput extends DiagnosticInput — adds AIDA-derived quant + proxy ratios. Built by buildScoringInput({ diagnostic, snapshot }).',
    code: 'interface ScoringInput extends DiagnosticInput { revenue_y_1; revenue_y_2; revenue_y_3; ebitda; … }',
  },
  {
    label: 'Engine output',
    file: 'lib/scoring/types.ts',
    body: 'ScoringResult — { inputs, metrics, percentiles, capitals, composite, growth, valuation, quality_score, risk_index, flags }.',
    code: 'interface ScoringResult { capitals: CapitalScores; composite: { cqs; sqf }; growth: GrowthFactor; valuation: ValuationOutputs; … }',
  },
  {
    label: 'View-model',
    file: 'lib/dashboard-data.ts',
    body: 'fromValuationRow({ company, valuation, submission, recommendations }) → DashboardData. Pure transform from DB → UI.',
    code: 'function fromValuationRow(opts: FromRealOptions): DashboardData',
  },
  {
    label: 'UI props',
    file: 'components/company-workspace/workspace.tsx',
    body: 'CompanyWorkspace({ data: DashboardData, snapshot: AidaSnapshot | null, … }). buildExplanations(data, snapshot) feeds every InfoButton.',
    code: 'interface WorkspaceProps { data: DashboardData; snapshot?: AidaSnapshot | null; … }',
  },
];

export function TypeSystemSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="types" className="relative mx-auto max-w-[1180px] px-8 py-28">
      <SceneHeader
        eyebrow="Type system"
        title="One chain from Postgres to JSX."
        accent="Postgres to JSX."
        lead="Generated DB types + Zod + hand-written engine types meet at the React props boundary. tsc --strict + noUncheckedIndexedAccess in CI catches every dropped narrow."
      />

      <div ref={ref} className="reveal mx-auto max-w-[940px] space-y-3">
        {CHAIN.map((c, i) => (
          <div key={c.label}>
            <div data-i={i} className="rounded-xl border border-line bg-bg-1/80 p-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-eyebrow text-cyan">
                  {c.label}
                </span>
                <span className="font-mono text-[10.5px] text-text-faint">{c.file}</span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{c.body}</p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-2/70 px-4 py-2.5 font-mono text-[11.5px] leading-relaxed text-text">
                <code>{c.code}</code>
              </pre>
            </div>
            {i < CHAIN.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown size={14} className="text-text-faint" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
