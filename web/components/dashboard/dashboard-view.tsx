'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Sparkles, AlertTriangle, TrendingUp, Sliders, PenLine, CheckCircle2 } from 'lucide-react';
import { animateCount, REVEAL_EASE } from '@/lib/animation';
import { cn } from '@/lib/cn';
import { fromDemo, type DashboardData } from '@/lib/dashboard-data';

// Register at module scope so it's available before useLayoutEffect.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// =============================================================================
// RADAR target positions (top, right, bottom, left)
// =============================================================================
const RADAR_TARGETS = [
  { id: 'r-fin',   cx: 160, cy: 92  }, // Financial · top
  { id: 'r-tech',  cx: 214, cy: 160 }, // Tech · right
  { id: 'r-human', cx: 160, cy: 231 }, // Human & Org · bottom
  { id: 'r-rel',   cx: 105, cy: 160 }, // Relational · left
];

// =============================================================================
// CONTEXT — sub-components reach into props without prop-drilling
// =============================================================================
const DashboardContext = createContext<DashboardData | null>(null);

function useDashboard(): DashboardData {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardView>');
  return ctx;
}

// =============================================================================
// DASHBOARD
// =============================================================================
export interface DashboardViewProps {
  /** When omitted, falls back to the seeded ACME demo numbers. */
  data?: DashboardData;
}

