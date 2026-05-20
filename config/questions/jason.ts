// Jason Jackson — Tier 2 — 15-minute target intake.
// Source: Phase 2 Artifact 4 §§ Jason Jackson.

import type { IntervieweeQuestionLibrary } from "./types";

export const jasonLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "jason_jackson",
  warm: {
    id: "WARM_JASON",
    text:
      "Quick anchor before the registry, Jason. You asked Joey during the " +
      "May 4 kickoff how this situation came together — and you flagged the " +
      "oil-and-gas, Texas-based angle. Standing in your seat today, what's " +
      "the question you'd want a fractional VP of commercial sales to be " +
      "able to answer that would prove they understand the BC side of this " +
      "business?",
    target_seconds: 60,
    expected_shape:
      "Named buyer type, named regulatory wrinkle, specific BC utility relationship, or specific First Nations procurement pattern. May also use warm to surface what he wants the engagement working on.",
  },
  questions: [
    {
      id: "JASON_Q1",
      priority: "P0",
      title: "Pipeline triage: real versus ghost deals",
      text:
        "Of the deals currently in the 40% Qualified stage on the Hakai " +
        "BC pipeline — Calgary Stampede Big Four at $888K, fourteen months " +
        "old; Garibaldi Glass at $2M, ten months; DIRTT; Precon " +
        "Manufacturing; Westfine Meats; the rest — how many would you take " +
        "to close-lost today, and how many do you still believe?",
      why:
        "Direct test of Constraint #6 with named deals. Jason is the only person who can adjudicate real opportunity versus ghost pipeline on the $20–30M stall pool.",
      constraints_tested: ["C6"],
      probes: [
        {
          id: "primary",
          text: "What's the criterion in your head when you separate the real from the ghost?",
          when: "Default.",
        },
        { id: "alt_1", text: "Is there a deal not on that list that you'd push higher than Greg might?", when: "If Jason names specific count or names." },
        { id: "alt_2", text: "What's the one named deal worth fighting for?", when: "If Jason engages but doesn't isolate." },
      ],
      substantive_markers:
        "Specific count or dollar figure, named deals with reasoning, specific real-vs-ghost criterion, named deal he'd push harder than current ownership suggests.",
      thin_markers:
        '"depends on each one" / "Greg owns those now" / "I\'d have to look at the list" / deflection to future joint review.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "JASON_Q2",
      priority: "P0",
      title: "Pre-acquisition operating sequence",
      text:
        "Pre-acquisition Hakai had a documented residential process and " +
        "nothing for C&I. Walk me through how a C&I deal actually moved " +
        "through Hakai before SkyFire bought you — start to close, three " +
        "feet apart in the office, what was the real sequence?",
      why:
        "Captures institutional knowledge that died with acquisition. C&I-without-documentation is what Constraint #2 looks like in pure form.",
      constraints_tested: ["C2"],
      probes: [
        { id: "primary", text: "Who was the qualification gate at Hakai pre-acquisition — was it always you?", when: "Default." },
        { id: "alt_1", text: "How did you know to walk away?", when: "If Jason mentions disqualification." },
        { id: "alt_2", text: "What did you measure deal-to-deal?", when: "If Jason names measurement habits." },
      ],
      substantive_markers:
        "Specific sequence (lead source → first call → site visit → estimate → close), named operators, specific deal types qualified into vs. out of, named measurement tracked deal-by-deal.",
      thin_markers:
        '"it was situational" without specifics / "we just made it work" / generic small-team-language.',
      time_estimate_seconds: { primary: 150, with_probe: 180 },
    },
    {
      id: "JASON_Q3",
      priority: "P0",
      title: "Integration risk: capability preservation",
      text:
        "Five months in, what's something about Hakai's way of doing C&I " +
        "work that you really hope SkyFire doesn't accidentally erase as " +
        "integration completes?",
      why:
        "Surfaces what to protect in playbook design. Acquisitions often kill the thing that made the acquired company worth buying.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "Where do you feel the standardization pressure first?", when: "Default; Branch 2 anchors here if Q2 surfaced clear rubric." },
        { id: "alt_1", text: "What's a SkyFire-side practice you'd want to push back on?", when: "If Jason mentions friction." },
        { id: "alt_2", text: "Where is Dave's instinct on this different from yours?", when: "If Jason mentions CEO-level alignment." },
      ],
      substantive_markers:
        "Named practice or rhythm (customer-relationship style, deal-size approach, technical-fit posture, walk-away criteria), specific standardization pressure felt, named divergence with Dave's instinct.",
      thin_markers:
        '"the culture" / "the way we did things" / "the Hakai feel" / generic preservation-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "JASON_Q4",
      priority: "P0",
      title: "BC market intel: buyers and segments",
      text:
        "The BC coastal C&I market — wilderness lodging, First Nations " +
        "communities, Vancouver Island industrial, the Victoria pipeline " +
        "Dave called challenging. Who are the buyers and segments SkyFire " +
        "doesn't know yet that you do?",
      why:
        "Captures market intelligence held only in Jason's head. BC capability acquired through Hakai is undeployed in SkyFire-side sales motion.",
      constraints_tested: ["C5"],
      probes: [
        { id: "primary", text: "What makes Victoria different from the rest of the Island?", when: "Default." },
        { id: "alt_1", text: "Where is the First Nations procurement pipeline this year?", when: "If Jason names FN segments." },
        { id: "alt_2", text: "Who at Hakai used to own those relationships and where are they now?", when: "If Jason names former-Hakai relationships." },
      ],
      substantive_markers:
        "Named segments, named buyer types, named geographies more granular than 'BC coastal', named relationships, specific procurement timing or pipeline activity.",
      thin_markers:
        '"lots of opportunity over there" / "the Island is different" / "First Nations work generally" / generic regional-language.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "JASON_Q5",
      priority: "P1",
      title: "Hakai-side hidden truth",
      text:
        "What's working in the Hakai-side sales motion right now that's " +
        "quietly producing results — and what's broken that nobody at " +
        "SkyFire HQ has visibility into yet?",
      why:
        "Surfaces hidden truth at the Hakai operational level. 'Nobody at HQ has visibility' gives Jason permission to name something difficult.",
      constraints_tested: ["C1", "C6"],
      probes: [
        { id: "primary", text: "Who at SkyFire-side does or should have visibility?", when: "Default; Branch 1 anchors here if Q1 surfaced named close-lost deals." },
        { id: "alt_1", text: "How long has the broken thing been broken?", when: "If Jason names a specific issue." },
        { id: "alt_2", text: "What would surface it cleanly to Dave?", when: "If Q1 surfaced named deals to close-lost." },
      ],
      substantive_markers:
        "Specific Hakai-side motion producing results (referral pattern, follow-up cadence, customer-relationship rhythm), specific broken thing with named consequence, named SkyFire-side person who should have visibility.",
      thin_markers:
        '"we\'re working through it" / "nothing too dramatic" / generic motion-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
  ],
  closing: {
    id: "JASON_CLOSE",
    text:
      "If you could fix one thing about how SkyFire wins (or doesn't win) " +
      "BC C&I deals — one thing — what would you change, and what would " +
      "change downstream?",
  },
  branching_rules: `Branch 1 — Q1 → Q5: IF Q1 surfaces named deals to close-lost today, THEN Q5 probe-down defaults to "What would surface it cleanly to Dave?"

Branch 2 — Q2 → Q3: IF Q2 surfaces clear pre-acquisition C&I rubric, THEN Q3 probe-down defaults to "Where do you feel the standardization pressure first?"

Branch 3 — Q4 → Q5: IF Q4 surfaces specific named buyers/segments, THEN Q5 framing shifts toward "what produces this list today and what doesn't."

Branch 4 — Time pressure trim: IF end-of-Q3 > 10:00, skip Q5 probe. IF end-of-Q4 > 13:00, skip Q5 entirely; flag synthesis.`,
  voice_register_notes: `Pace: Medium-to-fast. Jason was direct at May 4 kickoff. He'll talk. Long answers signal depth.

Anchor language: "Three feet apart" (his May 4 framing) / "Hakai-side" and "SkyFire-side" parallel / "The Island" / "Five months and four days". Mirror when natural.

Energized by: BC coastal C&I, pre-acquisition Hakai operating reality, personal customer relationships, where SkyFire-side does not yet see something happening on Hakai-side.

Hedges or closes down on: Acquisition financial terms, his own compensation/earn-out, direct critique of Dave or David Kelly strategic decisions, personnel evaluation of SkyFire-side operators.`,
  watch_outs: `1. Hakai-vs-SkyFire framing sensitivity — NEVER frame integration as "absorbing Hakai" or "Hakai being integrated into SkyFire." Use parallel framings. Q2 explicitly uses "before SkyFire bought you" as factual timeline marker.
2. May probe Aperture itself (May 4 fit-assessment pattern) — FAQ in A1 §7 handles standard probes; outside FAQ, A1 §7 Joey-escalation pattern.
3. Financial topics about acquisition (sale price, earn-out, integration costs) — OUT OF SCOPE. A1 §2d verbatim redirect.
4. May 4 kickoff debrief — warm references his fit-assessment question; acknowledge, treat as warm-level signal, move to Q1. Do NOT extend into meta-conversation.
5. Contradiction with Known Knowns (most likely: named deals on Hakai BC stall pool, his time-mark) — log CONTRADICTION_FLAG, do NOT correct. Jason is ground-truth source on Hakai BC deal status.
6. Hunter recruitment scope — Greg and Jason jointly run shortlist. Acknowledge tracking with Joey, re-anchor. Do NOT engage on candidate evaluation.`,
  trim_sequence: [
    "JASON_Q5",
    "JASON_Q3_probe",
    "JASON_Q1_probe",
    "JASON_Q4_probe",
  ],
};
