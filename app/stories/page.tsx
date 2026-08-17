import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Reveals from "@/components/ui/Reveal";
import { Record } from "@/components/home/Sections";

export const metadata: Metadata = {
  alternates: { canonical: "/stories" },
  title: "Stories & Past Experiences · AS SCHEDULED",
  description:
    "One prototype run on record: seventy travellers to Alcheringa at IIT Guwahati, extended eleven days into Meghalaya. Season 01 stories are filed here.",
};

/* Build spec §11. Season 01 has not run, so the locker is honestly empty —
   but the prototype run (Trip 000) is a genuine past experience and belongs
   on this page. It was previously written and then never rendered anywhere. */
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <section className="sec" style={{ paddingBottom: 0 }}>
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Stories", path: "/stories" },
            ]}
          />
          <div className="rail-head" style={{ padding: 0 }}>
            <h1 className="disp rail-title">STORIES</h1>
            <div className="rail-meta">
              <p className="sec-no">FILE 05 — EVIDENCE LOCKER</p>
            </div>
          </div>
        </section>

        {/* Past experience — the only one on record. */}
        <Record />

        <section className="sec">
          <div className="rail-empty" style={{ margin: 0 }}>
            <span className="st st-grey">EMPTY BY DESIGN</span>
            <p className="disp">Season 01 hasn&apos;t happened yet.</p>
            <p className="rail-empty-note">Film photos, voice notes, journals and the things people write on the bus. Uploaded after each departure returns. No stock imagery, no borrowed campaigns.</p>
            <Link className="btn" href="/trips">
              See the departures
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
