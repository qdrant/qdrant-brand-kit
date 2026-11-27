"use client"

import { clamp, ease, rng, spread, type Point } from "./rand"
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
  ids,
  labelRow,
  mono,
  prefersStill,
  readout,
  textWidth,
  type Pt,
} from "./lib"

// Native Cloud Inference (qdrant.tech/documentation/cloud/inference): the request carries raw text or an image;
// the cluster embeds it with a hosted model and runs the search, in one round trip. The input changes every
// cycle: text with mixedbread-ai/mxbai-embed-large-v1, then an image with clip-vit-b-32-vision. The vector's
// values and the results are illustrative.

const CYCLE = 11
const TOP = 3
const QUERY = '"wireless headphones"'
const MODELS = ["MXBAI-EMBED-LARGE-V1", "CLIP-VIT-B-32-VISION"] as const

type Run = {
  image: boolean
  vector: number[]
  pixels: number[]
  points: Point[]
  nearest: number[]
  results: { id: string; score: number }[]
}
type State = {
  w: number
  h: number
  p: Palette
  cycle: number
  run: Run
  still: boolean
}

function make(cycle: number): Run {
  const rand = rng(610 + cycle)
  const vector = Array.from({ length: 16 }, () => rand() * 2 - 1)
  const pixels = Array.from({ length: 24 }, () => 0.15 + rand() * 0.7)
  const points = spread(14, 1, 1, rand)
  const nearest = points
    .map((q, i) => ({ i, d: (q.x - 0.5) ** 2 + (q.y - 0.5) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, TOP)
    .map(({ i }) => i)
  let score = 0.84 + rand() * 0.08
  const results = ids(TOP, rand).map((id) => {
    const r = { id, score }
    score -= 0.01 + rand() * 0.04
    return r
  })
  return { image: cycle % 2 === 1, vector, pixels, points, nearest, results }
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

// The image input: a small grid of pixels in the glow, framed.
function picture(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  cell: number,
  values: number[],
  opacity: number
) {
  ctx.save()
  ctx.globalAlpha = opacity
  values.forEach((v, i) => {
    ctx.fillStyle = alpha(p.glow, v)
    ctx.fillRect(
      x + (i % 6) * cell + 1,
      y + Math.floor(i / 6) * cell + 1,
      cell - 1,
      cell - 1
    )
  })
  ctx.strokeStyle = p.line
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, cell * 6, cell * 4)
  ctx.restore()
}

// A curve from a to b, leaving and arriving level, drawn up to k (0 to 1).
function curve(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, k: number) {
  const mx = (a.x + b.x) / 2
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  for (let i = 1; i <= 24; i++) {
    const u = (i / 24) * k
    const v = 1 - u
    ctx.lineTo(
      v * v * v * a.x +
        3 * v * v * u * mx +
        3 * v * u * u * mx +
        u * u * u * b.x,
      v * v * v * a.y +
        3 * v * v * u * a.y +
        3 * v * u * u * b.y +
        u * u * u * b.y
    )
  }
  ctx.stroke()
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
    const { image, vector, pixels, points, nearest, results } = s.run
    const wide = w >= 700
    const values = wide ? vector : vector.slice(0, 10)

    // The stages, in time.
    const sent = ease((e - 0.6) / 0.6)
    const embedding = clamp((e - 1.2) / 0.3)
    const bars = (e - 1.6) / 1
    const toSearch = ease((e - 2.6) / 0.4)
    const searched = clamp((e - 3) / 0.5)
    const back = ease((e - 3.6) / 0.4)
    const done = clamp((e - 4.6) / 0.4)

    const pad = Math.round(clamp(w * 0.04, 12, 28))
    const x0 = pad
    const x1 = w - pad
    const chipW = textWidth(ctx, p, QUERY) + 16
    const model = MODELS[image ? 1 : 0]

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // ONE REQUEST: a bracket over the whole round trip (in a narrow frame, the box's header says it).
    const by = pad + 6
    ctx.save()
    ctx.font = mono(p)
    const lw = ctx.measureText("ONE REQUEST").width + 20
    ctx.restore()
    ctx.strokeStyle = alpha(done > 0 ? p.glow : p.line, wide ? fade : 0)
    ctx.beginPath()
    ctx.moveTo(x0 + 0.5, by + 8)
    ctx.lineTo(x0 + 0.5, by + 0.5)
    ctx.lineTo(w / 2 - lw / 2, by + 0.5)
    ctx.moveTo(w / 2 + lw / 2, by + 0.5)
    ctx.lineTo(x1 - 0.5, by + 0.5)
    ctx.lineTo(x1 - 0.5, by + 8)
    ctx.stroke()
    labelRow(
      ctx,
      p,
      [["ONE REQUEST", done > 0 ? p.bright : p.star]],
      wide ? w / 2 : x1 - 12,
      wide ? by : 0,
      { align: wide ? "center" : "right", opacity: wide ? fade : 0 }
    )

    const textOn = (image ? 0.4 : 1) * fade
    const imageOn = (image ? 1 : 0.4) * fade
    const flow = (k: number) => alpha(p.glow, 0.85 * k * fade)

    // Points in the box: the model, the vector and the search.
    let embedAt: Pt
    let vectorAt: Pt
    let searchAt: Pt
    let resultsAt: Pt
    let cloud: { x: number; y: number; w: number; h: number }
    let cluster: { x: number; y: number; w: number; h: number }
    let barW: number

    if (wide) {
      const colIn = Math.max(chipW, 6 * 12)
      const colOut = 132
      const gap = clamp((w - 2 * pad - colIn - colOut - 256) / 2, 36, 64)
      const top = by + 30
      cloud = {
        x: x0 + colIn + gap,
        y: top,
        w: x1 - colOut - gap - (x0 + colIn + gap),
        h: h - pad - top,
      }
      const ix = cloud.x + 16
      const ey = cloud.y + cloud.h * 0.27
      const vy = cloud.y + cloud.h * 0.53
      const sy = cloud.y + cloud.h * 0.79
      embedAt = { x: ix, y: ey }
      vectorAt = { x: ix, y: vy }
      searchAt = { x: ix, y: sy }
      resultsAt = { x: x1 - colOut, y: sy }
      barW = 5
      cluster = {
        x: ix + 76,
        y: sy - 22,
        w: cloud.x + cloud.w - 16 - (ix + 76),
        h: 44,
      }

      // The inputs: text, level with the model, and an image below it.
      labelRow(ctx, p, [["TEXT", p.label]], x0, ey - 26, { opacity: fade })
      readout(ctx, p, [[QUERY, p.star]], x0, ey, { opacity: textOn })
      const iy = ey + 44
      labelRow(ctx, p, [["IMAGE", p.label]], x0, iy, { opacity: fade })
      picture(ctx, p, x0, iy + 14, 12, pixels, imageOn)
      ctx.strokeStyle = flow(sent)
      if (image) {
        // Level past the text input, then up into the box.
        const ax = x0 + 72 + 6
        const bx = x0 + colIn + 6
        const k = clamp(sent * 2)
        if (k > 0) {
          ctx.beginPath()
          ctx.moveTo(ax, iy + 38)
          ctx.lineTo(ax + (bx - ax) * k, iy + 38)
          ctx.stroke()
        }
        curve(
          ctx,
          { x: bx, y: iy + 38 },
          { x: cloud.x, y: ey },
          clamp(sent * 2 - 1)
        )
      } else
        curve(ctx, { x: x0 + chipW + 6, y: ey }, { x: cloud.x, y: ey }, sent)
    } else {
      const BOX = 84
      const fixed = 24 + 14 + BOX + 14 + 24
      const g = clamp((h - 2 * pad - fixed) / 4, 0, 20)
      const iy = Math.round((h - fixed - 2 * g) / 2) + 12
      const top = iy + 12 + 14 + g
      cloud = { x: x0, y: top, w: x1 - x0, h: BOX }
      const ix = cloud.x + 12
      embedAt = { x: ix, y: top + 44 }
      vectorAt = { x: ix, y: top + 68 }
      barW = 4
      const vw = values.length * (barW + 3)
      searchAt = { x: ix + vw + 30, y: top + 68 }
      const sx = searchAt.x + textWidth(ctx, p, "SEARCH") + 14
      cluster = {
        x: sx,
        y: top + 58,
        w: Math.max(24, cloud.x + cloud.w - 14 - sx),
        h: 20,
      }
      resultsAt = { x: x0, y: top + BOX + 14 + g + 12 }

      // The inputs above the box: both when they fit, or the one sent.
      const px = x0 + chipW + 12
      const both = px + 36 + 8 + textWidth(ctx, p, "IMAGE") <= x1
      const ix0 = both ? px : x0
      if (both || !image)
        readout(ctx, p, [[QUERY, p.star]], x0, iy, { opacity: textOn })
      if (both || image) {
        picture(ctx, p, ix0, iy - 12, 6, pixels, imageOn)
        labelRow(ctx, p, [["IMAGE", p.label]], ix0 + 36 + 8, iy, {
          opacity: fade,
        })
      }
      ctx.strokeStyle = flow(sent)
      const from = image ? ix0 + 18 : x0 + 24
      if (sent > 0)
        arrow(
          ctx,
          { x: from, y: iy + 13 },
          { x: from, y: iy + 13 + (top - 2 - iy - 13) * sent },
          5
        )
    }

    // Qdrant Cloud: embed, then search.
    box(ctx, p, cloud.x, cloud.y, cloud.w, cloud.h, fade)
    labelRow(
      ctx,
      p,
      [["QDRANT CLOUD", p.star]],
      cloud.x + (wide ? 16 : 12),
      cloud.y + 18,
      { opacity: fade }
    )
    if (!wide)
      labelRow(
        ctx,
        p,
        [["ONE REQUEST", done > 0 ? p.bright : p.label]],
        cloud.x + cloud.w - 12,
        cloud.y + 18,
        { align: "right", opacity: fade }
      )
    labelRow(ctx, p, [["EMBED", p.star]], embedAt.x, embedAt.y, {
      opacity: fade,
    })
    const mx = embedAt.x + (wide ? 64 : 52)
    readout(
      ctx,
      p,
      [[model, embedding > 0 ? p.bright : p.star]],
      mx,
      embedAt.y,
      { opacity: fade }
    )

    // The vector, value by value.
    const vx = wide ? mx : vectorAt.x
    if (wide)
      labelRow(ctx, p, [["VECTOR", p.label]], vectorAt.x, vectorAt.y, {
        opacity: fade,
      })
    ctx.strokeStyle = alpha(p.line, fade)
    ctx.beginPath()
    ctx.moveTo(vx, Math.round(vectorAt.y) + 0.5)
    ctx.lineTo(
      vx + values.length * (barW + 3) - 3,
      Math.round(vectorAt.y) + 0.5
    )
    ctx.stroke()
    values.forEach((v, i) => {
      const k = clamp(bars * values.length - i)
      if (k <= 0) return
      const len = v * (wide ? 14 : 9) * k
      ctx.fillStyle = alpha(p.glow, fade)
      ctx.fillRect(
        vx + i * (barW + 3),
        vectorAt.y - Math.max(0, len),
        barW,
        Math.abs(len) || 1
      )
    })
    ctx.strokeStyle = flow(embedding)
    if (wide) {
      arrow(
        ctx,
        { x: mx + 12, y: embedAt.y + 15 },
        {
          x: mx + 12,
          y: embedAt.y + 15 + (vectorAt.y - 18 - embedAt.y - 15) * embedding,
        },
        5
      )
      ctx.strokeStyle = flow(toSearch)
      arrow(
        ctx,
        { x: mx + 12, y: vectorAt.y + 18 },
        {
          x: mx + 12,
          y: vectorAt.y + 18 + (searchAt.y - 14 - vectorAt.y - 18) * toSearch,
        },
        5
      )
    } else {
      const ax = vx + values.length * (barW + 3) + 6
      ctx.strokeStyle = flow(toSearch)
      if (toSearch > 0)
        arrow(
          ctx,
          { x: ax, y: vectorAt.y },
          { x: ax + 16 * toSearch, y: vectorAt.y },
          5
        )
    }

    // The search: the points nearest the query vector light up.
    labelRow(
      ctx,
      p,
      [["SEARCH", toSearch >= 1 ? p.bright : p.star]],
      searchAt.x,
      searchAt.y,
      { opacity: fade }
    )
    points.forEach((pt, i) => {
      const x = cluster.x + pt.x * cluster.w
      const y = cluster.y + pt.y * cluster.h
      const hit = nearest.indexOf(i)
      const on = hit >= 0 ? clamp(searched * TOP - hit) : 0
      ctx.fillStyle = alpha(
        on > 0 ? p.bright : p.glow,
        (on > 0 ? 1 : 0.55) * fade
      )
      ctx.beginPath()
      ctx.arc(x, y, on > 0 && !wide ? 3.5 : 2.5, 0, TAU)
      ctx.fill()
      if (on > 0 && wide) {
        ctx.strokeStyle = alpha(p.bright, on * fade)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(x, y, wide ? 6 : 5, 0, TAU)
        ctx.stroke()
        ctx.lineWidth = 1
      }
    })

    // The results, back in the same response.
    const digits = wide ? 3 : 2
    ctx.strokeStyle = flow(back)
    if (wide) {
      const ax = cloud.x + cloud.w + 6
      if (back > 0)
        arrow(
          ctx,
          { x: ax, y: resultsAt.y },
          { x: ax + (resultsAt.x - 8 - ax) * back, y: resultsAt.y },
          5
        )
      labelRow(
        ctx,
        p,
        [[`TOP ${TOP}`, p.star]],
        resultsAt.x,
        resultsAt.y - 56,
        { opacity: fade }
      )
      results.forEach((r, i) => {
        const on = clamp((e - 4 - i * 0.15) / 0.3) * fade
        const y = resultsAt.y + (i - 1) * 30
        readout(
          ctx,
          p,
          [r.id, [r.score.toFixed(digits), p.label]],
          resultsAt.x,
          y,
          { opacity: on, mark: i === 0 ? p.accent : undefined }
        )
      })
    } else {
      const ax = x0 + 24
      if (back > 0)
        arrow(
          ctx,
          { x: ax, y: cloud.y + cloud.h + 2 },
          {
            x: ax,
            y:
              cloud.y +
              cloud.h +
              2 +
              (resultsAt.y - 14 - cloud.y - cloud.h - 2) * back,
          },
          5
        )
      // Scores when they fit; ids alone in the narrowest frames.
      const scored =
        x1 - x0 >= 3 * textWidth(ctx, p, "#0000  0.00") + 13 + 3 * 16 + 12
      let cx = x0
      results.forEach((r, i) => {
        const on = clamp((e - 4 - i * 0.15) / 0.3) * fade
        cx +=
          readout(
            ctx,
            p,
            scored ? [r.id, [r.score.toFixed(digits), p.label]] : [r.id],
            cx,
            resultsAt.y,
            { opacity: on, mark: i === 0 ? p.accent : undefined }
          ) + 6
      })
    }
  },
}

export function Inference() {
  return <SceneCanvas scene={scene} />
}
