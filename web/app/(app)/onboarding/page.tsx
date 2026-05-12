import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Onboarding' };

/**
 * /onboarding — three-step wizard that creates the user's first company.
 *
 * Short-circuit: if the user already has at least one company, send them
 * straight to the dashboard. This way returning users don't re-onboard.
 */
export default async function OnboardingPage() {
  const supabase = createClient();
  const { count } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true });

  if ((count ?? 0) > 0) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-16">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-block rounded-full border border-cyan/20 bg-cyan/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
          — onboarding —
        </div>
        <h1
          className="font-serif font-normal leading-tight tracking-tight text-text"
          style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.025em' }}
        >
          Let&rsquo;s set up your <span className="text-gradient-gold">first company</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-relaxed text-text-dim">
          Three short steps. We need just enough context to anchor the valuation to the
          right peer group — you can fill in the rest later.
        </p>
      </div>

      <OnboardingWizard />
    </div>
  );
}
