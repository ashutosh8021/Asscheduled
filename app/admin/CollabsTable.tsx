"use client";

import { Fragment, useState } from "react";
import type { CollaborationRow } from "@/lib/adminData";
import { Detail, fullWhen, type Field } from "./Detail";

const COLUMNS = 7;

export default function CollabsTable({ rows }: { rows: CollaborationRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  function fieldsFor(r: CollaborationRow): Field[] {
    return [
      { label: "Received", value: fullWhen(r.created_at) },
      { label: "Status", value: r.status },
      { label: "Organisation / event", value: r.organisation },
      { label: "Type", value: r.kind },
      { label: "Contact", value: r.name },
      { label: "Email", value: <a href={`mailto:${r.email}`}>{r.email}</a> },
      {
        label: "Phone",
        value: r.phone ? <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a> : null,
      },
      { label: "Location", value: r.location },
      { label: "Event dates", value: r.dates },
      { label: "Interested in", value: r.collab_on.join(", ") },
      { label: "Details", value: r.details, wide: true },
    ];
  }

  if (rows.length === 0) return <p className="a-empty">No collaboration enquiries yet.</p>;

  return (
    <div className="a-scroll">
      <table className="a-table">
        <thead>
          <tr>
            <th />
            <th>Received</th>
            <th>Organisation</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Type</th>
            <th>Details</th>
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
                  <td className="a-nowrap a-dim">{fullWhen(r.created_at)}</td>
                  <td className="a-nowrap a-strong">{r.organisation}</td>
                  <td className="a-nowrap">{r.name}</td>
                  <td className="a-nowrap">
                    <a href={`mailto:${r.email}`} style={{ color: "inherit" }}>
                      {r.email}
                    </a>
                  </td>
                  <td className="a-nowrap">{r.kind}</td>
                  <td className="a-why" title={r.details}>
                    {r.details}
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
