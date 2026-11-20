// Print helper for review/print.py. render.py adds it to every page; it does nothing unless the URL
// has ?qd-print=... (set by print.py). Mechanics only: the sizes come from print.py, which reads them
// from guidelines/print/print.tokens.json and the printer's spec.
//
// - Margins: the canvas margins become bleed + safe area, so text, the logo and the button stay
//   inside the printer's safe area. Folds and a hidden bottom (roll-ups) are passed along for the checks.
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
    });
  }
  apply();
  document.addEventListener("DOMContentLoaded", apply);
  window.__qdPrint = p;

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
