import Link from 'next/link';
import {
  ArrowRight,
  BadgeHelp,
  BarChart3,
  Building2,
  CircleDollarSign,
  Factory,
  Layers3,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

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

const STEP_TITLES = [
  'Start from the company',
  'Add what filings cannot see',
  'Turn raw inputs into signals',
  'Build the four capital scores',
  'Convert quality into value',
  'Rank the next best moves',
] as const;

const CAPITAL_ACCENTS: Record<CapitalAssembly['key'], string> = {
  financial: 'bg-emerald-500',
  technological: 'bg-cyan-500',
  human: 'bg-amber-500',
  relational: 'bg-fuchsia-500',
};

const CAPITAL_TINTS: Record<CapitalAssembly['key'], string> = {
  financial: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  technological: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  human: 'bg-amber-50 text-amber-900 ring-amber-200',
  relational: 'bg-fuchsia-50 text-fuchsia-900 ring-fuchsia-200',
};

export function Explainer({ story }: { story: ExplainerStory }) {
  const marginFact = story.facts.find((fact) => fact.label === 'EBITDA');
  const revenueFact = story.facts.find((fact) => fact.label === 'Revenue');
  const employeesFact = story.facts.find((fact) => fact.label === 'Employees');
  const rdFact = story.facts.find((fact) => fact.label === 'R&D intensity');
  const topAction = story.recommendations[0];
  const secondAction = story.recommendations[1];
  const thirdAction = story.recommendations[2];

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
        <header className="rounded-[24px] border border-stone-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(24,24,27,0.06)] backdrop-blur sm:rounded-[28px] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-stone-600 sm:text-xs sm:tracking-[0.28em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {story.mode === 'real' ? 'Real AIDA company example' : 'Illustrative walkthrough'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-emerald-700 sm:text-xs sm:tracking-[0.28em]">
                  <Factory className="h-3.5 w-3.5" />
                  Manufacturing SME
                </span>
              </div>
              <h1 className="max-w-3xl text-2xl font-semibold leading-tight text-stone-950 min-[390px]:text-3xl sm:text-5xl">
                How VIP reads one company, scores its quality, and turns that into practical next moves.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                This page follows one real company through the same logic the product uses in the diagnostic flow:
                public company facts first, entrepreneur input next, then peer comparison, capital scoring, valuation,
                and action ranking.
              </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:w-[420px] lg:grid-cols-1 lg:self-stretch">
              <KeyMetric
                label="Company value today"
                value={formatMoney(story.valueModel.valueCurrent)}
                detail={`Range ${formatMoney(story.valueModel.valueLow)} - ${formatMoney(story.valueModel.valueHigh)}`}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <KeyMetric label="Quality" value={`${story.valueModel.qualityScore}/100`} detail="Composite score" />
                <KeyMetric label="Risk" value={story.valueModel.riskIndex} detail="Fragility signal" />
                <KeyMetric
                  label="Potential"
                  value={formatMoney(story.valueModel.valuePotential)}
                  detail={`Gap +${story.valueModel.valueGapPct}%`}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-[22px] border border-stone-200 bg-stone-50 p-5 sm:rounded-[24px] sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-700 sm:text-xs sm:tracking-[0.35em]">The company we follow</p>
                  <h2 className="mt-3 text-2xl font-semibold text-stone-950 sm:text-3xl">{story.company.name}</h2>
                  <p className="mt-2 text-base text-stone-600">
                    {story.company.province} · {story.company.naceCode} · {story.company.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-3 text-stone-500">
                  <Building2 className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {story.facts.map((fact) => (
                  <div key={fact.label} className="rounded-[22px] border border-stone-200 bg-white p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500 sm:tracking-[0.32em]">{fact.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-stone-950 sm:text-3xl">{fact.value}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">{fact.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-stone-200 bg-white p-5 sm:rounded-[24px] sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-700 sm:text-xs sm:tracking-[0.35em]">What this example is showing</p>
              <div className="mt-4 space-y-4 text-stone-600">
                <p className="text-lg leading-8">
                  VIP does not start from a blank form. It starts from a known operating footprint, then asks the
                  entrepreneur for the strategic truth that financial filings cannot capture.
                </p>
                <div className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4">
                  <p className="font-medium text-stone-900">What was already known from AIDA</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Revenue, EBITDA, headcount, sector context, and peer-group positioning are already available before
                    the questionnaire begins.
                  </p>
                </div>
                <div className="rounded-[22px] border border-amber-100 bg-amber-50/70 p-4">
                  <p className="font-medium text-stone-900">What the entrepreneur adds</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Questions about digital maturity, founder dependence, client concentration, partnerships,
                    scalability, and strategic objective complete the picture.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 rounded-[24px] border border-stone-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-6">
          {STEP_TITLES.map((title, index) => (
            <a
              key={title}
              href={`#step-${index + 1}`}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 transition hover:border-stone-300 hover:bg-white"
            >
              <span className="block text-[11px] uppercase tracking-[0.28em] text-stone-400">Step {index + 1}</span>
              <span className="mt-1 block font-medium text-stone-900">{title}</span>
            </a>
          ))}
        </nav>

        <main className="mt-8 space-y-8">
          <StorySection
            id="step-1"
            icon={<Building2 className="h-5 w-5" />}
            step="Step 1"
            title="Start from the company, not from guesswork."
            intro={`For ${story.company.name}, VIP begins with the public company footprint already available in AIDA.`}
          >
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Panel>
                <p className="text-base leading-8 text-stone-700">
                  That gives the model an initial operating picture straight away: turnover, earnings, people, sector,
                  and comparable-company context. In this example, the company enters the process already carrying a
                  revenue base of <strong className="text-stone-950">{revenueFact?.value ?? '—'}</strong>, EBITDA of{' '}
                  <strong className="text-stone-950">{marginFact?.value ?? '—'}</strong>, and{' '}
                  <strong className="text-stone-950">{employeesFact?.value ?? '—'}</strong> employees.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <EvidencePill label="Revenue history" value={revenueFact?.detail ?? 'Latest filing'} />
                  <EvidencePill label="Earnings quality" value={marginFact?.detail ?? 'EBITDA context'} />
                  <EvidencePill label="People base" value={employeesFact?.detail ?? 'Workforce scale'} />
                  <EvidencePill label="Innovation signal" value={rdFact?.value ?? 'Not available'} />
                </div>
              </Panel>

              <Panel tone="soft">
                <div className="flex items-start gap-3">
                  <BadgeHelp className="mt-1 h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="font-medium text-stone-950">Why this matters</p>
                    <p className="mt-2 text-base leading-8 text-stone-700">
                      Two manufacturing companies can have similar revenue and still deserve very different valuations.
                      So the AIDA facts do not finish the diagnosis. They establish the measurable base that everything
                      else will be judged against.
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-[20px] border border-stone-200 bg-white p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Peer lens available immediately</p>
                  <p className="mt-2 text-lg font-medium text-stone-950">{story.company.peerGroupLabel}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {story.company.peerFallbackLabel}. This is how the model avoids judging the company in isolation.
                  </p>
                </div>
              </Panel>
            </div>
          </StorySection>

          <StorySection
            id="step-2"
            icon={<Users className="h-5 w-5" />}
            step="Step 2"
            title="Add what filings cannot see."
            intro={`The entrepreneur then adds the missing strategic picture through ${story.questionnaire.totalQuestions} qualitative questions.`}
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <Panel tone="soft">
                <p className="text-base leading-8 text-stone-700">
                  These answers do not try to replace the financials. They complement them. The model is asking about
                  the business characteristics that usually matter in due diligence but rarely appear in accounts.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {story.questionnaire.categories.map((category) => (
                    <div key={category.name} className="rounded-[20px] border border-stone-200 bg-white p-4">
                      <p className="text-sm font-medium text-stone-900">{category.name}</p>
                      <p className="mt-2 text-sm text-stone-500">{category.count} questions</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Examples of what gets asked</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {story.questionnaire.examples.map((example) => (
                    <span
                      key={example}
                      className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700"
                    >
                      {example}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <SmallStat
                    label="Recurring revenue proxy"
                    value={`${round1(story.baseline.recurring_revenue_pct)}%`}
                    detail="Derived partly from client quality and growth quality answers"
                  />
                  <SmallStat
                    label="Top-3 client concentration proxy"
                    value={`${round1(story.baseline.top3_client_concentration)}%`}
                    detail="A proxy for fragility when customer mix is not directly available"
                  />
                  <SmallStat
                    label="Lifecycle stage used for GF"
                    value={story.baseline.lifecycle_stage}
                    detail={`${story.baseline.time_horizon} horizon · ${humanizeObjective(story.baseline.stated_objective)}`}
                  />
                </div>
              </Panel>
            </div>
          </StorySection>

          <StorySection
            id="step-3"
            icon={<BarChart3 className="h-5 w-5" />}
            step="Step 3"
            title="Turn raw facts and answers into comparable signals."
            intro="The model cannot compare a 1–5 questionnaire answer with an EBITDA margin directly, so it converts everything into a common scoring language."
          >
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
              <Panel tone="soft">
                <p className="font-medium text-stone-950">How comparison works in this build</p>
                <ol className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
                  <li>1. Quantitative signals are ranked relative to comparable companies.</li>
                  <li>2. The model tries the closest peer group first.</li>
                  <li>3. If that pool is too thin, it widens to the broader NACE prefix.</li>
                  <li>4. Some signals have no direct AIDA field, so calibrated priors are used instead.</li>
                </ol>

                <div className="mt-5 rounded-[20px] border border-stone-200 bg-white p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Peer comparison lens</p>
                  <p className="mt-2 text-lg font-medium text-stone-950">{story.comparison.peerGroupLabel}</p>
                  <p className="mt-1 text-sm text-stone-500">Group size: {String(story.comparison.peerGroupSize)}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{story.comparison.fallbackLabel}</p>
                </div>
              </Panel>

              <Panel>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Signals after benchmarking</p>
                <div className="mt-5 space-y-4">
                  {story.comparison.metrics.map((metric) => (
                    <MetricRow key={metric.label} metric={metric} />
                  ))}
                </div>
                <div className="mt-6 rounded-[20px] border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-stone-700">
                  In other words: a number only becomes meaningful once the company is placed in context. An 8% margin
                  can be excellent in one manufacturing niche and weak in another. VIP is always asking, “good compared
                  with whom?”
                </div>
              </Panel>
            </div>
          </StorySection>

          <StorySection
            id="step-4"
            icon={<Layers3 className="h-5 w-5" />}
            step="Step 4"
            title="Assemble the four capitals and turn them into SQF."
            intro="This is where VIP moves from individual signals to a strategic quality profile."
          >
            <Panel>
              <div className="grid gap-5 xl:grid-cols-2">
                {story.capitalAssemblies.map((capital) => (
                  <div key={capital.key} className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${CAPITAL_TINTS[capital.key]}`}>
                          {capital.name}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-stone-600">{capital.story}</p>
                      </div>
                      <div className="min-w-[96px] rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-right">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Capital score</p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{capital.score}</p>
                        <p className="mt-1 text-xs text-stone-500">{capital.pillarWeight}% of composite</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {capital.signals.map((signal) => (
                        <SignalRow key={`${capital.key}-${signal.label}`} signal={signal} accentClass={CAPITAL_ACCENTS[capital.key]} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                <FormulaChip label="Composite quality score" value={`${story.valueModel.qualityScore}/100`} />
                <ArrowCell />
                <FormulaChip label="SQF" value={story.valueModel.sqf.toFixed(2)} detail="0.6 + (CQS/100) × 0.8" />
                <ArrowCell />
                <div className="rounded-[22px] border border-stone-200 bg-amber-50/70 p-5">
                  <p className="text-sm leading-7 text-stone-700">
                    SQF is the quality multiplier. It rewards businesses that are not just profitable, but also more
                    transferable, less fragile, and better positioned to scale.
                  </p>
                </div>
              </div>
            </Panel>
          </StorySection>

          <StorySection
            id="step-5"
            icon={<CircleDollarSign className="h-5 w-5" />}
            step="Step 5"
            title="Combine earnings, market context, quality, and growth."
            intro="The final valuation does not come from one score. It comes from four pieces working together."
          >
            <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
              <Panel>
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <ValueInputCard
                    label="EBITDA"
                    value={formatMoney(story.valueModel.ebitda)}
                    detail="Current earnings base"
                    icon={<CircleDollarSign className="h-5 w-5" />}
                  />
                  <ValueInputCard
                    label="Sector multiple"
                    value={`${story.valueModel.multiple.toFixed(2)}x`}
                    detail="Exact NACE if available, then prefix or sector bucket, with a 25% illiquidity discount"
                    icon={<Factory className="h-5 w-5" />}
                  />
                  <ValueInputCard
                    label="SQF"
                    value={story.valueModel.sqf.toFixed(2)}
                    detail="Strategic quality multiplier from the four capitals"
                    icon={<Radar className="h-5 w-5" />}
                  />
                  <ValueInputCard
                    label="GF"
                    value={story.valueModel.gf.toFixed(2)}
                    detail="Growth factor from CAGR, lifecycle stage, and scalability"
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>

                <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-6">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Value formula in this product</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-lg text-stone-700">
                    <FormulaToken>{formatMoney(story.valueModel.ebitda)}</FormulaToken>
                    <span>×</span>
                    <FormulaToken>{story.valueModel.multiple.toFixed(2)}x</FormulaToken>
                    <span>×</span>
                    <FormulaToken>{story.valueModel.sqf.toFixed(2)}</FormulaToken>
                    <span>×</span>
                    <FormulaToken>{story.valueModel.gf.toFixed(2)}</FormulaToken>
                    <span>=</span>
                    <FormulaToken strong>{formatMoney(story.valueModel.valueCurrent)}</FormulaToken>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    The range stays visible because no serious valuation should pretend to be a single precise point.
                    Here that lands at {formatMoney(story.valueModel.valueLow)} to {formatMoney(story.valueModel.valueHigh)}.
                  </p>
                </div>
              </Panel>

              <Panel tone="soft">
                <p className="font-medium text-stone-950">What each multiplier is doing</p>
                <div className="mt-4 space-y-4 text-sm leading-7 text-stone-700">
                  <p>
                    <strong className="text-stone-950">Sector multiple</strong> gives the market backdrop: what similar
                    businesses are broadly worth per euro of EBITDA.
                  </p>
                  <p>
                    <strong className="text-stone-950">SQF</strong> adjusts for how investable and transferable the
                    company feels once the four capitals have been scored.
                  </p>
                  <p>
                    <strong className="text-stone-950">GF</strong> rewards or discounts the growth profile based on real
                    CAGR plus business scalability and lifecycle stage.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <KeyMetric label="Value today" value={formatMoney(story.valueModel.valueCurrent)} detail="Current estimate" />
                  <KeyMetric
                    label="Potential value"
                    value={formatMoney(story.valueModel.valuePotential)}
                    detail={`If the Top-3 actions land, +${story.valueModel.valueGapPct}%`}
                  />
                </div>
              </Panel>
            </div>
          </StorySection>

          <StorySection
            id="step-6"
            icon={<Target className="h-5 w-5" />}
            step="Step 6"
            title="Rank the few actions most likely to move value."
            intro={`The product does not stop at diagnosis. It looks across ${story.actionCatalogueCount} possible actions, estimates which ones increase value the most, and surfaces the strongest few.`}
          >
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <Panel>
                <div className="space-y-4">
                  {story.recommendations.map((action) => (
                    <div key={action.id} className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.28em] text-stone-500">
                            Top {action.rank}
                          </div>
                          <h3 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">{action.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">{action.description}</p>
                        </div>
                        <div className="grid min-w-[210px] gap-3 sm:w-[230px]">
                          <MiniBadge label="Expected value lift" value={`+${action.upliftPct}%`} />
                          <MiniBadge label="Primary impact" value={action.impactLabel} />
                          <MiniBadge label="Time to impact" value={`${action.horizonMonths} months`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel tone="soft">
                <p className="font-medium text-stone-950">What the ranking is doing behind the scenes</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
                  <p>1. Start from the current valuation baseline.</p>
                  <p>2. Simulate the expected SQF and GF improvement for each action candidate.</p>
                  <p>3. Recompute value using the same valuation logic.</p>
                  <p>4. Rank by expected return on value relative to effort and time.</p>
                </div>

                {topAction ? (
                  <div className="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50/70 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-700">What this example says next</p>
                    <p className="mt-3 text-base leading-8 text-stone-800">
                      For {story.company.name}, the model’s strongest first move is{' '}
                      <strong className="text-stone-950">{topAction.title.toLowerCase()}</strong>. That is the action
                      with the clearest expected path to lifting value from {formatMoney(story.valueModel.valueCurrent)}{' '}
                      toward {formatMoney(story.valueModel.valuePotential)}.
                    </p>
                    {(secondAction || thirdAction) ? (
                      <p className="mt-3 text-sm leading-7 text-stone-600">
                        The next layer after that is {secondAction?.title ?? 'the second-ranked action'}
                        {thirdAction ? `, followed by ${thirdAction.title}` : ''}.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </Panel>
            </div>
          </StorySection>
        </main>

        <footer className="mt-8 rounded-[28px] border border-stone-200 bg-white p-8 shadow-[0_24px_80px_rgba(24,24,27,0.05)] sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">The product promise</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                Understand value today. See what drives it. Know what to improve next.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
                That is the whole logic of VIP in one line: start from a real company, enrich it with the entrepreneur’s
                strategic truth, compare it properly, score the four capitals, and translate the result into value and
                priorities.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/companies"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Explore companies
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-scores-are-calculated"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Method detail
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StorySection({
  id,
  icon,
  step,
  title,
  intro,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  step: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_rgba(24,24,27,0.04)] sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="xl:pr-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs uppercase tracking-[0.28em] text-stone-600">
            {icon}
            {step}
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">{title}</h2>
          <p className="mt-4 text-base leading-8 text-stone-600">{intro}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function Panel({
  children,
  tone = 'plain',
}: {
  children: React.ReactNode;
  tone?: 'plain' | 'soft';
}) {
  return (
    <div
      className={
        tone === 'soft'
          ? 'rounded-[24px] border border-stone-200 bg-stone-50 p-6'
          : 'rounded-[24px] border border-stone-200 bg-white p-6'
      }
    >
      {children}
    </div>
  );
}

function KeyMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-stone-200 bg-white p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className="mt-3 text-[clamp(2.1rem,4vw,3rem)] font-semibold leading-none tracking-tight text-stone-950 break-words">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-500 break-words">{detail}</p>
    </div>
  );
}

function SmallStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-stone-200 bg-stone-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-stone-950 break-words">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-500 break-words">{detail}</p>
    </div>
  );
}

function EvidencePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-700">
      <span className="font-medium text-stone-900">{label}:</span> {value}
    </div>
  );
}

function MetricRow({ metric }: { metric: ComparisonMetric }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-stone-900">{metric.label}</p>
          <p className="mt-1 text-sm text-stone-500">Observed value: {metric.raw}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-stone-500">Peer-relative percentile</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{round1(metric.percentile)}</p>
        </div>
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-stone-200">
        <div
          className="h-2.5 rounded-full bg-cyan-600"
          style={{ width: `${clamp(metric.percentile, 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function SignalRow({
  signal,
  accentClass,
}: {
  signal: CapitalSignal;
  accentClass: string;
}) {
  return (
    <div className="rounded-[18px] border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-stone-900">{signal.label}</p>
        <p className="text-sm text-stone-500">
          Weight {signal.weight}% · Score {round1(signal.score)}
        </p>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-stone-200">
        <div className={`h-2.5 rounded-full ${accentClass}`} style={{ width: `${clamp(signal.score, 0, 100)}%` }} />
      </div>
    </div>
  );
}

function FormulaChip({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[22px] border border-stone-200 bg-white px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className="mt-2 text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-none tracking-tight text-stone-950 break-words">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-stone-500 break-words">{detail}</p> : null}
    </div>
  );
}

function ArrowCell() {
  return (
    <div className="hidden justify-center lg:flex">
      <div className="rounded-full border border-stone-200 bg-stone-50 p-3 text-stone-500">
        <ArrowRight className="h-5 w-5" />
      </div>
    </div>
  );
}

function ValueInputCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[22px] border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</p>
        <div className="shrink-0 text-stone-400">{icon}</div>
      </div>
      <p className="mt-3 text-[clamp(2.3rem,4vw,3rem)] font-semibold leading-none tracking-tight text-stone-950 break-words">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-500 break-words">{detail}</p>
    </div>
  );
}

function FormulaToken({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <span
      className={
        strong
          ? 'rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-semibold text-stone-950'
          : 'rounded-full border border-stone-200 bg-white px-4 py-2'
      }
    >
      {children}
    </span>
  );
}

function MiniBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[18px] border border-stone-200 bg-white px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-stone-900 break-words">{value}</p>
    </div>
  );
}

function formatMoney(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${Math.round(value)}`;
}

function humanizeObjective(value: string): string {
  return value.replace(/_/g, ' ');
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
