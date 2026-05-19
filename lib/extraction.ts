// Background Haiku 4.5 entity + number extractor. Fires after each
// interviewee turn (in parallel with the Opus 4.7 reply call) to
// populate messages.entities_mentioned and messages.numbers_mentioned.
//
// Per the Step 1 schema header: kept distinct from the Opus
// conversation thread so the conversation surface stays focused on
// conversation. Used downstream by:
//   - Layer 2 retrieval (lib/retrieval.ts) to match interviewee
//     mentions against the chunked BI Brief
//   - Cross-intake search at synthesis time (Step 8)

import {
  getAnthropicClient,
  APERTURE_EXTRACTION_MODEL,
} from "@/lib/anthropic";

export interface ExtractionResult {
  entities: string[];
  numbers: string[];
}

const SYSTEM_PROMPT = `You are an extraction worker for the Aperture intake agent. Read the interviewee's message and return ONLY a JSON object with two keys:

{
  "entities": [...],
  "numbers": [...]
}

entities = named accounts, customers, projects, people, products, vendors, segments, regions, or any noun phrase a Customer Relationship Management system would index. Examples: "Garibaldi Glass", "Greg Sauer", "Hakai BC", "Stingray", "Aircall", "REIT", "cold storage", "Calgary".

numbers = monetary figures, counts, percentages, durations, dates expressed numerically. Preserve the original formatting where possible. Examples: "$888K", "8,842", "0.11%", "14 months", "30-day", "May 8".

Rules:
- Return JSON only. No prose, no markdown fences, no explanation.
- Empty arrays are valid: {"entities": [], "numbers": []}.
- Deduplicate. Each entity / number appears at most once.
- Do NOT include common words, generic verbs, or pronouns.
- Do NOT extract from the agent's prior question if it's included as context — only from the interviewee's reply.`;

/**
 * Run extraction on a single interviewee turn. Returns lists of
 * entity strings and number strings. On parse failure, returns empty
 * arrays — failure to extract is non-fatal; the messages row simply
 * keeps its default empty arrays.
 */
export async function extractEntitiesAndNumbers(
  intervieweeText: string,
): Promise<ExtractionResult> {
  const anthropic = getAnthropicClient();

  try {
    const response = await anthropic.messages.create({
      model: APERTURE_EXTRACTION_MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: intervieweeText }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { entities: [], numbers: [] };
    }

    // Tolerate minor wrapping (e.g., ```json ... ``` even though we
    // forbid it) by stripping fence markers if present.
    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(raw) as Partial<ExtractionResult>;
    return {
      entities: Array.isArray(parsed.entities)
        ? parsed.entities.filter((e): e is string => typeof e === "string")
        : [],
      numbers: Array.isArray(parsed.numbers)
        ? parsed.numbers.filter((n): n is string => typeof n === "string")
        : [],
    };
  } catch (err) {
    console.error(
      "[extraction] failed:",
      err instanceof Error ? err.message : String(err),
    );
    return { entities: [], numbers: [] };
  }
}
