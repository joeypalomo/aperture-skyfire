// /i/[token] — the interviewee entry point. Server component that
// resolves the URL token to a session row, then routes by status:
//
//   not_found / forged / shape-invalid  → wrong-link copy (edge 3.6)
//   expired (past 30-day window)        → expired-link copy
//   status='invited'                    → welcome + verbatim opening + Begin button
//   status in {identifying, warm, core,
//              closing, paused}         → auto-redirect to /chat surface
//   status='completed'                  → A7 §XIII post-close copy
//   status='declined'/'abandoned'       → graceful close copy
//
// The verbatim A7 §VI opening is shown statically on this welcome
// page so the interviewee can read it without committing. Clicking
// Begin transitions the session to 'identifying' and routes to the
// chat surface (Step 4).

import { redirect } from "next/navigation";
import { resolveToken } from "@/lib/tokens";
import { getInterviewee } from "@/config/interviewees";
import { startConversation } from "./chat/actions";

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

  // Session already in flight — go straight to the chat surface.
  if (
    session.status === "identifying" ||
    session.status === "warm" ||
    session.status === "core" ||
    session.status === "closing" ||
    session.status === "paused"
  ) {
    redirect(`/i/${params.token}/chat`);
  }

  // status === 'invited' — fresh welcome with the A7 §VI verbatim opening
  // and the Begin button.
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
      <form action={startConversation} className="pt-2">
        <input type="hidden" name="token" value={params.token} />
        <button
          type="submit"
          className="rounded border border-near bg-near px-5 py-2 text-[13px] text-soft hover:bg-burnt hover:border-burnt transition-colors"
        >
          Begin
        </button>
      </form>
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
