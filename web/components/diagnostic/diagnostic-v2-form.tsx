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
  ListChecks,
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
  SCORED_QUESTION_KEYS,
  type DiagnosticInput,
  type QuestionKey,
  type QuestionSection,
} from '@/lib/diagnostic-schema';
import { RatingDots } from '@/components/diagnostic/rating-dots';
import { submitCompanyDiagnosticAction } from '@/app/(app)/companies/[taxCode]/diagnostic/actions';
import type { AidaSnapshot } from '@/lib/aida';
import { Surface } from '@/components/vip-ui/surface';
import { Button } from '@/components/vip-ui/button';
import { StatusBadge } from '@/components/vip-ui/status-badge';
import { SourceBadge } from '@/components/vip-ui/source-badge';
import { cn } from '@/lib/cn';

// =============================================================================
// Steps — Financials + 5 question sections + Review
// =============================================================================
type StepKey =
  | 'financials'
  | QuestionSection
  | 'review';

const STEPS: Array<{ key: StepKey; label: string; eyebrow: string }> = [
  { key: 'financials',                          label: 'Financials',  eyebrow: 'Step 01' },
  { key: 'Technological Capital',               label: 'Technology',  eyebrow: 'Step 02' },
  { key: 'Human & Organisational Capital',      label: 'Team',        eyebrow: 'Step 03' },
  { key: 'Relational Capital',                  label: 'Relations',   eyebrow: 'Step 04' },
  { key: 'Growth Quality & Context',            label: 'Growth',      eyebrow: 'Step 05' },
  { key: 'Contextual Inputs',                   label: 'Context',     eyebrow: 'Step 06' },
  { key: 'review',                              label: 'Review',      eyebrow: 'Step 07' },
];

export interface DiagnosticV2FormProps {
  taxCode: string;
  companyName: string;
  snapshot: AidaSnapshot;
}

