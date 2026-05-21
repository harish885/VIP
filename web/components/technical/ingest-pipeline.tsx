'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { FileSpreadsheet, GitBranch, Database, Eye } from 'lucide-react';

const STEPS = [
  {
    icon: FileSpreadsheet,
    eyebrow: 'Step 1',
    title: 'AIDA xlsx export',
    detail: '14,999 Italian manufacturing SMEs from Bureau van Dijk. ~140 columns per row. Numerics encoded with "n.a." / "n.s." placeholders that break naïve casts.',
    code: 'data/AIDA_export_2026.xlsx',
  },
  {
    icon: GitBranch,
    eyebrow: 'Step 2',
    title: 'Python splitter',
    detail: 'src/split_aida_capitals.py groups columns into 5 workbooks by capital theme (context + financial / technological / human_organisational / relational).',
    code: 'python src/split_aida_capitals.py',
  },
  {
    icon: Database,
    eyebrow: 'Step 3',
    title: 'psycopg ingest',
    detail: 'src/ingest_aida.py reads each split with pandas, rows-as-JSONB into vip.context + 4 capital tables via the Supabase Transaction-pooler URL (IPv4-safe).',
    code: 'INSERT INTO vip.financial_capital (tax_code, peer_group_name, payload)\nVALUES (%s, %s, %s::jsonb)',
  },
  {
    icon: Eye,
    eyebrow: 'Step 4',
    title: 'Flat SQL view',
    detail: 'vip.aida_company_snapshot joins context + 4 capital tables and projects ~40 typed columns. Every numeric runs through _to_numeric() so "n.a." becomes NULL.',
    code: 'SELECT … vip._to_numeric(c.payload->>\'Revenue_Last\') AS revenue_last_thk …',
  },
];

export function IngestPipeline() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="ingest" className="relative mx-auto max-w-[1240px] px-8 py-28">
      <SceneHeader
        eyebrow="Ingest"
        title="AIDA → Postgres in four hops."
        accent="four hops."
        lead="Raw spreadsheet to typed SQL view. Built once at calibration time, queried at every page render."
      />

      <div ref={ref} className="reveal space-y-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              data-i={i}
              className="grid grid-cols-1 gap-6 rounded-2xl border border-line bg-bg-1/80 p-7 backdrop-blur-sm md:grid-cols-[200px_1fr_minmax(280px,420px)]"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple/[0.12] text-purple">
                  <Icon size={18} />
                </span>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
                    {s.eyebrow}
                  </div>
                  <div className="mt-0.5 font-serif text-[18px] font-medium tracking-tight text-text">
                    {s.title}
                  </div>
                </div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-text-dim">{s.detail}</p>
              <pre className="overflow-x-auto rounded-lg bg-bg-2/70 px-4 py-3 font-mono text-[11.5px] leading-relaxed text-text">
                <code>{s.code}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </section>
  );
}
