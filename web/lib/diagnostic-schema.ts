import { z } from 'zod';

/**
 * Diagnostic schema — Pivot edition.
 *
 * Aligned with the Value_Intelligence_Questionnaire+contextdata.docx PoC
 * (20 questions). All scored questions are 1–5 Likert; classificatory
 * questions are enums.
 *
 * Quantitative inputs (revenue history, EBITDA, margin, R&D ratio,
 * recurring revenue, top-3 client concentration) are NOT collected here
 * any more — they are pulled from the AIDA snapshot for the selected
 * company at submission time.
 *
 * Backwards-compatible: every field on the old schema either survived as
 * one of the new questions (Q5/Q6/Q9/Q12/Q14 etc.) or is now optional
 * with a sensible default (sector, distinctive_assets text).
 */

// =============================================================================
// Enums (classificatory questions Q15, Q16, Q20)
// =============================================================================

export const TIME_HORIZONS = ['12m', '24m', '36m', '60m'] as const;
export type TimeHorizon = (typeof TIME_HORIZONS)[number];

export const STATED_OBJECTIVES = [
  'growth',
  'profitability',
  'exit_preparation',
  'investor_readiness',
  'succession',
  'organisational_strengthening',
] as const;
export type StatedObjective = (typeof STATED_OBJECTIVES)[number];

export const OBJECTIVE_LABELS: Record<StatedObjective, string> = {
  growth: 'Growth',
  profitability: 'Profitability improvement',
  exit_preparation: 'Exit preparation',
  investor_readiness: 'Investor readiness',
  succession: 'Continuity / succession',
  organisational_strengthening: 'Organisational strengthening',
};

export const LIFECYCLES = ['Early', 'Growth', 'Maturity', 'Decline'] as const;

export const SECTORS = [
  'Manufacturing',
  'Wholesale & Distribution',
  'Professional Services',
  'Tech / Software',
  'Retail / e-Commerce',
  'Construction',
  'Logistics',
  'Other',
] as const;

// Kept for downstream code that still imports it — the new questionnaire
// uses STATED_OBJECTIVES instead.
export const OBJECTIVES = [
  { value: 'growth',                       label: 'Growth' },
  { value: 'profitability',                label: 'Profitability improvement' },
  { value: 'exit_preparation',             label: 'Exit preparation' },
  { value: 'investor_readiness',           label: 'Investor readiness' },
  { value: 'succession',                   label: 'Continuity / succession' },
  { value: 'organisational_strengthening', label: 'Organisational strengthening' },
] as const;

// =============================================================================
// SCHEMA — 20 PoC questions
// =============================================================================

const likert = z.number().int().min(1).max(5);

export const DiagnosticSchema = z.object({
  // ---- Section 1 · Technological Capital (Q1-Q4) ----------------------------
  /** Q1 — digitalization of core processes */
  digital_maturity:        likert,
  /** Q2 — automation of repetitive tasks */
  q_automation:            likert,
  /** Q3 — integration of enabling systems (ERP/CRM/…) */
  q_enabling_systems:      likert,
  /** Q4 — proprietary tech / IP / codified know-how */
  q_distinctive_tech_assets: likert,

  // ---- Section 2 · Human & Organisational Capital (Q5-Q8) -------------------
  /** Q5 — founder dependency (1 = severely affected, 5 = minimally) */
  founder_dependency:      likert,
  /** Q6 — strength of second management line */
  management_structure:    likert,
  /** Q7 — process formalisation / maturity */
  q_process_maturity:      likert,
  /** Q8 — transferability of ownership */
  q_transferability:       likert,

  // ---- Section 3 · Relational Capital (Q9-Q12) -----------------------------
  /** Q9 — client portfolio quality & diversification */
  client_portfolio_quality: likert,
  /** Q10 — strategic partnerships */
  q_strategic_partnerships: likert,
  /** Q11 — reputation / market recognition */
  q_reputation:            likert,
  /** Q12 — network / ecosystem position */
  network_partnerships:    likert,

  // ---- Section 4 · Growth Quality & Context (Q13-Q14) ----------------------
  /** Q13 — quality of growth (episodic vs organic) */
  q_quality_of_growth:     likert,
  /** Q14 — business model scalability */
  business_scalability:    likert,

  // ---- Section 5 · Classificatory + extended context (Q15-Q20) -------------
  /** Q15 — entrepreneur's main objective over 24–36 months */
  stated_objective:        z.enum(STATED_OBJECTIVES),
  /** Q16 — declared time horizon */
  time_horizon:            z.enum(TIME_HORIZONS),
  /** Q17 — business lifecycle stage (1–5 maturity scale) */
  q_lifecycle_score:       likert,
  /** Q18 — strength of distinctive assets */
  q_distinctive_assets_score: likert,
  /** Q19 — M&A / exit history */
  q_ma_history:            likert,

  // ---- Optional free-text context that the form still supports -------------
  distinctive_assets:      z.string().max(200).optional().or(z.literal('')),
  sector:                  z.enum(SECTORS).optional(),
  lifecycle_stage:         z.enum(LIFECYCLES).optional(),
});

