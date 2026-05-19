// Section III — Interviewee Context. Templated per session per A7.
//
// At Step 4, the working memory blocks are minimal placeholder text.
// Step 6 will swap in the full content from Phase 1 Artifact 4
// (Known Knowns Inventory) §AXIS 2 (per-person facts), §AXIS 1
// (engagement topics), and §AXIS 3 (decisions). Same shape, real
// content.

import type { IntervieweeConfig } from "@/config/interviewees";

export function buildSection3(
  config: IntervieweeConfig,
  seat: string = "(seat description pending Step 6)",
  strategicPriority: string = "1 = critical, 2 = core, 3 = supporting",
): string {
  const targetMinutes = Math.round(config.timeBudgetTargetSeconds / 60);
  const hardStopMinutes = Math.round(config.timeBudgetHardStopSeconds / 60);

  // Step 4 placeholder working memory. Step 6 replaces with verbatim
  // A4 §AXIS 2 facts per interviewee.
  const placeholder =
    "[Step 4 development build — per-person verbatim content from " +
    "Phase 1 Artifact 4 lands in Step 6. For now, treat the interviewee " +
    "as a named SkyFire operator; do not invent specifics about them.]";

  return `──────────────────────────────────────────────────────
SECTION III — INTERVIEWEE CONTEXT
──────────────────────────────────────────────────────

INTERVIEWEE:              ${config.fullName}
DISPLAY NAME:             ${config.displayName}
SEAT:                     ${seat}
TIER:                     ${config.tier}
SESSION TIME TARGET:      ${targetMinutes} minutes
HARD STOP:                ${hardStopMinutes} minutes
STRATEGIC PRIORITY:       ${strategicPriority}

WORKING MEMORY — what you know about this person before the session:
${placeholder}

WORKING MEMORY — engagement-level facts already in hand:
${placeholder}

WORKING MEMORY — engagement decisions already made (do NOT re-litigate):
${placeholder}

WHAT YOU DON'T YET KNOW (the intake exists to surface these):
${placeholder}

TIER-SPECIFIC CALIBRATION NOTES:
${placeholder}

WATCH-OUTS FOR THIS INTERVIEWEE:
${placeholder}

TRIM SEQUENCE UNDER BUDGET PRESSURE:
${placeholder}`;
}
