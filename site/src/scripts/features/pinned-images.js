/* OURS, not the Co-work original.

   The photographs in the pinned horizontal section never appeared. They
   were not hidden and they were not missing — the browser simply never
   fetched them. Measured on the live page: four of the six were on
   screen with opacity 1, complete=false, naturalWidth=0.

   The cause is loading="lazy" inside a track that moves by transform.
   A browser decides how far an image is from the viewport using its
   LAYOUT position, and in layout these cards sit thousands of pixels to
   the right inside a very wide track. The transform slides them into
   view as you scroll; the lazy-load heuristic never notices, so the
   fetch is deferred for ever. The original Co-work build has the same
   attribute and the same bug — this is inherited, not introduced.

   The fix is not to drop lazy loading, which would pull about 1.8MB
   into the initial load of a page that is already heavy. It is to
   decide for ourselves when these are close enough: watch the section,
   and the moment it is within a screen of the viewport, flip its images
   to eager so the browser fetches them. They are then ready by the time
   the track starts moving, and they cost nothing until you approach.

   Scoped to [data-hs] on purpose. Every other lazy image on the site is
   in normal document flow, where the browser's own heuristic works. */

var sections = Array.prototype.slice.call(document.querySelectorAll('[data-hs]'));

function load(section) {
  Array.prototype.slice.call(section.querySelectorAll('img[loading="lazy"]')).forEach(function (img) {
    /* Setting the property is what starts the fetch; removing the
       attribute alone does not, in some browsers. */
    img.loading = 'eager';
    img.removeAttribute('loading');
  });
}

if (sections.length) {
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          load(e.target);
        });
      },
      /* One full screen of warning, so they are decoded before the
         section pins and the track starts to move. */
      { rootMargin: '100% 0px' }
    );
    sections.forEach(function (s) { io.observe(s); });
  } else {
    sections.forEach(load);
  }
}
