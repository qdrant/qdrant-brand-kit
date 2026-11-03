# Qdrant Pattern Primitives

Brand patterns written as code, ready to live in Design Lab as primitives. No images: every pattern is drawn from color tokens and small settings files, so it stays on-brand and updates when the tokens change.

## How it fits together

| Piece | What it is | Where |
| --- | --- | --- |
| **Tokens** | Brand colors in W3C format. Placeholders until Juan's design system lands. Keep the names, swap the values. | `tokens/placeholder.tokens.json` |
| **Recipe** | A set of effects, as code. One file per recipe. | `patterns/<recipe>.js` |
| **Preset** | A pattern: a recipe plus fixed values from Figma. Named `<Source>-<Effect>-Pattern-<Letter>`. | `presets/<name>.json` |
| **Shared settings** | Values every pattern of a kind uses. Change once, all update. | `presets/shared.json`, `presets/mesh-pattern.shared.json`, `presets/mesh-dithered-pattern.shared.json` |
| **Colorway** | For Color patterns: the two tokens of the gradient, listed in the preset. | inside the preset |
| **Mesh** | For Mesh patterns: an 11 × 11 grid of brand tokens made from a library image. About 3.5 KB. | `meshes/<image>.<meshGroup>.json` |
| **Effects** | Refraction, slice shift, dither, noise, brand grade and check. Shared by all recipes. | `patterns/effects.js` |

**Color patterns** take a colorway. **Mesh patterns** take a mesh, made once from a library image. The image itself is never kept.

## Using it in a tool

Everything goes through one file, `patterns/index.js`:

```js
import { loadTokens, loadPatterns, choicesFor, renderPattern, createMesh } from "./patterns/index.js";

const tokens = await loadTokens("tokens/placeholder.tokens.json");
const patterns = await loadPatterns(); // every preset in presets/index.json

// Color pattern: pick a colorway, and a family if the colorway allows one.
const { colorways } = choicesFor(patterns[0], tokens);
renderPattern(canvas, tokens, patterns[0], { colorway: 0, family: "secondary" });

// Mesh pattern: make the mesh once from a library image, store it, drop the image.
const mesh = createMesh(image, tokens, patterns[2]);
const check = renderPattern(canvas, tokens, patterns[2], { mesh });
if (!check.pass) {
  // Off-palette: pick another image.
}
```

- Patterns render at **1080 × 1080** on a canvas. Use `canvas.toBlob()` to export.
- A mesh belongs to a `meshGroup`, not to one pattern. All Mesh-Refracted and Mesh-Sliced patterns share `mesh-pattern` meshes, and Mesh-Dithered uses `mesh-dithered-pattern`. One mesh per image per group.
- **Library images** for meshes: design-approved, Default (space) moodboard, asset type image, nothing with the mascot or a robot in the prompt, never Luma. The rule is written in `mesh-pattern.shared.json` (`source`). Someone should still look at a new image before it's used: a prompt doesn't always mention everything in the picture.

## Adding or changing a pattern

| You want to… | Do this |
| --- | --- |
| Use **new colors** on an existing Color pattern | Add a colorway to its preset. Not a new pattern. |
| Use a **new library image** on Mesh patterns | Make a mesh with `createMesh` and store it. Not a new pattern. |
| Use **the same effects with new values** | Copy a preset, give it the next letter (B, C…), change the values, add it to `presets/index.json`. |
| Use **a new effect** | Add the effect to `effects.js`, write a recipe in `patterns/`, register it in `patterns/index.js`, then add a preset. |
| Change **blur, grade, contrast or noise** for all | Edit the shared preset file. Every pattern that extends it updates. Mesh files need to be made again after a grade, blur or contrast change. |
| Change **token values** | Edit the tokens file. Patterns and meshes follow on their own. |

Then run the checks and look at the result:

```bash
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

Serve the folder with any static server, then open `index.html` (one pattern at a time) or `sheet.html` (every Mesh pattern on every example mesh, with its brand check):

```bash
python3 -m http.server 5190
```

## Patterns (V1)

| Pattern | Choices | Figma | Notes |
| --- | --- | --- | --- |
| Color-Refracted-Pattern-A | Any family 500 → 300, or Primary 100 → Secondary 400 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | Refraction tuned by eye against Figma |
| Color-Sliced-Pattern-A | Neutral 950 → Primary 500, or Neutral 950 → Secondary 500 | [Frame 20943:36252](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20943-36252) | Exact port of Figma's Slice shift shader. No noise |
| Mesh-Refracted-Pattern-A | Any library image | [Luma-Background-9](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-31574) | Smoothness 72%, angle -120° |
| Mesh-Refracted-Pattern-B | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50585) | Smoothness 88%, angle -48° |
| Mesh-Refracted-Pattern-C | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50609) | Horizontal bands: dispersion 56%, R 16%, angle 90° |
| Mesh-Refracted-Pattern-D | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50612) | Dispersion 88%, X 40%, R 16%, angle 144° |
| Mesh-Sliced-Pattern-A | Any library image | [Frame 20713:50540](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50540) | Approved slice shift (tuned by eye) |
| Mesh-Dithered-Pattern-A | Any library image | [Luma-Background-7](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-34128) | Bayer 16×16, darker grade, no noise. Dithers lightness only |

## Known limits

- **Square only.** Patterns render at 1080 × 1080. Other formats (4:5, 16:9) need the recipes to take a width and a height.
- **Browser only.** Rendering and `createMesh` use a canvas, so they run in a browser. A server would need a canvas library.
- **Refraction and dither are tuned by eye**, not ported from Figma's shader code like Slice shift. They match the Figma frames closely, but not bit for bit.
- **Not fast.** Each pattern draws pixel by pixel in JavaScript: fine for exporting, too slow for live sliders. A WebGL version would fix that.
