"use client"

import type { PatternNote } from "../types"
import { fbm, mulberry } from "./engine"
import { FULL, HOVER, SIDE, TAU, batch, clamp, cosmos, hexStroke, hexTo, lerp, smooth, type Env } from "./cosmos"

// Instruments (2026-11-27, exploring): from three images the team shared: a wireframe globe over orbit rings, an
// isometric "information field" with a cube projecting onto lit nodes, and letters spiralling into a labyrinth. Each
// is redrawn as Qdrant's own: hexagons for every point (the globe's vertices, the orbits' beads, the field's nodes,
// the spiral's marks), a hexagonal prism for the cube, hairlines in the website's colors and no glow. They move
// slowly and smoothly (long sines and steady drifts), keep the space set's text guard (cosmos.tsx), so nothing
// sits under letters, and each has a small hover moment.

const COPY = (what: string): PatternNote => ({
  rule: "References are for patterns, never copies",
  source: "web/guidelines.ts, Content and originality",
  text: `It's drawn from ${what}, redrawn with hexagons, hairlines and the website's colors, and without the glow. The design lead to decide whether it's far enough from the original.`,
})
const NO_GLOW: PatternNote = {
  rule: "Space comes from light, type and motion, never glow",
  source: "design-system/DESIGN.md, Space theme, layer 1 (design lead, 2026-11-14)",
  text: "The reference glows; here every point is a solid hexagon and every line a hairline, and nothing is blurred.",
}
const SLOW: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "Everything turns or drifts at a steady, slow pace; nothing flickers or jumps.",
}
const LITERAL: PatternNote = {
  rule: "Avoid literal rockets and planets",
  source: "design-system/DESIGN.md, References: Space, subtly",
  text: "A globe with orbits is close to a literal planet. It's a wireframe of hexagon points, not a lit sphere, but the design lead to decide.",
}

type V3 = [number, number, number]

// ---- Orbit globe ----------------------------------------------------------------------------------------------------
// A geodesic wireframe globe, its vertices small hexagons, turning slowly over flat orbit rings with hexagon beads,
// and a wide outer ring with clusters of ticks, like an instrument's scale.

function icosphere() {
  const g = (1 + Math.sqrt(5)) / 2
  const verts: V3[] = (
    [
      [-1, g, 0],
      [1, g, 0],
      [-1, -g, 0],
      [1, -g, 0],
      [0, -1, g],
      [0, 1, g],
      [0, -1, -g],
      [0, 1, -g],
      [g, 0, -1],
      [g, 0, 1],
      [-g, 0, -1],
      [-g, 0, 1],
    ] as V3[]
  ).map(([x, y, z]) => {
    const n = Math.hypot(x, y, z)
    return [x / n, y / n, z / n]
  })
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ] // prettier-ignore
  // One subdivision: each triangle into four, the new points pushed out to the sphere.
  const mids = new Map<string, number>()
  const mid = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    const known = mids.get(key)
    if (known !== undefined) return known
    const p = verts[a] ?? [0, 0, 1]
    const q = verts[b] ?? [0, 0, 1]
    const m: V3 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]
    const n = Math.hypot(...m)
    verts.push([m[0] / n, m[1] / n, m[2] / n])
    mids.set(key, verts.length - 1)
    return verts.length - 1
  }
  const edges = new Set<string>()
  const link = (a: number, b: number) => edges.add(a < b ? `${a}-${b}` : `${b}-${a}`)
  for (const [a = 0, b = 0, c = 0] of faces) {
    const ab = mid(a, b)
    const bc = mid(b, c)
    const ca = mid(c, a)
    for (const [x, y, z] of [
      [a, ab, ca],
      [b, bc, ab],
      [c, ca, bc],
      [ab, bc, ca],
    ] as V3[]) {
      link(x, y)
      link(y, z)
      link(z, x)
    }
  }
  return { verts, edges: [...edges].map((k) => k.split("-").map(Number) as [number, number]) }
}
const GLOBE = icosphere()

