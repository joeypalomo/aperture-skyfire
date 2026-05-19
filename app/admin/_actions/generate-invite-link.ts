"use server";

import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { mintToken, defaultExpiresAt } from "@/lib/tokens";
import { getInterviewee } from "@/config/interviewees";

/**
 * Mint a fresh invite link for a named interviewee.
 *
 * If the interviewee already has a non-terminal session, mark it
 * 'expired' before creating the new row — single-active-link invariant
 * per Kickoff Decision 7 ("single-use per session"). The older session's
 * token, if still in URL form somewhere, will resolve to the welcome
 * screen's expired-link copy.
 */
export async function generateInviteLink(formData: FormData) {
  const intervieweeId = formData.get("interviewee_id");
  if (typeof intervieweeId !== "string") {
    throw new Error("Missing interviewee_id");
  }

  const config = getInterviewee(intervieweeId);
  if (!config) {
    throw new Error(`Unknown interviewee: ${intervieweeId}`);
  }

  const supabase = getServiceRoleClient();

  // Supersede any non-terminal sessions for this interviewee. Active
  // statuses are 'invited' through 'paused'; terminal statuses
  // ('completed','declined','expired','abandoned') are left alone.
  const { error: supersedeError } = await supabase
    .from("sessions")
    .update({ status: "expired" })
    .eq("interviewee_id", config.id)
    .in("status", ["invited", "identifying", "warm", "core", "closing", "paused"]);

  if (supersedeError) {
    throw new Error(`Supersede failed: ${supersedeError.message}`);
  }

  const token = mintToken();
  const issuedAt = new Date();
  const expiresAt = defaultExpiresAt(issuedAt);

  const { error } = await supabase.from("sessions").insert({
    interviewee_id: config.id,
    interviewee_full_name: config.fullName,
    interviewee_display_name: config.displayName,
    tier: config.tier,
    token,
    token_issued_at: issuedAt.toISOString(),
    token_expires_at: expiresAt.toISOString(),
    time_budget_target_seconds: config.timeBudgetTargetSeconds,
    time_budget_hard_stop_seconds: config.timeBudgetHardStopSeconds,
    status: "invited",
  });

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  revalidatePath("/admin");
}
