// The Aperture interviewee registry. Static config, NOT a database
// table — per the Step 1 schema rationale, the 8-row cohort is
// hand-curated and never mutates at runtime.
//
// Source: Phase 2 Artifact 2 §2.1 (Interviewee Registry) + Phase 2
// Artifact 7 Decision 7 (Stacy scope override).
//
// Step 6 of the build wires the actual question content into the
// system prompt's Section VII at session start. The question_sequence
// arrays here are the canonical IDs; the matching verbatim question
// text comes from Phase 2 Artifacts 3, 4, 5.

export type Tier = 1 | 2 | 3;

export interface IntervieweeConfig {
  /** Stable string key — matches sessions.interviewee_id */
  id: string;
  /** Used in greetings, the final line, and the resume language */
  displayName: string;
  /** Used in subject lines, email body header, transcripts */
  fullName: string;
  /** Drives register calibration per A1 §2a */
  tier: Tier;
  /** 1 = critical, 2 = core, 3 = supporting (not surfaced to interviewee) */
  strategicPriority: 1 | 2 | 3;
  /** Target session length in seconds, per A2 §2.1 */
  timeBudgetTargetSeconds: number;
  /** Hard stop = target × 1.2 (forces closing transition) */
  timeBudgetHardStopSeconds: number;
  /** Warm question ID — resolved against A1.5 Warm Question Library */
  warmQuestionId: string;
  /** Core registry IDs in delivery order — resolved against A3/A4/A5 */
  questionSequence: string[];
  /** Calibrated closing variant ID per A1.5 §"Universal Closing Question" */
  closingQuestionId: string;
}

/**
 * Eight interviewees. Two Tier 1, three Tier 2, three Tier 3.
 *
 * Stacy's question_sequence reflects the A7 Decision 7 scope override —
 * the original A2 §2.1 five-question set was reframed to two core
 * questions plus the closing. Marketing-vendor probes (Stingray) and
 * the Amanda Schewaga status check were cut. This is the strictest
 * lane in the cohort; see A7 §XIV STACY HARD INTERRUPT.
 */
export const interviewees: Record<string, IntervieweeConfig> = {
  dave_vonesch: {
    id: "dave_vonesch",
    displayName: "Dave",
    fullName: "David Vonesch",
    tier: 1,
    strategicPriority: 1,
    timeBudgetTargetSeconds: 840,
    timeBudgetHardStopSeconds: 1008,
    warmQuestionId: "WARM_DAVE",
    questionSequence: ["DAVE_Q1", "DAVE_Q2", "DAVE_Q3", "DAVE_Q4", "DAVE_Q5"],
    closingQuestionId: "DAVE_CLOSE",
  },
  greg_sauer: {
    id: "greg_sauer",
    displayName: "Greg",
    fullName: "Greg Sauer",
    tier: 1,
    strategicPriority: 1,
    timeBudgetTargetSeconds: 1080,
    timeBudgetHardStopSeconds: 1296,
    warmQuestionId: "WARM_GREG",
    questionSequence: [
      "GREG_Q1",
      "GREG_Q2",
      "GREG_Q3",
      "GREG_Q4",
      "GREG_Q5",
      "GREG_Q6",
      "GREG_Q7",
      "GREG_Q8",
    ],
    closingQuestionId: "GREG_CLOSE",
  },
  landon_aldridge: {
    id: "landon_aldridge",
    displayName: "Landon",
    fullName: "Landon Aldridge",
    tier: 2,
    strategicPriority: 2,
    timeBudgetTargetSeconds: 900,
    timeBudgetHardStopSeconds: 1080,
    warmQuestionId: "WARM_LANDON",
    questionSequence: [
      "LANDON_Q1",
      "LANDON_Q2",
      "LANDON_Q3",
      "LANDON_Q4",
      "LANDON_Q5",
    ],
    closingQuestionId: "LANDON_CLOSE",
  },
  jason_jackson: {
    id: "jason_jackson",
    displayName: "Jason",
    fullName: "Jason Jackson",
    tier: 2,
    strategicPriority: 1,
    timeBudgetTargetSeconds: 900,
    timeBudgetHardStopSeconds: 1080,
    warmQuestionId: "WARM_JASON",
    questionSequence: [
      "JASON_Q1",
      "JASON_Q2",
      "JASON_Q3",
      "JASON_Q4",
      "JASON_Q5",
    ],
    closingQuestionId: "JASON_CLOSE",
  },
  curtis_buxton: {
    id: "curtis_buxton",
    displayName: "Curtis",
    fullName: "Curtis Buxton",
    tier: 2,
    strategicPriority: 1,
    timeBudgetTargetSeconds: 900,
    timeBudgetHardStopSeconds: 1080,
    warmQuestionId: "WARM_CURTIS",
    questionSequence: [
      "CURTIS_Q1",
      "CURTIS_Q2",
      "CURTIS_Q3",
      "CURTIS_Q4",
      "CURTIS_Q5",
      "CURTIS_Q6",
    ],
    closingQuestionId: "CURTIS_CLOSE",
  },
  robert_silver: {
    id: "robert_silver",
    displayName: "Rob",
    fullName: "Robert Silver",
    tier: 3,
    strategicPriority: 2,
    timeBudgetTargetSeconds: 780,
    timeBudgetHardStopSeconds: 936,
    warmQuestionId: "WARM_ROB_SILVER",
    questionSequence: ["ROBS_Q1", "ROBS_Q2", "ROBS_Q3", "ROBS_Q4", "ROBS_Q5"],
    closingQuestionId: "ROBS_CLOSE",
  },
  bryce_hayes: {
    id: "bryce_hayes",
    displayName: "Bryce",
    fullName: "Bryce Hayes",
    tier: 3,
    strategicPriority: 3,
    timeBudgetTargetSeconds: 780,
    timeBudgetHardStopSeconds: 936,
    warmQuestionId: "WARM_BRYCE",
    questionSequence: [
      "BRYCE_Q1",
      "BRYCE_Q2",
      "BRYCE_Q3",
      "BRYCE_Q4",
      "BRYCE_Q5",
    ],
    closingQuestionId: "BRYCE_CLOSE",
  },
  stacy_haakonson: {
    id: "stacy_haakonson",
    displayName: "Stacy",
    fullName: "Stacy Haakonson",
    tier: 3,
    strategicPriority: 1,
    timeBudgetTargetSeconds: 600,
    timeBudgetHardStopSeconds: 720,
    warmQuestionId: "WARM_STACY",
    // A7 Decision 7 scope override — two core questions only. Marketing-
    // vendor (Stingray) and Amanda Schewaga questions were cut to keep
    // the intake clear of marketing-leadership scoping risk.
    questionSequence: ["STACY_Q1", "STACY_Q2"],
    closingQuestionId: "STACY_CLOSE",
  },
};

export const intervieweeIds = Object.keys(interviewees);

export function getInterviewee(id: string): IntervieweeConfig | undefined {
  return interviewees[id];
}

/**
 * Display ordering for the admin cohort dashboard. Tier 1 first, then
 * Tier 2, then Tier 3, matching the kickoff brief invite cadence
 * (Tier 1 sends Day 10, Tier 2/3 send over Days 10–12).
 */
export const intervieweeDisplayOrder: string[] = [
  "dave_vonesch",
  "greg_sauer",
  "landon_aldridge",
  "jason_jackson",
  "curtis_buxton",
  "robert_silver",
  "bryce_hayes",
  "stacy_haakonson",
];
