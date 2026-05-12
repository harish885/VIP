'use client';

import { Controller, useFormContext } from 'react-hook-form';
import type { DiagnosticInput } from '@/lib/diagnostic-schema';
import { FieldShell } from './field-shell';
import { RatingDots } from './rating-dots';

/**
 * Step 2 — Qualitative
 *
 * Six 1–5 questions. Each row uses the inline FieldShell variant so the
 * question text stays left-aligned and the dot scale sits right-aligned.
 */

type QField = {
  name: keyof DiagnosticInput;
  label: string;
  hint: string;
  low: string;
  high: string;
};

const QUESTIONS: QField[] = [
  {
    name: 'founder_dependency',
    label: 'Founder dependency',
    hint: 'How much does the business rely on you personally? 1 = fully dependent, 5 = fully transferable.',
    low: 'Fully dependent',
    high: 'Independent',
  },
  {
    name: 'management_structure',
    label: 'Management structure',
    hint: 'Depth and quality of the leadership team beyond the founder.',
    low: 'Thin',
    high: 'Deep',
  },
  {
    name: 'digital_maturity',
    label: 'Digital maturity',
    hint: 'Automation, proprietary data, enabling systems in place today.',
    low: 'Manual',
    high: 'Automated',
  },
  {
    name: 'client_portfolio_quality',
    label: 'Client portfolio quality',
    hint: 'Diversification, contract length, stickiness.',
    low: 'Fragile',
    high: 'Diversified',
  },
  {
    name: 'business_scalability',
    label: 'Business model scalability',
    hint: 'Can revenue grow without proportional cost?',
    low: 'Linear',
    high: 'Scalable',
  },
  {
    name: 'network_partnerships',
    label: 'Network & partnerships',
    hint: 'Strategic relationships, ecosystem position, brand presence.',
    low: 'Isolated',
    high: 'Networked',
  },
];

export function StepQualitative() {
  const { control } = useFormContext<DiagnosticInput>();

  return (
    <div>
      <p className="mb-6 text-[13.5px] leading-relaxed text-text-dim">
        Score each on a 1–5 scale based on your honest assessment today. The model is most
        useful when you&rsquo;re candid, especially about founder dependency and digital maturity.
      </p>

      <div className="rounded-2xl border border-line bg-black/15 px-6">
        {QUESTIONS.map((q) => (
          <Controller
            key={q.name}
            control={control}
            name={q.name}
            render={({ field }) => (
              <FieldShell label={q.label} hint={q.hint} required inline>
                <RatingDots
                  value={field.value as number}
                  onChange={field.onChange}
                  lowLabel={q.low}
                  highLabel={q.high}
                />
              </FieldShell>
            )}
          />
        ))}
      </div>
    </div>
  );
}
