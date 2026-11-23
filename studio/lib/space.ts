// The Space page (Step 9 of the plan): options for the space theme in web sections, to compare, not
// decisions. Each one follows the Brand Direction: dark first, precise (hairline grids, 8px measures, mono
// labels), violet depth, the accent only for one small mark, and stars that are always data.
//
// When Juan keeps one, it moves to web/ (a section's background, signature or card surface), never into a
// design-system component, and gets a dated line in design-system/DESIGN.md.
//
// The first 15 options are below; the second round (2026-11-19, from the Cosmos references on dots, data and
// hexagons) lives with its components in components/space/<tab>/options.ts.

import { options as backgroundOptions } from "@/components/space/backgrounds/options"
import { options as shaderOptions } from "@/components/space/shaders/options"
import { options as signatureOptions } from "@/components/space/signatures/options"
import { options as surfaceOptions } from "@/components/space/surfaces/options"

export const spaceTabs = [
  {
    id: "backgrounds",
    label: "Backgrounds",
    intro:
      "Full-bleed backgrounds for a section, behind the copy. Each frame shows where a heading and a button would sit, so you can judge them with content.",
  },
  {
    id: "signatures",
    label: "Signatures",
    intro:
      "One signature visual per page, the brand moment beside or under the copy. They explain vector search with the space metaphor: stars are vectors, routes are searches.",
  },
  {
    id: "surfaces",
    label: "Surfaces",
    intro:
      "Card surfaces for web sections. The effect lives in the surface around the content, never in the design system's components, which stay quiet.",
  },
  {
    id: "shaders",
    label: "Shaders",
    intro:
      "WebGL shaders for section backgrounds and surfaces: noise, dither, fields of dots and hexagons, in the palette and lit from above. Each frame shows where a heading and a button would sit. A shader holds its GPU context only while it's on screen.",
  },
  {
    id: "sections",
    label: "In a section",
    intro:
      "A few of the options put together on real sections, with the web layout, the type set and the design system's buttons. The copy is the studio's sample sentence and placeholders.",
  },
] as const

export type SpaceTab = (typeof spaceTabs)[number]["id"]

export type SpaceOption = {
  id: string
  tab: Exclude<SpaceTab, "sections">
  name: string
  idea: string
  // The part of the Brand Direction it comes from.
  source: string
  tech: "CSS" | "Canvas" | "WebGL" | "SVG" | "Brand pattern"
  motion: string
  darkOnly?: boolean
  // Surfaces: show the violet haze and stars behind the card, for glass that needs something to show through.
  backdrop?: boolean
}

