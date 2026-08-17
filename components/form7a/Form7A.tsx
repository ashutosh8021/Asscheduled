"use client";

/* Form 7A — the product's front door. 13 screens, Enter advances,
   Shift+Enter = newline, Esc = confirm-close. State lives in React only;
   persistence arrives with Supabase in Phase 2 (no localStorage — rule).

   Submission posts to /api/applications. When Razorpay keys are configured the
   route returns an order and Checkout opens; when they are not, the route
   returns a reference and nothing is charged. Either way the applicant lands
   on /apply/thank-you, which is where the conversion is counted. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { TRIPS } from "@/lib/trips";
import { inr } from "@/lib/format";
import { track, EVENTS } from "@/lib/analytics";
import {
  ACCEPTED_PHOTO_TYPES,
  EMPTY_ANSWERS,
  MAX_PHOTO_BYTES,
  TOTAL_SCREENS,
  stepLabel,
  validate,
  type FormAnswers,
} from "./types";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface CheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: CheckoutSuccess) => void;
  modal: { ondismiss: () => void };
}

interface CheckoutInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => CheckoutInstance;
  }
}

interface LodgeResponse {
  ok: boolean;
  reference?: string;
  amountPaise?: number;
  applicationId?: string | null;
  order?: { id: string; keyId: string } | null;
  error?: string;
  fields?: string[];
}

/* Which screen owns each field, so a server rejection lands the applicant on
   the question that failed rather than on a generic error. */
const FIELD_SCREEN: Partial<Record<keyof FormAnswers, number>> = {
  trip: 0,
  name: 1, age: 1, city: 1,
  phone: 2, email: 2, instagram: 2, college: 2,
  saturday: 3, three_words: 4, why: 5, bad_at: 6,
  plus_one: 7, drains_you: 8, remember: 9,
};

