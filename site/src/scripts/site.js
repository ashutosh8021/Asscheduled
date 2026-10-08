/* The site runtime.

   The original was one IIFE in source-site/assets/js/site.js that ran its
   feature blocks top to bottom. Each block is now its own module, and this
   file imports them IN THAT SAME ORDER.

   The order is not cosmetic. Modules register callbacks with onFrame and the
   frame loop calls them in registration order, so reordering these imports
   reorders the work inside every animation frame. A module that another one
   imports is evaluated before it either way, which matches the original,
   where a later block could only ever use what an earlier block had already
   defined (or a hoisted function). */

import './config.js';
import './core/env.js';
import './core/toast.js';
import './core/wipe.js';
import './core/scroll.js';
import './core/landing.js';
import './core/frame.js';
import './features/menu.js';
import './motion/parallax.js';
import './motion/objects.js';
import './motion/reveal.js';
import './motion/rotating-word.js';
import './motion/marquees.js';
import './motion/timecode.js';
import './motion/cursor.js';
import './features/departures.js';
import './features/side-effects.js';
import './motion/pinned-horizontal.js';
import './features/transcripts.js';
import './features/map.js';
import './features/accordions-tabs.js';
import './features/plan-picker.js';
import './features/coupons.js';
import './features/validation.js';
import './features/newsletter.js';
import './features/collab.js';
import './features/booking.js';
import './motion/progress.js';
import './motion/scrambled-labels.js';
import './motion/hero.js';
import './motion/touch-hover.js';
import './features/footage.js';
import './motion/count-up.js';

/* Ours, not the original. Last, because it only reacts to what the
   carried-across modules have already built. */
import './features/pinned-images.js';
