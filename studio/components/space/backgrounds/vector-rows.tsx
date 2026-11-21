"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, clear, type CanvasScene, type Palette } from "../scene"
import { calm, calmGradient } from "./lib"

// Vector rows: faint rows of embedding values in aligned mono columns, scrolling slowly, each with an id and
// its cosine score to the pinned query row, computed from the values shown. Close matches read brighter as
// they pass. A small accent mark points at the query.

const ROW = 24
const COL = 56
const ID = 72
const SPEED = 10 // pixels a second
const X0 = 24

type State = { w: number; h: number; p: Palette; dims: number; query: number[]; qy: number }

const gaussian = (rand: () => number) => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())
const value = (v: number) => `${v < 0 ? "-" : " "}${Math.min(0.999, Math.abs(v)).toFixed(3)}`

// Row k of the collection: the same values every time it scrolls by. About one in seven is close to the query.
function row(k: number, query: number[]) {
  const rand = rng(k * 7919 + 17)
  const s = rand() < 0.14 ? 0.86 + rand() * 0.12 : rand() * 0.6 - 0.15
  const values = query.map((q) => clamp(s * q + Math.sqrt(1 - s * s) * gaussian(rand) * 0.45, -0.999, 0.999))
  let dot = 0
  let a = 0
  let b = 0
  values.forEach((v, i) => {
    dot += v * query[i]
    a += v * v
    b += query[i] * query[i]
  })
  const id = (((k * 7919 + 104_729) % 1_000_000) + 1_000_000) % 1_000_000
  return { id: `#${String(id).padStart(6, "0")}`, values, score: dot / Math.sqrt(a * b || 1) }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(3)
    const dims = Math.max(3, Math.floor((w - 24 - 72 - (X0 + ID)) / COL))
    const query = Array.from({ length: dims }, () => clamp(gaussian(rand) * 0.45, -0.999, 0.999))
    return { w, h, p, dims, query, qy: Math.round(h / 2 / 8) * 8 }
  },
  draw(ctx, s, t) {
    const { p, w, h, dims, query, qy } = s
    clear(ctx, p, w, h)
    const columns = Array.from({ length: dims }, (_, i) => X0 + ID + i * COL)
    const scoreX = w - 24

    ctx.font = `500 12px ${p.mono}`
    ctx.textBaseline = "middle"
    const offset = t * SPEED
    for (let k = Math.floor(offset / ROW) - 1; ; k++) {
      const y = k * ROW - offset + ROW / 2
      if (y > h + ROW) break
      if (y < -ROW) continue
      // Rows fade out as they pass under the query.
      const pass = clamp((Math.abs(y - qy) - ROW * 0.5) / ROW)
      if (pass <= 0) continue
      const { id, values, score } = row(k, query)
      const hot = score > 0.85
      const base = (hot ? 0.8 : 0.4) * pass
      ctx.fillStyle = hot ? p.star : p.dim
      ctx.textAlign = "left"
      ctx.globalAlpha = base * calm(X0 + 24, w, 0.05)
      ctx.fillText(id, X0, y)
      values.forEach((v, i) => {
        ctx.globalAlpha = base * calm(columns[i] + 20, w, 0.05)
        ctx.fillText(value(v), columns[i], y)
      })
      ctx.textAlign = "right"
      ctx.fillStyle = hot ? p.bright : p.label
      ctx.globalAlpha = (hot ? 1 : 0.6) * pass
      ctx.fillText(score.toFixed(3), scoreX, y)
    }

    // The query row, pinned, between two hairlines.
    ctx.globalAlpha = 1
    ctx.fillStyle = calmGradient(ctx, w, p.glow, 0, 0.08)
    ctx.fillRect(0, qy - ROW / 2, w, ROW)
    ctx.strokeStyle = calmGradient(ctx, w, p.glow, 0.05, 0.6)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, qy - ROW / 2 + 0.5)
    ctx.lineTo(w, qy - ROW / 2 + 0.5)
    ctx.moveTo(0, qy + ROW / 2 - 0.5)
    ctx.lineTo(w, qy + ROW / 2 - 0.5)
    ctx.stroke()
    ctx.textAlign = "left"
    ctx.fillStyle = p.label
    ctx.globalAlpha = calm(X0 + 24, w, 0.1)
    ctx.fillText("QUERY", X0, qy)
    ctx.fillStyle = p.star
    query.forEach((v, i) => {
      ctx.globalAlpha = calm(columns[i] + 20, w, 0.1)
      ctx.fillText(value(v), columns[i], qy)
    })
    ctx.globalAlpha = 1
    ctx.textAlign = "right"
    ctx.fillStyle = p.bright
    ctx.fillText("1.000", scoreX, qy)

    // The accent mark: a small pointer at the row's right end.
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.moveTo(w - 16, qy)
    ctx.lineTo(w - 10, qy - 4)
    ctx.lineTo(w - 10, qy + 4)
    ctx.closePath()
    ctx.fill()
  },
}

export function VectorRows() {
  return <SceneCanvas scene={scene} />
}
