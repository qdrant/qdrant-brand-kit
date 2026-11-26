"use client"

import { ease, rng } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import {
  ids,
  labelRow,
  prefersStill,
  readout,
  textWidth,
  type Box,
} from "./lib"
import {
  boundary,
  brackets,
  cycleTime,
  panel,
  thumbStroke,
  travel,
  within,
} from "./edge-lib"

// Edge Visual Search (qdrant.tech/edge, the demos): a camera flies over a town, drawn as a map of blocks and
// fields; every frame is indexed in the Edge Shard on site, a search there returns the matching frames, and each
// frame also goes to headquarters, where its record builds up: a server collection kept up to date from the device
// (the dual write in qdrant.tech/documentation/edge/edge-data-synchronization-patterns). The map, the frame ids and
// the scores are illustrative.

const CYCLE = 12
const FIRST = 0.5
const EVERY = 0.85
const FRAMES = 7
const SEARCH_AT = 6.6
const MAP_W = 6
const MAP_H = 1.5
const CELL = 0.3
// Where the matching frames are on the map, best first (x, y of a crop's top left, in map units).
const MATCHES = [
  { x: 2.1, y: 0.35 },
  { x: 4.3, y: 0.7 },
  { x: 0.8, y: 0.5 },
]
const SCORES = [0.91, 0.87, 0.84]

type Block = {
  x: number
  y: number
  w: number
  h: number
  field: boolean
  houses: Box[]
}
type State = {
  w: number
  h: number
  p: Palette
  still: boolean
  blocks: Block[]
  names: string[]
}

