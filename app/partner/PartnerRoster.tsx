"use client";

import { Fragment, useState } from "react";
import type {
  ApplicationRow,
  DocumentBundle,
  DocumentBundleFile,
  MessageRow,
} from "@/lib/adminData";
import { inr } from "@/lib/departures";
import { findPlan } from "@/lib/packages";
import { sitePlanFor } from "@/lib/sitePlans";
import { Detail, fullWhen, type Field } from "../admin/Detail";

/* Who is coming, the documents to check them against, and the
 * transfers to reconcile.
 *
 * Three tabs rather than one long table, because they answer three
 * different questions and are used at different moments: who is on the
 * list, is this the person who applied, and has this one paid. Putting
 * an ID photo next to a UTR helps neither job.
 *
 * Read-only throughout. Nothing here changes a record. */

export type Tab = "roster" | "documents" | "payments" | "enquiries";

const ALL_TABS: Tab[] = ["roster", "documents", "payments", "enquiries"];

/** The plan as a short cell: the old app's number, or the site's label. */
function planCell(r: ApplicationRow): string {
  const plan = findPlan(r.departure_code, r.plan);
  if (plan) return plan.n;
  return sitePlanFor(r.departure_code, r.plan)?.label ?? "—";
}

/**
 * Every answer the booking form collected, for the `full` roster.
 *
 * What a festival sees is exactly what the privacy policy says it sees,
 * so this list and the policy move together. Left out on purpose: who
 * referred them (a Crew code is our business, not the festival's) and
 * the internal stage.
 */
