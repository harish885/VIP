'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  useForm,
  FormProvider,
  Controller,
  useFormContext,
  useWatch,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  EyeOff,
  RotateCcw,
  Calculator,
  Database,
} from 'lucide-react';
import {
  DiagnosticSchema,
  EMPTY_DIAGNOSTIC,
  EXAMPLE_DIAGNOSTIC,
  QUESTIONS,
  QUESTIONS_BY_SECTION,
  TIME_HORIZONS,
  STATED_OBJECTIVES,
  OBJECTIVE_LABELS,
  type DiagnosticInput,
  type QuestionKey,
  type QuestionSection,
} from '@/lib/diagnostic-schema';
import { RatingDots } from '@/components/diagnostic/rating-dots';
import { submitCompanyDiagnosticAction } from '@/app/(app)/companies/[taxCode]/diagnostic/actions';
import type { AidaSnapshot } from '@/lib/aida';
import { cn } from '@/lib/cn';

// =============================================================================
// Stepper definition — adds a "Financials" step before the qualitative ones
// =============================================================================
type StepKey =
  | 'financials'
  | QuestionSection;

const STEPS: Array<{ key: StepKey; label: string; eyebrow: string }> = [
  { key: 'financials',                          label: 'Financials',  eyebrow: 'Step 01' },
  { key: 'Technological Capital',               label: 'Technology',  eyebrow: 'Step 02' },
  { key: 'Human & Organisational Capital',      label: 'Team',        eyebrow: 'Step 03' },
  { key: 'Relational Capital',                  label: 'Relations',   eyebrow: 'Step 04' },
  { key: 'Growth Quality & Context',            label: 'Growth',      eyebrow: 'Step 05' },
  { key: 'Contextual Inputs',                   label: 'Context',     eyebrow: 'Step 06' },
];

export interface DiagnosticV2FormProps {
  taxCode: string;
  companyName: string;
  snapshot: AidaSnapshot;
}

/**
 * Diagnostic form — guided stepper.
 *
 *   Step 1 — Financials. AIDA values shown as reference; the entrepreneur
 *   may enable overrides and key in their own numbers.
 *
 *   Steps 2-6 — 19 scored 1-5 Likert questions plus the 2 classificatory
 *   enums (objective, time horizon). Any question can be marked "not
 *   relevant" and is then excluded from scoring weights.
 */
