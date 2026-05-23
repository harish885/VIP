import { Explainer, type ExplainerStory } from '@/components/explainer/explainer';
import { EXAMPLE_DIAGNOSTIC, QUESTIONS_BY_SECTION, QUESTION_SECTIONS } from '@/lib/diagnostic-schema';
import { getCompanySnapshot } from '@/lib/aida';
import { createServiceClient } from '@/lib/supabase/service';
import {
  ACTION_CATALOGUE,
  buildRecommendations,
  buildScoringInput,
  computeValuation,
  getSectorMultiple,
  runScoring,
} from '@/lib/scoring';
import { CAPITAL_WEIGHTS, COMPOSITE_WEIGHTS } from '@/lib/scoring/aggregate';
import type { PercentileRanks } from '@/lib/scoring/types';
import { DEMO_ACTIONS, DEMO_COMPANY, DEMO_VALUATION } from '@/lib/demo-data';
import { DEMO_SCORING_INPUT } from '@/lib/scoring/company-input';

export const metadata = { title: 'How it works · VIP' };
export const dynamic = 'force-dynamic';

const STORY_TAX_CODE = '3819650379';

const SIGNAL_LABELS: Record<keyof PercentileRanks, string> = {
  revenue_cagr: 'Revenue CAGR',
  ebitda_margin: 'EBITDA margin',
  recurring_revenue: 'Recurring revenue',
  client_concentration_inv: 'Concentration resilience',
  tech_investment: 'Tech investment',
  founder_independence: 'Founder independence',
  management: 'Management depth',
  digital_maturity: 'Digital maturity',
  client_portfolio: 'Client portfolio quality',
  scalability: 'Scalability',
  network: 'Network position',
  automation: 'Automation',
  enabling_systems: 'Enabling systems',
  distinctive_tech_assets: 'Distinctive tech assets',
  process_maturity: 'Process maturity',
  transferability: 'Transferability',
  strategic_partnerships: 'Strategic partnerships',
  reputation: 'Reputation',
  quality_of_growth: 'Quality of growth',
  distinctive_assets_score: 'Distinctive assets',
  ma_history: 'M&A experience',
};

export default async function HowItWorksPage() {
  const story = await loadExplainerStory();
  return <Explainer story={story} />;
}

