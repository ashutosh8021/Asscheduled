"use client";

import { useState } from "react";
import type { ApplicationRow, DocumentBundle, DocumentBundleFile } from "@/lib/adminData";
import { inr } from "@/lib/departures";
import { findPlan } from "@/lib/packages";

/* Who is coming, the documents to check them against, and the
 * transfers to reconcile.
 *
 * Three tabs rather than one long table, because they answer three
 * different questions and are used at different moments: who is on the
 * list, is this the person who applied, and has this one paid. Putting
 * an ID photo next to a UTR helps neither job.
 *
 * Read-only throughout. Nothing here changes a record. */

type Tab = "roster" | "documents" | "payments";

const KIND_LABEL: Record<string, string> = {
  photo_id: "Government photo ID",
  college_id: "College ID",
  payment_proof: "Payment screenshot",
};

const ID_KINDS = ["photo_id", "college_id"];
const PAY_KIND = "payment_proof";

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** One uploaded file, shown rather than linked — the point of opening
 *  an ID is reading it. */
function FileCard({ file, who }: { file: DocumentBundleFile; who: string }) {
  return (
    <figure className="a-dt-file">
      <figcaption>
        <span>{KIND_LABEL[file.kind] ?? file.kind}</span>
        <span className="a-dim">
          {Math.round(file.bytes / 1024)} KB · {when(file.uploadedAt)}
        </span>
      </figcaption>

      {file.url && file.mime.startsWith("image/") ? (
        <a href={file.url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.url} alt={`${KIND_LABEL[file.kind] ?? file.kind} for ${who}`} />
        </a>
      ) : file.url ? (
        <a href={file.url} target="_blank" rel="noreferrer" className="a-dt-pdf">
          OPEN FILE
        </a>
      ) : (
        <p className="a-docs-meta">unavailable</p>
      )}
    </figure>
  );
}

export default function PartnerRoster({
  apps,
  bundles,
}: {
  apps: ApplicationRow[];
  bundles: DocumentBundle[];
}) {
  const [tab, setTab] = useState<Tab>("roster");
  const [onlyAccepted, setOnlyAccepted] = useState(false);

  const filesFor = (id: string) => bundles.find((b) => b.applicationId === id)?.files ?? [];

  const withIds = apps.filter((a) => filesFor(a.id).some((f) => ID_KINDS.includes(f.kind)));
  /* A payment is worth showing if there is anything to check: a
     screenshot, a reference, or an amount that was owed. */
  const withPayment = apps.filter(
    (a) =>
      filesFor(a.id).some((f) => f.kind === PAY_KIND) ||
      Boolean(a.utr) ||
      typeof a.amount_due === "number"
  );

  if (apps.length === 0) return <p className="a-empty">Nobody has applied yet.</p>;

  const shown = onlyAccepted ? apps.filter((a) => a.status === "accepted") : apps;

  return (
    <>
      <div className="a-tabs">
        <button type="button" className="a-tab" data-on={tab === "roster"} onClick={() => setTab("roster")}>
          ROSTER<span className="a-tab-count">{apps.length}</span>
        </button>
        <button
          type="button"
          className="a-tab"
          data-on={tab === "documents"}
          onClick={() => setTab("documents")}
        >
          DOCUMENTS<span className="a-tab-count">{withIds.length}</span>
        </button>
        <button
          type="button"
          className="a-tab"
          data-on={tab === "payments"}
          onClick={() => setTab("payments")}
        >
          PAYMENTS<span className="a-tab-count">{withPayment.length}</span>
        </button>
      </div>

      {tab === "roster" ? (
        <>
          {/* A real filter now. These used to be chips that looked like
              controls and did nothing, which is worse than no control. */}
          <div className="a-tabs">
            <button
              type="button"
              className="a-tab"
              data-on={!onlyAccepted}
              onClick={() => setOnlyAccepted(false)}
            >
              EVERYONE<span className="a-tab-count">{apps.length}</span>
            </button>
            <button
              type="button"
              className="a-tab"
              data-on={onlyAccepted}
              onClick={() => setOnlyAccepted(true)}
            >
              ACCEPTED
              <span className="a-tab-count">
                {apps.filter((a) => a.status === "accepted").length}
              </span>
            </button>
          </div>

          <div className="a-scroll">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Applied</th>
                  <th>Reference</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>College</th>
                  <th>Age</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const plan = findPlan(r.departure_code, r.plan);
                  return (
                    <tr key={r.id}>
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
                      <td>
                        <span className="a-pill" data-s={r.status}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {shown.length === 0 ? <p className="a-empty">Nobody accepted yet.</p> : null}
        </>
      ) : null}

      {tab === "documents" ? (
        <Section
          people={withIds}
          empty="Nobody has sent identity documents yet."
          filesFor={(id) => filesFor(id).filter((f) => ID_KINDS.includes(f.kind))}
        />
      ) : null}

      {tab === "payments" ? (
        <Section
          people={withPayment}
          empty="No transfers to check yet."
          filesFor={(id) => filesFor(id).filter((f) => f.kind === PAY_KIND)}
          meta={(r) => (
            <>
              <span>
                AMOUNT{" "}
                <b>{typeof r.amount_due === "number" ? inr(r.amount_due) : "—"}</b>
              </span>
              <span>
                UTR <b>{r.utr ?? "—"}</b>
              </span>
            </>
          )}
        />
      ) : null}

      {tab !== "roster" ? (
        <p className="a-docs-meta" style={{ padding: "4px 2px 20px" }}>
          These images load for the rest of the day. If one stops showing, reload the page.
          Please do not download or forward them.
        </p>
      ) : null}
    </>
  );
}

/** A person-per-block list of files. Shared by both document tabs, so
 *  an ID and a payment screenshot are presented the same way. */
function Section({
  people,
  empty,
  filesFor,
  meta,
}: {
  people: ApplicationRow[];
  empty: string;
  filesFor: (applicationId: string) => DocumentBundleFile[];
  meta?: (r: ApplicationRow) => React.ReactNode;
}) {
  if (people.length === 0) return <p className="a-empty">{empty}</p>;

  return (
    <div className="a-dt">
      {people.map((r) => {
        const files = filesFor(r.id);
        return (
          <section key={r.id} className="a-dt-card">
            <header className="a-dt-head">
              <div>
                <p className="a-dt-name">{r.name}</p>
                <p className="a-dt-meta">
                  {r.reference} · <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a> · {r.college}
                </p>
              </div>
              {meta ? <div className="a-dt-right">{meta(r)}</div> : null}
            </header>

            {files.length === 0 ? (
              <p className="a-docs-meta" style={{ padding: "0 16px 16px" }}>
                Nothing uploaded.
              </p>
            ) : (
              <div className="a-dt-files">
                {files.map((f) => (
                  <FileCard key={f.id} file={f} who={r.name} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
