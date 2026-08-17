import Link from "next/link";
import { upcomingTrips, mostWantedTrips, almostFullTrips } from "@/lib/trips";
import TripCard from "./TripCard";
import BoardingPass from "./BoardingPass";
import Rail3D from "./Rail3D";

/* The three homepage merchandising rails — build spec §6, §7, §8.

   All three read live data. ALMOST FULL is computed from real seat counts,
   never hand-set: §8 requires genuine availability, so when nothing is
   actually filling up the section says so rather than manufacturing urgency. */

function RailHead({
  title,
  note,
  href,
}: {
  title: string;
  note: string;
  href?: string;
}) {
  return (
    <div className="rail-head">
      <h2 className="disp rail-title">{title}</h2>
      <div className="rail-meta">
        <p className="sec-no">{note}</p>
        {href && (
          <Link href={href} className="rail-all lbl">
            ALL DEPARTURES →
          </Link>
        )}
      </div>
    </div>
  );
}

export function Upcoming() {
  const trips = upcomingTrips();
  return (
    <section className="sec rail" id="upcoming">
      <RailHead
        title="UPCOMING"
        note={`${trips.length} DEPARTURES OPEN FOR APPLICATION`}
        href="/trips"
      />
      <Rail3D>
        {trips.map((t, i) => (
          <BoardingPass key={t.id} trip={t} priority={i === 0} />
        ))}
      </Rail3D>
    </section>
  );
}

export function MostWanted() {
  const trips = mostWantedTrips();
  if (!trips.length) return null;
  return (
    <section className="sec rail rail-dark" id="most-wanted">
      <RailHead title="MOST WANTED" note="THE ONES PEOPLE ASK ABOUT FIRST" />
      <div className="rail-feature">
        {trips.map((t) => (
          <TripCard key={t.id} trip={t} feature />
        ))}
      </div>
    </section>
  );
}

export function AlmostFull() {
  const trips = almostFullTrips();
  return (
    <section className="sec rail" id="almost-full">
      <RailHead
        title="ALMOST FULL"
        note={trips.length ? "FOUR SEATS OR FEWER REMAINING" : "NOTHING CRITICAL YET"}
      />
      {trips.length ? (
        <Rail3D>
          {trips.map((t) => (
            <BoardingPass key={t.id} trip={t} />
          ))}
        </Rail3D>
      ) : (
        /* §8 — genuine availability only. No invented scarcity. */
        <div className="rail-empty">
          <span className="st st-grey">NOTHING CRITICAL YET</span>
          <p className="disp">Every departure still has room.</p>
          <p className="rail-empty-note">
            This board fills as seats go. We would rather show you an empty shelf than invent a
            countdown.
          </p>
          <Link className="btn" href="/trips">
            See all departures
          </Link>
        </div>
      )}
    </section>
  );
}
