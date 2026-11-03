# Qdrant Pattern Primitives

Brand patterns built in code, so they can live in Design Lab as primitives.

- `tokens/placeholder.tokens.json`: color tokens in W3C format. The values are placeholders until Juan's design system is ready. Keep the names.
- `patterns/`: recipes. A recipe is a set of effects, for example Refracted Gradient (gradient + refraction + noise).
- `presets/`: the patterns themselves. A preset is a recipe with fixed effect values, named after its recipe and a letter: Refracted Gradient A, B and so on. Add new ones to `presets/index.json`.
- Colorways: the color pairs a preset can use, listed inside the preset. A colorway is two token paths. `{family}` in a path means it works with any family, for example `color.{family}.500 → color.{family}.300`. Fixed pairs, like `color.primary.100 → color.secondary.400`, mix families. New colors mean a new colorway, not a new preset.
- `reference/`: the Figma export of each preset, to compare against.
- `index.html`: preview page with the Figma version next to the code version, and a color family picker.

## Run the preview

Serve the folder with any static server and open `index.html`, for example:

```bash
python3 -m http.server 5190
```

## Patterns

| Preset | Colorway | Figma | Status |
| --- | --- | --- | --- |
| Refracted Gradient A | One family, 500 → 300 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | Done |
| Refracted Gradient A | Primary 100 → Secondary 400 | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-23406) | Done |
