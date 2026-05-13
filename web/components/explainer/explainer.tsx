'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DEMO_VALUATION, DEMO_ACTIONS } from '@/lib/demo-data';
import { DEMO_SCORING_INPUT } from '@/lib/scoring/company-input';
import { computeValuation } from '@/lib/scoring/valuation';
import { getSectorMultiple } from '@/lib/scoring/sector-multiples';

// =============================================================================
// One Company Through The Value Engine
// =============================================================================
//
// A single evolving experience, not a stacked landing page. A real company
// dossier moves through six pinned chambers driven by scroll progress, then
// the viewer steps into the live Scenario Lab and a closing takeaway.
//
// Real product logic referenced:
//   · web/lib/diagnostic-schema.ts        — questionnaire structure
//   · web/lib/scoring/metrics.ts          — Stage 1 (signal shaping)
//   · web/lib/scoring/benchmarks.ts       — Stage 2 (peer percentile, NACE fallback)
//   · web/lib/scoring/aggregate.ts        — Stage 3 + 4 (capital + composite weights)
//   · web/lib/scoring/valuation.ts        — Stage 5 + 6 (GF + V)
//   · web/lib/scoring/recommendations.ts  — ROV ranking
//   · web/lib/scoring/action-catalogue.ts — candidate interventions
//   · web/lib/demo-data.ts                — the live ACME demo numbers
// =============================================================================

const COMPANY = {
  name: 'EUROCOIL S.R.L.',
  province: 'Verona',
  nace: 'NACE 2825',
  size: '199 employees',
  revenue: '€55M revenue',
  ebitda: '€4.9M EBITDA',
};

const CHAMBERS = [
  { eyebrow: '01 · Open', label: 'The dossier opens' },
  { eyebrow: '02 · Intake', label: 'Two streams of evidence' },
  { eyebrow: '03 · Peers', label: 'Among similar companies' },
  { eyebrow: '04 · Capitals', label: 'Four scores, assembled' },
  { eyebrow: '05 · Value', label: 'The value picture emerges' },
  { eyebrow: '06 · Priorities', label: 'The three highest-value moves' },
] as const;

const CHAMBER_COUNT = CHAMBERS.length;

// =============================================================================
// Entry
// =============================================================================
export function Explainer() {
  return (
    <div className="overflow-x-hidden bg-bg">
      <Intro />
      <Cinema />
      <ScenarioStation />
      <Closing />
    </div>
  );
}

// =============================================================================
// INTRO — invitation to step in
// =============================================================================
function Intro() {
  return (
    <section className="mx-auto max-w-[1080px] px-6 pt-8">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
      >
        <ArrowLeft size={13} /> Back to companies
      </Link>

      <div className="mt-12 max-w-[920px]">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
          A guided tour
        </div>
        <h1 className="mt-4 font-serif text-[44px] font-medium leading-[1.02] tracking-tight text-text md:text-[68px]">
          One company.{' '}
          <span className="text-gradient-gold">Through the value engine.</span>
        </h1>
        <p className="mt-5 max-w-[640px] text-[15.5px] leading-relaxed text-text-dim md:text-[17px]">
          Follow a real Italian SME as it passes through the chambers of the
          model — public data, strategic answers, peer comparison, the four
          capitals, value synthesis, and the three best next moves.
        </p>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-1 px-3 py-1.5 text-[11.5px] font-medium text-text-dim">
          <ArrowDown size={12} />
          Scroll to begin
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// CINEMA — pinned canvas, six chambers, one moving dossier
// =============================================================================
function Cinema() {
  const shellRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const progress = useScrollProgress(shellRef, reduced);

  // progress (0–1) over the whole shell maps to a chamber index in [0, N-1].
  const active = progress * (CHAMBER_COUNT - 1);

  // Reduced-motion: stack chambers as plain blocks, no pinned canvas.
  if (reduced) {
    return (
      <div className="mx-auto mt-16 max-w-[1080px] space-y-16 px-6 pb-24">
        {CHAMBERS.map((c, i) => (
          <article key={c.eyebrow} className="rounded-2xl border border-line bg-bg-1 p-6">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
              {c.eyebrow}
            </div>
            <h2 className="mt-2 font-serif text-[24px] font-medium tracking-tight text-text">
              {c.label}
            </h2>
            <div className="mt-4">
              <ChamberContent index={i} active={i} />
            </div>
          </article>
        ))}
      </div>
    );
  }

  // Each chamber holds the viewport for ~120vh of scroll. Six chambers
  // → 720vh shell. Adjustable via the multiplier below.
  const SHELL_VH = CHAMBER_COUNT * 120;

  return (
    <div
      ref={shellRef}
      className="relative mt-12"
      style={{ height: `${SHELL_VH}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <Atmosphere progress={progress} />
        <ProgressRail active={active} />
        <Dossier active={active} />
        <ChamberLabel active={active} />

        <div className="absolute inset-0">
          {CHAMBERS.map((_, i) => (
            <ChamberLayer key={i} index={i} active={active}>
              <ChamberContent index={i} active={active} />
            </ChamberLayer>
          ))}
        </div>

        <ScrollHint progress={progress} />
      </div>
    </div>
  );
}

// =============================================================================
// Cinema furniture
// =============================================================================
function Atmosphere({ progress }: { progress: number }) {
  // Subtle background that drifts with the journey. Warm at the start,
  // cool through the peer-comparison middle, gold again at the end.
  const hueA = 176;       // gold
  const hueB = 21;        // teal
  const blend = Math.sin(progress * Math.PI); // 0 → 1 → 0
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse 60% 70% at ${20 + progress * 60}% 30%, rgba(${hueA}, 122, 26, ${0.08 - blend * 0.04}), transparent 65%),
          radial-gradient(ellipse 60% 70% at ${80 - progress * 50}% 60%, rgba(${hueB}, 127, 137, ${0.05 + blend * 0.04}), transparent 65%)
        `,
      }}
    />
  );
}

function ProgressRail({ active }: { active: number }) {
  const ratio = active / (CHAMBER_COUNT - 1);
  return (
    <ol
      aria-hidden
      className="absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {CHAMBERS.map((c, i) => {
        const reached = active >= i - 0.4;
        return (
          <li key={c.eyebrow} className="flex items-center gap-3">
            <span
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                reached ? 'bg-gold' : 'bg-line-2',
              )}
            />
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-eyebrow transition-colors',
                reached ? 'text-text' : 'text-text-faint',
              )}
            >
              {c.eyebrow}
            </span>
          </li>
        );
      })}
      <li className="mt-1 ml-1 h-24 w-px overflow-hidden bg-line-2">
        <span
          className="block w-full bg-gold transition-[height] duration-500"
          style={{ height: `${ratio * 100}%` }}
        />
      </li>
    </ol>
  );
}