async function loadExplainerStory(): Promise<ExplainerStory> {
  try {
    const service = createServiceClient();
    const snapshot = await getCompanySnapshot(service, STORY_TAX_CODE);
    if (!snapshot) return buildFallbackStory();

    const baseline = buildScoringInput({
      diagnostic: EXAMPLE_DIAGNOSTIC,
      snapshot,
    });

    const scoring = await runScoring(baseline, {
      peerGroupName: snapshot.peer_group_name,
      naceCode: snapshot.nace_rev_2,
      supabase: service,
    });

    const recommendations = buildRecommendations({
      scoring,
      naceCode: snapshot.nace_rev_2,
    });

    const top3UpliftPctSum = recommendations.reduce((sum, item) => sum + item.v_uplift_pct, 0);
    const valuation = computeValuation({
      ebitda_eur: baseline.ebitda,
      m_sector: getSectorMultiple({ naceCode: snapshot.nace_rev_2, sector: baseline.sector }),
      sqf: scoring.composite.sqf,
      gf: scoring.growth.gf,
      top3_uplift_pct_sum: top3UpliftPctSum,
    });

    const peerMetrics: Array<ExplainerStory['comparison']['metrics'][number]> = [
      {
        label: 'EBITDA margin',
        raw: `${round1(scoring.metrics.ebitda_margin_pct)}%`,
        percentile: round1(scoring.percentiles.ebitda_margin),
      },
      {
        label: 'Revenue CAGR',
        raw: `${round1(scoring.metrics.revenue_cagr_2y_pct)}%`,
        percentile: round1(scoring.percentiles.revenue_cagr),
      },
      {
        label: 'Tech investment',
        raw: `${round1(scoring.metrics.tech_investment_ratio_pct)}%`,
        percentile: round1(scoring.percentiles.tech_investment),
      },
      {
        label: 'Client resilience',
        raw: `${round1(scoring.metrics.client_concentration_inv)} / 100`,
        percentile: round1(scoring.percentiles.client_concentration_inv),
      },
    ];

    return {
      mode: 'real',
      company: {
        name: snapshot.company_name,
        province: snapshot.province ?? 'Italy',
        naceCode: snapshot.nace_rev_2 ?? 'NACE 28',
        description:
          snapshot.ateco_2007_description ??
          snapshot.nace_rev_2_description ??
          snapshot.primary_business_line ??
          'Manufacturing SME',
        sizeLabel:
          snapshot.employees !== null ? `${Math.round(snapshot.employees)} employees` : 'SME profile',
        peerGroupLabel: snapshot.peer_group_name ?? 'Closest manufacturing peer group',
        peerFallbackLabel: snapshot.nace_rev_2
          ? `Fallback lens: NACE ${snapshot.nace_rev_2.slice(0, 2)}`
          : 'Fallback lens: broader sector cohort',
      },
      facts: [
        {
          label: 'Revenue',
          value: snapshot.revenue_last_thk !== null ? fmtMn(snapshot.revenue_last_thk) : '—',
          detail: 'Last available year',
        },
        {
          label: 'EBITDA',
          value: snapshot.ebitda_last_thk !== null ? fmtMn(snapshot.ebitda_last_thk) : '—',
          detail:
            snapshot.ebitda_margin_pct !== null ? `${round1(snapshot.ebitda_margin_pct)}% margin` : 'Margin unavailable',
        },
        {
          label: 'Employees',
          value: snapshot.employees !== null ? String(Math.round(snapshot.employees)) : '—',
          detail:
            snapshot.turnover_per_employee_eur !== null
              ? `${Math.round(snapshot.turnover_per_employee_eur / 1000)}k per employee`
              : 'Productivity proxy',
        },
        {
          label: 'R&D intensity',
          value: `${round1(scoring.metrics.tech_investment_ratio_pct)}%`,
          detail: 'Used as the innovation investment signal',
        },
      ],
      questionnaire: {
        totalQuestions: Object.keys(EXAMPLE_DIAGNOSTIC).length - 2,
        categories: QUESTION_SECTIONS.map((section) => ({
          name: section,
          count: QUESTIONS_BY_SECTION[section].length,
        })),
        examples: [
          'Digital maturity',
          'Founder dependency',
          'Client portfolio quality',
          'Process maturity',
          'Strategic partnerships',
          'Business scalability',
        ],
      },
      comparison: {
        peerGroupLabel: snapshot.peer_group_name ?? 'Closest manufacturing peer group',
        peerGroupSize: snapshot.peer_group_size ?? '14,999 calibration observations',
        fallbackLabel: snapshot.nace_rev_2
          ? `If the close pool is too thin, widen to NACE ${snapshot.nace_rev_2.slice(0, 2)}`
          : 'If the close pool is too thin, widen to the broader sector cohort',
        metrics: peerMetrics,
      },
      capitalAssemblies: (Object.entries(CAPITAL_WEIGHTS) as Array<
        [keyof typeof CAPITAL_WEIGHTS, typeof CAPITAL_WEIGHTS[keyof typeof CAPITAL_WEIGHTS]]
      >).map(([capital, weights]) => ({
        key: capital,
        name: capitalName(capital),
        score: capitalScore(scoring.capitals, capital),
        pillarWeight: compositeWeightFor(capital),
        story: capitalStory(capital),
        signals: weights.map(({ key, weight }) => ({
          label: SIGNAL_LABELS[key],
          weight: Math.round(weight * 100),
          score: round1(scoring.percentiles[key]),
        })),
      })),
      valueModel: {
        ebitda: baseline.ebitda,
        multiple: valuation.m_sector,
        sqf: scoring.composite.sqf,
        gf: scoring.growth.gf,
        valueCurrent: valuation.v_current_eur,
        valueLow: valuation.v_low_eur,
        valueHigh: valuation.v_high_eur,
        valuePotential: valuation.v_potential_eur,
        valueGapPct: valuation.value_gap_pct,
        qualityScore: scoring.quality_score,
        riskIndex: scoring.risk_index,
      },
      recommendations: recommendations.map((item) => ({
        id: item.id,
        rank: item.rank,
        title: item.title,
        description: item.description,
        impactLabel: item.capital_impact,
        deltaSqf: item.delta_sqf,
        deltaGf: item.delta_gf,
        upliftPct: item.v_uplift_pct,
        horizonMonths: item.time_to_impact_months,
      })),
      actionCatalogueCount: ACTION_CATALOGUE.length,
      baseline,
    };
  } catch {
    return buildFallbackStory();
  }
}

