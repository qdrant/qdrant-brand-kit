# Qbot 3D Mascot

The main mascot style in Design Lab. People pick an approved pose from the library, or generate a new pose or emotion that keeps the exact same character. The full brief, prompt pack and build workflow are in the shared doc (Qbot Mascot Mode, Design Lab Brief). Where it differs, the Design Lab component-based routing handoff (2026-10-23) wins.

## Rules

- **Output:** transparent PNG only. Never on a gradient or background, no size picker.
- **Library first:** the 14 approved poses download instantly, no generation.
- **New poses:** 1 generation per pose, then approve, tweak (max 3 rounds) or regenerate.
- **Styles never mix:** 3D requests send only 3D references.
- **Never over realistic imagery.** The mascot appears on a background only inside the 1:1 title image.

## What's inside

| Path | What it is | Status |
| --- | --- | --- |
| `mascot.config.json` | Single source of truth: locked character, 13 emotions (Figma mood names), 11 poses, variants, references, finish settings | Ready |
| `prompts/` | Master (Sunburst), detail rewriter, tweak, review prompts | Ready, untested on Sunburst |
| `references/master.png` | Master character, transparent PNG, 1002×1442 | Ready |
| `references/*.png` (14 poses) | Original transparent PNGs from Figma, no glow, 1024×1024 | Ready, match the Figma image hashes |
| `previews/approved-poses-sheet.png` | The 14 approved poses for reference | Preview only, not a model input |
| `scripts/build-prompt.mjs` | Builds the prompt + ordered reference list from chips | Tested |
| `scripts/finish.mjs` | Trim, even transparent padding, 2048 px long edge | Same as `2d/`, tested there |
| `scripts/export-references.mjs` | Re-pulls the 14 pose PNGs from Figma by image hash | Needs `FIGMA_TOKEN` |
| `scripts/generate.mjs` | Reference Sunburst edits call, 1 image | Not run, verify params |

## Quick start

```bash
npm install
npm run prompt -- --emotion excited --pose pointing --direction right
npm run finish -- references/loving.png --out test.png
```

## Figma sources

- Master: node 20808:18496
- Poses: component set `mascot` (20774:17744), variant property `mood`, 14 variants

## Open decisions

- Background path A (native transparent) vs B (grey + BiRefNet): decided by the feasibility test
- One automatic retry when a generation fails the review: waiting on Neil to confirm it fits the monthly cost cap
- Who can promote outputs into the approved library
