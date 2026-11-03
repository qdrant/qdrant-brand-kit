// Reference implementation of one Mascot run. NOT RUN YET: verify parameter
// names against your current Sunburst integration before using.
//   OPENAI_API_KEY=xxx node scripts/generate.mjs --emotion excited --pose pointing --direction right --output transparent
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
  background: args.output === "transparent" ? "transparent" : "grey",
});

const images = await Promise.all(
  refs.map((r) => toFile(readFileSync(path.join(ROOT, r.path)), `${r.key}.png`, { type: "image/png" }))
);

const result = await client.images.edit({
  model: config.model.image,          // "gpt-image-2.5-sunburst"
  image: images,                      // master first, then pose/emotion refs
  prompt,
  n: config.model.options_per_run,
  size: "1024x1536",                  // portrait canvas fits a full-body character; composite.mjs resizes
  // Path A only. Verify Sunburst supports this; remove for path B (grey + BiRefNet).
  ...(background === "transparent" ? { background: "transparent", output_format: "png" } : {}),
});

mkdirSync(path.join(ROOT, "samples"), { recursive: true });
result.data.forEach((d, i) => {
  const file = path.join(ROOT, "samples", `option-${i + 1}.png`);
  writeFileSync(file, Buffer.from(d.b64_json, "base64"));
  console.log(`saved ${file}`);
});
// Next: review each option with prompts/review.txt (vision model), then
// node scripts/composite.mjs samples/option-1.png --size slide_16x9 --output gradient --out final.png
