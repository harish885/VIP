/**
 * dashboard-explanations.ts
 *
 * Builds a per-metric `Explanation` for every insight the dashboard renders.
 * The shape is consumed by `<InfoButton explanation={...}>` to show users
 * exactly where each number came from and how it was computed for THEIR
 * specific company — not abstract formulae.
 */
import type { DashboardData, DashboardAction, DashboardCapital } from '@/lib/dashboard-data';
import type { AidaSnapshot } from '@/lib/aida';
import type { Explanation, ExplanationStep } from '@/components/company-workspace/info-popover';
import { formatCurrency, formatEurCompact, formatThk } from '@/lib/format';

const ILLIQUIDITY_DISCOUNT = 0.75;

export interface ExplanationMap {
  v_current: Explanation;
  v_range: Explanation;
  v_potential: Explanation;
  value_gap: Explanation;
  quality_score: Explanation;
  risk_index: Explanation;
  ebitda: Explanation;
  m_sector: Explanation;
  sqf: Explanation;
  gf: Explanation;
  capitals: Record<string, Explanation>; // keyed by capital.key
  actions: Record<number, Explanation>;  // keyed by action.rank
}

export function buildExplanations(
  data: DashboardData,
  snapshot?: AidaSnapshot | null,
): ExplanationMap {
  const { valuation, simulationBaseline, naceCode, company, actions } = data;

  const eb = valuation.ebitda_norm_eur;
  const m = valuation.m_sector;
  const sqf = valuation.sqf;
  const gf = valuation.gf;
  const v = valuation.v_current_eur;

  // -----------------------------------------------------------------
  // V (Company value)
  // -----------------------------------------------------------------
  const v_current: Explanation = {
    title: 'Company value (V)',
    source: 'Computed — V = EBITDA × M × SQF × GF',
    plain: 'Start with your yearly profit, multiply by what similar companies sell for, then nudge it up or down for how strong and how fast-growing your business is. That nudged number is what your company is worth.',
    steps: [
      { label: 'EBITDA (normalised)', value: fmtEur(eb), note: 'Pulled from AIDA — last available financial year.' },
      { label: 'Sector multiple (M)', value: `${m.toFixed(1)}×`, note: naceCode ? `NACE ${naceCode} base multiple, after 25% illiquidity discount for unlisted SMEs.` : 'Sector base multiple after illiquidity discount.' },
      { label: 'Strategic Quality Factor (SQF)', value: sqf.toFixed(2), note: 'Quality multiplier from the four-capital scorecard.' },
      { label: 'Growth Factor (GF)', value: gf.toFixed(2), note: 'Growth multiplier from CAGR + lifecycle + scalability.' },
      { value: `${fmtEur(eb)} × ${m.toFixed(1)} × ${sqf.toFixed(2)} × ${gf.toFixed(2)}` },
    ],
    result: fmtMoney(v),
  };

  // -----------------------------------------------------------------
  // Value range (low / high)
  // -----------------------------------------------------------------
  const v_range: Explanation = {
    title: 'Value range',
    source: 'Computed — uncertainty band around V',
    plain: 'No honest valuation is a single exact number. This is the sensible low-to-high window a buyer would likely land in.',
    steps: [
      { label: 'V (point estimate)', value: fmtMoney(v) },
      { label: 'Low', value: `V × 0.90 = ${fmtMoney(valuation.v_low_eur)}`, note: '10% downside band for execution risk and market timing.' },
      { label: 'High', value: `V × 1.12 = ${fmtMoney(valuation.v_high_eur)}`, note: '12% upside band for buyer competition / strategic premium.' },
    ],
    result: `${fmtMoney(valuation.v_low_eur)} – ${fmtMoney(valuation.v_high_eur)}`,
  };

  // -----------------------------------------------------------------
  // Potential V
  // -----------------------------------------------------------------
  const upliftSum = actions.slice(0, 3).reduce((s, a) => s + (a.v_uplift_pct || 0), 0);
  const v_potential: Explanation = {
    title: 'Potential V (after Top-3 actions)',
    source: 'Computed — V if all 3 priority actions executed',
    plain: 'What your company could be worth if you carried out the three recommended moves. It is today’s value plus the uplift each action is expected to add.',
    steps: [
      { label: 'V (current)', value: fmtMoney(v) },
      { label: 'Top-3 uplift (sum of ΔV%)', value: `+${upliftSum.toFixed(1)}%`, note: 'Each action moves SQF and/or GF; engine re-runs valuation to get ΔV.' },
      { value: `${fmtMoney(v)} × (1 + ${(upliftSum / 100).toFixed(3)})` },
    ],
    result: fmtMoney(valuation.v_potential_eur),
  };

  // -----------------------------------------------------------------
  // Value Gap %
  // -----------------------------------------------------------------
  const value_gap: Explanation = {
    title: 'Value gap',
    source: 'Computed — distance from V to V potential',
    plain: 'How much value is currently being left on the table — the percentage jump from where you are today to where you could be.',
    steps: [
      { label: 'V potential', value: fmtMoney(valuation.v_potential_eur) },
      { label: 'V current', value: fmtMoney(v) },
      { value: `(${fmtMoney(valuation.v_potential_eur)} − ${fmtMoney(v)}) ÷ ${fmtMoney(v)} × 100` },
    ],
    result: `+${Math.max(0, Math.round(valuation.value_gap_pct))}%`,
  };

  // -----------------------------------------------------------------
  // Quality Score (CQS)
  // -----------------------------------------------------------------
  const fin = capScore(valuation.capitals, 'fin');
  const tech = capScore(valuation.capitals, 'tech');
  const human = capScore(valuation.capitals, 'human');
  const rel = capScore(valuation.capitals, 'rel');
  const quality_score: Explanation = {
    title: 'Quality Score',
    source: 'Computed — weighted average of four capitals',
    plain: 'A 0–100 report card on how well-built your company is, blending its money, technology, people and relationships — with money counting the most.',
    steps: [
      { label: 'Financial × 35%',     value: `${fin} × 0.35 = ${(fin * 0.35).toFixed(1)}` },
      { label: 'Technological × 20%', value: `${tech} × 0.20 = ${(tech * 0.20).toFixed(1)}` },
      { label: 'Human & Org × 25%',   value: `${human} × 0.25 = ${(human * 0.25).toFixed(1)}` },
      { label: 'Relational × 20%',    value: `${rel} × 0.20 = ${(rel * 0.20).toFixed(1)}` },
    ],
    result: `${valuation.quality_score} / 100`,
  };

  // -----------------------------------------------------------------
  // Risk Index
  // -----------------------------------------------------------------
  const flagCount = valuation.flags.length;
  const flagLabel =
    flagCount === 0 ? 'No fragility flags raised.' :
    valuation.flags.map(prettyFlag).join(' · ');
  const bucketRule =
    'Rule: 0 flags → LOW · 1–2 flags → MEDIUM · ≥3 flags → HIGH.';
  const risk_index: Explanation = {
    title: 'Risk signal',
    source: 'Computed — count of fragility flags fired',
    plain: 'How shaky the business looks to an outsider. We count the warning signs (like leaning on one big client); more flags means higher risk.',
    steps: [
      { label: 'Flags fired', value: String(flagCount), note: flagLabel },
      { note: bucketRule },
    ],
    result: valuation.risk_index,
  };

  // -----------------------------------------------------------------
  // EBITDA
  // -----------------------------------------------------------------
  const ebitdaSourceYear =
    snapshot?.ebitda_last_thk != null ? 'last available year' :
    snapshot?.ebitda_2024_thk != null ? '2024' :
    snapshot?.ebitda_2023_thk != null ? '2023' :
    snapshot?.ebitda_2022_thk != null ? '2022' :
    null;
  const ebitda: Explanation = {
    title: 'EBITDA (normalised)',
    source: 'AIDA / Bureau van Dijk — official filings',
    plain: 'Your core yearly profit before tax, interest and accounting effects — roughly the cash the business throws off. Taken straight from your public filing, so you type nothing.',
    steps: snapshot
      ? [
          { label: 'AIDA company', value: snapshot.company_name },
          { label: 'Source year', value: ebitdaSourceYear ?? '—' },
          { label: 'EBITDA (k EUR)', value: thk(snapshot.ebitda_last_thk ?? snapshot.ebitda_2024_thk ?? snapshot.ebitda_2023_thk ?? snapshot.ebitda_2022_thk) },
          { note: 'Raw thousands-EUR figure × 1,000 to put it on the same scale as the multiple.' },
        ]
      : [
          { label: 'EBITDA', value: fmtEur(eb), note: 'Persisted at submission time from the AIDA snapshot.' },
        ],
    result: fmtEur(eb),
  };

  // -----------------------------------------------------------------
  // Sector multiple (M)
  // -----------------------------------------------------------------
  const baseMultiple = m / ILLIQUIDITY_DISCOUNT;
  const m_sector: Explanation = {
    title: 'Sector multiple (M)',
    source: 'European mid-market deal databases, illiquidity-discounted',
    plain: 'How many euros buyers typically pay for each euro of profit in your industry. We then knock 25% off because a private company is harder to sell than a listed one.',
    steps: [
      { label: 'NACE / sector lookup', value: naceCode ? `NACE ${naceCode}` : (company.sector || '—'),
        note: 'Calibrated against Argos Mid-Market Index, EY Capital Briefing, Mergermarket — comparable European SMEs.' },
      { label: 'Base multiple (listed-market)', value: `${baseMultiple.toFixed(2)}×` },
      { label: 'Illiquidity discount', value: '× 0.75', note: '25% off because unlisted SMEs are harder to exit than listed peers.' },
      { value: `${baseMultiple.toFixed(2)}× × 0.75` },
    ],
    result: `${m.toFixed(2)}×`,
  };

  // -----------------------------------------------------------------
  // SQF
  // -----------------------------------------------------------------
  const cqs = valuation.quality_score;
  const sqfRaw = 0.6 + (cqs / 100) * 0.8;
  const sqf_exp: Explanation = {
    title: 'Strategic Quality Factor (SQF)',
    source: 'Computed — quality multiplier on V (0.6 – 1.4)',
    plain: 'A quality dial from 0.6 to 1.4. Below 1.0 your structure drags value down; above 1.0 it lifts value up. A weak company shrinks its multiple, a strong one stretches it.',
    steps: [
      { label: 'Composite Quality Score (CQS)', value: `${cqs} / 100`, note: 'Weighted average of the four capital scores.' },
      { label: 'Formula', value: '0.6 + (CQS / 100) × 0.8' },
      { value: `0.6 + (${cqs} / 100) × 0.8 = ${sqfRaw.toFixed(3)}` },
      { note: 'Clamped to [0.6, 1.4].' },
    ],
    result: sqf.toFixed(2),
  };

  // -----------------------------------------------------------------
  // GF (reconstructed from baseline + company stage)
  // -----------------------------------------------------------------
  const cagr =
    simulationBaseline.revenue_y_1 > 0 && simulationBaseline.revenue_y_3 > 0
      ? (Math.pow(simulationBaseline.revenue_y_3 / simulationBaseline.revenue_y_1, 1 / 2) - 1) * 100
      : 0;
  const lifecycleStage = company.lifecycle_stage || simulationBaseline.lifecycle_stage || 'Maturity';
  const lifecycleMod = LIFECYCLE_MODIFIERS[lifecycleStage] ?? 1.0;
  const scalability15 = simulationBaseline.business_scalability ?? 3;
  const scalMod = 0.92 + (Math.max(1, Math.min(5, scalability15)) - 1) * 0.03;
  const cagrFrac = Math.max(-0.3, Math.min(0.5, cagr / 100));
  const gfBase = 1.0 + cagrFrac * 0.4;
  const gf_exp: Explanation = {
    title: 'Growth Factor (GF)',
    source: 'Computed — growth multiplier on V (0.7 – 1.5)',
    plain: 'A growth dial. Companies that are growing, young, and easy to scale get a premium; flat or declining ones get a discount.',
    steps: [
      { label: 'Revenue CAGR (2-year)', value: `${cagr.toFixed(1)}%`,
        note: simulationBaseline.revenue_y_1 > 0
          ? `From AIDA: €${fmtThousands(simulationBaseline.revenue_y_1 / 1000)}K → €${fmtThousands(simulationBaseline.revenue_y_3 / 1000)}K over 2 years.`
          : 'No revenue history available — defaults to 0.' },
      { label: 'GF base', value: `1.0 + clamp(CAGR, −30%, 50%) × 0.4 = ${gfBase.toFixed(3)}` },
      { label: 'Lifecycle modifier', value: `${lifecycleStage} → ×${lifecycleMod.toFixed(2)}`,
        note: 'Early ×1.10 · Growth ×1.15 · Maturity ×1.00 · Decline ×0.90.' },
      { label: 'Scalability modifier', value: `Q rating ${scalability15}/5 → ×${scalMod.toFixed(3)}`,
        note: '0.92 baseline + 0.03 per Likert step above 1.' },
      { value: `${gfBase.toFixed(3)} × ${lifecycleMod.toFixed(2)} × ${scalMod.toFixed(3)}` },
      { note: 'Clamped to [0.7, 1.5].' },
    ],
    result: gf.toFixed(2),
  };

  // -----------------------------------------------------------------
  // Capital scores × 4
  // -----------------------------------------------------------------
  const capitals: Record<string, Explanation> = {};
  for (const c of valuation.capitals) {
    capitals[c.key] = buildCapitalExplanation(c, simulationBaseline);
  }

  // -----------------------------------------------------------------
  // Top-3 actions
  // -----------------------------------------------------------------
  const actionsMap: Record<number, Explanation> = {};
  for (const a of actions.slice(0, 3)) {
    actionsMap[a.rank] = buildActionExplanation(a, valuation.v_current_eur);
  }

  return {
    v_current,
    v_range,
    v_potential,
    value_gap,
    quality_score,
    risk_index,
    ebitda,
    m_sector,
    sqf: sqf_exp,
    gf: gf_exp,
    capitals,
    actions: actionsMap,
  };
}

