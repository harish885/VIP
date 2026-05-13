'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  useForm,
  FormProvider,
  Controller,
  useFormContext,
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
} from 'lucide-react';
import {
  DiagnosticSchema,
  EMPTY_DIAGNOSTIC,
  EXAMPLE_DIAGNOSTIC,
  QUESTIONS,
  QUESTIONS_BY_SECTION,
  QUESTION_SECTIONS,
  TIME_HORIZONS,
  STATED_OBJECTIVES,
  OBJECTIVE_LABELS,
  type DiagnosticInput,
  type QuestionKey,
  type QuestionSection,
} from '@/lib/diagnostic-schema';
import { RatingDots } from '@/components/diagnostic/rating-dots';
import { submitCompanyDiagnosticAction } from '@/app/(app)/companies/[taxCode]/diagnostic/actions';
import { cn } from '@/lib/cn';

// =============================================================================
// Stepper definition
// =============================================================================
const STEPS: Array<{ section: QuestionSection; label: string; eyebrow: string }> = [
  { section: 'Technological Capital',          label: 'Technology',  eyebrow: 'Section 01' },
  { section: 'Human & Organisational Capital', label: 'Team',        eyebrow: 'Section 02' },
  { section: 'Relational Capital',             label: 'Relations',   eyebrow: 'Section 03' },
  { section: 'Growth Quality & Context',       label: 'Growth',      eyebrow: 'Section 04' },
  { section: 'Contextual Inputs',              label: 'Context',     eyebrow: 'Section 05' },
];

export interface DiagnosticV2FormProps {
  taxCode: string;
  companyName: string;
}

/**
 * Diagnostic form — guided stepper.
 *
 * 19 scored 1-5 questions plus 2 classificatory inputs, presented one
 * section at a time. Per-step Zod validation gates "Continue".
 * Quantitative data is pulled from AIDA server-side at submission time.
 */
export function DiagnosticV2Form({ taxCode, companyName }: DiagnosticV2FormProps) {
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
  const sectionKeys = QUESTIONS_BY_SECTION[step.section];

  const fieldsForStep: Array<keyof DiagnosticInput> = useMemo(() => {
    const base: Array<keyof DiagnosticInput> = [...sectionKeys];
    if (step.section === 'Contextual Inputs') {
      base.push('stated_objective', 'time_horizon');
    }
    return base;
  }, [sectionKeys, step.section]);

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
        // Success → server redirect throws NEXT_REDIRECT, handled below.
      } catch (e) {
        const msg = (e as Error).message ?? 'Unknown error';
        if (msg.includes('NEXT_REDIRECT')) throw e;
        setServerError(msg);
      }
    });
  }

  function onInvalid(errors: FieldErrors<DiagnosticInput>) {
    // Jump to the first step containing an error.
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;
    for (let i = 0; i < STEPS.length; i += 1) {
      const inSection = QUESTIONS_BY_SECTION[STEPS[i]!.section];
      const includesContext =
        STEPS[i]!.section === 'Contextual Inputs' &&
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
      <div ref={containerRef} className="mx-auto max-w-[820px] px-6 pb-16 pt-8">
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
          <h1 className="mt-2 font-serif text-[30px] font-medium leading-[1.1] tracking-tight text-text">
            A few honest questions about how the company really runs.
          </h1>
          <p className="mt-2 max-w-[640px] text-[13.5px] leading-relaxed text-text-dim">
            We pull the financial side from AIDA automatically. You answer the
            qualitative side — 19 short ratings — and we produce the company&apos;s
            strategic value, capital scorecard, and a Top-3 of priority actions.
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
          className="mt-6 rounded-2xl border border-line bg-bg-1 p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
                {step.eyebrow} · Step {stepIndex + 1} of {totalSteps}
              </div>
              <h2 className="mt-1 font-serif text-[22px] font-medium tracking-tight text-text">
                {step.label}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {sectionKeys.map((qKey) => (
              <RatingRow key={qKey} qKey={qKey} />
            ))}
            {step.section === 'Contextual Inputs' && <ClassificatoryRow />}
          </div>

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
            <div key={s.section} className="flex flex-1 items-center">
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
                    'mx-2 h-px flex-1 transition-colors md:mx-3',
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
// Rating row (one scored question)
// =============================================================================
function RatingRow({ qKey }: { qKey: QuestionKey }) {
  const q = QUESTIONS[qKey];
  const { control, watch, formState } = useFormContext<DiagnosticInput>();
  const v = watch(qKey) as number | undefined;
  const optionLabel = typeof v === 'number' ? q.options[v - 1] : null;
  const error = formState.errors[qKey]?.message;

  return (
    <div
      data-field={qKey}
      className={cn(
        'grid grid-cols-1 gap-3 rounded-xl border bg-bg-2/40 p-4 transition-colors md:grid-cols-[1fr_auto]',
        error ? 'border-red/40' : 'border-line',
      )}
    >
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-cyan">
            {q.n}
          </span>
          <span className="text-[15px] font-medium text-text">{q.title}</span>
        </div>
        <div className="mt-1 max-w-[480px] text-[12.5px] text-text-dim">{q.hint}</div>
        <div
          className={cn(
            'mt-2 text-[12px]',
            optionLabel ? 'text-text-dim' : 'text-text-faint',
          )}
        >
          {optionLabel ? <><span className="font-mono text-amber">{v}</span> · {optionLabel}</> : 'Tap 1–5 to answer'}
        </div>
        {error && (
          <div className="mt-1 text-[12px] text-red">{String(error)}</div>
        )}
      </div>
      <Controller
        control={control}
        name={qKey}
        render={({ field }) => (
          <RatingDots
            value={Number(field.value ?? 0)}
            onChange={field.onChange}
            lowLabel="1"
            highLabel="5"
          />
        )}
      />
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
