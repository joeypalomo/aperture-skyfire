// Declination detection — A8 edge case 3.3. When an interviewee
// signals they do not want to participate, Aperture delivers a
// graceful verbatim close, the session flips to status='declined',
// and Joey is notified by email. No push to continue, ever.

/** Verbatim decline acknowledgment per A8 §3.3. */
export const DECLINE_LINE =
  "Got it — completely fine. Joey will be in touch directly if " +
  "there's anything that needs a conversation. Take care.";

// Strict patterns — a false positive ends the session (status flips
// to the terminal 'declined'), so these match only unambiguous
// declination phrasing, never a normal interview answer.
const DECLINE_SIGNAL_PATTERNS: RegExp[] = [
  /\bi (don'?t|do not) want to (do this|participate|continue|take part)\b/i,
  /\bi'?m not (going to|gonna) (do this|participate|take part|continue)\b/i,
  /\bi (won'?t|will not) (be participating|do this|participate|take part)\b/i,
  /\bi'?d rather not (do this|participate|take part)\b/i,
  /\bi decline\b/i,
  /\bnot going to (participate|do this|take part)\b/i,
];

/**
 * True if the interviewee message is an unambiguous declination.
 * Deterministic keyword/regex scan.
 */
export function detectDeclineSignal(text: string): boolean {
  return DECLINE_SIGNAL_PATTERNS.some((p) => p.test(text));
}
