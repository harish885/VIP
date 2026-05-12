-- =============================================================================
-- VIP · Phase 03 · Migration 00 — Create the `vip` schema
-- =============================================================================
--
-- Everything VIP-specific lives in its own schema. `public` is left empty so
-- Supabase-managed objects (and any future PostgREST defaults) don't collide
-- with our application tables.
--
-- After this migration runs, the `vip` schema must also be exposed via the
-- PostgREST API:
--   · Local:  config.toml [api] schemas = ["public", "vip"]
--   · Cloud:  Dashboard → Settings → API → "Exposed schemas" → add `vip`
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS vip;

COMMENT ON SCHEMA vip IS
  'VIP — Value Intelligence Platform. All application tables, views, '
  'functions, and triggers live in this schema.';

-- The Supabase API roles need to *see* the schema before RLS can filter rows.
-- USAGE is the "open the door" grant; per-table grants come further down.
GRANT USAGE ON SCHEMA vip TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Default privileges for any future object created in `vip`
-- -----------------------------------------------------------------------------
-- These apply to objects created AFTER this statement, by the role running
-- the statement (postgres). Our subsequent migrations therefore inherit them.
-- RLS still gates row visibility per user — these grants only make the
-- *table* visible to PostgREST.

ALTER DEFAULT PRIVILEGES IN SCHEMA vip
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA vip
  GRANT SELECT ON TABLES
  TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA vip
  GRANT ALL ON TABLES
  TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA vip
  GRANT ALL ON SEQUENCES
  TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA vip
  GRANT EXECUTE ON FUNCTIONS
  TO anon, authenticated, service_role;
