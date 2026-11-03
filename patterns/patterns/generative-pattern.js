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
// Colors: settings.colors and settings.backdrop, or a list of colorways in the preset
// (same effects, other tokens). A backdrop stop can sit past the bottom of the frame,
// like Figma's red gradient: { "token": "{color.primary.500}", "at": 1.39 }.
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
function backdropColors(tokens, stops) {
  const top = resolveToken(tokens, stops[0]);
  const end = stops[1];
  if (typeof end === "string") return [top, resolveToken(tokens, end)];
  const a = hexToRgba(top);
  const b = hexToRgba(resolveToken(tokens, end.token));
  const t = 1 / end.at;
  const hex = (i) => Math.round((a[i] + (b[i] - a[i]) * t) * 255).toString(16).padStart(2, "0");
  return [top, `#${hex(0)}${hex(1)}${hex(2)}`.toUpperCase()];
}

// frame = makeFrame(width, height). options = { phase, colorway }.
export function render(canvas, tokens, preset, _input, frame = makeFrame(), options = {}) {
  const s = preset.settings;
  const look = preset.colorways?.[options.colorway ?? 0] ?? s;
  const { width, height } = frame;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

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
  if (s.cellScaling !== "fixed") {
    for (const key of PIXEL_SIZES) params[key] = s.engine[key] * scale;
  }

  ctx.fillStyle = resolveToken(tokens, s.background);
  ctx.fillRect(0, 0, width, height);
  const tone = (v) => s.tone[Math.max(0, Math.min(s.tone.length - 1, Math.round(v * (s.tone.length - 1))))];
  const phase = options.phase ?? s.phase ?? 0;
  engine.drawCanvas(ctx, params, engine.compute(params, engine.createState(), phase, tone));
}
