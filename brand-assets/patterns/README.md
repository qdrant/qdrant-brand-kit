# Qdrant Pattern Primitives

Brand patterns written as code, ready to live in Design Lab as primitives. No images: every pattern is drawn from color tokens and small settings files, so it stays on-brand and updates when the tokens change.

## How it fits together

| Piece | What it is | Where |
| --- | --- | --- |
| **Tokens** | Brand colors in W3C format. Named exactly like Juan's color primitives in [`primitives/colors/`](../../primitives/colors/): `amaranth`, `indigo`, `teal`, `neutral` and `background.default` (the semantic role), so a preset shows which primitive it uses. `node primitives/build.mjs` fills every value from its primitive; never edit a value. Colorway names use the same names. `primary`, `secondary`, `neutral.white` and `neutral.black` are legacy aliases kept only for meshes Design Lab stored before 2026-11-24; presets and the meshes here never use them (the validator checks). | `tokens/placeholder.tokens.json` |
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

Meshes need to be made again only when the grade, blur or contrast in the shared presets change. Token value changes don't need new meshes. The mesh files in `meshes/` (4 test images × 2 mesh groups) are test examples for the preview pages, not the real library.

## Generative patterns (from Pattern Studio)

Patterns made in Pattern Studio (the `qdrant-pattern-studio` repo) are added from the tool's **Copy code** export:

1. Make a preset that `extends` `generative-pattern.shared`. The shared file holds Pattern Studio's default settings (`engine`), its tone curves (`tones`) and the design size, 1620 × 1080.
2. In the preset's `settings.engine`, list only the export's `PARAMS` that differ from the shared `engine` (never `width`, `height` or `colors`). If the export's `TONE` isn't one of the shared `tones`, add it there under a new name, and set `settings.tone` to that name.
3. Turn the colors into tokens in `colorways`: each has a `name`, `colors` and `backdrop` (the gradient behind). If the same pattern was exported in other colors, don't make a new pattern: add a colorway, and pick it with `renderPattern(..., { colorway })`. A backdrop stop past the bottom of the frame, like the red brand gradient, is written `{ "token": "{color.amaranth.600}", "at": 1.39 }`.
4. Add the preset to `presets/index.json`, run the validator, and compare it with the tool's export at 1620 × 1080: it should match pixel for pixel.

At its `designSize`, the pattern is pixel-identical to the tool. At any other size, the field and the elements keep their scale by canvas area, so nothing stretches: a wider canvas shows more of the same field. `cellScaling` sets what the elements do on bigger canvases: `"canvas"` (they grow with it, like every other pattern) or `"fixed"` (they keep their px size, so there are more of them). `generative-scaling.html` shows both side by side.

**Letter layers: what a variation may change** (Vanesa, 2026-11-24). Pass `renderPattern(..., { letters: { ... } })`, or call `varyLetterLayer(layer, changes)`. Anything else is refused, and the validator checks every letter layer:

| Setting | Rule |
| --- | --- |
| Color mapping (`colorMap`) | Any: field value, x, y, radial, random, angle |
| Glyphs (`glyphs`) | Ramp, word or random, but the characters are always the letters `QDRANT` |
| Scale (`scale`) | A little: 0.45 to 0.65 |
| Noise | Anything: amount, blend, scale, octaves, drift, warp, seed |
| Jitter | Never |
| Shape | Never a circle, hexagon, word or other shape in the middle: `"none"`, or `"text"` with no text |

**Color-Sliced-Pattern-B: two sources (for agents).** B is built from two rules (Vanesa, 2026-11-24):

1. **Base layer from Color-Sliced-Pattern-A.** B `extends` A, so it has A's colorways (Amaranth, Indigo, Teal on hold) and A's approved stripes. Pick them with `colorway` and `stripes`; anything approved for A later reaches B too.
2. **Letter layer from the Pattern Studio connector's terminal look.** Take a variation as in option 2 below and pass `fromStudioParams(variation.params)` as `letters`.

`renderPattern(canvas, tokens, colorSlicedB, { colorway, stripes, letters: fromStudioParams(variation.params), width, height })`

Approved letter options live in B's `settings.letterOptions` (Terminal v8, v9, v10 and v4). Use one with `{ letterOption: n }` instead of `letters`.

**Rotating letter variants (for agents).** Color-Sliced-Pattern-B and Motion-Streaks-Pattern-B share the same letter-layer behavior: the grid grows from 24 px (short side 1080 or less) to 40 px (4K), the letters use the colorway's 800, 600 and 200 steps from the color primitives, and variations follow the rules above. Two ways to make a variant:

