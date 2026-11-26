"use client"

import type { PatternNote } from "../types"
import { fbm, mulberry } from "./engine"
import {
  FULL,
  HOVER,
  LIGHT,
  MOTION,
  SIDE,
  SUBJECT,
  TAU,
  batch,
  clamp,
  cosmos,
  hexGrid,
  hexStroke,
  lerp,
  smooth,
  type Env,
} from "./cosmos"

// From the references (2026-11-25, exploring): patterns drawn from references the team shared (hubtown.co.in,
// izum.study and seven images: a halftone planet's horizon, a glowing life-path curve, a growth curve with a marker,
// a pixel swirl, a particle ribbon, a planet half turned to dots, a dithered burst). Each is redrawn as Qdrant's own:
// hexagons for every mark, the website's colors, light from above and never a glow, a subtle hover moment, and the
// text guard of the space set (cosmos.tsx), so no shape ever sits under letters. Some also follow the page's scroll.
// Halftone horizon, Growth curve, Hex monolith and Wavy sphere were taken out on 2026-11-26.

const COPY = (what: string): PatternNote => ({
  rule: "References are for patterns, never copies",
  source: "web/guidelines.ts, Content and originality",
  text: `It's drawn from ${what}, redrawn with hexagons, the website's colors and light from above. Juan to decide whether it's far enough from the original.`,
})
const SCROLL: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "It also moves with the page's scroll, which the website's patterns haven't done so far.",
}

// ---- Trajectory ------------------------------------------------------------------------------------------------------
// From a life-path page: one long S-curve through the section, the travelled part lit, with hairlines dropping from
// waypoints marked by hexagon nodes. It follows the scroll; hover: the travelled part runs to the point under the
// pointer, with a node riding the curve.

