// Invite-token primitives. Tokens are opaque 32-byte random strings
// encoded as base64url — they look like `4_OyrYiaTBSIPbrfdG5IslVxwm...`
// and reveal nothing about the underlying session.
//
// Token lifecycle per the Phase 3 kickoff brief, Locked Decision 7:
// single-use per session, resume via same token until completion OR
// 30-day expiration. The token does NOT rotate after first use — the
// interviewee can pause and resume across days/devices using the same
// URL.
//
// Storage: sessions.token (unique-indexed) is the canonical record.
// Lookup is O(1). The SESSION_TOKEN_SECRET env var is reserved for a
// future MAC-signed variant if we ever need stateless validation —
// not used in v1 because we always check the DB anyway.

import { randomBytes } from "node:crypto";
import { getServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

/**
 * Generate a fresh opaque token (32 bytes → 43-char base64url).
 * Collision space is 2^256; unique-index retry is unnecessary.
 */
export function mintToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * 30-day expiration window from issue, per kickoff Locked Decision 5.
 */
export function defaultExpiresAt(issuedAt: Date = new Date()): Date {
  const ms = 30 * 24 * 60 * 60 * 1000;
  return new Date(issuedAt.getTime() + ms);
}

export type TokenResolution =
  | { kind: "ok"; session: SessionRow }
  | { kind: "not_found" }
  | { kind: "expired"; session: SessionRow };

/**
 * Resolve a URL token to a session row. Returns:
 *  - { kind: "ok" } if the token matches a non-expired session
 *  - { kind: "expired" } if the token matches but token_expires_at is past
 *  - { kind: "not_found" } if no row matches (bad token, forged token,
 *    or a session that was hard-deleted)
 *
 * Callers route on `kind`; the welcome page renders different copy per
 * branch per A7 §XIII + edge case 3.6 (wrong token).
 */
export async function resolveToken(token: string): Promise<TokenResolution> {
  // Token shape sanity check before hitting the DB — base64url is
  // [A-Za-z0-9_-], 32 bytes = 43 chars. We accept anywhere from 22 to
  // 64 chars to avoid coupling to a single encoding length, but reject
  // obviously malformed input early.
  if (!/^[A-Za-z0-9_-]{22,64}$/.test(token)) {
    return { kind: "not_found" };
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("[tokens] resolveToken query error:", error.message);
    return { kind: "not_found" };
  }
  if (!data) {
    return { kind: "not_found" };
  }

  if (new Date(data.token_expires_at).getTime() < Date.now()) {
    return { kind: "expired", session: data };
  }

  return { kind: "ok", session: data };
}
