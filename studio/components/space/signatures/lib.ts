import { alpha, rgb, type Palette } from "../scene"

// Helpers the signatures share: 3D rotation and perspective, nearest neighbors, ids, polygon clipping, and
// the marks every signature draws the same way (the query crosshair, hexagons, arrows, dimension lines and
// readout chips).

export type V3 = [number, number, number]
export type Pt = { x: number; y: number }

export const TAU = Math.PI * 2

// The 12px mono used by every label and readout.
export const mono = (p: Palette) => `500 12px ${p.mono}`

// True when the visitor prefers reduced motion: a scene then draws its finished state, once.
export const prefersStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches

// Whether the palette is the dark one, read from the background's lightness.
export function isDark(p: Palette) {
  const [r, g, b] = rgb(p.bg)
  return r * 0.2126 + g * 0.7152 + b * 0.0722 < 128
}

// A normal sample (Box-Muller), for clusters.
export function gauss(rand: () => number) {
  const u = Math.max(1e-9, rand())
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rand())
}

// n distinct point ids, #1000 to #9999.
export function ids(n: number, rand: () => number) {
  const seen = new Set<number>()
  while (seen.size < n) seen.add(1000 + Math.floor(rand() * 9000))
  return [...seen].map((id) => `#${id}`)
}

// The weightless ease of the space theme: expo out, no bounce.
export const expoOut = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))

// An angle wrapped to (-PI, PI].
export const wrap = (a: number) => a - TAU * Math.floor((a + Math.PI) / TAU)

// Rotation about the y axis (yaw), then the x axis (pitch). +z points at the viewer; a positive pitch
// looks down from above.
export function turn([x, y, z]: V3, yaw: number, pitch: number): V3 {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp]
}

// Perspective onto the canvas from a camera `distance` units in front of the origin. scale is px per unit.
export function project(v: V3, cx: number, cy: number, scale: number, distance = 5) {
  const k = distance / (distance - v[2])
  return { x: cx + v[0] * scale * k, y: cy - v[1] * scale * k, z: v[2], k }
}

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
export const dist3 = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

// The k items nearest a query by a distance function, nearest first, skipping any index skip() returns
// true for.
export function nearest<T>(
  items: readonly T[],
  distance: (item: T) => number,
  k: number,
  skip?: (i: number) => boolean
) {
  const ranked: { i: number; d: number }[] = []
  items.forEach((item, i) => {
    if (!skip?.(i)) ranked.push({ i, d: distance(item) })
  })
  return ranked.sort((a, b) => a.d - b.d).slice(0, k)
}

// The part of a convex polygon where nx * x + ny * y <= c (Sutherland-Hodgman, one edge).
export function clipHalf(points: Pt[], nx: number, ny: number, c: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const da = nx * a.x + ny * a.y - c
    const db = nx * b.x + ny * b.y - c
    if (da <= 0) out.push(a)
    if (da <= 0 !== db <= 0) {
      const k = da / (da - db)
      out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })
    }
  }
  return out
}

// The part of a convex polygon closer to a than to b: one side of their bisector.
export const closerTo = (points: Pt[], a: Pt, b: Pt) =>
  clipHalf(points, b.x - a.x, b.y - a.y, (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y) / 2)

// The corners of a hexagon around (x, y): pointy top, like the brandmark, then clockwise.
export function hexCorners(x: number, y: number, r: number, rotation = 0): Pt[] {
  return [0, 1, 2, 3, 4, 5].map((k) => {
    const a = rotation - Math.PI / 2 + (k * Math.PI) / 3
    return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r }
  })
}

// A closed path through points.
export function poly(ctx: CanvasRenderingContext2D, points: readonly Pt[]) {
  ctx.beginPath()
  points.forEach(({ x, y }, i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

// The query: a crosshair in the accent, the same mark as the Star chart's.
export function crosshair(ctx: CanvasRenderingContext2D, p: Palette, x: number, y: number, opacity = 1) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = p.accent
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, 4, 0, TAU)
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    ctx.moveTo(x + dx * 7, y + dy * 7)
    ctx.lineTo(x + dx * 12, y + dy * 12)
  }
  ctx.stroke()
  ctx.restore()
}

// A line from a to b with an open head at b, in the current stroke style.
export function arrow(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, head = 6) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x)
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.moveTo(b.x - head * Math.cos(angle - 0.45), b.y - head * Math.sin(angle - 0.45))
  ctx.lineTo(b.x, b.y)
  ctx.lineTo(b.x - head * Math.cos(angle + 0.45), b.y - head * Math.sin(angle + 0.45))
  ctx.stroke()
}