/**
 * The "living dossier" — pinned top-right. Its content morphs as the
 * journey advances: from raw identity, to evidence, to scored profile.
 */
function Dossier({ active }: { active: number }) {
  const stage = Math.min(CHAMBER_COUNT - 1, Math.max(0, Math.floor(active + 0.4)));
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-10 w-[260px] md:right-12 md:top-12 md:w-[300px]">
      <div className="rounded-2xl border border-line bg-bg-1/95 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-glass">
        <div className="font-mono text-[9.5px] font-semibold uppercase tracking-eyebrow text-text-faint">
          Dossier · live
        </div>
        <div className="mt-1.5 font-serif text-[15px] font-medium leading-tight text-text">
          {COMPANY.name}
        </div>
        <div className="mt-0.5 font-mono text-[10.5px] text-text-faint">
          {COMPANY.province} · {COMPANY.nace}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <DossierMini label="Rev" value="€55M" />
          <DossierMini label="EBITDA" value="€4.9M" />
          <DossierMini label="Emp" value="199" />
        </div>
        {stage >= 2 && (
          <div className="mt-3 rounded-md border border-cyan/30 bg-cyan/[0.06] px-2 py-1.5 text-[10.5px] text-cyan">
            Peer group · NACE 2825
          </div>
        )}
        {stage >= 3 && (
          <div className="mt-2 grid grid-cols-4 gap-1 text-center">
            {[
              { l: 'Fin',   v: 76, c: 'cap-fin'   },
              { l: 'Tech',  v: 43, c: 'cap-tech'  },
              { l: 'Human', v: 65, c: 'cap-human' },
              { l: 'Rel',   v: 68, c: 'cap-rel'   },
            ].map((p) => (
              <div key={p.l} className="rounded-sm border border-line px-1 py-1">
                <div className="font-mono text-[8px] uppercase tracking-eyebrow text-text-faint">
                  {p.l}
                </div>
                <div
                  className="mt-0.5 font-mono text-[11px] font-semibold"
                  style={{ color: `rgb(var(--${p.c}))` }}
                >
                  {p.v}
                </div>
              </div>
            ))}
          </div>
        )}
        {stage >= 4 && (
          <div className="mt-3 rounded-md border border-gold/30 bg-gold/[0.06] px-2 py-1.5">
            <div className="font-mono text-[9px] uppercase tracking-eyebrow text-gold">
              Estimated value
            </div>
            <div className="mt-0.5 font-serif text-[18px] font-medium leading-none text-text">
              €4.2M
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-text-faint">
              Range €3.8–€4.7M · Quality 67
            </div>
          </div>
        )}
        {stage >= 5 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {['Client concentration', 'Recurring revenue', 'Middle mgmt'].map((t, i) => (
              <span
                key={t}
                className="rounded-full border border-line bg-bg-2/70 px-2 py-0.5 font-mono text-[9.5px] text-text-dim"
              >
                {i + 1}. {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DossierMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-2/40 px-1.5 py-1.5">
      <div className="font-mono text-[8.5px] uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11.5px] font-semibold text-text">
        {value}
      </div>
    </div>
  );
}

function ChamberLabel({ active }: { active: number }) {
  const idx = Math.max(0, Math.min(CHAMBER_COUNT - 1, Math.round(active)));
  const c = CHAMBERS[idx]!;
  return (
    <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2 text-center md:left-auto md:right-12 md:top-1/2 md:hidden md:-translate-x-0 md:-translate-y-1/2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
        {c.eyebrow}
      </div>
      <div className="mt-1 font-serif text-[15px] font-medium text-text">
        {c.label}
      </div>
    </div>
  );
}

function ScrollHint({ progress }: { progress: number }) {
  if (progress >= 0.04) return null;
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
      <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
        Scroll
      </div>
      <div className="mt-1 inline-flex items-center justify-center text-text-faint">
        <ArrowDown size={14} className="animate-bounce" />
      </div>
    </div>
  );
}

/**
 * One chamber occupies the full stage but is only visible when the
 * scroll-derived `active` index is close to its own. We slow drift the
 * layer vertically and fade its opacity so transitions feel like
 * passing through gates.
 */
function ChamberLayer({
  index,
  active,
  children,
}: {
  index: number;
  active: number;
  children: React.ReactNode;
}) {
  const distance = active - index;
  const abs = Math.abs(distance);
  if (abs > 1.2) return null; // perf
  const opacity = Math.max(0, 1 - abs * 1.15);
  const translateY = distance * -32;
  const scale = 1 - Math.min(0.05, abs * 0.05);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transition: 'opacity 120ms linear, transform 120ms linear',
        willChange: 'opacity, transform',
        pointerEvents: opacity > 0.6 ? 'auto' : 'none',
      }}
    >
      <div className="mx-auto w-full max-w-[1080px]">{children}</div>
    </div>
  );
}

