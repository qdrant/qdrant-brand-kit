# Qdrant Pattern Primitives

Brand patterns built in code, so they can live in Design Lab as primitives.

- `tokens/placeholder.tokens.json`: color tokens in W3C format. The values are placeholders until Juan's design system is ready. Keep the names.
- `patterns/`: recipes. A recipe is a set of effects, for example Refracted Gradient (gradient + refraction + noise).
- `presets/`: the patterns themselves. A preset is a recipe with fixed values, named after its recipe and a number: Refracted Gradient 01, 02 and so on. Add new ones to `presets/index.json`.
- The only choice on a preset is the color family (primary, secondary, teal...). The steps it uses, for example 500 and 300, are fixed in the preset.
- `reference/`: the Figma export of each preset, to compare against.
- `index.html`: preview page with the Figma version next to the code version, and a color family picker.

## Run the preview

Serve the folder with any static server and open `index.html`, for example:

```bash
python3 -m http.server 5190
```

## Patterns

| Preset | Recipe | Figma | Status |
| --- | --- | --- | --- |
| Refracted Gradient 01 | Refracted Gradient | [Luma-Background-10](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | Done |
