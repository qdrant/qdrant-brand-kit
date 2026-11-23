// Print helper for review/print.py. render.py adds it to every page; it does nothing unless the URL
// has ?qd-print=... (set by print.py). Mechanics only: the sizes come from print.py, which reads them
// from guidelines/print/print.tokens.json and the printer's spec.
//
// - Margins: the canvas margins become bleed + the format's margin, 8% of the short side (guidelines/print/).
//   Folds and a hidden bottom (roll-ups) are passed along for the checks.
// - Shape and scale come from the finished size (the trim), not trim + bleed: print.py passes them.
// - Sets the print text sizes from print.tokens.json (through print.py), so pages never set them.
// - Records what the print checks need (patterns, QR codes, image fades) in <script id="qd-print-measure">.
// - &qd-layer=backdrop: shows only the backdrop (canvas color, patterns, faded images), for print.py.
// - With &qd-pdf=1: sets the PDF page to the full size (trim + bleed + room for crop marks), scales the
//   300 dpi layout down to real size (CSS zoom, so text stays vector and images keep 300 dpi), and
//   draws crop marks outside the bleed.
(function () {
  var q = new URLSearchParams(location.search);
  var raw = q.get("qd-print");
  if (!raw) return;
  var p;
  try { p = JSON.parse(raw); } catch (e) { return; }

  function apply() {
    document.querySelectorAll(".qd-canvas").forEach(function (c) {
      c.style.setProperty("--qd-canvas-margin-x", p.margin.x);
      c.style.setProperty("--qd-canvas-margin-top", p.margin.top);
      c.style.setProperty("--qd-canvas-margin-bottom", p.margin.bottom);
      c.dataset.print = p.format || "print";
      if (p.shape) { c.dataset.shape = p.shape; c.setAttribute("data-shape-fixed", ""); }
      if (p.u) c.style.setProperty("--qd-canvas-u", p.u + "px");
      // Text in print: the sizes come from print.tokens.json through print.py (px at 300 dpi).
      if (p.type) {
        c.style.setProperty("--qd-print-title", p.type.titlePx + "px");
        c.style.setProperty("--qd-print-supporting", p.type.supportingPx + "px");
        if (p.type.titleCoverPx) c.style.setProperty("--qd-print-title-cover", p.type.titleCoverPx + "px");
        c.setAttribute("data-print-type", "");
      }
    });
  }
  apply();
  document.addEventListener("DOMContentLoaded", apply);
  window.__qdPrint = p;

  // Print text sizes: pages never set them (guidelines/print/ section 4).
  var ps = document.createElement("style");
  ps.textContent =
    ".qd-canvas[data-print-type] .qd-title{font-size:var(--qd-print-title)}" +
    ".qd-canvas[data-print-type] .qd-title.qd-title--cover{font-size:var(--qd-print-title-cover, var(--qd-print-title))}" +
    ".qd-canvas[data-print-type] .qd-supporting{font-size:var(--qd-print-supporting)}" +
    ".qd-canvas[data-print-type] .qd-icon{width:var(--qd-print-supporting);height:var(--qd-print-supporting)}";
  document.head.appendChild(ps);

  // What the print checks need. Patterns: any pattern mask, any canvas in the creative, or anything
  // loaded from brand-assets/patterns/. QR codes: elements marked .qd-qr.
  function record() {
    var cv = document.querySelector(".qd-canvas");
    if (!cv) return;
    var loaded = (performance.getEntriesByType ? performance.getEntriesByType("resource") : [])
      .map(function (e) { return e.name; }).filter(function (n) { return n.indexOf("/brand-assets/patterns/") >= 0; });
    var qr = [].map.call(cv.querySelectorAll(".qd-qr"), function (el) {
      var r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    var fades = [].map.call(cv.querySelectorAll(".qd-image-fade"), function (el) {
      var r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    var boxes = [].map.call(cv.querySelectorAll(".qd-box--card, .qd-box--outline, .qd-box--light-card"), function (el) {
      var r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    var info = { masks: cv.querySelectorAll(".qd-pattern-mask").length, canvases: cv.querySelectorAll("canvas").length, boxes: boxes,
                 patternFiles: loaded.slice(0, 5), qr: qr, fades: fades };
    var tag = document.getElementById("qd-print-measure");
    if (!tag) { tag = document.createElement("script"); tag.type = "application/json"; tag.id = "qd-print-measure"; document.body.appendChild(tag); }
    tag.textContent = JSON.stringify(info);
  }
  window.addEventListener("load", function () { record(); setTimeout(record, 1500); });

  // The backdrop: the canvas color, patterns and faded images. Chrome's PDF export drops or weakens CSS
  // masks (the pattern mask, the image fade), so print.py photographs the backdrop on its own at 300 dpi
  // (&qd-layer=backdrop) and the PDF uses that photo instead. Text, logo and button stay vector on top.
  var BACK = ".qd-pattern-mask, .qd-image-fade, canvas";
  function style(css) { var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }
  if (q.get("qd-layer") === "backdrop") {
    style(".qd-canvas *{visibility:hidden!important}" +
          ".qd-canvas :is(" + BACK + "), .qd-canvas :is(" + BACK + ") *{visibility:visible!important}");
  }

  if (!q.get("qd-pdf")) return;
  var backdrop = q.get("qd-backdrop");
  if (backdrop) {
    style(".qd-canvas{background:url('" + backdrop + "') 0 0/100% 100% no-repeat!important}" +
          ".qd-canvas :is(" + BACK + "){visibility:hidden!important}");
  }
  var slug = p.slugPx, W = p.w, H = p.h, zoom = 96 / p.dpi;
  var pageW = (W + 2 * slug) / p.pxPerMm, pageH = (H + 2 * slug) / p.pxPerMm;
  var st = document.createElement("style");
  // The page lays out at 300 dpi first, so its own scripts (pattern masks, measurements) see the real
  // layout. Only when printing is it padded for the crop marks and scaled down to real size.
  st.textContent =
    "@page{size:" + pageW + "mm " + pageH + "mm;margin:0}" +
    "*{-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    "html.qd-printing,html.qd-printing body{margin:0;padding:0;background:#fff}" +
    "html.qd-printing body{zoom:" + zoom + ";padding:" + slug + "px;width:" + W + "px;height:" + H + "px;position:relative}" +
    ".qd-crop{display:none;position:absolute;background:#000;z-index:2147483647}" +
    "html.qd-printing .qd-crop{display:block}";
  document.head.appendChild(st);
  window.addEventListener("beforeprint", function () { document.documentElement.classList.add("qd-printing"); });
  window.matchMedia("print").addEventListener("change", function (e) {
    if (e.matches) document.documentElement.classList.add("qd-printing");
  });

  function mark(x, y, w, h) {
    var d = document.createElement("div");
    d.className = "qd-crop";
    d.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px";
    document.body.appendChild(d);
  }
  function marks() {
    // Trim corners, in body coordinates (the body is padded by the slug).
    var b = p.bleedPx, len = p.markLenPx, gap = p.markGapPx, t = p.markWeightPx;
    var x0 = slug + b, y0 = slug + b, x1 = slug + W - b, y1 = slug + H - b;
    var out = b + gap; // marks start outside the bleed
    // Horizontal marks (left and right of each trim corner) and vertical marks (above and below).
    [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(function (c, i) {
      var left = i % 2 === 0, top = i < 2;
      mark(left ? c[0] - out - len : c[0] + out, c[1] - t / 2, len, t);
      mark(c[0] - t / 2, top ? c[1] - out - len : c[1] + out, t, len);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", marks); else marks();
})();
