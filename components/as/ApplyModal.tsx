"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { useModal } from "./ModalProvider";
import { APPLY, STATES, CONTACT_EMAIL } from "@/lib/copy";
import { DEPARTURES, inr } from "@/lib/departures";
import { EVENTS, track } from "@/lib/analytics";
import DropZone, { prepareUpload, type ZoneState } from "./DropZone";
import { DOCUMENT_LABELS, SizeNote } from "./UploadFields";
import { DOCUMENT_KINDS, PAYMENT_KIND, type DocumentKind } from "@/lib/documentRules";
import { amountDueInr, fareFor, findPlan, plansFor } from "@/lib/packages";
import NoFare from "./NoFare";

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
  const { close, preselect, source, preselectPlan } = useModal();
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

  /* The package they picked. A plan id — never a price. What it costs
     is looked up from the fare table, here for display and again on
     the server for the record. */
  const [plan, setPlan] = useState(preselectPlan ?? "");
  const [planError, setPlanError] = useState<string | null>(null);

  /* What a referral is worth, fetched from the server because the
     cookie that carries it is httpOnly. Display only: the apply route
     reads the same cookie and recomputes, so this can change the
     number on the screen and nothing else. Zero until it answers,
     which is also the right answer for almost everybody. */
  const [discountInr, setDiscountInr] = useState(0);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<string | null>(null);

  const chosen = DEPARTURES.find((d) => d.id === a.event);

  /* Whether the chosen departure collects ID as part of applying. */
  const needsDocuments = chosen?.documentsAtApply === true;

  /* The plans this departure is sold as. Empty for a single-price one,
     in which case the form never asks. */
  const plans = plansFor(a.event);

  /* A plan that does not belong to the chosen departure is no plan at
     all — it would otherwise survive somebody switching departure in
     step 1 after arriving on a plan card. */
  const activePlan = findPlan(a.event, plan);

  /* What they owe now, from the plan and the state they picked, less
     any referral discount. Null means do not ask for money — the
     departure takes none, no plan is chosen yet, or their state has no
     fare set. The apply route computes this again from the submitted
     answers; the browser never sends an amount. */
  const amountDue = amountDueInr({
    departureId: a.event,
    planId: activePlan?.id ?? null,
    state: a.state,
    bookingInr: chosen?.bookingInr,
    discountInr,
  });

  /* The fare before any discount, so the saving can be shown rather
     than just asserted. */
  const grossFare = activePlan ? fareFor(activePlan, a.state) : chosen?.bookingInr ?? null;

  const needsPayment = amountDue !== null;

  /* Chose a plan, but we have no fare from their state. They can still
     apply — we come back with the amount. */
  const fareUnknown = activePlan !== null && fareFor(activePlan, a.state) === null;

  /* Ask the server what this departure's referral is worth. Runs on
     open and whenever the departure changes, because a code for one
     fest must not price another. */
  useEffect(() => {
    if (!a.event) {
      setDiscountInr(0);
      setPartnerName(null);
      setCoupon(null);
      return;
    }

    /* Ignore a reply that arrives after the departure changed again —
       otherwise a slow first request can overwrite a fast second one
       and show the wrong fest's discount. */
    let live = true;
    fetch(`/api/somewhere/pricing?event=${encodeURIComponent(a.event)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          j: {
            discountInr?: number;
            partnerName?: string | null;
            coupon?: string | null;
          } | null
        ) => {
          if (!live || !j) return;
          setDiscountInr(typeof j.discountInr === "number" ? j.discountInr : 0);
          setPartnerName(j.partnerName ?? null);
          setCoupon(j.coupon ?? null);
        }
      )
      /* A failed lookup shows full price, which is the safe direction:
         nobody is quoted less than they owe. */
      .catch(() => {});

    return () => {
      live = false;
    };
  }, [a.event]);

  /* Async because a large photo is shrunk here, before it is held for
     sending. Doing it on pick rather than on submit means somebody
     learns immediately that their file is fine, instead of at the end
     of the form. */
  /* Returns the file that will actually be sent — which is not the one
     handed in, if it was a large photo. The retry path needs that back,
     or it would re-upload the original and undo the shrinking. */
  async function pick(kind: DocumentKind, file: File): Promise<File | null> {
    const prepared = await prepareUpload(file);
    if (!prepared.ok) {
      setFileErrors((e) => ({ ...e, [kind]: prepared.error }));
      setDocState((s) => ({ ...s, [kind]: "error" }));
      return null;
    }
    setFiles((f) => ({ ...f, [kind]: prepared.file }));
    setFileErrors((e) => ({ ...e, [kind]: undefined }));
    setDocState((s) => ({ ...s, [kind]: "idle" }));
    return prepared.file;
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
    /* A departure sold as plans cannot be applied to without one:
       there would be no fare, so nothing to quote and nothing to
       reconcile a transfer against. Checked first because the cards
       sit at the top of the step. */
    if (plans.length > 0 && !activePlan) {
      setPlanError("Pick one.");
      return;
    }
    setPlanError(null);

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
        /* The plan id and the UTR travel; the amount does not. What is
           owed is the server's to decide, from this plan and the state
           above — see lib/packages.ts and lib/partners.ts. */
        body: JSON.stringify({ ...a, plan: activePlan?.id ?? "", utr: utr.trim() }),
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
  /* Everything this departure actually asked for, so a failure is
     reported for all of it. This used to list only the two identity
     documents, which meant a payment screenshot that did not go up
     said nothing at all — the worst place to be quiet, since the
     transfer then cannot be matched to anybody. */
  const attemptedKinds: DocumentKind[] = needsPayment
    ? [...DOCUMENT_KINDS, PAYMENT_KIND]
    : [...DOCUMENT_KINDS];

  const docsFailed = attemptedKinds.filter((k) => docState[k] === "error");

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
                ✓ {needsPayment
                  ? "Your documents and payment screenshot came through."
                  : "Your ID and college ID came through."}
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
                      void (async () => {
                        /* Retry with what pick actually kept, not the
                           file that was handed in — a shrunk photo is
                           a different File object. */
                        const ready = await pick(kind, f);
                        if (ready) await retry(kind, ready, done.upload as string);
                      })();
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

            {/* Departures sold as more than one package ask which,
                here rather than earlier: the fare is per state, and
                the state was answered in step 1, so by now each card
                can show a real number instead of a range.

                The price on a card is looked up, never typed and never
                posted. Choosing a plan chooses an id; what that costs
                is decided by the server from the same table. */}
            {plans.length > 0 ? (
              <div className="s-field s-field-full s-plan-pick">
                <hr className="s-rule" style={{ margin: "4px 0 2px" }} />
                <p className="s-up-head">{APPLY.planHead}</p>
                {fareUnknown || !a.state ? (
                  <NoFare line={APPLY.planNoFare} />
                ) : (
                  <p className="s-hint">{`${APPLY.planNote} ${a.state}.`}</p>
                )}

                {/* A radio group, not a row of toggles: exactly one of
                    these is chosen. The dot is the point — the border
                    alone said "selected" too quietly to notice on a
                    phone, where the two cards are stacked and you
                    cannot see them side by side to compare. */}
                <div
                  className="s-plan-grid s-plan-grid-tight"
                  role="radiogroup"
                  aria-label={APPLY.planHead}
                >
                  {plans.map((p) => {
                    const fare = fareFor(p, a.state);
                    const picked = plan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={picked}
                        className="s-plan s-plan-opt"
                        data-picked={picked}
                        onClick={() => {
                          setPlan(p.id);
                          if (planError) setPlanError(null);
                        }}
                      >
                        <span className="s-plan-top">
                          <span className="s-plan-radio" aria-hidden="true" />
                          <span className="s-plan-n">{p.n}</span>
                          <span className="s-plan-picked">{picked ? "SELECTED" : "TAP TO PICK"}</span>
                        </span>
                        <h3 className="s-plan-name">{p.name}</h3>

                        <ul className="s-list s-list-yes s-plan-list">
                          {p.includes.map((i) => (
                            <li key={i}>
                              <span aria-hidden="true">✓</span>
                              <span>{i}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="s-plan-figure s-plan-figure-sm">
                          {fare === null ? "—" : inr(fare)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {planError ? (
                  <p className="s-err" role="alert">
                    {planError}
                  </p>
                ) : null}
              </div>
            ) : null}

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
                    onPick={(f) => void pick(kind, f)}
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

                The amount is looked up from the fare table, not typed
                and not posted. The apply route works it out again from
                the plan and state that were submitted, so the figure
                below is the figure that gets recorded. */}
            {needsPayment && chosen ? (
              <div className="s-field s-field-full s-pay">
                <hr className="s-rule" style={{ margin: "4px 0 2px" }} />
                <p className="s-up-head">{APPLY.payHead}</p>

                {/* The badge is text. The server decided this, and a
                    field here would only invite someone to try
                    changing it. */}
                {coupon && discountInr > 0 ? (
                  <p className="s-coupon">
                    <span className="s-coupon-tag">{coupon}</span>
                    <span className="s-coupon-said">
                      {inr(discountInr)} off, applied — {partnerName}
                    </span>
                  </p>
                ) : null}

                <div className="s-pay-amount">
                  {grossFare !== null && grossFare !== amountDue ? (
                    <span className="s-pay-figure s-was">{inr(grossFare)}</span>
                  ) : null}
                  <span className="s-pay-figure">{inr(amountDue)}</span>
                  <span className="s-pay-note">{APPLY.payNote}</span>
                </div>

                {/* Scanning is how almost everybody will pay this from
                    a phone; the ID underneath is for the ones who
                    would rather type it, and for anyone reading the
                    page on a laptop with their phone in hand. */}
                <div className="s-pay-qr">
                  <Image
                    src="/pay/upi-qr.jpg"
                    alt={APPLY.payQrAlt}
                    width={220}
                    height={252}
                    className="s-pay-qr-img"
                  />
                  <p className="s-hint">{APPLY.payQrCaption}</p>
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
                  onPick={(f) => void pick(PAYMENT_KIND, f)}
                />

                <p className="s-hint">{APPLY.payCheckNote}</p>
              </div>
            ) : null}

            {/* The "WHO SEES THIS" panel that used to sit here was
                removed on instruction: somebody arriving on PULSE's
                own link already knows they came through PULSE.

                The one line below replaces it. It is not the same
                notice and is not as good, but it is the ordinary thing
                a form does — the policy it links to spells out exactly
                what a partner festival is told, and a form that
                collects a phone number, a college and a payment
                reference should point at it either way. */}
            <p className="s-field s-field-full s-consent">
              {APPLY.consentLead}{" "}
              <a href="/paperwork/privacy" target="_blank" rel="noreferrer">
                {APPLY.consentLink}
              </a>
              .
            </p>
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
