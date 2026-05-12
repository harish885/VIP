'use client';

import { Controller, useFormContext } from 'react-hook-form';
import type { DiagnosticInput } from '@/lib/diagnostic-schema';
import { FieldShell } from './field-shell';
import { NumberField } from './number-field';

/**
 * Step 1 — Quantitative
 *
 * 7 number fields, visually grouped in three blocks:
 *   · Revenue history (3 inputs)
 *   · Profit (EBITDA, 1 input)
 *   · Revenue quality (3 ratios)
 */
export function StepQuantitative() {
  const { control, formState: { errors } } = useFormContext<DiagnosticInput>();

  return (
    <div className="space-y-8">
      {/* ===== Revenue history ===== */}
      <Block
        title="Revenue history"
        sub="Top-line revenue for the last three financial years. Used for CAGR and as the denominator for ratios."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Controller
            control={control}
            name="revenue_y_1"
            render={({ field }) => (
              <FieldShell label="3 years ago" required>
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  prefix="€"
                  placeholder="0"
                  error={errors.revenue_y_1?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
          <Controller
            control={control}
            name="revenue_y_2"
            render={({ field }) => (
              <FieldShell label="2 years ago" required>
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  prefix="€"
                  placeholder="0"
                  error={errors.revenue_y_2?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
          <Controller
            control={control}
            name="revenue_y_3"
            render={({ field }) => (
              <FieldShell label="Last year" required>
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  prefix="€"
                  placeholder="0"
                  error={errors.revenue_y_3?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
        </div>
      </Block>

      {/* ===== EBITDA ===== */}
      <Block
        title="Profitability"
        sub="Operating profit before interest, taxes, depreciation, amortisation."
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Controller
            control={control}
            name="ebitda"
            render={({ field }) => (
              <FieldShell label="EBITDA · last year" required hint="The model normalises this across 3 years internally.">
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  prefix="€"
                  placeholder="0"
                  error={errors.ebitda?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
        </div>
      </Block>

      {/* ===== Revenue quality ===== */}
      <Block
        title="Revenue quality"
        sub="The three ratios that distinguish a fragile P&L from a resilient one."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Controller
            control={control}
            name="recurring_revenue_pct"
            render={({ field }) => (
              <FieldShell label="Recurring revenue" required hint="Multi-year contracts or subscriptions.">
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  suffix="%"
                  placeholder="0"
                  max={100}
                  error={errors.recurring_revenue_pct?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
          <Controller
            control={control}
            name="top3_client_concentration"
            render={({ field }) => (
              <FieldShell label="Top-3 client concentration" required hint="Share of revenue from your 3 largest clients.">
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  suffix="%"
                  placeholder="0"
                  max={100}
                  error={errors.top3_client_concentration?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
          <Controller
            control={control}
            name="tech_investment_ratio_pct"
            render={({ field }) => (
              <FieldShell label="Tech investment / revenue" required hint="R&D + tooling + software, as % of revenue.">
                <NumberField
                  value={field.value}
                  onChange={field.onChange}
                  suffix="%"
                  placeholder="0"
                  max={100}
                  inputMode="decimal"
                  error={errors.tech_investment_ratio_pct?.message as string | undefined}
                />
              </FieldShell>
            )}
          />
        </div>
      </Block>
    </div>
  );
}

function Block({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 font-serif text-[20px] font-medium tracking-tight">{title}</h3>
      <p className="mb-5 text-[13px] leading-relaxed text-text-dim">{sub}</p>
      {children}
    </div>
  );
}
