"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ALL_DEPARTURES } from "@/lib/departures";
import type { DocumentBundle } from "@/lib/adminData";

/* Every uploaded document in one place, grouped by traveller.

   The applications tab can show these too, but only one row at a time
   and only if you think to expand it. This is the view for the actual
   job: seeing who has sent what, reading the names off the cards, and
   spotting who still owes you something.

   Unlike the panel inside a row, images load with the page here — you
   came to this tab to look at documents, so making you press a second
   button would be ceremony rather than caution. */

const KIND_LABEL: Record<string, string> = {
  photo_id: "Government photo ID",
  college_id: "College ID",
  payment_proof: "Payment screenshot",
};

/* Both kinds, so a half-finished upload is visible as a gap rather
   than as an absence you have to notice. */
const EXPECTED = ["photo_id", "college_id"];

function departureName(code: string): string {
  const d = ALL_DEPARTURES.find((x) => x.id === code);
  return d ? `${d.fest} — ${d.campus}` : code;
}

export default function DocumentsTab({ bundles }: { bundles: DocumentBundle[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function purge(applicationId: string, who: string) {
    if (!confirm(`Delete every document for ${who}? This cannot be undone.`)) return;
    setBusy(applicationId);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: applicationId, action: "purge" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (bundles.length === 0) {
    return (
      <p className="a-empty">
        Nobody has uploaded anything yet. PULSE applicants send theirs with the application;
        for other departures, issue an upload link from the applications tab.
      </p>
    );
  }

  return (
    <div className="a-dt">
      {bundles.map((b) => {
        const missing = EXPECTED.filter((k) => !b.files.some((f) => f.kind === k));

        return (
          <section key={b.applicationId} className="a-dt-card">
            <header className="a-dt-head">
              <div>
                <h2 className="a-dt-name">{b.name}</h2>
                <p className="a-dt-meta">
                  {b.reference} · {departureName(b.departureCode)} ·{" "}
                  <a href={`tel:+91${b.phone}`}>+91 {b.phone}</a> · {b.college}
                </p>
              </div>

              <div className="a-dt-right">
                <span className="a-pill" data-s={b.status}>
                  {b.status}
                </span>
                <button
                  type="button"
                  className="a-btn"
                  disabled={busy === b.applicationId}
                  onClick={() => void purge(b.applicationId, b.name)}
                >
                  DELETE
                </button>
              </div>
            </header>

            {missing.length ? (
              <p className="a-dt-missing">
                Still waiting on: {missing.map((k) => KIND_LABEL[k] ?? k).join(", ")}
              </p>
            ) : null}

            <div className="a-dt-files">
              {b.files.map((f) => (
                <figure key={f.id} className="a-dt-file">
                  <figcaption>
                    <span>{KIND_LABEL[f.kind] ?? f.kind}</span>
                    <span className="a-docs-meta">
                      {Math.round(f.bytes / 1024)} KB ·{" "}
                      {new Date(f.uploadedAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </figcaption>

                  {f.url && f.mime.startsWith("image/") ? (
                    <a href={f.url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.url} alt={`${KIND_LABEL[f.kind] ?? f.kind} for ${b.name}`} />
                    </a>
                  ) : f.url ? (
                    /* Only images are accepted, so this is a
                       fallback for anything older or unreadable. */
                    <a href={f.url} target="_blank" rel="noreferrer" className="a-dt-pdf">
                      OPEN FILE
                    </a>
                  ) : (
                    <p className="a-docs-meta">unavailable</p>
                  )}
                </figure>
              ))}
            </div>
          </section>
        );
      })}

      <p className="a-docs-note">
        These images are signed for a few minutes only. Reload the page if one goes blank, and do
        not paste the links anywhere.
      </p>
    </div>
  );
}
