import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentSpringFestViewer } from "@/lib/admin";
import { arrivalCounts, listApplications, listDocumentBundles } from "@/lib/adminData";
import { SITE_DEPARTURES, SPRING_FEST_ID } from "@/lib/sitePlans";
import PartnerRoster from "../PartnerRoster";
import SignOut from "../../admin/SignOut";
import Arrivals from "../../admin/Arrivals";
import "../../admin/admin.css";

/* The Spring Fest team's view of Spring Fest 2027.
 *
 * The partner panel again, pointed at SF-27 and nothing else: same
 * session, same roster component, same read-only rule. What changes is
 * who may open it — SPRINGFEST_EMAILS, a list of its own, so the PULSE
 * team and the Spring Fest team can never see each other's people —
 * and that each row opens to every answer the booking form collected.
 *
 * Read-only throughout. No status buttons, no delete, no MARK PAID:
 * deciding anything about a booking stays in /admin. */

export const metadata: Metadata = {
  title: "Spring Fest · AS SCHEDULED",
  robots: { index: false, follow: false },
};

/* Never cache: signed screenshot URLs are minted per render, and this
   reads live data behind a session. */
export const dynamic = "force-dynamic";

export default async function SpringFestPanel() {
  const viewer = await currentSpringFestViewer();
  if (!viewer) redirect("/admin/login");

  /* SF-27, from the viewer — there is no parameter to widen it with. */
  const scope = viewer.departures;

  const [arrivals, apps, bundles] = await Promise.all([
    arrivalCounts(scope),
    listApplications({ departure: SPRING_FEST_ID }),
    /* Filtered before anything is signed, so a page load here never
       mints a URL for somebody else's screenshot. */
    listDocumentBundles(SPRING_FEST_ID),
  ]);

  console.info(
    `[spring-fest] ${viewer.email} (${viewer.role}) read ${apps.length} booking(s) ` +
      `and ${bundles.length} document set(s)`
  );

  const fest = SITE_DEPARTURES.find((d) => d.id === SPRING_FEST_ID)?.fest ?? SPRING_FEST_ID;

  return (
    <div className="a-root">
      <div className="a-wrap">
        <div className="a-bar">
          <span className="a-bar-title">AS SCHEDULED × {fest}</span>
          <Arrivals
            applications={arrivals.applications}
            enquiries={arrivals.enquiries}
            endpoint="/api/admin/arrivals?scope=spring-fest"
          />
          <SignOut email={viewer.email} />
        </div>

        {/* Roster and payments only. Spring Fest asks for no identity
            documents and has no enquiry form, so those tabs would only
            ever be empty. */}
        <PartnerRoster apps={apps} bundles={bundles} tabs={["roster", "payments"]} full />
      </div>
    </div>
  );
}
