"use client"

import { clamp, ease, rng, spread } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import {
  TAU,
  crosshair,
  hexCorners,
  nearest,
  poly,
  prefersStill,
  readout,
  textWidth,
  type Pt,
} from "./lib"

// Qdrant Serverless (qdrant.tech/serverless, coming soon): many small, isolated tenants, each its own hexagon of
// points, with no cluster drawn around them. Each one wakes when it's used, a search lighting its points and its
// nearest ones, and idles again: spiky or idle workloads. In turn, a new tenant goes through the page's three
// steps, create a collection, load vectors and search, the best result in amaranth. Layout, sizes and timings are
// illustrative; nothing is measured.

const CYCLE = 9
const SLOTS: Pt[] = [
  { x: 0.33, y: 0.44 },
  { x: 0.62, y: 0.56 },
  { x: 0.8, y: 0.4 },
]
const STEPS = [
  { at: 0, text: "CREATE COLLECTION" },
  { at: 1.5, text: "LOAD VECTORS" },
  { at: 4, text: "SEARCH" },
] as const

type Tenant = {
  x: number
  y: number
  r: number
  points: Pt[]
  period: number
  busy: number
  phase: number
}
type State = {
  w: number
  h: number
  p: Palette
  still: boolean
  base: number
  tenants: Tenant[]
  // The new tenant of each slot: its points, relative to its center, and its query.
  fresh: { points: Pt[]; query: Pt }[]
  labels: boolean
}

