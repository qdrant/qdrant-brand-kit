// Assembles the Sunburst prompt + ordered reference list from mascot.config.json.
// Pure function, no network. Usage:
//   node scripts/build-prompt.mjs --emotion excited --pose pointing --direction right [--background grey]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(ROOT, "mascot.config.json"), "utf8"));

export function buildRequest({ emotion, pose, direction, variant = "default", detailPhrase = "", background = "transparent" }) {
  const e = config.emotions[emotion];
  const p = config.poses[pose];
  const v = config.variants[variant];
  if (!e) throw new Error(`Unknown emotion "${emotion}". Options: ${Object.keys(config.emotions).join(", ")}`);
  if (!p) throw new Error(`Unknown pose "${pose}". Options: ${Object.keys(config.poses).join(", ")}`);
  if (!v) throw new Error(`Unknown variant "${variant}"`);
  if (p.direction && !["left", "right"].includes(direction)) throw new Error(`Pose "${pose}" needs --direction left|right`);

  const posePhrase = p.phrase.replace("{direction}", config.direction_phrases[direction] ?? "");
  const bgKey = background === "transparent" ? "transparent" : "fallback_grey";

  const tpl = readFileSync(path.join(ROOT, config.prompt_files.master), "utf8");
  const prompt = tpl
    .replace("{locked_character}", config.locked_character.map((l) => `- ${l}`).join("\n"))
    .replace("{emotion_phrase}", e.phrase)
    .replace("{pose_phrase}", posePhrase)
    .replace("{variant_phrase}", v.phrase)
    .replace("{detail_phrase}", detailPhrase || "No props")
    .replace("{background_phrase}", config.backgrounds[bgKey]);

  // Reference order: master, pose refs, emotion ref, variant ref. Deduped, max 4.
  const keys = ["master", ...p.refs, e.ref, v.extra_ref].filter(Boolean);
  const refs = [...new Set(keys)].slice(0, 4).map((k) => ({ key: k, path: config.references[k].path }));

  return { prompt, refs, background: bgKey };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), [])
  );
  const out = buildRequest({
    emotion: args.emotion, pose: args.pose, direction: args.direction,
    variant: args.variant, detailPhrase: args.detail, background: args.background === "grey" ? "grey" : "transparent",
  });
  console.log(out.prompt);
  console.log("\nReferences:", out.refs.map((r) => r.key).join(", "));
}
