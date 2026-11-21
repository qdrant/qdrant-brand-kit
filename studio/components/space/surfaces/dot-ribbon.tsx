"use client"

import { ease } from "../rand"
import { SceneCanvas, clear, type CanvasScene, type Palette } from "../scene"
import { CardCopy } from "./card-copy"

// Dot ribbon: a ribbon of dots drifts across the top of the card, a wave that twists as it goes. Dots that
// face you are larger and brighter; the ones behind fall back. Columns sit on the 8px grid, and the ribbon
// fades out at both sides. The canvas has no background of its own, so it lies on the card's surface.

const PITCH = 8
const ROWS = 9
// Half the ribbon's width, in px, when it faces you flat.
const HALF_WIDTH = 26

type State = { w: number; h: number; p: Palette }

const ribbon: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p }
  },
  draw(ctx, { w, h, p }, t) {
    clear(ctx, p, w, h)
    const mid = (ROWS - 1) / 2
    for (let x = PITCH / 2; x < w; x += PITCH) {
      const side = ease(Math.min(x, w - x) / 64)
      const cy =
        h * 0.5 +
        Math.sin(x * 0.017 - t * 0.6) * h * 0.17 +
        Math.sin(x * 0.0065 + t * 0.23) * h * 0.08
      const twist = x * 0.012 - t * 0.45
      const spread = Math.cos(twist) * HALF_WIDTH
      const depth = Math.sin(twist)
      for (let j = 0; j < ROWS; j++) {
        const v = (j - mid) / mid
        // 0 at the back of the ribbon, 1 at the front.
        const near = (v * depth + 1) / 2
        ctx.globalAlpha = side * (0.18 + 0.82 * near)
        ctx.fillStyle = near > 0.55 ? p.bright : p.glow
        ctx.beginPath()
        ctx.arc(x, cy + v * spread, 0.6 + 1.2 * near, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
  },
}

export function DotRibbon() {
  return (
    <div className="spsurf spsurf-card">
      <div className="spsurf-ribbon">
        <SceneCanvas scene={ribbon} />
      </div>
      <div className="spsurf-body">
        <CardCopy />
      </div>
    </div>
  )
}
