// Step 8 — email pipeline. Two transactional emails per session,
// both delivered to Joey via Resend:
//
//   1. Start notification — when an interviewee clicks Begin.
//   2. Completion email — when Aperture delivers the §XV final line;
//      carries the full transcript plus a signal appendix (per-turn
//      scorecards + contradiction flags).
//
// v1 uses the Resend sandbox sender (onboarding@resend.dev), which can
// only deliver to the Resend account's own address. That's fine —
// every Aperture email goes to Joey and only Joey. v2 productization
// is a two-env-var swap (RESEND_FROM_EMAIL + a verified domain).
//
// Synthesis generation (A7 §XVI) was cut from v1 scope per Joey's
// Step 8 decision — he synthesizes from the raw transcript + signal
// appendix himself.
//
// Both send functions are best-effort: they never throw. The caller
// inspects EmailResult.ok and logs failures to sessions.last_error.

import { Resend } from "resend";
import { getServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ScorecardRow = Database["public"]["Tables"]["scorecards"]["Row"];
type ContradictionRow =
  Database["public"]["Tables"]["contradictions"]["Row"];

// Kickoff Locked Decision 10. Also the address the Resend account is
// registered under, so the sandbox sender is permitted to deliver
// here (confirmed Step 8).
const TRANSCRIPT_RECIPIENT = "joey.palomo@ecommercetexas.com";

export interface EmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

let cachedResend: Resend | null = null;

function getResend(): Resend {
  if (cachedResend) return cachedResend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("email: RESEND_API_KEY is not set");
  cachedResend = new Resend(key);
  return cachedResend;
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://aperture-skyfire.vercel.app"
  );
}

// Branded header band for HTML emails — the Aperture logo (degrades to
// alt text if a client blocks images) over the product-class line.
function emailBrandHeader(): string {
  return (
    `<div style="text-align:center;padding:4px 0 18px;border-bottom:1px solid #e0ddd6;margin-bottom:22px">` +
    `<img src="${appBaseUrl()}/branding/aperture.png" alt="Aperture" width="190" style="display:inline-block;width:190px;max-width:60%;height:auto" />` +
    `<div style="font:600 10px/1 -apple-system,Segoe UI,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#57514c;margin-top:9px">Intelligence Agent</div>` +
    `</div>`
  );
}

// Quiet co-mark footer for HTML emails — text only, no image
// dependency.
function emailBrandFooter(): string {
  return (
    `<div style="text-align:center;border-top:1px solid #e0ddd6;margin-top:28px;padding-top:16px">` +
    `<div style="font:10px/1.6 -apple-system,Segoe UI,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#9a948e">Built by eCommerce Inc. &middot; for SkyFire Energy</div>` +
    `</div>`
  );
}

// ---- formatting helpers ---------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, "0")}s`;
}