/**
 * DiagnosticV2Form — the guided interview.
 *
 *   Step 1 (Financials)  — AIDA vs your overrides, side-by-side, with
 *                          a per-field SourceBadge so you always see
 *                          what the engine will consume.
 *   Steps 2-6            — one question = one focus card. Big number
 *                          selector, hint line, current option meaning,
 *                          and a "Not relevant" toggle for skipping
 *                          irrelevant questions.
 *   Step 7 (Review)      — answered, excluded, override summary +
 *                          submit CTA.
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

  const fieldsForStep = useMemo<Array<keyof DiagnosticInput>>(() => {
    if (step.key === 'financials' || step.key === 'review') return ['overrides'];
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
    if (errorKeys.includes('overrides')) {
      setStepIndex(0);
      scrollTop();
      return;
    }
    for (let i = 1; i < STEPS.length; i += 1) {
      const stepDef = STEPS[i]!;
      if (stepDef.key === 'financials' || stepDef.key === 'review') continue;
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
      <div ref={containerRef} className="mx-auto max-w-[860px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-4">
          <Link
            href={`/companies/${encodeURIComponent(taxCode)}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
          >
            <ArrowLeft size={13} /> Back to company
          </Link>
        </div>

        <header className="mb-6">
          <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
            Diagnostic interview · {companyName}
          </div>
          <h1 className="mt-2 font-serif text-[26px] font-medium leading-[1.1] tracking-tight text-text sm:text-[30px]">
            Five honest minutes to see what this company is worth.
          </h1>
          <p className="mt-2 max-w-[640px] text-[13.5px] leading-relaxed text-text-dim">
            Step 1 lets you keep AIDA&rsquo;s financials or replace them with your
            own current numbers. Steps 2–6 are 19 short qualitative ratings —
            mark any of them as <em className="not-italic font-medium text-text">not relevant</em>
            {' '}and they drop out of the score. Step 7 reviews what we&rsquo;re about
            to submit.
          </p>
          <button
            type="button"
            onClick={fillExample}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-amber/30 bg-amber/[0.08] px-3 py-1.5 text-[12px] font-medium text-amber transition-colors hover:bg-amber/[0.18]"
          >
            <Sparkles size={12} /> Try with example answers
          </button>
        </header>

        <ProgressRail stepIndex={stepIndex} />

        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="mt-6"
        >
          <Surface tone="raised" padding="lg" className="space-y-6">
            <div className="flex items-baseline justify-between">
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
            ) : step.key === 'review' ? (
              <ReviewStep snapshot={snapshot} onJump={(i) => { setStepIndex(i); scrollTop(); }} />
            ) : (
              <div className="space-y-4">
                {QUESTIONS_BY_SECTION[step.key].map((qKey) => (
                  <QuestionFocus key={qKey} qKey={qKey} />
                ))}
                {step.key === 'Contextual Inputs' && <ClassificatoryRow />}
              </div>
            )}

            {serverError && (
              <div className="flex items-start gap-3 rounded-lg border border-red/30 bg-red/[0.08] px-4 py-3 text-[13px] text-red">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">We couldn&rsquo;t save the diagnostic.</div>
                  <div className="mt-1 text-text-dim">{serverError}</div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button
                tone="subtle"
                size="md"
                icon={<ArrowLeft size={13} />}
                onClick={handleBack}
                disabled={stepIndex === 0 || pending}
              >
                Back
              </Button>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-text-faint">
                  {stepIndex + 1} / {totalSteps}
                </span>
                {!isLast ? (
                  <Button
                    tone="primary"
                    size="md"
                    iconRight={<ArrowRight size={13} />}
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    tone="primary"
                    size="md"
                    type="submit"
                    disabled={pending}
                    iconRight={<ChevronRight size={13} />}
                  >
                    {pending ? 'Scoring…' : 'Submit & see results'}
                  </Button>
                )}
              </div>
            </div>
          </Surface>
        </form>
      </div>
    </FormProvider>
  );
}

// =============================================================================
// Progress rail — slim, dot-per-step, label on active only.
// =============================================================================
function ProgressRail({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-full border border-line bg-bg-2/50 p-1.5">
      {STEPS.map((s, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div
            key={s.key}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px] transition-colors',
              active
                ? 'bg-bg-1 text-text shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                : done
                  ? 'text-gold'
                  : 'text-text-faint',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] font-bold',
                done && 'border-gold bg-gold text-bg-1',
                active && !done && 'border-gold text-gold',
                !done && !active && 'border-line',
              )}
            >
              {done ? <Check size={11} /> : i + 1}
            </span>
            <span className={cn(active ? 'inline font-semibold' : 'hidden sm:inline')}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Financials step — AIDA vs override side-by-side
// =============================================================================
function FinancialsStep({ snapshot }: { snapshot: AidaSnapshot }) {
  const { control, setValue } = useFormContext<DiagnosticInput>();
  const enabled = useWatch({ control, name: 'overrides.enabled' }) ?? false;

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
      <Surface tone="tinted" padding="md">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan/[0.12] text-cyan">
            <Database size={14} />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
              <span>AIDA factsheet · {snapshot.company_name}</span>
              <SourceBadge source="aida" />
            </div>
            <p className="mt-1 max-w-[480px] text-[12.5px] text-text-dim">
              Pulled from Bureau van Dijk at submission time. The engine uses
              these values unless you toggle the override below.
            </p>
          </div>
        </div>
      </Surface>

      <Controller
        control={control}
        name="overrides.enabled"
        render={({ field }) => (
          <Surface
            tone={field.value ? 'raised' : 'tinted'}
            padding="md"
            className={cn(
              field.value
                ? 'border-gold/40 bg-gold/[0.05]'
                : 'border-line',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
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
                    AIDA is frozen at the last reported year. Toggle on if your
                    current numbers differ — they take priority. Any field left
                    blank still falls back to AIDA.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {field.value && (
                  <Button tone="subtle" size="sm" onClick={fillAidaDefaults}>
                    Pre-fill from AIDA
                  </Button>
                )}
                <Toggle checked={Boolean(field.value)} onChange={(v) => field.onChange(v)} />
              </div>
            </div>
          </Surface>
        )}
      />

      {enabled && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SideBySideField
            label="Revenue · last year"
            name="overrides.revenue_y_3"
            aidaValue={fmtMoney(aidaRevLast)}
            unit="€"
            placeholder={aidaRevLast ? String(aidaRevLast) : ''}
          />
          <SideBySideField
            label="Revenue · year before"
            name="overrides.revenue_y_2"
            aidaValue={fmtMoney(aidaRev2023 || aidaRev2024)}
            unit="€"
            placeholder={(aidaRev2023 || aidaRev2024) ? String(aidaRev2023 || aidaRev2024) : ''}
          />
          <SideBySideField
            label="Revenue · 2 years before"
            name="overrides.revenue_y_1"
            aidaValue={fmtMoney(aidaRev2022 || aidaRev2023)}
            unit="€"
            placeholder={(aidaRev2022 || aidaRev2023) ? String(aidaRev2022 || aidaRev2023) : ''}
          />
          <SideBySideField
            label="EBITDA · last year"
            name="overrides.ebitda"
            aidaValue={fmtMoney(aidaEbitda)}
            unit="€"
            placeholder={aidaEbitda ? String(aidaEbitda) : ''}
            allowNegative
          />
          <SideBySideField
            label="Recurring revenue share"
            name="overrides.recurring_revenue_pct"
            aidaValue="—"
            unit="%"
            placeholder="e.g. 35"
            max={100}
            note="AIDA does not carry this — proxied from Q9 + Q13 unless overridden."
          />
          <SideBySideField
            label="Top-3 client concentration"
            name="overrides.top3_client_concentration"
            aidaValue="—"
            unit="%"
            placeholder="e.g. 45"
            max={100}
            note="AIDA does not carry this — proxied from Q9 unless overridden."
          />
          <SideBySideField
            label="R&D / revenue"
            name="overrides.tech_investment_ratio_pct"
            aidaValue={aidaRdRatio != null ? `${aidaRdRatio.toFixed(1)}%` : '—'}
            unit="%"
            placeholder="e.g. 2.5"
            max={100}
          />
        </div>
      )}

      {!enabled && (
        <div className="rounded-md border border-dashed border-line bg-bg-2/30 px-4 py-3 text-[12.5px] text-text-dim">
          <strong className="font-semibold text-text">Using AIDA values.</strong>{' '}
          The engine will read every quantitative metric from the snapshot above.
          You can come back to this step at any time.
        </div>
      )}
    </div>
  );
}

function SideBySideField({
  label,
  name,
  aidaValue,
  unit,
  placeholder,
  max,
  allowNegative,
  note,
}: {
  label: string;
  name:
    | 'overrides.revenue_y_1'
    | 'overrides.revenue_y_2'
    | 'overrides.revenue_y_3'
    | 'overrides.ebitda'
    | 'overrides.recurring_revenue_pct'
    | 'overrides.top3_client_concentration'
    | 'overrides.tech_investment_ratio_pct';
  aidaValue: string;
  unit: string;
  placeholder?: string;
  max?: number;
  allowNegative?: boolean;
  note?: string;
}) {
  const { register, control, formState } = useFormContext<DiagnosticInput>();
  const value = useWatch({ control, name }) as number | undefined | null;
  const fieldKey = name.replace('overrides.', '');
  const fieldError = (
    formState.errors.overrides as Record<string, { message?: string } | undefined> | undefined
  )?.[fieldKey];
  const willUseOverride = typeof value === 'number' && !Number.isNaN(value);
  return (
    <label className="block rounded-xl border border-line bg-bg-1 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold text-text">{label}</span>
        <SourceBadge source={willUseOverride ? 'override' : 'aida'} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-bg-2/40 px-2.5 py-1.5">
          <div className="font-mono text-[9.5px] font-semibold uppercase tracking-eyebrow text-text-faint">
            AIDA
          </div>
          <div className="mt-0.5 truncate font-mono text-[12.5px] font-semibold text-text">
            {aidaValue}
          </div>
        </div>
        <div className={cn(
          'rounded-md border bg-bg-1 px-2 py-1',
          willUseOverride ? 'border-gold/45' : 'border-line',
        )}>
          <div className="font-mono text-[9.5px] font-semibold uppercase tracking-eyebrow text-text-faint">
            Your number ({unit})
          </div>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min={allowNegative ? undefined : 0}
            max={max}
            placeholder={placeholder}
            {...register(name, {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
            className="mt-0.5 w-full bg-transparent text-[13px] font-semibold text-text placeholder:text-text-faint focus:outline-none"
          />
        </div>
      </div>
      {note && <p className="mt-1.5 text-[11px] text-text-faint">{note}</p>}
      {fieldError && (
        <p className="mt-1 text-[11px] text-red">{fieldError.message}</p>
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
// Question focus card — one question rendered large, with options visible.
// =============================================================================
function QuestionFocus({ qKey }: { qKey: QuestionKey }) {
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
        'rounded-xl border p-4 transition-colors sm:p-5',
        isExcluded
          ? 'border-line bg-bg-2/30 opacity-80'
          : error
            ? 'border-red/40 bg-red/[0.03]'
            : 'border-line bg-bg-1 hover:border-line-2',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
              {q.n}
            </span>
            <span className="text-[15.5px] font-semibold leading-snug text-text">
              {q.title}
            </span>
            {isExcluded && (
              <StatusBadge tone="neutral" icon={<EyeOff size={9} />}>Excluded</StatusBadge>
            )}
          </div>
          <p className="mt-1 max-w-[560px] text-[12.5px] leading-snug text-text-dim">
            {q.hint}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleExcluded}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-eyebrow transition-colors',
            isExcluded
              ? 'border-cyan/40 bg-cyan/[0.08] text-cyan hover:bg-cyan/[0.16]'
              : 'border-line bg-bg-1 text-text-faint hover:border-line-2 hover:text-text-dim',
          )}
        >
          {isExcluded ? (
            <>
              <RotateCcw size={10} /> Answer anyway
            </>
          ) : (
            <>
              <EyeOff size={10} /> Not relevant
            </>
          )}
        </button>
      </div>

      {!isExcluded && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className={cn(
            'min-h-[24px] text-[12.5px]',
            optionLabel ? 'text-text-dim' : 'text-text-faint',
          )}>
            {optionLabel ? (
              <>
                <span className="font-mono font-semibold text-amber">{v}</span>{' '}· {optionLabel}
              </>
            ) : (
              'Tap 1–5 to answer'
            )}
          </div>
          <Controller
            control={control}
            name={qKey}
            render={({ field }) => (
              <RatingDots
                value={typeof field.value === 'number' ? field.value : 0}
                onChange={field.onChange}
                lowLabel="1 · low"
                highLabel="5 · high"
              />
            )}
          />
        </div>
      )}

      {error && !isExcluded && (
        <div className="mt-3 text-[12px] text-red">{String(error)}</div>
      )}
    </div>
  );
}

// =============================================================================
// Classificatory row — objective + horizon (Step Context)
// =============================================================================
function ClassificatoryRow() {
  const { control, formState } = useFormContext<DiagnosticInput>();
  return (
    <div
      data-field="stated_objective"
      className="rounded-xl border border-line bg-bg-1 p-4 sm:p-5"
    >
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
          Q15 · Q16
        </span>
        <span className="text-[15.5px] font-semibold text-text">Direction &amp; timing</span>
      </div>
      <p className="mt-1 text-[12.5px] text-text-dim">
        Tells the recommendation engine which actions to prioritise.
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
              <div className="grid grid-cols-4 gap-2">
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
                        'rounded-md border px-2 py-2 text-[12px] font-medium transition-colors',
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
// Review step — answered / excluded summary + financial summary + submit
// =============================================================================
function ReviewStep({
  snapshot,
  onJump,
}: {
  snapshot: AidaSnapshot;
  onJump: (stepIndex: number) => void;
}) {
  const { control } = useFormContext<DiagnosticInput>();
  const values = useWatch({ control });
  const excluded = new Set(values.excluded_questions ?? []);
  const overrides = values.overrides ?? { enabled: false };

  const answered = SCORED_QUESTION_KEYS.filter(
    (k) => !excluded.has(k) && typeof values[k] === 'number',
  );
  const skipped = SCORED_QUESTION_KEYS.filter(
    (k) => !excluded.has(k) && (values[k] == null || Number.isNaN(values[k] as number)),
  );

  const overrideFields = [
    ['Revenue · last year',         'revenue_y_3',                  '€'],
    ['Revenue · year before',       'revenue_y_2',                  '€'],
    ['Revenue · 2 years before',    'revenue_y_1',                  '€'],
    ['EBITDA',                      'ebitda',                       '€'],
    ['Recurring revenue %',         'recurring_revenue_pct',        '%'],
    ['Top-3 concentration %',       'top3_client_concentration',    '%'],
    ['R&D / revenue %',             'tech_investment_ratio_pct',    '%'],
  ] as const;

  const overrideActive = overrideFields
    .filter(([, key]) => overrides.enabled && typeof (overrides as Record<string, unknown>)[key] === 'number');

  return (
    <div className="space-y-5">
      <Surface tone="tinted" padding="md">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple/[0.12] text-purple">
            <ListChecks size={14} />
          </span>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
              About to submit · {snapshot.company_name}
            </div>
            <p className="mt-1 max-w-[520px] text-[12.5px] text-text-dim">
              The engine will use what you see below. Jump back to any step to
              change something, or hit the submit button at the bottom.
            </p>
          </div>
        </div>
      </Surface>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReviewStat label="Answered" value={`${answered.length} / ${SCORED_QUESTION_KEYS.length}`} tone="text-green" />
        <ReviewStat label="Marked not relevant" value={String(excluded.size)} tone="text-cyan" />
        <ReviewStat
          label="Still unanswered"
          value={String(skipped.length)}
          tone={skipped.length > 0 ? 'text-red' : 'text-text-faint'}
        />
      </div>

      {skipped.length > 0 && (
        <Surface tone="tinted" padding="md" className="border-red/30 bg-red/[0.04]">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red" />
            <div className="text-[12.5px] text-text-dim">
              <strong className="font-semibold text-text">{skipped.length} question{skipped.length === 1 ? '' : 's'}</strong>{' '}
              still need an answer or a &ldquo;not relevant&rdquo; mark. Submission will
              fail until they&rsquo;re resolved.
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skipped.map((k) => (
                  <span key={k} className="rounded-md border border-red/30 bg-red/[0.05] px-2 py-0.5 font-mono text-[10.5px] text-red">
                    {QUESTIONS[k].n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Surface>
      )}

      <Surface tone="raised" padding="md">
        <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-[15px] font-medium text-text">Financials path</h3>
          <Button tone="ghost" size="sm" onClick={() => onJump(0)} iconRight={<ArrowRight size={11} />}>
            Edit step 1
          </Button>
        </header>
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <SourceBadge source={overrides.enabled ? 'override' : 'aida'} />
          <span className="text-text-dim">
            {overrides.enabled
              ? `Using your numbers (${overrideActive.length}/${overrideFields.length} fields). Anything blank still falls back to AIDA.`
              : `Using the AIDA snapshot. Toggle the override on Step 1 to swap in your own numbers.`}
          </span>
        </div>

        {overrides.enabled && overrideActive.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {overrideActive.map(([label, key, unit]) => (
              <li key={key} className="flex items-baseline justify-between gap-2 rounded-md border border-line bg-bg-2/40 px-3 py-2 text-[12.5px]">
                <span className="text-text-dim">{label}</span>
                <span className="font-mono font-semibold text-text">
                  {unit === '€' ? fmtMoney(Number((overrides as Record<string, unknown>)[key])) : `${(overrides as Record<string, unknown>)[key]}${unit}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Surface>

      {excluded.size > 0 && (
        <Surface tone="tinted" padding="md">
          <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-[15px] font-medium text-text">Excluded questions</h3>
            <span className="font-mono text-[11px] text-text-faint">
              Dropped from scoring, weights renormalize
            </span>
          </header>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from(excluded).map((k) => {
              const meta = QUESTIONS[k as QuestionKey];
              if (!meta) return null;
              return (
                <li key={k} className="rounded-md border border-line bg-bg-1 px-3 py-2 text-[12.5px]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold text-cyan">{meta.n}</span>
                    <StatusBadge tone="neutral" icon={<EyeOff size={9} />}>Excluded</StatusBadge>
                  </div>
                  <div className="mt-0.5 text-text">{meta.title}</div>
                </li>
              );
            })}
          </ul>
        </Surface>
      )}
    </div>
  );
}

function ReviewStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg-1 px-4 py-3">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div className={cn('mt-1 font-serif text-[22px] font-medium tracking-tight', tone)}>
        {value}
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
