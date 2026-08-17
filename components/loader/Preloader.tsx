"use client";

import { useEffect, useRef, useState } from "react";
import { Bird } from "@/components/ui/Bird";

const LINES = [
  ["AS SCHEDULED — SEASON 01", false],
  ["DEPARTURE MANIFEST LOADING…", true],
  ["SEATS VERIFIED: 19 PER DEPARTURE", true],
  ["FILES OPEN: PUL-01 · REN-02 · ANT-03 · OAS-04", true],
  ["DO NOT REFRESH. WE DON'T REPEAT OURSELVES.", false],
] as const;

/* 7s manifest-console loader, skippable at 1.5s.
   Skipped entirely under prefers-reduced-motion. Runs once per mount. */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const [done, setDone] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [stamp, setStamp] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    const T = timers.current;
    LINES.forEach((_, i) => T.push(setTimeout(() => setLineCount(i + 1), 500 + i * 950)));
    T.push(setTimeout(() => setShowSkip(true), 1500));
    T.push(setTimeout(() => setStamp(true), 6100));
    T.push(setTimeout(() => setDone(true), 7000));
    T.push(setTimeout(() => setGone(true), 7800));
    return () => T.forEach(clearTimeout);
  }, []);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    setDone(true);
    setTimeout(() => setGone(true), 750);
  };

  if (gone) return null;

  return (
    <div className={`pre play${done ? " done" : ""}`} aria-hidden={done}>
      <Bird className="pre-bird" />
      <div className="pre-lines">
        {LINES.map(([text, dim], i) => (
          <div key={text} className={`${dim ? "dim " : ""}${i < lineCount ? "in" : ""}`}>
            {text}
          </div>
        ))}
      </div>
      <div className="pre-bar">
        <i />
      </div>
      <div className={`pre-stamp${stamp ? " hit" : ""}`}>CLEARED</div>
      <button className={`pre-skip${showSkip ? " show" : ""}`} type="button" onClick={skip}>
        Skip — you&apos;ll miss nothing important
      </button>
    </div>
  );
}
