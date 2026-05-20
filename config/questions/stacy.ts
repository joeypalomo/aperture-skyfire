// Stacy Haakonson — Tier 3-modified — 10-minute target intake.
// LOCKED SCOPE per A7 Decision 7: 2 core sales-process questions
// only + universal closing. Original A5 5-question set REPLACED.
// Stingray vendor probe CUT. Amanda Schewaga status check DROPPED.
//
// THE STRICTEST LANE IN THE COHORT. The Stacy hard interrupt
// (A7 §XIV) is the central architectural defense — fires before any
// other response generation when interviewee drifts into marketing-
// strategy territory.

import type { IntervieweeQuestionLibrary } from "./types";

export const stacyLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "stacy_haakonson",
  warm: {
    id: "WARM_STACY",
    text:
      "Quick anchor before the registry, Stacy. RevOps cross-cuts both " +
      "sides of the funnel — sales-side and marketing-side. For today " +
      "I'm focused on the sales-process side specifically. Before the " +
      "questions: what's one thing about how the C&I pipeline behaves " +
      "operationally that you don't think shows up in the data leadership " +
      "sees?",
    target_seconds: 60,
    expected_shape:
      "Likely surfaces one of three patterns — a stage-drift pattern in the pipeline, a lead-source attribution gap, or a cross-functional handoff failure. Lane note: if warm answer drifts into marketing-strategy territory, hard interrupt fires immediately.",
  },
  questions: [
    {
      id: "STACY_Q1",
      priority: "P0",
      title: "Marketing-sourced lead handoff into C&I pipeline",
      text:
        "When a marketing-sourced lead lands in the C&I pipeline, what " +
        "does the handoff look like — and does anyone close the loop on " +
        "whether those leads convert to closed-won?",
      why:
        "Surfaces the attribution reality from the sales-side without naming any marketing vendor. Tests Constraint #7 via the sales-process reframe. The 'does anyone close the loop' half is the diagnostic.",
      constraints_tested: ["C7"],
      probes: [
        {
          id: "primary",
          text: "When was the last time anyone reported back to marketing on a closed C&I deal — won or lost?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text: "Where would the closed-loop trail live if it existed?",
          when: "If Stacy engages on attribution chain.",
        },
        {
          id: "alt_2",
          text: "Who would do the reporting if the system asked them to?",
          when: "If Stacy names a system gap.",
        },
      ],
      substantive_markers:
        "Specific handoff pattern (where lead enters, who claims it, what data transfers), specific yes/no on closed-loop reporting, specific time frame for last close-the-loop event, specific gap in attribution chain.",
      thin_markers:
        '"depends on the lead" / "marketing handles their side" / generic process-language without specifics / deflection to Curtis or future audit.',
      time_estimate_seconds: { primary: 110, with_probe: 140 },
    },
    {
      id: "STACY_Q2",
      priority: "P0",
      title: "C&I segment priority from RevOps view",
      text:
        "From your seat — RevOps cross-cuts both sides of the funnel — " +
        "which two or three C&I segments do you think the company has the " +
        "cleanest path to win right now, and which two or three are we " +
        "trying too hard at?",
      why:
        "Triangulates Greg's segment-priority answer with a RevOps cross-functional view. Tests whether the 16 named segments have internal consensus on priority. Stacy's seat sees win-rate signal across the entire pipeline.",
      constraints_tested: ["C5"],
      probes: [
        {
          id: "primary",
          text: "What does the win-rate data tell you that the brief doesn't capture?",
          when: "Default; Branch 1 anchors here if Q1 surfaced no-close-loop pattern.",
        },
        {
          id: "alt_1",
          text: "Where do you and Greg see the priority differently?",
          when: "If Stacy names a divergence area.",
        },
        {
          id: "alt_2",
          text: "Which segment is everyone trying that's wasting capacity?",
          when: "If Stacy lists too-hard segments.",
        },
      ],
      substantive_markers:
        "Two to three named cleanest-path segments with reasoning, two to three named trying-too-hard segments with reasoning, specific win-rate signal, specific divergence with Greg's brief.",
      thin_markers:
        '"all the segments have potential" / "depends on the year" / "Greg owns that prioritization" / generic segment-language.',
      time_estimate_seconds: { primary: 110, with_probe: 140 },
    },
  ],
  closing: {
    id: "STACY_CLOSE",
    text:
      "If you could change one thing about how marketing and sales work " +
      "together at SkyFire — one thing — what would you change, and what " +
      "would change downstream?",
  },
  branching_rules: `Branch 1 — Q1 → Q2: IF Q1 surfaces a specific lead-source pattern that does NOT close the loop, THEN Q2 probe-down defaults to "What does the win-rate data tell you that the brief doesn't capture?"

Branch 2 — MARKETING-STRATEGY DRIFT — HARD INTERRUPT (central architectural defense):
IF Stacy at ANY point in Q1, Q2, or the closing drifts into marketing-strategy territory (names campaign, vendor, ad spend, channel mix, marketing-team member, website project, marketing hire) → Aperture delivers verbatim re-anchor IMMEDIATELY, before any other response generation:
"That's helpful — and probably a conversation Joey wants to have directly. For today I'm focused on the sales-side questions."
Then transition to next question. Drift captured in synthesis; conversation re-centers. Phase 3 implements as a hard interrupt at the inference layer. NON-NEGOTIABLE.

Branch 3 — Vendor-name attempted: IF Stacy names a marketing vendor by name in any answer → acknowledge with two words ("Got it.") and immediately deliver re-anchor from Branch 2. Vendor name captured in synthesis. Agent does NOT engage with vendor content even if factually relevant to Constraint #7.

Branch 4 — Time pressure trim: IF end-of-Q1 > 6:30, skip Q2 probe-down. IF end-of-Q2 > 9:30, deliver closing immediately. No question to drop — Q1, Q2, closing all non-negotiable.`,
  voice_register_notes: `Pace: Medium-to-fast. Stacy is RevOps; she'll answer in operational specifics. Her Gemini comfort at May 4 kickoff suggests she may engage Aperture more peer-to-peer. Stay composed.

Anchor language: "The funnel" (both sides) / "The handoff" / "The pipeline" / "Closed-loop" / Specific HubSpot terminology ("stage," "deal record," "lead source"). Mirror when natural.

Energized by: Cross-functional friction that data doesn't surface, the attribution gap on the sales side, win-rate signal across segments, the HubSpot operational layer.

Topics where Stacy may try to extend — and where Aperture RE-ANCHORS:
- Marketing strategy at any level
- Marketing vendor performance by name
- Marketing team structure or hiring
- The website project, brand work, content strategy
- Ad spend, campaign performance
- Amanda Schewaga's status or replacement (Amanda question was DROPPED per locked scope; if Stacy volunteers Amanda content, acknowledge and re-anchor without engaging)`,
  watch_outs: `THE MOST IMPORTANT LANE-DISCIPLINE SECTION IN THE COHORT.

1. CRITICAL FORBIDDEN: Stingray (and any other marketing vendor by name). NEVER mention Stingray. NEVER ask about ad spend. NEVER ask about agency relationships. If Stacy volunteers vendor content, Branch 3 fires.

2. CRITICAL FORBIDDEN: marketing leadership scoping. NEVER ask who runs which campaign. NEVER ask about marketing team structure. NEVER ask about marketing hiring. NEVER ask about Amanda Schewaga. NEVER ask about website project, brand work, content strategy, or marketing-leadership transition.

3. CRITICAL: the Branch 2 hard interrupt. If Stacy drifts into ANY marketing-strategy territory, the verbatim re-anchor fires IMMEDIATELY. Phase 3 implements as a hard interrupt at the inference layer.

4. May try to surface 7,285-deal reassignment update — acknowledge it's tracked with Joey and Curtis; re-anchor. Do NOT extend.

5. May volunteer Amanda's status — Amanda question is DROPPED per locked scope. Acknowledge with two words, log for Joey, do NOT extend.

6. May probe Aperture itself (Gemini comfort at May 4) — FAQ in A1 §7 handles standard probes; Joey-escalation pattern for outside-FAQ probes.

7. Short intake (~10 min) — temptation to extend Q1 or Q2 with extra probes to "use the time" → DO NOT. Locked scope is locked. Synthesis captures what wasn't asked.

8. Contradictions with Known Knowns (7,285 count, 3.5 years tenure, cross-functional reach) — log CONTRADICTION_FLAG, do NOT correct. Stacy is ground-truth source on her own seat.`,
  trim_sequence: ["STACY_Q2_probe", "STACY_Q1_probe"],
};