// =============================================================================
// CHAMBER CONTENT — each index renders its own visual + caption
// =============================================================================
function ChamberContent({ index, active }: { index: number; active: number }) {
  switch (index) {
    case 0: return <ChamberOpen active={active} />;
    case 1: return <ChamberIntake active={active} />;
    case 2: return <ChamberPeers active={active} />;
    case 3: return <ChamberCapitals active={active} />;
    case 4: return <ChamberValue active={active} />;
    case 5: return <ChamberPriorities active={active} />;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// 01 · OPEN — dossier appears
// ---------------------------------------------------------------------------
function ChamberOpen({ active }: { active: number }) {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(active - 0)));
  return (
    <ChamberLayout
      eyebrow="01 · Open"
      title="The case file lands on the desk."
      lede="A real Italian SME enters the engine. Identity, sector, size, and the headline financials are already on the page. The work starts here."
    >
      <div
        className="mx-auto max-w-[440px] rounded-2xl border border-line bg-bg-1 p-7 shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
        style={{ transform: `translateY(${(1 - t) * 18}px)` }}
      >
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-gold">
          Active dossier
        </div>
        <h3 className="mt-2 font-serif text-[26px] font-medium leading-tight text-text">
          {COMPANY.name}
        </h3>
        <div className="mt-1 text-[12.5px] text-text-dim">
          {COMPANY.province} · {COMPANY.nace} · machinery for textile manufacturing
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <KvCell label="Revenue" value={COMPANY.revenue.replace('€', '€')} />
          <KvCell label="EBITDA" value={COMPANY.ebitda} />
          <KvCell label="Headcount" value={COMPANY.size} />
        </div>
        <div className="mt-4 text-[12px] text-text-faint">
          The engine never starts from a blank calculator. It starts from a
          real company.
        </div>
      </div>
    </ChamberLayout>
  );
}

// ---------------------------------------------------------------------------
// 02 · INTAKE — two streams flow into the dossier
// ---------------------------------------------------------------------------
const STREAM_KNOWN = [
  'Revenue (3-year series)',
  'EBITDA · 8.9% margin',
  'Balance sheet · NFP',
  'R&D · intangibles · IP',
  '199 employees · €450k/head',
  'NACE 2825 peer group',
];
const STREAM_REVEALED = [
  'Digital maturity · 2/5',
  'Founder dependency · 2/5',
  'Client portfolio · 3/5',
  'Process formalisation · 3/5',
  'Strategic partnerships · 3/5',
  'Scalability · 4/5',
];

