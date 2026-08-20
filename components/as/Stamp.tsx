"use client";

import { useId } from "react";

/* The round stamp — a ring of type around the AS SCHEDULED wordmark,
   struck across the artwork of a departure nobody can join any more.

   Built as SVG rather than an image so it stays crisp at any size and
   takes its ink from `currentColor`: one CSS variable moves the rings,
   the arcs and the wordmark together. The wordmark itself is the real
   logo PNG used as a mask, so it is tinted stamp-red rather than
   printed in navy over a photograph.

   Everything inside is sized in `em` against a font-size the CSS
   derives from the stamp's diameter, so the whole thing scales as one
   object with no second set of breakpoints to keep in sync. */

interface Props {
  /** Struck across the middle — the loud part. */
  label: string;
  /** Curved over the top of the ring. */
  top?: string;
  /** Curved along the bottom, reading left to right. */
  bottom?: string;
  className?: string;
}

export default function Stamp({ label, top, bottom, className }: Props) {
  /* Each stamp needs its own arc ids: two of these can share a page. */
  const uid = useId().replace(/:/g, "");
  const arcTop = `sa-t-${uid}`;
  const arcBottom = `sa-b-${uid}`;

  return (
    <span
      className={className ? `s-stamp-round ${className}` : "s-stamp-round"}
      role="img"
      aria-label={[top, label, bottom].filter(Boolean).join(". ")}
    >
      <svg className="s-stamp-ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          {/* Upper half, left to right over the top. */}
          <path id={arcTop} d="M 30,100 A 70,70 0 1,1 170,100" fill="none" />
          {/* Lower half. The wider radius puts the bottom legend in the
              same band as the top one — glyphs on a bottom arc grow
              inward, so a matching radius would sit it too close in. */}
          <path id={arcBottom} d="M 21,100 A 79,79 0 1,0 179,100" fill="none" />
        </defs>

        <circle className="s-stamp-o" cx="100" cy="100" r="95" />
        <circle className="s-stamp-i" cx="100" cy="100" r="84" />

        {top ? (
          <text className="s-stamp-arc">
            <textPath
              href={`#${arcTop}`}
              /* Older Safari only honours the xlink form. */
              xlinkHref={`#${arcTop}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {top}
            </textPath>
          </text>
        ) : null}

        {bottom ? (
          <text className="s-stamp-arc s-stamp-arc-b">
            <textPath
              href={`#${arcBottom}`}
              /* Older Safari only honours the xlink form. */
              xlinkHref={`#${arcBottom}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {bottom}
            </textPath>
          </text>
        ) : null}

        {/* The two beads that separate the legends. */}
        <circle className="s-stamp-bead" cx="26" cy="100" r="3.2" />
        <circle className="s-stamp-bead" cx="174" cy="100" r="3.2" />
      </svg>

      <span className="s-stamp-mid">
        <span className="s-stamp-rule" />
        <span className="s-stamp-mark" />
        <span className="s-stamp-word">{label}</span>
        <span className="s-stamp-rule" />
      </span>
    </span>
  );
}
