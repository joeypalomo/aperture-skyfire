// Edge middleware. Lightweight by design — only gates /admin/* behind
// the presence of a Supabase auth cookie. We deliberately do NOT
// import @supabase/ssr here: that library has Edge-runtime
// incompatibilities (it pulls in something that references Node's
// __dirname global, which is undefined in Edge and crashes the whole
// middleware function — observed during Step 3 deploy as
// "ReferenceError: __dirname is not defined" / MIDDLEWARE_INVOCATION_FAILED).
//
// Actual auth verification happens in app/admin/layout.tsx where Node
// runtime is available and the full Supabase client works fine. The
// cookie-presence check here is a fast-path redirect; if a cookie
// exists, the layout still validates it server-side before showing
// any admin content. A forged/expired cookie that gets past
// middleware will be caught by the layout's getUser() call and the
// user redirected anyway.

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only act on /admin/* routes, excluding the login surface itself.
  const isAdminRoute =
    path.startsWith("/admin") && !path.startsWith("/admin/login");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Supabase Auth stores session cookies named like
  // `sb-<project-ref>-auth-token` (and sometimes split into multiple
  // chunks with .0, .1 suffixes for large sessions). If ANY such
  // cookie is present we let the request through and the layout
  // does the real validation.
  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith("sb-") &&
        (c.name.endsWith("-auth-token") ||
          c.name.includes("-auth-token.")),
    );

  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals, favicon, static assets,
    // and the env-var diagnostic endpoint.
    "/((?!_next/static|_next/image|favicon.ico|branding/|api/debug-env-keys).*)",
  ],
};
