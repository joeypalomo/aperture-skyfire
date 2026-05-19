// Layer 2 retrieval: BI Brief chunk lookup keyed off entities the
// interviewee has named across the conversation. Per A6 §A.1.2 and
// §A.2, retrieval is keyword/entity-based (not embedding-based) —
// the spec explicitly notes embed-search is optional for the
// engagement's scope.
//
// Pattern:
//   1. After each interviewee turn, the Haiku extractor (lib/
//      extraction.ts) populates messages.entities_mentioned and
//      messages.numbers_mentioned.
//   2. When building the system prompt for the NEXT agent reply,
//      collect entities/numbers from all interviewee turns so far,
//      run lookupChunks() against them, and append the top 1–3
//      chunks to the prompt as a "RETRIEVED CONTEXT FOR THIS TURN"
//      block.
//   3. Opus 4.7 sees the chunks silently — per A6 §A.2.2 it must
//      NEVER announce retrieval to the interviewee.

import briefChunksJson from "@/config/retrieval/brief-chunks.json";

interface Chunk {
  chunk_id: string;
  source_section: string;
  summary: string;
  entities_indexed: {
    accounts: string[];
    people: string[];
    numbers: string[];
    segments: string[];
    constraints_referenced: string[];
  };
}

interface ChunksFile {
  chunks: Chunk[];
}

const CHUNKS: Chunk[] = (briefChunksJson as ChunksFile).chunks;

// Build inverted indices at module load. Keys are lowercased for
// case-insensitive matching. Values are sets of chunk_ids that
// contain that term.
const ENTITY_INDEX = new Map<string, Set<string>>();
const NUMBER_INDEX = new Map<string, Set<string>>();

function addToIndex(
  index: Map<string, Set<string>>,
  term: string,
  chunkId: string,
) {
  if (!term) return;
  const key = term.toLowerCase().trim();
  if (!key) return;
  if (!index.has(key)) {
    index.set(key, new Set());
  }
  index.get(key)!.add(chunkId);
}

for (const chunk of CHUNKS) {
  const e = chunk.entities_indexed;
  for (const account of e.accounts) addToIndex(ENTITY_INDEX, account, chunk.chunk_id);
  for (const person of e.people) addToIndex(ENTITY_INDEX, person, chunk.chunk_id);
  for (const segment of e.segments) addToIndex(ENTITY_INDEX, segment, chunk.chunk_id);
  for (const number of e.numbers) addToIndex(NUMBER_INDEX, number, chunk.chunk_id);
}

export interface RetrievalResult {
  chunkIds: string[];
  chunks: Chunk[];
}

/**
 * Look up BI Brief chunks that match any of the supplied entity or
 * number strings. Ranks by hit count (a chunk that matches multiple
 * search terms is more relevant than one with a single match).
 * Returns the top `limit` chunks (default 3 per A6 §A.1.2 budget
 * guidance).
 */
export function lookupChunks(
  entities: string[],
  numbers: string[],
  limit = 3,
): RetrievalResult {
  const hitCounts = new Map<string, number>();

  for (const entity of entities) {
    const key = entity.toLowerCase().trim();
    if (!key) continue;

    // Exact match first
    const exact = ENTITY_INDEX.get(key);
    if (exact) {
      for (const id of exact) {
        hitCounts.set(id, (hitCounts.get(id) ?? 0) + 2);
      }
      continue;
    }

    // Substring / token fallback. Iterate index keys and check
    // containment. Cheap because the index is small (<200 keys).
    for (const [indexKey, ids] of ENTITY_INDEX) {
      if (indexKey.includes(key) || key.includes(indexKey)) {
        for (const id of ids) {
          hitCounts.set(id, (hitCounts.get(id) ?? 0) + 1);
        }
      }
    }
  }

  for (const num of numbers) {
    const key = num.toLowerCase().trim();
    if (!key) continue;
    const exact = NUMBER_INDEX.get(key);
    if (!exact) continue;
    for (const id of exact) {
      hitCounts.set(id, (hitCounts.get(id) ?? 0) + 1);
    }
  }

  const ranked = [...hitCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([chunkId]) => chunkId);

  const chunks = ranked
    .map((id) => CHUNKS.find((c) => c.chunk_id === id))
    .filter((c): c is Chunk => c !== undefined);

  return { chunkIds: ranked, chunks };
}

/**
 * Render retrieved chunks as a prompt block suitable for appending
 * to Section VIII of the Aperture system prompt. Empty string if no
 * chunks — caller decides whether to include the block at all.
 */
export function renderRetrievedContextBlock(chunks: Chunk[]): string {
  if (chunks.length === 0) return "";

  const items = chunks
    .map(
      (c) =>
        `[${c.chunk_id} | ${c.source_section}]\n${c.summary}`,
    )
    .join("\n\n");

  return `──────────────────────────────────────────────────────
RETRIEVED CONTEXT FOR THIS TURN (Layer 2 — silent use only)
──────────────────────────────────────────────────────

The interviewee has mentioned entities or numbers that match the
following Business Intelligence Brief chunks. Use this context
silently to inform your next probe selection or contradiction flag.
NEVER announce that you've retrieved anything ("I have it on file,"
"according to my records," etc.) — the interviewee experiences a
sharper agent, not a clipboarded interrogator.

${items}`;
}
