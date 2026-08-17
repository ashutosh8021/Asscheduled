import type { MetadataRoute } from "next";
import { DEPARTURES } from "@/lib/departures";
import { abs } from "@/lib/site";

/* Only the public "SOMEWHERE" surfaces are listed.

   The legacy Season-01 routes (/trips, /faq, /experiences, /stories,
   /events, /club, /apply) still build, but /trips and /faq now redirect
   and the rest are not linked from the live navigation — listing an
   unreachable or redirecting URL is a Search Console error, so they are
   deliberately absent.

   Departure files are generated from lib/departures.ts so the sitemap
   can never drift from the real departures. */
const STATIC: {
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/somewhere", priority: 0.9, freq: "weekly" },
  { path: "/gallery", priority: 0.6, freq: "monthly" },
  { path: "/about", priority: 0.6, freq: "monthly" },
  { path: "/faqs", priority: 0.7, freq: "monthly" },
  { path: "/contact", priority: 0.6, freq: "monthly" },
  { path: "/paperwork", priority: 0.4, freq: "yearly" },
  { path: "/paperwork/privacy", priority: 0.3, freq: "yearly" },
  { path: "/paperwork/terms", priority: 0.3, freq: "yearly" },
  { path: "/paperwork/cancellation-policy", priority: 0.3, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...STATIC.map((s) => ({
      url: abs(s.path),
      lastModified: now,
      changeFrequency: s.freq,
      priority: s.priority,
    })),
    ...DEPARTURES.map((d) => ({
      url: abs(`/somewhere/${d.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
