// Color-Refracted-Pattern (recipe)
// A gradient, bent into diagonal bands by a lenticular refraction, with noise on top.
// The values come from a preset in presets/, for example color-refracted-pattern-a.json.
// Presets are fixed. The only choice is the colorway, and colors are always
// token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";
import { refract, drawNoise, gradientSampler, makeFrame } from "./effects.js";

// color = { from, to } token references, from colorwayTokens() in tokens.js.
// frame = makeFrame(width, height): any size or shape. Defaults to 1080 x 1080.
export function render(canvas, tokens, preset, color, frame = makeFrame()) {
  const { gradient, refraction, noise } = preset.settings;
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(frame.width, frame.height);

  const from = hexToRgba(resolveToken(tokens, color.from));
  const to = hexToRgba(resolveToken(tokens, color.to));

  const gradientAt = gradientSampler(from, to, gradient.angle, frame);

  refract(image.data, frame, refraction, noise.seed + 1, gradientAt);
  ctx.putImageData(image, 0, 0);
  drawNoise(ctx, frame, noise);
}
