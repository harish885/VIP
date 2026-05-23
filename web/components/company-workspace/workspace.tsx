'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  PenLine,
  CheckCircle2,
  Sparkles,
  MapPin,
  FlaskConical,
  ListTodo,
  LayoutGrid,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DashboardData } from '@/lib/dashboard-data';
import type { AidaSnapshot } from '@/lib/aida';
import { SimulationPanel } from '@/components/dashboard/simulation-panel';
import type { DiagnosisStatus } from '@/lib/company-loader';
import { resetCompanyAction } from '@/app/(app)/companies/[taxCode]/reset/action';
import { InfoButton, type Explanation } from '@/components/company-workspace/info-popover';
import { buildExplanations, type ExplanationMap } from '@/lib/dashboard-explanations';

type Tab = 'overview' | 'actions' | 'scenario' | 'method';

import type { LucideIcon } from 'lucide-react';

const TAB_DEFINITIONS: Array<{ key: Tab; label: string; icon: LucideIcon }> = [
  { key: 'overview', label: 'Overview',     icon: LayoutGrid    },
  { key: 'actions',  label: 'Action plan',  icon: ListTodo      },
  { key: 'scenario', label: 'Scenario lab', icon: FlaskConical  },
  { key: 'method',   label: 'Method',       icon: BookOpen      },
];

export interface WorkspaceProps {
  data: DashboardData;
  snapshot?: AidaSnapshot | null;
  taxCode: string;
  status: DiagnosisStatus;
  lastRunISO: string | null;
  freshSubmission?: boolean;
}

export function CompanyWorkspace({
  data,
  snapshot,
  taxCode,
  status,
  lastRunISO,
  freshSubmission,
}: WorkspaceProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [showBanner, setShowBanner] = useState(Boolean(freshSubmission));
  const explanations = useMemo(
    () => buildExplanations(data, snapshot ?? null),
    [data, snapshot],
  );

  useEffect(() => {
    if (!showBanner) return;
    const id = setTimeout(() => setShowBanner(false), 6000);
    return () => clearTimeout(id);
  }, [showBanner]);

  return (
    <div className="mx-auto max-w-[1140px] px-6 pb-16 pt-6">
      {/* Back link */}
      <div className="mb-5">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
        >
          <ArrowLeft size={13} /> All companies
        </Link>
      </div>

      {showBanner && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-green/30 bg-green/[0.06] px-4 py-3 text-[13px] text-green">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">Diagnostic saved.</div>
            <div className="text-text-dim">The numbers below reflect your latest answers.</div>
          </div>
        </div>
      )}

      <WorkspaceHero
        data={data}
        taxCode={taxCode}
        status={status}
        lastRunISO={lastRunISO}
        explanations={explanations}
      />

      {/* Tabs */}
      <nav
        role="tablist"
        aria-label="Workspace sections"
        className="mt-6 flex flex-wrap gap-1 border-b border-line"
      >
        {TAB_DEFINITIONS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors',
                active
                  ? 'border-gold text-text'
                  : 'border-transparent text-text-faint hover:text-text-dim',
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {tab === 'overview' && <OverviewTab data={data} explanations={explanations} />}
        {tab === 'actions' && <ActionPlanTab data={data} explanations={explanations} />}
        {tab === 'scenario' && <ScenarioTab data={data} />}
        {tab === 'method' && <MethodTab data={data} explanations={explanations} />}
      </div>
    </div>
  );
}

