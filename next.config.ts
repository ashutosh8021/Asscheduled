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

/* Every page the public site publishes, by its clean path.

   The build still produces somewhere.html and the markup still links to
   somewhere.html — it has to, because the page-wipe handler decides a
   link is internal by testing it for a .html ending. The pair of rules
   below is what hides the extension anyway: the link fires the wipe,
   the redirect cleans the address bar, the rewrite serves the file. */
const PAGES = [
  "somewhere",
  "hallucia",
  "mood-indigo",
  "about",
  "contact",
  "faqs",
  "apply",
  "privacy",
  "terms",
  "legal",
  "cancellation-policy",
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
    /* Files in public/ are served by Next with
       `public, max-age=0, must-revalidate`, which is the right default
       for a folder somebody might drop anything into and the wrong one
       for this site. The public site is 38 requests on the home page —
       a 7.3MB hero video, ~20 photographs between 270KB and 600KB, an
       86KB stylesheet — and with max-age=0 the browser re-checks every
       one of them on every page view and every return visit. That is
       what makes it feel slow: not the server (TTFB is ~0.25s) but a
       site that refuses to let anything be kept.

       Nothing below changes a byte of what is served, only how long a
       browser may keep it. */
    const forever = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];

    return [
      { source: "/:path*", headers: SECURITY_HEADERS },

      /* Astro's own output. Every filename carries a content hash
         (Base.BW1DPkCW.css), so the name changes whenever the bytes do
         and a year is provably safe. */
      { source: "/_astro/:path*", headers: forever },

      /* The photography, the videos and the cut-outs. Final files, in
         the sense docs/DECISIONS.md means it: already cropped, graded
         and encoded, and never edited in place.
         IF ONE EVER HAS TO CHANGE, GIVE IT A NEW FILENAME. A year is a
         long time to serve a file somebody thinks they replaced. */
      { source: "/assets/img/:path*", headers: forever },
      { source: "/assets/video/:path*", headers: forever },
      { source: "/assets/el/:path*", headers: forever },

      /* Brand files and the brochures get a day, not a year, and the
         reason is the payment QR. It lives here, it is the one file
         that would be swapped in place rather than renamed, and serving
         a stale one sends somebody's money to the wrong account. A day
         still removes almost all of the repeat cost. */
      {
        source: "/assets/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/assets/docs/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
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
      /* beforeFiles, so these run ahead of the filesystem: /somewhere is
         not a file, and without this it would 404 before anything had a
         chance to serve somewhere.html. */
      beforeFiles: [
        { source: "/", destination: "/index.html" },
        ...PAGES.map((p) => ({ source: `/${p}`, destination: `/${p}.html` })),
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    /* Temporary (307), not permanent (301), and deliberately so. A 301 is
       cached by the browser more or less for ever; while the shape of the
       site is still settling we need to be able to change our minds
       without stranding anyone on a rule we can no longer reach. Promote
       these once it has settled. */
    const toNew = (from: string, to: string) => ({
      source: from,
      destination: to,
      permanent: false,
    });

    return [
      /* The home page has one address, and it is "/".

         The logo links say index.html, and they have to: the page-wipe
         handler decides a link is internal by testing it for a .html
         ending, so href="/" would skip the wipe and hard-jump. This keeps
         the link as it is — the wipe plays — and then sends the browser on
         to "/", so the address bar never shows index.html.

         Permanent, unlike the rest: index.html is never going to become a
         canonical URL again whatever else changes.

         No loop: Next checks redirects before rewrites, so "/" is never
         matched here and goes straight to the rewrite above. */
      { source: "/index.html", destination: "/", permanent: true },

      /* The same trick for every other page, which is what hides .html.
         Request /somewhere.html and you are sent to /somewhere; request
         /somewhere and the rewrite serves the file. One hop, no loop,
         and the hash survives — /apply.html#hal5 still preselects the
         plan, because browsers carry the fragment across a redirect. */
      ...PAGES.map((p) => toNew(`/${p}.html`, `/${p}`)),

      /* The old public routes, sent to their counterpart on the new site.
         These paths are in people's history, in WhatsApp messages and in
         Google's index — /somewhere/hallucia-aiims-nagpur above all, which
         is the link Crew and applicants were given. Without these they are
         served the OLD design, which is worse than a 404: it still works,
         so nobody reports it.

         Note what is NOT here any more: /about, /contact, /faqs, /apply,
         /somewhere, /privacy and /terms. Those are the real URLs now, and
         a rule pointing them at themselves is an infinite redirect. */
      toNew("/faq", "/faqs"),
      toNew("/apply/thank-you", "/apply"),
      toNew("/somewhere/hallucia-aiims-nagpur", "/hallucia"),
      /* The rest of the old departures — Pulse, Thomso — have no
         counterpart on the new site, so they land on the trips page
         rather than on a 404.
         :slug+ not :slug*, because * also matches zero segments, which
         would make this rule swallow /somewhere itself and redirect it to
         itself. */
      toNew("/somewhere/:slug+", "/somewhere"),
      toNew("/gallery", "/somewhere"),

      /* Paperwork. The new site keeps each one as its own page. */
      toNew("/paperwork", "/legal"),
      toNew("/paperwork/privacy", "/privacy"),
      toNew("/paperwork/terms", "/terms"),
      toNew("/paperwork/cancellation-policy", "/cancellation-policy"),
      toNew("/refund-policy", "/cancellation-policy"),
      toNew("/refunds", "/cancellation-policy"),

      /* Season-01 routes that were never part of the new design. */
      toNew("/trips", "/somewhere"),
      toNew("/trips/:slug+", "/somewhere"),
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
