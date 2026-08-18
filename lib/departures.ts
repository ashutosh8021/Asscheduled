/* ============================================================
   SEASON 01 DEPARTURES — transcribed from the approved comps in
   /asset (WhatsApp Image 2026-08-15 at 17.36.40 (5)–(8)).

   This is the single source of truth for the "SOMEWHERE" routes.
   `lib/trips.ts` still backs the legacy Season-01 routes and is
   left untouched; nothing here is duplicated into a component.

   Prices, dates, inclusions and exclusions below are read straight
   off the comps. Anything the comps did NOT state is `null` and
   carries a TODO — nothing is invented.
   ============================================================ */

/** An image slot. `src` stays null until approved photography exists;
 *  components render a labelled placeholder with identical geometry. */
export interface Slot {
  src: string | null;
  alt: string;
  /** Shown inside the placeholder so the missing asset is obvious. */
  label: string;
  credit?: string;
}

export interface Batch {
  /** Display string exactly as the comp writes it. */
  label: string;
  start: string; // ISO
  end: string; // ISO
  days: number;
  nights: number;
}

export interface ItineraryDay {
  /** "DAY 01" */
  n: string;
  /** "25 SEP" — the Rendezvous comp dates each day; Thomso's does not. */
  date: string | null;
  /** "THE DEPARTURE" */
  title: string;
  /** Detail copy per day is not in the comps.
   *  TODO(mannat): supply the per-day detail for each departure. */
  detail: string | null;
}

export interface Departure {
  id: string;
  slug: string;
  /** "RENDEZVOUS'26" */
  fest: string;
  /** "IIT DELHI" */
  campus: string;
  /** Detail-page display title, in two lines: "DELHI x RENDEZVOUS." */
  titleTop: string;
  titleBottom: string;
  /** Card sub-line: "DELHI, FOR A FEW DAYS." */
  cardNote: string;
  /** Homepage card label: "Delhi rendezvous" */
  homeNote: string;
  /** Homepage short date: "25th – 1st October" */
  homeDates: string;
  /** Compact range for the listing card: "25 SEP → 01 OCT" */
  range: string;
  batches: Batch[];
  days: number;
  nights: number;
  price: number;
  /** Genuine remaining count. null when not confirmed — the UI then
   *  shows "Spots are limited. Vibes are unlimited." instead of a number.
   *  TODO(mannat): wire real availability before launch. */
  spotsLeft: number | null;
  /** Detail-page intro, three paragraphs, verbatim from the comp. */
  intro: string[];
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  /** Brochure is referenced by both detail comps at "PDF · 1.2 MB".
   *  TODO(mannat): supply the real brochure PDFs, then set these. */
  brochure: string | null;
  hero: Slot;
  card: Slot;
  /** A genuinely portrait frame, for the tall boxes on the homepage.
   *  Using the landscape campus shot there crops away most of it. */
  portrait: Slot;
  /**
   * Landscape 16:9 crops, for the full-screen hero only.
   *
   * The originals are phone portraits; a full-screen landscape box
   * would show barely a third of each. These are cut to 16:9 with the
   * framing chosen per photo, so the hero fills edge to edge with no
   * bars. They live in /img/wide and are generated from the portraits
   * in /img/<city> — re-crop those if the framing needs to change.
   */
  wide: Slot[];
  /** The detail-page mosaic. Only campus photography exists today. */
  mosaic: Slot[];
}