function ChamberIntake({ active }: { active: number }) {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(active - 1)));
  return (
    <ChamberLayout
      eyebrow="02 · Intake"
      title="Two streams. Both small. Both essential."
      lede="The company already speaks for itself through public data. The entrepreneur fills in what data cannot: 19 honest, low-friction answers."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr]">
        <Stream
          tone="cyan"
          eyebrow="Already known"
          title="Public company facts"
          items={STREAM_KNOWN}
          t={t}
          direction="left"
        />
        <FlowJunction t={t} />
        <Stream
          tone="gold"
          eyebrow="Revealed now"
          title="Entrepreneur's answers"
          items={STREAM_REVEALED}
          t={t}
          direction="right"
        />
      </div>
    </ChamberLayout>
  );
}

function Stream({
  tone,
  eyebrow,
  title,
  items,
  t,
  direction,
}: {
  tone: 'cyan' | 'gold';
  eyebrow: string;
  title: string;
  items: string[];
  t: number;
  direction: 'left' | 'right';
}) {
  return (
    <div>
      <div className={cn('font-mono text-[10px] font-semibold uppercase tracking-eyebrow', tone === 'cyan' ? 'text-cyan' : 'text-gold')}>
        {eyebrow}
      </div>
      <div className="mt-1 font-serif text-[18px] font-medium tracking-tight text-text">
        {title}
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((it, i) => {
          const start = i * 0.08;
          const local = Math.max(0, Math.min(1, (t - start) / 0.5));
          const translateX = (1 - local) * (direction === 'left' ? -24 : 24);
          return (
            <li
              key={it}
              className={cn(
                'rounded-md border bg-bg-1 px-3 py-2 text-[12.5px] text-text',
                tone === 'cyan' ? 'border-cyan/35' : 'border-gold/35',
              )}
              style={{
                opacity: local,
                transform: `translateX(${translateX}px)`,
                transition: 'opacity 180ms ease-out, transform 180ms ease-out',
              }}
            >
              {it}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FlowJunction({ t }: { t: number }) {
  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <span
        className="inline-block h-3 w-3 rounded-full bg-gold"
        style={{ boxShadow: '0 0 0 6px rgba(176, 122, 26, 0.10)' }}
      />
      <span
        className="my-2 block w-px bg-line"
        style={{ height: `${40 + t * 40}px` }}
      />
      <span className="font-mono text-[9.5px] uppercase tracking-eyebrow text-text-faint">
        Dossier
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 03 · PEERS — constellation + percentile rings
// ---------------------------------------------------------------------------
function ChamberPeers({ active }: { active: number }) {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(active - 2)));
  return (
    <ChamberLayout
      eyebrow="03 · Peers"
      title="Not scored in isolation. Placed among similar companies."
      lede="VIP first looks at the closest peer group — companies of similar sector and size. If that pool is too thin, the lens widens to a broader sector cohort. Position, not absolute level, is what counts."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <PeerCanvas t={t} />
        <ol className="space-y-3">
          <PeerStep
            n={1}
            title="Closest peers first"
            body="Same NACE code, similar revenue band. Roughly 14 999 Italian SMEs across the calibration set."
          />
          <PeerStep
            n={2}
            title="Widen the lens if thin"
            body="If the close peer pool has fewer than 20 comparable companies, the engine falls back to the broader sector prefix so positions stay meaningful."
          />
          <PeerStep
            n={3}
            title="Position, not absolute"
            body="An 8.9% EBITDA margin doesn't mean much alone. Inside a peer cohort it becomes a percentile — and a percentile carries judgement."
          />
        </ol>
      </div>
    </ChamberLayout>
  );
}

function PeerCanvas({ t }: { t: number }) {
  // Deterministic scatter so SSR matches CSR.
  const peers = useMemo(() => {
    const out: Array<{ x: number; y: number; r: number; inCohort: boolean }> = [];
    let seed = 17;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 110; i += 1) {
      const angle = rand() * Math.PI * 2;
      const radius = 30 + rand() * 130;
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;
      out.push({
        x,
        y,
        r: 1.8 + rand() * 1.2,
        inCohort: radius < 90, // tight peer pool
      });
    }
    return out;
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg viewBox="0 0 400 400" className="h-full w-full">
        {/* concentric percentile rings */}
        {[60, 110, 160, 200].map((r, i) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="rgb(var(--line) / 0.9)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? '0' : '3 4'}
          />
        ))}
        {/* peer dots */}
        {peers.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.inCohort ? `rgb(var(--cyan) / ${0.35 + t * 0.5})` : `rgb(var(--text-faint) / ${0.18 + t * 0.12})`}
          />
        ))}
        {/* the company */}
        <circle
          cx="200"
          cy="200"
          r={6 + t * 3}
          fill="rgb(var(--gold))"
          style={{ filter: 'drop-shadow(0 0 6px rgba(176, 122, 26, 0.5))' }}
        />
        <text
          x="200"
          y="225"
          textAnchor="middle"
          fontSize="11"
          fill="rgb(var(--text))"
          fontFamily="JetBrains Mono, monospace"
        >
          this company
        </text>
        {/* percentile labels */}
        <text x="270" y="200" fontSize="9.5" fill="rgb(var(--text-faint))">p25</text>
        <text x="320" y="200" fontSize="9.5" fill="rgb(var(--text-faint))">p50</text>
        <text x="365" y="200" fontSize="9.5" fill="rgb(var(--text-faint))">p75</text>
      </svg>
    </div>
  );
}

function PeerStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-bg-1 p-4">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan/40 bg-cyan/[0.08] font-mono text-[11px] font-semibold text-cyan">
        {n}
      </span>
      <div>
        <div className="text-[14px] font-medium text-text">{title}</div>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-text-dim">{body}</p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// 04 · CAPITALS — four assemblies, real weights from aggregate.ts
// ---------------------------------------------------------------------------
const CAPITAL_ASSEMBLIES: Array<{
  name: string;
  pillarWeight: number;
  varName: string;
  signals: Array<{ label: string; weight: number }>;
  score: number;
  blurb: string;
}> = [
  {
    name: 'Financial',
    pillarWeight: 35,
    varName: 'cap-fin',
    signals: [
      { label: 'EBITDA margin',     weight: 30 },
      { label: 'Revenue CAGR',      weight: 25 },
      { label: 'Recurring revenue', weight: 20 },
      { label: 'Client concentration resilience', weight: 25 },
    ],
    score: 68,
    blurb: 'Profit quality, growth, and how exposed revenue is to a few clients.',
  },
  {
    name: 'Technological',
    pillarWeight: 20,
    varName: 'cap-tech',
    signals: [
      { label: 'Digital maturity',  weight: 55 },
      { label: 'Tech investment',   weight: 45 },
    ],
    score: 54,
    blurb: 'How much of the business runs on real systems, and how much it reinvests.',
  },
  {
    name: 'Human & Organisational',
    pillarWeight: 25,
    varName: 'cap-human',
    signals: [
      { label: 'Founder independence', weight: 40 },
      { label: 'Management depth',     weight: 35 },
      { label: 'Scalability',          weight: 25 },
    ],
    score: 71,
    blurb: 'Can the company keep running — and grow — without the founder in the loop?',
  },
  {
    name: 'Relational',
    pillarWeight: 20,
    varName: 'cap-rel',
    signals: [
      { label: 'Client portfolio quality', weight: 40 },
      { label: 'Network position',         weight: 30 },
      { label: 'Recurring revenue',        weight: 30 },
    ],
    score: 55,
    blurb: 'Reputation, ecosystem position, and the durability of who buys.',
  },
];

function ChamberCapitals({ active }: { active: number }) {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(active - 3)));
  return (
    <ChamberLayout
      eyebrow="04 · Capitals"
      title="Four scores. Each one assembled from specific signals."
      lede="A capital score is not guessed. It is built from a small set of measurable characteristics, weighted by how much they matter to that pillar. Then the four pillars combine into one composite quality picture."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {CAPITAL_ASSEMBLIES.map((c, i) => (
          <CapitalAssembly key={c.name} c={c} delay={i * 0.06} t={t} />
        ))}
      </div>
      <div
        className="mt-5 rounded-xl border border-line bg-bg-1 px-5 py-4 text-[12.5px] text-text-dim"
        style={{ opacity: Math.max(0, t - 0.4) / 0.6 }}
      >
        <span className="font-medium text-text">Then combined:</span>{' '}
        Composite quality = 0.35 · Financial &nbsp;+&nbsp; 0.20 · Technological
        &nbsp;+&nbsp; 0.25 · Human &amp; Org &nbsp;+&nbsp; 0.20 · Relational.
        That score nudges the headline value up or down — never fabricates it.
      </div>
    </ChamberLayout>
  );
}

