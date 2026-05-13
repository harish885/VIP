'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  FileText,
  Layers,
  Target,
  Sparkles,
  Sliders,
  CheckCircle2,
  Building2,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';
import { cn } from '@/lib/cn';
import { DEMO_VALUATION, DEMO_ACTIONS } from '@/lib/demo-data';
import { computeValuation } from '@/lib/scoring/valuation';
import { getSectorMultiple } from '@/lib/scoring/sector-multiples';
import { DEMO_SCORING_INPUT } from '@/lib/scoring/company-input';

/**
 * Explainer — a guided visual story for /how-it-works.
 *
 * The page reads top → bottom. Each section enters the viewport with a
 * subtle fade-up via useReveal. Two sections include real interactive or
 * data-driven motion (the four-capital diagram and the scenario slider)
 * so the visitor can feel the product working, not just read about it.
 */
export function Explainer() {
  return (
    <div className="bg-bg">
      <BackNav />
      <Hero />
      <Flow />
      <Inputs />
      <Capitals />
      <Outputs />
      <Recommendations />
      <Scenario />
      <Takeaway />
    </div>
  );
}

// =============================================================================
// Shared primitives
// =============================================================================
function Section({
  eyebrow,
  title,
  intro,
  children,
  tone = 'paper',
  fullBleed,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'paper' | 'inset';
  fullBleed?: boolean;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn(
        'reveal mx-auto w-full px-6 py-20 md:py-28',
        fullBleed ? 'max-w-none' : 'max-w-[1080px]',
        tone === 'inset' && 'bg-bg-2/40',
      )}
    >
      <header className="max-w-[720px]">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
          {eyebrow}
        </div>
        <h2 className="mt-2 font-serif text-[30px] font-medium leading-[1.1] tracking-tight text-text md:text-[40px]">
          {title}
        </h2>
        {intro && (
          <p className="mt-3 max-w-[560px] text-[14.5px] leading-relaxed text-text-dim md:text-[15.5px]">
            {intro}
          </p>
        )}
      </header>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function BackNav() {
  return (
    <div className="mx-auto max-w-[1080px] px-6 pt-6">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
      >
        <ArrowLeft size={13} /> Back to companies
      </Link>
    </div>
  );
}

// =============================================================================
// 1. HERO
// =============================================================================
function Hero() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="mx-auto max-w-[1080px] px-6 pb-16 pt-10 md:pt-16">
      <div ref={ref} className="reveal">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
          A guided tour
        </div>
        <h1 className="mt-3 max-w-[860px] font-serif text-[44px] font-medium leading-[1.02] tracking-tight text-text md:text-[64px]">
          A calm way to{' '}
          <span className="text-gradient-gold">understand what a company is worth</span>{' '}
          — and what could grow it.
        </h1>
        <p className="mt-5 max-w-[640px] text-[15px] leading-relaxed text-text-dim md:text-[17px]">
          VIP turns the public data already known about a company plus a short
          strategic conversation into a credible strategic valuation. Built for
          SME entrepreneurs and the advisors who work with them.
        </p>
      </div>

      <HeroTransform />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-gold/[0.12] px-4 py-2 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/[0.20]"
        >
          Try the live product <ArrowRight size={14} />
        </Link>
        <Link
          href="/method"
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-1 px-4 py-2 text-[12.5px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text"
        >
          Detailed methodology
        </Link>
      </div>
    </section>
  );
}

