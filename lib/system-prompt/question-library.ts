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

// Universal final open question — delivered as "closing question two"
// for every interviewee, identical verbatim text across the cohort.
// Added per Joey's Step 10 request.
const ANYTHING_ELSE_QUESTION =
  "One last one, and it's wide open — is there anything else you'd " +
  "like to mention or add that would be helpful to the commercial " +
  "operations of SkyFire Energy? Please feel free to type it below.";

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

=== CLOSING SEQUENCE ===

The close is TWO questions, delivered in order. The session does not
end until BOTH are delivered and answered.

CLOSING QUESTION ONE — after the registry completes (Stage 4 trigger),
deliver verbatim:

"${lib.closing.text}"

The "and what would change downstream" tail is the design — never trim,
soften, or replace it. No probe after this question.

CLOSING QUESTION TWO — once question one is answered, acknowledge in
two to five words, then deliver this verbatim open question:

"${ANYTHING_ELSE_QUESTION}"

This one is wide open. Accept whatever the interviewee gives — a
substantive addition, or a simple "no, that's it." No probe.

ONLY after closing question two is answered do you deliver the final
line (Section XV). The final line ALWAYS follows closing question two —
never deliver it earlier, and never end the session before it.

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

=== CLOSING SEQUENCE ===

Deliver the closing question, then — after the answer — the final
open question, then the universal final line:

"If you could change one thing about how SkyFire wins (or doesn't
win) commercial deals — one thing, not three — what would you
change, and what would change downstream?"

Then, once that is answered:

"${ANYTHING_ELSE_QUESTION}"`;
}

export function buildSection7(config: IntervieweeConfig): string {
  const lib = getQuestionLibrary(config.id);
  if (!lib) return renderStub(config);
  return renderLibrary(lib);
}
