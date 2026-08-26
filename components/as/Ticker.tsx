"use client";

/* The black band across the top of the light comp.

   The track is rendered twice and slid left by exactly half its own
   width, so the second copy is arriving as the first leaves and the
   loop has no seam. That is why it must be duplicated rather than
   animated with `left` — a single copy would show a gap.

   Its speed comes from the content, not from a fixed duration: a
   longer list gets proportionally longer to cross, so the text always
   moves at the same reading pace regardless of how many lines exist. */

const SEP = "✱";

export default function Ticker({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null;

  /* Roughly 7px per character at this size, and about 42px of travel
     per second reads as brisk without being unreadable. */
  const chars = lines.join("").length + lines.length * 4;
  const seconds = Math.max(18, Math.round((chars * 7) / 42));

  const run = (
    <span className="s-tick-run" aria-hidden="true">
      {lines.map((l, i) => (
        <span key={`${l}-${i}`}>
          {l}
          <i>{SEP}</i>
        </span>
      ))}
    </span>
  );

  return (
    <div className="s-tick-bar">
      {/* One readable copy for assistive tech; the visible pair is
          hidden from it so the lines are not announced twice. */}
      <span className="s-sr-only">{lines.join(". ")}</span>
      <div className="s-tick-track" style={{ animationDuration: `${seconds}s` }}>
        {run}
        {run}
      </div>
    </div>
  );
}
