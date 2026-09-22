/* Bundle selector — picks a variant directly and keeps the buy form,
   the price block, the gallery and the sticky bar in step.
   Loaded by main-product.liquid. */
(function () {
  'use strict';

  /* Show the picked variant's own image, if it has one. Variants without an
     image leave the gallery alone, so this is inert until images are assigned
     to variants in the admin. */
  function syncGallery(input) {
    var url = input.getAttribute('data-image');
    if (!url) return;

    var gallery = document.querySelector('[data-gallery]');
    var main = gallery && gallery.querySelector('[data-gallery-main]');
    if (!main) return;

    // Prefer pressing the matching thumbnail: that runs the theme's own
    // preload-and-fade and keeps the active thumb in step, rather than
    // duplicating it here.
    var thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
    for (var i = 0; i < thumbs.length; i++) {
      var img = thumbs[i].querySelector('img');
      if (img && img.getAttribute('data-full') === url) {
        if (!thumbs[i].classList.contains('is-active')) thumbs[i].click();
        return;
      }
    }

    // The variant image is not among the thumbnails, so swap it directly.
    if (main.getAttribute('src') !== url) {
      main.setAttribute('src', url);
      main.removeAttribute('srcset');
      var alt = input.getAttribute('data-image-alt');
      if (alt) main.setAttribute('alt', alt);
    }
  }

  document.addEventListener('change', function (event) {
    var input = event.target.closest('[data-bundle-picker] input[type="radio"]');
    if (!input) return;

    var picker = input.closest('[data-bundle-picker]');

    Array.prototype.forEach.call(picker.querySelectorAll('.bundle__option'), function (option) {
      option.classList.toggle('is-selected', option.contains(input));
    });

    // The form is the single source of truth for what gets added to cart.
    var form = document.querySelector('[data-product-form]');
    if (form) {
      var id = form.querySelector('[data-variant-id]');
      if (id) id.value = input.value;

      var button = form.querySelector('[data-add-to-cart]');
      if (button) {
        if (input.dataset.available === 'true') button.removeAttribute('disabled');
        else button.setAttribute('disabled', 'disabled');
      }
    }

    // Prices are pre-formatted by Liquid, so no money formatting here.
    var price = document.querySelector('[data-product-price]');
    if (price) {
      var html = '<span class="price__regular">' + input.dataset.price + '</span>';
      if (input.dataset.compare) html += '<s class="price__compare">' + input.dataset.compare + '</s>';
      price.innerHTML = html;
      price.classList.toggle('price--on-sale', !!input.dataset.compare);
    }

    var bar = document.querySelector('[data-buy-bar-price]');
    if (bar) bar.textContent = input.dataset.price;

    syncGallery(input);

    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', input.value);
      window.history.replaceState({}, '', url.toString());
    }
  });

  /* Landing straight on ?variant=<a multi-pack> should show that pack's image
     too, not just after a click. */
  function syncOnLoad() {
    var checked = document.querySelector('[data-bundle-picker] input[type="radio"]:checked');
    if (checked) syncGallery(checked);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncOnLoad);
  } else {
    syncOnLoad();
  }
})();