// The map, seen through a box: `ox, oy` is the view's top left in map units, `scale` px per unit.
function map(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  s: State,
  b: Box,
  ox: number,
  oy: number,
  scale: number
) {
  within(ctx, b, () => {
    const X = (x: number) => b.x + (x - ox) * scale
    const Y = (y: number) => b.y + (y - oy) * scale
    const viewW = b.w / scale
    const viewH = b.h / scale
    for (const k of s.blocks) {
      if (
        k.x > ox + viewW ||
        k.x + k.w < ox ||
        k.y > oy + viewH ||
        k.y + k.h < oy
      )
        continue
      ctx.strokeStyle = p.line
      ctx.lineWidth = 1
      ctx.strokeRect(X(k.x), Y(k.y), k.w * scale, k.h * scale)
      if (k.field) {
        // A field: furrows.
        ctx.strokeStyle = p.grid
        ctx.beginPath()
        const step = Math.max(4, k.w * scale * 0.14)
        for (let x = X(k.x) + step; x < X(k.x + k.w) - 2; x += step) {
          ctx.moveTo(x, Y(k.y) + 3)
          ctx.lineTo(x, Y(k.y + k.h) - 3)
        }
        ctx.stroke()
      } else {
        ctx.fillStyle = alpha(p.dim, 0.45)
        for (const hs of k.houses)
          ctx.fillRect(X(hs.x), Y(hs.y), hs.w * scale, hs.h * scale)
      }
    }
    // A road curving through.
    ctx.strokeStyle = p.dim
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let x = ox - 0.1; x <= ox + viewW + 0.1; x += 0.04) {
      const y = 0.78 + Math.sin(x * 1.3) * 0.32
      if (x === ox - 0.1) ctx.moveTo(X(x), Y(y))
      else ctx.lineTo(X(x), Y(y))
    }
    ctx.stroke()
  })
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(512)
    const blocks: Block[] = []
    for (let gx = 0; gx * CELL < MAP_W; gx++)
      for (let gy = 0; gy * CELL < MAP_H; gy++) {
        const inset = 0.03
        const field = rand() < 0.22
        // Fields span two cells.
        if (field && gx % 2 === 1) continue
        const x = gx * CELL + inset
        const y = gy * CELL + inset
        const bw = (field ? 2 : 1) * CELL - 2 * inset
        const bh = CELL - 2 * inset
        const houses: Box[] = []
        if (!field) {
          const n = 2 + Math.floor(rand() * 3)
          for (let i = 0; i < n; i++)
            houses.push({
              x: x + 0.02 + (i % 2) * bw * 0.5 + rand() * 0.02,
              y: y + 0.02 + Math.floor(i / 2) * bh * 0.5 + rand() * 0.02,
              w: bw * 0.32,
              h: bh * 0.28,
            })
        }
        blocks.push({ x, y, w: bw, h: bh, field, houses })
      }
    return { w, h, p, still: prefersStill(), blocks, names: ids(3, rand) }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const { e, fade } = cycleTime(t, CYCLE, s.still)
    const wide = w >= 440
    const m = wide ? 12 : 8
    const pad = wide ? 12 : 8
    const gap = wide ? 12 : 8

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Headquarters along the bottom; the site above it.
    const hqH = wide ? 40 : 28
    const syncGap = wide ? 28 : 20
    const hq: Box = { x: m, y: h - m - hqH, w: w - 2 * m, h: hqH }
    const site: Box = { x: m, y: m, w: w - 2 * m, h: hq.y - syncGap - m }
    boundary(ctx, p, site, "ON SITE")
    const taken = Math.max(
      0,
      Math.min(FRAMES, Math.floor((e - FIRST) / EVERY) + 1)
    )
    // The frames indexed so far (wide only: narrow, the records at headquarters count them).
    if (wide)
      labelRow(
        ctx,
        p,
        [
          ["FRAMES", p.label],
          [String(taken), p.star],
        ],
        site.x + site.w - 12,
        site.y + 16,
        { align: "right" }
      )
    const top = site.y + 30
    const inner: Box = {
      x: site.x + pad,
      y: top,
      w: site.w - 2 * pad,
      h: site.y + site.h - pad - top,
    }
    const feed: Box = { x: inner.x, y: inner.y, w: inner.w * 0.56, h: inner.h }
    const col: Box = {
      x: feed.x + feed.w + gap,
      y: inner.y,
      w: inner.w - feed.w - gap,
      h: inner.h,
    }

    // The camera's view, panning over the map.
    const scale = feed.h / 1
    const viewW = feed.w / scale
    const ox = s.still
      ? 1.4
      : (MAP_W - viewW) * (0.5 - 0.5 * Math.cos(t * 0.045))
    const oy = (MAP_H - 1) * (0.5 + 0.5 * Math.sin(t * 0.07))
    panel(ctx, p, feed)
    map(ctx, p, s, feed, ox, oy, scale)
    const inset = {
      x: feed.x + 6,
      y: feed.y + 6,
      w: feed.w - 12,
      h: feed.h - 12,
    }
    brackets(ctx, inset, p.label, wide ? 12 : 8, 0.8)
    const taking = e >= FIRST && (e - FIRST) / EVERY < FRAMES
    const flash = taking ? 1 - ease(((e - FIRST) % EVERY) / 0.35) : 0
    if (flash > 0) brackets(ctx, inset, p.bright, wide ? 12 : 8, flash * fade)

    // Each frame on its way to headquarters, and the records there.
    const from = { x: feed.x + feed.w / 2, y: site.y + site.h }
    const to = { x: feed.x + feed.w / 2, y: hq.y }
    ctx.save()
    ctx.setLineDash([2, 3])
    ctx.strokeStyle = p.glow
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.moveTo(from.x + 0.5, from.y)
    ctx.lineTo(to.x + 0.5, to.y)
    ctx.stroke()
    ctx.restore()
    labelRow(ctx, p, [["SYNC", p.label]], from.x + 10, (from.y + to.y) / 2)
    let synced = 0
    for (let i = 0; i < FRAMES; i++) {
      const k = (e - FIRST - i * EVERY - 0.2) / 0.7
      travel(ctx, from, to, k, p.bright, 2.2, fade)
      if (k >= 1) synced++
    }
    panel(ctx, p, hq)
    const hqLabel = "HEADQUARTERS"
    labelRow(ctx, p, [[hqLabel, p.label]], hq.x + 12, hq.y + hq.h / 2)
    const tickX = hq.x + 12 + textWidth(ctx, p, hqLabel) + 16
    ctx.fillStyle = p.bright
    for (let i = 0; i < synced; i++) {
      const x = tickX + i * 7
      if (x + 3 > hq.x + hq.w - 10) break
      ctx.globalAlpha = fade
      ctx.fillRect(x, hq.y + hq.h / 2 - 5, 3, 10)
    }
    ctx.globalAlpha = 1

    // The search on site: the matching frames, best first.
    const search = ease((e - SEARCH_AT) / 0.5) * fade
    labelRow(ctx, p, [["SEARCH", p.star]], col.x, site.y + 16, {
      opacity: 0.35 + 0.65 * search,
    })
    const n = wide ? 3 : 2
    const rg = wide ? 8 : 5
    const rh = (col.h - rg * (n - 1)) / n
    for (let r = 0; r < n; r++) {
      const show = ease((e - SEARCH_AT - r * 0.3) / 0.4) * fade
      const tw = wide ? Math.min(col.w * 0.5, rh * 1.6) : col.w
      const b: Box = { x: col.x, y: col.y + r * (rh + rg), w: tw, h: rh }
      panel(ctx, p, b, { radius: 3, fill: null, stroke: p.grid })
      if (show <= 0) continue
      ctx.save()
      ctx.globalAlpha = show
      const crop = MATCHES[r]!
      const ts = b.h / 0.5
      map(ctx, p, s, b, crop.x, crop.y, ts)
      ctx.restore()
      panel(ctx, p, b, {
        radius: 3,
        fill: null,
        stroke: thumbStroke(p, r),
        width: 1.5,
        opacity: show,
      })
      if (wide)
        readout(
          ctx,
          p,
          [s.names[r]!, [SCORES[r]!.toFixed(2), p.label]],
          b.x + b.w + 8,
          b.y + b.h / 2,
          { opacity: show }
        )
    }
  },
}

export function EdgeVisualSearch() {
  return <SceneCanvas scene={scene} />
}
