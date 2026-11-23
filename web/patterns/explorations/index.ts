import type { PatternDefinition, PatternNote } from "../types"
import { brandPatterns } from "./brand"
import { generativePattern } from "./generative"
import { spacePatterns } from "./space"

// Patterns being explored, not approved: they show only in the studio's Patterns tab, marked Exploring, and not in
// the Builder's pickers. When Juan says yes to one, move it to web/patterns/<id>.tsx, list it in
// web/patterns/index.tsx, and add its rule to web/guidelines.ts and a dated row to design-system/DESIGN.md.
//
// The Pattern Studio looks (2026-11-23) are from the Deploy Card page (Figma node 21705:27762): its own pattern
// ("Your pattern", the hex rings pasted into it) and 1, 5, 6, 7, 8, 9 and 10 of its ten variations (7, Terminal,
// and "Your pattern" added later the same day). 2 (Orbit), 3 (Vector graph) and 4 (Bloom) were left out.

// Every look loops every 6 seconds, as on the Deploy Card page.
const LOOPS: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "It moves all the time, on a 6-second loop. Depth haze, the one approved pattern, drifts far more slowly.",
}

const STEPPED: PatternNote = {
  rule: "Alive motion is stepped",
  source: "web/guidelines.ts, Nodes",
  text: "Its motion is a smooth, continuous pulse. The website's model for alive motion is the nodes' hard step to 25% and back every 2 seconds.",
}

