# Pattern refinement (2026-11)

Vanesa is reviewing every pattern in this folder and every combination it can make (colorways, letter variants, example meshes, streak values) to decide what to keep, what to change and what to take out.

- **Where the review happens:** the [Pattern Library](https://claude.ai/artifact/HSo1QSTBTRrZ3abenyoJz3) canvas on Claude (private for now). Every pattern is a row of numbered 16:9 tiles, one per combination, rendered at 1280×720 from this branch's code on 2026-11-24. Vanesa comments on a tile by its number, like `Color-Sliced-B #3`.
- **What it shows:** 18 patterns, 71 tiles. Every colorway (and color family where a pattern has them), the 4 example meshes for mesh patterns, 2 letter variants per colorway for letter-layer patterns, and the two ends of each streak range for Motion Streaks. Where a pattern has more combinations than that, the row's note says how many and what was picked.
- **Where the changes land:** this branch, `pattern-refinement`, one commit per decision. Nothing merges until Vanesa marks the pull request ready.

## Decisions

| Pattern | Combination | Decision | Date |
| --- | --- | --- | --- |
| Color-Refracted-A | #1 and #2 (both colorways) | On hold: not sure about this pattern yet | 2026-11-24 |
| Generative-Hexagon-C | All | Hexagons on the Motion Streaks gradient without streaks; colorways Indigo, Amaranth, Teal (on hold), hexagons in 800/600/200 | 2026-11-24 |
| Generative-Glyph-A, Generative-Glyph-B | All | Removed. The letter layers (generative-glyph-layer-a/b) stay | 2026-11-24 |
| Generative-Burst-A | All | On the Motion Streaks gradient, colorways Indigo, Amaranth, Teal (on hold), lines in 800/600/200. Indigo 600 → Indigo 400 removed | 2026-11-24 |
| Generative-Dash-A, Generative-Dash-B | All | Same as Burst-A and Hexagon-C: Motion Streaks gradient, three colorways, 800/600/200 | 2026-11-24 |
| All mesh patterns | All | On hold for now | 2026-11-24 |
| Color-Sliced-A | Stripe proposals P1 (thickness 40, -160°), P2 (160, -160°), P9 (24, -160°), P11 (40, -152°) and P13 (40, -168°) | Approved. Not approved: P3 to P8, P10, P12, P14, P15 to P20, P21 to P24 and P26 to P28. Horizontal exploration continues from P25 | 2026-11-24 |
| Color-Sliced-A | Approved stripes P1, P2, P9, P11, P13 | Added to the preset as `stripes` (renderPattern option `stripes`), with a new Neutral 950 → Teal 600 colorway on hold | 2026-11-24 |
| Color-Sliced-B | All | Base inherited from Color-Sliced-A (colorways, stripes); letters varied from the Pattern Studio terminal look via `fromStudioParams`. Teal letters added to the layer | 2026-11-24 |
| Color-Sliced-A, Generative-Burst-A | Open proposals (stripes P25, P29 to P36; burst P1 to P6) | Set aside for now; nothing from them is in the presets | 2026-11-24 |
| Color-Sliced-B | Proposal P8 (terminal v8: word glyphs, color by x, noise 0.44 at 4.7, scale 0.65) | Approved; added as letter option 0 in every colorway | 2026-11-24 |
| Color-Sliced-B | Proposal P9 (terminal v9: random glyphs, color by y, noise 0.68 at 4.45, scale 0.65) | Approved; added as letter option 1 in every colorway | 2026-11-24 |
| Color-Sliced-B | Proposal P10 (terminal v10: ramp glyphs, color radial, noise 0.62 at 2.4, scale 0.65) | Approved; added as letter option 2 in every colorway | 2026-11-24 |
| Color-Sliced-B | Proposal P16 (terminal v4: ramp glyphs, color radial, noise 0.49 at 2.25, scale 0.63) | Approved; added as letter option 3 in every colorway. The other terminal proposals are not approved | 2026-11-24 |
| Generative-Hexagon-B | All | Same as the other generative patterns: Motion Streaks gradient, colorways Indigo, Amaranth, Teal (on hold), hexagons in 800/600/200 | 2026-11-24 |
| Generative-Hexagon-B, C | All | Merged into Generative-Hexagon-Pattern-B (they differed only in color mapping). C's center-out look is variant 0 | 2026-11-24 |
| Generative-Dash-A, B | All; proposals P1 to P12 | Merged into Generative-Dash-Pattern-A: Dash-B is variant 0, the 12 proposals (all approved) are variants 1 to 12 | 2026-11-24 |
| Generative-Burst-A | Proposal P16 (thick lines by value) | Not approved | 2026-11-24 |
| Generative-Burst-A | Proposals P7, P19 to P30 | Approved; added as variants 0 to 12 in every colorway | 2026-11-24 |
| Generative patterns | Names | No more A/B letters: Generative-Hexagon-Pattern (was Hexagon-B and C), Generative-Burst-Pattern (was Burst-A), Generative-Dash-Pattern (was Dash-A and B). Files renamed to match; the studio's dash field updated | 2026-11-24 |
| Motion-Streaks-A, B | Direction proposals P4 to P7 (96°, 104°, 144°, 160°) | Approved, with 124°, as the only streak directions; other angles snap to the nearest. P2, P3 and P8 to P10 not approved | 2026-11-24 |
| Motion-Streaks-A, B | Direction proposals P11 (288°) and P12 (320°) | Approved; added to the streak directions | 2026-11-24 |
| Motion-Streaks-A, B | Direction proposal P1 (0°, horizontal) | Approved; added to the streak directions | 2026-11-24 |
| Generative-Hexagon | Proposals P1 to P3, P6 to P12 | Not approved (too busy). P4 and P5 kept as the directions to explore | 2026-11-24 |
| Generative-Hexagon | Proposal P18 (filled hexagons, 32 px grid, scale 0.4) | Approved | 2026-11-24 |
| Generative-Hexagon | Proposal P15 (filled hexagons, 24 px grid, scale 0.4) | Approved | 2026-11-24 |
| Generative-Hexagon | Proposal P27 (outlined hexagons, 32 px grid, scale 0.45) | Approved | 2026-11-24 |
| Generative-Hexagon | Approved proposals P15, P18, P27 | Added as variants 1 to 3 in every colorway | 2026-11-24 |
| Generative-Hexagon | Proposal P36 (outlined hexagons, 64 px grid, scale 0.6) | Approved; added as variant 4 in every colorway | 2026-11-24 |
| Generative-Hexagon | Proposal P35 (outlined hexagons, 64 px grid, scale 0.45) | Approved; added as variant 5 in every colorway | 2026-11-24 |
| Generative-Hexagon | Proposal P34 (outlined hexagons, 56 px grid, scale 0.5) | Approved; added as variant 6 in every colorway | 2026-11-24 |
| Generative-Hexagon | Proposal P33 (outlined hexagons, 48 px grid, scale 0.65) | Approved; added as variant 7 in every colorway | 2026-11-24 |
| Generative-Hexagon | Proposal P28 (outlined hexagons, 32 px grid, scale 0.6) | Approved; added as variant 8 in every colorway | 2026-11-24 |
| Generative-Hexagon | Proposal P21 (filled hexagons, 40 px grid, scale 0.45) | Approved; added as variant 9 in every colorway | 2026-11-24 |
| Generative-Hexagon | Remaining proposals (P4, P5, P13, P14, P16, P17, P19, P20, P22, P23, P24, P25, P26, P29, P30, P31, P32) | Not approved; the proposals row is closed | 2026-11-24 |
| Color-Dithered-Pattern-A (new) | Exploration E25 | Approved: new pattern, the dither of Mesh-Dithered-A on a mesh of the family's five dark steps (diagonal), in Indigo, Amaranth and Teal (on hold) | 2026-11-24 |
