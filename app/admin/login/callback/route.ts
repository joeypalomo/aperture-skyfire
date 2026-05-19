// Magic-link callback. Supabase redirects to /admin/login/callback?code=XXX
// after the interviewee... wait, after JOEY clicks the link in his email.
// Exchange the code for a session, set cookies, then route to /admin.

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/server-cookies";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_code", request.url),
    );
  }

  const supabase = getAuthenticatedClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