const trajectory = cosmos({
  id: "ref-trajectory",
  name: "Trajectory",
  kind: "background",
  description:
    "An S-curve through a section, the travelled part lit, with hexagon waypoints and hairlines. It follows the scroll; hover: it runs to the pointer.",
  notes: [FULL, HOVER, SCROLL, COPY("a life-path page's curve")],
  seed: 103,
  spec: {
    init: (w, h) => {
      // A Catmull-Rom curve through four points, sampled once.
      const P: [number, number][] = [
        [w * 0.74, -20],
        [w * 0.32, h * 0.34],
        [w * 0.4, h * 0.7],
        [w * 1.04, h * 1.02],
      ]
      const pts: { x: number; y: number }[] = []
      const at = (i: number): [number, number] => P[clamp(i, 0, 3)] ?? [0, 0]
      for (let seg = 0; seg < 3; seg += 1)
        for (let k = 0; k < 80; k += 1) {
          const u = k / 80
          const [a, b, c, d] = [at(seg - 1), at(seg), at(seg + 1), at(seg + 2)]
          const f = (i: 0 | 1) =>
            0.5 *
            (2 * b[i] +
              (-a[i] + c[i]) * u +
              (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * u * u +
              (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * u * u * u)
          pts.push({ x: f(0), y: f(1) })
        }
      return { pts, prog: 0.4 }
    },
    frame(ctx, s, e) {
      const { h, p } = e
      const n = s.pts.length
      let target = 0.15 + 0.6 * e.scroll
      if (e.hover > 0.5) {
        let best = 0
        let bd = Infinity
        s.pts.forEach((q, i) => {
          const d = Math.abs(q.x - e.px) + Math.abs(q.y - e.py) * 0.6
          if (d < bd) {
            bd = d
            best = i
          }
        })
        target = best / (n - 1)
      }
      s.prog = e.still ? target : s.prog + (target - s.prog) * (1 - Math.exp(-e.dt * 3))
      const cut = Math.round(s.prog * (n - 1))
      const stroke = (from: number, to: number, color: string, width: number, a: number) => {
        ctx.beginPath()
        for (let i = from; i <= to; i += 1) {
          const q = s.pts[i]
          if (!q) continue
          if (i === from) ctx.moveTo(q.x, q.y)
          else ctx.lineTo(q.x, q.y)
        }
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.globalAlpha = a
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      stroke(0, n - 1, p.line, 1, 0.85)
      stroke(0, cut, p.glow, 2, 1)
      // Waypoints: hairlines down from hexagon nodes.
      for (const k of [0.3, 0.55, 0.8]) {
        const q = s.pts[Math.round(k * (n - 1))]
        if (!q) continue
        ctx.setLineDash([2, 5])
        ctx.strokeStyle = p.line
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(q.x, q.y + 6)
        ctx.lineTo(q.x, h)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
        hexStroke(ctx, q.x, q.y, 5, k <= s.prog ? p.glow : p.dim, 0.9)
      }
      const head = s.pts[cut]
      if (head) {
        const b = batch(2)
        b.add(head.x, head.y, 4, 1)
        b.fill(ctx, p.bright)
        hexStroke(ctx, head.x, head.y, 9, p.glow, 0.5)
      }
    },
  },
})

// ---- Hex vortex ------------------------------------------------------------------------------------------------------
// From a pixel swirl: hexagon cells on a hex grid in spiral arms around the middle of the section, sparse near the
// center (where a centered title sits) and dense at the edges, turning slowly. Hover: the spiral tightens a little.

const hexVortex = cosmos({
  id: "ref-hex-vortex",
  name: "Hex vortex",
  kind: "background",
  description:
    "Hexagon cells in spiral arms around the middle of a section, clear at the center for a title. Hover: the spiral tightens.",
  notes: [FULL, HOVER, MOTION, COPY("a pixel swirl")],
  seed: 109,
  spec: {
    init: () => ({ twist: 0 }),
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      s.twist = e.still ? e.hover : s.twist + (e.hover - s.twist) * (1 - Math.exp(-e.dt * 2))
      const cx = w / 2
      const cy = h / 2
      const m = Math.max(w, h) * 0.5
      const on = batch(4)
      const pitch = 11
      hexGrid(0, 0, w, h, pitch, (x, y) => {
        // Hexagonal distance from the middle, so the rings are hexagons.
        const dx = Math.abs(x - cx)
        const dy = Math.abs(y - cy) * 1.15
        const r = Math.max(dy, dy * 0.5 + dx * 0.866) / m
        const a = Math.atan2(y - cy, x - cx)
        const arm = Math.sin(r * 28 - a + t * 0.25 + s.twist * r * 6)
        const dense = smooth(0.28, 1, r)
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
        const hash = n - Math.floor(n)
        if (hash < dense * smooth(0, 0.75, arm)) on.add(x, y, pitch * 0.34, 0.45 + 0.5 * dense)
      })
      on.fill(ctx, p.glow)
    },
  },
})

// ---- Hex ribbon ------------------------------------------------------------------------------------------------------
// From a particle ribbon: a wide sweep of thousands of small hexagons on the right of the section, in bands of the
// website's violets, flowing slowly along its length. Two hover moments on the same ribbon: the hexagons part around
// the pointer, or (2026-11-26) a few of them near it join into faint constellations as they flow.

type RibbonPart = {
  u: number
  v: number
  j: number
  s: number
  ox: number
  oy: number
  star: boolean
  x: number
  y: number
}

function ribbon(mode: "part" | "constellation") {
  return {
    init: () => {
      const rand = mulberry(41)
      const parts: RibbonPart[] = Array.from({ length: 4200 }, (_, i) => {
        const v = (rand() + rand() + rand()) / 1.5 - 1 // across the band, gathered at its middle
        // About one in eight is a "star" a constellation can use, the same ones every frame.
        return {
          u: rand(),
          v,
          j: (rand() - 0.5) * 2,
          s: 0.5 + rand() * 0.9,
          ox: 0,
          oy: 0,
          star: i % 8 === 0,
          x: 0,
          y: 0,
        }
      })
      // soft: the ribbon's own, slower hover for its fade (0 to 1).
      return { parts, soft: 0 }
    },
    frame(ctx: CanvasRenderingContext2D, s: { parts: RibbonPart[]; soft: number }, e: Env) {
      const { w, h, p } = e
      // The fade's own pace (2026-11-26): about 2.5s to settle in or out, on an S-curve, slower than the section's
      // hover. It changes the ribbon's opacity as a whole (the layers' fill strength), never each hexagon's own
      // strength, which is drawn in a few steps and would show them switching as it fades.
      s.soft = e.still ? e.hover : s.soft + (e.hover - s.soft) * (1 - Math.exp(-e.dt * 1.2))
      const eased = s.soft * s.soft * (3 - 2 * s.soft)
      const strength = mode === "constellation" ? 1 - 0.55 * eased : 1
      const cx = w * 1.02
      const cy = h * 0.58
      const R = Math.max(h * 0.75, w * 0.32)
      const band = R * 0.28
      const reach = 190
      const layers = [batch(5), batch(5), batch(5), batch(5)]
      // The stars a constellation uses, drawn again on top so they keep their strength while the ribbon fades.
      const kept = [batch(5), batch(5), batch(5), batch(5)]
      const near: { q: RibbonPart; w: number }[] = []
      for (const q of s.parts) {
        q.u = (q.u + e.dt * 0.008 * q.s) % 1
        const ang = Math.PI * (0.62 + 0.72 * q.u)
        const rr = R + q.v * band + q.j * band * 0.35 * Math.abs(q.v) ** 2
        let x = cx + Math.cos(ang) * rr
        let y = cy - Math.sin(ang) * rr * 0.92
        const dx = x - e.px
        const dy = y - e.py
        const d = Math.hypot(dx, dy)
        if (mode === "part") {
          // Hover: part around the pointer.
          const push = e.hover * 26 * Math.exp(-((d / 90) ** 2))
          const tx = d > 0 ? (dx / d) * push : 0
          const ty = d > 0 ? (dy / d) * push : 0
          q.ox = e.still ? tx : q.ox + (tx - q.ox) * clamp(e.dt * 6, 0, 1)
          q.oy = e.still ? ty : q.oy + (ty - q.oy) * clamp(e.dt * 6, 0, 1)
          x += q.ox
          y += q.oy
        } else if (q.star && e.hover > 0.01 && d < reach) near.push({ q, w: smooth(reach, reach * 0.45, d) })
        q.x = x
        q.y = y
        const edge = 1 - Math.abs(q.v) * 0.55
        const k = q.v < -0.45 ? 0 : q.v < 0.05 ? 1 : q.v < 0.5 ? 2 : 3
        // Each hexagon's own strength never changes with the hover (2026-11-26, EX-22: the local dimming and the
        // spreading fade were taken out); the fade is the layers' opacity below.
        const size = 1 + 1.3 * q.s * edge
        const a = 0.5 + 0.5 * edge
        layers[k]?.add(x, y, size, a)
        if (mode === "constellation" && q.star && d < reach)
          kept[k]?.add(x, y, size, a * smooth(reach, reach * 0.45, d))
      }
      // Colors that hold in both themes (violet and plum turn pale on light).
      const colors = [p.glow, p.bright, p.glow, p.star]
      // While hovering, the ribbon fades to 45% opacity, evenly, and the constellations' stars are drawn back over
      // it by what it lost, so they read in more contrast.
      layers.forEach((b, i) => b.fill(ctx, colors[i] ?? p.glow, strength))
      if (strength < 1) kept.forEach((b, i) => b.fill(ctx, colors[i] ?? p.glow, 1 - strength))
      if (mode !== "constellation" || near.length < 2) return
      // Subtle constellations: each star near the pointer joins its two nearest, in thin faint lines, with a small
      // outline around it. They fade in and out with the hover, and follow the ribbon as it flows.
      const stars = near.slice(0, 48)
      ctx.strokeStyle = p.star
      ctx.lineWidth = 0.8
      for (const a of stars) {
        const close = stars
          .filter((b) => b !== a)
          .map((b) => ({ b, d: Math.hypot(a.q.x - b.q.x, a.q.y - b.q.y) }))
          .filter((m) => m.d < 110)
          .sort((m, n) => m.d - n.d)
          .slice(0, 2)
        for (const { b } of close) {
          ctx.globalAlpha = e.hover * Math.min(a.w, b.w) * 0.5
          ctx.beginPath()
          ctx.moveTo(a.q.x, a.q.y)
          ctx.lineTo(b.q.x, b.q.y)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      for (const a of stars) hexStroke(ctx, a.q.x, a.q.y, 3.2, p.star, e.hover * a.w * 0.55)
    },
  }
}

const hexRibbon = cosmos({
  id: "ref-hex-ribbon",
  name: "Hex ribbon",
  kind: "background",
  description:
    "A wide sweep of small hexagons on the right of a section, in bands of violet, flowing along its length. Hover: they part around the pointer.",
  notes: [SIDE, HOVER, MOTION, COPY("a particle ribbon")],
  seed: 113,
  spec: ribbon("part"),
})

const hexRibbonConstellations = cosmos({
  id: "ref-hex-ribbon-constellations",
  name: "Hex ribbon, constellations",
  kind: "background",
  description:
    "The Hex ribbon's sweep of small hexagons. Hover: the ribbon fades back and a few of its hexagons near the pointer join into faint constellations that flow with it.",
  notes: [SIDE, HOVER, MOTION, COPY("a particle ribbon")],
  seed: 113,
  spec: ribbon("constellation"),
})

// ---- Halftone field, constellations ----------------------------------------------------------------------------------
// The Halftone field (space.tsx) as it is, a dot grid printing a soft light from the top right, with the ribbon's
// hover (2026-11-26): a few of the lit dots near the pointer join into faint constellations, and the dots around
// it shrink a little over a wide fade, the halftone's own way of darkening, so the lines read. Like every pattern in
// this set it also keeps clear of the section's text.

const HT_PITCH = 16
const HT_GAMMA = 1.6
// A stable, scattered pick of about one dot in seven.
const starAt = (row: number, col: number) => {
  const n = Math.sin(row * 127.1 + col * 311.7) * 43758.5453
  return n - Math.floor(n) > 0.86
}

const halftoneConstellations = cosmos({
  id: "ref-halftone-field-constellations",
  name: "Halftone field, constellations",
  kind: "background",
  description:
    "The Halftone field's dot grid, lit from the top right. Hover: a few lit dots near the pointer join into faint constellations.",
  notes: [HOVER, MOTION],
  seed: 151,
  spec: {
    init: () => ({}),
    frame(ctx, _s, e) {
      const { w, h, p, t } = e
      const lx = w * 1.02
      const ly = -h * 0.14
      const reach = Math.hypot(w, h) * 0.86
      const breathe = 0.9 + 0.1 * Math.sin(t * 0.4)
      const max = HT_PITCH * 0.22
      const near = 190
      const bright = new Path2D()
      const mid = new Path2D()
      const dim = new Path2D()
      const stars: { x: number; y: number; w: number }[] = []
      for (let row = 0, y = HT_PITCH / 2; y < h + HT_PITCH; row++, y += HT_PITCH)
        for (let col = 0, x = row % 2 ? HT_PITCH : HT_PITCH / 2; x < w + HT_PITCH; col++, x += HT_PITCH) {
          const d = Math.hypot(x - lx, y - ly) / reach
          const drift = 0.06 * Math.sin(x * 0.011 + y * 0.007 - t * 0.2) * Math.sin(y * 0.013 - x * 0.004 + t * 0.15)
          const ripple = 0.03 * Math.sin(d * 22 - t * 0.35)
          const light = clamp(1 - d + drift + ripple) ** HT_GAMMA * breathe
          const dp = Math.hypot(x - e.px, y - e.py)
          // The shadow: dots shrink up to 18% around the pointer, over a wide fade with no edge.
          const quiet = 1 - 0.18 * e.hover * Math.exp(-((dp / (near * 1.7)) ** 2))
          const r = max * light * quiet
          if (r < 0.4) continue
          const path = light > 0.5 ? bright : light > 0.22 ? mid : dim
          path.moveTo(x + r, y)
          path.arc(x, y, r, 0, TAU)
          // About one lit dot in seven is a star a constellation can use, the same ones every frame.
          if (e.hover > 0.01 && light > 0.22 && dp < near && starAt(row, col))
            stars.push({ x, y, w: smooth(near, near * 0.45, dp) })
        }
      ctx.fillStyle = p.bright
      ctx.fill(bright)
      ctx.fillStyle = p.glow
      ctx.fill(mid)
      ctx.globalAlpha = 0.6
      ctx.fill(dim)
      ctx.globalAlpha = 1
      if (stars.length < 2) return
      // Subtle constellations, as on the ribbon: each star joins its two nearest, thin and faint.
      const list = stars.slice(0, 48)
      ctx.strokeStyle = p.star
      ctx.lineWidth = 0.8
      for (const a of list) {
        const close = list
          .filter((b) => b !== a)
          .map((b) => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
          .filter((m) => m.d < 110)
          .sort((m, n) => m.d - n.d)
          .slice(0, 2)
        for (const { b } of close) {
          ctx.globalAlpha = e.hover * Math.min(a.w, b.w) * 0.5
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      for (const a of list) hexStroke(ctx, a.x, a.y, 4, p.star, e.hover * a.w * 0.55)
    },
  },
})

// ---- Half planet -----------------------------------------------------------------------------------------------------
// From a planet half turned into dots: a planet of fine hexagon cells, lit from above, whose right half is drawn as
// data, a graph of hexagons on a hex grid (outlines, small fills and the links between them) that breathes slowly. A
// scan line marks the seam, and the planet's cells shrink into data across a soft band rather than a hard edge
// (refined 2026-11-26: more modern hexagons, smoother motion). Hover: the seam glides to the pointer on a spring.

const halfPlanet = cosmos({
  id: "ref-half-planet",
  name: "Half planet",
  kind: "background",
  description:
    "A planet of fine hexagon cells whose right half is drawn as data, a breathing graph of hexagons. Hover: the seam glides to the pointer.",
  notes: [SIDE, HOVER, SUBJECT, COPY("an image of a planet half turned into dots")],
  seed: 127,
  spec: {
    init: (w, h) => {
      const r = clamp(Math.min(h * 0.34, w * 0.15), 70, 220)
      return { r, cx: w * 0.76, cy: h * 0.5, seam: 0, vel: 0 }
    },
    frame(ctx, s, e) {
      const { p, t } = e
      // The seam on a critically damped spring: it glides and settles without overshooting.
      const target = e.hover > 0.5 ? clamp((e.px - s.cx) / s.r, -0.8, 0.8) : Math.sin(t * 0.08) * 0.14
      if (e.still) s.seam = target
      else {
        const k = 14
        s.vel += ((target - s.seam) * k - s.vel * 2 * Math.sqrt(k)) * e.dt
        s.seam += s.vel * e.dt
      }
      const split = s.cx + s.seam * s.r
      const cell = s.r / 7.5
      const band = cell * 1.4
      // Stable per-cell randomness, so the graph never jumps.
      const hash = (x: number, y: number) => {
        const n = Math.sin(Math.round(x * 10) * 12.9898 + Math.round(y * 10) * 78.233) * 43758.5453
        return n - Math.floor(n)
      }
      // The planet side: fine cells lit from above, fading out across the band.
      const planet = batch()
      const pitch = Math.max(2.6, s.r / 32)
      hexGrid(s.cx - s.r, s.cy - s.r, Math.min(s.cx + s.r, split + band), s.cy + s.r, pitch, (x, y) => {
        const nx = (x - s.cx) / s.r
        const ny = (y - s.cy) / s.r
        const d = nx * nx + ny * ny
        if (d > 1) return
        const nz = Math.sqrt(1 - d)
        const lambert = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2])
        const tex = 0.85 + 0.35 * (fbm(e.noise, nx * 2.2 + t * 0.006, ny * 2.2, 2, 3) - 0.5)
        const fade = smooth(split + band, split - band, x)
        const v = clamp((0.12 + 0.88 * lambert) * tex) * fade
        planet.add(x, y, pitch * 0.46 * (0.4 + 0.6 * v), 0.2 + 0.8 * v)
      })
      planet.fill(ctx, p.glow)
      // The data side: a graph of hexagons on a hex grid, inside the disc, breathing slowly.
      const fills = batch(6)
      const rings = batch(6)
      ctx.lineCap = "round"
      ctx.lineWidth = 1
      ctx.strokeStyle = p.bright
      hexGrid(split - band, s.cy - s.r, s.cx + s.r, s.cy + s.r, cell, (x, y) => {
        if (Math.hypot(x - s.cx, y - s.cy) > s.r - cell * 0.45) return
        const k = hash(x, y)
        if (k < 0.3) return
        const show = smooth(split - band, split + band * 0.4, x)
        if (show <= 0.02) return
        const breath = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.5 + k * TAU))
        const a = show * breath
        if (k > 0.82) {
          // A link to the next cell on the right, when it's on too: the graph's edges.
          const nx = x + cell
          if (hash(nx, y) >= 0.3 && Math.hypot(nx - s.cx, y - s.cy) < s.r - cell * 0.45) {
            ctx.globalAlpha = a * 0.7
            ctx.beginPath()
            ctx.moveTo(x + cell * 0.22, y)
            ctx.lineTo(nx - cell * 0.22, y)
            ctx.stroke()
          }
        }
        if (k < 0.62) rings.add(x, y, cell * 0.3 * (0.6 + 0.4 * show), a)
        else fills.add(x, y, cell * 0.16 * (0.6 + 0.4 * show), a)
      })
      ctx.globalAlpha = 1
      rings.stroke(ctx, p.bright, 1)
      fills.fill(ctx, p.star)
      // The scan line along the seam, with small hexagons at its ends.
      const span = Math.sqrt(Math.max(0, s.r * s.r - (split - s.cx) ** 2))
      if (span > 4) {
        ctx.strokeStyle = p.glow
        ctx.globalAlpha = 0.45
        ctx.beginPath()
        ctx.moveTo(split, s.cy - span + 6)
        ctx.lineTo(split, s.cy + span - 6)
        ctx.stroke()
        ctx.globalAlpha = 1
        hexStroke(ctx, split, s.cy - span, 3.5, p.bright, 0.8)
        hexStroke(ctx, split, s.cy + span, 3.5, p.bright, 0.8)
      }
    },
  },
})

// ---- Light strands ---------------------------------------------------------------------------------------------------
// From a site's flowing light fibers: bundles of thin lines that weave across the section, fanning out and gathering
// again, with small hexagons travelling along them. They sway with the scroll; hover: the strands lean toward the
// pointer. Lines only, never a glow.

const lightStrands = cosmos({
  id: "ref-light-strands",
  name: "Light strands",
  kind: "background",
  description:
    "Bundles of thin lines weaving across a section, with small hexagons travelling along them. They sway with the scroll; hover: they lean toward the pointer.",
  notes: [FULL, HOVER, SCROLL, COPY("a site's flowing light fibers")],
  seed: 137,
  spec: {
    init: () => {
      const rand = mulberry(61)
      const bundles = [
        { x0: -0.05, y0: 1.05, x1: 0.35, y1: -0.05, bend: 0.22 },
        { x0: 0.45, y0: 1.08, x1: 0.62, y1: -0.08, bend: -0.18 },
        { x0: 0.7, y0: 1.05, x1: 1.08, y1: 0.35, bend: 0.12 },
      ].map((b) => ({
        ...b,
        strands: Array.from({ length: 22 }, () => ({ o: rand() * 2 - 1, ph: rand() * TAU, a: 0.15 + rand() * 0.45 })),
      }))
      const sparks = Array.from({ length: 30 }, () => ({
        b: Math.floor(rand() * 3),
        s: Math.floor(rand() * 22),
        u: rand(),
        v: 0.03 + rand() * 0.05,
      }))
      return { bundles, sparks }
    },
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      const sway = (e.scroll - 0.5) * 0.12
      const point = (b: (typeof s.bundles)[number], st: { o: number; ph: number }, u: number) => {
        const bx = lerp(b.x0, b.x1, u) * w + Math.sin(u * Math.PI) * b.bend * w + sway * w * Math.sin(u * Math.PI)
        const by = lerp(b.y0, b.y1, u) * h
        // Fan out in the middle, gather at the ends, and breathe.
        const spread = (0.15 + Math.sin(u * Math.PI) ** 1.5) * 34 * st.o + Math.sin(t * 0.4 + st.ph + u * 5) * 4
        const nx = -(b.y1 - b.y0) * h
        const ny = (b.x1 - b.x0) * w
        const nl = Math.hypot(nx, ny) || 1
        let x = bx + (nx / nl) * spread
        let y = by + (ny / nl) * spread
        const d = Math.hypot(x - e.px, y - e.py)
        const pull = e.hover * 18 * Math.exp(-((d / 120) ** 2))
        if (d > 0) {
          x += ((e.px - x) / d) * pull
          y += ((e.py - y) / d) * pull
        }
        return { x, y }
      }
      ctx.lineWidth = 1
      for (const b of s.bundles)
        for (const st of b.strands) {
          ctx.beginPath()
          for (let k = 0; k <= 60; k += 1) {
            const q = point(b, st, k / 60)
            if (k === 0) ctx.moveTo(q.x, q.y)
            else ctx.lineTo(q.x, q.y)
          }
          ctx.strokeStyle = p.glow
          ctx.globalAlpha = st.a
          ctx.stroke()
        }
      ctx.globalAlpha = 1
      const sp = batch(4)
      for (const k of s.sparks) {
        k.u = (k.u + e.dt * k.v) % 1
        const b = s.bundles[k.b]
        const st = b?.strands[k.s]
        if (!b || !st) continue
        const q = point(b, st, k.u)
        sp.add(q.x, q.y, 1.8, Math.sin(k.u * Math.PI))
      }
      sp.fill(ctx, p.star)
    },
  },
})

// ---- Dust halo -------------------------------------------------------------------------------------------------------
// From a dithered burst and a site's dissolving sphere: a ring of fine hexagon dust, dense at its rim and thinning
// outward, drifting like smoke. Hover: the dust near the pointer gathers toward it.

const dustHalo = cosmos({
  id: "ref-dust-halo",
  name: "Dust halo",
  kind: "background",
  description:
    "A ring of fine hexagon dust, dense at its rim and thinning outward, drifting slowly. Hover: the dust near the pointer gathers toward it.",
  notes: [SIDE, HOVER, MOTION, COPY("a dithered burst and a dissolving dotted sphere")],
  seed: 149,
  spec: {
    init: () => {
      const rand = mulberry(71)
      const parts = Array.from({ length: 2400 }, () => {
        const g = (rand() + rand() + rand() + rand()) / 2 - 1 // around the rim
        return { a: rand() * TAU, r: 1 + g * 0.35 * (g > 0 ? 1.6 : 1), s: rand(), ox: 0, oy: 0 }
      })
      return { parts }
    },
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      const R = clamp(Math.min(h * 0.3, w * 0.17), 70, 220)
      const cx = w * 0.72
      const cy = h * 0.48
      const b = batch(6)
      for (const q of s.parts) {
        const n = fbm(e.noise, Math.cos(q.a) * 1.5 + t * 0.03, Math.sin(q.a) * 1.5, q.s * 3, 2) - 0.5
        const rr = R * (q.r + n * 0.25)
        let x = cx + Math.cos(q.a + t * 0.01) * rr
        let y = cy + Math.sin(q.a + t * 0.01) * rr * 0.92
        const dx = e.px - x
        const dy = e.py - y
        const d = Math.hypot(dx, dy)
        const pull = e.hover * 22 * Math.exp(-((d / 110) ** 2))
        const tx = d > 0 ? (dx / d) * pull : 0
        const ty = d > 0 ? (dy / d) * pull : 0
        q.ox = e.still ? tx : q.ox + (tx - q.ox) * clamp(e.dt * 5, 0, 1)
        q.oy = e.still ? ty : q.oy + (ty - q.oy) * clamp(e.dt * 5, 0, 1)
        x += q.ox
        y += q.oy
        const dense = Math.exp(-(((q.r - 1) / 0.18) ** 2))
        const lit = 0.55 + 0.45 * clamp(-Math.sin(q.a) * 0.8 + 0.4)
        b.add(x, y, 0.7 + dense * 0.9, (0.25 + 0.75 * dense) * lit)
      }
      b.fill(ctx, p.star)
    },
  },
})

export const referencePatterns = [
  trajectory,
  hexVortex,
  hexRibbon,
  hexRibbonConstellations,
  halftoneConstellations,
  halfPlanet,
  lightStrands,
  dustHalo,
]
