/*
 * Collective Memory: scroll-driven assembly.
 *
 * State is a pure function of scroll position: progress → number of revealed
 * steps → which cells are on. Nothing is queued or timed, so pausing, reversing
 * and fast seeking all land on the same composition for the same position.
 *
 * Each cell is a window onto its photograph: every cell of a multi-cell image
 * shares one background size and an offset, so the crop is continuous across
 * the block and the image is never repeated per cell.
 */
(function () {
  var J = window.Journey;
  var C = window.MEMORY_CONFIG;
  var M = window.MANIFEST || {};
  var panel = document.getElementById("collective-memory");
  if (!J || !C || !panel) return;

  var grid = panel.querySelector(".cm-grid");
  var title = panel.querySelector(".cm-title");
  var question = panel.querySelector(".cm-question");
  var flyer = document.querySelector(".cm-flyer");
  var flyTitle = flyer.querySelector(".cm-flyer-title");
  var phrase = document.querySelector(".cm-phrase");
  var bioCopy = document.querySelector(".bio-copy");

  var variant = new URLSearchParams(location.search).get("memory") || "mosaic";
  var model = null;
  var revealed = -1;
  var primed = false;
  var hand = null; // shared-element geometry

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // Landscape screens get the full mosaic, even when scrolling vertically
  // (reduced motion, touch laptops); phones and portrait tablets the short one.
  function kindFor(mode, vw, vh) {
    return mode === "h" || (vw >= 900 && vw / vh > 1.15) ? "desktop" : "mobile";
  }
  function pick(kind) {
    var set = C[kind];
    return set[variant] || set[Object.keys(set)[0]];
  }

  J.budget = function (mode, vw, vh) {
    var c = pick(kindFor(mode, vw, vh));
    return { lead: c.leadVh, assembly: c.assemblyVh, hold: c.holdVh };
  };

  /* ---------- Build the grid from the character map ---------- */
  function grow(b, r, c) {
    if (!b) return { r0: r, c0: c, r1: r, c1: c };
    b.r0 = Math.min(b.r0, r); b.c0 = Math.min(b.c0, c);
    b.r1 = Math.max(b.r1, r); b.c1 = Math.max(b.c1, c);
    return b;
  }

  // Photographs in the band behind the title and question are darkened so the
  // question reads; the fragments inside the letters stay at full brightness.
  function dimmed(cfg, t) {
    return !!cfg.dim && t.box.r0 <= cfg.dim[1] && t.box.r1 >= cfg.dim[0];
  }

  function build(kind) {
    var cfg = pick(kind);
    var rows = cfg.map.length, cols = cfg.map[0].length;
    var tiles = {};
    cfg.map.forEach(function (line, r) {
      for (var c = 0; c < cols; c++) {
        var ch = line.charAt(c);
        if (ch === "." || ch === " " || !ch) continue;
        var t = tiles[ch] || (tiles[ch] = { ch: ch, cells: [], box: null });
        t.cells.push({ r: r, c: c });
        t.box = grow(t.box, r, c);
      }
    });

    var o = cfg.origin || [rows / 2, cols / 2];
    function dist(cell) { var dr = cell.r - o[0], dc = (cell.c - o[1]) * 0.75; return Math.sqrt(dr * dr + dc * dc); }

    var list = Object.keys(tiles).map(function (k) { return tiles[k]; }).filter(function (t) {
      if (cfg.tiles[t.ch]) return true;
      console.warn("Collective Memory: no image for tile '" + t.ch + "'");
      return false;
    });
    list.forEach(function (t) { t.d = Math.min.apply(null, t.cells.map(dist)); });
    if (cfg.order) list.sort(function (a, b) { return cfg.order.indexOf(a.ch) - cfg.order.indexOf(b.ch); });
    else list.sort(function (a, b) { return a.d - b.d || (a.ch < b.ch ? -1 : 1); });

    grid.textContent = "";
    var steps = [];
    list.forEach(function (t) {
      var def = cfg.tiles[t.ch];
      t.src = "/assets/img/memory/" + def[0] + ".webp";
      t.fx = def[1]; t.fy = def[2];
      t.dims = M["memory/" + def[0] + ".webp"] || [1000, 1000];
      var per = def[3] || (t.cells.length <= 3 ? t.cells.length : 2);
      t.cells.sort(function (a, b) { return dist(a) - dist(b) || a.r - b.r || a.c - b.c; });
      for (var i = 0; i < t.cells.length; i += per) steps.push(t.cells.slice(i, i + per));
      t.cells.forEach(function (cell) {
        cell.el = document.createElement("div");
        cell.el.className = "cm-cell" + (dimmed(cfg, t) ? " is-dim" : "");
        grid.appendChild(cell.el);
      });
    });

    title.classList.toggle("is-one-line", cfg.titleLines === 1);
    flyTitle.classList.toggle("is-one-line", cfg.titleLines === 1);
    model = { kind: kind, cfg: cfg, rows: rows, cols: cols, tiles: list, steps: steps };
    revealed = -1;
    primed = false;
  }

  // Images load once the visitor approaches the scene (or the browser is idle).
  function prime() {
    if (primed || !model) return;
    primed = true;
    var m = model, waiting = m.tiles.length;
    m.tiles.forEach(function (t) {
      t.cells.forEach(function (cell) { cell.el.style.backgroundImage = "url(" + t.src + ")"; });
      t.img = new Image();
      t.img.onload = t.img.onerror = function () { if (--waiting === 0 && model === m) { m.loaded = true; fillTitle(); } };
      t.img.src = t.src;
    });
  }

  // The title's letters are filled with the finished mosaic itself (a composite of
  // every photograph, at its place in the grid), so as the white fill fades, the
  // letters show fragments of the photography before the photographs arrive.
  // The flying copy of the title carries the same fill, so it can fill in flight.
  var fillUrl = null;
  function fillTitle() {
    var m = model, geo = m && m.geo;
    if (!geo || !m.loaded) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cv = document.createElement("canvas");
    cv.width = Math.round(geo.w * dpr); cv.height = Math.round(geo.h * dpr);
    var c2 = cv.getContext("2d");
    c2.scale(dpr, dpr);
    m.tiles.forEach(function (t) {
      if (!t.img || !t.img.naturalWidth) return;
      var bx = t.box.c0 * geo.cs + geo.g / 2, by = t.box.r0 * geo.cs + geo.g / 2;
      var bw = (t.box.c1 - t.box.c0 + 1) * geo.cs - geo.g, bh = (t.box.r1 - t.box.r0 + 1) * geo.cs - geo.g;
      var sc = Math.max(bw / t.img.naturalWidth, bh / t.img.naturalHeight);
      var sw = t.img.naturalWidth * sc, sh = t.img.naturalHeight * sc;
      c2.save();
      c2.beginPath(); c2.rect(bx, by, bw, bh); c2.clip();
      c2.drawImage(t.img, bx + (bw - sw) * t.fx, by + (bh - sh) * t.fy, sw, sh);
      c2.restore();
    });
    cv.toBlob(function (blob) {
      if (!blob || model !== m) return;
      if (fillUrl) URL.revokeObjectURL(fillUrl);
      fillUrl = URL.createObjectURL(blob);
      [title, flyTitle].forEach(function (el) {
        var ts = el.style;
        ts.backgroundImage = "url(" + fillUrl + ")";
        ts.backgroundSize = geo.w + "px " + geo.h + "px";
        ts.backgroundPosition = -geo.tx + "px " + -geo.ty + "px";
        el.classList.add("has-fill");
      });
    }, "image/jpeg", 0.85);
  }
  window.addEventListener("load", function () { setTimeout(prime, 2500); });

  /* ---------- Geometry ---------- */
  function cssPx(name, fallback) {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
  }

  function place(L) {
    var bar = cssPx("--bar", 64), tick = cssPx("--tick", 0);
    var vw = L.vw, vh = L.vh;
    var availH = vh - bar - tick - (L.mode === "h" ? 12 : 8);
    var cs = Math.floor(Math.min(vw / model.cols, availH / model.rows));
    var ox = Math.round((vw - cs * model.cols) / 2);
    var oy = Math.round(bar + (availH - cs * model.rows) / 2);
    var g = Math.max(2, Math.round(cs * 0.05)); // black gutter between photographs only

    model.tiles.forEach(function (t) {
      var bx = ox + t.box.c0 * cs + g / 2, by = oy + t.box.r0 * cs + g / 2;
      var bw = (t.box.c1 - t.box.c0 + 1) * cs - g, bh = (t.box.r1 - t.box.r0 + 1) * cs - g;
      var s = Math.max(bw / t.dims[0], bh / t.dims[1]);
      var sw = t.dims[0] * s, sh = t.dims[1] * s;
      var ix = bx + (bw - sw) * t.fx, iy = by + (bh - sh) * t.fy;
      t.cells.forEach(function (cell) {
        var l = Math.max(ox + cell.c * cs, bx), tp = Math.max(oy + cell.r * cs, by);
        var rr = Math.min(ox + (cell.c + 1) * cs, bx + bw), bb = Math.min(oy + (cell.r + 1) * cs, by + bh);
        var st = cell.el.style;
        st.left = l + "px"; st.top = tp + "px";
        st.width = (rr - l) + "px"; st.height = (bb - tp) + "px";
        st.backgroundSize = sw + "px " + sh + "px";
        st.backgroundPosition = (ix - l) + "px " + (iy - tp) + "px";
      });
    });

    // Fit the title into its box.
    var tb = model.cfg.title;
    var tx = ox + tb[1] * cs, ty = oy + tb[0] * cs;
    var tw = (tb[3] - tb[1] + 1) * cs, th = (tb[2] - tb[0] + 1) * cs;
    var ts = title.style;
    ts.left = tx + "px"; ts.top = ty + "px"; ts.width = tw + "px"; ts.height = th + "px";
    ts.fontSize = "100px";
    var spans = Array.prototype.slice.call(title.children);
    var lines = model.cfg.titleLines === 1 ? 1 : spans.length;
    var textW = lines === 1 ? title.scrollWidth : Math.max.apply(null, spans.map(function (s) { return s.offsetWidth; }));
    if (lines === 1) {
      // scrollWidth includes the box; measure the run of text instead.
      textW = spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left;
    }
    var fs = Math.min(100 * (tw * 0.92) / textW, (th * 0.82) / (0.95 * lines));
    ts.fontSize = fs + "px";
    var stroke = Math.max(2, fs * 0.022).toFixed(2) + "px";
    ts.setProperty("--cm-stroke", stroke);
    flyTitle.style.setProperty("--cm-stroke", stroke);
    model.geo = { cs: cs, g: g, w: cs * model.cols, h: cs * model.rows, tx: tx - ox, ty: ty - oy };
    fillTitle();
    if (question) placeQuestion(tx, ty, spans, lines, cs);

    // Shared element: the title, in its own typeface throughout, starts exactly
    // over the bold phrase in the bio and grows into place.
    if (L.mode === "h" && phrase) {
      flyer.style.fontSize = fs + "px";
      flyTitle.style.width = tw + "px";
      flyTitle.style.height = th + "px";
      var pr = phrase.getBoundingClientRect();
      var runW = spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left;
      var s0 = pr.width / runW;
      hand = {
        // track coordinates (measured with the track at x = 0)
        px: pr.left + pr.width / 2 - (tw / 2) * s0, py: pr.top + pr.height / 2 - (th / 2) * s0,
        s0: s0, tx: L.memLeft + tx, ty: ty,
      };
    } else {
      hand = null;
    }
  }

  // The question sits under the title and runs the width of its letters, pinched
  // in slightly at each end, since evenly spaced small caps read wider than the
  // heavy title at the same measured width: letter-spaced on one line where it
  // fits, otherwise on two balanced lines, each letter-spaced to the same width.
  var questionText = question ? question.textContent : "";
  function placeQuestion(tx, ty, spans, lines, cs) {
    var l = Math.min.apply(null, spans.map(function (s) { return s.offsetLeft; }));
    var r = Math.max.apply(null, spans.map(function (s) { return s.offsetLeft + s.offsetWidth; }));
    var pinch = (r - l) * 0.04;
    l += pinch; r -= pinch;
    var w = r - l, last = spans[spans.length - 1];
    // Caps sit above the line box's descender space; tuck the gap up by that much.
    var fs = parseFloat(title.style.fontSize);
    var qs = question.style;
    qs.left = tx + l + "px";
    // Dropped about a line below the title, so it sits midway between the title and the band's foot.
    var qfs = parseFloat(getComputedStyle(question).fontSize);
    qs.top = ty + last.offsetTop + last.offsetHeight - fs * 0.08 + cs * 0.22 + qfs * 1.42 * 0.9 + "px";
    qs.width = "auto";
    question.textContent = questionText;
    var parts = [questionText];
    if (question.offsetWidth > w) {
      // Break at the space that best balances the two lines.
      var mid = questionText.length / 2, at = -1;
      questionText.replace(/ /g, function (m, i) { if (at < 0 || Math.abs(i - mid) < Math.abs(at - mid)) at = i; });
      parts = [questionText.slice(0, at), questionText.slice(at + 1)];
    }
    question.textContent = "";
    parts.forEach(function (text, i) {
      var line = document.createElement("span");
      line.className = "cm-question-line";
      line.textContent = text + (i < parts.length - 1 ? " " : "");
      question.appendChild(line);
      var natural = line.offsetWidth, n = text.length;
      line.style.letterSpacing = (Math.max(0, w - natural) / (n - 1)).toFixed(3) + "px";
    });
    qs.width = w + "px";
  }

  /* ---------- Per-frame update ---------- */
  function apply(n) {
    var from = Math.max(0, Math.min(revealed, n)), to = Math.max(revealed, n);
    if (revealed < 0) { from = 0; to = model.steps.length; }
    for (var i = from; i < to; i++) {
      var on = i < n;
      model.steps[i].forEach(function (cell) { cell.el.classList.toggle("is-on", on); });
    }
    revealed = n;
  }

  function handOff(st) {
    if (!hand || st.mode !== "h") {
      flyer.classList.remove("is-active");
      title.classList.remove("is-hidden");
      if (phrase) phrase.classList.remove("is-lifted");
      if (bioCopy) bioCopy.style.opacity = "";
      return;
    }
    var t = st.t;
    var active = t > 0 && t < 1;
    flyer.classList.toggle("is-active", active);
    title.classList.toggle("is-hidden", t < 1);
    phrase.classList.toggle("is-lifted", t > 0);
    // The paragraph stays put and readable; it recedes as the phrase lifts off it.
    bioCopy.style.opacity = t > 0 ? 1 - 0.78 * clamp(t / 0.22, 0, 1) : "";
    if (!active) return;
    var e = ease(t);
    var s = hand.s0 + (1 - hand.s0) * e;
    var x = (hand.px - st.x) + ((hand.tx - st.x) - (hand.px - st.x)) * e;
    var y = hand.py + (hand.ty - hand.py) * e;
    flyer.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + s + ")";
    flyer.style.opacity = clamp(t / 0.06, 0, 1);
  }

  // Solid white → photographs inside a white outline. It completes before the
  // first photograph arrives: during the flight from the bio on desktop, during
  // the lead-in otherwise. The outline is a constant text stroke and the
  // photographic fill a clipped background (CSS, fillTitle).
  function tint(u) {
    var k = 1 - clamp(u, 0, 1);
    k = k * k * (3 - 2 * k);
    var c = "rgba(248,247,241," + k.toFixed(3) + ")";
    title.style.color = c;
    flyTitle.style.color = c;
  }

  J.onLayout(function (L) {
    var kind = kindFor(L.mode, L.vw, L.vh);
    if (!model || model.kind !== kind) build(kind);
    place(L);
    revealed = -1;
  });

  J.on(function (st, L) {
    if (!model) return;
    handOff(st);

    // Load imagery as the visitor approaches.
    if (!primed && (st.mode === "h" ? st.x > L.vw * 0.15 : panel.getBoundingClientRect().top < L.vh * 2.5)) prime();
    if (!primed && st.mp > 0) prime();

    // The sound control only appears while this scene is on screen.
    var inScene = st.mode === "h"
      ? Math.abs(st.x - L.memLeft) < L.vw * 0.5
      : (function (r) { return r.top < L.vh * 0.5 && r.bottom > L.vh * 0.5; })(panel.getBoundingClientRect());
    Feedback.show("memory", inScene);

    var c = model.cfg, total = c.leadVh + c.assemblyVh + c.holdVh;
    var s = J.reducedMotion() ? 1 : clamp((st.mp * total - c.leadVh) / c.assemblyVh, 0, 1);
    var flying = hand && st.mode === "h";
    tint(J.reducedMotion() ? 1 : flying ? (st.t - 0.3) / 0.6 : (st.mp * total) / (c.leadVh * 0.85));
    // The question fades in from 30% to 60% of the assembly, half there at 45%.
    if (question) {
      var q = clamp((s - 0.3) / 0.3, 0, 1);
      question.style.opacity = (q * q * (3 - 2 * q)).toFixed(3);
    }
    var n = Math.floor(s * model.steps.length + 1e-6);
    if (n === revealed) return;

    var jump = st.silent || revealed < 0 || Math.abs(n - revealed) > 6;
    if (jump) grid.classList.add("cm-instant");
    apply(n);
    if (jump) requestAnimationFrame(function () { requestAnimationFrame(function () { grid.classList.remove("cm-instant"); }); });
    else if (st.mp > 0 && st.mp < 1) Feedback.tick(n);
  });

  /* ==========================================================================
     Sound: quiet clicks, on by default, on every device.
     Every browser holds a page's audio until the visitor's first click, tap or
     key press anywhere on it (scrolling does not count), so the clicks begin
     from then. Until that happens the control reads "Unmute", and one click
     on it starts the sound; it only ever reads Mute or Unmute. It appears
     only in the scenes that make sound: Collective Memory and Kind Words.
     Muting lasts for the visit.
     ========================================================================== */
  var Feedback = window.Feedback = (function () {
    var KEY = "sound-muted";
    var btn = document.querySelector(".feedback-toggle");
    // Phones used to get a short vibration instead of sound; they now get the clicks too,
    // a little louder, since phone speakers are small.
    var haptic = false;
    var phone = matchMedia("(pointer: coarse)").matches;
    // iPhones silence web audio when the ring/silent switch is on silent unless the page
    // declares its sound as media playback (as video sites do). Safari 17+ supports this.
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    var muted = false;
    try { muted = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
    var ctx = null, buf = null;
    var lastT = 0, lastN = -1, prevN = -1;

    function ensure() {
      if (ctx || haptic) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      ctx.onstatechange = render;
      // 20 ms of filtered noise with a fast decay: a dry, tactile tick.
      var len = Math.round(ctx.sampleRate * 0.02);
      buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.0022));
    }

    // Called from genuine user gestures (pointer, key, touch), which is what
    // browsers require before audio may start.
    function unlock() {
      if (muted || haptic || document.hidden) return;
      ensure();
      if (!ctx || ctx.state === "running") return;
      ctx.resume();
      // Some mobile browsers also need a sound started inside the gesture: a silent one.
      var s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      s.connect(ctx.destination);
      s.start();
    }

    // True until the browser lets the page make sound.
    function blocked() {
      if (haptic) return !!navigator.userActivation && !navigator.userActivation.hasBeenActive;
      return !ctx || ctx.state !== "running";
    }

    function render() {
      if (!btn) return;
      var waiting = !muted && blocked();
      btn.textContent = muted || waiting ? "Unmute" : "Mute"; // one click on Unmute also starts the sound
      btn.setAttribute("aria-pressed", String(muted || waiting));
      btn.setAttribute("aria-label", muted ? "Unmute sound" : waiting ? "Turn sound on" : "Mute sound");
    }

    function play() {
      if (muted || document.hidden) return;
      if (haptic) { try { navigator.vibrate(7); } catch (e) {} return; }
      if (ctx && ctx.state === "running") sound();
    }

    // A click on a control is itself permission to start audio, so wait for it to start.
    function click() {
      if (muted || document.hidden) return;
      if (haptic) { try { navigator.vibrate(7); } catch (e) {} return; }
      unlock();
      if (ctx) ctx.state === "running" ? sound() : ctx.resume().then(sound, function () {});
    }

    function sound() {
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 2300 + Math.random() * 600;
      f.Q.value = 1.1;
      var g = ctx.createGain();
      g.gain.value = phone ? 0.35 : 0.16;
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start();
    }

    // One tick per assembly step, rate-limited so fast scrolling never builds a backlog.
    function tick(n) {
      var now = performance.now();
      var oscillating = n === prevN && now - lastT < 280; // hovering on a threshold
      var tooSoon = now - lastT < 55;
      prevN = lastN; lastN = n;
      if (oscillating || tooSoon) return;
      lastT = now;
      play();
    }

    // The control shows while any sound-making scene is on screen.
    var scenes = {}, shown = false;
    function show(scene, v) {
      scenes[scene] = v;
      var any = Object.keys(scenes).some(function (k) { return scenes[k]; });
      if (!btn || any === shown) return;
      shown = any;
      btn.classList.toggle("is-shown", any);
      btn.tabIndex = any ? 0 : -1;
    }

    if (btn) {
      btn.hidden = false;
      btn.tabIndex = -1;
      btn.addEventListener("click", function () {
        // If the browser was still holding audio when this press began, the press
        // is what releases it: play a click rather than muting.
        if (releasing) { releasing = false; click(); render(); return; }
        muted = !muted;
        try { sessionStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {}
        if (muted) { if (ctx) ctx.suspend(); } else unlock();
        render();
      });
    }
    // Each browser recognises a slightly different set of events as permission.
    var releasing = false;
    ["pointerdown", "mousedown", "mouseup", "click", "keydown", "touchend"].forEach(function (ev) {
      window.addEventListener(ev, function () {
        if (ev === "pointerdown" || ev === "keydown") releasing = !muted && blocked();
        unlock();
        render();
      }, { passive: true, capture: true });
    });
    document.addEventListener("visibilitychange", function () {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else if (!muted) ctx.resume();
    });
    render();
    return { tick: tick, click: click, show: show };
  })();
})();
