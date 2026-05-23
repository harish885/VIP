-- =============================================================================
-- VIP · Pivot · Migration — separate AIDA snapshot columns on submissions
-- =============================================================================
--
-- Previously vip.submissions only stored a single set of quantitative
-- columns (revenue_y_*, ebitda, …). With user-entered overrides those
-- columns hold the *effective* values the scoring engine consumed — but
-- we lost the raw AIDA baseline whenever overrides were enabled.
--
-- This migration adds an `aida_*` shadow set so every submission row
-- carries three things side by side:
--
--   1. `aida_*`        — the AIDA snapshot as it stood at submission time.
--                        Always populated, never modified by overrides.
--                        Provides the baseline you can compare against.
--
--   2. `override_*`    — the values the user typed in (NULL unless they
--                        toggled overrides ON for that specific field).
--                        Already added by 20260513000000.
--
--   3. legacy columns  — `revenue_y_*`, `ebitda`, `ebitda_margin_pct`,
--                        `recurring_revenue_pct`,
--                        `top3_client_concentration`,
--                        `tech_investment_ratio_pct`,
--                        `revenue_cagr_pct` — these now hold the
--                        EFFECTIVE values used by the scoring engine,
--                        i.e. override → AIDA → proxy in that priority.
--
-- With this split the valuation is fully reproducible from any
-- submission row.
-- =============================================================================

ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS aida_revenue_y_1               NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_revenue_y_2               NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_revenue_y_3               NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_ebitda                    NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_ebitda_margin_pct         NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_recurring_revenue_pct     NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_top3_client_concentration NUMERIC,
  ADD COLUMN IF NOT EXISTS aida_tech_investment_ratio_pct NUMERIC;

COMMENT ON COLUMN vip.submissions.aida_revenue_y_3 IS
  'Revenue (most recent year) as read from the AIDA snapshot at submission time. Never overwritten by user overrides.';
COMMENT ON COLUMN vip.submissions.aida_ebitda IS
  'EBITDA as read from the AIDA snapshot at submission time. Never overwritten by user overrides.';
COMMENT ON COLUMN vip.submissions.aida_recurring_revenue_pct IS
  'Recurring revenue % from AIDA. AIDA does not carry this directly today — kept NULL for forward compatibility.';
COMMENT ON COLUMN vip.submissions.aida_top3_client_concentration IS
  'Top-3 client concentration % from AIDA. AIDA does not carry this directly today — kept NULL for forward compatibility.';
COMMENT ON COLUMN vip.submissions.aida_tech_investment_ratio_pct IS
  'R&D / revenue % derived from AIDA at submission time (R&D expense / last-year revenue × 100). NULL when AIDA does not report R&D for this company.';

-- Existing column re-purposed: these now hold the *effective* values
-- the scoring engine consumed (override → AIDA → proxy). Update the
-- comments so future readers know which set is which.
COMMENT ON COLUMN vip.submissions.revenue_y_3 IS
  'Effective revenue (most recent year) used by the scoring engine — = override_revenue_y_3 if overrides_enabled, otherwise aida_revenue_y_3.';
COMMENT ON COLUMN vip.submissions.ebitda IS
  'Effective EBITDA used by the scoring engine — = override_ebitda if overrides_enabled, otherwise aida_ebitda.';
COMMENT ON COLUMN vip.submissions.recurring_revenue_pct IS
  'Effective recurring revenue % used by the scoring engine — override, AIDA, or proxied from Q9 + Q13.';
COMMENT ON COLUMN vip.submissions.top3_client_concentration IS
  'Effective top-3 concentration % used by the scoring engine — override, AIDA (when available), or proxied from Q9.';
COMMENT ON COLUMN vip.submissions.tech_investment_ratio_pct IS
  'Effective R&D / revenue % used by the scoring engine — override, AIDA (when reported), or proxied from Q1 + Q4.';
