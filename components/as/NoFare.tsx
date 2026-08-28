import { CONTACT, CONTACT_EMAIL } from "@/lib/copy";

/* Shown where a plan has no fare from somebody's state.
 *
 * Eleven states and union territories are unpriced. The honest move is
 * to say so and hand over a way to reach a person — a blank price with
 * no route forward reads as "we don't go there", which is not true.
 *
 * Deliberately gives the phone numbers as well as the email. They are
 * kept off the footer on purpose (see lib/copy.ts) because they would
 * appear on every page and attract cold calls; here they are in front
 * of somebody who is mid-application and genuinely stuck.
 */
export default function NoFare({ line }: { line: string }) {
  return (
    <div className="s-nofare">
      <p className="s-nofare-line">{line}</p>
      <p className="s-nofare-reach">
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        {CONTACT.phones.map((p) => (
          <a key={p} href={`tel:+91${p}`}>
            +91 {p}
          </a>
        ))}
      </p>
    </div>
  );
}