const firstRound: SpaceOption[] = [
  {
    id: "star-chart",
    tab: "backgrounds",
    name: "Star chart",
    idea: "A hairline grid with a ruler, and stars that are data: brightness is a score. A query finds its six nearest stars, which light up in order with their id and score.",
    source: "Cinematic space: stars on planes, labeled, feeding readouts",
    tech: "Canvas",
    motion: "Animated",
  },
  {
    id: "dither-haze",
    tab: "shaders",
    name: "Dither haze",
    idea: "Violet depth haze from slow, warped noise, lit from above and dithered into five palette steps in 3px cells. The pointer adds a little light.",
    source: "Cinematic space: violet depth haze",
    tech: "WebGL",
    motion: "Animated, pointer",
  },
  {
    id: "contours",
    tab: "shaders",
    name: "Contour field",
    idea: "The iso-lines of a drifting density, like a map of an embedding space. Peaks turn violet; the pointer is a query that raises the field and lights the lines near it.",
    source: "Precise: hairlines, measured surfaces",
    tech: "WebGL",
    motion: "Animated, pointer",
  },
  {
    id: "dash-field",
    tab: "backgrounds",
    name: "Dash field",
    idea: "The brand's Generative-Dash-Pattern-A, drawn by the pattern library itself, used as a star field. It fades out under the copy, with a hairline grid on top.",
    source: "DESIGN.md, still to explore: Dash as a star field",
    tech: "Brand pattern",
    motion: "Still, renders once per size",
    darkOnly: true,
  },
  {
    id: "horizon",
    tab: "backgrounds",
    name: "Horizon",
    idea: "A planet's edge low in the section, lit from above, with violet haze over it, a few stars, grain, and a dashed tangent marked like a drawing.",
    source: "DESIGN.md, signature details: a horizon",
    tech: "CSS",
    motion: "Still",
  },
  {
    id: "grid-reveal",
    tab: "backgrounds",
    name: "Grid reveal",
    idea: "A quiet hairline grid. Around the pointer a brighter grid and its intersections show, with a crosshair that snaps to 8px and reads its position.",
    source: "Precise: hairline grids, 8px measures",
    tech: "CSS",
    motion: "Pointer, drifts at rest",
  },
  {
    id: "hex-parts",
    tab: "backgrounds",
    name: "Hex parts",
    idea: "A field of hexagon modules, the shape of the brandmark's parts. Groups rise and settle as the field drifts, like parts snapping into place; the pointer lifts the ones under it.",
    source: "Parts Kit: hexagonal modules from the brandmark",
    tech: "Canvas",
    motion: "Animated, pointer",
  },
  {
    id: "navigator",
    tab: "signatures",
    name: "Navigator",
    idea: "Three translucent layers of a search graph. A search enters at the top, hops toward the query, drops a layer and repeats until it reaches the nearest star, which lights with a readout.",
    source: "Navigator: HNSW planes, one bright hop route, a readout chip",
    tech: "Canvas",
    motion: "Animated, a new query every cycle",
  },
  {
    id: "filter-lens",
    tab: "signatures",
    name: "Filter lens",
    idea: "A payload filter as a lens: inside it, matching stars light up and the rest almost vanish. It follows the pointer; a click changes the filter, and the readout counts the matches.",
    source: "Navigator: a filter lens dims non-matching stars",
    tech: "Canvas",
    motion: "Pointer, click, drifts at rest",
  },
  {
    id: "orbits",
    tab: "signatures",
    name: "Orbits",
    idea: "A range search: a query at the center and tilted orbits at fixed distances, measured like a drawing. Results travel their orbits; those within range are lit.",
    source: "DESIGN.md, signature details: orbit lines",
    tech: "SVG",
    motion: "Animated",
  },
  {
    id: "globe",
    tab: "signatures",
    name: "Dotted globe",
    idea: "A sphere of evenly spread dots turning slowly, with region markers and arcs carrying a pulse. The markers are placeholders at large cloud hubs; a land mask comes next.",
    source: "DESIGN.md, signature details: a dotted globe of Qdrant Cloud regions",
    tech: "Canvas",
    motion: "Animated",
  },
  {
    id: "glass-card",
    tab: "surfaces",
    name: "Glass layers",
    idea: "A translucent card over two cutaway layers, with etched telemetry, corner marks and a ruler. On hover the layers open apart.",
    source: "Glass Engine: translucent cutaway layers with etched telemetry",
    tech: "CSS",
    motion: "Hover",
    backdrop: true,
  },
  {
    id: "annotated-card",
    tab: "surfaces",
    name: "Annotated",
    idea: "A plain card measured like a drawing: crop marks, its real width and height on dimension lines, and its padding on hover. The marks turn to the accent on hover.",
    source: "Light-hearted details: annotation marks",
    tech: "CSS",
    motion: "Hover",
  },
  {
    id: "sweep-card",
    tab: "surfaces",
    name: "Radar sweep",
    idea: "An instrument screen on the card: range rings swept from left to right. Stars glow as the sweep passes; three are results and show their score while lit.",
    source: "Precise: instruments and readouts",
    tech: "Canvas",
    motion: "Animated",
  },
  {
    id: "constellation-card",
    tab: "surfaces",
    name: "Constellation",
    idea: "A small star field on the card. Point at it and the pointer becomes a query: its six nearest stars connect to it, ranked, while the rest dim.",
    source: "Stars are always data",
    tech: "Canvas",
    motion: "Pointer, idles at rest",
  },
]

export const spaceOptions: SpaceOption[] = [
  ...firstRound,
  ...backgroundOptions,
  ...signatureOptions,
  ...surfaceOptions,
  ...shaderOptions,
]
