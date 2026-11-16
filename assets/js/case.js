/*
 * Case-study pages, rendered from SITE.cases (content.js).
 *
 * Layout: full-width lead image or clip → headline with logo and type of work →
 * Challenge and Strategy side by side → one gallery row at the images' natural
 * proportions → Impact set large → next project.
 */
(function () {
  var SITE = window.SITE;
  var M = window.MANIFEST || {};
  var slug = document.body.dataset.slug;
  var c = SITE.cases[slug];
  // The work-index label is the single source for what kind of project this was.
  var label = (SITE.projects.filter(function (p) { return p.slug === slug; })[0] || {}).label || "";
  var main = document.getElementById("case");
  if (!c || !main) return;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]motion=reduce\b/.test(location.search);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
  function readJSON(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function writeJSON(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function dims(m) { return M[m.video ? m.video + "-poster.webp" : m.src] || [1600, 900]; }

  function media(m, eager) {
    var d = dims(m), pos = m.pos ? ' style="object-position:' + m.pos + '"' : "";
    var out;
    if (m.video && !still) {
      // Looping clip converted from the supplied GIF; its first frame is the still.
      // Plays like a GIF: silent, looping, no controls.
      out = '<video autoplay muted loop playsinline disablepictureinpicture preload="metadata" poster="/assets/img/' + m.video + '-poster.webp" aria-label="' + esc(m.alt) + '"' + pos + ">" +
        '<source src="/assets/img/' + m.video + '.mp4" type="video/mp4"></video>';
    } else {
      var src = m.video ? m.video + "-poster.webp" : m.src;
      out = '<img src="/assets/img/' + src + '" width="' + d[0] + '" height="' + d[1] + '" alt="' + esc(m.alt) + '"' +
        (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' + pos + ">";
    }
    if (m.overlay) out += '<img class="case-overlay" src="/assets/img/' + m.overlay + '" alt="" aria-hidden="true">';
    return out;
  }

  var order = SITE.projects.filter(function (p) { return !p.locked; });
  var idx = order.map(function (p) { return p.slug; }).indexOf(slug);
  var next = order[(idx + 1) % order.length];
  var nd = M[next.thumb] || [1600, 900];

  var sec = {};
  c.sections.forEach(function (s) { sec[s.h.toLowerCase()] = s; });
  function block(s, n) {
    if (!s) return "";
    if (!s.p) return s.devNote ? '<div class="case-block"><p class="dev-note">' + esc(s.devNote) + "</p></div>" : "";
    return '<div class="case-block"><h2><span aria-hidden="true">' + n + "</span>" + esc(s.h) + "</h2><p>" + esc(s.p) + "</p></div>";
  }

  var gallery = c.media.slice(1);
  // Justified rows: all in one, or the sizes given in c.rows.
  function galleryRows() {
    var sizes = c.rows || [gallery.length], out = [], i = 0;
    sizes.forEach(function (n) { out.push(gallery.slice(i, i + n)); i += n; });
    if (i < gallery.length) out.push(gallery.slice(i));
    return out;
  }
  var lb = M[c.logo.src] || [1200, 380];

  main.innerHTML =
    '<figure class="case-hero">' + media(c.media[0], true) + "</figure>" +
    '<header class="case-head">' +
      '<p class="case-kicker"><span class="case-client">' + esc(c.name) + "</span><span>" + esc(label) + "</span></p>" +
      '<h1 class="case-headline">' + c.headline.map(esc).join("<br> ") + "</h1>" +
      '<div class="case-logo' + (c.logo.tall ? " is-tall" : "") + '"><img src="/assets/img/' + c.logo.src + '" width="' + lb[0] + '" height="' + lb[1] + '" alt="' + esc(c.logo.alt) + '"></div>' +
      (c.credit ? '<p class="case-credit">' + esc(c.credit) + "</p>" : "") +
    "</header>" +
    '<section class="case-story" aria-label="Challenge and strategy">' + block(sec.challenge, "01") + block(sec.strategy, "02") + "</section>" +
    '<section class="case-gallery" aria-label="Campaign imagery">' + galleryRows().map(function (row) {
      return '<div class="case-row">' + row.map(function (m) {
        var d = dims(m), ar = m.crop || d[0] / d[1];
        return '<figure class="case-shot' + (ar > 1.3 ? " is-wide" : "") + '" style="--ar:' + ar.toFixed(4) + '">' + media(m, false) + "</figure>";
      }).join("") + "</div>";
    }).join("") + "</section>" +
    // A case without Impact copy simply ends after the gallery.
    (sec.impact && sec.impact.p
      ? '<section class="case-impact"><h2><span aria-hidden="true">03</span>Impact</h2><p>' + esc(sec.impact.p) + "</p></section>"
      : sec.impact ? '<section class="case-impact">' + block(sec.impact, "03") + "</section>" : '<div class="case-end"></div>') +
    '<nav class="case-foot" aria-label="Next project"><a class="case-next" href="/work/' + next.slug + '/">' +
      '<span class="case-next-thumb"><img src="/assets/img/' + next.thumb + '" width="' + nd[0] + '" height="' + nd[1] + '" alt="" loading="lazy" style="object-position:' + (next.thumbPos || "50% 50%") + '"></span>' +
      '<span class="case-next-text"><small>Next project</small><span>' + esc(SITE.cases[next.slug].name) + ' <span aria-hidden="true">→</span></span></span></a></nav>';

  /* Back to Work: return to the exact index position with focus on the tile. */
  document.querySelector(".case-back").addEventListener("click", function (e) {
    var ret = readJSON("return-work") || { slug: slug };
    ret.pending = true;
    writeJSON("return-work", ret);
    var ref = document.referrer && new URL(document.referrer);
    if (ref && ref.origin === location.origin && ref.pathname === "/" && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });

  /* Looping clips play only while visible (reduced motion shows stills instead). */
  var videos = Array.prototype.slice.call(document.querySelectorAll("#case video"));
  if (videos.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) e.target.play().catch(function () {});
        else e.target.pause();
      });
    }, { threshold: 0.15 });
    videos.forEach(function (v) { io.observe(v); });
  }

  /* Restrained parallax: the lead image drifts slower than the page; gallery images settle in. */
  if (still) return;
  var hero = main.querySelector(".case-hero > img, .case-hero > video");
  var shots = Array.prototype.slice.call(main.querySelectorAll(".case-shot"));
  var raf = 0;
  function frame() {
    raf = 0;
    var y = window.scrollY, vh = window.innerHeight;
    // Drift stays within the 4% headroom the scale-up gives, so the frame's edge never shows.
    if (hero && y < vh * 1.2) hero.style.transform = "translate3d(0," + Math.min(y * 0.1, hero.offsetHeight * 0.04) + "px,0) scale(1.08)";
    shots.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var d = (r.top + r.height / 2 - vh / 2) / vh; // −1 … 1 across the viewport
      var t = "translate3d(0," + (d * (i % 2 ? -14 : 14)) + "px,0) scale(1.05)";
      Array.prototype.forEach.call(s.querySelectorAll("img, video"), function (m) { m.style.transform = t; });
    });
  }
  window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  frame();
})();
