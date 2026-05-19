// Temporary diagnostic — remove after the env-var issue is resolved.
// Reports the SHAPE of each sensitive env var without exposing the
// actual value. Specifically calls out any non-ASCII characters with
// position and codepoint so we can spot the unicode arrow that keeps
// breaking the Supabase service-role key.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shape(name: string) {
  const value = process.env[name];
  if (value === undefined) return { set: false };
  if (value === "") return { set: false, present_but_empty: true };

  const nonAscii: { position: number; codepoint: number; char: string }[] = [];
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 127) {
      nonAscii.push({ position: i, codepoint: code, char: value[i]! });
    }
  }

  return {
    set: true,
    length: value.length,
    first_10: value.slice(0, 10),
    last_5: value.slice(-5),
    looks_like_jwt: value.startsWith("eyJ"),
    looks_like_sb_secret: value.startsWith("sb_secret_"),
    looks_like_sb_publishable: value.startsWith("sb_publishable_"),
    starts_with_bracket: value.startsWith("["),
    non_ascii_count: nonAscii.length,
    non_ascii: nonAscii.slice(0, 5),
  };
}

export function GET() {
  return NextResponse.json({
    SUPABASE_SERVICE_ROLE_KEY: shape("SUPABASE_SERVICE_ROLE_KEY"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: shape("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    NEXT_PUBLIC_SUPABASE_URL: shape("NEXT_PUBLIC_SUPABASE_URL"),
    ANTHROPIC_API_KEY: shape("ANTHROPIC_API_KEY"),
    SESSION_TOKEN_SECRET: shape("SESSION_TOKEN_SECRET"),
    JOEY_ADMIN_EMAIL: shape("JOEY_ADMIN_EMAIL"),
  });
}
