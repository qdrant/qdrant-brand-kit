import { clamp } from "./rand"
import { alpha, type Palette } from "../scene"
import { TAU, labelRow, type Box } from "./lib"

// Marks the Qdrant Edge page's demo covers share (2026-11-26), so the four read as one family: the camera's frame
// with corner brackets, a dashed device boundary, a thumbnail of an indexed frame, a dot moving along a line, and
// the timing of a cycle that builds up, holds and fades.

// The time inside a cycle and its fade-out over the last second; still, the finished state.
export function cycleTime(t: number, cycle: number, still: boolean) {
  const e = still ? cycle - 1.6 : t % cycle
  return { e, fade: 1 - clamp((e - (cycle - 1.1)) / 1) }
}

// Corner brackets around a box, like a camera's viewfinder.
export function brackets(
  ctx: CanvasRenderingContext2D,
  b: Box,
  color: string,
  length = 10,
  opacity = 1
) {
  const l = Math.min(length, b.w / 3, b.h / 3)
  const x0 = Math.round(b.x) + 0.5
  const y0 = Math.round(b.y) + 0.5
  const x1 = Math.round(b.x + b.w) - 0.5
  const y1 = Math.round(b.y + b.h) - 0.5
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x0, y0 + l)
  ctx.lineTo(x0, y0)
  ctx.lineTo(x0 + l, y0)
  ctx.moveTo(x1 - l, y0)
  ctx.lineTo(x1, y0)
  ctx.lineTo(x1, y0 + l)
  ctx.moveTo(x1, y1 - l)
  ctx.lineTo(x1, y1)
  ctx.lineTo(x1 - l, y1)
  ctx.moveTo(x0 + l, y1)
  ctx.lineTo(x0, y1)
  ctx.lineTo(x0, y1 - l)
  ctx.stroke()
  ctx.restore()
}

// A hairline box on the surface color.
export function panel(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  b: Box,
  options: {
    radius?: number
    stroke?: string
    fill?: string | null
    dash?: number[]
    opacity?: number
    width?: number
  } = {}
) {
  ctx.save()
  ctx.globalAlpha = options.opacity ?? 1
  ctx.beginPath()
  ctx.roundRect(
    Math.round(b.x) + 0.5,
    Math.round(b.y) + 0.5,
    Math.round(b.w) - 1,
    Math.round(b.h) - 1,
    options.radius ?? 4
  )
  if (options.fill !== null) {
    ctx.fillStyle = options.fill ?? alpha(p.surface, 0.9)
    ctx.fill()
  }
  ctx.setLineDash(options.dash ?? [])
  ctx.strokeStyle = options.stroke ?? p.line
  ctx.lineWidth = options.width ?? 1
  ctx.stroke()
  ctx.restore()
}

// The device's boundary: dashed, with its label inside at the top left.
export function boundary(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  b: Box,
  text: string | null,
  opacity = 1
) {
  panel(ctx, p, b, {
    radius: 8,
    fill: null,
    dash: [4, 4],
    stroke: p.dim,
    opacity: opacity * 0.9,
  })
  if (text) labelRow(ctx, p, [[text, p.label]], b.x + 12, b.y + 16, { opacity })
}

// A small dot at a point between a and b, for data on its way.
export function travel(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
  k: number,
  color: string,
  r = 2.2,
  opacity = 1
) {
  if (k <= 0 || k >= 1) return
  const x = a.x + (b.x - a.x) * k
  const y = a.y + (b.y - a.y) * k
  ctx.save()
  ctx.globalAlpha = opacity * Math.sin(k * Math.PI) ** 0.5
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
  ctx.restore()
}

// Clips to a box, runs draw, and restores.
export function within(
  ctx: CanvasRenderingContext2D,
  b: Box,
  draw: () => void
) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(b.x, b.y, b.w, b.h)
  ctx.clip()
  draw()
  ctx.restore()
}

// A thumbnail's outline: indigo for a result, amaranth for the key one, quiet otherwise.
export function thumbStroke(p: Palette, rank: number | null) {
  return rank === 0 ? p.accent : rank !== null ? p.glow : p.line
}