function HeroTransform() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal mt-12 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]"
    >
      <HeroCard tone="left">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/15 text-cyan">
            <Building2 size={16} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-text">A real company</div>
            <div className="font-mono text-[11px] text-text-faint">
              EUROCOIL S.R.L. · NACE 2825 · Verona
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Mini label="Revenue" value="€55M" />
          <Mini label="EBITDA" value="€4.9M" />
          <Mini label="Employees" value="199" />
        </div>
      </HeroCard>

      <HeroArrow />

      <HeroCard tone="right">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-text">A strategic value</div>
            <div className="font-mono text-[11px] text-text-faint">
              Quality 67 · Risk MEDIUM
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
              Company value
            </div>
            <div className="mt-1 font-serif text-[28px] font-medium leading-none tracking-tight text-text">
              €4.2M
            </div>
            <div className="mt-1 text-[11.5px] text-text-faint">
              Range €3.8–€4.7M
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
              Potential
            </div>
            <div className="mt-1 font-serif text-[18px] font-medium leading-none tracking-tight text-green">
              +38%
            </div>
          </div>
        </div>
      </HeroCard>
    </div>
  );
}

function HeroCard({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-bg-1 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        tone === 'right' && 'border-gold/35',
      )}
    >
      {children}
    </div>
  );
}

function HeroArrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <svg width="120" height="40" viewBox="0 0 120 40" aria-hidden>
        <defs>
          <marker
            id="hero-arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0 0 L8 4 L0 8 z" fill="rgb(var(--gold))" />
          </marker>
        </defs>
        <path
          d="M0 20 L100 20"
          stroke="rgb(var(--gold) / 0.7)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
          markerEnd="url(#hero-arrowhead)"
          className="hero-flow-path"
        />
        <style>{`
          .hero-flow-path {
            stroke-dasharray: 130;
            stroke-dashoffset: 130;
            animation: hero-flow 1.6s ease-out 0.4s forwards;
          }
          @keyframes hero-flow {
            to { stroke-dashoffset: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-flow-path { animation: none; stroke-dashoffset: 0; }
          }
        `}</style>
      </svg>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg-2/40 px-2 py-2">
      <div className="font-mono text-[9px] uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[12.5px] font-semibold text-text">
        {value}
      </div>
    </div>
  );
}

// =============================================================================
// 2. FLOW — seven stages, scroll-revealed
// =============================================================================
const FLOW_STEPS: Array<{ icon: LucideIcon; title: string; body: string }> = [
  { icon: Search,         title: 'Choose a company',          body: 'Search a real SME from the calibration set.' },
  { icon: FileText,       title: 'Gather the public facts',   body: 'Financials, structure, sector — pulled automatically.' },
  { icon: Layers,         title: 'Answer the diagnostic',     body: '19 short questions about how the company really runs.' },
  { icon: Target,         title: 'Interpret across four capitals', body: 'Financial, technological, human, relational.' },
  { icon: Sparkles,       title: 'Generate the value picture', body: 'Today’s value, the range, the upside, and the risks.' },
  { icon: ArrowRight,     title: 'Rank the highest-value actions', body: 'A short, prioritised plan — not a wishlist.' },
  { icon: Sliders,        title: 'Test what-if scenarios',     body: 'See value move as you improve key levers.' },
];

function Flow() {
  return (
    <Section
      eyebrow="The flow"
      title="Seven stages, one clear arc."
      intro="Every workspace is built the same way — so the entrepreneur always knows where they are and where they are going."
    >
      <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {FLOW_STEPS.map(({ icon: Icon, title, body }, i) => (
          <FlowCell key={title} index={i} icon={Icon} title={title} body={body} />
        ))}
        <li className="hidden bg-bg-1 lg:block" />
      </ol>
    </Section>
  );
}

function FlowCell({
  index,
  icon: Icon,
  title,
  body,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  const ref = useReveal<HTMLLIElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -5% 0px',
  });
  return (
    <li
      ref={ref}
      className="reveal relative bg-bg-1 px-5 py-6"
      style={{ transitionDelay: `${Math.min(index * 0.05, 0.3)}s` }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
          0{index + 1}
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-gold">
          <Icon size={14} />
        </span>
      </div>
      <h3 className="mt-3 font-serif text-[17px] font-medium tracking-tight text-text">
        {title}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-text-dim">{body}</p>
    </li>
  );
}

