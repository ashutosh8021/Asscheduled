import type { MetadataRoute } from "next";
import { abs } from "@/lib/site";

/* The public site is the static build in site/, served out of public/.
   Its URLs all carry .html, so those are what belongs here.

   The old App Router routes (/somewhere, /about, /faqs, /paperwork/…)
   now redirect to their counterpart on the new site — see the redirects
   in next.config.ts. Listing a URL that redirects is a Search Console
   error, so none of them appear below.

   /crew stays: it is a real page in this app, it has no counterpart on
   the new site, and Crew outreach hands the link out. /admin, /partner,
   /crew/login and /crew/dashboard are deliberately absent — they are
   behind a sign-in and are marked noindex. */
const PAGES: {
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/somewhere.html", priority: 0.9, freq: "weekly" },
  { path: "/hallucia.html", priority: 0.9, freq: "weekly" },
  { path: "/mood-indigo.html", priority: 0.9, freq: "weekly" },
  { path: "/apply.html", priority: 0.8, freq: "weekly" },
  { path: "/about.html", priority: 0.6, freq: "monthly" },
  { path: "/faqs.html", priority: 0.7, freq: "monthly" },
  { path: "/contact.html", priority: 0.6, freq: "monthly" },
  /* Not in the navigation — Crew outreach hands the link out — but a
     public page people search for by name once it is circulating. */
  { path: "/crew", priority: 0.5, freq: "monthly" },
  { path: "/cancellation-policy.html", priority: 0.3, freq: "yearly" },
  { path: "/terms.html", priority: 0.3, freq: "yearly" },
  { path: "/privacy.html", priority: 0.3, freq: "yearly" },
  { path: "/legal.html", priority: 0.3, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PAGES.map((p) => ({
    url: abs(p.path),
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
