"use client";

import { useState } from "react";
import { CONTACT, CREW, STATES } from "@/lib/copy";

/* "APPLY TO CREW." — the ambassador signup on /crew.
 *
 * Posts to /api/somewhere/crew. Three honest endings: received, already
 * on the list, or not sent — and "not sent" points at a phone number
 * rather than the published inbox, which nobody is currently reading. */

interface Answers {
  name: string;
  phone: string;
  email: string;
  age: string;
  college: string;
  year: string;
  city: string;
  state: string;
  instagram: string;
  reach: string;
  why: string;
}

const EMPTY: Answers = {
  name: "",
  phone: "",
  email: "",
  age: "",
  college: "",
  year: "",
  city: "",
  state: "",
  instagram: "",
  reach: "",
  why: "",
};

type Errors = Partial<Record<keyof Answers, string>>;

/* Mirrors app/api/somewhere/crew/route.ts. The client copy is for
   feedback; the server copy is the one that holds. */
function validate(a: Answers): Errors {
  const e: Errors = {};
  if (a.name.trim().length < 2) e.name = "We need a name.";
  if (!/^[6-9]\d{9}$/.test(a.phone.replace(/\s/g, ""))) e.phone = "Ten digits, Indian mobile.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) e.email = "That email will not reach you.";

  const age = Number(a.age);
  if (!Number.isInteger(age)) e.age = "Enter your age in years.";
  else if (age < 18) e.age = "Crew must be 18 or over.";
  else if (age > 60) e.age = "Age 60 or under.";

  if (a.college.trim().length < 2) e.college = "Which college?";
  if (!a.year) e.year = "Pick one.";
  if (a.city.trim().length < 2) e.city = "Which city?";
  if (!a.state) e.state = "Pick your state.";
  if (a.reach.trim().length < 10) e.reach = "Name the groups. This is what we select on.";
  return e;
}

type Done =
  | { kind: "sent" }
  | { kind: "duplicate" }
  | { kind: "failed"; message: string | null };

