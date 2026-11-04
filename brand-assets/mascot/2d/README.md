# Qbot 2D Mascot: handoff package

Adds the 2D cartoon Qbot as a second mascot style in Design Lab. Start with `docs/brief-2d.md`.

## What's inside

| Path | What it is | Status |
| --- | --- | --- |
| `docs/brief-2d.md` | Rules, user flow, pipeline, prompting approach, test plan, open decisions | Ready |
| `mascot-2d.config.json` | Single source of truth: locked style, locked character, emotions, poses, references, finish settings | Ready |
| `prompts/` | Master, detail rewriter, tweak and review prompts for 2D | Untested on Sunburst |
| `references/` | Master + 5 approved poses, transparent PNG | Ready; run `export-refs` for uncropped originals |
| `previews/approved-2d-poses.png` | The 5 poses side by side | Preview only |
| `scripts/build-prompt.mjs` | Chips to prompt + 2D-only reference list | Tested |
| `scripts/finish.mjs` | Trim, pad, export transparent PNG at 2048 px | Tested |
| `scripts/export-references.mjs` | Pulls the uncropped originals from Figma | Needs `FIGMA_TOKEN` |
| `scripts/generate.mjs` | Reference Sunburst edits call, 1 image | Not run, verify params |
| `samples/finished-loving.png` | finish.mjs output | For checking |

## Quick start

```bash
npm install
FIGMA_TOKEN=xxx npm run export-refs   # replaces references/ with uncropped originals
npm run prompt -- --emotion excited --pose pointing --direction right
npm run finish -- references/loving.png --out test.png
```

## Figma sources

- Master: node 20914:19617
- Approved poses: frame 20914:19618 (5 images)
