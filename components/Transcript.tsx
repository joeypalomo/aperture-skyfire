// Server-component message list. Renders agent and interviewee turns
// per the A1 §9 minimal-chrome spec: no avatars, no emoji, no chips,
// just speaker label + body text.

import type { Database } from "@/types/db";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

interface TranscriptProps {
  messages: MessageRow[];
  intervieweeDisplayName: string;
}

export function Transcript({
  messages,
  intervieweeDisplayName,
}: TranscriptProps) {
  if (messages.length === 0) {
    return null;
  }
  return (
    <ol className="space-y-8 list-none p-0">
      {messages.map((m) => {
        const isAperture = m.speaker === "aperture";
        const label = isAperture ? "APERTURE" : intervieweeDisplayName.toUpperCase();
        return (
          <li
            key={m.id}
            className={isAperture ? "" : "border-l-2 border-silver pl-4"}
          >
            <div className="font-sans text-[10px] uppercase tracking-wide text-ash mb-2">
              {label}
            </div>
            <div className="font-sans text-[14px] leading-body text-charcoal whitespace-pre-wrap">
              {m.text}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
