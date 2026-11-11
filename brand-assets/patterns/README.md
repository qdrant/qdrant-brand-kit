# Qdrant Pattern Primitives

Brand patterns written as code, ready to live in Design Lab as primitives. No images: every pattern is drawn from color tokens and small settings files, so it stays on-brand and updates when the tokens change.

## How it fits together

| Piece | What it is | Where |
| --- | --- | --- |
| **Tokens** | Brand colors in W3C format. Placeholders until Juan's design system lands. Keep the names, swap the values. | `tokens/placeholder.tokens.json` |
| **Recipe** | A set of effects, as code. One file per recipe. | `patterns/<recipe>.js` |
| **Preset** | A pattern: a recipe plus fixed values from Figma. Named `<Source>-<Effect>-Pattern-<Letter>`. | `presets/<name>.json` |
| **Shared settings** | Values every pattern of a kind uses. Change once, all update. | `presets/shared.json`, `presets/mesh-pattern.shared.json`, `presets/mesh-dithered-pattern.shared.json`, `presets/generative-pattern.shared.json` |
| **Colorway** | For Color patterns: the two tokens of the gradient, listed in the preset. | inside the preset |
| **Mesh** | For Mesh patterns: an 11 × 11 grid of brand tokens made from a library image. About 3.5 KB. | `meshes/<image>.<meshGroup>.json` |
| **Effects** | Refraction, slice shift, dither, noise, brand grade and check. Shared by all recipes. | `patterns/effects.js` |
| **Library flow** | Checks a library image against the source rule and makes its meshes. | `patterns/library.js` |
| **Generative engine** | Pattern Studio's own engine, compiled from its source, so generative patterns match the tool exactly. | `patterns/generative-engine.js` |

**Color patterns** take a colorway. **Mesh patterns** take a mesh, made once from a library image. The image itself is never kept. **Generative patterns** come from Pattern Studio and take a colorway, like Color patterns.

## Using it in a tool

Everything goes through one file, `patterns/index.js`:

```js
import { loadTokens, loadPatterns, choicesFor, renderPattern, createMesh } from "./patterns/index.js";

const tokens = await loadTokens("tokens/placeholder.tokens.json");
const patterns = await loadPatterns(); // every preset in presets/index.json

// Color pattern: pick a colorway, and a family if the colorway allows one.
// Any size and shape: here a wide banner.
const { colorways } = choicesFor(patterns[0], tokens);
renderPattern(canvas, tokens, patterns[0], { colorway: 0, family: "secondary", width: 1500, height: 500 });

// Mesh pattern: make the mesh once from a library image, store it, drop the image.
const mesh = createMesh(image, tokens, patterns[2]);
const check = renderPattern(canvas, tokens, patterns[2], { mesh, width: 1080, height: 1920 });
if (!check.pass) {
  // Off-palette: pick another image.
}
```

- **Any size, any shape.** Pass `width` and `height` in px (1080 × 1080 when left out): a square post, a 9:16 story, a 10:1 banner or a 4K poster. Use `canvas.toBlob()` to export.
- **The look stays the same at every format.** Preset values are written for 1080 × 1080 and scale with the canvas area: strip and band widths, noise grain and dither cells. Positions and angles are relative to the canvas, and gradients span the whole frame, like CSS.
- **Meshes cover the frame** like `object-fit: cover`, stretching at most 2× first, so shapes never look squashed and banners still show plenty of color.
- A mesh belongs to a `meshGroup`, not to one pattern. All Mesh-Refracted and Mesh-Sliced patterns share `mesh-pattern` meshes, and Mesh-Dithered uses `mesh-dithered-pattern`. One mesh per image per group.
- **Library images** for meshes: design-approved, Default (space) moodboard, asset type image, nothing with the mascot or a robot in the prompt, never Luma. The rule is written in `mesh-pattern.shared.json` (`source`). Someone should still look at a new image before it's used: a prompt doesn't always mention everything in the picture.

## Library flow: patterns that grow with the library

Mesh patterns aren't tied to a fixed set of images. Every new image approved in the Design Lab library can become a source, so the patterns grow as the library grows. Design Lab does this when an image is approved:

1. **Check the image** against the source rule:

   ```js
   const { allowed, reasons } = canUseImage(
     { assetType: "image", approved: true, moodboard: "Default", title, prompt },
     patterns.find(isMeshPattern).source,
   );
   ```

   If it's not allowed, `reasons` says why, for example "title or prompt mentions robot".
