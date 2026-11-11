# Qbot 3D Mascot

The main mascot style in Design Lab. People pick an approved pose from the library, or generate a new pose or emotion that keeps the exact same character. The full brief, prompt pack and build workflow are in the shared doc (Qbot Mascot Mode, Design Lab Brief). Where it differs, the Design Lab component-based routing handoff (2026-10-23) wins.

## Rules

- **Output:** the generated file is a transparent PNG only, never baked onto a gradient or background, no size picker.
- **Library first:** the 14 approved poses download instantly, no generation.
- **New poses:** 1 generation per pose, then approve, tweak (max 3 rounds) or regenerate.
- **Styles never mix:** 3D requests send only 3D references.
- **Never over realistic imagery.** In creatives, Qbot can sit on any brand pattern or the plain dark background, as the one hero, following [guidelines/](../../../guidelines/) sections 5 and 6 (decided 2026-11-04; replaces "only inside the 1:1 title image").

## What's inside

| Path | What it is | Status |
| --- | --- | --- |
| `mascot.css` | `.qd-mascot` and `.qd-mascot--glow` for creatives: the Figma component's glow as drop-shadows, scaled with Qbot's size. Placement rules are in [guidelines/](../../../guidelines/) section 6 | Ready, matched to Figma 2026-11-04 |
| `mascot.config.json` | Single source of truth: locked character, 13 emotions (Figma mood names), mood groups, the 12 Design Lab pose presets, variants, references, finish settings | Ready |
| `prompts/` | Master (Sunburst), detail rewriter, tweak, review prompts | Ready, untested on Sunburst |
| `references/master.png` | Master character, transparent PNG, 1002×1442 | Ready |
| `references/*.png` (14 poses) | Original transparent PNGs from Figma, no glow, 1024×1024 | Ready, match the Figma image hashes |
| `previews/approved-poses-sheet.png` | The 14 approved poses for reference | Preview only, not a model input |
| `scripts/build-prompt.mjs` | Builds the prompt + ordered reference list from chips | Tested |
| `scripts/finish.mjs` | Trim, even transparent padding, 2048 px long edge | Same as `2d/`, tested there |
| `scripts/export-references.mjs` | Re-pulls the 14 pose PNGs from Figma by image hash | Needs `FIGMA_TOKEN` |
| `scripts/generate.mjs` | Reference Sunburst edits call, 1 image | Not run, verify params |
| `tool/` | Copies of the mascot files in Design Lab's brand kit (2026-11-04): mood rules, crops and glow per mood, the 12 pose presets, the Mascot-only output type | Mirror of the live tool |

## Pose outlines

Where each approved pose actually is inside its 1024 × 1024 PNG (alpha above 20), measured 2026-11-11. Use it to place Qbot by its outline, not its image box ([`guidelines/`](../../../guidelines/) section 6): crop with `object-view-box: inset(top right bottom left)`, where right = 1024 − right edge and bottom = 1024 − bottom edge, and set `aspect-ratio` to width / height. Glow is from `tool/moods.json`.

| Pose | Left | Top | Right | Bottom | Width × height | Glow |
| --- | --- | --- | --- | --- | --- | --- |
| angry | 210 | 13 | 795 | 939 | 585 × 926 | on |
| cheerful | 202 | 29 | 716 | 929 | 514 × 900 | off |
| confused | 214 | 21 | 812 | 922 | 598 × 901 | off |
| curious | 175 | 3 | 863 | 925 | 688 × 922 | on |
| excited | 149 | 17 | 868 | 901 | 719 × 884 | on |
| focused | 230 | 8 | 882 | 896 | 652 × 888 | on |
| friendly | 175 | 75 | 801 | 905 | 626 × 830 | on |
| happy | 188 | 8 | 821 | 981 | 633 × 973 | on |
| helpful | 209 | 13 | 793 | 922 | 584 × 909 | off |
| loving | 137 | 14 | 884 | 930 | 747 × 916 | on |
| neutral | 210 | 15 | 797 | 929 | 587 × 914 | on |
| playful | 201 | 13 | 802 | 910 | 601 × 897 | on |
| proud | 165 | 23 | 814 | 926 | 649 × 903 | on |
| sad | 212 | 14 | 902 | 928 | 690 × 914 | on |

Crop rows for Half body, Close-up and Peek are still measured by eye (guidelines section 6, "In progress").

## Differences from Design Lab (2026-11-04)

- **Poses:** the config uses Design Lab's 12 presets (`tool/poses.yaml`), phrases word for word, since 2026-11-04. They replace the 11 poses from the Oct 21 brief, and the left/right direction is gone. Each phrase describes the eyes; an emotion chip is optional and overrides them. Each pose's `refs` are the closest approved renders, chosen in this repo: Design Lab sends its own Mascot moodboard instead.
- **Character description:** Design Lab's invariants say "a red cap on top of the helmet" and "no extra stripes or bands". The Figma renders show a red stripe over the helmet, red seam lines on the suit and red bands at the wrists and ankles, as `mascot.config.json` says. Design Lab's text needs fixing, not this one.
- **Mood groups:** copied from Design Lab into `mood_groups` in the config: upbeat moods by default, context moods when the title calls for them, sad and angry only on request.
- **Model and references:** Design Lab generates at 1024×1536, one image per pose, with references from its Mascot moodboard. Which images that moodboard holds isn't visible in the Brand kit.

## Quick start

```bash
npm install
npm run prompt -- --pose waving                 # eyes come from the pose
npm run prompt -- --pose heart --emotion loving  # or pick the eyes
npm run finish -- references/loving.png --out test.png
```

## Figma sources

- Master: node 20808:18496
- Poses: component set `mascot` (20774:17744), variant property `mood`, 14 variants

## Open decisions

- Background path A (native transparent) vs B (grey + BiRefNet): decided by the feasibility test
- One automatic retry when a generation fails the review: waiting on Neil to confirm it fits the monthly cost cap
- Who can promote outputs into the approved library

## In progress (2026-11-04, Vanesa continues on 2026-11-05)

- **`tool/moods.json` crop for happy** doesn't match the Figma mascot frame (built from it, the frame was off by a mean of 32 / 255; a plain `object-fit: cover` matched). The other moods' `rect` and `crop` aren't checked yet. The file mirrors Design Lab, so the fix goes there too.
- **`tool/mascot.yaml`:** `min_height` 240 px is still to confirm, and `max_crop: 0.4` doesn't fit the Close-up and Peek crops in guidelines section 6.
- **Pose landmarks** (face box, chest logo box, neck, upper chest and waist rows per pose), so agents crop the same way: see guidelines section 6, "In progress".
