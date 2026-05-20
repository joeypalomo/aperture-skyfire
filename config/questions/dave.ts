// Dave Vonesch — Tier 1 — 14-minute target intake.
// Source: Phase 2 Artifact 3 §§ Dave Vonesch (full flow).
// Primary text verbatim per A3 §C. Probe-down alternates functionally
// verbatim — consolidated where A3 had redundant phrasings.

import type { IntervieweeQuestionLibrary } from "./types";

export const daveLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "dave_vonesch",
  warm: {
    id: "WARM_DAVE",
    text:
      "Quick anchor before we get into the questions, Dave. May 8 — your " +
      "words — you said you're running the year-forward forecast manually " +
      "right now, pulling each rep's expected-close list and putting " +
      "probability against each one by hand. What's that manual process " +
      "telling you about pipeline reality that the HubSpot report isn't?",
    target_seconds: 60,
    expected_shape:
      "Dave reads ratios — likely surfaces a divergence: pipeline overstated, the high-probability deals aren't the ones he expected, or rep-by-rep variance is wider than the report suggests.",
  },
  questions: [
    {
      id: "DAVE_Q1",
      priority: "P0",
      title: "Trust-gap dashboard read",
      text:
        "When you close out August 31 and you open the executive dashboard " +
        "Monday morning, what's the one number you want to be able to " +
        "trust that you can't trust today?",
      why:
        "Tests which Month 4 dashboard tile Dave weights most. Surfaces whether his real trust gap is forecast accuracy, segment visibility, or activity discipline.",
      constraints_tested: ["C1", "C4"],
      probes: [
        {
          id: "primary",
          text: "And what would you do differently the day you can trust it?",
          when: "Default — converts dashboard wish into operating consequence.",
        },
        {
          id: "alt_1",
          text: "How are you getting to that number today?",
          when: "If Dave names a specific metric without naming his workaround.",
        },
        {
          id: "alt_2",
          text: "Who else needs to be able to trust it for it to actually matter?",
          when: "If Dave names a metric without naming downstream consumers.",
        },
      ],
      substantive_markers:
        "Specific metric (forecast accuracy, qualified pipeline, win rate by segment, activity per deal), specific consequence (hiring, capacity, board conversation, capital allocation), specific time horizon.",
      thin_markers:
        '"all of it" / "trust generally" / "the data" / hypothetical without naming a metric / deflection to Greg or Stacy.',
      time_estimate_seconds: { primary: 90, with_probe: 120 },
    },
    {
      id: "DAVE_Q2",
      priority: "P0",
      title: "Hakai integration ground truth",
      text:
        "Five months into the Hakai integration. Where is the combined " +
        "company performing better than you projected — and where is the " +
        "operating reality different from what you closed on January 1?",
      why:
        "Tests Dave's CEO-level read on Hakai cultural and operational integration. Calibrates how aggressive Option C-style integration work needs to be.",
      constraints_tested: ["C6"],
      probes: [
        { id: "primary", text: "And what surprised you most?", when: "Default." },
        {
          id: "alt_1",
          text: "Where is Landon's read on this different from yours?",
          when: "If Dave answers at the strategic layer without operational detail.",
        },
        {
          id: "alt_2",
          text: "What's the integration question Jason can answer that you can't?",
          when: "If Dave acknowledges he's not in the field.",
        },
      ],
      substantive_markers:
        "Named regions (Vancouver Island, Kelowna, BC coastal), named operators (Jason, Landon, Rob MacInnis), specific dollar figures or capacity numbers, named segments, specific divergence between closing thesis and operating reality.",
      thin_markers:
        '"going well overall" / "some bumps, nothing major" / "we\'re learning" / "still early" / generic acquisition-stage language.',
      time_estimate_seconds: { primary: 110, with_probe: 150 },
    },
    {
      id: "DAVE_Q3",
      priority: "P0",
      title: "Engagement-risk early-warning",
      text:
        "Where in this four-month engagement do you see the highest risk " +
        "of us getting it wrong — what would tell you we were heading in " +
        "a direction you'd want to course-correct?",
      why:
        "Gives Dave a clean way to flag any held-back reservation. CEO-level risk read protects against late-stage scope friction.",
      constraints_tested: ["META"],
      probes: [
        {
          id: "primary",
          text: "What would the early warning sign look like?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text: "Has anyone inside expressed concern about anything we're doing?",
          when: "If Q2 surfaced internal friction; signals route to operator buy-in concerns.",
        },
        {
          id: "alt_2",
          text: "Where would you push back if I proposed something tomorrow?",
          when: "If Dave is reticent to flag risks directly.",
        },
      ],
      substantive_markers:
        "Named deliverable he's concerned about, named operator (Greg, Jason, Landon, Stacy) whose buy-in he's tracking, specific behavior change, specific scope boundary.",
      thin_markers:
        '"trust the process" / "we\'ll see how it goes" / "nothing major right now" / "you\'ve been good so far" / vague affirmation.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "DAVE_Q4",
      priority: "P0",
      title: "Real C&I revenue posture",
      text:
        "The C&I revenue target in your marketing strategy doc is $12.15M " +
        "— split YYC, YEG, YLW. Forget the number for a moment. What's the " +
        "C&I revenue posture you actually need by year-end for the rest of " +
        "the business to work?",
      why:
        "Tests whether stated $12.15M is operating reality or marketing-doc placeholder. The target Dave gives is the rubric residential-era forecast assumptions get rebuilt against.",
      constraints_tested: ["C4"],
      probes: [
        {
          id: "primary",
          text: "What's driving the urgency on that number specifically?",
          when: "Default.",
        },
        {
          id: "alt_1",
          text: "Where's the rest of the business pulling C&I toward?",
          when: "If Q1 surfaced forecast accuracy as the trust gap.",
        },
        {
          id: "alt_2",
          text: "How is the Hakai BC pipeline expected to contribute to that figure?",
          when: "If Dave references Hakai in his answer.",
        },
      ],
      substantive_markers:
        "Number different from $12.15M (or affirmation with reasoning), non-revenue framing (margin %, segment count, repeat rate, gross profit), specific business reason, divergence between marketing-doc and operating reality.",
      thin_markers:
        '"yeah, around that" / "the doc is right" / "we\'ll see what comes in" / "depends on the pipeline" / generic affirmation.',
      time_estimate_seconds: { primary: 90, with_probe: 120 },
    },
    {
      id: "DAVE_Q5",
      priority: "P1",
      title: "Role 18 months out",
      text:
        "Eighteen months from now, when the C&I engine is humming — what's " +
        "the role you don't have today that you know you'll need? And " +
        "what are you most worried we won't have set up by August 31 to " +
        "make that role land?",
      why:
        "Sets up Month 4 Growth Recommendations memo. Surfaces whether the priority hire after the Hunter is another C&I rep, sales engineer, marketing operator, or regional sales manager.",
      constraints_tested: ["FORWARD"],
      probes: [
        { id: "primary", text: "Why that role first?", when: "Default." },
        {
          id: "alt_1",
          text: "Where would they sit reporting-wise?",
          when: "If Q3 surfaced a specific deliverable concern.",
        },
        {
          id: "alt_2",
          text: "What's the comp ceiling on a role at that level here?",
          when: "If Dave is comfortable on comp specifics — likely to land thin; accept and flag.",
        },
      ],
      substantive_markers:
        "Named role/title, specific reporting line, specific gap the role closes, named risk, specific dollar/capability comp anchor.",
      thin_markers:
        '"more people generally" / "scaling up" / "depends where we land" / "too early to say" / deflection to Greg or Nicole.',
      time_estimate_seconds: { primary: 90, with_probe: 120 },
    },
  ],
  closing: {
    id: "DAVE_CLOSE",
    text:
      "Of all the operational changes this engagement could land between " +
      "now and August 31 — if just one landed, and only one, which would " +
      "matter most for the business and why?",
  },
  branching_rules: `Branch 1 — Q1 → Q4 calibration: IF Dave's Q1 answer names "forecast accuracy" or "pipeline reality" as the trust gap, THEN Q4's probe-down defaults to "Where's the rest of the business pulling C&I toward?"

Branch 2 — Q2 → Q3 internal-friction signal: IF Dave's Q2 surfaces friction with Jason or Landon by name, THEN Q3's probe-down defaults to "Has anyone inside expressed concern about anything we're doing?"

Branch 3 — Q3 → Q5 weight: IF Dave's Q3 names a specific deliverable concern, THEN Q5's probe-down defaults to "Where would they sit reporting-wise?"

Branch 4 — Time pressure trim: IF cumulative time end-of-Q4 > 11:30, skip Q5 probe-down. IF > 12:30, skip Q5 entirely; flag synthesis.`,
  voice_register_notes: `Pace: Deliberate. Dave uses pauses well — they are processing, not silence. Wait. If 15 seconds before he answers, that is the answer beginning; do not nudge.

Anchor language Dave uses: "Building energy for good" / "Garbage data" / "manual process right now" / "Twenty-five years worth of stuff" / "Energy for good". Mirror when natural; do NOT echo as probe-down setup.

Energized by: Capital allocation, long arc, Hakai strategic logic at acquisition layer, industry direction at CanREA-board layer, hiring/capacity decisions that compound, B Corp + ESOP + mission frame.

Hedges or closes down on: Operational specifics outside his lane (defers to Jason on BC field, Landon on delivery, Stacy on RevOps mechanics), personnel-evaluation questions, compensation specifics.`,
  watch_outs: `1. CEO-peer steering — may ask about Joey's other engagements / Aperture roadmap / eCTx. Use A1 §2d Joey-escalation redirect.
2. May 8 audit status-check — acknowledge progress is tracked with Joey; re-anchor to registry.
3. Marketing-leadership scoping (Stacy / Amanda / marketing VP search) — OUT OF SCOPE; A1 §2d redirect.
4. Deflection to Jason or Landon on Q2 — probe-down primary "And what surprised you most?" brings him back to his own seat. Second deflection: accept, flag in synthesis.
5. Drive curation reference (his "25 years worth of stuff" framing) — log for Joey, do NOT ask to expand.`,
  trim_sequence: [
    "DAVE_Q5_probe",
    "DAVE_Q3_probe",
    "DAVE_Q4_probe",
    "DAVE_Q5_primary",
  ],
};
