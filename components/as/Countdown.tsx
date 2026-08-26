"use client";

import { useEffect, useState } from "react";

/* Time until the next departure.

   The server cannot render this. Whatever it computed would be stale
   by the time it reached a browser, and rendering one number on the
   server and a different one on the client is a hydration mismatch —
   so the digits stay blank until after mount and then tick.

   The blanks are em dashes rather than zeros: a countdown reading
   00:00:00 for a moment says the departure has left. */

const UNITS = ["DAYS", "HRS", "MIN", "SEC"] as const;

function parts(msLeft: number): string[] {
  if (msLeft <= 0) return ["00", "00", "00", "00"];
  const s = Math.floor(msLeft / 1000);
  return [
    Math.floor(s / 86400),
    Math.floor((s % 86400) / 3600),
    Math.floor((s % 3600) / 60),
    s % 60,
  ].map((n) => String(n).padStart(2, "0"));
}

export default function Countdown({
  to,
  label,
  units = UNITS,
}: {
  /** ISO string. Parsed in the browser, so the viewer's own clock. */
  to: string;
  label: string;
  units?: readonly string[];
}) {
  const [digits, setDigits] = useState<string[] | null>(null);

  useEffect(() => {
    const target = new Date(to).getTime();
    if (Number.isNaN(target)) return;

    const tick = () => setDigits(parts(target - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [to]);

  const shown = digits ?? ["—", "—", "—", "—"];

  return (
    <div className="s-cd">
      <p className="s-cd-label">{label}</p>
      <div className="s-cd-row" role="timer" aria-live="off">
        {shown.map((d, i) => (
          <div key={units[i] ?? i} className="s-cd-cell">
            <span className="s-cd-num">{d}</span>
            <span className="s-cd-unit">{units[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
