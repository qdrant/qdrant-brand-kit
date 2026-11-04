// Downloads the original transparent PNGs (no glow effects) for every reference
// in mascot-2d.config.json, straight from the Figma image fills.
// Needs a Figma personal access token with file read access:
//   FIGMA_TOKEN=xxx node scripts/export-references.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(ROOT, "mascot-2d.config.json"), "utf8"));
const token = process.env.FIGMA_TOKEN;
if (!token) throw new Error("Set FIGMA_TOKEN");

// GET /v1/files/:key/images returns { meta: { images: { <imageHash>: <url> } } }
const res = await fetch(`https://api.figma.com/v1/files/${config.figma.file_key}/images`, {
  headers: { "X-Figma-Token": token },
});
if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
const urls = (await res.json()).meta.images;

mkdirSync(path.join(ROOT, "references"), { recursive: true });
for (const [key, ref] of Object.entries(config.references)) {
  if (key.startsWith("_")) continue;
  const url = urls[ref.hash];
  if (!url) { console.warn(`No image URL for ${key} (${ref.hash})`); continue; }
  const img = await fetch(url);
  writeFileSync(path.join(ROOT, ref.path), Buffer.from(await img.arrayBuffer()));
  console.log(`saved ${ref.path}`);
}
