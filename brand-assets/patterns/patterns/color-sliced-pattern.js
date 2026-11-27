// Color-Sliced-Pattern (recipe)
// A gradient between two color tokens, cut into strips that each slide along their
// length (Figma's slice shift). Noise is optional: a preset with "noise": null has none. The values come from a preset in
// presets/, for example color-sliced-pattern-a.json. Presets are fixed. The only
// choice is the colorway, and colors are always token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";
import { sliceShift, drawNoise, gradientSampler, makeFrame, orderedDither } from "./effects.js";

// color = { from, to } token references, from colorwayTokens() in tokens.js.
// frame = makeFrame(width, height): any size or shape. Defaults to 1080 x 1080.
// options.stripes = index into the preset's approved "stripes" (thickness and angle);
// left out, the slices are the preset's own.
export function render(canvas, tokens, preset, color, frame = makeFrame(), options = {}) {
  const { gradient, noise } = preset.settings;
  const stripes = options.stripes == null ? null : preset.settings.stripes?.[options.stripes];
  if (options.stripes != null && !stripes) throw new Error(`${preset.name} has no approved stripes #${options.stripes}`);
  const slice = stripes ? { ...preset.settings.slice, r: stripes.thickness, a: stripes.angle } : preset.settings.slice;
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(frame.width, frame.height);

  const from = hexToRgba(resolveToken(tokens, color.from));
  const to = hexToRgba(resolveToken(tokens, color.to));
  const source = gradientSampler(from, to, gradient.angle, frame, gradient.fromStop, gradient.toStop);
  // Slices are worked out in full precision, then turned into 8-bit color with an ordered
  // dither, so the long dark gradients don't band (visual designer, 2026-11-26).
  const exact = new Float32Array(frame.width * frame.height * 4);
  sliceShift(exact, frame, slice, source);
  orderedDither(exact, image.data, frame.width);
  ctx.putImageData(image, 0, 0);
  if (noise) drawNoise(ctx, frame, noise);
}