// =============================================================================
// Helpers
// =============================================================================
const LIFECYCLE_MODIFIERS: Record<string, number> = {
  Early: 1.10,
  Growth: 1.15,
  Maturity: 1.00,
  Decline: 0.90,
};

function capScore(caps: DashboardCapital[], key: string): number {
  return caps.find((c) => c.key === key)?.score ?? 0;
}

function buildCapitalExplanation(
  c: DashboardCapital,
  baseline: DashboardData['simulationBaseline'],
): Explanation {
  const recipe = CAPITAL_RECIPES[c.key] ?? { formula: 'Weighted mean of capital metrics', qInputs: [] };
  const steps: ExplanationStep[] = [
    { label: 'Final score (0–100)', value: String(c.score), note: 'Higher = closer to the top of the peer cohort.' },
    { label: 'Capital weight in CQS', value: `${c.weight}%`, note: 'Share this capital contributes to the overall Quality Score.' },
    { note: `Recipe: ${recipe.formula}` },
  ];
  for (const k of recipe.qInputs) {
    const v = baseline[k.field as keyof typeof baseline] as number | undefined;
    if (typeof v === 'number') {
      steps.push({ label: k.label, value: `${v}/5`, note: k.note });
    }
  }
  return {
    title: `${c.name} capital`,
    source: 'Computed — weighted mean of peer-relative percentiles',
    plain: `${CAPITAL_PLAIN[c.key] ?? 'How this part of the business compares to similar companies.'} Scored 0–100, where 100 means top of the peer pack.`,
    steps,
    result: `${c.score} / 100`,
  };
}

