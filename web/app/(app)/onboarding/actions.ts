'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * createCompanyAction
 *
 * Validates the onboarding payload and inserts a row into vip.companies
 * for the current user. RLS policies on the table already enforce
 * `user_id = auth.uid()`, so we just include the user_id and let Postgres
 * verify it.
 */

const Schema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters.').max(120),
  sector: z.string().min(1, 'Pick a sector.'),
  nace_code: z.string().optional(),
  province: z.string().optional(),
  lifecycle_stage: z.enum(['Early', 'Growth', 'Maturity', 'Decline'], {
    errorMap: () => ({ message: 'Pick a lifecycle stage.' }),
  }),
  distinctive_assets: z.string().optional(),
  stated_objective: z.string().optional(),
  time_horizon: z.string().optional(),
});

export type OnboardingResult =
  | { ok: true; companyId: string }
  | { ok: false; error: string };

export async function createCompanyAction(formData: FormData): Promise<OnboardingResult> {
  const raw = {
    name: String(formData.get('name') ?? '').trim(),
    sector: String(formData.get('sector') ?? '').trim(),
    nace_code: String(formData.get('nace_code') ?? '').trim() || undefined,
    province: String(formData.get('province') ?? '').trim() || undefined,
    lifecycle_stage: String(formData.get('lifecycle_stage') ?? '').trim(),
    distinctive_assets: String(formData.get('distinctive_assets') ?? '').trim() || undefined,
    stated_objective: String(formData.get('stated_objective') ?? '').trim() || undefined,
    time_horizon: String(formData.get('time_horizon') ?? '').trim() || undefined,
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? 'Invalid form data.' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { data, error } = await supabase
    .from('companies')
    .insert({ user_id: user.id, ...parsed.data })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath('/dashboard');
  redirect(`/dashboard?company=${data.id}`);
}
