/* Shared page chrome: small-screen menu sheet and the persistent logo bar. */
(function () {
  var html = document.documentElement;
  var SITE = window.SITE || {};
  var M = window.MANIFEST || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]motion=reduce\b/.test(location.search);

  /* ---------- Menu sheet ---------- */
  var btn = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  if (btn && menu) {
    var set = function (open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Close" : "Menu";
      menu.classList.toggle("is-open", open);
      html.classList.toggle("menu-open", open);
    };
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); }
    });
    matchMedia("(max-width: 860px)").addEventListener("change", function () { set(false); });
  }

  /* ---------- Cursor: a small dot trailed by a fine blue line ---------- */
  // Mouse and trackpad only; touch devices keep their own behaviour.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var NS = "http://www.w3.org/2000/svg";
    var cur = document.createElementNS(NS, "svg");
    cur.setAttribute("class", "cursor");
    cur.setAttribute("aria-hidden", "true");
    var trail = document.createElementNS(NS, "polyline");
    var dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", "3.5");
    cur.appendChild(trail);
    cur.appendChild(dot);
    document.body.appendChild(cur);
    html.classList.add("has-cursor");
    var pts = [], mx = 0, my = 0, live = false, craf = 0;
    for (var i = 0; i < (reduced ? 1 : 14); i++) pts.push({ x: 0, y: 0 });
    var follow = function () {
      craf = 0;
      pts[0].x = mx; pts[0].y = my;
      var moving = false;
      // Each point eases toward the one ahead of it, so the line drags behind the dot.
      for (var k = 1; k < pts.length; k++) {
        var p = pts[k], q = pts[k - 1];
        p.x += (q.x - p.x) * 0.42; p.y += (q.y - p.y) * 0.42;
        if (Math.abs(q.x - p.x) + Math.abs(q.y - p.y) > 0.2) moving = true;
      }
      dot.setAttribute("cx", mx); dot.setAttribute("cy", my);
      trail.setAttribute("points", pts.map(function (p) { return p.x.toFixed(1) + " " + p.y.toFixed(1); }).join(","));
      if (moving) craf = requestAnimationFrame(follow);
    };
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      if (!live) { pts.forEach(function (p) { p.x = mx; p.y = my; }); live = true; cur.classList.add("is-on"); }
      cur.classList.toggle("is-link", !!(e.target.closest && e.target.closest("a, button, [role=tab], label, summary")));
      if (!craf) craf = requestAnimationFrame(follow);
    }, { passive: true });
    html.addEventListener("mouseleave", function () { live = false; cur.classList.remove("is-on"); });
  }

  /* ---------- Logo bar: alphabetical, seamless loop, pausable ---------- */
  if (!SITE.logos) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var logos = SITE.logos.slice().sort(function (a, b) {
    return (a[2] || a[1]).localeCompare(b[2] || b[1], "en", { sensitivity: "base" });
  });
  function items(hidden) {
    return logos.map(function (l) {
      var d = M["logos/" + l[0] + ".webp"] || [600, 200];
      // Optical balance: roughly equal visual area, clamped for extremes.
      var h = Math.max(0.42, Math.min(1, 0.62 * Math.sqrt(3.2 / (d[0] / d[1])))).toFixed(2);
      return "<li" + (hidden ? ' aria-hidden="true"' : "") + '><img src="/assets/img/logos/' + l[0] + '.webp" width="' + d[0] +
        '" height="' + d[1] + '" alt="' + (hidden ? "" : esc(l[1])) + '" style="--h:' + h + '" decoding="async"></li>';
    }).join("");
  }
  var bar = document.createElement("aside");
  bar.className = "logobar";
  bar.setAttribute("aria-label", "Brands from Pete’s experience");
  bar.innerHTML = '<div class="logobar-window"><ul class="logobar-track" role="list">' + items(false) + items(true) + "</ul></div>" +
    '<button class="logobar-pause" type="button" aria-pressed="false" aria-label="Pause logos"></button>';
  document.body.appendChild(bar);
  html.classList.add("has-logobar");

  var track = bar.querySelector(".logobar-track");
  var pause = bar.querySelector(".logobar-pause");
  function speed() { bar.style.setProperty("--logobar-dur", Math.round(track.scrollWidth / 2 / 38) + "s"); }
  window.addEventListener("load", speed);
  window.addEventListener("resize", speed);
  speed();
  pause.addEventListener("click", function () {
    var paused = bar.classList.toggle("is-paused");
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute("aria-label", paused ? "Play logos" : "Pause logos");
  });
  if (reduced) bar.classList.add("is-static");
  document.addEventListener("visibilitychange", function () { bar.classList.toggle("is-hidden-tab", document.hidden); });
})();
