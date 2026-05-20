// Registry mapping interviewee_id → question library. Used by the
// system-prompt assembler (lib/system-prompt/question-library.ts) to
// load the correct per-stakeholder Section VII content at session
// start.

import type { IntervieweeQuestionLibrary } from "./types";
import { daveLibrary } from "./dave";
import { gregLibrary } from "./greg";
import { landonLibrary } from "./landon";
import { jasonLibrary } from "./jason";
import { curtisLibrary } from "./curtis";
import { robertLibrary } from "./robert";
import { bryceLibrary } from "./bryce";
import { stacyLibrary } from "./stacy";

const LIBRARIES: Record<string, IntervieweeQuestionLibrary> = {
  dave_vonesch: daveLibrary,
  greg_sauer: gregLibrary,
  landon_aldridge: landonLibrary,
  jason_jackson: jasonLibrary,
  curtis_buxton: curtisLibrary,
  robert_silver: robertLibrary,
  bryce_hayes: bryceLibrary,
  stacy_haakonson: stacyLibrary,
};

export function getQuestionLibrary(
  intervieweeId: string,
): IntervieweeQuestionLibrary | undefined {
  return LIBRARIES[intervieweeId];
}

export { type IntervieweeQuestionLibrary } from "./types";
