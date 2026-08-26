# AS SCHEDULED — Season 02 platform

Application-only curated travel platform. ROITCOVE VENTURES LLP (LLPIN ACZ-2215, India).
This file is a contract, not documentation. Every rule here changes behavior.

## Canonical sources — read before building anything
1. **`Website_Build_Specification_EXACT_NUDE_PROJECT_STRUCTURE.docx` (repo root) — THE MASTER SPEC.**
   It governs site architecture, page order, navigation, card system, merchandising rails,
   experience-detail page order, application flow, motion and priority. When anything below
   conflicts with it, **the docx wins.** Plain-text extract kept at `docs/BUILD-SPEC.md`.
2. `docs/SPEC.md` — AS Scheduled brand/product detail: tokens, voice, trip data, Form 7A screens,
   DB schema. Still authoritative for **brand and content**, superseded by the docx on structure.
3. `reference/as-scheduled-v4.html` — original single-file build. Source of the design system and
   copy bank. Historical reference now, not the target architecture.
4. Trip data lives ONLY in `lib/trips.ts`. Never hardcode prices, seats, dates, or capacity.

## What we already built = the structure. Do not throw it away.
The existing Next.js app is the foundation. Extend it toward the docx architecture; do not restart.
Keep: design tokens, `lib/trips.ts`, Form 7A engine, case-file/itinerary components, split-flap
board, GSAP/Framer setup, Safari and perf work.

## Non-negotiables (brand)
- Name: **AS Scheduled**. Never "ASS". Wordmark: `AS SCHEDULED®`.
- **Application-only with selection.** Every primary CTA routes to Form 7A. Use `APPLY` / `JOIN`.
  `BOOK` is permitted by docx §27 only for a trip state that is genuinely instant-book — no such
  state exists today, so a "Book Now" button is still a bug.
- 19 seats per departure unless `lib/trips.ts` says otherwise.
- **₹500 registration fee. Non-refundable.** Never returned on rejection, and it does **not**
  credit against the final trip payment. Never write "refundable", "deposit", "credited", or
  "net cost ₹0". Trip-fee refund slabs (80/50/0%) are a separate policy and still stand.
  (Note: docx §23/§34 say "credited against the final trip payment" — overridden by direct
  instruction from Mannat, 2026-08-09. Non-refundable, not credited.)
- **Two voices, by surface.** Deadpan bureaucratic for UI, forms, status, manifests, legal —
  stamps, files, protocols. Editorial and emotional for Trip Story, Stories, Club, hero campaign
  copy (docx §17). Never exclamation marks, emojis, or "unforgettable/amazing/hidden gems".
- No fake history: no stock travel photos, no borrowed campaigns, no invented testimonials or
  reviews. Empty states stay honest. Trip 000 (Alcheringa, 70 pax) is the only past record.
- Never invent hotel names, transport providers, service levels, package tiers, prices, or
  availability numbers (docx §21, §8). Missing → ask, or `// TODO(mannat):`.
- Red (`#D9351F`) appears ONLY as rubber stamps. Peach = mark/CTA. Never invert this.
- "Evenings sealed until departure" — keep the mystery mechanic in every itinerary.

## Creative direction (docx §1, §28)
Nude Project is the **structural and visual reference**: editorial commerce rhythm, oversized
visual storytelling, image-led merchandising, minimal premium navigation, editorial cards.
Translate that system — never copy their text, photography, logos, or code.
Bold, editorial, youthful, premium, slightly irreverent. Large imagery, strong typography, high
contrast, generous negative space, asymmetry where it helps. Avoid gradients, glassmorphism,
over-rounded SaaS components, and generic luxury clichés.

## Assets — the current hard blocker
The docx architecture is image-led and **we have no photography**. Until real assets arrive:
build every image slot as a labelled, brand-styled placeholder that swaps to a real asset with no
layout change. Free-licensed only (Wikimedia CC, credited in `docs/CREDITS.md`) or Mannat's own
Season 1 film photos. Never fill a slot with stock travel imagery.

