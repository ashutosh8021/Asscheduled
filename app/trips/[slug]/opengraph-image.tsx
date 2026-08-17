import { ImageResponse } from "next/og";
import { TRIPS, getTrip, seatsLeft } from "@/lib/trips";

export const alt = "AS SCHEDULED departure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TRIPS.map((t) => ({ slug: t.slug }));
}

/* Per-departure share card. Every value comes from lib/trips.ts, so a price or
   seat-count edit propagates to social previews without touching this file. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = getTrip(slug);

  if (!trip) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FAF6EE",
            color: "#12234F",
            fontSize: 56,
          }}
        >
          AS SCHEDULED
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF6EE",
          color: "#12234F",
          padding: 64,
          border: "16px solid #12234F",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4 }}>
          <span>AS SCHEDULED®</span>
          <span style={{ color: "#8A8FA1" }}>{trip.id}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {trip.fest}
          </div>
          <div style={{ fontSize: 34, letterSpacing: 2, color: "#8A8FA1", marginTop: 14 }}>
            {`${trip.campus} — ${trip.city}`}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 700 }}>
              {`INR ${trip.price.toLocaleString("en-IN")}`}
            </span>
            <span style={{ fontSize: 20, letterSpacing: 3, color: "#8A8FA1" }}>
              {`${trip.days} DAYS · EVERYTHING INCLUDED`}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 3,
              color: "#D9351F",
              border: "3px solid #D9351F",
              padding: "8px 18px",
              transform: "rotate(-3deg)",
            }}
          >
            {`${seatsLeft(trip)} OF ${trip.seats} SEATS`}
          </div>
        </div>
      </div>
    ),
    size
  );
}
