import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin";
import {
  listApplications,
  listMessages,
  listCollaborations,
  applicationCounts,
  arrivalCounts,
  ambassadorCount,
  listAmbassadors,
  listDocumentBundles,
  documentBundleCount,
  APPLICATION_STATUSES,
} from "@/lib/adminData";
import { ALL_DEPARTURES } from "@/lib/departures";
import ApplicationsTable from "./ApplicationsTable";
import MessagesTable from "./MessagesTable";
import CollabsTable from "./CollabsTable";
import CrewTable from "./CrewTable";
import DocumentsTab from "./DocumentsTab";
import SignOut from "./SignOut";
import ResyncSheet from "./ResyncSheet";
import Arrivals from "./Arrivals";
import { sheetConfigured } from "@/lib/sheet";
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
  const tab =
    sp.tab === "messages" || sp.tab === "collabs" || sp.tab === "documents" || sp.tab === "crew"
      ? sp.tab
      : "applications";

  const [counts, docCount, crewCount, arrivals, apps, messages, collabs, bundles, crew] =
    await Promise.all([
      applicationCounts(),
      documentBundleCount(),
      /* Counted on every tab, so the badge says how many are waiting.
         A tab with no number reads as empty — that is how a real
         enquiry sat unread for two weeks. */
      ambassadorCount(),
      /* Totals for the badge and for the "something came in" pop. Cheap
         enough to run on every tab: two counts, no rows. */
      arrivalCounts(null),
      tab === "applications"
        ? listApplications({ status: sp.status, departure: sp.departure })
        : Promise.resolve([]),
      tab === "messages" ? listMessages() : Promise.resolve([]),
      tab === "collabs" ? listCollaborations() : Promise.resolve([]),
      /* Signed URLs are minted here and expire the same day, so this is
         fetched only for the tab that shows them. */
      tab === "documents" ? listDocumentBundles() : Promise.resolve([]),
      tab === "crew" ? listAmbassadors() : Promise.resolve([]),
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
            {/* ENQUIRIES, not MESSAGES: the partner panel calls them
                that, the PULSE page calls them that, and this was the
                only tab with no count — so it looked empty from the
                outside and a real enquiry sat unread. */}
            <Link className="a-tab" href="/admin?tab=messages" data-on={tab === "messages"}>
              ENQUIRIES<span className="a-tab-count">{arrivals.enquiries}</span>
            </Link>
            <Link className="a-tab" href="/admin?tab=documents" data-on={tab === "documents"}>
              DOCUMENTS<span className="a-tab-count">{docCount}</span>
            </Link>
            <Link className="a-tab" href="/admin?tab=collabs" data-on={tab === "collabs"}>
              COLLABS
            </Link>
            <Link className="a-tab" href="/admin?tab=crew" data-on={tab === "crew"}>
              CREW<span className="a-tab-count">{crewCount}</span>
            </Link>
          </div>

          <Arrivals applications={arrivals.applications} enquiries={arrivals.enquiries} />
          <ResyncSheet connected={sheetConfigured()} />
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
              {ALL_DEPARTURES.map((d) => (
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

        {tab === "documents" ? <DocumentsTab bundles={bundles} /> : null}

        {tab === "collabs" ? <CollabsTable rows={collabs} /> : null}

        {tab === "crew" ? <CrewTable rows={crew} /> : null}
      </div>
    </div>
  );
}
