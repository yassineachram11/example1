/* ==========================================================================
   Scroll sequence — scroll-scrubbed image sequence on a canvas.

   Smoothness comes from four things the naive version doesn't do:
     1. Cross-fades adjacent frames instead of snapping to the nearest one,
        so a 28-frame sequence reads as continuous motion.
     2. Damps scroll position toward its target each frame, so trackpad
        momentum and jitter don't chatter the animation.
     3. Renders from a rAF loop gated by IntersectionObserver, rather than
        rendering inside the scroll event.
     4. decode()s every frame before it is eligible to draw, so the main
        thread never stalls mid-scroll on an undecoded JPEG.
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

  function ScrollSequence(root) {
    this.root = root;
    this.track = root.querySelector('[data-sequence-track]');
    this.sticky = root.querySelector('.sequence__sticky');
    this.canvas = root.querySelector('[data-sequence-canvas]');
    this.loader = root.querySelector('[data-sequence-loader]');
    this.readout = root.querySelector('[data-sequence-progress]');
    if (!this.track || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d', { alpha: false });

    var d = root.dataset;
    this.baseUrl = d.baseUrl || '';
    this.suffix = d.suffix || '.jpg';
    this.start = parseInt(d.startFrame, 10) || 1;
    this.end = parseInt(d.endFrame, 10) || 1;
    this.pad = parseInt(d.pad, 10) || 3;
    this.width = parseInt(d.frameWidth, 10) || 0;
    this.ease = clamp(parseFloat(d.smoothing) || 0.12, 0.02, 1);
    this.crossfade = d.crossfade !== 'false';

    this.count = Math.max(1, this.end - this.start + 1);
    this.frames = new Array(this.count);
    this.loaded = 0;
    this.ready = false;
    this.loadingRest = false;

    this.target = 0;
    this.current = 0;
    this.lastDrawn = -1;
    this.running = false;
    this.visible = false;

    this.pinTop = 0;
    this.stickyHeight = 0;

    this.onScroll = this.measure.bind(this);
    this.onResize = this.resize.bind(this);
    this.tick = this.tick.bind(this);

    this.init();
  }

  ScrollSequence.prototype.url = function (index) {
    var n = String(this.start + index);
    while (n.length < this.pad) n = '0' + n;

    var url = this.baseUrl + n + this.suffix;
    if (this.width) url += (url.indexOf('?') === -1 ? '?' : '&') + 'width=' + this.width;
    return url;
  };

  ScrollSequence.prototype.init = function () {
    var self = this;

    // Frame 0 first so something is on screen as soon as possible. The rest
    // of the sequence waits for the section to come within a viewport: this
    // sits well down the page, and fetching every frame on first paint
    // competes with the hero video and the buy box for visitors who never
    // scroll this far.
    this.load(0).then(function () {
      self.resize();
      self.draw();
    }).catch(function () {
      if (self.loader) self.loader.textContent = 'Sequence images could not be loaded.';
    });

    window.addEventListener('resize', this.onResize, { passive: true });

    if (reducedMotion.matches) return; // static first frame, no scrubbing, no download

    window.addEventListener('scroll', this.onScroll, { passive: true });

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        if (self.visible) self.play(); else self.pause();
      }, { rootMargin: '120px 0px' });
      this.observer.observe(this.track);

      // A second, wider observer starts the download a viewport ahead, so the
      // frames are there by the time the sequence is scrubbed without being
      // fetched for someone who leaves before reaching it. Kept separate from
      // the one above so the play/pause threshold is unchanged.
      this.preloader = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        self.preloader.disconnect();
        self.preloader = null;
        self.loadRest();
      }, { rootMargin: '100% 0px' });
      this.preloader.observe(this.track);
    } else {
      this.visible = true;
      this.loadRest();
      this.play();
    }

    this.layout();
    this.measure();
  };

  /**
   * The sticky panel is only as tall as its content, so it is pinned in the
   * middle of the viewport rather than at the top. Recomputed whenever the
   * panel can change height (resize, first frame loaded).
   */
  ScrollSequence.prototype.layout = function () {
    if (!this.sticky || reducedMotion.matches) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;
    var h = this.sticky.offsetHeight;
    var top = Math.max(0, Math.round((vh - h) / 2));

    this.stickyHeight = h;
    if (top !== this.pinTop) {
      this.pinTop = top;
      this.sticky.style.setProperty('--sequence-top', top + 'px');
    }
  };

  ScrollSequence.prototype.load = function (index) {
    var self = this;
    if (this.frames[index]) return Promise.resolve(this.frames[index]);

    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.decoding = 'async';
      img.src = self.url(index);

      var done = function () {
        // decode() keeps the first paint of each frame off the scroll path.
        var finish = function () {
          self.frames[index] = img;
          self.loaded++;
          self.updateLoader();
          resolve(img);
        };
        if (img.decode) img.decode().then(finish).catch(finish);
        else finish();
      };

      if (img.complete && img.naturalWidth) done();
      else {
        img.onload = done;
        img.onerror = reject;
      }
    });
  };

  ScrollSequence.prototype.loadRest = function () {
    var self = this;
    if (this.loadingRest) return;
    this.loadingRest = true;
    var i = 1;

    // Sequential rather than 28 parallel requests: keeps the connection
    // free for anything else the page still needs.
    function next() {
      if (i >= self.count) {
        self.ready = true;
        self.updateLoader();
        return;
      }
      var index = i++;
      self.load(index).then(next).catch(next);
    }
    next();
  };

  ScrollSequence.prototype.updateLoader = function () {
    var pct = Math.round((this.loaded / this.count) * 100);
    if (this.readout) this.readout.textContent = pct;
    if (this.loader && pct >= 100) this.loader.hidden = true;
  };

  ScrollSequence.prototype.resize = function () {
    var frame = this.frames[0];
    if (frame) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = this.canvas.getBoundingClientRect();

      if (rect.width) {
        var w = Math.round(rect.width * dpr);
        var h = Math.round(rect.width * (frame.naturalHeight / frame.naturalWidth) * dpr);

        if (this.canvas.width !== w || this.canvas.height !== h) {
          this.canvas.width = w;
          this.canvas.height = h;
          this.lastDrawn = -1;
        }
        this.draw();
      }
    }

    this.layout();
    this.measure();
  };

  ScrollSequence.prototype.measure = function () {
    var rect = this.track.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;

    // The panel pins once the track's top reaches pinTop, and unpins when the
    // track's bottom reaches the panel's bottom: that span is the scrub range.
    var h = this.stickyHeight || vh;
    var total = rect.height - h;

    this.target = total > 0 ? clamp((this.pinTop - rect.top) / total, 0, 1) : 0;
    if (this.visible) this.play();
  };

  ScrollSequence.prototype.play = function () {
    if (this.running) return;
    this.running = true;
    this.raf = window.requestAnimationFrame(this.tick);
  };

  ScrollSequence.prototype.pause = function () {
    this.running = false;
    if (this.raf) window.cancelAnimationFrame(this.raf);
  };

  ScrollSequence.prototype.tick = function () {
    if (!this.running) return;

    var diff = this.target - this.current;
    this.current += diff * this.ease;

    // Settle exactly, then idle until the next scroll.
    if (Math.abs(diff) < 0.0002) {
      this.current = this.target;
      this.draw();
      this.running = false;
      return;
    }

    this.draw();
    this.raf = window.requestAnimationFrame(this.tick);
  };

  ScrollSequence.prototype.paint = function (img, alpha) {
    var cw = this.canvas.width;
    var ch = this.canvas.height;
    var scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = img.naturalWidth * scale;
    var h = img.naturalHeight * scale;

    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    this.ctx.globalAlpha = 1;
  };

  ScrollSequence.prototype.draw = function () {
    if (!this.canvas.width) return;

    var exact = this.current * (this.count - 1);
    var index = Math.floor(exact);
    var frac = exact - index;

    var base = this.nearest(index);
    if (!base) return;

    // Skip redundant repaints when nothing has moved.
    var key = this.crossfade ? exact.toFixed(3) : String(index);
    if (key === this.lastDrawn) return;
    this.lastDrawn = key;

    this.ctx.fillStyle = this.root.dataset.background || '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.paint(base, 1);

    if (this.crossfade && frac > 0.001) {
      var next = this.frames[index + 1];
      if (next) this.paint(next, frac);
    }
  };

  /** Nearest already-loaded frame, so scrubbing still works mid-download. */
  ScrollSequence.prototype.nearest = function (index) {
    if (this.frames[index]) return this.frames[index];
    for (var d = 1; d < this.count; d++) {
      if (this.frames[index - d]) return this.frames[index - d];
      if (this.frames[index + d]) return this.frames[index + d];
    }
    return null;
  };

  ScrollSequence.prototype.destroy = function () {
    this.pause();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    if (this.observer) this.observer.disconnect();
    if (this.preloader) this.preloader.disconnect();
  };

  var instances = [];

  function initAll(scope) {
    var nodes = (scope || document).querySelectorAll('[data-scroll-sequence]');
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.dataset.sequenceReady) return;
      node.dataset.sequenceReady = 'true';
      instances.push(new ScrollSequence(node));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:unload', function () {
    instances = instances.filter(function (i) {
      if (document.body.contains(i.root)) return true;
      i.destroy();
      return false;
    });
  });
})();
