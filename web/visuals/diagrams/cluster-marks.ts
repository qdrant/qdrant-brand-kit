import { alpha, type Palette } from "../scene"
import { mono } from "./lib"

// The marks the cluster diagrams share (2026-11-26, the Qdrant Vector Search Engine and Private Cloud pages): a box
// on the surface with a hairline (a cluster, a node, a perimeter) and a shard, a small indigo square.

export function box(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    opacity?: number
    stroke?: string
    dash?: number[]
    fill?: string
    radius?: number
  } = {}
) {
  ctx.save()
  ctx.globalAlpha = options.opacity ?? 1
  ctx.beginPath()
  ctx.roundRect(
    Math.round(x) + 0.5,
    Math.round(y) + 0.5,
    Math.round(w),
    Math.round(h),
    options.radius ?? 6
  )
  ctx.fillStyle = options.fill ?? alpha(p.surface, 0.9)
  ctx.fill()
  if (options.dash) ctx.setLineDash(options.dash)
  ctx.strokeStyle = options.stroke ?? p.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

export const SHARD = 18

// A shard: an indigo square, filled solid while it's the one moving or answering.
export function shard(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  options: { opacity?: number; lit?: number } = {}
) {
  const lit = options.lit ?? 0
  ctx.save()
  ctx.globalAlpha = options.opacity ?? 1
  ctx.beginPath()
  ctx.roundRect(
    Math.round(x) + 0.5,
    Math.round(y) + 0.5,
    SHARD - 1,
    SHARD - 1,
    3
  )
  ctx.fillStyle = alpha(p.glow, 0.16 + 0.84 * lit)
  ctx.fill()
  ctx.strokeStyle = alpha(p.glow, 0.75 + 0.25 * lit)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

// A node's name at the top left of its box, with an optional mark (a small square) before it.
export function nodeName(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  text: string,
  x: number,
  y: number,
  options: { opacity?: number; mark?: string } = {}
) {
  ctx.save()
  ctx.globalAlpha = options.opacity ?? 1
  ctx.font = mono(p)
  ctx.textBaseline = "middle"
  let left = x
  if (options.mark) {
    ctx.fillStyle = options.mark
    ctx.fillRect(left, Math.round(y) - 3, 5, 5)
    left += 12
  }
  ctx.fillStyle = p.star
  ctx.fillText(text, left, y)
  ctx.restore()
}
