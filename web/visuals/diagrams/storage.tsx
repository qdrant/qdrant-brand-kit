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
  arrow,
  crosshair,
  ids,
  labelRow,
  prefersStill,
  readout,
  textWidth,
} from "./lib"

// Memory-efficient storage (qdrant.tech/documentation/manage-data/storage): vectors always live in a memory-mapped
// file on disk, and memory tiers decide what stays in RAM. A common setup, drawn here: binary-quantized vectors
// pinned in RAM with the HNSW graph and the payload index, the original float32 vectors cold on disk, and payloads
// in Gridstore on disk. The two bars are to scale: binary quantization keeps 1 bit of each 32-bit float, 1/32 of
// the size. A query searches in RAM, then rescoring reads a few original vectors from disk for the top results.

const CYCLE = 11
const READS = 4
const TOP = 3

type Run = { slivers: number[]; results: { id: string; score: number }[] }
type State = {
  w: number
  h: number
  p: Palette
  cycle: number
  run: Run
  still: boolean
}

function make(cycle: number): Run {
  const rand = rng(260 + cycle)
  const slivers = Array.from(
    { length: READS },
    (_, i) => (i + 0.15 + rand() * 0.7) / READS
  )
  let score = 0.88 + rand() * 0.06
  const results = ids(TOP, rand).map((id) => {
    const r = { id, score }
    score -= 0.01 + rand() * 0.03
    return r
  })
  return { slivers, results }
}

