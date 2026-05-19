"use client";

// Interviewee input form. Client component so we can:
//   1. Reset the textarea after each successful submission (otherwise
//      the user's previous reply sits in the box until they delete it).
//   2. Show a "Thinking…" pending indicator while the server action is
//      running. The Anthropic round-trip takes ~3-5s in production —
//      without a pending indicator the click feels unresponsive.
//
// Per A1 §9 (minimal chrome), no chips / emoji / avatars are added —
// just a button label change and a single-line composing indicator.

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { sendMessage } from "@/app/i/[token]/chat/actions";

interface MessageFormProps {
  token: string;
  disabled?: boolean;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded border border-near bg-near px-5 py-2 text-[13px] text-soft hover:bg-burnt hover:border-burnt transition-colors disabled:bg-silver disabled:border-silver disabled:cursor-not-allowed"
    >
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

function ThinkingIndicator() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div
      className="mt-3 flex items-center gap-2 text-[12px] italic text-ash"
      aria-live="polite"
    >
      <span
        className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ash"
        aria-hidden="true"
      />
      Aperture is composing a response…
    </div>
  );
}

export function MessageForm({ token, disabled = false }: MessageFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await sendMessage(formData);
        // Clear the textarea after the action completes successfully.
        // If sendMessage throws (e.g., redirect), this line is skipped
        // and Next.js handles the navigation.
        formRef.current?.reset();
      }}
      className="mt-6 space-y-3"
    >
      <input type="hidden" name="token" value={token} />
      <textarea
        name="text"
        rows={3}
        required
        disabled={disabled}
        placeholder={
          disabled
            ? "Session ended."
            : "Type your reply here, then click Send to continue."
        }
        autoFocus={!disabled}
        className="w-full rounded border border-silver bg-white px-3 py-2 text-[14px] leading-body text-charcoal focus:border-navy focus:outline-none disabled:bg-soft disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-end">
        <SubmitButton disabled={disabled} />
      </div>
      <ThinkingIndicator />
    </form>
  );
}