export function DiagnosticV2Form({ taxCode, companyName, snapshot }: DiagnosticV2FormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const form = useForm<DiagnosticInput>({
    resolver: zodResolver(DiagnosticSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_DIAGNOSTIC as DiagnosticInput,
  });

  const totalSteps = STEPS.length;
  const isLast = stepIndex === totalSteps - 1;
  const step = STEPS[stepIndex]!;

  // Fields validated when "Continue" is pressed on the current step.
  const fieldsForStep = useMemo<Array<keyof DiagnosticInput>>(() => {
    if (step.key === 'financials') return ['overrides'];
    const base: Array<keyof DiagnosticInput> = [...QUESTIONS_BY_SECTION[step.key]];
    if (step.key === 'Contextual Inputs') base.push('stated_objective', 'time_horizon');
    return base;
  }, [step.key]);

  function fillExample() {
    Object.entries(EXAMPLE_DIAGNOSTIC).forEach(([k, v]) => {
      form.setValue(k as keyof DiagnosticInput, v as DiagnosticInput[keyof DiagnosticInput], {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  }

  async function handleContinue() {
    const ok = await form.trigger(fieldsForStep);
    if (!ok) return;
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
    scrollTop();
  }

  function handleBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
    scrollTop();
  }

  function scrollTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function onSubmit(values: DiagnosticInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await submitCompanyDiagnosticAction(taxCode, values);
        if (result && !result.ok) setServerError(result.error);
      } catch (e) {
        const msg = (e as Error).message ?? 'Unknown error';
        if (msg.includes('NEXT_REDIRECT')) throw e;
        setServerError(msg);
      }
    });
  }

  function onInvalid(errors: FieldErrors<DiagnosticInput>) {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    // overrides errors → financials step.
    if (errorKeys.includes('overrides')) {
      setStepIndex(0);
      scrollTop();
      return;
    }
    // First step (financials) is offset 0; section steps start at 1.
    for (let i = 1; i < STEPS.length; i += 1) {
      const stepDef = STEPS[i]!;
      if (stepDef.key === 'financials') continue;
      const inSection = QUESTIONS_BY_SECTION[stepDef.key];
      const includesContext =
        stepDef.key === 'Contextual Inputs' &&
        (errorKeys.includes('stated_objective') || errorKeys.includes('time_horizon'));
      if (inSection.some((k) => errorKeys.includes(k)) || includesContext) {
        setStepIndex(i);
        scrollTop();
        return;
      }
    }
  }

  return (
    <FormProvider {...form}>
      <div ref={containerRef} className="mx-auto max-w-[820px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-4">
          <Link
            href={`/companies/${encodeURIComponent(taxCode)}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
          >
            <ArrowLeft size={13} /> Back to company
          </Link>
        </div>

        <header className="mb-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
            Diagnostic · {companyName}
          </div>
          <h1 className="mt-2 font-serif text-[26px] font-medium leading-[1.1] tracking-tight text-text sm:text-[30px]">
            A few honest questions about how the company really runs.
          </h1>
          <p className="mt-2 max-w-[640px] text-[13.5px] leading-relaxed text-text-dim">
            Step 1 lets you keep AIDA&apos;s financials or override them with your
            own. Steps 2–6 are 19 short qualitative ratings. Mark any question
            as <em className="not-italic font-medium text-text">not relevant</em>
            {' '}and it will be dropped from the weighted scoring.
          </p>
          <button
            type="button"
            onClick={fillExample}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-amber/30 bg-amber/[0.08] px-3 py-1.5 text-[12px] font-medium text-amber transition-colors hover:bg-amber/[0.18]"
          >
            <Sparkles size={12} /> Try with example answers
          </button>
        </header>

        <ProgressBar stepIndex={stepIndex} totalSteps={totalSteps} />

        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="mt-6 rounded-2xl border border-line bg-bg-1 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7"
        >
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
                {step.eyebrow} of {totalSteps}
              </div>
              <h2 className="mt-1 font-serif text-[22px] font-medium tracking-tight text-text">
                {step.label}
              </h2>
            </div>
          </div>

          {step.key === 'financials' ? (
            <FinancialsStep snapshot={snapshot} />
          ) : (
            <div className="space-y-3">
              {QUESTIONS_BY_SECTION[step.key].map((qKey) => (
                <RatingRow key={qKey} qKey={qKey} />
              ))}
              {step.key === 'Contextual Inputs' && <ClassificatoryRow />}
            </div>
          )}

          {serverError && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-red/30 bg-red/[0.08] px-4 py-3 text-[13px] text-red">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">We couldn&apos;t save the diagnostic.</div>
                <div className="mt-1 text-text-dim">{serverError}</div>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0 || pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-1 px-3.5 py-2 text-[12.5px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text disabled:opacity-40"
            >
              <ArrowLeft size={13} /> Back
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-text-faint">
                {stepIndex + 1} / {totalSteps}
              </span>
              {!isLast ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 bg-cyan/[0.10] px-4 py-2 text-[12.5px] font-semibold text-cyan transition-colors hover:bg-cyan/[0.18]"
                >
                  Continue <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gold/50 bg-gold/[0.18] px-4 py-2 text-[12.5px] font-semibold text-gold transition-colors hover:bg-gold/[0.28] disabled:opacity-60"
                >
                  {pending ? 'Scoring…' : 'Submit & see results'}
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// =============================================================================
// Progress bar
// =============================================================================
function ProgressBar({ stepIndex, totalSteps }: { stepIndex: number; totalSteps: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-mono font-semibold transition-colors',
                    done && 'border-gold bg-gold text-bg-1',
                    active && !done && 'border-gold text-gold',
                    !done && !active && 'border-line text-text-faint',
                  )}
                >
                  {done ? <Check size={12} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-[12px] font-medium md:inline',
                    active ? 'text-text' : 'text-text-faint',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < totalSteps - 1 && (
                <span
                  className={cn(
                    'mx-1.5 h-px flex-1 transition-colors md:mx-3',
                    i < stepIndex ? 'bg-gold' : 'bg-line',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Financials step — toggle + 7 numeric inputs
// =============================================================================
function FinancialsStep({ snapshot }: { snapshot: AidaSnapshot }) {
  const { control, formState, setValue } = useFormContext<DiagnosticInput>();
  const enabled = useWatch({ control, name: 'overrides.enabled' }) ?? false;

  // Defaults — AIDA values shown as the reference baseline.
  const aidaRevLast = thkToEur(snapshot.revenue_last_thk ?? snapshot.revenue_2024_thk);
  const aidaRev2024 = thkToEur(snapshot.revenue_2024_thk);
  const aidaRev2023 = thkToEur(snapshot.revenue_2023_thk);
  const aidaRev2022 = thkToEur(snapshot.revenue_2022_thk);
  const aidaEbitda = thkToEur(snapshot.ebitda_last_thk ?? snapshot.ebitda_2024_thk);
  const aidaRdRatio = snapshot.rd_expense_thk != null && aidaRevLast > 0
    ? round1((snapshot.rd_expense_thk * 1000 / aidaRevLast) * 100)
    : null;

  function fillAidaDefaults() {
    setValue('overrides.revenue_y_3', aidaRevLast || undefined, { shouldDirty: true });
    setValue('overrides.revenue_y_2', aidaRev2023 || aidaRev2024 || undefined, { shouldDirty: true });
    setValue('overrides.revenue_y_1', aidaRev2022 || aidaRev2023 || undefined, { shouldDirty: true });
    setValue('overrides.ebitda', aidaEbitda || undefined, { shouldDirty: true });
    setValue('overrides.tech_investment_ratio_pct', aidaRdRatio ?? undefined, { shouldDirty: true });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-bg-2/40 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple/[0.12] text-purple">
            <Database size={14} />
          </span>
          <div className="flex-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
              AIDA factsheet for {snapshot.company_name}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] sm:grid-cols-4">
              <Factoid label="Revenue (last)" value={fmtMoney(aidaRevLast)} />
              <Factoid label="EBITDA" value={fmtMoney(aidaEbitda)} />
              <Factoid label="Margin" value={snapshot.ebitda_margin_pct != null ? `${snapshot.ebitda_margin_pct.toFixed(1)}%` : '—'} />
              <Factoid label="R&D / revenue" value={aidaRdRatio != null ? `${aidaRdRatio.toFixed(1)}%` : '—'} />
            </div>
          </div>
        </div>
      </div>

      <Controller
        control={control}
        name="overrides.enabled"
        render={({ field }) => (
          <div
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
              field.value
                ? 'border-gold/40 bg-gold/[0.06]'
                : 'border-line bg-bg-2/30',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                  field.value ? 'bg-gold/15 text-gold' : 'bg-bg-1 text-text-faint',
                )}
              >
                <Calculator size={14} />
              </span>
              <div>
                <div className="text-[14px] font-semibold text-text">
                  Override AIDA financials with your own numbers
                </div>
                <p className="mt-0.5 max-w-[440px] text-[12.5px] text-text-dim">
                  AIDA is frozen at the last reported year. Toggle this on if
                  your current numbers differ — they take priority in the
                  valuation. Anything left blank still falls back to AIDA.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {field.value && (
                <button
                  type="button"
                  onClick={fillAidaDefaults}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-1 px-2.5 py-1.5 text-[11.5px] font-medium text-text-dim transition-colors hover:border-line-2 hover:text-text"
                >
                  Pre-fill from AIDA
                </button>
              )}
              <Toggle
                checked={Boolean(field.value)}
                onChange={(v) => field.onChange(v)}
              />
            </div>
          </div>
        )}
      />

      {enabled && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            name="overrides.revenue_y_3"
            label="Revenue · last year (€)"
            hint={`AIDA: ${fmtMoney(aidaRevLast)}`}
            placeholder={String(aidaRevLast || '')}
          />
          <NumberField
            name="overrides.revenue_y_2"
            label="Revenue · year before (€)"
            hint={`AIDA: ${fmtMoney(aidaRev2023 || aidaRev2024)}`}
            placeholder={String(aidaRev2023 || aidaRev2024 || '')}
          />
          <NumberField
            name="overrides.revenue_y_1"
            label="Revenue · 2 years before (€)"
            hint={`AIDA: ${fmtMoney(aidaRev2022 || aidaRev2023)}`}
            placeholder={String(aidaRev2022 || aidaRev2023 || '')}
          />
          <NumberField
            name="overrides.ebitda"
            label="EBITDA · last year (€)"
            hint={`AIDA: ${fmtMoney(aidaEbitda)}`}
            placeholder={String(aidaEbitda || '')}
            allowNegative
          />
          <NumberField
            name="overrides.recurring_revenue_pct"
            label="Recurring revenue share (%)"
            hint="0 – 100. Falls back to Q9 + Q13 proxy when blank."
            placeholder="e.g. 35"
            max={100}
          />
          <NumberField
            name="overrides.top3_client_concentration"
            label="Top-3 client concentration (%)"
            hint="0 – 100. Falls back to Q9 proxy when blank."
            placeholder="e.g. 45"
            max={100}
          />
          <NumberField
            name="overrides.tech_investment_ratio_pct"
            label="R&D / revenue (%)"
            hint={aidaRdRatio != null ? `AIDA: ${aidaRdRatio.toFixed(1)}%` : 'AIDA: not reported'}
            placeholder="e.g. 2.5"
            max={100}
          />
        </div>
      )}

      {formState.errors.overrides && (
        <div className="text-[12px] text-red">
          {(formState.errors.overrides as { message?: string } | undefined)?.message ??
            'Check the override values — only numbers are accepted.'}
        </div>
      )}

      {!enabled && (
        <p className="rounded-md border border-dashed border-line bg-bg-2/30 px-4 py-3 text-[12.5px] text-text-dim">
          <strong className="font-semibold text-text">Using AIDA values.</strong>{' '}
          Continue to the qualitative questions — the model will use the AIDA snapshot above for every financial metric.
        </p>
      )}
    </div>
  );
}

function Factoid({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] font-semibold uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] font-semibold text-text">{value}</div>
    </div>
  );
}

function NumberField({
  name,
  label,
  hint,
  placeholder,
  max,
  allowNegative,
}: {
  name: 'overrides.revenue_y_1' | 'overrides.revenue_y_2' | 'overrides.revenue_y_3' | 'overrides.ebitda' | 'overrides.recurring_revenue_pct' | 'overrides.top3_client_concentration' | 'overrides.tech_investment_ratio_pct';
  label: string;
  hint: string;
  placeholder?: string;
  max?: number;
  allowNegative?: boolean;
}) {
  const { register, formState } = useFormContext<DiagnosticInput>();
  // Lookup nested error via dotted name path.
  const fieldError = (formState.errors.overrides as Record<string, { message?: string } | undefined> | undefined)?.[
    name.replace('overrides.', '')
  ];

  return (
    <label className="block">
      <span className="block text-[11.5px] font-semibold text-text-dim">{label}</span>
      <input
        type="number"
        step="any"
        min={allowNegative ? undefined : 0}
        max={max}
        placeholder={placeholder}
        {...register(name, {
          setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
        })}
        className="mt-1 w-full rounded-md border border-line bg-bg-1 px-3 py-2 text-[13px] text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
      />
      <span className="mt-1 block text-[11px] text-text-faint">{hint}</span>
      {fieldError && (
        <span className="mt-1 block text-[11px] text-red">{fieldError.message}</span>
      )}
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
        checked ? 'border-gold/60 bg-gold/30' : 'border-line bg-bg-2',
      )}
    >
      <span
        className={cn(
          'inline-block h-[18px] w-[18px] transform rounded-full transition-transform',
          checked ? 'translate-x-[22px] bg-gold' : 'translate-x-[2px] bg-text-faint/60',
        )}
      />
    </button>
  );
}

// =============================================================================
// Rating row (one scored question + "Not relevant" toggle)
// =============================================================================
function RatingRow({ qKey }: { qKey: QuestionKey }) {
  const q = QUESTIONS[qKey];
  const { control, formState, setValue } = useFormContext<DiagnosticInput>();
  const v = useWatch({ control, name: qKey }) as number | null | undefined;
  const excluded = (useWatch({ control, name: 'excluded_questions' }) ?? []) as string[];
  const isExcluded = excluded.includes(qKey);
  const optionLabel = typeof v === 'number' ? q.options[v - 1] : null;
  const error = formState.errors[qKey]?.message;

  function toggleExcluded() {
    if (isExcluded) {
      setValue('excluded_questions', excluded.filter((k) => k !== qKey), {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue('excluded_questions', [...excluded, qKey], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue(qKey, null, { shouldDirty: true, shouldValidate: true });
    }
  }

  return (
    <div
      data-field={qKey}
      className={cn(
        'grid grid-cols-1 gap-3 rounded-xl border p-4 transition-colors md:grid-cols-[1fr_auto]',
        isExcluded
          ? 'border-line bg-bg-2/20 opacity-70'
          : error
          ? 'border-red/40 bg-bg-2/40'
          : 'border-line bg-bg-2/40',
      )}
    >
      <div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
            {q.n}
          </span>
          <span className="text-[15px] font-medium text-text">{q.title}</span>
          {isExcluded && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-text-faint/15 px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-eyebrow text-text-faint">
              <EyeOff size={9} /> Excluded
            </span>
          )}
        </div>
        <div className="mt-1 max-w-[480px] text-[12.5px] text-text-dim">{q.hint}</div>
        {!isExcluded && (
          <div
            className={cn(
              'mt-2 text-[12px]',
              optionLabel ? 'text-text-dim' : 'text-text-faint',
            )}
          >
            {optionLabel ? (
              <>
                <span className="font-mono text-amber">{v}</span> · {optionLabel}
              </>
            ) : (
              'Tap 1–5 to answer'
            )}
          </div>
        )}
        {error && !isExcluded && (
          <div className="mt-1 text-[12px] text-red">{String(error)}</div>
        )}
        <button
          type="button"
          onClick={toggleExcluded}
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-eyebrow transition-colors',
            isExcluded
              ? 'border-cyan/40 bg-cyan/[0.08] text-cyan hover:bg-cyan/[0.16]'
              : 'border-line bg-bg-1 text-text-faint hover:border-line-2 hover:text-text-dim',
          )}
        >
          {isExcluded ? (
            <>
              <RotateCcw size={10} /> Answer this question after all
            </>
          ) : (
            <>
              <EyeOff size={10} /> Not relevant for this company
            </>
          )}
        </button>
      </div>
      {!isExcluded && (
        <Controller
          control={control}
          name={qKey}
          render={({ field }) => (
            <RatingDots
              value={typeof field.value === 'number' ? field.value : 0}
              onChange={field.onChange}
              lowLabel="1"
              highLabel="5"
            />
          )}
        />
      )}
    </div>
  );
}

// =============================================================================
// Classificatory row (stated_objective + time_horizon)
// =============================================================================
function ClassificatoryRow() {
  const { control, formState } = useFormContext<DiagnosticInput>();
  return (
    <div
      data-field="stated_objective"
      className="rounded-xl border border-line bg-bg-2/40 p-4"
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
        Q15 · Q16 · Direction & timing
      </div>
      <p className="mt-1 text-[12.5px] text-text-dim">
        Tells the model which actions to prioritise.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11.5px] font-semibold text-text-dim">
            Primary objective (next 24–36 months)
          </label>
          <Controller
            control={control}
            name="stated_objective"
            render={({ field }) => (
              <select
                {...field}
                className="w-full rounded-md border border-line bg-bg-1 px-3 py-2.5 text-[13px] text-text focus:border-cyan/40 focus:outline-none focus:ring-1 focus:ring-cyan/30"
              >
                {STATED_OBJECTIVES.map((o) => (
                  <option key={o} value={o}>{OBJECTIVE_LABELS[o]}</option>
                ))}
              </select>
            )}
          />
          {formState.errors.stated_objective && (
            <div className="mt-1 text-[12px] text-red">
              {String(formState.errors.stated_objective?.message)}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[11.5px] font-semibold text-text-dim">
            Time horizon
          </label>
          <Controller
            control={control}
            name="time_horizon"
            render={({ field }) => (
              <div className="flex gap-2">
                {TIME_HORIZONS.map((h) => {
                  const active = field.value === h;
                  const label =
                    h === '12m' ? '< 12 m' : h === '24m' ? '12–24 m' : h === '36m' ? '24–36 m' : '> 36 m';
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => field.onChange(h)}
                      className={cn(
                        'flex-1 rounded-md border px-2 py-2 text-[12px] font-medium transition-colors',
                        active
                          ? 'border-cyan/50 bg-cyan/[0.10] text-cyan'
                          : 'border-line bg-bg-1 text-text-dim hover:border-line-2',
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {formState.errors.time_horizon && (
            <div className="mt-1 text-[12px] text-red">
              {String(formState.errors.time_horizon?.message)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================
function thkToEur(n: number | null | undefined): number {
  if (n == null) return 0;
  return Math.round(n * 1000);
}

function fmtMoney(eur: number): string {
  if (!eur) return '—';
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(2)}M`;
  if (eur >= 1_000) return `€${(eur / 1_000).toFixed(0)}K`;
  return `€${eur}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
