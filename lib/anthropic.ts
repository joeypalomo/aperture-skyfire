// Anthropic client wrappers. Two distinct models per the Step 1 schema
// header comment:
//
//   - Opus 4.7 (claude-opus-4-7): the conversation engine. Runs the
//     Aperture system prompt verbatim. Stays focused on conversation —
//     never invoked for extraction, classification, or any other
//     ancillary task.
//
//   - Haiku 4.5 (claude-haiku-4-5-20251001): the background workhorse.
//     After each interviewee turn, a separate Haiku call extracts
//     entities_mentioned and numbers_mentioned and writes them back to
//     the messages row asynchronously. Powers the A6 §B.2.5
//     searchability test plus the Trigger 1/Trigger 2 retrieval and
//     contradiction checks. Kept separate from the conversation thread
//     by design.

import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "@/lib/env";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (_client === null) {
    _client = new Anthropic({ apiKey: serverEnv.anthropicApiKey });
  }
  return _client;
}

export const APERTURE_CONVERSATION_MODEL = serverEnv.anthropicModel;
export const APERTURE_EXTRACTION_MODEL = serverEnv.anthropicExtractionModel;
