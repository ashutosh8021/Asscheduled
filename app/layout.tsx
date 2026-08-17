import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, IBM_Plex_Mono, Instrument_Serif, Playfair_Display } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import Analytics from "@/components/analytics/Analytics";
import StickyCTA from "@/components/layout/StickyCTA";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";
/* The "SOMEWHERE" design layer, from the approved comps. Namespaced
   `s-`, loaded after globals.css so it never fights the legacy layer. */
import "./as.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const grotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
});

/* The Didone statement face in the comps — "SOMEWHERE ELSE.",
   "I am coming." Weight 500 carries the modal headings, 700/800 the
   display lines. */
const playfair = Playfair_Display({
  weight: ["500", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  /* Without metadataBase every relative OG/Twitter image resolves against
     localhost. lib/site.ts is the single source for the origin. */
  metadataBase: new URL(SITE_URL),
  /* Page titles already carry the "· AS SCHEDULED" suffix explicitly, so no
     title.template here — it would double the wordmark. */
  title: "AS SCHEDULED — Fest Departures. 19 Seats. Application Only.",
  description:
    "Curated six-day departures around India's biggest college fests. Travel, fest tickets, stays and all meals included. 19 seats. You apply. We choose.",
  applicationName: SITE_NAME,
  /* NO alternates.canonical here. Next merges metadata down the tree, so a
     canonical set on the root layout is inherited by every child route that
     does not override it — which told crawlers the entire site was a
     duplicate of "/". Each page declares its own canonical instead. */
  openGraph: {
    title: "AS SCHEDULED — Season 01 Departure Board",
    description: "One fest. One city. Six days. Nineteen strangers. Application only.",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AS SCHEDULED — Season 01 Departure Board",
    description: "One fest. One city. Six days. Nineteen strangers. Application only.",
  },
  formatDetection: { telephone: false, address: false, email: false },
  /* Search Console. DNS verification is preferable and needs nothing here;
     this covers the meta-tag method when DNS is not available. */
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  icons: {
    icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 34'%3E%3Cpath d='M4 18 C14 6 30 4 44 10 C36 11 30 14 27 19 C36 16 46 18 52 25 C43 22 35 24 30 30 C27 23 18 20 4 18 Z' fill='%23FFAD84'/%3E%3C/svg%3E`,
  },
};

/* Browser chrome matches the paper, not the OS default. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#12234F" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${grotesk.variable} ${plex.variable} ${instrument.variable} ${playfair.variable}`}
    >
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <div className="grain" aria-hidden="true" />
        {children}
        <StickyCTA />
        {/* Suspense: Analytics reads useSearchParams, which would otherwise
            opt every page out of static rendering. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