export type DiagnosticInput = z.infer<typeof DiagnosticSchema>;

// =============================================================================
// Defaults
// =============================================================================

export const EMPTY_DIAGNOSTIC: Partial<DiagnosticInput> = {
  // Likert questions intentionally have NO default — every answer must be a
  // deliberate choice from the entrepreneur. The diagnostic form surfaces
  // the unanswered ones at submit time.
  distinctive_assets: '',
  // Classificatory anchors only — Q15 / Q16 default to neutral sensible
  // choices so the form still validates if the user is in a hurry; they
  // can override before submitting.
  stated_objective: 'growth',
  time_horizon: '24m',
};

// =============================================================================
// EXAMPLE VALUES — same ACME profile as before, expressed in the new schema
// =============================================================================

export const EXAMPLE_DIAGNOSTIC: DiagnosticInput = {
  // Tech
  digital_maturity: 2,
  q_automation: 2,
  q_enabling_systems: 2,
  q_distinctive_tech_assets: 3,
  // Human & Org
  founder_dependency: 2,            // Q5 reversed scale: 2 = strongly affected
  management_structure: 3,
  q_process_maturity: 3,
  q_transferability: 2,
  // Relational
  client_portfolio_quality: 2,
  q_strategic_partnerships: 3,
  q_reputation: 4,
  network_partnerships: 3,
  // Growth
  q_quality_of_growth: 3,
  business_scalability: 4,
  // Context
  stated_objective: 'growth',
  time_horizon: '24m',
  q_lifecycle_score: 4,
  q_distinctive_assets_score: 4,
  q_ma_history: 1,
  distinctive_assets: 'Patent on cooling-coil design; 3 long-term automotive OEM contracts',
  sector: 'Manufacturing',
  lifecycle_stage: 'Maturity',
};

// =============================================================================
// LIKERT LABELS — used by the form's rating component
// =============================================================================

export const LIKERT_LABELS: Record<keyof typeof QUESTIONS, readonly [string, string, string, string, string]> = {} as never;

/**
 * Full question metadata — labels, options, sections.
 * The form renders by walking this object.
 */
