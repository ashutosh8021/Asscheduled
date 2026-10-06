import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://asscheduled.com',

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
});
