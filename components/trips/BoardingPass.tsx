import Link from "next/link";
import type { Trip } from "@/lib/trips";
import { seatsLeft, isAlmostFull } from "@/lib/trips";
import { inr } from "@/lib/format";
import Frame from "@/components/ui/Frame";

/* Boarding pass — a trip card built as a real travel document.

   Two faces on a preserve-3d card: the pass itself, and the stub behind it
   carrying the manifest summary. Hover (desktop, motion allowed) rotates it
   on Y. The whole thing is a link, so keyboard users get the front face and
   go straight through — the back is decorative repetition, never the only
   home for information. */
export default function BoardingPass({
  trip,
  priority,
}: {
  trip: Trip;
  priority?: boolean;
}) {
  const left = seatsLeft(trip);

  return (
    <Link href={`/trips/${trip.slug}`} className="bp" aria-label={`${trip.fest} — ${trip.campus}`}>
      <div className="bp-inner">
        {/* FRONT */}
        <div className="bp-face bp-front">
          <div className="bp-strip">
            <span className="lbl">AS SCHEDULED®</span>
            <span className="lbl">BOARDING PASS</span>
          </div>
          <Frame slot={trip.card} ratio="16 / 11" priority={priority} sizes="(max-width:760px) 84vw, 30vw" />
          <div className="bp-body">
            <div className="bp-row">
              <span className="lbl lbl-grey">FLIGHT</span>
              <span className="lbl lbl-grey">SEATS</span>
            </div>
            <div className="bp-row bp-row-b">
              <span className="bp-code">{trip.id}</span>
              {isAlmostFull(trip) ? (
                <span className="st">{left} LEFT</span>
              ) : (
                <span className="bp-code">
                  {left}/{trip.seats}
                </span>
              )}
            </div>
            <h3 className="disp bp-fest">{trip.fest}</h3>
            <p className="lbl bp-where">
              {trip.campus} — {trip.city}
            </p>
            <div className="bp-perf" aria-hidden="true" />
            <div className="bp-foot">
              <span className="disp bp-price">{inr(trip.price)}</span>
              <span className="lbl lbl-grey">{trip.days} DAYS · ALL IN</span>
            </div>
          </div>
        </div>

        {/* BACK — the stub */}
        <div className="bp-face bp-back" aria-hidden="true">
          <div className="bp-strip">
            <span className="lbl">STUB — {trip.id}</span>
            <span className="lbl">19 SEATS</span>
          </div>
          <div className="bp-back-body">
            <p className="bp-hook">{trip.hook}</p>
            <dl className="bp-kv">
              <dt>Window</dt>
              <dd>{trip.win.split(" — ")[0]}</dd>
              <dt>Duration</dt>
              <dd>{trip.days} days</dd>
              <dt>Crew</dt>
              <dd>Director + Trip Captain</dd>
              <dt>Included</dt>
              <dd>Travel · fest · stay · all meals</dd>
            </dl>
            <span className="st st-peach bp-stamp">OPEN FOR APPLICATION</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
