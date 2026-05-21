'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';

const AUDIENCES = [
  'SME entrepreneurs',
  'Owner-operators',
  'Acquirers & search funds',
  'M&A advisors',
  'Investment committees',
];

export function Closing() {
  const rootRef = useReveal<HTMLElement>();

  return (
    <section
      ref={rootRef}
      id="closing"
      className="reveal relative mx-auto max-w-[1240px] overflow-hidden rounded-[24px] px-8 py-[clamp(60px,9vw,120px)] text-center"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[20%]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(176, 122, 26, 0.06), transparent 65%)',
        }}
      />

      <div className="relative mb-5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-gold">
        — Think big —
      </div>

      <h3
        className="relative mb-8 font-serif font-normal leading-[1.0] text-gradient-headline"
        style={{ fontSize: 'clamp(2.25rem, 6vw, 5.5rem)', letterSpacing: '-0.04em' }}
      >
        Don&rsquo;t design an algorithm.<br />
        Design a <span className="text-gradient-gold">decision assistant.</span>
      </h3>

      <p
        className="relative mx-auto mb-11 max-w-[680px] leading-relaxed text-text-dim"
        style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.0625rem)' }}
      >
        The difference between a calculation tool and a strategic intelligence platform
        doesn&rsquo;t lie in the complexity of the model. It lies in the quality of the questions
        the model knows how to ask the entrepreneur.
      </p>

      <div className="relative flex flex-wrap justify-center gap-2.5">
        {AUDIENCES.map((a) => (
          <span
            key={a}
            className="rounded-full border border-line bg-bg-3/65 px-4 py-2 text-[13px] font-medium text-text backdrop-blur-glass transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
          >
            {a}
          </span>
        ))}
      </div>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px]">
        <Link
          href="/technical"
          className="inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-eyebrow text-text-dim transition-colors hover:text-gold"
        >
          Read the technical breakdown <ArrowRight size={12} />
        </Link>
        <span className="text-text-faint">·</span>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-eyebrow text-text-dim transition-colors hover:text-gold"
        >
          Try it on a real company <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}
