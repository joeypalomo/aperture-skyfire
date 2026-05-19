// Browser-side Supabase client for Joey's admin panel. Authenticates via
// magic link; RLS policies gate every read to auth.jwt() ->> 'email' =
// app.joey_admin_email. No write policies — mutations route through
// server actions running under the service role.

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/db";

export function getBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  );
}
