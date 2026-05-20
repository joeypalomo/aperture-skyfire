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
  collectExtractedTerms,
  listMessages,
  nextTurnIndex,
  toAnthropicMessages,
  updateMessageExtraction,
  updateMessageRetrievalChunks,
} from "@/lib/messages";
import {
  getAnthropicClient,
  APERTURE_CONVERSATION_MODEL,
} from "@/lib/anthropic";
import { extractEntitiesAndNumbers } from "@/lib/extraction";
import { scoreInterviewteeTurn, scoreResultToInsert } from "@/lib/scoring";
import { lookupChunks, renderRetrievedContextBlock } from "@/lib/retrieval";
import { checkStacyHardInterrupt } from "@/lib/safeguards";
import {
  detectPauseSignal,
  PAUSE_LINE,
  RESUME_GAP_SECONDS,
  RESUME_CONTEXT_BLOCK,
} from "@/lib/pause";

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

  revalidatePath(`/i/${token}`);
  revalidatePath(`/i/${token}/chat`);
  redirect(`/i/${token}/chat`);
}

const ACTIVE_STATUSES = [
  "identifying",
  "warm",
  "core",
  "closing",
  // 'paused' is active: a paused session resumes when the interviewee
  // sends their next message. Resume detection below flips status back
  // to an in-progress value (Step 7).
  "paused",
] as const;

/**
 * Interviewee submits a message. Persists it, runs the three-layer
 * knowledge pipeline (Layer 1 working memory in system prompt + Layer
 * 2 retrieval from BI Brief chunks + Layer 3 background scoring),
 * calls Anthropic Opus 4.7 for the reply, persists scorecard +
 * extracted entities, revalidates the chat route.
 *
 * Pipeline:
 *   1. Insert user message (turn N).
 *   2. Build retrieved-context block from prior turns' entities (Layer 2).
 *   3. Fire 3 calls in parallel:
 *        - Opus 4.7 reply (Layer 1 + Layer 2 in prompt)
 *        - Haiku 4.5 extraction on this turn's user text
 *        - Haiku 4.5 scoring of (prior_agent_question, this_user_answer)
 *   4. Persist agent reply (turn N+1), update user message with
 *      extracted entities, insert scorecard row.
 *   5. Revalidate.
 *
 * Step 4 simplifications still in effect at Step 5:
 *   - aperture_event_type defaults to 'question_primary' for every
 *     agent reply (Step 6 adds structured classification).
 *   - No probe-down enforcement, no status state-machine advance
 *     (Step 6).
 */
