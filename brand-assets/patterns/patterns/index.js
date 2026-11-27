// Pattern primitives: the one place a tool (like Design Lab) needs to import.
//
//   import { loadTokens, loadPatterns, renderPattern } from "./patterns/index.js";
//
//   const tokens = await loadTokens("tokens/placeholder.tokens.json");
//   const patterns = await loadPatterns();             // every preset in presets/index.json
//
//   // A color pattern: pick a colorway (and a family if the colorway has {family}),
//   // at any size: here a wide banner.
//   renderPattern(canvas, tokens, patterns[0], { colorway: 0, family: "secondary", width: 1500, height: 500 });
//
// To add a recipe, write patterns/<recipe>.js with a render() and register it below.

import * as colorSliced from "./color-sliced-pattern.js";
import * as generative from "./generative-pattern.js";
import * as motionStreaks from "./motion-streaks-pattern.js";
import { colorwayTokens, familiesFor } from "./tokens.js";
import { loadAllPresets, loadPreset } from "./presets.js";
import { makeFrame } from "./effects.js";

export { loadTokens, resolveToken } from "./tokens.js";
export { varyLetterLayer, letterLayerProblems, isLetterLayer, letterVariation, fromStudioParams } from "./letter-variations.js";
import { varyLetterLayer, isLetterLayer, letterVariation } from "./letter-variations.js";
export { isOpenLook, lookProblems, varyLook, lookVariation } from "./look-variations.js";
import { varyLook, lookVariation } from "./look-variations.js";
export { loadPreset };

// Recipe name (the "recipe" field in a preset) to its code.
export const recipes = {
  "color-sliced-pattern": colorSliced,
  "generative-pattern": generative,
  "motion-streaks-pattern": motionStreaks,
};

// Every preset listed in presets/index.json, with its shared settings merged in.
export const loadPatterns = (base = "presets") => loadAllPresets(base);

// Color patterns take a colorway. Generative patterns (from Pattern Studio) have one
// or more colorways to pick from.
export const isGenerativePattern = (preset) => preset.recipe === "generative-pattern";

// On hold (visual designer, 2026-11-24): a pattern or colorway marked "onHold" is never used to
// make a new asset (guidelines/ section 2a). Every teal colorway is on hold now. The other
// patterns that were on hold were removed from the repo on 2026-11-25; they live in the
// Pattern Library artifact until the visual designer asks to add one back.
export const isOnHold = (preset, colorway) =>
  Boolean(preset.onHold) || (colorway != null && Boolean(preset.colorways?.[colorway]?.onHold));

// The colorway indexes an agent may use for this pattern: none when the whole pattern is on hold.
export const usableColorways = (preset) =>
  preset.onHold ? [] : (preset.colorways ?? []).map((_, i) => i).filter((i) => !isOnHold(preset, i));

