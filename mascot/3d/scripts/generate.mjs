// Reference implementation of one 3D Mascot run (1 image per new pose).
// NOT RUN YET: verify parameter names against your Sunburst integration.
//   OPENAI_API_KEY=xxx node scripts/generate.mjs --emotion excited --pose pointing --direction right [--background grey]
import OpenAI, { toFile } from "openai";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildRequest } from "./build-prompt.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(ROOT, "mascot.config.json"), "utf8"));
const client = new OpenAI();

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []));
const { prompt, refs, background } = buildRequest({
  emotion: args.emotion, pose: args.pose, direction: args.direction, variant: args.variant,
  detailPhrase: args.detail, // must already be the output of the detail rewriter
  background: args.background === "grey" ? "grey" : "transparent", // grey only for the BiRefNet fallback
});

const images = await Promise.all(
  refs.map((r) => toFile(readFileSync(path.join(ROOT, r.path)), `${r.key}.png`, { type: "image/png" }))
);

const result = await client.images.edit({
  model: config.model.image,          // "gpt-image-2.5-sunburst"
  image: images,                      // master first, then pose/emotion refs
  prompt,
  n: config.model.options_per_run,  // 1
  size: "1024x1536",                  // portrait canvas fits a full-body character; finish.mjs trims and resizes
  // Path A only. Verify Sunburst supports this; remove for path B (grey + BiRefNet).
  ...(background === "transparent" ? { background: "transparent", output_format: "png" } : {}),
});

mkdirSync(path.join(ROOT, "samples"), { recursive: true });
const file = path.join(ROOT, "samples", "option-1.png");
writeFileSync(file, Buffer.from(result.data[0].b64_json, "base64"));
console.log(`saved ${file}`);
// Next: review with prompts/review.txt, then node scripts/finish.mjs samples/option-1.png --out final.png
