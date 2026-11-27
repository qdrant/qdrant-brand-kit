"use client"

import { SceneCanvas, type CanvasScene, type PaletteKey } from "../../visuals/scene"
import { definePattern, type PatternDefinition } from "../types"
import { BASE, compute, createState, draw, type Params, type State } from "./engine"

// A Pattern Studio look as a website pattern, on the scene engine (web/visuals/scene.tsx), so it draws only on
// screen and holds still for reduced motion.
//
// Two changes from the Deploy Card page it comes from:
// - Color: one palette color through --web-scene-<key> (indigo by default), never the page's hexes.
// - No glows: the page masks each look with three blurred violet ellipses. The website's space theme uses light,
//   never glow (DESIGN.md, Space theme), so the look keeps only the page's fade: full at the top, gone by 87%,
//   lit from above and quiet behind a card's text.

// The Deploy Card page's loop: one cycle every 6 seconds.
const LOOP_SECONDS = 6
const FADE_FROM = 0.5553
const FADE_TO = 0.8676

// Light on the marks: a radial gradient through palette colors, from a point (fractions of the layer) out to
// reach × its long side, where the marks are gone. It colors the marks only, never the space between them.
export type Light = { at: [number, number]; reach: number; colors: PaletteKey[] }

type Scene = { params: Params; state: State; color: string; light: string[] }

function makeScene(
  params: Params,
  color: PaletteKey,
  loop: number,
  fade: boolean,
  light?: Light,
  band?: number,
  side?: number
): CanvasScene<Scene> {
  return {
    setup: (_size, palette) => ({
      params,
      state: createState(params),
      color: palette[color],
      light: light ? light.colors.map((k) => palette[k]) : [],
    }),
    draw(ctx, { params, state, color, light: colors }, t, _pointer, { width, height }) {
      ctx.clearRect(0, 0, width, height)
      const phase = Math.PI * 2 * ((t % loop) / loop)
      if (band) {
        // The field in a band along the bottom: measured on the band, drawn below the rest of the layer.
        const h = Math.min(band, height)
        ctx.save()
        ctx.translate(0, height - h)
        draw(ctx, params, compute(params, state, width, h, phase), color)
        ctx.restore()
      } else if (side) {
        // The field on the right side only: measured on that side, faded in over its first fifth.
        const w = Math.min(width, width * side)
        ctx.save()
        ctx.translate(width - w, 0)
        draw(ctx, params, compute(params, state, w, height, phase), color)
        ctx.restore()
        const edge = ctx.createLinearGradient(width - w, 0, width - w * 0.8, 0)
        edge.addColorStop(0, "rgb(0 0 0 / 0)")
        edge.addColorStop(1, "rgb(0 0 0 / 1)")
        ctx.globalCompositeOperation = "destination-in"
        ctx.fillStyle = edge
        ctx.fillRect(width - w, 0, w, height)
        ctx.globalCompositeOperation = "source-over"
      } else draw(ctx, params, compute(params, state, width, height, phase), color)
      if (light && colors.length > 0) {
        const x = light.at[0] * width
        const y = light.at[1] * height
        const tint = ctx.createRadialGradient(x, y, 0, x, y, light.reach * Math.max(width, height))
        colors.forEach((c, i) => tint.addColorStop((i / colors.length) * 0.999, c))
        tint.addColorStop(1, "rgb(0 0 0 / 0)")
        ctx.globalCompositeOperation = "source-in"
        ctx.fillStyle = tint
        ctx.fillRect(0, 0, width, height)
        ctx.globalCompositeOperation = "source-over"
      }
      if (!fade) return
      const mask = ctx.createLinearGradient(0, 0, 0, height)
      mask.addColorStop(FADE_FROM, "rgb(0 0 0 / 1)")
      mask.addColorStop(FADE_TO, "rgb(0 0 0 / 0)")
      ctx.globalCompositeOperation = "destination-in"
      ctx.fillStyle = mask
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = "source-over"
    },
  }
}

type Look = Omit<PatternDefinition, "Layer" | "status"> & {
  params: Partial<Params>
  // The marks' color. Indigo (glow) by default.
  color?: PaletteKey
  // Seconds per loop: 6 by default, as on the Deploy Card page.
  loop?: number
  // The Deploy Card's fade, full at the top and gone by 87%, for a card's text. On by default.
  fade?: boolean
  // A palette color the layer washes into at the bottom, under the marks (the brand patterns' backdrop).
  backdrop?: PaletteKey
  // The class that sets the layer's strength in web.css.
  strength?: string
  // Colors the marks with light from a point instead of one color.
  light?: Light
  // Draws only in a band this many px tall along the bottom of the layer, and leaves the rest empty (2026-11-24,
  // for a word under a footer's content). The field is measured on the band, so the look keeps its size. The
  // canvas still fills the layer, so it starts drawing whenever the section is on screen.
  band?: number
  // Draws only on the right side, this fraction of the layer's width, faded in at its left edge (2026-11-25, for
  // a split hero's media side, away from its text).
  side?: number
}

export function generativePattern({
  params,
  color = "glow",
  loop = LOOP_SECONDS,
  fade = true,
  backdrop,
  strength = "web-generative",
  light,
  band,
  side,
  ...rest
}: Look) {
  const scene = makeScene({ ...BASE, ...params }, color, loop, fade, light, band, side)
  return definePattern({
    ...rest,
    status: "exploring",
    Layer: () => (
      <div className="absolute inset-0">
        {backdrop && (
          <div
            className="web-pattern-backdrop absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent, var(--web-scene-${backdrop}))` }}
          />
        )}
        {/* A band can be lifted off the bottom by --pattern-band-bottom, over a row that stays under it. */}
        <div
          className={`${strength} absolute inset-x-0 top-0`}
          style={{ bottom: band ? "var(--pattern-band-bottom, 0px)" : 0 }}
        >
          <SceneCanvas scene={scene} />
        </div>
      </div>
    ),
  })
}