// The choices a person can make for a pattern. Color patterns: colorways, and for a
// colorway with {family}, the families that have its steps.
export function choicesFor(preset, tokens) {
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
// options: { colorway: index, family, stripes } for color patterns (stripes: an index into
// the preset's approved stripes, Color-Sliced-A),
// { colorway, variant, look } for generative patterns (variant: an index into settings.variants; look: a new
// variation of an open look, a number n or the values themselves, see look-variations.js; optional { phase } to draw
// another moment of the loop, for animation later).
export function renderPattern(canvas, tokens, preset, options = {}) {
  const result = renderBase(canvas, tokens, preset, options);
  // Layers (transparent generative patterns) are drawn on top, in order. A layer's
  // colorways pair with the pattern's by position: colorway 1 of the pattern draws
  // colorway 1 of the layer. options.letters makes a variation of every letter layer,
  // within the rules in letter-variations.js: a number picks variant n (0 = as approved),
  // an object sets the allowed values directly.
  // options.letterOption picks one of the preset's approved letter options (settings.letterOptions).
  const option = options.letterOption == null ? null : preset.settings?.letterOptions?.[options.letterOption];
  if (options.letterOption != null && !option) throw new Error(`${preset.name} has no approved letter option #${options.letterOption}`);
  const letters = option ? (({ name, source, ...values }) => values)(option) : typeof options.letters === "number" ? letterVariation(options.letters) : options.letters;
  // settings.letterSteps: the color steps of the pattern's letters, in place of the letter
  // layer's own (Color-Sliced-B: 950, 900, 800; Motion-Streaks-B: 900, 800, 700; visual designer,
  // 2026-11-26). settings.letterColorSteps: a letter variation that keeps other steps
  // (Motion-Streaks-B: variation 1 keeps 800, 600, 200; visual designer, 2026-11-25).
  const letterSteps = (typeof options.letters === "number" ? preset.settings?.letterColorSteps?.[options.letters] : null) ?? preset.settings?.letterSteps;
  for (const base of preset.layers ?? []) {
    let layer = letters && isLetterLayer(base) ? varyLetterLayer(base, letters) : base;
    if (letterSteps && isLetterLayer(base)) layer = withColorSteps(layer, letterSteps);
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
  if (isGenerativePattern(preset)) {
    preset = generativeOptions(preset, options);
    return recipe.render(canvas, tokens, preset, null, frame, { phase: options.phase, colorway: options.colorway, layer: options.layer });
  }
  const colorway = preset.colorways[options.colorway ?? 0];
  const family = options.family ?? colorway.defaultFamily;
  return recipe.render(canvas, tokens, preset, colorwayTokens(colorway, family), frame, options);
}

// A generative pattern as vector shapes in an <svg> (sharp at any print size): the same preset, colorway,
// variant and look options as renderPattern. options.layer: no background at all, to draw it on top of
// another pattern; options.offsetX / offsetY: where its frame's top left sits in the svg.
export function renderPatternSvg(svg, tokens, preset, options = {}) {
  if (!isGenerativePattern(preset)) throw new Error(`${preset.name} isn't a generative pattern: only those have vector output`);
  const width = Math.round(options.width ?? 1080), height = Math.round(options.height ?? 1080);
  return generative.renderSvg(svg, tokens, generativeOptions(preset, options), makeFrame(width, height),
    { phase: options.phase, colorway: options.colorway, layer: options.layer, offsetX: options.offsetX, offsetY: options.offsetY });
}

// A generative preset with options.variant and options.look applied.
function generativeOptions(preset, options) {
  {
    // options.variant picks one of the preset's approved variants (settings.variants): engine values on top of its own.
    const variant = options.variant == null ? null : preset.settings.variants?.[options.variant];
    if (options.variant != null && !variant) throw new Error(`${preset.name} has no approved variant #${options.variant}`);
    if (variant) {
      // colorSteps: the variant draws its elements in other steps of the same family
      // (Generative-Hexagon's filled variants: 800, 800, 700; visual designer, 2026-11-25).
      const { name, colorSteps, ...engine } = variant;
      preset = { ...preset, settings: { ...preset.settings, engine: { ...preset.settings.engine, ...engine } } };
      if (colorSteps) preset = withColorSteps(preset, colorSteps);
    }
    // options.look: a new variation of an open look (Dash, Burst, Pulse, Rings), checked
    // against the look's ranges. A number picks variation n; an object sets the values.
    if (options.look != null) preset = varyLook(preset, typeof options.look === "number" ? lookVariation(preset, options.look) : options.look);
  }
  return preset;
}

// Same colorways, other steps of each colorway's family: {color.indigo.200} with step 600
// becomes {color.indigo.600}. steps[i] replaces the step of colors[i]. A colorway with
// fixedColors (light mode: all white) keeps its colors (visual designer, 2026-11-26).
function withColorSteps(preset, steps) {
  return {
    ...preset,
    colorways: preset.colorways.map((look) => look.fixedColors ? look : ({
      ...look,
      colors: look.colors.map((ref, i) => (steps[i] == null ? ref : ref.replace(/\.[0-9]+\}$/, `.${steps[i]}}`))),
    })),
  };
}

// Generative patterns that draw letters need their fonts loaded first, or the browser
// draws them in a fallback font. Call once before rendering; it loads the repo's own
// Mona Sans and Mona Sans Mono (primitives/typography/fonts), no network (2026-11-11; it used
// to fetch them from Google Fonts, as Pattern Studio's export does). The letters were Geist
// Mono until 2026-11-17, when the brand moved to the Mona Sans family.
const FONT_DIR = new URL("../../../primitives/typography/fonts/", import.meta.url);
const LOCAL_FONTS = [
  ["Mona Sans", "MonaSansVF[wdth,wght,opsz,ital].ttf", "200 900"],
  ["Mona Sans Mono", "MonaSansMonoVF[wght].ttf", "200 900"],
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

const hasFamily = (colorway) => colorway.from.includes("{family}") || colorway.to.includes("{family}");
