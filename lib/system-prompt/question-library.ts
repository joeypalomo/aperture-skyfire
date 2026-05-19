// Section VII — Question Library. Templated per session per A7.
//
// Step 4 ships a MINIMAL STUB: a single generic warm question plus
// the universal closing. This is enough to exercise the conversation
// engine end-to-end (opening → warm → ack → closing → final line)
// without committing to per-stakeholder content yet.
//
// Step 6 replaces this entire function with per-interviewee content
// loaded verbatim from Phase 2 Artifacts 3 (Tier 1 Dave/Greg),
// 4 (Tier 2 Landon/Jason/Curtis), and 5 (Tier 3 Robert/Bryce/Stacy)
// — including per-question probe-downs, substantive-vs-thin
// heuristics, time estimates, branching rules, and per-interviewee
// calibrated closing variants.

import type { IntervieweeConfig } from "@/config/interviewees";

export function buildSection7(config: IntervieweeConfig): string {
  return `──────────────────────────────────────────────────────
SECTION VII — QUESTION LIBRARY
──────────────────────────────────────────────────────

[Step 4 development build — single warm + universal closing only.
Per-stakeholder verbatim content from Phase 2 Artifacts 3, 4, 5
lands in Step 6 of the build.]

=== OPENING WARM ===

After Stage 1 acknowledgment, deliver this verbatim:

"What's on your mind about the SkyFire commercial sales engine right
now? Anything operational, anything you've been thinking about."

Expected answer shape: 30–60 seconds, any substantive observation.
If thin: acknowledge with two to five words, proceed to the closing.
No probe on the warm.

=== QUESTION SEQUENCE ===

[Empty for Step 4. Step 6 loads the full per-interviewee registry
from Phase 2 Artifact ${config.tier === 1 ? "3" : config.tier === 2 ? "4" : "5"}.
For Step 4, after the warm acknowledgment, transition directly to the
closing question.]

=== CLOSING QUESTION ===

After the warm completes (no other questions in this Step 4 stub),
deliver verbatim:

"If you could change one thing about how SkyFire wins (or doesn't
win) commercial deals — one thing, not three — what would you
change, and what would change downstream?"

No probe after the closing. The "and what would change downstream"
tail is non-negotiable per Section XV. The response is the response.`;
}
