"use client"

import * as React from "react"

import { definePattern, type PatternDefinition, type PatternNote } from "../types"
import "./hero-lab/hero-space.css"

// Hero space (marketing designer, 2026-11-27): three hero backgrounds from the marketing designer's hero lab, built
// apart on three.js and brought in as they are. hero-lab/ is the lab's export with performance changes made here
// (2026-11-27, listed at the top of its README, to carry back into the lab); this file only mounts them as patterns:
// - it mounts a concept when its section comes near the screen and destroys it, WebGL context included, when it
//   scrolls away (the lab only pauses it), and again when the theme changes;
// - it passes the website's background, which picks the version (on a light one the kit draws ink instead of light,
//   2026-11-27), Mona Sans Mono for the readouts (the lab's default is Geist Mono), a quiet
//   zone over the section's heading, text and buttons, and the section's main button as the boost;
// - it places the planet and the galaxy for the room the section has: in the band under the content when the
//   section has one (the Component Explorations add 340px, like the lab's spacer), or fitted to the hero as it is
//   (Pages Explorations), where the band doesn't exist.

type Concept = "vector-galaxy" | "galaxy-zoom" | "deep-field-data"
type Options = Record<string, unknown>
type Handle = { destroy(): void; setBoost(level: number): void }

const LOAD: Record<Concept, () => Promise<{ mount: (el: HTMLElement, options?: Options) => Handle }>> = {
  "vector-galaxy": () => import("./hero-lab/concepts/vector-galaxy.js"),
  "galaxy-zoom": () => import("./hero-lab/concepts/galaxy-zoom.js"),
  "deep-field-data": () => import("./hero-lab/concepts/deep-field-data.js"),
}

// Any CSS color (oklch, color-mix…) as rgb(), which three.js reads, through a 1px canvas.
let probe: CanvasRenderingContext2D | null = null
function rgbOf(css: string) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!probe) return "#0b0f19"
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = css
  probe.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}

// Where the section's content is, in fractions of the layer: the heading block (heading, text, buttons) for the
// quiet zone, and the bottom of the lowest text (the stats row) for the band under it.
function measure(scope: HTMLElement, layer: HTMLElement) {
  const box = layer.getBoundingClientRect()
  const W = Math.max(1, box.width)
  const H = Math.max(1, box.height)
  const heading = scope.querySelector("h1, h2")
  const block = heading?.parentElement?.getBoundingClientRect()
  let bottom = 0
  scope.querySelectorAll("h1, h2, p, li, a").forEach((el) => {
    if (el.closest(".web-pattern")) return
    bottom = Math.max(bottom, el.getBoundingClientRect().bottom - box.top)
  })
  const quietZone = block
    ? {
        x: (block.left + block.width / 2 - box.left) / W,
        y: (block.top + block.height / 2 - box.top) / H,
        rx: (block.width / 2 / W) * 1.15,
        ry: (block.height / 2 / H) * 1.3,
      }
    : null
  return { W, H, quietZone, band: Math.max(0, H - bottom - 24), bandTop: bottom / H }
}

// Each concept's position for the room it has. Fractions of the layer, as in the lab's README.
function place(concept: Concept, m: ReturnType<typeof measure>): Options {
  const roomy = m.band >= 240
  const mid = m.bandTop + (1 - m.bandTop) / 2
  if (concept === "vector-galaxy") {
    // In the band, the kNN chip (1.28 radii above the planet's center) clears the stats and the planet (1 radius
    // below) the bottom. Without it, the planet rises from the bottom edge, under the stats, without the chip and
    // the record tag, which would land on them.
    if (!roomy) return { planet: { x: 0.5, y: 1.02, size: 0.2 }, labels: false }
    const R = Math.min(m.H * 0.17, m.band / 2.35)
    return { planet: { x: 0.5, y: (m.bandTop * m.H + 24 + 1.3 * R) / m.H, size: R / m.H } }
  }
  if (concept === "galaxy-zoom") return roomy ? { galaxy: { x: 0.5, y: mid + 0.04 } } : { galaxy: { x: 0.5, y: 0.98 } }
  return { nebula: { y: roomy ? mid : 0.62, angle: -30 } }
}

