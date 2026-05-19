// Health endpoint — the Step 2 acceptance gate. Returns JSON the
// production smoke test can assert against. No env-var reads beyond
// optional ones (the gate must respond even if Anthropic / Supabase /
// Resend aren't configured yet — those are tested in later steps).

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "aperture",
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7",
    commit:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7) ??
      "local",
    timestamp: new Date().toISOString(),
  });
}
