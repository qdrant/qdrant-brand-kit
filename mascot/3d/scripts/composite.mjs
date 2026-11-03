// Places a transparent mascot cutout on the exact brand gradient with the Figma glow,
// or exports a clean transparent canvas at a channel size.
// Usage:
//   node scripts/composite.mjs <cutout.png> --size slide_16x9 --output gradient --position right --out out.png
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(ROOT, "mascot.config.json"), "utf8"));

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function gradientSvg(w, h) {
  const stops = config.backdrop.stops
    .map((s) => `<stop offset="${s.pos * 100}%" stop-color="${s.hex}"/>`).join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>
       <rect width="100%" height="100%" fill="url(#g)"/></svg>`
  );
}

// Recreates the Figma drop-shadow stack: tinted, blurred copies of the silhouette, offset upward.
async function glowLayers(mascotBuf, mw, mh, left, top, canvasW, canvasH) {
  const { color, reference_height, layers } = config.glow;
  const scale = mh / reference_height;
  const { r, g, b } = hexToRgb(color);
  const alpha = await sharp(mascotBuf).extractChannel("alpha").toBuffer();
  const out = [];
  for (const l of layers) {
    const pad = Math.ceil(l.blur * scale * 2);
    // Solid colour silhouette from the cutout's alpha, scaled by layer opacity.
    const silhouette = await sharp({ create: { width: mw, height: mh, channels: 3, background: { r, g, b } } })
      .joinChannel(await sharp(alpha).linear(l.opacity, 0).toBuffer())
      .png().toBuffer();
    const blurred = await sharp(silhouette)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .blur(Math.max(0.3, (l.blur * scale) / 2)) // Figma blur radius ≈ 2 × Gaussian sigma
      .png().toBuffer();
    out.push({
      input: blurred,
      left: Math.round(left - pad),
      top: Math.round(top - pad + l.offset_y * scale),
    });
  }
  // Clip layers that fall outside the canvas (sharp rejects negative/oversized placement).
  return Promise.all(out.map(async (o) => clip(o, canvasW, canvasH)));
}

async function clip({ input, left, top }, W, H) {
  const meta = await sharp(input).metadata();
  const x0 = Math.max(0, -left), y0 = Math.max(0, -top);
  const w = Math.min(meta.width - x0, W - Math.max(0, left));
  const h = Math.min(meta.height - y0, H - Math.max(0, top));
  if (w <= 0 || h <= 0) return null;
  const buf = await sharp(input).extract({ left: x0, top: y0, width: w, height: h }).toBuffer();
  return { input: buf, left: Math.max(0, left), top: Math.max(0, top) };
}

export async function composite(cutoutPath, { size = "social_square", output = "gradient", position = "center", out }) {
  const { w: W, h: H } = config.sizes[size];
  const { mascot_height_ratio, side_margin_ratio } = config.placement;

  const trimmed = await sharp(cutoutPath).trim({ threshold: 1 }).png().toBuffer();
  const targetH = Math.round(H * mascot_height_ratio);
  const mascot = await sharp(trimmed).resize({ height: targetH, width: Math.round(W * 0.9), fit: "inside" }).png().toBuffer();
  const { width: mw, height: mh } = await sharp(mascot).metadata();

  const margin = W * side_margin_ratio;
  const left = position === "left" ? margin : position === "right" ? W - mw - margin : (W - mw) / 2;
  const top = (H - mh) / 2;

  const base = output === "gradient"
    ? sharp(gradientSvg(W, H)).png()
    : sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png();

  const layers = [];
  if (config.glow.apply_on.includes(output)) layers.push(...(await glowLayers(mascot, mw, mh, left, top, W, H)).filter(Boolean));
  layers.push({ input: mascot, left: Math.round(left), top: Math.round(top) });

  await base.composite(layers).toFile(out);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cutout, ...rest] = process.argv.slice(2);
  const args = Object.fromEntries(rest.reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
  await composite(cutout, args);
  console.log(`saved ${args.out}`);
}
