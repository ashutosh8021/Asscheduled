"use client";

import { useState } from "react";
import ModalShell from "./ModalShell";
import { useModal } from "./ModalProvider";
import { COLLAB, CONTACT_EMAIL } from "@/lib/copy";

/* "Let's collaborate." — comp (13). */

interface Answers {
  name: string;
  org: string;
  email: string;
  phone: string;
  type: string;
  dates: string;
  location: string;
  on: string[];
  more: string;
}

const EMPTY: Answers = {
  name: "",
  org: "",
  email: "",
  phone: "",
  type: "",
  dates: "",
  location: "",
  on: [],
  more: "",
};

function validate(a: Answers): Partial<Record<keyof Answers, string>> {
  const e: Partial<Record<keyof Answers, string>> = {};
  if (a.name.trim().length < 2) e.name = "We need a name.";
  if (a.org.trim().length < 2) e.org = "Who are you with?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) e.email = "That email will not reach you.";
  if (a.phone && !/^[6-9]\d{9}$/.test(a.phone.replace(/\s/g, ""))) e.phone = "Ten digits, Indian mobile.";
  if (!a.type) e.type = "Pick a type.";
  if (a.more.trim().length < 10) e.more = "Give us a little more than that.";
  return e;
}

export default function CollabModal() {
  const { close } = useModal();
  const [a, setA] = useState<Answers>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Answers, string>>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { delivered: boolean }>(null);

  function set<K extends keyof Answers>(k: K, v: Answers[K]) {
    setA((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  function toggleOn(value: string) {
    setA((prev) => ({
      ...prev,
      on: prev.on.includes(value) ? prev.on.filter((v) => v !== value) : [...prev.on, value],
    }));
  }

  async function submit() {
    const e = validate(a);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    try {
      const res = await fetch("/api/somewhere/collab", {
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

  if (done) {
    return (
      <ModalShell labelledBy="collab-done">
        <h2 id="collab-done" className="s-modal-h">
          {done.delivered ? "Got it" : "Almost"}
          <span className="s-dot">.</span>
        </h2>
        <p className="s-modal-sub">
          {done.delivered ? COLLAB.reply.join(" ") : "We could not send that from here."}
        </p>
        <div style={{ textAlign: "center", marginTop: 22 }}>
          {done.delivered ? null : (
            <p className="s-body" style={{ margin: "0 auto", fontSize: 14 }}>
              Mail us directly:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--s-rust)" }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          )}
          <div className="s-modal-actions">
            <button type="button" className="s-btn s-btn-forest" onClick={close}>
              CLOSE
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell labelledBy="collab-title">
      <h2 id="collab-title" className="s-modal-h">
        {COLLAB.title}
      </h2>
      <p className="s-modal-sub">
        {COLLAB.sub[0]}
        <br />
        {COLLAB.sub[1]}
      </p>

      <form
        style={{ marginTop: 30 }}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="s-form-grid">
          <div className="s-field">
            <label htmlFor="cl-name">{COLLAB.fields.name.label}</label>
            <input
              id="cl-name"
              className="s-input"
              placeholder={COLLAB.fields.name.ph}
              value={a.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
            />
            {err("name")}
          </div>

          <div className="s-field">
            <label htmlFor="cl-org">{COLLAB.fields.org.label}</label>
            <input
              id="cl-org"
              className="s-input"
              placeholder={COLLAB.fields.org.ph}
              value={a.org}
              onChange={(e) => set("org", e.target.value)}
              aria-invalid={Boolean(errors.org)}
              autoComplete="organization"
            />
            {err("org")}
          </div>

          <div className="s-field">
            <label htmlFor="cl-email">{COLLAB.fields.email.label}</label>
            <input
              id="cl-email"
              type="email"
              className="s-input"
              placeholder={COLLAB.fields.email.ph}
              value={a.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
            />
            {err("email")}
          </div>

          <div className="s-field">
            <label htmlFor="cl-phone">{COLLAB.fields.phone.label}</label>
            <div className="s-phone">
              <span className="s-phone-cc">+91</span>
              <input
                id="cl-phone"
                className="s-input"
                inputMode="numeric"
                placeholder={COLLAB.fields.phone.ph}
                value={a.phone}
                onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                aria-invalid={Boolean(errors.phone)}
                autoComplete="tel-national"
              />
            </div>
            {err("phone")}
          </div>

          <div className="s-field">
            <label htmlFor="cl-type">{COLLAB.fields.type.label}</label>
            <div className="s-selwrap">
              <select
                id="cl-type"
                className="s-select"
                value={a.type}
                onChange={(e) => set("type", e.target.value)}
                aria-invalid={Boolean(errors.type)}
              >
                <option value="">{COLLAB.fields.type.ph}</option>
                {COLLAB.types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {err("type")}
          </div>

          <div className="s-field">
            <label htmlFor="cl-dates">{COLLAB.fields.dates.label}</label>
            <input
              id="cl-dates"
              className="s-input"
              placeholder={COLLAB.fields.dates.ph}
              value={a.dates}
              onChange={(e) => set("dates", e.target.value)}
            />
          </div>

          <div className="s-field">
            <label htmlFor="cl-loc">{COLLAB.fields.location.label}</label>
            <input
              id="cl-loc"
              className="s-input"
              placeholder={COLLAB.fields.location.ph}
              value={a.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>

          {/* "Select all that apply" — a real multi-select, not a select
              element pretending to be one. */}
          <fieldset className="s-field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend
              style={{
                fontFamily: "var(--s-mono)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {COLLAB.fields.on.label}
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COLLAB.collabOn.map((o) => {
                const on = a.on.includes(o);
                return (
                  <label
                    key={o}
                    className="s-chip"
                    style={{
                      cursor: "pointer",
                      background: on ? "var(--s-forest)" : "var(--s-paper-2)",
                      color: on ? "var(--s-bone)" : "var(--s-ink)",
                      borderColor: on ? "var(--s-forest)" : "var(--s-line)",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="s-sr"
                      checked={on}
                      onChange={() => toggleOn(o)}
                    />
                    {o}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="s-field s-field-full">
            <label htmlFor="cl-more">{COLLAB.fields.more.label}</label>
            <textarea
              id="cl-more"
              className="s-textarea"
              placeholder={COLLAB.fields.more.ph}
              value={a.more}
              onChange={(e) => set("more", e.target.value)}
              aria-invalid={Boolean(errors.more)}
            />
            {err("more")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginTop: 26,
            flexWrap: "wrap",
          }}
        >
          <p className="s-hint" style={{ lineHeight: 1.6 }}>
            {COLLAB.reply[0]}
            <br />
            {COLLAB.reply[1]}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button type="button" className="s-back" onClick={close}>
              {COLLAB.back}
            </button>
            <button type="submit" className="s-btn s-btn-forest" disabled={sending}>
              {sending ? "SENDING…" : COLLAB.submit}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
