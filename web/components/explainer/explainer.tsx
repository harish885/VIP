import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CapitalGlyph } from '@/components/cockpit/capital-glyph';
import { SourceBadge } from '@/components/vip-ui/source-badge';
import { formatEurCompact, round1 } from '@/lib/format';
import { cn } from '@/lib/cn';

// =============================================================================
// Story contract — built server-side by app/(app)/how-it-works/page.tsx.
// Do not change shapes here without updating the page.
// =============================================================================
type Fact = {
  label: string;
  value: string;
  detail: string;
};

type QuestionnaireCategory = {
  name: string;
  count: number;
};

type ComparisonMetric = {
  label: string;
  raw: string;
  percentile: number;
};

type CapitalSignal = {
  label: string;
  weight: number;
  score: number;
};

type CapitalAssembly = {
  key: 'financial' | 'technological' | 'human' | 'relational';
  name: string;
  score: number;
  pillarWeight: number;
  story: string;
  signals: CapitalSignal[];
};

type Recommendation = {
  id: string;
  rank: 1 | 2 | 3;
  title: string;
  description: string;
  impactLabel: string;
  deltaSqf: number;
  deltaGf: number;
  upliftPct: number;
  horizonMonths: number;
};

type BaselineInput = {
  recurring_revenue_pct: number;
  top3_client_concentration: number;
  tech_investment_ratio_pct: number;
  lifecycle_stage: string;
  stated_objective: string;
  time_horizon: string;
};

export type ExplainerStory = {
  mode: 'real' | 'illustrative';
  company: {
    name: string;
    province: string;
    naceCode: string;
    description: string;
    sizeLabel: string;
    peerGroupLabel: string;
    peerFallbackLabel: string;
  };
  facts: Fact[];
  questionnaire: {
    totalQuestions: number;
    categories: QuestionnaireCategory[];
    examples: string[];
  };
  comparison: {
    peerGroupLabel: string;
    peerGroupSize: string | number;
    fallbackLabel: string;
    metrics: ComparisonMetric[];
  };
  capitalAssemblies: CapitalAssembly[];
  valueModel: {
    ebitda: number;
    multiple: number;
    sqf: number;
    gf: number;
    valueCurrent: number;
    valueLow: number;
    valueHigh: number;
    valuePotential: number;
    valueGapPct: number;
    qualityScore: number;
    riskIndex: string;
  };
  recommendations: Recommendation[];
  actionCatalogueCount: number;
  baseline: BaselineInput;
};

const GLYPH_KEY: Record<CapitalAssembly['key'], 'fin' | 'tech' | 'human' | 'rel'> = {
  financial: 'fin',
  technological: 'tech',
  human: 'human',
  relational: 'rel',
};

const CAPITAL_DOT: Record<CapitalAssembly['key'], string> = {
  financial: 'bg-cap-fin',
  technological: 'bg-cap-tech',
  human: 'bg-cap-human',
  relational: 'bg-cap-rel',
};

const CHAPTERS = [
  'The public record',
  'What filings cannot see',
  'Good compared with whom?',
  'Four capitals, one quality factor',
  'From quality to value',
  'The three moves that matter',
  'The whole chain, worked',
] as const;

const GLOSSARY: [string, string][] = [
  ['EBITDA', 'Yearly operating profit before interest, tax and accounting effects — a clean proxy for the cash the business generates.'],
  ['Sector multiple (M)', 'Euros buyers pay per euro of profit in your industry, minus a 25% discount because private firms are harder to sell.'],
  ['Percentile (pXX)', 'Your rank against peers. p70 = better than 70% of similar companies on that measure.'],
  ['Capital score', 'A 0–100 grade for one of the four value dimensions (financial, technological, human, relational).'],
  ['CQS', 'Composite Quality Score — the four capital scores blended by weight into a single 0–100 number.'],
  ['SQF', 'Strategic Quality Factor — CQS turned into a multiplier from 0.6 to 1.4. Below 1.0 drags value down, above 1.0 lifts it.'],
  ['GF', 'Growth Factor — a 0.7–1.5 multiplier for growth rate, lifecycle stage and how easily the business scales.'],
  ['Value Gap', 'The percentage jump from today’s value to the value after the Top-3 actions — the upside you can act on.'],
  ['ROV', 'Return on Value — how much value an action adds relative to its effort and time. The Top-3 are the highest-ROV moves.'],
  ['Risk index', 'LOW / MEDIUM / HIGH, set by counting fragility flags such as heavy client concentration or founder dependency.'],
];

