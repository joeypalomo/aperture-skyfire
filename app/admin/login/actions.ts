"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/supabase/server-cookies";
import { serverEnv } from "@/lib/env";

/**
 * Send a magic-link sign-in email to JOEY_ADMIN_EMAIL. The form has no
 * email input — the address is locked at build time, so no spam vector
 * and no chance of typo. The link returns to /admin/login/callback.
 */
export async function requestMagicLink() {
  const supabase = getAuthenticatedClient();
  const headerList = headers();
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("host") ?? "localhost:3000";
  const emailRedirectTo = `${proto}://${host}/admin/login/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email: serverEnv.joeyAdminEmail,
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(
      `/admin/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/admin/login?sent=1");
}
