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
  const result = renderBase(canvas, tokens, preset, options);
  // Layers (transparent generative patterns) are drawn on top, in order. A layer's
  // colorways pair with the pattern's by position: colorway 1 of the pattern draws
  // colorway 1 of the layer.
  for (const layer of preset.layers ?? []) {
    const top = document.createElement("canvas");
    renderBase(top, tokens, layer, { width: canvas.width, height: canvas.height, phase: options.phase, colorway: options.colorway });
    canvas.getContext("2d").drawImage(top, 0, 0);
  }
  return result;
}

function renderBase(canvas, tokens, preset, options) {
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
// draws them in a fallback font. Call once before rendering; it loads the repo's own
// Mona Sans and Geist Mono (primitives/typography/fonts), no network (2026-11-11; it used
// to fetch them from Google Fonts, as Pattern Studio's export does).
const FONT_DIR = new URL("../../../primitives/typography/fonts/", import.meta.url);
const LOCAL_FONTS = [
  ["Mona Sans", "MonaSansVF[wdth,wght,opsz,ital].ttf", "200 900"],
  ["Geist Mono", "GeistMono[wght].ttf", "100 900"],
];
export async function loadPatternFonts(patterns) {
  const needed = patterns.flatMap((p) => [p, ...(p.layers ?? [])]).filter((p) => isGenerativePattern(p) && (p.settings.engine.element === "ascii" || p.settings.engine.shape === "text"));
  if (!needed.length) return;
  await Promise.all(LOCAL_FONTS.map(async ([family, file, weight]) => {
    const has = [...document.fonts].some((f) => f.family.replace(/["']/g, "") === family && f.status === "loaded" && f.weight === weight);
    if (has) return;
    const face = new FontFace(family, `url("${new URL(file, FONT_DIR).href.replace(/\[/g, "%5B").replace(/\]/g, "%5D")}")`, { weight });
    document.fonts.add(await face.load());
  }));
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
