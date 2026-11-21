"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, expoOut, hexCorners, isDark, poly, prefersStill, readout, type Pt } from "./lib"

// Hex assembly (Parts Kit): 19 hexagon parts, each the brandmark's cube (a top face and two side faces, lit
// from above), fly in from outside the frame, turn into line and lock into a module: the core first, then
// each ring outward. Empty slots wait as dashed outlines; the next one shows its coordinates. The module
// rests, then lifts away, and assembles again.

const RADIUS = 2
const STAGGER = 0.3
const FLIGHT = 1.1
const LOCK = 0.62 // the share of the flight after which a part has locked
const HOLD = 3
const OUT = 1.2

type Part = { q: number; r: number; from: number; spin: number; start: number }
type State = { w: number; h: number; p: Palette; cycle: number; parts: Part[]; still: boolean }

const ring = (q: number, r: number) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))

function assemble(cycle: number): Part[] {
  const rand = rng(940 + cycle)
  const slots: { q: number; r: number; key: number }[] = []
  for (let q = -RADIUS; q <= RADIUS; q++)
    for (let r = -RADIUS; r <= RADIUS; r++) if (ring(q, r) <= RADIUS) slots.push({ q, r, key: ring(q, r) + rand() * 0.9 })
  slots.sort((a, b) => a.key - b.key)
  return slots.map(({ q, r }, i) => ({
    q,
    r,
    from: rand() * TAU,
    spin: (rand() < 0.5 ? -1 : 1) * (1 + Math.floor(rand() * 2)) * (Math.PI / 3),
    start: 0.4 + i * STAGGER,
  }))
}

const LENGTH = 0.4 + 18 * STAGGER + FLIGHT + HOLD + OUT + 0.4

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, cycle: 0, parts: assemble(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / LENGTH)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.parts = assemble(cycle)
    }
    const e = s.still ? LENGTH - OUT - 1 : t - cycle * LENGTH
    const assembled = 0.4 + 18 * STAGGER + FLIGHT
    const out = clamp((e - assembled - HOLD) / OUT)

    const size = Math.min(h * 0.095, w * 0.075)
    const cx = w * 0.5
    const cy = h * 0.48
    const slot = (q: number, r: number) => ({ x: cx + size * Math.sqrt(3) * (q + r / 2), y: cy + size * 1.5 * r })
    const dark = isDark(p)
    const faces = dark
      ? { top: p.violet, tint: alpha(p.glow, 0.2), left: p.haze, right: alpha(p.violet, 0.6) }
      : { top: p.surface, tint: null, left: p.violet, right: p.haze }

    clear(ctx, p, w, h)
    ctx.lineWidth = 1
    ctx.lineJoin = "round"

    // Crop marks around the module.
    const hw = size * Math.sqrt(3) * (RADIUS + 0.5) + 16
    const hh = size * (1.5 * RADIUS + 1) + 16
    ctx.strokeStyle = p.line
    ctx.beginPath()
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      const x = cx + sx * hw
      const y = cy + sy * hh
      ctx.moveTo(x, y - sy * 12)
      ctx.lineTo(x, y)
      ctx.lineTo(x - sx * 12, y)
    }
    ctx.stroke()

    // Empty slots: dashed outlines, back as the module lifts away.
    ctx.setLineDash([3, 3])
    for (const part of s.parts) {
      const filled = e >= part.start + FLIGHT * LOCK
      if (filled && out === 0) continue
      ctx.strokeStyle = alpha(p.line, filled ? 0.8 * out : 0.8)
      const { x, y } = slot(part.q, part.r)
      poly(ctx, hexCorners(x, y, size * 0.92))
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Parts: locked ones first, then those in flight on top.
    let locked = 0
    let incoming: Part | null = null
    const order = [...s.parts].sort((a, b) => {
      const fa = e < a.start + FLIGHT * LOCK ? 1 : 0
      const fb = e < b.start + FLIGHT * LOCK ? 1 : 0
      return fa - fb || a.r - b.r
    })
    for (const part of order) {
      const k = (e - part.start) / FLIGHT
      if (k <= 0) continue
      const home = slot(part.q, part.r)
      const reach = Math.max(w, h) * 0.7
      const m = expoOut(k)
      const x = home.x + Math.cos(part.from) * reach * (1 - m)
      const y = home.y + Math.sin(part.from) * reach * (1 - m) - out * 18
      const isLocked = k >= LOCK
      if (isLocked) locked += 1
      else incoming = part
      ctx.globalAlpha = clamp(k / 0.15) * (1 - out)
      cube(ctx, p, faces, x, y, size * 0.92 * (0.9 + 0.1 * m), part.spin * (1 - m), isLocked)
      // The core carries the accent on its top edges.
      if (part.q === 0 && part.r === 0 && isLocked) {
        const c = hexCorners(x, y, size * 0.92)
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(c[5].x, c[5].y)
        ctx.lineTo(c[0].x, c[0].y)
        ctx.lineTo(c[1].x, c[1].y)
        ctx.stroke()
        ctx.lineWidth = 1
      }
      // A flash as it locks.
      const since = e - part.start - FLIGHT * LOCK
      if (since >= 0 && since < 0.5) {
        ctx.globalAlpha = (1 - since / 0.5) * (1 - out)
        ctx.strokeStyle = p.bright
        poly(ctx, hexCorners(home.x, home.y, size * (0.98 + since * 0.2)))
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    // The slot the newest part is flying to.
    if (incoming) {
      const { x, y } = slot(incoming.q, incoming.r)
      label(ctx, p, `Q ${incoming.q}  R ${incoming.r}`, x, y + size + 14, { align: "center", color: p.star })
    }
    const total = s.parts.length
    readout(ctx, p, locked === total ? ["LOCKED", [`${locked} / ${total}`, p.label]] : ["PARTS", [`${locked} / ${total}`, p.label]], 24, h - 28, {
      opacity: 1 - out,
    })
  },
}

// One part: a hexagon split into a top face and two side faces, edges in hairlines, the upper edges lit.
function cube(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  faces: { top: string; tint: string | null; left: string; right: string },
  x: number,
  y: number,
  r: number,
  rotation: number,
  lit: boolean
) {
  const c = hexCorners(x, y, r, rotation)
  const center: Pt = { x, y }
  const fill = (points: Pt[], color: string) => {
    poly(ctx, points)
    ctx.fillStyle = color
    ctx.fill()
  }
  fill([c[0], c[1], center, c[5]], faces.top)
  if (faces.tint) fill([c[0], c[1], center, c[5]], faces.tint)
  fill([center, c[1], c[2], c[3]], faces.right)
  fill([center, c[3], c[4], c[5]], faces.left)
  ctx.strokeStyle = alpha(p.glow, 0.55)
  poly(ctx, c)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(center.x, center.y)
  ctx.lineTo(c[1].x, c[1].y)
  ctx.moveTo(center.x, center.y)
  ctx.lineTo(c[3].x, c[3].y)
  ctx.moveTo(center.x, center.y)
  ctx.lineTo(c[5].x, c[5].y)
  ctx.stroke()
  if (!lit) return
  ctx.strokeStyle = alpha(p.bright, 0.8)
  ctx.beginPath()
  ctx.moveTo(c[5].x, c[5].y)
  ctx.lineTo(c[0].x, c[0].y)
  ctx.lineTo(c[1].x, c[1].y)
  ctx.stroke()
}

export function HexAssembly() {
  return <SceneCanvas scene={scene} />
}
