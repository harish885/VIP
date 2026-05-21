'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';

const HOPS: Array<{ actor: string; action: string; detail: string; file?: string }> = [
  { actor: 'Browser',           action: 'GET /companies/[taxCode]?submitted=…', detail: 'Next.js App Router resolves the segment.', file: 'app/(app)/companies/[taxCode]/page.tsx' },
  { actor: 'middleware.ts',     action: 'updateSession(req)',                   detail: 'Refreshes the Supabase auth cookie. Demo mode → ENFORCE_AUTH_GUARDS = false, so no redirect.', file: 'lib/supabase/middleware.ts' },
  { actor: 'page.tsx (server)', action: 'createServiceClient()',                detail: 'Service-role client, schema: vip pinned. Used because demo writes have user_id = NULL.', file: 'lib/supabase/service.ts' },
  { actor: 'page.tsx',          action: 'getCompanySnapshot(service, taxCode)', detail: 'SELECT * FROM vip.aida_company_snapshot WHERE tax_code = $1. Single row or null.', file: 'lib/aida.ts' },
  { actor: 'page.tsx',          action: 'loadCompanyWorkspace(...)',            detail: 'Looks up the latest valuation for the tax_code. Honours ?submitted=<id> + httpOnly cookie to land on a specific submission.', file: 'lib/company-loader.ts' },
  { actor: 'page.tsx',          action: 'fromValuationRow(...)',                detail: 'Pure transform: vip.valuations row + snapshot → DashboardData view-model. Adds capitals[], levers[], simulationBaseline.', file: 'lib/dashboard-data.ts' },
  { actor: 'page.tsx',          action: '<CompanyWorkspace data={…} snapshot={…} />', detail: 'Server component renders the workspace. Snapshot threaded for info-button explanations.', file: 'components/company-workspace/workspace.tsx' },
  { actor: 'Browser',           action: 'Hydrate · useMemo(buildExplanations)', detail: 'Client computes per-metric Explanation objects once. InfoButton uses createPortal to escape overflow:hidden grids.', file: 'lib/dashboard-explanations.ts' },
  { actor: 'Browser',           action: 'IntersectionObserver fires reveal',    detail: '.reveal → .is-visible. SVG radar polygon morphs via GSAP. KPI count-ups via animateCount().', file: 'lib/use-reveal.ts · lib/animation.ts' },
];

export function RequestLifecycle() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="request" className="relative mx-auto max-w-[1180px] px-8 py-28">
      <SceneHeader
        eyebrow="Request lifecycle"
        title="URL to rendered KPI."
        accent="rendered KPI."
        lead="A read of /companies/[taxCode] passes through middleware, two Supabase round-trips, a pure-TS transform, and lands as KPI cards in the browser."
      />

      <div ref={ref} className="reveal relative mx-auto max-w-[940px]">
        {/* Vertical rail */}
        <span
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px bg-line"
        />
        <ol className="space-y-4">
          {HOPS.map((h, i) => (
            <li key={i} data-i={i} className="relative pl-12">
              <span className="absolute left-0 top-1 inline-flex h-[36px] w-[36px] items-center justify-center rounded-full border border-cyan/40 bg-bg-1 font-mono text-[12px] font-bold text-cyan">
                {i + 1}
              </span>
              <div className="rounded-xl border border-line bg-bg-1/80 p-4 backdrop-blur-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-eyebrow text-cyan">
                    {h.actor}
                  </span>
                  {h.file && (
                    <span className="font-mono text-[10.5px] text-text-faint">{h.file}</span>
                  )}
                </div>
                <div className="mt-1 font-mono text-[13.5px] font-semibold text-text">
                  {h.action}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-text-dim">{h.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
