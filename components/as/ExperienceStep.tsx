"use client";

import Image from "next/image";
import { useState } from "react";
import { APPLY } from "@/lib/copy";
import { inr, type Departure } from "@/lib/departures";
import { depositFor, plansFor, type Plan } from "@/lib/packages";
import DropZone, { prepareUpload, type ZoneState } from "./DropZone";
import { PAYMENT_KIND } from "@/lib/documentRules";

/* Step two of "build your experience": pick the package, say how you
 * are travelling, and then either pay a deposit or be told we will
 * call.
 *
 * Its own component rather than another branch inside ApplyModal.
 * ApplyModal's step two serves PULSE and Thomso and is about documents
 * and a full fare; this is about a package and a journey. Folding both
 * into one screen would have meant three-way conditionals around every
 * field, and a change to one flow quietly altering the other.
 *
 * What it does NOT do is decide money. The deposit shown here comes
 * from depositFor, the same function the finish route uses, and the
 * amount recorded is the server's own — this sends a plan id and a
 * travel choice, never a price. */

type Mode = "train" | "flight" | "self";

export interface Finished {
  reference: string;
  delivered: boolean;
  /** True when travel has to be quoted by a person, so nothing was
   *  taken and the ending says so. */
  quoted: boolean;
}

export default function ExperienceStep({
  departure,
  token,
  onDone,
}: {
  departure: Departure;
  token: string;
  onDone: (f: Finished) => void;
}) {
  const plans = plansFor(departure.id);

  const [plan, setPlan] = useState<Plan | null>(plans[0] ?? null);
  const [mode, setMode] = useState<Mode | "">("");
  const [travelCity, setTravelCity] = useState("");
  const [travelType, setTravelType] = useState<"round" | "oneway" | "">("");
  const [utr, setUtr] = useState("");

  const [proof, setProof] = useState<File | null>(null);
  const [proofState, setProofState] = useState<ZoneState>("idle");
  const [proofError, setProofError] = useState<string | undefined>();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  /* Self-arranged travel is the only branch we can price. A train or a
     flight depends on the city, the class and the day, so it ends in a
     conversation rather than a number. */
  const paying = mode === "self";
  const deposit = paying ? depositFor(plan) : null;

  async function pickProof(file: File) {
    setProofState("sending");
    setProofError(undefined);
    const ready = await prepareUpload(file);
    if (!ready.ok) {
      setProof(null);
      setProofState("error");
      setProofError(ready.error);
      return;
    }
    setProof(ready.file);
    setProofState("done");
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!plan) e.plan = "Pick one.";
    if (!mode) e.travelMode = "Pick how you're getting there.";

    if (mode && mode !== "self") {
      if (travelCity.trim().length < 2) e.travelCity = "Which city are you starting from?";
      if (!travelType) e.travelType = "Round trip or one way?";
    }

    if (deposit !== null) {
      if (!/^[A-Za-z0-9]{8,24}$/.test(utr.trim())) {
        e.utr = "Enter the UTR from your UPI app — 8 to 24 letters or digits.";
      }
      if (!proof) e.proof = "Add a screenshot of the transfer.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate() || !plan) return;

    setSending(true);
    setFailed(null);
    try {
      const res = await fetch("/api/somewhere/apply/finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        /* A plan id and a travel choice. No amount: what this costs is
           the server's to decide. */
        body: JSON.stringify({
          token,
          plan: plan.id,
          travelMode: mode,
          travelCity: mode === "self" ? "" : travelCity.trim(),
          travelType: mode === "self" ? "" : travelType,
          utr: utr.trim(),
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        received?: boolean;
        reference?: string;
        quoted?: boolean;
        error?: string;
      };

      if (!json.ok || !json.received) {
        setFailed(json.error ?? "That did not go through. Try again.");
        return;
      }

      /* The screenshot rides the same token, after the registration is
         safe. A failed upload must not fail a completed registration —
         the payment is recorded by its UTR either way. */
      if (proof) {
        const body = new FormData();
        body.set("token", token);
        body.set("kind", PAYMENT_KIND);
        body.set("file", proof);
        try {
          await fetch("/api/documents/upload", { method: "POST", body });
        } catch {
          /* Logged server-side; nothing for the applicant to do. */
        }
      }

      onDone({
        reference: json.reference ?? "",
        delivered: true,
        quoted: Boolean(json.quoted),
      });
    } catch {
      setFailed("No connection. Try again.");
    } finally {
      setSending(false);
    }
  }

  const err = (k: string) =>
    errors[k] ? (
      <span className="s-err" role="alert">
        {errors[k]}
      </span>
    ) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {/* ---- the package ---- */}
      <p className="s-up-head">{APPLY.experienceHead}</p>
      <ul className="s-exp">
        {plans.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="s-exp-card"
              data-on={plan?.id === p.id}
              aria-pressed={plan?.id === p.id}
              onClick={() => setPlan(p)}
            >
              <span className="s-exp-top">
                <span className="s-exp-name">{p.n}</span>
                <span className="s-exp-days">{p.duration}</span>
              </span>
              <span className="s-exp-price">{p.baseInr ? inr(p.baseInr) : ""}</span>
              <span className="s-exp-includes">
                {p.includes.map((i) => (
                  <span key={i}>{i}</span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {err("plan")}

      {/* ---- how they get there ---- */}
      <p className="s-up-head" style={{ marginTop: 26 }}>
        {APPLY.travelHead}
      </p>
      <ul className="s-travel">
        {(APPLY.travelModes as readonly { id: Mode; label: string; note: string }[]).map((m) => (
          <li key={m.id}>
            <button
              type="button"
              className="s-travel-card"
              data-on={mode === m.id}
              aria-pressed={mode === m.id}
              onClick={() => {
                setMode(m.id);
                /* Clearing on switch: a city typed for a train must
                   not be submitted by somebody who then chose to
                   arrange their own way there. */
                if (m.id === "self") {
                  setTravelCity("");
                  setTravelType("");
                }
              }}
            >
              <span className="s-travel-label">{m.label}</span>
              <span className="s-travel-note">{m.note}</span>
            </button>
          </li>
        ))}
      </ul>
      {err("travelMode")}

      {mode && mode !== "self" ? (
        <div className="s-form-grid" style={{ marginTop: 18 }}>
          <div className="s-field s-field-full">
            <label htmlFor="ex-city">
              {APPLY.travelCityLabel} <span className="s-req">*</span>
            </label>
            <input
              id="ex-city"
              className="s-input"
              placeholder={APPLY.travelCityPh}
              value={travelCity}
              onChange={(e) => setTravelCity(e.target.value)}
              aria-invalid={Boolean(errors.travelCity)}
              autoComplete="address-level2"
            />
            {err("travelCity")}
          </div>

          <div className="s-field s-field-full">
            <label>
              {APPLY.travelTypeLabel} <span className="s-req">*</span>
            </label>
            <div className="s-travel-type">
              {(APPLY.travelTypes as readonly { id: "round" | "oneway"; label: string }[]).map(
                (t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="s-chip-pick"
                    data-on={travelType === t.id}
                    aria-pressed={travelType === t.id}
                    onClick={() => setTravelType(t.id)}
                  >
                    {t.label}
                  </button>
                )
              )}
            </div>
            {err("travelType")}
          </div>
        </div>
      ) : null}

      {/* ---- what happens next ---- */}
      {mode && mode !== "self" ? (
        /* No price, and no pretending otherwise. A train or a flight
           gets quoted by a person, so this says so rather than showing
           a total we would have had to invent. */
        <p className="s-quoted">{APPLY.travelQuoted}</p>
      ) : null}

      {deposit !== null && plan ? (
        <div className="s-pay" style={{ marginTop: 22 }}>
          <hr className="s-rule" style={{ margin: "4px 0 2px" }} />
          <p className="s-up-head">{APPLY.depositHead}</p>

          <div className="s-pay-amount">
            <span className="s-pay-figure">{inr(deposit)}</span>
            <span className="s-pay-note">
              {APPLY.depositNote} {inr(plan.baseInr ?? 0)}.
            </span>
          </div>

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
            <label htmlFor="ex-utr">
              {APPLY.payUtrLabel} <span className="s-req">*</span>
            </label>
            <input
              id="ex-utr"
              className="s-input"
              autoComplete="off"
              spellCheck={false}
              placeholder={APPLY.payUtrPh}
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              aria-invalid={Boolean(errors.utr)}
            />
            {err("utr") ?? <span className="s-hint">{APPLY.payUtrHint}</span>}
          </div>

          <div style={{ marginTop: 14 }}>
            <DropZone
              id="ex-proof"
              title={APPLY.proofTitle}
              hint={APPLY.proofHint}
              state={proofState}
              file={proof}
              error={proofError ?? errors.proof}
              doneHint="Ready to send"
              onPick={(f) => void pickProof(f)}
            />
          </div>

          <p className="s-hint" style={{ marginTop: 12 }}>
            {APPLY.payCheckNote}
          </p>
        </div>
      ) : null}

      {failed ? (
        <p className="s-err" role="alert" style={{ marginTop: 16 }}>
          {failed}
        </p>
      ) : null}

      <div className="s-modal-actions">
        <button type="submit" className="s-btn s-btn-forest" disabled={sending}>
          {sending ? "SENDING…" : deposit !== null ? APPLY.depositCta : APPLY.experienceCta}
        </button>
      </div>
    </form>
  );
}