type Ring = { dy: number; r: number; ratio: number; beads: number; speed: number; a: number; ticks?: boolean }

// The rings' back halves (behind the globe) or front halves, with their beads and ticks.
function drawRings(
  ctx: CanvasRenderingContext2D,
  e: Env,
  rings: Ring[],
  cx: number,
  cy: number,
  R: number,
  spin: number,
  front: boolean
) {
  const { p } = e
  const beads = batch(6)
  ctx.lineWidth = 1
  ctx.strokeStyle = p.glow
  for (const ring of rings) {
    const rx = ring.r * R
    const ry = rx * ring.ratio
    const y = cy + ring.dy * R
    ctx.globalAlpha = ring.a * (front ? 1 : 0.55)
    ctx.beginPath()
    ctx.ellipse(cx, y, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : TAU)
    ctx.stroke()
    for (let k = 0; k < ring.beads; k += 1) {
      const a = (k / ring.beads) * TAU + spin * ring.speed
      const s = Math.sin(a)
      if (s > 0 !== front) continue
      const bx = cx + Math.cos(a) * rx
      const by = y + s * ry
      const near = e.hover * Math.exp(-((Math.hypot(bx - e.px, by - e.py) / 90) ** 2))
      // Every fourth bead a little larger, so the ring reads as a scale.
      const big = k % 4 === 0 ? 1 : 0
      beads.add(bx, by, 1.3 + big * 0.9 + near * 1.2, (front ? 0.55 + 0.35 * s : 0.22) + near * 0.4)
    }
    if (ring.ticks) {
      // Clusters of four short ticks across the ring, turning with it.
      ctx.beginPath()
      for (const base of [0.18, 0.62, 1.05, 1.42, 1.83]) {
        for (let j = 0; j < 4; j += 1) {
          const a = base * Math.PI + j * 0.022 + spin * ring.speed
          const s = Math.sin(a)
          if (s > 0 !== front) continue
          const c = Math.cos(a)
          ctx.moveTo(cx + c * rx * 0.975, y + s * ry * 0.975)
          ctx.lineTo(cx + c * rx * 1.025, y + s * ry * 1.025)
        }
      }
      ctx.globalAlpha = ring.a * 1.6 * (front ? 1 : 0.6)
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.lineWidth = 1
    }
  }
  ctx.globalAlpha = 1
  beads.fill(ctx, p.star)
}

