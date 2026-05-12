# Phase 03 — Supabase setup walkthrough

End-to-end steps to stand up the database, ingest the 14,999-SME AIDA calibration set, and wire the web app to read from it.

**Estimated time:** 25–35 minutes the first time.

There are two paths — pick **A** if you want a hosted dev DB you can share with teammates (recommended), or **B** if you want everything on `localhost` via Docker.

---

## Path A — Supabase Cloud (recommended for the team)

### 1. Create the project

1. Go to <https://supabase.com/dashboard/new>.
2. Sign in (GitHub OAuth is easiest).
3. **New project** → org `VIP`, name `vip`, region nearest you (Frankfurt / Milan if you're in Italy).
4. Generate a strong DB password and **save it in your password manager**.
5. Wait ~2 minutes for provisioning.

### 2. Grab credentials

From the project dashboard:

| Where | What | Goes into |
|---|---|---|
| Settings → API → **Project URL** | `https://xxxx.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| Settings → API → **anon public** | `eyJhbGciOi...` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Settings → API → **service_role** | `eyJhbGciOi...` (keep secret) | `SUPABASE_SERVICE_ROLE_KEY` |
| Settings → Database → **Connection string** → "URI" | `postgresql://...` | `DATABASE_URL` |

### 3. Install the Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# or via npx (no install)
npx supabase --version
```

### 4. Link the local repo to the cloud project

```bash
cd ~/Documents/VIP
supabase login                              # opens browser, paste token
supabase link --project-ref YOUR_PROJECT_REF
```

(Project ref = the `xxxx` from your project URL.)

### 5. Push the migrations

```bash
supabase db push
```

You should see four migrations applied:

```
20260510000000_create_vip_schema.sql
20260510000001_calibration_tables.sql
20260510000002_user_tables.sql
20260510000003_rls_policies.sql
```

Open Studio → Table Editor → switch the schema dropdown (top-left) from `public` to **`vip`** → verify 10 tables: `context`, `financial_capital`, `technological_capital`, `human_organisational`, `relational_capital`, `profiles`, `companies`, `submissions`, `valuations`, `recommendations`.

### 5b. Expose the `vip` schema to the API ⚠️ REQUIRED

Supabase's REST API ships `public` only by default. Add `vip` once:

- Dashboard → **Settings → API** → scroll to **"Data API Settings"** → **"Exposed schemas"**
- Click "Add schema" → type `vip` → save.

Without this step, `supabase.from('companies')` returns 404. The CLI/local stack already exposes `vip` via `supabase/config.toml`.

### 6. Generate TypeScript types

```bash
supabase gen types typescript --linked --schema vip,public > web/lib/database.types.ts
```

The `--schema vip,public` is important — without it, `gen types` emits only the (empty) `public` schema and you'd end up with no types for any of our tables.

This overwrites the hand-written stub with the real schema-derived types. From here on, every new column you add to a migration shows up in TypeScript after re-running this command.

### 7. Wire the web app's env

```bash
cd web
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 8. Ingest the AIDA dataset

Back at the repo root:

```bash
cd ~/Documents/VIP
cp .env.example .env
# Edit .env and paste DATABASE_URL from step 2

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python src/ingest_aida.py --dry-run     # sanity check (no writes)
python src/ingest_aida.py               # the real run, ~30–60 s
```

### 9. Acceptance check

```bash
psql "$DATABASE_URL" -c 'SELECT count(*) FROM vip.context;'
# expected: 14999
```

Or in Studio → SQL Editor:

```sql
SELECT count(*) FROM vip.context;             -- 14999
SELECT count(*) FROM vip.financial_capital;   -- 14999
SELECT peer_group_name, count(*)
FROM vip.context
GROUP BY 1 ORDER BY 2 DESC LIMIT 5;
```

Done — Phase 03 acceptance criterion is met.

---

## Path B — Supabase local (Docker)

For solo dev with no internet dependency. Requires Docker Desktop running.

### 1. Start the local stack

```bash
cd ~/Documents/VIP
npx supabase start
```

First boot pulls a few GB of images. Subsequent boots are ~30 seconds. When ready you'll see:

```
API URL:           http://localhost:54321
DB URL:            postgresql://postgres:postgres@localhost:54322/postgres
Studio URL:        http://localhost:54323
anon key:          eyJhbGc...
service_role key:  eyJhbGc...
```

### 2. Migrations are auto-applied

Anything in `supabase/migrations/` runs on `start`. Add new ones:

```bash
supabase migration new my_change_name
# edit the generated file, then:
supabase db reset        # re-applies all migrations from scratch + seed.sql
```

### 3. Generate types from local

```bash
supabase gen types typescript --local --schema vip,public > web/lib/database.types.ts
```

### 4. Env vars

`web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from `supabase start` output>
SUPABASE_SERVICE_ROLE_KEY=<from `supabase start` output>
```

Root `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### 5. Ingest + verify

Same as Path A steps 8–9.

---

## What's in this phase

All application objects live in the **`vip`** schema. `public` is intentionally empty.

| File | Purpose |
|---|---|
| `supabase/config.toml` | Local CLI config (ports, auth, edge runtime, exposes both `public` and `vip`) |
| `supabase/migrations/20260510000000_create_vip_schema.sql` | Creates the `vip` schema + role grants + default privileges |
| `supabase/migrations/20260510000001_calibration_tables.sql` | `vip.context` + 4 capital tables (JSONB) + `vip.calibration_wide` view |
| `supabase/migrations/20260510000002_user_tables.sql` | `vip.profiles`, `vip.companies`, `vip.submissions`, `vip.valuations`, `vip.recommendations` + new-user trigger |
| `supabase/migrations/20260510000003_rls_policies.sql` | RLS on every table — public read on calibration, owner-only on user tables |
| `supabase/seed.sql` | Empty stub (calibration ingest happens via Python) |
| `src/ingest_aida.py` | Reads `data/all_capitals_clean_split.xlsx`, UPSERTs into the 5 calibration tables in `vip` |
| `web/lib/supabase/client.ts` | Browser client (anon key, cookies, default schema `vip`) |
| `web/lib/supabase/server.ts` | Server client (anon key, request cookies, default schema `vip`) |
| `web/lib/supabase/service.ts` | Service-role client — bypasses RLS, server-only, default schema `vip` |
| `web/lib/database.types.ts` | Hand-written stub matching the migrations; replace with `supabase gen types --schema vip,public` |
| `web/.env.example` + root `.env.example` | Template values |

## RLS summary at a glance

All tables live in the **`vip`** schema.

| Table | Read | Write |
|---|---|---|
| `vip.context`, `vip.financial_capital`, `vip.technological_capital`, `vip.human_organisational`, `vip.relational_capital` | public (anon + auth) | service role only |
| `vip.profiles` | own row | own row (via signup trigger) |
| `vip.companies`, `vip.submissions` | own rows | own rows |
| `vip.valuations`, `vip.recommendations` | own rows | service role only (written by scoring Edge Function in Phase 06) |

## Troubleshooting

- **`relation "vip.context" does not exist`** — you skipped migration 00 (schema creation) or migrations didn't run in order. Re-run `supabase db push`. The CLI applies migrations alphabetically by filename — `00000` comes first.
- **`supabase.from('companies')` returns 404 from the web app** — you forgot step **5b**. The `vip` schema isn't exposed on the API. Dashboard → Settings → API → Exposed schemas → add `vip`.
- **`ON CONFLICT (tax_code) does not match any unique constraint`** — calibration migration didn't run. Re-push.
- **Python `psycopg.OperationalError: SSL connection ...`** — your DB URL needs `?sslmode=require` appended for some Supabase pooler regions. Try the direct connection string instead of the pooler URL for the ingest run.
- **`supabase gen types` returns a near-empty file** — you forgot `--schema vip,public`. Without it, only the (empty) `public` schema is emitted.
- **Ingest is very slow on the pooler URL** — switch to the **direct** Postgres URL (Settings → Database → "Connection string" → not the pooler). The pooler caps statement-level batch performance.

## Next — Phase 04

Auth + onboarding. Sign-up, login, the new-user trigger we just installed will auto-create a profile, and the `/onboarding` wizard creates the first `companies` row. Brief lives in `docs/VIP_Build_Plan.pdf`, section 14, Phase 04.
