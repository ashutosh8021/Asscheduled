import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin";
import {
  listApplications,
  listMessages,
  listCollaborations,
  applicationCounts,
  APPLICATION_STATUSES,
} from "@/lib/adminData";
import { DEPARTURES } from "@/lib/departures";
import ApplicationsTable from "./ApplicationsTable";
import MessagesTable from "./MessagesTable";
import CollabsTable from "./CollabsTable";
import SignOut from "./SignOut";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin · AS SCHEDULED",
  robots: { index: false, follow: false },
};

/* Never cache: this reads live application data behind a session. */
export const dynamic = "force-dynamic";

type Search = { tab?: string; status?: string; departure?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const sp = await searchParams;
  const tab = sp.tab === "messages" || sp.tab === "collabs" ? sp.tab : "applications";

  const [counts, apps, messages, collabs] = await Promise.all([
    applicationCounts(),
    tab === "applications"
      ? listApplications({ status: sp.status, departure: sp.departure })
      : Promise.resolve([]),
    tab === "messages" ? listMessages() : Promise.resolve([]),
    tab === "collabs" ? listCollaborations() : Promise.resolve([]),
  ]);

  /* Preserve the other filters when building a link. */
  const link = (next: Partial<Search>) => {
    const p = new URLSearchParams();
    const merged = { tab, status: sp.status, departure: sp.departure, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/admin?${p}`;
  };

  return (
    <div className="a-root">
      <div className="a-wrap">
        <div className="a-bar">
          <span className="a-bar-title">AS SCHEDULED — ADMIN</span>

          <div className="a-tabs" style={{ margin: 0 }}>
            <Link className="a-tab" href="/admin" data-on={tab === "applications"}>
              APPLICATIONS<span className="a-tab-count">{counts.all ?? 0}</span>
            </Link>
            <Link className="a-tab" href="/admin?tab=messages" data-on={tab === "messages"}>
              MESSAGES
            </Link>
            <Link className="a-tab" href="/admin?tab=collabs" data-on={tab === "collabs"}>
              COLLABS
            </Link>
          </div>

          <SignOut email={admin.email} />
        </div>

        {tab === "applications" ? (
          <>
            <div className="a-tabs">
              <Link className="a-tab" href={link({ status: undefined })} data-on={!sp.status}>
                ALL<span className="a-tab-count">{counts.all ?? 0}</span>
              </Link>
              {APPLICATION_STATUSES.map((s) => (
                <Link key={s} className="a-tab" href={link({ status: s })} data-on={sp.status === s}>
                  {s.toUpperCase()}
                  <span className="a-tab-count">{counts[s] ?? 0}</span>
                </Link>
              ))}
            </div>

            <div className="a-tabs">
              <Link className="a-tab" href={link({ departure: undefined })} data-on={!sp.departure}>
                EVERY DEPARTURE
              </Link>
              {DEPARTURES.map((d) => (
                <Link
                  key={d.id}
                  className="a-tab"
                  href={link({ departure: d.id })}
                  data-on={sp.departure === d.id}
                >
                  {d.fest}
                </Link>
              ))}
            </div>

            <ApplicationsTable rows={apps} />
          </>
        ) : null}

        {tab === "messages" ? <MessagesTable rows={messages} /> : null}

        {tab === "collabs" ? <CollabsTable rows={collabs} /> : null}
      </div>
    </div>
  );
}
