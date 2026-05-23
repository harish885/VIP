'use client';

import Link from 'next/link';
import { ArrowRight, Github, Code2, Database } from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';

export function TechClosing() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="tech-closing" className="relative mx-auto max-w-[1180px] px-8 py-28">
      <div
        ref={ref}
        className="reveal rounded-2xl border border-line bg-bg-1/80 p-10 text-center backdrop-blur-sm"
      >
        <div className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
          That&rsquo;s the whole thing
        </div>

        <h2
          className="mb-4 font-serif font-normal leading-[1.05] text-gradient-headline"
          style={{ fontSize: 'clamp(1.625rem, 3.4vw, 2.625rem)' }}
        >
          No magic. Just <span className="text-gradient-gold">pure functions</span> on a typed seam.
        </h2>

        <p className="mx-auto mb-8 max-w-[640px] text-[14px] leading-relaxed text-text-dim">
          14,999 calibration rows in a Postgres view. 19 inputs through 6 pure-TS
          stages. One server action ships it. The same module re-runs in the
          browser when the user moves a slider — no second engine to keep in sync.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-gold/[0.10] px-4 py-2 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/[0.18]"
          >
            See it run on a real company <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-2/60 px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text"
          >
            Marketing overview
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={Code2} label="Lines of TS in scoring/" value="≈ 950" />
          <Stat icon={Database} label="SQL migrations" value="7" />
          <Stat icon={Github} label="Strict TS · 0 any" value="✓" />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Code2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-line bg-bg-1 px-4 py-3">
      <Icon size={16} className="text-text-faint" />
      <div className="text-left">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
          {label}
        </div>
        <div className="font-serif text-[16px] font-medium text-text">{value}</div>
      </div>
    </div>
  );
}
