'use client';

import { useState, useTransition } from 'react';
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, ChevronRight } from 'lucide-react';
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
} from '@/lib/diagnostic-schema';
import { RatingDots } from '@/components/diagnostic/rating-dots';
import { submitCompanyDiagnosticAction } from '@/app/(app)/companies/[taxCode]/diagnostic/actions';
import { cn } from '@/lib/cn';

export interface DiagnosticV2FormProps {
  taxCode: string;
  companyName: string;
}

/**
 * Pivot edition — single-page diagnostic.
 *
 * 19 questions in 5 sections + the 2 classificatory questions (objective &
 * horizon) shown inline with the Contextual Inputs. Quantitative inputs
 * are pulled from the AIDA snapshot by the server action — the user never
 * types revenue or EBITDA here.
 */
export function DiagnosticV2Form({ taxCode, companyName }: DiagnosticV2FormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<DiagnosticInput>({
    resolver: zodResolver(DiagnosticSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_DIAGNOSTIC as DiagnosticInput,
  });

  function fillExample() {
    Object.entries(EXAMPLE_DIAGNOSTIC).forEach(([k, v]) => {
      form.setValue(k as keyof DiagnosticInput, v as DiagnosticInput[keyof DiagnosticInput], {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  }

  function onSubmit(values: DiagnosticInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await submitCompanyDiagnosticAction(taxCode, values);
      if (!result.ok) {
        setServerError(result.error);
      }
      // redirect happens server-side
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-[820px] px-6 py-10">
        {/* Header */}
        <header className="d-section mb-6">
          <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
            Diagnostic · {companyName}
          </div>
          <h1 className="mt-2 font-serif text-[34px] font-medium leading-tight tracking-tight">
            Twenty honest questions.
          </h1>
          <p className="mt-2 max-w-[640px] text-[14px] text-text-dim">
            Quantitative data is pulled from AIDA automatically. Answer the
            qualitative side — score 1 to 5 on each statement — and we will
            return the company&apos;s strategic valuation, capital scorecard, risk
            index and Top-3 priority actions.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={fillExample}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber/30 bg-amber/[0.10] px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-eyebrow text-amber transition-all hover:-translate-y-0.5 hover:bg-amber/[0.18]"
            >
              <Sparkles size={11} /> Fill with example (ACME)
            </button>
          </div>
        </header>

        {/* Question sections */}
        {QUESTION_SECTIONS.map((section, sIdx) => (
          <section key={section} className="d-section mb-8">
            <SectionHeader index={sIdx + 1} title={section} />
            <div className="space-y-3 rounded-2xl border border-line bg-bg-2/40 p-5">
              {QUESTIONS_BY_SECTION[section].map((qKey) => (
                <RatingRow key={qKey} qKey={qKey} />
              ))}
              {section === 'Contextual Inputs' && <ClassificatoryRow />}
            </div>
          </section>
        ))}

        {/* Submit */}
        <div className="d-section mt-10 flex flex-col gap-3">
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-4 py-3 text-[13px] text-red-300">
              {serverError}
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/[0.18] px-6 py-4 font-mono text-[12px] font-bold uppercase tracking-eyebrow text-gold transition-all hover:-translate-y-0.5 hover:bg-gold/[0.28] disabled:opacity-60"
          >
            {pending ? 'Scoring…' : 'Submit & score'}
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
          <div className="font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
            On submit we compute V, the 4-capital scorecard, the Top-3 actions, and the value gap.
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

// =============================================================================
// Section header
// =============================================================================
function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          Section {String(index).padStart(2, '0')}
        </div>
        <h2 className="mt-0.5 font-serif text-[20px] font-medium tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

// =============================================================================
// One scored row (Q1–Q14, Q17–Q19)
// =============================================================================
function RatingRow({ qKey }: { qKey: QuestionKey }) {
  const q = QUESTIONS[qKey];
  const { control, watch, formState } = useFormContext<DiagnosticInput>();
  const v = watch(qKey) as number | undefined;
  const optionLabel = typeof v === 'number' ? q.options[v - 1] : 'Pick a score';
  const error = formState.errors[qKey]?.message;

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-black/20 p-4 md:grid-cols-[1fr_auto]">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
            {q.n}
          </span>
          <span className="font-serif text-[16px] font-medium text-text">{q.title}</span>
        </div>
        <div className="mt-1 max-w-[480px] text-[13px] text-text-dim">{q.hint}</div>
        <div className="mt-2 font-mono text-[11px] text-amber">
          {typeof v === 'number' ? `${v} — ${optionLabel}` : optionLabel}
        </div>
        {error && (
          <div className="mt-1 font-mono text-[10.5px] text-red-400">{String(error)}</div>
        )}
      </div>
      <Controller
        control={control}
        name={qKey}
        render={({ field }) => (
          <RatingDots
            value={Number(field.value ?? 3)}
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
// Classificatory inputs — stated_objective + time_horizon (Q15, Q16)
// =============================================================================
function ClassificatoryRow() {
  const { control, formState } = useFormContext<DiagnosticInput>();
  return (
    <div className="rounded-xl border border-line bg-black/20 p-4">
      <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
        Q15–Q16 · Classificatory
      </div>
      <p className="mt-1 text-[12.5px] text-text-dim">
        Used to prioritise the Top-3 actions and interpret the value gap.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            Primary objective (24–36 m)
          </label>
          <Controller
            control={control}
            name="stated_objective"
            render={({ field }) => (
              <select
                {...field}
                className={cn(
                  'w-full rounded-lg border border-line bg-bg/60 px-3 py-2.5 font-mono text-[12.5px] text-text',
                  'focus:border-cyan/40 focus:outline-none focus:ring-1 focus:ring-cyan/30',
                )}
              >
                <option value="">Pick an objective…</option>
                {STATED_OBJECTIVES.map((o) => (
                  <option key={o} value={o}>{OBJECTIVE_LABELS[o]}</option>
                ))}
              </select>
            )}
          />
          {formState.errors.stated_objective && (
            <div className="mt-1 font-mono text-[10.5px] text-red-400">
              {String(formState.errors.stated_objective?.message)}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
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
                        'flex-1 rounded-lg border px-2 py-2 font-mono text-[11px] font-bold uppercase tracking-eyebrow transition-all',
                        active
                          ? 'border-cyan/50 bg-cyan/[0.15] text-cyan'
                          : 'border-line bg-bg/40 text-text-dim hover:border-line-2',
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
            <div className="mt-1 font-mono text-[10.5px] text-red-400">
              {String(formState.errors.time_horizon?.message)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
