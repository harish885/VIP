'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { Sliders } from 'lucide-react';

export function SimulationEngineSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="sim" className="relative mx-auto max-w-[1180px] px-8 py-28">
      <SceneHeader
        eyebrow="Simulation engine"
        title="Same pipeline, client-side."
        accent="client-side."
        lead="The Scenario tab runs runScoring() in the browser on every slider tick. Stage 2 detects no Supabase client and skips straight to the synthetic prior — math stays local, latency stays at a frame."
      />

      <div ref={ref} className="reveal grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Code */}
        <div className="overflow-hidden rounded-2xl border border-line bg-bg-1/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-line bg-bg-2/60 px-5 py-3">
            <Sliders size={14} className="text-purple" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-eyebrow text-purple">
              components/dashboard/simulation-panel.tsx
            </span>
          </div>
          <pre className="overflow-x-auto px-5 py-4 font-mono text-[11.5px] leading-[1.75] text-text">{`useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    const next: ScoringInput = {
      ...baseline,
      top3_client_concentration: values.concentration,
      recurring_revenue_pct:     values.recurring,
      tech_investment_ratio_pct: values.rd_intensity,
    };
    startTransition(async () => {
      const result = await runScoring(next, {});   // no supabase → prior
      setSimulated(result);
    });
  }, 30);
  return () => clearTimeout(debounceRef.current!);
}, [values, baseline]);`}</pre>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <Note title="Single source of truth">
            The same <code className="rounded bg-bg-2/70 px-1 py-0.5 font-mono text-[12px] text-text">runScoring</code> module
            is imported on both the server (submitDiagnosticAction) and the client
            (SimulationPanel). No duplicated arithmetic.
          </Note>
          <Note title="Debounce + transition">
            Slider drags hit at ~60 fps. 30 ms debounce collapses bursts; React
            <code className="rounded bg-bg-2/70 px-1 py-0.5 font-mono text-[12px] text-text">startTransition</code>
            marks the rescore as low-priority so UI thread stays smooth.
          </Note>
          <Note title="Stage-2 fallback path">
            When ctx.supabase is undefined the benchmarks step skips the RPC and uses
            the synthetic prior baked into benchmarks.ts. Same percentile shape, no
            network round-trip.
          </Note>
          <Note title="Three levers, three proxies">
            concentration → input.top3_client_concentration ·
            recurring → recurring_revenue_pct ·
            rd_intensity → tech_investment_ratio_pct. Everything else stays pinned
            to the baseline so the user can&rsquo;t accidentally hand-tune all 19 inputs.
          </Note>
        </div>
      </div>
    </section>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-bg-1/70 p-5 backdrop-blur-sm">
      <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
        {title}
      </div>
      <div className="text-[13.5px] leading-relaxed text-text-dim">{children}</div>
    </div>
  );
}
