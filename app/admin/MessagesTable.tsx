"use client";

import { Fragment, useState } from "react";
import type { MessageRow } from "@/lib/adminData";
import { Detail, fullWhen, type Field } from "./Detail";

const COLUMNS = 6;

export default function MessagesTable({ rows }: { rows: MessageRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  function fieldsFor(r: MessageRow): Field[] {
    return [
      { label: "Received", value: fullWhen(r.created_at) },
      { label: "Status", value: r.status },
      { label: "Name", value: r.name },
      { label: "Email", value: <a href={`mailto:${r.email}`}>{r.email}</a> },
      { label: "Phone", value: <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a> },
      { label: "Message", value: r.message, wide: true },
    ];
  }

  if (rows.length === 0) return <p className="a-empty">No messages yet.</p>;

  return (
    <div className="a-scroll">
      <table className="a-table">
        <thead>
          <tr>
            <th />
            <th>Received</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Message</th>
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
                  <td className="a-nowrap a-strong">{r.name}</td>
                  <td className="a-nowrap">
                    <a href={`mailto:${r.email}`} style={{ color: "inherit" }}>
                      {r.email}
                    </a>
                  </td>
                  <td className="a-nowrap">+91 {r.phone}</td>
                  <td className="a-why" title={r.message}>
                    {r.message}
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