function HeroSpaceLayer({ concept }: { concept: Concept }) {
  const host = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const layer = host.current
    const scope = layer?.closest(".web-pattern")?.parentElement as HTMLElement | null
    if (!layer || !scope) return
    let handle: Handle | null = null
    let near = false
    let run = 0

    const stop = () => {
      run += 1
      handle?.destroy()
      handle = null
    }
    const start = () => {
      stop()
      const mine = run
      // Measured once the fonts are in: the heading's size, so the quiet zone, changes with them.
      void Promise.all([LOAD[concept](), document.fonts?.ready]).then(([{ mount }]) => {
        if (mine !== run || !near) return
        const style = getComputedStyle(layer)
        const background = rgbOf(style.getPropertyValue("--web-scene-bg").trim() || "#0b0f19")
        layer.style.setProperty("--hs-bg", background)
        const m = measure(scope, layer)
        handle = mount(layer, {
          background,
          monoFont: style.getPropertyValue("--qd-font-family-mono").trim() || "ui-monospace, monospace",
          quietZone: m.quietZone,
          boostOn: scope.querySelector("a") ?? null,
          ...place(concept, m),
        })
      })
    }

    // Holds a WebGL context only near the screen: browsers keep about 16 at once.
    const io = new IntersectionObserver(
      ([entry]) => {
        const was = near
        near = entry?.isIntersecting ?? false
        if (near && !was) start()
        else if (!near && was) stop()
      },
      { rootMargin: "200px" }
    )
    io.observe(layer)
    // The background color is read once per mount: mount again when the theme changes.
    const theme = new MutationObserver(() => {
      if (near) start()
    })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] })

    return () => {
      io.disconnect()
      theme.disconnect()
      stop()
    }
  }, [concept])

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      // The lab's labels read the page's colors from these.
      style={
        {
          "--fg": "var(--foreground)",
          "--muted-fg": "var(--muted-foreground)",
          "--line": "var(--web-line)",
          "--hs-mono": "var(--qd-font-family-mono)",
        } as React.CSSProperties
      }
    />
  )
}

// ---- Where they stretch the rules ---------------------------------------------------------------------------------

const ENGINE: PatternNote = {
  rule: "Canvas and WebGL visuals run on visuals/scene.tsx",
  source: "web/AGENTS.md, How sections are built",
  text: "It runs on three.js with the hero lab's own runtime (hero-lab/kit.js), not on the website's scene engine or the three.js stage in three/.",
}
const COLORS: PatternNote = {
  rule: "In the website's variables, never a hex",
  source: "web/AGENTS.md, Adding a pattern",
  text: "Its colors are fixed in the shaders (indigo-900, indigo-600, indigo-400, amaranth-600, all brand primitives), not read from --web-scene-*. In dark it adds them as light; in light (2026-11-27) it lays them down as indigo ink, darker where the dark version is brighter.",
}
const TEXT: PatternNote = {
  rule: "A pattern never holds text",
  source: "web/patterns/types.ts",
  text: "It shows readouts in Mona Sans Mono beside the cursor (values, a record tag, the zoom or the vector count).",
}
const GLOW: PatternNote = {
  rule: "Space comes from light, type and motion, never glow",
  source: "design-system/DESIGN.md",
  text: "Halos, an Einstein ring and star spikes are glows, drawn in the shader.",
}
const CURSOR: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "It follows the cursor closely and drifts on its own when nobody points; clicks send a wave and the main button's hover boosts it.",
}
const UNDER: PatternNote = {
  rule: "No pattern marks under letters",
  source: "Patterns brief (marketing designer)",
  text: "A quiet zone dims it behind the heading and buttons, but the stats row has none: without the band, points can pass under the stats.",
}

const make = (concept: Concept, def: Omit<PatternDefinition, "Layer" | "status" | "kind">): PatternDefinition =>
  definePattern({ ...def, kind: "background", status: "exploring", Layer: () => <HeroSpaceLayer concept={concept} /> })

export const heroSpacePatterns: PatternDefinition[] = [
  make("vector-galaxy", {
    id: "hero-space-vector-galaxy",
    name: "Hero space: Vector galaxy",
    description:
      "A ringed planet of 4,500 vectors over a faint Milky Way; the cursor is a kNN query that lights its five nearest points and tags the closest record.",
    notes: [ENGINE, COLORS, TEXT, GLOW, CURSOR, UNDER],
  }),
  make("galaxy-zoom", {
    id: "hero-space-galaxy-zoom",
    name: "Hero space: Galaxy zoom",
    description:
      "A spiral galaxy of data points; the cursor is a loupe that magnifies about 3.5 times and shows some of the points as values.",
    notes: [ENGINE, COLORS, TEXT, CURSOR, UNDER],
  }),
  make("deep-field-data", {
    id: "hero-space-deep-field",
    name: "Hero space: Deep field, data",
    description:
      "A nebula band with three layers of stars and grain; the cursor bends space like a gravitational lens and the stars near it show values.",
    notes: [ENGINE, COLORS, TEXT, GLOW, CURSOR, UNDER],
  }),
]