export const QUESTIONS = {
  // ---- Tech --------
  digital_maturity: {
    section: 'Technological Capital',
    n: 'Q1',
    title: 'Digitalization of core processes',
    hint: 'Operations, administration, reporting, sales — how digital are they?',
    options: [
      'Mostly manual',
      'Some processes digitalized, but fragmented',
      'Core processes partially digitalized',
      'Core processes well digitalized',
      'Core processes widely digitalized and integrated',
    ],
  },
  q_automation: {
    section: 'Technological Capital',
    n: 'Q2',
    title: 'Automation',
    hint: 'How much of the repetitive / administrative work runs without human touch?',
    options: [
      'Almost not automated',
      'Slightly automated',
      'Partially automated',
      'Largely automated',
      'Widely automated',
    ],
  },
  q_enabling_systems: {
    section: 'Technological Capital',
    n: 'Q3',
    title: 'Enabling systems',
    hint: 'ERP, CRM, production, reporting — how integrated are they?',
    options: [
      'No relevant or fully disconnected systems',
      'Systems exist but are highly disconnected',
      'Systems partially integrated',
      'Systems well integrated across functions',
      'Integrated digital backbone used regularly',
    ],
  },
  q_distinctive_tech_assets: {
    section: 'Technological Capital',
    n: 'Q4',
    title: 'Distinctive technological assets',
    hint: 'Proprietary data, software, IP, codified know-how.',
    options: [
      'No relevant distinctive assets',
      'Limited / weakly structured',
      'Some distinctive assets exist',
      'Distinctive assets are clearly present',
      'Strong and strategically relevant',
    ],
  },

  // ---- Human & Org --------
  founder_dependency: {
    section: 'Human & Organisational Capital',
    n: 'Q5',
    title: 'Founder dependency',
    hint: 'If the founder were out for 3 months, how much would operations suffer?',
    /** Note: scored "minimal dependency = 5". 1 = very severely affected. */
    options: [
      'Very severely affected',
      'Strongly affected',
      'Moderately affected',
      'Slightly affected',
      'Minimal / negligible impact',
    ],
  },
  management_structure: {
    section: 'Human & Organisational Capital',
    n: 'Q6',
    title: 'Management structure',
    hint: 'Second line of management — how strong is it?',
    options: [
      'Almost absent',
      'Very weak',
      'Partially present',
      'Well present',
      'Very solid and clearly defined',
    ],
  },
  q_process_maturity: {
    section: 'Human & Organisational Capital',
    n: 'Q7',
    title: 'Process maturity',
    hint: 'How formalised and documented are the main processes?',
    options: [
      'Barely formalized',
      'Weakly formalized',
      'Partially formalized',
      'Well formalized',
      'Highly formalized and standardized',
    ],
  },
  q_transferability: {
    section: 'Human & Organisational Capital',
    n: 'Q8',
    title: 'Transferability',
    hint: 'How easily could the company change owner / leadership team?',
    options: [
      'Very difficult to transfer',
      'Difficult',
      'Moderately transferable',
      'Fairly transferable',
      'Highly transferable',
    ],
  },

  // ---- Relational --------
  client_portfolio_quality: {
    section: 'Relational Capital',
    n: 'Q9',
    title: 'Client portfolio quality & diversification',
    hint: 'How diversified and stable is the client base?',
    options: [
      'Very concentrated and fragile',
      'Rather concentrated',
      'Moderately diversified',
      'Well diversified',
      'Very well diversified and stable',
    ],
  },
  q_strategic_partnerships: {
    section: 'Relational Capital',
    n: 'Q10',
    title: 'Strategic partnerships',
    hint: 'Are the partnerships truly value-creating (access, distribution, innovation)?',
    options: [
      'No relevant partnerships',
      'Weak / operational only',
      'Some useful partnerships',
      'Strong strategic partnerships',
      'Very strong and strategically relevant',
    ],
  },
  q_reputation: {
    section: 'Relational Capital',
    n: 'Q11',
    title: 'Reputation / market recognition',
    hint: 'How recognised is the company in its market / niche?',
    options: [
      'Hardly recognized',
      'Weakly recognized',
      'Moderately recognized',
      'Well recognized',
      'Strongly recognized / strong reputation',
    ],
  },
  network_partnerships: {
    section: 'Relational Capital',
    n: 'Q12',
    title: 'Network / ecosystem position',
    hint: 'Position within the supply chain / ecosystem.',
    options: [
      'Weak or peripheral',
      'Limited position',
      'Fair position',
      'Good position',
      'Strong and defensible',
    ],
  },

  // ---- Growth --------
  q_quality_of_growth: {
    section: 'Growth Quality & Context',
    n: 'Q13',
    title: 'Quality of growth',
    hint: 'In recent years, growth has been mostly…',
    options: [
      'Episodic / single-client driven',
      'Rather irregular',
      'Mixed',
      'Fairly stable and organic',
      'Very stable, organic, repeatable',
    ],
  },
  business_scalability: {
    section: 'Growth Quality & Context',
    n: 'Q14',
    title: 'Business model scalability',
    hint: 'Can the model grow without a proportional cost / complexity increase?',
    options: [
      'Very low scalability',
      'Low scalability',
      'Moderate scalability',
      'Fairly scalable',
      'Highly scalable',
    ],
  },

  // ---- Extended context (Q17-Q19) --------
  q_lifecycle_score: {
    section: 'Contextual Inputs',
    n: 'Q17',
    title: 'Business lifecycle stage',
    hint: 'Which option best describes the company today?',
    options: [
      'Early structuring / still building a repeatable model',
      'Stable but founder-centric and operationally immature',
      'Established and moderately structured',
      'Mature and well-structured',
      'Highly structured and strategically ready for scale or exit',
    ],
  },
  q_distinctive_assets_score: {
    section: 'Contextual Inputs',
    n: 'Q18',
    title: 'Distinctive assets',
    hint: 'Proprietary know-how, IP, exclusive capabilities, certifications, niche position.',
    options: [
      'No clearly distinctive assets',
      'Limited or weakly defendable',
      'Some meaningful distinctive assets',
      'Strong distinctive assets',
      'Highly distinctive and strategically defensible',
    ],
  },
  q_ma_history: {
    section: 'Contextual Inputs',
    n: 'Q19',
    title: 'Prior M&A / exit exposure',
    hint: 'Has the company already been through transactions or integrations?',
    options: [
      'No relevant M&A or exit exposure',
      'Informal / exploratory only',
      'Some limited transaction or integration experience',
      'Relevant transaction / structured integration experience',
      'Strong prior M&A / exit experience',
    ],
  },
} as const satisfies Record<string, {
  section: string;
  n: string;
  title: string;
  hint: string;
  options: readonly [string, string, string, string, string];
}>;

