/* Pilo Direct — one file, no dependencies.
   Reveal, drawers, AJAX cart, pack picker, sticky buy bar, quantity. */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function money(cents) {
    var fmt = (window.PiloTheme && window.PiloTheme.moneyFormat) || '${{amount}}';
    var v = (cents / 100).toFixed(2).split('.');
    var whole = v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fmt
      .replace(/\{\{\s*amount\s*\}\}/, whole + '.' + v[1])
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, whole)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, v[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + v[1])
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, v[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  }

  function t(key, fallback) {
    var s = (window.PiloTheme && window.PiloTheme.strings) || {};
    return s[key] || fallback;
  }

  /* ---------------------------------------------------------------- reveal */
  function initReveal() {
    var items = $$('.rise');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------- drawers */
  var openDrawer = null;

  function shut() {
    if (!openDrawer) return;
    openDrawer.classList.remove('is-on');
    openDrawer.setAttribute('aria-hidden', 'true');
    var scrim = $('[data-scrim]');
    if (scrim) { scrim.classList.remove('is-on'); scrim.hidden = true; }
    document.body.style.overflow = '';
    openDrawer = null;
  }

  function show(id) {
    var el = document.getElementById(id);
    if (!el) return;
    shut();
    el.classList.add('is-on');
    el.setAttribute('aria-hidden', 'false');
    var scrim = $('[data-scrim]');
    if (scrim) { scrim.hidden = false; requestAnimationFrame(function () { scrim.classList.add('is-on'); }); }
    document.body.style.overflow = 'hidden';
    openDrawer = el;
    var focusable = el.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
  }

  function initDrawers() {
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-open]');
      if (opener) { e.preventDefault(); show(opener.getAttribute('data-open')); return; }
      if (e.target.closest('[data-close]') || e.target.closest('[data-scrim]')) { shut(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  }

  /* ------------------------------------------------------------------ cart */
  var Cart = {
    add: function (formData, button) {
      var label = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = '…'; }
      return fetch('/cart/add.js', { method: 'POST', body: formData, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (d) { return r.ok ? d : Promise.reject(d); }); })
        .then(function () { return Cart.refresh(); })
        .then(function () { show('cart-drawer'); })
        .catch(function (err) {
          var msg = (err && err.description) || 'Could not add that to your cart.';
          var box = $('[data-cart-error]');
          if (box) { box.textContent = msg; box.hidden = false; }
          else window.console && console.warn(msg);
        })
        .then(function () { if (button) { button.disabled = false; button.textContent = label; } });
    },

    change: function (line, quantity) {
      return fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity })
      }).then(function () { return Cart.refresh(); });
    },

    /* Re-render the drawer from the server so the markup is never guessed. */
    refresh: function () {
      return fetch('/?section_id=cart-drawer')
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-cart-body]');
          var live = $('[data-cart-body]');
          if (fresh && live) live.innerHTML = fresh.innerHTML;
          return fetch('/cart.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
        })
        .then(function (cart) {
          $$('[data-cart-count]').forEach(function (el) {
            el.textContent = cart.item_count;
            el.hidden = cart.item_count === 0;
          });
          return cart;
        });
    }
  };

  function initCart() {
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-buy-form]');
      if (!form) return;
      e.preventDefault();
      Cart.add(new FormData(form), form.querySelector('[data-add]'));
    });

    document.addEventListener('click', function (e) {
      var step = e.target.closest('[data-line-step]');
      if (step) {
        Cart.change(parseInt(step.getAttribute('data-line'), 10), parseInt(step.getAttribute('data-to'), 10));
        return;
      }
      /* The bar has no form of its own; it submits the real one. */
      var bar = e.target.closest('[data-buybar-add]');
      if (bar) {
        var form = $('[data-buy-form]');
        if (!form) return;
        if (form.requestSubmit) form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
  }

  /* ---------------------------------------------------------- pack picker */
  function initPacks() {
    var picker = $('[data-packs]');
    if (!picker) return;

    picker.addEventListener('change', function (e) {
      var input = e.target.closest('input[type="radio"]');
      if (!input) return;

      $$('.pack', picker).forEach(function (p) { p.classList.toggle('is-on', p.contains(input)); });

      var id = $('[data-variant-id]');
      if (id) id.value = input.value;

      var sellable = input.dataset.available === 'true';
      $$('[data-add], [data-buybar-add]').forEach(function (btn) {
        btn.disabled = !sellable;
        btn.textContent = sellable ? t('add', 'Add to cart') : t('soldOut', 'Sold out');
      });

      /* Prices are pre-formatted by Liquid, so nothing is re-formatted here. */
      $$('[data-now]').forEach(function (el) { el.textContent = input.dataset.price; });
      $$('[data-was]').forEach(function (el) {
        el.textContent = input.dataset.compare || '';
        el.hidden = !input.dataset.compare;
      });
      $$('[data-off]').forEach(function (el) {
        el.textContent = input.dataset.off || '';
        el.hidden = !input.dataset.off;
      });

      var stock = $('[data-stock]');
      if (stock && input.dataset.stockState) {
        stock.className = 'stock stock--' + input.dataset.stockState;
        var txt = stock.querySelector('[data-stock-text]');
        if (txt) txt.textContent = input.dataset.stockText || '';
      }

      if (window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', input.value);
        window.history.replaceState({}, '', url.toString());
      }
    });
  }

  /* -------------------------------------------------------- sticky buy bar */
  function initBuyBar() {
    var bar = $('[data-buybar]');
    var anchor = $('[data-buy-anchor]');
    if (!bar || !anchor) return;

    /* The bar appears only once the real button has scrolled off the top. A
       button still below the fold is on its way down, so a bar for it is just
       clutter over the page.

       This reads the position on scroll rather than observing the button,
       because a jump — an anchor link, a restored scroll position, the back
       button — can take the button from below the fold to above it without it
       ever crossing the viewport, and an IntersectionObserver never fires for
       that. */
    var queued = false;

    function sync() {
      queued = false;
      var past = anchor.getBoundingClientRect().bottom < 0;
      bar.classList.toggle('is-on', past);
      bar.setAttribute('aria-hidden', past ? 'false' : 'true');
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(sync);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    sync();
  }

  /* ------------------------------------------------------------- quantity */
  function initQty() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-qty]');
      if (!b) return;
      var input = b.parentNode.querySelector('input');
      if (!input) return;
      var next = (parseInt(input.value, 10) || 1) + (b.getAttribute('data-qty') === 'up' ? 1 : -1);
      input.value = Math.max(parseInt(input.min, 10) || 1, next);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* --------------------------------------------------------------- gallery */
  function initGallery() {
    document.addEventListener('click', function (e) {
      var thumb = e.target.closest('[data-thumb]');
      if (!thumb) return;
      var main = $('[data-main-image]');
      var img = thumb.querySelector('img');
      if (!main || !img) return;
      main.src = img.getAttribute('data-full');
      main.alt = img.alt;
      $$('[data-thumb]').forEach(function (el) { el.classList.toggle('is-on', el === thumb); });
    });
  }

  function boot() {
    initReveal(); initDrawers(); initCart(); initPacks();
    initBuyBar(); initQty(); initGallery();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
