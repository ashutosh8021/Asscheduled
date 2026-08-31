import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentViewer } from "@/lib/admin";
import {
  arrivalCounts,
  listApplications,
  listDocumentBundles,
  listMessagesFor,
} from "@/lib/adminData";
import { ALL_DEPARTURES } from "@/lib/departures";
import PartnerRoster from "./PartnerRoster";
import SignOut from "../admin/SignOut";
import Arrivals from "../admin/Arrivals";
import "../admin/admin.css";

/* The festival's own view of its departure.
 *
 * Same session and same data as /admin, scoped to the departures we
 * run with a partner and stripped of everything that decides anything:
 * no status buttons, no delete, no upload links, no other departures,
 * no messages, no collaborations.
 *
 * Read-only is the whole design. PULSE needs to know who is coming and
 * to be able to check that the person at the gate is the person who
 * applied. Neither of those requires the ability to change a record. */

export const metadata: Metadata = {
  title: "Partner · AS SCHEDULED",
  robots: { index: false, follow: false },
};

/* Never cache: signed document URLs are minted per render, and this reads
   live data behind a session. */
export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  const viewer = await currentViewer();
  if (!viewer) redirect("/admin/login");

  /* The scope comes from the viewer, never from the request. There is
     no departure parameter to tamper with — a partner sees the
     departures their partnership covers and there is no way to ask for
     another one. */
  const scope = viewer.departures.length
    ? viewer.departures
    : ALL_DEPARTURES.filter((d) => d.sharedWith).map((d) => d.id);

  const [arrivals, apps, bundles, enquiries] = await Promise.all([
    /* Two numbers for the "something came in" pop, counted against
       this partner's own scope — never the whole table. */
    arrivalCounts(scope),
    Promise.all(scope.map((id) => listApplications({ departure: id }))).then((r) => r.flat()),
    Promise.all(scope.map((id) => listDocumentBundles(id))).then((r) => r.flat()),
    /* Custom-booking questions asked from this departure's page. Same
       scope as everything else here. */
    listMessagesFor(scope),
  ]);

  /* Logged with the email that read it. Somebody's government ID being
     opened is a thing that should leave a trace. */
  console.info(
    `[partner] ${viewer.email} (${viewer.role}) read ${apps.length} application(s) ` +
      `${bundles.length} document set(s) and ${enquiries.length} enquiry(ies) ` +
      `for ${scope.join(", ")}`
  );

  const fests = scope
    .map((id) => ALL_DEPARTURES.find((d) => d.id === id)?.fest ?? id)
    .join(" · ");

  return (
    <div className="a-root">
      <div className="a-wrap">
        <div className="a-bar">
          <span className="a-bar-title">AS SCHEDULED × {fests}</span>
          <Arrivals applications={arrivals.applications} enquiries={arrivals.enquiries} />
          <SignOut email={viewer.email} />
        </div>

        <PartnerRoster apps={apps} bundles={bundles} enquiries={enquiries} />
      </div>
    </div>
  );
}
