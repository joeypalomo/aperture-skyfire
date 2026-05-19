// Admin cohort dashboard. Server-rendered table of the 8 SkyFire
// interviewees, each row showing current session status and either a
// "Generate link" button or the active invite URL.
//
// Joey's workflow: click Generate → URL appears in the row → select +
// copy → paste into the shared Google Chat. Step 3 deliberately uses
// plain selectable text rather than a Copy button (polish, deferred).

import { headers } from "next/headers";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  interviewees,
  intervieweeDisplayOrder,
} from "@/config/interviewees";
import { generateInviteLink } from "./_actions/generate-invite-link";
import type { Database } from "@/types/db";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES: SessionRow["status"][] = [
  "invited",
  "identifying",
  "warm",
  "core",
  "closing",
  "paused",
];

const TERMINAL_STATUSES: SessionRow["status"][] = [
  "completed",
  "declined",
  "expired",
  "abandoned",
];

function statusLabel(status: SessionRow["status"]): string {
  switch (status) {
    case "invited":
      return "Invited — not yet opened";
    case "identifying":
      return "In opening";
    case "warm":
      return "In warm";
    case "core":
      return "In core registry";
    case "closing":
      return "In closing";
    case "paused":
      return "Paused";
    case "completed":
      return "Completed";
    case "declined":
      return "Declined";
    case "expired":
      return "Expired / superseded";
    case "abandoned":
      return "Abandoned";
  }
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface AdminDashboardProps {
  searchParams: { error?: string };
}

export default async function AdminDashboard({
  searchParams,
}: AdminDashboardProps) {
  const errorMessage = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : null;
  const supabase = getServiceRoleClient();
  const { data: sessionRows } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  // Group: take the latest session per interviewee_id (already DESC by created_at).
  const latestByInterviewee = new Map<string, SessionRow>();
  for (const row of sessionRows ?? []) {
    if (!latestByInterviewee.has(row.interviewee_id)) {
      latestByInterviewee.set(row.interviewee_id, row);
    }
  }

  // Build base URL for invite-link assembly.
  const headerList = headers();
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-[14px] text-charcoal">
      {errorMessage && (
        <div className="mb-6 rounded border border-burnt bg-soft px-4 py-3 text-[12px] text-burnt">
          <strong className="block font-medium">Action failed:</strong>
          <code className="break-all">{errorMessage}</code>
        </div>
      )}
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-playfair text-3xl text-near">Cohort</h2>
        <p className="text-[12px] text-ash">
          {intervieweeDisplayOrder.length} interviewees ·{" "}
          {[...latestByInterviewee.values()].filter((s) =>
            ACTIVE_STATUSES.includes(s.status),
          ).length}{" "}
          active sessions
        </p>
      </div>

      <table className="w-full border-collapse text-left">
        <thead className="border-b border-silver text-[11px] uppercase tracking-wide text-ash">
          <tr>
            <th className="py-2 pr-4">Interviewee</th>
            <th className="py-2 pr-4">Tier</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Invite URL</th>
            <th className="py-2 pr-4">Last activity</th>
            <th className="py-2 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {intervieweeDisplayOrder.map((id) => {
            const ic = interviewees[id];
            if (!ic) return null;
            const session = latestByInterviewee.get(id);
            const isActive =
              session && ACTIVE_STATUSES.includes(session.status);
            const inviteUrl =
              session && isActive ? `${baseUrl}/i/${session.token}` : null;
            const isTerminal =
              session && TERMINAL_STATUSES.includes(session.status);

            return (
              <tr key={id} className="border-b border-silver/50 align-top">
                <td className="py-3 pr-4">
                  <div className="font-medium">{ic.fullName}</div>
                  <div className="text-[11px] text-ash">{ic.displayName}</div>
                </td>
                <td className="py-3 pr-4">{ic.tier}</td>
                <td className="py-3 pr-4">
                  {session ? statusLabel(session.status) : "Not invited"}
                </td>
                <td className="py-3 pr-4">
                  {inviteUrl ? (
                    <code className="block max-w-[28rem] break-all text-[11px] text-near">
                      {inviteUrl}
                    </code>
                  ) : (
                    <span className="text-ash">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-[12px] text-ash">
                  {formatTime(
                    session?.last_activity_at ??
                      session?.started_at ??
                      session?.created_at ??
                      null,
                  )}
                </td>
                <td className="py-3 pr-4">
                  {(!session || isTerminal) && (
                    <form action={generateInviteLink}>
                      <input
                        type="hidden"
                        name="interviewee_id"
                        value={ic.id}
                      />
                      <button
                        type="submit"
                        className="rounded border border-near px-3 py-1 text-[12px] text-near hover:bg-near hover:text-soft transition-colors"
                      >
                        Generate link
                      </button>
                    </form>
                  )}
                  {isActive && (
                    <form action={generateInviteLink}>
                      <input
                        type="hidden"
                        name="interviewee_id"
                        value={ic.id}
                      />
                      <button
                        type="submit"
                        className="rounded border border-ash px-3 py-1 text-[12px] text-ash hover:border-burnt hover:text-burnt transition-colors"
                        title="Supersedes current link; current session marked expired."
                      >
                        Re-generate
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="mt-6 text-[11px] italic text-ash">
        Distribution: paste the invite URL into the shared Google Chat
        with execs. No automated emails until Step 8 of the build.
      </p>
    </main>
  );
}