function box(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number
) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.roundRect(
    Math.round(x) + 0.5,
    Math.round(y) + 0.5,
    Math.round(w),
    Math.round(h),
    6
  )
  ctx.fillStyle = alpha(p.surface, 0.9)
  ctx.fill()
  ctx.strokeStyle = p.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, cycle: 0, run: make(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cycle = s.still ? 0 : Math.floor(t / CYCLE)
    if (cycle !== s.cycle) {
      s.cycle = cycle
      s.run = make(cycle)
    }
    const e = s.still ? 6 : t % CYCLE
    const fade = clamp(e / 0.5) * (1 - clamp((e - (CYCLE - 1.2)) / 1))
    const { slivers, results } = s.run

    const pad = Math.round(clamp(w * 0.045, 12, 28))
    const x0 = pad
    const x1 = w - pad
    const W = x1 - x0
    // Boxes and gaps grow with the frame; the rows inside sit at fixed fractions of a box.
    const BOX = Math.round(clamp(h * 0.2, 80, 112))
    const MID = Math.round(clamp(h * 0.12, 40, 66))
    const fixed = 32 + BOX + MID + BOX + 52
    const g = clamp((h - 2 * pad - fixed) / 4, 0, 40)
    const top = Math.round((h - fixed - 3 * g) / 2)
    const qy = top + 12
    const ramTop = qy + 20 + g
    const diskTop = ramTop + BOX + MID + g
    const resY = diskTop + BOX + 28 + g + 12
    const row = (k: number) => Math.round(BOX * k)
    const bx = x0 + 14
    const barW = W - 28

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The query, into RAM.
    const q = clamp((e - 0.6) / 0.3) * fade
    const qx = x0 + 14
    crosshair(ctx, p, qx, qy, q)
    labelRow(
      ctx,
      p,
      [
        ["QUERY", p.star],
        ["SEARCH IN RAM", p.label],
      ],
      qx + 20,
      qy,
      { opacity: q }
    )
    const into = ease((e - 0.8) / 0.4)
    if (into > 0 && ramTop - qy > 30) {
      ctx.strokeStyle = alpha(p.glow, 0.8 * q)
      arrow(
        ctx,
        { x: qx, y: qy + 14 },
        { x: qx, y: qy + 14 + (ramTop - 2 - qy - 14) * into },
        5
      )
    }

    // RAM: the HNSW graph, the payload index and the quantized vectors.
    const searching = e >= 1.2 && e < 2.6
    const lit = clamp((e - 1.2) / 0.3) * (1 - clamp((e - 2.4) / 0.4))
    box(ctx, p, x0, ramTop, W, BOX, fade)
    const r1 = ramTop + row(0.25)
    labelRow(ctx, p, [["RAM", p.star]], bx, r1, { opacity: fade })
    const chipW = textWidth(ctx, p, "PAYLOAD INDEX") + 16
    readout(ctx, p, [["PAYLOAD INDEX", p.star]], x1 - 10, r1, {
      opacity: fade,
      align: "right",
    })
    readout(
      ctx,
      p,
      [["HNSW GRAPH", searching ? p.bright : p.star]],
      x1 - 10 - chipW - 6,
      r1,
      {
        opacity: fade,
        align: "right",
      }
    )
    const r2 = ramTop + row(0.59)
    labelRow(
      ctx,
      p,
      [
        ["QUANTIZED VECTORS", p.star],
        ["PINNED", p.bright],
      ],
      bx,
      r2,
      { opacity: fade }
    )
    labelRow(ctx, p, [["BINARY", p.label]], x1 - 14, r2, {
      align: "right",
      opacity: fade,
    })
    const r3 = ramTop + row(0.82)
    const qw = Math.max(2, barW / 32)
    ctx.fillStyle = alpha(p.glow, fade)
    ctx.fillRect(bx, r3 - 4, qw, 8)
    if (lit > 0) {
      ctx.fillStyle = alpha(p.bright, lit * fade)
      ctx.fillRect(bx, r3 - 4, qw, 8)
    }
    labelRow(
      ctx,
      p,
      [
        ["1/32", p.bright],
        ["OF FLOAT32", p.label],
      ],
      bx + qw + 10,
      r3,
      { opacity: fade }
    )

    // Rescore: read a few originals from disk.
    const gy = ramTop + BOX + (MID + g) / 2
    const down = ease((e - 2.4) / 0.5)
    const rescoring = e >= 2.4 && e < 3.9
    ctx.strokeStyle = alpha(
      down > 0 ? p.glow : p.label,
      (0.45 + 0.4 * down) * fade
    )
    arrow(ctx, { x: qx, y: ramTop + BOX + 3 }, { x: qx, y: diskTop - 3 }, 5)
    labelRow(
      ctx,
      p,
      [
        ["RESCORE", rescoring ? p.bright : p.star],
        ["READ ORIGINALS", p.label],
      ],
      qx + 20,
      gy,
      {
        opacity: (0.55 + 0.45 * down) * fade,
      }
    )

    // Disk, memory-mapped: Gridstore for payloads and the original vectors.
    box(ctx, p, x0, diskTop, W, BOX, fade)
    const d1 = diskTop + row(0.25)
    labelRow(
      ctx,
      p,
      [
        ["DISK", p.star],
        ["MMAP", p.label],
      ],
      bx,
      d1,
      { opacity: fade }
    )
    readout(
      ctx,
      p,
      [
        ["GRIDSTORE", p.star],
        ["PAYLOADS", p.label],
      ],
      x1 - 10,
      d1,
      { opacity: fade, align: "right" }
    )
    const d2 = diskTop + row(0.59)
    labelRow(
      ctx,
      p,
      [
        ["ORIGINAL VECTORS", p.star],
        ["COLD", p.label],
      ],
      bx,
      d2,
      { opacity: fade }
    )
    labelRow(ctx, p, [["FLOAT32", p.label]], x1 - 14, d2, {
      align: "right",
      opacity: fade,
    })
    const d3 = diskTop + row(0.82)
    ctx.fillStyle = alpha(p.line, fade)
    ctx.fillRect(bx, d3 - 4, barW, 8)
    slivers.forEach((at, i) => {
      const on = clamp((e - 2.9 - i * 0.18) / 0.2) * fade
      if (on <= 0) return
      ctx.fillStyle = alpha(p.bright, on)
      ctx.fillRect(Math.round(bx + at * barW), d3 - 7, 3, 14)
    })

    // The top results, scored on the originals.
    const out = ease((e - 3.8) / 0.4)
    const ay = diskTop + BOX
    ctx.strokeStyle = alpha(
      out > 0 ? p.glow : p.label,
      (0.45 + 0.4 * out) * fade
    )
    arrow(ctx, { x: qx, y: ay + 3 }, { x: qx, y: resY - 14 }, 5)
    // Scores when they fit; ids alone in a narrow frame.
    const scored = W >= 3 * textWidth(ctx, p, "#0000  0.000") + 13 + 3 * 16 + 12
    let cx = x0
    results.forEach((r, i) => {
      const on = clamp((e - 4.1 - i * 0.15) / 0.3) * fade
      const parts: (string | [string, string])[] = scored
        ? [r.id, [r.score.toFixed(3), p.label]]
        : [r.id]
      cx +=
        readout(ctx, p, parts, cx, resY, {
          opacity: on,
          mark: i === 0 ? p.accent : undefined,
        }) + 6
    })
  },
}

export function Storage() {
  return <SceneCanvas scene={scene} />
}
