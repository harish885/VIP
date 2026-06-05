'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PenLine,
  CheckCircle2,
  FlaskConical,
  LayoutGrid,
  BookOpen,
} from 'lucide-react';
import type { DashboardData } from '@/lib/dashboard-data';
import type { AidaSnapshot } from '@/lib/aida';
import type { DiagnosisStatus } from '@/lib/company-loader';
import { SimulationPanel } from '@/components/dashboard/simulation-panel';
import { InfoButton, type Explanation } from '@/components/company-workspace/info-popover';
import { buildExplanations, type ExplanationMap } from '@/lib/dashboard-explanations';
import { formatEurCompact, formatEurMillions, formatThk } from '@/lib/format';

import { Button } from '@/components/vip-ui/button';
import { StatCell } from '@/components/vip-ui/stat-cell';
import { StatusBadge } from '@/components/vip-ui/status-badge';
import { SourceBadge } from '@/components/vip-ui/source-badge';
import { Surface } from '@/components/vip-ui/surface';
import { Segmented } from '@/components/vip-ui/segmented';
import { SectionHeader } from '@/components/vip-ui/section-header';

import { CompanyPassport } from '@/components/cockpit/company-passport';
import { CapitalGlyph } from '@/components/cockpit/capital-glyph';
import { ValueBridge } from '@/components/cockpit/value-bridge';
import { CapitalConstellation } from '@/components/cockpit/capital-constellation';
import { StrategyBoard } from '@/components/cockpit/strategy-board';

type Tab = 'cockpit' | 'scenario' | 'method';

const TABS = [
  { value: 'cockpit' as const,  label: 'Cockpit',     icon: <LayoutGrid size={13} /> },
  { value: 'scenario' as const, label: 'Scenario lab', icon: <FlaskConical size={13} /> },
  { value: 'method' as const,   label: 'Method',      icon: <BookOpen size={13} /> },
];

export interface WorkspaceProps {
  data: DashboardData;
  snapshot?: AidaSnapshot | null;
  taxCode: string;
  status: DiagnosisStatus;
  lastRunISO: string | null;
  freshSubmission?: boolean;
}

/**
 * CompanyWorkspace — the "Decision Cockpit" rendered when a company has
 * been diagnosed. Three calm tabs (Cockpit, Scenario lab, Method) sit
 * under one Passport header so the founder always sees the company they
 * are valuing, not whichever tab they happen to be on.
 */
