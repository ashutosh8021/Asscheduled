"use client";

import { Fragment, useState } from "react";
import type { ApplicationRow, DocumentBundle } from "@/lib/adminData";
import { inr } from "@/lib/departures";
import { findPlan } from "@/lib/packages";

/* Who is coming, and the documents to check them against.
 *
 * Deliberately one screen rather than the admin's tabs: this exists to
 * answer two questions — is this person on the list, and is the person
 * in front of me the person who applied. Everything else is noise.
 *
 * Documents load with the row expanded rather than with the page. The
 * URLs are signed and short-lived either way, but opening somebody's
 * government ID should be something you chose to do. */

const KIND_LABEL: Record<string, string> = {
  photo_id: "Government photo ID",
  college_id: "College ID",
  payment_proof: "Payment screenshot",
};

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PartnerRoster({
  apps,
  bundles,
}: {
  apps: ApplicationRow[];
  bundles: DocumentBundle[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  const filesFor = (id: string) => bundles.find((b) => b.applicationId === id)?.files ?? [];

  if (apps.length === 0) return <p className="a-empty">Nobody has applied yet.</p>;

  const accepted = apps.filter((a) => a.status === "accepted").length;

  return (
    <>
      <div className="a-tabs">
        <span className="a-tab" data-on={true}>
          EVERYONE<span className="a-tab-count">{apps.length}</span>
        </span>
        <span className="a-tab">
          ACCEPTED<span className="a-tab-count">{accepted}</span>
        </span>
      </div>

      <div className="a-scroll">
        <table className="a-table">
          <thead>
            <tr>
              <th />
              <th>Applied</th>
              <th>Reference</th>
              <th>Name</th>
              <th>Phone</th>
              <th>College</th>
              <th>Age</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>UTR</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((r) => {
              const isOpen = open === r.id;
              const files = filesFor(r.id);
              const plan = findPlan(r.departure_code, r.plan);

              return (
                <Fragment key={r.id}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="a-row-toggle"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? null : r.id)}
                      >
                        {isOpen ? "−" : "+"}
                      </button>
                    </td>
                    <td className="a-nowrap a-dim">{when(r.created_at)}</td>
                    <td className="a-nowrap a-dim">{r.reference}</td>
                    <td className="a-nowrap a-strong">{r.name}</td>
                    <td className="a-nowrap">
                      <a href={`tel:+91${r.phone}`} style={{ color: "inherit" }}>
                        +91 {r.phone}
                      </a>
                    </td>
                    <td>{r.college}</td>
                    <td className="a-nowrap a-dim">
                      {r.age} · {r.gender}
                    </td>
                    <td className="a-nowrap">{plan ? plan.n : "—"}</td>
                    <td className="a-nowrap">
                      {typeof r.amount_due === "number" ? inr(r.amount_due) : "—"}
                    </td>
                    <td className="a-nowrap a-dim">{r.utr ?? "—"}</td>
                    <td>
                      <span className="a-pill" data-s={r.status}>
                        {r.status}
                      </span>
                    </td>
                  </tr>

                  {isOpen ? (
                    <tr>
                      <td colSpan={11}>
                        <div className="a-dt-files">
                          {files.length === 0 ? (
                            <p className="a-docs-meta">Nothing uploaded yet.</p>
                          ) : (
                            files.map((f) => (
                              <figure key={f.id} className="a-dt-file">
                                <figcaption>
                                  <span>{KIND_LABEL[f.kind] ?? f.kind}</span>
                                  <span className="a-dim">
                                    {Math.round(f.bytes / 1024)} KB · {when(f.uploadedAt)}
                                  </span>
                                </figcaption>

                                {f.url && f.mime.startsWith("image/") ? (
                                  <a href={f.url} target="_blank" rel="noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={f.url}
                                      alt={`${KIND_LABEL[f.kind] ?? f.kind} for ${r.name}`}
                                    />
                                  </a>
                                ) : f.url ? (
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="a-dt-pdf"
                                  >
                                    OPEN FILE
                                  </a>
                                ) : (
                                  <p className="a-docs-meta">unavailable</p>
                                )}
                              </figure>
                            ))
                          )}
                        </div>

                        {/* Said plainly, because it is easy to forget
                            that these links are not permanent. */}
                        <p className="a-docs-meta" style={{ padding: "0 16px 14px" }}>
                          These links expire within minutes. Reload the page to open them again.
                          Please do not download or forward them.
                        </p>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
