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
