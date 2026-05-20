// Landon Aldridge — Tier 2 — 14-minute target intake.
// Source: Phase 2 Artifact 4 §§ Landon Aldridge.

import type { IntervieweeQuestionLibrary } from "./types";

export const landonLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "landon_aldridge",
  warm: {
    id: "WARM_LANDON",
    text:
      "Quick anchor before the registry, Landon. You're running operations " +
      "out of Kelowna across a company that doubled in size four months ago " +
      "and picked up BC coastal capability in the process. From where you " +
      "sit today — what's the geography costing you that nobody on the " +
      "SkyFire-side fully sees yet?",
    target_seconds: 60,
    expected_shape:
      "Likely surfaces Kelowna time-zone friction with Calgary HQ, BC coastal project lead times Calgary doesn't internalize, or capacity dispersion across the combined footprint.",
  },
  questions: [
    {
      id: "LANDON_Q1",
      priority: "P0",
      title: "Deal qualification gate missing",
      text:
        "Walk me through the last C&I deal where you wished sales had asked " +
        "one more qualifying question before estimating fired up. What was " +
        "the question — and what would the answer have changed?",
      why:
        "Tests Constraint #2 from the operations seat — the most direct way to surface where the gate is missing because the consequences land on Landon's team.",
      constraints_tested: ["C2"],
      probes: [
        {
          id: "primary",
          text: "Who would have caught it if the question had been asked?",
          when: "Default.",
        },
        { id: "alt_1", text: "How often does this pattern repeat?", when: "If Landon names a specific deal." },
        { id: "alt_2", text: "What did the post-mortem on that deal surface?", when: "If Landon mentions follow-up review." },
      ],
      substantive_markers:
        "Named deal/customer, specific qualifying question not asked (segment, geography, scope, contact authority, project size, equipment availability), specific operational consequence (rework hours, design time, equipment commit), specific person who could have caught it.",
      thin_markers:
        '"happens a lot" / "you can usually tell" / generic experience-language without deal names / deflection to Jarek or Greg.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "LANDON_Q2",
      priority: "P0",
      title: "Capacity choke points and slack",
      text:
        "Where is delivery currently choking — what region, what project " +
        "type, what part of the work? And where do you have spare capacity " +
        "that sales doesn't know to feed?",
      why:
        "Capacity intelligence unique to Landon's seat. Tells Month 2 ICP prioritization which segments to push and which to pace.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "Which choke point hits first as C&I volume rises?", when: "Default." },
        { id: "alt_1", text: "Where would 20% more volume break first?", when: "Forward-looking probe." },
        { id: "alt_2", text: "What's the lead time on adding capacity at the worst choke point?", when: "If Landon names a specific choke." },
      ],
      substantive_markers:
        "Named region (Calgary, Edmonton, Kelowna, BC coastal, Regina), named project type (industrial rooftop, ground-mount, carport, microgrid, off-grid), named part of work (design, permit, procurement, installation, commissioning, O&M handoff), specific team or operator, named spare-capacity region.",
      thin_markers:
        '"we\'re tight all around" / "the field is busy" / "depends on the season" / refusal to name specific choke point.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "LANDON_Q3",
      priority: "P1",
      title: "Hakai integration delivery handoff",
      text:
        "Five months after the Hakai acquisition, what's a delivery handoff " +
        "that works better than it did pre-acquisition — and what's still " +
        "rough?",
      why:
        "Hakai integration ground truth from operations. Calibrates whether the Option C-style integration workstream is needed.",
      constraints_tested: ["C6"],
      probes: [
        { id: "primary", text: "Where is your read different from Jason's?", when: "Default." },
        { id: "alt_1", text: "Are the Hakai-side delivery folks operationally integrated yet?", when: "Personnel-level probe." },
        { id: "alt_2", text: "What's the BC-coastal project type that's hardest to deliver from Kelowna?", when: "If Landon mentions BC coastal." },
      ],
      substantive_markers:
        "Named handoff (sales-to-design, design-to-procurement, procurement-to-field, field-to-O&M), specific before/after pattern, named Hakai-side or SkyFire-side operator, specific project type or region.",
      thin_markers:
        '"it\'s getting there" / "still early" / "no major issues" / deflection to Jason.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "LANDON_Q4",
      priority: "P0",
      title: "Sales-to-delivery handoff protocol gap",
      text:
        "When Jarek's commercial team brings you a signed C&I deal, what's " +
        "the question you most often have to ask back? What information " +
        "should have been in hand?",
      why:
        "Tests the sales-to-delivery handoff protocol — what should be a Month 3 playbook stage gate but is not today.",
      constraints_tested: ["C3"],
      probes: [
        { id: "primary", text: "Is it usually the same question, or different by segment?", when: "Default." },
        { id: "alt_1", text: "How much rework does the missing info cost?", when: "If Landon names recurring question." },
        { id: "alt_2", text: "What's the structure that would catch it pre-signature?", when: "If Q1 surfaced specific missing field per Branch 1." },
      ],
      substantive_markers:
        "Named recurring question (scope detail, customer technical contact, site access, electrical configuration, permit jurisdiction, equipment preference, timeline), specific hour or day cost, specific pre-signature stage gate.",
      thin_markers:
        '"we work it out" / "depends on the deal" / "usually fine" / generic process-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "LANDON_Q5",
      priority: "P1",
      title: "Forward operational constraint ranking",
      text:
        "Of all the operational constraints on what SkyFire could promise " +
        "C&I customers in the next eighteen months — equipment supply, " +
        "skilled trades, geography, design capacity — which one will hit " +
        "first, and which one is most invisible to sales today?",
      why:
        "Surfaces the operational ceiling the playbook's qualification criteria need to respect. Q2 names current choke; Q5 is forward-looking ceiling.",
      constraints_tested: ["FORWARD"],
      probes: [
        { id: "primary", text: "What's the leading indicator that the constraint is about to bind?", when: "Default." },
        { id: "alt_1", text: "Who else inside ops has visibility on it?", when: "If Q3 surfaced rough Hakai delivery per Branch 3." },
        { id: "alt_2", text: "Where is Parker Christensen's read on equipment supply right now?", when: "If Landon names equipment supply." },
      ],
      substantive_markers:
        "Named constraint category, specific binding moment (Q3 2026, next 100 MWp, BC coastal scale-up), named leading indicator, specific divergence between ops view and sales view.",
      thin_markers:
        '"all of the above" / "depends what we sell" / "we\'ll figure it out" / generic constraint-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
  ],
  closing: {
    id: "LANDON_CLOSE",
    text:
      "If you could change one thing about how sales hands a closed deal " +
      "off to your team — one thing — what would it be, and what would " +
      "change downstream?",
  },
  branching_rules: `Branch 1 — Q1 → Q4: IF Q1 names a specific missing qualifying question, THEN Q4 probe-down defaults to "What's the structure that would catch it pre-signature?"

Branch 2 — Q2 → Q5: IF Q2 names a specific choke point, THEN Q5 probe-down defaults to "What's the leading indicator that the constraint is about to bind?"

Branch 3 — Q3 → Q5: IF Q3 surfaces Hakai-side delivery still rough, THEN Q5 probe-down defaults to "Who else inside ops has visibility on it?"

Branch 4 — Time pressure trim: IF end-of-Q2 > 9:30, skip Q3 probe. IF end-of-Q4 > 12:30, skip Q5 probe. IF end-of-Q4 > 13:00, skip Q5 entirely; flag synthesis.`,
  voice_register_notes: `Pace: Deliberate. Landon was quiet at May 4 kickoff; operations leaders often are early. Expect slower starts; do NOT fill silence.

Anchor language: "The field" / "Handoff" / "Rework" / "Lead time" / "Scope". Mirror when natural.

Energized by: Operational capacity by project-type-by-region, where ops absorbs cost sales doesn't see, Hakai-side delivery reality, equipment supply chain, forward-looking constraints at scale.

Hedges or closes down on: Direct critique of Jarek by individual, personnel evaluation across combined org, commentary on Dave/Greg strategic priorities, compensation/hiring/HR (OUT OF SCOPE).`,
  watch_outs: `1. War story risk on Q1, Q3, Q4 — 4-minute project walkthrough. Extract pattern, move on. If exceeds 4 min and Q2 hasn't started, soft re-anchor: "I want to come back to that, but first — [next registry question]."
2. Hakai integration politics on Q3 — acknowledge, take operating pattern, return to registry. Do NOT probe into politics.
3. HR/compensation topics — OUT OF SCOPE. A1 §2d verbatim redirect.
4. May 8 audit debrief — acknowledge progress is tracked with Joey, re-anchor.
5. May 4 kickoff reference — Landon was quiet; do NOT use kickoff as reference point in question framing.
6. Geographic-reality cascade in warm — treat as signal for Q2/Q5 probe selection; do NOT extend warm into Q-level discussion.`,
  trim_sequence: [
    "LANDON_Q5",
    "LANDON_Q3_probe",
    "LANDON_Q5_probe",
    "LANDON_Q1_probe",
  ],
};
