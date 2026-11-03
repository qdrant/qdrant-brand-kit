// Color-Refracted-Pattern (recipe)
// A gradient, bent into diagonal bands by a lenticular refraction, with noise on top.
// The values come from a preset in presets/, for example color-refracted-pattern-a.json.
// Presets are fixed. The only choice is the colorway, and colors are always
// token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";
import { refract, drawNoise, gradientSampler } from "./effects.js";

// color = { from, to } token references, from colorwayTokens() in tokens.js.
export function render(canvas, tokens, preset, color) {
  const { size, gradient, refraction, noise } = preset.settings;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);

  const from = hexToRgba(resolveToken(tokens, color.from));
  const to = hexToRgba(resolveToken(tokens, color.to));

  const gradientAt = gradientSampler(from, to, gradient.angle, size);

  refract(image.data, size, refraction, noise.seed + 1, gradientAt);
  ctx.putImageData(image, 0, 0);
  drawNoise(ctx, size, noise);
}
