'use client';

import { useState, useTransition } from 'react';
import { createCompanyAction } from '@/app/(app)/onboarding/actions';
import {
  Field,
  TextInput,
  PrimaryButton,
  SecondaryButton,
  FormError,
} from '@/components/auth/auth-fields';
import { cn } from '@/lib/cn';

type Stage = 'Early' | 'Growth' | 'Maturity' | 'Decline';

const SECTORS = [
  'Manufacturing',
  'Wholesale & Distribution',
  'Professional Services',
  'Tech / Software',
  'Retail / e-Commerce',
  'Construction',
  'Logistics',
  'Other',
];

const STAGES: { value: Stage; label: string; help: string }[] = [
  { value: 'Early',    label: 'Early',    help: 'Product-market fit recent or in progress.' },
  { value: 'Growth',   label: 'Growth',   help: 'Revenue scaling 20%+ YoY.' },
  { value: 'Maturity', label: 'Maturity', help: 'Stable cash flow, slower growth.' },
  { value: 'Decline',  label: 'Decline',  help: 'Revenue declining or structural pressure.' },
];

/**
 * Three-step onboarding wizard.
 *
 * Step 1 — identity (name, sector, NACE)
 * Step 2 — context  (province, lifecycle, distinctive assets)
 * Step 3 — intent   (stated objective, time horizon)
 *
 * On submit, sends a FormData to createCompanyAction. The server action
 * inserts the row and redirects to /dashboard?company=<id>.
 */
export function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stage, setStage] = useState<Stage>('Maturity');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // We keep the form mounted across steps and just hide non-current panels
  // so the FormData on submit has every field.
  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set('lifecycle_stage', stage);
    startTransition(async () => {
      const result = await createCompanyAction(formData);
      if (result && !result.ok) {
        setError(result.error);
        // If a field-level error fires, bounce back to step 1 where the
        // required fields live.
        setStep(1);
      }
    });
  }

  return (
    <div className="glass-strong p-8">
      <Stepper current={step} />

      <FormError message={error} />

      <form action={handleSubmit} className="flex flex-col">
        {/* ====== STEP 1 ====== */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <h2 className="mb-2 font-serif text-[24px] font-medium tracking-tight">
            Tell us about your <span className="text-gradient-gold">company</span>.
          </h2>
          <p className="mb-6 text-[13.5px] text-text-dim">
            Just enough so we can find the right peer group.
          </p>

          <Field label="Company name" required>
            <TextInput
              name="name"
              autoComplete="organization"
              placeholder="ACME Industrie S.R.L."
              required
              minLength={2}
              disabled={pending}
            />
          </Field>

          <Field label="Sector" required>
            <select
              name="sector"
              className="w-full rounded-lg border border-line bg-bg-2/70 px-3.5 py-2.5 font-sans text-[14px] text-text focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              defaultValue="Manufacturing"
              required
              disabled={pending}
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="NACE code" hint="Optional. 3 digits, e.g. 282 — narrows the peer group.">
            <TextInput
              name="nace_code"
              placeholder="282"
              maxLength={4}
              pattern="\d{2,4}"
              disabled={pending}
            />
          </Field>
        </div>

        {/* ====== STEP 2 ====== */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <h2 className="mb-2 font-serif text-[24px] font-medium tracking-tight">
            Where are you on the <span className="text-gradient-gold">map</span>?
          </h2>
          <p className="mb-6 text-[13.5px] text-text-dim">
            Geographic and lifecycle context. Both shape the model&rsquo;s peer benchmarking.
          </p>

          <Field label="Province / region">
            <TextInput
              name="province"
              autoComplete="address-level2"
              placeholder="Lombardia"
              disabled={pending}
            />
          </Field>

          <Field label="Lifecycle stage" required>
            <div className="grid grid-cols-2 gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStage(s.value)}
                  disabled={pending}
                  className={cn(
                    'flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-all',
                    stage === s.value
                      ? 'border-gold bg-gold/[0.08] text-text'
                      : 'border-line bg-bg-2/70 text-text-dim hover:border-line-2 hover:text-text',
                  )}
                >
                  <span className="font-mono text-[11px] font-bold uppercase tracking-eyebrow">
                    {s.label}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-snug text-text-faint">
                    {s.help}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Distinctive assets" hint="Brand, proprietary tech, exclusive contracts — one line.">
            <TextInput
              name="distinctive_assets"
              placeholder="e.g. Patent on cooling-coil design"
              disabled={pending}
            />
          </Field>
        </div>

        {/* ====== STEP 3 ====== */}
        <div className={step === 3 ? 'block' : 'hidden'}>
          <h2 className="mb-2 font-serif text-[24px] font-medium tracking-tight">
            What are you <span className="text-gradient-gold">trying to do</span>?
          </h2>
          <p className="mb-6 text-[13.5px] text-text-dim">
            This shapes how the recommendation engine weights the Top-3 actions.
          </p>

          <Field label="Your objective">
            <select
              name="stated_objective"
              className="w-full rounded-lg border border-line bg-bg-2/70 px-3.5 py-2.5 font-sans text-[14px] text-text focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              defaultValue=""
              disabled={pending}
            >
              <option value="">— pick one —</option>
              <option value="grow_value">Grow company value before exit</option>
              <option value="prepare_exit">Prepare for an exit / sale</option>
              <option value="raise_capital">Raise growth capital</option>
              <option value="evaluate_target">Evaluate an acquisition target</option>
              <option value="succession">Succession planning</option>
              <option value="diagnostic">Periodic health check</option>
            </select>
          </Field>

          <Field label="Time horizon">
            <select
              name="time_horizon"
              className="w-full rounded-lg border border-line bg-bg-2/70 px-3.5 py-2.5 font-sans text-[14px] text-text focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              defaultValue="24m"
              disabled={pending}
            >
              <option value="12m">Within 12 months</option>
              <option value="24m">12–24 months</option>
              <option value="36m">24–36 months</option>
              <option value="60m">36+ months</option>
            </select>
          </Field>
        </div>

        {/* ====== NAV ====== */}
        <div className="mt-8 flex items-center gap-3">
          {step > 1 ? (
            <SecondaryButton
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              disabled={pending}
              className="flex-1"
            >
              ← Back
            </SecondaryButton>
          ) : (
            <div className="flex-1" />
          )}

          {step < 3 ? (
            <PrimaryButton
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              disabled={pending}
              className="flex-1"
            >
              Continue →
            </PrimaryButton>
          ) : (
            <PrimaryButton type="submit" disabled={pending} className="flex-1">
              {pending ? 'Saving…' : 'Finish setup →'}
            </PrimaryButton>
          )}
        </div>
      </form>
    </div>
  );
}

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Identity' },
    { n: 2, label: 'Context' },
    { n: 3, label: 'Intent' },
  ];
  return (
    <div className="mb-8 flex items-center justify-between gap-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-colors',
              s.n === current
                ? 'border-gold bg-gold/[0.15] text-gold'
                : s.n < current
                  ? 'border-green/40 bg-green/[0.10] text-green'
                  : 'border-line bg-bg-2/50 text-text-faint',
            )}
          >
            {s.n < current ? '✓' : s.n}
          </div>
          <span
            className={cn(
              'flex-1 font-mono text-[10px] font-semibold uppercase tracking-eyebrow',
              s.n === current ? 'text-text' : 'text-text-faint',
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span
              className={cn(
                'h-px flex-1 transition-colors',
                s.n < current ? 'bg-green/40' : 'bg-line-faint',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
