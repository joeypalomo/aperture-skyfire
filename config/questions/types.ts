// Type definitions for per-stakeholder question libraries. Each
// library is one TypeScript module under config/questions/ that
// exports a const of this shape. The system prompt assembler
// (lib/system-prompt/question-library.ts) reads the matched library
// at session start and renders it into Section VII verbatim.
//
// Source: Phase 2 Artifacts 3 (Tier 1), 4 (Tier 2), 5 (Tier 3) —
// each §B (warm), §C (core sequence), §D (branching), §E (closing),
// §F (voice register notes), §G (watch-outs), §H (time budget audit
// / trim sequence).

import type { Database } from "@/types/db";

export type ConstraintId = Database["public"]["Enums"]["constraint_id"];

export type QuestionPriority = "P0" | "P1";

export interface ProbeDown {
  /** Stable per-question label so we can log which probe fired. */
  id: "primary" | "alt_1" | "alt_2" | "alt_3";
  /** Verbatim probe text. */
  text: string;
  /** Optional hint about when to pick this variant. */
  when: string;
}

export interface Question {
  /** Registry ID — e.g., "GREG_Q1". Stamped on scorecard.question_id. */
  id: string;
  priority: QuestionPriority;
  /** Short title for transcripts + admin UI. */
  title: string;
  /** Primary question text — delivered verbatim by Aperture. */
  text: string;
  /** One-sentence rationale for the Why field in Section VII. */
  why: string;
  /** Which constraint(s) the question is designed to test. */
  constraints_tested: ConstraintId[];
  /** Probe-down options. First one is the default primary if thin. */
  probes: ProbeDown[];
  /** What "substantive" looks like for this question (free-text hint). */
  substantive_markers: string;
  /** What "thin" looks like for this question. */
  thin_markers: string;
  /** Approximate seconds the question takes including answer. */
  time_estimate_seconds: { primary: number; with_probe: number };
}

export interface WarmQuestion {
  id: string;
  text: string;
  target_seconds: number;
  /** Expected answer shape (free-text guidance for substantive heuristic). */
  expected_shape: string;
}

export interface ClosingQuestion {
  /** Registry ID — e.g., "DAVE_CLOSE". */
  id: string;
  /** Verbatim per-interviewee calibrated variant of the universal close. */
  text: string;
}

export interface IntervieweeQuestionLibrary {
  /** Matches sessions.interviewee_id and config/interviewees.ts entry. */
  interviewee_id: string;
  warm: WarmQuestion;
  /** Core registry in delivery order. */
  questions: Question[];
  closing: ClosingQuestion;
  /** Top-level branching / sequencing rules. Free text rendered into Section VII. */
  branching_rules: string;
  /** Tier-specific voice calibration notes. Rendered into Section III watch-outs/calibration. */
  voice_register_notes: string;
  /** Per-interviewee watch-outs / lane considerations. */
  watch_outs: string;
  /** Order in which to trim P1 questions under budget pressure. */
  trim_sequence: string[];
}
