// Measures a rendered creative for tools/check.py. tools/render.py adds this script to every page.
// It only records what is on the page (positions, sizes, fonts, colors, files). Mechanics only:
// every rule and brand value is applied later by check.py, from the repo's own files.
(function () {
  // ?qd-bg=1: hide all text, so render.py can photograph what sits behind it (contrast check).
  if (new URLSearchParams(location.search).get("qd-bg")) {
    var st = document.createElement("style");
    st.textContent = "*{color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important}";
    document.head.appendChild(st);
  }
  function rect(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  function textRect(el) {
    // The box of the glyphs themselves, not the element (which may be wider).
    var range = document.createRange(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    el.childNodes.forEach(function (n) {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      range.selectNodeContents(n);
      Array.prototype.forEach.call(range.getClientRects(), function (r) {
        if (!r.width) return;
        x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top);
        x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
      });
    });
    return x1 < x0 ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function visible(el) {
    var s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0 && r.width > 0 && r.height > 0;
  }
  function role(el) {
    if (el.closest(".qd-button")) return "button";
    if (el.closest(".qd-headshot-card__name, .qd-headshot-circle__name")) return "speaker-name";
    if (el.closest(".qd-headshot-card__role, .qd-headshot-circle__role")) return "speaker-role";
    return "text";
  }
  function src(img) {
    try { return decodeURIComponent(new URL(img.currentSrc || img.src, location.href).pathname); }
    catch (e) { return img.getAttribute("src"); }
  }
  function run() {
    var canvas = document.querySelector(".qd-canvas");
    var out = { canvas: null, texts: [], images: [], logos: [], buttons: [], cards: [], circles: [], blocks: [], fonts: {} };
    if (canvas) {
      out.canvas = rect(canvas);
      out.canvas.shape = canvas.dataset.shape || null;
      out.canvas.theme = canvas.closest("[data-theme]") ? canvas.closest("[data-theme]").dataset.theme : "dark";
      out.canvas.onPattern = !!canvas.closest(".qd-on-pattern") || canvas.classList.contains("qd-on-pattern");
      var scope = canvas;
      scope.querySelectorAll("*").forEach(function (el) {
        if (!visible(el)) return;
        var own = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
        if (own && !["SCRIPT", "STYLE", "PRE"].includes(el.tagName)) {
          var s = getComputedStyle(el), tr = textRect(el);
          if (tr) out.texts.push({
            text: el.textContent.trim().replace(/\s+/g, " "), tag: el.tagName.toLowerCase(), cls: el.className || "",
            role: role(el), rect: tr, box: rect(el),
            fontSize: parseFloat(s.fontSize), family: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
            weight: +s.fontWeight, stretch: s.fontStretch, transform: s.textTransform, align: s.textAlign,
            color: s.color, letterSpacing: s.letterSpacing, lineHeight: s.lineHeight
          });
        }
        if (el.tagName === "IMG") {
          var holder = el.closest(".qd-headshot-card__photo, .qd-headshot-circle__photo");
          // A headshot is cropped by its card or circle: measure what's visible, not the whole photo.
          var info = { src: src(el), rect: rect(holder || el), loaded: el.complete && el.naturalWidth > 0,
                       cls: holder ? "headshot" : (el.className || "") };
          out.images.push(info);
          if (el.classList.contains("qd-logo") || /brand-assets\/logo\//.test(info.src)) out.logos.push(info);
        }
        if (el.classList.contains("qd-button")) out.buttons.push({ rect: rect(el), cls: el.className, text: el.textContent.trim() });
        if (el.classList.contains("qd-headshot-card__photo")) out.cards.push({ rect: rect(el) });
        if (el.classList.contains("qd-headshot-circle__photo")) out.circles.push({ rect: rect(el) });
      });
      Array.prototype.forEach.call(canvas.children, function (el) {
        if (visible(el)) out.blocks.push({ tag: el.tagName.toLowerCase(), cls: el.className || "", id: el.id || "", rect: rect(el) });
      });
    }
    out.fonts = {
      "Mona Sans": document.fonts.check('600 40px "Mona Sans"'),
      "Geist Mono": document.fonts.check('400 40px "Geist Mono"')
    };
    out.fontsUsed = Array.from(new Set(out.texts.map(function (t) { return t.family; })));
    var tag = document.createElement("script");
    tag.type = "application/json"; tag.id = "qd-measure";
    tag.textContent = JSON.stringify(out).replace(/</g, "\\u003c");
    document.body.appendChild(tag);
  }
  function start() { document.fonts.ready.then(function () { setTimeout(run, 1500); }); }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
})();
