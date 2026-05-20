// Curtis Buxton — Tier 2 — 15-minute target intake (TIGHTEST budget).
// Source: Phase 2 Artifact 4 §§ Curtis Buxton.

import type { IntervieweeQuestionLibrary } from "./types";

export const curtisLibrary: IntervieweeQuestionLibrary = {
  interviewee_id: "curtis_buxton",
  warm: {
    id: "WARM_CURTIS",
    text:
      "Quick anchor before the registry, Curtis. v7.4.9 of the Estimate " +
      "Quotation Template — 88 sheets, six finance models, NREL PVWatts " +
      "integration, custom permit tables. What did v7.4.9 fix that v7.4.8 " +
      "couldn't, and what did you choose not to fix this round?",
    target_seconds: 60,
    expected_shape:
      "Specific bug or feature added in v7.4.9 with reasoning, or roadmap item he deliberately deferred. Both calibrate how agent reads Q2 (almost-does) and Q4 (one AI agent) responses.",
  },
  questions: [
    {
      id: "CURTIS_Q1",
      priority: "P0",
      title: "30-day action hardest delivery",
      text:
        "The five 30-day actions land between May 14 and June 5. Which one " +
        "is genuinely the hardest to deliver on time, and what's the " +
        "failure mode you're worried about?",
      why:
        "Tests feasibility from execution seat. Protects engagement from a missed milestone the team cannot recover from.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "What would need to happen by next Friday for it to land on time?", when: "Default." },
        { id: "alt_1", text: "Where is James McPhail's involvement non-negotiable?", when: "If Curtis names a specific action." },
        { id: "alt_2", text: "What's the early warning sign that it's slipping?", when: "Forward-looking probe." },
      ],
      substantive_markers:
        "Named action (Stacy reassignment, Hakai BC team setup, Jason invite, segment field, stage probability), specific failure mode (data quality, system limit, dependency, capacity), named blocker, specific time pressure.",
      thin_markers:
        '"they\'re all manageable" / "we\'ll get them done" / "depends" / generic execution-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "CURTIS_Q2",
      priority: "P0",
      title: "Latent capability: the step change unlock",
      text:
        "Estimate Quotation Template v7.4.9 — 88 sheets, six finance models, " +
        "NREL PVWatts integration, custom permit tables. What does the tool " +
        "almost do that it doesn't quite do today, and what would unlock " +
        "the step change?",
      why:
        "Surfaces latent capability inside Curtis's tool. The 'almost does' framing is where the highest-yield Month 4 AI agent integration likely lives.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "What was the trigger for v7.4.9 last week?", when: "Default." },
        { id: "alt_1", text: "Where does the tool break when a rep tries to use it solo without you?", when: "If Curtis mentions rep workflow." },
        { id: "alt_2", text: "What's the next feature you'd build if you had two days?", when: "If Curtis engages on roadmap." },
      ],
      substantive_markers:
        "Named latent capability (auto-fill from CRM, segment-specific pricing logic, AI-drafted scope language, automated sensitivity analysis), specific unlock mechanism, named technical dependency, specific user-friction with named operators.",
      thin_markers:
        '"it does a lot already" / "it\'s pretty solid" / "I\'m always tinkering" / generic tool-language.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "CURTIS_Q3",
      priority: "P0",
      title: "Data audit risks + Stingray attribution ground truth",
      text:
        "Two-part question. First: of the 25 to 30 properties to archive and " +
        "8 to 10 to rename, where do you expect the cleanup to surface ugly " +
        "surprises — what's the data you're afraid to look at? Second: on " +
        "attribution specifically — can you tell me today whether the " +
        "Stingray spend has ever produced a closed-won C&I deal?",
      why:
        "First half tests Constraint #1 data quality from someone who knows the schema. Second half tests Constraint #7 — Curtis is one of three people who can answer Stingray attribution from data, not opinion.",
      constraints_tested: ["C1", "C7"],
      probes: [
        { id: "primary", text: "Has anyone tried to close the lead-source attribution loop before?", when: "Default." },
        { id: "alt_1", text: "Where would the Stingray-to-deal trail live if it existed?", when: "If Curtis engages on Stingray." },
        { id: "alt_2", text: "What was the migration's worst day?", when: "If Curtis engages on migration-era contamination." },
      ],
      substantive_markers:
        "(First half) Named property he's afraid to audit, specific data quality pattern (orphaned records, duplicate companies, dead-deal stage drift), specific migration-era contamination. (Second half) Specific yes/no with reasoning, named gap in attribution chain.",
      thin_markers:
        '"it\'s all messy" without specifics / "I\'d have to look" / "no idea on Stingray" without engaging where to check / deflection to Stacy or future audit.',
      time_estimate_seconds: { primary: 120, with_probe: 150 },
    },
    {
      id: "CURTIS_Q4",
      priority: "P1",
      title: "First AI agent: highest-friction automation",
      text:
        "If I gave you budget for one AI agent inside HubSpot or the " +
        "proposal tool today — proposal drafter, ICP enrichment, call " +
        "summarization, segment scorer, something else — which one, and " +
        "why that one first?",
      why:
        "Curtis is the closest thing SkyFire has to a tech-strategic owner. His answer reveals highest-friction workflow he'd automate first.",
      constraints_tested: ["FORWARD"],
      probes: [
        { id: "primary", text: "Why not the others?", when: "Default; Branch 2 anchors here if Q2 surfaced latent capabilities." },
        { id: "alt_1", text: "Where would the team push back?", when: "If Curtis names a specific agent type." },
        { id: "alt_2", text: "How long would you give it to prove out?", when: "If Curtis engages on sequencing." },
      ],
      substantive_markers:
        "Named agent type with reasoning, specific workflow he'd automate first, named user who would benefit, specific reason for sequencing.",
      thin_markers:
        '"any of them would help" / "I\'d need to think about it" / "depends on the budget" / generic AI-language without committing.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
    {
      id: "CURTIS_Q5",
      priority: "P1",
      title: "Curtis-James pair pattern",
      text:
        "James McPhail's role on this — where do you and James naturally " +
        "split the work, and where do you each get stuck without the other?",
      why:
        "Captures execution-capacity reality on SkyFire side. Tells playbook design where Joey's how-to guide needs to be self-sufficient.",
      constraints_tested: ["META"],
      probes: [
        { id: "primary", text: "Is anyone else inside SkyFire data-fluent enough to plug in?", when: "Default." },
        { id: "alt_1", text: "What does your week look like outside this engagement?", when: "If Curtis engages on capacity." },
        { id: "alt_2", text: "Where would Joey's guide need to be more granular for James to run alone?", when: "If Curtis names dependency on his presence." },
      ],
      substantive_markers:
        "Named split (Curtis on schema/architecture, James on programmatic execution, etc.), specific stuck-without-the-other pattern, named third operator who could plug in.",
      thin_markers:
        '"we work it out" / "we\'re flexible" / generic teaming-language.',
      time_estimate_seconds: { primary: 75, with_probe: 90 },
    },
    {
      id: "CURTIS_Q6",
      priority: "P1",
      title: "Strategic CRM architecture: move or integrate",
      text:
        "The proposal tool sits outside HubSpot today. The lift to move it " +
        "inside HubSpot versus keeping it where it lives and integrating — " +
        "what's your gut, and what's the operational reason you'd push the " +
        "other way?",
      why:
        "Strategic CRM architecture question. Determines whether Month 4 enhanced CRM build absorbs the proposal tool's logic or integrates with it.",
      constraints_tested: ["FORWARD"],
      probes: [
        { id: "primary", text: "Has anyone proposed moving it before?", when: "Default." },
        { id: "alt_1", text: "Where would the team revolt?", when: "If Curtis names a strong directional gut." },
        { id: "alt_2", text: "What's the version of integration that keeps the tool where it is but makes the data flow into HubSpot natively?", when: "If Curtis engages on hybrid options." },
      ],
      substantive_markers:
        "Clear gut answer (move it / keep it / hybrid), specific operational reasoning, named technical dependency, specific integration architecture.",
      thin_markers:
        '"depends on a lot of things" / "we could go either way" / "I\'d need to think about it" / generic architecture-language.',
      time_estimate_seconds: { primary: 95, with_probe: 120 },
    },
  ],
  closing: {
    id: "CURTIS_CLOSE",
    text:
      "If you could change one thing about how SkyFire's data infrastructure " +
      "supports the C&I sales motion — one thing — what would you change, " +
      "and what would change downstream?",
  },
  branching_rules: `Branch 1 — Q1 → Q5: IF Q1 surfaces 30-day action where James McPhail's involvement is non-negotiable, THEN Q5 framing tightens around stuck-without-the-other.

Branch 2 — Q2 → Q4: IF Q2 names specific latent capabilities, THEN Q4 probe-down defaults to "Why not the others?"

Branch 3 — Q3 → Q6: IF Q3 produces hard Stingray data (named yes/no), THEN Q6 framing shifts toward "given what the data shows about attribution today, where should the proposal tool actually live?"

Branch 4 — Execution-focused pattern: IF Curtis answers with "here's what I'm doing about that" rather than describing state, THEN deliver one-shot probe: "What's the read that's driving that?" or "What did you see that made that the move?"

Branch 5 — Time pressure trim (TIGHTEST in cohort): IF end-of-Q3 > 9:30, skip Q5 entirely. IF end-of-Q4 > 12:00, skip Q5 AND Q6 probe-down. IF end-of-Q4 > 13:00, skip Q5 AND Q6 entirely; transition to closing.`,
  voice_register_notes: `Pace: Fast. Curtis is execution-focused. He'll answer in technical specifics — version numbers, field names, sheet counts, integration points. Match the pace. Two-word acknowledgments.

Anchor language: "v7.4.9" / "HubSpot property" (schema term, not "field") / "The proposal tool" / "James" (first-name reference) / Specific HubSpot terminology ("pipeline," "stage," "deal record," "company record," "property type"). Mirror when natural.

Energized by: Proposal tool roadmap and things it almost does, AI integration opportunity, data architecture decisions (schema, integration patterns), migration history.

Hedges or closes down on: Vendor contracts by name (no-lane-violation safeguard) — OUT OF SCOPE except registry-named Stingray exception in Q3. Marketing technology spend specifically — OUT OF SCOPE. Critique of past architectural decisions by others. His own compensation, career path, hiring.`,
  watch_outs: `1. Execution-focused answer pattern — Curtis may describe action instead of state. Use Branch 4 one-shot probe to surface diagnosis underneath.
2. TIGHTEST budget in Tier 2 — Q5 (James McPhail split) is the documented trim. Respect trim sequence.
3. Vendor contracts by name — OUT OF SCOPE outside registry-named Stingray exception. A1 §2d verbatim redirect.
4. Marketing technology spend specifically — OUT OF SCOPE. Stingray Q3 is bypassed; if Curtis surfaces Stingray spend amounts, listen, capture, stop there. Do NOT extend into broader marketing-tech-spend evaluation.
5. Contradictions with Known Knowns (action ownership, 7,285 count, property cleanup numbers, version number) — log CONTRADICTION_FLAG, do NOT correct. Curtis is ground-truth source on technical state.
6. May want to schedule half-hour stage-rebuild session — acknowledge, route to Joey: "That's a good question for Joey directly — I'll flag it for him. Next question…"
7. May probe Aperture's depth from engineering angle — FAQ in A1 §7 handles standard probes; Joey-escalation pattern for architecture probes.`,
  trim_sequence: [
    "CURTIS_Q5",
    "CURTIS_Q6_probe",
    "CURTIS_Q4_probe",
    "CURTIS_Q2_probe",
  ],
};
