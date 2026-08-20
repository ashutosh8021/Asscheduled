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
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
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

  async redirects() {
    return [
      /* Legacy legal deep-links from the reference build. */
      { source: "/privacy", destination: "/paperwork/privacy", permanent: true },
      { source: "/terms", destination: "/paperwork/terms", permanent: true },
      { source: "/refund-policy", destination: "/paperwork/cancellation-policy", permanent: true },
      { source: "/refunds", destination: "/paperwork/cancellation-policy", permanent: true },

      /* The comps rename the departure and FAQ surfaces. The old routes
         are still built (legacy Season-01 pages), so these send the
         public-facing paths to the new ones. */
      { source: "/faq", destination: "/faqs", permanent: true },
      /* Not the [slug] children: the legacy departures (Pulse, Antaragni,
         Oasis) have no counterpart under /somewhere, so mapping them
         through would only redirect into a 404. */
      { source: "/trips", destination: "/somewhere", permanent: false },
    ];
  },
};

export default nextConfig;
