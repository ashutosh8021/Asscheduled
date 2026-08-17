import Link from "next/link";
import type { Trip } from "@/lib/trips";
import { seatsLeft, isAlmostFull } from "@/lib/trips";
import { inr } from "@/lib/format";
import Frame from "@/components/ui/Frame";

/* Editorial, image-led trip card (build spec §6, §9, §28).
   `feature` renders the larger hero-style card used by MOST WANTED. */
/* Heading level is contextual: on /trips the cards sit directly under the
   page h1 (so h2); on the homepage rails they sit under a rail h2 (so h3). */
export default function TripCard({
  trip,
  feature,
  priority,
  level: H = "h3",
}: {
  trip: Trip;
  feature?: boolean;
  priority?: boolean;
  level?: "h2" | "h3";
}) {
  const left = seatsLeft(trip);
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className={`tcard${feature ? " tcard-feature" : ""}`}
    >
      <Frame
        slot={trip.card}
        ratio={feature ? "16 / 10" : "4 / 5"}
        priority={priority}
        sizes={feature ? "(max-width: 760px) 100vw, 62vw" : "(max-width: 760px) 82vw, 30vw"}
      />
      <div className="tcard-body">
        <div className="tcard-top">
          <span className="lbl lbl-grey">{trip.id}</span>
          {isAlmostFull(trip) ? (
            <span className="st">{left} SEATS LEFT</span>
          ) : (
            <span className="st st-blue">{trip.status}</span>
          )}
        </div>
        <H className="tcard-fest disp">{trip.fest}</H>
        <p className="tcard-where lbl">
          {trip.campus} — {trip.city}
        </p>
        {feature && <p className="tcard-hook">{trip.hook}</p>}
        <div className="tcard-foot">
          <span className="tcard-price disp">{inr(trip.price)}</span>
          <span className="lbl lbl-grey">
            {trip.days} DAYS · {trip.win.split(" — ")[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
