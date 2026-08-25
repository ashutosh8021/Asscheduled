"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { ApplicationRow, ApplicationStatus } from "@/lib/adminData";
import { DEPARTURES } from "@/lib/departures";
import { Detail, fullWhen, type Field } from "./Detail";
import DocumentsPanel from "./DocumentsPanel";

/* The worklist. Status changes post to /api/admin/status and then
   refresh the server component, so what you see is always what is in
   the database rather than optimistic local state that could drift. */

const NEXT: { label: string; status: ApplicationStatus }[] = [
  { label: "REVIEWING", status: "reviewing" },
  { label: "ACCEPT", status: "accepted" },
  { label: "DECLINE", status: "declined" },
];

const COLUMNS = 11;

function departureName(code: string): string {
  const d = DEPARTURES.find((x) => x.id === code);
  return d ? `${d.fest} — ${d.campus}` : code;
}

function shortWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function move(id: string, status: ApplicationStatus) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  function fieldsFor(r: ApplicationRow): Field[] {
    /* Show the panel wherever documents could exist, which is two
       different cases:

       - the departure collects them at application time, so they may
         already be there while the row still says "new";
       - the application is accepted, so it is time to ask.

       Gating on "accepted" alone hid every PULSE applicant's uploads
       completely — the files were in the bucket and nothing in the
       admin said so. Anywhere else stays clean. */
    const departure = DEPARTURES.find((x) => x.id === r.departure_code);
    const mayHaveDocuments = r.status === "accepted" || departure?.documentsAtApply === true;

    const docs: Field[] = mayHaveDocuments
      ? [{ label: "Documents", value: <DocumentsPanel id={r.id} />, wide: true }]
      : [];

    return docs.concat([
      { label: "Applied", value: fullWhen(r.created_at) },
      { label: "Reference", value: r.reference },
      { label: "Departure", value: `${departureName(r.departure_code)} (${r.departure_code})` },
      { label: "Status", value: r.status },
      { label: "Name", value: r.name },
      {
        label: "Phone",
        value: <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a>,
      },
      { label: "Age", value: r.age },
      { label: "Gender", value: r.gender },
      { label: "State", value: r.state },
      { label: "Occupation", value: r.occupation },
      { label: "College", value: r.college },
      {
        label: "Instagram",
        value: r.instagram ? (
          <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noreferrer">
            @{r.instagram}
          </a>
        ) : null,
      },
      { label: "What made them want to come", value: r.why, wide: true },
    ]);
  }

  if (rows.length === 0) return <p className="a-empty">Nothing here yet.</p>;

  return (
    <div className="a-scroll">
      <table className="a-table">
        <thead>
          <tr>
            <th />
            <th>Applied</th>
            <th>Reference</th>
            <th>Departure</th>
            <th>Name</th>
            <th>Phone</th>
            <th>College</th>
            <th>Age</th>
            <th>Why</th>
            <th>Status</th>
            <th>Move to</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isOpen = open === r.id;
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
                  <td className="a-nowrap a-dim">{shortWhen(r.created_at)}</td>
                  <td className="a-nowrap a-dim">{r.reference}</td>
                  <td className="a-nowrap">{departureName(r.departure_code)}</td>
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
                  <td className="a-why" title={r.why ?? ""}>
                    {r.why ?? "—"}
                  </td>
                  <td>
                    <span className="a-pill" data-s={r.status}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="a-actions">
                      {NEXT.filter((n) => n.status !== r.status).map((n) => (
                        <button
                          key={n.status}
                          type="button"
                          className="a-btn"
                          disabled={busy === r.id}
                          onClick={() => move(r.id, n.status)}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
                {isOpen ? <Detail fields={fieldsFor(r)} span={COLUMNS} /> : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
