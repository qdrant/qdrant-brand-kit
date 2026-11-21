"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, gauss, ids, labelRow, prefersStill, readout } from "./lib"

// Late interaction: 8 query token vectors against the 20 token vectors of a document, as a dot-matrix
// heatmap of their cosine similarities (24 dimensions, computed). Each row is scanned for its maximum, the
// running max boxed as it goes; the row maxima sum to the document's MaxSim score. Three documents are
// scored in turn and ranked below.

const DIM = 24
const NQ = 8
const ND = 20
const CYCLE = 8
const DOCS = 3
const ROW = 0.5
const SCAN = 0.016

type Doc = { id: string; sim: number[][]; max: number[]; arg: number[]; score: number }
type State = { w: number; h: number; p: Palette; set: number; docs: Doc[]; still: boolean }

function unit(v: number[]) {
  const n = Math.hypot(...v) || 1
  return v.map((x) => x / n)
}

function makeDocs(set: number): Doc[] {
  const rand = rng(900 + set)
  const random = () => unit(Array.from({ length: DIM }, () => gauss(rand)))
  const query = Array.from({ length: NQ }, random)
  const names = ids(DOCS, rand)
  return names.map((id) => {
    // Some document tokens are near a query token, the rest are unrelated.
    const tokens = Array.from({ length: ND }, () => {
      if (rand() > 0.45) return random()
      const near = query[Math.floor(rand() * NQ)]
      const noise = 0.35 + rand() * 0.6
      return unit(near.map((x) => x + gauss(rand) * noise * 0.2))
    })
    const sim = query.map((q) => tokens.map((d) => q.reduce((sum, x, k) => sum + x * d[k], 0)))
    const arg = sim.map((row) => row.indexOf(Math.max(...row)))
    const max = sim.map((row, i) => row[arg[i]])
    return { id, sim, max, arg, score: max.reduce((a, b) => a + b, 0) }
  })
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, set: 0, docs: makeDocs(0), still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const time = s.still ? CYCLE * 2 + 6 : t
    const set = Math.floor(time / (CYCLE * DOCS))
    if (set !== s.set) {
      s.set = set
      s.docs = makeDocs(set)
    }
    const index = Math.floor((time % (CYCLE * DOCS)) / CYCLE)
    const e = time % CYCLE
    const doc = s.docs[index]
    const fade = 1 - clamp((e - (CYCLE - 0.7)) / 0.6)
    const done = 0.3 + NQ * ROW + 0.2

    const c = Math.max(14, Math.min(22, Math.floor((w - 220) / ND)))
    const gw = ND * c
    const gh = NQ * c
    const x0 = Math.round((w - (gw + 128)) / 2) + 28
    const y0 = Math.round(h * 0.42 - gh / 2)
    const mx = x0 + gw + 28

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The cell grid, and the token labels.
    ctx.strokeStyle = p.grid
    ctx.beginPath()
    for (let j = 0; j <= ND; j++) {
      ctx.moveTo(x0 + j * c + 0.5, y0)
      ctx.lineTo(x0 + j * c + 0.5, y0 + gh)
    }
    for (let i = 0; i <= NQ; i++) {
      ctx.moveTo(x0, y0 + i * c + 0.5)
      ctx.lineTo(x0 + gw, y0 + i * c + 0.5)
    }
    ctx.stroke()
    for (let i = 0; i < NQ; i++) label(ctx, p, `Q${i}`, x0 - 10, y0 + i * c + c / 2, { align: "right" })
    for (let j = 0; j < ND; j += 5) label(ctx, p, `D${j}`, x0 + j * c + c / 2, y0 - 14, { align: "center" })
    label(ctx, p, "MAX", mx, y0 - 14)
    label(ctx, p, `DOC ${doc.id}`, Math.max(16, x0 - 34), y0 - 40, { color: p.star, opacity: fade })

    // Rows, scanned left to right, with the running maximum boxed.
    let sum = 0
    for (let i = 0; i < NQ; i++) {
      const start = 0.3 + i * ROW
      const scanned = Math.floor((e - start) / SCAN)
      if (scanned < 0) continue
      const row = doc.sim[i]
      let best = 0
      for (let j = 0; j < ND && j <= scanned; j++) {
        if (row[j] > row[best]) best = j
        const v = Math.max(0, row[j])
        const r = 0.7 + (c * 0.36 - 0.7) * Math.pow(v, 1.3)
        ctx.globalAlpha = (0.3 + 0.7 * v) * fade
        ctx.fillStyle = v > 0.5 ? p.bright : p.star
        ctx.beginPath()
        ctx.arc(x0 + j * c + c / 2, y0 + i * c + c / 2, r, 0, TAU)
        ctx.fill()
      }
      ctx.globalAlpha = fade
      const final = scanned >= ND
      const bx = x0 + best * c
      const by = y0 + i * c
      ctx.strokeStyle = final ? p.star : p.glow
      ctx.strokeRect(bx + 1.5, by + 1.5, c - 2, c - 2)
      if (final) {
        sum += doc.max[i]
        ctx.strokeStyle = alpha(p.line, 0.8 * fade)
        ctx.setLineDash([2, 3])
        ctx.beginPath()
        ctx.moveTo(bx + c, by + c / 2)
        ctx.lineTo(mx - 6, by + c / 2)
        ctx.stroke()
        ctx.setLineDash([])
        label(ctx, p, doc.max[i].toFixed(3), mx, by + c / 2, { color: p.star, opacity: fade })
      }
      ctx.globalAlpha = 1
    }

    // The running sum, then the score.
    ctx.strokeStyle = alpha(p.line, fade)
    ctx.beginPath()
    ctx.moveTo(mx, y0 + gh + 8.5)
    ctx.lineTo(mx + 52, y0 + gh + 8.5)
    ctx.stroke()
    label(ctx, p, `Σ ${sum.toFixed(3)}`, mx, y0 + gh + 24, { color: p.star, opacity: fade })

    // The ranking of the documents scored so far.
    const scored = s.docs.filter((_, d) => d < index || (d === index && e >= done))
    const ranked = [...scored].sort((a, b) => b.score - a.score)
    const ly = y0 + gh + 56
    label(ctx, p, "RANK  DOC    MAXSIM", x0, ly)
    ranked.forEach((d, r) => {
      const fresh = d === doc ? clamp((e - done) / 0.3) : 1
      labelRow(
        ctx,
        p,
        [
          [`${r + 1}`.padEnd(4, " "), p.label],
          [d.id, r === 0 ? p.star : p.label],
          [d.score.toFixed(3), r === 0 ? p.star : p.label],
        ],
        x0,
        ly + 20 + r * 18,
        { opacity: fresh }
      )
      if (r === 0) {
        ctx.globalAlpha = fresh
        ctx.fillStyle = p.accent
        ctx.fillRect(x0 - 14, ly + 20 + r * 18 - 2, 5, 5)
        ctx.globalAlpha = 1
      }
    })
    if (e >= done)
      readout(ctx, p, [`MAXSIM ${doc.score.toFixed(3)}`, [`${NQ} × ${ND}`, p.label]], mx + 60, ly + 20, {
        align: "right",
        opacity: clamp((e - done) / 0.3) * fade,
      })
  },
}

export function LateInteraction() {
  return <SceneCanvas scene={scene} />
}
