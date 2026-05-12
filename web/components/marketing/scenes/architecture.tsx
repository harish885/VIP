'use client';

import { ArrowRight } from 'lucide-react';
import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

const BLOCKS = [
  {
    label: 'Sources',
    name: 'Inputs & Calibration',
    items: ['Entrepreneur questionnaire', 'Quantitative submissions', 'AIDA · 14,999 SMEs', 'Sector multiples · Damodaran'],
  },
  {
    label: 'Storage',
    name: 'Supabase · Postgres',
    items: ['context', 'financial_capital', 'technological_capital', 'human_organisational', 'relational_capital'],
  },
  {
    label: 'Application',
    name: 'VIP Web Dashboard',
    items: ['Per-company valuation', '4-capital radar & scoring', 'ROV-ranked action engine', 'What-if simulation', 'Auth + RLS per user'],
  },
];

export function Architecture() {
  const rowRef = useReveal<HTMLDivElement>();

  return (
    <section id="architecture" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="Build architecture"
        title="From inputs to dashboard."
        accent="to dashboard."
        lead="Five Supabase tables hold the cleaned dataset and user submissions. A thin API layer serves the dashboard with auth, row-level security, and realtime updates."
      />

      <div
        ref={rowRef}
        className="reveal grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]"
      >
        {BLOCKS.map((b, i) => (
          <FlowFragment key={b.label} block={b} index={i} isLast={i === BLOCKS.length - 1} />
        ))}
      </div>
    </section>
  );
}

function FlowFragment({
  block, index, isLast,
}: { block: typeof BLOCKS[number]; index: number; isLast: boolean }) {
  return (
    <>
      <div
        data-i={index}
        className="glass p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan"
      >
        <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
          {block.label}
        </div>
        <div className="mb-4 font-serif text-[22px] font-medium tracking-tight">{block.name}</div>
        <ul className="space-y-0">
          {block.items.map((item) => (
            <li key={item} className="relative py-1 pl-4 font-mono text-[13px] text-text-dim">
              <span
                aria-hidden
                className="absolute left-0 top-[14px] h-1 w-1 rounded-full bg-cyan"
                style={{ boxShadow: '0 0 8px rgb(var(--cyan))' }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {!isLast && (
        <div className="flex items-center justify-center text-cyan" style={{ transform: 'rotate(90deg)' }}>
          <span className="lg:rotate-0" style={{ transform: 'rotate(-90deg)' }}>
            <ArrowRight size={22} />
          </span>
        </div>
      )}
    </>
  );
}
