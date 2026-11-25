// Checks every pattern before it ships. Run from the patterns folder:
//
//   node scripts/validate.mjs
//
// Errors (exit code 1): a preset that can't render, like a missing recipe, a token
// that doesn't exist. Warnings: values off the 8 grid.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { letterLayerProblems, fromStudioParams } from "../patterns/letter-variations.js";
import { lookProblems } from "../patterns/look-variations.js";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const warnings = [];

const tokens = read("tokens/placeholder.tokens.json");
// The pattern tokens are named like the color primitives. primary, secondary,
// neutral.white and neutral.black are legacy aliases: presets never use them.
for (const file of readdirSync("presets").map((f) => `presets/${f}`)) {
  if (!file.endsWith(".json")) continue;
  const text = readFileSync(file, "utf8");
  const legacy = text.match(/color\.(primary|secondary)\.[a-z0-9]+|color\.neutral\.(white|black)\b/);
  if (legacy) errors.push(`${file}: uses the legacy name ${legacy[0] ?? legacy}; use the color primitive's name (e.g. color.indigo.600)`);
}
const tokenExists = (path) => path.split(".").slice(1).reduce((node, key) => node?.[key], tokens.color)?.$value !== undefined;

// Recipes registered in patterns/index.js.
const entry = readFileSync("patterns/index.js", "utf8");
const recipes = [...entry.matchAll(/^\s+"([a-z-]+)": \w+,$/gm)].map((m) => m[1]);
for (const recipe of recipes) if (!existsSync(`patterns/${recipe}.js`)) errors.push(`Recipe "${recipe}" is registered but patterns/${recipe}.js is missing`);

// The settings each recipe needs, besides size.
const needs = {
  "color-sliced-pattern": ["gradient", "slice", "noise"],
  "motion-streaks-pattern": ["gradient", "streaks"],
  "generative-pattern": ["designSize", "background", "engine", "tone"],
};

function load(id) {
  const path = `presets/${id}.json`;
  if (!existsSync(path)) throw new Error(`presets/${id}.json is missing`);
  const preset = read(path);
  if (!preset.extends) return preset;
  const { $description, ...shared } = load(preset.extends);
  const settings = { ...shared.settings, ...preset.settings };
  if (shared.settings?.engine || preset.settings?.engine) settings.engine = { ...shared.settings?.engine, ...preset.settings?.engine };
  return { ...shared, ...preset, settings };
}

const onGrid = (v) => Number.isInteger(v) && v % 8 === 0;
const ids = read("presets/index.json");

