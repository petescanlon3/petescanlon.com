/* Home page: work index, private-project dialog, kind words, typing, reveals, parallax. */
(function () {
  var J = window.Journey;
  var SITE = window.SITE;
  var M = window.MANIFEST || {};
  var html = document.documentElement;
  var reduced = J ? J.reducedMotion() : true;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function readJSON(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function writeJSON(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- Enter gate: one click unlocks sound, then the name fades in ---------- */
  var gate = document.getElementById("gate");
  if (gate && html.classList.contains("is-gated")) {
    var enter = gate.querySelector(".gate-enter");
    enter.focus({ preventScroll: true });
    enter.addEventListener("click", function () {
      // The click itself is what lets the browser play sound (Feedback listens for it).
      try { sessionStorage.setItem("entered", "1"); } catch (e) {}
      gate.classList.add("is-leaving");
      html.classList.remove("is-gated");
      if (window.Feedback && window.Feedback.click) window.Feedback.click();
      setTimeout(function () { gate.remove(); }, 600);
    });
  }

  /* ---------- Work index: identical cinematic tiles ---------- */
  var gridEl = document.getElementById("work-grid");
  var lockSvg = '<svg class="work-lock" viewBox="0 0 11 14" aria-hidden="true"><path fill="currentColor" d="M2.2 5.6V4a3.3 3.3 0 0 1 6.6 0v1.6h.6c.6 0 1.1.5 1.1 1.1v6.2c0 .6-.5 1.1-1.1 1.1H1.1C.5 14 0 13.5 0 12.9V6.7c0-.6.5-1.1 1.1-1.1h1.1Zm1.5 0h3.6V4a1.8 1.8 0 0 0-3.6 0v1.6Z"/></svg>';
  gridEl.innerHTML = SITE.projects.map(function (p, i) {
    var dims = M[p.thumb] || [1600, 900];
    var num = String(i + 1).padStart(2, "0");
    var thumb = '<span class="work-thumb"><img src="/assets/img/' + p.thumb + '" width="' + dims[0] + '" height="' + dims[1] +
      '" loading="lazy" decoding="async" alt="" style="object-position:' + (p.thumbPos || "50% 50%") + '"></span>';
    var text = '<span class="work-meta"><span class="work-num">' + num + "</span>" +
      (p.locked ? '<span class="work-private">' + lockSvg + "Private</span>" : "") + "</span>" +
      '<span class="work-name">' + esc(p.title) + '</span><span class="work-label">' + esc(p.label) + "</span>";
    var inner = p.locked
      ? '<button type="button" data-locked data-slug="' + p.slug + '" aria-haspopup="dialog" aria-label="' + esc(p.title + ", " + p.label + " (private project)") + '">' + thumb + text + "</button>"
      : '<a href="/work/' + p.slug + '/" data-slug="' + p.slug + '">' + thumb + text + "</a>";
    return '<li class="work-item">' + inner + "</li>";
  }).join("");

  function saveReturn(slug) { writeJSON("return-work", { slug: slug, a: J && J.anchor() }); }
  gridEl.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-slug]");
    if (a) saveReturn(a.dataset.slug);
  });

  // Coming back from a case study: same index position, focus on the tile.
  function focusReturn(fromBfcache) {
    var ret = readJSON("return-work");
    if (!ret || !ret.slug) return;
    if (!(ret.pending || fromBfcache || (J && J.navType === "back_forward"))) return;
    var el = gridEl.querySelector('[data-slug="' + ret.slug + '"]');
    if (el) el.focus({ preventScroll: true });
    ret.pending = false;
    writeJSON("return-work", ret);
  }
  if (J) J.onReady(function () { focusReturn(false); });
  window.addEventListener("pageshow", function (e) { if (e.persisted) focusReturn(true); });

  /* ---------- Private project dialog (presentation only: no password exists) ---------- */
  var dlg = document.getElementById("private-dialog");
  var form = dlg.querySelector("form");
  var input = dlg.querySelector("input");
  var trigger = null;
  // The field accepts typing and Enter, and nothing visibly happens.
  // Input is never read, logged, stored or sent.
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
  gridEl.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-locked]");
    if (!b) return;
    trigger = b;
    var p = SITE.projects.filter(function (x) { return x.slug === b.dataset.slug; })[0];
    document.getElementById("private-project").textContent = p ? p.title : "";
    html.classList.add("dialog-open");
    dlg.showModal();
    input.focus();
  });
  dlg.querySelector(".private-close").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", function () {
    input.value = "";
    html.classList.remove("dialog-open");
    if (trigger) trigger.focus({ preventScroll: true });
  });
  dlg.querySelector(".private-next").addEventListener("click", function () { if (trigger) saveReturn(trigger.dataset.slug); });

  /* ---------- Kind words: tabs on the left, the quote on the right ---------- */
  var kind = document.getElementById("kind");
  var people = SITE.testimonials.filter(function (t) { return t.quote && !t.hidden; });
  // Each card: the company's logo in its own column, then the person.
  kind.innerHTML = '<div class="kind-tabs" role="tablist" aria-label="Testimonials">' + people.map(function (t, i) {
    var d = M[t.logo] || [600, 200];
    return '<button class="kind-tab" role="tab" id="kind-tab-' + i + '" aria-controls="kind-panel" aria-selected="' + (i === 0) + '"' +
      (i ? ' tabindex="-1"' : "") + ">" +
      '<span class="kind-logo"><img src="/assets/img/' + t.logo + '" width="' + d[0] + '" height="' + d[1] + '" alt="" loading="lazy"></span>' +
      '<span class="kind-who"><span class="kind-name">' + esc(t.name) + "</span><span>" + esc(t.role) + "</span><span>" + esc(t.org) + "</span>" +
      (t.placeholder ? '<span class="dev-note">Placeholder quote: replace before launch.</span>' : "") + "</span></button>";
  }).join("") + "</div>" +
    '<figure class="kind-panel" id="kind-panel" role="tabpanel" aria-labelledby="kind-tab-0"><blockquote>' +
    // Invisible copies of every quote share the live quote's cell, so the box is always
    // sized for the longest one and keeps its size whichever person is selected.
    people.map(function (t) { return '<p class="kind-sizer" aria-hidden="true">' + esc("“" + t.quote + "”") + '<span class="kind-caret"></span></p>'; }).join("") +
    '<p class="kind-quote"></p></blockquote></figure>';
  var tabs = Array.prototype.slice.call(kind.querySelectorAll(".kind-tab"));
  var quoteP = kind.querySelector(".kind-quote");
  // The quote is simply there, with a text cursor blinking after its last word.
  var caretHtml = '<span class="kind-caret" aria-hidden="true"></span>';
  function selectTab(i, focus) {
    if (!people[i]) return;
    tabs.forEach(function (t, j) {
      t.setAttribute("aria-selected", String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    kind.querySelector(".kind-panel").setAttribute("aria-labelledby", "kind-tab-" + i);
    quoteP.innerHTML = esc("“" + people[i].quote + "”") + caretHtml;
    kind.style.setProperty("--active", i);
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      if (window.Feedback) window.Feedback.click(); // the same click as the Collective Memory assembly
      selectTab(i);
    });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var j = (i + d + tabs.length) % tabs.length;
      selectTab(j, true);
    });
  });
  selectTab(0);

  if (!J) return;

  // A one-off effect run by drive(): fn(instant) is called once, when the section is reached.
  function Once(fn) {
    var state = "idle";
    function run(instant) { if (state === "idle") { state = "done"; fn(instant); } }
    return { start: function () { run(false); }, finish: function () { run(true); }, get state() { return state; } };
  }

  /* ---------- Wipe: names are uncovered in one diagonal sweep ---------- */
  function Wipe(root, items) {
    items = Array.prototype.slice.call(items || root.querySelectorAll("li"));
    items.forEach(function (el) { el.classList.add("wipe-item"); });
    var state = "idle";
    root.classList.add("is-fogged");
    function finish() {
      state = "done";
      root.classList.add("is-instant");
      root.classList.remove("is-fogged");
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove("is-instant"); }); });
    }
    function start() {
      if (state !== "idle") return;
      state = "done";
      var box = root.getBoundingClientRect();
      items.forEach(function (li) {
        var r = li.getBoundingClientRect();
        // Sweep from top left to bottom right across the whole grid.
        var d = ((r.left - box.left) / box.width) * 0.75 + ((r.top - box.top) / box.height) * 0.25;
        li.style.transitionDelay = Math.round(d * 1100) + "ms";
      });
      root.classList.remove("is-fogged");
    }
    if (reduced) finish();
    return { start: start, finish: finish, get state() { return state; } };
  }

  var bio = document.getElementById("about");
  var bioPhoto = bio.querySelector(".bio-photo");
  var experience = document.getElementById("experience");
  // The photo arrives with a camera flash; the copy is simply there.
  var bioReveal = Once(function (instant) {
    bioPhoto.classList.add("is-revealed");
    if (instant) bioPhoto.classList.add("is-instant");
  });
  var expWipe = Wipe(experience.querySelector(".exp-grid"));
  // Example deliverables on Ways to Work get the same sweep, text only, so the rules stay put.
  var ways = document.getElementById("ways");
  var waysWipe = Wipe(ways.querySelector(".ways-grid"), Array.prototype.map.call(ways.querySelectorAll(".way li"), function (li) {
    var span = document.createElement("span");
    span.className = "wipe-text";
    while (li.firstChild) span.appendChild(li.firstChild);
    li.appendChild(span);
    return span;
  }));
  var kindSection = document.getElementById("kind-words");
  if (reduced) bioPhoto.classList.add("is-revealed", "is-instant");

  // Position of a section relative to the viewport's leading edge, in viewport units.
  function lead(el, st, L) {
    return L.mode === "h" ? (el.offsetLeft - st.x) / L.vw : el.getBoundingClientRect().top / L.vh;
  }
  function drive(typer, el, st, L, onStart) {
    if (typer.state === "done") return;
    var p = lead(el, st, L);
    if (p < -0.6 || (st.silent && p < -0.2)) { typer.finish(); if (onStart) onStart(true); return; }
    if (typer.state === "idle" && p < 0.4 && p > -0.6) { typer.start(); if (onStart) onStart(false); }
  }

  /* ---------- Name → top bar, parallax, Connect ---------- */
  var name = document.querySelector(".opening-name");
  var brand = document.querySelector(".topbar .brand");
  var nameBox = document.querySelector(".opening-title");
  var morph = null;
  var connect = document.getElementById("connect");
  var connectBand = connect.querySelector(".connect-band");
  var connectImgs = connect.querySelectorAll(".connect-photo");
  var connectTitle = connect.querySelector(".connect-title");

  var nameLast = name.querySelector(".opening-last");
  var sub = document.querySelector(".opening-sub");
  var bioTitle = bio.querySelector(".bio-title");
  var inkCtx = document.createElement("canvas").getContext("2d");

  J.onLayout(function (L) {
    // The large name and the small top-bar name share font and leading, so one
    // scales exactly into the other.
    name.style.transform = "";
    // On phones the name is pinned to the screen while it travels, so it glides with
    // the finger instead of chasing the page's scroll (which made it stutter).
    var pinName = L.mode !== "h" && !reduced;
    name.style.position = name.style.left = name.style.top = name.style.zIndex = name.style.pointerEvents = "";
    sub.style.position = sub.style.left = sub.style.top = sub.style.marginTop = sub.style.transform = "";
    nameBox.style.paddingTop = "";

    // The subhead runs exactly the width of SCANLON.
    sub.style.fontSize = "";
    var fs0 = parseFloat(getComputedStyle(sub).fontSize);
    sub.style.fontSize = fs0 * nameLast.getBoundingClientRect().width / sub.getBoundingClientRect().width + "px";

    // The photo's left edge meets the ink of the M in MACHINE, not the letter's box.
    var tcs = getComputedStyle(bioTitle);
    inkCtx.font = tcs.fontWeight + " " + tcs.fontSize + " " + tcs.fontFamily;
    var mInk = -inkCtx.measureText("M").actualBoundingBoxLeft;
    bio.style.setProperty("--m-ink", mInk + "px");
    // On phones the photo runs the width of MACHINE (from the M's ink to the E's).
    var last = bioTitle.lastChild, rng = document.createRange();
    rng.selectNodeContents(last);
    var eInk = inkCtx.measureText("E"), eRight = eInk.width - eInk.actualBoundingBoxRight;
    bio.style.setProperty("--machine-w", rng.getBoundingClientRect().width - mInk - eRight + "px");

    var nr = name.getBoundingClientRect(), br = brand.getBoundingClientRect();
    if (pinName) {
      // The line under the name is pinned too and moved in the same frame as the name,
      // so the two can't drift into each other while the phone scrolls.
      var sr = sub.getBoundingClientRect();
      nameBox.style.paddingTop = sr.bottom - nr.top + "px";
      sub.style.position = "fixed";
      sub.style.marginTop = "0";
      sub.style.left = sr.left + "px";
      sub.style.top = sr.top + window.scrollY + "px";
      name.style.position = "fixed";
      // Above the top bar, whose black background otherwise hid the name for its last stretch.
      name.style.zIndex = "60";
      name.style.pointerEvents = "none";
      name.style.left = nr.left + "px";
      name.style.top = nr.top + window.scrollY + "px";
    }
    morph = {
      pinned: pinName,
      x0: nr.left, y0: nr.top + (L.mode === "h" ? 0 : window.scrollY),
      x1: br.left, y1: br.top,
      s1: parseFloat(getComputedStyle(brand).fontSize) / parseFloat(getComputedStyle(name).fontSize),
      span: (L.mode === "h" ? L.vw : L.vh) * 0.32,
    };

    // CONNECT is sized and placed so its last letters slip behind Russell's hand.
    connectTitle.style.fontSize = "100px";
    var band = connectBand.getBoundingClientRect();
    var img = connectImgs[0];
    var iw = img.offsetWidth, ih = img.offsetHeight, nat = 2172 / 724;
    var sc = iw / ih > nat ? iw / 2172 : ih / 724;           // object-fit: cover
    var pos = getComputedStyle(img).objectPosition.split(" ").map(function (v) { return parseFloat(v) / 100; });
    var offX = (iw - 2172 * sc) * pos[0] + img.offsetLeft, offY = (ih - 724 * sc) * pos[1] + img.offsetTop;
    var handX = offX + 1030 * sc, handY = offY + 376 * sc;    // middle of the fingers
    var left = connectTitle.offsetLeft;
    var w100 = connectTitle.offsetWidth;
    var fs = clamp((handX - left) * 100 / w100 * 1.03, 36, band.width * 0.16); // a low floor, so phones keep the tuck behind the hand too
    connectTitle.style.fontSize = fs + "px";
    connectTitle.style.top = (handY - fs * 0.62) + "px";
  });

  J.on(function (st, L) {
    drive(bioReveal, bio, st, L);
    drive(expWipe, experience, st, L);
    drive(waysWipe, ways, st, L);
    if (window.Feedback) window.Feedback.show("kind", Math.abs(lead(kindSection, st, L)) < 0.5);

    if (morph && !reduced) {
      var p = clamp((L.mode === "h" ? st.x : window.scrollY) / morph.span, 0, 1);
      var e = ease(p);
      var nx = morph.x0 - (L.mode === "h" ? st.x : 0), ny = morph.y0 - (L.mode === "h" || morph.pinned ? 0 : window.scrollY);
      // Ease from where the name starts toward the fixed top-bar name, cancelling
      // the panel's own movement (sideways on desktop, upward on phones).
      var tx = morph.x0 + (morph.x1 - morph.x0) * e - nx, ty = morph.y0 + (morph.y1 - morph.y0) * e - ny;
      if (morph.pinned) sub.style.transform = "translate3d(0," + -window.scrollY + "px,0)";
      name.style.transform = p >= 1 && !morph.pinned ? "" : "translate3d(" + tx + "px," + ty + "px,0) scale(" + (1 + (morph.s1 - 1) * e) + ")";
      name.classList.toggle("is-docked", p >= 1);
      brand.classList.toggle("is-docked", p >= 1);
    }

    if (reduced) return;
    var dBio = lead(bio, st, L);
    if (Math.abs(dBio) < 1.2) bioPhoto.style.translate = (L.mode === "h" ? dBio * L.vw * 0.02 + "px 0" : "0 " + dBio * L.vh * -0.03 + "px");
    var q = 1 - clamp(1 - lead(connect, st, L), 0, 1);
    var t = "translate3d(" + (-q * L.vw * 0.03) + "px,0,0) scale(" + (1 + q * 0.07) + ")";
    connectImgs[0].style.transform = connectImgs[1].style.transform = t;
    connectTitle.style.translate = (q * L.vw * 0.06) + "px 0";
  });
})();
