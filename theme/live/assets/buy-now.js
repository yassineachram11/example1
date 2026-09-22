/* Buy now — add the current selection to the cart, then go to checkout.

   Shopify's dynamic checkout button cannot be relabelled or recoloured, so
   this is the button to use when those have to match the brand. */
(function () {
  'use strict';

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-buy-now]');
    if (!button) return;

    var form = button.closest('form') || document.querySelector('[data-product-form]');
    if (!form) return;

    event.preventDefault();
    if (button.getAttribute('aria-disabled') === 'true') return;

    var original = button.innerHTML;
    button.setAttribute('aria-disabled', 'true');
    button.innerHTML = '<span class="loading-spinner"></span>';

    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok) throw new Error(body.description || body.message || 'Add to cart failed');
          return body;
        });
      })
      .then(function () {
        window.location.href = root + 'checkout';
      })
      .catch(function (error) {
        button.removeAttribute('aria-disabled');
        button.innerHTML = original;
        window.alert(error.message);
      });
  });
})();
