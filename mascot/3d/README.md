# Qbot Mascot Mode: handoff package

Everything needed to build the Mascot mode in Design Lab. The full brief, user flow,
prompt pack and build workflow are in the shared doc (Qbot Mascot Mode, Design Lab Brief).

## What's inside

| Path | What it is | Status |
| --- | --- | --- |
| `mascot.config.json` | Single source of truth: locked character, 13 emotions (Figma mood names), 11 poses, variants, references, gradient, glow, sizes | Ready |
| `prompts/` | Master (Sunburst), detail rewriter, tweak, review prompts | Ready, untested on Sunburst |
| `references/master.png` | Master character, transparent PNG, 1002×1442 | Ready |
| `references/*.png` (14 poses) | Original transparent PNGs from Figma, no glow | Run `export-refs` |
| `previews/approved-poses-sheet.png` | The 14 approved poses for reference | Preview only, not a model input |
| `scripts/build-prompt.mjs` | Builds the prompt + ordered reference list from chips | Tested |
| `scripts/composite.mjs` | Exact brand gradient + Figma glow, or transparent canvas, per channel size | Tested |
| `scripts/export-references.mjs` | Pulls the 14 original pose PNGs from Figma by image hash | Needs `FIGMA_TOKEN` |
| `scripts/generate.mjs` | Reference Sunburst edits call | Not run, verify params |
| `samples/` | Composite output examples using the master | For checking the look |

## Quick start

```bash
npm install
FIGMA_TOKEN=xxx npm run export-refs          # fills references/ with the 14 poses
npm run prompt -- --emotion excited --pose pointing --direction right
npm run composite -- references/master.png --size slide_16x9 --output gradient --position right --out test.png
```

## Values from Figma

- Backdrop gradient (node 18887:33975): top `#090E1A` to bottom `#6047FF`, linear, vertical
- Glow (pose components): `#976BFF`, 4 stacked upward drop shadows, see `glow` in the config
- Poses: component set `mascot` (20774:17744), variant property `mood`, 14 variants

## Open decisions

- Background path A (native transparent) vs B (grey + BiRefNet): decided by the test run
- Who can promote outputs into the approved library
