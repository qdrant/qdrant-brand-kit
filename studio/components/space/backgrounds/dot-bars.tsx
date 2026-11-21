"use client"

import { clamp } from "../rand"
import { SceneCanvas, alpha, chip, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, textWidth } from "./lib"

// Dot-matrix bars: LED dot columns form a histogram of vectors per shard that updates slowly. Each bar keeps
// a peak dot that holds, then falls; the fullest shard's peak is the one accent mark. Mono ticks name the
// shards and a readout gives the fullest one.

const PITCH = 8
const BARS = 12
const WIDE = 2 // dot columns per bar
const COLS = BARS * (WIDE + 1) - 1
const DOT = 2
const MILLIONS = 4 // vectors at a full bar, in millions

type State = {
  w: number
  h: number
  p: Palette
  x0: number
  y0: number
  rows: number
  peaks: number[]
  last: number
}

// A shard's fill, 0 to 1: a few slow waves, so the bars change a dot at a time.
const level = (i: number, t: number) =>
  clamp(
    0.54 +
      0.2 * Math.sin(i * 1.7 + t * 0.31) +
      0.13 * Math.sin(i * 0.55 - t * 0.19 + 2) +
      0.07 * Math.sin(t * 0.83 + i * 2.9),
    0.06,
    0.97
  )

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    // On the right, starting no further left than the middle of the frame.
    const x0 = Math.round(Math.max(w * 0.54, w - 40 - (COLS - 1) * PITCH) / PITCH) * PITCH
    const y0 = Math.round((h - 64) / PITCH) * PITCH
    const rows = Math.floor((y0 - 64) / PITCH) + 1
    return { w, h, p, x0, y0, rows, peaks: new Array(BARS).fill(0), last: -1 }
  },
  draw(ctx, s, t) {
    const { p, w, h, x0, y0, rows } = s
    const dt = s.last < 0 ? 0 : Math.max(0, t - s.last)
    s.last = t
    clear(ctx, p, w, h)

    const levels = Array.from({ length: BARS }, (_, i) => level(i, t))
    const best = levels.indexOf(Math.max(...levels))
    const off = new Path2D()
    const lit = new Path2D()
    const tops = new Path2D()
    const peaks = new Path2D()
    const mark = new Path2D()
    const add = (path: Path2D, x: number, y: number) => {
      path.moveTo(x + DOT, y)
      path.arc(x, y, DOT, 0, TAU)
    }
    levels.forEach((v, i) => {
      const n = Math.max(1, Math.round(v * rows))
      // The peak holds at the highest fill, then falls about two dots a second.
      s.peaks[i] = Math.max(n, s.peaks[i] - dt * 2)
      const peak = Math.max(n, Math.round(s.peaks[i])) - 1
      for (let c = 0; c < WIDE; c++) {
        const x = x0 + (i * (WIDE + 1) + c) * PITCH
        for (let k = 0; k < rows; k++) {
          const y = y0 - k * PITCH
          if (k === peak) add(i === best ? mark : k === n - 1 ? tops : peaks, x, y)
          else if (k === n - 1) add(tops, x, y)
          else if (k < n - 1) add(lit, x, y)
          else add(off, x, y)
        }
      }
    })
    ctx.fillStyle = alpha(p.line, 0.4)
    ctx.fill(off)
    // Lit dots brighten toward the top, lit from above.
    const top = y0 - (rows - 1) * PITCH
    const ramp = ctx.createLinearGradient(0, y0, 0, top)
    ramp.addColorStop(0, alpha(p.glow, 0.55))
    ramp.addColorStop(1, p.bright)
    ctx.fillStyle = ramp
    ctx.fill(lit)
    ctx.fillStyle = p.star
    ctx.fill(tops)
    ctx.fillStyle = p.bright
    ctx.fill(peaks)
    ctx.fillStyle = p.accent
    ctx.fill(mark)

    // The baseline, a tick under each bar, and a shard id under every fourth.
    const right = x0 + (COLS - 1) * PITCH
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x0 - 4, y0 + 8.5)
    ctx.lineTo(right + 4, y0 + 8.5)
    for (let i = 0; i < BARS; i++) {
      const x = Math.round(x0 + (i * (WIDE + 1) + (WIDE - 1) / 2) * PITCH) + 0.5
      ctx.moveTo(x, y0 + 8)
      ctx.lineTo(x, y0 + (i % 4 === 0 ? 14 : 11))
    }
    ctx.stroke()
    for (let i = 0; i < BARS; i += 4) {
      const x = x0 + (i * (WIDE + 1) + (WIDE - 1) / 2) * PITCH
      label(ctx, p, `S${String(i).padStart(2, "0")}`, x, y0 + 26, { align: "center" })
    }

    const text = `S${String(best).padStart(2, "0")}  ${(levels[best] * MILLIONS).toFixed(2)}M`
    chip(ctx, p, text, right + DOT - (Math.ceil(textWidth(ctx, p, text)) + 16), 32)
  },
}

export function DotBars() {
  return <SceneCanvas scene={scene} />
}
