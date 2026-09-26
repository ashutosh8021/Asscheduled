/* ============================================================
   SEASON 02 DEPARTURES — transcribed from the approved comps in
   /asset (WhatsApp Image 2026-08-15 at 17.36.40 (5)–(8)).

   This is the single source of truth for the "SOMEWHERE" routes.
   `lib/trips.ts` still backs the legacy Season-01 routes and is
   left untouched; nothing here is duplicated into a component.

   Prices, dates, inclusions and exclusions below are read straight
   off the comps. Anything the comps did NOT state is `null` and
   carries a TODO — nothing is invented.
   ============================================================ */

import { departureSpan } from "./packages";
import { SOMEWHERE } from "./copy";

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

/**
 * One photograph in the "last year" grid.
 *
 * `wide` gives a landscape frame two columns and its own ratio — a
 * 16:9 stage shot squeezed into a portrait tile loses both its ends.
 * Mirrors PastPhoto in lib/gallery.ts, which solved this first.
 */
export interface GlimpsePhoto extends Slot {
  wide?: boolean;
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
  /**
   * The headline fare, or NULL when there is no price to publish yet.
   *
   * Null is not zero and must never render as a figure. A departure can
   * be announced before its fares are agreed — dates first, numbers
   * later — and inventing a placeholder would put a price on the page
   * that nobody has approved. Every render site handles null by saying
   * so in words; TypeScript makes sure none of them forgets.
   */
  price: number | null;
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

  /**
   * WHY it is closed. "full" when the seats are gone, "paused" when we
   * have simply stopped taking applications for now.
   *
   * "soon" is the third: announced, dates public, applications not open
   * yet. It is the honest state for a departure we have published
   * before its fares and its form exist.
   *
   * They are not the same thing and the difference is not cosmetic:
   * stamping SOLD OUT on a departure that has seats left tells people
   * something untrue about why they cannot apply, and invites them to
   * stop asking. Defaults to "full", which is what soldOut meant
   * before this existed.
   */
  closedReason?: "full" | "paused" | "soon";

  /**
   * Off the website, but not out of the codebase.
   *
   * A hidden departure appears nowhere a visitor can reach: no card,
   * no listing, no detail page, no sitemap entry, and the apply route
   * refuses it. It stays in ALL_DEPARTURES so that anything already
   * attached to it still resolves — an application taken before it was
   * hidden must still show its fest name in the admin rather than a
   * bare code.
   *
   * Deliberately not deletion. Turning it back on is one line.
   */
  hidden?: boolean;
  /** Genuine remaining count. null when not confirmed — the UI then
   *  shows "Spots are limited. Vibes are unlimited." instead of a number.
   *  TODO(mannat): wire real availability before launch. */
  spotsLeft: number | null;
  /** Detail-page intro, three paragraphs, verbatim from the comp. */
  intro: string[];
  /**
   * Not rendered anywhere today.
   *
   * The departure page used to show these as INCLUDED / EXCLUDED
   * panels; that section was removed once the plans arrived, because
   * what is included now differs by plan and a single departure-wide
   * list contradicted the cards above it. `includes` on each plan in
   * lib/packages.ts is the live answer.
   *
   * Kept because the copy is worth having, and because the excluded
   * lines exist nowhere else. Editing these changes nothing on the
   * site — change the plan if you want the page to move.
   */
  included: string[];
  excluded: string[];
  /**
   * Not rendered anywhere today.
   *
   * The departure page used to show a day-by-day accordion; that panel
   * was replaced by the custom-booking ask. The schedule also only
   * ever described the shortest plan, so with three plans of different
   * lengths it had stopped being true for two of them.
   *
   * Kept because the copy is worth having. Editing it changes nothing
   * on the site.
   */
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
   * Photographs from the last edition of this fest.
   *
   * The stills counterpart to `lastYear`, which takes video. Same rule
   * and the same reason: it is only ever a previous year, it is
   * credited to whoever shot it, and the section says so. Showing what
   * the place was actually like is honest; letting it read as one of
   * ours would not be.
   */
  glimpse?: {
    eyebrow: string;
    title: string;
    note: string;
    photos: GlimpsePhoto[];
  };
  /**
   * Booking amount, in rupees, taken by UPI at application time.
   *
   * Omitted for departures that take no payment on the site — which is
   * every one of them today. Setting it turns on the payment block in
   * the form: the amount owed, where to send it, and a field for the
   * UTR that comes back.
   *
   * A partner discount comes off this, and the server is what does the
   * subtraction. See lib/partners.ts.
   */
  bookingInr?: number;

