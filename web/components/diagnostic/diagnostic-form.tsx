'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DiagnosticSchema,
  EMPTY_DIAGNOSTIC,
  EXAMPLE_DIAGNOSTIC,
  type DiagnosticInput,
} from '@/lib/diagnostic-schema';
import { Stepper } from './stepper';
import { StepQuantitative } from './step-quantitative';
import { StepQualitative } from './step-qualitative';
import { StepContextual } from './step-contextual';
import { StepReview } from './step-review';
import { submitDiagnosticAction } from '@/app/(app)/diagnostic/actions';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

type Step = 1 | 2 | 3 | 4;

const STEP_TITLES: Record<Step, { eyebrow: string; title: string; accent: string }> = {
  1: { eyebrow: '01 · Numbers',   title: 'The hard numbers.',                  accent: 'numbers.' },
  2: { eyebrow: '02 · Strategy',  title: 'Six honest questions.',              accent: 'questions.' },
  3: { eyebrow: '03 · Context',   title: 'Where you sit and where you’re going.', accent: 'going.' },
  4: { eyebrow: '04 · Review',    title: 'Confirm and submit.',                accent: 'submit.' },
};

/**
 * Top-level diagnostic form.
 *
 * Owns the current step + the RHF context. Each step component pulls its
 * own fields via useFormContext. Continue is gated by `form.trigger`
 * against the step's fields so users see inline errors before advancing.
 */
export function DiagnosticForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<DiagnosticInput>({
    resolver: zodResolver(DiagnosticSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_DIAGNOSTIC as DiagnosticInput,
  });

  // Fields that belong to each step — used for per-step validation.
  const STEP_FIELDS: Record<Step, (keyof DiagnosticInput)[]> = {
    1: [
      'revenue_y_1', 'revenue_y_2', 'revenue_y_3',
      'ebitda',
      'recurring_revenue_pct', 'top3_client_concentration', 'tech_investment_ratio_pct',
    ],
    2: [
      'founder_dependency', 'management_structure', 'digital_maturity',
      'client_portfolio_quality', 'business_scalability', 'network_partnerships',
    ],
    3: ['sector', 'lifecycle_stage', 'distinctive_assets', 'stated_objective', 'time_horizon'],
    4: [],
  };

  async function handleContinue() {
    const ok = await form.trigger(STEP_FIELDS[step]);
    if (!ok) return;
    setStep((s) => (Math.min(s + 1, 4) as Step));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setStep((s) => (Math.max(s - 1, 1) as Step));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fillExample() {
    Object.entries(EXAMPLE_DIAGNOSTIC).forEach(([k, v]) => {
      form.setValue(k as keyof DiagnosticInput, v as DiagnosticInput[keyof DiagnosticInput], {
        shouldValidate: true, shouldDirty: true,
      });
    });
  }

  async function onSubmit(values: DiagnosticInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await submitDiagnosticAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push('/dashboard?submitted=1');
    });
  }

  const header = STEP_TITLES[step];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-[920px] px-6 py-12">
        <Stepper current={step} />

        {/* Step header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
              {header.eyebrow}
            </div>
            <h1
              className="font-serif font-normal leading-tight tracking-tight text-text"
              style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)', letterSpacing: '-0.025em' }}
            >
              {header.title.split(header.accent)[0]}
              <span className="text-gradient-gold">{header.accent}</span>
            </h1>
          </div>
          {step === 1 && (
            <button
              type="button"
              onClick={fillExample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple/30 bg-purple/[0.08] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple transition-all hover:-translate-y-0.5 hover:bg-purple/[0.14]"
            >
              <Sparkles size={12} />
              Fill with example
            </button>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-line bg-bg-2/40 p-6 md:p-8">
          {step === 1 && <StepQuantitative />}
          {step === 2 && <StepQualitative />}
          {step === 3 && <StepContextual />}
          {step === 4 && <StepReview onEditStep={(s) => setStep(s)} />}

          {serverError && (
            <div className="mt-6 rounded-lg border border-red/30 bg-red/[0.08] px-4 py-3 text-[13px] text-red">
              {serverError}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || pending}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg-2/50 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow transition-all',
              step === 1 || pending ? 'cursor-not-allowed opacity-40' : 'hover:-translate-x-0.5 hover:border-line-2 hover:text-text',
              step === 1 || pending ? 'text-text-faint' : 'text-text-dim',
            )}
          >
            <ChevronLeft size={14} /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold to-gold-soft px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-bg transition-all hover:translate-x-0.5 hover:shadow-[0_8px_24px_-8px_rgba(245,165,36,0.6)]"
            >
              Continue <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold to-gold-soft px-6 py-2.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-bg transition-all hover:shadow-[0_8px_24px_-8px_rgba(245,165,36,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Submitting…' : 'Submit diagnostic →'}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
