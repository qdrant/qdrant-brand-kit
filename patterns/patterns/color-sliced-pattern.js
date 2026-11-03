// Color-Sliced-Pattern (recipe)
// A gradient between two color tokens, cut into strips that each slide along their
// length (Figma's slice shift), with noise on top. The values come from a preset in
// presets/, for example color-sliced-pattern-a.json. Presets are fixed. The only
// choice is the colorway, and colors are always token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";
import { sliceShift, drawNoise, gradientSampler } from "./effects.js";

// color = { from, to } token references, from colorwayTokens() in tokens.js.
export function render(canvas, tokens, preset, color) {
  const { size, gradient, slice, noise } = preset.settings;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);

  const from = hexToRgba(resolveToken(tokens, color.from));
  const to = hexToRgba(resolveToken(tokens, color.to));
  sliceShift(image.data, size, slice, noise.seed + 2, gradientSampler(from, to, gradient.angle, size));
  ctx.putImageData(image, 0, 0);
  drawNoise(ctx, size, noise);
}
