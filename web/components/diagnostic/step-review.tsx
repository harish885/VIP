'use client';

import { useFormContext } from 'react-hook-form';
import {
  deriveMetrics,
  FIELD_LABELS,
  OBJECTIVES,
  type DiagnosticInput,
} from '@/lib/diagnostic-schema';
import { formatCurrency, formatPercent } from '@/lib/format';

/**
 * Step 4 — Review
 *
 * Show every value the user has entered + the two derived metrics (CAGR,
 * EBITDA margin) the scoring engine will use. No editing here — the Back
 * button takes them to the right step.
 */
export function StepReview({ onEditStep }: { onEditStep: (step: 1 | 2 | 3) => void }) {
  const { getValues } = useFormContext<DiagnosticInput>();
  const v = getValues();
  const derived = deriveMetrics(v);
  const objectiveLabel = OBJECTIVES.find((o) => o.value === v.stated_objective)?.label ?? v.stated_objective;

  return (
    <div className="space-y-5">
      <Group title="Numbers" stepNumber={1} onEdit={() => onEditStep(1)}>
        <Row label="Revenue · 3 years ago"  value={formatCurrency(v.revenue_y_1)} />
        <Row label="Revenue · 2 years ago"  value={formatCurrency(v.revenue_y_2)} />
        <Row label="Revenue · last year"    value={formatCurrency(v.revenue_y_3)} />
        <Row label="EBITDA · last year"     value={formatCurrency(v.ebitda)} />
        <Row label="Recurring revenue"      value={formatPercent(v.recurring_revenue_pct, 1)} />
        <Row label="Top-3 concentration"    value={formatPercent(v.top3_client_concentration, 1)} />
        <Row label="Tech investment / rev." value={formatPercent(v.tech_investment_ratio_pct, 1)} />

        {/* Derived */}
        <Row
          label="Revenue CAGR · 2yr (derived)"
          value={formatPercent(derived.revenue_cagr_pct, 1)}
          derived
        />
        <Row
          label="EBITDA margin (derived)"
          value={formatPercent(derived.ebitda_margin_pct, 1)}
          derived
        />
      </Group>

      <Group title="Strategy · 1–5" stepNumber={2} onEdit={() => onEditStep(2)}>
        <Row label={FIELD_LABELS.founder_dependency}       value={`${v.founder_dependency} / 5`} />
        <Row label={FIELD_LABELS.management_structure}     value={`${v.management_structure} / 5`} />
        <Row label={FIELD_LABELS.digital_maturity}         value={`${v.digital_maturity} / 5`} />
        <Row label={FIELD_LABELS.client_portfolio_quality} value={`${v.client_portfolio_quality} / 5`} />
        <Row label={FIELD_LABELS.business_scalability}     value={`${v.business_scalability} / 5`} />
        <Row label={FIELD_LABELS.network_partnerships}     value={`${v.network_partnerships} / 5`} />
      </Group>

      <Group title="Context" stepNumber={3} onEdit={() => onEditStep(3)}>
        <Row label="Sector"             value={v.sector} />
        <Row label="Lifecycle stage"    value={v.lifecycle_stage} />
        <Row label="Distinctive assets" value={v.distinctive_assets?.trim() || '—'} />
        <Row label="Objective"          value={objectiveLabel} />
        <Row label="Time horizon"       value={v.time_horizon} />
      </Group>

      <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-5">
        <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
          Ready to submit
        </div>
        <p className="text-[13.5px] leading-relaxed text-text-dim">
          When you hit <span className="font-semibold text-text">Submit diagnostic</span>, the
          scoring engine will pick this up, run the six-stage pipeline, and produce your
          valuation, capital scores, risk index, and Top-3 actions. The dashboard refreshes
          automatically. Currently in demo mode, so you&rsquo;ll land on the seeded ACME view.
        </p>
      </div>
    </div>
  );
}

function Group({
  title,
  stepNumber,
  onEdit,
  children,
}: {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg-2/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg-2/60 font-mono text-[11px] font-bold text-text-dim">
            {stepNumber}
          </span>
          <h3 className="font-serif text-[18px] font-medium tracking-tight">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-line bg-bg-2/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-dim transition-all hover:border-gold/40 hover:text-gold"
        >
          Edit
        </button>
      </div>
      <div className="divide-y divide-line-faint">{children}</div>
    </div>
  );
}

function Row({ label, value, derived }: { label: string; value: string; derived?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-[13px]">
      <span className="text-text-dim">
        {label}
        {derived && (
          <span className="ml-2 inline-block rounded-md bg-cyan/[0.12] px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-eyebrow text-cyan">
            derived
          </span>
        )}
      </span>
      <span className="font-mono font-semibold text-text">{value}</span>
    </div>
  );
}
