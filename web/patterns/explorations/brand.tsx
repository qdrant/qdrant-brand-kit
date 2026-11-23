"use client"

import { useEffect, useRef, useState } from "react"

import { definePattern } from "../types"

// Brand patterns from brand-assets/patterns as website patterns (2026-11-23, exploring). They're drawn by the
// brand's own pattern library, never redrawn here (AGENTS.md: never change or redraw an approved pattern), and
// they render slowly, so each renders once per size (web/AGENTS.md), a quarter second after a resize settles.
//
// The library is an ES module that runs in the browser as it is. In the studio it's served from the repo at
// /repo/ (studio/app/repo, the same way the Space page's Dash field loads it); the website will need to serve
// brand-assets/patterns and primitives/typography/fonts the same way before one of these can ship.

const PATTERNS = "/repo/brand-assets/patterns"

type Library = {
  loadTokens: (url: string) => Promise<unknown>
  loadPreset: (id: string, base: string) => Promise<unknown>
  loadPatternFonts: (presets: unknown[]) => Promise<void>
  renderPattern: (
    canvas: HTMLCanvasElement,
    tokens: unknown,
    preset: unknown,
    options: { width: number; height: number; colorway?: number }
  ) => unknown
}

// One library and one set of tokens for every brand pattern on the page.
let library: Promise<{ lib: Library; tokens: unknown }> | null = null
function loadLibrary() {
  library ??= (
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${PATTERNS}/patterns/index.js`) as Promise<Library>
  ).then(async (lib) => ({ lib, tokens: await lib.loadTokens(`${PATTERNS}/tokens/placeholder.tokens.json`) }))
  return library
}

// Settings passed in at render time, over the preset's own, for a variant being explored. The preset file in
// brand-assets/patterns is never changed: a variant Vanesa keeps becomes a new preset there, with the next letter.
type Overrides = { slice?: Record<string, number>; gradient?: Record<string, number> }

function BrandPattern({
  preset: id,
  colorway,
  overrides,
}: {
  preset: string
  colorway: number
  overrides?: Overrides
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let cancelled = false
    let timer = 0
    let last = ""
    const loaded = loadLibrary().then(async ({ lib, tokens }) => {
      const preset = withOverrides(await lib.loadPreset(id, `${PATTERNS}/presets`), overrides)
      // Patterns with letters (the QDRANT layer) need Mona Sans Mono first, or they draw a fallback font.
      await lib.loadPatternFonts([preset])
      return { lib, tokens, preset }
    })
    const render = async () => {
      const { lib, tokens, preset } = await loaded
      const rect = canvas.getBoundingClientRect()
      const scale = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.round(rect.width * scale)
      const height = Math.round(rect.height * scale)
      const key = `${width}x${height}`
      if (cancelled || width < 1 || height < 1 || key === last) return
      last = key
      lib.renderPattern(canvas, tokens, preset, { width, height, colorway })
      setReady(true)
    }
    const resize = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(render, 250)
    })
    resize.observe(canvas)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      resize.disconnect()
    }
  }, [id, colorway, overrides])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
    />
  )
}

// Color-Sliced-Pattern-B, Violet: the brand's default pattern for creatives (brand-assets/patterns, README:
// "use Color-Sliced-Pattern-B, with the QDRANT letter layer, by default"). Slices of a neutral 950 to secondary
// 500 gradient, with violet QDRANT letters on a 24px grid. Colorway 1 is the violet one (0 is red).
export const colorSlicedViolet = definePattern({
  id: "color-sliced-violet",
  name: "Color-Sliced B, violet",
  kind: "background",
  description: "The brand's default pattern: violet gradient slices with a layer of QDRANT letters, edge to edge.",
  status: "exploring",
  // From: brand-assets/patterns, Color-Sliced-Pattern-B (Neutral 950 → Secondary 500).
  notes: [
    {
      rule: "A pattern never switches a section's theme",
      source: "web/guidelines.ts and design-system/DESIGN.md, Themes",
      text: "It's a dark violet field in both themes: the brand pattern has no light version, so on a light page it turns its section dark.",
    },
    {
      rule: "Patterns are subtle",
      source: "web/guidelines.ts, Patterns and effects",
      text: "It's the brand's hero pattern at full strength, with letters: the subject of a section, not a texture behind it. It suits a call to action or a banner more than a content section.",
    },
    {
      rule: "Text on it needs the pattern mask",
      source: "brand-assets/patterns/README.md, Text on a pattern (textMask: mask)",
      text: "Its preset says copy on it sits over a 40% mask of the pattern (guidelines/layout). A section's copy would need the same.",
    },
  ],
  Layer: () => <BrandPattern preset="color-sliced-pattern-b" colorway={1} />,
})

// A copy of the preset with some settings replaced, leaving the loaded preset as it is.
function withOverrides(preset: unknown, overrides?: Overrides) {
  if (!overrides) return preset
  const copy = structuredClone(preset) as { settings: Record<string, Record<string, number>> }
  for (const [group, values] of Object.entries(overrides)) copy.settings[group] = { ...copy.settings[group], ...values }
  return copy
}

// Color-Sliced B, horizontal (from a screenshot, 2026-11-23): the same violet slices and QDRANT letters, cut in
// horizontal bars. Not a saved preset: these values replace B's at render time. Bars 32 wide (r, B's is 80) at 90°
// (a, B's is -160°), each sliding sideways by a wider random offset (1500, B's is 500), over a left-to-right
// gradient that reaches secondary 500 well past the frame (to 180%, B's runs top to bottom to 130.68%), so the
// field stays mostly deep indigo.
const HORIZONTAL: Overrides = {
  slice: { a: 90, r: 32, randomOffset: 1500 },
  gradient: { angle: 90, toStop: 180 },
}

export const colorSlicedHorizontal = definePattern({
  id: "color-sliced-horizontal",
  name: "Color-Sliced, horizontal",
  kind: "background",
  description: "The brand's violet slices with QDRANT letters, cut in horizontal bars that slide apart, edge to edge.",
  status: "exploring",
  // From: Screenshot, rendered by the brand library from Color-Sliced-Pattern-B with new slice and gradient values.
  notes: [
    {
      rule: "Never change an approved pattern; a new look is a new preset",
      source: "AGENTS.md, Never; brand-assets/patterns/README.md, Adding or changing a pattern",
      text: "It's B with new effect values, so to the brand it's a new pattern. B's preset is untouched; to keep this one it has to become Color-Sliced-Pattern-C in brand-assets/patterns, with Vanesa's yes.",
    },
    ...(colorSlicedViolet.notes ?? []),
  ],
  Layer: () => <BrandPattern preset="color-sliced-pattern-b" colorway={1} overrides={HORIZONTAL} />,
})

export const brandPatterns = [colorSlicedViolet, colorSlicedHorizontal]