export function CompanyWorkspace({
  data,
  snapshot,
  taxCode,
  status,
  lastRunISO,
  freshSubmission,
}: WorkspaceProps) {
  const [tab, setTab] = useState<Tab>('cockpit');
  const [bannerOpen, setBannerOpen] = useState(Boolean(freshSubmission));
  const explanations = useMemo(
    () => buildExplanations(data, snapshot ?? null),
    [data, snapshot],
  );

  useEffect(() => {
    if (!bannerOpen) return;
    const id = setTimeout(() => setBannerOpen(false), 7000);
    return () => clearTimeout(id);
  }, [bannerOpen]);

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-5">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
        >
          <ArrowLeft size={13} /> All companies
        </Link>
      </div>

      {bannerOpen && <SavedStrip onClose={() => setBannerOpen(false)} />}

      {snapshot && (
        <CompanyPassport
          snapshot={snapshot}
          taxCode={taxCode}
          status={status}
          glyph={
            data.source === 'submission' ? (
              <CapitalGlyph
                size={44}
                capitals={data.valuation.capitals.map((c) => ({ key: c.key, score: c.score }))}
              />
            ) : undefined
          }
          meta={lastRunISO && (
            <span className="font-mono text-[11px] text-text-dim">
              Latest run · {formatLastRun(lastRunISO)}
            </span>
          )}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
                tone="primary"
                size="md"
                icon={<PenLine size={13} />}
              >
                {data.source === 'submission' ? 'Re-run diagnostic' : 'Run diagnostic'}
              </Button>
            </div>
          }
        />
      )}

      {/* Tab nav — sits below the passport, doesn't fight for attention. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Workspace sections"
          value={tab}
          options={TABS}
          onChange={(v) => setTab(v)}
        />
        {data.source === 'submission' && (
          <div className="hidden text-[11.5px] text-text-faint sm:block">
            Valuation reflects {data.valuation.provenance.overrides_enabled
              ? 'your entered financials'
              : 'the AIDA snapshot above'}.
          </div>
        )}
      </div>

      <div className="mt-5 space-y-5">
        {tab === 'cockpit'  && <CockpitTab data={data} explanations={explanations} lastRunISO={lastRunISO} />}
        {tab === 'scenario' && <ScenarioTab data={data} />}
        {tab === 'method'   && <MethodTab data={data} explanations={explanations} />}
      </div>
    </div>
  );
}

// =============================================================================
// COCKPIT TAB — KPI strip + ValueBridge + Capital constellation + Strategy
// =============================================================================
function CockpitTab({
  data,
  explanations,
  lastRunISO,
}: {
  data: DashboardData;
  explanations: ExplanationMap;
  lastRunISO?: string | null;
}) {
  const { valuation, source, actions } = data;
  if (source !== 'submission') {
    return (
      <Surface tone="tinted" padding="lg">
        <p className="max-w-[560px] text-[13.5px] leading-relaxed text-text-dim">
          The cockpit only fills in once a diagnostic has been submitted for this
          company. Use the <strong className="font-semibold text-text">Run diagnostic</strong>
          {' '}button above to score the four capitals and unlock the value bridge,
          strategy board and scenario lab.
        </p>
      </Surface>
    );
  }

  const provenance = valuation.provenance;
  return (
    <>
      {/* Headline KPI strip — single panel, four cells, no inner borders.
          Footer rule carries the audit line: sources on the left, the run
          stamp on the right — the cockpit reads like a signed estimate. */}
      <Surface tone="raised" padding="md">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
        <StatCell
          label="Enterprise value"
          value={formatEurCompact(valuation.v_current_eur)}
          sub={`Range €${formatEurMillions(valuation.v_low_eur)}–€${formatEurMillions(valuation.v_high_eur)}M`}
          size="lg"
          trailing={<InfoButton explanation={explanations.v_current} ariaLabel="How V is calculated" />}
        />
        <StatCell
          label="Value gap"
          value={`+${Math.max(0, Math.round(valuation.value_gap_pct))}%`}
          sub={`Potential ≈ ${formatEurCompact(valuation.v_potential_eur)}`}
          tone="positive"
          size="lg"
          trailing={<InfoButton explanation={explanations.value_gap} ariaLabel="How value gap is calculated" />}
        />
        <StatCell
          label="Quality score"
          value={`${valuation.quality_score}/100`}
          sub={qualityLabel(valuation.quality_score)}
          size="lg"
          trailing={<InfoButton explanation={explanations.quality_score} ariaLabel="How quality score is calculated" />}
        />
        <StatCell
          label="Risk signal"
          value={valuation.risk_index}
          sub={riskCopy(valuation.flags)}
          tone={riskTone(valuation.risk_index)}
          size="lg"
          trailing={<InfoButton explanation={explanations.risk_index} ariaLabel="How risk signal is derived" />}
        />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line-faint pt-3">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-faint">
            Sources · AIDA snapshot{provenance.overrides_enabled ? ' + your financials' : ''} ·
            engine-computed factors · calibrated on 14,999 Italian SMEs
          </span>
          <span
            aria-label={`Valuation run ${lastRunISO ? formatRunStamp(lastRunISO) : ''}`}
            className="inline-flex -rotate-1 items-center rounded-[3px] border border-gold/45 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-gold"
          >
            Valuation run{lastRunISO ? ` · ${formatRunStamp(lastRunISO)}` : ''}
          </span>
        </div>
      </Surface>

      {/* Value bridge — the formula made visual. */}
      <Surface tone="raised" padding="md">
        <SectionHeader
          eyebrow="Value bridge"
          title="How we arrive at V"
          description="EBITDA × Sector multiple × Strategic Quality Factor × Growth Factor. Each stone carries a badge telling you whether the number came from AIDA, from you, or was computed by the engine."
          trailing={provenance.overrides_enabled && (
            <StatusBadge tone="gold" icon={<PenLine size={10} />}>Using your financials</StatusBadge>
          )}
        />
        <div className="mt-5">
          <ValueBridge
            ebitda={{
              label: 'EBITDA',
              value: `€${formatThk(valuation.ebitda_norm_eur / 1000)}K`,
              source: provenance.ebitda_source,
              info: <InfoButton explanation={explanations.ebitda} ariaLabel="EBITDA source" />,
            }}
            multiple={{
              label: 'Sector multiple',
              value: `${valuation.m_sector.toFixed(1)}×`,
              source: 'computed',
              info: <InfoButton explanation={explanations.m_sector} ariaLabel="Sector multiple source" />,
            }}
            sqf={{
              label: 'SQF',
              value: valuation.sqf.toFixed(2),
              source: 'computed',
              info: <InfoButton explanation={explanations.sqf} ariaLabel="SQF derivation" />,
            }}
            gf={{
              label: 'GF',
              value: valuation.gf.toFixed(2),
              source: 'computed',
              info: <InfoButton explanation={explanations.gf} ariaLabel="GF derivation" />,
            }}
            result={{
              value: formatEurCompact(valuation.v_current_eur),
              sub: `Range €${formatEurMillions(valuation.v_low_eur)}–€${formatEurMillions(valuation.v_high_eur)}M`,
              info: <InfoButton explanation={explanations.v_current} ariaLabel="Final V" />,
            }}
          />
        </div>
      </Surface>

      {/* Capital constellation — full width so the radar + bars breathe. */}
      <Surface tone="raised" padding="md">
        <SectionHeader
          eyebrow="Capital constellation"
          title="Four pillars, peer-relative"
          description="Every Likert answer contributes to one capital. Excluded questions drop out and the remaining weights renormalize."
        />
        <div className="mt-5">
          <CapitalConstellation
            capitals={valuation.capitals.map((c) => ({
              key: c.key,
              name: c.name,
              score: c.score,
              weight: c.weight,
            }))}
            sqf={valuation.sqf}
            sqfInfo={<InfoButton explanation={explanations.sqf} ariaLabel="SQF" />}
            capitalInfo={(k) => {
              const ex = explanations.capitals[k];
              return ex ? <InfoButton explanation={ex} ariaLabel={`${k} capital`} /> : null;
            }}
          />
        </div>
      </Surface>

      {/* Strategy board — full width, three roomy lanes. */}
      <StrategyBoard
        actions={actions}
        combinedUpliftPct={valuation.value_gap_pct}
        actionInfo={(rank) => {
          const ex = explanations.actions[rank];
          return ex ? <InfoButton explanation={ex} align="left" ariaLabel={`Action ${rank}`} /> : null;
        }}
      />
    </>
  );
}