export const explorations: PatternDefinition[] = [
  // Recreated from a screenshot (2026-11-23) with what the repo already has: Hex pulse's rings of hexagons on a hex
  // grid, drawn as outlines like the brand's Generative-Hexagon patterns, over the brand backdrop's direction
  // (brand-assets/patterns, Medium violet: neutral 950 at the top into secondary at the bottom), in the website's
  // scene colors. The screenshot's diagonal light streaks are left out: nothing approved draws them, and they're
  // a glow.
  generativePattern({
    id: "hex-field",
    name: "Hex field",
    kind: "background",
    description: "Outlined hexagons on a hex grid, in rings around a hexagon at the center, over a violet wash.",
    // From: Screenshot, rebuilt from Hex pulse and the brand's violet backdrop.
    loop: 24,
    fade: false,
    backdrop: "violet",
    strength: "web-field",
    notes: [
      {
        rule: "Light comes from above",
        source: "design-system/DESIGN.md, Space theme",
        text: "The violet wash grows toward the bottom of the section, so it's lit from below. Depth haze is brightest at the top.",
      },
      {
        rule: "A pattern never changes a section's theme",
        source: "web/guidelines.ts and design-system/DESIGN.md, Themes",
        text: "The wash tints the whole lower half of the section violet. On dark it reads as a colored band rather than the page, and it's close to the nebula gradients the space theme avoids.",
      },
      {
        rule: "A pattern supports the content",
        source: "web/guidelines.ts, Patterns and effects",
        text: "The rings are brightest in the middle of the section, where a centered title and text would sit on top of them.",
      },
      {
        rule: "Alive motion is stepped",
        source: "web/guidelines.ts, Nodes",
        text: "The rings move outward smoothly. It's slowed to one cycle every 24 seconds (Hex pulse runs every 6) to stay closer to slow or still.",
      },
    ],
    params: {
      layout: "hex",
      cell: 16,
      shape: "hexagon",
      size: 0.55,
      shaping: "rings",
      ringFrequency: 4,
      ringSpeed: 1,
      ringFade: 0.5,
      noiseAmount: 0.15,
      element: "hexagon",
      paint: "stroke",
      strokeWidth: 1,
      orientation: "fixed",
      elementRotation: 30,
      scale: 0.75,
      sizeByValue: true,
      minSize: 0.15,
      alphaByValue: true,
      minAlpha: 0.2,
      threshold: 0,
      seed: 7,
    },
  }),
  // Recreated from a screenshot (2026-11-23) like Hex field: small dots on a square grid, sized and lit by a noise
  // field (Flow field's), over the same violet backdrop. The diagonal light streaks are left out, as in Hex field.
  generativePattern({
    id: "dot-field",
    name: "Dot field",
    kind: "background",
    description: "Small light dots on a square grid, gathering in soft patches that drift slowly, over a violet wash.",
    // From: Screenshot, rebuilt from the engine's dots and noise and the brand's violet backdrop.
    color: "star",
    loop: 24,
    fade: false,
    backdrop: "violet",
    strength: "web-field",
    notes: [
      {
        rule: "No twinkling stars behind data",
        source: "design-system/DESIGN.md, References: Space, subtly",
        text: "Light dots on a dark field read as stars, and as the noise drifts each dot brightens and dims. Behind a section's text or numbers, that's close to twinkling.",
      },
      {
        rule: "Light comes from above",
        source: "design-system/DESIGN.md, Space theme",
        text: "As in Hex field, the violet wash grows toward the bottom, so it's lit from below.",
      },
      {
        rule: "A pattern never changes a section's theme",
        source: "web/guidelines.ts and design-system/DESIGN.md, Themes",
        text: "The wash tints the lower half of the section violet, close to the nebula gradients the space theme avoids.",
      },
    ],
    params: {
      layout: "grid",
      cell: 12,
      shape: "none",
      noiseScale: 1.4,
      octaves: 1,
      drift: 0.4,
      warp: 0.1,
      element: "circle",
      scale: 0.3,
      sizeByValue: true,
      minSize: 0.45,
      alphaByValue: true,
      minAlpha: 0.2,
      threshold: 0,
      density: "continuous",
      seed: 7,
    },
  }),
  // The Deploy Card's own pattern, as pasted, with all of its values (Pattern Studio's for a 1080 square, drawn
  // on the card as they are): small hexagons on a 24px hex grid, shown at random with the odds of their value
  // (stochastic), in wide rings inside a hexagon twice the card's half-width, so the rings fill the card.
  generativePattern({
    id: "hex-rings",
    name: "Hex rings",
    kind: "surface",
    description: "Small hexagons scattered on a hex grid, gathering in wide hexagonal rings that move out from the center.",
    // From: Pattern Studio, Deploy Card, "Your pattern" (the hex rings pasted into it).
    notes: [LOOPS, STEPPED],
    // The card's violet lights as light on the marks, as in Hex pulse.
    light: { at: [0.55, 0.2], reach: 1, colors: ["bright", "glow", "violet"] },
    params: {
      layout: "hex",
      cell: 24,
      shape: "hexagon",
      size: 2,
      shaping: "rings",
      softness: 1.5,
      ringFrequency: 0.5,
      ringSpeed: 2,
      ringFade: 6,
      noiseAmount: 0,
      blend: "multiply",
      noiseScale: 11.3,
      octaves: 1,
      drift: 0,
      warp: 0,
      seed: 1,
      threshold: 0,
      density: "stochastic",
      element: "hexagon",
      scale: 0.15,
      sizeByValue: true,
      minSize: 0.51,
      strokeWidth: 2.5,
      orientation: "fixed",
      elementRotation: 30,
    },
  }),
  generativePattern({
    id: "hex-pulse",
    name: "Hex pulse",
    kind: "surface",
    description: "Hexagons on a hex grid, swelling in rings that pulse out from a hexagon at the center.",
    // From: Pattern Studio, Deploy Card, 1.
    notes: [LOOPS, STEPPED],
    // Refined (2026-11-23) to match the Deploy Card. Its field is measured on a 350×400 card (a unit of 175px);
    // on a wide card the same values packed the rings 2 cells apart instead of 3.6, so the unit is fixed at 175px.
    // And the card's three violet lights (lavender at the top center, indigo, deep violet) become light on the
    // marks: lavender at the top center through indigo to violet, gone at the far corners, never a blurred glow.
    light: { at: [0.55, 0.2], reach: 1, colors: ["bright", "glow", "violet"] },
    params: {
      unitPx: 175,
      layout: "hex",
      cell: 12,
      shape: "hexagon",
      size: 0.55,
      shaping: "rings",
      ringFrequency: 4,
      ringSpeed: 2,
      ringFade: 1,
      noiseAmount: 0.2,
      element: "hexagon",
      orientation: "fixed",
      elementRotation: 30,
      scale: 0.95,
      minSize: 0.05,
      seed: 7,
    },
  }),
  generativePattern({
    id: "hyperspace",
    name: "Hyperspace",
    kind: "surface",
    description: "Streaks bursting out from the center and speeding up toward the edges.",
    // From: Pattern Studio, Deploy Card, 5.
    notes: [
      {
        rule: "No literal space imagery",
        source: "design-system/DESIGN.md, References: Space, subtly",
        text: "A jump to light speed is a literal space picture, like the rockets and planets the space theme avoids.",
      },
      {
        rule: "Slow or still, and subtle",
        source: "web/AGENTS.md, Adding a pattern",
        text: "It's the fastest of these: streaks cross the card and speed up, all the time. It pulls the eye to the center of the card, away from its text.",
      },
    ],
    params: {
      layout: "burst",
      count: 700,
      spread: 1.2,
      burstSpeed: 1,
      depthShade: 0.7,
      shape: "none",
      noiseAmount: 0,
      element: "line",
      orientation: "contour",
      lineLength: 3,
      cell: 6,
      scale: 0.6,
      lineWidth: 1.25,
      sizeByValue: false,
      alphaByValue: true,
      minAlpha: 0,
      threshold: 0.02,
    },
  }),
  generativePattern({
    id: "pixel-drift",
    name: "Pixel drift",
    kind: "surface",
    description: "Dithered hexagons along a 40° gradient, thinning out as it drifts.",
    // From: Pattern Studio, Deploy Card, 6.
    notes: [
      LOOPS,
      {
        rule: "No twinkling stars behind data",
        source: "design-system/DESIGN.md, References: Space, subtly",
        text: "Its dither turns single hexagons on and off as the noise drifts, which can read as twinkling.",
      },
    ],
    params: {
      layout: "grid",
      cell: 10,
      shape: "gradient",
      rotation: 40,
      size: 1,
      shaping: "fill",
      softness: 1.2,
      noiseAmount: 0.45,
      blend: "add",
      noiseScale: 4,
      octaves: 2,
      warp: 0,
      element: "hexagon",
      orientation: "fixed",
      elementRotation: 30,
      scale: 0.7,
      sizeByValue: false,
      density: "stochastic",
      threshold: 0,
      seed: 7,
    },
  }),
  generativePattern({
    id: "terminal",
    name: "Terminal",
    kind: "background",
    fade: false,
    description: "QDRANT spelled in ASCII characters across the section, from dots at the edges of each letter to dense marks inside.",
    // From: Pattern Studio, Deploy Card, 7. A card surface there; a background here (2026-11-23).
    notes: [
      {
        rule: "Never redraw the logo",
        source: "AGENTS.md, Never",
        text: "QDRANT across the section reads as the wordmark, spelled in Mona Sans ExtraBold instead of the logo from brand-assets/logo. The brand's own QDRANT letters (Color-Sliced B's letter layer) are a texture of small letters, not the word at section size.",
      },
      {
        rule: "A pattern supports the content",
        source: "web/guidelines.ts, Patterns and effects",
        text: "A word is a subject, not a texture: behind a section it's read before the section's title, and it sits in the middle, where a centered title would go.",
      },
      {
        rule: "No twinkling stars behind data",
        source: "design-system/DESIGN.md, References: Space, subtly",
        text: "The noise drifts through the letters, so each character keeps changing (a dot becomes a # and back). Behind a section's text, that flickers.",
      },
      {
        rule: "Mona Sans Mono replaced Geist Mono",
        source: "primitives/typography/README.md (Juan, 2026-11-17)",
        text: "Pattern Studio draws the characters in Geist Mono, the brand's old mono. Here they're in Mona Sans Mono, Medium.",
      },
      LOOPS,
    ],
    // The Deploy Card's values: the letters' field filled with a sharp edge (softness 0.04) and mixed 45% with
    // noise, each cell showing the character of the ramp " .:-=+*#%@" for its value, below 0.12 nothing.
    // As a background: the Deploy Card's values on a section, centered, with no card fade (a section's content
    // isn't at the bottom). The field is measured on the section's short side, so the word grows with it.
    params: {
      layout: "grid",
      cell: 10,
      shape: "text",
      text: "QDRANT",
      size: 0.62,
      shaping: "fill",
      softness: 0.04,
      noiseAmount: 0.45,
      blend: "mix",
      noiseScale: 3,
      warp: 0.03,
      element: "ascii",
      sizeByValue: false,
      scale: 1,
      threshold: 0.12,
      seed: 7,
    },
  }),
  generativePattern({
    id: "flow-field",
    name: "Flow field",
    kind: "surface",
    description: "Short lines on a grid, turning with the noise like a field of vectors.",
    // From: Pattern Studio, Deploy Card, 8.
    notes: [LOOPS],
    params: {
      layout: "grid",
      cell: 14,
      shape: "none",
      noiseScale: 1.4,
      octaves: 2,
      drift: 0.5,
      warp: 0.2,
      element: "line",
      orientation: "value",
      angleAmount: 0.5,
      lineLength: 1,
      lineWidth: 2,
      sizeByValue: true,
      minSize: 0.3,
      scale: 0.9,
      threshold: 0,
      seed: 7,
    },
  }),
  generativePattern({
    id: "contours",
    name: "Contours",
    kind: "surface",
    description: "Strokes following warped hexagon contour lines, like a topographic map.",
    // From: Pattern Studio, Deploy Card, 9.
    notes: [LOOPS, STEPPED],
    params: {
      layout: "grid",
      cell: 12,
      shape: "hexagon",
      size: 0.7,
      shaping: "rings",
      ringFrequency: 2.5,
      ringSpeed: 1,
      ringFade: 0,
      warp: 0.35,
      noiseAmount: 0,
      element: "line",
      orientation: "contour",
      lineLength: 1.7,
      lineWidth: 2,
      scale: 1,
      sizeByValue: false,
      threshold: 0,
      alphaByValue: true,
      minAlpha: 0.35,
      seed: 7,
    },
  }),
  generativePattern({
    id: "q-monogram",
    name: "Q monogram",
    kind: "surface",
    description: "A Q drawn in strokes along its own outline, with a few rings echoing around it.",
    // From: Pattern Studio, Deploy Card, 10.
    notes: [
      {
        rule: "Never redraw the logo",
        source: "AGENTS.md, Never",
        text: "A big Q in Mona Sans ExtraBold reads as a stand-in for the brandmark, drawn by hand instead of the logo from brand-assets/logo.",
      },
      {
        rule: "A pattern supports the content",
        source: "web/guidelines.ts, Patterns and effects",
        text: "A letter is a subject, not a texture: on a card it competes with the title. Now that the Q reads clearly, that's stronger than before.",
      },
      LOOPS,
    ],
    // Polished for a card (2026-11-23). With the Deploy Card's values (rings 9 per unit, fade 1.5, noise 0.25,
    // a 10px grid), the rings reach every corner of the card at almost full strength and the Q disappears into
    // them, and the card's fade erases its tail. Here the rings die out close to the letter (fade 5) and are
    // wider apart (5), the noise and warp are lower so its outline stays clean, a 6px grid rounds its curves,
    // and it sits a little smaller and higher (offsetY), so the whole Q, tail included, is above the fade.
    params: {
      layout: "grid",
      cell: 6,
      shape: "text",
      text: "Q",
      size: 0.65,
      offsetY: -0.3,
      shaping: "rings",
      ringFrequency: 5,
      ringSpeed: 1,
      ringFade: 5,
      noiseAmount: 0.1,
      warp: 0.02,
      element: "line",
      orientation: "contour",
      lineLength: 1.3,
      lineWidth: 1.5,
      scale: 1,
      sizeByValue: true,
      minSize: 0.1,
      seed: 7,
    },
  }),
  // The simplest options from the studio's Space page, polished (space.tsx).
  ...spacePatterns,
  // Brand patterns from brand-assets/patterns, drawn by the brand's own library (brand.tsx).
  ...brandPatterns,
]
