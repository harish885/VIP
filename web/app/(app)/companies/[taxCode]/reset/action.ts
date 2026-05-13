'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/service';

const COOKIE_PREFIX = 'vip_company_submission_';

/**
 * resetCompanyAction
 *
 * Wipes every diagnostic artefact for the given AIDA tax_code so the
 * /companies/[taxCode] workspace falls back to the AIDA-only empty
 * state. We delete every vip.companies row that links to this tax_code
 * — the schema's `ON DELETE CASCADE` chains then drop the associated
 * submissions, valuations, and recommendations.
 */
export async function resetCompanyAction(taxCode: string): Promise<void> {
  const service = createServiceClient();

  const { error } = await service
    .from('companies')
    .delete()
    .eq('tax_code', taxCode);

  if (error) {
    throw new Error(`Could not reset company: ${error.message}`);
  }

  cookies().delete(`${COOKIE_PREFIX}${taxCode}`);
  revalidatePath(`/companies/${taxCode}`);
  redirect(`/companies/${encodeURIComponent(taxCode)}`);
}