export async function sendMessage(formData: FormData) {
  try {
  const token = formData.get("token");
  const text = formData.get("text");
  if (typeof token !== "string") {
    throw new Error("sendMessage: missing token");
  }
  if (typeof text !== "string" || text.trim().length === 0) {
    return;
  }

  const trimmed = text.trim();

  const result = await resolveToken(token);
  if (result.kind !== "ok") {
    redirect(`/i/${token}`);
  }

  const session = result.session;
  if (
    !ACTIVE_STATUSES.includes(
      session.status as (typeof ACTIVE_STATUSES)[number],
    )
  ) {
    redirect(`/i/${token}/chat`);
  }

  if (!session.started_at) {
    throw new Error("sendMessage: session has no started_at");
  }

  const startedAtMs = new Date(session.started_at).getTime();

  // PAUSE / RESUME DETECTION (Step 7). Aperture has no live timer — a
  // pause is recognized on the interviewee's RETURN. This turn is a
  // resume if the session was explicitly paused, OR the gap since last
  // activity exceeds the 30-minute threshold. On a resume we shift
  // started_at forward by the paused duration so elapsed interview
  // time excludes the gap, and inject the §XIII welcome-back greeting
  // into the system prompt.
  const lastActivityMs = session.last_activity_at
    ? new Date(session.last_activity_at).getTime()
    : startedAtMs;
  const gapSeconds = Math.floor((Date.now() - lastActivityMs) / 1000);
  const isResume =
    session.status === "paused" || gapSeconds > RESUME_GAP_SECONDS;

  let effectiveStartedAtMs = startedAtMs;
  if (isResume) {
    // Paused duration: from the explicit pause instant if we have one,
    // else the whole inactivity gap.
    const pauseAnchorMs = session.paused_at
      ? new Date(session.paused_at).getTime()
      : lastActivityMs;
    const pauseDurationMs = Math.max(0, Date.now() - pauseAnchorMs);
    effectiveStartedAtMs = startedAtMs + pauseDurationMs;

    // Persist the shift immediately. Updating status off 'paused' and
    // last_activity_at to now makes a retry-after-failure re-detect
    // isResume=false, so the started_at shift can't double-apply.
    // started_at now means "virtual start such that (now - started_at)
    // = active interview seconds"; created_at remains the true
    // creation time.
    const supabaseResume = getServiceRoleClient();
    await supabaseResume
      .from("sessions")
      .update({
        started_at: new Date(effectiveStartedAtMs).toISOString(),
        status: "core",
        paused_at: null,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", session.id);
  }

  const intervieweeTurnIndex = await nextTurnIndex(session.id);
  const intervieweeElapsed = Math.floor(
    (Date.now() - effectiveStartedAtMs) / 1000,
  );

  const userMessageRow = await appendIntervieweeMessage({
    sessionId: session.id,
    turnIndex: intervieweeTurnIndex,
    text: trimmed,
    elapsedSeconds: intervieweeElapsed,
  });

  // STACY HARD INTERRUPT (A7 §XIV) — fires BEFORE Opus call when the
  // interviewee drifts into marketing-strategy territory. Per A7
  // Decision 6, this is the central architectural defense; the
  // verbatim re-anchor replaces what Opus would have said.
  if (session.interviewee_id === "stacy_haakonson") {
    const safeguard = await checkStacyHardInterrupt(trimmed);
    if (safeguard.triggered) {
      const supabaseSafe = getServiceRoleClient();
      const reAnchorElapsed = Math.floor(
        (Date.now() - effectiveStartedAtMs) / 1000,
      );
      await appendApertureMessage({
        sessionId: session.id,
        turnIndex: intervieweeTurnIndex + 1,
        text: safeguard.reAnchorText,
        eventType: "re_anchor",
        elapsedSeconds: reAnchorElapsed,
      });
      // Log the safeguard fire in the user's message notes for synthesis.
      await supabaseSafe
        .from("messages")
        .update({
          notes: [
            {
              type: "RE_ANCHOR_FIRED",
              content: `Stacy hard interrupt — detected by ${safeguard.detectedBy} (signal: "${safeguard.matchedSignal}")`,
            },
          ],
        })
        .eq("id", userMessageRow.id);
      await supabaseSafe
        .from("sessions")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", session.id);
      revalidatePath(`/i/${token}/chat`);
      return;
    }
  }

  // EXPLICIT PAUSE SIGNAL (Section XIII / Step 7) — the interviewee
  // says they need to step away. Deliver the verbatim pause line, flip
  // the session to 'paused', and snapshot elapsed. Their next message
  // is detected as a resume by the block above. Runs after the Stacy
  // interrupt (which §XIV mandates fires first) but before the Opus
  // pipeline — no model call needed for a deterministic pause.
  if (detectPauseSignal(trimmed)) {
    const supabasePause = getServiceRoleClient();
    const pauseElapsed = Math.floor(
      (Date.now() - effectiveStartedAtMs) / 1000,
    );
    await appendApertureMessage({
      sessionId: session.id,
      turnIndex: intervieweeTurnIndex + 1,
      text: PAUSE_LINE,
      eventType: "pause_response",
      elapsedSeconds: pauseElapsed,
    });
    await supabasePause
      .from("sessions")
      .update({
        status: "paused",
        paused_at: new Date().toISOString(),
        elapsed_seconds_at_pause: pauseElapsed,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", session.id);
    // Log the pause in the user's message notes for synthesis.
    await supabasePause
      .from("messages")
      .update({
        notes: [
          {
            type: "PAUSE_SIGNAL",
            content: `Explicit pause detected — session paused at elapsed ${pauseElapsed}s.`,
          },
        ],
      })
      .eq("id", userMessageRow.id);
    revalidatePath(`/i/${token}/chat`);
    return;
  }

  // Build conversation history (includes the just-saved user message).
  const history = await listMessages(session.id);
  const anthropicMessages = toAnthropicMessages(history);

  // Identify the prior agent question for scoring context. The
  // immediately preceding aperture message is what the user is
  // responding to.
  const priorAgentText = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      const m = history[i];
      if (m && m.speaker === "aperture") return m.text;
    }
    return null;
  })();

  // Layer 2 retrieval: aggregate entities/numbers from all prior
  // interviewee turns and look up matching BI Brief chunks. This
  // turn's entities aren't included yet (they'll be extracted in
  // parallel and inform the NEXT turn's retrieval).
  const accumulatedTerms = collectExtractedTerms(history);
  const retrieval = lookupChunks(
    accumulatedTerms.entities,
    accumulatedTerms.numbers,
    3,
  );
  const retrievedContextBlock = renderRetrievedContextBlock(retrieval.chunks);

  const systemPrompt = buildSystemPrompt(session, {
    retrievedContextBlock,
    resumeContext: isResume ? RESUME_CONTEXT_BLOCK : undefined,
  });

  const anthropic = getAnthropicClient();

  // Fire all three model calls in parallel. Extraction + scoring are
  // background work that doesn't block the user's reply, but we await
  // them here so the next page render has the updated rows.
  const [opusResponse, extraction, scoring] = await Promise.all([
    anthropic.messages.create({
      model: APERTURE_CONVERSATION_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
    extractEntitiesAndNumbers(trimmed),
    scoreInterviewteeTurn({
      intervieweeText: trimmed,
      priorAgentQuestion: priorAgentText,
      questionId: null,
    }),
  ]);

  const replyText = opusResponse.content
    .filter((block): block is Extract<typeof block, { type: "text" }> =>
      block.type === "text",
    )
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!replyText) {
    throw new Error("sendMessage: Anthropic returned empty reply");
  }

  const replyElapsed = Math.floor(
    (Date.now() - effectiveStartedAtMs) / 1000,
  );

  // Persist agent reply. retrieval_chunks_used records which Brief
  // chunks Aperture saw silently for this turn — audit trail for
  // synthesis QA. On a resuming turn the reply opens with the §XIII
  // welcome-back greeting, so it's classified as resume_greeting.
  const agentMessageRow = await appendApertureMessage({
    sessionId: session.id,
    turnIndex: intervieweeTurnIndex + 1,
    text: replyText,
    eventType: isResume ? "resume_greeting" : "question_primary",
    elapsedSeconds: replyElapsed,
  });

  // Persist Layer 2 + Layer 3 side-effects in parallel.
  const supabase = getServiceRoleClient();
  await Promise.all([
    updateMessageExtraction({
      messageId: userMessageRow.id,
      entities: extraction.entities,
      numbers: extraction.numbers,
    }),
    updateMessageRetrievalChunks({
      messageId: agentMessageRow.id,
      chunkIds: retrieval.chunkIds,
    }),
    scoring
      ? supabase.from("scorecards").insert(
          scoreResultToInsert(scoring, {
            sessionId: session.id,
            // Step 6: question_id is still keyed off turn index until
            // the state machine wires session.current_question_id from
            // the registry. The library is now loaded into the system
            // prompt, but routing the next question_id per turn
            // requires Opus output parsing (deferred — system prompt
            // handles flow logic on its own).
            questionId: `TURN_${intervieweeTurnIndex}`,
            drivingMessageId: userMessageRow.id,
            elapsedSeconds: intervieweeElapsed,
          }),
        )
      : Promise.resolve(),
    supabase
      .from("sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", session.id),
  ]);

  revalidatePath(`/i/${token}/chat`);
  } catch (err) {
    // Surface the real error into sessions.last_error (the column
    // exists for exactly this) so failures are debuggable without
    // Vercel log access. redirect()/notFound() throw control-flow
    // errors that MUST pass through untouched.
    const digest =
      err && typeof err === "object" && "digest" in err
        ? String((err as { digest?: unknown }).digest)
        : "";
    if (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND") {
      throw err;
    }
    console.error("[sendMessage] uncaught:", err);
    try {
      const tok = formData.get("token");
      if (typeof tok === "string") {
        const r = await resolveToken(tok);
        if (r.kind === "ok") {
          await getServiceRoleClient()
            .from("sessions")
            .update({
              last_error: String(
                (err as { stack?: string })?.stack ?? err,
              ).slice(0, 2000),
            })
            .eq("id", r.session.id);
        }
      }
    } catch (logErr) {
      console.error("[sendMessage] failed to persist last_error:", logErr);
    }
    throw err;
  }
}
