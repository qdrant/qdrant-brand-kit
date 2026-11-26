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
  crosshair,
  gauss,
  ids,
  labelRow,
  nearest,
  prefersStill,
  readout,
  type Box,
  type Pt,
} from "./lib"
import { cycleTime, panel } from "./edge-lib"

// Filter and facet on payload with Qdrant Edge (qdrant.tech/edge, "Filter And Facet On Payload"; the EdgeShard's
// query with a filter and its facet with a FacetRequest, qdrant.tech/documentation/edge/edge-quickstart): every
// point is stored with a payload, here a "class" of a, b, c or d, drawn as its shape. Points arrive and the facet
// counts per class follow live; then a filter keeps class b, and a query finds its nearest points among those only,
// the best in amaranth. The classes, counts, ids and scores are example data; the counts and the nearest points
// are computed for real.

const CYCLE = 12
const CLASSES = ["a", "b", "c", "d"] as const
const START = 72
const ARRIVALS = 12
const FIRST = 0.4
const EVERY = 0.3
const FILTER_AT = 4.8
const QUERY_AT = 6.2
const TOP = 3
const KEEP = 1
// A payload chip follows these arrivals.
const SHOWN = [2, 6, 10]

type Item = Pt & { c: number }

// The points' box and the facet column, for a size; the points fill the box at its own shape.
function layout(w: number, h: number) {
  const wide = w >= 520
  const m = wide ? 24 : 12
  const gap = wide ? 24 : 12
  const top = wide ? 52 : 36
  const field: Box = {
    x: m,
    y: top,
    w: (w - 2 * m - gap) * (wide ? 0.58 : 0.56),
    h: h - top - m,
  }
  const col = {
    x: field.x + field.w + gap,
    w: w - m - (field.x + field.w + gap),
  }
  const ar = Math.max(0.6, (field.w - 24) / Math.max(1, field.h - 24))
  return { wide, m, top, field, col, ar }
}
type State = {
  w: number
  h: number
  p: Palette
  ar: number
  still: boolean
  items: Item[]
  names: string[]
  query: Pt
  hits: { i: number; d: number }[]
}

