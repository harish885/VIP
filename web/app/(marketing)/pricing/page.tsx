import Link from 'next/link';
import { ArrowRight, Database, ShieldCheck, Scale } from 'lucide-react';
import { PricingPlans } from '@/components/marketing/pricing-plans';

export const metadata = {
  title: 'Pricing',
  description:
    'Plans for founders and advisors. Every tier runs the same calibrated valuation engine — pay for coverage, not for a better model.',
};

/**
 * /pricing — subscription plans.
 *
 * Register: same as the rest of the marketing surface. No discount
 * theatre, no feature-gating of the methodology — the model is the
 * model on every tier; paid plans buy coverage, overrides, scenarios
 * and output. Terminal-style density, calm presentation.
 */
export default function PricingPage() {
  return (
    <div className="relative mx-auto min-h-screen max-w-[1180px] px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      {/* Hero */}
      <section className="max-w-[760px]">
        <div className="inline-flex items-center gap-2 rounded-md border border-line bg-bg-1/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
          <Scale size={11} />
          Pricing
        </div>

        <h1 className="mt-5 font-serif text-[40px] font-medium leading-[1.02] tracking-tight text-text sm:text-[54px]">
          One engine. <span className="text-gradient-gold italic">Priced by coverage.</span>
        </h1>

        <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-text-dim sm:text-[16px]">
          Every plan runs the identical calibrated model — the same formula, the same
          14,999-company benchmark, the same provenance on every number. Paying more
          never buys a different answer; it buys more companies, more control, and
          more output.
        </p>
      </section>

      {/* Plans + table + FAQ (client: billing toggle) */}
      <PricingPlans />

      {/* Principles strip */}
      <section className="mt-14 grid gap-3 md:grid-cols-3" aria-label="Pricing principles">
        <Principle
          icon={<Database size={15} />}
          title="Same model on every tier"
          body="Free or paid, V = EBITDA × M × SQF × GF against the full AIDA cohort. We don't sell accuracy back to you in instalments."
        />
        <Principle
          icon={<ShieldCheck size={15} />}
          title="No lock-in"
          body="Cancel from your account in two clicks. Your diagnostics and valuation history export with you."
        />
        <Principle
          icon={<Scale size={15} />}
          title="Honest billing"
          body="Prices ex VAT, no usage surprises, no per-seat arithmetic puzzles. Annual is ten months for twelve — that's the whole trick."
        />
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[11px] uppercase tracking-[0.18em] text-text-faint">
        <span>VIP · Value Intelligence Platform</span>
        <Link href="/how-it-works" className="inline-flex items-center gap-1.5 hover:text-text-dim">
          Method detail <ArrowRight size={11} />
        </Link>
      </footer>
    </div>
  );
}

function Principle({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-line bg-bg-1 p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-bg-2 text-gold">
        {icon}
      </div>
      <h2 className="mt-4 text-[15px] font-semibold text-text">{title}</h2>
      <p className="mt-2 text-[12.5px] leading-6 text-text-dim">{body}</p>
    </article>
  );
}
