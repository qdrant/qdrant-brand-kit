// Refracted Image (recipe)
// A library image, blurred (then flattened, like pasting it as a PNG) and bent into diagonal bands by a lenticular refraction,
// with noise on top. The values come from a preset in presets/, for example
// refracted-image-a.json. Presets are fixed. The only choice is the source image,
// which must be a space or astronaut image from the Design Lab library: never the
// mascot, never a Luma image.

import { refract, drawNoise } from "./effects.js";

// image = a loaded <img> or ImageBitmap of the source.
export function render(canvas, tokens, preset, image) {
  const { size, blur, refraction, noise } = preset.settings;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Step 1: fill the square like CSS object-fit: cover, and blur it.
  // Step 2 is the refraction, then the noise.
  // A big blur pulls in transparent edges and darkens them, so blur a 3x3 mirrored
  // copy of the image and keep the middle tile.
  const tile = document.createElement("canvas");
  tile.width = tile.height = size;
  const scale = Math.max(size / image.width, size / image.height);
  tile.getContext("2d").drawImage(image, (size - image.width * scale) / 2, (size - image.height * scale) / 2, image.width * scale, image.height * scale);

  const source = document.createElement("canvas");
  source.width = source.height = size;
  const sctx = source.getContext("2d");
  sctx.filter = `blur(${blur.radius * FIGMA_BLUR_TO_CSS}px)`;
  for (let ty = -1; ty <= 1; ty++) {
    for (let tx = -1; tx <= 1; tx++) {
      sctx.save();
      // A flipped tile drawn from an offset of 0 lands left/above, from 2 * size right/below.
      sctx.translate(tx > 0 ? 2 * size : 0, ty > 0 ? 2 * size : 0);
      sctx.scale(tx ? -1 : 1, ty ? -1 : 1);
      sctx.drawImage(tile, 0, 0);
      sctx.restore();
    }
  }
  const src = sctx.getImageData(0, 0, size, size).data;

  // Edge wrap "Zero": outside the image, keep the nearest edge pixel.
  const sample = (x, y, channel) => {
    const sx = Math.min(size - 1, Math.max(0, Math.round(x)));
    const sy = Math.min(size - 1, Math.max(0, Math.round(y)));
    return src[(sy * size + sx) * 4 + channel] / 255;
  };

  const out = ctx.createImageData(size, size);
  refract(out.data, size, refraction, noise.seed + 1, sample);
  ctx.putImageData(out, 0, 0);
  drawNoise(ctx, size, noise);
}

// Figma's layer blur value to a CSS blur radius in pixels.
const FIGMA_BLUR_TO_CSS = 0.12;
