"use client"

import { clamp, ease, rng, spread } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import {
  TAU,
  arrow,
  closerTo,
  crosshair,
  ids,
  labelRow,
  markBox,
  placeLabel,
  poly,
  prefersStill,
  readout,
  textWidth,
  type Box,
  type Pt,
} from "./lib"

// Discovery: a target (the query) and three context pairs, each a positive and a negative example. Each
// pair splits the space along the line where a point is as close to one as to the other, hatched on the
// negative side; stars on that side dim. Results rank first by how many pairs they satisfy, then by
// distance to the target, so they come from the zone every pair allows: the target is pushed toward the
// positives. Its plain nearest neighbors stay ringed and dashed for comparison. New context every cycle.

const STARS = 150
const PAIRS = 3
const TOP = 5
const CYCLE = 12

type Pair = { pos: number; neg: number }
type Run = {
  target: Pt
  pairs: Pair[]
  rank: number[]
  results: number[]
  plain: number[]
  zone: Pt[]
  inZone: number
}
type State = { w: number; h: number; p: Palette; aspect: number; stars: Pt[]; names: string[]; cycle: number; run: Run; still: boolean }

const d2 = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

function discover(stars: Pt[], aspect: number, cycle: number): Run {
  const rand = rng(950 + cycle)
  let fallback: Run | null = null
  for (let attempt = 0; attempt < 40; attempt++) {
    const target = { x: aspect * (0.3 + rand() * 0.4), y: 0.3 + rand() * 0.4 }
    const beta = rand() * TAU
    const used = new Set<number>()
    const pick = (q: Pt) => {
      let best = -1
      stars.forEach((s, i) => {
        if (!used.has(i) && (best < 0 || d2(s, q) < d2(stars[best], q))) best = i
      })
      used.add(best)
      return best
    }
    const pairs: Pair[] = []
    for (let i = 0; i < PAIRS; i++) {
      const g = beta + (i - 1) * 0.8 + (rand() - 0.5) * 0.3
      const dx = Math.cos(g)
      const dy = Math.sin(g)
      const out = 0.26 + rand() * 0.08
      const back = 0.06 + rand() * 0.06
      const side = (rand() - 0.5) * 0.15
      const pos = pick({ x: target.x + dx * out, y: target.y + dy * out })
      const neg = pick({ x: target.x - dx * back - dy * side, y: target.y - dy * back + dx * side })
      pairs.push({ pos, neg })
    }
    // Discovery's rank: +1 for each pair whose positive is nearer than its negative, -1 otherwise.
    const rank = stars.map((s) => pairs.reduce((sum, { pos, neg }) => sum + (d2(s, stars[pos]) < d2(s, stars[neg]) ? 1 : -1), 0))
    const free = stars.map((_, i) => i).filter((i) => !used.has(i))
    const results = [...free].sort((a, b) => rank[b] - rank[a] || d2(stars[a], target) - d2(stars[b], target)).slice(0, TOP)
    const plain = [...free].sort((a, b) => d2(stars[a], target) - d2(stars[b], target)).slice(0, 3)
    const rect = [
      { x: 0, y: 0 },
      { x: aspect, y: 0 },
      { x: aspect, y: 1 },
      { x: 0, y: 1 },
    ]
    const zone = pairs.reduce((cell, { pos, neg }) => closerTo(cell, stars[pos], stars[neg]), rect)
    const inZone = free.filter((i) => rank[i] === PAIRS).length
    const run = { target, pairs, rank, results, plain, zone, inZone }
    const differs = results.slice(0, 3).filter((i) => !plain.includes(i)).length
    const apart = pairs.every(({ pos, neg }) => d2(stars[pos], stars[neg]) > 0.12 ** 2)
    if (inZone >= 6 && differs >= 2 && apart) return run
    fallback ??= run
  }
  return fallback as Run
}