function drawGlobe(ctx: CanvasRenderingContext2D, e: Env, cx: number, cy: number, R: number, angle: number) {
  const { p } = e
  const tilt = 0.38
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const pts = GLOBE.verts.map(([x, y, z]) => {
    const x1 = x * ca + z * sa
    const z1 = -x * sa + z * ca
    return [cx + x1 * R, cy + (y * ct - z1 * st) * R, y * st + z1 * ct] as V3
  })
  // Edges in four strengths, by depth: the far side faint, the near side clearer.
  const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
  for (const [a, b] of GLOBE.edges) {
    const P = pts[a]
    const Q = pts[b]
    if (!P || !Q) continue
    const depth = ((P[2] + Q[2]) / 2 + 1) / 2
    const path = paths[Math.min(3, Math.floor(depth * 4))]
    path?.moveTo(P[0], P[1])
    path?.lineTo(Q[0], Q[1])
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = p.glow
  paths.forEach((path, i) => {
    ctx.globalAlpha = [0.07, 0.13, 0.26, 0.42][i] ?? 0.2
    ctx.stroke(path)
  })
  ctx.globalAlpha = 1
  const nodes = batch(6)
  for (const [x, y, z] of pts) {
    const front = (z + 1) / 2
    nodes.add(x, y, 1 + front * 1.4, 0.15 + front * 0.8)
  }
  nodes.fill(ctx, p.star)
}

const ORBITS: Ring[] = [
  { dy: 0.18, r: 1.45, ratio: 0.3, beads: 44, speed: 1, a: 0.32 },
  { dy: 0.42, r: 2.0, ratio: 0.3, beads: 60, speed: -0.7, a: 0.26 },
  { dy: 0.9, r: 1.55, ratio: 0.3, beads: 0, speed: 0, a: 0.16 },
  { dy: 0.62, r: 3.3, ratio: 0.28, beads: 0, speed: 0.35, a: 0.12, ticks: true },
]

const orbitGlobe = cosmos({
  id: "ref-orbit-globe",
  name: "Orbit globe",
  kind: "background",
  description:
    "A wireframe globe with hexagon vertices, turning slowly over flat orbit rings with hexagon beads and an outer ring of ticks. Hover: it turns a little faster and the beads near the pointer light.",
  notes: [SIDE, SLOW, NO_GLOW, LITERAL, HOVER, COPY("a wireframe globe over orbit rings")],
  seed: 251,
  spec: {
    init: () => ({ angle: 0, spin: 0 }),
    frame(ctx, s, e) {
      const { w, h } = e
      s.angle += e.dt * (0.06 + 0.12 * e.hover)
      s.spin += e.dt * (0.05 + 0.05 * e.hover)
      const R = clamp(Math.min(h * 0.21, w * 0.1), 40, 120)
      const cx = w * 0.76
      // Kept near the top, so in a tall section (a hero with its visual below) it stays beside the heading.
      const cy = Math.min(h * 0.42, R * 2.4 + 40)
      drawRings(ctx, e, ORBITS, cx, cy, R, s.spin, false)
      drawGlobe(ctx, e, cx, cy, R, s.angle)
      drawRings(ctx, e, ORBITS, cx, cy, R, s.spin, true)
    },
  },
})

// The rings alone, wide and flat, as a stage at the bottom of a centered section.
const PLATFORM: Ring[] = [
  { dy: 0, r: 1.1, ratio: 0.2, beads: 36, speed: 1, a: 0.4 },
  { dy: 0.05, r: 1.7, ratio: 0.2, beads: 56, speed: -0.6, a: 0.32 },
  { dy: 0.12, r: 2.5, ratio: 0.2, beads: 0, speed: 0, a: 0.2 },
  { dy: 0.08, r: 3.4, ratio: 0.2, beads: 0, speed: 0.3, a: 0.17, ticks: true },
  { dy: 0.04, r: 4.4, ratio: 0.2, beads: 72, speed: 0.2, a: 0.12 },
]

const orbitPlatform = cosmos({
  id: "ref-orbit-platform",
  name: "Orbit platform",
  kind: "background",
  description:
    "Wide, flat orbit rings at the bottom of a section, like a stage under the content, with hexagon beads and a ring of ticks turning slowly. Hover: they turn a little faster and the beads near the pointer light.",
  notes: [FULL, SLOW, NO_GLOW, HOVER, COPY("a wireframe globe over orbit rings")],
  seed: 257,
  spec: {
    init: () => ({ spin: 0 }),
    frame(ctx, s, e) {
      const { w, h, p } = e
      s.spin += e.dt * (0.05 + 0.05 * e.hover)
      const R = clamp(w * 0.11, 60, 170)
      const cx = w * 0.5
      const cy = h * 0.9
      drawRings(ctx, e, PLATFORM, cx, cy, R, s.spin, false)
      // Its center: a few hexagons inside each other, the stage's mark.
      for (let k = 1; k <= 3; k += 1) hexStroke(ctx, cx, cy, 6 * k, p.glow, 0.3 - k * 0.06)
      drawRings(ctx, e, PLATFORM, cx, cy, R, s.spin, true)
    },
  },
})

// ---- Hex projection -------------------------------------------------------------------------------------------------
// From an isometric diagram: a plane of nodes on a hexagonal lattice, seen at an angle, and a wireframe hexagonal
// prism floating above it, its edges dropping hairlines to the plane and lighting the nodes under it.

type Lattice = { nodes: [number, number][]; edges: [number, number][] }

// A hexagon of lattice points, N rings out, at unit pitch, with each neighbour pair once.
function lattice(N: number): Lattice {
  const index = new Map<string, number>()
  const nodes: [number, number][] = []
  for (let q = -N; q <= N; q += 1)
    for (let r = -N; r <= N; r += 1) {
      if (Math.abs(q + r) > N) continue
      index.set(`${q},${r}`, nodes.length)
      nodes.push([q + r / 2, r * 0.866])
    }
  const edges: [number, number][] = []
  for (let q = -N; q <= N; q += 1)
    for (let r = -N; r <= N; r += 1) {
      const i = index.get(`${q},${r}`)
      if (i === undefined) continue
      for (const [dq, dr] of [
        [1, 0],
        [0, 1],
        [-1, 1],
      ]) {
        const j = index.get(`${q + (dq ?? 0)},${r + (dr ?? 0)}`)
        if (j !== undefined) edges.push([i, j])
      }
    }
  return { nodes, edges }
}

// The plane's view: turned 30° and squashed to half its depth, like an isometric drawing.
const TURN = Math.PI / 6
const view = (cx: number, cy: number) => {
  const c = Math.cos(TURN)
  const s = Math.sin(TURN)
  return {
    at: (x: number, y: number, z = 0): [number, number] => [cx + x * c - y * s, cy + (x * s + y * c) * 0.5 - z],
    // The plane point under a screen point.
    from: (X: number, Y: number): [number, number] => {
      const dx = X - cx
      const dy = (Y - cy) * 2
      return [dx * c + dy * s, -dx * s + dy * c]
    },
  }
}

function drawLattice(
  ctx: CanvasRenderingContext2D,
  e: Env,
  L: Lattice,
  P: number,
  at: (x: number, y: number) => [number, number],
  light: (x: number, y: number) => number
) {
  const { p } = e
  const lit = L.nodes.map(([x, y]) => light(x * P, y * P))
  const dim = new Path2D()
  const on = new Path2D()
  for (const [i, j] of L.edges) {
    const a = L.nodes[i]
    const b = L.nodes[j]
    if (!a || !b) continue
    const path = Math.min(lit[i] ?? 0, lit[j] ?? 0) > 0.5 ? on : dim
    const A = at(a[0] * P, a[1] * P)
    const B = at(b[0] * P, b[1] * P)
    path.moveTo(A[0], A[1])
    path.lineTo(B[0], B[1])
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = p.line
  ctx.globalAlpha = 0.32
  ctx.stroke(dim)
  ctx.strokeStyle = p.glow
  ctx.globalAlpha = 0.42
  ctx.stroke(on)
  ctx.globalAlpha = 1
  // Nodes: a small outline where unlit, a solid hexagon where lit.
  const rings = new Path2D()
  const solid = batch(6)
  L.nodes.forEach(([x, y], i) => {
    const [X, Y] = at(x * P, y * P)
    const v = lit[i] ?? 0
    if (v > 0.05) solid.add(X, Y, clamp(P * 0.1 + v * P * 0.05, 1.4, 3.4), 0.25 + 0.7 * v)
    else hexTo(rings, X, Y, clamp(P * 0.07, 1, 2.2))
  })
  ctx.strokeStyle = p.line
  ctx.globalAlpha = 0.55
  ctx.stroke(rings)
  ctx.globalAlpha = 1
  solid.fill(ctx, p.bright)
}

// A hexagonal prism's corners on the plane at (fx, fy), radius r, turned by phi.
const prismCorners = (fx: number, fy: number, r: number, phi: number) =>
  Array.from({ length: 6 }, (_, k): [number, number] => [
    fx + Math.cos(phi + (k * Math.PI) / 3) * r,
    fy + Math.sin(phi + (k * Math.PI) / 3) * r,
  ])

const projection = cosmos({
  id: "ref-hex-projection",
  name: "Hex projection",
  kind: "background",
  description:
    "A plane of hexagon nodes seen at an angle, with a wireframe hexagonal prism floating above it and lighting the nodes under it as it drifts. Hover: it drifts toward the pointer.",
  notes: [SIDE, SLOW, NO_GLOW, HOVER, COPY("an isometric diagram of a cube projected onto a field of nodes")],
  seed: 263,
  spec: {
    init: () => ({ L: lattice(8), fx: 0, fy: 0 }),
    frame(ctx, s, e) {
      const { w, h, p, t } = e
      const Rp = clamp(Math.min(w * 0.17, h * 0.46), 110, 250)
      const P = Rp / 8
      // The plane sits under the prism's room and no lower, so a tall section's visual never covers it.
      const v = view(w * 0.76, Math.min(h * 0.7, Rp * 1.45 + 24))
      // The prism wanders slowly over the plane; on hover it drifts toward the point under the pointer.
      let tx = Math.sin(t * 0.05) * 0.45 * Rp
      let ty = Math.sin(t * 0.037 + 1) * 0.4 * Rp
      if (e.hover > 0.01) {
        const [ux, uy] = v.from(e.px, e.py)
        const d = Math.hypot(ux, uy)
        const k = d > Rp * 0.6 ? (Rp * 0.6) / d : 1
        tx = lerp(tx, ux * k, e.hover)
        ty = lerp(ty, uy * k, e.hover)
      }
      const ease = e.still ? 1 : 1 - Math.exp(-e.dt * 1.2)
      s.fx += (tx - s.fx) * ease
      s.fy += (ty - s.fy) * ease
      const rr = P * 2.3
      drawLattice(ctx, e, s.L, P, v.at, (x, y) => smooth(rr * 1.05, rr * 0.7, Math.hypot(x - s.fx, y - s.fy)))
      // The plane's border: two hexagons around the lattice.
      ctx.strokeStyle = p.line
      for (const [k, a] of [
        [8.7, 0.45],
        [9.2, 0.25],
      ] as const) {
        ctx.globalAlpha = a
        ctx.beginPath()
        prismCorners(0, 0, k * P, 0).forEach(([x, y], i) => {
          const [X, Y] = v.at(x, y)
          if (i === 0) ctx.moveTo(X, Y)
          else ctx.lineTo(X, Y)
        })
        ctx.closePath()
        ctx.stroke()
      }
      // The prism: an outer and an inner one, turning opposite ways, bobbing slowly.
      const top = Rp * 0.95 + Math.sin(t * 0.3) * Rp * 0.03
      const tall = rr * 1.4
      const phi = t * 0.08
      const drops = new Path2D()
      const frame = new Path2D()
      const corners: [number, number][] = []
      for (const [scale, turn] of [
        [1, phi],
        [0.6, -phi * 1.3],
      ] as const) {
        const c = prismCorners(s.fx, s.fy, rr * scale, turn)
        const z1 = top - (tall * (1 - scale)) / 2
        const z0 = z1 - tall * scale
        const up = c.map(([x, y]) => v.at(x, y, z1))
        const down = c.map(([x, y]) => v.at(x, y, z0))
        for (let k = 0; k < 6; k += 1) {
          const a = up[k]
          const b = up[(k + 1) % 6]
          const d = down[k]
          const f = down[(k + 1) % 6]
          if (!a || !b || !d || !f) continue
          frame.moveTo(a[0], a[1])
          frame.lineTo(b[0], b[1])
          frame.moveTo(d[0], d[1])
          frame.lineTo(f[0], f[1])
          frame.moveTo(a[0], a[1])
          frame.lineTo(d[0], d[1])
          corners.push(a, d)
          if (scale === 1) {
            // Hairlines from the prism's base down to the plane.
            const [gx, gy] = c[k] ?? [0, 0]
            const g = v.at(gx, gy)
            drops.moveTo(d[0], d[1])
            drops.lineTo(g[0], g[1])
          }
        }
      }
      ctx.strokeStyle = p.glow
      ctx.globalAlpha = 0.2
      ctx.stroke(drops)
      ctx.globalAlpha = 0.5
      ctx.stroke(frame)
      ctx.globalAlpha = 1
      const tips = batch(4)
      for (const [x, y] of corners) tips.add(x, y, 1.6, 0.85)
      tips.fill(ctx, p.star)
    },
  },
})

// The plane alone, wide across the bottom of a section: patches of nodes light and fade as a slow noise passes.
const informationField = cosmos({
  id: "ref-information-field",
  name: "Information field",
  kind: "background",
  description:
    "A wide plane of hexagon nodes seen at an angle across the bottom of a section, with patches that light and fade slowly. Hover: the nodes under the pointer light.",
  notes: [FULL, SLOW, NO_GLOW, HOVER, COPY("an isometric diagram of a field of nodes")],
  seed: 269,
  spec: {
    init: () => ({ L: lattice(28) }),
    frame(ctx, s, e) {
      const { w, h, t } = e
      const Rp = Math.max(w * 0.62, 420)
      const P = Rp / 28
      const v = view(w * 0.5, h * 0.98)
      const [ux, uy] = v.from(e.px, e.py)
      drawLattice(ctx, e, s.L, P, v.at, (x, y) => {
        const n = fbm(e.noise, x * 0.004 + t * 0.025, y * 0.004 - t * 0.015, 0.5, 2)
        const patch = smooth(0.6, 0.72, n)
        const near = e.hover * smooth(P * 3, P * 1.2, Math.hypot(x - ux, y - uy))
        return Math.max(patch, near)
      })
      // Faded toward the top and both sides, so the plane reads as going on.
      ctx.globalCompositeOperation = "destination-in"
      const up = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.92)
      up.addColorStop(0, "rgb(0 0 0 / 0)")
      up.addColorStop(1, "rgb(0 0 0 / 1)")
      ctx.fillStyle = up
      ctx.fillRect(0, 0, w, h)
      const side = ctx.createLinearGradient(0, 0, w, 0)
      side.addColorStop(0, "rgb(0 0 0 / 0)")
      side.addColorStop(0.2, "rgb(0 0 0 / 1)")
      side.addColorStop(0.8, "rgb(0 0 0 / 1)")
      side.addColorStop(1, "rgb(0 0 0 / 0)")
      ctx.fillStyle = side
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = "source-over"
    },
  },
})

// ---- Hex labyrinth --------------------------------------------------------------------------------------------------
// From letters spiralling into a labyrinth: marks on a spiral seen at an angle, small near its center and larger
// outward, flowing slowly out from the middle, with faint vertical streaks drifting down behind. The marks are
// hexagons and short strokes (the reference's letters, as the brand's own marks).

type Streak = { x: number; y: number; len: number; v: number; a: number }

function labyrinth(rings: boolean, seed: number) {
  return {
    init: () => {
      const rand = mulberry(seed)
      const streaks: Streak[] = Array.from({ length: 70 }, () => ({
        x: rand(),
        y: rand(),
        len: 6 + rand() * 14,
        v: 0.006 + rand() * 0.01,
        a: 0.06 + rand() * 0.16,
      }))
      return { streaks }
    },
    frame(ctx: CanvasRenderingContext2D, s: { streaks: Streak[] }, e: Env) {
      const { w, h, p, t } = e
      // Streaks first, behind the spiral.
      const strokes: Path2D[] = Array.from({ length: 5 }, () => new Path2D())
      for (const q of s.streaks) {
        q.y = (q.y + e.dt * q.v) % 1
        const y = q.y * (h + 40) - 20
        const a = q.a * Math.sin(q.y * Math.PI)
        strokes[Math.min(4, Math.floor(clamp(a / 0.25) * 5))]?.rect(q.x * w, y, 1, q.len)
      }
      ctx.fillStyle = p.dim
      strokes.forEach((path, i) => {
        ctx.globalAlpha = ((i + 0.5) / 5) * 0.25
        ctx.fill(path)
      })
      ctx.globalAlpha = 1

      const cx = w * 0.5
      const cy = h * 0.5
      const r0 = 16
      const U = Math.log((Math.hypot(w, h) * 0.62) / r0)
      // A log spiral: r = r0·e^u, turning one full turn as the radius about doubles. Marks sit at even steps of u, so
      // their spacing grows with the radius, like the reference's perspective; u flows outward slowly.
      const b = 0.12
      const du = rings ? 1 / 48 : b * 0.1
      const flow = t * 0.02
      const marks = batch(8)
      const dashes: Path2D[] = Array.from({ length: 8 }, () => new Path2D())
      const arms = rings ? 1 : 2
      const count = rings ? Math.ceil(U / 0.28) * 48 : Math.ceil(U / du)
      for (let arm = 0; arm < arms; arm += 1)
        for (let i = 0; i < count; i += 1) {
          let u: number
          let theta: number
          if (rings) {
            // Rings: 48 marks each, the rings spaced evenly in u, each turning its own way, all flowing outward.
            const ring = Math.floor(i / 48)
            u = (ring * 0.28 + flow) % (Math.ceil(U / 0.28) * 0.28)
            theta = ((i % 48) / 48) * TAU + t * (ring % 2 ? 0.03 : -0.03) * (1 + ring * 0.1)
          } else {
            u = (i * du + flow) % U
            theta = u / b + arm * Math.PI
          }
          if (u > U) continue
          const r = r0 * Math.exp(u)
          const x = cx + Math.cos(theta) * r
          const y = cy + Math.sin(theta) * r * 0.42
          const near = e.hover * Math.exp(-((Math.hypot(x - e.px, y - e.py) / 110) ** 2))
          const size = (0.7 + r * 0.007) * (1 + near * 0.4)
          const fade = smooth(0, 0.7, u) * smooth(U, U - 0.9, u)
          const a = fade * (0.45 + 0.3 * Math.sin(theta)) + near * 0.35
          if ((i * 7 + arm) % 5 === 0) {
            const level = Math.min(7, Math.floor(clamp(a) * 8))
            dashes[level]?.rect(x - 0.5, y - size * 1.8, 1, size * 3.6)
          } else marks.add(x, y, size, a)
        }
      marks.fill(ctx, p.star)
      ctx.fillStyle = p.star
      dashes.forEach((path, i) => {
        ctx.globalAlpha = (i + 0.5) / 8
        ctx.fill(path)
      })
      ctx.globalAlpha = 1
    },
  }
}

const hexLabyrinth = cosmos({
  id: "ref-hex-labyrinth",
  name: "Hex labyrinth",
  kind: "background",
  description:
    "Hexagons and short strokes on a two-armed spiral seen at an angle, flowing slowly out from the middle, with faint streaks drifting down behind. Hover: the marks near the pointer grow a little.",
  notes: [FULL, SLOW, HOVER, COPY("letters spiralling into a labyrinth")],
  seed: 271,
  spec: labyrinth(false, 271),
})

const hexLabyrinthRings = cosmos({
  id: "ref-hex-labyrinth-rings",
  name: "Hex labyrinth, rings",
  kind: "background",
  description:
    "Rings of hexagons and short strokes seen at an angle, each turning its own way and all flowing slowly outward from the middle, like a tunnel. Hover: the marks near the pointer grow a little.",
  notes: [FULL, SLOW, HOVER, COPY("letters spiralling into a labyrinth")],
  seed: 277,
  spec: labyrinth(true, 277),
})

export const instrumentPatterns = [
  orbitGlobe,
  orbitPlatform,
  projection,
  informationField,
  hexLabyrinth,
  hexLabyrinthRings,
]
