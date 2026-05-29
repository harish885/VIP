import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { searchCompanies } from '@/lib/aida';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/companies/search?q=foo
 *
 * Powers the typeahead dropdown on /companies. Returns lightweight matches
 * across company name, tax code, NACE and province. Empty query returns no
 * suggestions.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const limit = Number(url.searchParams.get('limit') ?? '10');

  if (q.length === 0) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const service = createServiceClient();
  const outcome = await searchCompanies(service, q, Math.min(Math.max(limit, 1), 25));

  if (!outcome.ok) {
    return NextResponse.json(
      { ok: false, error: outcome.error, message: outcome.message },
      { status: outcome.error === 'schema_not_exposed' ? 503 : 500 },
    );
  }

  const results = outcome.results.map((r) => ({
    tax_code: r.tax_code,
    company_name: r.company_name,
    province: r.province,
    nace_rev_2: r.nace_rev_2,
    revenue_last_thk: r.revenue_last_thk,
    employees: r.employees,
  }));

  return NextResponse.json({ ok: true, results });
}
