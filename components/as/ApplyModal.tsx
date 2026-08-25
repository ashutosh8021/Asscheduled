"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { useModal } from "./ModalProvider";
import { APPLY, STATES, CONTACT_EMAIL } from "@/lib/copy";
import { DEPARTURES } from "@/lib/departures";
import { EVENTS, track } from "@/lib/analytics";
import UploadFields from "./UploadFields";

/* "I am coming." — the two-step application overlay from comps (12) and (14).

   State is React state only. CLAUDE.md forbids localStorage/sessionStorage
   for application state; persistence arrives with Supabase in Phase 2. */

interface Answers {
  name: string;
  phone: string;
  gender: string;
  age: string;
  state: string;
  occupation: string;
  college: string;
  event: string;
  instagram: string;
  why: string;
}

const EMPTY: Answers = {
  name: "",
  phone: "",
  gender: "",
  age: "",
  state: "",
  occupation: "",
  college: "",
  event: "",
  instagram: "",
  why: "",
};

/* Eligibility bounds. Mirrored server-side in
   app/api/somewhere/apply/route.ts — the client copy is for feedback,
   the server copy is the one that actually holds. */
export const MIN_AGE = 18;
export const MAX_AGE = 60;

/* Step 1 gates on the fields the comp marks required. */
function validateStep1(a: Answers): Partial<Record<keyof Answers, string>> {
  const e: Partial<Record<keyof Answers, string>> = {};
  if (a.name.trim().length < 2) e.name = "We need a name.";
  if (!/^[6-9]\d{9}$/.test(a.phone.replace(/\s/g, ""))) e.phone = "Ten digits, Indian mobile.";
  if (!a.gender) e.gender = "Pick one.";

  /* 18 is a hard floor, not a preference: below it we would be
     processing a minor's personal data, which India's DPDP Act allows
     only with verifiable parental consent this form does not collect. */
  const age = Number(a.age);
  if (!Number.isInteger(age)) e.age = "Enter your age in years.";
  else if (age < MIN_AGE) e.age = `You must be ${MIN_AGE} or over to apply.`;
  else if (age > MAX_AGE) e.age = `Age ${MAX_AGE} or under.`;

  if (!a.state) e.state = "Pick your state.";
  if (!a.occupation) e.occupation = "Pick one.";
  if (a.college.trim().length < 2) e.college = "Where do you study?";
  if (!a.event) e.event = "Pick the one you want.";
  return e;
}

