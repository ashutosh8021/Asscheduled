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

/**
 * A short film that opens a departure's hero, ahead of the stills.
 *
 * Two cuts, for the same reason the homepage hero has two: the hero is
 * a full-viewport box, so `cover` on a 16:9 file shows only a narrow
 * strip of it on a phone.
 */
export interface Clip {
  src: string;
  /** 9:16 cut, used below 820px. */
  portrait: string;
  poster: string;
  posterPortrait: string;
  /** Runtime in seconds. The hero holds here for this long instead of
   *  the usual interval — cutting away mid-clip looks like a fault. */
  seconds: number;
  alt: string;
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

/** A vertical clip in the "last year" strip. */
export interface Reel {
  src: string;
  poster: string;
  alt: string;
  credit?: string;
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
  /** Upper bound when a departure spans package tiers. Omitted for a
   *  single flat price, in which case only `price` is shown. */
  priceMax?: number;
  /**
   * Closed to new applications. Cards and the detail page say so, the
   * apply button is disabled, and the departure is dropped from the
   * form's list. The API refuses it too — a disabled control in the
   * browser stops nobody who opens devtools.
   */
  soldOut?: boolean;
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
  /** Optional film that opens the hero, ahead of `wide`. */
  clip?: Clip;
  /**
   * Footage from the last edition of this fest.
   *
   * Only ever a previous year, never dressed up as one of ours — the
   * point is to show what the place is actually like, and the section
   * says which year it is.
   */
  lastYear?: {
    eyebrow: string;
    title: string;
    note: string;
    reels: Reel[];
  };
  /**
   * Ask for a college ID and a government photo ID as part of applying,
   * rather than after acceptance.
   *
   * The trade is deliberate and worth knowing: it lets you check
   * somebody is a real student before you select them, at the cost of
   * holding documents for applicants you go on to decline. Purge those.
   */
  documentsAtApply?: boolean;
}

export const DEPARTURES: Departure[] = [
  {
    /* PULSE'26 — AIIMS New Delhi's own festival. Structured on the
       Rendezvous departure per instruction ("keep it like delhi"), with
       two differences confirmed by Mannat on 2026-08-25: the trip is the
       fest window exactly, so there are no sightseeing days, and the
       price is a range rather than Delhi's flat figure. */
    id: "PUL-26",
    slug: "pulse-aiims-delhi",
    fest: "PULSE'26",
    campus: "AIIMS DELHI",
    titleTop: "DELHI",
    titleBottom: "PULSE",
    cardNote: "DELHI, AT FULL VOLUME.",
    homeNote: "AIIMS pulse",
    homeDates: "17th – 21st September",
    range: "17 SEP → 21 SEP",
    batches: [
      {
        label: "17 SEP, 2026 – 21 SEP, 2026",
        start: "2026-09-17",
        end: "2026-09-21",
        days: 5,
        nights: 4,
      },
    ],
    days: 5,
    nights: 4,
    price: 8799,
    priceMax: 12799,
    /* AIIMS asks for ID up front — see the note on the field. */
    documentsAtApply: true,
    spotsLeft: null,
    intro: [
      "Five days that start the moment the gates open and don't ease off until the last set ends.",
      "PULSE is AIIMS New Delhi's own festival, and it runs on its own logic — forty-odd events and five pro shows, where the same people compete at anatomy art in the afternoon and lose it completely at the pronite.",
      "You arrive into the middle of it. You leave when it's finished.",
    ],
    included: [
      "As Scheduled Trip Host (2 Trip Hosts)",
      "Train 3rd AC – Round Trip (From Your City to Delhi)",
      /* TODO(mannat): confirm. Derived from the Rendezvous pattern of
         (days − 2) breakfasts, (days − 2) lunches, (days − 3) dinners,
         which fits its 8-day trip exactly. Nobody stated it for a
         5-day one — this is the only line here not taken from you. */
      "Meals in total: 3 Breakfasts, 3 Lunches, 2 Dinners",
      "Accommodation (Sharing Basis)",
      "2 Entry Passes to Pulse",
      "Transfer from Airport / Station",
    ],
    excluded: [
      "Only 1 Dinner during Pro-Night",
      "The thing you bought without needing it",
      "The cab you took because walking suddenly felt unacceptable",
      "The plan that appeared after 11:47 PM",
    ],
    itinerary: [
      { n: "DAY 01", date: "17 SEP", title: "PULSE OPENS", detail: null },
      { n: "DAY 02", date: "18 SEP", title: "THE COMPETITIONS & EVENTS", detail: null },
      { n: "DAY 03", date: "19 SEP", title: "ANOTHER ROUND TO GO", detail: null },
      { n: "DAY 04", date: "20 SEP", title: "THE MAIN EVENT", detail: null },
      { n: "DAY 05", date: "21 SEP", title: "FAREWELL", detail: null },
    ],
    brochure: null,
    hero: {
      src: "/img/aiims/crowd.jpg",
      alt: "A performer crouched at the edge of the stage, the crowd filling the ground behind",
      label: "HERO — PUL-26",
      credit: "PULSE, AIIMS New Delhi",
    },
    card: {
      src: "/img/aiims/crowd.jpg",
      alt: "A performer crouched at the edge of the stage, the crowd filling the ground behind",
      label: "CARD — PUL-26",
      credit: "PULSE, AIIMS New Delhi",
    },
    portrait: {
      src: "/img/aiims/pronite.jpg",
      alt: "A pronite set under yellow smoke, the crowd lit from the stage",
      label: "PORTRAIT — PUL-26",
      credit: "PULSE, AIIMS New Delhi",
    },
    wide: [
      {
        src: "/img/wide/aiims-crowd.jpg",
        alt: "A performer crouched at the edge of the stage, the crowd filling the ground behind",
        label: "WIDE — PULSE CROWD",
        credit: "PULSE, AIIMS New Delhi",
      },
      {
        src: "/img/wide/aiims-pronite.jpg",
        alt: "A pronite set under yellow smoke, the crowd lit from the stage",
        label: "WIDE — PRONITE",
        credit: "PULSE, AIIMS New Delhi",
      },
      {
        src: "/img/wide/aiims-mainstage.jpg",
        alt: "A solo performer on the main stage, the hall dark around them",
        label: "WIDE — MAIN STAGE",
        credit: "PULSE, AIIMS New Delhi",
      },
      {
        src: "/img/wide/aiims-classical.jpg",
        alt: "Two dancers mid-performance in classical costume under stage light",
        label: "WIDE — CLASSICAL",
        credit: "PULSE, AIIMS New Delhi",
      },
      {
        src: "/img/wide/aiims-troupe.jpg",
        alt: "A dance troupe holding a formation on stage",
        label: "WIDE — TROUPE",
        credit: "PULSE, AIIMS New Delhi",
      },
    ],
    lastYear: {
      eyebrow: "PULSE'25",
      title: "WHAT LAST YEAR LOOKED LIKE",
      note: "Shot on the ground at the last edition. Not a showreel, not borrowed — just what the stage looked like from where everyone was standing.",
      reels: [
        {
          src: "/video/pulse25-red.mp4",
          poster: "/video/pulse25-red.jpg",
          alt: "A performer mid-song under red stage light at PULSE 2025",
          credit: "PULSE, AIIMS New Delhi",
        },
        {
          src: "/video/pulse25-green.mp4",
          poster: "/video/pulse25-green.jpg",
          alt: "A performer at the microphone under green light at PULSE 2025",
          credit: "PULSE, AIIMS New Delhi",
        },
      ],
    },
    clip: {
      src: "/video/pulse-stage.mp4",
      portrait: "/video/pulse-stage-portrait.mp4",
      poster: "/video/pulse-stage.jpg",
      posterPortrait: "/video/pulse-stage-portrait.jpg",
      seconds: 12.5,
      alt: "A performer on the PULSE main stage under blue light",
      credit: "PULSE, AIIMS New Delhi",
    },
    mosaic: [
      {
        src: "/img/aiims/classical.jpg",
        alt: "Two dancers mid-performance in classical costume under stage light",
        label: "PUL-26 / CLASSICAL",
        credit: "PULSE, AIIMS New Delhi",
      },
      {
        src: "/img/aiims/mainstage.jpg",
        alt: "A solo performer on the main stage, the hall dark around them",
        label: "PUL-26 / MAIN STAGE",
        credit: "PULSE, AIIMS New Delhi",
      },
      {
        src: "/img/aiims/troupe.jpg",
        alt: "A dance troupe holding a formation on stage",
        label: "PUL-26 / TROUPE",
        credit: "PULSE, AIIMS New Delhi",
      },
    ],
  },
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
    soldOut: true,
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
    price: 8499,
    priceMax: 24499,
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

/**
 * The price as shown on cards and detail pages.
 *
 * "₹16,499" for a flat price, "₹8,499 – ₹24,499" where the departure
 * spans tiers. The homepage keeps using shortPrice, since "From" already
 * says the low end of a range.
 */
/**
 * The batch-count chip. "+2 BATCHES" reads as "two more to choose from",
 * which is right for a multi-batch departure and wrong for a single one —
 * "+1 BATCHES" is just broken English on a live page.
 */
export function batchLabel(batches: readonly unknown[]): string {
  return batches.length === 1 ? "1 BATCH" : `+${batches.length} BATCHES`;
}

export function priceRange(d: Pick<Departure, "price" | "priceMax">): string {
  return d.priceMax && d.priceMax !== d.price
    ? `${inr(d.price)} – ${inr(d.priceMax)}`
    : inr(d.price);
}
