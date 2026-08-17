import type { MetadataRoute } from "next";

/* Installable shell. Colours are the brand tokens, not defaults —
   an added-to-homescreen launch should not flash white. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AS SCHEDULED — Season 01",
    short_name: "AS SCHEDULED",
    description:
      "Curated six-day departures around India's biggest college fests. 19 seats. Application only.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EE",
    theme_color: "#12234F",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
