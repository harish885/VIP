-- =============================================================================
-- VIP · Phase 06 · Migration — demo-mode anon writes + percentile helper
-- =============================================================================
--
-- Two changes:
--
-- 1. Drop NOT NULL on `user_id` for companies, submissions, valuations and
--    recommendations so the scoring pipeline can persist demo-mode runs
--    (no auth.users row) via the service role. Auth-mode flow is unchanged.
--
-- 2. Add `vip.percentile_in_peer_group(...)` — returns percentile rank
--    of a numeric value inside a peer-group's distribution for a specific
--    JSONB path on one of the four capital tables. Used by the Phase 06
--    scoring engine (Stage 2: peer percentile rank).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Drop NOT NULL on user_id (companies, submissions, valuations, recos)
-- -----------------------------------------------------------------------------
ALTER TABLE vip.companies        ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE vip.submissions      ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE vip.valuations       ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE vip.recommendations  ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN vip.submissions.user_id IS
  'Owner of the submission. NULL = anonymous demo-mode run (service-role write).';

-- -----------------------------------------------------------------------------
-- 2) Peer-percentile helper
-- -----------------------------------------------------------------------------
-- Given a peer-group name, a capital-table key, a JSONB path inside that
-- table's `data` blob, and a value, return the percentile rank (0–100) of
-- that value within the peer group's distribution.
--
-- `capital_table` ∈ {'financial_capital','technological_capital',
--                    'human_organisational','relational_capital'}
--
-- `value_higher_is_better`:
--    TRUE  → percentile = pct_of_peers_with_value_below_or_equal
--    FALSE → percentile = pct_of_peers_with_value_above_or_equal   (inverted)
--
-- Returns NULL if the peer group has < 20 valid observations — the caller
-- (`benchmarks.ts`) falls back to a broader NACE prefix.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION vip.percentile_in_peer_group(
  p_peer_group     TEXT,
  p_capital_table  TEXT,
  p_jsonb_path     TEXT,        -- e.g. 'ebitda_margin_pct' (top-level key)
  p_value          NUMERIC,
  p_higher_is_better BOOLEAN DEFAULT TRUE
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = vip, public
AS $$
DECLARE
  v_sql       TEXT;
  v_count     INTEGER;
  v_below     INTEGER;
  v_percentile NUMERIC;
BEGIN
  IF p_peer_group IS NULL OR p_value IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_capital_table NOT IN (
    'financial_capital','technological_capital',
    'human_organisational','relational_capital'
  ) THEN
    RAISE EXCEPTION 'unknown capital table %', p_capital_table;
  END IF;

  v_sql := format(
    'SELECT count(*),
            count(*) FILTER (WHERE (cap.data->>%L)::NUMERIC %s $1)
       FROM vip.context ctx
       JOIN vip.%I cap ON cap.tax_code = ctx.tax_code
      WHERE ctx.peer_group_name = $2
        AND (cap.data ? %L)
        AND (cap.data->>%L) ~ ''^-?[0-9]+(\.[0-9]+)?$''',
    p_jsonb_path,
    CASE WHEN p_higher_is_better THEN '<=' ELSE '>=' END,
    p_capital_table,
    p_jsonb_path,
    p_jsonb_path
  );

  EXECUTE v_sql INTO v_count, v_below USING p_value, p_peer_group;

  IF v_count IS NULL OR v_count < 20 THEN
    RETURN NULL;
  END IF;

  v_percentile := (v_below::NUMERIC / v_count::NUMERIC) * 100;
  RETURN ROUND(v_percentile, 1);
END;
$$;

COMMENT ON FUNCTION vip.percentile_in_peer_group IS
  'Phase 06 helper. Returns peer-group percentile rank (0–100) for a JSONB-stored value, or NULL if the peer group has <20 obs.';

-- Same function but keyed on the 2-digit NACE prefix instead of peer-group name
-- (fallback path when peer_group is too small).
CREATE OR REPLACE FUNCTION vip.percentile_in_nace_prefix(
  p_nace_prefix    TEXT,        -- '28'
  p_capital_table  TEXT,
  p_jsonb_path     TEXT,
  p_value          NUMERIC,
  p_higher_is_better BOOLEAN DEFAULT TRUE
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = vip, public
AS $$
DECLARE
  v_sql        TEXT;
  v_count      INTEGER;
  v_below      INTEGER;
  v_percentile NUMERIC;
BEGIN
  IF p_nace_prefix IS NULL OR p_value IS NULL THEN
    RETURN NULL;
  END IF;

  v_sql := format(
    'SELECT count(*),
            count(*) FILTER (WHERE (cap.data->>%L)::NUMERIC %s $1)
       FROM vip.context ctx
       JOIN vip.%I cap ON cap.tax_code = ctx.tax_code
      WHERE substring(ctx.nace_rev_2 from 1 for length($2)) = $2
        AND (cap.data ? %L)
        AND (cap.data->>%L) ~ ''^-?[0-9]+(\.[0-9]+)?$''',
    p_jsonb_path,
    CASE WHEN p_higher_is_better THEN '<=' ELSE '>=' END,
    p_capital_table,
    p_jsonb_path,
    p_jsonb_path
  );

  EXECUTE v_sql INTO v_count, v_below USING p_value, p_nace_prefix;

  IF v_count IS NULL OR v_count < 20 THEN
    RETURN NULL;
  END IF;

  v_percentile := (v_below::NUMERIC / v_count::NUMERIC) * 100;
  RETURN ROUND(v_percentile, 1);
END;
$$;

COMMENT ON FUNCTION vip.percentile_in_nace_prefix IS
  'Phase 06 fallback. Percentile rank within the broader NACE prefix when the peer group is too thin.';
