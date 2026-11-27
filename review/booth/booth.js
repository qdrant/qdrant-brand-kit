// Booth background and guides (guidelines/print/booths.md, visual designer, 2026-11-27).
//
//   <canvas class="qd-booth-base"></canvas>      first child of the .qd-canvas: gradient + streaks
//   <svg class="qd-booth-look"></svg>            second: the look, vector, drawn as a layer
//   <script type="module">
//     import { boothBackground } from "/review/booth/booth.js";
//     await boothBackground({ booth: BOOTH, base: { colorway: "Background → Indigo 900" },
//                             look: { preset: "Generative-Pulse-Pattern" }, content: ["logo", "heading", ...] });
//   </script>
//
// BOOTH is the piece's geometry in inches from the top left of the trim, written into the page as JSON in
// <script type="application/json" id="qd-booth">: { trim: [w, h], safe, stands, zones: [{ name, x, y, w, h }] }.
// print.py reads it to draw the guides on the drafts and to check keep-clear zones.
//
// Why this shape (2026-11-27): the base is soft (gradient and streaks), so it's painted at the page's own
// size, which print.py keeps small and enlarges; the look has sharp edges, so it's vector and stays sharp at
// any size. Nothing here paints a full-size high-resolution image, so a 10 ft wall renders in seconds.

const REPO = "/repo/brand-assets/patterns";

// Opacity of each look element from its distance to the nearest content block: 0 inside the clear space,
// rising linearly to 1 over the fade distance. The look never sits behind text (booths.md section 3).
function fadeAround(group, blocks, clearPx, fadePx) {
  const els = Array.from(group.querySelectorAll("circle, polygon, line, text, rect, path"));
  for (const el of els) {
    const b = el.getBBox();
    const cx = b.x + b.width / 2 + (group.__dx || 0), cy = b.y + b.height / 2 + (group.__dy || 0);
    let d = Infinity;
    for (const r of blocks) {
      const dx = Math.max(r.left - cx, 0, cx - r.right), dy = Math.max(r.top - cy, 0, cy - r.bottom);
      d = Math.min(d, Math.hypot(dx, dy));
    }
    const a = Math.max(0, Math.min(1, (d - clearPx) / fadePx));
    if (a <= 0.02) el.remove();
    else if (a < 1) el.setAttribute("opacity", String(Math.round(a * (parseFloat(el.getAttribute("opacity") || "1")) * 100) / 100));
  }
}

export async function boothBackground({ booth, base = {}, look = {}, content = [], tokensFile } = {}) {
  const { loadTokens, loadPatterns, renderPattern, renderPatternSvg } = await import(REPO + "/patterns/index.js");
  const tokens = await loadTokens(tokensFile || REPO + "/tokens/placeholder.tokens.json");
  const patterns = await loadPatterns(REPO + "/presets");
  const by = (name) => { const p = patterns.find((x) => x.name === name); if (!p) throw new Error("No preset " + name); return p; };
  await document.fonts.ready;
  const q = new URLSearchParams(location.search);
  const W = +q.get("w") || innerWidth, H = +q.get("h") || innerHeight;   // the window print.py opened
  const P = JSON.parse(q.get("qd-print") || "{}");
  const inch = (P.pxPerMm || W / (booth.trim[0] * 25.4)) * 25.4, B = P.bleedPx || 0;
  const cv = document.querySelector(".qd-canvas");

  // 1. Base: Motion Streaks A (gradient + streaks), at the page's own size.
  const streaks = by(base.preset || "Motion-Streaks-Pattern-A");
  const cw = Math.max(0, streaks.colorways.findIndex((c) => c.name === (base.colorway || "Background → Indigo 900")));
  const canvas = cv.querySelector("canvas.qd-booth-base");
  renderPattern(canvas, tokens, streaks, { colorway: cw, width: W, height: H, streaks: base.streaks });
  Object.assign(canvas.style, { position: "absolute", left: 0, top: 0, width: W + "px", height: H + "px", zIndex: 0 });

  // 2. Look: one approved generative pattern, vector, as a layer with no background. Centred in the open
  //    area (look.center, in inches; default: the middle of the right third) and drawn on a frame big enough
  //    to cover the whole piece from there, so it fills the full height with no cut edge.
  const svg = cv.querySelector("svg.qd-booth-look");
  Object.assign(svg.style, { position: "absolute", left: 0, top: 0, zIndex: 0, overflow: "hidden" });
  svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  if (look.preset !== null) {
    const preset = by(look.preset || "Generative-Rings-Pattern");
    const lcw = Math.max(0, preset.colorways.findIndex((c) => c.name === (look.colorway || "Background → Indigo 900")));
    const cx = B + (look.center ? look.center[0] : booth.trim[0] * 5 / 6) * inch;
    const cy = B + (look.center ? look.center[1] : booth.trim[1] / 2) * inch;
    const fw = 2 * Math.max(cx, W - cx), fh = 2 * Math.max(cy, H - cy);
    const g = renderPatternSvg(svg, tokens, preset, { layer: true, colorway: lcw, variant: look.variant, look: look.look,
      width: fw, height: fh, offsetX: cx - fw / 2, offsetY: cy - fh / 2 });
    g.__dx = cx - fw / 2; g.__dy = cy - fh / 2;
    g.classList.add("qd-booth-look__shapes");
    const blocks = content.map((id) => document.getElementById(id)).filter(Boolean).map((el) => el.getBoundingClientRect());
    const cvr = cv.getBoundingClientRect();
    fadeAround(g, blocks.map((r) => ({ left: r.left - cvr.left, right: r.right - cvr.left, top: r.top - cvr.top, bottom: r.bottom - cvr.top })),
      (look.clearIn ?? 2.5) * inch, (look.fadeIn ?? 8) * inch);
  }
  document.documentElement.dataset.boothReady = "1";   // print.py waits for this before it photographs
  return { W, H, inch, B };
}

// The heading at the largest booth step (booths.tokens.json type.titleSteps) whose longest word fits its
// column; never below the smallest step. Returns the size in pt and whether it fit.
export function fitHeading(el, columnPx, stepsPt, ptToPx) {
  const words = el.textContent.split(/\s+/).filter(Boolean);
  const keep = el.textContent, ws = el.style.whiteSpace;
  el.style.whiteSpace = "nowrap";
  const widest = (px) => { el.style.fontSize = px + "px"; let m = 0; for (const w of words) { el.textContent = w; m = Math.max(m, el.getBoundingClientRect().width); } return m; };
  const steps = [...stepsPt].sort((a, b) => b - a);
  let pick = steps[steps.length - 1], fit = false;
  for (const s of steps) if (widest(s * ptToPx) <= columnPx) { pick = s; fit = true; break; }
  el.textContent = keep; el.style.whiteSpace = ws; el.style.fontSize = pick * ptToPx + "px";
  return { pt: pick, fit };
}
