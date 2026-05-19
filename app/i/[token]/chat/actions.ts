"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { resolveToken } from "@/lib/tokens";
import { getInterviewee } from "@/config/interviewees";
import { buildSystemPrompt } from "@/lib/system-prompt/build";
import {
  appendApertureMessage,
  appendIntervieweeMessage,
  listMessages,
  nextTurnIndex,
  toAnthropicMessages,
} from "@/lib/messages";
import {
  getAnthropicClient,
  APERTURE_CONVERSATION_MODEL,
} from "@/lib/anthropic";

/**
 * Compute the verbatim A7 §VI opening for a given display name.
 * Reproduced verbatim with display_name substitution.
 */
function buildOpeningText(displayName: string): string {
  return (
    `Hi ${displayName} — I'm Aperture, an intelligence-gathering ` +
    `agent Joey built specifically for the SkyFire engagement. I'll ` +
    `ask you a few questions to help build a shared picture of how ` +
    `the commercial sales engine works today. About 15 minutes — and ` +
    `you can pause and pick back up anytime, even if it takes a few ` +
    `sittings. Your participation matters. Let's get started.`
  );
}

/**
 * Begin click on the welcome page. Transitions session from 'invited'
 * to 'identifying', logs the verbatim A7 §VI opening as turn 0, and
 * redirects to the chat surface. Idempotent: if status is already past
 * 'invited', just redirects.
 */
export async function startConversation(formData: FormData) {
  const token = formData.get("token");
  if (typeof token !== "string") {
    throw new Error("startConversation: missing token");
  }

  const result = await resolveToken(token);
  if (result.kind !== "ok") {
    redirect(`/i/${token}`);
  }

  const session = result.session;
  if (session.status !== "invited") {
    // Already started; just route to the chat surface.
    redirect(`/i/${token}/chat`);
  }

  const config = getInterviewee(session.interviewee_id);
  const displayName =
    config?.displayName ?? session.interviewee_display_name;
  const openingText = buildOpeningText(displayName);

  const now = new Date();
  const supabase = getServiceRoleClient();

  const { error: sessionUpdateError } = await supabase
    .from("sessions")
    .update({
      status: "identifying",
      started_at: now.toISOString(),
      last_activity_at: now.toISOString(),
    })
    .eq("id", session.id);

  if (sessionUpdateError) {
    throw new Error(
      `startConversation: session update failed — ${sessionUpdateError.message}`,
    );
  }

  await appendApertureMessage({
    sessionId: session.id,
    turnIndex: 0,
    text: openingText,
    eventType: "opening",
    elapsedSeconds: 0,
  });

  // Invalidate the Next.js cache for both routes before redirecting.
  // Without this, the destination /chat can be served from stale RSC
  // cache that still sees status='invited', and the old defensive
  // bounce-back logic created an infinite loop.
  revalidatePath(`/i/${token}`);
  revalidatePath(`/i/${token}/chat`);

  redirect(`/i/${token}/chat`);
}

const ACTIVE_STATUSES = [
  "identifying",
  "warm",
  "core",
  "closing",
] as const;

/**
 * Interviewee submits a message. Persists it, calls Anthropic with
 * the full A7 system prompt + conversation history, persists the
 * reply, revalidates the chat route.
 *
 * Step 4 simplifications:
 *   - aperture_event_type defaults to 'question_primary' for every
 *     agent reply. Step 6 adds structured classification.
 *   - No probe-down enforcement, no scorecard write, no Layer 2
 *     retrieval. The system prompt's instructions cover behavior;
 *     code-side enforcement comes in Steps 5-6.
 *   - Status doesn't auto-advance (warm/core/closing). Step 6 wires
 *     the state machine using event_type classification.
 */
export async function sendMessage(formData: FormData) {
  const token = formData.get("token");
  const text = formData.get("text");
  if (typeof token !== "string") {
    throw new Error("sendMessage: missing token");
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    // Empty submission — no-op.
    return;
  }

  const trimmed = text.trim();

  const result = await resolveToken(token);
  if (result.kind !== "ok") {
    redirect(`/i/${token}`);
  }

  const session = result.session;
  if (!ACTIVE_STATUSES.includes(session.status as (typeof ACTIVE_STATUSES)[number])) {
    redirect(`/i/${token}/chat`);
  }

  if (!session.started_at) {
    throw new Error("sendMessage: session has no started_at");
  }

  const startedAtMs = new Date(session.started_at).getTime();
  const intervieweeTurnIndex = await nextTurnIndex(session.id);
  const intervieweeElapsed = Math.floor((Date.now() - startedAtMs) / 1000);

  await appendIntervieweeMessage({
    sessionId: session.id,
    turnIndex: intervieweeTurnIndex,
    text: trimmed,
    elapsedSeconds: intervieweeElapsed,
  });

  // Build conversation history for Anthropic. Include the just-saved
  // interviewee message by re-loading from DB.
  const history = await listMessages(session.id);
  const anthropicMessages = toAnthropicMessages(history);

  const systemPrompt = buildSystemPrompt(session);

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: APERTURE_CONVERSATION_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const replyText = response.content
    .filter((block): block is Extract<typeof block, { type: "text" }> =>
      block.type === "text",
    )
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!replyText) {
    throw new Error("sendMessage: Anthropic returned empty reply");
  }

  const replyElapsed = Math.floor((Date.now() - startedAtMs) / 1000);
  const supabase = getServiceRoleClient();

  await appendApertureMessage({
    sessionId: session.id,
    turnIndex: intervieweeTurnIndex + 1,
    text: replyText,
    // Step 4 default — Step 6 adds proper classification (warm,
    // question_primary, probe_down, acknowledgment, closing_question,
    // final_line, etc.)
    eventType: "question_primary",
    elapsedSeconds: replyElapsed,
  });

  await supabase
    .from("sessions")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", session.id);

  revalidatePath(`/i/${token}/chat`);
}
