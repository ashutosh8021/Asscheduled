"use client";

import { useEffect, useState } from "react";
import { countdown } from "@/lib/format";

/* Renders "APPS CLOSE 12D 4H 33M" / "APPS CLOSED". Ticks every 30s,
   matching the reference. Renders a dash until mounted to avoid
   hydration drift on times. */
export default function Countdown({ closeAt }: { closeAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className="cd">—</span>;
  const c = countdown(closeAt, now);
  if (c.closed)
    return (
      <span className="cd">
        <b>APPS CLOSED</b>
      </span>
    );
  return (
    <span className="cd">
      APPS CLOSE{" "}
      <b>
        {c.d}D {c.h}H {c.m}M
      </b>
    </span>
  );
}
