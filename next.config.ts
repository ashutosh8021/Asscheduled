import type { NextConfig } from "next";

/* The /preview device harness frames the site in an iframe, which
   X-Frame-Options: DENY blocks even same-origin. Both framing rules are
   relaxed to same-origin in development only — production keeps DENY
   and frame-ancestors 'none' exactly as before. */
const isDev = process.env.NODE_ENV === "development";

/* Security headers.

   HSTS is deliberately NOT set here: it must only be sent over HTTPS, and
   setting it before the production domain is serving valid TLS can lock
   visitors out of the site. Add it at the edge/host once the domain is live
   (Strict-Transport-Security: max-age=63072000; includeSubDomains; preload).

   CSP is report-only rather than enforcing. The app loads Razorpay Checkout
   and, when configured, GA4 — both inject inline script. Enforcing a policy
   before those origins are confirmed in production would break payments,
   which is a far worse failure than a missing header. Watch the reports, then
   promote this to Content-Security-Policy. */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // 'unsafe-inline' is required by Razorpay Checkout and the GA4 bootstrap.
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://www.googletagmanager.com",
  /* Google Fonts: the public site loads Outfit, Instrument Serif and IBM
     Plex Mono from fonts.googleapis.com, which serves a stylesheet that
     then pulls the files from fonts.gstatic.com. Both have to be named or
     every page load files a report about the site's own typeface. */
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.razorpay.com https://*.supabase.co https://www.google-analytics.com https://*.analytics.google.com",
  "frame-src https://api.razorpay.com https://*.razorpay.com",
  isDev ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: isDev ? "SAMEORIGIN" : "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* No feature on this site needs any of these. */
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    /* Ordered: AVIF first, WebP fallback. */
    formats: ["image/avif", "image/webp"],
    /* 75 is the default everything else uses; 90 is for the full-bleed
       hero, whose source photography is soft enough already. */
    qualities: [75, 90],
  },

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        /* The share cards are deterministic per departure. */
        source: "/:path*/opengraph-image",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" }],
      },
    ];
  },

  /* The public site is the Astro build in site/, served as static files
     out of public/ (see site/tools/sync-to-public.mjs).

     beforeFiles, not the default: a plain rewrite runs AFTER the
     filesystem, so "/" would still be answered by app/page.tsx — the old
     design. This one runs first and hands the root to the new home page.

     Everything else the Astro build produces already ends in .html and
     collides with nothing, so it needs no rule at all. */
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    /* Temporary (307), not permanent (301), and deliberately so. A 301 is
       cached by the browser more or less for ever; while the two designs
       are being reconciled we need to be able to change our minds without
       stranding anyone on a rule we can no longer reach. Promote these to
       permanent once the shape has settled. */
    const toNew = (from: string, to: string) => ({
      source: from,
      destination: to,
      permanent: false,
    });

    return [
      /* The old public routes, sent to their counterpart on the new site.
         These paths are in people's history, in WhatsApp messages and in
         Google's index — /somewhere/hallucia-aiims-nagpur above all, which
         is the link Crew and applicants were given. Without these they are
         served the OLD design, which is worse than a 404: it still works,
         so nobody reports it. */
      toNew("/about", "/about.html"),
      toNew("/contact", "/contact.html"),
      toNew("/faqs", "/faqs.html"),
      toNew("/faq", "/faqs.html"),
      toNew("/apply", "/apply.html"),
      toNew("/apply/thank-you", "/apply.html"),
      toNew("/somewhere", "/somewhere.html"),
      toNew("/somewhere/hallucia-aiims-nagpur", "/hallucia.html"),
      /* The rest of the old departures — Pulse, Thomso — have no
         counterpart on the new site, so they land on the trips page
         rather than on a 404. */
      toNew("/somewhere/:slug*", "/somewhere.html"),
      toNew("/gallery", "/somewhere.html"),

      /* Paperwork. The new site keeps each one as its own page. */
      toNew("/paperwork", "/legal.html"),
      toNew("/paperwork/privacy", "/privacy.html"),
      toNew("/paperwork/terms", "/terms.html"),
      toNew("/paperwork/cancellation-policy", "/cancellation-policy.html"),
      toNew("/privacy", "/privacy.html"),
      toNew("/terms", "/terms.html"),
      toNew("/refund-policy", "/cancellation-policy.html"),
      toNew("/refunds", "/cancellation-policy.html"),

      /* Season-01 routes that were never part of the new design. */
      toNew("/trips", "/somewhere.html"),
      toNew("/trips/:slug*", "/somewhere.html"),
      toNew("/experiences", "/"),
      toNew("/stories", "/"),
      toNew("/events", "/"),
      toNew("/club", "/"),
      toNew("/my-trip", "/"),

      /* NOT redirected, on purpose: /admin, /partner, /crew, /crew/login,
         /crew/dashboard, /documents/:token and /api/*. Those are the
         application, they have no counterpart on the new site, and they
         carry on being served by this app exactly as before. */
    ];
  },
};

export default nextConfig;
