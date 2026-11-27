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
  TAU,
  crosshair,
  gauss,
  ids,
  labelRow,
  nearest,
  prefersStill,
  readout,
  textWidth,
  type Box,
  type Pt,
} from "./lib"
import { brackets, cycleTime, panel, travel, within } from "./edge-lib"

// Edge Mission Control (qdrant.tech/edge, the demos): a robot's camera looks around a room, drawn as a wireframe;
// each object it detects gets a box and is stored as a point in the memory beside it, an Edge Shard on the robot,
// with no connection (Qdrant Edge runs in the application's process and searches locally, offline). Then a recall:
// a query in the memory, its nearest points, and the object it finds marked in the feed. The objects, ids and the
// earlier memories are illustrative; the nearest neighbors are computed for real.

const CYCLE = 12
const EARLIER = 26
const RECALL_AT = 7.2

// The objects in the room: their center (u) and floor line (v) in the feed, their size, all as fractions of the feed;
// and where each is stored in the memory (0 to 1).
const OBJECTS = [
  { u: 0.2, v: 0.9, w: 0.2, h: 0.22, at: { x: 0.24, y: 0.3 } },
  { u: 0.5, v: 0.84, w: 0.16, h: 0.1, at: { x: 0.72, y: 0.22 } },
  { u: 0.37, v: 0.63, w: 0.08, h: 0.09, at: { x: 0.36, y: 0.72 } },
  { u: 0.8, v: 0.9, w: 0.12, h: 0.3, at: { x: 0.8, y: 0.66 } },
  { u: 0.64, v: 0.61, w: 0.06, h: 0.13, at: { x: 0.56, y: 0.48 } },
] as const
const EVERY = 1.1
const FIRST = 0.6
// The object the recall finds.
const FOUND = 2

