import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import { currentCrew } from "@/lib/crew";
import { CREW_IN } from "@/lib/copy";
import CrewLoginForm from "./CrewLoginForm";

/* Where Crew sign in.
 *
 * Unlisted: absent from the navigation and the sitemap, and crawlers
 * are told to skip it. Nobody arrives here by browsing — they arrive
 * because we sent them a passcode. */

export const metadata: Metadata = {
  title: "Crew sign in · AS SCHEDULED",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CrewLoginPage() {
  /* Already signed in — no reason to show a login form. */
  if (await currentCrew()) redirect("/crew/dashboard");

  return (
    <Shell>
      <section
        className="s-wrap"
        style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: "clamp(60px,8vw,110px)" }}
      >
        <div className="s-crew-in">
          <Reveal>
            <p className="s-eyebrow" style={{ color: "var(--s-rust)" }}>
              {CREW_IN.eyebrow}
            </p>

            <h1 className="s-h2" style={{ marginTop: 18, fontSize: "clamp(36px,5.4vw,68px)" }}>
              {CREW_IN.title[0]}
              <br />
              {CREW_IN.title[1]}
            </h1>

            <p className="s-body" style={{ marginTop: 22 }}>
              {CREW_IN.body}
            </p>

            <div style={{ marginTop: 30 }}>
              <CrewLoginForm />
            </div>

            <p className="s-consent" style={{ marginTop: 22 }}>
              {CREW_IN.notCrew} <Link href="/crew">{CREW_IN.applyCta}</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
