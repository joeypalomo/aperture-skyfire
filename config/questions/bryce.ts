// Bryce Hayes — Tier 3 — 14-minute target intake (ALL P0, no P1).
// Source: Phase 2 Artifact 5 §§ Bryce Hayes.

import type { IntervieweeQuestionLibrary } from "./types";

export const bryceLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "bryce_hayes",
  warm: {
    id: "WARM_BRYCE",
    text:
      "Quick anchor before the registry, Bryce. Okanagan C&I, last ninety " +
      "days in HubSpot — 204 calls against 26 emails. Phone-first, the " +
      "inverse of most of the bench. What's a customer conversation you " +
      "had this quarter where the phone did something an email wouldn't " +
      "have?",
    target_seconds: 60,
    expected_shape:
      "Likely surfaces a specific customer moment — a tone read he caught on the phone, an objection handled in real time, a follow-up that closed because he picked up the phone.",
  },
  questions: [
    {
      id: "BRYCE_Q1",
      priority: "P0",
      title: "The proposal he's most proud of",
      text:
        "Of the C&I proposals you've been part of in the last year, walk " +
        "me through the one you're most proud of. What made it different — " +
        "the discovery, the customer, the timing, the team?",
      why:
        "Surfaces what 'good' looks like from Bryce's perspective. Gives him standing in his own seat. Named deal is also Month 3 case-study material.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "What did you do differently on that deal that you don't always do?", when: "Default." },
        { id: "alt_1", text: "What did the customer say that signaled they were a fit?", when: "If Bryce names a customer pattern." },
        { id: "alt_2", text: "Where did the team show up best for you?", when: "If Bryce mentions team contribution." },
      ],
      substantive_markers:
        "Named customer or deal, specific discovery moments, specific timing dynamic, named teammates, specific differentiator.",
      thin_markers:
        '"they all run together" / "depends on the deal" / "I\'d have to think about it" / generic experience-language.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "BRYCE_Q2",
      priority: "P0",
      title: "The most-common real no",
      text:
        "When customers say no to a SkyFire C&I proposal — not 'not yet,' " +
        "but a real no — what's the objection you hear most often? What's " +
        "your answer to it today?",
      why:
        "Tests Bryce's objection library. Most-common objection is a positioning input for the Month 3 playbook USP messaging.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "Where do you wish you had a better answer?", when: "Default." },
        { id: "alt_1", text: "Have you heard the same objection from multiple customers?", when: "Default if Q1 surfaced fit-signal per Branch 1." },
        { id: "alt_2", text: "What does Greg say when he hears the same objection?", when: "Last resort — comparison-adjacent." },
      ],
      substantive_markers:
        "Named objection (price, timeline, technology, financing, contract terms, scope, references), his current answer in specific language, named pattern across multiple customers.",
      thin_markers:
        '"depends on the customer" / "every deal is different" / "I work it as it comes" / generic objection-handling language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "BRYCE_Q3",
      priority: "P0",
      title: "Where time bled",
      text:
        "Walk me through a deal in the Okanagan that took longer than it " +
        "should have. Where did time bleed — discovery, design, pricing, " +
        "contracting, somewhere else?",
      why:
        "Surfaces proposal-process friction from rep-eye perspective. Direct input to Month 3 stage architecture and handoff protocols.",
      constraints_tested: ["C3"],
      probes: [
        { id: "primary", text: "Who would have caught the time bleed if they'd been watching?", when: "Default." },
        { id: "alt_1", text: "What was the customer doing during that stretch?", when: "If Bryce names a stage." },
        { id: "alt_2", text: "Has the pattern repeated?", when: "If Bryce engages on recurring pattern." },
      ],
      substantive_markers:
        "Named deal, specific stage where time bled (discovery / design / pricing / contracting / hand-back-to-customer), specific cause, specific cost in days/weeks.",
      thin_markers:
        '"they all take longer than they should" / "depends on the deal" / generic process-language.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "BRYCE_Q4",
      priority: "P0",
      title: "The one thing the playbook should bring",
      text:
        "If you could pick one thing the playbook should bring you that " +
        "doesn't exist today — discovery questions, proposal templates, " +
        "qualification criteria, customer references, objection responses " +
        "— what's the one that would matter most this quarter?",
      why:
        "Calibrates what playbook element Bryce would actually adopt. What he names is what he'll use.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "Why that one first?", when: "Default." },
        { id: "alt_1", text: "What's the second?", when: "If first answer is substantive." },
        { id: "alt_2", text: "Where would Rob or Rob MacInnis need something different?", when: "Careful — comparison-adjacent. Use only if framing reads as 'where would THEY need different.'" },
      ],
      substantive_markers:
        "Named playbook element from the list (or outside the list), specific quarter-priority reason, specific deal context where the element would have changed the outcome.",
      thin_markers:
        '"any of those would help" / "the whole thing" / "I\'d need to see it first" / generic playbook-language.',
      time_estimate_seconds: { primary: 70, with_probe: 90 },
    },
    {
      id: "BRYCE_Q5",
      priority: "P0",
      title: "Real versus parked",
      text:
        "Of your current open deals, how many would you say are real — " +
        "moving toward a decision in the next ninety days — versus " +
        "parked? What's the difference between the two in your head?",
      why:
        "Tests Constraints #2 and #4 from rep perspective without making it about him. Bryce's real-vs-parked criterion is the inverse of the missing qualification gate.",
      constraints_tested: ["C2", "C4"],
      probes: [
        { id: "primary", text: "If the system tagged a deal as parked, would you keep working it?", when: "Default; Branch 3 anchors here if Q3 surfaced time-bleed stage." },
        { id: "alt_1", text: "How long until a parked deal becomes a closed-lost?", when: "If Bryce engages on parked timeline." },
        { id: "alt_2", text: "What would change a parked deal's status back to real?", when: "If Q3 surfaced specific stage." },
      ],
      substantive_markers:
        "Specific real-versus-parked count, specific criterion in his head (timeline, customer engagement frequency, decision-maker access, budget approved), specific parked-to-closed-lost timeline.",
      thin_markers:
        '"they\'re all real to me" / "depends on the deal" / "I work everything" / defensive deflection on pipeline reality.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
  ],
  closing: {
    id: "BRYCE_CLOSE",
    text:
      "If you could change one thing about how SkyFire helps you close C&I " +
      "deals — one thing — what would you change, and what would change " +
      "downstream?",
  },
  branching_rules: `Branch 1 — Q1 → Q2: IF Q1 surfaces a specific fit-signal from the customer, THEN Q2 probe-down defaults to "Have you heard the same objection from multiple customers?"

Branch 2 — Q3 → Q5: IF Q3 surfaces a specific stage where time bled, THEN Q5 probe-down defaults to "What would change a parked deal's status back to real?"

Branch 3 — Q4 → Q5: IF Q4 names "qualification criteria," THEN Q5 is the natural follow-up. Frame: "Got it. Then this next one is in the same lane."

Branch 4 — Defensive register pattern: IF Bryce answers with defensiveness (deflection, refusal to name specifics, generic experience-language) → acknowledge experience first, reframe once: "You've seen a lot of these — what's working and what isn't?" If second answer also defensive, use A1 §5 verbatim and move on.

Branch 5 — Time pressure trim (probe-downs only — all questions are P0): IF end-of-Q3 > 10:30, skip Q4 probe. IF end-of-Q4 > 12:00, skip Q5 probe. IF end-of-Q4 > 13:00, tighten acknowledgment mode to minimal.`,
  voice_register_notes: `Pace: Medium-to-slow. Bryce is tenured; he'll take his time on questions about his own work. Wait. Long answers are signal.

Anchor language: "On the phone" / "The customer" (specific people) / "Real" and "parked" (if he uses them) / "The proposal" (singular, specific) / "On the deal". Mirror when natural.

Energized by: A specific customer conversation, the deal he's most proud of (Q1), objections he hears repeatedly and his answers, where time bleeds in the process.

Hedges or closes down on: Critique of his own process when framed as evaluation, comparison to other reps (FORBIDDEN), coaching history past or present (FORBIDDEN), commission percentages/comp structure (FORBIDDEN).`,
  watch_outs: `1. Defensive register — must NOT feel like an audit. Acknowledge experience first, then probe (Branch 4).
2. Comparison to other reps — CRITICAL FORBIDDEN. Never ask comparative questions. Q4 probe alternate mentions "Rob or Rob MacInnis" — framed as "where would THEY need different." If reads comparative, drop and use primary probe.
3. Coaching history — CRITICAL FORBIDDEN. Never ask. If surfaces, acknowledge, log for Joey, do NOT engage.
4. Commission, comp structure — CRITICAL FORBIDDEN. A1 §2d verbatim redirect.
5. May surface contested deal — listen for operational pattern, capture deal name, do NOT extend into attribution adjudication.
6. May want to debrief approach broadly — listen for operational signal, move to Q2 with brief acknowledgment. Do NOT extend Q1 into methodology discussion.
7. Contradictions with Known Knowns (Okanagan specifics, call/email/task counts, May 11 reorg details) — log CONTRADICTION_FLAG, do NOT correct.`,
  trim_sequence: [
    "BRYCE_Q4_probe",
    "BRYCE_Q2_probe",
    "BRYCE_Q1_probe",
    "BRYCE_Q3_probe",
    "BRYCE_Q5_probe",
  ],
};