function CapitalAssembly({
  c,
  delay,
  t,
}: {
  c: typeof CAPITAL_ASSEMBLIES[number];
  delay: number;
  t: number;
}) {
  const local = Math.max(0, Math.min(1, (t - delay) / 0.6));
  return (
    <div
      className="rounded-2xl border border-line bg-bg-1 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      style={{
        opacity: local,
        transform: `translateY(${(1 - local) * 14}px)`,
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: `rgb(var(--${c.varName}))` }}
          />
          <span className="font-serif text-[16px] font-medium tracking-tight text-text">
            {c.name}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-faint">
          pillar weight {c.pillarWeight}%
        </span>
      </div>
      <p className="mt-1 text-[12px] text-text-dim">{c.blurb}</p>
      <ul className="mt-3 space-y-1.5">
        {c.signals.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-[12.5px]">
            <span className="flex-1 text-text-dim">{s.label}</span>
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-2">
              <span
                className="block h-full origin-left rounded-full transition-transform duration-500"
                style={{
                  background: `rgb(var(--${c.varName}))`,
                  transform: `scaleX(${(s.weight / 60) * local})`,
                }}
              />
            </span>
            <span className="w-8 text-right font-mono text-[10.5px] text-text-faint">
              {s.weight}%
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-line-faint pt-3">
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
          Assembled score
        </span>
        <span
          className="font-serif text-[22px] font-medium leading-none tracking-tight"
          style={{ color: `rgb(var(--${c.varName}))` }}
        >
          {Math.round(c.score * local)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 05 · VALUE — capitals flow into one value picture
// ---------------------------------------------------------------------------
function ChamberValue({ active }: { active: number }) {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(active - 4)));
  return (
    <ChamberLayout
      eyebrow="05 · Value"
      title="The four capitals fuse into one value picture."
      lede="Earnings, the sector's market context, the strategic quality signal, and the growth trajectory combine into a single defensible number — with a range, an upside, and a risk read."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <ValuePrism t={t} />
        <div className="grid grid-cols-2 gap-3">
          <ValueTile
            t={t}
            delay={0.05}
            eyebrow="Headline"
            label="Value today"
            value={fmtMoney(DEMO_VALUATION.v_current_eur)}
            sub={`Range ${fmtRange(DEMO_VALUATION.v_low_eur, DEMO_VALUATION.v_high_eur)}`}
            tone="text"
            big
          />
          <ValueTile
            t={t}
            delay={0.15}
            eyebrow="Upside"
            label="Value gap"
            value={`+${DEMO_VALUATION.value_gap_pct}%`}
            sub={`Potential ≈ ${fmtMoney(DEMO_VALUATION.v_potential_eur)}`}
            tone="green"
          />
          <ValueTile
            t={t}
            delay={0.25}
            eyebrow="Structure"
            label="Quality"
            value={`${DEMO_VALUATION.quality_score}/100`}
            sub="Above-average four-capital structure"
            tone="text"
          />
          <ValueTile
            t={t}
            delay={0.35}
            eyebrow="Resilience"
            label="Risk"
            value={DEMO_VALUATION.risk_index}
            sub="Surfaces specific fragility flags"
            tone="amber"
          />
        </div>
      </div>
    </ChamberLayout>
  );
}

function ValuePrism({ t }: { t: number }) {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[440px]">
      <svg viewBox="0 0 500 400" className="h-full w-full">
        <defs>
          <linearGradient id="prism-light" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--text-faint))" stopOpacity="0.0" />
            <stop offset="50%" stopColor="rgb(var(--text-dim))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--text-dim))" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="prism-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--gold))" stopOpacity="0" />
            <stop offset="60%" stopColor="rgb(var(--gold))" stopOpacity={0.6 * t} />
          </linearGradient>
        </defs>

        {/* incoming capital streams */}
        {[
          { y: 80,  c: 'cap-fin'   },
          { y: 160, c: 'cap-tech'  },
          { y: 240, c: 'cap-human' },
          { y: 320, c: 'cap-rel'   },
        ].map((s, i) => (
          <g key={s.c}>
            <line
              x1={0}
              y1={s.y}
              x2={200}
              y2={200}
              stroke={`rgb(var(--${s.c}) / 0.55)`}
              strokeWidth={1.4}
              strokeDasharray="160"
              strokeDashoffset={(1 - t) * 160}
              style={{
                transition: 'stroke-dashoffset 600ms ease-out',
                transitionDelay: `${i * 80}ms`,
              }}
            />
            <text x="6" y={s.y - 6} fontSize="10" fill={`rgb(var(--${s.c}))`}>
              {CAPITAL_ASSEMBLIES[i]?.name}
            </text>
          </g>
        ))}

        {/* prism */}
        <polygon
          points="190,140 260,200 190,260"
          fill="rgb(var(--bg-1))"
          stroke="rgb(var(--gold))"
          strokeWidth={1.5}
        />

        {/* spread of light → tiles */}
        <path d="M 260 200 L 480 80"  stroke="url(#prism-gold)" strokeWidth={1.2} />
        <path d="M 260 200 L 480 140" stroke="url(#prism-gold)" strokeWidth={1.2} />
        <path d="M 260 200 L 480 200" stroke="url(#prism-gold)" strokeWidth={1.2} />
        <path d="M 260 200 L 480 260" stroke="url(#prism-gold)" strokeWidth={1.2} />
        <path d="M 260 200 L 480 320" stroke="url(#prism-gold)" strokeWidth={1.2} />

        {/* prism formula */}
        <text x="225" y="195" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--text-dim))">
          synthesis
        </text>
      </svg>
    </div>
  );
}