function buildFallbackStory(): ExplainerStory {
  return {
    mode: 'illustrative',
    company: {
      name: DEMO_COMPANY.name,
      province: DEMO_COMPANY.province,
      naceCode: `NACE ${DEMO_COMPANY.nace_code}`,
      description: 'Representative manufacturing SME profile',
      sizeLabel: 'Illustrative operating profile',
      peerGroupLabel: 'Closest manufacturing peer group',
      peerFallbackLabel: 'Fallback lens: broader NACE cohort',
    },
    facts: [
      { label: 'Revenue', value: '€8.4M', detail: 'Latest revenue year' },
      { label: 'EBITDA', value: '€0.75M', detail: '8.9% margin' },
      { label: 'Employees', value: '68', detail: 'Illustrative headcount' },
      { label: 'R&D intensity', value: '1.2%', detail: 'Innovation investment signal' },
    ],
    questionnaire: {
      totalQuestions: 19,
      categories: QUESTION_SECTIONS.map((section) => ({
        name: section,
        count: QUESTIONS_BY_SECTION[section].length,
      })),
      examples: [
        'Digital maturity',
        'Founder dependency',
        'Client portfolio quality',
        'Process maturity',
        'Strategic partnerships',
        'Business scalability',
      ],
    },
    comparison: {
      peerGroupLabel: 'Closest manufacturing peer group',
      peerGroupSize: '14,999 calibration observations',
      fallbackLabel: 'If the close pool is too thin, widen to the broader NACE cohort',
      metrics: [
        { label: 'EBITDA margin', raw: '8.9%', percentile: 65 },
        { label: 'Revenue CAGR', raw: '16.4%', percentile: 84 },
        { label: 'Tech investment', raw: '1.2%', percentile: 54 },
        { label: 'Client resilience', raw: '40 / 100', percentile: 45 },
      ],
    },
    capitalAssemblies: [
      {
        key: 'financial',
        name: 'Financial',
        score: 68,
        pillarWeight: 35,
        story: capitalStory('financial'),
        signals: [
          { label: 'EBITDA margin', weight: 30, score: 65 },
          { label: 'Revenue CAGR', weight: 25, score: 84 },
          { label: 'Recurring revenue', weight: 20, score: 55 },
          { label: 'Concentration resilience', weight: 25, score: 45 },
        ],
      },
      {
        key: 'technological',
        name: 'Technological',
        score: 54,
        pillarWeight: 20,
        story: capitalStory('technological'),
        signals: [
          { label: 'Digital maturity', weight: 55, score: 60 },
          { label: 'Tech investment', weight: 45, score: 50 },
        ],
      },
      {
        key: 'human',
        name: 'Human & Organisational',
        score: 71,
        pillarWeight: 25,
        story: capitalStory('human'),
        signals: [
          { label: 'Founder independence', weight: 40, score: 60 },
          { label: 'Management depth', weight: 35, score: 65 },
          { label: 'Scalability', weight: 25, score: 85 },
        ],
      },
      {
        key: 'relational',
        name: 'Relational',
        score: 55,
        pillarWeight: 20,
        story: capitalStory('relational'),
        signals: [
          { label: 'Client portfolio quality', weight: 40, score: 60 },
          { label: 'Network position', weight: 30, score: 65 },
          { label: 'Recurring revenue', weight: 30, score: 55 },
        ],
      },
    ],
    valueModel: {
      ebitda: DEMO_SCORING_INPUT.ebitda,
      multiple: DEMO_VALUATION.m_sector,
      sqf: DEMO_VALUATION.sqf,
      gf: DEMO_VALUATION.gf,
      valueCurrent: DEMO_VALUATION.v_current_eur,
      valueLow: DEMO_VALUATION.v_low_eur,
      valueHigh: DEMO_VALUATION.v_high_eur,
      valuePotential: DEMO_VALUATION.v_potential_eur,
      valueGapPct: DEMO_VALUATION.value_gap_pct,
      qualityScore: DEMO_VALUATION.quality_score,
      riskIndex: DEMO_VALUATION.risk_index,
    },
    recommendations: DEMO_ACTIONS.map((action) => ({
      id: action.title.toLowerCase().replace(/\s+/g, '-'),
      rank: action.rank,
      title: action.title,
      description: action.detail,
      impactLabel: action.capital_impact,
      deltaSqf: 0,
      deltaGf: 0,
      upliftPct: action.v_uplift_pct,
      horizonMonths: action.time_horizon_months,
    })),
    actionCatalogueCount: ACTION_CATALOGUE.length,
    baseline: DEMO_SCORING_INPUT,
  };
}

function capitalName(capital: keyof typeof CAPITAL_WEIGHTS): string {
  if (capital === 'financial') return 'Financial';
  if (capital === 'technological') return 'Technological';
  if (capital === 'human') return 'Human & Organisational';
  return 'Relational';
}

function capitalStory(capital: keyof typeof CAPITAL_WEIGHTS): string {
  if (capital === 'financial') {
    return 'How strong the earnings base is, how fast it is growing, and how exposed it is to a few clients.';
  }
  if (capital === 'technological') {
    return 'How much the business runs on real systems and how much it keeps reinvesting in capabilities.';
  }
  if (capital === 'human') {
    return 'Whether the company can keep running and scaling without founder bottlenecks.';
  }
  return 'How durable customer relationships are and how strong the company sits inside its ecosystem.';
}

function capitalScore(
  capitals: Awaited<ReturnType<typeof runScoring>>['capitals'],
  capital: keyof typeof CAPITAL_WEIGHTS,
): number {
  if (capital === 'financial') return capitals.financial;
  if (capital === 'technological') return capitals.technological;
  if (capital === 'human') return capitals.human;
  return capitals.relational;
}

function compositeWeightFor(capital: keyof typeof CAPITAL_WEIGHTS): number {
  if (capital === 'financial') return Math.round(COMPOSITE_WEIGHTS.financial * 100);
  if (capital === 'technological') return Math.round(COMPOSITE_WEIGHTS.technological * 100);
  if (capital === 'human') return Math.round(COMPOSITE_WEIGHTS.human * 100);
  return Math.round(COMPOSITE_WEIGHTS.relational * 100);
}

function fmtMn(thousandEur: number): string {
  return `€${(thousandEur / 1000).toFixed(1)}M`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