/**
 * Explainer — /how-it-works.
 *
 * One real company walked through the six stages of the engine, written
 * as a quiet editorial document: numbered chapters, hairline rules, one
 * visual per chapter, no card-inside-card. Reuses the cockpit's own
 * primitives (fingerprint glyph, formula stones) so the explainer looks
 * like the product it explains.
 */
export function Explainer({ story }: { story: ExplainerStory }) {
  const vm = story.valueModel;

  return (
    <div className="mx-auto max-w-[880px] px-4 pb-24 pt-10 sm:px-6">
      {/* ── Masthead ─────────────────────────────────────────────── */}
      <header>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          How it works · {story.mode === 'real' ? 'a real AIDA company' : 'illustrative profile'}
        </div>
        <h1 className="mt-4 font-serif text-[34px] font-medium leading-[1.06] tracking-tight text-text sm:text-[44px]">
          One company, read the way the engine reads it.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-7 text-text-dim">
          Six stages take {story.company.name} from public filings to a defensible
          value and three ranked moves. Every number below is the engine&rsquo;s real
          output for this company — nothing is staged.
        </p>
      </header>

      {/* ── The company, in one strip ────────────────────────────── */}
      <div className="mt-8 rounded-lg border border-line bg-bg-1 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <span className="font-serif text-[20px] font-medium text-text">{story.company.name}</span>
            <span className="ml-3 font-mono text-[11px] text-text-faint">
              {story.company.province} · NACE {story.company.naceCode}
            </span>
          </div>
          <SourceBadge source="aida" label="AIDA · Bureau van Dijk" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line-faint pt-4 sm:grid-cols-4">
          {story.facts.slice(0, 4).map((fact) => (
            <div key={fact.label} className="min-w-0">
              <div className="font-mono text-[9.5px] font-bold uppercase tracking-eyebrow text-text-faint">
                {fact.label}
              </div>
              <div className="mt-1 truncate font-serif text-[20px] font-medium leading-none text-text">
                {fact.value}
              </div>
              <div className="mt-1 truncate text-[11px] text-text-faint">{fact.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chapter index ────────────────────────────────────────── */}
      <nav aria-label="Chapters" className="mt-10 border-y border-line py-4">
        <ol className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {CHAPTERS.map((title, i) => (
            <li key={title}>
              <a
                href={`#ch-${i + 1}`}
                className="group flex items-baseline gap-3 py-0.5 text-[13px] text-text-dim transition-colors hover:text-text"
              >
                <span className="font-mono text-[10.5px] font-bold text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="group-hover:underline group-hover:underline-offset-4">{title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── 01 · The public record ───────────────────────────────── */}
      <Chapter n={1} title={CHAPTERS[0]} lede="The engine never starts from a blank form. AIDA already knows the operating footprint — the diagnostic begins from there.">
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {story.facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-line-faint pb-2.5">
              <span className="text-[13px] text-text-dim">{fact.label}</span>
              <span className="text-right">
                <span className="font-mono text-[13px] font-semibold text-text">{fact.value}</span>
                <span className="mt-0.5 block text-[10.5px] text-text-faint">{fact.detail}</span>
              </span>
            </div>
          ))}
        </div>
        <Aside>
          Peer lens available immediately: <strong className="font-medium text-text">{story.company.peerGroupLabel}</strong>.
          Two manufacturers with the same revenue can deserve very different valuations — the filings only set the
          measurable base everything else is judged against.
        </Aside>
      </Chapter>

      {/* ── 02 · What filings cannot see ─────────────────────────── */}
      <Chapter
        n={2}
        title={CHAPTERS[1]}
        lede={`${story.questionnaire.totalQuestions} diagnostic inputs add what due diligence asks and accounts never show — transferability, client mix, systems, scalability.`}
      >
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {story.questionnaire.categories.map((category) => (
            <div key={category.name} className="flex items-baseline justify-between border-b border-line-faint pb-2">
              <span className="text-[13px] text-text-dim">{category.name}</span>
              <span className="font-mono text-[12px] font-semibold text-text">{category.count} q</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-1.5">
          {story.questionnaire.examples.slice(0, 3).map((example) => (
            <p key={example} className="border-l-2 border-gold/40 pl-3 text-[13px] italic leading-6 text-text-dim">
              &ldquo;{example}&rdquo;
            </p>
          ))}
        </div>
        <Aside>
          Where the record is silent, the engine builds proxies instead of pretending: recurring revenue
          ≈ {round1(story.baseline.recurring_revenue_pct)}%, top-3 client concentration
          ≈ {round1(story.baseline.top3_client_concentration)}%, lifecycle&nbsp;
          {story.baseline.lifecycle_stage.toLowerCase()} on a {story.baseline.time_horizon.toLowerCase()} horizon.
        </Aside>
      </Chapter>

      {/* ── 03 · Benchmarking ────────────────────────────────────── */}
      <Chapter
        n={3}
        title={CHAPTERS[2]}
        lede={`An 8% margin is excellent in one niche and weak in another. Every signal is ranked inside ${story.comparison.peerGroupLabel} (${String(story.comparison.peerGroupSize)} companies) before it is allowed to mean anything.`}
      >
        <div className="mb-5 rounded-md bg-bg-2/70 px-4 py-3 text-[12.5px] leading-relaxed text-text-dim">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-eyebrow text-gold">How to read a percentile</span>
          <div className="mt-1">
            A score of <strong className="font-semibold text-text">p70</strong> means the company beats 70 out of
            100 similar firms on that measure. p50 is dead average; p90 is top-tier. We rank against the closest
            peer group first, and widen to the broader NACE sector only if that pool is too thin to be reliable.
          </div>
        </div>
        <div className="space-y-4">
          {story.comparison.metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-text-dim">{metric.label}</span>
                <span className="font-mono text-[12px] text-text-faint">
                  raw <span className="font-semibold text-text">{metric.raw}</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-bg-3">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-cyan"
                    style={{ width: `${Math.max(2, Math.min(100, metric.percentile))}%` }}
                  />
                </div>
                <span className="w-[64px] shrink-0 text-right font-mono text-[11px] font-semibold text-cyan">
                  p{Math.round(metric.percentile)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Aside>{story.comparison.fallbackLabel}</Aside>
      </Chapter>

      {/* ── 04 · Four capitals → SQF ─────────────────────────────── */}
      <Chapter
        n={4}
        title={CHAPTERS[3]}
        lede="The benchmarked signals roll up into four capital scores — the company's strategic fingerprint — and the weighted blend becomes one quality multiplier."
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-2 self-center sm:self-start">
            <CapitalGlyph
              size={104}
              capitals={story.capitalAssemblies.map((c) => ({ key: GLYPH_KEY[c.key], score: c.score }))}
            />
            <span className="font-mono text-[9.5px] uppercase tracking-eyebrow text-text-faint">
              Value fingerprint
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-3.5">
            {story.capitalAssemblies.map((capital) => (
              <div key={capital.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-[13px] font-medium text-text">
                    <span aria-hidden className={cn('h-2 w-2 rounded-full', CAPITAL_DOT[capital.key])} />
                    {capital.name}
                  </span>
                  <span className="font-mono text-[12px] text-text-faint">
                    <span className="font-semibold text-text">{capital.score}</span>/100 · {capital.pillarWeight}%
                  </span>
                </div>
                <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-bg-3">
                  <div
                    className={cn('h-full rounded-full', CAPITAL_DOT[capital.key])}
                    style={{ width: `${Math.max(2, capital.score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Per-capital breakdown — every metric inside each capital, with its weight */}
        <div className="mt-7">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-eyebrow text-text-faint">
            Inside each capital — the measures and their weights
          </div>
          <p className="mt-1.5 max-w-[64ch] text-[12.5px] leading-6 text-text-dim">
            Each capital score is a weighted average of a few benchmarked measures. A weight is just how much
            that measure counts toward the capital — they add up to 100%. Here is the full recipe, with
            {' '}{story.company.name}&rsquo;s actual numbers.
          </p>
          <div className="mt-4 grid gap-x-8 gap-y-5 lg:grid-cols-2">
            {story.capitalAssemblies.map((capital) => (
              <div key={capital.key} className="rounded-lg border border-line bg-bg-1 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-text">
                    <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', CAPITAL_DOT[capital.key])} />
                    {capital.name}
                  </span>
                  <span className="font-mono text-[11.5px] text-text-faint">
                    score <span className="font-semibold text-text">{capital.score}</span> · {capital.pillarWeight}% of CQS
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {capital.signals.map((sig) => (
                    <div key={sig.label} className="flex items-center gap-3">
                      <span className="w-[42px] shrink-0 font-mono text-[10.5px] font-semibold text-text-faint">
                        {sig.weight}%
                      </span>
                      <span className="flex-1 truncate text-[12px] text-text-dim">{sig.label}</span>
                      <div className="h-[5px] w-[64px] shrink-0 overflow-hidden rounded-full bg-bg-3">
                        <div className={cn('h-full rounded-full', CAPITAL_DOT[capital.key])} style={{ width: `${Math.max(3, sig.score)}%` }} />
                      </div>
                      <span className="w-[26px] shrink-0 text-right font-mono text-[10.5px] font-semibold text-text">
                        {sig.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-md bg-bg-2/70 px-4 py-3.5 text-[12.5px] leading-relaxed text-text-dim">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-eyebrow text-gold">Capitals → quality → multiplier</span>
          <div className="mt-2 font-mono text-[12.5px] text-text">
            CQS = {capLine(story.capitalAssemblies)}  ={' '}
            <span className="font-semibold">{vm.qualityScore}</span>/100
          </div>
          <div className="mt-1.5 font-mono text-[12.5px] text-text">
            SQF = 0.6 + ({vm.qualityScore}/100) × 0.8 ={' '}
            <span className="font-semibold text-gold">{vm.sqf.toFixed(2)}</span>
            <span className="text-text-faint"> · clamped to 0.6–1.4</span>
          </div>
          <p className="mt-2 text-[12px] italic text-text-faint">
            In words: blend the four capital scores by their weights to get one 0–100 quality number, then
            convert it to a multiplier where 50/100 is neutral (×1.0), the floor is ×0.6 and the ceiling is ×1.4.
          </p>
        </div>
      </Chapter>

      {/* ── 05 · From quality to value ───────────────────────────── */}
      <Chapter
        n={5}
        title={CHAPTERS[4]}
        lede="Earnings give the base, the sector multiple gives the market backdrop, SQF prices the quality, GF prices the trajectory. Multiplied — never averaged."
      >
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          <FormulaStone label="EBITDA" value={fmtMoney(vm.ebitda)} />
          <FormulaStone label="M sector" value={`${vm.multiple.toFixed(2)}×`} op="×" />
          <FormulaStone label="SQF" value={vm.sqf.toFixed(2)} op="×" />
          <FormulaStone label="GF" value={vm.gf.toFixed(2)} op="×" />
          <FormulaStone label="Enterprise value" value={fmtMoney(vm.valueCurrent)} op="=" result className="col-span-2 lg:col-span-1" />
        </div>
        <Aside>
          No serious valuation pretends to be a point. The band here runs{' '}
          <strong className="font-medium text-text">{fmtMoney(vm.valueLow)} – {fmtMoney(vm.valueHigh)}</strong>;
          quality {vm.qualityScore}/100, risk {vm.riskIndex}.
        </Aside>
      </Chapter>

      {/* ── 06 · The three moves ─────────────────────────────────── */}
      <Chapter
        n={6}
        title={CHAPTERS[5]}
        lede={`The engine simulates all ${story.actionCatalogueCount} catalogue actions through the same valuation math and keeps the three with the highest return on value.`}
      >
        <ol className="divide-y divide-line-faint">
          {story.recommendations.map((action) => (
            <li key={action.id} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
              <span className="mt-0.5 font-mono text-[13px] font-bold text-gold">
                {String(action.rank).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[14.5px] font-semibold text-text">{action.title}</h3>
                  <span className="rounded-md bg-green/[0.10] px-2 py-0.5 font-mono text-[11px] font-bold text-green">
                    +{action.upliftPct}% V
                  </span>
                </div>
                <p className="mt-1 max-w-[60ch] text-[13px] leading-6 text-text-dim">{action.description}</p>
                <p className="mt-1 font-mono text-[10.5px] text-text-faint">
                  {action.impactLabel} · ~{action.horizonMonths} months
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Aside>
          Executed together, the engine&rsquo;s estimate moves from{' '}
          <strong className="font-medium text-text">{fmtMoney(vm.valueCurrent)}</strong> toward{' '}
          <strong className="font-medium text-text">{fmtMoney(vm.valuePotential)}</strong> (+{vm.valueGapPct}%).
        </Aside>
      </Chapter>

      {/* ── 07 · The whole chain, worked ─────────────────────────── */}
      <Chapter
        n={7}
        title={CHAPTERS[6]}
        lede={`One number, traced end to end. Here is exactly how ${story.company.name}'s answers and filing become a single euro figure — nothing hidden.`}
      >
        <ol className="space-y-3">
          {[
            ["Read the filing", `EBITDA ${fmtMoney(vm.ebitda)} and 3 years of revenue come straight from AIDA. The owner types none of it.`],
            ["Derive the measures", `Turn raw data + the 19 answers into ~16 comparable measures (margin, CAGR, recurring %, concentration, digital maturity…).`],
            ["Rank vs peers", `Score each measure against the peer group — e.g. EBITDA margin lands at ${pctOf(story, 'EBITDA margin')}, meaning it beats that share of similar firms.`],
            ["Build four capitals", `Blend the ranked measures by weight into Financial ${capScore(story, 'fin')}, Technological ${capScore(story, 'tech')}, Human ${capScore(story, 'human')}, Relational ${capScore(story, 'rel')}.`],
            ["Blend into quality", `Weight the four capitals (35/20/25/20) into one Composite Quality Score of ${vm.qualityScore}/100.`],
            ["Convert to SQF", `0.6 + (${vm.qualityScore}/100) × 0.8 = ${vm.sqf.toFixed(2)} — the quality multiplier.`],
            ["Price the growth", `CAGR + lifecycle + scalability give a Growth Factor of ${vm.gf.toFixed(2)}.`],
            ["Multiply", `${fmtMoney(vm.ebitda)} × ${vm.multiple.toFixed(1)} × ${vm.sqf.toFixed(2)} × ${vm.gf.toFixed(2)} = ${fmtMoney(vm.valueCurrent)}.`],
          ].map((row, i) => (
            <li key={row[0]} className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/50 font-mono text-[11px] font-bold text-gold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 border-b border-line-faint pb-3">
                <div className="text-[13.5px] font-semibold text-text">{row[0]}</div>
                <div className="mt-0.5 max-w-[72ch] text-[12.5px] leading-6 text-text-dim">{row[1]}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-lg border border-gold/40 bg-gold/[0.07] px-5 py-4">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-eyebrow text-gold">Result</span>
          <div className="mt-1 font-serif text-[26px] font-medium text-text">
            {fmtMoney(vm.valueCurrent)}
            <span className="ml-3 text-[14px] font-normal text-text-faint">
              range {fmtMoney(vm.valueLow)} – {fmtMoney(vm.valueHigh)}
            </span>
          </div>
        </div>

        {/* Glossary */}
        <div className="mt-8">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-eyebrow text-text-faint">Every term, in one place</div>
          <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {GLOSSARY.map((g) => (
              <div key={g[0]} className="border-b border-line-faint pb-2.5">
                <div className="text-[13px] font-semibold text-text">{g[0]}</div>
                <div className="mt-0.5 text-[12px] leading-6 text-text-dim">{g[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </Chapter>

      {/* ── Close ────────────────────────────────────────────────── */}
      <footer className="mt-14 border-t border-line pt-8">
        <p className="max-w-[52ch] font-serif text-[22px] font-medium leading-snug text-text">
          Worth today, what drives it, what to do next —{' '}
          <span className="text-gradient-gold italic">that&rsquo;s the whole product.</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-md border border-gold/55 bg-gold/[0.14] px-4 py-2.5 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/[0.22]"
          >
            Run it on a real company <ArrowRight size={13} />
          </Link>
          <Link
            href="/technical"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-bg-1 px-4 py-2.5 text-[13px] font-semibold text-text-dim transition-colors hover:border-line-2 hover:text-text"
          >
            Technical deep-dive
          </Link>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// Local primitives
// =============================================================================

function Chapter({
  n,
  title,
  lede,
  children,
}: {
  n: number;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`ch-${n}`} className="mt-14 scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[12px] font-bold text-gold">{String(n).padStart(2, '0')}</span>
        <h2 className="font-serif text-[24px] font-medium leading-tight tracking-tight text-text">{title}</h2>
      </div>
      <p className="mt-2.5 max-w-[60ch] text-[14px] leading-7 text-text-dim">{lede}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Quiet margin note — one per chapter, never a card-in-card. */
function Aside({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 border-l-2 border-line pl-3.5 text-[12.5px] leading-6 text-text-faint">
      {children}
    </p>
  );
}

function FormulaStone({
  label,
  value,
  op,
  result,
  className,
}: {
  label: string;
  value: string;
  op?: string;
  result?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {op && (
        <span
          aria-hidden
          className="absolute -left-[13px] top-1/2 hidden -translate-y-1/2 font-serif text-[15px] text-text-faint lg:block"
        >
          {op}
        </span>
      )}
      <div
        className={cn(
          'rounded-lg border px-3.5 py-3',
          result ? 'border-gold/40 bg-gold/[0.08]' : 'border-line bg-bg-1',
        )}
      >
        <div className={cn(
          'font-mono text-[9.5px] font-bold uppercase tracking-eyebrow',
          result ? 'text-gold' : 'text-text-faint',
        )}>
          {label}
        </div>
        <div className="mt-1.5 truncate font-serif text-[18px] font-medium leading-none tracking-tight text-text">
          {value}
        </div>
      </div>
    </div>
  );
}

function fmtMoney(value: number): string {
  return formatEurCompact(value, { decimals: 1, zero: '€0' });
}

function capScore(story: ExplainerStory, key: CapitalAssembly['key'] | 'fin' | 'tech' | 'human' | 'rel'): number {
  const map: Record<string, CapitalAssembly['key']> = { fin: 'financial', tech: 'technological', human: 'human', rel: 'relational' };
  const realKey = (map[key] ?? key) as CapitalAssembly['key'];
  return story.capitalAssemblies.find((c) => c.key === realKey)?.score ?? 0;
}

function pctOf(story: ExplainerStory, label: string): string {
  const m = story.comparison.metrics.find((x) => x.label.toLowerCase().includes(label.toLowerCase()));
  return m ? `p${Math.round(m.percentile)}` : 'its peer rank';
}

function capLine(assemblies: CapitalAssembly[]): string {
  return assemblies.map((c) => `${c.score}×${c.pillarWeight}%`).join(' + ');
}