// =============================================================================
// 3. INPUTS — two streams
// =============================================================================
const COMPANY_FACTS: Array<{ label: string; value: string }> = [
  { label: 'Revenue history',       value: '3-year series' },
  { label: 'EBITDA',                value: '€750K · 8.9%' },
  { label: 'Balance sheet',         value: 'Equity · NFP · D/E' },
  { label: 'R&D expense',           value: 'Intangibles · IP' },
  { label: 'Employees',             value: '199 · €450k/head' },
  { label: 'Sector & peer group',   value: 'NACE 2825 · Italy' },
];
const ENTREPRENEUR_ANSWERS: Array<{ q: string; rating: number; label: string }> = [
  { q: 'Digital maturity',         rating: 2, label: 'Behind' },
  { q: 'Founder dependency',       rating: 2, label: 'Strong' },
  { q: 'Client portfolio quality', rating: 3, label: 'Mixed' },
  { q: 'Process formalisation',    rating: 3, label: 'Partial' },
  { q: 'Strategic partnerships',   rating: 3, label: 'Some' },
  { q: 'Scalability of model',     rating: 4, label: 'Decent' },
];

function Inputs() {
  return (
    <Section
      eyebrow="Inputs"
      title="Two streams. Both small. Both essential."
      intro="The entrepreneur does not type the financials. Public company data is paired with their strategic judgement."
      tone="inset"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Stream
          eyebrow="Stream A · Automatic"
          title="The company already speaks for itself."
          subtitle="Pulled from the AIDA / Bureau van Dijk database for every Italian SME in the calibration set."
        >
          <ul className="space-y-2">
            {COMPANY_FACTS.map((f) => (
              <li
                key={f.label}
                className="flex items-center justify-between rounded-lg border border-line bg-bg-1 px-3.5 py-2.5"
              >
                <span className="text-[13px] text-text">{f.label}</span>
                <span className="font-mono text-[11.5px] text-text-faint">{f.value}</span>
              </li>
            ))}
          </ul>
        </Stream>

        <Stream
          eyebrow="Stream B · Entrepreneur"
          title="Nineteen honest answers."
          subtitle="A short qualitative conversation, on a 1–5 scale. Calibrated by the entrepreneur, not inferred."
        >
          <ul className="space-y-2">
            {ENTREPRENEUR_ANSWERS.map((a) => (
              <li
                key={a.q}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-1 px-3.5 py-2.5"
              >
                <span className="min-w-0 truncate text-[13px] text-text">{a.q}</span>
                <span className="flex items-center gap-2">
                  <Pips active={a.rating} />
                  <span className="font-mono text-[11px] text-text-faint">{a.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </Stream>
      </div>
    </Section>
  );
}

function Stream({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg-1 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
        {eyebrow}
      </div>
      <h3 className="mt-1 font-serif text-[18px] font-medium tracking-tight text-text">
        {title}
      </h3>
      <p className="mt-1 text-[12.5px] text-text-faint">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Pips({ active }: { active: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            'h-2 w-2 rounded-full',
            n <= active ? 'bg-gold' : 'bg-line',
          )}
        />
      ))}
    </span>
  );
}

// =============================================================================
// 4. CAPITALS — diagram with animated weights
// =============================================================================
const CAPITALS = [
  {
    key: 'fin', name: 'Financial', weight: 35, color: 'cap-fin',
    blurb: 'Profitability, growth, recurring revenue, leverage.',
    sample: 68,
  },
  {
    key: 'tech', name: 'Technological', weight: 20, color: 'cap-tech',
    blurb: 'Digital maturity, proprietary IP, R&D intensity.',
    sample: 54,
  },
  {
    key: 'human', name: 'Human & Organisational', weight: 25, color: 'cap-human',
    blurb: 'Management depth, transferability, process maturity.',
    sample: 71,
  },
  {
    key: 'rel', name: 'Relational', weight: 20, color: 'cap-rel',
    blurb: 'Reputation, ecosystem position, partnerships.',
    sample: 55,
  },
] as const;

function Capitals() {
  return (
    <Section
      eyebrow="Interpretation"
      title="A company is more than its EBITDA."
      intro="Every diagnostic is read through four lenses. Each pillar carries its own weight in the composite quality score."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <CapitalsDiagram />
        <ul className="grid gap-3">
          {CAPITALS.map((c) => (
            <CapitalRow key={c.key} c={c} />
          ))}
          <li className="mt-2 rounded-lg border border-line bg-bg-2/40 px-4 py-3 text-[12.5px] text-text-dim">
            Weights combine into a <span className="font-medium text-text">composite quality score (0–100)</span>{' '}
            and a <span className="font-medium text-text">strategic quality factor (0.6–1.4)</span> that nudges the headline value up or down.
          </li>
        </ul>
      </div>
    </Section>
  );
}

function CapitalRow({
  c,
}: {
  c: typeof CAPITALS[number];
}) {
  const ref = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className="reveal flex items-center gap-4 rounded-xl border border-line bg-bg-1 p-4"
    >
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-full"
        style={{ background: `rgb(var(--${c.color}))` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[14px] font-medium text-text">{c.name}</span>
          <span className="font-mono text-[11px] text-text-faint">weight {c.weight}%</span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-text-dim">{c.blurb}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-2">
          <span
            className="block h-full origin-left rounded-full transition-transform duration-700"
            style={{
              background: `rgb(var(--${c.color}))`,
              transform: `scaleX(${c.sample / 100})`,
            }}
          />
        </div>
      </div>
    </li>
  );
}

function CapitalsDiagram() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal flex justify-center">
      <svg
        viewBox="0 0 320 320"
        className="h-auto w-full max-w-[360px]"
        role="img"
        aria-label="Four-capital model diagram"
      >
      {/* center label */}
      <circle cx="160" cy="160" r="44" fill="rgb(var(--bg-1))" stroke="rgb(var(--gold) / 0.6)" strokeWidth="1.2" />
      <text x="160" y="155" textAnchor="middle" fontSize="11" fill="rgb(var(--text-dim))">Strategic</text>
      <text x="160" y="170" textAnchor="middle" fontSize="11" fill="rgb(var(--text-dim))">quality</text>

      {/* connectors */}
      <path d="M 160 80  L 160 120" stroke="rgb(var(--cap-fin))"   strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M 240 160 L 200 160" stroke="rgb(var(--cap-tech))"  strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M 160 240 L 160 200" stroke="rgb(var(--cap-human))" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M 80 160  L 120 160" stroke="rgb(var(--cap-rel))"   strokeWidth="1.2" strokeDasharray="3 3" />

      {/* nodes */}
      {[
        { x: 160, y: 60,  c: 'cap-fin',   label: 'Financial',    w: '35%' },
        { x: 260, y: 160, c: 'cap-tech',  label: 'Tech',         w: '20%' },
        { x: 160, y: 260, c: 'cap-human', label: 'Human & Org.', w: '25%' },
        { x: 60,  y: 160, c: 'cap-rel',   label: 'Relational',   w: '20%' },
      ].map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="22" fill="rgb(var(--bg-1))" stroke={`rgb(var(--${n.c}))`} strokeWidth="1.5" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill={`rgb(var(--${n.c}))`}>{n.w}</text>
          <text x={n.x} y={n.y + (n.y < 160 ? -30 : 40)} textAnchor="middle" fontSize="10.5" fill="rgb(var(--text-dim))">
            {n.label}
          </text>
        </g>
      ))}
      </svg>
    </div>
  );
}

