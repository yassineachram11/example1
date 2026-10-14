/* Stock level — keeps the in stock / low stock line in step with the pack or
   variant the shopper has picked. Every string is pre-rendered by Liquid in
   snippets/stock-level.liquid, so this only ever looks one up.
   Loaded by main-product.liquid. */
(function () {
  'use strict';

  var data = null;

  function lookup() {
    if (data) return data;
    var script = document.querySelector('[data-stock-json]');
    if (!script) return null;
    try {
      data = JSON.parse(script.textContent);
    } catch (error) {
      return null;
    }
    return data;
  }

  function sync() {
    var node = document.querySelector('[data-stock-level]');
    var map = lookup();
    if (!node || !map) return;

    var input = document.querySelector('[data-product-form] [data-variant-id]');
    if (!input) return;

    var entry = map[String(input.value)];
    if (!entry) {
      // A variant combination that does not exist — say nothing rather than
      // leave the previous variant's stock line standing.
      node.hidden = true;
      return;
    }

    node.hidden = false;
    node.className = 'stock stock--' + entry.state;

    var text = node.querySelector('[data-stock-text]');
    if (text) text.textContent = entry.text;
  }

  /* The bundle picker and the theme's own variant picker both write the hidden
     variant input from their own change handlers. Deferring by a tick means
     this reads the value after whichever one ran, without either of them
     needing to know this exists. */
  document.addEventListener('change', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (!target.closest('[data-bundle-picker], [data-variant-picker]')) return;
    setTimeout(sync, 0);
  });
})();
