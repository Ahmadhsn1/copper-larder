"use client";

// Inline "have the team ring you" card, shown under a bot message whenever
// the chat response set showCallbackCard. Owns its own submit lifecycle and
// talks to /api/lead directly — useChat knows nothing about lead capture.

import { useState, type FormEvent } from "react";

type CallbackCardProps = {
  sessionId: string;
};

type Status = "idle" | "submitting" | "success" | "error";

type LeadResponse = { ok: true; duplicate?: boolean } | { error: string };

function isLeadResponse(value: unknown): value is LeadResponse {
  return typeof value === "object" && value !== null && ("ok" in value || "error" in value);
}

/** Light sanity check, not full validation: enough digits, plausible chars. */
function isPlausiblePhone(value: string): boolean {
  const digitCount = (value.match(/\d/g) ?? []).length;
  return digitCount >= 7 && /^[\d+()\-.\s]+$/.test(value);
}

export function CallbackCard({ sessionId }: CallbackCardProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = status === "submitting";
  const isDone = status === "success";

  async function submitLead() {
    setStatus("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name: name.trim(), phone: phone.trim(), preferredTime: preferredTime.trim() }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (res.ok && isLeadResponse(json) && "ok" in json && json.ok) {
        setStatus("success");
        return;
      }
      const message = json && isLeadResponse(json) && "error" in json ? json.error : "Couldn't send that — mind trying again?";
      setSubmitError(message);
      setStatus("error");
    } catch {
      setSubmitError("Couldn't reach the kitchen — mind trying again?");
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !preferredTime.trim()) return;
    if (!isPlausiblePhone(phone.trim())) {
      setPhoneError("That doesn't quite look like a phone number.");
      return;
    }
    setPhoneError(null);
    void submitLead();
  }

  if (isDone) {
    return (
      <div className="w-full max-w-[85%] rounded-xl border border-accent-2/20 bg-accent-2/5 px-4 py-3 text-[14px] text-accent-2">
        Lovely — they&apos;ll ring you within 10 minutes.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[85%] rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.06)]"
      noValidate
    >
      <p className="mb-3 font-serif text-[15px] text-ink">Get a call back</p>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="cb-name" className="text-[12px] font-medium text-muted">
            Name
          </label>
          <input
            id="cb-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-border bg-bg px-3 text-[14px] text-ink outline-none focus-visible:border-accent disabled:opacity-60"
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cb-phone" className="text-[12px] font-medium text-muted">
            Phone
          </label>
          <input
            id="cb-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-border bg-bg px-3 text-[14px] text-ink outline-none focus-visible:border-accent disabled:opacity-60"
            autoComplete="tel"
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? "cb-phone-error" : undefined}
          />
          {phoneError && (
            <p id="cb-phone-error" className="text-[12px] text-red-700">
              {phoneError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cb-time" className="text-[12px] font-medium text-muted">
            Preferred time
          </label>
          <input
            id="cb-time"
            type="text"
            required
            placeholder="e.g. this evening, after 6"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-border bg-bg px-3 text-[14px] text-ink placeholder:text-muted/60 outline-none focus-visible:border-accent disabled:opacity-60"
          />
        </div>

        {submitError && (
          <p role="alert" className="text-[12px] text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-lg bg-accent text-[14px] font-medium text-white transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending…" : status === "error" ? "Try again" : "Request a call back"}
        </button>
      </div>
    </form>
  );
}
