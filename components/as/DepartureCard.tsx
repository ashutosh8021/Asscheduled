"use client";

import Link from "next/link";
import Slot from "./Slot";
import Stamp from "./Stamp";
import Tilt from "./Tilt";
import { SOMEWHERE } from "@/lib/copy";
import { batchLabel, priceRange, type Departure } from "@/lib/departures";

/* Two card shapes, both from the comps:

   "poster"  — image with the fest name burned into it, dates and a
               GO THERE button underneath (comps 5 and 6, top rail).
   "detail"  — the compact small-print card: title, thumbnail, both
               batch dates, price, SEE THE PLAN. */

interface Props {
  d: Departure;
  variant?: "poster" | "detail";
  /** Card index — only used to keep placeholder labels distinguishable. */
  priority?: boolean;
}

export default function DepartureCard({ d, variant = "poster", priority = false }: Props) {
  const href = `/somewhere/${d.slug}`;

  if (variant === "detail") {
    return (
      <article className="s-card">
        <div className="s-card-body">
          <div className="s-card-row" style={{ alignItems: "flex-start" }}>
            <div>
              <h3 className="s-h3">{d.fest}</h3>
              <p className="s-eyebrow" style={{ marginTop: 6 }}>
                {d.campus}
              </p>
            </div>
            <div style={{ width: 104, flexShrink: 0 }}>
              <Slot
                slot={d.card}
                className="s-gal-tile"
                sizes="110px"
                hint={d.campus}
              />
            </div>
          </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <p className="s-chip">{batchLabel(d.batches)}</p>
              {d.soldOut ? <span className="s-soldout">{SOMEWHERE.soldOutLabel}</span> : null}
            </div>

          <hr className="s-rule" />

          <div>
            <p className="s-eyebrow s-eyebrow-grey" style={{ marginBottom: 8 }}>
              DATES
            </p>
            {d.batches.map((b) => (
              <p key={b.label} style={{ fontSize: 13, letterSpacing: "0.02em" }}>
                {b.label}{" "}
                <span style={{ color: "var(--s-grey)" }}>
                  ({b.days} DAYS / {b.nights} NIGHTS)
                </span>
              </p>
            ))}
          </div>

          <hr className="s-rule" />

          <div>
            <p className="s-eyebrow s-eyebrow-grey" style={{ marginBottom: 6 }}>
              {SOMEWHERE.priceLabel}
            </p>
            <p className="s-h3" style={{ fontFamily: "var(--s-mono)", fontWeight: 600 }}>
              {priceRange(d)}
              <span className="s-price-per">{SOMEWHERE.pricePer}</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
              {SOMEWHERE.priceIncludes.map((p) => (
                <span key={p} className="s-card-note">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <Link href={href} className="s-btn" style={{ marginTop: "auto", alignSelf: "flex-start" }}>
            {SOMEWHERE.planCta} <span className="s-arrow">↗</span>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Tilt max={5} lift={10}>
      <article className={d.soldOut ? "s-card s-card-closed" : "s-card"}>
        <div className="s-card-media">
          <Slot
            slot={d.card}
            priority={priority}
            sizes="(max-width: 900px) 100vw, 46vw"
            hint={d.campus}
          />
            {d.soldOut ? (
              <Stamp
                className="s-stamp-round-over"
                label={SOMEWHERE.soldOutLabel}
                top={SOMEWHERE.soldOutArcTop}
                bottom={SOMEWHERE.soldOutArcBottom}
              />
            ) : null}
          <div className="s-card-over">
            <h3 className="s-h3" style={{ color: "inherit" }}>
              {d.fest}
            </h3>
            <p
              className="s-eyebrow"
              style={{ color: "var(--s-butter)", marginTop: 4 }}
            >
              {d.campus}
            </p>
          </div>
        </div>

        <div className="s-card-body">
          <div className="s-card-row">
            <p className="s-card-dates">{d.range}</p>
            <span className="s-chip">{batchLabel(d.batches)}</span>
          </div>

          <div className="s-card-row" style={{ marginTop: "auto" }}>
            <Link href={href} className="s-btn">
              {SOMEWHERE.cardCta} <span className="s-arrow">↗</span>
            </Link>
            <span className="s-card-note">{d.cardNote}</span>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