## Site architecture (docx §3, §4, §14)
Routes: `/` · `/trips` · `/trips/[slug]` (experience detail) · `/experiences` · `/stories` ·
`/events` · `/club` · `/apply` · `/my-trip` · `/paperwork` · `/admin` (Phase 3).
Homepage order: Announcement Bar → Header → Full-screen Hero → UPCOMING → MOST WANTED →
ALMOST FULL → Curated Cards → Editorial Brand Moment → Featured Stories → Events/Community →
Club CTA → Final CTA → Footer.
Experience detail order: Hero → Trip Summary → Departure/Date Selector → Price → Apply CTA →
Brochure CTA → Trip Story → What You're Actually Getting → THE SCHEDULE → Included → Not Included
→ Accommodation → Transport → Package Selector → Add-ons → Reviews → Who This Is For → FAQ →
Final CTA.
Nav: TRIPS · EXPERIENCES · STORIES · EVENTS · CLUB. Utilities: SEARCH · ACCOUNT · MY TRIP.

## Stack
Next.js 15 (App Router) · TypeScript strict (no `any`) · Tailwind · GSAP + ScrollTrigger (scroll
motion only) · Framer Motion (route transitions only) · Supabase (Postgres) · Razorpay · Resend ·
PostHog · Sentry. Ask before adding any dependency not listed here.

## Commands — run these, verbatim
- `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck`
- Before saying "done": `pnpm typecheck && pnpm build` must pass. No exceptions.
- Never run `pnpm build` while `pnpm dev` is running — they share `.next` and it corrupts the
  dev cache. Stop dev first.

## Design tokens (full table in `docs/SPEC.md`)
cotton `#FAF6EE` · cotton-2 `#F1EADC` · navy `#12234F` · navy-2 `#0C1838` · powder `#C6D8EF` ·
powder-2 `#E2ECF8` · peach `#FFAD84` · peach-2 `#FF9463` · red `#D9351F` (stamps only) ·
grey `#8A8FA1`
Fonts: Anton (display) · Instrument Serif italic (editorial accents) · Space Grotesk (body) ·
IBM Plex Mono (labels/UI). Easing: `cubic-bezier(.22,1,.36,1)`.

## Hard engineering rules
- **Safari first.** Test Safari before Chrome. No CSS `animation-timeline`. Keep `-webkit-`
  prefixes, `color-mix` fallbacks, `100vh` before `100svh`, both `summary::marker` and
  `summary::-webkit-details-marker` hidden.
- `prefers-reduced-motion` path for every animation.
- **Motion must never delay access to content** (docx §29). No blocking full-screen loaders.
- Performance budget: initial JS < 150KB gz, LCP < 2.5s on a mid Android, Lighthouse ≥ 90 all
  categories. Images via `next/image`, AVIF/WebP, lazy below fold. Lazy-load GSAP after hydration.
- No horizontal overflow at any width. Mobile is a designed experience, not a squeezed desktop.
- No localStorage/sessionStorage for application state. Form 7A state = React state; persistence
  comes from Supabase in Phase 2. (Overrides docx §23 "save progress" until Phase 2.)
- Trip content/data stays separate from UI components. One reusable experience-page template.
- Secrets in `.env.local` only, never committed. Expected vars in `docs/SPEC.md` §9.

## Environment
- Project lives on **`D:\AS`** (NTFS). **Never work from `F:\AS`** — that volume is exFAT and
  silently corrupted files (0xFF fill, dropped writes) on 2026-08-08. The `F:\AS` copy is stale.
- pnpm settings live in `pnpm-workspace.yaml`, not `package.json`.

## Workflow
- Plan before any change touching 3+ files; state the plan, then execute.
- Small commits, imperative messages: `feat: departure board`, `fix: safari nav fallback`.
- Ask before adding any dependency not listed in Stack.
- When copy is needed and no source has it: write in the correct voice for that surface, 1–2
  sentences, then flag for review.

## Open items (do not guess these)
Antaragni price (₹16,999 assumed, unconfirmed) · boarding hub cities · real Instagram handle ·
WhatsApp number · Trip 000 photos · all Season 1 photography · package tiers and their prices ·
real availability/`filled` counts · reviews and testimonials · Experiences, Stories, Events and
Club content.
