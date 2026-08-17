import Link from "next/link";
import type { Trip } from "@/lib/trips";
import Countdown from "@/components/ui/Countdown";
import DayAccordion from "@/components/trips/DayAccordion";

/* The inside of a case file — chips, six-day manifest, includes/excludes,
   apply CTA. Shared by the departure board expansion and /departures/[code]. */
export default function CaseFileBody({ trip }: { trip: Trip }) {
  return (
    <div className="card-x-in">
      <div className="card-chips">
        <span className="chip hot">TRAVEL BOTH WAYS — INCLUDED</span>
        <span className="chip">FEST TICKETS — INCLUDED</span>
        <span className="chip">ALL MEALS 3/DAY — INCLUDED</span>
        <span className="chip">5 NIGHTS TWIN-SHARE</span>
        <span className="chip">DIRECTOR + TRIP CAPTAIN</span>
      </div>
      <h3>Six-day manifest — evenings marked sealed stay sealed</h3>
      <div className="days">
        {trip.itin.map((d, i) => (
          <DayAccordion key={d.n} no={d.n} title={d.t} defaultOpen={i === 0}>
            {d.blocks.map((b) => (
              <div className="blk" key={b[0] + b[1].slice(0, 12)}>
                <b>{b[0]}</b>
                <span>{b[1]}</span>
              </div>
            ))}
            <p className="day-stay">
              <b>STAY —</b> {d.stay}
            </p>
          </DayAccordion>
        ))}
      </div>
      <p className="day-stay" style={{ margin: "-14px 0 34px" }}>
        <b>BASE —</b> {trip.stayBase}
      </p>
      <div className="incx">
        <div>
          <h3>Included — all of it</h3>
          <ul className="inc">
            {trip.inc.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Not included</h3>
          <ul className="inc ex">
            {trip.exc.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card-x-meta">
        <Link className="btn btn-peach" href={`/apply?trip=${trip.id}`}>
          Apply — {trip.id}
        </Link>
        <span className="card-x-note">
          ₹500 application, non-refundable · <Countdown closeAt={trip.close} />
        </span>
      </div>
    </div>
  );
}