  /**
   * Ask for a college ID and a government photo ID as part of applying,
   * rather than after acceptance.
   *
   * The trade is deliberate and worth knowing: it lets you check
   * somebody is a real student before you select them, at the cost of
   * holding documents for applicants you go on to decline. Purge those.
   */
  documentsAtApply?: boolean;

  /**
   * Stamped into the booking panel, directly above the price.
   *
   * Text, like every other stamp on the page. The supplied sticker
   * artwork sat here until 2026-08-29 and was dropped on instruction:
   * at the size the pricing area allows, a shrunk photograph of a
   * sticker reads worse than the drawn stamp, and the page already
   * uses that device three other times.
   */
  panelStamps?: string[];

  /**
   * Stamped into the band the intro column leaves empty above the
   * plans. Text, not artwork: the drawn stamp is the brand's own
   * device and sits on the paper better than a photographed sticker.
   */
  introStamps?: string[];

  /**
   * One short line stamped on every plan card, qualifying the fare
   * above it. Text rather than the sticker artwork: three cards each
   * carrying an image would be heavier than the prices they annotate.
   */
  priceNote?: string;

  /**
   * The festival we run this departure with, when it is a partnership.
   *
   * Setting it has two consequences that must never come apart: the
   * application is mirrored into the spreadsheet that festival can
   * read (lib/sheet.ts derives what it mirrors from this field), and
   * the form tells the applicant so before they submit.
   *
   * One field driving both is the point. Sharing somebody's details
   * with a third party while the form stays silent about it is not a
   * bug we want to be able to introduce by editing one list.
   */
  sharedWith?: string;
}

/**
 * Every departure, hidden ones included.
 *
 * For LOOKUPS ONLY — the admin naming a code on an old application,
 * the sheet, a document upload link somebody already holds. Never
 * render this list: it contains departures that are deliberately not
 * on the website. Use DEPARTURES below for anything a visitor sees.
 */