1. **Built in:** `renderPattern(canvas, tokens, preset, { colorway, width, height, letters: n })`. Each number `n` is a different variant (the same `n` always gives the same one; `0` is the layer as approved). Variants change color mapping, glyph mode, scale and the noise's size, octaves, drift, warp and seed, and keep the layer's noise amount and blend, so the letter density stays close to the approved one. To rotate, try `n = 1, 2, 3…`.
2. **From the Pattern Studio connector (MCP):** call `pattern_variations` with `look: "terminal"`, `params: { element: "ascii", shape: "text", text: "", jitter: 0, ramp: "QDRANT", word: "QDRANT" }` and `vary: ["noise", "density"]`, then pass each variation through `fromStudioParams(variation.params)` and use the result as `letters`. It keeps only the allowed settings, so the connector's own shapes, colors, fonts and jitter never reach a creative. Always draw with `renderPattern` from this folder, never with the connector's `create_pattern` code: the colors must come from the tokens here.

**Layers:** a preset can list `"layers"`: transparent generative presets drawn on top of it, in order. A layer has `"background": null`, one colorway per pattern colorway in the same order, each with `"backdrop": null`, and isn't in `presets/index.json`, because it isn't a pattern on its own. Color-Sliced-Pattern-B uses `generative-glyph-layer-a`. Adding a layer to a pattern is an effect change, so it gets a new letter.

