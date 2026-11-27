"use client"

import type { PatternNote } from "../types"
import { mulberry } from "./engine"
import { FULL, HOVER, TAU, batch, clamp, cosmos, hexStroke, lerp, smooth, type Env } from "./cosmos"

// Fibers (2026-11-26, exploring): from a fiber-optic image the team shared, thin strands that run along the bottom
// of the frame and curl up into a fan, each ending in a point of light. Redrawn as Qdrant's own: the points are
// hexagons, the strands are hairlines in the website's colors, and there's no glow (a tip's light is a faint hexagon
// outline around it, never a blur). Slower and quieter than the original: every movement is a sine of a few
// seconds or more, so nothing jumps. They keep the space set's text guard (cosmos.tsx): no strand or tip sits under
// letters.

const COPY: PatternNote = {
  rule: "References are for patterns, never copies",
  source: "web/guidelines.ts, Content and originality",
  text: "It's drawn from a fiber-optic image, redrawn with hexagons, hairlines and the website's colors, and without the glow. The design lead to decide whether it's far enough from the original.",
}
const NO_GLOW: PatternNote = {
  rule: "Space comes from light, type and motion, never glow",
  source: "design-system/DESIGN.md, Space theme, layer 1 (design lead, 2026-11-14)",
  text: "The reference's tips glow; here each tip is a solid hexagon with a faint hexagon outline around it, and nothing is blurred.",
}
const SLOW: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "The strands sway and the fan breathes over ten to forty seconds; the eye reads it as still until it looks again.",
}
const PULSES: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "A few hexagons travel up the strands to their tips, about ten seconds each, and the tip they reach lights a little. It's the most movement in the set.",
}

type Pt = [number, number]

// A point on a cubic Bézier.
function bez(a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt {
  const m = 1 - u
  const k0 = m * m * m
  const k1 = 3 * m * m * u
  const k2 = 3 * m * u * u
  const k3 = u * u * u
  return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]]
}

// ---- The fan ------------------------------------------------------------------------------------------------------
// Strands come in from the right along the bottom, curl up at the left and fan out toward the top, each ending in a
// hexagon. Two depths: far strands thinner and fainter, near ones a little stronger.

type Fiber = {
  sx: number // where it comes in, in fractions of the width (off the right edge, or the middle for a split fan)
  y0: number // where it enters on the right, in fractions of the height
  bx: number // how far left it runs before it turns
  cx: number // the curl's x
  tx: number // its tip
  ty: number
  ph: number
  depth: number // 0 far, 1 near
  tip: boolean
  lit: number // a pulse's light on the tip, fading
}

function fan(count: number, seed: number, sx = 1.04): Fiber[] {
  const rand = mulberry(seed)
  return Array.from({ length: count }, () => {
    // Tips spread over an arc around the curl, so the fan opens like the reference's.
    const angle = lerp(-1.45, -0.42, rand())
    const reach = lerp(0.42, 0.98, Math.sqrt(rand()))
    return {
      sx,
      y0: 0.8 + rand() * 0.17,
      bx: 0.18 + rand() * 0.24,
      cx: -0.06 + rand() * 0.12,
      tx: 0.05 + Math.cos(angle) * reach * 0.42,
      ty: 0.9 + Math.sin(angle) * reach * 0.86,
      ph: rand() * TAU,
      depth: rand(),
      tip: rand() < 0.72,
      lit: 0,
    }
  })
}

// A strand's four control points in px, with its slow sway, the fan's breathing and the hover's lean.
function strand(f: Fiber, e: Env): [Pt, Pt, Pt, Pt] {
  const { w, h, t } = e
  const breathe = 1 + 0.025 * Math.sin(t * 0.08)
  let tx = (0.05 + (f.tx - 0.05) * breathe + Math.sin(t * 0.13 + f.ph) * 0.007) * w
  let ty = (0.9 + (f.ty - 0.9) * breathe + Math.cos(t * 0.11 + f.ph * 1.3) * 0.012) * h
  // Hover: tips near the pointer lean a few pixels toward it.
  const d = Math.hypot(e.px - tx, e.py - ty)
  const lean = e.hover * 8 * Math.exp(-((d / 140) ** 2))
  if (d > 0) {
    tx += ((e.px - tx) / d) * lean
    ty += ((e.py - ty) / d) * lean
  }
  const y0 = (f.y0 + Math.sin(t * 0.07 + f.ph) * 0.006) * h
  return [
    [w * f.sx, y0],
    [f.bx * w, y0 + 0.01 * h],
    [(f.cx + Math.sin(t * 0.09 + f.ph) * 0.01) * w, lerp(y0, ty, 0.55)],
    [tx, ty],
  ]
}

