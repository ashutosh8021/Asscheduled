"use client";

import { Fragment, useState } from "react";
import type { AmbassadorRow } from "@/lib/adminData";
import { Detail, fullWhen, type Field } from "./Detail";

/* Crew signups — people asking to be ambassadors.
 *
 * Read-only for now. Selecting somebody and issuing their code is
 * Phase B of the Mood Indigo plan; until then this is the list you
 * call from, with search, because 150 names is not a list to scroll. */

const COLUMNS = 8;

export default function CrewTable({ rows }: { rows: AmbassadorRow[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");

  function fieldsFor(r: AmbassadorRow): Field[] {
    return [
      { label: "Applied", value: fullWhen(r.created_at) },
      { label: "Status", value: r.status },
      { label: "Tier", value: r.tier },
      { label: "Code", value: r.code ? r.code.toUpperCase() : "not issued" },
      { label: "Name", value: r.name },
      { label: "Phone", value: <a href={`tel:+91${r.phone}`}>+91 {r.phone}</a> },
      { label: "Email", value: <a href={`mailto:${r.email}`}>{r.email}</a> },
      { label: "Age", value: r.age },
      { label: "College", value: r.college },
      { label: "Year", value: r.year },
      { label: "City", value: `${r.city}, ${r.state}` },
      {
        label: "Instagram",
        value: r.instagram ? (
          <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noreferrer">
            @{r.instagram}
          </a>
        ) : null,
      },
      /* The field selection rests on — wide, so it reads in full. */
      { label: "Groups they can reach", value: r.reach, wide: true },
      { label: "Anything else", value: r.why, wide: true },
    ];
  }

  if (rows.length === 0) {
    return (
      <p className="a-empty">
        No Crew signups yet. If people have applied and this is still empty, run
        docs/schema-mi.sql — the table may not exist.
      </p>
    );
  }

  /* Across what you would call somebody back about: who, where, and
     which groups they claimed. */
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? rows.filter((r) =>
        [r.name, r.phone, r.email, r.college, r.city, r.state, r.reach, r.instagram ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : rows;

  return (
    <>
      <div className="a-search">
        <input
          type="search"
          className="a-input a-search-input"
          placeholder="Search name, phone, college, city, groups…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search Crew signups"
        />
        <span className="a-search-count">
          {shown.length} of {rows.length}
        </span>
      </div>

      {shown.length === 0 ? <p className="a-empty">Nothing matches that.</p> : null}

      <div className="a-scroll">
        <table className="a-table">
          <thead>
            <tr>
              <th />
              <th>Applied</th>
              <th>Name</th>
              <th>Phone</th>
              <th>College</th>
              <th>City</th>
              <th>Year</th>
              <th>Groups</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
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
                      <a href={`tel:+91${r.phone}`} style={{ color: "inherit" }}>
                        +91 {r.phone}
                      </a>
                    </td>
                    <td>{r.college}</td>
                    <td className="a-nowrap">{r.city}</td>
                    <td className="a-nowrap a-dim">{r.year}</td>
                    <td className="a-why" title={r.reach}>
                      {r.reach}
                    </td>
                  </tr>
                  {isOpen ? <Detail fields={fieldsFor(r)} span={COLUMNS} /> : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
