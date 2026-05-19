// Server-side Supabase client. Holds the service-role key, bypasses RLS,
// and is the ONLY client used by server actions and server components that
// mutate state. Never import this from a client component.
//
// Interviewees never query Postgres directly — every /i/{token} server
// action holds this client. Joey's admin reads use the browser/anon client
// running under his magic-link session, which RLS gates to his email.

import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/types/db";

export function getServiceRoleClient() {
  return createClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
