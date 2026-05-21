'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { Folder, File as FileIcon } from 'lucide-react';

interface Node {
  name: string;
  kind: 'dir' | 'file';
  note?: string;
  children?: Node[];
}

const TREE: Node[] = [
  { name: 'CLAUDE.md', kind: 'file', note: 'Project briefing — read first' },
  { name: 'README.md', kind: 'file' },
  {
    name: 'data/', kind: 'dir', note: 'AIDA raw + split xlsx (14,999 SMEs)', children: [],
  },
  {
    name: 'docs/', kind: 'dir', children: [
      { name: 'SME_Valuation_Design.pdf', kind: 'file', note: 'Four-Capital design rationale' },
      { name: 'VIP_Build_Plan.pdf', kind: 'file', note: '28-page phase plan' },
      { name: 'PHASE_03_SETUP.md', kind: 'file', note: 'Supabase setup walkthrough' },
    ],
  },
  {
    name: 'src/', kind: 'dir', note: 'Python ETL', children: [
      { name: 'split_aida_capitals.py', kind: 'file', note: 'Raw xlsx → 5 capital workbooks' },
      { name: 'ingest_aida.py', kind: 'file', note: 'pandas → psycopg → vip.context + 4 JSONB tables' },
    ],
  },
  {
    name: 'supabase/', kind: 'dir', children: [
      { name: 'config.toml', kind: 'file' },
      {
        name: 'migrations/', kind: 'dir', children: [
          { name: '20260510000000_create_vip_schema.sql', kind: 'file', note: 'Schema + grants' },
          { name: '20260510000001_calibration_tables.sql', kind: 'file', note: '5 JSONB calibration tables + indexes' },
          { name: '20260510000002_user_tables.sql', kind: 'file', note: 'profiles · companies · submissions · valuations · recommendations' },
          { name: '20260510000003_rls_policies.sql', kind: 'file', note: 'Row-Level Security on every user table' },
          { name: '20260512000000_demo_mode_and_percentile.sql', kind: 'file', note: 'Drops NOT NULL, adds RPC percentile_in_peer_group' },
          { name: '20260512100000_company_search_and_v2_questionnaire.sql', kind: 'file', note: 'View aida_company_snapshot, 19-Q schema' },
          { name: '20260512110000_safe_numeric_cast.sql', kind: 'file', note: 'RPC _to_numeric — handles AIDA "n.a." placeholders' },
        ],
      },
    ],
  },
  {
    name: 'web/', kind: 'dir', children: [
      {
        name: 'app/', kind: 'dir', children: [
          { name: '(marketing)/', kind: 'dir', note: '10 scenes + /technical' },
          { name: '(auth)/', kind: 'dir', note: 'Login / signup (dormant in demo)' },
          { name: '(app)/companies/[taxCode]/page.tsx', kind: 'file', note: 'Per-company workspace' },
          { name: '(app)/companies/[taxCode]/diagnostic/actions.ts', kind: 'file', note: 'Server action — 11-hop submission pipeline' },
        ],
      },
      {
        name: 'components/', kind: 'dir', children: [
          { name: 'company-workspace/workspace.tsx', kind: 'file', note: 'Dashboard surface with 4 tabs' },
          { name: 'dashboard/simulation-panel.tsx', kind: 'file', note: 'Client-side runScoring on slider change' },
          { name: 'diagnostic/diagnostic-v2-form.tsx', kind: 'file', note: 'RHF + Zod questionnaire' },
        ],
      },
      {
        name: 'lib/', kind: 'dir', children: [
          { name: 'scoring/', kind: 'dir', note: '6-stage pipeline (index, metrics, benchmarks, aggregate, valuation, flags)' },
          { name: 'scoring/company-input.ts', kind: 'file', note: 'AIDA + questionnaire → ScoringInput' },
          { name: 'scoring/recommendations.ts', kind: 'file', note: 'ROV ranker' },
          { name: 'supabase/{client,server,service,middleware}.ts', kind: 'file', note: 'Typed clients pinned to schema:`vip`' },
          { name: 'database.types.ts', kind: 'file', note: 'Generated — `supabase gen types --schema vip,public`' },
          { name: 'aida.ts', kind: 'file', note: 'searchCompanies + getCompanySnapshot' },
          { name: 'company-loader.ts', kind: 'file', note: 'loadCompanyWorkspace, latest computed_at' },
          { name: 'dashboard-data.ts', kind: 'file', note: 'fromValuationRow — DB row → DashboardData view-model' },
          { name: 'dashboard-explanations.ts', kind: 'file', note: 'Info-button explanation builder' },
        ],
      },
      { name: 'middleware.ts', kind: 'file', note: 'Supabase SSR session refresh' },
      { name: 'package.json', kind: 'file' },
    ],
  },
];

export function RepoMap() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="repo" className="relative mx-auto max-w-[1240px] px-8 py-28">
      <SceneHeader
        eyebrow="Repository"
        title="Where every file lives."
        accent="every file lives."
        lead="Python ingest at the root. SQL migrations under supabase/. Web app under web/. Generated types regenerated whenever a migration lands."
      />
      <div ref={ref} className="reveal mx-auto max-w-[920px] rounded-2xl border border-line bg-bg-1/80 p-7 backdrop-blur-sm">
        <div className="font-mono text-[12.5px] leading-[1.7] text-text-dim">
          <span className="text-text">VIP/</span>
          <TreeBlock nodes={TREE} depth={1} />
        </div>
      </div>
    </section>
  );
}

function TreeBlock({ nodes, depth }: { nodes: Node[]; depth: number }) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((n, i) => (
        <li key={`${n.name}-${i}`}>
          <div style={{ paddingLeft: depth * 16 }} className="flex items-start gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="select-none font-mono text-text-faint">{depth > 0 ? '├─' : ''}</span>
              {n.kind === 'dir' ? (
                <Folder size={11} className="text-gold/80" />
              ) : (
                <FileIcon size={11} className="text-text-faint" />
              )}
              <span className={n.kind === 'dir' ? 'font-semibold text-text' : 'text-text-dim'}>
                {n.name}
              </span>
            </span>
            {n.note && (
              <span className="ml-auto pl-3 text-right text-[11.5px] italic text-text-faint">
                {n.note}
              </span>
            )}
          </div>
          {n.children && n.children.length > 0 && (
            <TreeBlock nodes={n.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
