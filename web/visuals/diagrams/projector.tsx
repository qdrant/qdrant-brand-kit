"use client"

import { clamp, rng } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  label,
  type CanvasScene,
  type Palette,
} from "../scene"
import {
  TAU,
  crosshair,
  dist3,
  gauss,
  ids,
  nearest,
  prefersStill,
  project,
  readout,
  turn,
  type V3,
} from "./lib"

// Embedding projector: a 3D cloud of 280 points in five clusters over a floor grid, turning slowly in
// perspective. Every few seconds a query appears beside one cluster; its 6 nearest neighbors, computed in
// 3D, connect to it in rank order, and the ranked list reads out on the left.

const CLUSTERS = 5
const PER = 56
const K = 6
const CYCLE = 6.5
const QUERIES = 8
const FLOOR = -0.9
const HALF = 0.85

type Search = { q: V3; hits: { i: number; d: number }[] }
type State = {
  w: number
  h: number
  p: Palette
  points: V3[]
  centers: V3[]
  names: string[]
  searches: Search[]
  still: boolean
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(41)
    // Cluster centers on spread-out directions, so the clusters stay apart.
    const centers: V3[] = Array.from({ length: CLUSTERS }, (_, c) => {
      const y = 0.8 - (c / (CLUSTERS - 1)) * 1.6
      const r = Math.sqrt(1 - y * y)
      const a = c * 2.4 + 0.6
      return [Math.cos(a) * r * 0.62, y * 0.55, Math.sin(a) * r * 0.62]
    })
    const points: V3[] = []
    centers.forEach((c, n) => {
      const spread = 0.09 + 0.05 * (n % 2)
      for (let i = 0; i < PER; i++)
        points.push([
          c[0] + gauss(rand) * spread,
          c[1] + gauss(rand) * spread,
          c[2] + gauss(rand) * spread,
        ])
    })
    const searches = Array.from({ length: QUERIES }, (_, n) => {
      const c = centers[(n * 2) % CLUSTERS]!
      const q: V3 = [
        c[0] + gauss(rand) * 0.1,
        c[1] + gauss(rand) * 0.1,
        c[2] + gauss(rand) * 0.1,
      ]
      return { q, hits: nearest(points, (v) => dist3(v, q), K) }
    })
    return {
      w,
      h,
      p,
      points,
      centers,
      names: ids(points.length, rand),
      searches,
      still: prefersStill(),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const time = s.still ? CYCLE * 0.62 : t
    const yaw = time * 0.16 + 0.4
    const pitch = 0.42
    const scale = Math.min(w * 0.26, h * 0.3)
    const cx = w >= 560 ? w * 0.58 : w * 0.5
    const cy = h * 0.46
    const at = (v: V3) => project(turn(v, yaw, pitch), cx, cy, scale, 4.5)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The floor: a grid under the cloud, and its edge.
    ctx.strokeStyle = p.grid
    ctx.beginPath()
    for (let i = 1; i < 6; i++) {
      const f = -HALF + (i / 6) * HALF * 2
      for (const [a, b] of [
        [at([f, FLOOR, -HALF]), at([f, FLOOR, HALF])],
        [at([-HALF, FLOOR, f]), at([HALF, FLOOR, f])],
      ]) {
        if (!a || !b) continue
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
    }
    ctx.stroke()
    const corners = [
      at([-HALF, FLOOR, -HALF]),
      at([HALF, FLOOR, -HALF]),
      at([HALF, FLOOR, HALF]),
      at([-HALF, FLOOR, HALF]),
    ]
    ctx.strokeStyle = p.line
    ctx.beginPath()
    corners.forEach(({ x, y }, i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.stroke()

    // Axes from the origin.
    const origin = at([0, 0, 0])
    ctx.strokeStyle = alpha(p.line, 0.7)
    ctx.beginPath()
    for (const [v, name] of [
      [[0.7, 0, 0], "X"],
      [[0, 0.7, 0], "Y"],
      [[0, 0, 0.7], "Z"],
    ] as const) {
      const end = at(v as V3)
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(end.x, end.y)
      label(ctx, p, name, end.x + 6, end.y - 6, { opacity: 0.8 })
    }
    ctx.stroke()

    // The search on this cycle.
    const n = Math.floor(time / CYCLE)
    const u = (time % CYCLE) / CYCLE
    const search = s.searches[n % QUERIES]!
    const out = clamp((1 - u) / 0.08)
    const show = clamp(u / 0.06) * out
    const on = search.hits.map(
      (_, rank) => clamp((u - 0.1 - rank * 0.05) / 0.04) * out
    )
    const rankOf = new Map(search.hits.map(({ i }, rank) => [i, rank]))

    // Points, back to front: nearer ones larger and brighter.
    const projected = s.points
      .map((v, i) => ({ ...at(v), i }))
      .sort((a, b) => a.z - b.z)
    for (const { x, y, z, k, i } of projected) {
      const rank = rankOf.get(i)
      const lit = rank === undefined ? 0 : on[rank]!
      ctx.globalAlpha = Math.min(1, 0.25 + 0.75 * clamp((z + 1) / 2) + lit)
      ctx.fillStyle = lit > 0 ? p.bright : p.star
      ctx.beginPath()
      ctx.arc(x, y, 1.1 * k + lit * 0.9, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Cluster labels, above each cluster.
    s.centers.forEach((c, i) => {
      const { x, y } = at(c)
      label(ctx, p, `C${i + 1}`, x, y - scale * 0.32, {
        align: "center",
        opacity: 0.55,
      })
    })

    // The query: a stem to the floor, lines to its neighbors, and the crosshair.
    if (show > 0) {
      const q = at(search.q)
      const foot = at([search.q[0], FLOOR, search.q[2]])
      ctx.globalAlpha = show
      ctx.strokeStyle = p.line
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.moveTo(q.x, q.y)
      ctx.lineTo(foot.x, foot.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(foot.x - 4, foot.y)
      ctx.lineTo(foot.x + 4, foot.y)
      ctx.stroke()
      ctx.globalAlpha = 1
      search.hits.forEach(({ i }, rank) => {
        if (on[rank]! <= 0) return
        const hit = at(s.points[i]!)
        ctx.globalAlpha = on[rank]!
        ctx.strokeStyle = p.glow
        ctx.beginPath()
        ctx.moveTo(q.x, q.y)
        ctx.lineTo(hit.x, hit.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(hit.x, hit.y, 5, 0, TAU)
        ctx.stroke()
        ctx.globalAlpha = 1
        label(ctx, p, String(rank + 1), hit.x + 8, hit.y - 8, {
          opacity: on[rank]! * 0.9,
        })
      })
      crosshair(ctx, p, q.x, q.y, show)
    }

    // The ranked list, top left.
    if (w >= 560) {
      const [qx, qy, qz] = search.q
      label(
        ctx,
        p,
        `QUERY  ${qx.toFixed(2)}  ${qy.toFixed(2)}  ${qz.toFixed(2)}`,
        24,
        32,
        {
          color: p.star,
          opacity: show,
        }
      )
      search.hits.forEach(({ i, d }, rank) =>
        label(
          ctx,
          p,
          `${rank + 1}  ${s.names[i]}  ${d.toFixed(3)}`,
          24,
          58 + rank * 18,
          {
            color: rank === 0 ? p.star : p.label,
            opacity: on[rank],
          }
        )
      )
    }
    readout(
      ctx,
      p,
      [`KNN ${K} / ${s.points.length}`, ["L2  DIM 3", p.label]],
      24,
      h - 28
    )
  },
}

export function Projector() {
  return <SceneCanvas scene={scene} />
}
