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
| Color-Dithered-Pattern-A | Exploration E26 (diagonal, light top right) | Approved; added as variant 0 in every colorway | 2026-11-24 |
| Color-Dithered-Pattern-A | Exploration E27 (Vertical, light at the bottom) | Approved; added as variant 1 in every colorway | 2026-11-24 |
| Color-Dithered-Pattern-A | Exploration E31 (Corner glow, bottom left) | Approved; added as variant 2 in every colorway | 2026-11-24 |
| Color-Dithered-Pattern-A | Exploration E32 (Corner glow, top right) | Approved; added as variant 3 in every colorway | 2026-11-24 |
| Dithered explorations | Remaining (E28, E29, E30, E33, E34, E35, E36) | Not approved; the Explorations column is closed | 2026-11-24 |
| Color-Dithered-Pattern-A | All, with variants 0 to 3 | On hold, with the mesh patterns | 2026-11-24 |
| Generative-Pulse-Pattern (new) | Exploration H73 (Hex pulse look, big rings filling the frame) | Approved: new generative pattern in Indigo, Amaranth and Teal (on hold) | 2026-11-24 |
| Generative-Rings-Pattern (new) | Explorations X1 (reference), X3, X6, X8, X9, X10, X12 to X16 | Approved: new generative pattern from Vanesa's reference, X1 as the base and the others as variants 0 to 9, in Indigo, Amaranth and Teal (on hold) | 2026-11-24 |
| All patterns | Usage | Rules for agents in guidelines/ section 2a: nothing on hold is used (every teal colorway, mesh patterns, Color-Refracted-A, Color-Dithered-A); color ratio set after the council's approval; new combinations only from approved parts. `isOnHold` and `usableColorways` in patterns/index.js | 2026-11-24 |
| Color-Sliced-A (and B, which inherits it) | Softer-contrast proposals S1 to S8; S6 approved | Every colorway now runs from its family's 975 to its 700 (Amaranth, Indigo, Teal on hold), replacing Neutral 950 → the family's 600. The other proposals were dropped | 2026-11-24 |
| Motion-Streaks-A, B | Direction 104° | Removed from every colorway; the approved directions are now 0°, 96°, 124°, 144°, 160°, 288° and 320° (104° snaps to 96°) | 2026-11-24 |
| Motion-Streaks-A, B | Direction 96° | Removed from every colorway; the approved directions are now 0°, 124°, 144°, 160°, 288° and 320° (96° and 104° snap to 124°) | 2026-11-24 |
| All approved patterns | Neutral colorways (ND, NL) | Dark neutral added to every approved pattern: Color-Sliced Neutral 1000 → 800, Motion Streaks Background → Neutral 800 (streaks 700), generative Background → Neutral 800. Light neutral (Neutral 25 → 300, Neutral 0 → 200) added on hold | 2026-11-24 |
| Color-Sliced-B, Motion-Streaks-B | Letter colors | Letters in the family's 800, 700, 600 instead of 800, 600, 200, so they blend with the background. Motion-Streaks-B letter variation 1 (#7, #21, #35) keeps 800, 600, 200 (`letterColorSteps`). Light neutral letters are white | 2026-11-25 |
| Generative-Hexagon | Element colors | Hexagons in 800, 700, 600; filled variants 1, 2, 9 in 800 and 700 only (variant `colorSteps`) | 2026-11-25 |
| Generative Burst, Dash, Pulse, Rings | Element colors | Elements in 800, 700, 500: never lighter than 500 | 2026-11-25 |
| Mesh patterns, Color-Refracted-A, Color-Dithered-A, light neutrals | Everything on hold except teal | Removed from the repo (presets, recipes, meshes, library flow, sheet.html), kept only in the Pattern Library artifact until Vanesa asks to add one back. Teal stays, on hold | 2026-11-25 |
| Generative Dash, Burst, Pulse, Rings | Pattern Studio looks data bars, hyperspace and hex pulse | Approved as open looks: agents make new variations with `look` inside ranges taken from the approved variants (Pulse: noise only). Generative-Hexagon stays fixed | 2026-11-25 |
| Color-Sliced-A/B, Motion-Streaks-A/B | Line angle | One fixed angle, 70° from horizontal (as Color-Sliced-A #15): stripes at -160° (the -152° and -168° stripe options removed, so `stripes` is now 0 to 2), Motion Streaks direction 110° only (0°, 124°, 144°, 160°, 288°, 320° removed) | 2026-11-26 |
| Every approved pattern | Light mode | Added back on hold: colorway Neutral 100 → Neutral 300 with the whole top layer white (Neutral 0), `textColor: "dark"`, `textMask: "none"`; `fixedColors` keeps it white through letter and variant color steps | 2026-11-26 |
| Color-Sliced-A (and B, which inherits it) | Lower contrast #8 | Amaranth, Indigo and Teal (on hold) now run from Neutral 975 to the family's 800, replacing the family's 975 → 700. Dark neutral and light mode unchanged | 2026-11-26 |
| Color-Sliced-A, B | Banding | The engine works out the slices in full precision and turns them into 8-bit colour with an 8 × 8 ordered (Bayer) dither (`orderedDither` in effects.js), so dark gradients don't band | 2026-11-26 |
| Color-Sliced-B | Letter colors | Letters in the family's 950, 900, 800 (dark neutral: Neutral 950, 900, 800) with the new `settings.letterSteps`; light mode keeps white letters | 2026-11-26 |
| Motion-Streaks-B | Letter colors | Letters in the family's 900, 800, 700 (`settings.letterSteps`); letter variation 1 keeps 800, 600, 200 (`letterColorSteps`); light mode keeps white letters | 2026-11-26 |