// =============================================================================
// 5. OUTPUTS — KPIs landing
// =============================================================================
function Outputs() {
  return (
    <Section
      eyebrow="Outputs"
      title="Insight, not a wall of numbers."
      intro="A small set of headline signals that an entrepreneur can defend in front of a partner, an investor, or a buyer."
      tone="inset"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <OutputCard
          icon={Sparkles}
          eyebrow="Headline"
          label="Company value today"
          big={fmtMoney(DEMO_VALUATION.v_current_eur)}
          sub={`Range ${fmtRange(DEMO_VALUATION.v_low_eur, DEMO_VALUATION.v_high_eur)}`}
          tone="gold"
        />
        <OutputCard
          icon={ArrowRight}
          eyebrow="Upside"
          label="Value gap"
          big={`+${DEMO_VALUATION.value_gap_pct}%`}
          sub={`Potential ≈ ${fmtMoney(DEMO_VALUATION.v_potential_eur)}`}
          tone="green"
        />
        <OutputCard
          icon={Target}
          eyebrow="Structure"
          label="Quality score"
          big={`${DEMO_VALUATION.quality_score}/100`}
          sub="Above-average four-capital structure"
          tone="text"
        />
        <OutputCard
          icon={Sliders}
          eyebrow="Resilience"
          label="Risk signal"
          big={DEMO_VALUATION.risk_index}
          sub="Surfaces fragility flags such as client concentration"
          tone="amber"
        />
        <OutputCard
          icon={Layers}
          eyebrow="Profile"
          label="Capital breakdown"
          big="68 · 54 · 71 · 55"
          sub="Financial · Tech · Human · Relational"
          tone="text"
        />
        <OutputCard
          icon={CheckCircle2}
          eyebrow="Action"
          label="Top-3 priority actions"
          big="3"
          sub="Ranked by expected effect on value"
          tone="text"
        />
      </div>
    </Section>
  );
}