function fmtTs(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function signed(n: number): string {
  return (n >= 0 ? "+" : "") + n;
}

interface NoteEntry {
  type?: string;
  content?: string;
}

function notesOf(m: MessageRow): NoteEntry[] {
  return Array.isArray(m.notes) ? (m.notes as NoteEntry[]) : [];
}

// ---- start notification ---------------------------------------------

/**
 * Notify Joey that an interviewee opened their intake and clicked
 * Begin. Best-effort — returns an EmailResult, never throws.
 */
export async function sendStartNotification(
  session: SessionRow,
): Promise<EmailResult> {
  try {
    const name = session.interviewee_full_name;
    const subject = `Aperture intake started — ${name}`;
    const lead = `${name} (${session.interviewee_display_name}) opened their Aperture intake and clicked Begin.`;
    const meta = [
      `Interviewee ID:  ${session.interviewee_id}`,
      `Tier:            ${session.tier}`,
      `Started:         ${fmtTs(session.started_at)}`,
    ].join("\n");
    const tail =
      "The completion email with the full transcript and signal appendix will follow when the interview wraps.";

    const text = `${lead}\n\n${meta}\n\n${tail}\n`;
    const html =
      `<div style="font-family:-apple-system,Segoe UI,Helvetica,sans-serif;color:#1a1a1a;max-width:640px">` +
      emailBrandHeader() +
      `<p>${escapeHtml(lead)}</p>` +
      `<pre style="font:13px/1.6 ui-monospace,Menlo,monospace;background:#f5f5f3;padding:12px 14px;border-radius:6px">${escapeHtml(meta)}</pre>` +
      `<p style="color:#666;font-size:13px">${escapeHtml(tail)}</p>` +
      emailBrandFooter() +
      `</div>`;

    const { data, error } = await getResend().emails.send({
      from: fromAddress(),
      to: TRANSCRIPT_RECIPIENT,
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---- completion email -----------------------------------------------

function buildCompletionEmail(
  session: SessionRow,
  messages: MessageRow[],
  scorecards: ScorecardRow[],
  contradictions: ContradictionRow[],
): { subject: string; text: string; html: string } {
  const name = session.interviewee_full_name;
  const display = session.interviewee_display_name;
  const subject = `Aperture intake complete — ${name}`;

  const lastMessage = messages[messages.length - 1];
  const activeSeconds = lastMessage ? lastMessage.elapsed_seconds : 0;

  const headerRows: [string, string][] = [
    ["Interviewee", `${name} (${display}) · ${session.interviewee_id}`],
    ["Tier", String(session.tier)],
    ["Started", fmtTs(session.started_at)],
    ["Completed", fmtTs(session.completed_at)],
    ["Active time", fmtClock(activeSeconds)],
    ["Turns", String(messages.length)],
  ];

  const speaker = (m: MessageRow): string =>
    m.speaker === "aperture" ? "Aperture" : display;

  // ---- TEXT ----
  const headerText = headerRows
    .map(([k, v]) => `${(k + ":").padEnd(14)}${v}`)
    .join("\n");

  const transcriptText = messages
    .map((m) => {
      const tag =
        m.speaker === "aperture" && m.aperture_event_type
          ? ` (${m.aperture_event_type})`
          : "";
      const noteLines = notesOf(m)
        .map((n) => `    » ${n.type ?? "note"}: ${n.content ?? ""}`)
        .join("\n");
      return `[${speaker(m)}]${tag}\n${m.text}${
        noteLines ? "\n" + noteLines : ""
      }`;
    })
    .join("\n\n");

  const scorecardsText = scorecards.length
    ? scorecards
        .map((sc, i) =>
          [
            `#${i + 1}  ${sc.constraint_tested} · ${sc.outcome} · confidence ${signed(sc.confidence_shift)} · q=${sc.question_id}`,
            `     quote: "${sc.driving_quote}"`,
            `     notes: ${sc.agent_notes}`,
            `     probe fired: ${sc.probe_fired ? "yes" : "no"} · resolved thin: ${sc.probe_resolved_thin ? "yes" : "no"} · follow-up: ${sc.followup_recommended}`,
          ].join("\n"),
        )
        .join("\n\n")
    : "None recorded.";

  const contradictionsText = contradictions.length
    ? contradictions
        .map((c, i) =>
          [
            `#${i + 1}  ${c.severity} · q=${c.question_id ?? "—"}`,
            `     known fact:      ${c.conflicting_known}`,
            `     interviewee said: ${c.interviewee_statement}`,
            `     agent read:      ${c.agent_read}`,
            `     source of known: ${c.source_of_known}`,
            `     follow-up:       ${c.followup_recommended}`,
          ].join("\n"),
        )
        .join("\n\n")
    : "None recorded.";

  const text = [
    `APERTURE INTAKE — COMPLETE TRANSCRIPT`,
    "=".repeat(52),
    headerText,
    "",
    "-".repeat(52),
    "TRANSCRIPT",
    "-".repeat(52),
    "",
    transcriptText,
    "",
    "-".repeat(52),
    `SIGNAL APPENDIX — SCORECARDS (${scorecards.length})`,
    "-".repeat(52),
    "",
    scorecardsText,
    "",
    "-".repeat(52),
    `SIGNAL APPENDIX — CONTRADICTIONS (${contradictions.length})`,
    "-".repeat(52),
    "",
    contradictionsText,
    "",
  ].join("\n");

  // ---- HTML ----
  const headerHtml = headerRows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:2px 16px 2px 0;color:#888;vertical-align:top">${escapeHtml(k)}</td><td style="padding:2px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  const transcriptHtml = messages
    .map((m) => {
      const tag =
        m.speaker === "aperture" && m.aperture_event_type
          ? ` <span style="color:#b06a3b;font-size:12px">· ${escapeHtml(m.aperture_event_type)}</span>`
          : "";
      const notesHtml = notesOf(m)
        .map(
          (n) =>
            `<div style="color:#999;font-size:12px;margin:2px 0 0 12px">» ${escapeHtml(n.type ?? "note")}: ${escapeHtml(n.content ?? "")}</div>`,
        )
        .join("");
      const who =
        m.speaker === "aperture"
          ? `<strong style="color:#1a1a1a">Aperture</strong>`
          : `<strong style="color:#2f5d8a">${escapeHtml(display)}</strong>`;
      return (
        `<div style="margin:14px 0">` +
        `<div style="font-size:13px;margin-bottom:2px">${who}${tag}</div>` +
        `<div style="white-space:pre-wrap">${escapeHtml(m.text)}</div>` +
        notesHtml +
        `</div>`
      );
    })
    .join("");

  const scorecardsHtml = scorecards.length
    ? scorecards
        .map(
          (sc, i) =>
            `<div style="margin:10px 0;padding:10px 12px;background:#f5f5f3;border-radius:6px;font-size:13px">` +
            `<div><strong>#${i + 1}</strong> · ${escapeHtml(sc.constraint_tested)} · ${escapeHtml(sc.outcome)} · confidence ${escapeHtml(signed(sc.confidence_shift))} · q=${escapeHtml(sc.question_id)}</div>` +
            `<div style="color:#555;margin-top:4px">quote: "${escapeHtml(sc.driving_quote)}"</div>` +
            `<div style="color:#555;margin-top:2px">notes: ${escapeHtml(sc.agent_notes)}</div>` +
            `<div style="color:#888;margin-top:2px">probe fired: ${sc.probe_fired ? "yes" : "no"} · resolved thin: ${sc.probe_resolved_thin ? "yes" : "no"} · follow-up: ${escapeHtml(sc.followup_recommended)}</div>` +
            `</div>`,
        )
        .join("")
    : `<p style="color:#888">None recorded.</p>`;

  const contradictionsHtml = contradictions.length
    ? contradictions
        .map(
          (c, i) =>
            `<div style="margin:10px 0;padding:10px 12px;background:#faf3ee;border-radius:6px;font-size:13px">` +
            `<div><strong>#${i + 1}</strong> · ${escapeHtml(c.severity)} · q=${escapeHtml(c.question_id ?? "—")}</div>` +
            `<div style="color:#555;margin-top:4px">known fact: ${escapeHtml(c.conflicting_known)}</div>` +
            `<div style="color:#555;margin-top:2px">interviewee said: ${escapeHtml(c.interviewee_statement)}</div>` +
            `<div style="color:#555;margin-top:2px">agent read: ${escapeHtml(c.agent_read)}</div>` +
            `<div style="color:#888;margin-top:2px">source of known: ${escapeHtml(c.source_of_known)} · follow-up: ${escapeHtml(c.followup_recommended)}</div>` +
            `</div>`,
        )
        .join("")
    : `<p style="color:#888">None recorded.</p>`;

  const html =
    `<div style="font-family:-apple-system,Segoe UI,Helvetica,sans-serif;color:#1a1a1a;max-width:680px;line-height:1.5">` +
    emailBrandHeader() +
    `<h2 style="margin:0 0 4px">Intake transcript — complete</h2>` +
    `<table style="font-size:13px;border-collapse:collapse;margin:8px 0 20px">${headerHtml}</table>` +
    `<h3 style="border-bottom:1px solid #e0ddd6;padding-bottom:4px">Transcript</h3>` +
    transcriptHtml +
    `<h3 style="border-bottom:1px solid #e0ddd6;padding-bottom:4px;margin-top:28px">Signal appendix — scorecards (${scorecards.length})</h3>` +
    scorecardsHtml +
    `<h3 style="border-bottom:1px solid #e0ddd6;padding-bottom:4px;margin-top:28px">Signal appendix — contradictions (${contradictions.length})</h3>` +
    contradictionsHtml +
    emailBrandFooter() +
    `</div>`;

  return { subject, text, html };
}

/**
 * Build and send the completion email for a finished session. Fetches
 * the full transcript, scorecards and contradictions itself so the
 * caller only needs to pass the (completed) session row. Best-effort —
 * returns an EmailResult, never throws.
 */
export async function sendCompletionEmail(
  session: SessionRow,
): Promise<EmailResult> {
  try {
    const supabase = getServiceRoleClient();
    const [messagesRes, scorecardsRes, contradictionsRes] = await Promise.all([
      supabase
        .from("messages")
        .select("*")
        .eq("session_id", session.id)
        .order("turn_index", { ascending: true }),
      supabase
        .from("scorecards")
        .select("*")
        .eq("session_id", session.id)
        .order("recorded_at_elapsed_seconds", { ascending: true }),
      supabase
        .from("contradictions")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true }),
    ]);

    const { subject, text, html } = buildCompletionEmail(
      session,
      messagesRes.data ?? [],
      scorecardsRes.data ?? [],
      contradictionsRes.data ?? [],
    );

    const { data, error } = await getResend().emails.send({
      from: fromAddress(),
      to: TRANSCRIPT_RECIPIENT,
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
