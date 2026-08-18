"use client";

import type { ReactNode } from "react";

/* The expanded record panel, shared by all three tables.

   Every field a form collects appears here, including the ones already
   shown as columns — an expanded row should be the complete submission,
   not a set of leftovers you have to mentally recombine. */

export interface Field {
  label: string;
  value: ReactNode;
  /** Long free text — gets the full row rather than a narrow column. */
  wide?: boolean;
}

export function Detail({ fields, span }: { fields: Field[]; span: number }) {
  return (
    <tr>
      <td className="a-detail-cell" colSpan={span}>
        <dl className="a-detail">
          {fields.map((f) => (
            <div key={f.label} className={f.wide ? "a-detail-wide" : undefined}>
              <dt>{f.label}</dt>
              <dd>{f.value === null || f.value === "" ? "—" : f.value}</dd>
            </div>
          ))}
        </dl>
      </td>
    </tr>
  );
}

/** Full date and time, in IST — the audience and the crew are both in India. */
export function fullWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
