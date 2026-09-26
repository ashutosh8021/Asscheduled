import Slot from "./Slot";
import type { GlimpsePhoto } from "@/lib/departures";

/* Photographs from the previous edition of a fest.
 *
 * The stills counterpart to LastYear, which does the same job with
 * video. No client JavaScript: this is images and a heading, and every
 * frame below the fold is lazy by default through next/image.
 *
 * The grid is the one the gallery page already uses for past trips —
 * portrait tiles, landscape frames spanning two columns at their own
 * ratio. Reused rather than reinvented so the two surfaces stay one
 * visual language, and so a 16:9 stage shot is never crushed into a
 * portrait box.
 *
 * The heading says which edition it is, and each frame carries its
 * credit. That is the whole basis on which showing somebody else's
 * photographs is honest. */

export default function Glimpse({
  eyebrow,
  title,
  note,
  photos,
}: {
  eyebrow: string;
  title: string;
  note: string;
  photos: GlimpsePhoto[];
}) {
  if (photos.length === 0) return null;

  /* One of each, in the order they first appear. Usually a single
     name, but a mixed set should still credit everybody. */
  const credits = [...new Set(photos.map((p) => p.credit).filter((c): c is string => Boolean(c)))];

  return (
    <div className="s-glimpse">
      <div className="s-glimpse-head">
        <p className="s-eyebrow s-eyebrow-grey">{eyebrow}</p>
        <h2 className="s-h2 s-glimpse-title">{title}</h2>
        <p className="s-body s-glimpse-note">{note}</p>
      </div>

      <div className="s-glimpse-grid">
        {photos.map((p) => (
          <div key={p.label} className="s-glimpse-tile" data-wide={p.wide ?? false}>
            <Slot
              slot={p}
              sizes={
                p.wide
                  ? "(max-width: 560px) 100vw, 40vw"
                  : "(max-width: 560px) 50vw, 20vw"
              }
            />
          </div>
        ))}
      </div>

      {/* Credited once, under the grid. Stamping the same line across
          nine frames is noise, not attribution — and it buried the
          photographs it was meant to be crediting. */}
      {credits.length ? (
        <p className="s-glimpse-credit">
          Photographs: {credits.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
