import type { MetadataRoute } from "next";
import { abs } from "@/lib/site";

/* /my-trip and /apply hold personal application state; /api is machinery.
   None of it belongs in an index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* /v2 is a design proposal, not a live page. */
      disallow: ["/api/", "/my-trip", "/admin", "/v2"],
    },
    sitemap: abs("/sitemap.xml"),
  };
}