// Where the line through m along u enters and leaves the box [0, aspect] x [0, 1].
function span(m: Pt, u: Pt, aspect: number): [number, number] {
  let lo = -Infinity
  let hi = Infinity
  for (const [o, d, max] of [
    [m.x, u.x, aspect],
    [m.y, u.y, 1],
  ]) {
    if (Math.abs(d) < 1e-9) continue
    const a = -o / d
    const b = (max - o) / d
    lo = Math.max(lo, Math.min(a, b))
    hi = Math.min(hi, Math.max(a, b))
  }
  return [lo, hi]
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const aspect = (w - 48) / (h - 80)
    const rand = rng(29)
    const stars = spread(STARS, aspect, 1, rand)
    return { w, h, p, aspect, stars, names: ids(STARS, rand), cycle: 0, run: discover(stars, aspect, 0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h, stars } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.run = discover(stars, s.aspect, cycle)
    }
    const e = s.still ? 9 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1)) / 0.9)
    const { target, pairs, results, plain, zone } = s.run
    const size = h - 80
    const at = (q: Pt) => ({ x: 24 + q.x * size, y: 24 + q.y * size })
    const starts = pairs.map((_, i) => 0.8 + i * 1.3)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The zone every pair allows: a faint tint, the hatched lines do the rest.
    const zoneOn = clamp((e - 4.8) / 0.5) * fade
    if (zoneOn > 0 && zone.length > 2) {
      poly(ctx, zone.map(at))
      ctx.fillStyle = alpha(p.glow, 0.05 * zoneOn)
      ctx.fill()
    }

    // Each pair: the dividing line, hatched on the negative side, and an arrow from negative to positive.
    pairs.forEach(({ pos, neg }, i) => {
      const P = stars[pos]
      const Q = stars[neg]
      const length = Math.sqrt(d2(P, Q))
      const m = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 }
      const u = { x: -(P.y - Q.y) / length, y: (P.x - Q.x) / length }
      const toward = { x: (Q.x - P.x) / length, y: (Q.y - P.y) / length }
      const k = ease((e - starts[i] - 0.5) / 0.5) * fade
      if (k > 0) {
        const [lo, hi] = span(m, u, s.aspect)
        const a = at({ x: m.x + u.x * lo * k, y: m.y + u.y * lo * k })
        const b = at({ x: m.x + u.x * hi * k, y: m.y + u.y * hi * k })
        ctx.strokeStyle = alpha(p.line, k)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        const steps = Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 10)
        for (let n = 1; n < steps; n++) {
          const x = a.x + ((b.x - a.x) * n) / steps
          const y = a.y + ((b.y - a.y) * n) / steps
          ctx.moveTo(x, y)
          ctx.lineTo(x + toward.x * 5, y + toward.y * 5)
        }
        ctx.stroke()
      }
      const on = clamp((e - starts[i]) / 0.3) * fade
      if (on <= 0) return
      const pp = at(P)
      const qq = at(Q)
      const reach = ease((e - starts[i] - 0.2) / 0.4)
      const gap = Math.hypot(pp.x - qq.x, pp.y - qq.y)
      const end = { x: qq.x + (pp.x - qq.x) * reach * (1 - 7 / gap), y: qq.y + (pp.y - qq.y) * reach * (1 - 7 / gap) }
      ctx.strokeStyle = alpha(p.glow, 0.75 * on)
      if (reach > 0) arrow(ctx, { x: qq.x + (pp.x - qq.x) * (6 / gap), y: qq.y + (pp.y - qq.y) * (6 / gap) }, end, 5)
      ctx.globalAlpha = on
      ctx.fillStyle = p.bright
      ctx.beginPath()
      ctx.arc(pp.x, pp.y, 3.2, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = p.dim
      ctx.beginPath()
      ctx.arc(qq.x, qq.y, 3.2, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Stars, dimmed for every pair they fail.
    const context = new Set(pairs.flatMap(({ pos, neg }) => [pos, neg]))
    const shown = pairs.map((_, i) => clamp((e - starts[i] - 0.7) / 0.4))
    stars.forEach((star, i) => {
      if (context.has(i)) return
      let a = 0.85 * clamp(e / 0.4)
      pairs.forEach(({ pos, neg }, n) => {
        if (d2(star, stars[pos]) >= d2(star, stars[neg])) a *= 1 - 0.5 * shown[n]
      })
      const { x, y } = at(star)
      ctx.globalAlpha = a * fade
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, TAU)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Labels, placed clear of the marks, the push arrow and each other: the top 3 results first, then the
    // pair signs, each pushed away from the target. A sign with no free spot is left out.
    const T = at(target)
    const centroid = results.reduce((sum, i) => ({ x: sum.x + stars[i].x / TOP, y: sum.y + stars[i].y / TOP }), { x: 0, y: 0 })
    const pushEnd = at(centroid)
    const taken: Box[] = [markBox(T.x, T.y, 14), { x: 16, y: h - 44, w: 340, h: 32 }]
    for (const i of [...context, ...results]) {
      const { x, y } = at(stars[i])
      taken.push(markBox(x, y, 7))
    }
    const pushLength = Math.hypot(pushEnd.x - T.x, pushEnd.y - T.y)
    for (let d = 0; d < pushLength; d += 10)
      taken.push(markBox(T.x + ((pushEnd.x - T.x) * d) / pushLength, T.y + ((pushEnd.y - T.y) * d) / pushLength, 4))
    const away = (q: Pt) => ({ x: q.x - T.x || 1, y: q.y - T.y })
    const resultLabels = results.slice(0, 3).map((i) => {
      const q = at(stars[i])
      const parts: [string, string][] = [
        [s.names[i], p.star],
        [`${(s.run.rank[i] + PAIRS) / 2}/${PAIRS}`, p.label],
        [Math.sqrt(d2(stars[i], target)).toFixed(3), p.label],
      ]
      const width = textWidth(ctx, p, parts.map(([text]) => text).join("  "))
      return { parts, spot: placeLabel(taken, q.x, q.y, width, { w, h }, away(q)) }
    })
    pairs.forEach(({ pos, neg }, i) => {
      const on = clamp((e - starts[i]) / 0.3) * fade
      for (const [index, text, color] of [
        [pos, `+${i + 1}`, p.star],
        [neg, `-${i + 1}`, p.label],
      ] as const) {
        const q = at(stars[index])
        const spot = placeLabel(taken, q.x, q.y, textWidth(ctx, p, text), { w, h }, away(q))
        if (spot && on > 0) label(ctx, p, text, spot.x, spot.y, { color, align: spot.align, opacity: on })
      }
    })

    // The plain nearest neighbors, dashed; then the results and the push.
    const plainOn = clamp((e - 5.2) / 0.4) * fade
    ctx.strokeStyle = alpha(p.dim, plainOn)
    ctx.setLineDash([2, 2])
    for (const i of plain) {
      if (results.includes(i)) continue
      const { x, y } = at(stars[i])
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, TAU)
      ctx.stroke()
    }
    ctx.setLineDash([])
    results.forEach((i, r) => {
      const on = clamp((e - 5.6 - r * 0.15) / 0.3) * fade
      if (on <= 0) return
      const { x, y } = at(stars[i])
      ctx.strokeStyle = alpha(p.glow, 0.6 * on)
      ctx.beginPath()
      ctx.moveTo(T.x, T.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.globalAlpha = on
      ctx.fillStyle = p.bright
      ctx.beginPath()
      ctx.arc(x, y, 2.6, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, TAU)
      ctx.stroke()
      ctx.globalAlpha = 1
      const named = resultLabels[r]
      if (named?.spot) labelRow(ctx, p, named.parts, named.spot.x, named.spot.y, { align: named.spot.align, opacity: on })
    })
    const pushOn = clamp((e - 6.6) / 0.5) * fade
    if (pushOn > 0) {
      const end = pushEnd
      const k = ease((e - 6.6) / 0.5)
      ctx.strokeStyle = alpha(p.bright, pushOn)
      ctx.lineWidth = 1.5
      arrow(ctx, T, { x: T.x + (end.x - T.x) * k, y: T.y + (end.y - T.y) * k }, 7)
      ctx.lineWidth = 1
    }
    crosshair(ctx, p, T.x, T.y, clamp((e - 0.3) / 0.3) * fade)

    readout(
      ctx,
      p,
      [`PAIRS ${PAIRS}`, [`ZONE ${s.run.inZone}`, p.label], `TOP ${s.names[results[0]]}`],
      24,
      h - 28,
      { opacity: clamp((e - 6.8) / 0.3) * fade }
    )
  },
}

export function Discovery() {
  return <SceneCanvas scene={scene} />
}
