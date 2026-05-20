// Pause / resume primitives — Step 7.
//
// Aperture runs on a stateless serverless surface: there is no daemon
// holding a per-session timer. Pause/resume is therefore resolved
// entirely inside sendMessage, two ways:
//
//   1. EXPLICIT pause — the interviewee says they need to step away.
//      detectPauseSignal() catches it with a keyword/regex scan (the
//      same deterministic-first pattern as the Stacy safeguard). The
//      session flips to status='paused' and Aperture delivers the
//      verbatim Section XIII pause line.
//
//   2. IMPLICIT pause — the interviewee just closes the tab / walks
//      away. No event fires. It is detected on RETURN: if the gap
//      since last_activity_at exceeds RESUME_GAP_SECONDS, the next
//      turn is treated as a resume.
//
// Either way, on the resuming turn sendMessage (a) shifts started_at
// forward by the paused duration so elapsed interview time excludes
// the gap, and (b) injects RESUME_CONTEXT_BLOCK into the system
// prompt so Opus opens with the Section XIII welcome-back greeting.

/**
 * Inactivity gap (seconds) above which a returning turn is treated as
 * a resume — welcome-back greeting + the gap excluded from elapsed
 * interview time. 30 minutes per the Step 7 architecture decision.
 * Long enough that a slow, considered answer is not mistaken for a
 * pause; short enough that a coffee break resumes cleanly.
 */
export const RESUME_GAP_SECONDS = 30 * 60;

/**
 * Verbatim Section XIII pause line. Hard-coded (not Opus-generated)
 * because the resume machinery needs a deterministic status flip and
 * elapsed-time snapshot at the same instant — the same reasoning the
 * Stacy re-anchor is hard-coded.
 */
export const PAUSE_LINE =
  "Got it — no rush. I'll save where we are. Come back anytime " +
  "through the same link. Take care.";

// Pause-signal patterns. Covers the four canonical Section XIII
// signals ("need to step away," "pick this up later," "have to
// jump," "can we pause") plus common real-world variants. Keyword-
// only — no classifier: a false positive is fully recoverable, since
// the interviewee simply sends another message, which resumes the
// session on the next turn.
const PAUSE_SIGNAL_PATTERNS: RegExp[] = [
  /\bstep (away|out)\b/i,
  /\b(have|need|got) to jump\b/i,
  /\bgotta jump\b/i,
  /\b(jump|hop) off\b/i,
  /\bpick (this|it) up\b/i,
  /\b(can we|can i|could we|let'?s|need to|have to|gonna|going to) pause\b/i,
  /\bpause (here|for now|this|it here|and come back)\b/i,
  /\b(come back to this|continue this|finish this|wrap this up|circle back|do this)\b.{0,20}\blater\b/i,
  /\b(continue|finish|resume) (later|tomorrow|another time)\b/i,
  /\b(need|take|grab|gotta take) a (quick )?break\b/i,
  /\bbe right back\b/i,
  /\bbrb\b/i,
  /\bgotta run\b/i,
  /\bout of time\b/i,
];

/**
 * True if the interviewee message reads as an explicit pause signal.
 * Deterministic keyword/regex scan.
 */
export function detectPauseSignal(text: string): boolean {
  return PAUSE_SIGNAL_PATTERNS.some((p) => p.test(text));
}

/**
 * Runtime block injected into the system prompt after Section XIII on
 * a resuming turn. Instructs Opus to honour the Section XIII
 * "INTERVIEWEE RETURNS AFTER A PAUSE" behaviour for this turn only.
 */
export const RESUME_CONTEXT_BLOCK = `──────────────────────────────────────────────────────
RESUME CONTEXT — RUNTIME (this turn only)
──────────────────────────────────────────────────────

The interviewee is returning after a pause. The conversation above
is the full transcript so far.

Per Section XIII "INTERVIEWEE RETURNS AFTER A PAUSE," begin this
turn with a brief welcome-back before anything else:

  "Welcome back, {display_name}."

Then read their message this turn and judge:
  - If it does NOT substantively answer the question that was in
    progress when the pause began, name where you left off in one
    short descriptive phrase (five words max, not placeholder
    language) and re-deliver that question in full so they have
    context.
  - If their message already answers the in-progress question,
    acknowledge it briefly and continue the registry normally.

Identify the in-progress question as the most recent registry
question you delivered in the transcript above. Do NOT ask why
they were away. Do NOT apologize for the gap. Do NOT re-state the
pause. The welcome-back plus the clean re-anchor IS the courtesy.`;