// =============================================================================
// HERO — identity + headline summary
// =============================================================================
function WorkspaceHero({
  data,
  taxCode,
  status,
  lastRunISO,
  explanations,
}: {
  data: DashboardData;
  taxCode: string;
  status: DiagnosisStatus;
  lastRunISO: string | null;
  explanations: ExplanationMap;
}) {
  const { company, valuation, source } = data;
  const lastRunLabel = lastRunISO ? formatLastRun(lastRunISO) : null;

  return (
    <section className="rounded-2xl border border-line bg-bg-1 p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            {lastRunLabel && (
              <span className="font-mono text-[10.5px] uppercase tracking-eyebrow text-text-faint">
                Latest run · {lastRunLabel}
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-[640px] font-serif text-[34px] font-medium leading-[1.05] tracking-tight text-text">
            {company.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-dim">
            {company.province && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} /> {company.province}
              </span>
            )}
            {company.sector && (
              <>
                <Dot />
                <span>{company.sector}</span>
              </>
            )}
            {company.nace_code && (
              <>
                <Dot />
                <span>NACE {company.nace_code}</span>
              </>
            )}
            <Dot />
            <span className="font-mono text-[11px] text-text-faint">Tax · {taxCode}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-start gap-2">
          {source === 'submission' && <ResetButton taxCode={taxCode} />}
          <Link
            href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-gold/[0.10] px-4 py-2 text-[12.5px] font-semibold text-gold transition-colors hover:bg-gold/[0.18]"
          >
            <PenLine size={14} />
            {source === 'submission' ? 'Re-run diagnostic' : 'Run diagnostic'}
          </Link>
        </div>
      </div>

      {/* Headline KPIs */}
      {source === 'submission' ? (
        <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <KpiCell
            label="Company value"
            value={formatMoney(valuation.v_current_eur)}
            sub={`Range €${m(valuation.v_low_eur)}–€${m(valuation.v_high_eur)}M`}
            info={explanations.v_current}
            subInfo={explanations.v_range}
          />
          <KpiCell
            label="Value gap"
            value={`+${Math.max(0, Math.round(valuation.value_gap_pct))}%`}
            sub={`Potential ≈ ${formatMoney(valuation.v_potential_eur)}`}
            tone="positive"
            info={explanations.value_gap}
            subInfo={explanations.v_potential}
          />
          <KpiCell
            label="Quality score"
            value={`${valuation.quality_score}/100`}
            sub={qualityLabel(valuation.quality_score)}
            info={explanations.quality_score}
          />
          <KpiCell
            label="Risk signal"
            value={valuation.risk_index}
            sub={riskCopy(valuation.risk_index, valuation.flags)}
            tone={riskTone(valuation.risk_index)}
            info={explanations.risk_index}
          />
        </div>
      ) : (
        <div className="mt-7 rounded-xl border border-line bg-bg-2/40 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Sparkles size={14} />
            </span>
            <div className="flex-1">
              <h3 className="font-serif text-[18px] font-medium text-text">
                Run the diagnostic to see this company&apos;s strategic value.
              </h3>
              <p className="mt-1 max-w-[560px] text-[13px] text-text-dim">
                Answer 19 short questions. Quantitative data is pulled from AIDA
                automatically. You will get a value, a value-gap, the four-capital
                scorecard, and a Top-3 of priority actions — in about five minutes.
              </p>
              <Link
                href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold hover:underline"
              >
                Start the diagnostic <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ResetButton({ taxCode }: { taxCode: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await resetCompanyAction(taxCode);
      } catch (e) {
        const msg = (e as Error).message ?? '';
        if (msg.includes('NEXT_REDIRECT')) throw e;
        setError(msg || 'Reset failed.');
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        title={
          confirming
            ? 'Click again to confirm reset'
            : 'Clear this diagnostic and return to the AIDA snapshot'
        }
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-[12.5px] font-medium transition-colors disabled:opacity-60',
          confirming
            ? 'border-red/50 bg-red/[0.10] text-red hover:bg-red/[0.18]'
            : 'border-line bg-bg-1 text-text-dim hover:border-line-2 hover:text-text',
        )}
      >
        <RotateCcw size={13} />
        {pending ? 'Resetting…' : confirming ? 'Click to confirm' : 'Reset'}
      </button>
      {error && (
        <span className="text-[11px] text-red">{error}</span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DiagnosisStatus }) {
  const map: Record<DiagnosisStatus, { label: string; cls: string }> = {
    not_diagnosed: {
      label: 'Not diagnosed',
      cls: 'border-text-faint/40 bg-bg-2/60 text-text-faint',
    },
    diagnosed: {
      label: 'Diagnosed',
      cls: 'border-cyan/40 bg-cyan/[0.07] text-cyan',
    },
    recent: {
      label: 'Updated recently',
      cls: 'border-green/40 bg-green/[0.07] text-green',
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow',
        cls,
      )}
    >
      {label}
    </span>
  );
}

function KpiCell({
  label,
  value,
  sub,
  tone = 'default',
  info,
  subInfo,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  info?: Explanation;
  subInfo?: Explanation;
}) {
  const valueColor =
    tone === 'positive' ? 'text-green'
    : tone === 'warning' ? 'text-amber'
    : tone === 'danger' ? 'text-red'
    : 'text-text';
  return (
    <div className="bg-bg-1 px-5 py-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        <span>{label}</span>
        {info && <InfoButton explanation={info} ariaLabel={`How ${label} is calculated`} />}
      </div>
      <div className={cn('mt-2 font-serif text-[28px] font-medium leading-none tracking-tight', valueColor)}>
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-text-dim">
        <span>{sub}</span>
        {subInfo && <InfoButton explanation={subInfo} ariaLabel={`${label} sub-metric breakdown`} />}
      </div>
    </div>
  );
}

// =============================================================================
// OVERVIEW TAB — radar + capital scorecard + 1-line summary of Top-3
// =============================================================================
function OverviewTab({
  data,
  explanations,
}: {
  data: DashboardData;
  explanations: ExplanationMap;
}) {
  const { valuation, actions, source } = data;
  if (source !== 'submission') {
    return <EmptySectionPanel />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
      <Card title="Capital scorecard" subtitle="Four pillars, peer-relative">
        <CapitalRadar capitals={valuation.capitals} sqf={valuation.sqf} sqfInfo={explanations.sqf} />
        <ul className="mt-4 space-y-3">
          {valuation.capitals.map((c) => (
            <li key={c.key} className="flex items-center gap-3 text-[13px]">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: capRgb(c.color) }}
              />
              <span className="flex flex-1 items-center gap-1.5 text-text">
                {c.name}
                {explanations.capitals[c.key] && (
                  <InfoButton
                    explanation={explanations.capitals[c.key]!}
                    ariaLabel={`How ${c.name} score is calculated`}
                  />
                )}
              </span>
              <span className="font-mono text-text-faint">weight {c.weight}%</span>
              <span className="w-12 text-right font-mono font-semibold text-text">{c.score}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-4">
        <Card title="Top priority actions" subtitle="Ranked by Return on Value">
          {actions.length === 0 ? (
            <p className="text-[13px] text-text-dim">
              No priority actions yet — re-run the diagnostic.
            </p>
          ) : (
            <ol className="space-y-3">
              {actions.slice(0, 3).map((a) => (
                <li key={a.rank} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.08] font-mono text-[11px] font-semibold text-gold">
                    {a.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13.5px] font-medium text-text">{a.title}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="font-mono text-[12px] font-semibold text-green">
                          +{a.v_uplift_pct}%
                        </span>
                        {explanations.actions[a.rank] && (
                          <InfoButton
                            explanation={explanations.actions[a.rank]!}
                            align="left"
                            ariaLabel={`How action #${a.rank} uplift is calculated`}
                          />
                        )}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-text-dim">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Valuation build-up" subtitle="V = EBITDA × Multiple × SQF × GF">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="EBITDA (norm)" value={`€${kFmt(valuation.ebitda_norm_eur)}K`} info={explanations.ebitda} />
            <Stat label="Sector multiple" value={`${valuation.m_sector.toFixed(1)}×`} info={explanations.m_sector} />
            <Stat label="SQF" value={valuation.sqf.toFixed(2)} hint="Quality factor" info={explanations.sqf} />
            <Stat label="GF" value={valuation.gf.toFixed(2)} hint="Growth factor" info={explanations.gf} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// =============================================================================
// ACTION PLAN TAB
// =============================================================================
function ActionPlanTab({
  data,
  explanations,
}: {
  data: DashboardData;
  explanations: ExplanationMap;
}) {
  const { actions, source, valuation } = data;
  if (source !== 'submission') return <EmptySectionPanel />;
  return (
    <Card
      title="Action plan"
      subtitle={`Three moves to close the value gap. Combined uplift potential ≈ +${valuation.value_gap_pct}%`}
    >
      {actions.length === 0 ? (
        <p className="text-[13px] text-text-dim">
          No priority actions surfaced for this profile.
        </p>
      ) : (
        <ol className="divide-y divide-line-faint">
          {actions.map((a) => (
            <li key={a.rank} className="flex items-start gap-5 py-5 first:pt-0 last:pb-0">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.08] font-serif text-[16px] font-semibold text-gold">
                {a.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="flex items-center gap-2 text-[16px] font-medium text-text">
                    {a.title}
                    {explanations.actions[a.rank] && (
                      <InfoButton
                        explanation={explanations.actions[a.rank]!}
                        ariaLabel={`How action #${a.rank} is computed`}
                      />
                    )}
                  </h4>
                  <span className="shrink-0 font-mono text-[14px] font-semibold text-green">
                    +{a.v_uplift_pct}% value
                  </span>
                </div>
                <p className="mt-1 max-w-[640px] text-[13.5px] leading-relaxed text-text-dim">
                  {a.detail}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px]">
                  {a.capital_impact && (
                    <span className="rounded-md bg-bg-2/70 px-2 py-1 font-mono text-text-dim">
                      {a.capital_impact}
                    </span>
                  )}
                  <span className="font-mono text-text-faint">
                    ~ {a.time_horizon_months} months to impact
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

// =============================================================================
// SCENARIO TAB — interactive simulation
// =============================================================================
function ScenarioTab({ data }: { data: DashboardData }) {
  const { source, simulationBaseline, valuation } = data;
  if (source !== 'submission') return <EmptySectionPanel />;
  return (
    <div className="space-y-3">
      <header>
        <h3 className="font-serif text-[16px] font-medium tracking-tight text-text">
          Scenario lab
        </h3>
        <p className="mt-0.5 text-[12.5px] text-text-faint">
          Move the sliders to see how the value would change. Math runs locally.
        </p>
      </header>
      <SimulationPanel
        baseline={simulationBaseline}
        vCurrentEur={valuation.v_current_eur}
        vPotentialEur={valuation.v_potential_eur}
      />
    </div>
  );
}

// =============================================================================
// METHOD TAB
// =============================================================================
function MethodTab({
  data,
  explanations,
}: {
  data: DashboardData;
  explanations: ExplanationMap;
}) {
  const { valuation, source, company } = data;
  return (
    <div className="space-y-4">
      <Card title="How we get to a value" subtitle="V = EBITDA × Multiple × SQF × GF">
        <div className="prose prose-sm max-w-none text-[13.5px] leading-relaxed text-text-dim">
          <p>
            Each company is scored across <span className="text-text">four capitals</span>:
            financial, technological, human &amp; organisational, and relational.
            The four scores combine into a <span className="text-text">Strategic Quality
            Factor (SQF, 0.6–1.4)</span> and a <span className="text-text">Growth Factor
            (GF, 0.7–1.5)</span>. We then anchor against a sector EBITDA multiple
            calibrated to comparable Italian SMEs in the AIDA / Bureau van Dijk dataset.
          </p>
          <p>
            Quantitative data comes from AIDA directly. Qualitative judgements come
            from your answers to the 19-question diagnostic. We never ask for numbers
            you would have to look up — only for assessments you already know.
          </p>
        </div>
        {source === 'submission' && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="EBITDA (norm)" value={`€${kFmt(valuation.ebitda_norm_eur)}K`} info={explanations.ebitda} />
            <Stat label="M sector"      value={`${valuation.m_sector.toFixed(1)}×`} hint={company.nace_code ? `NACE ${company.nace_code}` : undefined} info={explanations.m_sector} />
            <Stat label="SQF"           value={valuation.sqf.toFixed(2)} hint="0.6 – 1.4" info={explanations.sqf} />
            <Stat label="GF"            value={valuation.gf.toFixed(2)} hint="0.7 – 1.5" info={explanations.gf} />
          </div>
        )}
      </Card>

      <Card title="Data sources" subtitle="What goes in">
        <ul className="space-y-2 text-[13px] text-text-dim">
          <li><span className="font-medium text-text">AIDA / Bureau van Dijk</span> — revenue history, EBITDA, balance sheet, employees, R&amp;D, customer / supplier hints. Last available year, frozen at submission time.</li>
          <li><span className="font-medium text-text">Your questionnaire</span> — 19 qualitative judgements on a 1–5 scale, covering the four capitals plus business lifecycle, distinctive assets, and prior M&amp;A exposure.</li>
        </ul>
      </Card>
    </div>
  );
}

// =============================================================================
// PRIMITIVES
// =============================================================================
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-bg-1 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <header className="mb-4">
        <h3 className="font-serif text-[16px] font-medium tracking-tight text-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-text-faint">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  info,
}: {
  label: string;
  value: string;
  hint?: string;
  info?: Explanation;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        <span>{label}</span>
        {info && <InfoButton explanation={info} ariaLabel={`How ${label} is calculated`} />}
      </div>
      <div className="mt-1 font-serif text-[20px] font-medium tracking-tight text-text">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-text-faint">{hint}</div>}
    </div>
  );
}

function EmptySectionPanel() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-bg-2/30 px-6 py-12 text-center text-[13.5px] text-text-dim">
      Run the diagnostic to see this section come alive.
    </div>
  );
}

function Dot() {
  return <span className="text-text-faint">·</span>;
}

// =============================================================================
// CAPITAL RADAR — small, calm, no glow
// =============================================================================
function CapitalRadar({
  capitals,
  sqf,
  sqfInfo,
}: {
  capitals: DashboardData['valuation']['capitals'];
  sqf: number;
  sqfInfo?: Explanation;
}) {
  const center = 120;
  const maxR = 90;
  const finScore   = (capitals[0]?.score ?? 0) / 100;
  const techScore  = (capitals[1]?.score ?? 0) / 100;
  const humanScore = (capitals[2]?.score ?? 0) / 100;
  const relScore   = (capitals[3]?.score ?? 0) / 100;
  const pts = [
    [center,                       center - maxR * finScore],
    [center + maxR * techScore,    center                  ],
    [center,                       center + maxR * humanScore],
    [center - maxR * relScore,     center                  ],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return (
    <div className="flex items-center justify-between gap-6">
      <svg viewBox="0 0 240 240" className="h-auto w-full max-w-[260px]">
        {/* concentric squares */}
        {[0.25, 0.5, 0.75, 1].map((r) => {
          const offset = maxR * r;
          return (
            <polygon
              key={r}
              points={`${center},${center - offset} ${center + offset},${center} ${center},${center + offset} ${center - offset},${center}`}
              fill="none"
              stroke="rgb(var(--line) / 0.8)"
              strokeWidth={1}
            />
          );
        })}
        <line x1={center} y1={center - maxR} x2={center} y2={center + maxR} stroke="rgb(var(--line-2) / 0.6)" strokeDasharray="2 4" />
        <line x1={center - maxR} y1={center} x2={center + maxR} y2={center} stroke="rgb(var(--line-2) / 0.6)" strokeDasharray="2 4" />
        <polygon points={pts} fill="rgb(var(--gold) / 0.18)" stroke="rgb(var(--gold))" strokeWidth={1.5} />
        {/* vertices */}
        {[
          { x: center,                       y: center - maxR * finScore,   label: capitals[0]?.name ?? 'Financial' },
          { x: center + maxR * techScore,    y: center,                     label: capitals[1]?.name ?? 'Tech' },
          { x: center,                       y: center + maxR * humanScore, label: capitals[2]?.name ?? 'Human' },
          { x: center - maxR * relScore,     y: center,                     label: capitals[3]?.name ?? 'Rel.' },
        ].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="rgb(var(--gold))" />
        ))}
        <text x={center} y={18}            textAnchor="middle" fontSize="11" fill="rgb(var(--text-dim))">Financial</text>
        <text x={232}    y={center + 4}    textAnchor="end"    fontSize="11" fill="rgb(var(--text-dim))">Tech</text>
        <text x={center} y={232}           textAnchor="middle" fontSize="11" fill="rgb(var(--text-dim))">Human</text>
        <text x={8}      y={center + 4}    textAnchor="start"  fontSize="11" fill="rgb(var(--text-dim))">Relational</text>
      </svg>
      <div className="hidden shrink-0 text-right md:block">
        <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
          <span>SQF</span>
          {sqfInfo && <InfoButton explanation={sqfInfo} align="left" ariaLabel="How SQF is calculated" />}
        </div>
        <div className="mt-1 font-serif text-[34px] font-medium leading-none tracking-tight text-text">
          {sqf.toFixed(2)}
        </div>
        <div className="mt-1 text-[11.5px] text-text-faint">0.6 – 1.4</div>
      </div>
    </div>
  );
}

// =============================================================================
// Formatters
// =============================================================================
function m(eur: number): string {
  return (eur / 1_000_000).toFixed(1);
}
function kFmt(eur: number): string {
  return Math.round(eur / 1000).toLocaleString();
}
function formatMoney(eur: number): string {
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(2)}M`;
  if (eur >= 1_000) return `€${(eur / 1_000).toFixed(0)}K`;
  return `€${eur}`;
}
function qualityLabel(score: number): string {
  if (score >= 80) return 'Top quartile structure';
  if (score >= 65) return 'Above-average structure';
  if (score >= 50) return 'Mid-cohort structure';
  if (score >= 35) return 'Below-average structure';
  return 'Fragile structure';
}
function riskTone(r: string): 'positive' | 'warning' | 'danger' {
  if (r === 'HIGH') return 'danger';
  if (r === 'MEDIUM') return 'warning';
  return 'positive';
}
function riskCopy(r: string, flags: string[]): string {
  if (flags.length === 0) return 'No fragility flags raised.';
  return flags
    .map((f) => f.replaceAll('_', ' '))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' · ');
}
function capRgb(key: string): string {
  switch (key) {
    case 'cap-fin':   return 'rgb(var(--cap-fin))';
    case 'cap-tech':  return 'rgb(var(--cap-tech))';
    case 'cap-human': return 'rgb(var(--cap-human))';
    case 'cap-rel':   return 'rgb(var(--cap-rel))';
    default:          return 'rgb(var(--text-dim))';
  }
}
function formatLastRun(iso: string): string {
  const dt = new Date(iso);
  const minutes = (Date.now() - dt.getTime()) / 60_000;
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${Math.round(minutes)} min ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} h ago`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)} d ago`;
  return dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
