// Cookies-aware Supabase client. Distinct from the service-role client
// in `server.ts` — this one runs under the anon key and reads/writes
// the request's auth cookies. Use for:
//   - Joey's authenticated admin reads (RLS gates to his email)
//   - Magic-link login flow
//   - Anything in /admin/* that should run as Joey, not as a service
//     account.
//
// Use `getServiceRoleClient()` (the other file) when:
//   - The interviewee touches /i/{token} (no user session at all)
//   - A server action needs to bypass RLS to insert/update protected rows
//     (e.g., minting an invite token, writing a message during a session)

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/db";

export function getAuthenticatedClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies. The middleware
            // refreshes the session on every request, so the missed
            // writes here are non-fatal — they just don't extend the
            // session lifetime past what middleware already set.
          }
        },
      },
    },
  );
}