function drawFan(
  ctx: CanvasRenderingContext2D,
  fibers: Fiber[],
  e: Env,
  flip: boolean,
  fadeFrom = 0.42,
  fadeTo = 0.98
) {
  const { w, h, p } = e
  ctx.save()
  if (flip) {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  }
  const pts = fibers.map((f) => strand(f, flip ? { ...e, px: w - e.px } : e))
  ctx.lineCap = "round"
  ctx.strokeStyle = p.glow
  // Far strands first, in two passes of width and strength.
  for (const near of [false, true]) {
    ctx.lineWidth = near ? 1 : 0.6
    fibers.forEach((f, i) => {
      if (f.depth > 0.55 !== near) return
      const c = pts[i]
      if (!c) return
      ctx.globalAlpha = near ? 0.2 + f.depth * 0.14 : 0.1 + f.depth * 0.12
      ctx.beginPath()
      ctx.moveTo(c[0][0], c[0][1])
      ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1])
      ctx.stroke()
    })
  }
  ctx.globalAlpha = 1
  // The strands fade toward the right, where they come in, so the bundle reads as arriving, not cut.
  const fade = ctx.createLinearGradient(0, 0, w, 0)
  fade.addColorStop(fadeFrom, "rgb(0 0 0 / 1)")
  fade.addColorStop(fadeTo, "rgb(0 0 0 / 0)")
  // The fade clears everything outside what it fills, so a split fan limits it to its own half: the other half's
  // strands stay as they are.
  ctx.save()
  if (fadeTo <= 0.5) {
    ctx.beginPath()
    ctx.rect(0, 0, w * 0.5, h)
    ctx.clip()
  }
  ctx.globalCompositeOperation = "destination-in"
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Tips: a solid hexagon, and a faint outline for the near ones (the light, without a glow).
  const tips = batch(8)
  fibers.forEach((f, i) => {
    const c = pts[i]
    if (!c || !f.tip) return
    const [x, y] = c[3]
    const d = Math.hypot((flip ? w - e.px : e.px) - x, e.py - y)
    const near = e.hover * Math.exp(-((d / 140) ** 2))
    tips.add(x, y, 2 + f.depth * 1.6 + f.lit * 0.8, 0.45 + f.depth * 0.45 + f.lit * 0.3)
    const ring = (f.depth > 0.6 ? 0.16 : 0) + f.lit * 0.45 + near * 0.3
    if (ring > 0.02) hexStroke(ctx, x, y, 6.5 + f.depth * 1.5 + f.lit * 2, p.glow, ring)
  })
  tips.fill(ctx, p.star)
  ctx.restore()
  return pts
}

const fiberFan = cosmos({
  id: "ref-fiber-fan",
  name: "Fiber fan",
  kind: "background",
  description:
    "Hairline strands that run along the bottom and curl up into a fan at the left, each ending in a hexagon. They sway slowly; hover: the tips near the pointer lean toward it.",
  notes: [FULL, SLOW, NO_GLOW, HOVER, COPY],
  seed: 211,
  spec: {
    init: () => ({ fibers: fan(64, 211) }),
    frame(ctx, s, e) {
      drawFan(ctx, s.fibers, e, false)
    },
  },
})

// The same fan, mirrored, for sections whose content sits on the left.
const fiberFanRight = cosmos({
  id: "ref-fiber-fan-right",
  name: "Fiber fan, right",
  kind: "background",
  description:
    "Fiber fan mirrored: the strands come in from the left and fan out on the right, for sections whose content sits on the left.",
  notes: [FULL, SLOW, NO_GLOW, HOVER, COPY],
  seed: 223,
  spec: {
    init: () => ({ fibers: fan(64, 223) }),
    frame(ctx, s, e) {
      drawFan(ctx, s.fibers, e, true)
    },
  },
})

// Two smaller fans, mirrored, for centered layouts: the bundle rises from the middle of the bottom and curls up on
// both sides, leaving the middle clear for the heading.
const fiberFanSplit = cosmos({
  id: "ref-fiber-fan-split",
  name: "Fiber fan, both sides",
  kind: "background",
  description:
    "Two fiber fans, mirrored: the strands come out of the middle of the bottom and curl up on both sides, leaving the middle clear. For centered layouts.",
  notes: [FULL, SLOW, NO_GLOW, HOVER, COPY],
  seed: 239,
  spec: {
    init: () => ({ left: fan(38, 239, 0.5), right: fan(38, 241, 0.5) }),
    frame(ctx, s, e) {
      // Each half fades in from the middle, so the two bundles meet softly.
      drawFan(ctx, s.left, e, false, 0.36, 0.5)
      drawFan(ctx, s.right, e, true, 0.36, 0.5)
    },
  },
})

// ---- The fan, with pulses ------------------------------------------------------------------------------------------
// Like a query on its way: now and then a small hexagon travels up a strand to its tip, and the tip lights a little.

type Pulse = { fiber: number; u: number; speed: number; wait: number }

