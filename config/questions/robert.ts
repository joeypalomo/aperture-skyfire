// Robert Silver — Tier 3 — 13-minute target intake.
// Source: Phase 2 Artifact 5 §§ Robert Silver.

import type { IntervieweeQuestionLibrary } from "./types";

export const robertLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "robert_silver",
  warm: {
    id: "WARM_ROB_SILVER",
    text:
      "Quick anchor before the registry, Rob. Last 90 days in HubSpot: 180 " +
      "calls, 615 emails, 16 tasks completed — the cleanest task discipline " +
      "on the C&I bench right now. From where you sit — what's the " +
      "residential pattern you've kept in the move that's serving you in " +
      "the C&I seat, and what's the one you can already tell isn't going " +
      "to scale?",
    target_seconds: 60,
    expected_shape:
      "Likely surfaces one of three patterns — daily-call discipline (which serves the C&I cycle differently), email-heavy cadence (which probably doesn't scale to C&I touch frequency), or task-completion habit (most transferable).",
  },
  questions: [
    {
      id: "ROBS_Q1",
      priority: "P0",
      title: "The question asked three times",
      text:
        "First 30 days in your C&I seat — what was the question you asked " +
        "someone three times because the answer wasn't obvious from the " +
        "system or the docs?",
      why:
        "Surfaces institutional-knowledge gaps from the only fresh perspective on the team. Defines Month 3 onboarding playbook content.",
      constraints_tested: ["C1", "C3"],
      probes: [
        { id: "primary", text: "Who finally gave you the answer?", when: "Default." },
        { id: "alt_1", text: "Where would the answer have lived if it had been documented?", when: "If Rob names a specific question." },
        { id: "alt_2", text: "What's the second-most-asked question?", when: "If first answer is substantive." },
      ],
      substantive_markers:
        "Specific question (a HubSpot field he couldn't decode, a process he couldn't trace, a relationship he couldn't map), named source (Greg, Bryce, Stacy, residential teammate), specific gap between system and docs.",
      thin_markers:
        '"nothing too crazy" / "I figured it out" / "you just ask around" / generic deflection protecting the team.',
      time_estimate_seconds: { primary: 90, with_probe: 120 },
    },
    {
      id: "ROBS_Q2",
      priority: "P0",
      title: "First 60 minutes on a new lead",
      text:
        "When a new C&I lead lands on your plate today, walk me through the " +
        "first sixty minutes — what do you do, where do you go, who do you " +
        "call?",
      why:
        "Surfaces actual workflow vs. documented workflow. Rob's freshness means he hasn't yet rationalized the inefficiency.",
      constraints_tested: ["C1", "C2"],
      probes: [
        { id: "primary", text: "Where does HubSpot show up in that hour?", when: "Default." },
        { id: "alt_1", text: "Who do you call first?", when: "If Rob describes workflow without naming first person." },
        { id: "alt_2", text: "How do you know what segment the lead is?", when: "If Rob describes lead intake." },
      ],
      substantive_markers:
        "Sequenced workflow (open the email, check the contact in HubSpot, call the customer, etc.), specific tools or systems used, named first-call person, specific time-to-action, specific data source.",
      thin_markers:
        '"depends on the lead" / "I work it like any other" / "follow the process" / generic process-language without sequence.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "ROBS_Q3",
      priority: "P0",
      title: "Confident versus flying blind",
      text:
        "Your territory is YEG plus Ontario plus select WC utility. Where " +
        "are you most confident, and where are you flying blind — which " +
        "segments do you feel ready for, and which are you working without " +
        "a map?",
      why:
        "Tests Constraint #5 (96.3% accounts have no segment tag) from rep seat. Segments Rob names as 'flying blind' are gaps Month 2 Aperture target lists need to fill first.",
      constraints_tested: ["C5"],
      probes: [
        { id: "primary", text: "Which segment do you wish you knew the customer language for?", when: "Default." },
        { id: "alt_1", text: "What's the buyer type you've never sold to but think you could?", when: "If Rob names confident segments." },
        { id: "alt_2", text: "How does Greg's brief on the territory match what you're seeing in practice?", when: "If Rob mentions brief vs. reality." },
      ],
      substantive_markers:
        "Named confident segment with reasoning, named flying-blind segment with reasoning, specific buyer-language gap, specific divergence between brief and field.",
      thin_markers:
        '"still learning" / "depends on the lead" / "I\'m getting up to speed" / generic onboarding-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "ROBS_Q4",
      priority: "P1",
      title: "Coaching the next hire",
      text:
        "If you had to coach the next C&I hire in their first week, what's " +
        "the one thing you'd tell them that nobody told you?",
      why:
        "Surfaces the onboarding gap the Hunter recruit will hit. Seeds the Month 3 onboarding playbook for new C&I hires.",
      constraints_tested: ["C3"],
      probes: [
        { id: "primary", text: "Why didn't anyone tell you?", when: "Default; Branch 1 anchors here if Q1 surfaced specific gap." },
        { id: "alt_1", text: "Who should have?", when: "If Rob mentions responsibility." },
        { id: "alt_2", text: "What's the second thing you'd tell them?", when: "If first answer is substantive." },
      ],
      substantive_markers:
        "Specific actionable lesson, named system or person they should learn first, specific failure mode the next hire would hit.",
      thin_markers:
        '"just work hard" / "trust the team" / "ask a lot of questions" / generic mentorship-language.',
      time_estimate_seconds: { primary: 70, with_probe: 90 },
    },
    {
      id: "ROBS_Q5",
      priority: "P0",
      title: "Deal he wishes someone had killed",
      text:
        "A deal you've worked in the last sixty days where you wish someone " +
        "had told you 'no, walk away' at the start. What signal did you " +
        "miss?",
      why:
        "Tests Constraint #2 (first-contact qualification gate missing) from new-rep perspective. Confirms the gate is missing in onboarding architecture.",
      constraints_tested: ["C2"],
      probes: [
        { id: "primary", text: "Who would have known to say walk away?", when: "Default; Branch 2 anchors here if Q2 surfaced workflow gap." },
        { id: "alt_1", text: "What did the deal cost you in hours before you figured it out?", when: "If Rob engages on time cost." },
        { id: "alt_2", text: "How would you want the system to flag it next time?", when: "If Rob names a missed signal." },
      ],
      substantive_markers:
        "Specific deal/customer type, named missed signal (timeline, budget, contact authority, scope mismatch, segment fit), named operator who would have caught it, specific hour cost.",
      thin_markers:
        '"haven\'t had that yet" / "still figuring it out" / defensive deflection.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
  ],
  closing: {
    id: "ROBS_CLOSE",
    text:
      "If you could change one thing about how SkyFire onboards a new C&I " +
      "rep — one thing, based on what you wish you'd had — what would it " +
      "be, and what would change downstream?",
  },
  branching_rules: `Branch 1 — Q1 → Q4: IF Q1 surfaces a specific institutional-knowledge gap, THEN Q4 probe-down tightens to "Where should the answer have lived?"

Branch 2 — Q2 → Q5: IF Q2 surfaces a workflow where HubSpot doesn't show up in the first hour, THEN Q5 probe-down defaults to "How would you want the system to flag it next time?"

Branch 3 — Q3 → Q4: IF Q3 names a flying-blind segment, THEN Q4 probe-down defaults to "What's the second thing you'd tell them?"

Branch 4 — Defensive-default pattern: IF Rob answers with "everything's fine, I'll figure it out" → run ONE probe-down. If second answer is also defensive, use A1 §5 "moving on" verbatim and proceed. No second probe attempt.

Branch 5 — Time pressure trim: IF end-of-Q3 > 9:30, skip Q4 entirely. IF end-of-Q4 > 11:30, skip Q5 probe.`,
  voice_register_notes: `Pace: Medium. Rob is new — he may need a beat to think on Q1 specifically. Do NOT fill silence.

Anchor language: "The seat" / "The territory" / "A lead" / "a deal" / "The customer" (singular, present tense). Mirror when natural.

Energized by: Specific workflow walks, what didn't make sense on day one, segments he's drawn to but doesn't fully know, the next-hire framing.

Hedges or closes down on: Critique of team or Greg's coaching, direct comparison to Bryce or other reps, his own performance, compensation/quota/territory ownership/career path (OUT OF SCOPE).`,
  watch_outs: `1. Defensive "everything's fine" default — probe once, never press (Branch 4).
2. Peer-not-subordinate framing — Rob is an operator finding his lane, not a junior on evaluation track.
3. Compensation, quota, territory, career — OUT OF SCOPE (A1 §2d redirect).
4. May reference Greg or Bryce by name — accept, log, move on. Do NOT extend to Greg-or-Bryce conversation.
5. Contradictions with Known Knowns (territory vs. May 11 reorg, activity numbers vs. May 8 audit) — log CONTRADICTION_FLAG, do NOT correct. Rob is ground-truth source on his own seat.
6. May want to debrief residential move — accept as warm-level signal, transition to Q1. Do NOT extend warm into Q-level discussion.`,
  trim_sequence: [
    "ROBS_Q4",
    "ROBS_Q5_probe",
    "ROBS_Q1_probe",
    "ROBS_Q3_probe",
    "ROBS_Q2_probe",
  ],
};
