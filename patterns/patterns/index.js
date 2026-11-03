// Pattern primitives: the one place a tool (like Design Lab) needs to import.
//
//   import { loadTokens, loadPatterns, renderPattern, createMesh } from "./patterns/index.js";
//
//   const tokens = await loadTokens("tokens/placeholder.tokens.json");
//   const patterns = await loadPatterns();             // every preset in presets/index.json
//
//   // A color pattern: pick a colorway (and a family if the colorway has {family}),
//   // at any size: here a wide banner.
//   renderPattern(canvas, tokens, patterns[0], { colorway: 0, family: "secondary", width: 1500, height: 500 });
//
//   // A mesh pattern: when a library image is approved, check it and make its meshes
//   // once (see library.js), then render with the mesh for the pattern's meshGroup.
//   if (canUseImage(info, patterns[2].source).allowed) saveWithImage(meshesForImage(image, tokens, patterns));
//   const mesh = createMesh(image, tokens, patterns[2]); // or one mesh for one pattern
//   const check = renderPattern(canvas, tokens, patterns[2], { mesh });
//   if (!check.pass) { /* off-brand: pick another image */ }
//
// To add a recipe, write patterns/<recipe>.js with a render() and register it below.

import * as colorRefracted from "./color-refracted-pattern.js";
import * as colorSliced from "./color-sliced-pattern.js";
import * as meshRefracted from "./mesh-refracted-pattern.js";
import * as meshSliced from "./mesh-sliced-pattern.js";
import * as meshDithered from "./mesh-dithered-pattern.js";
import * as generative from "./generative-pattern.js";
import { colorwayTokens, familiesFor } from "./tokens.js";
import { imageToMesh } from "./mesh-source.js";
import { loadAllPresets, loadPreset } from "./presets.js";
import { makeFrame } from "./effects.js";

export { loadTokens, resolveToken } from "./tokens.js";
export { canUseImage, meshesForImage } from "./library.js";
export { loadPreset };

// Recipe name (the "recipe" field in a preset) to its code.
export const recipes = {
  "color-refracted-pattern": colorRefracted,
  "color-sliced-pattern": colorSliced,
  "mesh-refracted-pattern": meshRefracted,
  "mesh-sliced-pattern": meshSliced,
  "mesh-dithered-pattern": meshDithered,
  "generative-pattern": generative,
};

// Every preset listed in presets/index.json, with its shared settings merged in.
export const loadPatterns = (base = "presets") => loadAllPresets(base);

// Color patterns take a colorway. Mesh patterns take a mesh. Generative patterns
// (from Pattern Studio) have one or more colorways to pick from.
export const isMeshPattern = (preset) => Boolean(preset.meshGroup);
export const isGenerativePattern = (preset) => preset.recipe === "generative-pattern";

// The choices a person can make for a pattern. Color patterns: colorways, and for a
// colorway with {family}, the families that have its steps. Mesh patterns: none,
// the mesh comes from the picked library image.
export function choicesFor(preset, tokens) {
  if (isMeshPattern(preset)) return { colorways: [] };
  if (isGenerativePattern(preset)) return { colorways: preset.colorways.map(({ name }) => ({ name, families: [] })) };
  return {
    colorways: preset.colorways.map((colorway) => ({
      name: colorway.name,
      families: hasFamily(colorway) ? familiesFor(tokens, colorway) : [],
      defaultFamily: colorway.defaultFamily,
    })),
  };
}

// Draws a pattern on a canvas at any size and shape: { width, height } in px,
// 1080 x 1080 when left out. A wide banner, a tall story or a 4K poster all work.
// options: { colorway: index, family } for color patterns, { mesh } for mesh patterns,
// { colorway } for generative patterns (optional { phase } to draw
// another moment of the loop, for animation later). Mesh patterns return the brand check:
// { pass, offBrand: % of off-palette pixels }.
export function renderPattern(canvas, tokens, preset, options = {}) {
  const recipe = recipes[preset.recipe];
  if (!recipe) throw new Error(`Unknown recipe "${preset.recipe}" in ${preset.name}`);
  const width = Math.round(options.width ?? 1080);
  const height = Math.round(options.height ?? 1080);
  if (!(width >= 1 && height >= 1)) throw new Error(`Width and height must be at least 1 px, got ${width} x ${height}`);
  const frame = makeFrame(width, height);
  if (isGenerativePattern(preset)) return recipe.render(canvas, tokens, preset, null, frame, { phase: options.phase, colorway: options.colorway });
  if (isMeshPattern(preset)) {
    if (!options.mesh) throw new Error(`${preset.name} needs a mesh: createMesh(image, tokens, preset)`);
    return recipe.render(canvas, tokens, preset, options.mesh, frame);
  }
  const colorway = preset.colorways[options.colorway ?? 0];
  const family = options.family ?? colorway.defaultFamily;
  return recipe.render(canvas, tokens, preset, colorwayTokens(colorway, family), frame);
}

// Generative patterns that draw letters need their fonts loaded first, or the browser
// draws them in a fallback font. Call once before rendering; it adds the brand fonts
// from Google Fonts (as Pattern Studio's export does) and waits for them.
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Mona+Sans:wght@800&family=Geist+Mono:wght@500&display=swap";
export async function loadPatternFonts(patterns) {
  const needed = patterns.filter((p) => isGenerativePattern(p) && (p.settings.engine.element === "ascii" || p.settings.engine.shape === "text"));
  if (!needed.length) return;
  if (!document.querySelector(`link[href="${FONTS_URL}"]`)) {
    const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: FONTS_URL });
    const loaded = new Promise((resolve) => (link.onload = link.onerror = resolve));
    document.head.append(link);
    await loaded;
  }
  await Promise.all(needed.flatMap(({ settings: { engine } }) => [
    document.fonts.load(`500 32px ${engine.glyphFont}`),
    document.fonts.load(`800 200px ${engine.textFont}`),
  ]));
}

// Turns a library image into a mesh for a mesh pattern: an 11 x 11 grid of brand
// color tokens. Store the result (about 3.5 KB of JSON) and drop the image. Meshes
// are shared by every pattern with the same meshGroup.
export function createMesh(image, tokens, preset) {
  return { group: preset.meshGroup, ...imageToMesh(image, tokens, preset.settings) };
}

const hasFamily = (colorway) => colorway.from.includes("{family}") || colorway.to.includes("{family}");
