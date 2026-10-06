// Put the built site where Next.js will serve it.
//
// The public site and the application share one deployment: Next owns
// /admin, /partner, /crew and /api, and everything a visitor sees is this
// Astro build, served as static files out of Next's public/ folder. One
// repo, one build, one domain, and the parts that take money and hold
// student data are not touched by a redesign.
//
// This copies site/dist into ../public. It only ever writes the paths the
// build produces, and it clears those paths first so a page or chunk
// deleted here cannot linger in public/ as a stale file. It does not
// touch anything else in public/ — img/, video/, pay/, brochure/ and the
// rest belong to the Next app.
//
// Usage: node tools/sync-to-public.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, '..', 'dist');
const pub = path.join(here, '..', '..', 'public');

if (!fs.existsSync(dist)) {
  console.error('FAIL: no dist/ — run `npm run build` in site/ first');
  process.exit(1);
}

/* Directories this build owns inside public/. Cleared before the copy,
   because a leftover page from an older build is worse than a missing
   one: it still serves, and it still looks like the site. */
const OWNED_DIRS = ['assets', '_astro'];

for (const d of OWNED_DIRS) {
  fs.rmSync(path.join(pub, d), { recursive: true, force: true });
}
/* Plus every .html at the root of public/, which is this build's pages
   and nothing else — the Next app's own routes are React, not files. */
for (const f of fs.readdirSync(pub)) {
  if (f.endsWith('.html')) fs.rmSync(path.join(pub, f));
}

let files = 0;
let bytes = 0;
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copy(a, b);
    else {
      fs.copyFileSync(a, b);
      files += 1;
      bytes += fs.statSync(a).size;
    }
  }
}
copy(dist, pub);

console.log(`synced ${files} files (${(bytes / 1024 / 1024).toFixed(1)} MB) from site/dist into public/`);
