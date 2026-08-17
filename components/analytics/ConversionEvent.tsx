"use client";

/* Fires a single named event when the page mounts. Used by /apply/thank-you,
   which is the only place an application can be counted as converted.
   The ref guard keeps React 18/19 strict-mode double-mounting in development
   from reporting two conversions for one application. */

import { useEffect, useRef } from "react";
import { track, type EventParams } from "@/lib/analytics";

export default function ConversionEvent({
  event,
  params,
}: {
  event: string;
  params?: EventParams;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, params ?? {});
  }, [event, params]);

  return null;
}