const fiberPulses = cosmos({
  id: "ref-fiber-pulses",
  name: "Fiber fan, pulses",
  kind: "background",
  description:
    "Fiber fan with a few hexagons travelling up the strands to their tips, about ten seconds each; the tip they reach lights a little. Hover: the tips near the pointer lean toward it.",
  notes: [FULL, PULSES, NO_GLOW, HOVER, COPY],
  seed: 227,
  spec: {
    init: () => {
      const fibers = fan(64, 227)
      const rand = mulberry(229)
      const withTip = fibers.flatMap((f, i) => (f.tip ? [i] : []))
      const pick = () => withTip[Math.floor(rand() * withTip.length)] ?? 0
      const pulses: Pulse[] = Array.from({ length: 6 }, (_, k) => ({
        fiber: pick(),
        u: k / 6,
        speed: 0.08 + rand() * 0.04,
        wait: 0,
      }))
      return { fibers, pulses, pick, rand }
    },
    frame(ctx, s, e) {
      for (const f of s.fibers) f.lit = Math.max(0, f.lit - e.dt * 0.6)
      const pts = drawFan(ctx, s.fibers, e, false)
      const dots = batch(6)
      for (const q of s.pulses) {
        if (q.wait > 0) {
          q.wait -= e.dt
          continue
        }
        q.u += e.dt * q.speed
        if (q.u >= 1) {
          const f = s.fibers[q.fiber]
          if (f) f.lit = 1
          q.fiber = s.pick()
          q.u = 0
          q.speed = 0.08 + s.rand() * 0.04
          q.wait = 1 + s.rand() * 4
          continue
        }
        const c = pts[q.fiber]
        if (!c) continue
        // Eased along the strand, so it sets off and arrives gently; it fades in over the bundle, where it enters.
        const u = smooth(0, 1, q.u)
        const [x, y] = bez(c[0], c[1], c[2], c[3], u)
        dots.add(x, y, 2.4, clamp(q.u * 3) * (0.55 + 0.4 * u) * clamp(1.4 - x / e.w))
      }
      dots.fill(ctx, e.p.bright)
    },
  },
})

// ---- The flow ------------------------------------------------------------------------------------------------------
// The bottom of the reference on its own: a bundle of strands across the bottom of the section, gathered in the
// middle and loose at the ends, undulating slowly, with small hexagons drifting along them from left to right.

const fiberFlow = cosmos({
  id: "ref-fiber-flow",
  name: "Fiber flow",
  kind: "background",
  description:
    "A bundle of hairline strands across the bottom of a section, gathered in the middle, undulating slowly, with small hexagons drifting along them. Hover: the strands part a little around the pointer.",
  notes: [FULL, SLOW, NO_GLOW, HOVER, COPY],
  seed: 233,
  spec: {
    init: () => {
      const rand = mulberry(233)
      const strands = Array.from({ length: 46 }, () => ({
        o: rand() * 2 - 1,
        ph: rand() * TAU,
        depth: rand(),
      }))
      const sparks = Array.from({ length: 18 }, () => ({
        s: Math.floor(rand() * 46),
        u: rand(),
        v: 0.022 + rand() * 0.02,
      }))
      return { strands, sparks }
    },
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      const STEPS = 48
      const at = (st: (typeof s.strands)[number], x: number): Pt => {
        // The bundle's middle line sags a little and the strands gather in the middle, loose at both ends.
        const mid = 0.8 + 0.05 * Math.sin(x * Math.PI * 0.9 + 0.4) + 0.012 * Math.sin(t * 0.05)
        const spread = 0.025 + 0.11 * Math.abs(2 * x - 1) ** 1.6
        let y = (mid + st.o * spread + 0.008 * Math.sin(x * 4.2 + t * 0.1 + st.ph)) * h
        const px = x * w
        // Hover: the strands part a little around the pointer.
        const dx = (px - e.px) / 160
        const dy = y - e.py
        y += e.hover * Math.sign(dy || 1) * 7 * Math.exp(-(dx * dx)) * Math.exp(-((dy / 60) ** 2))
        return [px, y]
      }
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = p.glow
      for (const st of s.strands) {
        ctx.lineWidth = st.depth > 0.55 ? 1 : 0.6
        ctx.globalAlpha = st.depth > 0.55 ? 0.18 + st.depth * 0.14 : 0.08 + st.depth * 0.12
        ctx.beginPath()
        for (let k = 0; k <= STEPS; k += 1) {
          const [x, y] = at(st, -0.03 + (k / STEPS) * 1.06)
          if (k === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      const dots = batch(6)
      for (const k of s.sparks) {
        k.u = (k.u + e.dt * k.v) % 1
        const st = s.strands[k.s]
        if (!st) continue
        const [x, y] = at(st, k.u)
        dots.add(x, y, 2 + st.depth * 1.2, Math.sin(k.u * Math.PI) * (0.5 + 0.45 * st.depth))
      }
      dots.fill(ctx, p.star)
      // Soft at both ends and toward the top, so the bundle reads as passing through.
      const fade = ctx.createLinearGradient(0, 0, w, 0)
      fade.addColorStop(0, "rgb(0 0 0 / 0)")
      fade.addColorStop(0.18, "rgb(0 0 0 / 1)")
      fade.addColorStop(0.82, "rgb(0 0 0 / 1)")
      fade.addColorStop(1, "rgb(0 0 0 / 0)")
      ctx.globalCompositeOperation = "destination-in"
      ctx.fillStyle = fade
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = "source-over"
    },
  },
})

export const fiberPatterns = [fiberFan, fiberFanRight, fiberFanSplit, fiberPulses, fiberFlow]