// =============================================================================
// SCENARIO TAB — Simulation panel, no enclosing card.
// =============================================================================
function ScenarioTab({ data }: { data: DashboardData }) {
  const { source, simulationBaseline, valuation } = data;
  if (source !== 'submission') return <NeedsDiagnosticPanel />;
  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Scenario lab"
        title="What-if simulation"
        description="Move the three levers to see V recompute in real time. Math runs locally — no server round-trip per tick."
      />
      <SimulationPanel
        baseline={simulationBaseline}
        vCurrentEur={valuation.v_current_eur}
        vPotentialEur={valuation.v_potential_eur}
      />
    </div>
  );
}

// =============================================================================
// METHOD TAB — Compact explanation panel.
// =============================================================================
function MethodTab({ data, explanations }: { data: DashboardData; explanations: ExplanationMap }) {
  const { valuation, source, company } = data;
  return (
    <div className="space-y-4">
      <Surface tone="raised" padding="md">
        <SectionHeader
          eyebrow="How V is built"
          title="V = EBITDA × Multiple × SQF × GF"
          description="Quantitative inputs come from AIDA (or your overrides). Qualitative inputs come from 17 scored ratings plus 2 context choices. The engine compares each metric against an Italian-SME peer prior, weights the four capitals into a Composite Quality Score, clamps the result to the SQF / GF ranges, then multiplies."
        />
        {source === 'submission' && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <StatCell label="EBITDA (norm)" value={`€${formatThk(valuation.ebitda_norm_eur / 1000)}K`}
              trailing={<InfoButton explanation={explanations.ebitda} ariaLabel="EBITDA" />} />
            <StatCell label="M sector" value={`${valuation.m_sector.toFixed(1)}×`}
              sub={company.nace_code ? `NACE ${company.nace_code}` : undefined}
              trailing={<InfoButton explanation={explanations.m_sector} ariaLabel="Sector multiple" />} />
            <StatCell label="SQF" value={valuation.sqf.toFixed(2)} sub="0.6 – 1.4"
              trailing={<InfoButton explanation={explanations.sqf} ariaLabel="SQF" />} />
            <StatCell label="GF" value={valuation.gf.toFixed(2)} sub="0.7 – 1.5"
              trailing={<InfoButton explanation={explanations.gf} ariaLabel="GF" />} />
          </div>
        )}
      </Surface>

      <Surface tone="tinted" padding="md">
        <SectionHeader eyebrow="Data sources" title="What goes in" />
        <ul className="mt-3 space-y-3 text-[13px] text-text-dim">
          <li className="flex gap-3">
            <SourceBadge source="aida" />
            <div>
              <strong className="font-semibold text-text">AIDA / Bureau van Dijk.</strong>{' '}
              Revenue history, EBITDA, balance sheet, employees, R&amp;D, customer hints. Last available year, frozen at submission time.
            </div>
          </li>
          <li className="flex gap-3">
            <SourceBadge source="override" />
            <div>
              <strong className="font-semibold text-text">Your overrides.</strong>{' '}
              When you toggle the Financials step the engine prefers your numbers over AIDA. Either set is fully recorded for audit.
            </div>
          </li>
          <li className="flex gap-3">
            <SourceBadge source="computed" />
            <div>
              <strong className="font-semibold text-text">Engine output.</strong>{' '}
              Capitals, SQF, GF, V and the value gap are computed by `lib/scoring/` from the inputs above plus the qualitative answers.
            </div>
          </li>
        </ul>
      </Surface>
    </div>
  );
}

