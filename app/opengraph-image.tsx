import { ImageResponse } from "next/og";

export const alt = "AS SCHEDULED — Season 02. 19 seats per departure. Application only.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Share card. Brand palette and layout, rendered at build time.
   TODO(mannat): swap in Anton once we can ship the woff locally — next/og
   cannot read next/font's cached files, and fetching at build time would
   make the build depend on the network. */
export default function OpengraphImage() {
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
          <span style={{ color: "#8A8FA1" }}>SEASON 02</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 104,
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            The fest gets you there.
          </div>
          <div
            style={{
              fontSize: 104,
              lineHeight: 1,
              letterSpacing: -2,
              color: "#FF9463",
              fontStyle: "italic",
            }}
          >
            The city keeps you.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 24, letterSpacing: 3, color: "#8A8FA1" }}>
            19 SEATS PER DEPARTURE · APPLICATION ONLY
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
            APPLICATIONS OPEN
          </div>
        </div>
      </div>
    ),
    size
  );
}