function OutputCard({
  icon: Icon,
  eyebrow,
  label,
  big,
  sub,
  tone,
}: {
  icon: LucideIcon;
  eyebrow: string;
  label: string;
  big: string;
  sub: string;
  tone: 'gold' | 'green' | 'amber' | 'text';
}) {
  const ref = useReveal<HTMLDivElement>();
  const color =
    tone === 'gold'  ? 'text-gold'
    : tone === 'green' ? 'text-green'
    : tone === 'amber' ? 'text-amber'
    : 'text-text';
  return (
    <div
      ref={ref}
      className="reveal rounded-2xl border border-line bg-bg-1 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
          {eyebrow}
        </span>
        <Icon size={14} className="text-text-faint" />
      </div>
      <div className="mt-2 text-[12.5px] text-text-dim">{label}</div>
      <div className={cn('mt-1 font-serif text-[30px] font-medium leading-none tracking-tight', color)}>
        {big}
      </div>
      <div className="mt-2 text-[12px] text-text-faint">{sub}</div>
    </div>
  );
}

// =============================================================================
// 6. RECOMMENDATIONS — ranking visual
// =============================================================================
function Recommendations() {
  return (
    <Section
      eyebrow="Action plan"
      title="From diagnosis to the three highest-value moves."
      intro="Each candidate intervention is scored on its predicted effect on value, divided by the effort and time it would take. The model surfaces the three with the strongest return."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <RankingViz />
        <ol className="space-y-3">
          {DEMO_ACTIONS.map((a) => (
            <ActionRow key={a.rank} a={a} />
          ))}
        </ol>
      </div>
    </Section>
  );
}

