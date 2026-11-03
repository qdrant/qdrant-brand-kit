# Qdrant Pattern Primitives

Brand patterns built in code, so they can live in Design Lab as primitives.

- `tokens/placeholder.tokens.json`: color tokens in W3C format. The values are placeholders until Juan's design system is ready. Keep the names.
- `patterns/`: recipes. A recipe is a set of effects, for example Color-Refracted-Pattern (gradient + refraction + noise) or Image-Refracted-Pattern (library image + blur + refraction + noise). Shared effects live in `patterns/effects.js`.
- `presets/`: the patterns themselves. Every preset extends `shared.json`, which holds the noise (40%, the same for all patterns). Image presets also extend `image-refracted-pattern.shared.json`, which holds what never changes between them: blur, brand grade, contrast and the list of source images. Each image preset only holds its refraction values.
- Presets: A preset is a recipe with fixed effect values, named after its recipe and a letter: Color-Refracted-Pattern-A, B and so on. Add new ones to `presets/index.json`.
- Colorways: the color pairs a preset can use, listed inside the preset. A colorway is two token paths. `{family}` in a path means it works with any family, for example `color.{family}.500 → color.{family}.300`. Fixed pairs, like `color.primary.100 → color.secondary.400`, mix families. New colors mean a new colorway, not a new preset.
- `reference/`: the Figma export of each preset, to compare against.
- `sources/`: source images for image recipes. Only space or astronaut images from the [Design Lab library](https://qdrant-design-lab.vercel.app/library). Never the mascot, never Luma images.
- `index.html`: preview page with the Figma version next to the code version, and a color family picker.

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
