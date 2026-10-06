import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",

      /* The public site is its own project under site/, with its own
         conventions. Its runtime was carried across from the Co-work
         build verbatim — the maths, the thresholds and the timings are
         the originals', and that is the point, so it must not be
         reshaped to satisfy this app's rules. */
      "site/**",

      /* What site/ builds, copied in by site/tools/sync-to-public.mjs.
         Generated output, linted at source or not at all. */
      "public/_astro/**",

      /* The migration package: the untouched Co-work site, its docs and
         its comparison tests. Reference material, gitignored, not ours
         to lint. */
      "asscheduled-claude-code/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
