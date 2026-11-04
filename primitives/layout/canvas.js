// Fills a .qd-canvas from the window size: data-shape (kept if the canvas has data-shape-fixed),
// --qd-canvas-width and --qd-canvas-height. Use it when one HTML file is rendered
// at many sizes (the renderer opens the page at the target width × height, or passes ?w=&h=).
(function () {
  function shapeFor(ratio) {
    if (ratio > 3) return "ultrawide";
    if (ratio >= 1.4) return "wide";
    if (ratio >= 0.85) return "square";
    if (ratio >= 0.65) return "portrait";
    return "story";
  }
  function fit() {
    // ?w=1080&h=1350 wins over the window (review/render.py uses it: headless Chrome's window
    // height isn't reliable). Otherwise the window size.
    var q = new URLSearchParams(location.search);
    var w = +q.get("w") || window.innerWidth, h = +q.get("h") || window.innerHeight;
    document.querySelectorAll(".qd-canvas").forEach(function (el) {
      if (!el.hasAttribute("data-shape-fixed")) el.dataset.shape = shapeFor(w / h);
      el.style.setProperty("--qd-canvas-width", w);
      el.style.setProperty("--qd-canvas-height", h);
    });
  }
  fit();
  window.addEventListener("resize", fit);
})();