// n points inside a hexagon of radius r, around (0, 0).
function fill(n: number, r: number, rand: () => number): Pt[] {
  return Array.from({ length: n }, () => {
    const a = rand() * TAU
    const d = Math.sqrt(rand()) * r * 0.62
    return { x: Math.cos(a) * d, y: Math.sin(a) * d }
  })
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(1207)
    const base = clamp(h * 0.11, 9, 34)
    const labels = w >= 700
    const pad = base + 6
    const n = Math.round(clamp((w * h) / 6400, 12, 60))
    const slots = SLOTS.map((s) => ({ x: s.x * w, y: s.y * h }))
    // Each slot keeps its hexagon's room clear, and its step's label's below it.
    const clear = (q: Pt) =>
      slots.every(
        (s) =>
          Math.hypot(q.x - s.x, q.y - s.y) > base * 2.5 &&
          !(
            labels &&
            Math.abs(q.x - s.x) < 84 + base * 0.6 &&
            q.y > s.y &&
            q.y < s.y + base * 1.15 + 40 + base * 0.6
          )
      )
    const candidates = spread(n * 2, w - 2 * pad, h - 2 * pad, rand, 6)
      .map((q) => ({ x: q.x + pad, y: q.y + pad }))
      .filter(clear)
    const placed = candidates.slice(0, n)
    const tenants: Tenant[] = placed.map((q, i) => {
      const others = placed.filter((_, j) => j !== i)
      const room = Math.min(
        ...others.map((o) => Math.hypot(o.x - q.x, o.y - q.y))
      )
      const r = clamp(
        Math.min(base * (0.55 + rand() * 0.45), room / 2 - 6),
        4,
        base
      )
      const period = 9 + rand() * 16
      return {
        x: q.x,
        y: q.y,
        r,
        points: fill(3 + Math.floor((r / base) * (4 + rand() * 8)), r, rand),
        period,
        busy: 1.6 + rand() * 2.4,
        phase: rand() * period,
      }
    })
    const fresh = slots.map(() => ({
      points: fill(12, base * 1.15, rand),
      query: { x: base * 0.18, y: -base * 0.12 },
    }))
    return { w, h, p, still: prefersStill(), base, tenants, fresh, labels }
  },
  draw(ctx, s, t) {
    const { p, w, h, base } = s
    clear(ctx, p, w, h)
    ctx.lineWidth = 1
    const dot = clamp(base * 0.055, 0.9, 1.6)
    // Toward the sides the tenants fade out: there are always more.
    const edge = (x: number) => ease(Math.min(x, w - x) / (w * 0.14))

    for (const [i, k] of s.tenants.entries()) {
      const local = s.still
        ? i % 6 === 0
          ? 1.2
          : 99
        : (t + k.phase) % k.period
      const awake =
        local < k.busy + 1.2
          ? ease(local / 0.8) * (1 - ease((local - k.busy) / 1.2))
          : 0
      const fadeX = edge(k.x)
      ctx.save()
      ctx.globalAlpha = fadeX
      poly(ctx, hexCorners(k.x, k.y, k.r))
      ctx.strokeStyle = awake > 0 ? alpha(p.glow, 0.35 + 0.55 * awake) : p.line
      ctx.globalAlpha = fadeX * (0.7 + 0.3 * awake)
      ctx.stroke()
      // A search in it while it's awake: its nearest points to the middle.
      if (awake > 0.05 && k.points.length > 2) {
        const hits = nearest(
          k.points,
          (q) => Math.hypot(q.x, q.y + k.r * 0.1),
          2
        )
        ctx.strokeStyle = alpha(p.glow, 0.8 * awake)
        ctx.beginPath()
        for (const { i: j } of hits) {
          ctx.moveTo(k.x, k.y - k.r * 0.1)
          ctx.lineTo(k.x + k.points[j]!.x, k.y + k.points[j]!.y)
        }
        ctx.stroke()
      }
      ctx.fillStyle = awake > 0.3 ? p.bright : p.star
      ctx.globalAlpha = fadeX * (0.45 + 0.5 * awake)
      ctx.beginPath()
      for (const q of k.points) {
        ctx.moveTo(k.x + q.x + dot, k.y + q.y)
        ctx.arc(k.x + q.x, k.y + q.y, dot, 0, TAU)
      }
      ctx.fill()
      ctx.restore()
    }

    // The new tenant, in its slot: created, loaded, searched.
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    const e = s.still ? CYCLE - 1.6 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.1)) / 1)
    const slot = cycle % SLOTS.length
    const cx = SLOTS[slot]!.x * w
    const cy = SLOTS[slot]!.y * h
    const r = base * 1.15
    const fresh = s.fresh[slot]!
    const corners = hexCorners(cx, cy, r)
    const drawn = ease(e / 1.1) * 6
    ctx.save()
    ctx.globalAlpha = fade
    ctx.strokeStyle = p.glow
    ctx.lineWidth = 1.25
    ctx.beginPath()
    ctx.moveTo(corners[0]!.x, corners[0]!.y)
    for (let k = 0; k < 6; k++) {
      const part = clamp(drawn - k)
      if (part <= 0) break
      const a = corners[k]!
      const b = corners[(k + 1) % 6]!
      ctx.lineTo(a.x + (b.x - a.x) * part, a.y + (b.y - a.y) * part)
    }
    ctx.stroke()
    const loaded = fresh.points.filter(
      (_, k) => e >= STEPS[1].at + k * 0.18
    ).length
    ctx.fillStyle = p.bright
    ctx.beginPath()
    for (const q of fresh.points.slice(0, loaded)) {
      ctx.moveTo(cx + q.x + dot * 1.3, cy + q.y)
      ctx.arc(cx + q.x, cy + q.y, dot * 1.3, 0, TAU)
    }
    ctx.fill()
    ctx.restore()

    const search = ease((e - STEPS[2].at) / 0.5) * fade
    if (search > 0) {
      const q = { x: cx + fresh.query.x, y: cy + fresh.query.y }
      const hits = nearest(
        fresh.points,
        (pt) => Math.hypot(cx + pt.x - q.x, cy + pt.y - q.y),
        3
      )
      ctx.save()
      ctx.globalAlpha = search
      ctx.strokeStyle = alpha(p.glow, 0.8)
      ctx.beginPath()
      for (const { i } of hits) {
        ctx.moveTo(q.x, q.y)
        ctx.lineTo(cx + fresh.points[i]!.x, cy + fresh.points[i]!.y)
      }
      ctx.stroke()
      const best = fresh.points[hits[0]!.i]!
      ctx.strokeStyle = p.accent
      ctx.beginPath()
      ctx.arc(cx + best.x, cy + best.y, 6, 0, TAU)
      ctx.stroke()
      ctx.restore()
      if (s.labels) crosshair(ctx, p, q.x, q.y, search)
    }

    // The step it's on, below it.
    if (s.labels) {
      const step = STEPS.reduce((at, st, k) => (e >= st.at ? k : at), 0)
      const text = STEPS[step]!.text
      const width = textWidth(ctx, p, text) + 29
      const x = clamp(cx - width / 2, 8, w - width - 8)
      readout(ctx, p, [text], x, cy + r + 24, {
        opacity: fade * ease(e / 0.4),
        mark: step === 2 ? p.accent : p.glow,
      })
    }
  },
}

export function ServerlessTenants() {
  return <SceneCanvas scene={scene} />
}
