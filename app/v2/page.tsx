import type { CSSProperties } from "react";
import Link from "next/link";
import { TRIPS, seatsLeft, isAlmostFull } from "@/lib/trips";
import { inr } from "@/lib/format";
import SceneMount from "@/components/v2/SceneMount";
import Reveal from "@/components/v2/Reveal";

/* Accent per departure, cycled. Only the two luminous anchors are used here:
   --accent also colours small text on a dark card, and Gochujang Red is far
   too dark to read at that size. It earns its place as a surface instead. */
const ACCENTS = ["var(--blaze)", "var(--varden)", "var(--blaze)", "var(--varden)"];

const PROTOCOL: { title: string; body: string }[] = [
  {
    title: "Apply",
    body: "Form 7A. Nine questions, one photo, roughly four honest minutes. ₹500 registration, non-refundable.",
  },
  {
    title: "We read",
    body: "A human reads all nine answers. No algorithm, no scoring, no shortlist generated overnight.",
  },
  {
    title: "Decision",
    body: "Within 72 hours of the window closing. Selected or not selected. There is no third outcome.",
  },
  {
    title: "Depart",
    body: "One WhatsApp group, one boarding hub, six days. Evenings marked sealed stay sealed until departure.",
  },
];

export default function V2Page() {
  const days = TRIPS[0]?.days ?? 6;
  const seats = TRIPS[0]?.seats ?? 19;

  const marquee = [
    ...TRIPS.map((t) => `${t.id} — ${t.fest}`),
    `${seats} SEATS PER DEPARTURE`,
    "₹500 REGISTRATION, NON-REFUNDABLE",
    "APPLICATION ONLY",
  ];

  return (
    <>
      <nav className="v2-nav">
        <Link className="v2-mark" href="/v2">
          AS SCHEDULED<sup>®</sup>
        </Link>
        <ul className="v2-nav-links">
          <li><a href="#circuit">THE CIRCUIT</a></li>
          <li><a href="#protocol">PROTOCOL</a></li>
          <li><Link href="/">SEASON 01 SITE</Link></li>
        </ul>
        <Link className="btn btn-hot" href="/apply">
          Apply
        </Link>
      </nav>

      <main>
        {/* ---------------- HERO ---------------- */}
        <header className="v2-hero">
          {/* Fallback paints immediately; WebGL replaces it only if it may. */}
          <div className="v2-canvas-fallback" aria-hidden="true" />
          <SceneMount />

          <div className="v2-hero-kicker">
            <span className="v2-dot" />
            <span className="lbl">SEASON 01 · APPLICATIONS OPEN</span>
          </div>

          <h1 className="disp">
            The fest gets you there.
            <span className="ser">The city keeps you.</span>
          </h1>

          <p className="v2-hero-sub">
            Six-day departures built around India&apos;s biggest college fests. Travel, fest
            tickets, stays and every meal, handled. {seats} seats per departure — you apply, we
            choose the {seats}.
          </p>

          <div className="v2-hero-acts">
            <Link className="btn btn-hot" href="/apply">
              Apply — Form 7A
            </Link>
            <a className="btn" href="#circuit">
              See the departures
            </a>
          </div>
        </header>

        {/* ---------------- MARQUEE ---------------- */}
        <div className="v2-marquee">
          <div className="v2-marquee-track">
            {/* Rendered twice so the -50% loop is seamless. */}
            {[0, 1].map((pass) =>
              marquee.map((item, i) => (
                <span key={`${pass}-${i}`} aria-hidden={pass === 1 ? "true" : undefined}>
                  <b>◆</b> {item}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ---------------- THE CIRCUIT ---------------- */}
        <section className="v2-sec" id="circuit">
          <div className="v2-sec-head v2-rv">
            <div>
              <p className="lbl">01 — THE CIRCUIT</p>
              <h2>
                Four fests.
                <br />
                One season.
              </h2>
            </div>
            <p>
              Every departure is built around a fest that already exists. The fest is the reason
              the dates exist. The city is the reason you stay.
            </p>
          </div>

          <div className="v2-deck">
            {TRIPS.map((trip, i) => {
              const left = seatsLeft(trip);
              const tight = isAlmostFull(trip);
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.slug}`}
                  className="v2-card v2-rv"
                  style={{ "--accent": ACCENTS[i % ACCENTS.length] } as CSSProperties}
                >
                  <div className="v2-card-top">
                    <span className="v2-code">{trip.id}</span>
                    <span className={`v2-seats${tight ? " tight" : ""}`}>
                      {left} / {trip.seats} open
                    </span>
                  </div>

                  <h3>{trip.fest}</h3>
                  <p className="v2-card-where">
                    {trip.campus} — {trip.city}
                  </p>
                  <p className="v2-card-hook">{trip.hook}</p>

                  <div className="v2-card-foot">
                    <span className="v2-price">{inr(trip.price)}</span>
                    <span className="v2-card-go">{trip.days} days →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------------- NUMBERS ---------------- */}
        <div className="v2-stats">
          <div className="v2-stat v2-rv">
            <b>{TRIPS.length}</b>
            <span>Fests in Season 01</span>
          </div>
          <div className="v2-stat v2-rv">
            <b>{seats}</b>
            <span>Seats per departure</span>
          </div>
          <div className="v2-stat v2-rv">
            <b>{days}</b>
            <span>Days on the ground</span>
          </div>
          <div className="v2-stat v2-rv">
            <b>1</b>
            <span>Form between you and a seat</span>
          </div>
        </div>

        {/* ---------------- PROTOCOL ---------------- */}
        <section className="v2-sec" id="protocol">
          <div className="v2-sec-head v2-rv">
            <div>
              <p className="lbl">02 — PROTOCOL</p>
              <h2>
                Nobody books.
                <br />
                <span className="ser">Everybody applies.</span>
              </h2>
            </div>
            <p>
              Selection is the product. The form exists so the nineteen fit together — that is the
              entire reason we choose rather than sell.
            </p>
          </div>

          <div className="v2-steps">
            {PROTOCOL.map((step) => (
              <div className="v2-step v2-rv" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- CLOSING ---------------- */}
        <section className="v2-cta">
          <p className="lbl v2-rv">LAST PAGE FIRST</p>
          <h2 className="v2-rv">
            {seats} seats exist.
            <span className="ser">One form decides who sits in them.</span>
          </h2>
          <Link className="btn btn-hot v2-rv" href="/apply">
            Begin Form 7A
          </Link>
          <p className="v2-cta-note">
            ₹500 REGISTRATION · NON-REFUNDABLE · NOT A DEPOSIT
          </p>
        </section>
      </main>

      <footer className="v2-foot">
        <span>© 2026 ROITCOVE VENTURES LLP · LLPIN ACZ-2215 · INDIA</span>
        <span>
          <Link href="/paperwork">PAPERWORK</Link> · <Link href="/">SEASON 01 SITE</Link>
        </span>
      </footer>

      <Reveal />
    </>
  );
}
