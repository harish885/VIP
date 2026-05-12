import { DiagnosticForm } from '@/components/diagnostic/diagnostic-form';

export const metadata = { title: 'Diagnostic' };

/**
 * /diagnostic — the questionnaire entrepreneurs fill in to get a valuation.
 *
 * Demo mode: form submissions are validated server-side then short-circuited
 * (no DB write) and the user lands on the seeded ACME dashboard. When auth
 * comes back online the same form writes to vip.submissions automatically.
 */
export default function DiagnosticPage() {
  return (
    <div className="relative">
      {/* Page header */}
      <div className="border-b border-line bg-bg-1/40 backdrop-blur-glass">
        <div className="mx-auto max-w-[920px] px-6 py-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
            <span className="block h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
            Diagnostic
          </div>
          <h1
            className="font-serif font-normal leading-tight tracking-tight text-text"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.03em' }}
          >
            Run your <span className="text-gradient-gold">value diagnostic.</span>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] leading-relaxed text-text-dim">
            ~5 minutes. 17 inputs across three families — hard numbers, an honest 1–5
            self-assessment, and the strategic context that anchors the model to your peer
            group. The output is the dashboard you just saw, calibrated to your company.
          </p>
        </div>
      </div>

      <DiagnosticForm />
    </div>
  );
}
