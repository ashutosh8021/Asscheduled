"use client";

import { useState } from "react";
import { CONTACT, CONTACT_EMAIL } from "@/lib/copy";

/* "TELL US WHAT'S UNSCHEDULED." — comps (2) and (3).

   Posts to /api/somewhere/contact, which mails it. If the send did not
   land, the form says so and shows the address instead of a success
   state it has not earned. */

interface Answers {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY: Answers = { name: "", email: "", phone: "", message: "" };

function validate(a: Answers): Partial<Record<keyof Answers, string>> {
  const e: Partial<Record<keyof Answers, string>> = {};
  if (a.name.trim().length < 2) e.name = "We need a name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) e.email = "That email will not reach you.";
  if (!/^[6-9]\d{9}$/.test(a.phone.replace(/\s/g, ""))) e.phone = "Ten digits, Indian mobile.";
  if (a.message.trim().length < 5) e.message = "Tell us a bit more.";
  return e;
}

export default function ContactForm() {
  const [a, setA] = useState<Answers>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Answers, string>>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { delivered: boolean }>(null);

  function set<K extends keyof Answers>(k: K, v: Answers[K]) {
    setA((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  async function submit() {
    const e = validate(a);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    try {
      const res = await fetch("/api/somewhere/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(a),
      });
      const json = (await res.json()) as { ok: boolean; received?: boolean };
      setDone({ delivered: Boolean(json.ok && json.received) });
    } catch {
      setDone({ delivered: false });
    } finally {
      setSending(false);
    }
  }

  const err = (k: keyof Answers) =>
    errors[k] ? (
      <span className="s-err" role="alert">
        {errors[k]}
      </span>
    ) : null;

  const panelStyle: React.CSSProperties = {
    background: "var(--s-ink-2)",
    color: "var(--s-paper)",
    padding: "clamp(24px,3.4vw,42px)",
  };

  if (done) {
    return (
      <div style={panelStyle}>
        <p className="s-eyebrow" style={{ color: "var(--s-rust)" }}>
          {done.delivered ? "SENT." : "NOT SENT."}
        </p>
        <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.7, color: "rgba(247,241,232,.82)" }}>
          {done.delivered ? (
            <>We read everything. We&rsquo;ll come back to you.</>
          ) : (
            <>
              We could not send that from here. Mail us directly at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--s-rust-soft)" }}>
                {CONTACT_EMAIL}
              </a>
              .
            </>
          )}
        </p>
        {done.delivered ? null : (
          <button
            type="button"
            className="s-btn"
            style={{ marginTop: 24 }}
            onClick={() => setDone(null)}
          >
            TRY AGAIN
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      style={panelStyle}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="s-eyebrow" style={{ color: "var(--s-rust)", marginBottom: 28 }}>
        {CONTACT.formTitle}
      </p>

      <div className="s-form-grid">
        <div className="s-field">
          <label htmlFor="ct-name" style={{ color: "var(--s-paper)" }}>
            {CONTACT.fields.name.label} <span className="s-req">*</span>
          </label>
          <input
            id="ct-name"
            className="s-input"
            style={{ background: "transparent", color: "var(--s-paper)", border: 0, borderBottom: "1px solid rgba(247,241,232,.3)", padding: "10px 0" }}
            placeholder={CONTACT.fields.name.ph}
            value={a.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
          />
          {err("name")}
        </div>

        <div className="s-field">
          <label htmlFor="ct-email" style={{ color: "var(--s-paper)" }}>
            {CONTACT.fields.email.label} <span className="s-req">*</span>
          </label>
          <input
            id="ct-email"
            type="email"
            className="s-input"
            style={{ background: "transparent", color: "var(--s-paper)", border: 0, borderBottom: "1px solid rgba(247,241,232,.3)", padding: "10px 0" }}
            placeholder={CONTACT.fields.email.ph}
            value={a.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
          {err("email")}
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="ct-phone" style={{ color: "var(--s-paper)" }}>
            {CONTACT.fields.phone.label} <span className="s-req">*</span>
          </label>
          <input
            id="ct-phone"
            className="s-input"
            inputMode="numeric"
            style={{ background: "transparent", color: "var(--s-paper)", border: 0, borderBottom: "1px solid rgba(247,241,232,.3)", padding: "10px 0" }}
            placeholder={CONTACT.fields.phone.ph}
            value={a.phone}
            onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel-national"
          />
          {err("phone")}
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="ct-msg" style={{ color: "var(--s-paper)" }}>
            {CONTACT.fields.message.label} <span className="s-req">*</span>
          </label>
          <textarea
            id="ct-msg"
            className="s-textarea"
            style={{ background: "transparent", color: "var(--s-paper)", border: 0, borderBottom: "1px solid rgba(247,241,232,.3)", padding: "10px 0" }}
            placeholder={CONTACT.fields.message.ph}
            value={a.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={Boolean(errors.message)}
          />
          {err("message")}
        </div>
      </div>

      <button
        type="submit"
        className="s-btn"
        style={{ width: "100%", marginTop: 30, justifyContent: "space-between" }}
        disabled={sending}
      >
        {sending ? "SENDING…" : CONTACT.submit}
        <span className="s-arrow">→</span>
      </button>

      <p className="s-hint" style={{ marginTop: 16, color: "rgba(247,241,232,.55)" }}>
        🔒 {CONTACT.privacy}
      </p>
    </form>
  );
}
