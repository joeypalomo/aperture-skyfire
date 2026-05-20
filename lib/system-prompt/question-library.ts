// Section VII — Question Library. Templated per session per A7.
//
// Step 6: renders the full per-stakeholder library from
// config/questions/<interviewee>.ts (verbatim warm + question
// sequence with probe-downs + closing variant + branching rules).
// If no library is loaded for an interviewee (shouldn't happen in
// the SkyFire cohort, but defensive), falls back to the Step 4 stub
// shape (one generic warm + universal closing) so the system prompt
// always renders.

import type { IntervieweeConfig } from "@/config/interviewees";
import { getQuestionLibrary } from "@/config/questions";
import type {
  IntervieweeQuestionLibrary,
  Question,
} from "@/config/questions/types";

function renderQuestion(q: Question): string {
  const probesBlock = q.probes
    .map((p, i) => {
      const label = i === 0 ? "Primary" : `Alternate ${i}`;
      return `  - ${label}: "${p.text}"\n    When: ${p.when}`;
    })
    .join("\n");

  return `${q.id} [${q.priority}] — ${q.title}

AGENT DELIVERS (verbatim):
"${q.text}"

WHY: ${q.why}

CONSTRAINTS TESTED: ${q.constraints_tested.join(", ")}

PROBE-DOWN (one-shot only — fire only if answer is thin):
${probesBlock}

SUBSTANTIVE-VS-THIN HEURISTIC:
  Substantive if: ${q.substantive_markers}
  Thin if: ${q.thin_markers}

TIME ESTIMATE:
  Primary alone: ${q.time_estimate_seconds.primary} seconds
  With probe-down: ${q.time_estimate_seconds.with_probe} seconds`;
}

function renderLibrary(lib: IntervieweeQuestionLibrary): string {
  const questionsBlock = lib.questions
    .map((q) => renderQuestion(q))
    .join("\n\n");

  return `──────────────────────────────────────────────────────
SECTION VII — QUESTION LIBRARY
──────────────────────────────────────────────────────

=== OPENING WARM ===

After Stage 1 acknowledgment, deliver this verbatim:

"${lib.warm.text}"

Expected answer shape: ${lib.warm.expected_shape}
Target duration: ${lib.warm.target_seconds} seconds
If thin: acknowledge with two to five words, proceed to Q1. No probe.

=== QUESTION SEQUENCE ===

${questionsBlock}

=== BRANCHING LOGIC ===

${lib.branching_rules}

=== CLOSING QUESTION ===

After the registry completes (Stage 4 trigger), deliver verbatim:

"${lib.closing.text}"

The "and what would change downstream" tail is the design — never trim,
soften, or replace it. The response is the response — no probe after
the closing.

=== VOICE REGISTER NOTES (per this interviewee) ===

${lib.voice_register_notes}

=== WATCH-OUTS / LANE CONSIDERATIONS (per this interviewee) ===

${lib.watch_outs}

=== TRIM SEQUENCE UNDER BUDGET PRESSURE ===

In order: ${lib.trim_sequence.join(" → ")}`;
}

function renderStub(config: IntervieweeConfig): string {
  // Fallback for unregistered interviewees — should never fire in
  // the SkyFire cohort, but defensive against config mismatch.
  return `──────────────────────────────────────────────────────
SECTION VII — QUESTION LIBRARY
──────────────────────────────────────────────────────

[Question library not loaded for interviewee_id=${config.id}.
Deliver the warm below, acknowledge, then deliver the universal
closing.]

=== OPENING WARM ===

"What's on your mind about the SkyFire commercial sales engine right
now?"

=== CLOSING QUESTION ===

"If you could change one thing about how SkyFire wins (or doesn't
win) commercial deals — one thing, not three — what would you
change, and what would change downstream?"`;
}

export function buildSection7(config: IntervieweeConfig): string {
  const lib = getQuestionLibrary(config.id);
  if (!lib) return renderStub(config);
  return renderLibrary(lib);
}