// A point's shape by its class: circle, square, triangle, diamond.
function glyph(
  ctx: CanvasRenderingContext2D,
  c: number,
  x: number,
  y: number,
  r: number
) {
  ctx.beginPath()
  if (c === 0) ctx.arc(x, y, r, 0, TAU)
  else if (c === 1) ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7)
  else if (c === 2) {
    ctx.moveTo(x, y - r * 1.1)
    ctx.lineTo(x + r, y + r * 0.75)
    ctx.lineTo(x - r, y + r * 0.75)
    ctx.closePath()
  } else {
    ctx.moveTo(x, y - r * 1.15)
    ctx.lineTo(x + r * 1.05, y)
    ctx.lineTo(x, y + r * 1.15)
    ctx.lineTo(x - r * 1.05, y)
    ctx.closePath()
  }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(331)
    const { ar } = layout(w, h)
    // The clusters were placed for a 1.4 : 1 box; they stretch to this one.
    const sx = ar / 1.4
    const centers: Pt[][] = [
      [
        { x: 0.3, y: 0.3 },
        { x: 1.05, y: 0.72 },
      ],
      [
        { x: 0.75, y: 0.35 },
        { x: 0.4, y: 0.75 },
      ],
      [
        { x: 1.12, y: 0.28 },
        { x: 0.7, y: 0.66 },
      ],
      [
        { x: 0.2, y: 0.58 },
        { x: 1.2, y: 0.5 },
      ],
    ]
    // Unequal shares, so the facet counts differ.
    const weights = [0.34, 0.27, 0.24, 0.15]
    const items: Item[] = []
    for (let i = 0; i < START + ARRIVALS; i++) {
      let r = rand()
      let c = 0
      while (c < 3 && r > weights[c]!) r -= weights[c++]!
      const center = centers[c]![Math.floor(rand() * 2)]!
      items.push({
        x: clamp(
          center.x * sx + gauss(rand) * 0.12 * Math.min(1, sx * 1.2),
          0.05,
          ar - 0.05
        ),
        y: clamp(center.y + gauss(rand) * 0.1, 0.06, 0.94),
        c,
      })
    }
    const query = { x: 0.58 * sx, y: 0.52 }
    const hits = nearest(
      items,
      (q) => Math.hypot(q.x - query.x, q.y - query.y),
      TOP,
      (i) => items[i]!.c !== KEEP
    )
    return {
      w,
      h,
      p,
      ar,
      still: prefersStill(),
      items,
      names: ids(items.length, rand),
      query,
      hits,
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const { e, fade } = cycleTime(t, CYCLE, s.still)
    const { wide, m, top, field, col } = layout(w, h)

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Which points are in so far: the first START, then the arrivals one by one. As the cycle fades, the arrivals
    // fade with it and the next cycle adds them again.
    const arrived = s.still
      ? ARRIVALS
      : Math.max(0, Math.min(ARRIVALS, Math.floor((e - FIRST) / EVERY) + 1))
    const present = START + arrived
    const counts = CLASSES.map(
      (_, c) => s.items.slice(0, present).filter((q) => q.c === c).length
    )
    const finals = CLASSES.map(
      (_, c) => s.items.filter((q) => q.c === c).length
    )
    const most = Math.max(...finals)

    // Header.
    labelRow(
      ctx,
      p,
      [
        ["EDGE SHARD", p.label],
        [`${present} POINTS`, p.star],
      ],
      m,
      wide ? 24 : 16
    )

    // The points, by class.
    panel(ctx, p, field, { fill: null, stroke: p.grid })
    const scale = Math.min((field.w - 24) / s.ar, field.h - 24)
    const ox = field.x + (field.w - s.ar * scale) / 2
    const oy = field.y + (field.h - scale) / 2
    const at = (q: Pt): Pt => ({ x: ox + q.x * scale, y: oy + q.y * scale })
    const filter = ease((e - FILTER_AT) / 0.6) * fade
    const r = wide ? 3 : 2.4
    s.items.slice(0, present).forEach((q, i) => {
      const { x, y } = at(q)
      const arrival = i - START
      const pop =
        arrival >= 0 ? ease((e - FIRST - arrival * EVERY) / 0.25) * fade : 1
      const kept = q.c === KEEP
      ctx.globalAlpha =
        pop * (kept ? 0.75 + 0.25 * filter : 0.75 - 0.55 * filter)
      ctx.fillStyle = kept && filter > 0.5 ? p.bright : p.star
      glyph(ctx, q.c, x, y, r)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // The payload stored with a few of the arrivals.
    if (wide)
      for (const n of SHOWN) {
        const local = e - FIRST - n * EVERY
        const show = ease(local / 0.25) * (1 - ease((local - 1) / 0.3)) * fade
        if (show <= 0) continue
        const q = at(s.items[START + n]!)
        const right = q.x < field.x + field.w - 120
        readout(
          ctx,
          p,
          [["class:", p.label], CLASSES[s.items[START + n]!.c]!],
          right ? q.x + 12 : q.x - 12,
          q.y - 16,
          {
            opacity: show,
            align: right ? "left" : "right",
          }
        )
      }

    // The query, among class b only.
    const query = ease((e - QUERY_AT) / 0.5) * fade
    if (query > 0) {
      const q = at(s.query)
      ctx.save()
      ctx.globalAlpha = query
      ctx.strokeStyle = alpha(p.glow, 0.8)
      ctx.beginPath()
      for (const { i } of s.hits) {
        const b = at(s.items[i]!)
        ctx.moveTo(q.x, q.y)
        ctx.lineTo(b.x, b.y)
      }
      ctx.stroke()
      const best = at(s.items[s.hits[0]!.i]!)
      ctx.strokeStyle = p.accent
      ctx.beginPath()
      ctx.arc(best.x, best.y, 7, 0, TAU)
      ctx.stroke()
      ctx.restore()
      crosshair(ctx, p, q.x, q.y, query)
    }

    // The filter.
    let y = top + 8
    labelRow(ctx, p, [["FILTER", p.label]], col.x, y)
    y += wide ? 26 : 22
    readout(ctx, p, [["MATCH", p.label], `class: ${CLASSES[KEEP]}`], col.x, y, {
      opacity: 0.3 + 0.7 * filter,
    })

    // The facet: live counts per class.
    y += wide ? 40 : 30
    labelRow(
      ctx,
      p,
      [
        ["FACET", p.label],
        ["class", p.star],
      ],
      col.x,
      y
    )
    y += wide ? 24 : 20
    const row = wide ? 26 : 20
    const barX = col.x + (wide ? 48 : 40)
    const countW = wide ? 32 : 24
    const barW = Math.max(16, col.w - (barX - col.x) - countW - 8)
    CLASSES.forEach((name, c) => {
      const ry = y + c * row
      const kept = c === KEEP
      const strong = kept ? 1 : 1 - 0.55 * filter
      ctx.save()
      ctx.globalAlpha = strong
      ctx.fillStyle = kept && filter > 0.5 ? p.bright : p.star
      glyph(ctx, c, col.x + 5, ry, r)
      ctx.fill()
      ctx.restore()
      labelRow(ctx, p, [[name, p.star]], col.x + 18, ry, { opacity: strong })
      ctx.fillStyle = p.grid
      ctx.fillRect(barX, ry - 2, barW, 4)
      ctx.fillStyle = kept && filter > 0 ? p.glow : alpha(p.dim, 0.9)
      ctx.fillRect(barX, ry - 2, (barW * counts[c]!) / most, 4)
      labelRow(ctx, p, [[String(counts[c]), p.star]], col.x + col.w, ry, {
        align: "right",
        opacity: strong,
      })
    })

    // The query's results, best first (wide only).
    if (!wide) return
    y += row * CLASSES.length + 22
    labelRow(
      ctx,
      p,
      [
        ["QUERY", p.label],
        [`LIMIT ${TOP}`, p.star],
      ],
      col.x,
      y
    )
    y += 28
    s.hits.forEach(({ i, d }, k) => {
      const show = ease((e - QUERY_AT - 0.3 - k * 0.2) / 0.4) * fade
      if (show <= 0) return
      readout(
        ctx,
        p,
        [
          s.names[i]!,
          [`class: ${CLASSES[KEEP]}`, p.label],
          [(1 - d).toFixed(3), p.label],
        ],
        col.x,
        y + k * 30,
        { opacity: show, mark: k === 0 ? p.accent : p.glow }
      )
    })
  },
}

export function EdgeFacet() {
  return <SceneCanvas scene={scene} />
}
