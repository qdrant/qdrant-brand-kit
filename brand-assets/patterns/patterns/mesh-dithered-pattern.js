// Mesh-Dithered-Pattern (recipe)
// A library image, prepared by mesh-source.js (brand grade, blur, contrast), then
// turned into a pixel dither (Figma's Bayer dither). No noise: the dither is the
// texture. The values come from a preset in presets/, for example
// mesh-dithered-pattern-a.json. Presets are fixed.

import { prepareImage } from "./mesh-source.js";
import { dither, brandCheck, makeFrame } from "./effects.js";

// source = a mesh from createMesh() (or a loaded image, made into a mesh first).
// frame = makeFrame(width, height): any size or shape. Defaults to 1080 x 1080.
export function render(canvas, tokens, preset, source, frame = makeFrame()) {
  const { width, height } = frame;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const { sample, anchors, palette } = prepareImage(source, tokens, preset.settings, frame);

  // The smooth mesh at full size, then Step 4: dither.
  const out = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) out.data[i + c] = 255 * sample(x, y, c);
      out.data[i + 3] = 255;
    }
  }
  dither(out.data, frame, preset.settings.dither);
  ctx.putImageData(out, 0, 0);

  // Final test: the output must stay on the brand palette.
  return brandCheck(out.data, anchors, { palette });
}
