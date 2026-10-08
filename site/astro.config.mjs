import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  /* www, not the apex. The apex 308-redirects to www, and this value is
     what builds every canonical, og:url and og:image. An og:image that
     redirects is an og:image some scrapers drop rather than follow,
     which is how a share card ends up with no photo. Point at the host
     that actually answers. */
  site: 'https://www.asscheduled.com',

  /* `file` gives /somewhere.html, not /somewhere/index.html.

     This is not a preference. The original's page-wipe handler decides
     whether a link is internal by testing the href against
     /\.html(#[\w.~-]*)?$/i (source-site/assets/js/site.js, the page wipe
     block). Serve the site at extensionless URLs and every internal link
     stops matching, so the wipe never plays and every navigation becomes
     a hard jump. Same URLs as the original, same behaviour. */
  build: { format: 'file' },

  /* The assets in public/ are final: already cropped, colour graded and
     encoded, with their checksums recorded in docs/CHECKSUMS.sha256.
     Nothing here may re-encode them. Files in public/ are copied
     verbatim by Astro, which is why they live there rather than in
     src/. */
  image: { service: { entrypoint: 'astro/assets/services/noop' } },

  devToolbar: { enabled: false },

  vite: {
    build: {
      /* Without this, the CSS minifier rewrites every media query into
         Media Queries Level 4 range syntax — `(max-width:767px)` becomes
         `(width<=767px)` — across the WHOLE stylesheet, not just new
         rules.

         That syntax needs Safari 16.4, from March 2023. An older iPhone
         does not merely miss the new syntax, it drops the entire
         at-rule: every responsive rule in the site stops applying,
         including the phone-only home hero composition that
         docs/DECISIONS.md says the owner signed off and must not change.
         CLAUDE.md says Safari first, and this is what that means.

         Safari 15 covers iPhones back to the 6s. The rest are set low
         enough to be irrelevant on any browser that still updates.
         Check after upgrading Astro: `grep -o "@media ([^)]*)" dist/_astro/*.css`
         must show min-width/max-width, never width<= or width>=. */
      cssTarget: ['safari15', 'ios15', 'chrome90', 'firefox90', 'edge90'],
    },
  },
});
