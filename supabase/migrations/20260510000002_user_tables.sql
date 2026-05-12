-- =============================================================================
-- VIP · Phase 03 · Migration 02 — User-facing tables
-- =============================================================================
--
-- The five user-scoped tables consumed by the dashboard. Every row carries a
-- `user_id` foreign-keyed to `auth.users(id)`; RLS (migration 03) restricts
-- access to the row's owner.
--
-- Relationships:
--   auth.users  1─1  profiles
--   auth.users  1─*  companies
--   companies   1─*  submissions
--   submissions 1─1  valuations
--   valuations  1─*  recommendations (rank 1, 2, 3)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles · per-user metadata (mirrors auth.users 1:1)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip.profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  organisation  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vip.profiles IS 'Per-user profile metadata — created automatically on sign-up via trigger.';

-- -----------------------------------------------------------------------------
-- companies · a company the user owns or is evaluating
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip.companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sector          TEXT,           -- e.g. "Manufacturing"
  nace_code       TEXT,           -- e.g. "282" — joins to calibration peer groups
  province        TEXT,
  lifecycle_stage TEXT,           -- "Early", "Growth", "Maturity", "Decline"
  distinctive_assets TEXT,
  ma_exit_history TEXT,
  stated_objective TEXT,
  time_horizon    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON vip.companies (user_id);
CREATE INDEX IF NOT EXISTS idx_companies_nace    ON vip.companies (nace_code);
COMMENT ON TABLE vip.companies IS 'A company the user is valuing — their own SME or an acquisition target.';

-- -----------------------------------------------------------------------------
-- submissions · questionnaire snapshot
-- -----------------------------------------------------------------------------
-- Quantitative inputs (6) + qualitative 1–5 (6) + contextual notes (5).
-- A new submission row is created every time the user re-runs the diagnostic;
-- valuations and recommendations link to a specific submission.
CREATE TABLE IF NOT EXISTS vip.submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   UUID NOT NULL REFERENCES vip.companies(id) ON DELETE CASCADE,

  -- Quantitative
  revenue_y_1                 NUMERIC,  -- 3 years back
  revenue_y_2                 NUMERIC,
  revenue_y_3                 NUMERIC,  -- last available year
  ebitda                      NUMERIC,
  ebitda_margin_pct           NUMERIC,
  recurring_revenue_pct       NUMERIC,
  top3_client_concentration   NUMERIC,
  revenue_cagr_pct            NUMERIC,
  tech_investment_ratio_pct   NUMERIC,

  -- Qualitative 1–5
  founder_dependency          SMALLINT CHECK (founder_dependency        BETWEEN 1 AND 5),
  management_structure        SMALLINT CHECK (management_structure      BETWEEN 1 AND 5),
  digital_maturity            SMALLINT CHECK (digital_maturity          BETWEEN 1 AND 5),
  client_portfolio_quality    SMALLINT CHECK (client_portfolio_quality  BETWEEN 1 AND 5),
  business_scalability        SMALLINT CHECK (business_scalability      BETWEEN 1 AND 5),
  network_partnerships        SMALLINT CHECK (network_partnerships      BETWEEN 1 AND 5),

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id    ON vip.submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_company_id ON vip.submissions (company_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted  ON vip.submissions (submitted_at DESC);
COMMENT ON TABLE vip.submissions IS 'Snapshot of a single questionnaire submission. Immutable — new run = new row.';

-- -----------------------------------------------------------------------------
-- valuations · computed result of the scoring pipeline
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip.valuations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id   UUID NOT NULL REFERENCES vip.submissions(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES vip.companies(id) ON DELETE CASCADE,

  -- Headline numbers
  v_current_eur       NUMERIC,            -- € today
  v_potential_eur     NUMERIC,            -- € if Top-3 actions executed
  v_low_eur           NUMERIC,            -- range low
  v_high_eur          NUMERIC,            -- range high
  value_gap_pct       NUMERIC,            -- (v_potential - v_current) / v_current * 100

  -- Building blocks of V
  ebitda_norm         NUMERIC,
  m_sector            NUMERIC,
  sqf                 NUMERIC CHECK (sqf BETWEEN 0.5 AND 1.5),
  gf                  NUMERIC CHECK (gf  BETWEEN 0.6 AND 1.6),

  -- Composite indices
  quality_score       SMALLINT CHECK (quality_score BETWEEN 0 AND 100),
  risk_index          TEXT CHECK (risk_index IN ('LOW', 'MEDIUM', 'HIGH')),
  scalability_index   SMALLINT CHECK (scalability_index BETWEEN 0 AND 100),

  -- Per-capital scores
  cap_financial       SMALLINT CHECK (cap_financial       BETWEEN 0 AND 100),
  cap_technological   SMALLINT CHECK (cap_technological   BETWEEN 0 AND 100),
  cap_human           SMALLINT CHECK (cap_human           BETWEEN 0 AND 100),
  cap_relational      SMALLINT CHECK (cap_relational      BETWEEN 0 AND 100),

  -- Fragility flags surfaced by the scoring engine
  flags               TEXT[] DEFAULT '{}'::TEXT[],

  computed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (submission_id)
);
CREATE INDEX IF NOT EXISTS idx_valuations_user_id    ON vip.valuations (user_id);
CREATE INDEX IF NOT EXISTS idx_valuations_company_id ON vip.valuations (company_id);
COMMENT ON TABLE vip.valuations IS 'Output of the scoring + valuation pipeline for one submission.';

-- -----------------------------------------------------------------------------
-- recommendations · Top-3 ROV-ranked actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip.recommendations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valuation_id        UUID NOT NULL REFERENCES vip.valuations(id) ON DELETE CASCADE,

  rank                SMALLINT NOT NULL CHECK (rank IN (1, 2, 3)),
  title               TEXT NOT NULL,
  description         TEXT,
  capital_impact      TEXT,            -- e.g. "SQF +0.12" or "GF +0.15"
  v_uplift_pct        NUMERIC,         -- expected % value uplift
  rov_score           NUMERIC,         -- Return on Value score used for ranking
  time_horizon_months SMALLINT CHECK (time_horizon_months BETWEEN 1 AND 60),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (valuation_id, rank)
);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id      ON vip.recommendations (user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_valuation_id ON vip.recommendations (valuation_id);
COMMENT ON TABLE vip.recommendations IS 'Top-3 ROV-ranked actions for a valuation. rank ∈ {1, 2, 3}.';

-- -----------------------------------------------------------------------------
-- Auto-create profile on signup
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION vip.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vip
AS $$
BEGIN
  INSERT INTO vip.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION vip.handle_new_user();

-- -----------------------------------------------------------------------------
-- Updated-at trigger function (re-usable)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION vip.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON vip.profiles
  FOR EACH ROW EXECUTE FUNCTION vip.set_updated_at();

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON vip.companies
  FOR EACH ROW EXECUTE FUNCTION vip.set_updated_at();
