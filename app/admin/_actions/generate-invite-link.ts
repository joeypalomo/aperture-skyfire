"use server";

import { redirect } from "next/navigation";
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
 *
 * Errors are caught and surfaced to the admin UI via a query string so
 * Joey doesn't hit the Next.js generic 500 page (which hides the cause
 * behind a digest).
 */
export async function generateInviteLink(formData: FormData) {
  try {
    const intervieweeId = formData.get("interviewee_id");
    if (typeof intervieweeId !== "string") {
      throw new Error("Missing interviewee_id in form data.");
    }

    const config = getInterviewee(intervieweeId);
    if (!config) {
      throw new Error(`Unknown interviewee: ${intervieweeId}`);
    }

    const supabase = getServiceRoleClient();

    const { error: supersedeError } = await supabase
      .from("sessions")
      .update({ status: "expired" })
      .eq("interviewee_id", config.id)
      .in("status", [
        "invited",
        "identifying",
        "warm",
        "core",
        "closing",
        "paused",
      ]);

    if (supersedeError) {
      throw new Error(
        `Supersede UPDATE failed: ${supersedeError.message} ` +
          `(code=${supersedeError.code ?? "?"}, hint=${supersedeError.hint ?? "?"})`,
      );
    }

    const token = mintToken();
    const issuedAt = new Date();
    const expiresAt = defaultExpiresAt(issuedAt);

    const insertPayload = {
      interviewee_id: config.id,
      interviewee_full_name: config.fullName,
      interviewee_display_name: config.displayName,
      tier: config.tier,
      token,
      token_issued_at: issuedAt.toISOString(),
      token_expires_at: expiresAt.toISOString(),
      time_budget_target_seconds: config.timeBudgetTargetSeconds,
      time_budget_hard_stop_seconds: config.timeBudgetHardStopSeconds,
      status: "invited" as const,
    };

    const { error: insertError } = await supabase
      .from("sessions")
      .insert(insertPayload);

    if (insertError) {
      throw new Error(
        `INSERT failed: ${insertError.message} ` +
          `(code=${insertError.code ?? "?"}, hint=${insertError.hint ?? "?"})`,
      );
    }

    revalidatePath("/admin");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Don't swallow — Next.js sees the redirect throw and propagates it;
    // log to Vercel function logs for permanent record.
    console.error("[generateInviteLink]", message, err);
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
}
