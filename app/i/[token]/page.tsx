// /i/[token] — the interviewee entry point. Server component that
// resolves the URL token to a session row, then routes by status:
//
//   not_found / forged / shape-invalid  → wrong-link copy (edge 3.6)
//   expired (past 30-day window)        → expired-link copy
//   status='invited'                    → fresh welcome + A7 §VI verbatim
//   status in {identifying, warm, core,
//              closing, paused}         → "session already started" pointer
//   status='completed'                  → A7 §XIII post-close copy
//   status='declined'/'abandoned'       → graceful close copy
//
// Step 3 ships the welcome screen statically — the chat surface and
// real resume language land in Step 4. The Begin button on the
// welcome screen is intentionally omitted until Step 4 wires it.

import { resolveToken } from "@/lib/tokens";
import { getInterviewee } from "@/config/interviewees";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { token: string };
}

export default async function IntakeTokenPage({ params }: PageProps) {
  const result = await resolveToken(params.token);

  if (result.kind === "not_found") {
    return (
      <PageShell heading="Aperture">
        <p>
          This link wasn&rsquo;t meant for you — looks like there&rsquo;s
          been a mix-up. Reach out to Joey directly and he&rsquo;ll get
          you the right link.
        </p>
      </PageShell>
    );
  }

  if (result.kind === "expired") {
    return (
      <PageShell heading="Aperture">
        <p>
          This intake link has expired. Reach out to Joey directly if
          you&rsquo;d still like to participate.
        </p>
      </PageShell>
    );
  }

  const session = result.session;
  const interviewee = getInterviewee(session.interviewee_id);
  const displayName = interviewee?.displayName ?? session.interviewee_display_name;

  if (session.status === "completed") {
    return (
      <PageShell heading="Aperture">
        <p>
          We closed the session, {displayName} — but if there&rsquo;s
          something to add, send it through Joey directly and he&rsquo;ll
          route it.
        </p>
      </PageShell>
    );
  }

  if (session.status === "declined" || session.status === "abandoned") {
    return (
      <PageShell heading="Aperture">
        <p>
          Joey will be in touch directly if there&rsquo;s anything that
          needs a conversation. Take care.
        </p>
      </PageShell>
    );
  }

  if (
    session.status === "identifying" ||
    session.status === "warm" ||
    session.status === "core" ||
    session.status === "closing" ||
    session.status === "paused"
  ) {
    return (
      <PageShell heading="Aperture">
        <p className="font-playfair text-2xl text-near">
          Welcome back, {displayName}.
        </p>
        <p>The chat surface ships in Step 4.</p>
      </PageShell>
    );
  }

  // status === 'invited' — fresh welcome with the A7 §VI verbatim opening.
  // The chat surface and Begin button wire in Step 4.
  return (
    <PageShell heading="Aperture">
      <p>
        Hi {displayName} — I&rsquo;m Aperture, an intelligence-gathering
        agent Joey built specifically for the SkyFire engagement.
        I&rsquo;ll ask you a few questions to help build a shared picture
        of how the commercial sales engine works today. About 15 minutes
        — and you can pause and pick back up anytime, even if it takes a
        few sittings. Your participation matters. Let&rsquo;s get started.
      </p>
      <p className="text-[12px] italic text-ash">
        Chat surface lands in Step 4 of the build. This welcome screen is
        the static-render checkpoint for the verbatim opening above.
      </p>
    </PageShell>
  );
}

// Shared shell — Aperture wordmark, co-mark, content slot.
function PageShell({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-16">
      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="font-playfair text-5xl text-near">{heading}</h1>
          <p className="font-sans text-[9pt] uppercase tracking-wide text-ash">
            Purpose-built for SkyFire Energy
          </p>
        </header>
        <hr className="border-t border-silver" />
        <section className="space-y-4 text-[14px] leading-body text-charcoal">
          {children}
        </section>
      </div>
    </main>
  );
}
