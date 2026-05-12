'use client';

import { Database, Brain, Compass } from 'lucide-react';
import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';

const CARDS = [
  {
    Icon: Database,
    title: 'Data is everywhere',
    body: "ERP systems, accounting software, CRMs — SMEs already produce more data than they realise. Storage isn't the constraint.",
  },
  {
    Icon: Brain,
    title: 'Insight is missing',
    body: "Nobody translates that data into a clear picture of company value and the levers that drive it. Reporting describes; it doesn't decide.",
  },
  {
    Icon: Compass,
    title: 'Decisions in the dark',
    body: "Investments, exits, growth bets — entrepreneurs commit capital and time without a quantified compass. Most rely on instinct, peer anecdotes, or one advisor's view.",
  },
];

export function Problem() {
  const rowRef = useReveal<HTMLDivElement>();

  return (
    <section id="problem" className="relative mx-auto max-w-[1240px] px-8 py-36">
      <SceneHeader
        eyebrow="The problem"
        title="The strategic intelligence gap."
        accent="intelligence gap."
        lead="SMEs have data. They lack the translation from data into a quantified compass for the decisions that actually matter — investment, exit, growth."
      />
      <div ref={rowRef} className="reveal grid grid-cols-1 gap-[18px] md:grid-cols-3">
        {CARDS.map(({ Icon, title, body }, i) => (
          <div
            key={title}
            data-i={i}
            className="glass p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-red/40"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[11px] border border-red/20 bg-red/10 text-red">
              <Icon size={22} strokeWidth={2} />
            </div>
            <h3 className="mb-2.5 font-serif text-[22px] font-medium leading-tight tracking-tight">
              {title}
            </h3>
            <p className="text-[14.5px] leading-relaxed text-text-dim">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