export function DashboardView({ data }: DashboardViewProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const value = data ?? fromDemo();

  // Staggered entrance + count-ups + radar morph on mount
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.d-section', {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.7,
        ease: REVEAL_EASE,
      });

      rootRef.current
        ?.querySelectorAll<HTMLElement>('[data-count-target]')
        .forEach((el) => {
          const target = Number(el.dataset.countTarget);
          const decimals = Number(el.dataset.decimals ?? 0);
          const prefix = el.dataset.countPrefix ?? '';
          const suffix = el.dataset.countSuffix ?? '';
          animateCount(el, target, { decimals, prefix, suffix });
        });

      // Radar polygon morph — vertices reflect each capital's score (0–100)
      const poly = rootRef.current?.querySelector<SVGPolygonElement>('#radar-poly');
      const center = 160;
      const maxR = 100;          // matches outer grid radius
      const scores = value.valuation.capitals;
      const finScore   = (scores[0]?.score ?? 0) / 100;
      const techScore  = (scores[1]?.score ?? 0) / 100;
      const humanScore = (scores[2]?.score ?? 0) / 100;
      const relScore   = (scores[3]?.score ?? 0) / 100;
      const targets = [
        { id: 'r-fin',   cx: center,                    cy: center - maxR * finScore },
        { id: 'r-tech',  cx: center + maxR * techScore, cy: center                   },
        { id: 'r-human', cx: center,                    cy: center + maxR * humanScore },
        { id: 'r-rel',   cx: center - maxR * relScore,  cy: center                   },
      ];

      if (poly) {
        const obj = { p: 0 };
        gsap.to(obj, {
          p: 1,
          duration: 1.3,
          delay: 0.4,
          ease: REVEAL_EASE,
          onUpdate: () => {
            const t = obj.p;
            const pts = targets
              .map((r) => {
                const x = center + (r.cx - center) * t;
                const y = center + (r.cy - center) * t;
                return `${x},${y}`;
              })
              .join(' ');
            poly.setAttribute('points', pts);
          },
        });
      }
      targets.forEach((t) => {
        const el = rootRef.current?.querySelector(`#${t.id}`);
        if (el) gsap.to(el, { attr: { cx: t.cx, cy: t.cy }, duration: 1.3, delay: 0.4, ease: REVEAL_EASE });
      });

      gsap.utils.toArray<HTMLElement>('.cap-fill').forEach((el, i) => {
        const target = el.dataset.target ?? '0%';
        gsap.to(el, { width: target, duration: 1.4, delay: 0.5 + i * 0.1, ease: REVEAL_EASE });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [value]);

  return (
    <DashboardContext.Provider value={value}>
      <div ref={rootRef} className="mx-auto max-w-[1440px] px-6 py-10">
        <SubmittedBanner />
        <CompanyHeader />

        {/* ===== Headline KPIs ===== */}
        <div className="d-section mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <HeadlineKpis />
        </div>

        {/* ===== Building blocks of V ===== */}
        <BuildingBlocks />

        {/* ===== Radar + Actions ===== */}
        <div className="d-section mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.4fr]">
          <RadarPanel />
          <ActionsPanel />
        </div>

        {/* ===== Capital scores + Simulation ===== */}
        <div className="d-section mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <CapitalScoresPanel />
          <SimulationPanel />
        </div>

        <Footer />
      </div>
    </DashboardContext.Provider>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================

function SubmittedBanner() {
  const { submittedHighlight } = useDashboard();
  const [visible, setVisible] = useState(Boolean(submittedHighlight));
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [visible]);
  if (!visible) return null;
  return (
    <div className="d-section mb-3 flex items-center gap-3 rounded-2xl border border-green/30 bg-green/[0.08] px-4 py-3 text-[13px] text-green">
      <CheckCircle2 size={18} strokeWidth={2.25} />
      <div className="flex-1">
        <span className="font-semibold">Diagnostic complete.</span>{' '}
        <span className="text-text-dim">Numbers below reflect your latest submission.</span>
      </div>
    </div>
  );
}

function CompanyHeader() {
  const { company, source } = useDashboard();
  return (
    <div className="d-section flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-bg-2/40 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-[54px] w-[54px] items-center justify-center rounded-[13px] bg-gradient-to-br from-cyan to-blue font-serif text-[20px] font-semibold text-white"
          style={{ boxShadow: '0 6px 22px rgba(6, 182, 212, 0.35)' }}
        >
          {company.initials}
        </div>
        <div>
          <h1 className="font-serif text-[26px] font-medium leading-tight tracking-tight">
            {company.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-text-dim">
            <span>{company.sector}</span>
            {company.nace_code && <><span className="text-text-faint">·</span><span>NACE {company.nace_code}</span></>}
            {company.province && <><span className="text-text-faint">·</span><span>{company.province}</span></>}
            {company.lifecycle_stage && (
              <>
                <span className="text-text-faint">·</span>
                <span>Lifecycle: {company.lifecycle_stage}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-gold/30 bg-gold/[0.12] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-gold">
          ● {source === 'submission' ? 'Live valuation' : 'Demo data'}
        </span>
        <span className="rounded-lg border border-line bg-bg-2/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-text-dim">
          {source === 'submission' ? 'Latest run' : 'Sample profile'}
        </span>
        <Link
          href="/diagnostic"
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/[0.10] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-cyan transition-all hover:-translate-y-0.5 hover:bg-cyan/[0.18]"
        >
          <PenLine size={12} strokeWidth={2.25} />
          Run new diagnostic
        </Link>
      </div>
    </div>
  );
}

function HeadlineKpis() {
  const { valuation, company } = useDashboard();
  const riskFlagLabel = valuation.flags[0]
    ? valuation.flags[0].replaceAll('_', ' ') + ' flag'
    : `${company.sector} peer cohort`;

  return (
    <>
      <KpiCard tone="gold" label="Estimated Value">
        <CountValue target={valuation.v_current_eur / 1_000_000} prefix="€" suffix="M" decimals={1} />
        <div className="kpi-sub">
          Range: €{(valuation.v_low_eur / 1_000_000).toFixed(1)}M – €{(valuation.v_high_eur / 1_000_000).toFixed(1)}M
        </div>
      </KpiCard>

      <KpiCard tone="green" label="Value Gap" icon={<TrendingUp size={14} />}>
        <CountValue target={valuation.value_gap_pct} prefix="+" suffix="%" />
        <div className="kpi-sub">
          Optimised potential ≈ €{(valuation.v_potential_eur / 1_000_000).toFixed(1)}M
        </div>
      </KpiCard>

      <KpiCard tone="cyan" label="Quality Score">
        <div className="flex items-baseline gap-1">
          <CountValue target={valuation.quality_score} />
          <span className="text-[16px] text-text-faint">/100</span>
        </div>
        <div className="kpi-sub">{qualityLabel(valuation.quality_score)}</div>
      </KpiCard>

      <KpiCard tone="amber" label="Risk Index" icon={<AlertTriangle size={14} />}>
        <div className="font-mono text-[26px] font-bold tracking-[0.04em] text-amber">
          {valuation.risk_index}
        </div>
        <div className="kpi-sub">{riskFlagLabel}</div>
      </KpiCard>
    </>
  );
}

function qualityLabel(score: number): string {
  if (score >= 80) return 'Top-quartile structure';
  if (score >= 65) return 'Above-average structure';
  if (score >= 50) return 'Mid-cohort structure';
  if (score >= 35) return 'Below-average structure';
  return 'Fragile structure';
}

function BuildingBlocks() {
  const { valuation, company } = useDashboard();
  return (
    <div className="d-section mt-3 rounded-2xl border border-line bg-bg-2/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          How the valuation breaks down
        </h3>
        <span className="font-mono text-[10px] text-text-faint">V = EBITDA × M<sub>sector</sub> × SQF × GF</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BlockCard label="EBITDA (norm)" value={`€${(valuation.ebitda_norm_eur / 1000).toFixed(0)}K`} sub="3-yr smoothed" />
        <BlockCard label="M sector"      value={`${valuation.m_sector.toFixed(1)}×`}                  sub={`${company.nace_code ? `NACE ${company.nace_code}` : company.sector} · SME-discounted`} />
        <BlockCard label="SQF"           value={valuation.sqf.toFixed(2)} sub="0.6–1.4 · 4-capital aggregate" highlight />
        <BlockCard label="GF"            value={valuation.gf.toFixed(2)}  sub="0.7–1.5 · CAGR + quality" />
      </div>
    </div>
  );
}

type Tone = 'gold' | 'green' | 'cyan' | 'amber' | 'purple';
const TONE_RGB: Record<Tone, string> = {
  gold:   'var(--gold)',
  green:  'var(--green)',
  cyan:   'var(--cyan)',
  amber:  'var(--amber)',
  purple: 'var(--purple)',
};

function KpiCard({
  tone, label, icon, children,
}: {
  tone: Tone; label: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-2/40 p-5 transition-all duration-300 hover:border-line-2 hover:bg-bg-2/60">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: `rgb(${TONE_RGB[tone]})`, opacity: 0.6 }}
      />
      <div className="mb-2.5 flex items-center justify-between">
        <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          {label}
        </div>
        {icon && <div className={`opacity-50 text-[rgb(${TONE_RGB[tone]})]`} style={{ color: `rgb(${TONE_RGB[tone]})` }}>{icon}</div>}
      </div>
      <KpiContent tone={tone}>{children}</KpiContent>
    </div>
  );
}

function KpiContent({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'font-mono font-bold leading-none tracking-tight',
        tone === 'gold'  && 'text-gold',
        tone === 'green' && 'text-green',
        tone === 'cyan'  && 'text-cyan',
        tone === 'amber' && 'text-amber',
        tone === 'purple' && 'text-purple',
        '[&_.kpi-sub]:mt-2.5 [&_.kpi-sub]:font-mono [&_.kpi-sub]:text-[11.5px] [&_.kpi-sub]:font-medium [&_.kpi-sub]:text-text-dim',
      )}
    >
      {children}
    </div>
  );
}

function CountValue({
  target, prefix = '', suffix = '', decimals = 0,
}: { target: number; prefix?: string; suffix?: string; decimals?: number }) {
  return (
    <span
      className="text-[28px]"
      data-count-target={target}
      data-decimals={decimals}
      data-count-prefix={prefix}
      data-count-suffix={suffix}
    >
      {prefix}0{decimals > 0 ? '.0' : ''}{suffix}
    </span>
  );
}

function BlockCard({
  label, value, sub, highlight,
}: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-black/25 p-4',
        highlight && 'border-gold/30 bg-gold/[0.04]',
      )}
    >
      <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">{label}</div>
      <div className={cn('mt-1.5 font-mono text-[22px] font-bold tracking-tight', highlight ? 'text-gold' : 'text-text')}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[10.5px] text-text-faint">{sub}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Radar
// -----------------------------------------------------------------------------
function RadarPanel() {
  const { valuation, company } = useDashboard();
  const caps = valuation.capitals;
  return (
    <div className="rounded-2xl border border-line bg-bg-2/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          4-Capital Radar
        </h4>
        <span className="font-mono text-[10px] text-text-faint">
          Peer-percentile · {company.nace_code ? `NACE ${company.nace_code}` : company.sector}
        </span>
      </div>
      <div className="flex items-center justify-center py-2">
        <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full max-w-[320px]">
          {/* Concentric grid */}
          <polygon points="160,135 185,160 160,185 135,160" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <polygon points="160,110 210,160 160,210 110,160" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <polygon points="160,85 235,160 160,235 85,160"   fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <polygon points="160,60 260,160 160,260 60,160"   fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <line x1="160" y1="60" x2="160" y2="260" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
          <line x1="60" y1="160" x2="260" y2="160" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />

          {/* Data polygon — animated by GSAP */}
          <polygon
            id="radar-poly"
            points="160,160 160,160 160,160 160,160"
            fill="rgba(245, 165, 36, 0.16)"
            stroke="rgb(245, 165, 36)"
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 0 14px rgba(245, 165, 36, 0.45))' }}
          />
          {RADAR_TARGETS.map((t) => (
            <circle
              key={t.id}
              id={t.id}
              cx={160}
              cy={160}
              r={5}
              fill="rgb(245, 165, 36)"
              stroke="rgb(var(--bg))"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 0 6px rgba(245, 165, 36, 0.7))' }}
            />
          ))}
          <text x="160" y="44"  textAnchor="middle" fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Financial</text>
          <text x="160" y="28"  textAnchor="middle" fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">{caps[0]?.score ?? 0}</text>
          <text x="278" y="163" textAnchor="start"  fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Tech</text>
          <text x="278" y="180" textAnchor="start"  fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">{caps[1]?.score ?? 0}</text>
          <text x="160" y="282" textAnchor="middle" fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Human &amp; Org</text>
          <text x="160" y="298" textAnchor="middle" fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">{caps[2]?.score ?? 0}</text>
          <text x="42"  y="163" textAnchor="end"    fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Relational</text>
          <text x="42"  y="180" textAnchor="end"    fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">{caps[3]?.score ?? 0}</text>
        </svg>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------
function ActionsPanel() {
  const { actions } = useDashboard();
  return (
    <div className="rounded-2xl border border-line bg-bg-2/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          Top 3 Priority Actions
        </h4>
        <span className="font-mono text-[10px] text-text-faint">Ranked by ROV</span>
      </div>
      {actions.map((a, i) => (
        <div
          key={a.rank}
          className={cn(
            'flex gap-3.5 py-4 text-[13.5px] leading-snug',
            i < actions.length - 1 ? 'border-b border-line-faint' : 'pb-0',
            i === 0 ? 'pt-0' : '',
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.15] font-mono text-[12px] font-bold text-gold">
            {a.rank}
          </div>
          <div className="flex-1 text-text-dim">
            <div className="font-medium text-text">{a.title}</div>
            <div className="mt-0.5 text-[12.5px]">{a.detail}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {a.capital_impact && (
                <span className="rounded-md bg-green/[0.12] px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-[0.04em] text-green">
                  {a.capital_impact}
                </span>
              )}
              <span className="font-mono text-[10.5px] text-text-faint">
                ~ {a.time_horizon_months} months
              </span>
            </div>
          </div>
          <div className="shrink-0 self-center text-right">
            <div
              className="font-mono text-[18px] font-bold text-green"
              style={{ textShadow: '0 0 12px rgba(34, 197, 94, 0.4)' }}
            >
              +{a.v_uplift_pct}%
            </div>
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
              Δ V
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Capital scores breakdown
// -----------------------------------------------------------------------------
function CapitalScoresPanel() {
  const { valuation } = useDashboard();
  const colorRgb: Record<string, string> = {
    'cap-fin':   '59, 130, 246',
    'cap-tech':  '168, 85, 247',
    'cap-human': '249, 115, 22',
    'cap-rel':   '34, 197, 94',
  };

  return (
    <div className="rounded-2xl border border-line bg-bg-2/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          Capital scores breakdown
        </h4>
        <span className="font-mono text-[10px] text-text-faint">Weighted aggregate = SQF {valuation.sqf.toFixed(2)}</span>
      </div>
      {valuation.capitals.map((c) => {
        const rgb = colorRgb[c.color] ?? '255, 255, 255';
        return (
          <div key={c.key} className="mb-4 last:mb-0">
            <div className="mb-1.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[13px] font-semibold text-text">{c.name}</span>
                <span className="font-mono text-[10px] text-text-faint">weight {c.weight}%</span>
              </div>
              <div className="font-mono text-[16px] font-bold" style={{ color: `rgb(${rgb})` }}>
                {c.score}
                <span className="text-[10px] text-text-faint">/100</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="cap-fill h-full w-0 rounded-full"
                data-target={`${c.score}%`}
                style={{
                  background: `linear-gradient(90deg, rgb(${rgb}), color-mix(in srgb, rgb(${rgb}) 60%, white))`,
                  boxShadow: `0 0 10px rgba(${rgb}, 0.5)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Simulation — Phase 09 adds interactivity. For Phase 07 we render the same
// teaser but driven by the current valuation's levers + V_potential.
// -----------------------------------------------------------------------------
function SimulationPanel() {
  const { valuation, levers } = useDashboard();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-bg-2/60 to-purple/[0.06] p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 80% 20%, rgba(168, 85, 247, 0.10), transparent 60%)',
        }}
      />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            Simulation Engine
          </h4>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-purple/[0.15] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
            <Sliders size={10} /> Preview
          </span>
        </div>

        <p className="mb-5 text-[13.5px] leading-relaxed text-text-dim">
          What if you moved each lever to its target? The model recomputes V live —
          interactive sliders ship in Phase 09.
        </p>

        <div className="space-y-3">
          {levers.map((l) => (
            <div key={l.key} className="rounded-lg border border-line bg-black/20 p-3">
              <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
                <span className="text-text">{l.label}</span>
                <span className="text-text-faint">
                  <span className="text-amber">{l.current}{l.unit}</span>
                  {' → '}
                  <span className="text-green">{l.target}{l.unit}</span>
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="absolute left-0 top-0 h-full bg-amber/70"
                  style={{ width: `${normaliseLever(l.current, l.key)}%` }}
                />
                <div
                  className="absolute top-0 h-full w-px bg-green"
                  style={{ left: `${normaliseLever(l.target, l.key)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-purple/25 bg-purple/[0.08] px-4 py-3">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
              Combined effect
            </div>
            <div className="mt-0.5 text-[13px] text-text-dim">
              All three levers at target →
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[22px] font-bold text-green" style={{ textShadow: '0 0 12px rgba(34, 197, 94, 0.4)' }}>
              €{(valuation.v_potential_eur / 1_000_000).toFixed(1)}M
            </div>
            <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
              V<sub>potential</sub>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function normaliseLever(value: number, key: string): number {
  if (key === 'rd_intensity') return Math.min(100, value * 20);
  return Math.min(100, value);
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------
function Footer() {
  const { source, company } = useDashboard();
  return (
    <div className="d-section mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
      <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
        <Sparkles size={11} className="text-gold" />
        {source === 'submission'
          ? `${company.name} · live valuation`
          : 'Demo data · ACME INDUSTRIE S.R.L. · for academic presentation'}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
        V = EBITDA × M<sub>sector</sub> × SQF × GF
      </div>
    </div>
  );
}
