-- =============================================================================
-- VIP · Phase 03 · Migration 03 — Row-Level Security
-- =============================================================================
--
-- Policy summary:
--
--   Calibration tables (context, financial_capital, ...):
--     · RLS ENABLED
--     · SELECT — any authenticated OR anon user (the AIDA dataset is
--       reference material; the dashboard reads it for percentile lookups).
--     · INSERT/UPDATE/DELETE — service role only (the ingestion script).
--
--   User-facing tables (profiles, companies, submissions, valuations,
--   recommendations):
--     · RLS ENABLED
--     · USING (user_id = auth.uid())          for SELECT, UPDATE, DELETE
--     · WITH CHECK (user_id = auth.uid())     for INSERT, UPDATE
--     · profiles uses `user_id` as the PK so the check is on that column.
--
-- The service role bypasses RLS by design — used by Edge Functions (Phase 06)
-- to write valuations + recommendations after scoring.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Calibration tables · enable RLS, public read, service-role write
-- -----------------------------------------------------------------------------
ALTER TABLE vip.context                ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip.financial_capital      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip.technological_capital  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip.human_organisational   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip.relational_capital     ENABLE ROW LEVEL SECURITY;

-- SELECT — open to anyone (anon + authenticated). The dataset is reference
-- material; nothing user-specific lives here.
DROP POLICY IF EXISTS "calibration_select_anyone" ON vip.context;
CREATE POLICY "calibration_select_anyone" ON vip.context
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "calibration_select_anyone" ON vip.financial_capital;
CREATE POLICY "calibration_select_anyone" ON vip.financial_capital
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "calibration_select_anyone" ON vip.technological_capital;
CREATE POLICY "calibration_select_anyone" ON vip.technological_capital
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "calibration_select_anyone" ON vip.human_organisational;
CREATE POLICY "calibration_select_anyone" ON vip.human_organisational
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "calibration_select_anyone" ON vip.relational_capital;
CREATE POLICY "calibration_select_anyone" ON vip.relational_capital
  FOR SELECT TO anon, authenticated USING (true);

-- NO write policies for calibration tables: the service role bypasses RLS,
-- so the ingestion script can still INSERT/UPDATE/DELETE. End-user roles
-- cannot.

-- -----------------------------------------------------------------------------
-- profiles · scoped to the owning user
-- -----------------------------------------------------------------------------
ALTER TABLE vip.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON vip.profiles;
CREATE POLICY "profiles_select_own" ON vip.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON vip.profiles;
CREATE POLICY "profiles_update_own" ON vip.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT is performed by the on_auth_user_created trigger (security definer);
-- we deliberately don't expose an INSERT policy to end users.

-- -----------------------------------------------------------------------------
-- companies, submissions, valuations, recommendations
-- · standard "owns by user_id" pattern
-- -----------------------------------------------------------------------------

-- companies
ALTER TABLE vip.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_select_own" ON vip.companies;
CREATE POLICY "companies_select_own" ON vip.companies
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "companies_insert_own" ON vip.companies;
CREATE POLICY "companies_insert_own" ON vip.companies
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "companies_update_own" ON vip.companies;
CREATE POLICY "companies_update_own" ON vip.companies
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "companies_delete_own" ON vip.companies;
CREATE POLICY "companies_delete_own" ON vip.companies
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- submissions
ALTER TABLE vip.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_select_own" ON vip.submissions;
CREATE POLICY "submissions_select_own" ON vip.submissions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "submissions_insert_own" ON vip.submissions;
CREATE POLICY "submissions_insert_own" ON vip.submissions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "submissions_delete_own" ON vip.submissions;
CREATE POLICY "submissions_delete_own" ON vip.submissions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Submissions are immutable post-insert; no UPDATE policy.

-- valuations · clients can SELECT, NEVER directly INSERT/UPDATE
-- (writes happen via the scoring Edge Function with the service role).
ALTER TABLE vip.valuations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "valuations_select_own" ON vip.valuations;
CREATE POLICY "valuations_select_own" ON vip.valuations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- recommendations · same pattern as valuations
ALTER TABLE vip.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recommendations_select_own" ON vip.recommendations;
CREATE POLICY "recommendations_select_own" ON vip.recommendations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- View security · grant SELECT on calibration_wide (read-only convenience)
-- -----------------------------------------------------------------------------
GRANT SELECT ON vip.calibration_wide TO anon, authenticated;
