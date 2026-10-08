# AS SCHEDULED — the site

The Co-work site in `../source-site/`, rebuilt as an Astro project. A migration,
not a redesign: `../source-site/` is the source of truth and is never edited.

```bash
npm install
npm run dev                 # http://localhost:4321
npm run build && npx astro preview --port 4321
node tools/verify-css.mjs   # the stylesheet is still the original
```

## Where things are

| Path | What |
|---|---|
| `src/pages/*.astro` | the 13 pages, each one a `<Base>` with its sections |
| `src/layouts/Base.astro` | head, ticker, header, menu, `<main>`, footer, grain, wipe |
| `src/components/chrome/` | the five pieces every page shares |
| `src/components/<page>/` | one component per section, named as in `docs/PAGES.md` |
| `src/styles/` | 36 CSS partials + `site.css`, which imports them in order |
| `src/scripts/` | the runtime, split by feature, imported in order by `site.js` |
| `src/data/nav.js` | the nav, the ticker lines and the social links |
| `public/assets/` | the media, byte for byte, same paths as the original |

## Three things that look like details and are not

**The import order in `src/styles/site.css` is the design.** The original
stylesheet deliberately overrides earlier rules with later ones — the `v4.1` and
`JOURNEY` blocks at the end exist to do exactly that. The 36 partials
concatenated in import order equal the original byte for byte, with one
documented exception; `tools/verify-css.mjs` proves it and names the exception.
Reordering or merging them changes the site without changing any single rule.

**The import order in `src/scripts/site.js` is the frame loop.** The original was
one IIFE whose blocks ran top to bottom; those blocks are now modules, imported
in that same order. They register callbacks with `onFrame`, and the loop calls
them in registration order, so reordering the imports reorders the work inside
every animation frame.

**The build keeps `.html`; the site serves clean URLs.** `build.format: 'file'`
is not a preference. The page-wipe handler decides a link is internal by testing
it against `/\.html(#[\w.~-]*)?$/i`, so the hrefs must keep the extension or the
wipe never plays. The extension is hidden at the server instead:
`next.config.ts` redirects `/somewhere.html` to `/somewhere` and rewrites it
back. `src/scripts/core/wipe.js` strips `.html` on both sides when deciding
whether a link is a same-page anchor, because the two no longer look alike.

## Deviations from the original

Two, both deliberate, both recorded where they happen:

1. **Lenis comes from npm**, not the unpkg CDN — `CLAUDE.md` asks for this.
   Same version (1.1.13), loaded by dynamic import, so it is still a separate
   chunk that only a fine pointer ever fetches. See `src/scripts/core/scroll.js`.
2. **The grain texture's `url()` is absolute.** The original stylesheet lives at
   `assets/css/site.css`, so `url(../brand/grain.png)` resolved; the partials and
   the built stylesheet do not live there. See `tools/verify-css.mjs`.

## State of the rebuild

Measured against the original running side by side (`docs/TESTING.md`):

- **Visual diff: 65 of 65 pass.** 13 pages × 5 viewports, every page the same
  height. 57 are 0.00%. The highest is contact at 0.29% — the original scores
  0.25% against *itself* there, because the contact strip is a JS-driven marquee
  the freeze CSS cannot pin, so that is noise, not a difference.
- **Navigation: `ALL NAVIGATION CHECKS PASSED`.**
- **Sweep: no JS errors, no horizontal overflow, no HTTP errors.** The only
  failures are the three missing videos (see
  `public/assets/video/PUT-THE-VIDEOS-HERE.md`), and the original fails on
  exactly the same four page/viewport combinations.

Still to do by hand, because a script cannot judge it: `docs/MOTION.md` and
`docs/BEHAVIOUR.md` line by line against the original, on a phone-size and a
laptop-size window — and a real iPhone for the video path.
