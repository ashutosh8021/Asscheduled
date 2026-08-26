"use client";

/* The view from a train window, drawn rather than filmed.

   Why this exists at all: every departure includes "Train 3rd AC", so
   this is literally what is being sold. And it sidesteps the problem
   that has shadowed every other hero on this site — there is no
   footage to licence, no provenance to establish, no compression to
   lose. A few kilobytes of SVG, sharp at any size, and ours.

   How the motion works. Each moving band is drawn twice, side by side,
   and the pair is slid left by exactly one tile width before snapping
   back. Because the tile ends where it begins, the snap is invisible
   and the loop is seamless. Layers move at different speeds, which is
   what reads as distance: the sun does not move at all, mountains
   crawl, the trackside furniture rushes past.

   Everything animated is a transform, so it composites on the GPU and
   never triggers layout. Under reduced motion nothing moves and the
   scene stands as a still illustration — the content was never in the
   movement. */

const TILE = 400;

/* One repeat of each band. Drawn twice by the component, so anything
   here must start and end at the same height to tile cleanly. */
/* One repeat of each band. Drawn twice by the component, so the path
   must start and end at the same height or the seam shows.

   The horizon sits at 300 of 500 — a shade above centre, which leaves
   the sky dominant and the ground as a dark floor rather than a slab
   of colour. */
const FAR_RIDGE =
  "M0,286 L44,258 L82,280 L128,244 L172,276 L214,250 L258,282 L302,246 L348,274 L400,254 L400,302 L0,302 Z";
const NEAR_RIDGE =
  "M0,296 L48,272 L94,292 L142,264 L190,290 L236,270 L288,294 L334,268 L400,290 L400,304 L0,304 Z";

/* Telegraph poles: x positions within one tile. Uneven on purpose —
   evenly spaced ones read as wallpaper rather than as passing objects. */
const POLES = [38, 132, 205, 318];

/* Trackside lights, the small warm marks low in the frame. */
const LIGHTS = [72, 168, 262, 356];

/* Rain. Precomputed rather than random so the server and the client
   draw the same thing — a random seed here is a hydration mismatch. */
const RAIN = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 71) % 400,
  y: (i * 113) % 500,
  len: 34 + ((i * 17) % 54),
  o: 0.14 + ((i % 5) * 0.07),
}));

export default function TrainWindow({
  coach = "COACH B3 · SEAT 41",
  when,
}: {
  coach?: string;
  /** Right-hand caption. Static text, never a live clock — a ticking
   *  hero is a distraction, and this is scenery. */
  when?: string;
}) {
  return (
    <figure className="s-tw">
      <div className="s-tw-frame">
        <svg
          className="s-tw-svg"
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="The view from a moving train window at night: hills, telegraph poles and rain"
        >
          <defs>
            <linearGradient id="tw-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1424" />
              <stop offset="55%" stopColor="#101D33" />
              <stop offset="100%" stopColor="#16253D" />
            </linearGradient>

            <linearGradient id="tw-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A2A22" />
              <stop offset="100%" stopColor="#241A15" />
            </linearGradient>

            {/* The window itself. Everything is clipped to it, so the
                bands can run past the edges without showing their ends. */}
            <clipPath id="tw-clip">
              <rect x="0" y="0" width="400" height="500" rx="34" />
            </clipPath>
          </defs>

          <g clipPath="url(#tw-clip)">
            <rect x="0" y="0" width="400" height="500" fill="url(#tw-sky)" />

            {/* Fixed: something this far away does not pass. */}
            <circle cx="150" cy="112" r="36" fill="var(--s-rust)" />

            <g className="s-tw-band s-tw-far">
              {[0, TILE].map((dx) => (
                <path key={dx} d={FAR_RIDGE} transform={`translate(${dx} 0)`} fill="#182741" />
              ))}
            </g>

            <g className="s-tw-band s-tw-near">
              {[0, TILE].map((dx) => (
                <path key={dx} d={NEAR_RIDGE} transform={`translate(${dx} 0)`} fill="#0E1A2C" />
              ))}
            </g>

            {/* The lit edge of the trackbed, then dark below it. A wide
                brown field reads as desert; a thin strip reads as
                ground caught by the train's own light. */}
            <rect x="0" y="300" width="400" height="18" fill="url(#tw-ground)" />
            <rect x="0" y="318" width="400" height="182" fill="#0A1120" />

            <g className="s-tw-band s-tw-poles">
              {[0, TILE].map((dx) => (
                <g key={dx} transform={`translate(${dx} 0)`}>
                  {POLES.map((x) => (
                    <g key={x} stroke="#4A5468" strokeWidth="2.4" strokeLinecap="square">
                      <line x1={x} y1="168" x2={x} y2="330" />
                      <line x1={x - 15} y1="186" x2={x + 15} y2="186" />
                      <line x1={x - 10} y1="204" x2={x + 10} y2="204" />
                    </g>
                  ))}
                </g>
              ))}
            </g>

            <g className="s-tw-band s-tw-lights">
              {[0, TILE].map((dx) => (
                <g key={dx} transform={`translate(${dx} 0)`}>
                  {LIGHTS.map((x) => (
                    <rect key={x} x={x} y="396" width="14" height="5" fill="var(--s-rust)" />
                  ))}
                </g>
              ))}
            </g>

            {/* Rain last, so it falls in front of everything including
                the sun — which is what sells it as being on the glass. */}
            <g className="s-tw-rain">
              {[0, 1].map((pass) => (
                <g key={pass} transform={`translate(0 ${pass * -500})`}>
                  {RAIN.map((r, i) => (
                    <line
                      key={i}
                      x1={r.x}
                      y1={r.y}
                      x2={r.x - 4}
                      y2={r.y + r.len}
                      stroke="#B4C2D8"
                      strokeWidth="1.2"
                      opacity={r.o}
                    />
                  ))}
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>

      <figcaption className="s-tw-cap">
        <span>{coach}</span>
        {when ? <span>{when}</span> : null}
      </figcaption>
    </figure>
  );
}
