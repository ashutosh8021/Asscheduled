"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { AmbassadorRow } from "@/lib/adminData";
import { Detail, fullWhen, type Field } from "./Detail";

/* Crew signups — people asking to be ambassadors, and the accounts of
 * the ones we took on.
 *
 * ACTIVATE issues two things and shows them once: a referral code and a
 * passcode. Only their hashes are stored, so this panel is the only
 * moment either is readable — copy them out and send them, because
 * pressing it again makes a NEW passcode rather than showing the old
 * one. The code is kept, because links carrying it are already out
 * there.
 *
 * Crew accounts are not admin accounts. They sign in at /crew/login
 * against the ambassadors table and have no Supabase Auth user at all,
 * so there is nothing they could present at /admin or /partner — see
 * the note at the top of lib/crew.ts. */

const COLUMNS = 9;

/** What was just issued, for one person, held only in this tab. */
interface Issued {
  id: string;
  code: string;
  passcode: string;
}

export default function CrewTable({ rows }: { rows: AmbassadorRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  /* Re-activating replaces a working passcode, which is the right thing
     when somebody has lost theirs and the wrong thing to do by
     accident. So the second time it takes two presses, as delete does. */
  const [armed, setArmed] = useState<string | null>(null);

  async function act(id: string, action: string) {
    setBusy(id);
    setFailed(null);
    try {
      const res = await fetch("/api/admin/crew", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        code?: string;
        passcode?: string;
        error?: string;
      };

      if (!json.ok) {
        setFailed(json.error ?? "That did not go through.");
        return;
      }

      setArmed(null);
      if (json.code && json.passcode) {
        setIssued({ id, code: json.code, passcode: json.passcode });
      }
      router.refresh();
    } catch {
      setFailed("No connection.");
    } finally {
      setBusy(null);
    }
  }

  function account(r: AmbassadorRow) {
    const mine = issued?.id === r.id ? issued : null;
    /* Activated before, so pressing again would invalidate a passcode
       somebody is currently using. */
    const hasAccount = Boolean(r.activated_at);

    return (
      <div>
        {mine ? (
          /* Shown once. Said plainly, because losing this means issuing
             a new passcode and telling somebody their old one is dead. */
          <div className="a-crew-issued" role="status">
            <p className="a-crew-issued-head">SEND THESE NOW — THEY ARE NOT SHOWN AGAIN</p>
            <dl>
              <div>
                <dt>CODE</dt>
                <dd>{mine.code}</dd>
              </div>
              <div>
                <dt>PASSCODE</dt>
                <dd>{mine.passcode}</dd>
              </div>
            </dl>
            <p className="a-crew-issued-note">
              They sign in at asscheduled.com/crew/login with their phone number and this passcode.
              Their link is asscheduled.com/somewhere?p={mine.code}
            </p>
          </div>
        ) : null}

        <div className="a-actions">
          {armed === r.id ? (
            <>
              <button
                type="button"
                className="a-btn a-btn-primary"
                disabled={busy === r.id}
                onClick={() => void act(r.id, "activate")}
              >
                {busy === r.id ? "WORKING…" : "YES — NEW PASSCODE"}
              </button>
              <button type="button" className="a-btn" onClick={() => setArmed(null)}>
                CANCEL
              </button>
            </>
          ) : (
            <button
              type="button"
              className="a-btn a-btn-primary"
              disabled={busy === r.id}
              onClick={() => (hasAccount ? setArmed(r.id) : void act(r.id, "activate"))}
            >
              {hasAccount ? "NEW PASSCODE" : "ACTIVATE"}
            </button>
          )}

          {r.status === "active" ? (
            <button
              type="button"
              className="a-btn"
              disabled={busy === r.id}
              onClick={() => void act(r.id, "paused")}
            >
              PAUSE
            </button>
          ) : null}

          {r.status !== "declined" ? (
            <button
              type="button"
              className="a-btn"
              disabled={busy === r.id}
              onClick={() => void act(r.id, "declined")}
            >
              DECLINE
            </button>
          ) : null}
        </div>

        {failed ? (
          <p className="a-crew-failed" role="alert">
            {failed}
          </p>
        ) : null}
      </div>
    );
  }

  function fieldsFor(r: AmbassadorRow): Field[] {
    return [
      { label: "Applied", value: fullWhen(r.created_at) },
      { label: "Status", value: r.status },
      { label: "Tier", value: r.tier },
      { label: "Code", value: r.code ? r.code.toUpperCase() : "not issued" },
      { label: "Activated", value: r.activated_at ? fullWhen(r.activated_at) : null },
      { label: "Last signed in", value: r.last_login_at ? fullWhen(r.last_login_at) : null },
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
      { label: "Account", value: account(r), wide: true },
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
     which groups they claimed. Plus their code, because "who is
     PRIYAK4M" is the question you ask with a payout in front of you. */
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? rows.filter((r) =>
        [
          r.name,
          r.phone,
          r.email,
          r.college,
          r.city,
          r.state,
          r.reach,
          r.instagram ?? "",
          r.code ?? "",
        ]
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
          placeholder="Search name, phone, college, city, groups, code…"
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
              <th>Code</th>
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
                    {/* The code, and whether the account behind it is
                        live: a code with a paused account is somebody
                        whose links still credit them but who cannot
                        sign in. */}
                    <td className="a-nowrap">
                      {r.code ? (
                        <span className="a-crew-code" data-live={r.status === "active"}>
                          {r.code.toUpperCase()}
                        </span>
                      ) : (
                        <span className="a-dim">—</span>
                      )}
                    </td>
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
