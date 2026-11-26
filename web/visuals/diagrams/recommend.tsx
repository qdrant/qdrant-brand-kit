"use client"

import { clamp, ease, rng } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import {
  TAU,
  arrow,
  crosshair,
  gauss,
  ids,
  labelRow,
  markBox,
  nearest,
  placeLabel,
  prefersStill,
  type Box,
  type Pt,
} from "./lib"

// Recommendations with the Query API's recommend query and its default strategy, average_vector: the target
// is avg(positive) + (avg(positive) - avg(negative)), then an ordinary nearest-neighbor search runs from it,
// leaving out the examples. Three liked items and two disliked ones are picked each cycle; the averages, the
// push away from the disliked ones and the top 5 are computed for real, in this 2D space with Euclidean
// distance, which is the score the list shows.

const CYCLE = 11
const TOP = 5
const AR = 1.5
const CLUSTERS: Pt[] = [
  { x: 0.3, y: 0.3 },
  { x: 0.75, y: 0.68 },
  { x: 1.18, y: 0.32 },
  { x: 0.42, y: 0.78 },
  { x: 1.2, y: 0.8 },
]

type Plan = {
  positive: number[]
  negative: number[]
  avgP: Pt
  avgN: Pt
  target: Pt
  hits: { i: number; d: number }[]
}
type State = {
  w: number
  h: number
  p: Palette
  points: Pt[]
  cluster: number[]
  names: string[]
  cycle: number
  plan: Plan
  still: boolean
}

const mean = (pts: Pt[]) => ({
  x: pts.reduce((sum, q) => sum + q.x, 0) / pts.length,
  y: pts.reduce((sum, q) => sum + q.y, 0) / pts.length,
})
const d2 = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

function plan(points: Pt[], cluster: number[], cycle: number): Plan {
  const rand = rng(900 + cycle * 17)
  const pick = (c: number, n: number) => {
    const members = points.map((_, i) => i).filter((i) => cluster[i] === c)
    const out: number[] = []
    while (out.length < n) {
      const i = members[Math.floor(rand() * members.length)]!
      if (!out.includes(i)) out.push(i)
    }
    return out
  }
  let best: Plan | null = null
  let bestScore = -Infinity
  for (let attempt = 0; attempt < 40; attempt++) {
    const cp = Math.floor(rand() * CLUSTERS.length)
    let cn = Math.floor(rand() * (CLUSTERS.length - 1))
    if (cn >= cp) cn += 1
    const positive = pick(cp, 3)
    const negative = pick(cn, 2)
    const apart = (list: number[]) =>
      list.every((i, a) =>
        list.every((j, b) => a >= b || d2(points[i]!, points[j]!) > 0.07)
      )
    const avgP = mean(positive.map((i) => points[i]!))
    const avgN = mean(negative.map((i) => points[i]!))
    const target = { x: 2 * avgP.x - avgN.x, y: 2 * avgP.y - avgN.y }
    const examples = new Set([...positive, ...negative])
    const hits = nearest(
      points,
      (q) => d2(q, target),
      TOP,
      (i) => examples.has(i)
    )
    const inside =
      target.x > 0.16 &&
      target.x < AR - 0.16 &&
      target.y > 0.16 &&
      target.y < 0.84
    const push = d2(avgP, avgN)
    // A target inside the space, with its neighbors close by, after a push long enough to see.
    const score =
      (inside ? 10 : 0) +
      (apart(positive) && apart(negative) ? 4 : 0) -
      (hits[TOP - 1]?.d ?? 1) * 8 -
      Math.abs(push - 0.5) * 4
    if (score > bestScore) {
      bestScore = score
      best = { positive, negative, avgP, avgN, target, hits }
    }
  }
  return best!
}

