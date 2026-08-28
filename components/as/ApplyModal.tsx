"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { useModal } from "./ModalProvider";
import { APPLY, STATES, CONTACT_EMAIL } from "@/lib/copy";
import { DEPARTURES, inr } from "@/lib/departures";
import { EVENTS, track } from "@/lib/analytics";
import DropZone, { rejectReason, type ZoneState } from "./DropZone";
import { DOCUMENT_LABELS, SizeNote } from "./UploadFields";
import { DOCUMENT_KINDS, PAYMENT_KIND, type DocumentKind } from "@/lib/documentRules";

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

  /* Documents are chosen in step 2 but cannot be sent yet — there is no
     application to attach them to until the form is submitted. They are
     held here and go up immediately afterwards, so the whole thing
     reads as one action. */
  const [files, setFiles] = useState<Partial<Record<DocumentKind, File>>>({});
  const [fileErrors, setFileErrors] = useState<Partial<Record<DocumentKind, string>>>({});
  /* Partial rather than complete: which kinds are in play depends on
     the departure, and anything absent reads as "idle". */
  const [docState, setDocState] = useState<Partial<Record<DocumentKind, ZoneState>>>({});
  const [utr, setUtr] = useState("");
  /* Its own state rather than a key on `errors`, which is typed to the
     answers and does not have a UTR in it. */
  const [utrError, setUtrError] = useState<string | null>(null);

  const chosen = DEPARTURES.find((d) => d.id === a.event);

  /* Whether the chosen departure collects ID as part of applying. */
  const needsDocuments = chosen?.documentsAtApply === true;

  /* Whether it takes a booking amount by UPI. The figure shown is the
     full one — the partner discount is applied by the server, and the
     confirmation reports what was actually charged. */
  const needsPayment = typeof chosen?.bookingInr === "number" && chosen.bookingInr > 0;

  function pick(kind: DocumentKind, file: File) {
    const bad = rejectReason(file);
    if (bad) {
      setFileErrors((e) => ({ ...e, [kind]: bad }));
      setDocState((s) => ({ ...s, [kind]: "error" }));
      return;
    }
    setFiles((f) => ({ ...f, [kind]: file }));
    setFileErrors((e) => ({ ...e, [kind]: undefined }));
    setDocState((s) => ({ ...s, [kind]: "idle" }));
  }

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

  /** Sends whatever step 2 collected, once there is a token for it. */
  async function sendHeldFiles(token: string) {
    /* The payment screenshot rides along with the identity documents —
       same token, same route, same private bucket. */
    const kinds: DocumentKind[] = needsPayment
      ? [...DOCUMENT_KINDS, PAYMENT_KIND]
      : [...DOCUMENT_KINDS];

    for (const kind of kinds) {
      const file = files[kind];
      if (!file) continue;

      setDocState((s) => ({ ...s, [kind]: "sending" }));
      const body = new FormData();
      body.set("token", token);
      body.set("kind", kind);
      body.set("file", file);

      try {
        const res = await fetch("/api/documents/upload", { method: "POST", body });
        const json = (await res.json()) as { ok: boolean; error?: string };
        setDocState((s) => ({ ...s, [kind]: json.ok ? "done" : "error" }));
        if (!json.ok) {
          setFileErrors((e) => ({ ...e, [kind]: json.error ?? "That did not go through." }));
        }
      } catch {
        setDocState((s) => ({ ...s, [kind]: "error" }));
        setFileErrors((e) => ({ ...e, [kind]: "No connection. Try again." }));
      }
    }
  }

  async function submit() {
    /* Both documents are required where the departure asks for them —
       an application without them cannot be checked, which is the whole
       point of asking at this stage. */
    if (needsDocuments) {
      const missing = DOCUMENT_KINDS.filter((k) => !files[k]);
      if (missing.length) {
        setFileErrors((e) => {
          const next = { ...e };
          for (const k of missing) next[k] = "This one is required.";
          return next;
        });
        setDocState((s) => {
          const next = { ...s };
          for (const k of missing) next[k] = "error";
          return next;
        });
        return;
      }
    }

    /* A booking that cannot be matched to a transfer is worse than no
       booking — it has to be chased by hand. Both are required. */
    if (needsPayment) {
      if (!/^[A-Za-z0-9]{8,24}$/.test(utr.trim())) {
        setUtrError("Enter the UTR from your UPI app — 8 to 24 letters or digits.");
        return;
      }
      setUtrError(null);
      if (!files[PAYMENT_KIND]) {
        setFileErrors((e) => ({ ...e, [PAYMENT_KIND]: "This one is required." }));
        setDocState((s) => ({ ...s, [PAYMENT_KIND]: "error" }));
        return;
      }
    }

    setSending(true);
    try {
      const res = await fetch("/api/somewhere/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        /* The UTR travels; the amount does not. What is owed is the
           server's to decide — see lib/partners.ts. */
        body: JSON.stringify({ ...a, utr: utr.trim() }),
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
        /* The application is safe at this point. Documents go up next;
           if one fails the application still stands, and the done
           screen offers the upload again rather than pretending the
           whole thing failed. */
        if (json.upload) await sendHeldFiles(json.upload);

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

  /* Which documents did not land. Empty is the happy path. */
  const docsFailed = DOCUMENT_KINDS.filter((k) => docState[k] === "error");

  /** Re-send one document against the token we already hold. */
  async function retry(kind: DocumentKind, file: File, token: string) {
    setDocState((s) => ({ ...s, [kind]: "sending" }));
    const body = new FormData();
    body.set("token", token);
    body.set("kind", kind);
    body.set("file", file);
    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; error?: string };
      setDocState((s) => ({ ...s, [kind]: json.ok ? "done" : "error" }));
      if (!json.ok) setFileErrors((e) => ({ ...e, [kind]: json.error ?? "That did not go through." }));
    } catch {
      setDocState((s) => ({ ...s, [kind]: "error" }));
      setFileErrors((e) => ({ ...e, [kind]: "No connection. Try again." }));
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

          {/* Documents were chosen in step 2 and sent with the
              application. Confirm that, or hand back the failed ones —
              the application itself already landed either way. */}
          {done.upload ? (
            docsFailed.length === 0 ? (
              <p className="s-hint" style={{ marginTop: 12 }}>
                ✓ Your ID and college ID came through.
              </p>
            ) : (
              <div style={{ marginTop: 20, textAlign: "left" }}>
                <p className="s-body" style={{ fontSize: 14, marginBottom: 14 }}>
                  Your application is safe. These did not go through — try again here.
                </p>
                {docsFailed.map((kind) => (
                  <DropZone
                    key={kind}
                    id={`re-${kind}`}
                    title={DOCUMENT_LABELS[kind].title}
                    hint={DOCUMENT_LABELS[kind].hint}
                    state={docState[kind] ?? "idle"}
                    file={files[kind] ?? null}
                    error={fileErrors[kind]}
                    doneHint="Sent"
                    onPick={(f) => {
                      pick(kind, f);
                      void retry(kind, f, done.upload as string);
                    }}
                  />
                ))}
              </div>
            )
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

            {/* Departures that verify students ask for ID here, in the
                form. The files are held until the application has been
                created — there is nothing to attach them to before
                that — and go up the moment it has. */}
            {needsDocuments ? (
              <div className="s-field s-field-full s-ups">
                <hr className="s-rule" style={{ margin: "4px 0 2px" }} />
                <p className="s-up-head">
                  {DEPARTURES.find((d) => d.id === a.event)?.fest} needs two documents
                </p>
                <SizeNote />

                {DOCUMENT_KINDS.map((kind) => (
                  <DropZone
                    key={kind}
                    id={`ap-${kind}`}
                    title={DOCUMENT_LABELS[kind].title}
                    hint={DOCUMENT_LABELS[kind].hint}
                    state={docState[kind] ?? "idle"}
                    file={files[kind] ?? null}
                    error={fileErrors[kind]}
                    doneHint="Tap to change"
                    onPick={(f) => pick(kind, f)}
                  />
                ))}

                <p className="s-hint">
                  Stored privately, never shown on the site, and deleted after the trip.
                </p>
              </div>
            ) : null}

            {/* The booking payment. Deliberately a transfer they make
                themselves and a reference they type back: there is no
                payment gateway on this flow, and pretending otherwise
                would be worse than saying so plainly.

                The amount shown is the full one. Any partner discount
                is applied by the server, and the confirmation reports
                what was actually charged — the browser is never told a
                price it could then send back. */}
            {needsPayment && chosen ? (
              <div className="s-field s-field-full s-pay">
                <hr className="s-rule" style={{ margin: "4px 0 2px" }} />
                <p className="s-up-head">{APPLY.payHead}</p>

                <div className="s-pay-amount">
                  <span className="s-pay-figure">{inr(chosen.bookingInr ?? 0)}</span>
                  <span className="s-pay-note">{APPLY.payNote}</span>
                </div>

                <dl className="s-pay-to">
                  <div>
                    <dt>UPI ID</dt>
                    <dd>{APPLY.payUpiId}</dd>
                  </div>
                  <div>
                    <dt>Payee</dt>
                    <dd>{APPLY.payPayee}</dd>
                  </div>
                </dl>

                <div className="s-field s-field-full" style={{ marginTop: 6 }}>
                  <label htmlFor="ap-utr">
                    {APPLY.payUtrLabel} <span className="s-req">*</span>
                  </label>
                  <input
                    id="ap-utr"
                    className="s-input"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={APPLY.payUtrPh}
                    value={utr}
                    aria-invalid={Boolean(utrError)}
                    onChange={(e) => {
                      setUtr(e.target.value);
                      if (utrError) setUtrError(null);
                    }}
                  />
                  <span className="s-hint">{APPLY.payUtrHint}</span>
                  {utrError ? (
                    <p className="s-err" role="alert">
                      {utrError}
                    </p>
                  ) : null}
                </div>

                <DropZone
                  id={`ap-${PAYMENT_KIND}`}
                  title={DOCUMENT_LABELS[PAYMENT_KIND].title}
                  hint={DOCUMENT_LABELS[PAYMENT_KIND].hint}
                  state={docState[PAYMENT_KIND] ?? "idle"}
                  file={files[PAYMENT_KIND] ?? null}
                  error={fileErrors[PAYMENT_KIND]}
                  doneHint="Tap to change"
                  onPick={(f) => pick(PAYMENT_KIND, f)}
                />

                <p className="s-hint">{APPLY.payCheckNote}</p>
              </div>
            ) : null}
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
