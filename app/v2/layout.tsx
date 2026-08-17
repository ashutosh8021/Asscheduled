import type { Metadata } from "next";
import "./v2.css";

/* Parallel design surface. The Season 01 build in app/(root) is untouched —
   this route only shares lib/trips.ts and the fonts already loaded by the root
   layout. Not indexed: it is a proposal, not a live page. */
export const metadata: Metadata = {
  title: "V2 — AS SCHEDULED",
  description: "Design proposal: dark festival theme with a WebGL hero.",
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className="v2">{children}</div>;
}