const CAPITAL_PLAIN: Record<string, string> = {
  fin: 'Your money engine: profitability, growth, how much revenue repeats, and how spread-out your clients are.',
  tech: 'Your technology backbone: how digital and automated you are, and whether you own systems or data others don’t.',
  human: 'Your people and organisation: can the business run without the founder, and is the team built to scale?',
  rel: 'Your relationships: the quality of your clients, partners, brand and network.',
};

const CAPITAL_RECIPES: Record<string, { formula: string; qInputs: { field: string; label: string; note?: string }[] }> = {
  fin: {
    formula: '30% EBITDA margin + 25% Revenue CAGR + 20% Recurring revenue + 25% Client diversification',
    qInputs: [
      { field: 'client_portfolio_quality', label: 'Client portfolio quality (Q9)', note: 'Proxies recurring revenue + concentration.' },
    ],
  },
  tech: {
    formula: '55% Digital maturity + 45% Tech investment',
    qInputs: [
      { field: 'digital_maturity', label: 'Digital maturity (Q12)' },
      { field: 'q_distinctive_tech_assets', label: 'Distinctive tech assets (Q11)' },
    ],
  },
  human: {
    formula: '40% Founder independence + 35% Management structure + 25% Business scalability',
    qInputs: [
      { field: 'founder_dependency', label: 'Founder dependency (Q5)' },
      { field: 'management_structure', label: 'Management structure (Q6)' },
      { field: 'business_scalability', label: 'Business scalability (Q15)' },
    ],
  },
  rel: {
    formula: '40% Client portfolio + 30% Network & partnerships + 30% Recurring revenue',
    qInputs: [
      { field: 'client_portfolio_quality', label: 'Client portfolio quality (Q9)' },
      { field: 'network_partnerships', label: 'Network & partnerships (Q10)' },
    ],
  },
};