export default function ApplyModal() {
  const { close, preselect, source } = useModal();
  const [step, setStep] = useState<1 | 2>(1);
  /* Ignore a preselect for a departure that has since closed — a stale
     tab or an old link should not land someone on a dead selection. */
  const openPreselect =
    preselect && DEPARTURES.some((d) => d.id === preselect && !d.soldOut)
      ? preselect
      : "";
  const [a, setA] = useState<Answers>({ ...EMPTY, event: openPreselect });
  const [errors, setErrors] = useState<Partial<Record<keyof Answers, string>>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { reference: string; delivered: boolean; upload?: string | null }>(null);

  /* The funnel starts here. The modal is only mounted while it is open,
     so mounting is opening. Departure code and originating surface only —
     never an answer, a name, an email or a phone number. */
  useEffect(() => {
    track(EVENTS.applyStart, {
      trip: openPreselect || "none",
      source: source ?? "unknown",
    });
    /* Once per open: the deps are read at mount and do not change while
       this instance lives. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof Answers>(k: K, v: Answers[K]) {
    setA((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  function next() {
    const e = validateStep1(a);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(2);
      track(EVENTS.applyStep2, { trip: a.event || "none" });
    }
  }

  async function submit() {
    setSending(true);
    try {
      const res = await fetch("/api/somewhere/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(a),
      });
      const json = (await res.json()) as {
        ok: boolean;
        reference?: string;
        received?: boolean;
        /* Present only for departures that ask for ID at application
           time, and only when the row actually stored. */
        upload?: string | null;
      };
      /* `received` is true if the application was stored OR mailed —
         either one means we have it. */
      if (json.ok && json.reference && json.received) {
        setDone({ reference: json.reference, delivered: true, upload: json.upload ?? null });
        track(EVENTS.applicationLodged, { trip: a.event || "none" });
      } else {
        setDone({ reference: "—", delivered: false });
        track(EVENTS.applyFailed, { trip: a.event || "none", reason: "rejected" });
      }
    } catch {
      setDone({ reference: "—", delivered: false });
      track(EVENTS.applyFailed, { trip: a.event || "none", reason: "network" });
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

  /* ---- confirmation ---- */
  if (done) {
    return (
      <ModalShell labelledBy="apply-done">
        <h2 id="apply-done" className="s-modal-h">
          {done.delivered ? "You're in the pile" : "Almost"}
          <span className="s-dot">.</span>
        </h2>
        <p className="s-modal-sub">
          {done.delivered
            ? done.upload
              ? "Two documents and you're done."
              : "We read every single one. We'll come back to you."
            : "We could not file that from here."}
        </p>

        <div style={{ maxWidth: 460, margin: "28px auto 0", textAlign: "center" }}>
          {done.delivered ? (
            <p className="s-hint" style={{ fontSize: 13 }}>
              REFERENCE — {done.reference}
            </p>
          ) : (
            /* An unsent form must never look sent. */
            <p className="s-body" style={{ margin: "0 auto", fontSize: 14 }}>
              Send it to us directly instead:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--s-rust)" }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          )}

          {done.upload ? (
            <div style={{ marginTop: 22, textAlign: "left" }}>
              <UploadFields token={done.upload} compact />
            </div>
          ) : null}

          <div className="s-modal-actions">
            <button type="button" className="s-btn s-btn-forest" onClick={close}>
              {done.upload ? "DONE" : "CLOSE"}
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell labelledBy="apply-title">
      <h2 id="apply-title" className="s-modal-h">
        {APPLY.title}
        <span className="s-dot">.</span>
      </h2>
      <p className="s-modal-sub">{APPLY.sub}</p>

      {/* stepper */}
      <div className="s-steps">
        <div className="s-step" data-active={step === 1}>
          <span className="s-step-dot">1</span>
          <span className="s-step-l">{APPLY.steps[0]}</span>
        </div>
        <span className="s-step-bar" data-done={step === 2} />
        <div className="s-step" data-active={step === 2}>
          <span className="s-step-dot">2</span>
          <span className="s-step-l">{APPLY.steps[1]}</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) next();
          else void submit();
        }}
      >
        {step === 1 ? (
          <div className="s-form-grid">
            <div className="s-field s-field-full">
              <label htmlFor="ap-name">
                {APPLY.fields.name.label} <span className="s-req">*</span>
              </label>
              <input
                id="ap-name"
                className="s-input"
                placeholder={APPLY.fields.name.ph}
                value={a.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
              />
              {err("name")}
            </div>

            <div className="s-field">
              <label htmlFor="ap-phone">
                {APPLY.fields.phone.label} <span className="s-req">*</span>
              </label>
              <div className="s-phone">
                <span className="s-phone-cc">+91</span>
                <input
                  id="ap-phone"
                  className="s-input"
                  inputMode="numeric"
                  placeholder={APPLY.fields.phone.ph}
                  value={a.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  aria-invalid={Boolean(errors.phone)}
                  autoComplete="tel-national"
                />
              </div>
              {err("phone")}
            </div>

            <div className="s-field">
              <label htmlFor="ap-gender">
                {APPLY.fields.gender.label} <span className="s-req">*</span>
              </label>
              <div className="s-selwrap">
                <select
                  id="ap-gender"
                  className="s-select"
                  value={a.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  aria-invalid={Boolean(errors.gender)}
                >
                  <option value="">{APPLY.fields.gender.ph}</option>
                  {APPLY.genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              {err("gender")}
            </div>

            <div className="s-field">
              <label htmlFor="ap-age">
                {APPLY.fields.age.label} <span className="s-req">*</span>
              </label>
              <input
                id="ap-age"
                className="s-input"
                inputMode="numeric"
                placeholder={APPLY.fields.age.ph}
                value={a.age}
                onChange={(e) => set("age", e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
                aria-invalid={Boolean(errors.age)}
                aria-describedby="ap-age-hint"
              />
              {err("age") ?? (
                <span className="s-hint" id="ap-age-hint">
                  {APPLY.fields.age.hint}
                </span>
              )}
            </div>

            <div className="s-field">
              <label htmlFor="ap-state">
                {APPLY.fields.state.label} <span className="s-req">*</span>
              </label>
              <div className="s-selwrap">
                <select
                  id="ap-state"
                  className="s-select"
                  value={a.state}
                  onChange={(e) => set("state", e.target.value)}
                  aria-invalid={Boolean(errors.state)}
                >
                  <option value="">{APPLY.fields.state.ph}</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {err("state")}
            </div>

            <div className="s-field">
              <label htmlFor="ap-occ">
                {APPLY.fields.occupation.label} <span className="s-req">*</span>
              </label>
              <div className="s-selwrap">
                <select
                  id="ap-occ"
                  className="s-select"
                  value={a.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                  aria-invalid={Boolean(errors.occupation)}
                >
                  <option value="">{APPLY.fields.occupation.ph}</option>
                  {APPLY.occupations.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              {err("occupation")}
            </div>

            <div className="s-field s-field-full">
              <label htmlFor="ap-college">
                {APPLY.fields.college.label} <span className="s-req">*</span>
              </label>
              <input
                id="ap-college"
                className="s-input"
                placeholder={APPLY.fields.college.ph}
                value={a.college}
                onChange={(e) => set("college", e.target.value)}
                aria-invalid={Boolean(errors.college)}
              />
              {err("college")}
            </div>

            <div className="s-field s-field-full">
              <label htmlFor="ap-event">
                {APPLY.fields.event.label} <span className="s-req">*</span>
              </label>
              <div className="s-selwrap">
                <select
                  id="ap-event"
                  className="s-select"
                  value={a.event}
                  onChange={(e) => set("event", e.target.value)}
                  aria-invalid={Boolean(errors.event)}
                >
                  <option value="">{APPLY.fields.event.ph}</option>
                    {/* Closed departures are dropped rather than shown
                        disabled: an option nobody can pick is a dead end.
                        The API refuses them regardless. */}
                  {DEPARTURES.filter((d) => !d.soldOut).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fest} — {d.campus}
                    </option>
                  ))}
                </select>
              </div>
              {err("event")}
            </div>
          </div>
        ) : (
          <div className="s-form-grid">
            <div className="s-field s-field-full">
              <label htmlFor="ap-ig">{APPLY.fields.instagram.label}</label>
              <div className="s-phone">
                <span className="s-phone-cc">@</span>
                <input
                  id="ap-ig"
                  className="s-input"
                  placeholder={APPLY.fields.instagram.ph}
                  value={a.instagram}
                  onChange={(e) => set("instagram", e.target.value.replace(/^@/, ""))}
                />
              </div>
              <span className="s-hint">{APPLY.fields.instagram.hint}</span>
            </div>

            <div className="s-field s-field-full">
              <label htmlFor="ap-why">{APPLY.fields.why.label}</label>
              <textarea
                id="ap-why"
                className="s-textarea"
                placeholder={APPLY.fields.why.ph}
                maxLength={APPLY.fields.why.max}
                value={a.why}
                onChange={(e) => set("why", e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span className="s-hint">{APPLY.fields.why.hint}</span>
                <span className="s-hint">
                  {a.why.length}/{APPLY.fields.why.max}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="s-modal-actions">
          {step === 2 ? (
            <button type="button" className="s-back" onClick={() => setStep(1)}>
              {APPLY.back}
            </button>
          ) : null}

          <button type="submit" className="s-btn s-btn-forest" disabled={sending}>
            {step === 1 ? (
              <>
                {APPLY.next} <span className="s-arrow">→</span>
              </>
            ) : sending ? (
              "SENDING…"
            ) : (
              APPLY.submit
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
