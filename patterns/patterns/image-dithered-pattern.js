// Image-Dithered-Pattern (recipe)
// A library image, prepared by image-source.js (brand grade, blur, contrast), then
// turned into a pixel dither (Figma's Bayer dither). No noise: the dither is the
// texture. The values come from a preset in presets/, for example
// image-dithered-pattern-a.json. Presets are fixed.

import { prepareImage } from "./image-source.js";
import { dither, brandCheck } from "./effects.js";

// image = a loaded <img> or ImageBitmap of the source.
export function render(canvas, tokens, preset, image) {
  const { size } = preset.settings;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const { sample, anchors, palette } = prepareImage(image, tokens, preset.settings);

  // The smooth image at full size, then Step 4: dither.
  const out = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) out.data[i + c] = 255 * sample(x, y, c);
      out.data[i + 3] = 255;
    }
  }
  dither(out.data, size, preset.settings.dither);
  ctx.putImageData(out, 0, 0);

  // Final test: the output must stay on the brand palette.
  return brandCheck(out.data, anchors, { palette });
}
