import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/as/Shell";
import Reveal from "@/components/as/Reveal";
import CrewForm from "@/components/as/CrewForm";
import { CREW } from "@/lib/copy";
import { abs } from "@/lib/site";

/* The ambassador signup — where Crew outreach sends people.
 *
 * Not in the navigation on purpose. It is recruitment, reached by the
 * link we hand out, and putting it beside the trips would make the
 * site read like it is hiring rather than taking people somewhere. */

export const metadata: Metadata = {
  title: "Crew · AS SCHEDULED",
  description: CREW.body[0],
  alternates: { canonical: abs("/crew") },
  openGraph: { title: "AS SCHEDULED Crew", description: CREW.body[0], url: abs("/crew") },
};

export default function CrewPage() {
  return (
    <Shell>
      <section
        className="s-wrap"
        style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: "clamp(60px,8vw,110px)" }}
      >
        <div className="s-split s-split-top">
          <Reveal>
            <p className="s-eyebrow" style={{ color: "var(--s-rust)" }}>
              {CREW.eyebrow}
            </p>

            <h1 className="s-h2" style={{ marginTop: 18, fontSize: "clamp(38px,6.4vw,88px)" }}>
              {CREW.titleTop[0]}
              <br />
              {CREW.titleTop[1]}
              <br />
              <span className="s-crew-mark">{CREW.titleMark}</span>
            </h1>

            <div style={{ marginTop: 34 }}>
              {CREW.body.map((l, i) => (
                <p key={l} className="s-body" style={{ marginTop: i === 0 ? 0 : 14 }}>
                  {l}
                </p>
              ))}
            </div>

            {/* The number, at the size it deserves. It is the reason
                somebody reads any of the rest, and burying it in a
                bullet list was the wrong order. The condition rides
                with it rather than in small print below. */}
            <div className="s-payoff">
              <p className="s-payoff-lead">{CREW.payoffLead}</p>
              <p className="s-payoff-figure">{CREW.payoffFigure}</p>
              <p className="s-payoff-tail">{CREW.payoffTail}</p>
            </div>

            <p className="s-eyebrow s-eyebrow-grey" style={{ marginTop: 44 }}>
              {CREW.stepsLabel}
            </p>
            <ol className="s-crew-steps">
              {CREW.steps.map((s) => (
                <li key={s.n}>
                  <span className="s-crew-n">{s.n}</span>
                  <span>
                    <strong>{s.t}</strong>
                    <span className="s-crew-d">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="s-eyebrow s-eyebrow-grey" style={{ marginTop: 40 }}>
              {CREW.rewardsLabel}
            </p>
            <ul className="s-crew-rewards">
              {CREW.rewards.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={1}>
            <CrewForm />

            {/* For the Crew who already have a passcode. Under the form
                rather than in the navigation: it is a door for the few
                people we have handed a key to. */}
            <p className="s-consent" style={{ marginTop: 20 }}>
              {CREW.signedLead} <Link href="/crew/login">{CREW.signedCta}</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}
