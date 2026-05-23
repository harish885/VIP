-- =============================================================================
-- VIP · Pivot · Migration — user-entered financial overrides + "not relevant"
--                            question exclusions on vip.submissions
-- =============================================================================
--
-- Two product additions reflected in the persistence layer:
--
--   1. Financial overrides. The entrepreneur can opt-out of AIDA-derived
--      quantitative inputs (revenue history, EBITDA, recurring revenue,
--      client concentration, R&D ratio) and enter their own numbers.
--      `override_*` columns record what the user typed.
--      `overrides_enabled` says whether the scoring run consumed those
--      overrides.
--
--      The raw AIDA snapshot used to live in `revenue_y_*`, `ebitda`,
--      etc. — making the snapshot get clobbered when overrides won.
--      Migration 20260513100000_aida_snapshot_columns.sql introduces
--      dedicated `aida_*` columns and repurposes the legacy columns as
--      the EFFECTIVE values the scoring engine actually consumed
--      (override → AIDA → proxy in that priority).
--
--   2. "Not relevant" question exclusion. The entrepreneur can mark any
--      qualitative question as not relevant. Excluded questions get NULL
--      in their scored column (the existing CHECK BETWEEN 1 AND 5 already
--      passes for NULL) AND are listed by key in excluded_questions[],
--      so the scoring engine can renormalise weights and the dashboard
--      can show which capitals were assessed against fewer questions.
--
-- Backwards compatible: every existing row has overrides_enabled = false
-- and excluded_questions = '{}'.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Overrides
-- -----------------------------------------------------------------------------
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS overrides_enabled                  BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS override_revenue_y_1               NUMERIC,
  ADD COLUMN IF NOT EXISTS override_revenue_y_2               NUMERIC,
  ADD COLUMN IF NOT EXISTS override_revenue_y_3               NUMERIC,
  ADD COLUMN IF NOT EXISTS override_ebitda                    NUMERIC,
  ADD COLUMN IF NOT EXISTS override_recurring_revenue_pct     NUMERIC
    CHECK (override_recurring_revenue_pct IS NULL OR override_recurring_revenue_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS override_top3_client_concentration NUMERIC
    CHECK (override_top3_client_concentration IS NULL OR override_top3_client_concentration BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS override_tech_investment_ratio_pct NUMERIC
    CHECK (override_tech_investment_ratio_pct IS NULL OR override_tech_investment_ratio_pct BETWEEN 0 AND 100);

COMMENT ON COLUMN vip.submissions.overrides_enabled IS
  'TRUE when the scoring run used the override_* values instead of the AIDA snapshot for quantitative inputs.';
COMMENT ON COLUMN vip.submissions.override_revenue_y_3 IS
  'User-entered revenue for the most recent year (€). Takes priority over AIDA snapshot when overrides_enabled.';
COMMENT ON COLUMN vip.submissions.override_ebitda IS
  'User-entered EBITDA (€). Takes priority over AIDA snapshot when overrides_enabled.';

-- -----------------------------------------------------------------------------
-- Excluded questions
-- -----------------------------------------------------------------------------
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS excluded_questions TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

COMMENT ON COLUMN vip.submissions.excluded_questions IS
  'Question keys (matching diagnostic-schema QuestionKey) the entrepreneur marked "not relevant". The scoring engine drops them from weighted means and renormalises the remaining weights.';