// A dimension line from a to b, offset to one side, with end ticks, extension lines and a label: measured
// like a drawing.
export function dimension(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  a: Pt,
  b: Pt,
  text: string,
  offset = 10,
  opacity = 1
) {
  const length = dist(a, b) || 1
  const nx = -(b.y - a.y) / length
  const ny = (b.x - a.x) / length
  const a2 = { x: a.x + nx * offset, y: a.y + ny * offset }
  const b2 = { x: b.x + nx * offset, y: b.y + ny * offset }
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = p.label
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(a2.x, a2.y)
  ctx.lineTo(b2.x, b2.y)
  for (const end of [a2, b2]) {
    ctx.moveTo(end.x - nx * 4, end.y - ny * 4)
    ctx.lineTo(end.x + nx * 4, end.y + ny * 4)
  }
  ctx.stroke()
  ctx.globalAlpha = opacity * 0.5
  ctx.beginPath()
  ctx.moveTo(a.x + nx * 3, a.y + ny * 3)
  ctx.lineTo(a2.x, a2.y)
  ctx.moveTo(b.x + nx * 3, b.y + ny * 3)
  ctx.lineTo(b2.x, b2.y)
  ctx.stroke()
  ctx.restore()
  const side = offset >= 0 ? 1 : -1
  ctx.save()
  ctx.font = mono(p)
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.globalAlpha = opacity
  ctx.fillStyle = p.label
  ctx.fillText(text, (a2.x + b2.x) / 2 + nx * 12 * side, (a2.y + b2.y) / 2 + ny * 12 * side)
  ctx.restore()
}

// A readout chip like the scene's chip(), with parts in their own colors (a string is p.star) and an
// optional mark, a small square in a palette color, before the text. Returns its width.
export function readout(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  parts: (string | [string, string])[],
  x: number,
  y: number,
  options: { opacity?: number; mark?: string; align?: "left" | "right" } = {}
) {
  ctx.save()
  ctx.font = mono(p)
  const gap = ctx.measureText("  ").width
  const texts = parts.map((part) => (typeof part === "string" ? [part, p.star] : part))
  const widths = texts.map(([text]) => ctx.measureText(text).width)
  const markWidth = options.mark ? 13 : 0
  const width = Math.ceil(widths.reduce((sum, w) => sum + w, 0) + gap * (parts.length - 1) + markWidth) + 16
  const left = Math.round(options.align === "right" ? x - width : x)
  ctx.globalAlpha = options.opacity ?? 1
  ctx.beginPath()
  ctx.roundRect(left + 0.5, Math.round(y - 12) + 0.5, width, 24, 4)
  ctx.fillStyle = alpha(p.surface, 0.9)
  ctx.fill()
  ctx.strokeStyle = p.line
  ctx.lineWidth = 1
  ctx.stroke()
  let cursor = left + 8
  if (options.mark) {
    ctx.fillStyle = options.mark
    ctx.fillRect(cursor, Math.round(y) - 2, 5, 5)
    cursor += markWidth
  }
  ctx.textBaseline = "middle"
  texts.forEach(([text, color], i) => {
    ctx.fillStyle = color
    ctx.fillText(text, cursor, Math.round(y) + 1)
    cursor += widths[i] + gap
  })
  ctx.restore()
  return width
}

// The width of a label in the mono.
export function textWidth(ctx: CanvasRenderingContext2D, p: Palette, text: string) {
  ctx.save()
  ctx.font = mono(p)
  const width = ctx.measureText(text).width
  ctx.restore()
  return width
}

// A row of labels in their own colors, two spaces apart, aligned as a whole.
export function labelRow(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  parts: [string, string][],
  x: number,
  y: number,
  options: { align?: "left" | "center" | "right"; opacity?: number } = {}
) {
  ctx.save()
  ctx.font = mono(p)
  ctx.textBaseline = "middle"
  ctx.globalAlpha = options.opacity ?? 1
  const gap = ctx.measureText("  ").width
  const widths = parts.map(([text]) => ctx.measureText(text).width)
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * (parts.length - 1)
  let cursor = options.align === "center" ? x - total / 2 : options.align === "right" ? x - total : x
  parts.forEach(([text, color], i) => {
    ctx.fillStyle = color
    ctx.fillText(text, cursor, y)
    cursor += widths[i] + gap
  })
  ctx.restore()
}

// A box on the canvas, for keeping labels apart.
export type Box = { x: number; y: number; w: number; h: number }

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

// A box around a mark at (x, y), so labels keep clear of it.
export const markBox = (x: number, y: number, r: number): Box => ({ x: x - r, y: y - r, w: r * 2, h: r * 2 })

// Places a label of a given width near a mark at (x, y), with simple collision avoidance: it tries eight
// directions at growing distances, starting from the preferred direction (away from the busy part, say),
// and takes the first spot inside the frame and clear of the boxes already taken, which it then adds to.
// Returns null when there is no free spot.
export function placeLabel(
  taken: Box[],
  x: number,
  y: number,
  width: number,
  frame: { w: number; h: number },
  prefer: Pt = { x: 1, y: -1 }
): { x: number; y: number; align: "left" | "right" | "center" } | null {
  const start = Math.atan2(prefer.y, prefer.x)
  const turns = [0, 1, -1, 2, -2, 3, -3, 4].map((k) => start + (k * Math.PI) / 4)
  for (const r of [10, 20, 32, 46, 62, 80])
    for (const a of turns) {
      const ax = x + Math.cos(a) * r
      const ay = y + Math.sin(a) * r
      const align = Math.cos(a) > 0.3 ? "left" : Math.cos(a) < -0.3 ? "right" : "center"
      const left = align === "left" ? ax : align === "right" ? ax - width : ax - width / 2
      const box = { x: left - 4, y: ay - 9, w: width + 8, h: 18 }
      if (box.x < 4 || box.x + box.w > frame.w - 4 || box.y < 4 || box.y + box.h > frame.h - 4) continue
      if (taken.some((b) => overlaps(b, box))) continue
      taken.push(box)
      return { x: ax, y: ay, align }
    }
  return null
}
