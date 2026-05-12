import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

/**
 * Service-role Supabase client.
 *
 * WARNING — bypasses Row Level Security. NEVER use in a client component or
 * a request path the user can reach directly. Reserved for:
 *   - Scoring Edge Functions (Phase 06)
 *   - Trusted admin / cron route handlers
 *   - Server-side seed scripts (we use a Python ingester instead — see
 *     src/ingest_aida.py)
 *
 * Default schema is `vip`. The service role bypasses RLS but still respects
 * which schema you're addressing — without this, queries would default to
 * `public` and find nothing.
 *
 * Reads the service role key from `SUPABASE_SERVICE_ROLE_KEY` — note the
 * absence of the `NEXT_PUBLIC_` prefix; this key MUST NOT ship to the client.
 */
export function createServiceClient() {
  return createClient<Database, 'vip'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'vip' },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
