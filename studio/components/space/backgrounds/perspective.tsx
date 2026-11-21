"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, approach, calm, calmGradient, dotBatch, lineBatch } from "./lib"

// Grid floor: a hairline grid plane receding to a vanishing point, its cross lines scrolling toward the
// viewer, with dots traveling along its long lines. A depth scale is marked on the right edge, and the
// vanishing point leans a little toward the pointer.

const ZN = 1.15 // nearest depth drawn
const ZF = 26 // farthest
const SX = 0.5 // spacing of the long lines, in floor units
const SPEED = 0.5 // floor units a second
const BANDS = 10 // depth bands, each with its own fade

type Traveler = { k: number; v: number; ph: number }
type State = {
  w: number
  h: number
  p: Palette
  hy: number
  f: number
  home: number
  vx: number
  xs: number[]
  travelers: Traveler[]
  last: number
}

// 1 at the nearest depth, 0 at the farthest, on a log scale like the eye.
const fade = (z: number) => clamp(1 - Math.log(z / ZN) / Math.log(ZF / ZN)) ** 1.3

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(8)
    const f = h * 0.9
    const home = w * 0.68
    // Enough long lines to reach the sides of the frame before they're lost in the distance.
    const lo = Math.floor((-home * 10) / f / SX) - 1
    const hi = Math.ceil(((w - home) * 10) / f / SX) + 1
    const xs = Array.from({ length: hi - lo + 1 }, (_, i) => (lo + i) * SX)
    return {
      w,
      h,
      p,
      hy: Math.round(h * 0.34) + 0.5,
      f,
      home,
      vx: home,
      xs,
      travelers: Array.from({ length: 22 }, () => ({
        k: Math.floor(rand() * xs.length),
        v: 0.6 + rand() * 0.6,
        ph: rand(),
      })),
      last: -1,
    }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h, hy, f, xs } = s
    const dt = s.last < 0 ? 0 : Math.max(0, t - s.last)
    s.last = t
    const target = pointer.inside ? s.home + (pointer.x - w / 2) * 0.08 : s.home + 10 * Math.sin(t * 0.1)
    s.vx = approach(s.vx, target, dt, 3)
    const vx = s.vx
    const sx = (x: number, z: number) => vx + (f * x) / z
    const sy = (z: number) => hy + f / z
    clear(ctx, p, w, h)

    const lines = lineBatch(10)
    // The long lines, cut into depth bands so each part takes its band's fade.
    for (let b = 0; b < BANDS; b++) {
      const z0 = ZN * (ZF / ZN) ** (b / BANDS)
      const z1 = ZN * (ZF / ZN) ** ((b + 1) / BANDS)
      const a = fade(Math.sqrt(z0 * z1))
      for (const x of xs) {
        const x0 = sx(x, z0)
        const x1 = sx(x, z1)
        if ((x0 < 0 && x1 < 0) || (x0 > w && x1 > w)) continue
        lines.add(x0, sy(z0), x1, sy(z1), a)
      }
    }
    // The cross lines, scrolling toward the viewer.
    const shift = (t * SPEED) % 1
    for (let z = Math.floor(ZN) + 1 - shift; z < ZF; z += 1) {
      if (z < ZN) continue
      const y = sy(z)
      lines.add(Math.max(0, sx(xs[0], z)), y, Math.min(w, sx(xs[xs.length - 1], z)), y, fade(z))
    }
    lines.stroke(ctx, calmGradient(ctx, w, p.line, 0.1))

    // The horizon and the vanishing point.
    ctx.strokeStyle = calmGradient(ctx, w, p.line, 0.1, 0.7)
    ctx.beginPath()
    ctx.moveTo(0, hy)
    ctx.lineTo(w, hy)
    ctx.stroke()
    ctx.strokeStyle = p.glow
    ctx.beginPath()
    ctx.arc(vx, hy, 3, 0, TAU)
    ctx.stroke()
    label(ctx, p, "VP", vx + 8, hy - 12, { opacity: calm(vx, w, 0.1) })

    // A depth scale on the right edge.
    ctx.strokeStyle = p.line
    ctx.beginPath()
    for (const z of [2, 4, 8, 16]) {
      const y = Math.round(sy(z)) + 0.5
      ctx.moveTo(w - 8, y)
      ctx.lineTo(w, y)
    }
    ctx.stroke()
    for (const z of [2, 4, 8, 16]) label(ctx, p, `Z ${z}`, w - 14, sy(z), { align: "right" })

    // Travelers along the long lines, coming toward the viewer.
    const dots = dotBatch(8)
    for (const { k, v, ph } of s.travelers) {
      const z = ZF - ((t * v + ph * (ZF - ZN)) % (ZF - ZN))
      const x = sx(xs[k], z)
      if (x < -4 || x > w + 4) continue
      dots.add(x, sy(z), clamp((2.6 * ZN * 1.5) / z, 0.6, 2.6), fade(z) * calm(x, w, 0.1))
    }
    dots.fill(ctx, p.bright)
  },
}

export function Perspective() {
  return <SceneCanvas scene={scene} />
}
