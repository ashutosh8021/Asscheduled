import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Reveals from "@/components/ui/Reveal";
import TripCard from "@/components/trips/TripCard";
import DepartureBoard from "@/components/home/DepartureBoard";
import { TRIPS, SOON } from "@/lib/trips";

export const metadata: Metadata = {
  alternates: { canonical: "/trips" },
  title: "Trips — Season 01 Departures · AS SCHEDULED",
  description:
    "Every open departure for Season 01. Six-day curated trips around India's biggest college fests. 19 seats each, application only.",
};

/* Build spec §9 — editorial directory, image-led, never a spreadsheet.
   The split-flap board is kept below the grid as the detailed manifest view. */
export default function TripsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">TRIPS</h1>
            <div className="rail-meta">
              <p className="sec-no">
                SEASON 01 — {TRIPS.length} OF {TRIPS.length + SOON.length} FILES OPEN
              </p>
            </div>
          </div>
          <div className="trip-grid">
            {TRIPS.map((t, i) => (
              <TripCard key={t.id} trip={t} priority={i < 2} level="h2" />
            ))}
          </div>
        </section>

        <DepartureBoard />

        <section className="sec">
          <div className="rail-head" style={{ padding: 0 }}>
            <h2 className="disp rail-title rv">FILES PENDING</h2>
            <div className="rail-meta">
              <p className="sec-no rv">{SOON.length} DEPARTURES — SEALED UNTIL DATES CONFIRM</p>
            </div>
          </div>
          <div className="soon-grid rv">
            {SOON.map((s) => (
              <div className="soon-tile" key={s[0]}>
                <h3>{s[0]}</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="lbl lbl-grey">{s[1]}</span>
                  <span className="st st-grey" style={{ fontSize: 9 }}>
                    FILE PENDING
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
