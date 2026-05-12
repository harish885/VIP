import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

/**
 * Server-side Supabase client.
 *
 * Reads the anon key plus the session cookies from the incoming request.
 * Default schema is `vip` (every app table lives there).
 *
 * Use in:
 *   - Server components
 *   - Route handlers (app/api/.../route.ts)
 *   - Middleware (with the slight cookie-handling tweak Next requires)
 *
 * For trusted server-only writes (e.g. inside an Edge Function or admin
 * route that needs to bypass RLS), use lib/supabase/service.ts instead.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database, 'vip'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'vip' },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll was called from a Server Component — fine, the middleware
            // handles session refresh. Silently ignore.
          }
        },
      },
    },
  );
}
