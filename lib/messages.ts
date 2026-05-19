// DB read/write helpers for the messages table. Centralizes the SQL
// shape so server actions don't repeat boilerplate.

import { getServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type ApertureEventType =
  Database["public"]["Enums"]["aperture_event_type"];

/**
 * Load all messages for a session ordered by turn_index ascending.
 * Returns empty array if the session has no messages yet.
 */
export async function listMessages(sessionId: string): Promise<MessageRow[]> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("turn_index", { ascending: true });

  if (error) {
    throw new Error(`listMessages failed: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Compute the next turn_index for a session. New session -> 0.
 */
export async function nextTurnIndex(sessionId: string): Promise<number> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("messages")
    .select("turn_index")
    .eq("session_id", sessionId)
    .order("turn_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`nextTurnIndex failed: ${error.message}`);
  }
  return (data?.turn_index ?? -1) + 1;
}

/**
 * Append an Aperture (agent) message. Caller supplies the event_type
 * classification — for Step 4 most agent turns are 'question_primary'
 * since we don't yet have fine-grained classification logic.
 */
export async function appendApertureMessage(args: {
  sessionId: string;
  turnIndex: number;
  text: string;
  eventType: ApertureEventType;
  elapsedSeconds: number;
  questionId?: string;
}): Promise<MessageRow> {
  const row: MessageInsert = {
    session_id: args.sessionId,
    turn_index: args.turnIndex,
    speaker: "aperture",
    text: args.text,
    aperture_event_type: args.eventType,
    elapsed_seconds: args.elapsedSeconds,
    question_id: args.questionId ?? null,
  };
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("messages")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    throw new Error(`appendApertureMessage failed: ${error.message}`);
  }
  return data;
}

/**
 * Append an interviewee message. entities_mentioned and
 * numbers_mentioned are left empty — the background Haiku extractor
 * (Step 5+) fills them asynchronously.
 */
export async function appendIntervieweeMessage(args: {
  sessionId: string;
  turnIndex: number;
  text: string;
  elapsedSeconds: number;
}): Promise<MessageRow> {
  const row: MessageInsert = {
    session_id: args.sessionId,
    turn_index: args.turnIndex,
    speaker: "interviewee",
    text: args.text,
    elapsed_seconds: args.elapsedSeconds,
  };
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("messages")
    .insert(row)
    .select("*")
    .single();
  if (error) {
    throw new Error(`appendIntervieweeMessage failed: ${error.message}`);
  }
  return data;
}

/**
 * Convert the message log into the role/content shape Anthropic's
 * Messages API expects. Aperture utterances are 'assistant',
 * interviewee utterances are 'user'.
 */
export function toAnthropicMessages(
  rows: MessageRow[],
): { role: "assistant" | "user"; content: string }[] {
  return rows.map((m) => ({
    role: m.speaker === "aperture" ? "assistant" : "user",
    content: m.text,
  }));
}
