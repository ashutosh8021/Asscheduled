"use client";

/* Last-resort boundary: catches failures in the root layout itself, so it
   cannot rely on the layout's fonts or shell. Self-contained inline styles,
   brand palette by hex. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6EE",
          color: "#12234F",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          padding: "32px",
        }}
      >
        <main style={{ maxWidth: "52ch" }}>
          <p style={{ fontSize: 12, letterSpacing: ".14em", color: "#8A8FA1", margin: 0 }}>
            ERROR — SYSTEM FAULT
          </p>
          <h1
            style={{
              fontSize: "clamp(32px,6vw,64px)",
              lineHeight: 0.95,
              textTransform: "uppercase",
              margin: "16px 0",
            }}
          >
            Everything stopped.
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
            The site failed to start. This is ours to fix, not yours to work around.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, letterSpacing: ".08em", color: "#8A8FA1" }}>
              FAULT REF: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              font: "inherit",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              border: "2px solid #12234F",
              background: "#FFAD84",
              color: "#12234F",
              padding: "14px 26px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
