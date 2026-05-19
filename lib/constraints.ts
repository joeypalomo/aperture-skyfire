// The seven validated SkyFire constraints from Phase 1 Artifact 3
// (Constraint Hypothesis). Pre-intake confidence baselines per A3.
// Each constraint is what the intake is trying to validate / refute
// through evidence the interviewee surfaces.
//
// Used by:
//  - The Haiku scoring pipeline (lib/scoring.ts) — model picks
//    constraint_tested from this enumeration per turn.
//  - The synthesis pipeline (Step 8) — pre/post confidence diff per
//    constraint surfaces in the email body and synthesis appendix.

import type { Database } from "@/types/db";

export type ConstraintId = Database["public"]["Enums"]["constraint_id"];

export interface ConstraintDef {
  id: ConstraintId;
  shortName: string;
  oneLineHypothesis: string;
  preIntakeConfidence: "HIGH" | "MEDIUM-HIGH" | "MEDIUM" | "LOW";
  // Compact evidence summary for the scoring prompt
  evidence: string;
}

export const CONSTRAINTS: ConstraintDef[] = [
  {
    id: "C1",
    shortName: "CRM truth loop broken",
    oneLineHypothesis:
      "The HubSpot system is paid for, structurally distorted, and not fed, which keeps it broken — a self-reinforcing trust loop.",
    preIntakeConfidence: "HIGH",
    evidence:
      "0 of 41,938 contacts ever enrolled in a sequence; 94% of open deals untouched in 30 days; 0.16 activities/deal/week vs. C&I benchmark 5–8; Greg: 'we're paying for something we're not using'; Dave: 'we know this data is garbage right now.'",
  },
  {
    id: "C2",
    shortName: "First-contact qualification gate missing",
    oneLineHypothesis:
      "Deals reach estimating that should have been disqualified at first conversation; no qualification gate before estimating fires.",
    preIntakeConfidence: "HIGH",
    evidence:
      "1,099 closed-lost vs. 534 closed-won in 12 months (2.06:1 ratio); deals routinely jump from 10% directly to 40% bypassing the 20% Engaged stage; no Site Assessed stage exists; May 11 reorg frustrations tab: 'estimating team stretched thin, often tasked with unqualified work.'",
  },
  {
    id: "C3",
    shortName: "Greg single-threaded",
    oneLineHypothesis:
      "Greg is the bottleneck for every commercial deal — origination, qualification, and execution all sit with him.",
    preIntakeConfidence: "HIGH",
    evidence:
      "Greg owns 301 open deals; 90-day activity 192 calls + 3,084 emails + 7 tasks (440:1 email-to-task ratio); 112 of his deals (37%) untouched 30 days; May 11 reorg explicitly names 'consulting siloed w/ Greg.'",
  },
  {
    id: "C4",
    shortName: "Forecast probabilities residential-era",
    oneLineHypothesis:
      "Stage probabilities are mathematically wrong and structurally overstate pipeline by $5–12M per quarter.",
    preIntakeConfidence: "HIGH",
    evidence:
      "Utility-Scale 50% configured vs. 3–8% actual RFP win rate (25–35 pts overstated); Hakai BC 60% configured vs. 30–35% actual conversion; Dave runs a manual quarterly polling cycle because he can't trust the HubSpot number; $5–12M/qtr forecast overstatement quantified in May 8 audit.",
  },
  {
    id: "C5",
    shortName: "Segments untagged",
    oneLineHypothesis:
      "96.3% of accounts have no segment tag — the 16 named C&I segments are marketing language, not operating intelligence.",
    preIntakeConfidence: "HIGH",
    evidence:
      "96.3% of 18,853 companies have no industry tag; segment-level win rate, deal velocity, pipeline coverage cannot be reported today; SkyFire's $12.15M 2026 C&I target is split geographically (YYC/YEG/YLW), not by segment; only 4 of 15+ segments have GA4 audiences configured.",
  },
  {
    id: "C6",
    shortName: "Hakai BC stalled pool",
    oneLineHypothesis:
      "$20–30M+ of Hakai BC pipeline is stalled 8–16 months at the 40% Qualified stage — a qualification problem, not an integration problem.",
    preIntakeConfidence: "HIGH",
    evidence:
      "Hakai BC pipeline (ID 667712064) 40% Qualified stage holds $20–30M+; named inventory: Calgary Stampede Big Four ($888K, 14mo), Precon Manufacturing ($826K, 16mo), DIRTT ($635K, 14mo), Garibaldi Glass ($2M, 10mo), Allen Town ($1M, 8mo), Westfine Meats ($1.2M, 5mo), Bonnybrook ($505K), City of Airdrie Twin Arenas ($650K, 14mo); pre-acquisition Hakai had no documented qualification discipline (Jason May 4).",
  },
  {
    id: "C7",
    shortName: "Marketing-to-sales attribution loop broken",
    oneLineHypothesis:
      "Paid social converts at 0.11% while the qualified-leads metric reads zero every week — the attribution loop has no feedback.",
    preIntakeConfidence: "MEDIUM-HIGH",
    evidence:
      "GA4 Jan 1–May 16: Paid Other channel (overwhelmingly paid_social_stingray) — 6,467 sessions, 7 key events, 0.11% rate; same window Organic Search 8,187 sessions, 1,048 key events, 12.80%; Qualified leads + Converted leads GA4 metrics read 0 across all 20 weeks of 2026 YTD; Stingray monthly spend unknown — requires intake validation.",
  },
];

export function getConstraintById(id: ConstraintId): ConstraintDef | undefined {
  return CONSTRAINTS.find((c) => c.id === id);
}

/**
 * Compact, scorer-friendly catalog of C1–C7 for inclusion in the
 * Haiku scoring prompt. Format prioritizes scan-readability over
 * prose since the model only needs the keys to choose between.
 */
export function constraintCatalogForScoring(): string {
  return CONSTRAINTS.map(
    (c) =>
      `${c.id} (${c.shortName}, pre-intake ${c.preIntakeConfidence}): ${c.oneLineHypothesis}\n  Evidence: ${c.evidence}`,
  ).join("\n\n");
}
