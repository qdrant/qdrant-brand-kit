# Qdrant Pattern Primitives

Brand patterns built in code, so they can live in Design Lab as primitives.

- `tokens/placeholder.tokens.json`: color tokens in W3C format. The values are placeholders until Juan's design system is ready. Keep the names.
- `patterns/`: one file per pattern. Settings match the Figma panel and are fixed. The only choice is the color family (primary, secondary, teal...). Each pattern always uses the same steps, for example 500, 300 and 200.
- `reference/`: the Figma export of each pattern, to compare against.
- `index.html`: preview page with the Figma version next to the code version, and a color family picker.

## Run the preview

Serve the folder with any static server and open `index.html`, for example:

```bash
python3 -m http.server 5190
```

## Patterns

| Pattern | Figma | Status |
| --- | --- | --- |
| Luma-Background-10 | [node 20713:50546](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20713-50546) | First draft |
