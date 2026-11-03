// Finishes a transparent cutout: trims to the character, adds even transparent
// padding, and exports at a fixed long edge. No backdrop, ever.
//   node scripts/finish.mjs <option.png> --out final.png
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(ROOT, "mascot.config.json"), "utf8"));

export async function finish(input, out) {
  const { padding_ratio, long_edge_px } = config.finish;
  const trimmed = await sharp(input).ensureAlpha().trim({ threshold: 1 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const pad = Math.round(Math.max(width, height) * padding_ratio);
  const padded = await sharp(trimmed)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const resize = width >= height ? { width: long_edge_px } : { height: long_edge_px };
  await sharp(padded).resize({ ...resize, kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(out);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [input, flag, out] = process.argv.slice(2);
  if (!input || flag !== "--out" || !out) throw new Error("Usage: node scripts/finish.mjs <in.png> --out <out.png>");
  await finish(input, out);
  console.log(`saved ${out}`);
}
