"use client";

/* Package selector — build spec §22.

   No tiers are defined yet: per-tier pricing is an open item and inventing
   it is forbidden. Rather than ship a fake selector, this renders the single
   real package (everything included, one price) and states plainly that
   tiers are pending. The moment `trip.packages` is populated in lib/trips.ts
   this switches to the full selector with no further changes here. */

import { useState } from "react";
import Link from "next/link";
import type { Trip } from "@/lib/trips";
import { inr } from "@/lib/format";

export default function PackageSelector({ trip }: { trip: Trip }) {
  const [selected, setSelected] = useState(trip.packages[0]?.id ?? "base");

  return (
    <section className="sec pkg" id="packages">
      <div className="rail-head" style={{ padding: 0 }}>
        <h2 className="disp rail-title rv">THE PACKAGE</h2>
        <div className="rail-meta">
          <p className="sec-no rv">FILE — WHAT YOU PAY FOR</p>
        </div>
      </div>

      {trip.packages.length > 0 ? (
        <div className="pkg-grid rv">
          {trip.packages.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pkg-opt${selected === p.id ? " on" : ""}`}
              aria-pressed={selected === p.id}
              onClick={() => setSelected(p.id)}
            >
              <span className="pkg-top">
                <span className="lbl">{p.name}</span>
                {p.recommended && <span className="st st-peach">RECOMMENDED</span>}
              </span>
              <span className="disp pkg-price">{inr(p.price)}</span>
              <ul className="pkg-diff">
                {p.differences.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : (
        <div className="pkg-single rv">
          <div className="pkg-single-main">
            <span className="lbl lbl-grey">ONE PACKAGE — SEASON 01</span>
            <p className="disp pkg-price">{inr(trip.price)}</p>
            <p className="pkg-single-note">
              Travel both ways, fest access, five nights twin-share, every meal, every transfer,
              and two crew on the ground. There is no lower tier that quietly removes the meals.
            </p>
          </div>
          <div className="pkg-single-side">
            <span className="st st-grey">TIERS PENDING</span>
            <p>
              Upgrade tiers and add-ons are being priced. When they exist they appear here — not
              before.
            </p>
          </div>
        </div>
      )}

      <div className="pkg-foot rv">
        <Link className="btn btn-peach" href={`/apply?trip=${trip.id}`}>
          Apply with this package
        </Link>
        <span className="lbl lbl-grey">
          ₹500 REGISTRATION, NON-REFUNDABLE · NOT CREDITED AGAINST THE TRIP FEE
        </span>
      </div>
    </section>
  );
}