**Letters need fonts:** patterns that draw letters (Glyph) use Mona Sans Mono (Geist Mono until 2026-11-17). Call `await loadPatternFonts(patterns)` once before rendering, or the browser draws them in a fallback font.

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
cd brand-assets/patterns
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
cd brand-assets/patterns
python3 -m http.server 5190
```

## Text on a pattern: `textMask`

A preset can say whether text on it needs the pattern mask from [`guidelines/layout/`](../../guidelines/layout/) (rules in [`guidelines/`](../../guidelines/) section 4). It's only a setting for the layout: it never changes how the pattern renders. One mask strength, **40% of the pattern behind the text**, replaced `soft-1` (4%) and `soft-2` (10%) on 2026-11-16: those made creatives too dark and hid the pattern (Vanesa).

| `textMask` | Meaning | Presets |
| --- | --- | --- |
| `"mask"` | Mask, 40% behind the text | Color-Sliced-Pattern-A and B (every colorway), Generative-Dash-Pattern |
| `"none"` | No mask, text sits straight on the pattern | Color-Refracted-Pattern-A (both colorways) |
| `"both"` | Both work: make the 40% mask and no mask, show both together with the recommended one marked, and let the person pick | Generative-Hexagon-Pattern, Generative-Burst-Pattern, Mesh-Dithered-Pattern-A |
| not set | Not decided yet: render it with and without the mask, show both with the recommended one marked, and let the person pick | every other preset or colorway |

- When the answer differs by colorway, `textMask` sits on the colorway instead of the preset.
- **Never mask a light-colored pattern:** the mask turns its light colors grey (Vanesa, 2026-11-16).
- **`textColor: "dark"`** on a colorway (Color-Refracted-Pattern-A, Amaranth 200 → Indigo 400) means the pattern is light: dark text, the Light logo, no mask. Never the monochrome Black logo.
- The old values `"soft-1"` and `"soft-2"` mean `"mask"`, and their classes now give 40%, so older files still work.

## Patterns (V1)

**Color-Sliced (red and violet): use Color-Sliced-Pattern-B, with the QDRANT letter layer, by default** (about 8 creatives in 10). Color-Sliced-Pattern-A, the slices without letters, only in creatives with headshots, where the letters would compete with the faces (decided 2026-11-11).

**Mesh-Refracted and Mesh-Sliced patterns: only for creatives with little text** (a title and a button, say). For posts with a date, a place or other details, use a Color or Generative pattern. Mesh-Dithered-Pattern-A works as it is (Vanesa, 2026-11-16; a darker text side for meshes is for V2).

| Pattern | Choices | Figma | Notes |
| --- | --- | --- | --- |
| Color-Refracted-Pattern-A | Indigo 600 → 400, or Amaranth 200 → Indigo 400. The amaranth family (600 → 400) and teal were removed on 2026-11-11 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | Refraction tuned by eye against Figma |
| Color-Sliced-Pattern-A | Neutral 950 → Amaranth 600, Neutral 950 → Indigo 600, Neutral 950 → Teal 600 (on hold) | [Frame 20943:36252](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20943-36252) | Exact port of Figma's Slice shift shader. No noise **Not the default:** use Color-Sliced-Pattern-B (with letters); A only behind headshots (Vanesa, 2026-11-11). Five approved stripe options besides its own (thickness 24 to 160, angle -168° to -152°): `renderPattern(..., { stripes: n })` (2026-11-24). |
| Color-Sliced-Pattern-B | Color-Sliced-A's colorways and stripes (inherited): Amaranth, Indigo, Teal (on hold), letters in the family's 800, 600, 200 | Pattern Studio export (layer) | Color-Sliced-A (inherited with `extends`) with a layer of QDRANT letters on top (`generative-glyph-layer-a`: grid from 24 px at a short side of 1080 to 40 px at 4K, letters 0.55, noise 4.5). The layer matches the tool at 1920 × 1080 except the letter shapes: the letters are Mona Sans Mono, the brand mono font since 2026-11-17, not the export's Geist Mono (about 0.2% of pixels differ, most visibly the Q's tail). Re-approved with Mona Sans Mono by Vanesa on 2026-11-19. Needs `loadPatternFonts` first |
| Motion-Streaks-Pattern-A | Background → Indigo 900, Background → Amaranth 900, Background → Teal 900 (teal on hold until the council approves) (streaks in the family's 800) | [Frame 23789:66977](https://www.figma.com/design/2u6KfDsYjibQuf9ji6lFBR/Qdrant-Brand-Design?node-id=23789-66977) | **Draft.** Line-for-line port of Figma's Motion streaks shader, at 24% over the gradient. Defaults on the 8 grid: length 72, density 40, softness 56, direction 124°. Values can change within the approved ranges, rounded to the 8 grid: length 16–80%, density 8–64, softness 32–64, and direction 0°, 96°, 104°, 124°, 144°, 160°, 288° or 320° (other angles snap to the nearest; approved 2026-11-24). Same formula as Figma, but streak positions differ (Figma's depend on the graphics card) |
| Motion-Streaks-Pattern-B | Background → Indigo 900, Background → Amaranth 900, Background → Teal 900 (teal on hold until the council approves) (letters in the family's 800, 600 and 200) | Pattern Studio export (layer) | **Draft.** Motion-Streaks-A with random QDRANT letters scattered over the whole canvas (`generative-glyph-layer-b`), never a shape in the middle. The letter grid grows from 24 px (short side 1080 or less) to 40 px (4K). Needs `loadPatternFonts` first |
| Mesh-Refracted-Pattern-A | Any library image | [Luma-Background-9](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-31574) | Smoothness 72%, angle -120° |
| Mesh-Refracted-Pattern-B | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50585) | Smoothness 88%, angle -48° |
| Mesh-Refracted-Pattern-C | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50609) | Horizontal bands: dispersion 56%, R 16%, angle 90° |
| Mesh-Refracted-Pattern-D | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50612) | Dispersion 88%, X 40%, R 16%, angle 144° |
| Mesh-Sliced-Pattern-A | Any library image | [Frame 20713:50540](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50540) | Approved slice shift (tuned by eye) |
| Generative-Hexagon-Pattern | Background → Indigo 900, Background → Amaranth 900, Background → Teal 900 (on hold) | Pattern Studio export | Small outlined hexagons scattered on a 56 px grid, colored top to bottom or, with `{ variant: 0 }`, from the center out (Hexagon-C, merged in 2026-11-24), on the Motion Streaks gradient without the streaks. Hexagons in the family's 800, 600 and 200. Variants 1 to 8: bigger flat hexagons (filled on 24 and 32 px grids, outlined on 32, 48, 56 and 64 px), approved 2026-11-24 |
| Generative-Burst-Pattern | Background → Indigo 900, Background → Amaranth 900, Background → Teal 900 (on hold) | Pattern Studio export | 1,100 short lines bursting out from the center, on the Motion Streaks gradient without the streaks. Lines in the family's 800, 600 and 200. 13 approved line variants (`{ variant: n }`) from the Pattern Library review |
| Generative-Dash-Pattern | Background → Indigo 900, Background → Amaranth 900, Background → Teal 900 (on hold) | Pattern Studio export | Short horizontal dashes on a 64 px grid, thinned by a twisted noise field, on the Motion Streaks gradient without the streaks. 13 approved variants (`{ variant: n }`): 0 is the finer 48 px grid (Dash-B, merged in 2026-11-24), 1 to 12 the looks from the Pattern Library review |
| Mesh-Dithered-Pattern-A | Any library image | [Luma-Background-7](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-34128) | Bayer 16×16, darker grade, no noise. Dithers lightness only |

## Known limits

- **Browser only.** Rendering and `createMesh` use a canvas, so they run in a browser. A server would need a canvas library.
- **Refraction and dither are tuned by eye**, not ported from Figma's shader code like Slice shift. They match the Figma frames closely, but not bit for bit.
- **Not fast.** Each pattern draws pixel by pixel in JavaScript: about 0.1 to 0.6 s for social formats and up to about 4.5 s for 4000 × 4000. Fine for exporting, too slow for live sliders. A WebGL version would fix that.
