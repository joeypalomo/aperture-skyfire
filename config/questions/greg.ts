// Greg Sauer — Tier 1 — 18-minute target intake (the deepest single
// intake in the cohort).
// Source: Phase 2 Artifact 3 §§ Greg Sauer (full flow). 8 questions
// (Q1-Q7 P0, Q8 P1). Primary text verbatim per A3 §C.

import type { IntervieweeQuestionLibrary } from "./types";

export const gregLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "greg_sauer",
  warm: {
    id: "WARM_GREG",
    text:
      "Quick anchor before the registry, Greg. May 8 audit, your seat: 301 " +
      "open deals on your plate, 90 days of activity at 192 calls against " +
      "3,084 emails. From where you sit — what does that email-to-call " +
      "ratio actually tell us about the work you've been doing?",
    target_seconds: 60,
    expected_shape:
      "Greg likely reads the ratio one of three ways — deliberate high-funnel cadence (intentional), structural reality of the seat (he's the relay point), or default behavior he hasn't examined (concerning).",
  },
  questions: [
    {
      id: "GREG_Q1",
      priority: "P0",
      title: "The transferable 301",
      text:
        "Of the 301 open deals on your plate — what's your gut on how " +
        "many you'd transfer to a teammate this week if you had a clean " +
        "way to do it? And what makes the clean way unclean today?",
      why:
        "Tests the single-threading constraint directly. The number defines how much of 301 is institutional weight vs. relationship ownership. The 'what makes it unclean' surfaces whether the blocker is process, system, or rep readiness.",
      constraints_tested: ["C3"],
      probes: [
        {
          id: "primary",
          text: "Which teammate would you transfer to first, and on which deal?",
          when: "Default — drives specificity.",
        },
        {
          id: "alt_1",
          text: "Have you tried to hand any off in the last 30 days?",
          when: "If Greg names a high transfer count.",
        },
        {
          id: "alt_2",
          text:
            "What would the receiving rep need from you to make the handoff land?",
          when: "If Greg names a structural blocker.",
        },
      ],
      substantive_markers:
        "Specific number (or range with logic), named teammate (Bryce, Rob Silver, Colin, incoming Hunter), specific blocker (process, system field, rep skill, relationship lock), specific deal he'd transfer first.",
      thin_markers:
        '"depends" / "a lot" / "most of them" without specifics / "I\'d have to look at the list" / deflection to Hunter timeline.',
      time_estimate_seconds: { primary: 100, with_probe: 130 },
    },
    {
      id: "GREG_Q2",
      priority: "P0",
      title: "The deal he said no to",
      text:
        "Walk me through the last C&I deal you said no to before it " +
        "reached estimating. What signaled it was wrong? At what stage " +
        "did you recognize it?",
      why:
        "Tests whether Greg has an internal qualification rubric not yet documented. The playbook can codify what he already does in his head.",
      constraints_tested: ["C2"],
      probes: [
        {
          id: "primary",
          text: "What would the system have had to show you to flag it earlier?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text: "Has Daniel Yen ever flagged a deal to you that you shouldn't have qualified?",
          when: "If Greg names estimating-side awareness.",
        },
        {
          id: "alt_2",
          text:
            "Of the 1,099 closed-lost deals in the last 12 months, what share would you say got to estimating before being killed?",
          when: "If Greg engages on system-level qualification logic.",
        },
      ],
      substantive_markers:
        "Specific deal/customer name, specific trigger (segment, geography, contact role, project size, timeline), specific stage of recognition, specific signal pattern.",
      thin_markers:
        '"you just know" / "intuition" / "I have a feel for it" / "the team can usually tell" / generic experience-language.',
      time_estimate_seconds: { primary: 130, with_probe: 165 },
    },
    {
      id: "GREG_Q3",
      priority: "P0",
      title: "The three-segment bet",
      text:
        "Forget the sixteen-segment list for a moment. If you had to bet " +
        "year-one C&I revenue on three segments — not five, three — which " +
        "three, and what makes you certain about those three over the " +
        "others?",
      why:
        "Surfaces Greg's unstated priority ranking. The Feb 24 brief named 16 segments; the operating bet is almost certainly narrower. Month 2 ICP work concentrates on what Greg names here.",
      constraints_tested: ["C5"],
      probes: [
        {
          id: "primary",
          text: "And of the remaining thirteen, which one would you sacrifice first?",
          when: "Default — forces sacrifice discipline.",
        },
        {
          id: "alt_1",
          text: "Where does the Hakai BC capability shift the bet?",
          when: "If Greg names BC-coastal segments.",
        },
        {
          id: "alt_2",
          text: "Where is the Hunter recruit's network going to push this list?",
          when: "If Greg names segments that imply Hunter capability gaps.",
        },
      ],
      substantive_markers:
        "Three named segments (from the 16), ranking logic between them, specific certainty driver (deal flow, win-rate experience, capability fit, market timing).",
      thin_markers:
        '"all of them have potential" / "depends on the year" / "hard to pick three" / "we\'d lose if we narrowed" / refusal to prioritize.',
      time_estimate_seconds: { primary: 100, with_probe: 125 },
    },
    {
      id: "GREG_Q4",
      priority: "P0",
      title: "Lead-source ground truth",
      text:
        "On the lead-source side — of the C&I deals you're working " +
        "today, what's the actual mix? Outbound, inbound, referral, " +
        "paid? Where are the real opportunities coming from at SkyFire?",
      why:
        "Tests the marketing-to-sales attribution loop from Greg's operating seat. GA4 reports zero qualified leads across 20 weeks of 2026; Greg's answer is the truth check on whether marketing is contributing at all.",
      constraints_tested: ["C7"],
      probes: [
        {
          id: "primary",
          text:
            "Has a Stingray-sourced lead ever turned into a closed-won C&I deal that you know of?",
          when: "Default — the explicit attribution probe.",
        },
        {
          id: "alt_1",
          text: "Where do utility-partner referrals sit in the mix?",
          when: "If Greg names referrals as primary source.",
        },
        {
          id: "alt_2",
          text:
            "If marketing produced one more lead a week, what kind of lead would actually move your number?",
          when: "If Q3 segments already named — to avoid duplicating.",
        },
      ],
      substantive_markers:
        "Specific percentages or rough ratios, named lead sources (utility-partner referrals, Greg's network, Stingray, organic), named lead source he trusts most, named lead source he discounts.",
      thin_markers:
        '"all of the above" / "varies a lot" / "mostly relationships" without specifics / deflection to Stacy or Amanda.',
      time_estimate_seconds: { primary: 75, with_probe: 95 },
    },
    {
      id: "GREG_Q5",
      priority: "P0",
      title: "The Hunter's day one",
      text:
        "When you imagine handing the Hunter their first ninety days, " +
        "what do you want them to NOT have to figure out from scratch? " +
        "What do you wish you'd had on day one when you stepped into " +
        "this seat?",
      why:
        "Surfaces institutional knowledge gap directly — what Greg currently carries that should be in the playbook so the Hunter doesn't have to re-learn it.",
      constraints_tested: ["C3"],
      probes: [
        {
          id: "primary",
          text: "Where would you spend their first week — on the road or at HQ?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text: "Which deals would you let them touch and which would you protect?",
          when: "If Q1 high transfer count surfaced — protected per Branch 3.",
        },
        {
          id: "alt_2",
          text:
            "What's the comp structure conversation you want to have with Joey before the offer goes out?",
          when: "Comp specific — may land thin; accept and flag.",
        },
      ],
      substantive_markers:
        "Specific institutional knowledge gap (named systems, named processes, named accounts/segments, named relationships), specific first-week plan, specific deal-protection logic, named comp question.",
      thin_markers:
        '"the basics" / "the SkyFire way" / "team intro stuff" / "ramp them up gradually" / generic onboarding-language.',
      time_estimate_seconds: { primary: 100, with_probe: 130 },
    },
    {
      id: "GREG_Q6",
      priority: "P0",
      title: "Hakai BC stall pool",
      text:
        "The $20–30M+ stalled in the Hakai BC 40% Qualified stage — Calgary " +
        "Stampede Big Four, Garibaldi Glass, Precon, DIRTT, the rest. Of " +
        "that pool, how many would you personally close-lost today if " +
        "asked? What's stopping you?",
      why:
        "Tests Constraint #6 directly. The 'what's stopping you' answer is the diagnostic — data ownership, customer-relationship preservation, hope, or process inertia.",
      constraints_tested: ["C6"],
      probes: [
        {
          id: "primary",
          text: "Of those named deals, which one is most live?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text: "What would Jason say about that list?",
          when: "If Greg defers ownership.",
        },
        {
          id: "alt_2",
          text: "How would you want a disqualification protocol to handle these?",
          when: "If Greg engages on the close-lost logic itself.",
        },
      ],
      substantive_markers:
        "Specific number (close-lost count or dollar), named deal still believed in (with reasoning), named blocker (data, relationship, customer-side timeline, process), named adjudicator (Jason, Rob MacInnis).",
      thin_markers:
        '"Jason owns those" / "we\'re still working through them" / "depends on each one" / "hard to say without the list in front of me" / deflection to future review.',
      time_estimate_seconds: { primary: 100, with_probe: 130 },
    },
    {
      id: "GREG_Q7",
      priority: "P0",
      title: "May 29 test",
      text:
        "When 'actionable quickly' lands in your inbox on May 29 with the " +
        "Month 1 Current-State Assessment — what's the test you'll apply " +
        "to know it actually was?",
      why:
        "Mirrors Greg's own language (his Feb 24 brief anchor). Surfaces his unstated definition of 'done' for the May 29 milestone.",
      constraints_tested: ["META"],
      probes: [
        {
          id: "primary",
          text: "Who else has to read it and feel the same way?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text:
            "What's the worst version of it look like — what would tell you we got it wrong?",
          when: "If Q6 named high close-lost on Hakai pool — per Branch 4.",
        },
        {
          id: "alt_2",
          text: "Should it be a document, a deck, or something else?",
          when: "If Greg engages on format vs. content.",
        },
      ],
      substantive_markers:
        "Specific success criterion (use it Monday, hand to a rep, share with Dave, send to the board), named second reader (Dave, Jason, Landon), specific format expectation, specific failure mode.",
      thin_markers:
        '"we\'ll know when we see it" / "good content" / "trust your judgment" / "whatever you produce will be useful" / generic affirmation.',
      time_estimate_seconds: { primary: 80, with_probe: 100 },
    },
    {
      id: "GREG_Q8",
      priority: "P1",
      title: "Dave intelligence",
      text:
        "What's something I should know about Dave that you don't think " +
        "shows up in the formal documents — about how he makes decisions, " +
        "where he gets stuck, what he protects?",
      why:
        "Surfaces CEO-relationship intelligence only Greg can provide. Calibrates Joey's CEO-to-CEO communication for post-Month-1 cadence. Asked late when trust has built.",
      constraints_tested: ["STAKEHOLDER"],
      probes: [
        {
          id: "primary",
          text: "What's a topic he'd want me to bring to him directly, versus through you?",
          when: "Default — gives Greg respectful path back in if hedging.",
        },
        {
          id: "alt_1",
          text: "Where do you and he see the C&I priority differently?",
          when: "If Greg surfaces priority divergence.",
        },
        {
          id: "alt_2",
          text: "What's the question he hasn't asked yet that he should?",
          when: "If Greg engages on Dave's blind spots.",
        },
      ],
      substantive_markers:
        "Specific decision-making pattern, specific topic Dave protects, specific operating style (deliberate, fast, deferential), specific divergence between Greg's and Dave's reads.",
      thin_markers:
        '"he\'s straightforward" / "good guy, easy to work with" / "we\'re aligned" / generic deflection avoiding direct CEO comment.',
      time_estimate_seconds: { primary: 100, with_probe: 130 },
    },
  ],
  closing: {
    id: "GREG_CLOSE",
    text:
      "What's the one fix that, if it landed by August 31, would make you " +
      "confident the engagement was worth more than the four months — " +
      "meaning year-two is already a conversation we're both ready to have?",
  },
  branching_rules: `Branch 1 — Q2 → Q5 rubric-handoff: IF Greg's Q2 reveals an internal qualification rubric, THEN Q5's probe-down defaults to "Which deals would you let them touch and which would you protect?"

Branch 2 — Q3 → Q4 probe trim: IF Greg names specific segments in Q3, THEN Q4's probe-down skips the "If marketing produced one more lead a week" variant. Default to Stingray probe or utility-partner probe.

Branch 3 — Q1 → Q5 weight: IF Greg's Q1 transfer count is high (200+ of 301), THEN Q5 is structurally critical (Hunter is the relief valve). Q5 probe-down protected even under budget pressure.

Branch 4 — Q6 → Q7 framing: IF Greg's Q6 produces high close-lost count on Hakai pool, THEN Q7's probe-down defaults to "What's the worst version of it look like — what would tell you we got it wrong?"

Branch 5 — Time pressure trim: IF end-of-Q5 > 13:00, skip Q8 entirely (flag synthesis). IF end-of-Q6 > 16:30, deliver Q7 with no probe.`,
  voice_register_notes: `Pace: Medium. Greg thinks while he talks; long answers signal depth. A four-minute answer to Q2 or Q5 is signal — let it run.

Anchor language Greg uses: "Actionable quickly" / "Not a strategy document for a shelf" / "Feasibility and fit" / "The right project for the right customer" / "Business-minded clean energy". Mirror when natural; do NOT echo as probe-down setup.

Energized by: Segment strategy and customer fit, Hunter recruitment, Hakai BC deal-flow layer, process discipline, Indigenous Canada / First Nations work, anti-greenwashing.

Hedges or closes down on: Direct commentary on Dave's decision-making (Q8 invites this; if hedges accept thin), compensation specifics for individual operators, marketing-leadership scoping (OUT OF SCOPE), critique of specific reps by name.`,
  watch_outs: `1. May 8 audit status-check — acknowledge progress is tracked with Joey; do NOT litigate progress.
2. Marketing-leadership scope expansion (Stacy / Amanda / marketing VP search) — Stingray probe in Q4 is the ONLY allowed marketing reference; outside that, A1 §2d redirect.
3. Live engagement-scope negotiation ("What if we added X to Month 2?") — A1 §7 Joey-escalation pattern.
4. Critique of specific operators by name (Bryce, Rob Silver, Colin) — acknowledge with two words, log, do NOT probe.
5. Testing Aperture's depth — answer from FAQ when applicable; if Aperture doesn't have the fact, honest answer: "Not something I have in front of me right now — I'll flag it for Joey. Coming back to the question…"
6. Q8 hedging — Greg may pull back from commenting on Dave. Probe-down primary respects political reality. If still hedges, accept thin; the reluctance is signal.
7. Contradictions with Known Knowns (301-deal count, email-to-call ratio, closed-lost number, Stacy's status) — log CONTRADICTION_FLAG, do NOT correct in moment.`,
  trim_sequence: [
    "GREG_Q8",
    "GREG_Q5_probe",
    "GREG_Q7_probe",
    "GREG_Q3_probe",
    "GREG_Q1_probe",
  ],
};
