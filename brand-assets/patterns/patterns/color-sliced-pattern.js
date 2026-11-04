// Color-Sliced-Pattern (recipe)
// A gradient between two color tokens, cut into strips that each slide along their
// length (Figma's slice shift). Noise is optional: a preset with "noise": null has none. The values come from a preset in
// presets/, for example color-sliced-pattern-a.json. Presets are fixed. The only
// choice is the colorway, and colors are always token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";
import { sliceShift, drawNoise, gradientSampler, makeFrame } from "./effects.js";

// color = { from, to } token references, from colorwayTokens() in tokens.js.
// frame = makeFrame(width, height): any size or shape. Defaults to 1080 x 1080.
export function render(canvas, tokens, preset, color, frame = makeFrame()) {
  const { gradient, slice, noise } = preset.settings;
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(frame.width, frame.height);

  const from = hexToRgba(resolveToken(tokens, color.from));
  const to = hexToRgba(resolveToken(tokens, color.to));
  const source = gradientSampler(from, to, gradient.angle, frame, gradient.fromStop, gradient.toStop);
  sliceShift(image.data, frame, slice, source);
  ctx.putImageData(image, 0, 0);
  if (noise) drawNoise(ctx, frame, noise);
}
