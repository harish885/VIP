import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'How scores are calculated · VIP' };

/**
 * /method
 *
 * Plain-language methodology page. Block by block, no overcrowding.
 * Audience is the entrepreneur, not the data scientist — equations are
 * shown only where they clarify intent, not as a flex.
 */
export default function MethodPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4 pb-20 pt-8 sm:px-6">
      <div className="mb-5">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
        >
          <ArrowLeft size={13} /> Back to companies
        </Link>
      </div>

      <header className="mb-8">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan sm:tracking-eyebrow">
          Methodology
        </div>
        <h1 className="mt-2 font-serif text-[31px] font-medium leading-[1.07] text-text sm:text-[36px]">
          How a company is scored, valued, and given a Top-3.
        </h1>
        <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed text-text-dim">
          The platform takes a small number of essential inputs and returns a
          credible picture of a company&apos;s strategic value, its quality
          structure, and the actions that could grow it. Here is exactly how.
        </p>
      </header>

      <Section eyebrow="01 · Model" title="The four capitals">
        <p>
          A company&apos;s value is not just its EBITDA. It is the result of four
          distinct forms of capital working together. We assess each separately,
          then combine them into a single strategic quality signal.
        </p>
        <ul className="mt-4 space-y-2">
          <Pillar
            label="Financial"
            text="Profitability, revenue growth, recurring revenue, client concentration, leverage, cash quality."
          />
          <Pillar
            label="Technological"
            text="Digital maturity, automation, proprietary IP, enabling systems, R&D intensity."
          />
          <Pillar
            label="Human & Organisational"
            text="Founder dependency, second-line management, process formalisation, transferability."
          />
          <Pillar
            label="Relational"
            text="Client portfolio quality, strategic partnerships, reputation, network position."
          />
        </ul>
      </Section>

      <Section eyebrow="02 · Inputs" title="Where the numbers come from">
        <p>
          We deliberately keep the input footprint small. The smartest model is
          not the one with the most variables; it is the one that selects the
          most relevant ones.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Block title="AIDA / Bureau van Dijk">
            <p>
              For every Italian SME in the calibration set, we pull the latest
              available year of financials and structural data directly:
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>Revenue (3-year history)</li>
              <li>EBITDA &amp; margin</li>
              <li>Total assets, equity, net financial position</li>
              <li>R&amp;D expense, intangible/tangible assets, IP</li>
              <li>Employees, added value, governance counts</li>
              <li>Sector classification (ATECO / NACE) &amp; peer group</li>
            </ul>
          </Block>
          <Block title="Your questionnaire">
            <p>
              The entrepreneur answers 19 short statements on a 1–5 scale plus
              two classificatory choices. Roughly five minutes.
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>4 questions for technological capital</li>
              <li>4 questions for human &amp; organisational capital</li>
              <li>4 questions for relational capital</li>
              <li>2 questions for growth quality and scalability</li>
              <li>3 questions for business lifecycle, distinctive assets, M&amp;A history</li>
              <li>2 classificatory: stated objective &amp; time horizon</li>
            </ul>
          </Block>
        </div>
      </Section>

      <Section eyebrow="03 · Pipeline" title="Six stages, end to end">
        <p>
          We never apply a single formula in isolation. The pipeline is
          deliberately layered so each step is interpretable on its own.
        </p>
        <ol className="mt-4 space-y-3 text-text-dim">
          <Stage n={1} title="Metric engineering">
            Derive ~12 metrics from the raw inputs — for example revenue CAGR,
            EBITDA margin, R&amp;D ratio, qualitative-to-0–100 maps.
          </Stage>
          <Stage n={2} title="Peer percentile rank">
            Each quantitative metric is positioned against the AIDA peer group
            for the same NACE prefix. Where the cohort is too thin, the model
            falls back to a broader prefix, then to a synthetic prior.
          </Stage>
          <Stage n={3} title="Within-capital aggregation">
            Per-metric percentiles fold into a single 0–100 score per pillar,
            using transparent weighted means.
          </Stage>
          <Stage n={4} title="Composite quality">
            The four capital scores combine into a Composite Quality Score
            (CQS, 0–100) and a Strategic Quality Factor (SQF, 0.6–1.4).
          </Stage>
          <Stage n={5} title="Growth factor">
            A separate growth factor (GF, 0.7–1.5) is computed from revenue
            CAGR, lifecycle stage, and scalability.
          </Stage>
          <Stage n={6} title="Valuation">
            The headline value V is the product of EBITDA, the sector multiple,
            SQF, and GF. A potential value reflects the predicted uplift if
            the Top-3 actions were enacted.
          </Stage>
        </ol>
      </Section>

      <Section eyebrow="04 · Quality" title="The Strategic Quality Factor">
        <p>
          SQF is the lens through which the platform rewards what an
          entrepreneur already knows matters: a diversified client base, a
          credible second line of management, real digital backbone, defensible
          relational position. It bounds the multiplier swing to
          {' '}<Code>0.6 – 1.4</Code>, so it can lift or temper the value, never
          fabricate it.
        </p>
        <Formula
          label="Composite Quality Score"
          body="CQS = 0.35 · Financial  +  0.20 · Technological  +  0.25 · Human  +  0.20 · Relational"
        />
        <Formula label="SQF" body="SQF = 0.6  +  (CQS / 100) · 0.8" />
        <p className="mt-3 text-[12.5px] text-text-faint">
          Within each capital, sub-scores combine via weighted means tuned against
          the AIDA cohort. Weights live in <Code>web/lib/scoring/aggregate.ts</Code>.
        </p>
      </Section>

      <Section eyebrow="05 · Growth" title="The Growth Factor">
        <p>
          GF captures expected trajectory rather than current state. It pulls
          on three signals: how fast the company has been growing, where it
          sits in its lifecycle, and how scalable the business model is.
        </p>
        <Formula label="GF (clamped 0.7–1.5)" body="GF = (1 + 0.4 · clamp(CAGR / 100, −0.3, 0.5))  ·  lifecycle_modifier  ·  scalability_modifier" />
        <p className="mt-3 text-[12.5px] text-text-faint">
          Lifecycle modifiers favour Early/Growth profiles; scalability
          modifier nudges by ±3% per 1–5 self-assessment level.
        </p>
      </Section>

      <Section eyebrow="06 · Sector" title="The sector multiple">
        <p>
          The base multiple is drawn from European mid-market deal databases
          (Argos Mid-Market Index, EY Capital Briefing, Mergermarket) and
          discounted by 25% to reflect the illiquidity of unlisted SMEs.
          Lookup precedence: exact 3-digit NACE → 2-digit prefix → high-level
          sector label → catch-all default.
        </p>
        <Formula label="M_sector" body="base_multiple_for_NACE  ×  0.75   (illiquidity discount)" />
      </Section>

      <Section eyebrow="07 · Headline" title="Putting it together">
        <Formula label="Company value" body="V  =  EBITDA  ×  M_sector  ×  SQF  ×  GF" />
        <p>
          The displayed range is <Code>V × 0.90</Code> to <Code>V × 1.12</Code>
          — asymmetric because real M&amp;A outcomes carry a heavier upside
          tail. The potential value <Code>V_potential</Code> is the same
          formula recomputed with the Top-3 action uplifts applied to SQF and
          GF, and the value gap is the percentage distance between them.
        </p>
      </Section>

      <Section eyebrow="08 · Actions" title="From diagnosis to a Top-3">
        <p>
          We maintain a curated catalogue of structured interventions, each
          described by the capital it improves, the SQF and/or GF uplift it
          delivers, an effort score (1–5), and a time-to-impact in months.
          A <Code>fires_when</Code> predicate decides whether the action is
          relevant to a given profile.
        </p>
        <Formula
          label="Return on Value (ROV)"
          body="ROV  =  ΔV%  /  (effort_score × time_to_impact_months)  ×  objective_weight"
        />
        <p>
          Predicted ΔV is computed by re-running the valuation math with the
          uplifted SQF and GF — so the recommendation panel always agrees with
          the headline V. We then rank by ROV and surface the top three. The
          stated-objective weight lets a company focused on, say, exit
          preparation see succession-relevant actions float higher.
        </p>
      </Section>

      <Section eyebrow="09 · Risk" title="Risk index &amp; fragility flags">
        <p>
          A handful of binary flags surface specific structural weaknesses:
          excessive client concentration, severe founder dependency, very low
          digital maturity, fragile margins. The Risk Index then summarises
          the count of fired flags as <Code>LOW</Code>, <Code>MEDIUM</Code>,
          or <Code>HIGH</Code>. It is not a probability of failure — it is a
          short, opinionated signal of where the company is exposed.
        </p>
      </Section>

      <Section eyebrow="10 · Scenario lab" title="What happens if we improve key levers?">
        <p>
          The Scenario Lab on every company workspace lets the entrepreneur
          move three slider levers — top-3 client concentration, recurring
          revenue share, R&amp;D / revenue ratio — and see the headline value
          recompute live. The math runs entirely client-side, calling the
          same scoring module the server used to produce the original
          numbers, so there is never any drift between displayed and computed
          values.
        </p>
      </Section>

      <Section eyebrow="11 · Honest" title="What the model does not pretend to do">
        <ul className="mt-2 list-disc pl-5 text-text-dim">
          <li>It is not a substitute for a formal valuation by an M&amp;A advisor.</li>
          <li>It is calibrated on Italian SMEs in NACE 28xx; other sectors fall back to broader priors.</li>
          <li>Recurring revenue and top-3 client concentration are not in AIDA — we proxy them from the matching qualitative answers.</li>
          <li>The risk index is opinionated, not statistical. It is meant to draw attention, not to forecast failure.</li>
        </ul>
      </Section>

      <footer className="mt-12 border-t border-line pt-6 text-[11px] uppercase leading-relaxed tracking-[0.22em] text-text-faint sm:tracking-eyebrow">
        Calibration set · 14 999 Italian SMEs · AIDA · Bureau van Dijk
      </footer>
    </div>
  );
}

