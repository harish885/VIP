'use client';

import { Controller, useFormContext } from 'react-hook-form';
import {
  LIFECYCLES,
  TIME_HORIZONS,
  SECTORS,
  OBJECTIVES,
  type DiagnosticInput,
} from '@/lib/diagnostic-schema';
import { FieldShell } from './field-shell';
import { cn } from '@/lib/cn';

/**
 * Step 3 — Contextual
 *
 * 5 inputs that anchor the valuation to the right peer group + recommendation
 * weights: sector, lifecycle, distinctive assets, objective, time horizon.
 */
export function StepContextual() {
  const { control, formState: { errors }, register } = useFormContext<DiagnosticInput>();

  return (
    <div className="space-y-6">
      {/* Sector */}
      <Controller
        control={control}
        name="sector"
        render={({ field }) => (
          <FieldShell label="Sector / vertical" required hint="Determines the peer group and sector multiple base.">
            <Select
              value={field.value}
              onChange={field.onChange}
              placeholder="— pick one —"
              options={SECTORS.map((s) => ({ value: s, label: s }))}
              error={errors.sector?.message as string | undefined}
            />
          </FieldShell>
        )}
      />

      {/* Lifecycle stage — button group, more tactile than a dropdown */}
      <Controller
        control={control}
        name="lifecycle_stage"
        render={({ field }) => (
          <FieldShell label="Lifecycle stage" required hint="Adjusts the Growth Factor expectations.">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {LIFECYCLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => field.onChange(s)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow transition-all',
                    field.value === s
                      ? 'border-gold bg-gold/[0.10] text-gold'
                      : 'border-line bg-black/30 text-text-dim hover:border-line-2 hover:text-text',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </FieldShell>
        )}
      />

      {/* Distinctive assets — free text */}
      <FieldShell
        label="Distinctive assets"
        hint="Brand, proprietary tech, exclusive contracts, IP. One line — optional."
      >
        <input
          {...register('distinctive_assets')}
          type="text"
          placeholder="e.g. Patent on cooling-coil design; long-term automotive OEM contracts"
          className="w-full rounded-lg border border-line bg-black/30 px-3.5 py-2.5 font-sans text-[14px] text-text placeholder:text-text-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </FieldShell>

      {/* Objective */}
      <Controller
        control={control}
        name="stated_objective"
        render={({ field }) => (
          <FieldShell
            label="Your objective"
            required
            hint="Shapes how the Recommendation Engine weights the Top-3 actions."
          >
            <Select
              value={field.value}
              onChange={field.onChange}
              placeholder="— pick one —"
              options={[...OBJECTIVES]}
              error={errors.stated_objective?.message as string | undefined}
            />
          </FieldShell>
        )}
      />

      {/* Time horizon — same button-group treatment */}
      <Controller
        control={control}
        name="time_horizon"
        render={({ field }) => (
          <FieldShell label="Time horizon" required>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {TIME_HORIZONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => field.onChange(h)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-eyebrow transition-all',
                    field.value === h
                      ? 'border-gold bg-gold/[0.10] text-gold'
                      : 'border-line bg-black/30 text-text-dim hover:border-line-2 hover:text-text',
                  )}
                >
                  {labelHorizon(h)}
                </button>
              ))}
            </div>
          </FieldShell>
        )}
      />
    </div>
  );
}

function labelHorizon(h: typeof TIME_HORIZONS[number]) {
  if (h === '12m') return 'Within 12mo';
  if (h === '24m') return '12–24mo';
  if (h === '36m') return '24–36mo';
  return '36mo+';
}

// =============================================================================
// SHARED SELECT
// =============================================================================
function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-lg border bg-black/30 px-3.5 py-2.5 font-sans text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-gold/30',
          error ? 'border-red/50' : 'border-line focus:border-gold',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="font-mono text-[10.5px] text-red">{error}</span>}
    </div>
  );
}
