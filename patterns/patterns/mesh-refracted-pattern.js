// Mesh-Refracted-Pattern (recipe)
// A library image, prepared by mesh-source.js (brand grade, blur, contrast), bent
// into bands by a lenticular refraction, with noise on top. The values come from a
// preset in presets/, for example mesh-refracted-pattern-a.json. Presets are fixed.

import { prepareImage } from "./mesh-source.js";
import { refract, drawNoise, brandCheck, makeFrame } from "./effects.js";

// source = a mesh from createMesh() (or a loaded image, made into a mesh first).
// frame = makeFrame(width, height): any size or shape. Defaults to 1080 x 1080.
export function render(canvas, tokens, preset, source, frame = makeFrame()) {
  const { refraction, noise } = preset.settings;
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  const { sample, anchors, palette } = prepareImage(source, tokens, preset.settings, frame);

  // Step 4: refraction. Step 5: noise.
  const out = ctx.createImageData(frame.width, frame.height);
  refract(out.data, frame, refraction, noise.seed + 1, sample);
  ctx.putImageData(out, 0, 0);
  drawNoise(ctx, frame, noise);

  // Final test: the output must stay on the brand palette.
  return brandCheck(ctx.getImageData(0, 0, frame.width, frame.height).data, anchors, { palette });
}