/** Checkout is only fetched when a real order exists — never on page load. */
function loadCheckout(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = CHECKOUT_SRC;
    s.async = true;
    s.onload = () => resolve(Boolean(window.Razorpay));
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

const QUESTIONS: {
  screen: number;
  key: keyof FormAnswers;
  no: string;
  q: string;
  hint: string;
  err: string;
  input?: "text";
}[] = [
  {
    screen: 3, key: "saturday", no: "1",
    q: "What did you actually do last Saturday?",
    hint: "“ACTUALLY” IS DOING WORK IN THAT SENTENCE.",
    err: "Answer it. Honesty counts extra.",
  },
  {
    screen: 4, key: "three_words", no: "2",
    q: "Yourself, in exactly three words.",
    hint: "THREE. NOT FOUR. WE COUNT.",
    err: "That wasn't three words.",
    input: "text",
  },
  {
    screen: 5, key: "why", no: "3",
    q: "Why this departure, specifically?",
    hint: "“SOUNDS FUN” GETS FILED UNDER: EVERYONE.",
    err: "Required.",
  },
  {
    screen: 6, key: "bad_at", no: "4",
    q: "What are you genuinely bad at?",
    hint: "EVERYONE IS BAD AT SOMETHING. LIARS ARE BAD AT TWO THINGS.",
    err: "Required.",
  },
  {
    screen: 7, key: "plus_one", no: "5",
    q: "If one guest were allowed, who comes — and why them?",
    hint: "NOBODY EXTRA GETS A SEAT. WE JUST LEARN A LOT FROM THE ANSWER.",
    err: "Required.",
  },
  {
    screen: 8, key: "drains_you", no: "6",
    q: "What kind of people drain you?",
    hint: "SEATING CHART RESEARCH. BE PRECISE.",
    err: "Required.",
  },
  {
    screen: 9, key: "remember", no: "7",
    q: "Six days end. What should eighteen strangers remember about you?",
    hint: "LAST QUESTION. MAKE IT COUNT.",
    err: "Required.",
  },
];

const DOSSIER_ROWS: { label: string; goto: number; value: (a: FormAnswers) => string; em?: boolean }[] = [
  { label: "Departure", goto: 0, value: (a) => {
      const t = TRIPS.find((x) => x.id === a.trip);
      return t ? `${t.id} — ${t.fest}` : "—";
    } },
  { label: "Name / Age", goto: 1, value: (a) => `${a.name}, ${a.age}` },
  { label: "City", goto: 1, value: (a) => a.city },
  { label: "College", goto: 2, value: (a) => a.college },
  { label: "Contact", goto: 2, value: (a) => `${a.phone} · ${a.email}` },
  { label: "Instagram", goto: 2, value: (a) => "@" + a.instagram.replace(/^@/, "") },
  { label: "Last Saturday", goto: 3, value: (a) => a.saturday, em: true },
  { label: "Three words", goto: 4, value: (a) => a.three_words, em: true },
  { label: "Why this one", goto: 5, value: (a) => a.why, em: true },
  { label: "Bad at", goto: 6, value: (a) => a.bad_at, em: true },
  { label: "Plus one", goto: 7, value: (a) => a.plus_one, em: true },
  { label: "Drained by", goto: 8, value: (a) => a.drains_you, em: true },
  { label: "Remember", goto: 9, value: (a) => a.remember, em: true },
  { label: "Photo", goto: 10, value: (a) => a.photo_name || "not attached yet" },
];

export default function Form7A({ preselect }: { preselect?: string }) {
  const router = useRouter();
  const [screen, setScreen] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>(() => ({
    ...EMPTY_ANSWERS,
    trip: TRIPS.some((t) => t.id === preselect) ? (preselect as string) : TRIPS[0].id,
  }));
  const [errors, setErrors] = useState<Set<keyof FormAnswers>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends keyof FormAnswers>(k: K, v: FormAnswers[K]) => {
    setAnswers((a) => ({ ...a, [k]: v }));
    setDirty(true);
    setErrors((e) => {
      if (!e.has(k)) return e;
      const next = new Set(e);
      next.delete(k);
      return next;
    });
  }, []);

  const goScr = useCallback((i: number) => {
    setScreen(i);
    setErrors(new Set());
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, []);

  /* In-brand confirmation instead of window.confirm(): a native OS dialog in
     the middle of a full-screen form reads as a browser error, not as us. */
  const close = useCallback(
    (force?: boolean) => {
      if (dirty && screen > 0 && !force) {
        setConfirmClose(true);
        return;
      }
      router.push("/");
    },
    [dirty, screen, router]
  );

  const submit = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setSubmitErr(null);

    /* The photo's data URI is never posted — a multi-MB base64 body would
       fail the request. Storage upload lands with Supabase Storage in Phase 2;
       the filename still goes, so we know one was attached. */
    const payload: FormAnswers = { ...answers, photo_data: null };

    /* Land on a real URL rather than an in-modal screen. A distinct route is
       what makes the application measurable as a conversion, and it gives the
       applicant something they can return to. Deviates from SPEC §6's
       "screen 13"; the same LODGED content lives at /apply/thank-you. */
    const finish = (reference: string) => {
      setDirty(false);
      router.push(`/apply/thank-you?ref=${encodeURIComponent(reference)}`);
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as LodgeResponse;

      if (!res.ok || !data.ok) {
        /* Send them back to the question that failed, if we know which. */
        const firstBad = (data.fields ?? [])
          .map((f) => FIELD_SCREEN[f as keyof FormAnswers])
          .filter((n): n is number => typeof n === "number")
          .sort((a, b) => a - b)[0];

        setBusy(false);
        setSubmitErr(data.error ?? "That did not go through. Nothing was charged.");
        if (typeof firstBad === "number") {
          setScreen(firstBad);
          setErrors(new Set((data.fields ?? []) as (keyof FormAnswers)[]));
        }
        return;
      }

      const reference = data.reference ?? "—";

      /* No order means Razorpay is not configured yet: the file is accepted,
         nothing is charged, and the applicant sees the same LODGED screen. */
      if (!data.order) {
        finish(reference);
        return;
      }

      track(EVENTS.paymentInitiated, { trip: answers.trip });

      const ready = await loadCheckout();
      if (!ready || !window.Razorpay) {
        setBusy(false);
        setSubmitErr("Payment could not open. Check your connection and try again.");
        return;
      }

      const checkout = new window.Razorpay({
        key: data.order.keyId,
        amount: data.amountPaise ?? 50000,
        currency: "INR",
        name: "AS SCHEDULED",
        description: "Form 7A — application fee (non-refundable)",
        order_id: data.order.id,
        prefill: {
          name: answers.name,
          email: answers.email,
          contact: answers.phone.replace(/\D/g, ""),
        },
        notes: { trip: answers.trip, reference },
        theme: { color: "#12234F" },
        handler: () => {
          /* The webhook is the source of truth for fee_status — the browser
             just moves on. Nothing here marks the file paid. */
          finish(reference);
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setSubmitErr("Payment window closed. Nothing was charged — the file is not lodged yet.");
          },
        },
      });
      checkout.open();
    } catch {
      setBusy(false);
      setSubmitErr("We could not reach the office. Nothing was charged.");
    }
  }, [answers, busy, router]);

  const next = useCallback(() => {
    if (screen === 12) { void submit(); return; }
    if (screen === 11) { goScr(12); return; }
    if (screen === 10) { goScr(11); return; }
    const bad = validate(screen, answers);
    if (bad.size) { setErrors(bad); return; }
    goScr(screen + 1);
  }, [screen, answers, submit, goScr]);

  /* Enter advances (Shift+Enter = newline); Esc = confirm-close.
     Screen 12 is exempt: paying ₹500 takes a deliberate click, never a stray
     Enter. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmClose) { setConfirmClose(false); return; }
        close();
        return;
      }
      if (confirmClose || busy) return;
      if (e.key !== "Enter" || e.shiftKey) return;
      if (screen === 12) return;
      e.preventDefault();
      next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, close, screen, confirmClose, busy]);

  /* Focus trap. The form is aria-modal over the whole site, so Tab must not
     reach the page behind it. Scoped to the confirm box while that is open. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !rootRef.current) return;
      const scope =
        rootRef.current.querySelector<HTMLElement>(".a-confirm") ?? rootRef.current;
      const items = Array.from(
        scope.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !scope.contains(active);

      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* Move focus into each new screen: the first field where there is one, the
     screen itself otherwise. Without this, keyboard and screen-reader users
     stay parked on the Next button while the content changes underneath. */
  useEffect(() => {
    if (confirmClose) return;
    const scr = bodyRef.current?.querySelector<HTMLElement>(".ascr.on");
    if (!scr) return;
    const field = scr.querySelector<HTMLElement>("input:not([type=file]), textarea, select");
    if (field) {
      field.focus({ preventScroll: true });
      return;
    }
    scr.tabIndex = -1;
    scr.focus({ preventScroll: true });
  }, [screen, confirmClose]);

  /* Confirm box takes focus when it opens. */
  useEffect(() => {
    if (!confirmClose) return;
    rootRef.current?.querySelector<HTMLElement>(".a-confirm button")?.focus();
  }, [confirmClose]);

  useEffect(() => {
    document.body.classList.add("locked");
    return () => document.body.classList.remove("locked");
  }, []);

  /* Exhibit A limits are stated on screen 10 — enforce both rather than
     letting a 40MB HEIC fail silently at the FileReader. */
  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setPhotoErr(null);

    if (!f) { set("photo_name", null); set("photo_data", null); return; }

    if (!ACCEPTED_PHOTO_TYPES.includes(f.type)) {
      setPhotoErr("JPG, PNG or WebP only. That file is none of those.");
      e.target.value = "";
      set("photo_name", null);
      set("photo_data", null);
      return;
    }
    if (f.size > MAX_PHOTO_BYTES) {
      setPhotoErr(
        `Under 5MB. That one is ${(f.size / 1024 / 1024).toFixed(1)}MB.`
      );
      e.target.value = "";
      set("photo_name", null);
      set("photo_data", null);
      return;
    }

    set("photo_name", f.name);
    const r = new FileReader();
    r.onload = (ev) => set("photo_data", (ev.target?.result as string) ?? null);
    r.onerror = () => setPhotoErr("That file could not be read. Try another.");
    r.readAsDataURL(f);
  };

  const nextLabel =
    screen === 0 ? "Begin →"
    : screen === 11 ? "Looks right →"
    : screen === 12 ? (busy ? "Opening payment…" : "Pay ₹500 & lodge — Razorpay")
    : "Next →";

  const err = (k: keyof FormAnswers) => errors.has(k);
  const field = (k: keyof FormAnswers) => `afield${err(k) ? " err" : ""}`;

  const tripOptions = useMemo(
    () =>
      TRIPS.map((t) => (
        <option key={t.id} value={t.id}>
          {t.id} — {t.fest}, {t.city} · {inr(t.price)} · {t.seats - t.filled} seats open
        </option>
      )),
    []
  );

  const counter = (v: string, max: number) => (
    <div className="acnt">
      {v.length} / {max}
    </div>
  );

  return (
    <div
      className="app open"
      role="dialog"
      aria-modal="true"
      aria-label="Form 7A — Application"
      ref={rootRef}
    >
      <div className="app-top">
        {/* /apply had no h1 at all — the form is the page's only content, so
            its title is the page heading. */}
        <h1 className="lbl app-h1">
          <b>FORM 7A</b> — APPLICATION FOR SELECTION
        </h1>
        <span className="lbl lbl-grey">{stepLabel(screen)}</span>
        <button className="app-close" type="button" onClick={() => close()}>
          Close file
        </button>
      </div>
      <div className="app-prog" aria-hidden="true">
        <i style={{ width: `${(screen / (TOTAL_SCREENS - 1)) * 100}%` }} />
      </div>
      <div className="app-body" ref={bodyRef}>
        {screen === 0 && (
          <section className="ascr on">
            <p className="qno">FORM 7A · SEASON 01</p>
            <h2>
              Nineteen seats exist.
              <br />
              This form decides who sits in them.
            </h2>
            <p className="qhint">
              NINE QUESTIONS · ONE PHOTO · ROUGHLY FOUR HONEST MINUTES · ₹500,
              NON-REFUNDABLE
            </p>
            <div className="afield">
              <label htmlFor="fTrip">Departure applying for</label>
              <select
                id="fTrip"
                className="a-tripsel"
                value={answers.trip}
                onChange={(e) => set("trip", e.target.value)}
              >
                {tripOptions}
              </select>
            </div>
            <p className="qhint" style={{ marginTop: 6 }}>
              Answers get read by a human. Short beats long. Honest beats impressive.
            </p>
          </section>
        )}

        {screen === 1 && (
          <section className="ascr on">
            <p className="qno">SECTION A — PARTICULARS · 1/2</p>
            <h2>State your particulars.</h2>
            <p className="qhint">AS PER ID. WE CHECK AT BOARDING.</p>
            <div className={field("name")}>
              <label htmlFor="fName">Full name</label>
              <input
                id="fName" type="text" autoComplete="name"
                placeholder="As it appears on your ID"
                value={answers.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {err("name") && <span className="aerr" role="alert">Name — required.</span>}
            </div>
            <div className="a2">
              <div className={field("age")}>
                <label htmlFor="fAge">Age (18–26)</label>
                <input
                  id="fAge" type="number" min={18} max={26} placeholder="21"
                  value={answers.age}
                  onChange={(e) => set("age", e.target.value)}
                />
                {err("age") && <span className="aerr" role="alert">18–26 only. Rules are rules.</span>}
              </div>
              <div className={field("city")}>
                <label htmlFor="fCity">City you live in</label>
                <input
                  id="fCity" type="text" autoComplete="address-level2"
                  placeholder="e.g. Bhubaneswar"
                  value={answers.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                {err("city") && <span className="aerr" role="alert">City — required.</span>}
              </div>
            </div>
          </section>
        )}

        {screen === 2 && (
          <section className="ascr on">
            <p className="qno">SECTION A — PARTICULARS · 2/2</p>
            <h2>Where decisions find you.</h2>
            <p className="qhint">SELECTION EMAIL + WHATSAPP GROUP. NOTHING ELSE, EVER.</p>
            <div className="a2">
              <div className={field("phone")}>
                <label htmlFor="fPhone">Phone (WhatsApp)</label>
                <input
                  id="fPhone" type="tel" inputMode="numeric" autoComplete="tel"
                  placeholder="10 digits"
                  value={answers.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {err("phone") && <span className="aerr" role="alert">10 digits. Indian number.</span>}
              </div>
              <div className={field("email")}>
                <label htmlFor="fEmail">Email</label>
                <input
                  id="fEmail" type="email" autoComplete="email"
                  placeholder="you@somewhere.in"
                  value={answers.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {err("email") && <span className="aerr" role="alert">A real one. Decisions land here.</span>}
              </div>
            </div>
            <div className="a2">
              <div className={field("instagram")}>
                <label htmlFor="fIg">Instagram handle</label>
                <input
                  id="fIg" type="text" placeholder="without the @"
                  value={answers.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                />
                {err("instagram") && <span className="aerr" role="alert">Handle — required. We will look.</span>}
              </div>
              <div className={field("college")}>
                <label htmlFor="fCollege">College &amp; course</label>
                <input
                  id="fCollege" type="text" placeholder="e.g. IIT Delhi, B.Tech CSE"
                  value={answers.college}
                  onChange={(e) => set("college", e.target.value)}
                />
                {err("college") && <span className="aerr" role="alert">College — required.</span>}
              </div>
            </div>
          </section>
        )}

        {QUESTIONS.map(
          (q) =>
            screen === q.screen && (
              <section className={`ascr on${err(q.key) ? " err" : ""}`} key={q.key}>
                <p className="qno">SECTION B — QUESTION {q.no} OF 7</p>
                <h2>{q.q}</h2>
                <p className="qhint">{q.hint}</p>
                {q.input === "text" ? (
                  <input
                    type="text" maxLength={60} placeholder="word word word"
                    value={answers[q.key] as string}
                    onChange={(e) => set(q.key, e.target.value)}
                  />
                ) : (
                  <>
                    <textarea
                      maxLength={240} placeholder="Start typing…"
                      value={answers[q.key] as string}
                      onChange={(e) => set(q.key, e.target.value)}
                    />
                    {counter(answers[q.key] as string, 240)}
                  </>
                )}
                {err(q.key) && <span className="aerr" role="alert">{q.err}</span>}
              </section>
            )
        )}

        {screen === 10 && (
          <section className="ascr on">
            <p className="qno">SECTION B — EXHIBIT A</p>
            <h2>One recent photo. Actually you.</h2>
            <p className="qhint">JPG / PNG · UNDER 5MB · NO GROUP SHOTS, WE WON&apos;T GUESS</p>
            <label className={`a-file${photoErr ? " err" : ""}`} htmlFor="fPhoto">
              <span>
                {answers.photo_name
                  ? `ATTACHED — ${answers.photo_name}`
                  : "Tap to attach — or drop it here"}
              </span>
              <input
                id="fPhoto"
                type="file"
                accept={ACCEPTED_PHOTO_TYPES.join(",")}
                onChange={onPhoto}
              />
            </label>
            {photoErr && (
              <span className="aerr show" role="alert">
                {photoErr}
              </span>
            )}
            {answers.photo_data && (
              <div className="a-preview show">
                {/* data-URI preview from the user's own file — next/image not applicable */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Your attached photo" src={answers.photo_data} />
              </div>
            )}
          </section>
        )}

        {screen === 11 && (
          <section className="ascr on">
            <p className="qno">SECTION C — YOUR DOSSIER</p>
            <h2>Read it once. This is what the panel sees.</h2>
            <p className="qhint">TAP EDIT TO FIX ANYTHING. THEN PROCEED.</p>
            <div className="doss">
              <span className="st st-blue">UNVERIFIED</span>
              <dl>
                {DOSSIER_ROWS.map((r) => (
                  <div style={{ display: "contents" }} key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>
                      {r.em ? <em>{r.value(answers)}</em> : r.value(answers)}
                      <button
                        type="button"
                        className="edit"
                        onClick={() => goScr(r.goto)}
                      >
                        edit
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {screen === 12 && (
          <section className="ascr on">
            <p className="qno">SECTION D — APPLICATION FEE</p>
            <h2>
              ₹500 to be read.
              <br />
              <span style={{ color: "var(--peach-2)" }}>It does not come back.</span>
            </h2>
            <p className="qhint">PROCESSED BY RAZORPAY. WE NEVER SEE OR STORE CARD DETAILS.</p>
            <div className="ledger">
              <div className="lrow">
                <span>Application fee — Form 7A</span>
                <span>₹500</span>
              </div>
              <div className="lrow">
                <span>If not selected → no refund</span>
                <span>
                  <em>₹0 back</em>
                </span>
              </div>
              <div className="lrow">
                <span>If selected → trip fee payable in full, separately</span>
                <span>
                  <em>₹0 off</em>
                </span>
              </div>
              <div className="lrow">
                <span>Cost of applying, either way</span>
                <span>₹500</span>
              </div>
            </div>
            <p className="qhint">
              THE FEE BUYS A READING, NOT A SEAT. IT IS NOT A DEPOSIT. DECIDE BEFORE YOU PAY.
            </p>
            {submitErr && (
              <p className="a-status fail" role="alert">
                {submitErr.toUpperCase()}
              </p>
            )}
            {busy && !submitErr && (
              <p className="a-status" role="status">
                OPENING THE PAYMENT WINDOW. DO NOT REFRESH.
              </p>
            )}
          </section>
        )}

      </div>
      <div className="app-nav">
        <button
          className="btn"
          type="button"
          style={{ visibility: screen === 0 ? "hidden" : "visible" }}
          onClick={() => goScr(Math.max(0, screen - 1))}
        >
          ← Back
        </button>
        <span
          className="khint"
          style={{ visibility: screen >= 11 ? "hidden" : "visible" }}
        >
          PRESS <b>ENTER ⏎</b> TO CONTINUE
        </span>
        <button
          className="btn btn-peach"
          type="button"
          onClick={next}
          aria-busy={busy}
          disabled={busy}
        >
          {nextLabel}
        </button>
      </div>

      {confirmClose && (
        <div
          className="a-confirm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="aConfirmH"
        >
          <div className="a-confirm-box">
            <p className="qno">FORM 7A — ABANDON FILE</p>
            <h3 id="aConfirmH">Close the form?</h3>
            <p>
              Nothing has been saved. Answers live on this device only until the file is
              lodged — closing loses all of them.
            </p>
            <div className="a-confirm-acts">
              <button
                className="btn btn-peach"
                type="button"
                onClick={() => setConfirmClose(false)}
              >
                Keep filling it in
              </button>
              <button className="btn" type="button" onClick={() => close(true)}>
                Discard and close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