export type QuestionKey = keyof typeof QUESTIONS;

export const QUESTION_SECTIONS = [
  'Technological Capital',
  'Human & Organisational Capital',
  'Relational Capital',
  'Growth Quality & Context',
  'Contextual Inputs',
] as const;
export type QuestionSection = (typeof QUESTION_SECTIONS)[number];

/** Convenience: which fields belong to which section, in display order. */
export const QUESTIONS_BY_SECTION: Record<QuestionSection, QuestionKey[]> = {
  'Technological Capital':           ['digital_maturity', 'q_automation', 'q_enabling_systems', 'q_distinctive_tech_assets'],
  'Human & Organisational Capital':  ['founder_dependency', 'management_structure', 'q_process_maturity', 'q_transferability'],
  'Relational Capital':              ['client_portfolio_quality', 'q_strategic_partnerships', 'q_reputation', 'network_partnerships'],
  'Growth Quality & Context':        ['q_quality_of_growth', 'business_scalability'],
  'Contextual Inputs':               ['q_lifecycle_score', 'q_distinctive_assets_score', 'q_ma_history'],
};

// =============================================================================
// Field labels for the review step
// =============================================================================
export const FIELD_LABELS: Record<keyof DiagnosticInput, string> = {
  digital_maturity:              'Q1 · Digitalization',
  q_automation:                  'Q2 · Automation',
  q_enabling_systems:            'Q3 · Enabling systems',
  q_distinctive_tech_assets:     'Q4 · Distinctive tech assets',
  founder_dependency:            'Q5 · Founder dependency',
  management_structure:          'Q6 · Management structure',
  q_process_maturity:            'Q7 · Process maturity',
  q_transferability:             'Q8 · Transferability',
  client_portfolio_quality:      'Q9 · Client portfolio',
  q_strategic_partnerships:      'Q10 · Strategic partnerships',
  q_reputation:                  'Q11 · Reputation',
  network_partnerships:          'Q12 · Network position',
  q_quality_of_growth:           'Q13 · Quality of growth',
  business_scalability:          'Q14 · Scalability',
  stated_objective:              'Q15 · Stated objective',
  time_horizon:                  'Q16 · Time horizon',
  q_lifecycle_score:             'Q17 · Lifecycle',
  q_distinctive_assets_score:    'Q18 · Distinctive assets',
  q_ma_history:                  'Q19 · M&A history',
  distinctive_assets:            'Notes · Distinctive assets',
  sector:                        'Sector',
  lifecycle_stage:               'Lifecycle (legacy)',
};

// =============================================================================
// Legacy compatibility — `deriveMetrics` used to derive CAGR + margin from
// the now-removed quantitative inputs. Kept as an empty stub so nothing
// importing it breaks. AIDA snapshot supplies these now.
// =============================================================================
export function deriveMetrics(_input: DiagnosticInput) {
  return { revenue_cagr_pct: 0, ebitda_margin_pct: 0 };
}
