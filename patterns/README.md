# Qdrant Pattern Primitives

Brand patterns built in code, so they can live in Design Lab as primitives.

- `tokens/placeholder.tokens.json`: color tokens in W3C format: full primary, secondary and neutral scales from the qdrant-brand skill. The values are placeholders until Juan's design system is ready. Keep the names.
- `patterns/`: recipes. A recipe is a set of effects, for example Color-Refracted-Pattern (gradient + refraction + noise) Image-Refracted-Pattern (library image + blur + refraction + noise) Image-Sliced-Pattern (library image + blur + slice shift + noise) or Image-Dithered-Pattern (library image + blur + Bayer dither, no noise). The image steps they share live in `patterns/image-source.js`.
- `meshes/`: mesh gradients, written as code. Image patterns don't use the PNG. The library image is graded, blurred and turned into an 11 x 11 grid of points, and each point is a **brand color token** like `{color.secondary.700}`: the code reads the color there and picks the closest token (OKLab distance) from the mesh palette in `image-pattern.shared.json`. That palette is primary, secondary, white and neutral.950. No mid neutrals, so no grays. About 3.5 KB of JSON per mesh, and when Juan's token values land, every mesh follows. In the tool, the mesh is made once when an image is picked; the PNG isn't kept. Each image has one mesh per look (`meshGroup`): `image-pattern` (light) and `image-dithered-pattern` (dark).
- `presets/`: the patterns themselves. Every preset extends `shared.json`, which holds the noise (40%, the same for all patterns). Image presets also extend `image-pattern.shared.json`, which holds what never changes between them: blur, brand grade, contrast and the list of source images. Each image preset only holds its effect values (refraction or slice shift).
- Presets: A preset is a recipe with fixed effect values, named after its recipe and a letter: Color-Refracted-Pattern-A, B and so on. Add new ones to `presets/index.json`.
- Colorways: the color pairs a preset can use, listed inside the preset. A colorway is two token paths. `{family}` in a path means it works with any family, for example `color.{family}.500 → color.{family}.300`. Fixed pairs, like `color.primary.100 → color.secondary.400`, mix families. New colors mean a new colorway, not a new preset.
- Source images: a placeholder. In the tool, the source is picked from the [Design Lab library](https://qdrant-design-lab.vercel.app/library) by the `source` rule in `image-pattern.shared.json`: asset type image, design-approved, Default (space) moodboard, and no mascot or robot in the prompt. Never Luma images. The test examples are kept only as meshes, with a link back to the library image.
- `sheet.html`: contact sheet with every image preset on every example image, with its brand check.
- `index.html`: preview page with each pattern, a link to its Figma frame, and a colorway or source picker.

## Run the preview

Serve the folder with any static server and open `index.html`, for example:

```bash
python3 -m http.server 5190
```

## Patterns

| Preset | Colorway | Figma | Status |
| --- | --- | --- | --- |
| Color-Refracted-Pattern-A | One family, 500 → 300 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | Done |
| Color-Refracted-Pattern-A | Primary 100 → Secondary 400 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-23406) | Done |
| Image-Refracted-Pattern-A | Any library image | [Luma-Background-9](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-31574) | Done. Tested with 2 library images |
| Image-Refracted-Pattern-B | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50585) | Done. Smoothness 100%, angle -48° |
| Image-Refracted-Pattern-C | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50609) | Done. Dispersion 56%, R 16%, angle 90° (rounded to the 8 grid) |
| Image-Refracted-Pattern-D | Any library image | [Luma-Background-8](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50612) | Done. Dispersion 88%, X 40%, R 16%, angle 144° (8 grid) |
| Image-Sliced-Pattern-A | Any library image | [Luma frame 20713:50540](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50540) | Done. Slice shift: shift 0%, softness 0, random offset 500, R 24 (8 grid), angle -120° |
| Image-Dithered-Pattern-A | Any library image | [Luma-Background-7](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-34128) | Done. Bayer 16x16, size 4, 4 levels, contrast 1.24, darker grade, no noise. Dithers lightness only, so no cyan or green dots |
