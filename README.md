# VIP — Value Intelligence Platform

> A colorful decision assistant for Italian SME entrepreneurs: search a company, answer a 20-question diagnostic, and get an estimated enterprise value, quality score, risk view, value gap, Top-3 actions, and simulation levers.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-vip_schema-3ECF8E?logo=supabase&logoColor=white)
![Python](https://img.shields.io/badge/Python-ingestion-3776AB?logo=python&logoColor=white)
![Dataset](https://img.shields.io/badge/AIDA-14,999_SMEs-8A2BE2)
![Status](https://img.shields.io/badge/Status-demo_ready-2EA44F)

---

## 🚀 Run The Whole Project Locally

This section is intentionally first. If you are a teammate cloning the repo for the first time, follow this before reading the methodology.

### 0. 🧰 What You Need

Install these once:

| Tool | Why |
|---|---|
| **Node.js 20+** and npm | Runs the Next.js app in `web/` |
| **Python 3.10+** | Loads the AIDA Excel dataset into Supabase |
| **Supabase CLI** | Applies migrations and runs local Supabase |
| **Docker Desktop** | Required only for local Supabase |
| **psql** | Optional but useful for verification queries |

Supabase CLI install options:

```bash
# macOS
brew install supabase/tap/supabase

# or no global install
npx supabase --version
```

Clone and enter the repo:

```bash
git clone https://github.com/harish885/VIP.git
cd VIP
```

### 1. 🟢 Choose Your Supabase Mode

Pick one path:

| Path | Best for | What happens |
|---|---|---|
| **A. Shared Supabase Cloud** | Team work, one shared dev database | Everyone connects to the same hosted Supabase project |
| **B. Supabase Local** | Solo/offline dev | Docker runs Supabase on your machine |

Path A is easiest for teammates because the 14,999-row AIDA dataset is ingested once and shared.

---

### Path A — Shared Supabase Cloud

Ask the project owner for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

Then create env files:

```bash
cp web/.env.example web/.env.local
cp .env.example .env
```

Fill `web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Fill root `.env`:

```bash
DATABASE_URL=postgresql://...
```

If the cloud project is already migrated and ingested, skip to **Step 3: Run the web app**.

If you are setting up a new cloud project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Important cloud-only step:

1. Open Supabase Dashboard.
2. Go to **Settings -> API -> Data API Settings -> Exposed schemas**.
3. Add `vip` and save.

Without exposing `vip`, the app will return 404s from calls like `supabase.from('companies')`.

Generate fresh database types:

```bash
supabase gen types typescript --linked --schema vip,public > web/lib/database.types.ts
```

---

### Path B — Supabase Local With Docker

Start Docker Desktop, then run:

```bash
supabase start
```

If you already had a local Supabase project running and want a clean database, reset it after start:

```bash
supabase db reset
```

The CLI prints values like:

```text
API URL:           http://localhost:54321
DB URL:            postgresql://postgres:postgres@localhost:54322/postgres
Studio URL:        http://localhost:54323
anon key:          eyJhbGc...
service_role key:  eyJhbGc...
```

Create env files:

```bash
cp web/.env.example web/.env.local
cp .env.example .env
```

Fill `web/.env.local` with the local values:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>
```

Fill root `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

Generate fresh database types:

```bash
supabase gen types typescript --local --schema vip,public > web/lib/database.types.ts
```

Local Studio opens at:

```text
http://localhost:54323
```

---

### 2. 📊 Ingest The AIDA Dataset

Run this once per database. It loads `data/all_capitals_clean_split.xlsx` into the `vip` schema.

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python src/ingest_aida.py --dry-run
python src/ingest_aida.py
```

Verify the load:

```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM vip.context;"
```

Expected result:

```text
14999
```

You can also check in Supabase Studio:

```sql
SELECT count(*) FROM vip.context;
SELECT count(*) FROM vip.aida_company_snapshot;
```

### 3. 🌐 Run The Web App

```bash
cd web
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Try the full demo flow:

1. Go to `/companies`.
2. Search for an AIDA company.
3. Open the company dashboard.
4. Click **Run diagnostic**.
5. Answer the 20 qualitative questions.
6. Submit and return to the company dashboard with valuation, risk, Top-3 recommendations, and simulation.

Useful routes:

| Route | Purpose |
|---|---|
| `/` | Marketing/product story |
| `/companies` | Search the 14,999-company AIDA snapshot |
| `/companies/[taxCode]` | Company factsheet and dashboard |
| `/companies/[taxCode]/diagnostic` | 20-question diagnostic |
| `/how-it-works` | Interactive explainer |
| `/method` | Methodology page |
| `/infographic` | Product infographic |

### 4. ✅ Verify Before You Push

```bash
cd web
npm run type-check
npm run lint
npx tsx scripts/calibrate-acme.ts
npx tsx scripts/calibrate-recommendations.ts
```

The two calibration scripts check that the demo ACME-style profile still lands near the expected valuation and Top-3 recommendations.

### 5. 🛠️ Common Setup Problems

| Symptom | Fix |
|---|---|
| `supabase.from('companies')` returns 404 | In Supabase Cloud, expose the `vip` schema under **Settings -> API** |
| Generated types are almost empty | Re-run with `--schema vip,public` |
| `relation "vip.context" does not exist` | Migrations did not run; use `supabase db push` or restart local Supabase |
| Search page has no companies | Run `python src/ingest_aida.py` and verify `vip.context` has 14,999 rows |
| Python cannot connect to Supabase Cloud | Use the transaction-pooler URL or append `?sslmode=require` if needed |
| Dashboard writes fail in demo mode | Confirm `SUPABASE_SERVICE_ROLE_KEY` is present in `web/.env.local` |

More detailed database setup lives in [`docs/PHASE_03_SETUP.md`](docs/PHASE_03_SETUP.md).

---

## 🌈 What This Project Is

VIP is a digital decision assistant for SME entrepreneurs. Instead of asking founders to understand valuation theory, it asks a focused diagnostic question set and combines those answers with real AIDA company context.

The output is designed to be boardroom-readable:

| Output | What it means |
|---|---|
| **Enterprise Value** | Estimated company value and range |
| **Value Gap** | Distance between current value and optimized potential |
| **Quality Score** | Overall 0-100 company quality signal |
| **Risk Index** | Fragility and concentration risk view |
| **4 Capital Scores** | Financial, Technological, Human & Organisational, Relational |
| **Top-3 Actions** | Priority actions ranked by Return on Value |
| **Simulation** | Sliders that show how improving levers changes value |

The core valuation logic is:

```text
V = EBITDA x M_sector x SQF x GF
```

Where:

| Variable | Meaning |
|---|---|
| `EBITDA` | Company earnings baseline |
| `M_sector` | Sector multiple calibrated by NACE/ATECO |
| `SQF` | Strategic Quality Factor from the 4 capitals |
| `GF` | Growth Factor from growth and forward-looking strength |

The model is calibrated against **14,999 Italian manufacturing SMEs** from AIDA / Bureau van Dijk.

---

## 🎨 The Four Capitals

| Color | Capital | What it captures |
|---|---|---|
| 🔵 Blue | **Financial** | Profitability, growth, leverage, liquidity, cash-flow quality |
| 🟣 Violet | **Technological** | R&D, intangible assets, capex intensity, digital maturity |
| 🟠 Amber | **Human & Organisational** | Management depth, delegation, governance, operating maturity |
| 🟢 Green | **Relational** | Customer concentration, recurring revenue, supplier and market strength |

These capitals feed the Strategic Quality Factor. The dashboard turns the scores into a practical value-improvement map rather than a static report.

---

## 🧭 Current Product Flow

The app is now company-centric:

```text
/ -> /companies -> /companies/[taxCode] -> /companies/[taxCode]/diagnostic -> /companies/[taxCode]?submitted=...
```

What happens:

1. The user searches the AIDA snapshot.
2. The app opens a per-company factsheet.
3. If no diagnostic exists, the dashboard asks the user to run one.
4. The 20-question diagnostic collects qualitative business signals.
5. Quantitative fields are pulled from AIDA at submission time.
6. The scoring engine writes valuation and recommendation rows.
7. The company dashboard renders the full result.

The old free-form `/diagnostic` route now redirects to `/companies`.

---

## 🏗️ Architecture

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript strict, Tailwind CSS |
| Forms | React Hook Form + Zod |
| Motion | GSAP for radar/count-ups, `useReveal` for calm scroll reveals |
| Database | Supabase Postgres, all application objects in `vip` schema |
| Auth | Built but dormant in demo mode |
| Data prep | Python, pandas, openpyxl, psycopg |
| Deployment target | Vercel |

Important convention:

```text
All database objects live in the vip schema, not public.
```

The Supabase clients are configured with `db.schema: 'vip'`, and generated types should always include:

```bash
--schema vip,public
```

---

## 🗂️ Repository Map

```text
VIP/
├── data/                         AIDA xlsx files and capital splits
├── docs/                         Methodology and build-plan PDFs
├── src/                          Python splitter and AIDA ingestion
├── supabase/                     Config, migrations, seed stub
├── web/                          Next.js application
│   ├── app/                      App Router pages and server actions
│   ├── components/               Chrome, marketing, dashboard, diagnostic UI
│   ├── lib/                      Supabase clients, scoring, loaders, utilities
│   └── scripts/                  Calibration checks
├── infographic/                  Static infographic source/render helper
├── .env.example                  Root env for Python ingestion
└── README.md
```

High-signal files:

| Need | File |
|---|---|
| Model rationale | [`docs/SME_Valuation_Design.pdf`](docs/SME_Valuation_Design.pdf) |
| Full build plan | [`docs/VIP_Build_Plan.pdf`](docs/VIP_Build_Plan.pdf) |
| Supabase setup walkthrough | [`docs/PHASE_03_SETUP.md`](docs/PHASE_03_SETUP.md) |
| DB migrations | [`supabase/migrations/`](supabase/migrations/) |
| AIDA ingestion | [`src/ingest_aida.py`](src/ingest_aida.py) |
| Company/AIDA bridge | [`web/lib/scoring/company-input.ts`](web/lib/scoring/company-input.ts) |
| Scoring pipeline | [`web/lib/scoring/`](web/lib/scoring/) |
| Company dashboard workspace | [`web/components/company-workspace/workspace.tsx`](web/components/company-workspace/workspace.tsx) |
| Company search | [`web/app/(app)/companies/page.tsx`](web/app/(app)/companies/page.tsx) |
| Diagnostic action | [`web/app/(app)/companies/[taxCode]/diagnostic/actions.ts`](web/app/(app)/companies/%5BtaxCode%5D/diagnostic/actions.ts) |

---

## 🧮 Scoring Pipeline

The scoring engine is a shared TypeScript module, not a Supabase Edge Function:

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
validate form -> load AIDA snapshot -> create/update company -> insert submission -> run scoring -> insert valuation -> insert recommendations -> redirect to dashboard
```

Demo mode allows anonymous local delivery by writing with the service role and using an httpOnly cookie to find the latest submitted result.

---

## 💎 Demo Numbers

When you need consistent placeholder numbers, use the ACME-style profile:

| Metric | Value |
|---|---|
| Enterprise Value | **€4.2M** |
| Range | **€3.8M - €4.7M** |
| Quality | **67 / 100** |
| Value Gap | **+38% -> €5.8M potential** |
| Risk | **Medium** |
| EBITDA | **€750K** |
| Multiple | **5.0x** |
| SQF | **1.05** |
| GF | **1.07** |

Top actions:

| Rank | Action | Estimated value lift |
|---|---|---|
| 1 | Reduce client concentration | +12% |
| 2 | Increase recurring revenue | +9% |
| 3 | Strengthen middle management | +7% |

The math checks out:

```text
750,000 x 5.0 x 1.05 x 1.07 ~= 4.21M
```

---

## 🎓 Project Context

This is an academic project for the **Master in Data Science for Management, Cattolica**. The goal is a polished local demo for the final exam in late May 2026: credible methodology, real calibration data, and a product experience that makes valuation understandable for SME founders.
