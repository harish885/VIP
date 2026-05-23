'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/service';
import { getUser } from '@/lib/auth';

const COOKIE_PREFIX = 'vip_company_submission_';

/**
 * resetCompanyAction
 *
 * Wipes the *caller's own* diagnostic for this AIDA tax_code so the
 * /companies/[taxCode] workspace falls back to the AIDA-only empty
 * state. Schema-level ON DELETE CASCADE drops the linked submissions,
 * valuations and recommendations.
 *
 * Scoping rules:
 *   · Authenticated users: delete only `companies.user_id = auth.uid()`
 *     rows for this tax_code. Other users' rows are untouched.
 *   · Anonymous demo: prefer the company row linked to the cookie's
 *     submission_id (the row we wrote when *they* ran the diagnostic).
 *     Fall back to deleting `user_id IS NULL` rows for this tax_code
 *     when no cookie is set — that's the legacy demo behaviour and
 *     still only touches anonymous demo data, never authenticated rows.
 */
export async function resetCompanyAction(taxCode: string): Promise<void> {
  const service = createServiceClient();
  const user = await getUser();
  const cookieValue = cookies().get(`${COOKIE_PREFIX}${taxCode}`)?.value ?? null;

  let companyIdsToDelete: string[] = [];

  // Auth path — scope strictly to the calling user.
  if (user) {
    const { data: rows } = await service
      .from('companies')
      .select('id')
      .eq('tax_code', taxCode)
      .eq('user_id', user.id);
    companyIdsToDelete = (rows ?? []).map((r) => r.id);
  } else if (cookieValue) {
    // Anon path with cookie — resolve the exact company via the cookie's
    // submission so we never touch a different demo user's data.
    const { data: sub } = await service
      .from('submissions')
      .select('company_id, user_id')
      .eq('id', cookieValue)
      .maybeSingle();
    if (sub && sub.user_id == null && sub.company_id) {
      companyIdsToDelete = [sub.company_id];
    }
  } else {
    // Anon path with no cookie — fall back to anonymous demo rows for
    // this tax code. Cannot accidentally hit signed-in users' data
    // because we filter `user_id IS NULL`.
    const { data: rows } = await service
      .from('companies')
      .select('id')
      .eq('tax_code', taxCode)
      .is('user_id', null);
    companyIdsToDelete = (rows ?? []).map((r) => r.id);
  }

  if (companyIdsToDelete.length > 0) {
    const { error } = await service
      .from('companies')
      .delete()
      .in('id', companyIdsToDelete);
    if (error) throw new Error(`Could not reset company: ${error.message}`);
  }

  cookies().delete(`${COOKIE_PREFIX}${taxCode}`);
  revalidatePath(`/companies/${taxCode}`);
  redirect(`/companies/${encodeURIComponent(taxCode)}`);
}
