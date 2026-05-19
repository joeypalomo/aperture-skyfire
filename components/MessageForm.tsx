// Interviewee input form. Server-action driven — no client JS
// required. Minimal chrome per A1 §9: textarea + Send button, no
// suggested-reply chips, no emoji picker.
//
// The button reads "Send" rather than the more conversational
// "Reply" to keep the interface chrome neutral. The voice is in the
// agent's responses, not in the UI.

import { sendMessage } from "@/app/i/[token]/chat/actions";

interface MessageFormProps {
  token: string;
  disabled?: boolean;
}

export function MessageForm({ token, disabled = false }: MessageFormProps) {
  return (
    <form action={sendMessage} className="mt-6 space-y-3">
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
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="rounded border border-near bg-near px-5 py-2 text-[13px] text-soft hover:bg-burnt hover:border-burnt transition-colors disabled:bg-silver disabled:border-silver disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}
