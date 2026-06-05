'use client';

import { Fragment, useState } from 'react';
import { Check, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/vip-ui/button';
import { Segmented } from '@/components/vip-ui/segmented';
import { cn } from '@/lib/cn';

type Billing = 'monthly' | 'annual';

// =============================================================================
// Plan data — single source of truth for cards AND the comparison table.
// Prices in EUR. Annual = 10 × monthly (two months free).
// =============================================================================
const PLANS = [
  {
    key: 'explorer',
    name: 'Explorer',
    audience: 'A founder’s first sanity check.',
    monthly: 0,
    annual: 0,
    cta: 'Start free',
    href: '/signup',
    featured: false,
    summary: [
      'One company under diagnosis',
      'Full AIDA factsheet & peer context',
      'The complete 19-question diagnostic',
      'Cockpit with value bridge & capitals',
      'Methodology, fully documented',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    audience: 'Founders managing the value gap quarter over quarter.',
    monthly: 79,
    annual: 790,
    cta: 'Start 14-day trial',
    href: '/signup',
    featured: true,
    summary: [
      'Unlimited companies & re-runs',
      'Financial overrides on every input',
      'Scenario lab — live value recompute',
      'Valuation history & quarter deltas',
      'Board-ready PDF export',
    ],
  },
  {
    key: 'advisory',
    name: 'Advisory Desk',
    audience: 'M&A advisors and acquisition scouts running targets.',
    monthly: 249,
    annual: 2490,
    cta: 'Talk to us',
    href: 'mailto:harish.bhavandla@gmail.com?subject=VIP%20Advisory%20Desk',
    featured: false,
    summary: [
      'Everything in Professional',
      'Target portfolio, side by side',
      'White-label client reports',
      'API access to the scoring engine',
      'Dedicated onboarding & methodology call',
    ],
  },
] as const;

type PlanKey = (typeof PLANS)[number]['key'];

// Comparison matrix. `true` → check, `false` → dash, string → literal value.
const MATRIX: Array<{
  group: string;
  rows: Array<{ label: string; values: Record<PlanKey, boolean | string> }>;
}> = [
  {
    group: 'Coverage',
    rows: [
      { label: 'Companies under diagnosis', values: { explorer: '1', professional: 'Unlimited', advisory: 'Unlimited' } },
      { label: 'Diagnostic re-runs', values: { explorer: '1 / month', professional: 'Unlimited', advisory: 'Unlimited' } },
      { label: 'AIDA factsheet & peer percentiles', values: { explorer: true, professional: true, advisory: true } },
      { label: 'Portfolio view (targets side by side)', values: { explorer: false, professional: false, advisory: true } },
    ],
  },
  {
    group: 'Engine',
    rows: [
      { label: '19-question strategic diagnostic', values: { explorer: true, professional: true, advisory: true } },
      { label: 'Financial overrides', values: { explorer: false, professional: true, advisory: true } },
      { label: 'Scenario lab (live recompute)', values: { explorer: false, professional: true, advisory: true } },
      { label: 'Top-3 actions ranked by ROV', values: { explorer: true, professional: true, advisory: true } },
      { label: 'Risk flags & fragility index', values: { explorer: true, professional: true, advisory: true } },
    ],
  },
  {
    group: 'Output',
    rows: [
      { label: 'Valuation history & deltas', values: { explorer: false, professional: true, advisory: true } },
      { label: 'PDF export', values: { explorer: false, professional: true, advisory: true } },
      { label: 'White-label reports', values: { explorer: false, professional: false, advisory: true } },
      { label: 'Scoring engine API', values: { explorer: false, professional: false, advisory: true } },
    ],
  },
  {
    group: 'Support',
    rows: [
      { label: 'Documentation & methodology', values: { explorer: true, professional: true, advisory: true } },
      { label: 'Email support', values: { explorer: false, professional: '48h', advisory: '24h' } },
      { label: 'Onboarding & methodology call', values: { explorer: false, professional: false, advisory: true } },
    ],
  },
];

const FAQ = [
  {
    q: 'What exactly am I paying for?',
    a: 'The engine. Every plan runs the same calibrated model — V = EBITDA × M_sector × SQF × GF, benchmarked against 14,999 Italian manufacturing SMEs from AIDA / Bureau van Dijk. Paid plans remove the single-company limit and unlock overrides, the scenario lab, history and exports.',
  },
  {
    q: 'Can I switch between monthly and annual?',
    a: 'Yes, at any time. Annual billing is ten months for twelve — the equivalent of two months free. Upgrades apply immediately; downgrades apply at the next renewal.',
  },
  {
    q: 'Can I cancel?',
    a: 'Any time, from your account. You keep access until the end of the period you paid for. No retention flows, no “are you sure” mazes.',
  },
  {
    q: 'Where does the data come from?',
    a: 'Public AIDA / Bureau van Dijk filings for the quantitative side; your own answers for the strategic side. Every number in the cockpit carries a source badge — AIDA, your override, computed, or proxy — so provenance is never a mystery.',
  },
  {
    q: 'Do prices include VAT?',
    a: 'Prices are shown excluding VAT. Italian VAT (or your local reverse-charge treatment) is applied at checkout based on your billing country and VAT number.',
  },
];

// =============================================================================
// Component
// =============================================================================
export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>('annual');

  return (
    <>
      {/* Billing toggle */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Segmented
          ariaLabel="Billing period"
          value={billing}
          options={[
            { value: 'monthly' as const, label: 'Monthly' },
            { value: 'annual' as const, label: 'Annual' },
          ]}
          onChange={setBilling}
        />
        <span
          className={cn(
            'font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity',
            billing === 'annual' ? 'text-green opacity-100' : 'text-text-faint opacity-60',
          )}
        >
          Two months free on annual
        </span>
      </div>

      {/* Plan cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} billing={billing} />
        ))}
      </div>

      {/* Comparison table */}
      <section className="mt-14" aria-labelledby="compare-heading">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">
          Line by line
        </div>
        <h2 id="compare-heading" className="mt-2 font-serif text-[26px] font-medium leading-tight text-text">
          Every plan, every capability.
        </h2>

        <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-bg-1">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-3.5 text-[12px] font-semibold text-text-faint sm:px-5">
                  Capability
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3.5 text-[13px] font-semibold sm:px-5',
                      p.featured ? 'text-gold' : 'text-text',
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((section) => (
                <Fragment key={section.group}>
                  <tr className="border-b border-line-faint bg-bg-2/50">
                    <th
                      colSpan={4}
                      scope="colgroup"
                      className="px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint sm:px-5"
                    >
                      {section.group}
                    </th>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="border-b border-line-faint last:border-0">
                      <th scope="row" className="px-4 py-3 text-[13px] font-normal text-text-dim sm:px-5">
                        {row.label}
                      </th>
                      {PLANS.map((p) => (
                        <td key={p.key} className={cn('px-4 py-3 sm:px-5', p.featured && 'bg-gold/[0.03]')}>
                          <Cell value={row.values[p.key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="faq-heading">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">
            Before you ask
          </div>
          <h2 id="faq-heading" className="mt-2 font-serif text-[26px] font-medium leading-tight text-text">
            Plain answers.
          </h2>
          <p className="mt-3 max-w-[380px] text-[13.5px] leading-7 text-text-dim">
            The same register as the product: what it literally does, what it
            costs, what happens when you leave.
          </p>
        </div>
        <div className="divide-y divide-line rounded-lg border border-line bg-bg-1">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-semibold text-text [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="text-[18px] font-light leading-none text-text-faint transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[640px] text-[13px] leading-7 text-text-dim">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function PlanCard({
  plan,
  billing,
}: {
  plan: (typeof PLANS)[number];
  billing: Billing;
}) {
  const isFree = plan.monthly === 0;
  const perMonth = billing === 'annual' ? plan.annual / 12 : plan.monthly;

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-lg border bg-bg-1 p-5 sm:p-6',
        plan.featured ? 'border-gold/55 shadow-[0_1px_0_rgb(var(--gold)/0.25)]' : 'border-line',
      )}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-5 rounded-md border border-gold/55 bg-bg px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-gold">
          Most chosen
        </div>
      )}

      <h3 className="text-[16px] font-semibold text-text">{plan.name}</h3>
      <p className="mt-1.5 min-h-[40px] text-[12.5px] leading-6 text-text-dim">{plan.audience}</p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-serif text-[40px] font-medium leading-none tracking-tight text-text">
          {isFree ? '€0' : `€${Math.round(perMonth)}`}
        </span>
        <span className="text-[12px] text-text-faint">{isFree ? 'forever' : '/ month'}</span>
      </div>
      <div className="mt-1.5 h-4 font-mono text-[10.5px] text-text-faint">
        {!isFree &&
          (billing === 'annual'
            ? `billed €${plan.annual.toLocaleString('en-US')} / year · ex VAT`
            : 'billed monthly · ex VAT')}
      </div>

      <ul className="mt-5 space-y-2.5">
        {plan.summary.map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-[13px] leading-6 text-text-dim">
            <Check size={14} className={cn('mt-1 shrink-0', plan.featured ? 'text-gold' : 'text-green')} />
            {line}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1" />
      <Button
        href={plan.href}
        tone={plan.featured ? 'primary' : 'subtle'}
        size="lg"
        className="w-full"
        iconRight={<ArrowRight size={13} />}
      >
        {plan.cta}
      </Button>
    </article>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={15} className="text-green" aria-label="Included" />;
  if (value === false) return <Minus size={15} className="text-text-faint/60" aria-label="Not included" />;
  return <span className="font-mono text-[12px] font-semibold text-text">{value}</span>;
}
