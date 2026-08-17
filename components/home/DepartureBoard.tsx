"use client";

import { useState } from "react";
import { TRIPS } from "@/lib/trips";
import { inr } from "@/lib/format";
import Countdown from "@/components/ui/Countdown";
import SplitFlap from "@/components/ui/SplitFlap";
import CaseFileBody from "./CaseFileBody";

export default function DepartureBoard() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="board" id="board">
      <div className="board-head sec-head" style={{ marginBottom: 0 }}>
        <h2 className="disp sec-h rv">
          Departure <span className="ser">Board</span>
        </h2>
        <p className="sec-no rv">SEASON 01 — 4 OF 13 FILES OPEN</p>
      </div>
      <div className="board-cols" aria-hidden="true">
        <span>Code</span>
        <span>Fest / Campus</span>
        <span>Window</span>
        <span>Seats / Crew</span>
        <span>Fee</span>
        <span>File</span>
      </div>
      <div>
        {TRIPS.map((t) => {
          const open = openId === t.id;
          return (
            <article className={`card${open ? " open" : ""}`} key={t.id} id={`card-${t.id}`}>
              <button
                className="card-row"
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : t.id)}
              >
                <span className="card-code">
                  <SplitFlap text={t.id} />
                </span>
                <span className="card-fest">
                  <SplitFlap text={t.fest} />
                  <br />
                  <span className="lbl lbl-grey" style={{ fontFamily: "var(--mono)" }}>
                    {t.campus} — {t.city}
                  </span>
                </span>
                <span className="card-cell">
                  {t.win}
                  <br />
                  <Countdown closeAt={t.close} />
                </span>
                <span className="card-cell">
                  {t.seats - t.filled} / {t.seats} SEATS OPEN
                  <br />
                  <span className="lbl-grey">CREW: DIRECTOR + CAPTAIN</span>
                </span>
                <span className="card-price">
                  {inr(t.price)}
                  <small>{t.days} DAYS · EVERYTHING INCLUDED</small>
                </span>
                <span className="card-act">
                  <span className={`st${t.status === "BOARDING" ? "" : " st-blue"}`}>
                    {t.status}
                  </span>
                  <span className="card-open-ind">CASE FILE</span>
                </span>
              </button>
              <div className="card-x">
                <CaseFileBody trip={t} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