// A + or a - over an example.
function sign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  plus: boolean
) {
  ctx.beginPath()
  ctx.moveTo(x - 5, y)
  ctx.lineTo(x + 5, y)
  if (plus) {
    ctx.moveTo(x, y - 5)
    ctx.lineTo(x, y + 5)
  }
  ctx.stroke()
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(77)
    const points: Pt[] = []
    const cluster: number[] = []
    CLUSTERS.forEach((c, n) => {
      for (let i = 0; i < 15; i++) {
        points.push({
          x: c.x + gauss(rand) * 0.07,
          y: c.y + gauss(rand) * 0.07,
        })
        cluster.push(n)
      }
    })
    for (let i = 0; i < 34; i++) {
      points.push({ x: 0.04 + rand() * (AR - 0.08), y: 0.04 + rand() * 0.92 })
      cluster.push(-1)
    }
    return {
      w,
      h,
      p,
      points,
      cluster,
      names: ids(points.length, rand),
      cycle: 0,
      plan: plan(points, cluster, 0),
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.plan = plan(s.points, s.cluster, cycle)
    }
    const e = s.still ? 8 : t % CYCLE
    const fade = 1 - clamp((e - (CYCLE - 1.2)) / 1)
    const at = (start: number, length = 0.4) =>
      ease((e - start) / length) * fade
    const { positive, negative, avgP, avgN, target, hits } = s.plan
    const wide = w >= 520

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The space, right of the list on wide frames.
    const m = wide ? 24 : 10
    const LW = 176
    const field: Box = wide
      ? { x: m + LW + 24, y: 24, w: w - 2 * m - LW - 24, h: h - 48 }
      : { x: m, y: 24, w: w - 2 * m, h: h - 28 }
    const inset = wide ? 24 : 8
    const scale = Math.min((field.w - inset) / AR, field.h - inset)
    const ox = field.x + (field.w - AR * scale) / 2
    const oy = field.y + (field.h - scale) / 2
    const px = (q: Pt): Pt => ({ x: ox + q.x * scale, y: oy + q.y * scale })

    ctx.strokeStyle = p.grid
    ctx.beginPath()
    for (let gx = 0; gx <= AR + 1e-6; gx += 0.25) {
      ctx.moveTo(Math.round(ox + gx * scale) + 0.5, oy)
      ctx.lineTo(Math.round(ox + gx * scale) + 0.5, oy + scale)
    }
    for (let gy = 0; gy <= 1 + 1e-6; gy += 0.25) {
      ctx.moveTo(ox, Math.round(oy + gy * scale) + 0.5)
      ctx.lineTo(ox + AR * scale, Math.round(oy + gy * scale) + 0.5)
    }
    ctx.stroke()

    const posOn = positive.map((_, r) => at(0.3 + r * 0.3, 0.3))
    const negOn = negative.map((_, r) => at(1.3 + r * 0.3, 0.3))
    const hitOn = hits.map((_, r) => at(4.1 + r * 0.3, 0.3))
    const examples = new Set([...positive, ...negative])
    const rankOf = new Map(hits.map(({ i }, r) => [i, r]))

    // Items: the examples are drawn as signs, the recommendations light up.
    s.points.forEach((q, i) => {
      if (examples.has(i)) return
      const { x, y } = px(q)
      const r = rankOf.get(i)
      const lit = r === undefined ? 0 : hitOn[r]!
      ctx.globalAlpha = 0.75 + 0.25 * lit
      ctx.fillStyle = lit > 0 ? p.bright : p.star
      ctx.beginPath()
      ctx.arc(x, y, 1.6 + lit * 0.6, 0, TAU)
      ctx.fill()
    })
    ctx.globalAlpha = 1
    const exampleDot = (i: number, k: number) => {
      const { x, y } = px(s.points[i]!)
      ctx.globalAlpha = 0.75 * (1 - k)
      ctx.fillStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 1.6, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
    }
    positive.forEach((i, r) => exampleDot(i, posOn[r]!))
    negative.forEach((i, r) => exampleDot(i, negOn[r]!))

    // The averages: dashed lines from the examples to each.
    const P = px(avgP)
    const N = px(avgN)
    const T = px(target)
    const avg = at(2.1, 0.5)
    if (avg > 0) {
      ctx.setLineDash([2, 3])
      ctx.strokeStyle = alpha(p.label, 0.7 * avg)
      ctx.beginPath()
      for (const [list, c] of [
        [positive, P],
        [negative, N],
      ] as const)
        for (const i of list) {
          const q = px(s.points[i]!)
          ctx.moveTo(q.x, q.y)
          ctx.lineTo(c.x, c.y)
        }
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = avg
      ctx.strokeStyle = p.star
      ctx.strokeRect(Math.round(P.x) - 3.5, Math.round(P.y) - 3.5, 7, 7)
      ctx.strokeStyle = p.label
      ctx.strokeRect(Math.round(N.x) - 3.5, Math.round(N.y) - 3.5, 7, 7)
      ctx.globalAlpha = 1
    }

    // The push: from avg(-) through avg(+), the same length again, to the target.
    const push = at(2.9, 0.7)
    if (push > 0) {
      ctx.setLineDash([2, 3])
      ctx.strokeStyle = alpha(p.glow, 0.7 * fade)
      ctx.beginPath()
      ctx.moveTo(N.x, N.y)
      ctx.lineTo(
        N.x + (P.x - N.x) * Math.min(1, push * 2),
        N.y + (P.y - N.y) * Math.min(1, push * 2)
      )
      ctx.stroke()
      ctx.setLineDash([])
      const k = clamp(push * 2 - 1)
      if (k > 0) {
        ctx.strokeStyle = alpha(p.bright, 0.9 * fade)
        arrow(ctx, P, { x: P.x + (T.x - P.x) * k, y: P.y + (T.y - P.y) * k })
      }
    }

    // The search from the target: its nearest items that aren't examples.
    hits.forEach(({ i }, r) => {
      const k = hitOn[r]!
      if (k <= 0) return
      const q = px(s.points[i]!)
      ctx.strokeStyle = alpha(
        r === 0 ? p.bright : p.glow,
        (r === 0 ? 0.9 : 0.6) * k
      )
      ctx.beginPath()
      ctx.moveTo(T.x, T.y)
      ctx.lineTo(T.x + (q.x - T.x) * k, T.y + (q.y - T.y) * k)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(q.x, q.y, 5, 0, TAU)
      ctx.stroke()
    })
    crosshair(ctx, p, T.x, T.y, at(3.7, 0.3))

    // The examples' signs, over the lines.
    ctx.lineWidth = 1.5
    positive.forEach((i, r) => {
      const q = px(s.points[i]!)
      ctx.strokeStyle = alpha(p.star, posOn[r]!)
      sign(ctx, q.x, q.y, true)
    })
    negative.forEach((i, r) => {
      const q = px(s.points[i]!)
      ctx.strokeStyle = alpha(p.label, negOn[r]!)
      sign(ctx, q.x, q.y, false)
    })
    ctx.lineWidth = 1

    // Labels, kept clear of the marks and of each other.
    const taken: Box[] = [
      ...[...positive, ...negative, ...hits.map(({ i }) => i)].map((i) => {
        const q = px(s.points[i]!)
        return markBox(q.x, q.y, 7)
      }),
      markBox(T.x, T.y, 12),
      markBox(P.x, P.y, 5),
      markBox(N.x, N.y, 5),
    ]
    const frame = { w, h }
    const tag = (
      text: string,
      mark: Pt,
      away: Pt,
      color: string,
      opacity: number
    ) => {
      if (opacity <= 0) return
      const spot = placeLabel(
        taken,
        mark.x,
        mark.y,
        text.length * 7.4,
        frame,
        away
      )
      if (spot)
        labelRow(ctx, p, [[text, color]], spot.x, spot.y, {
          align: spot.align,
          opacity,
        })
    }
    const awayFrom = (a: Pt, b: Pt) => ({
      x: a.x - b.x || 1,
      y: a.y - b.y || -1,
    })
    hits.forEach(({ i }, r) => {
      const q = px(s.points[i]!)
      tag(
        String(r + 1),
        q,
        awayFrom(q, T),
        r === 0 ? p.star : p.label,
        hitOn[r]!
      )
    })
    tag("AVG +", P, awayFrom(P, N), p.star, posOn[positive.length - 1]!)
    tag("AVG −", N, awayFrom(N, P), p.label, negOn[negative.length - 1]!)

    if (!wide) {
      labelRow(
        ctx,
        p,
        [
          ["RECOMMEND", p.star],
          ["AVERAGE_VECTOR", p.label],
        ],
        m,
        14
      )
      return
    }

    // The list: the query's strategy and examples, then the top 5.
    let y = 40
    ctx.strokeStyle = p.line
    labelRow(ctx, p, [["RECOMMEND", p.star]], m, y)
    ctx.beginPath()
    ctx.moveTo(m, y + 12.5)
    ctx.lineTo(m + LW, y + 12.5)
    ctx.stroke()
    y += 30
    labelRow(ctx, p, [["STRATEGY", p.label]], m, y)
    y += 20
    labelRow(ctx, p, [["AVERAGE_VECTOR", p.star]], m, y)
    y += 30
    positive.forEach((i, r) => {
      labelRow(
        ctx,
        p,
        [
          ["+", p.star],
          [s.names[i]!, p.star],
          ["LIKED", p.label],
        ],
        m,
        y,
        { opacity: posOn[r] }
      )
      y += 20
    })
    negative.forEach((i, r) => {
      labelRow(
        ctx,
        p,
        [
          ["-", p.label],
          [s.names[i]!, p.label],
          ["DISLIKED", p.label],
        ],
        m,
        y,
        { opacity: negOn[r] }
      )
      y += 20
    })
    y += 18
    labelRow(
      ctx,
      p,
      [
        [`TOP ${TOP}`, p.star],
        ["EUCLID", p.label],
      ],
      m,
      y
    )
    ctx.beginPath()
    ctx.moveTo(m, y + 12.5)
    ctx.lineTo(m + LW, y + 12.5)
    ctx.stroke()
    y += 30
    hits.forEach(({ i, d }, r) => {
      const on = hitOn[r]!
      if (on <= 0) return
      if (r === 0) {
        ctx.globalAlpha = on
        ctx.fillStyle = p.accent
        ctx.fillRect(m + 16, y - 2, 5, 5)
        ctx.globalAlpha = 1
      }
      labelRow(ctx, p, [[String(r + 1), p.label]], m, y, { opacity: on })
      labelRow(ctx, p, [[s.names[i]!, r === 0 ? p.star : p.label]], m + 29, y, {
        opacity: on,
      })
      labelRow(ctx, p, [[d.toFixed(3), p.label]], m + LW, y, {
        opacity: on,
        align: "right",
      })
      y += 20
    })
  },
}

export function Recommend() {
  return <SceneCanvas scene={scene} />
}
