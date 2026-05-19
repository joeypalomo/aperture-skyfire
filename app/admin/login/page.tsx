// Admin magic-link login. Single-email lock — the form has no email
// input because there's only one valid recipient (JOEY_ADMIN_EMAIL).
// The button just triggers the action, which sends the link to Joey.

import { requestMagicLink } from "./actions";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: { sent?: string; error?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const sent = searchParams.sent === "1";
  const error = searchParams.error;

  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-16">
      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="font-playfair text-5xl text-near">Aperture admin</h1>
          <p className="font-sans text-[9pt] uppercase tracking-wide text-ash">
            Purpose-built for SkyFire Energy
          </p>
        </header>
        <hr className="border-t border-silver" />
        <section className="space-y-6 text-[14px] leading-body text-charcoal">
          {sent ? (
            <p>
              Sign-in link sent. Check the inbox for the address configured
              as <code>JOEY_ADMIN_EMAIL</code>, click the link, and you&rsquo;ll
              land back here.
            </p>
          ) : (
            <>
              <p>
                Sign in to manage the SkyFire intake cohort. A one-time link
                is emailed to the configured admin address.
              </p>
              <form action={requestMagicLink}>
                <button
                  type="submit"
                  className="rounded border border-near bg-near px-4 py-2 text-soft hover:bg-burnt hover:border-burnt transition-colors"
                >
                  Email me a sign-in link
                </button>
              </form>
              {error && (
                <p className="text-burnt">
                  {error === "unauthorized"
                    ? "That account isn't authorized."
                    : decodeURIComponent(error)}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