// =============================================================================
// Building blocks
// =============================================================================
function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 rounded-2xl border border-line bg-bg-1 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-text-faint sm:tracking-eyebrow">
        {eyebrow}
      </div>
      <h2 className="mt-1 font-serif text-[21px] font-medium text-text sm:text-[22px]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[13.5px] leading-relaxed text-text-dim">
        {children}
      </div>
    </section>
  );
}

function Pillar({ label, text }: { label: string; text: string }) {
  return (
    <li className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
      <span className="mt-0.5 inline-flex w-fit shrink-0 rounded-md border border-line bg-bg-2/70 px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-text sm:tracking-eyebrow">
        {label}
      </span>
      <span className="text-text-dim">{text}</span>
    </li>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-bg-2/40 p-5">
      <h3 className="font-serif text-[15px] font-medium text-text">{title}</h3>
      <div className="mt-2 text-[13px] leading-relaxed text-text-dim">
        {children}
      </div>
    </div>
  );
}

function Stage({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.08] font-mono text-[11px] font-semibold text-gold">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-text">{title}</div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-text-dim">{children}</div>
      </div>
    </li>
  );
}

function Formula({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-4 rounded-xl border border-line bg-bg-2/40 p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-text-faint sm:tracking-eyebrow">
        {label}
      </div>
      <div className="mt-1.5 break-words font-mono text-[12.5px] leading-relaxed text-text sm:text-[13.5px]">{body}</div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-bg-2/70 px-1.5 py-0.5 font-mono text-[12px] text-text">
      {children}
    </code>
  );
}
