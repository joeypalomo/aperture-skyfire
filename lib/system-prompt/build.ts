// Assembles the full A7 Part 1 deployable system prompt for a given
// session. Section ordering is locked: I, II, III, IV, V, VI, VII,
// VIII-XVI per the A7 spec. Each section is concatenated with a
// blank line between for readability in agent context.

import type { Database } from "@/types/db";
import { getInterviewee } from "@/config/interviewees";
import {
  SECTION_HEADER,
  SECTION_I,
  SECTION_II,
  SECTION_IV,
  SECTION_V,
  SECTION_VI,
  SECTION_VIII,
  SECTION_IX,
  SECTION_X,
  SECTION_XI,
  SECTION_XII,
  SECTION_XIII,
  SECTION_XIV,
  SECTION_XV,
  SECTION_XVI,
} from "./sections";
import { buildSection3 } from "./interviewee-context";
import { buildSection7 } from "./question-library";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

/**
 * Build the full system prompt string ready to pass as Anthropic's
 * `system` parameter. Errors thrown if the interviewee_id isn't in
 * the registry — that would be a config bug, not a runtime condition
 * we recover from.
 */
export function buildSystemPrompt(session: SessionRow): string {
  const config = getInterviewee(session.interviewee_id);
  if (!config) {
    throw new Error(
      `buildSystemPrompt: no config for interviewee_id=${session.interviewee_id}`,
    );
  }

  const section3 = buildSection3(config);
  const section7 = buildSection7(config);

  return [
    SECTION_HEADER,
    SECTION_I,
    SECTION_II,
    section3,
    SECTION_IV,
    SECTION_V,
    SECTION_VI,
    section7,
    SECTION_VIII,
    SECTION_IX,
    SECTION_X,
    SECTION_XI,
    SECTION_XII,
    SECTION_XIII,
    SECTION_XIV,
    SECTION_XV,
    SECTION_XVI,
  ].join("\n\n");
}