type State = {
  w: number
  h: number
  p: Palette
  still: boolean
  earlier: Pt[]
  names: string[]
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(214)
    const earlier: Pt[] = []
    const centers = [
      { x: 0.3, y: 0.35 },
      { x: 0.7, y: 0.3 },
      { x: 0.55, y: 0.7 },
    ]
    while (earlier.length < EARLIER) {
      const c = centers[earlier.length % centers.length]!
      const q = {
        x: Math.min(0.96, Math.max(0.04, c.x + gauss(rand) * 0.16)),
        y: Math.min(0.96, Math.max(0.04, c.y + gauss(rand) * 0.15)),
      }
      // Keep the new objects' places clear, so each one reads.
      if (OBJECTS.some(({ at }) => Math.hypot(at.x - q.x, at.y - q.y) < 0.11))
        continue
      earlier.push(q)
    }
    return {
      w,
      h,
      p,
      still: prefersStill(),
      earlier,
      names: ids(OBJECTS.length, rand),
    }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const { e, fade } = cycleTime(t, CYCLE, s.still)
    const wide = w >= 440
    const m = wide ? 16 : 10
    const gap = wide ? 12 : 8
    const top = m + 30

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    const feed: Box = {
      x: m,
      y: top,
      w: (w - 2 * m - gap) * 0.64,
      h: h - top - m,
    }
    const mem: Box = {
      x: feed.x + feed.w + gap,
      y: top,
      w: w - m - (feed.x + feed.w + gap),
      h: feed.h,
    }

    const seen = OBJECTS.filter((_, i) => e >= FIRST + i * EVERY + 1.1).length

    // Header: the objects seen, and no connection.
    labelRow(
      ctx,
      p,
      [
        [wide ? "OBJECTS SEEN" : "SEEN", p.label],
        [String(EARLIER + seen), p.star],
      ],
      m,
      m + 8
    )
    readout(ctx, p, [["OFFLINE", p.label]], w - m, m + 8, {
      align: "right",
      mark: p.dim,
    })

    // The camera's view: a room in one-point perspective, the camera panning slowly.
    const drift = s.still ? 0 : Math.sin(t * 0.22) * feed.w * 0.025
    panel(ctx, p, feed, { radius: 4 })
    within(ctx, feed, () => {
      const vp = { x: feed.x + feed.w * 0.5 + drift, y: feed.y + feed.h * 0.4 }
      const wall = {
        x0: vp.x - feed.w * 0.2,
        x1: vp.x + feed.w * 0.2,
        y0: vp.y - feed.h * 0.2,
        y1: vp.y + feed.h * 0.16,
      }
      const floor = feed.y + feed.h
      ctx.strokeStyle = p.grid
      ctx.beginPath()
      // The floor's boards, toward the far wall.
      for (let k = -4; k <= 4; k++) {
        ctx.moveTo(vp.x + (k * (wall.x1 - wall.x0)) / 8, wall.y1)
        ctx.lineTo(vp.x + k * feed.w * 0.26, floor)
      }
      for (const f of [0.18, 0.42, 0.74]) {
        const y = wall.y1 + (floor - wall.y1) * f
        ctx.moveTo(feed.x, y)
        ctx.lineTo(feed.x + feed.w, y)
      }
      ctx.stroke()
      // The room's edges and the far wall, with two windows.
      ctx.strokeStyle = p.line
      ctx.beginPath()
      ctx.rect(wall.x0, wall.y0, wall.x1 - wall.x0, wall.y1 - wall.y0)
      ctx.moveTo(feed.x - feed.w * 0.1, feed.y - feed.h * 0.1)
      ctx.lineTo(wall.x0, wall.y0)
      ctx.moveTo(feed.x + feed.w * 1.1, feed.y - feed.h * 0.1)
      ctx.lineTo(wall.x1, wall.y0)
      ctx.moveTo(feed.x - feed.w * 0.1, floor + feed.h * 0.1)
      ctx.lineTo(wall.x0, wall.y1)
      ctx.moveTo(feed.x + feed.w * 1.1, floor + feed.h * 0.1)
      ctx.lineTo(wall.x1, wall.y1)
      const ww = (wall.x1 - wall.x0) * 0.26
      const wh = (wall.y1 - wall.y0) * 0.42
      for (const cx of [0.3, 0.7]) {
        const x = wall.x0 + (wall.x1 - wall.x0) * cx - ww / 2
        ctx.rect(x, wall.y0 + (wall.y1 - wall.y0) * 0.18, ww, wh)
      }
      ctx.stroke()
    })

    // The objects, then their detection boxes.
    const boxes = OBJECTS.map((o) => {
      const near = (o.v - 0.6) / 0.3
      const bw = o.w * feed.w
      const bh = o.h * feed.h
      return {
        x: feed.x + o.u * feed.w - bw / 2 + drift * (1 + near * 1.4),
        y: feed.y + o.v * feed.h - bh,
        w: bw,
        h: bh,
      }
    })
    within(ctx, feed, () => {
      for (const b of boxes) {
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 2)
        ctx.fillStyle = p.surface
        ctx.fill()
        ctx.strokeStyle = p.dim
        ctx.globalAlpha = 0.8
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(b.x, b.y + Math.min(6, b.h * 0.3))
        ctx.lineTo(b.x + b.w, b.y + Math.min(6, b.h * 0.3))
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })
    brackets(
      ctx,
      { x: feed.x + 6, y: feed.y + 6, w: feed.w - 12, h: feed.h - 12 },
      p.label,
      wide ? 12 : 8,
      0.8
    )

    // The memory: the Edge Shard on the robot.
    panel(ctx, p, mem, { radius: 4 })
    labelRow(ctx, p, [["MEMORY", p.label]], mem.x + 10, mem.y + 14)
    const area: Box = {
      x: mem.x + 14,
      y: mem.y + 32,
      w: mem.w - 28,
      h: mem.h - 46,
    }
    const at = (q: Pt): Pt => ({
      x: area.x + q.x * area.w,
      y: area.y + q.y * area.h,
    })
    ctx.fillStyle = alpha(p.star, 0.45)
    ctx.beginPath()
    for (const q of s.earlier) {
      const { x, y } = at(q)
      ctx.moveTo(x + 1.4, y)
      ctx.arc(x, y, 1.4, 0, TAU)
    }
    ctx.fill()

    const recall = ease((e - RECALL_AT) / 0.5) * fade
    const all: Pt[] = [...s.earlier, ...OBJECTS.map((o) => o.at)]
    const query = {
      x: OBJECTS[FOUND].at.x + 0.07,
      y: OBJECTS[FOUND].at.y - 0.09,
    }
    const hits = nearest(
      all,
      (q) => Math.hypot(q.x - query.x, q.y - query.y),
      3
    )
    const found = hits[0]!.i - EARLIER

    // Each object: its box in the feed, then its point on its way to the memory.
    OBJECTS.forEach((o, i) => {
      const local = e - (FIRST + i * EVERY)
      if (local < 0) return
      const b = boxes[i]!
      const show = ease(local / 0.3) * fade
      const key = i === found && recall > 0
      const box = { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 }
      within(ctx, feed, () => {
        ctx.save()
        ctx.globalAlpha = show
        ctx.strokeStyle = key ? p.accent : p.glow
        ctx.lineWidth = 1.5
        ctx.strokeRect(
          Math.round(box.x) + 0.5,
          Math.round(box.y) + 0.5,
          Math.round(box.w),
          Math.round(box.h)
        )
        ctx.restore()
      })
      // Its id while it's new, and again when the recall finds it.
      const fresh = 1 - ease((local - 1.4) / 0.4)
      const chip = key ? recall : show * fresh
      if (wide && chip > 0 && box.y - 16 > feed.y)
        readout(ctx, p, [s.names[i]!], box.x, box.y - 15, {
          opacity: chip,
          mark: key ? p.accent : p.glow,
        })
      const from = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
      const to = at(o.at)
      const k = (local - 0.4) / 0.7
      travel(ctx, from, to, ease(k), p.bright, 2.2, fade)
      if (k >= 1) {
        ctx.save()
        ctx.globalAlpha = fade
        ctx.fillStyle = p.bright
        ctx.beginPath()
        ctx.arc(to.x, to.y, 2.2, 0, TAU)
        ctx.fill()
        ctx.restore()
      }
    })

    // The recall: a query in the memory, its nearest points, the key one in amaranth.
    if (recall > 0) {
      const q = at(query)
      ctx.save()
      ctx.globalAlpha = recall
      ctx.strokeStyle = alpha(p.glow, 0.8)
      ctx.beginPath()
      for (const { i } of hits) {
        const b = at(all[i]!)
        ctx.moveTo(q.x, q.y)
        ctx.lineTo(b.x, b.y)
      }
      ctx.stroke()
      const best = at(all[hits[0]!.i]!)
      ctx.strokeStyle = p.accent
      ctx.beginPath()
      ctx.arc(best.x, best.y, 6, 0, TAU)
      ctx.stroke()
      ctx.restore()
      crosshair(ctx, p, q.x, q.y, recall)
      // Above the query: its nearest points are below it.
      const chipW = textWidth(ctx, p, "RECALL") + 16
      readout(ctx, p, ["RECALL"], q.x - chipW / 2, q.y - 26, {
        opacity: recall,
      })
    }
  },
}

export function EdgeMissionControl() {
  return <SceneCanvas scene={scene} />
}