2. **Make its meshes once**, one per look, and **save them with the image** in the library:

   ```js
   const meshes = meshesForImage(image, tokens, patterns);
   // { "mesh-pattern": {...}, "mesh-dithered-pattern": {...} }, about 3.5 KB each
   ```

3. **Render** any mesh pattern with any image that has meshes, at any size:

   ```js
   renderPattern(canvas, tokens, preset, { mesh: meshes[preset.meshGroup], width, height });
   ```

   Pick the image at random, or let the person choose. If the brand check fails, skip that image for that pattern.

Meshes need to be made again only when the grade, blur or contrast in the shared presets change. Token value changes don't need new meshes. The four meshes in `meshes/` are test examples for the preview pages, not the real library.

## Generative patterns (from Pattern Studio)

Patterns made in Pattern Studio (the `qdrant-pattern-studio` repo) are added from the tool's **Copy code** export:

1. Make a preset that `extends` `generative-pattern.shared`. The shared file holds Pattern Studio's default settings (`engine`), its tone curves (`tones`) and the design size, 1620 × 1080.
2. In the preset's `settings.engine`, list only the export's `PARAMS` that differ from the shared `engine` (never `width`, `height` or `colors`). If the export's `TONE` isn't one of the shared `tones`, add it there under a new name, and set `settings.tone` to that name.
3. Turn the colors into tokens in `colorways`: each has a `name`, `colors` and `backdrop` (the gradient behind). If the same pattern was exported in other colors, don't make a new pattern: add a colorway, and pick it with `renderPattern(..., { colorway })`. A backdrop stop past the bottom of the frame, like the red brand gradient, is written `{ "token": "{color.primary.500}", "at": 1.39 }`.
4. Add the preset to `presets/index.json`, run the validator, and compare it with the tool's export at 1620 × 1080: it should match pixel for pixel.

At its `designSize`, the pattern is pixel-identical to the tool. At any other size, the field and the elements keep their scale by canvas area, so nothing stretches: a wider canvas shows more of the same field. `cellScaling` sets what the elements do on bigger canvases: `"canvas"` (they grow with it, like every other pattern) or `"fixed"` (they keep their px size, so there are more of them). `generative-scaling.html` shows both side by side.

**Layers:** a preset can list `"layers"`: transparent generative presets drawn on top of it, in order. A layer has `"background": null`, one colorway per pattern colorway in the same order, each with `"backdrop": null`, and isn't in `presets/index.json`, because it isn't a pattern on its own. Color-Sliced-Pattern-B uses `generative-glyph-layer-a`. Adding a layer to a pattern is an effect change, so it gets a new letter.

**Letters need fonts:** patterns that draw letters (Glyph) use Geist Mono. Call `await loadPatternFonts(patterns)` once before rendering, or the browser draws them in a fallback font.

**Static for now, ready to animate:** the engine draws one moment of the tool's loop, at `settings.phase`. To animate, call `renderPattern(canvas, tokens, preset, { phase, width, height })` on every frame with `phase` going from 0 to 2π.

If Pattern Studio's engine changes, compile `src/pattern/pattern-engine.ts` again with esbuild and re-apply the two small additions marked `patterns:` in `generative-engine.js`.

## Adding or changing a pattern

| You want to… | Do this |
| --- | --- |
| Use **new colors** on an existing Color pattern | Add a colorway to its preset. Not a new pattern. |
| Use a **new library image** on Mesh patterns | Nothing: Design Lab makes its meshes when the image is approved (see Library flow). Not a new pattern. |
| Use **the same effects with new values** | Copy a preset, give it the next letter (B, C…), change the values, add it to `presets/index.json`. |
| Use **a new effect** | Add the effect to `effects.js`, write a recipe in `patterns/`, register it in `patterns/index.js`, then add a preset. |
| Change **blur, grade, contrast or noise** for all | Edit the shared preset file. Every pattern that extends it updates. After a grade, blur or contrast change, make the meshes again with `meshesForImage` for every library image. |
| Change **token values** | Edit the tokens file. Patterns and meshes follow on their own. |

Then run the checks and look at the result:

```bash
cd patterns
node scripts/validate.mjs
```

The validator fails on anything that can't render, like a missing recipe, token or mesh, and warns about values off the 8 grid.

### Rules

- Colors are always **token names**, never hex.
- **No grays.** Meshes only use primary, secondary, white and neutral.950.
- Effect values sit on the **8 grid**, except an exact horizontal (90°) and gradient stops copied from Figma.
- A new letter only when **effect values** change. New colors or images aren't new patterns.
- When porting a Figma effect, read its shader code with the Figma MCP `get_design_context` tool. Don't guess from screenshots.
- Don't change the look of an approved pattern while adding a new one. If an effect has to change, give the new pattern its own version.

