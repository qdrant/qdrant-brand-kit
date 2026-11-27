"use client"

import { ease } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { labelRow, prefersStill, readout, textWidth, type Box } from "./lib"
import {
  boundary,
  brackets,
  cycleTime,
  panel,
  thumbStroke,
  within,
} from "./edge-lib"

// Smart Glasses (qdrant.tech/edge, the demos): the glasses' camera walks down a store aisle, drawn as a wireframe;
// a frame is embedded and stored in the Edge Shard every moment (on-device embeddings with FastEmbed's image
// model, qdrant.tech/documentation/edge/edge-fastembed-embeddings), and a search finds what the camera saw, all
// inside the device's dashed boundary: no footage leaves it. Which frames match is illustrative.

const CYCLE = 12
const FIRST = 0.4
const EVERY = 0.7
const SEARCH_AT = 7
// The matching frames, best first, by slot (wide: 9 slots; narrow: 4).
const MATCHES = { wide: [4, 1, 7], narrow: [2, 0, 3] }

type State = { w: number; h: number; p: Palette; still: boolean }

// An aisle in one-point perspective: the shelves' uprights come closer as the camera walks (phase 0 to 1 is one bay).
function aisle(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  b: Box,
  phase: number,
  detail: boolean
) {
  const vp = { x: b.x + b.w / 2, y: b.y + b.h * 0.44 }
  const fw = b.w * 0.07
  const far = { top: vp.y - b.h * 0.12, bottom: vp.y + b.h * 0.1 }
  const near = { top: b.y - b.h * 0.05, bottom: b.y + b.h * 0.86 }
  // Interpolates from the far opening (f = 0) to the near edge (f = 1).
  const lx = (f: number) => vp.x - fw - (vp.x - fw - b.x) * f
  const rx = (f: number) => vp.x + fw + (b.x + b.w - vp.x - fw) * f
  const ty = (f: number) => far.top + (near.top - far.top) * f
  const by = (f: number) => far.bottom + (near.bottom - far.bottom) * f
  const levels = detail ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1]

  ctx.save()
  ctx.lineWidth = 1
  // The shelves' edges, toward the far end, and the floor.
  ctx.strokeStyle = detail ? p.line : alpha(p.line, 0.9)
  ctx.beginPath()
  for (const k of levels) {
    const y0 = far.top + (far.bottom - far.top) * k
    const y1 = near.top + (near.bottom - near.top) * k
    ctx.moveTo(vp.x - fw, y0)
    ctx.lineTo(b.x - 2, y1)
    ctx.moveTo(vp.x + fw, y0)
    ctx.lineTo(b.x + b.w + 2, y1)
  }
  ctx.rect(vp.x - fw, far.top, fw * 2, far.bottom - far.top)
  ctx.stroke()
  ctx.strokeStyle = p.grid
  ctx.beginPath()
  ctx.moveTo(vp.x - fw * 0.4, far.bottom)
  ctx.lineTo(vp.x - b.w * 0.16, b.y + b.h + 2)
  ctx.moveTo(vp.x + fw * 0.4, far.bottom)
  ctx.lineTo(vp.x + b.w * 0.16, b.y + b.h + 2)
  ctx.stroke()

  // The uprights, from far to near, and the products between them.
  const bays = 7
  const fs: number[] = []
  for (let j = 0; j < bays; j++) {
    const z = 1 + ((j + 1 - phase) % bays) * 0.9
    fs.push(1 / z)
  }
  fs.sort((a, c) => a - c)
  fs.forEach((f, j) => {
    const strength = Math.min(1, f * 1.6)
    ctx.strokeStyle = alpha(p.line, strength)
    ctx.beginPath()
    for (const x of [lx(f), rx(f)]) {
      ctx.moveTo(x, ty(f))
      ctx.lineTo(x, by(f))
    }
    ctx.stroke()
    if (!detail) return
    const g = fs[j + 1] ?? 1.15
    ctx.fillStyle = alpha(p.dim, 0.3 * strength)
    for (let k = 0; k < levels.length - 1; k++) {
      const a = levels[k]!
      const c = levels[k + 1]!
      for (const [x0, x1] of [
        [lx(f), lx(g)],
        [rx(f), rx(g)],
      ] as const) {
        const fm = (f + g) / 2
        const y0 = ty(fm) + (by(fm) - ty(fm)) * a
        const y1 = ty(fm) + (by(fm) - ty(fm)) * c
        const left = Math.min(x0, x1)
        const width = Math.abs(x1 - x0)
        ctx.fillRect(
          left + width * 0.18,
          y0 + (y1 - y0) * 0.42,
          width * 0.64,
          (y1 - y0) * 0.5
        )
      }
    }
  })
  ctx.restore()
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
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

    // The device: everything happens inside it.
    const device: Box = { x: m, y: m, w: w - 2 * m, h: h - 2 * m }
    boundary(ctx, p, device, "ON DEVICE")
    const top = device.y + 30
    const inner: Box = {
      x: device.x + pad,
      y: top,
      w: device.w - 2 * pad,
      h: device.y + device.h - pad - top,
    }
    const feed: Box = { x: inner.x, y: inner.y, w: inner.w * 0.56, h: inner.h }
    const col: Box = {
      x: feed.x + feed.w + gap,
      y: inner.y,
      w: inner.w - feed.w - gap,
      h: inner.h,
    }

    // The camera, walking.
    const walk = s.still ? 0.3 : (t * 0.35) % 1
    panel(ctx, p, feed)
    within(ctx, feed, () => aisle(ctx, p, feed, walk, true))
    const frames = wide ? 9 : 4
    const stored = Math.max(
      0,
      Math.min(frames, Math.floor((e - FIRST) / EVERY) + 1)
    )
    // The frame flashes as each frame is taken.
    const taking = e >= FIRST && (e - FIRST) / EVERY < frames
    const capture = taking ? 1 - ease(((e - FIRST) % EVERY) / 0.35) : 0
    const inset = {
      x: feed.x + 6,
      y: feed.y + 6,
      w: feed.w - 12,
      h: feed.h - 12,
    }
    brackets(ctx, inset, p.label, wide ? 12 : 8, 0.8)
    if (capture > 0)
      brackets(ctx, inset, p.bright, wide ? 12 : 8, capture * fade)

    // The Edge Shard: the frames stored so far, then a search over them.
    const chipH = 24
    labelRow(
      ctx,
      p,
      [
        ["EDGE SHARD", p.label],
        [String(stored), p.star],
      ],
      col.x,
      device.y + 16
    )
    const cols = wide ? 3 : 2
    const rows = wide ? 3 : 2
    const grid: Box = {
      x: col.x,
      y: col.y,
      w: col.w,
      h: col.h - chipH - (wide ? 14 : 10),
    }
    const tg = wide ? 6 : 5
    const tw = (grid.w - tg * (cols - 1)) / cols
    const th = (grid.h - tg * (rows - 1)) / rows
    const slot = (i: number): Box => ({
      x: grid.x + (i % cols) * (tw + tg),
      y: grid.y + Math.floor(i / cols) * (th + tg),
      w: tw,
      h: th,
    })
    const search = ease((e - SEARCH_AT) / 0.5) * fade
    const matches = wide ? MATCHES.wide : MATCHES.narrow
    for (let i = 0; i < frames; i++) {
      const b = slot(i)
      const at = FIRST + i * EVERY
      const show = ease((e - at - 0.2) / 0.3) * fade
      panel(ctx, p, b, { radius: 3, fill: null, stroke: p.grid })
      if (show <= 0) continue
      const rank = matches.indexOf(i)
      ctx.save()
      ctx.globalAlpha = show * (search > 0 && rank < 0 ? 1 - 0.55 * search : 1)
      within(ctx, b, () => aisle(ctx, p, b, (i * 0.37) % 1, false))
      ctx.restore()
      if (rank >= 0 && search > 0)
        panel(ctx, p, b, {
          radius: 3,
          fill: null,
          stroke: thumbStroke(p, rank),
          width: 1.5,
          opacity: search,
        })
    }

    // The search: what it found is outlined above it.
    const chipY = col.y + col.h - chipH / 2
    const chipW = textWidth(ctx, p, "SEARCH") + 29
    readout(ctx, p, ["SEARCH"], col.x + (col.w - chipW) / 2, chipY, {
      mark: p.accent,
      opacity: search,
    })
  },
}

export function EdgeSmartGlasses() {
  return <SceneCanvas scene={scene} />
}