function ValueTile({
  t,
  delay,
  eyebrow,
  label,
  value,
  sub,
  tone,
  big,
}: {
  t: number;
  delay: number;
  eyebrow: string;
  label: string;
  value: string;
  sub: string;
  tone: 'text' | 'green' | 'amber';
  big?: boolean;
}) {
  const local = Math.max(0, Math.min(1, (t - delay) / 0.5));
  const color = tone === 'green' ? 'text-green' : tone === 'amber' ? 'text-amber' : 'text-text';
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-bg-1 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        big && 'col-span-2',
      )}
      style={{
        opacity: local,
        transform: `translateY(${(1 - local) * 12}px)`,
        transition: 'opacity 220ms ease-out, transform 220ms ease-out',
      }}
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        {eyebrow}
      </div>
      <div className="mt-1 text-[12px] text-text-dim">{label}</div>
      <div className={cn('mt-1 font-serif font-medium leading-none tracking-tight', color, big ? 'text-[34px]' : 'text-[22px]')}>
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] text-text-faint">{sub}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 06 · PRIORITIES — sorter elevates the Top-3
// ---------------------------------------------------------------------------
const CANDIDATES = [
  { id: 'concentration', title: 'Reduce client concentration', uplift: 12, top: true,  rank: 1 },
  { id: 'recurring',     title: 'Introduce recurring revenue', uplift:  9, top: true,  rank: 2 },
  { id: 'mgmt',          title: 'Strengthen middle management', uplift:  7, top: true,  rank: 3 },
  { id: 'digital',       title: 'Digital maturity upgrade',     uplift: 11, top: false },
  { id: 'rd',            title: 'Increase R&D investment',      uplift:  8, top: false },
  { id: 'geo',           title: 'Expand geographic reach',      uplift:  5, top: false },
  { id: 'governance',    title: 'Formalise governance',         uplift:  4, top: false },
  { id: 'margin',        title: 'EBITDA margin expansion',      uplift:  6, top: false },
  { id: 'debt',          title: 'Strengthen balance sheet',     uplift:  3, top: false },
];

function ChamberPriorities({ active }: { active: number }) {
  const t = Math.max(0, Math.min(1, 1 - Math.abs(active - 5)));
  return (
    <ChamberLayout
      eyebrow="06 · Priorities"
      title="From many possibilities, three earned moves."
      lede="The engine carries a curated catalogue of structured interventions. Each is scored on its expected effect on value, divided by the effort and time it would take. The three with the strongest return rise to the top."
    >
      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
        <Sorter t={t} />
        <Podium t={t} />
      </div>
    </ChamberLayout>
  );
}

