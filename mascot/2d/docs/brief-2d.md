# Qbot 2D Mascot: brief

A second mascot style in Design Lab. Same character as the 3D Qbot, drawn as a flat 2D cartoon. People pick an approved pose from the library, or generate a new pose or emotion that keeps the exact same character and style.

## Rules

- **Output:** transparent PNG only. Never on a gradient or background.
- **Library first:** the 5 approved 2D poses download instantly, no generation.
- **New poses:** 1 generation per request, then approve, tweak or regenerate.
- **Styles never mix:** 2D requests send only 2D references; 3D requests send only 3D references. A user picks the style first.
- **Never over realistic imagery:** the mascot is never placed in the astronaut imagery.

## User flow

1. Pick **Mascot**, then **2D**.
2. Library: 5 approved poses (happy, confused, friendly, loving, sad). Pick one, download the PNG.
3. Or **Create new**: one emotion chip, one pose chip, direction for poses that face or point, optional short detail.
4. One option comes back with a review verdict.
5. Approve and download, tweak (max 3 rounds), or regenerate.
6. Designer-approved results can be promoted to the library.

## Pipeline

1. Detail rewriter (text model, only if a detail was typed): one safe phrase, or a rejection with a reason.
2. `buildRequest`: locked style block + locked character block + emotion phrase + pose phrase + detail + transparent background.
3. Sunburst edits endpoint with 2D references only: master first, then up to 3 pose and emotion refs.
4. Transparent background natively. Fallback if edges are messy: flat grey background + BiRefNet cut-out.
5. Review prompt (vision model) against the master. JSON verdict.
6. `finish.mjs`: trim, even transparent padding, 2048 px long edge.
7. Save to the library tagged `mascot`, `2d`, with pose, emotion and verdict.

## How the prompt keeps the same character and style

- **Style is locked separately from the character.** A 2D model drifts in two ways: the character changes, or the drawing style slides toward 3D or a generic cartoon. The prompt has a fixed STYLE block (thick even black outlines, flat cel shading, one visor highlight, no 3D) and a fixed CHARACTER block. Users never edit either.
- **References carry most of the weight.** Every request sends the master plus the closest approved poses. More refs of the same style = less drift.
- **Only two things change.** The prompt says CHANGE ONLY: eyes and pose. Everything else is listed under NEVER.
- **Chips, not free text.** Emotions and poses map to fixed phrases in the config. Free text only adds one small prop, through the rewriter.
- **2D-specific checks** in the review: style (not 3D), outline weight, edges (no leftover fill or ground shadow).

## Differences from the 3D Qbot (do not copy across)

| Element | 2D | 3D |
| --- | --- | --- |
| Helmet top | white rectangular pad | red stripe |
| Chest logo | grey badge, grey Q | white badge, red Q |
| Outlines | thick black | none |
| Shading | flat, one grey tone | soft 3D render |
| Red | coral red | Qdrant red |

## Feasibility test (before UI work)

1. Run `generate.mjs` for 5 requests not in the library: excited + jumping, curious + thinking, happy + thumbs up, focused + sitting with laptop, proud + pointing right.
2. Review each with `review-2d.txt`; Vanesa scores the same set.
3. Go if the character and style hold in at least 4 of 5. Pick native transparent vs grey + BiRefNet by edge quality.
4. If the style drifts toward 3D, add more 2D references before building.

## Open decisions

- **Eye style:** the references mix smooth solid eyes (happy, friendly, sad) and square-pixel eyes (confused, loving). Pick one, or new emotions will be inconsistent.
- **Library size:** 5 approved poses vs 14 in 3D. More approved 2D poses = better references and fewer generations.
- **Who promotes** results into the library.