function buildActionExplanation(a: DashboardAction, vBase: number): Explanation {
  const deltaEur = (a.v_uplift_pct / 100) * vBase;
  return {
    title: `Priority action — ${a.title}`,
    source: 'Computed — Return on Value (ROV) ranking',
    plain: `If you make this change, the engine re-runs your whole valuation and estimates it would add about +${a.v_uplift_pct.toFixed(1)}% to your company’s value — roughly ${fmtMoney(deltaEur)}. It made the Top-3 because that’s a lot of value for the effort.`,
    steps: [
      { label: 'Capital impact', value: a.capital_impact || '—', note: 'Which capital this action moves and by how much.' },
      { label: 'Engine simulates new SQF / GF', note: 'Applies the action’s ΔSQF / ΔGF to the baseline scoring result.' },
      { label: 'Re-runs V', value: 'V_new = EBITDA × M × SQF_new × GF_new' },
      { label: 'Uplift', value: `+${a.v_uplift_pct.toFixed(1)}%`, note: `≈ +${fmtMoney(deltaEur)} on top of current V.` },
      { label: 'Time to impact', value: `${a.time_horizon_months} months` },
      { label: 'ROV rank', value: `#${a.rank}`, note: 'Top 3 = highest ΔV% per unit of effort × months.' },
    ],
    result: `+${a.v_uplift_pct.toFixed(1)}% V`,
  };
}

function prettyFlag(f: string): string {
  return f.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
}

const fmtMoney = (eur: number): string => formatEurCompact(eur, { zero: '€0' });
const fmtEur = formatCurrency;
const fmtThousands = formatThk;
function thk(v: number | null | undefined): string {
  return v == null ? '—' : `${Math.round(v).toLocaleString()}K`;
}
