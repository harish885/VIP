import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

/**
 * Browser-side Supabase client.
 *
 * Reads the anon key from public env. Auth state is persisted in cookies via
 * @supabase/ssr — see lib/supabase/server.ts for how the server reads them.
 *
 * Default schema is `vip` — every app table lives there. The `public` schema
 * is intentionally empty.
 *
 * Usage (client component):
 *   const supabase = createClient();
 *   const { data } = await supabase.from('companies').select();
 */
export function createClient() {
  return createBrowserClient<Database, 'vip'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'vip' },
    },
  );
}
