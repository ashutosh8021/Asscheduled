// Proof that splitting the stylesheet did not change it.
//
// src/styles/site.css imports 36 partials. Concatenated in that import
// order they must equal source-site/assets/css/site.css byte for byte.
// That matters more than it looks: the original deliberately overrides
// earlier rules with later ones (the v4.1 and JOURNEY blocks at the
// end), so a reordered, merged or "tidied" partial changes the design
// without changing any single rule.
//
// Usage: node tools/verify-css.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const stylesDir = path.join(here, '..', 'src', 'styles');
/* A copy of the Co-work stylesheet, kept in the repo on purpose: this
   check is the guarantee that splitting it did not change the design, and
   it has to work on a clean clone without the migration package. */
const original = path.join(here, 'reference', 'site.css');

const index = fs.readFileSync(path.join(stylesDir, 'site.css'), 'utf8');
const names = [...index.matchAll(/@import\s+"\.\/([^"]+)"/g)].map((m) => m[1]);

if (names.length === 0) {
  console.error('FAIL: site.css imports nothing');
  process.exit(1);
}

// The one deviation, and the only one allowed.
//
// The original stylesheet sits at assets/css/site.css, so url(../brand/
// grain.png) resolves to assets/brand/grain.png. The partials live in
// src/ and the built stylesheet lands in _astro/, so that relative path
// resolves to nothing in either place and the grain overlay 404s. The
// path is absolute here instead. Applying it to the ORIGINAL before
// comparing means this file still catches every other change.
const DEVIATIONS = [
  ['url(../brand/grain.png)', 'url(/assets/brand/grain.png)'],
];

const joined = names
  .map((n) => fs.readFileSync(path.join(stylesDir, n), 'utf8'))
  .join('\n');

let want = fs.readFileSync(original, 'utf8');
for (const [from, to] of DEVIATIONS) {
  if (!want.includes(from)) {
    console.error(`FAIL: the original no longer contains ${from} — the deviation list is stale`);
    process.exit(1);
  }
  want = want.split(from).join(to);
}

if (joined === want) {
  console.log(`CSS OK — ${names.length} partials reassemble to the original, with ${DEVIATIONS.length} documented deviation(s)`);
  process.exit(0);
}

// Say where it first diverges, which is the only useful thing to know.
const a = joined.split('\n');
const b = want.split('\n');
let i = 0;
while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
console.error('FAIL: partials no longer reassemble to the original');
console.error(`  first difference at line ${i + 1}`);
console.error(`  partials : ${JSON.stringify(a[i] ?? '<end of file>')}`);
console.error(`  original : ${JSON.stringify(b[i] ?? '<end of file>')}`);
console.error(`  lines: partials ${a.length}, original ${b.length}`);
process.exit(1);
