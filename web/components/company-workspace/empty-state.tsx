import Link from 'next/link';
import { ArrowLeft, ArrowRight, PenLine, Sparkles } from 'lucide-react';
import type { AidaSnapshot } from '@/lib/aida';
import { CompanyPassport } from '@/components/cockpit/company-passport';
import { Surface } from '@/components/vip-ui/surface';
import { SectionHeader } from '@/components/vip-ui/section-header';
import { Button } from '@/components/vip-ui/button';

/**
 * CompanyEmptyState — rendered when AIDA knows the company but no
 * diagnostic has been submitted yet. The Passport sits up top so the
 * founder sees the public picture immediately; the CTA card under it
 * explains what the diagnostic will unlock.
 */
export function CompanyEmptyState({
  snapshot,
  taxCode,
}: {
  snapshot: AidaSnapshot;
  taxCode: string;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-5">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
        >
          <ArrowLeft size={13} /> All companies
        </Link>
      </div>

      <CompanyPassport
        snapshot={snapshot}
        taxCode={taxCode}
        status="not_diagnosed"
        actions={
          <Button
            href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
            tone="primary"
            size="md"
            icon={<PenLine size={13} />}
          >
            Run diagnostic
          </Button>
        }
      />

      <Surface tone="raised" padding="lg" className="mt-6">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/[0.12] text-gold">
            <Sparkles size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <SectionHeader
              eyebrow="Unlock the cockpit"
              title="Bring this company to life."
              description="The factsheet above is the public picture. Answer the 19-question diagnostic — about five minutes — to get a strategic enterprise value, the four-capital scorecard, a Top-3 action plan and an interactive scenario lab. You can also override the AIDA financials with your own current numbers."
            />
          </div>
          <Button
            href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
            tone="primary"
            size="lg"
            iconRight={<ArrowRight size={14} />}
          >
            Start the diagnostic
          </Button>
        </div>
      </Surface>
    </div>
  );
}
