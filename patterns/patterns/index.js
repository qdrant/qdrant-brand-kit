// Pattern primitives: the one place a tool (like Design Lab) needs to import.
//
//   import { loadTokens, loadPatterns, renderPattern, createMesh } from "./patterns/index.js";
//
//   const tokens = await loadTokens("tokens/placeholder.tokens.json");
//   const patterns = await loadPatterns();             // every preset in presets/index.json
//
//   // A color pattern: pick a colorway (and a family if the colorway has {family}).
//   renderPattern(canvas, tokens, patterns[0], { colorway: 0, family: "secondary" });
//
//   // A mesh pattern: make the mesh once from a library image, keep only the mesh.
//   const mesh = createMesh(image, tokens, patterns[2]);
//   const check = renderPattern(canvas, tokens, patterns[2], { mesh });
//   if (!check.pass) { /* off-brand: pick another image */ }
//
// To add a recipe, write patterns/<recipe>.js with a render() and register it below.

import * as colorRefracted from "./color-refracted-pattern.js";
import * as colorSliced from "./color-sliced-pattern.js";
import * as meshRefracted from "./mesh-refracted-pattern.js";
import * as meshSliced from "./mesh-sliced-pattern.js";
import * as meshDithered from "./mesh-dithered-pattern.js";
import { colorwayTokens, familiesFor } from "./tokens.js";
import { imageToMesh } from "./mesh-source.js";
import { loadAllPresets, loadPreset } from "./presets.js";

export { loadTokens, resolveToken } from "./tokens.js";
export { loadPreset };

// Recipe name (the "recipe" field in a preset) to its code.
export const recipes = {
  "color-refracted-pattern": colorRefracted,
  "color-sliced-pattern": colorSliced,
  "mesh-refracted-pattern": meshRefracted,
  "mesh-sliced-pattern": meshSliced,
  "mesh-dithered-pattern": meshDithered,
};

// Every preset listed in presets/index.json, with its shared settings merged in.
export const loadPatterns = (base = "presets") => loadAllPresets(base);

// Color patterns take a colorway. Mesh patterns take a mesh.
export const isMeshPattern = (preset) => Boolean(preset.meshGroup);

// The choices a person can make for a pattern. Color patterns: colorways, and for a
// colorway with {family}, the families that have its steps. Mesh patterns: none,
// the mesh comes from the picked library image.
export function choicesFor(preset, tokens) {
  if (isMeshPattern(preset)) return { colorways: [] };
  return {
    colorways: preset.colorways.map((colorway) => ({
      name: colorway.name,
      families: hasFamily(colorway) ? familiesFor(tokens, colorway) : [],
      defaultFamily: colorway.defaultFamily,
    })),
  };
}

// Draws a pattern on a canvas at preset.settings.size (1080 x 1080).
// options: { colorway: index, family } for color patterns, { mesh } for mesh patterns.
// Mesh patterns return the brand check: { pass, offBrand: % of off-palette pixels }.
export function renderPattern(canvas, tokens, preset, options = {}) {
  const recipe = recipes[preset.recipe];
  if (!recipe) throw new Error(`Unknown recipe "${preset.recipe}" in ${preset.name}`);
  if (isMeshPattern(preset)) {
    if (!options.mesh) throw new Error(`${preset.name} needs a mesh: createMesh(image, tokens, preset)`);
    return recipe.render(canvas, tokens, preset, options.mesh);
  }
  const colorway = preset.colorways[options.colorway ?? 0];
  const family = options.family ?? colorway.defaultFamily;
  return recipe.render(canvas, tokens, preset, colorwayTokens(colorway, family));
}

// Turns a library image into a mesh for a mesh pattern: an 11 x 11 grid of brand
// color tokens. Store the result (about 3.5 KB of JSON) and drop the image. Meshes
// are shared by every pattern with the same meshGroup.
export function createMesh(image, tokens, preset) {
  return { group: preset.meshGroup, ...imageToMesh(image, tokens, preset.settings) };
}

const hasFamily = (colorway) => colorway.from.includes("{family}") || colorway.to.includes("{family}");
