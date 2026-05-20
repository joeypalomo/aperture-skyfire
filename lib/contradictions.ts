// Background Haiku 4.5 contradiction detector — A7 §XI. Fires after
// each interviewee turn (in parallel with the Opus reply + scoring).
// If the answer materially contradicts a documented fact in the BI
// Brief, it writes a row to the `contradictions` table.
//
// Aperture NEVER corrects the interviewee in conversation (A7 §XI) —
// the contradiction is logged silently for Joey's synthesis. The
// detector compares each turn against ALL BI Brief chunks (not just
// the Layer-2 retrieved subset), so a conflict is caught even when
// the keyword retrieval didn't surface the relevant chunk.

import {
  getAnthropicClient,
  APERTURE_EXTRACTION_MODEL,
} from "@/lib/anthropic";
import briefChunksJson from "@/config/retrieval/brief-chunks.json";
import type { Database } from "@/types/db";

type ContradictionInsert =
  Database["public"]["Tables"]["contradictions"]["Insert"];
type Severity = Database["public"]["Enums"]["contradiction_severity"];
type FollowupKind = Database["public"]["Enums"]["followup_kind"];

interface BriefChunk {
  chunk_id: string;
  source_section: string;
  summary: string;
}

const CHUNKS = (briefChunksJson as { chunks: BriefChunk[] }).chunks;

// Every documented fact, embedded in the detector's system prompt so
// it never depends on Layer-2 retrieval having surfaced the right
// chunk. Ten chunks — small enough to pass in full.
const DOCUMENTED_FACTS = CHUNKS.map(
  (c) => `[${c.chunk_id} — ${c.source_section}]\n${c.summary}`,
).join("\n\n");

const SEVERITY_VALUES: Severity[] = ["minor", "material", "scope_affecting"];

const FOLLOWUP_VALUES: FollowupKind[] = [
  "no",
  "yes_via_joey_separate_touch",
  "yes_via_cross_intake_validation",
  "yes_via_data_check",
  "yes_via_joey_direct",
];

export interface ContradictionResult {
  conflicting_known: string;
  source_of_known: string;
  severity: Severity;
  agent_read: string;
  followup_recommended: FollowupKind;
}

const SYSTEM_PROMPT = `You are a contradiction detector for the Aperture intake agent. Read one interviewee turn (with the prior agent question for context) and decide whether it MATERIALLY contradicts a documented fact in the SkyFire Business Intelligence Brief.

A contradiction is the interviewee stating something that genuinely conflicts with a documented fact — a different dollar figure, count, timeline, ownership, or status for the SAME named thing. It is NOT a contradiction when the interviewee volunteers new information the Brief simply doesn't cover, or restates a documented fact in different words. Only flag a real conflict.

Return ONLY a JSON object:

{
  "contradicted": true | false,
  "conflicting_known": "<the documented fact it conflicts with, quoted from the Brief below>",
  "source_of_known": "<the [chunk_id — source_section] label of that fact>",
  "severity": "minor" | "material" | "scope_affecting",
  "agent_read": "<one or two sentences, operator voice — what the conflict means for Joey>",
  "followup_recommended": "no" | "yes_via_joey_separate_touch" | "yes_via_cross_intake_validation" | "yes_via_data_check" | "yes_via_joey_direct"
}

If there is NO contradiction, return {"contradicted": false} — the other fields may be omitted or empty.

Severity:
- minor — a small discrepancy that changes no conclusion.
- material — a named entity, dollar figure, count, or timeline differs in a way that changes the economics or the read.
- scope_affecting — the conflict bears on the engagement's scope or a constraint's validity.

agent_read is operator voice — Joey's running shorthand, not a consultant summary. Forbidden: "this signals," "this underscores," "moving forward," "notably," "interestingly."

followup_recommended is normally "yes_via_joey_direct" when the interviewee is the ground-truth source on the contradicted fact (the Brief may be stale), or "yes_via_data_check" when the data should be independently verified.

DOCUMENTED FACTS FROM THE BRIEF:

${DOCUMENTED_FACTS}

Return JSON only. No prose, no markdown fences.`;

function safeEnum<T extends string>(
  value: unknown,
  allowed: T[],
  fallback: T,
): T {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

/**
 * Check an interviewee turn for a contradiction with the BI Brief.
 * Returns a ContradictionResult only on a real conflict; null when
 * there is no contradiction or the detector call fails (caller skips
 * the DB write).
 */
export async function detectContradiction(args: {
  intervieweeText: string;
  priorAgentQuestion: string | null;
}): Promise<ContradictionResult | null> {
  const anthropic = getAnthropicClient();

  const userMsg = [
    args.priorAgentQuestion
      ? `Prior agent question:\n"${args.priorAgentQuestion}"\n`
      : "",
    `Interviewee answer:\n"${args.intervieweeText}"`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: APERTURE_EXTRACTION_MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.contradicted !== true) return null;

    const conflicting =
      typeof parsed.conflicting_known === "string"
        ? parsed.conflicting_known.trim()
        : "";
    if (!conflicting) return null;

    return {
      conflicting_known: conflicting.slice(0, 2000),
      source_of_known:
        typeof parsed.source_of_known === "string" &&
        parsed.source_of_known.trim()
          ? parsed.source_of_known.slice(0, 500)
          : "(unspecified Brief section)",
      severity: safeEnum<Severity>(
        parsed.severity,
        SEVERITY_VALUES,
        "material",
      ),
      agent_read:
        typeof parsed.agent_read === "string" && parsed.agent_read.trim()
          ? parsed.agent_read.slice(0, 2000)
          : "(detector returned no read)",
      followup_recommended: safeEnum<FollowupKind>(
        parsed.followup_recommended,
        FOLLOWUP_VALUES,
        "yes_via_joey_direct",
      ),
    };
  } catch (err) {
    console.error(
      "[contradictions] failed:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

/**
 * Convert a ContradictionResult into the Insert row shape for the
 * `contradictions` table. Caller supplies the surrounding context.
 */
export function contradictionResultToInsert(
  result: ContradictionResult,
  context: {
    sessionId: string;
    questionId: string;
    triggeringMessageId: string | null;
    intervieweeStatement: string;
  },
): ContradictionInsert {
  return {
    session_id: context.sessionId,
    question_id: context.questionId,
    triggering_message_id: context.triggeringMessageId,
    interviewee_statement: context.intervieweeStatement.slice(0, 4000),
    conflicting_known: result.conflicting_known,
    source_of_known: result.source_of_known,
    severity: result.severity,
    agent_read: result.agent_read,
    followup_recommended: result.followup_recommended,
  };
}