export const ALL_DEPARTURES: Departure[] = [
  /* ------------------------------------------------------------------
     HALLUCIA'26 — AIIMS Nagpur's annual socio-cultural fest.

     Announced ahead of its fares: the dates are confirmed (25–29 Nov,
     from the fest's own artwork) and the page is live, but `price` is
     null and applications are closed with closedReason "soon". Phase 2
     adds the plans, the fares and the form.

     Photography is the fest's own, from the previous edition — the one
     the LED wall calls "The Mystic Carnival". It is credited as theirs
     and never presented as ours.
     TODO(mannat): confirm written permission to use these, and whether
     AS SCHEDULED is a named partner (that decides `sharedWith`).
     ------------------------------------------------------------------ */
  {
    id: "HAL-26",
    slug: "hallucia-aiims-nagpur",
    fest: "HALLUCIA'26",
    campus: "AIIMS NAGPUR",
    titleTop: "NAGPUR",
    titleBottom: "HALLUCIA",
    /* Their own 2026 line, used as they wrote it. */
    cardNote: "DESI MAXIMALISM.",
    homeNote: "AIIMS hallucia",
    homeDates: "25th – 29th November",
    range: "25 NOV → 29 NOV",
    batches: [
      {
        label: "25 NOV, 2026 – 29 NOV, 2026",
        start: "2026-11-25",
        end: "2026-11-29",
        days: 5,
        nights: 4,
      },
    ],
    days: 5,
    nights: 4,
    /* No fare published yet — see the note on Departure.price. Every
       surface says "PRICING SOON" instead of showing a figure. */
    price: null,
    /* Announced, not open. Not sold out and not paused: the form does
       not exist yet, and this is the state that says so honestly. */
    soldOut: true,
    closedReason: "soon",
    spotsLeft: null,
    /* NEEDS REVIEW — no comp for this departure. Written from the
       fest's own artwork: "the annual socio-cultural fest", the 2026
       theme "Desi Maximalism", and its line "culture, chaos, colours".
       No footfall, no line-up and no claim we cannot stand behind. */
    intro: [
      "Five days in Nagpur, at the fest AIIMS throws for itself and then opens to everyone else.",
      "HALLUCIA is their annual socio-cultural fest, and the 2026 edition is calling itself Desi Maximalism — culture, chaos and colour, turned all the way up.",
      "Competitions through the day, the main stage after dark, and a campus that does not sit still in between.",
    ],
    /* Their own three words, stamped beside the intro. */
    introStamps: ["Culture. Chaos. Colours."],
    /* Not rendered anywhere today — see the notes on these fields.
       TODO(mannat): supply what the fare covers when the plans exist. */
    included: [],
    excluded: [],
    itinerary: [],
    brochure: null,
    hero: {
      src: "/img/hallucia/stage.jpg",
      alt: "The HALLUCIA main stage at night under purple beams and smoke, the crowd silhouetted below",
      label: "HERO — HAL-26",
      credit: "HALLUCIA, AIIMS Nagpur",
    },
    card: {
      src: "/img/hallucia/crowd.jpg",
      alt: "A student at the front barricade watching the stage, the crowd lit behind her",
      label: "CARD — HAL-26",
      credit: "HALLUCIA, AIIMS Nagpur",
    },
    /* The red silhouette, not the phone-lights frame. That one is the
       better photograph and the wrong one here: the homepage prints
       this small with a stamp over it, and a near-black image under a
       rust stamp reads as a loading error. */
    portrait: {
      src: "/img/hallucia/silhouette.jpg",
      alt: "Two dancers in silhouette against a red backdrop, hair mid-turn",
      label: "PORTRAIT — HAL-26",
      credit: "HALLUCIA, AIIMS Nagpur",
    },
    /* The hero cross-fades these in order, so the first frame is the
       banner: the main stage with the fest's name on the truss. */
    wide: [
      {
        src: "/img/wide/hallucia-stage.jpg",
        alt: "The HALLUCIA main stage at night under purple beams and smoke, the crowd silhouetted below",
        label: "WIDE — HALLUCIA STAGE",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/wide/hallucia-crowd.jpg",
        alt: "A student at the front barricade watching the stage, the crowd lit behind her",
        label: "WIDE — CROWD",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/wide/hallucia-confetti.jpg",
        alt: "A singer mid-song with one arm raised as confetti falls through the stage light",
        label: "WIDE — CONFETTI",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/wide/hallucia-mainstage.jpg",
        alt: "A singer in a red dress on the main stage, spotlights fanned out behind her",
        label: "WIDE — MAIN STAGE",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/wide/hallucia-pronite.jpg",
        alt: "A performer at the microphone under red light at the pronite",
        label: "WIDE — PRONITE",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
    ],
    mosaic: [
      {
        src: "/img/hallucia/duet.jpg",
        alt: "Two dancers mid-lift in gold costume under a stage spot",
        label: "HAL-26 / DUET",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/hallucia/silhouette.jpg",
        alt: "Two dancers in silhouette against a red backdrop, hair mid-turn",
        label: "HAL-26 / SILHOUETTE",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/hallucia/couple.jpg",
        alt: "A pair mid-performance in red and black against a deep red wash",
        label: "HAL-26 / DUO",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
      {
        src: "/img/hallucia/lights.jpg",
        alt: "An artist on stage facing a field of raised phone lights in the dark",
        label: "HAL-26 / PHONE LIGHTS",
        credit: "HALLUCIA, AIIMS Nagpur",
      },
    ],
    /* The rest of the photographs they sent, as the last edition
       rather than as this one. "The Mystic Carnival" is readable on
       the stage LED in these frames, which is how we can say which
       edition it was without guessing at a year.

       Eight frames, four of them landscape: twelve column units, which
       divides evenly by 6, 4, 3 and 2 — so the last row fills at every
       breakpoint instead of leaving an orphan. The silhouette is the
       one left out; it is already the card portrait, so the grid shows
       eight frames nobody has seen yet. */
    glimpse: {
      eyebrow: "LAST YEAR",
      title: "WHAT IT ACTUALLY LOOKED LIKE.",
      note: "Shot on the ground at the last edition — the one they called The Mystic Carnival. Their photographs, not ours, and not a showreel.",
      photos: [
        {
          src: "/img/hallucia/crowd.jpg",
          alt: "A student at the front barricade watching the stage, the crowd lit behind her",
          label: "LAST YEAR / BARRICADE",
          credit: "HALLUCIA, AIIMS Nagpur",
          wide: true,
        },
        {
          src: "/img/hallucia/duet.jpg",
          alt: "Two dancers mid-lift in gold costume under a stage spot",
          label: "LAST YEAR / DUET",
          credit: "HALLUCIA, AIIMS Nagpur",
        },
        {
          src: "/img/hallucia/lights.jpg",
          alt: "An artist on stage facing a field of raised phone lights in the dark",
          label: "LAST YEAR / PHONE LIGHTS",
          credit: "HALLUCIA, AIIMS Nagpur",
        },
        {
          src: "/img/hallucia/confetti.jpg",
          alt: "A singer mid-song with one arm raised as confetti falls through the stage light",
          label: "LAST YEAR / CONFETTI",
          credit: "HALLUCIA, AIIMS Nagpur",
          wide: true,
        },
        {
          src: "/img/hallucia/couple.jpg",
          alt: "A pair mid-performance in red and black against a deep red wash",
          label: "LAST YEAR / DUO",
          credit: "HALLUCIA, AIIMS Nagpur",
        },
        {
          src: "/img/hallucia/solo.jpg",
          alt: "A soloist mid-routine in a bandaged costume under warm stage light",
          label: "LAST YEAR / SOLO",
          credit: "HALLUCIA, AIIMS Nagpur",
        },
        {
          src: "/img/hallucia/mainstage.jpg",
          alt: "A singer in a red dress on the main stage, spotlights fanned out behind her",
          label: "LAST YEAR / MAIN STAGE",
          credit: "HALLUCIA, AIIMS Nagpur",
          wide: true,
        },
        {
          src: "/img/hallucia/pronite.jpg",
          alt: "A performer at the microphone under red light at the pronite",
          label: "LAST YEAR / PRONITE",
          credit: "HALLUCIA, AIIMS Nagpur",
          wide: true,
        },
      ],
    },
  },
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
    /* Derived, not typed. PULSE is sold as two plans with a fare per
       state (lib/packages.ts), so the range on a card is the cheapest
       and dearest of those — ₹9,679 from Haryana on Plan 01, ₹16,479
       from Assam on Plan 02. Writing the figures here as well would
       give the site two prices that could disagree, and the one an
       applicant is actually quoted is the one in the fare table. */
    price: departureSpan("PUL-26")!.min,
    priceMax: departureSpan("PUL-26")!.max,
    /* Paused on instruction, 2026-09-14: not taking applications for
       now. Closed rather than hidden — the page, the plans and the
       prices stay readable, and anyone PULSE has already sent here
       still sees what they applied for. `closedReason` keeps it from
       claiming to be full, which it is not.

       Reopening is deleting these two lines. */
    soldOut: true,
    closedReason: "paused",
    /* AIIMS asks for ID up front — see the note on the field. */
    documentsAtApply: true,
    panelStamps: ["₹1,000 off at final payment", "Delegate pass included"],
    introStamps: ["Delegate pass included"],
    priceNote: "₹1,000 off at final payment",
    /* Run with PULSE, so PULSE is told who is coming. This is what
       turns the sheet mirror on and what makes the form say so. */
    sharedWith: "PULSE, AIIMS New Delhi",
    spotsLeft: null,
    intro: [
      "Five days that start the moment the gates open and don't ease off until the last set ends.",
      "PULSE is AIIMS New Delhi's own festival, and it runs on its own logic — forty-odd events and five pro shows, where the same people compete at anatomy art in the afternoon and lose it completely at the pronite.",
      "You arrive into the middle of it. You leave when it's finished.",
    ],
    included: [
      "As Scheduled Trip Host (2 Trip Hosts)",
      "Train 3rd AC – Round Trip (From Your City to Delhi)",
      /* 18 confirmed by Mannat, 2026-08-29, replacing a count this
         file had derived from the Rendezvous pattern. No breakdown was
         given and none is invented — the total is what was stated. */
      "Meals in total: 18",
      "Accommodation (Sharing Basis)",
      "1 Entry Pass to Pulse",
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
    brochure: "/brochure/pulse-2026.pdf",
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
    /* Taken off the website on 2026-08-30 on instruction. The data
       stays — see `hidden` — so any application already carrying
       REN-26 still resolves to a name in the admin. Delete this line
       to put it back. */
    hidden: true,
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

/**
 * The departures the website has. Hidden ones are already gone.
 *
 * This is the default export everything renders from, and it is
 * filtered here rather than at each call site on purpose: there are
 * two dozen places that list departures, and hiding one must not
 * depend on remembering all of them.
 */
export const DEPARTURES: Departure[] = ALL_DEPARTURES.filter((d) => !d.hidden);

/**
 * Departures run with a partner festival.
 *
 * The single derivation of "who is this shared with", used by the
 * sheet mirror and by the partner panel's scope. Both must mean the
 * same thing as the privacy policy, and the way to guarantee that is
 * for both to read the same field.
 */
export function sharedDepartureIds(): string[] {
  /* ALL_DEPARTURES: hiding a departure does not un-share the
     applications already taken for it. A partner who could read them
     yesterday must still be able to today, and the privacy policy
     said so at the time. */
  return ALL_DEPARTURES.filter((d) => d.sharedWith).map((d) => d.id);
}

/** By id, for the places that hold a departure code rather than a
 *  slug — the plan cards, the admin, the sheet.
 *
 *  Searches ALL_DEPARTURES, hidden included. This answers "what is
 *  REN-26 called", and an application taken while it was live still
 *  needs that answer after it comes off the website. */
export function getDepartureById(id: string): Departure | undefined {
  return ALL_DEPARTURES.find((d) => d.id === id);
}

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

/**
 * The next departure anyone can still join.
 *
 * Earliest by start date, skipping anything sold out — a countdown to
 * a trip nobody can book is worse than no countdown. Null once the
 * season is over, and callers must handle that rather than assume.
 */
export function nextDeparture(now: Date = new Date()): Departure | null {
  const open = DEPARTURES.filter((d) => !d.soldOut)
    .map((d) => ({ d, at: new Date(`${d.batches[0]?.start ?? ""}T00:00:00+05:30`) }))
    .filter((x) => !Number.isNaN(x.at.getTime()) && x.at > now)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return open[0]?.d ?? null;
}

/** The ISO start of a departure, as a Date. */
export function departureStart(d: Departure): Date {
  return new Date(`${d.batches[0]?.start ?? ""}T00:00:00+05:30`);
}

export function priceRange(d: Pick<Departure, "price" | "priceMax">): string | null {
  /* Null all the way through rather than a placeholder string: the
     caller decides how "no price yet" looks in its own layout, and a
     figure can never be faked here by accident. */
  if (d.price === null) return null;

  return d.priceMax && d.priceMax !== d.price
    ? `${inr(d.price)} – ${inr(d.priceMax)}`
    : inr(d.price);
}

/**
 * What a closed departure should say, and why.
 *
 * One function so every surface agrees. Before this, each render site
 * reached for SOMEWHERE.soldOut* directly, which meant a departure
 * that was merely paused would still have been stamped SOLD OUT on
 * the card, the hero, the button and the note — four separate lies to
 * fix in four separate files.
 *
 * Returns null when the departure is open, so callers can branch on
 * one value instead of two.
 */
export function closure(d: Pick<Departure, "soldOut" | "closedReason">): {
  label: string;
  arcTop: string;
  arcBottom: string;
  note: string;
  cta: string;
} | null {
  if (!d.soldOut) return null;

  if (d.closedReason === "soon") {
    return {
      label: SOMEWHERE.soonLabel,
      arcTop: SOMEWHERE.soonArcTop,
      arcBottom: SOMEWHERE.soonArcBottom,
      note: SOMEWHERE.soonNote,
      cta: SOMEWHERE.soonCta,
    };
  }

  if (d.closedReason === "paused") {
    return {
      label: SOMEWHERE.pausedLabel,
      arcTop: SOMEWHERE.pausedArcTop,
      arcBottom: SOMEWHERE.pausedArcBottom,
      note: SOMEWHERE.pausedNote,
      cta: SOMEWHERE.pausedCta,
    };
  }

  return {
    label: SOMEWHERE.soldOutLabel,
    arcTop: SOMEWHERE.soldOutArcTop,
    arcBottom: SOMEWHERE.soldOutArcBottom,
    note: SOMEWHERE.soldOutNote,
    cta: SOMEWHERE.soldOutCta,
  };
}
