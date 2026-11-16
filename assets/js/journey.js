/*
 * Main journey.
 *
 * Desktop (fine pointer, wide viewport, motion allowed): the document gets a
 * real vertical scroll height and the panels sit on a fixed horizontal track.
 * window.scrollY maps directly to a track position, so wheel, trackpad,
 * keyboard, scrollbar and Back all behave natively. While Collective Memory
 * assembles, the track holds still for a pinned stretch of scroll (pinLen).
 *
 *   scrollY:  0 ──────── memLeft ════ pin ════ memLeft+pinLen ──────── end
 *   track x:  0 ──────── memLeft    (held)     memLeft ─────────────── maxX
 *
 * Everywhere else the page scrolls vertically and Collective Memory pins with
 * position: sticky.
 */
(function () {
  var html = document.documentElement;
  var track = document.getElementById("track");
  if (!track) return;

  var memPanel = document.getElementById("collective-memory");
  var panels = Array.prototype.slice.call(track.children);
  var mqH = matchMedia("(min-width: 1024px) and (min-height: 600px) and (hover: hover) and (pointer: fine)");
  var mqRM = matchMedia("(prefers-reduced-motion: reduce)");
  // ?motion=reduce previews the reduced-motion experience without changing OS settings.
  var forceRM = /[?&]motion=reduce\b/.test(location.search);
  function reduced() { return mqRM.matches || forceRM; }
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".menu a[data-section]"));

  var L = null;           // current layout measurements
  var raf = 0;
  var silentFrames = 0;   // frames during which jumps must not trigger feedback
  var frameHooks = [], layoutHooks = [], readyHooks = [];
  var state = { mode: "v", x: 0, mp: 0, t: 1, silent: true };

  var navEntry = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};

  var J = window.Journey = {
    state: state,
    navType: navEntry.type || "navigate",
    reducedMotion: function () { return reduced(); },
    on: function (fn) { frameHooks.push(fn); },
    onLayout: function (fn) { layoutHooks.push(fn); },
    onReady: function (fn) { if (J.ready) fn(); else readyHooks.push(fn); },
    budget: function () { return { lead: 0, assembly: 1, hold: 0 }; }, // replaced by memory.js
    anchor: anchor,
    restore: restore,
    jumpTo: jumpTo,
    layout: function () { return L; },
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function isH() { return mqH.matches && !reduced(); }
  function readJSON(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function writeJSON(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- Layout ---------- */
  function measure() {
    var mode = isH() ? "h" : "v";
    html.classList.toggle("is-h", mode === "h");
    html.classList.toggle("is-v", mode !== "h");
    html.classList.toggle("is-rm", reduced());

    var vw = window.innerWidth, vh = window.innerHeight;
    var b = J.budget(mode, vw, vh);
    var pinLen = reduced() ? 0 : Math.round((b.lead + b.assembly + b.hold) * vh);

    if (mode === "h") {
      memPanel.style.height = "";
      track.style.transform = "translate3d(0,0,0)";
      var maxX = Math.max(0, track.scrollWidth - vw);
      L = { mode: mode, vw: vw, vh: vh, pinLen: pinLen, memLeft: memPanel.offsetLeft, maxX: maxX };
      document.body.style.height = (maxX + pinLen + vh) + "px";
    } else {
      track.style.transform = "";
      document.body.style.height = "";
      memPanel.style.height = pinLen ? (vh + pinLen) + "px" : "";
      L = { mode: mode, vw: vw, vh: vh, pinLen: pinLen };
    }
    state.mode = mode;
    // Hooks measure with the track at x = 0, so rects are track coordinates.
    layoutHooks.forEach(function (fn) { fn(L); });
  }

  function compute(y) {
    if (L.mode === "h") {
      if (y <= L.memLeft) { state.x = y; state.mp = 0; }
      else if (y < L.memLeft + L.pinLen) { state.x = L.memLeft; state.mp = (y - L.memLeft) / L.pinLen; }
      else { state.x = Math.min(L.maxX, y - L.pinLen); state.mp = 1; }
      // Title hand-off runs while the bio slides out and the scene slides in.
      var tw = 0.72 * L.vw;
      state.t = clamp((state.x - (L.memLeft - tw)) / tw, 0, 1);
    } else {
      state.x = 0;
      state.t = 1;
      var top = memPanel.getBoundingClientRect().top;
      state.mp = L.pinLen ? clamp(-top / L.pinLen, 0, 1) : 1;
    }
  }

  function xToY(x) { return x <= L.memLeft ? x : x + L.pinLen; }

  /* ---------- Frame ---------- */
  function frame() {
    raf = 0;
    if (!L) return;
    compute(window.scrollY);
    if (L.mode === "h") track.style.transform = "translate3d(" + (-state.x) + "px,0,0)";
    state.silent = silentFrames > 0;
    if (silentFrames > 0) silentFrames--;
    for (var i = 0; i < frameHooks.length; i++) frameHooks[i](state, L);
    updateNav();
    if (silentFrames > 0) schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }

  /* ---------- Position: anchors, jumps, restore ---------- */
  function panelAt() {
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      if (!p.offsetWidth && !p.offsetHeight) continue;
      if (L.mode === "h") {
        if (state.x >= p.offsetLeft && state.x < p.offsetLeft + p.offsetWidth) return { i: i, f: (state.x - p.offsetLeft) / p.offsetWidth };
      } else {
        var r = p.getBoundingClientRect();
        if (r.top <= 1 && r.bottom > 1) return { i: i, f: -r.top / r.height };
      }
    }
    return { i: 0, f: 0 };
  }

  // A resolution-independent description of where the visitor is.
  function anchor() {
    if (!L) return null;
    if (state.mp > 0 && state.mp < 1) return { mp: state.mp };
    return panelAt();
  }

  function restore(a) {
    if (!a || !L) return;
    var y;
    if (a.mp != null) {
      y = (L.mode === "h" ? L.memLeft : memPanel.offsetTop) + a.mp * L.pinLen;
    } else {
      var p = panels[a.i] || panels[0];
      y = L.mode === "h"
        ? xToY(Math.min(p.offsetLeft + a.f * p.offsetWidth, L.maxX))
        : p.offsetTop + a.f * p.offsetHeight;
    }
    go(y);
  }

  function sectionY(el) {
    if (L.mode === "h") return xToY(Math.min(el.offsetLeft, L.maxX));
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function go(y) {
    silentFrames = 3;
    window.scrollTo({ top: Math.round(y), left: 0, behavior: "instant" });
    // Apply immediately so focus handling that follows sees the new position.
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    frame();
  }

  function jumpTo(id) {
    var el = document.getElementById(id);
    if (!el || !L) return false;
    go(id === "home" ? 0 : sectionY(el));
    return true;
  }

  function focusSection(id) {
    var el = document.getElementById(id);
    var target = el && (el.querySelector("h1, h2") || el);
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  /* ---------- Section links (real anchors, intercepted for exact positioning) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-jump]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var id = a.hash.slice(1);
    if (!document.getElementById(id) || !L) return;
    e.preventDefault();
    history.replaceState({ y: window.scrollY }, "");
    history.pushState({ jump: id }, "", "#" + id);
    jumpTo(id);
    focusSection(id);
  });

  window.addEventListener("popstate", function (e) {
    var s = e.state;
    if (s && typeof s.y === "number") go(s.y);
    else if (s && s.jump) jumpTo(s.jump);
    else if (location.hash) jumpTo(location.hash.slice(1));
    else go(0);
  });

  function updateNav() {
    var current = null;
    if (L.mode === "h") {
      var probe = state.x + L.vw * 0.45;
      navLinks.forEach(function (a) {
        var el = document.getElementById(a.dataset.section);
        if (el && probe >= el.offsetLeft && probe < el.offsetLeft + el.offsetWidth) current = a;
      });
    } else {
      navLinks.forEach(function (a) {
        var el = document.getElementById(a.dataset.section);
        var r = el && el.getBoundingClientRect();
        if (r && r.top <= L.vh * 0.4 && r.bottom > L.vh * 0.4) current = a;
      });
    }
    navLinks.forEach(function (a) {
      if (a === current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- Keyboard focus on the horizontal track ---------- */
  track.addEventListener("focusin", function (e) {
    if (!L || L.mode !== "h") return;
    var r = e.target.getBoundingClientRect();
    if (r.left >= 0 && r.right <= L.vw) return;
    go(xToY(clamp(state.x + r.left - L.vw * 0.12, 0, L.maxX)));
  });

  /* ---------- Resize, mode changes, refresh ---------- */
  var resizeTimer = 0;
  function relayout() {
    var a = anchor();
    measure();
    if (a) restore(a);
    frame();
  }
  var lastW = window.innerWidth, lastH = window.innerHeight;
  window.addEventListener("resize", function () {
    // On phones the address bar slides in and out while scrolling, changing only the
    // height a little. Re-laying out then resized the pinned scene and threw the
    // reader into a neighbouring section, so those changes are ignored.
    var w = window.innerWidth, h = window.innerHeight;
    if (L && L.mode !== "h" && w === lastW && Math.abs(h - lastH) < lastH * 0.25) return;
    lastW = w; lastH = h;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayout, 120);
  });
  [mqH, mqRM].forEach(function (mq) {
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(relayout);
  });

  window.addEventListener("pagehide", function () {
    writeJSON("journey", { a: anchor() });
  });

  window.addEventListener("scroll", schedule, { passive: true });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  function init() {
    if (J.ready) return;
    measure();
    var saved = readJSON("journey");
    var ret = readJSON("return-work");
    if ((J.navType === "reload" || J.navType === "back_forward") && saved && saved.a) restore(saved.a);
    else if (ret && ret.pending && ret.a) restore(ret.a);
    else if (location.hash && jumpTo(location.hash.slice(1))) { /* deep link */ }
    else go(0);
    silentFrames = 3;
    frame();
    html.classList.add("is-ready");
    J.ready = true;
    readyHooks.forEach(function (fn) { fn(); });
  }

  // Wait for webfonts so headline measurements are final, but never block on them.
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1500); })]).then(init);
  // A late-arriving webfont changes headline sizes, so measure again once it lands.
  fontsReady.then(function () { if (J.ready) relayout(); });
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", function () { if (J.ready) relayout(); });
  // Pages restored from the back/forward cache keep stale measurements.
  window.addEventListener("pageshow", function (e) { if (e.persisted && J.ready) relayout(); });
})();
