// Edge middleware. Two responsibilities:
//   1. Refresh the Supabase auth session cookie on every request so
//      server components see up-to-date `user` state.
//   2. Gate /admin/* (except /admin/login*) behind an authenticated
//      session matching JOEY_ADMIN_EMAIL.
//
// Self-contained: does NOT import lib/env.ts because that module
// throws if any required env var is missing, and middleware runs on
// every request — a missing env var would brick the whole site. We
// read process.env directly and handle the absent case as "deny."

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const joeyAdminEmail = process.env.JOEY_ADMIN_EMAIL;

  // If Supabase isn't configured we can't check auth — let the request
  // through but block /admin to be safe.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return new NextResponse("Supabase auth is not configured.", {
        status: 503,
      });
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Bad/stale auth cookies can make getUser() throw at the fetch layer
  // (e.g., invalid JWT shape from a prior failed session). Treat any
  // failure here as "no user" and let the route render its
  // unauthenticated state, rather than crashing middleware and
  // returning MIDDLEWARE_INVOCATION_FAILED for the whole site.
  let user: { email?: string } | null = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    console.warn("[middleware] auth.getUser failed:", err instanceof Error ? err.message : String(err));
    user = null;
  }

  const path = request.nextUrl.pathname;
  const isAdminRoute =
    path.startsWith("/admin") && !path.startsWith("/admin/login");

  if (isAdminRoute) {
    if (!user) {
      const redirectUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (joeyAdminEmail && user.email !== joeyAdminEmail) {
      // Authenticated but wrong identity — sign them out and redirect.
      await supabase.auth.signOut();
      const redirectUrl = new URL("/admin/login?error=unauthorized", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals, favicon, and static assets
    "/((?!_next/static|_next/image|favicon.ico|branding/).*)",
  ],
};
