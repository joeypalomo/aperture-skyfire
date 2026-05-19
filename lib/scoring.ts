// Background Haiku 4.5 constraint scorer. Fires after each
// interviewee turn (in parallel with the Opus 4.7 reply call) to
// classify the answer against C1–C7 per A6 §A.4.1 and write a row
// to the `scorecards` table.
//
// This is the Phase 2 hypothesis scorecard (Layer 3 of the three-
// layer knowledge model). Joey reads the aggregate at synthesis time
// (Step 8): pre-intake vs. post-intake confidence per constraint,
// driving quotes, follow-up flags. Never surfaced to the interviewee.

import {
  getAnthropicClient,
  APERTURE_EXTRACTION_MODEL,
} from "@/lib/anthropic";
import { constraintCatalogForScoring } from "@/lib/constraints";
import type { Database } from "@/types/db";

type ScorecardInsert = Database["public"]["Tables"]["scorecards"]["Insert"];
type ConstraintId = Database["public"]["Enums"]["constraint_id"];
type Outcome = Database["public"]["Enums"]["scorecard_outcome"];
type FollowupKind = Database["public"]["Enums"]["followup_kind"];

export interface ScoreResult {
  constraint_tested: ConstraintId;
  outcome: Outcome;
  confidence_shift: number; // [-0.30, +0.30]
  driving_quote: string;
  agent_notes: string;
  followup_recommended: FollowupKind;
}

const OUTCOME_VALUES: Outcome[] = [
  "validates",
  "partially_validates",
  "refutes",
  "partially_refutes",
  "new_information",
  "unscorable",
];

const CONSTRAINT_VALUES: ConstraintId[] = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "META",
  "STAKEHOLDER",
  "FORWARD",
];

const FOLLOWUP_VALUES: FollowupKind[] = [
  "no",
  "yes_via_joey_separate_touch",
  "yes_via_cross_intake_validation",
  "yes_via_data_check",
  "yes_via_joey_direct",
];

const SYSTEM_PROMPT = `You are a constraint scorer for the Aperture intake agent. Read one interviewee turn (with the prior agent question for context) and classify how the answer maps against the seven SkyFire constraints. Return ONLY a JSON object with this shape:

{
  "constraint_tested": "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "META" | "STAKEHOLDER" | "FORWARD",
  "outcome": "validates" | "partially_validates" | "refutes" | "partially_refutes" | "new_information" | "unscorable",
  "confidence_shift": <number between -0.30 and 0.30>,
  "driving_quote": "<verbatim phrase from the interviewee, no paraphrase>",
  "agent_notes": "<one or two sentences in operator voice — what the answer tells Joey>",
  "followup_recommended": "no" | "yes_via_joey_separate_touch" | "yes_via_cross_intake_validation" | "yes_via_data_check" | "yes_via_joey_direct"
}

The seven validated constraints to score against:

${constraintCatalogForScoring()}

Plus three meta categories:
- META — the answer is engagement-meta (about the intake itself, scope, format), not a constraint test.
- STAKEHOLDER — the answer surfaces intelligence about another named person rather than testing a constraint.
- FORWARD — the answer is forward-looking (a Month 2/3/4 question) that isn't testing a current constraint.

Rules:
- Pick the SINGLE constraint the answer most directly tests. If the answer touches multiple, pick the one with the strongest evidence and capture the rest in agent_notes.
- "validates" = the answer directly confirms the hypothesis with specifics. confidence_shift > 0.
- "partially_validates" = aligns but thin or indirect. confidence_shift small positive.
- "refutes" = answer contradicts the hypothesis with specifics. confidence_shift < 0.
- "new_information" = answer didn't validate or refute but surfaced material for a different constraint or a new hypothesis. confidence_shift ~ 0.
- "unscorable" = too thin, off-topic, or unclear. confidence_shift = 0.
- driving_quote MUST be a verbatim substring (or near-verbatim) of the interviewee's actual words. Never paraphrase.
- agent_notes is operator voice — sounds like Joey's running shorthand, not consultant summary. Forbidden: "this signals," "this underscores," "moving forward," "the path ahead," "interestingly," "notably." Forbidden paragraph openers: "Moreover," "Furthermore," "Additionally."
- followup_recommended defaults to "no" unless the answer is materially thin (then "yes_via_joey_separate_touch") or names data Joey should verify (then "yes_via_data_check") or names another person whose view matters (then "yes_via_cross_intake_validation").

Return JSON only. No prose, no markdown fences.`;

function clampConfidenceShift(n: unknown): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(-0.3, Math.min(0.3, Math.round(n * 100) / 100));
}

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
 * Score an interviewee turn. Returns a structured ScoreResult or
 * null on failure (caller skips the DB write).
 */
export async function scoreInterviewteeTurn(args: {
  intervieweeText: string;
  priorAgentQuestion: string | null;
  questionId: string | null;
}): Promise<ScoreResult | null> {
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
      max_tokens: 768,
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

    const parsed = JSON.parse(raw) as Partial<ScoreResult>;

    return {
      constraint_tested: safeEnum<ConstraintId>(
        parsed.constraint_tested,
        CONSTRAINT_VALUES,
        "META",
      ),
      outcome: safeEnum<Outcome>(parsed.outcome, OUTCOME_VALUES, "unscorable"),
      confidence_shift: clampConfidenceShift(parsed.confidence_shift),
      driving_quote:
        typeof parsed.driving_quote === "string"
          ? parsed.driving_quote.slice(0, 1000)
          : args.intervieweeText.slice(0, 300),
      agent_notes:
        typeof parsed.agent_notes === "string"
          ? parsed.agent_notes.slice(0, 2000)
          : "(scoring agent returned no notes)",
      followup_recommended: safeEnum<FollowupKind>(
        parsed.followup_recommended,
        FOLLOWUP_VALUES,
        "no",
      ),
    };
  } catch (err) {
    console.error(
      "[scoring] failed:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

/**
 * Convert a ScoreResult into the Insert row shape for the
 * `scorecards` table. Caller provides the surrounding context
 * (session_id, question_id, message_id, elapsed seconds).
 */
export function scoreResultToInsert(
  result: ScoreResult,
  context: {
    sessionId: string;
    questionId: string;
    drivingMessageId: string | null;
    elapsedSeconds: number;
    probeFired?: boolean;
    probeResolvedThin?: boolean;
  },
): ScorecardInsert {
  return {
    session_id: context.sessionId,
    question_id: context.questionId,
    constraint_tested: result.constraint_tested,
    outcome: result.outcome,
    confidence_shift: result.confidence_shift,
    driving_quote: result.driving_quote,
    driving_message_id: context.drivingMessageId,
    agent_notes: result.agent_notes,
    followup_recommended: result.followup_recommended,
    probe_fired: context.probeFired ?? false,
    probe_resolved_thin: context.probeResolvedThin ?? false,
    recorded_at_elapsed_seconds: context.elapsedSeconds,
  };
}