for (const id of ids) {
  let p;
  try {
    p = load(id);
  } catch (e) {
    errors.push(e.message);
    continue;
  }
  const where = p.name ?? id;

  // Name and file agree: Color-Sliced-Pattern-A <-> color-sliced-pattern-a.json.
  // Generative patterns have no letter: one pattern per element, looks as variants (Vanesa, 2026-11-24).
  const named = p.recipe === "generative-pattern" ? /^Generative-[A-Z][a-z]+-Pattern$/ : /^(Color|Motion)-[A-Z][a-z]+-Pattern-[A-Z]$/;
  if (!named.test(p.name ?? "")) errors.push(`${where}: name should look like ${p.recipe === "generative-pattern" ? "Generative-Burst-Pattern" : "Color-Sliced-Pattern-A"}`);
  else if (p.name.toLowerCase() !== id) errors.push(`${where}: file should be presets/${p.name.toLowerCase()}.json`);

  if (!recipes.includes(p.recipe)) errors.push(`${where}: recipe "${p.recipe}" isn't registered in patterns/index.js`);
  if (p.recipe !== "generative-pattern" && p.settings?.size !== 1080) errors.push(`${where}: settings.size should be 1080`);
  for (const key of needs[p.recipe] ?? []) if (!(key in (p.settings ?? {}))) errors.push(`${where}: settings.${key} is missing`);

  if (p.recipe === "generative-pattern") {
    // Generative pattern: one or more colorways, all tokens that exist, and a tone
    // curve that's in the shared file.
    const looks = p.colorways ?? [];
    if (!looks.length) errors.push(`${where}: no colorways`);
    for (const look of looks) if (!look.name || !look.colors?.length || !look.backdrop) errors.push(`${where}: every colorway needs a name, colors and a backdrop`);
    // Elements are never lighter than the 500 step, so they blend with the gradient
    // (Vanesa, 2026-11-25). Colorways on hold (light neutral) are exempt.
    for (const look of looks) if (!look.onHold) for (const ref of look.colors ?? []) {
      const step = Number(String(ref).match(/\.([0-9]+)\}$/)?.[1]);
      if (step < 500) errors.push(`${where} / ${look.name}: element color ${ref} is lighter than the 500 step`);
    }
    if (!p.settings?.tones?.[p.settings?.tone]) errors.push(`${where}: tone curve "${p.settings?.tone}" isn't in settings.tones`);
    const refs = looks.flatMap((look) => [...(look.colors ?? []), ...(look.backdrop ?? []).map((stop) => stop?.token ?? stop)]);
    for (const ref of [...refs, p.settings?.background]) {
      if (typeof ref !== "string" || !/^\{.+\}$/.test(ref)) errors.push(`${where}: color ${ref} should be a token like {color.indigo.600}`);
      else if (!tokenExists(ref.slice(1, -1))) errors.push(`${where}: token ${ref} doesn't exist`);
    }
  } else {
    // Color pattern: every colorway points at tokens that exist.
    if (!p.colorways?.length) errors.push(`${where}: no colorways`);
    for (const colorway of p.colorways ?? []) {
      const families = colorway.families ?? Object.keys(tokens.color);
      if ((colorway.from + colorway.to).includes("{family}") && !colorway.families) errors.push(`${where} / ${colorway.name}: a {family} colorway needs a "families" list, so it can't pick neutral (gray)`);
      for (const f of colorway.families ?? []) if (!tokens.color[f]) errors.push(`${where} / ${colorway.name}: family "${f}" doesn't exist`);
      for (const path of [colorway.from, colorway.to, ...(colorway.streak ? [colorway.streak] : [])]) {
        const ok = path.includes("{family}") ? families.some((f) => tokenExists(path.replace("{family}", f))) : tokenExists(path);
        if (!ok) errors.push(`${where} / ${colorway.name}: no token for ${path}`);
      }
    }
  }

  // Motion streaks: defaults inside the approved ranges (patterns/motion-streaks-pattern.js).
  if (p.recipe === "motion-streaks-pattern") {
    const ranges = { length: [16, 80], density: [8, 64], softness: [32, 64] };
    for (const [key, [lo, hi]] of Object.entries(ranges)) {
      const v = p.settings?.streaks?.[key];
      if (!(v >= lo && v <= hi)) errors.push(`${where}: streaks.${key} is ${v}, outside the approved ${lo} to ${hi}`);
      else if (v % 8 !== 0) errors.push(`${where}: streaks.${key} is ${v}, not on the 8 grid`);
    }
    const dirs = [0, 124, 144, 160, 288, 320]; // STREAK_DIRECTIONS in patterns/motion-streaks-pattern.js
    if (!dirs.includes(p.settings?.streaks?.direction)) errors.push(`${where}: streaks.direction is ${p.settings?.streaks?.direction}; approved: ${dirs.join(", ")}`);
  }

  // Approved variants (generative): only engine settings the pattern already has.
  for (const v of p.settings?.variants ?? []) {
    const { name, colorSteps, ...values } = v;
    if (colorSteps && !(Array.isArray(colorSteps) && colorSteps.every((x) => x >= 500))) errors.push(`${where}: variant "${name}" colorSteps must be steps of 500 or darker`);
    const unknown = Object.keys(values).filter((k) => !(k in (p.settings?.engine ?? {})));
    if (unknown.length) errors.push(`${where}: variant "${name}" sets ${unknown.join(", ")}, which the engine doesn't have`);
  }

  // Open looks: the ranges hold the pattern as approved and every approved variant, every
  // key is an engine setting, and cell bounds sit on the 8 grid (Vanesa, 2026-11-25).
  const ranges = p.settings?.look?.ranges;
  if (ranges) {
    const engine = p.settings.engine ?? {};
    for (const key of Object.keys(ranges)) if (!(key in engine)) errors.push(`${where}: look range "${key}" isn't an engine setting`);
    if (ranges.cell && ranges.cell.some((c) => c % 8 !== 0)) errors.push(`${where}: look range cell ${ranges.cell.join("–")} isn't on the 8 grid`);
    const pick = (values) => Object.fromEntries(Object.keys(ranges).filter((k) => k in values).map((k) => [k, values[k]]));
    for (const problem of lookProblems(p, pick(engine))) errors.push(`${where}: as approved, ${problem}`);
    for (const v of p.settings?.variants ?? []) for (const problem of lookProblems(p, pick(v))) errors.push(`${where}: variant "${v.name}": ${problem}`);
  }

  // Approved letter options: only the settings a letter variation may change.
  for (const o of p.settings?.letterOptions ?? []) {
    const { name, source, ...values } = o;
    const changes = fromStudioParams(values);
    const extra = Object.keys(values).filter((k) => !(k in changes));
    if (extra.length) errors.push(`${where}: letter option "${name}" sets ${extra.join(", ")}, which letter layers can't change`);
    if (values.scale != null && (values.scale < 0.45 || values.scale > 0.65)) errors.push(`${where}: letter option "${name}" scale ${values.scale} is outside 0.45 to 0.65`);
  }

  // Approved stripes (Color-Sliced): thickness on the 8 grid, an angle in degrees.
  for (const s of p.settings?.stripes ?? []) {
    if (!(s.thickness > 0) || s.thickness % 8 !== 0) errors.push(`${where}: stripes "${s.name}" thickness ${s.thickness} isn't on the 8 grid`);
    if (typeof s.angle !== "number") errors.push(`${where}: stripes "${s.name}" needs an angle`);
  }

  // Layers: transparent generative presets drawn on top. Same token and tone checks.
  for (const id of p.layers ?? []) {
    let layer;
    try {
      layer = load(id);
    } catch (e) {
      errors.push(`${where}: layer ${e.message}`);
      continue;
    }
    if (layer.recipe !== "generative-pattern") errors.push(`${where}: layer ${id} should be a generative pattern`);
    if (layer.settings?.background) errors.push(`${where}: layer ${id} should have no background`);
    if (layer.settings?.engine?.element === "ascii") for (const problem of letterLayerProblems(layer.settings.engine)) errors.push(`${where}: letter layer ${id} ${problem}`);
    if ((layer.colorways?.length ?? 0) !== (p.colorways?.length ?? 0)) errors.push(`${where}: layer ${id} needs one colorway per pattern colorway (${p.colorways?.length}), in the same order`);
    if (!layer.settings?.tones?.[layer.settings?.tone]) errors.push(`${where}: layer ${id} tone curve "${layer.settings?.tone}" isn't in settings.tones`);
    for (const [i, look] of (layer.colorways ?? []).entries()) {
      // Letters: the lightest is the 600 step (Vanesa, 2026-11-25), unless the pattern's colorway is on hold.
      if (!p.colorways?.[i]?.onHold) for (const ref of look.colors ?? []) {
        const step = Number(String(ref).match(/\.([0-9]+)\}$/)?.[1]);
        if (step < 600) errors.push(`${where}: layer ${id} / ${look.name}: letter color ${ref} is lighter than the 600 step`);
      }
      for (const ref of [...(look.colors ?? []), ...(look.backdrop ?? []).map((s) => s?.token ?? s)]) {
        if (!tokenExists(ref.slice(1, -1))) errors.push(`${where}: layer ${id} token ${ref} doesn't exist`);
      }
    }
  }

  // Effect values on the 8 grid (90° and Figma-only values like 130.68% are allowed).
  for (const [effect, keys] of [["slice", ["r", "a"]]]) {
    for (const key of keys) {
      const v = p.settings?.[effect]?.[key];
      if (v !== undefined && !onGrid(Math.abs(v)) && Math.abs(v) !== 90 && v !== 100) warnings.push(`${where}: ${effect}.${key} = ${v} isn't on the 8 grid`);
    }
  }
}

for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`error    ${e}`);
console.log(`\n${ids.length} patterns checked: ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(errors.length ? 1 : 0);
