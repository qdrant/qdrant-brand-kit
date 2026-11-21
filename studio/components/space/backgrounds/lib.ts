import { clamp, ease } from "../rand"
import { alpha, rgb, type Palette } from "../scene"

// Helpers the second-round backgrounds share: the calm left side, palette mixes, hexagons, and batches that
// draw many dots or lines in a few calls.

export const TAU = Math.PI * 2

type Ctx = CanvasRenderingContext2D

// A frame's left side stays calmer, where the copy sits. Between these two x positions a scene goes from
// `floor` to full strength. The copy has a fixed width, so the span is in pixels, a little less on a narrow frame.
function calmSpan(w: number) {
  return [Math.min(w * 0.36, 240), Math.min(w * 0.76, 520)] as const
}

// How much of a scene shows at x: `floor` under the copy, 1 from the middle right.
export function calm(x: number, w: number, floor = 0.12) {
  const [a, b] = calmSpan(w)
  return floor + (1 - floor) * ease((x - a) / (b - a))
}

// A palette color that fades toward the left like calm(), as a gradient for one stroke or fill across the frame.
export function calmGradient(ctx: Ctx, w: number, color: string, floor = 0.12, max = 1) {
  const [a, b] = calmSpan(w)
  const gradient = ctx.createLinearGradient(0, 0, w, 0)
  gradient.addColorStop(0, alpha(color, floor * max))
  for (let i = 0; i <= 8; i++) {
    const x = a + ((b - a) * i) / 8
    gradient.addColorStop(clamp(x / w), alpha(color, calm(x, w, floor) * max))
  }
  gradient.addColorStop(1, alpha(color, max))
  return gradient
}

// Two palette colors mixed, from a (t = 0) to b (t = 1).
export function mix(a: string, b: string, t: number) {
  const from = rgb(a)
  const to = rgb(b)
  const [r, g, bl] = from.map((v, i) => Math.round(v + (to[i] - v) * t))
  return `rgb(${r} ${g} ${bl})`
}

// Whether the scene sits on a light background (the light theme), for shading that has to flip.
export function isLight(p: Palette) {
  const [r, g, b] = rgb(p.bg)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 128
}

// The width of a 12px mono label, to place it before it's drawn.
export function textWidth(ctx: Ctx, p: Palette, text: string) {
  ctx.save()
  ctx.font = `500 12px ${p.mono}`
  const width = ctx.measureText(text).width
  ctx.restore()
  return width
}

// Eases a value toward a target at a rate per second. With no time step (reduced motion) it jumps there.
export function approach(value: number, target: number, dt: number, rate: number) {
  return dt > 0 ? value + (target - value) * (1 - Math.exp(-dt * rate)) : target
}

// The corners of a pointy-top hexagon (a vertex up, like the brandmark's parts), from the top, clockwise:
// top, upper right, lower right, bottom, lower left, upper left.
const UNIT = [0, 1, 2, 3, 4, 5].map((k) => {
  const a = ((60 * k - 90) * Math.PI) / 180
  return [Math.cos(a), Math.sin(a)] as const
})

export function hexCorners(x: number, y: number, r: number) {
  return UNIT.map(([cx, cy]) => [x + cx * r, y + cy * r] as const)
}

// Adds a closed pointy-top hexagon to a path.
export function hexagon(path: Ctx | Path2D, x: number, y: number, r: number) {
  UNIT.forEach(([cx, cy], k) => {
    if (k) path.lineTo(x + cx * r, y + cy * r)
    else path.moveTo(x + cx * r, y + cy * r)
  })
  path.closePath()
}

// A small crosshair, the mark for a query or a centroid.
export function crosshair(ctx: Ctx, x: number, y: number, color: string, inner = 3, outer = 8) {
  const cx = Math.round(x) + 0.5
  const cy = Math.round(y) + 0.5
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    ctx.moveTo(cx + dx * inner, cy + dy * inner)
    ctx.lineTo(cx + dx * outer, cy + dy * outer)
  }
  ctx.stroke()
}

// Dots batched by opacity, so a frame fills a few paths instead of one per dot.
export function dotBatch(steps = 8) {
  const paths = Array.from({ length: steps }, () => new Path2D())
  return {
    add(x: number, y: number, r: number, a = 1) {
      if (a <= 0.01 || r <= 0.05) return
      const path = paths[Math.min(steps - 1, Math.ceil(a * steps) - 1)]
      path.moveTo(x + r, y)
      path.arc(x, y, r, 0, TAU)
    },
    fill(ctx: Ctx, color: string | CanvasGradient) {
      ctx.fillStyle = color
      paths.forEach((path, k) => {
        ctx.globalAlpha = (k + 1) / steps
        ctx.fill(path)
      })
      ctx.globalAlpha = 1
    },
  }
}

// Line segments batched by opacity, the same way.
export function lineBatch(steps = 8) {
  const paths = Array.from({ length: steps }, () => new Path2D())
  return {
    add(x0: number, y0: number, x1: number, y1: number, a = 1) {
      if (a <= 0.01) return
      const path = paths[Math.min(steps - 1, Math.ceil(a * steps) - 1)]
      path.moveTo(x0, y0)
      path.lineTo(x1, y1)
    },
    stroke(ctx: Ctx, color: string | CanvasGradient, width = 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      paths.forEach((path, k) => {
        ctx.globalAlpha = (k + 1) / steps
        ctx.stroke(path)
      })
      ctx.globalAlpha = 1
    },
  }
}
