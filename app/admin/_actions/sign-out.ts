"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/supabase/server-cookies";

export async function signOut() {
  const supabase = getAuthenticatedClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
