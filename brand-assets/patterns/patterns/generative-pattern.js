// Generative-Pattern (recipe)
// Patterns made in Pattern Studio, drawn by Pattern Studio's own engine
// (generative-engine.js), so they match the tool exactly. The preset holds the tool's
// settings, with colors as brand tokens.
//
// Any size and shape: the field and the elements keep the scale they had in the tool
// at designSize, measured by canvas area. A wider canvas shows more of the same
// field; nothing stretches. cellScaling picks what the elements do on bigger canvases:
//   "canvas": they grow with the canvas, like every other pattern
//   "fixed":  they keep their size in px, so a bigger canvas gets more of them
//
// Colors: every preset has colorways (same effects, other tokens), one or more. A
// backdrop stop can sit past the bottom of the frame, like Figma's red gradient:
// { "token": "{color.primary.500}", "at": 1.39 }.
//
// Settings shared by all generative patterns live in generative-pattern.shared.json:
// Pattern Studio's defaults (engine) and its tone curves (tones), picked by name.
//
// Static for now: one moment of the tool's loop, at settings.phase (0 to 2 pi).
// To animate later, call render() again with a changing options.phase.

import { createPatternEngine } from "./generative-engine.js";
import { resolveToken, hexToRgba } from "./tokens.js";
import { makeFrame } from "./effects.js";

const engine = createPatternEngine();

// Sizes from the tool that are in px and follow the cells.
const PIXEL_SIZES = ["cell", "padding", "lineWidth", "strokeWidth", "graphWidth"];

// The backdrop colors at the top and bottom of the frame. A stop past the bottom
// ("at" > 1) gives the color the gradient has reached at the bottom edge.
// When the first stop is also { token, at }, the gradient starts inside the frame,
// like Motion Streaks' 5.59% -> 116.67%, and the stops come back with their offsets.
function backdropColors(tokens, stops) {
  const [first, end] = stops;
  if (typeof first !== "string") {
    const a = hexToRgba(resolveToken(tokens, first.token));
    const b = hexToRgba(resolveToken(tokens, end.token ?? end));
    const from = first.at ?? 0;
    const to = end.at ?? 1;
    const colorAt = (at) => {
      const t = Math.min(1, Math.max(0, (at - from) / (to - from)));
      const hex = (i) => Math.round((a[i] + (b[i] - a[i]) * t) * 255).toString(16).padStart(2, "0");
      return `#${hex(0)}${hex(1)}${hex(2)}`.toUpperCase();
    };
    return [{ color: colorAt(from), offset: from }, { color: colorAt(Math.min(to, 1)), offset: Math.min(to, 1) }];
  }
  const top = resolveToken(tokens, first);
  if (typeof end === "string") return [top, resolveToken(tokens, end)];
  const a = hexToRgba(top);
  const b = hexToRgba(resolveToken(tokens, end.token));
  const t = 1 / end.at;
  const hex = (i) => Math.round((a[i] + (b[i] - a[i]) * t) * 255).toString(16).padStart(2, "0");
  return [top, `#${hex(0)}${hex(1)}${hex(2)}`.toUpperCase()];
}

// The engine's params for this preset at this size: the same for the canvas and the SVG.
// options.layer: no background and no backdrop at all, to draw it on top of another pattern.
function engineParams(tokens, preset, frame, options) {
  const s = preset.settings;
  const look = preset.colorways[options.colorway ?? 0];
  const { width, height } = frame;

  // How much bigger this canvas is than the one the pattern was designed at, by area.
  const scale = Math.sqrt((width * height) / (s.designSize.width * s.designSize.height));

  const params = {
    ...s.engine,
    width,
    height,
    unit: (Math.min(s.designSize.width, s.designSize.height) / 2) * scale,
    colors: look.colors.map((ref) => resolveToken(tokens, ref)),
    backdropColors: look.backdrop ? backdropColors(tokens, look.backdrop) : null,
  };
  if (s.cellRange) {
    // The grid grows with the canvas's short side between two sizes, e.g. 24 px at a
    // short side of 1080 or less up to 40 px at 2160 (4K) and above. The field is
    // measured by the short side, like Pattern Studio and the motion streaks.
    const [s0, s1] = s.cellRange.shortSide;
    const [c0, c1] = s.cellRange.cell;
    const t = Math.min(1, Math.max(0, (Math.min(width, height) - s0) / (s1 - s0)));
    const ratio = (c0 + (c1 - c0) * t) / s.engine.cell;
    params.unit = Math.min(width, height) / 2;
    for (const key of PIXEL_SIZES) params[key] = s.engine[key] * ratio;
  } else if (s.cellScaling !== "fixed") {
    for (const key of PIXEL_SIZES) params[key] = s.engine[key] * scale;
  }

  if (options.layer) { params.backdropColors = null; params.backdrop = "none"; }
  const curve = s.tones[s.tone];
  const tone = (v) => curve[Math.max(0, Math.min(curve.length - 1, Math.round(v * (curve.length - 1))))];
  const phase = options.phase ?? s.phase ?? 0;
  const background = options.layer ? null : s.background;
  return { params, tone, phase, background };
}

// frame = makeFrame(width, height). options = { phase, colorway, layer }.
export function render(canvas, tokens, preset, _input, frame = makeFrame(), options = {}) {
  const { params, tone, phase, background } = engineParams(tokens, preset, frame, options);
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  // A layer drawn on top of another pattern has no background.
  if (background) {
    ctx.fillStyle = resolveToken(tokens, background);
    ctx.fillRect(0, 0, frame.width, frame.height);
  }
  engine.drawCanvas(ctx, params, engine.compute(params, engine.createState(), phase, tone));
}

// The same pattern as vector shapes in an <svg>, through the engine's own SVG output: sharp at any print
// size and fast to make, for large print (guidelines/print/booths.md). Returns the <g> it added.
export function renderSvg(svg, tokens, preset, frame = makeFrame(), options = {}) {
  const { params, tone, phase, background } = engineParams(tokens, preset, frame, options);
  const NS = "http://www.w3.org/2000/svg";
  if (background) {
    const rect = svg.ownerDocument.createElementNS(NS, "rect");
    rect.setAttribute("width", frame.width); rect.setAttribute("height", frame.height);
    rect.setAttribute("fill", resolveToken(tokens, background));
    svg.append(rect);
  }
  engine.appendSvg(svg, params, engine.compute(params, engine.createState(), phase, tone), options.offsetX ?? 0, options.offsetY ?? 0);
  return svg.lastElementChild;
}
