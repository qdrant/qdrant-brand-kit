// Checks every pattern before it ships. Run from the repo root:
//
//   node scripts/validate.mjs
//
// Errors (exit code 1): a preset that can't render, like a missing recipe, a token
// that doesn't exist, or a missing mesh. Warnings: values off the 8 grid.

import { readFileSync, existsSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const warnings = [];

const tokens = read("tokens/placeholder.tokens.json");
const tokenExists = (path) => path.split(".").slice(1).reduce((node, key) => node?.[key], tokens.color)?.$value !== undefined;

// Recipes registered in patterns/index.js.
const entry = readFileSync("patterns/index.js", "utf8");
const recipes = [...entry.matchAll(/^\s+"([a-z-]+)": \w+,$/gm)].map((m) => m[1]);
for (const recipe of recipes) if (!existsSync(`patterns/${recipe}.js`)) errors.push(`Recipe "${recipe}" is registered but patterns/${recipe}.js is missing`);

// The settings each recipe needs, besides size.
const needs = {
  "color-refracted-pattern": ["gradient", "refraction", "noise"],
  "color-sliced-pattern": ["gradient", "slice", "noise"],
  "mesh-refracted-pattern": ["grade", "blur", "contrast", "mesh", "refraction", "noise"],
  "mesh-sliced-pattern": ["grade", "blur", "contrast", "mesh", "slice", "noise"],
  "mesh-dithered-pattern": ["grade", "blur", "contrast", "mesh", "dither"],
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

  // Name and file agree: Color-Refracted-Pattern-A <-> color-refracted-pattern-a.json.
  if (!/^(Color|Mesh|Generative)-[A-Z][a-z]+-Pattern-[A-Z]$/.test(p.name ?? "")) errors.push(`${where}: name should look like Color-Refracted-Pattern-A`);
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
    if (!p.settings?.tones?.[p.settings?.tone]) errors.push(`${where}: tone curve "${p.settings?.tone}" isn't in settings.tones`);
    const refs = looks.flatMap((look) => [...(look.colors ?? []), ...(look.backdrop ?? []).map((stop) => stop?.token ?? stop)]);
    for (const ref of [...refs, p.settings?.background]) {
      if (typeof ref !== "string" || !/^\{.+\}$/.test(ref)) errors.push(`${where}: color ${ref} should be a token like {color.secondary.500}`);
      else if (!tokenExists(ref.slice(1, -1))) errors.push(`${where}: token ${ref} doesn't exist`);
    }
  } else if (p.meshGroup) {
    // Mesh pattern: every example has a mesh for this group, made of existing tokens.
    if (!p.examples?.length) errors.push(`${where}: no example meshes`);
    for (const example of p.examples ?? []) {
      const file = `meshes/${example.id}.${p.meshGroup}.json`;
      if (!existsSync(file)) {
        errors.push(`${where}: ${file} is missing`);
        continue;
      }
      const mesh = read(file);
      if (mesh.colors.length !== mesh.size * mesh.size) errors.push(`${file}: expected ${mesh.size * mesh.size} points, found ${mesh.colors.length}`);
      for (const ref of new Set(mesh.colors)) if (!tokenExists(ref.slice(1, -1))) errors.push(`${file}: token ${ref} doesn't exist`);
    }
  } else {
    // Color pattern: every colorway points at tokens that exist.
    if (!p.colorways?.length) errors.push(`${where}: no colorways`);
    for (const colorway of p.colorways ?? []) {
      const families = colorway.families ?? Object.keys(tokens.color);
      if ((colorway.from + colorway.to).includes("{family}") && !colorway.families) errors.push(`${where} / ${colorway.name}: a {family} colorway needs a "families" list, so it can't pick neutral (gray)`);
      for (const f of colorway.families ?? []) if (!tokens.color[f]) errors.push(`${where} / ${colorway.name}: family "${f}" doesn't exist`);
      for (const path of [colorway.from, colorway.to]) {
        const ok = path.includes("{family}") ? families.some((f) => tokenExists(path.replace("{family}", f))) : tokenExists(path);
        if (!ok) errors.push(`${where} / ${colorway.name}: no token for ${path}`);
      }
    }
  }

  // Effect values on the 8 grid (90° and Figma-only values like 130.68% are allowed).
  for (const [effect, keys] of [["refraction", ["smoothness", "dispersion", "r", "a"]], ["slice", ["r", "a"]]]) {
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