export default function CrewForm() {
  const [a, setA] = useState<Answers>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

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
      const res = await fetch("/api/somewhere/crew", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(a),
      });
      const json = (await res.json()) as {
        ok: boolean;
        received?: boolean;
        duplicate?: boolean;
        error?: string;
      };

      if (json.ok && json.duplicate) setDone({ kind: "duplicate" });
      else if (json.ok && json.received) setDone({ kind: "sent" });
      /* The server's own words when it has them — a rate limit says
         "wait a few minutes", which is more useful than a generic
         failure that invites an immediate retry. */
      else setDone({ kind: "failed", message: json.ok ? null : (json.error ?? null) });
    } catch {
      setDone({ kind: "failed", message: null });
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
    const title =
      done.kind === "sent"
        ? CREW.sentTitle
        : done.kind === "duplicate"
          ? CREW.duplicateTitle
          : CREW.failedTitle;

    return (
      <div className="s-panel s-crew-done" role="status">
        <p className="s-eyebrow" style={{ color: "var(--s-rust)" }}>
          {title}
        </p>

        {done.kind === "sent" ? <p className="s-body">{CREW.sentBody}</p> : null}
        {done.kind === "duplicate" ? <p className="s-body">{CREW.duplicateBody}</p> : null}

        {done.kind === "failed" ? (
          <>
            <p className="s-body">{done.message ?? CREW.failedBody}</p>
            {done.message ? null : (
              <p className="s-crew-phones">
                {CONTACT.phones.map((n) => (
                  <a key={n} href={`tel:+91${n}`}>
                    +91 {n.slice(0, 5)} {n.slice(5)}
                  </a>
                ))}
              </p>
            )}
            <button type="button" className="s-btn" onClick={() => setDone(null)}>
              TRY AGAIN
            </button>
          </>
        ) : null}
      </div>
    );
  }

  const f = CREW.fields;

  return (
    <form
      className="s-panel"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="s-eyebrow" style={{ color: "var(--s-rust)", marginBottom: 24 }}>
        {CREW.formTitle}
      </p>

      <div className="s-form-grid">
        <div className="s-field s-field-full">
          <label htmlFor="cr-name">
            {f.name.label} <span className="s-req">*</span>
          </label>
          <input
            id="cr-name"
            className="s-input"
            placeholder={f.name.ph}
            value={a.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
          />
          {err("name")}
        </div>

        <div className="s-field">
          <label htmlFor="cr-phone">
            {f.phone.label} <span className="s-req">*</span>
          </label>
          <input
            id="cr-phone"
            className="s-input"
            inputMode="numeric"
            placeholder={f.phone.ph}
            value={a.phone}
            onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel-national"
          />
          {err("phone")}
        </div>

        <div className="s-field">
          <label htmlFor="cr-email">
            {f.email.label} <span className="s-req">*</span>
          </label>
          <input
            id="cr-email"
            type="email"
            className="s-input"
            placeholder={f.email.ph}
            value={a.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
          {err("email")}
        </div>

        <div className="s-field">
          <label htmlFor="cr-age">
            {f.age.label} <span className="s-req">*</span>
          </label>
          <input
            id="cr-age"
            className="s-input"
            inputMode="numeric"
            placeholder={f.age.ph}
            value={a.age}
            onChange={(e) => set("age", e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
            aria-invalid={Boolean(errors.age)}
          />
          {err("age") ?? <span className="s-hint">{f.age.hint}</span>}
        </div>

        <div className="s-field">
          <label htmlFor="cr-year">
            {f.year.label} <span className="s-req">*</span>
          </label>
          <div className="s-selwrap">
            <select
              id="cr-year"
              className="s-select"
              value={a.year}
              onChange={(e) => set("year", e.target.value)}
              aria-invalid={Boolean(errors.year)}
            >
              <option value="">{f.year.ph}</option>
              {CREW.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {err("year")}
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="cr-college">
            {f.college.label} <span className="s-req">*</span>
          </label>
          <input
            id="cr-college"
            className="s-input"
            placeholder={f.college.ph}
            value={a.college}
            onChange={(e) => set("college", e.target.value)}
            aria-invalid={Boolean(errors.college)}
            autoComplete="organization"
          />
          {err("college")}
        </div>

        <div className="s-field">
          <label htmlFor="cr-city">
            {f.city.label} <span className="s-req">*</span>
          </label>
          <input
            id="cr-city"
            className="s-input"
            placeholder={f.city.ph}
            value={a.city}
            onChange={(e) => set("city", e.target.value)}
            aria-invalid={Boolean(errors.city)}
            autoComplete="address-level2"
          />
          {err("city")}
        </div>

        <div className="s-field">
          <label htmlFor="cr-state">
            {f.state.label} <span className="s-req">*</span>
          </label>
          <div className="s-selwrap">
            <select
              id="cr-state"
              className="s-select"
              value={a.state}
              onChange={(e) => set("state", e.target.value)}
              aria-invalid={Boolean(errors.state)}
            >
              <option value="">{f.state.ph}</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {err("state")}
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="cr-instagram">{f.instagram.label}</label>
          <input
            id="cr-instagram"
            className="s-input"
            placeholder={f.instagram.ph}
            value={a.instagram}
            onChange={(e) => set("instagram", e.target.value.trim())}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="cr-reach">
            {f.reach.label} <span className="s-req">*</span>
          </label>
          <textarea
            id="cr-reach"
            className="s-textarea"
            placeholder={f.reach.ph}
            value={a.reach}
            onChange={(e) => set("reach", e.target.value)}
            aria-invalid={Boolean(errors.reach)}
          />
          {err("reach") ?? <span className="s-hint">{f.reach.hint}</span>}
        </div>

        <div className="s-field s-field-full">
          <label htmlFor="cr-why">{f.why.label}</label>
          <textarea
            id="cr-why"
            className="s-textarea"
            placeholder={f.why.ph}
            value={a.why}
            onChange={(e) => set("why", e.target.value)}
          />
        </div>

        <p className="s-field s-field-full s-consent">
          {CREW.consentLead}{" "}
          <a href="/paperwork/privacy" target="_blank" rel="noreferrer">
            {CREW.consentLink}
          </a>
          .
        </p>
      </div>

      <button
        type="submit"
        className="s-btn"
        style={{ width: "100%", marginTop: 22, justifyContent: "space-between" }}
        disabled={sending}
      >
        {sending ? "SENDING…" : CREW.submit}
        <span className="s-arrow">→</span>
      </button>
    </form>
  );
}
