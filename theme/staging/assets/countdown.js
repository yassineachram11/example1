/* Launch countdown — ticks the announcement bar down to a fixed instant.
   The deadline arrives from Liquid as a Unix timestamp resolved against the
   shop's own timezone, so every visitor counts to the same moment and a reload
   never restarts it. Loaded by sections/header.liquid. */
(function () {
  'use strict';

  var el = document.querySelector('[data-countdown]');
  if (!el) return;

  var deadline = parseInt(el.getAttribute('data-deadline'), 10);
  if (!deadline) return;
  deadline = deadline * 1000;

  var bar = el.closest('.announcement-bar');
  var parts = {};
  ['d', 'h', 'm', 's'].forEach(function (key) {
    parts[key] = el.querySelector('[data-cd="' + key + '"]');
  });

  var timer = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /* Past the deadline the bar either carries the merchant's post-launch line
     or gets out of the way. It never loops back to a fresh countdown. */
  function finish() {
    if (timer) { clearInterval(timer); timer = null; }

    var text = el.getAttribute('data-expired-text');
    if (!text) {
      if (bar) bar.hidden = true;
      return;
    }

    var link = el.querySelector('.countdown__cta');
    el.textContent = '';
    var span = document.createElement('span');
    span.textContent = text;
    el.appendChild(span);
    if (link) {
      el.appendChild(document.createTextNode(' '));
      el.appendChild(link);
    }
  }

  function tick() {
    var left = deadline - Date.now();
    if (left <= 0) { finish(); return; }

    var total = Math.floor(left / 1000);
    var days = Math.floor(total / 86400);

    if (parts.d) {
      parts.d.textContent = String(days);
      // Once it is under a day, the days column is just a zero taking up room.
      if (parts.d.parentNode) parts.d.parentNode.hidden = days === 0;
    }
    if (parts.h) parts.h.textContent = pad(Math.floor((total % 86400) / 3600));
    if (parts.m) parts.m.textContent = pad(Math.floor((total % 3600) / 60));
    if (parts.s) parts.s.textContent = pad(total % 60);
  }

  tick();
  timer = setInterval(tick, 1000);

  /* A tab left open in the background throttles its timers, so catch up on
     the way back rather than letting the clock drift. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });
})();
