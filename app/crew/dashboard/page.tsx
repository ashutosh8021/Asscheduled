import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import { currentCrew, crewTally } from "@/lib/crew";
import { CREW_PANEL } from "@/lib/copy";
import { abs } from "@/lib/site";
import CopyLink from "./CopyLink";
import CrewSignOut from "./CrewSignOut";

/* A Crew member's own page: their code, their link, their numbers.
 *
 * Their numbers, and nothing else. No names, no contact details, no
 * other Crew member's figures — the people who registered are somebody
 * else's personal data, and a leaderboard is not a reason to hand it
 * over. crewTally counts rows; it never reads them.
 *
 * Guarded by currentCrew, which is a Crew session and nothing to do
 * with the admin allowlists. See the note at the top of lib/crew.ts. */

export const metadata: Metadata = {
  title: "Your Crew · AS SCHEDULED",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CrewDashboardPage() {
  const member = await currentCrew();
  if (!member) redirect("/crew/login");

  const tally = await crewTally(member.code);

  /* The departures index rather than one departure: a link to a fest
     that later closes is a dead link somebody has already posted, and
     this one keeps working all season. The code rides as ?p= — see
     middleware.ts, which turns it into the attribution cookie. */
  const link = member.code ? abs(`/somewhere?p=${member.code}`) : null;
  const shown = link ? link.replace(/^https?:\/\//, "") : null;

  const nothingYet = tally.registrations === 0;

  return (
    <Shell>
      <section
        className="s-wrap"
        style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: "clamp(60px,8vw,110px)" }}
      >
        <div className="s-crew-in">
          <Reveal>
            <div className="s-crew-top">
              <div>
                <p className="s-eyebrow" style={{ color: "var(--s-rust)" }}>
                  {CREW_PANEL.eyebrow}
                </p>
                <h1 className="s-h2" style={{ marginTop: 14, fontSize: "clamp(34px,5vw,62px)" }}>
                  {member.name.toUpperCase()}
                </h1>
                <p className="s-hint" style={{ marginTop: 10 }}>
                  {member.college} · {member.city}, {member.state} · {member.tier.toUpperCase()}
                </p>
              </div>
              <CrewSignOut />
            </div>

            {/* ---- the code ---- */}
            {member.code && link && shown ? (
              <div className="s-panel s-crew-code-panel" style={{ marginTop: 34 }}>
                <p className="s-eyebrow s-eyebrow-grey">{CREW_PANEL.codeLabel}</p>
                <p className="s-crew-code">{member.code.toUpperCase()}</p>
                <p className="s-body" style={{ marginTop: 10 }}>
                  {CREW_PANEL.codeNote}
                </p>

                <hr className="s-rule" style={{ margin: "22px 0 18px" }} />

                <p className="s-eyebrow s-eyebrow-grey">{CREW_PANEL.linkLabel}</p>
                {/* Shown in full and selectable, so the page works even
                    where the clipboard is refused. */}
                <p className="s-crew-link">{shown}</p>
                <div style={{ marginTop: 14 }}>
                  <CopyLink link={link} />
                </div>
              </div>
            ) : (
              <div className="s-panel" style={{ marginTop: 34 }}>
                <p className="s-eyebrow s-eyebrow-grey">{CREW_PANEL.codeLabel}</p>
                <p className="s-body" style={{ marginTop: 12 }}>
                  {CREW_PANEL.noCode}
                </p>
              </div>
            )}

            {/* ---- the numbers ---- */}
            <p className="s-eyebrow s-eyebrow-grey" style={{ marginTop: 40 }}>
              {CREW_PANEL.statsLabel}
            </p>
            <div className="s-crew-stats">
              <div>
                <span className="s-crew-stat-n">{tally.registrations}</span>
                <span className="s-crew-stat-l">{CREW_PANEL.stats.registrations}</span>
              </div>
              <div>
                <span className="s-crew-stat-n">{tally.selected}</span>
                <span className="s-crew-stat-l">{CREW_PANEL.stats.selected}</span>
              </div>
            </div>

            <p className="s-hint" style={{ marginTop: 14 }}>
              {nothingYet ? CREW_PANEL.emptyStats : CREW_PANEL.moneyNote}
            </p>

            {/* ---- how to use it ---- */}
            <p className="s-eyebrow s-eyebrow-grey" style={{ marginTop: 44 }}>
              {CREW_PANEL.howLabel}
            </p>
            <ul className="s-crew-rewards">
              {CREW_PANEL.how.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
