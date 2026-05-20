// Chat surface. Server-rendered conversation between Aperture and
// the named interviewee. Begin click on the welcome page (Step 3)
// transitions the session to 'identifying' and routes here.
//
// Step 4 scope: messages persist; Anthropic Opus 4.7 drives replies
// per the A7 system prompt (Sections III + VII are stub-filled — Step
// 6 replaces with real per-stakeholder content).

import { redirect } from "next/navigation";
import { resolveToken } from "@/lib/tokens";
import { getInterviewee } from "@/config/interviewees";
import { listMessages } from "@/lib/messages";
import { Transcript } from "@/components/Transcript";
import { MessageForm } from "@/components/MessageForm";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  params: { token: string };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const result = await resolveToken(params.token);

  if (result.kind !== "ok") {
    // Invalid / expired tokens fall back to the welcome page, which
    // renders the appropriate wrong-link / expired copy.
    redirect(`/i/${params.token}`);
  }

  const session = result.session;

  // Status check: we used to redirect status='invited' back to the
  // welcome page, but that created a stale-cache bounce loop after the
  // Begin click (the welcome page redirects identifying→/chat, and a
  // cached /chat reading 'invited' bounced back). Just render the
  // chat surface for any session resolution that finds a row. If
  // someone navigates directly to /chat before clicking Begin, they
  // see an empty transcript with the message form — harmless, since
  // the session has no started_at yet and the sendMessage action
  // checks for active status anyway.

  const config = getInterviewee(session.interviewee_id);
  const displayName =
    config?.displayName ?? session.interviewee_display_name;

  const messages = await listMessages(session.id);

  const isClosed =
    session.status === "completed" ||
    session.status === "declined" ||
    session.status === "expired" ||
    session.status === "abandoned";

  return (
    <main className="mx-auto max-w-prose px-6 py-12">
      <header className="mb-10">
        <BrandHeader variant="compact" />
        <hr className="border-t border-silver mt-4" />
      </header>

      <Transcript
        messages={messages}
        intervieweeDisplayName={displayName}
      />

      <MessageForm token={params.token} disabled={isClosed} />

      {isClosed && (
        <p className="mt-6 text-[12px] italic text-ash text-center">
          Session ended. Reach out to Joey directly if there's anything to add.
        </p>
      )}

      {session.status === "paused" && (
        <p className="mt-6 text-[12px] italic text-ash text-center">
          Paused — send a message whenever you&rsquo;re ready to pick back up.
        </p>
      )}

      <BrandFooter className="mt-16" />
    </main>
  );
}