function fieldsFor(r: ApplicationRow): Field[] {
  const site = sitePlanFor(r.departure_code, r.plan);
  return [
    { label: "Booked", value: fullWhen(r.created_at) },
    { label: "Reference", value: r.reference },
    { label: "Status", value: r.status },
    { label: "Plan", value: site ? site.label : planCell(r) },
    /* The price they actually pay, after any early bird, then how it
       splits: the booking amount now and the balance still to come. */
    { label: "Package", value: site ? inr(site.inr - (r.discount_inr ?? 0)) : null },
    {
      label: "Booking amount",
      value: typeof r.amount_due === "number" ? inr(r.amount_due) : null,
    },
    {
      label: "Balance",
      value:
        site && typeof r.amount_due === "number"
          ? inr(Math.max(0, site.inr - (r.discount_inr ?? 0) - r.amount_due))
          : null,
    },
    { label: "Name", value: r.name },
    { label: "Phone", value: <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a> },
    { label: "Email", value: r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : null },
    { label: "Age", value: r.age },
    { label: "Gender", value: r.gender },
    { label: "College", value: r.college },
    { label: "City", value: r.city ?? null },
    { label: "State", value: r.state },
    {
      label: "Instagram",
      value: r.instagram ? (
        <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noreferrer">
          @{r.instagram}
        </a>
      ) : null,
    },
    { label: "Why they want to come", value: r.why, wide: true },
  ];
}

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
  enquiries = [],
  tabs = ALL_TABS,
  full = false,
}: {
  apps: ApplicationRow[];
  bundles: DocumentBundle[];
  /** Custom-booking questions asked from this departure's page. */
  enquiries?: MessageRow[];
  /** Which tabs to offer. Spring Fest collects no identity documents
   *  and has no enquiry form, so two empty tabs would only mislead. */
  tabs?: Tab[];
  /** Roster rows expand to every answer the form collected. Off for
   *  PULSE, whose view is fixed by what its privacy notice describes. */
  full?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(tabs[0] ?? "roster");
  const [open, setOpen] = useState<string | null>(null);
  const [onlyAccepted, setOnlyAccepted] = useState(false);
  const [q, setQ] = useState("");

  /* One search across every tab. Whichever list you are looking at,
     typing a name narrows it — a gate check is somebody standing in
     front of you, not a tab you happen to have open. */
  const needle = q.trim().toLowerCase();
  const matches = (r: ApplicationRow) =>
    !needle ||
    [r.name, r.phone, r.college, r.reference, r.state, r.utr ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(needle);

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

  const shownEnquiries = enquiries.filter(
    (m) =>
      !needle ||
      [m.name, m.email, m.phone, m.message].join(" ").toLowerCase().includes(needle)
  );

  if (apps.length === 0) return <p className="a-empty">Nobody has applied yet.</p>;

  const shown = (onlyAccepted ? apps.filter((a) => a.status === "accepted") : apps).filter(matches);

  return (
    <>
      <div className="a-tabs">
        {tabs.includes("roster") ? (
          <button type="button" className="a-tab" data-on={tab === "roster"} onClick={() => setTab("roster")}>
            ROSTER<span className="a-tab-count">{apps.length}</span>
          </button>
        ) : null}
        {tabs.includes("documents") ? (
          <button
            type="button"
            className="a-tab"
            data-on={tab === "documents"}
            onClick={() => setTab("documents")}
          >
            DOCUMENTS<span className="a-tab-count">{withIds.length}</span>
          </button>
        ) : null}
        {tabs.includes("payments") ? (
          <button
            type="button"
            className="a-tab"
            data-on={tab === "payments"}
            onClick={() => setTab("payments")}
          >
            PAYMENTS<span className="a-tab-count">{withPayment.length}</span>
          </button>
        ) : null}
        {tabs.includes("enquiries") ? (
          <button
            type="button"
            className="a-tab"
            data-on={tab === "enquiries"}
            onClick={() => setTab("enquiries")}
          >
            ENQUIRIES<span className="a-tab-count">{enquiries.length}</span>
          </button>
        ) : null}
      </div>

      <div className="a-search">
        <input
          type="search"
          className="a-input a-search-input"
          placeholder="Search name, phone, college, reference…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
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
                  {full ? <th /> : null}
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
                  const isOpen = full && open === r.id;
                  return (
                    <Fragment key={r.id}>
                      <tr>
                        {full ? (
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
                        ) : null}
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
                        <td className="a-nowrap">{planCell(r)}</td>
                        <td className="a-nowrap">
                          {typeof r.amount_due === "number" ? inr(r.amount_due) : "—"}
                        </td>
                        <td>
                          <span className="a-pill" data-s={r.status}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                      {isOpen ? <Detail fields={fieldsFor(r)} span={10} /> : null}
                    </Fragment>
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
          people={withIds.filter(matches)}
          empty="Nobody has sent identity documents yet."
          filesFor={(id) => filesFor(id).filter((f) => ID_KINDS.includes(f.kind))}
        />
      ) : null}

      {tab === "payments" ? (
        <Section
          people={withPayment.filter(matches)}
          empty="No transfers to check yet."
          filesFor={(id) => filesFor(id).filter((f) => f.kind === PAY_KIND)}
          meta={(r) => (
            <>
              <span>
                AMOUNT{" "}
                <b>{typeof r.amount_due === "number" ? inr(r.amount_due) : "—"}</b>
              </span>
              {/* The site's booking form takes a screenshot, not a typed
                  UTR, so on the full view an empty UTR is not a gap. */}
              {!full || r.utr ? (
                <span>
                  UTR <b>{r.utr ?? "—"}</b>
                </span>
              ) : null}
            </>
          )}
        />
      ) : null}

      {tab === "enquiries" ? (
        shownEnquiries.length === 0 ? (
          <p className="a-empty">No custom-booking enquiries yet.</p>
        ) : (
          <div className="a-dt">
            {shownEnquiries.map((m) => (
              <section key={m.id} className="a-dt-card">
                <header className="a-dt-head">
                  <div>
                    <p className="a-dt-name">{m.name}</p>
                    <p className="a-dt-meta">
                      <a href={`mailto:${m.email}`}>{m.email}</a>
                      {m.phone ? (
                        <>
                          {" · "}
                          <a href={`tel:+91${m.phone}`}>+91 {m.phone}</a>
                        </>
                      ) : null}
                      {" · "}
                      {when(m.created_at)}
                    </p>
                  </div>
                </header>
                <p className="a-enquiry">{m.message}</p>
              </section>
            ))}
          </div>
        )
      ) : null}

      {tab === "documents" || tab === "payments" ? (
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
