import { notFound } from "next/navigation";
import PreviewClient from "./PreviewClient";

/* Device preview harness — development only.

   Renders the real site in an iframe sized to a phone viewport, which
   is a truer check than dragging the window: the iframe is its own
   viewport, so media queries, `100svh` and the fixed header all behave
   exactly as they do on a device.

   It is NOT a substitute for a real handset. It uses the desktop
   browser's engine, so it cannot tell you whether iOS Safari will
   autoplay the hero video — only a real iPhone answers that. */

export const metadata = { robots: { index: false, follow: false } };

export default function PreviewPage() {
  /* 404 in production rather than shipping an internal tool. */
  if (process.env.NODE_ENV === "production") notFound();
  return <PreviewClient />;
}
