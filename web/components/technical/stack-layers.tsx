'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { Layers, Database, Workflow, Cloud } from 'lucide-react';

const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  cyan:   { bg: 'bg-cyan/[0.12]',   text: 'text-cyan' },
  gold:   { bg: 'bg-gold/[0.12]',   text: 'text-gold' },
  purple: { bg: 'bg-purple/[0.12]', text: 'text-purple' },
  green:  { bg: 'bg-green/[0.12]',  text: 'text-green' },
};

const LAYERS = [
  {
    icon: Layers,
    eyebrow: 'Frontend',
    title: 'Next.js 14 App Router',
    items: [
      ['Routing', 'app/ folder. (marketing) and (app) route groups. Dynamic [taxCode] segment.'],
      ['Rendering', 'Server Components by default. `use client` only where state lives.'],
      ['Forms', 'React Hook Form + @hookform/resolvers (Zod resolver).'],
      ['Styling', 'Tailwind 3.4 + CSS vars (rgb(var(--token) / <alpha>)). Custom letterSpacing.eyebrow.'],
      ['Animation', 'IntersectionObserver via useReveal + GSAP for count-ups / radar morph.'],
      ['Types', 'tsconfig strict + noUncheckedIndexedAccess. No `any` allowed in scoring engine.'],
    ],
    color: 'cyan',
  },
  {
    icon: Workflow,
    eyebrow: 'Server actions',
    title: 'Edge-free TS pipeline',
    items: [
      ['Submission', '`submitCompanyDiagnosticAction(taxCode, input)` — server action, runs in Node.'],
      ['Validation', 'DiagnosticSchema.safeParse → typed `q: DiagnosticInput`.'],
      ['Bridge', 'buildScoringInput({ diagnostic, snapshot }) merges AIDA quant + questionnaire qual.'],
      ['Engine', 'runScoring(input, ctx) — pure TS, no Deno, no Edge Function.'],
      ['Persist', 'Inserts into vip.submissions → vip.valuations → vip.recommendations.'],
      ['Routing back', 'Sets httpOnly cookie vip_company_submission_<taxCode>, redirects to detail page.'],
    ],
    color: 'gold',
  },
  {
    icon: Database,
    eyebrow: 'Backend · data',
    title: 'Supabase / Postgres',
    items: [
      ['Schema', '`vip` schema only — must be added to API → Exposed schemas.'],
      ['Calibration', '5 JSONB tables (context, financial / technological / human_organisational / relational_capital).'],
      ['User-facing', 'profiles · companies · submissions · valuations · recommendations.'],
      ['Views', 'aida_company_snapshot — flat join over context + 4 capital tables.'],
      ['RPCs', 'percentile_in_peer_group, _to_numeric — SECURITY DEFINER, STABLE.'],
      ['Policies', 'RLS: calibration READ-open. User tables WHERE user_id = auth.uid().'],
    ],
    color: 'purple',
  },
  {
    icon: Cloud,
    eyebrow: 'Ingest · ops',
    title: 'Python ETL + Vercel host',
    items: [
      ['Splitter', 'src/split_aida_capitals.py — splits raw xlsx into 5 capital workbooks.'],
      ['Ingest', 'src/ingest_aida.py — pandas → psycopg → vip.context + 4 JSONB tables.'],
      ['Connection', 'Transaction-pooler URL only — direct IPv6 hangs on home networks.'],
      ['Type gen', '`supabase gen types --schema vip,public` → lib/database.types.ts.'],
      ['Calibration check', 'web/scripts/calibrate-acme.ts — asserts ±10% on V / SQF / GF / Quality.'],
      ['Hosting', 'Vercel (Phase 09). Supabase Cloud (managed Postgres).'],
    ],
    color: 'green',
  },
];

export function StackLayers() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="stack" className="relative mx-auto max-w-[1240px] px-8 py-28">
      <SceneHeader
        eyebrow="Stack"
        title="Four layers, one type chain."
        accent="one type chain."
        lead="Browser → Server Component → Server Action → Supabase (Postgres + RLS). Strict TS the whole way. No untyped JSON at any seam."
      />

      <div ref={ref} className="reveal grid grid-cols-1 gap-4 lg:grid-cols-2">
        {LAYERS.map((l, i) => {
          const Icon = l.icon;
          const c = COLOR_CLASSES[l.color] ?? COLOR_CLASSES.gold!;
          return (
            <div
              key={l.title}
              data-i={i}
              className="glass p-7 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ${c.text}`}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <div className={`font-mono text-[10px] font-bold uppercase tracking-eyebrow ${c.text}`}>
                    {l.eyebrow}
                  </div>
                  <div className="font-serif text-[20px] font-medium tracking-tight text-text">
                    {l.title}
                  </div>
                </div>
              </div>
              <dl className="space-y-2">
                {l.items.map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-[13px] leading-snug">
                    <dt className="w-[88px] shrink-0 font-mono text-[10.5px] font-semibold uppercase tracking-eyebrow text-text-faint">
                      {k}
                    </dt>
                    <dd className="flex-1 text-text-dim">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
