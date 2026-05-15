# VIP - Value Intelligence Platform

> A company-centric decision assistant for SME entrepreneurs. VIP lets a user search an AIDA company, run a 20-question diagnostic, and receive an enterprise-value estimate, value gap, quality score, risk index, four capital scores, Top-3 value actions, and simulation levers.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-shared_cloud-3ECF8E?logo=supabase&logoColor=white)
![AIDA](https://img.shields.io/badge/AIDA-14,999_SMEs-CB9A48)
![Vercel](https://img.shields.io/badge/Vercel-ready-black?logo=vercel)

---

## Teammate Setup: Start Here

The team uses one shared Supabase Cloud project. That means teammates do **not** need to create a new Supabase project, run database migrations, start Docker, or ingest the AIDA Excel file.

The database already contains:

- The `vip` schema
- All application tables
- The AIDA company snapshot
- 14,999 Italian manufacturing SME rows
- The percentile/peer-group functions used by the scoring engine

Each teammate only needs to clone the repo, create local environment files, install dependencies, and run the Next.js app.

### 1. Install These Tools

Install these once on your machine:

| Tool | Needed for | Download |
|---|---|---|
| Node.js 20 or newer | Running the web app | https://nodejs.org |
| npm | Installed with Node.js | https://nodejs.org |
| Git | Cloning and pushing code | https://git-scm.com |
| Supabase account access | Viewing project keys and database tables | https://supabase.com |

You do **not** need Docker for normal teammate development because we are not running Supabase locally.

You do **not** need Python unless you are re-ingesting or changing the AIDA dataset.

### 2. Clone The Project

```bash
git clone https://github.com/harish885/VIP.git
cd VIP
```

### 3. Create The Web Environment File

The Next.js app reads its environment variables from `web/.env.local`.

Run:

```bash
cd web
cp .env.example .env.local
```

Now open `web/.env.local` and fill it like this:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

What each value means:

| Variable | What it is | Where to get it | Safe to share in chat? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL for the shared project | Supabase Dashboard -> Project Settings -> API -> Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public browser key | Supabase Dashboard -> Project Settings -> API -> Project API keys -> anon public | Yes, but still keep it inside `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by demo mode to write submissions and valuations | Supabase Dashboard -> Project Settings -> API -> Project API keys -> service_role | No. Share only through a private channel |

Important:

- Never commit `web/.env.local`.
- Never prefix the service-role key with `NEXT_PUBLIC_`.
- Never paste the service-role key into a client component.
- The service-role key bypasses Row Level Security, so treat it like a password.

### 4. Install Web Dependencies

From inside `web/`:

```bash
npm install
```

### 5. Run The App

From inside `web/`:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already busy, Next.js may offer another port such as `3001`. Use the URL printed in the terminal.

### 6. Test The Main Flow

Use this flow to confirm everything is connected correctly:

1. Open `http://localhost:3000`.
2. Go to `/companies`.
3. Search for a company from the AIDA dataset.
4. Open the company page.
5. Click **Run diagnostic**.
6. Answer the 20 qualitative questions.
7. Submit the diagnostic.
8. Confirm that the company dashboard shows valuation, quality, risk, Top-3 recommendations, and simulation.

Useful routes:

| Route | Purpose |
|---|---|
| `/` | Product story / marketing page |
| `/companies` | Search the shared AIDA company snapshot |
| `/companies/[taxCode]` | Company factsheet and dashboard |
| `/companies/[taxCode]/diagnostic` | 20-question diagnostic |
| `/how-it-works` | Interactive project explainer |
| `/method` | Methodology page |

### 7. Run Checks Before Pushing Code

From inside `web/`:

```bash
npm run type-check
npm run lint
npx tsx scripts/calibrate-acme.ts
npx tsx scripts/calibrate-recommendations.ts
```

What these checks do:

| Command | Purpose |
|---|---|
| `npm run type-check` | Confirms TypeScript is valid |
| `npm run lint` | Catches common code and style problems |
| `npx tsx scripts/calibrate-acme.ts` | Confirms the ACME demo profile still lands near the expected valuation |
| `npx tsx scripts/calibrate-recommendations.ts` | Confirms recommendation ranking still behaves as expected |

---

## Supabase Access For Teammates

The project owner has added teammates to the Supabase project, so each teammate can open the shared project directly in Supabase Dashboard.

### What Teammates Need From The Owner

Send each teammate:

```text
GitHub repo:
https://github.com/harish885/VIP

Supabase project URL:
https://YOUR_PROJECT_REF.supabase.co

Supabase anon key:
YOUR_SUPABASE_ANON_KEY

Service-role key:
Share privately, or ask them to copy it from Supabase Dashboard if their role allows it.
```

Do not send the service-role key in a public channel, group chat, GitHub issue, README, or screenshot.

### Where To Find Supabase Values

In Supabase:

1. Open the shared VIP project.
2. Go to **Project Settings**.
3. Go to **API**.
4. Copy **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`.
5. Copy **anon public** into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Copy **service_role** into `SUPABASE_SERVICE_ROLE_KEY`.

### Confirm The `vip` Schema Is Exposed

This should already be done in the shared project. If the web app returns 404 errors from Supabase, check this:

1. Open Supabase Dashboard.
2. Go to **Project Settings**.
3. Go to **API**.
4. Find **Data API Settings**.
5. Confirm `vip` is included in **Exposed schemas**.

Without this, calls like `supabase.from('companies')` can fail even when the table exists.

---

## Common Problems And Fixes

| Problem | Most likely cause | Fix |
|---|---|---|
| `npm install` fails | Old Node.js version | Install Node.js 20 or newer |
| Browser says Supabase URL is missing | `web/.env.local` does not exist or has wrong variable names | Recreate `web/.env.local` from `web/.env.example` |
| `/companies` is empty | App is pointing to the wrong Supabase project | Check `NEXT_PUBLIC_SUPABASE_URL` and anon key |
| Supabase request returns 404 | `vip` schema is not exposed in Supabase API settings | Add `vip` to exposed schemas |
| Diagnostic submit fails | Missing or wrong `SUPABASE_SERVICE_ROLE_KEY` | Copy the service-role key again into `web/.env.local` |
| Type generation returns an almost empty file | Schema flag was omitted | Use `--schema vip,public` |
| App keeps using old env values | Dev server was already running | Stop it with `Ctrl+C`, then run `npm run dev` again |

---

## Owner/Admin Tasks Only

Normal teammates can skip this section.

Use these only when changing the database schema, regenerating Supabase types, or re-ingesting AIDA data.

### Push Database Migrations To The Shared Supabase Project

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Regenerate Database Types

From the repo root:

```bash
supabase gen types typescript --linked --schema vip,public > web/lib/database.types.ts
```

Always include `vip,public`. If you only generate `public`, the generated file will miss the application tables.

### Re-Ingest AIDA Data

Only do this if the dataset or ingestion code changes.

Create the root `.env` file:

```bash
cp .env.example .env
```

Fill:

```bash
DATABASE_URL=postgresql://...
```

For cloud Supabase, prefer the transaction-pooler connection string from:

```text
Supabase Dashboard -> Project Settings -> Database -> Connection string
```

Then run:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python src/ingest_aida.py --dry-run
python src/ingest_aida.py
```

Verify:

```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM vip.context;"
```

Expected:

```text
14999
```

---

## What VIP Does

VIP estimates and explains strategic enterprise value for SME entrepreneurs.

The user-facing output includes:

| Output | Meaning |
|---|---|
| Enterprise Value | Estimated company value and valuation range |
| Value Gap | Distance between current value and optimized potential value |
| Quality Score | Overall 0-100 company quality signal |
| Risk Index | Fragility, concentration, and resilience view |
| Four Capital Scores | Financial, Technological, Human & Organisational, Relational |
| Top-3 Actions | Priority actions ranked by Return on Value |
| Simulation | Sliders showing how business improvements affect value |

Core valuation formula:

```text
V = EBITDA x M_sector x SQF x GF
```

Where:

| Variable | Meaning |
|---|---|
| `EBITDA` | Earnings baseline from company financials |
| `M_sector` | Sector multiple calibrated by NACE/ATECO |
| `SQF` | Strategic Quality Factor from the four capitals |
| `GF` | Growth Factor from forward-looking business strength |

The model is calibrated against 14,999 Italian manufacturing SMEs from AIDA / Bureau van Dijk.

---

## Product Flow

The app is company-centric:

```text
/ -> /companies -> /companies/[taxCode] -> /companies/[taxCode]/diagnostic -> /companies/[taxCode]?submitted=...
```

What happens:

1. The user searches the AIDA snapshot.
2. The app opens a per-company factsheet.
3. If no diagnostic exists, the dashboard asks the user to run one.
4. The 20-question diagnostic collects qualitative business signals.
5. Quantitative company facts are pulled from AIDA at submission time.
6. The scoring engine calculates valuation, risk, capitals, and recommendations.
7. The company dashboard renders the result and simulation controls.

The old free-form `/diagnostic` route redirects to `/companies`.

---

## Architecture

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript strict, Tailwind CSS |
| Forms | React Hook Form + Zod |
| Motion | GSAP for radar/count-ups, `useReveal` for calm scroll reveals |
| Database | Supabase Postgres, all application objects in the `vip` schema |
| Auth | Built but dormant in demo mode |
| Scoring | Shared TypeScript module in `web/lib/scoring/` |
| Data prep | Python, pandas, openpyxl, psycopg |
| Hosting | Vercel |

Important rule:

```text
All application database objects live in the vip schema, not public.
```

---

## Repository Map

```text
VIP/
├── AGENTS.md                    Codex project briefing
├── README.md                    This file
├── cinematic-infographic/       Standalone cinematic project infographic
├── data/                        AIDA Excel source files
├── docs/                        Methodology and build-plan PDFs
├── src/                         Python splitter and AIDA ingestion
├── supabase/                    Supabase config and migrations
└── web/                         Next.js application
    ├── app/                     App Router pages and server actions
    ├── components/              Chrome, marketing, dashboard, diagnostic UI
    ├── lib/                     Supabase clients, scoring, loaders, utilities
    └── scripts/                 Calibration checks
```

High-signal files:

| Need | File |
|---|---|
| Model rationale | `docs/SME_Valuation_Design.pdf` |
| Full build plan | `docs/VIP_Build_Plan.pdf` |
| Supabase setup history | `docs/PHASE_03_SETUP.md` |
| DB migrations | `supabase/migrations/` |
| AIDA ingestion | `src/ingest_aida.py` |
| Company/AIDA bridge | `web/lib/scoring/company-input.ts` |
| Scoring pipeline | `web/lib/scoring/` |
| Company dashboard workspace | `web/components/company-workspace/workspace.tsx` |
| Company search | `web/app/(app)/companies/page.tsx` |
| Diagnostic action | `web/app/(app)/companies/[taxCode]/diagnostic/actions.ts` |

---

## Scoring Pipeline

The scoring engine is a TypeScript module, not a Supabase Edge Function.

```text
web/lib/scoring/
  index.ts             runScoring(input, ctx)
  metrics.ts           derives metrics from questionnaire + AIDA
  benchmarks.ts        peer percentile lookup with synthetic fallback
  aggregate.ts         capital scores, CQS, SQF
  valuation.ts         GF and enterprise value
  flags.ts             fragility flags and risk index
  recommendations.ts   ROV-ranked action engine
  company-input.ts     bridges 20Q diagnostic + AIDA into scoring input
```

Submission path:

```text
validate form
-> load AIDA snapshot
-> create/update company
-> insert submission
-> run scoring
-> insert valuation
-> insert recommendations
-> redirect to company dashboard
```

Demo mode allows anonymous local delivery by writing with the service role and using an httpOnly cookie to find the latest submitted result.

---

## Demo Numbers

When you need consistent placeholder numbers, use the ACME-style profile:

| Metric | Value |
|---|---|
| Enterprise Value | EUR 4.2M |
| Range | EUR 3.8M - EUR 4.7M |
| Quality | 67 / 100 |
| Value Gap | +38% -> EUR 5.8M potential |
| Risk | Medium |
| EBITDA | EUR 750K |
| Multiple | 5.0x |
| SQF | 1.05 |
| GF | 1.07 |

Top actions:

| Rank | Action | Estimated value lift |
|---|---|---|
| 1 | Reduce client concentration | +12% |
| 2 | Increase recurring revenue | +9% |
| 3 | Strengthen middle management | +7% |

Math check:

```text
750,000 x 5.0 x 1.05 x 1.07 ~= 4.21M
```

---

## Project Context

This is an academic project for the Master in Data Science for Management at Cattolica. The goal is a polished final demo for late May 2026: credible methodology, real calibration data, and a product experience that makes strategic valuation understandable for SME founders.