function Sorter({ t }: { t: number }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-1 p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
          Catalogue · 9 candidates
        </div>
        <span className="font-mono text-[10px] text-text-faint">Ranked by ROV</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {CANDIDATES.map((c, i) => {
          const local = Math.max(0, Math.min(1, (t - i * 0.04) / 0.4));
          const yOffset = c.top
            ? (1 - local) * 18 + (c.rank ? -((c.rank - 1) * 2) : 0)
            : (1 - local) * 18 + 4;
          return (
            <li
              key={c.id}
              className={cn(
                'flex items-center justify-between rounded-md border px-3 py-2 text-[12.5px] transition-all',
                c.top
                  ? 'border-gold/40 bg-gold/[0.06] text-text'
                  : 'border-line bg-bg-2/40 text-text-dim',
              )}
              style={{
                opacity: c.top ? local : 0.35 + local * 0.25,
                transform: `translateY(${yOffset}px)`,
                transition: 'opacity 260ms ease-out, transform 260ms ease-out',
              }}
            >
              <span className="truncate">{c.title}</span>
              <span className="ml-3 flex items-center gap-2">
                <span
                  className={cn(
                    'font-mono text-[10.5px]',
                    c.top ? 'font-semibold text-green' : 'text-text-faint',
                  )}
                >
                  +{c.uplift}% V
                </span>
                {c.top && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 font-mono text-[10px] font-semibold text-gold">
                    {c.rank}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Podium({ t }: { t: number }) {
  const local = Math.max(0, Math.min(1, (t - 0.35) / 0.6));
  return (
    <div className="grid grid-cols-3 items-end gap-3 px-2 py-6">
      {DEMO_ACTIONS.map((a, i) => {
        const order = a.rank === 1 ? 2 : a.rank === 2 ? 1 : 3; // 2nd, 1st, 3rd visual order
        const heights = [120, 160, 96]; // 2nd, 1st, 3rd
        const h = heights[order - 1]!;
        const delay = (3 - a.rank) * 0.1;
        const localLocal = Math.max(0, Math.min(1, (local - delay) / 0.6));
        return (
          <div
            key={a.rank}
            className="flex flex-col items-center"
            style={{ order }}
          >
            <div
              className="w-full rounded-t-md border border-gold/35 bg-gold/[0.10] text-center"
              style={{
                height: `${h * localLocal}px`,
                opacity: localLocal,
                transition: 'height 360ms ease-out, opacity 360ms ease-out',
              }}
            >
              <div className="px-2 pt-2 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-gold">
                Rank {a.rank}
              </div>
              <div className="mt-1 px-2 text-[11.5px] font-medium text-text">
                {a.title}
              </div>
              <div className="mt-2 font-mono text-[11px] font-semibold text-green">
                +{a.v_uplift_pct}% V
              </div>
            </div>
            <div className="mt-2 h-1 w-full rounded-full bg-line" />
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// SCENARIO STATION — interactive, real math
// =============================================================================
function ScenarioStation() {
  const baseline = DEMO_SCORING_INPUT;
  const [concentration, setConcentration] = useState(baseline.top3_client_concentration);
  const [recurring, setRecurring] = useState(baseline.recurring_revenue_pct);
  const [rd, setRd] = useState(baseline.tech_investment_ratio_pct);

  const v_current = DEMO_VALUATION.v_current_eur;
  const v_simulated = useMemo(() => {
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
    <section className="relative bg-bg-2/40 py-24">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="max-w-[640px]">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
            07 · Scenario
          </div>
          <h2 className="mt-2 font-serif text-[36px] font-medium leading-[1.05] tracking-tight text-text md:text-[44px]">
            Pull a lever. Watch the value move.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-text-dim md:text-[16px]">
            The same engine that produced the headline runs live as the
            entrepreneur tests improvements. No spreadsheets, no projections —
            just the model speaking back.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 rounded-2xl border border-line bg-bg-1 p-6">
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
              help="Subscriptions / multi-year contracts grow the growth factor."
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
                <div className="mt-1 font-serif text-[28px] font-medium tracking-tight text-text">
                  {fmtMoney(v_current)}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-text-dim">Simulated</div>
                <div
                  className={cn(
                    'mt-1 font-serif text-[28px] font-medium tracking-tight',
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
              Same math the company workspace uses. Calibrated on Italian SMEs in the AIDA dataset.
            </p>
          </div>
        </div>
      </div>
    </section>
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
// CLOSING — three promises + outbound
// =============================================================================
function Closing() {
  return (
    <section className="mx-auto max-w-[1080px] px-6 py-24">
      <div className="max-w-[720px]">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
          08 · The promise
        </div>
        <h2 className="mt-2 font-serif text-[36px] font-medium leading-[1.05] tracking-tight text-text md:text-[48px]">
          Three sentences. One product.
        </h2>
      </div>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { n: 1, t: 'Understand current value.', b: 'A credible number, anchored on real company data and the entrepreneur’s strategic judgement.' },
          { n: 2, t: 'See what drives it.',       b: 'Four capitals, weighted, peer-relative. Spot what is creating value and what is silently eroding it.' },
          { n: 3, t: 'Know what to do next.',     b: 'Three priority actions, ranked by expected effect on value. Test them before you commit.' },
        ].map((p) => (
          <li key={p.n} className="rounded-2xl border border-line bg-bg-1 p-7">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
              0{p.n}
            </span>
            <h3 className="mt-3 font-serif text-[22px] font-medium leading-tight tracking-tight text-text">
              {p.t}
            </h3>
            <p className="mt-3 text-[13.5px] leading-relaxed text-text-dim">{p.b}</p>
          </li>
        ))}
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
    </section>
  );
}

// =============================================================================
// Shared chamber layout — used by every chamber so motion happens around a
// consistent typographic frame.
// =============================================================================
function ChamberLayout({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[420px_1fr]">
      <header>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
          {eyebrow}
        </div>
        <h2 className="mt-2 font-serif text-[28px] font-medium leading-[1.05] tracking-tight text-text md:text-[36px]">
          {title}
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-text-dim md:text-[14.5px]">
          {lede}
        </p>
      </header>
      <div>{children}</div>
    </div>
  );
}

function KvCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-2/40 px-2.5 py-2">
      <div className="font-mono text-[9.5px] uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[12.5px] font-semibold text-text">
        {value}
      </div>
    </div>
  );
}

// =============================================================================
// Hooks + formatters
// =============================================================================
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useScrollProgress(ref: RefObject<HTMLElement>, reduced: boolean): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let frame: number | null = null;
    function update() {
      frame = null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      if (total <= 0) {
        setP(0);
        return;
      }
      const scrolled = -rect.top;
      setP(clamp(scrolled / total, 0, 1));
    }
    function onScroll() {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [ref, reduced]);
  return p;
}

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
