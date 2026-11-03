// Assembles the 2D Sunburst prompt + ordered reference list from mascot-2d.config.json.
// Pure function, no network. Usage:
//   node scripts/build-prompt.mjs --emotion excited --pose pointing --direction right
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(ROOT, "mascot-2d.config.json"), "utf8"));
const bullets = (lines) => lines.map((l) => `- ${l}`).join("\n");

export function buildRequest({ emotion, pose, direction, detailPhrase = "" }) {
  const e = config.emotions[emotion];
  const p = config.poses[pose];
  if (!e) throw new Error(`Unknown emotion "${emotion}". Options: ${Object.keys(config.emotions).join(", ")}`);
  if (!p) throw new Error(`Unknown pose "${pose}". Options: ${Object.keys(config.poses).join(", ")}`);
  if (p.direction && !["left", "right"].includes(direction)) throw new Error(`Pose "${pose}" needs --direction left|right`);

  const tpl = readFileSync(path.join(ROOT, config.prompt_files.master), "utf8");
  const prompt = tpl
    .replace("{locked_style}", bullets(config.locked_style))
    .replace("{locked_character}", bullets(config.locked_character))
    .replace("{emotion_phrase}", e.phrase)
    .replace("{pose_phrase}", p.phrase.replace("{direction}", config.direction_phrases[direction] ?? ""))
    .replace("{detail_phrase}", detailPhrase || "No props")
    .replace("{background_phrase}", config.background_phrase);

  // Master, pose refs, emotion ref. Deduped by file (master and happy are the same image), max 4.
  const seen = new Set();
  const refs = [];
  for (const k of ["master", ...p.refs, e.ref]) {
    const ref = config.references[k];
    if (!ref || seen.has(ref.hash)) continue;
    seen.add(ref.hash);
    refs.push({ key: k, path: ref.path });
    if (refs.length === 4) break;
  }
  return { prompt, refs };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), [])
  );
  const out = buildRequest({ emotion: args.emotion, pose: args.pose, direction: args.direction, detailPhrase: args.detail });
  console.log(out.prompt);
  console.log("\nReferences:", out.refs.map((r) => r.key).join(", "));
}
