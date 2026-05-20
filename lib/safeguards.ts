// Stacy hard interrupt — the central architectural defense from
// A7 §XIV. Fires BEFORE any other response generation when Stacy
// drifts into marketing-strategy territory.
//
// Per A7 Decision 6: hard interrupt at the inference layer, not a
// post-hoc correction. The verbatim re-anchor replaces what Opus
// would have said for this turn; Aperture transitions cleanly to
// the next registry question.
//
// Hybrid detection mechanism (per Step 6 architecture decision):
//   1. Keyword/regex scan first — instant, deterministic. Catches
//      named vendors, common marketing-strategy terms, the website
//      project, marketing-team hiring, Amanda Schewaga.
//   2. If keyword doesn't fire, Haiku 4.5 classifier as backup —
//      catches phrasing variations the keyword list misses.
//   3. If either signals drift, return the verbatim re-anchor.

import {
  getAnthropicClient,
  APERTURE_EXTRACTION_MODEL,
} from "@/lib/anthropic";

const VERBATIM_RE_ANCHOR =
  "That's helpful — and probably a conversation Joey wants to have " +
  "directly. For today I'm focused on the sales-side questions.";

// Keyword + regex set covering A7 §XIV Stacy hard rules. All matches
// are case-insensitive against word boundaries where applicable.
const MARKETING_DRIFT_PATTERNS: RegExp[] = [
  // Named vendors
  /\bstingray\b/i,
  /\bstingray connect\b/i,
  // Ad spend / paid media
  /\bad spend(ing)?\b/i,
  /\bpaid (social|search|media|ads)\b/i,
  /\bagency (relationship|fee|retainer|contract)\b/i,
  /\bcampaign (performance|mix|spend|tracker)\b/i,
  // Brand / content / website strategy
  /\bbrand (work|strategy|equity|positioning|guidelines)\b/i,
  /\bcontent (strategy|calendar|production)\b/i,
  /\bthe website (project|build|redesign)\b/i,
  /\bwebsite (project|redesign|relaunch)\b/i,
  // Marketing team / hiring
  /\bmarketing (team structure|team hire|hiring|hire|director|vp|leadership)\b/i,
  /\bmarketing (manager|coordinator) (hire|hiring|search|replacement)\b/i,
  /\bamanda schewaga\b/i,
  /\bamanda\b.{0,40}\b(replac|resign|status|departed|left)/i,
  // Channel mix / strategy
  /\bchannel mix\b/i,
  /\bmarketing strategy\b/i,
  /\bmarketing operations strategy\b/i,
];

export interface SafeguardCheck {
  /** True if the interviewee message tripped a safeguard. */
  triggered: boolean;
  /** Verbatim re-anchor text to deliver in place of Opus's reply. */
  reAnchorText: string;
  /** Which mechanism detected the drift — kept for logging/synthesis. */
  detectedBy: "keyword" | "classifier" | null;
  /** Specific pattern or classifier reason — for synthesis flag. */
  matchedSignal: string | null;
}

/**
 * Determine whether a Stacy interviewee turn warrants the hard
 * interrupt. Runs keyword check first (instant); if no match,
 * optionally runs Haiku classifier (configurable). Returns the
 * verbatim re-anchor text plus detection metadata.
 *
 * Non-Stacy interviewees: caller should not invoke this. The hard
 * interrupt is a per-interviewee safeguard per A7 §XIV.
 */
export async function checkStacyHardInterrupt(
  intervieweeText: string,
  options: { useClassifier?: boolean } = { useClassifier: true },
): Promise<SafeguardCheck> {
  // Layer 1 — keyword/regex scan.
  for (const pattern of MARKETING_DRIFT_PATTERNS) {
    const match = pattern.exec(intervieweeText);
    if (match) {
      return {
        triggered: true,
        reAnchorText: VERBATIM_RE_ANCHOR,
        detectedBy: "keyword",
        matchedSignal: match[0],
      };
    }
  }

  // Layer 2 — Haiku classifier fallback.
  if (options.useClassifier !== false) {
    const classifierTriggered = await runDriftClassifier(intervieweeText);
    if (classifierTriggered.triggered) {
      return {
        triggered: true,
        reAnchorText: VERBATIM_RE_ANCHOR,
        detectedBy: "classifier",
        matchedSignal: classifierTriggered.reason,
      };
    }
  }

  return {
    triggered: false,
    reAnchorText: VERBATIM_RE_ANCHOR,
    detectedBy: null,
    matchedSignal: null,
  };
}

const CLASSIFIER_SYSTEM_PROMPT = `You are a lane-discipline classifier for the Aperture intake agent. Read the interviewee's message and decide whether it drifts into MARKETING-STRATEGY territory. Aperture is talking to Stacy Haakonson, VP RevOps. Her intake is locked to the SALES-PROCESS lane only. Marketing-strategy drift includes:

- Named marketing vendors or agencies (Stingray, any other)
- Ad spend, paid social, paid search, channel mix
- Brand work, content strategy, website project / redesign
- Marketing team structure, hiring, leadership transition
- Amanda Schewaga's status, role, or replacement
- Marketing operations strategy (not the sales-handoff side)
- Campaign performance evaluation

NOT drift — these stay in the sales lane:
- Lead handoff from marketing to sales (process)
- Closed-loop reporting from sales back to marketing (process)
- Whether marketing-sourced leads convert (sales-side outcome)
- Win-rate signal across C&I segments (RevOps cross-cut)
- HubSpot stage architecture, deal records, lead source field (RevOps)

Return ONLY a JSON object: {"triggered": true|false, "reason": "<short phrase if triggered, empty if not>"}

If unsure, return triggered=false. False negatives are recoverable in synthesis; false positives interrupt a clean answer.`;

interface ClassifierResult {
  triggered: boolean;
  reason: string;
}

async function runDriftClassifier(
  intervieweeText: string,
): Promise<ClassifierResult> {
  const anthropic = getAnthropicClient();
  try {
    const response = await anthropic.messages.create({
      model: APERTURE_EXTRACTION_MODEL,
      max_tokens: 256,
      system: CLASSIFIER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: intervieweeText }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { triggered: false, reason: "" };
    }
    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const parsed = JSON.parse(raw) as Partial<ClassifierResult>;
    return {
      triggered: parsed.triggered === true,
      reason:
        typeof parsed.reason === "string"
          ? parsed.reason.slice(0, 200)
          : "",
    };
  } catch (err) {
    console.warn(
      "[safeguards] classifier failed (treating as no drift):",
      err instanceof Error ? err.message : String(err),
    );
    return { triggered: false, reason: "" };
  }
}