## Preview

Serve the folder with any static server, then open `index.html` (one pattern at a time, at any size), `formats.html` (every pattern in six formats, from a square to a 10:1 banner) or `sheet.html` (every Mesh pattern on every example mesh, with its brand check):

```bash
cd patterns
python3 -m http.server 5190
```

## Patterns (V1)

| Pattern | Choices | Figma | Notes |
| --- | --- | --- | --- |
| Color-Refracted-Pattern-A | Any family 500 → 300, or Primary 100 → Secondary 400 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | Refraction tuned by eye against Figma |
| Color-Sliced-Pattern-A | Neutral 950 → Primary 500, or Neutral 950 → Secondary 500 | [Frame 20943:36252](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20943-36252) | Exact port of Figma's Slice shift shader. No noise |
| Color-Sliced-Pattern-B | Red (primary letters on Neutral 950 → Primary 500), Violet (secondary letters on Neutral 950 → Secondary 500) | Pattern Studio export (layer) | Color-Sliced-A with a layer of QDRANT letters on top (`generative-glyph-layer-a`: 24 px grid, letters 0.55, noise 4.5). The layer matches the tool pixel for pixel at 1920 × 1080. Needs `loadPatternFonts` first |
| Mesh-Refracted-Pattern-A | Any library image | [Luma-Background-9](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-31574) | Smoothness 72%, angle -120° |
| Mesh-Refracted-Pattern-B | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50585) | Smoothness 88%, angle -48° |
| Mesh-Refracted-Pattern-C | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50609) | Horizontal bands: dispersion 56%, R 16%, angle 90° |
| Mesh-Refracted-Pattern-D | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50612) | Dispersion 88%, X 40%, R 16%, angle 144° |
| Mesh-Sliced-Pattern-A | Any library image | [Frame 20713:50540](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50540) | Approved slice shift (tuned by eye) |
| Generative-Hexagon-Pattern-A | Dark violet | Pattern Studio export | Hexagon grid over a noisy diagonal gradient. Pixel-identical to the tool at 1620 × 1080 |
| Generative-Hexagon-Pattern-B | Red | Pattern Studio export | Small outlined hexagons scattered on a 56 px grid, colored top to bottom. Pixel-identical to the tool at 1620 × 1080 |
| Generative-Hexagon-Pattern-C | Dark violet, Medium violet | Pattern Studio export | Like Hexagon-B, colored from the center out. Pixel-identical to the tool at 1620 × 1080 |
| Generative-Burst-Pattern-A | Dark violet, Medium violet, Light violet, Red | Pattern Studio export | 1,100 short lines bursting out from the center. Pixel-identical to the tool at 1620 × 1080 (Medium violet within 2/255: the tool's #090E1A isn't a token, so it uses neutral.950) |
| Generative-Dash-Pattern-A | Dark violet | Pattern Studio export | Short horizontal dashes on a 64 px grid, thinned by a twisted noise field. Pixel-identical to the tool at 1620 × 1080 |
| Generative-Dash-Pattern-B | Red | Pattern Studio export | Like Dash-A, on a finer 48 px grid with 40 px padding. Pixel-identical to the tool at 1620 × 1080 |
| Generative-Glyph-Pattern-A | Dark violet, Red | Pattern Studio export | Letters of QDRANT in Geist Mono on a 32 px grid, in soft noisy patches. Pixel-identical to the tool at 1620 × 1080. Needs `loadPatternFonts` first |
| Generative-Glyph-Pattern-B | Light violet (neutral 50 letters), Medium violet | Pattern Studio export | Like Glyph-A with outline shaping, in white letters. Pixel-identical to the tool at 1620 × 1080. Needs `loadPatternFonts` first |
| Mesh-Dithered-Pattern-A | Any library image | [Luma-Background-7](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-34128) | Bayer 16×16, darker grade, no noise. Dithers lightness only |

## Known limits

- **Browser only.** Rendering and `createMesh` use a canvas, so they run in a browser. A server would need a canvas library.
- **Refraction and dither are tuned by eye**, not ported from Figma's shader code like Slice shift. They match the Figma frames closely, but not bit for bit.
- **Not fast.** Each pattern draws pixel by pixel in JavaScript: about 0.1 to 0.6 s for social formats and up to about 4.5 s for 4000 × 4000. Fine for exporting, too slow for live sliders. A WebGL version would fix that.