// =============================================================================
// Sub-bits
// =============================================================================
function SavedStrip({ onClose }: { onClose: () => void }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-green/30 bg-green/[0.06] px-4 py-3 text-[13px] text-green">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="font-semibold">Diagnostic saved.</div>
        <div className="text-text-dim">The cockpit below reflects the inputs you just submitted.</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="font-mono text-[10.5px] uppercase tracking-eyebrow text-green/70 hover:text-green"
      >
        Dismiss
      </button>
    </div>
  );
}

function NeedsDiagnosticPanel() {
  return (
    <Surface tone="tinted" padding="lg">
      <p className="text-[13.5px] text-text-dim">
        Run the diagnostic to fill this section. The simulation reuses the
        baseline scoring run, so it needs a real submission to play against.
      </p>
    </Surface>
  );
}

function qualityLabel(score: number): string {
  if (score >= 80) return 'Top quartile structure';
  if (score >= 65) return 'Above-average structure';
  if (score >= 50) return 'Mid-cohort structure';
  if (score >= 35) return 'Below-average structure';
  return 'Fragile structure';
}
function riskTone(r: string): 'positive' | 'warning' | 'danger' | 'default' {
  if (r === 'HIGH') return 'danger';
  if (r === 'MEDIUM') return 'warning';
  if (r === 'LOW') return 'positive';
  return 'default';
}
function riskCopy(flags: string[]): string {
  if (flags.length === 0) return 'No fragility flags raised.';
  return flags
    .map((f) => f.replaceAll('_', ' '))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' · ');
}
/** Stamp form: always the absolute date — a stamp doesn't say "2h ago". */
function formatRunStamp(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
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
