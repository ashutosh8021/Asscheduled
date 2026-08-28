"use client";

import { useState } from "react";

/* Push every PULSE application into the Google Sheet.
 *
 * The live mirror is fire-and-forget, so an update can be missed — an
 * outage, a redeployed script. This is the repair, and the way a new
 * sheet gets filled with everything that arrived before it existed.
 *
 * Says what actually happened, including how many rows went. "Synced"
 * with no number would leave you unable to tell a working sync from
 * one that found nothing. */

type State = null | { ok: boolean; text: string };

export default function ResyncSheet({ connected }: { connected: boolean }) {
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<State>(null);

  async function run() {
    setBusy(true);
    setSaid(null);
    try {
      const res = await fetch("/api/admin/resync", { method: "POST" });
      const json = (await res.json()) as { ok: boolean; rows?: number; error?: string };
      setSaid(
        json.ok
          ? { ok: true, text: `${json.rows} row${json.rows === 1 ? "" : "s"} sent` }
          : { ok: false, text: json.error ?? "That did not go through." }
      );
    } catch {
      setSaid({ ok: false, text: "No connection." });
    } finally {
      setBusy(false);
    }
  }

  /* Nothing to press when no sheet is wired up. A button that can only
     fail is worse than no button — but say why, or it looks missing. */
  if (!connected) {
    return <span className="a-sync-off">SHEET NOT CONNECTED</span>;
  }

  return (
    <span className="a-sync">
      <button type="button" className="a-btn" onClick={run} disabled={busy}>
        {busy ? "SYNCING…" : "RESYNC SHEET"}
      </button>
      {said ? (
        <span className="a-sync-said" data-ok={said.ok} role="status">
          {said.text}
        </span>
      ) : null}
    </span>
  );
}
