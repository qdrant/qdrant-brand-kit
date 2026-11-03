// Image-Sliced-Pattern (recipe)
// A library image, prepared by image-source.js (brand grade, blur, contrast), cut
// into thin strips that each slide along their length by a random amount (Figma's
// slice shift), with noise on top. The values come from a preset in presets/, for
// example image-sliced-pattern-a.json. Presets are fixed.

import { prepareImage } from "./image-source.js";
import { sliceShift, drawNoise, brandCheck } from "./effects.js";

// image = a loaded <img> or ImageBitmap of the source.
export function render(canvas, tokens, preset, image) {
  const { size, slice, noise } = preset.settings;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const { sample, anchors, palette } = prepareImage(image, tokens, preset.settings);

  // Step 4: slice shift. Step 5: noise.
  const out = ctx.createImageData(size, size);
  sliceShift(out.data, size, slice, noise.seed + 2, sample);
  ctx.putImageData(out, 0, 0);
  drawNoise(ctx, size, noise);

  // Final test: the output must stay on the brand palette.
  return brandCheck(ctx.getImageData(0, 0, size, size).data, anchors, { palette });
}
