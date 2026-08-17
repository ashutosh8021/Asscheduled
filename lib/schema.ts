/* JSON-LD builders.

   On LocalBusiness (audit item 17, "only if genuinely applicable"): it is NOT
   applicable here and is deliberately absent. LocalBusiness describes a place
   a customer can visit — premises, an address, opening hours. AS Scheduled is
   an application-only travel operator with no public storefront, and no street
   address has been confirmed. Emitting LocalBusiness with invented premises
   would be structured-data spam and can earn a manual action. Organization is
   the correct type and is what we emit. */

import { SITE_URL, abs } from "./site";
import type { Trip } from "./trips";
import { seatsLeft } from "./trips";

type Json = Record<string, unknown>;

const LEGAL_NAME = "ROITCOVE VENTURES LLP";
const ORG_ID = `${SITE_URL}/#organization`;

/** Publisher identity. Emitted once, in the root layout. */
export function organizationSchema(): Json {
  const sameAs = [process.env.NEXT_PUBLIC_INSTAGRAM_URL].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "AS SCHEDULED",
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: abs("/icon.svg"),
    description:
      "Application-only curated six-day departures around India's biggest college fests. 19 seats per departure.",
    /* Country only. No street address has been confirmed, and inventing one
       in structured data would be a fabrication. */
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    identifier: { "@type": "PropertyValue", name: "LLPIN", value: "ACZ-2215" },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "AS SCHEDULED",
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

/**
 * TouristTrip for a departure.
 *
 * availability is LimitedAvailability, never InStock: nothing here can be
 * bought outright. The offer describes the trip fee payable on selection —
 * the ₹500 application fee is a separate, non-refundable charge and is
 * described in text rather than priced as if it bought the seat.
 */
export function tripSchema(trip: Trip): Json {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${trip.fest} — ${trip.campus}`,
    description: trip.hook,
    url: abs(`/trips/${trip.slug}`),
    touristType: "Students and recent graduates, 18-26",
    provider: { "@id": ORG_ID },
    maximumAttendeeCapacity: trip.seats,
    remainingAttendeeCapacity: seatsLeft(trip),
    offers: {
      "@type": "Offer",
      price: String(trip.price),
      priceCurrency: "INR",
      availability: "https://schema.org/LimitedAvailability",
      url: abs(`/apply?trip=${trip.id}`),
      validThrough: trip.close,
      description:
        "Trip fee, payable in full on selection. Applying costs a separate ₹500 registration fee which is non-refundable and is not adjusted against this amount.",
    },
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export function faqSchema(items: FaqItem[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
