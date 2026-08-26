"use client";

import { useEffect, useState } from "react";

/* The word that changes in WE BRING [CULTURE] you will tell later.

   Two things it is careful about.

   The first word is rendered on the server and is what everyone sees
   on load, so there is no flash of a different word during hydration
   and no layout jump — cycling only starts after mount.

   And the box does not resize. Every candidate is laid out invisibly
   underneath, which makes the element as wide as the longest of them,
   so a longer word arriving does not shove the line below it. A
   headline that reflows every three seconds is a headline nobody can
   read. */

const HOLD_MS = 2600;

export default function CycleWord({ words }: { words: readonly string[] }) {
  const [i, setI] = useState(0);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotion(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!motion || words.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), HOLD_MS);
    return () => window.clearInterval(t);
  }, [motion, words.length]);

  const word = words[i] ?? words[0] ?? "";

  return (
    <span className="s-cyc">
      {/* Sets the width to the longest word and is never seen. */}
      <span className="s-cyc-ghost" aria-hidden="true">
        {words.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </span>

      <span key={word} className="s-cyc-live">
        {word}
      </span>
    </span>
  );
}