export const DEPARTURES: Departure[] = [
  {
    id: "REN-26",
    slug: "rendezvous-iit-delhi",
    fest: "RENDEZVOUS'26",
    campus: "IIT DELHI",
    titleTop: "DELHI",
    titleBottom: "RENDEZVOUS",
    cardNote: "DELHI, FOR A FEW DAYS.",
    homeNote: "Delhi rendezvous",
    homeDates: "25th – 1st October",
    range: "25 SEP → 01 OCT",
    batches: [
      {
        label: "25 SEP, 2026 – 01 OCT, 2026",
        start: "2026-09-25",
        end: "2026-10-01",
        days: 8,
        nights: 7,
      },
      {
        label: "27 SEP, 2026 – 03 OCT, 2026",
        start: "2026-09-27",
        end: "2026-10-03",
        days: 8,
        nights: 7,
      },
    ],
    days: 8,
    nights: 7,
    price: 16499,
    spotsLeft: null,
    intro: [
      "A few days built around good places, better people, late nights and the kind of plans that only make sense once you're there.",
      "A full city break followed by four days inside one of the country's biggest student festivals, with enough room for the unexpected.",
      "Come for the week. Leave with something that didn't exist before you came.",
    ],
    included: [
      "As Scheduled Trip Host (2 Trip Hosts)",
      "Train 3rd AC – Round Trip (From Your City to Delhi)",
      "Meals in total: 6 Breakfasts, 6 Lunches, 5 Dinners",
      "Accommodation (Sharing Basis)",
      "2 Entry Passes to Rendezvous",
      "Transfer from Airport / Station",
      "2 Days Sightseeing of Delhi",
      "Entry Pass to Red Fort, Humayun's Tomb, Qutub Minar",
    ],
    excluded: [
      "Only 1 Dinner during Pro-Night",
      "The thing you bought without needing it",
      "The cab you took because walking suddenly felt unacceptable",
      "The plan that appeared after 11:47 PM",
    ],
    itinerary: [
      { n: "DAY 01", date: "25 SEP", title: "THE DEPARTURE", detail: null },
      { n: "DAY 02", date: "26 SEP", title: "NEW DELHI, NEW RULES", detail: null },
      { n: "DAY 03", date: "27 SEP", title: "THE OTHER DELHI", detail: null },
      { n: "DAY 04", date: "28 SEP", title: "RENDEZVOUS OPENS", detail: null },
      { n: "DAY 05", date: "29 SEP", title: "THE COMPETITIONS & EVENTS", detail: null },
      { n: "DAY 06", date: "30 SEP", title: "ANOTHER ROUND TO GO", detail: null },
      { n: "DAY 07", date: "01 OCT", title: "THE MAIN EVENT", detail: null },
      { n: "DAY 08", date: "02 OCT", title: "FAREWELL", detail: null },
    ],
    brochure: null,
    hero: {
      src: "/img/delhi/campus.jpg",
      alt: "The main building of the Indian Institute of Technology Delhi, seen from the lawn",
      label: "HERO — REN-26",
    },
    card: {
      src: "/img/delhi/campus.jpg",
      alt: "Indian Institute of Technology Delhi",
      label: "CARD — REN-26",
    },
    portrait: {
      src: "/img/delhi/india-gate.jpg",
      alt: "India Gate at sunset, the sun setting through the arch",
      label: "PORTRAIT — REN-26",
    },
    wide: [
      {
        src: "/img/wide/delhi-campus.jpg",
        alt: "The main building of the Indian Institute of Technology Delhi",
        label: "WIDE — IIT DELHI",
      },
      {
        src: "/img/wide/delhi-india-gate.jpg",
        alt: "India Gate at sunset, the sun setting through the arch",
        label: "WIDE — INDIA GATE",
      },
      {
        src: "/img/wide/delhi-red-fort.jpg",
        alt: "The Red Fort under a clear blue sky",
        label: "WIDE — RED FORT",
      },
      {
        src: "/img/wide/delhi-bookstore.jpg",
        alt: "Faqir Chand Book Store, its doorway overgrown with creepers",
        label: "WIDE — BOOKSTORE",
      },
      {
        src: "/img/wide/delhi-lodhi.jpg",
        alt: "Shish Gumbad in Lodhi Garden",
        label: "WIDE — LODHI GARDEN",
      },
      {
        src: "/img/wide/delhi-bazaar.jpg",
        alt: "A market stall stacked with bangles, bags and pottery",
        label: "WIDE — BAZAAR",
      },
    ],
    mosaic: [
      {
        src: "/img/delhi/india-gate.jpg",
        alt: "India Gate at sunset, the sun setting through the arch",
        label: "REN-26 / INDIA GATE",
      },
      {
        src: "/img/delhi/red-fort.jpg",
        alt: "The Red Fort under a clear blue sky",
        label: "REN-26 / RED FORT",
      },
      {
        src: "/img/delhi/lodhi-garden.jpg",
        alt: "Shish Gumbad in Lodhi Garden, framed by bare branches",
        label: "REN-26 / LODHI GARDEN",
      },
      {
        src: "/img/delhi/bookstore.jpg",
        alt: "Faqir Chand Book Store, its doorway overgrown with creepers",
        label: "REN-26 / BOOKSTORE",
      },
      {
        src: "/img/delhi/bazaar.jpg",
        alt: "A market stall stacked with bangles, bags and pottery",
        label: "REN-26 / BAZAAR",
      },
    ],
  },
  {
    id: "THO-26",
    slug: "thomso-iit-roorkee",
    fest: "THOMSO'26",
    campus: "IIT ROORKEE",
    titleTop: "IITR THOMSO",
    titleBottom: "MUSSOORIE",
    cardNote: "ROORKEE, TEMPORARILY.",
    homeNote: "Roorkee rendezvous",
    homeDates: "5th – 10th October",
    range: "05 OCT → 11 OCT",
    batches: [
      {
        label: "05 OCT, 2026 – 11 OCT, 2026",
        start: "2026-10-05",
        end: "2026-10-11",
        days: 8,
        nights: 7,
      },
      {
        label: "08 OCT, 2026 – 13 OCT, 2026",
        start: "2026-10-08",
        end: "2026-10-13",
        days: 8,
        nights: 7,
      },
    ],
    days: 8,
    nights: 7,
    price: 12499,
    /* The Thomso comp states this outright. */
    spotsLeft: 13,
    intro: [
      "A few days built around good places, better people, late nights and the kind of plans that only make sense once you're there.",
      "A full city break followed by four days inside one of the country's biggest student festivals, with enough room for the unexpected.",
      "Come for the week. Leave with something that didn't exist before you came.",
    ],
    included: [
      "Ride as Scheduled Trip Host (2 Trip Hosts)",
      "Train 3rd AC – From Your City to Destination & Back",
      "Meals in total: 6 Breakfasts, 6 Lunches, 5 Dinners",
      "Accommodation (Sharing Basis)",
      "Entry Passes to Thomso (IIT Roorkee)",
      "Transfer from Station",
      "2 Days Sightseeing of Dehradun & Mussoorie",
      "Entry Passes to All Itineraries",
    ],
    excluded: [
      "Train meals",
      "Only 1 Dinner during Pro-Night",
      "The extra drink",
      "The midnight food",
      "The shopping you swore you wouldn't do",
      "The plan that wasn't on the plan",
    ],
    itinerary: [
      { n: "DAY 01", date: null, title: "THE DEPARTURE", detail: null },
      { n: "DAY 02", date: null, title: "DEHRADUN", detail: null },
      { n: "DAY 03", date: null, title: "MUSSOORIE", detail: null },
      { n: "DAY 04", date: null, title: "THOMSO OPENS", detail: null },
      { n: "DAY 05", date: null, title: "THE COMPETITIONS & EVENTS", detail: null },
      { n: "DAY 06", date: null, title: "ANOTHER ROUND TO GO", detail: null },
      { n: "DAY 07", date: null, title: "THE MAIN EVENT", detail: null },
      { n: "DAY 08", date: null, title: "FAREWELL", detail: null },
    ],
    brochure: null,
    hero: {
      src: "/img/roorkee/campus.jpg",
      alt: "The James Thomason Building at IIT Roorkee, across the front lawn",
      label: "HERO — THO-26",
    },
    card: {
      src: "/img/roorkee/campus.jpg",
      alt: "Indian Institute of Technology Roorkee",
      label: "CARD — THO-26",
    },
    portrait: {
      src: "/img/roorkee/viewpoint.jpg",
      alt: "A group at a hill viewpoint at golden hour, cameras out",
      label: "PORTRAIT — THO-26",
    },
    /* The campus tower and deodar frames are deliberately absent: the
       tower crop is two thirds empty sky, and the deodar source is only
       590px wide — too soft to fill a screen. Both still appear in the
       mosaic, where they are small enough to hold up. */
    wide: [
      {
        src: "/img/wide/roorkee-campus.jpg",
        alt: "The James Thomason Building at IIT Roorkee, across the front lawn",
        label: "WIDE — IIT ROORKEE",
      },
      {
        src: "/img/wide/roorkee-viewpoint.jpg",
        alt: "A group at a hill viewpoint at golden hour, cameras out",
        label: "WIDE — VIEWPOINT",
      },
      {
        src: "/img/wide/roorkee-mall-road.jpg",
        alt: "A Mussoorie hill road strung with prayer flags",
        label: "WIDE — MUSSOORIE",
      },
      {
        src: "/img/wide/roorkee-bakehouse.jpg",
        alt: "Landour Bakehouse lit up at dusk",
        label: "WIDE — LANDOUR",
      },
      {
        src: "/img/wide/roorkee-hill-cafe.jpg",
        alt: "A hillside café with a hand-painted sign, snow peaks behind it",
        label: "WIDE — HILL CAFÉ",
      },
    ],
    mosaic: [
      {
        src: "/img/roorkee/viewpoint.jpg",
        alt: "A group at a hill viewpoint at golden hour, cameras out",
        label: "THO-26 / VIEWPOINT",
      },
      {
        src: "/img/roorkee/campus-tower.jpg",
        alt: "The red brick clock tower building on the IIT Roorkee campus",
        label: "THO-26 / CAMPUS",
      },
      {
        src: "/img/roorkee/mall-road.jpg",
        alt: "A Mussoorie hill road strung with prayer flags",
        label: "THO-26 / MUSSOORIE",
      },
      {
        src: "/img/roorkee/bakehouse.jpg",
        alt: "Landour Bakehouse lit up at dusk",
        label: "THO-26 / LANDOUR",
      },
      {
        src: "/img/roorkee/deodar.jpg",
        alt: "Deodar trees on a hillside, light coming through the trunks",
        label: "THO-26 / DEODAR",
      },
      {
        src: "/img/roorkee/kulhad-coffee.jpg",
        alt: "A kulhad coffee stall lit against the dark",
        label: "THO-26 / KULHAD COFFEE",
      },
    ],
  },
];

export function getDeparture(slug: string): Departure | undefined {
  return DEPARTURES.find((d) => d.slug === slug);
}

/** "₹15,999" — Indian digit grouping, no decimals. */
export function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/**
 * The price on a homepage card.
 *
 * The comp wrote this as "From 15.9" — no symbol, no unit — which reads
 * as ₹15.90 as easily as ₹15,999, and rounding ₹16,499 to "16.5" states
 * a price ₹1 above the real one. Shows the actual figure instead.
 */
export function shortPrice(n: number): string {
  return `From ${inr(n)}`;
}