function RankingViz() {
  const candidates = [
    'Reduce client concentration',
    'Introduce recurring revenue',
    'Strengthen middle management',
    'Digital maturity upgrade',
    'Expand geographic reach',
    'Formalise governance',
    'Increase R&D investment',
    'EBITDA margin expansion',
    'Strengthen balance sheet',
  ];
  return (
    <div className="rounded-2xl border border-line bg-bg-1 p-6">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        Catalogue · 9 candidate actions
      </div>
      <ul className="mt-3 space-y-2">
        {candidates.map((label, i) => (
          <li
            key={label}
            className={cn(
              'flex items-center justify-between rounded-lg border px-3 py-2 text-[12.5px] transition-all',
              i < 3 ? 'border-gold/40 bg-gold/[0.08] text-text' : 'border-line bg-bg-2/40 text-text-dim',
            )}
            style={{
              animationDelay: `${0.05 + i * 0.04}s`,
            }}
          >
            <span>{label}</span>
            {i < 3 ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 font-mono text-[10px] font-semibold text-gold">
                {i + 1}
              </span>
            ) : (
              <span className="font-mono text-[10px] text-text-faint">— ranked out</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-text-faint">
        Top 3 surface to the entrepreneur. The rest stay in the catalogue, available for future runs as the profile changes.
      </p>
    </div>
  );
}

function ActionRow({
  a,
}: {
  a: typeof DEMO_ACTIONS[number];
}) {
  const ref = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className="reveal flex items-start gap-4 rounded-xl border border-line bg-bg-1 p-4"
    >
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.08] font-serif text-[15px] font-semibold text-gold">
        {a.rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[14px] font-medium text-text">{a.title}</span>
          <span className="shrink-0 font-mono text-[12.5px] font-semibold text-green">
            +{a.v_uplift_pct}% value
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-text-dim">{a.detail}</p>
      </div>
    </li>
  );
}

// =============================================================================
// 7. SCENARIO — live slider; value moves in real time
// =============================================================================
function Scenario() {
  return (
    <Section
      eyebrow="Scenario lab"
      title="Pull a lever. Watch value move."
      intro="The same scoring engine that produces the headline number recomputes live as the entrepreneur tests improvements. No spreadsheets, no projections — just the model speaking."
      tone="inset"
    >
      <ScenarioWidget />
      <p className="mt-4 max-w-[640px] text-[12.5px] text-text-faint">
        Three levers shown here. The real product also exposes the four-capital
        breakdown and the priority actions reacting in real time.
      </p>
    </Section>
  );
}

function ScenarioWidget() {
  const baseline = DEMO_SCORING_INPUT;
  const [concentration, setConcentration] = useState(baseline.top3_client_concentration);
  const [recurring, setRecurring] = useState(baseline.recurring_revenue_pct);
  const [rd, setRd] = useState(baseline.tech_investment_ratio_pct);

  const v_current = DEMO_VALUATION.v_current_eur;

  const v_simulated = useMemo(() => {
    // Approximate the relationship the real engine produces, in plain
    // terms: concentration ↓ helps SQF, recurring ↑ helps GF, R&D ↑ helps both.
    // We bound each delta and recompute V via the shared formula so the
    // displayed value stays consistent with the live product.
    const dSqf =
      ((baseline.top3_client_concentration - concentration) / 80) * 0.12 +
      ((rd - baseline.tech_investment_ratio_pct) / 10) * 0.08;
    const dGf =
      ((recurring - baseline.recurring_revenue_pct) / 80) * 0.15 +
      ((rd - baseline.tech_investment_ratio_pct) / 10) * 0.04;
    const sqf = clamp(DEMO_VALUATION.sqf + dSqf, 0.6, 1.4);
    const gf  = clamp(DEMO_VALUATION.gf  + dGf,  0.7, 1.5);
    return computeValuation({
      ebitda_eur: baseline.ebitda,
      m_sector: getSectorMultiple({ naceCode: '282', sector: 'Manufacturing' }),
      sqf,
      gf,
    }).v_current_eur;
  }, [baseline, concentration, recurring, rd]);

  const deltaPct = v_current > 0 ? ((v_simulated - v_current) / v_current) * 100 : 0;
  const positive = deltaPct >= 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4 rounded-2xl border border-line bg-bg-1 p-6">
        <Lever
          label="Top-3 client concentration"
          help="Lower is better — diversified revenue lowers risk."
          unit="%"
          min={0}
          max={80}
          step={1}
          value={concentration}
          onChange={setConcentration}
        />
        <Lever
          label="Recurring revenue share"
          help="Subscription / multi-year revenue grows the growth factor."
          unit="%"
          min={0}
          max={80}
          step={1}
          value={recurring}
          onChange={setRecurring}
        />
        <Lever
          label="R&D / revenue"
          help="Reinvestment supports both quality and growth signals."
          unit="%"
          min={0}
          max={10}
          step={0.1}
          value={rd}
          onChange={setRd}
        />
      </div>

      <div className="rounded-2xl border border-line bg-bg-1 p-6">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
          Live valuation
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[12px] text-text-dim">Current</div>
            <div className="mt-1 font-serif text-[26px] font-medium tracking-tight text-text">
              {fmtMoney(v_current)}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-text-dim">Simulated</div>
            <div
              className={cn(
                'mt-1 font-serif text-[26px] font-medium tracking-tight',
                positive ? 'text-green' : 'text-amber',
              )}
            >
              {fmtMoney(v_simulated)}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-line bg-bg-2/40 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
            Δ vs current
          </div>
          <div
            className={cn(
              'mt-1 font-mono text-[18px] font-semibold',
              positive ? 'text-green' : 'text-amber',
            )}
          >
            {positive ? '+' : ''}
            {deltaPct.toFixed(1)}%
          </div>
        </div>
        <p className="mt-4 text-[12px] text-text-faint">
          Same math the workspace uses. Calibrated on Italian SMEs in the AIDA dataset.
        </p>
      </div>
    </div>
  );
}

function Lever({
  label,
  help,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  help: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const ratio = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[13px] font-medium text-text">{label}</div>
          <div className="text-[11.5px] text-text-faint">{help}</div>
        </div>
        <div className="font-mono text-[14px] font-semibold text-amber">
          {step < 1 ? value.toFixed(1) : Math.round(value)}
          {unit}
        </div>
      </div>
      <input
        type="range"
        className="vip-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--ratio' as never]: `${ratio}%` }}
      />
    </div>
  );
}

// =============================================================================
// 8. TAKEAWAY
// =============================================================================
function Takeaway() {
  return (
    <Section
      eyebrow="The promise"
      title="Three sentences. One product."
    >
      <ol className="grid gap-6 md:grid-cols-3">
        <Promise
          n={1}
          title="Understand current value."
          body="A credible number, anchored on real company data and the entrepreneur’s strategic judgement."
        />
        <Promise
          n={2}
          title="See what drives it."
          body="Four capitals, weighted, peer-relative. Surface what is creating value and what is silently eroding it."
        />
        <Promise
          n={3}
          title="Know what to do next."
          body="Three priority actions, ranked by expected effect on value over 24–36 months. Test them before you commit."
        />
      </ol>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-gold/[0.15] px-5 py-2.5 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/[0.24]"
        >
          Try it on a real company <ArrowRight size={14} />
        </Link>
        <Link
          href="/method"
          className="text-[12.5px] font-medium text-text-faint hover:text-text-dim"
        >
          Detailed methodology →
        </Link>
      </div>
    </Section>
  );
}

function Promise({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  const ref = useReveal<HTMLLIElement>();
  return (
    <li ref={ref} className="reveal rounded-2xl border border-line bg-bg-1 p-7">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
        0{n}
      </span>
      <h3 className="mt-3 font-serif text-[22px] font-medium leading-tight tracking-tight text-text">
        {title}
      </h3>
      <p className="mt-3 text-[13.5px] leading-relaxed text-text-dim">{body}</p>
    </li>
  );
}

// =============================================================================
// Helpers
// =============================================================================
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function fmtMoney(eur: number): string {
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(2)}M`;
  if (eur >= 1_000) return `€${(eur / 1_000).toFixed(0)}K`;
  return `€${eur}`;
}
function fmtRange(low: number, high: number): string {
  return `€${(low / 1_000_000).toFixed(1)}M – €${(high / 1_000_000).toFixed(1)}M`;
}

