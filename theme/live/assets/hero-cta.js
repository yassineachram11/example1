/* Sticky hero call to action — mirrors the product page's buy bar: watch the
   real button, and slide a copy up once it leaves the viewport.
   Loaded by sections/hero.liquid. */
(function () {
  'use strict';

  var bar = document.querySelector('[data-hero-cta]');
  var anchor = document.querySelector('[data-hero-anchor]');
  if (!bar || !anchor) return;

  /* Without an observer the bar has no way to know when to appear, so leave
     it hidden rather than pinning it over the page from the first paint. */
  if (!('IntersectionObserver' in window)) return;

  new IntersectionObserver(function (entries) {
    var inView = entries[0].isIntersecting;
    bar.classList.toggle('is-visible', !inView);
    bar.setAttribute('aria-hidden', inView ? 'true' : 'false');
  }, { rootMargin: '0px 0px -48px 0px' }).observe(anchor);
})();
