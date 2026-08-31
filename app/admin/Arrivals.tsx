"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* "Something came in."
 *
 * The panels are server-rendered, so a page left open goes stale the
 * moment somebody applies. Normally that would not matter — the email
 * tells you. It is not telling anybody at the moment, so this does:
 * it polls two counts and pops when either goes up.
 *
 * Deliberately small in what it knows. The endpoint returns numbers
 * and no detail, so nothing about an applicant is sitting in a tab
 * that might be open on a shared screen. Pressing the pop refreshes
 * the panel, which is what actually fetches the rows, behind the
 * session check.
 *
 * The baseline is what the server rendered. That means a pop says
 * "more than when this page loaded", which is the honest claim — not
 * "unread", which we have nowhere to store. */

const EVERY_MS = 30_000;

interface Counts {
  applications: number;
  enquiries: number;
}

function phrase(n: number, one: string, many: string): string | null {
  if (n <= 0) return null;
  return `${n} new ${n === 1 ? one : many}`;
}

export default function Arrivals({ applications, enquiries }: Counts) {
  const router = useRouter();

  /* A ref, not state: the poll must compare against the render the
     viewer is actually looking at, and re-rendering the baseline would
     make the pop clear itself. */
  const base = useRef<Counts>({ applications, enquiries });
  const [extra, setExtra] = useState<Counts>({ applications: 0, enquiries: 0 });

  /* The server re-rendered — after a refresh, or a status change — so
     what is on screen is current again and the pop has been answered. */
  useEffect(() => {
    base.current = { applications, enquiries };
    setExtra({ applications: 0, enquiries: 0 });
  }, [applications, enquiries]);

  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout>;

    async function look() {
      try {
        const res = await fetch("/api/admin/arrivals", { cache: "no-store" });
        if (res.ok && live) {
          const j = (await res.json()) as Partial<Counts>;
          if (typeof j.applications === "number" && typeof j.enquiries === "number") {
            setExtra({
              applications: Math.max(0, j.applications - base.current.applications),
              enquiries: Math.max(0, j.enquiries - base.current.enquiries),
            });
          }
        }
      } catch {
        /* A failed poll is not worth telling anybody about. The panel
           is still showing real data; it is only the "something is
           new" hint that is missing, and it will try again. */
      }
      if (live) timer = setTimeout(look, EVERY_MS);
    }

    timer = setTimeout(look, EVERY_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, []);

  const total = extra.applications + extra.enquiries;

  /* The tab title too, so a panel left in a background tab is worth
     glancing at. Restored on unmount rather than left changed. */
  useEffect(() => {
    const original = document.title;
    if (total > 0) document.title = `(${total}) ${original}`;
    return () => {
      document.title = original;
    };
  }, [total]);

  if (total === 0) return null;

  const parts = [
    phrase(extra.applications, "application", "applications"),
    phrase(extra.enquiries, "enquiry", "enquiries"),
  ].filter((p): p is string => p !== null);

  return (
    <div className="a-pop" role="status" aria-live="polite">
      <div className="a-pop-body">
        <span className="a-pop-dot" aria-hidden="true" />
        <span className="a-pop-text">{parts.join(" · ")}</span>
      </div>

      <button type="button" className="a-pop-btn" onClick={() => router.refresh()}>
        SHOW
      </button>
      <button
        type="button"
        className="a-pop-x"
        aria-label="Dismiss"
        onClick={() => {
          /* Dismissing moves the baseline up, so the same arrival does
             not pop again on the next poll. Anything after it still
             will. */
          base.current = {
            applications: base.current.applications + extra.applications,
            enquiries: base.current.enquiries + extra.enquiries,
          };
          setExtra({ applications: 0, enquiries: 0 });
        }}
      >
        ×
      </button>
    </div>
  );
}
