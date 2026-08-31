"use client";

import { useEffect, useMemo, useState } from "react";

/* CSS-pixel viewports, not physical pixels — these are the numbers the
   browser reports to `window.innerWidth`, which is what media queries
   and `vw` units act on. */
const DEVICES = [
  { name: "iPhone SE", w: 375, h: 667 },
  { name: "iPhone 13 mini", w: 375, h: 812 },
  { name: "iPhone 14 / 15", w: 390, h: 844 },
  { name: "iPhone 14 Pro", w: 393, h: 852 },
  { name: "iPhone 15 Pro Max", w: 430, h: 932 },
  { name: "Galaxy S8+", w: 360, h: 740 },
  { name: "Pixel 7", w: 412, h: 915 },
  { name: "Galaxy S20 Ultra", w: 412, h: 915 },
  { name: "iPad mini", w: 768, h: 1024 },
  { name: "iPad Pro 11", w: 834, h: 1194 },
] as const;

const ROUTES = [
  "/",
  "/somewhere",
  "/somewhere/thomso-iit-roorkee",
  "/gallery",
  "/about",
  "/contact",
  "/faqs",
] as const;

export default function PreviewClient() {
  const [device, setDevice] = useState(3); // iPhone 14 Pro
  const [landscape, setLandscape] = useState(false);
  const [path, setPath] = useState<string>("/");
  /* Bumping this remounts the iframe, which is the only reliable way to
     force a reload across same-origin navigation inside it. */
  const [nonce, setNonce] = useState(0);
  const [avail, setAvail] = useState(900);

  const d = DEVICES[device];
  const w = landscape ? d.h : d.w;
  const h = landscape ? d.w : d.h;

  /* Scale the frame down when the device is taller than the window, so
     the whole phone stays visible without the page itself scrolling. */
  useEffect(() => {
    function measure() {
      setAvail(window.innerHeight - 150);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const scale = useMemo(() => Math.min(1, avail / h), [avail, h]);

  const ui: React.CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
    letterSpacing: "0.04em",
  };

  return (
    <div
      style={{
        ...ui,
        minHeight: "100vh",
        background: "#15171c",
        color: "#d8dbe2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 16px 40px",
      }}
    >
      {/* ---- controls ---- */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <select
          value={device}
          onChange={(e) => setDevice(Number(e.target.value))}
          style={{ ...ui, background: "#22252c", color: "#fff", border: "1px solid #363a44", padding: "7px 10px" }}
        >
          {DEVICES.map((dev, i) => (
            <option key={dev.name} value={i}>
              {dev.name} — {dev.w}×{dev.h}
            </option>
          ))}
        </select>

        <select
          value={path}
          onChange={(e) => setPath(e.target.value)}
          style={{ ...ui, background: "#22252c", color: "#fff", border: "1px solid #363a44", padding: "7px 10px" }}
        >
          {ROUTES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setLandscape((v) => !v)}
          style={{ ...ui, background: landscape ? "#BE452A" : "#22252c", color: "#fff", border: "1px solid #363a44", padding: "7px 12px", cursor: "pointer" }}
        >
          {landscape ? "LANDSCAPE" : "PORTRAIT"}
        </button>

        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          style={{ ...ui, background: "#22252c", color: "#fff", border: "1px solid #363a44", padding: "7px 12px", cursor: "pointer" }}
        >
          RELOAD
        </button>

        <span style={{ opacity: 0.55 }}>
          {w}×{h}
          {scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ""}
        </span>
      </div>

      {/* ---- device frame ----
          A wrapper of the scaled size keeps the page from reserving the
          full unscaled height under the phone. */}
      <div style={{ width: w * scale, height: h * scale }}>
        <div
          style={{
            width: w,
            height: h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: "10px solid #0b0c0f",
            borderRadius: 30,
            boxShadow: "0 30px 70px -20px rgba(0,0,0,.8)",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <iframe
            key={`${nonce}-${w}-${h}-${path}`}
            src={path}
            title={`${d.name} preview of ${path}`}
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </div>
      </div>

      <p style={{ marginTop: 22, opacity: 0.45, maxWidth: 520, textAlign: "center", lineHeight: 1.7 }}>
        Dev only — this route 404s in production. It uses your desktop
        browser engine, so it will not tell you whether iOS Safari
        autoplays the hero video. Check that on a real phone.
      </p>
    </div>
  );
}
