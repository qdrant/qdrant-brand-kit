"use client"

import { clamp, rng } from "../rand"
import { SceneCanvas, alpha, clear, label, type CanvasScene, type Palette } from "../scene"
import { TAU, crosshair, gauss, ids, labelRow, nearest } from "./lib"

// Semantic zoom: a field of stars where each bright star is a cluster of fainter points too small to tell
// apart. A magnifier shows the region under it at 4x on a finer grid: the points resolve, and the 5 nearest
// the lens center are numbered and listed beside it with their ids and distances. It follows the pointer and
// drifts at rest.

const ZOOM = 4
const K = 5

type Star = { x: number; y: number; r: number; a: number; micro: boolean }
type State = { w: number; h: number; p: Palette; stars: Star[]; names: string[]; lx: number; ly: number; last: number }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(61)
    const stars: Star[] = []
    const anchors = Math.round((w * h) / 4200)
    for (let i = 0; i < anchors; i++) {
      const x = rand() * w
      const y = rand() * h
      stars.push({ x, y, r: 1 + rand() * 0.8, a: 0.55 + rand() * 0.45, micro: false })
      const n = 6 + Math.floor(rand() * 10)
      for (let j = 0; j < n; j++)
        stars.push({ x: x + gauss(rand) * 6, y: y + gauss(rand) * 6, r: 0.5 + rand() * 0.3, a: 0.4, micro: true })
    }
    const loose = Math.round((w * h) / 900)
    for (let i = 0; i < loose; i++) stars.push({ x: rand() * w, y: rand() * h, r: 0.5, a: 0.3, micro: true })
    return { w, h, p, stars, names: ids(stars.length, rand), lx: w * 0.55, ly: h * 0.5, last: -1 }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h } = s
    const R = Math.min(w, h) * 0.27
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    const tx = pointer.inside ? pointer.x : w * (0.55 + 0.18 * Math.sin(t * 0.21))
    const ty = pointer.inside ? pointer.y : h * (0.5 + 0.18 * Math.sin(t * 0.29 + 1.4))
    const k = Math.min(1, dt * 6)
    s.lx += (clamp(tx, R + 12, w - R - 12) - s.lx) * k
    s.ly += (clamp(ty, R + 12, h - R - 36) - s.ly) * k
    const { lx, ly } = s
    const reach = R / ZOOM

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The field: points as single pixels, bright stars as small discs.
    ctx.fillStyle = alpha(p.dim, 0.55)
    ctx.beginPath()
    for (const star of s.stars) if (star.micro) ctx.rect(star.x - 0.5, star.y - 0.5, 1, 1)
    ctx.fill()
    ctx.fillStyle = p.star
    for (const star of s.stars) {
      if (star.micro) continue
      ctx.globalAlpha = star.a
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Inside the lens: the region under it at 4x, on an 8px grid scaled with it.
    const inside = (x: number, y: number) => ({ x: lx + (x - lx) * ZOOM, y: ly + (y - ly) * ZOOM })
    // The nearest points to the center that the lens shows.
    const hits = nearest(s.stars, (star) => Math.hypot(star.x - lx, star.y - ly), K).filter(({ d }) => d < reach * 0.9)
    ctx.save()
    ctx.beginPath()
    ctx.arc(lx, ly, R, 0, TAU)
    ctx.clip()
    ctx.fillStyle = p.bg
    ctx.fillRect(lx - R, ly - R, R * 2, R * 2)
    ctx.fillStyle = alpha(p.haze, 0.6)
    ctx.fillRect(lx - R, ly - R, R * 2, R * 2)
    ctx.strokeStyle = p.grid
    ctx.beginPath()
    for (let g = Math.floor((lx - reach) / 8) * 8; g <= lx + reach; g += 8) {
      const x = Math.round(inside(g, 0).x) + 0.5
      ctx.moveTo(x, ly - R)
      ctx.lineTo(x, ly + R)
    }
    for (let g = Math.floor((ly - reach) / 8) * 8; g <= ly + reach; g += 8) {
      const y = Math.round(inside(0, g).y) + 0.5
      ctx.moveTo(lx - R, y)
      ctx.lineTo(lx + R, y)
    }
    ctx.stroke()
    ctx.setLineDash([2, 3])
    ctx.strokeStyle = alpha(p.glow, 0.7)
    ctx.beginPath()
    for (const { i } of hits) {
      const { x, y } = inside(s.stars[i].x, s.stars[i].y)
      ctx.moveTo(lx, ly)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])
    for (const star of s.stars) {
      if (Math.abs(star.x - lx) > reach + 2 || Math.abs(star.y - ly) > reach + 2) continue
      const { x, y } = inside(star.x, star.y)
      ctx.globalAlpha = star.micro ? 0.75 : 1
      ctx.fillStyle = star.micro ? p.star : p.bright
      ctx.beginPath()
      ctx.arc(x, y, star.micro ? 1.8 : star.r * 2.4, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    hits.forEach(({ i }, rank) => {
      const { x, y } = inside(s.stars[i].x, s.stars[i].y)
      ctx.strokeStyle = p.star
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, TAU)
      ctx.stroke()
      label(ctx, p, String(rank + 1), x + 9, y < ly - R + 24 ? y + 12 : y - 9, { color: p.star })
    })
    ctx.restore()

    // The lens: a ring with ticks every 6 degrees, its zoom, and the query at its center.
    ctx.strokeStyle = p.line
    ctx.beginPath()
    ctx.arc(lx, ly, R, 0, TAU)
    for (let deg = 0; deg < 360; deg += 6) {
      const a = (deg * Math.PI) / 180
      const long = deg % 30 === 0 ? 8 : 4
      ctx.moveTo(lx + Math.cos(a) * R, ly + Math.sin(a) * R)
      ctx.lineTo(lx + Math.cos(a) * (R + long), ly + Math.sin(a) * (R + long))
    }
    ctx.stroke()
    crosshair(ctx, p, lx, ly)

    label(ctx, p, `X ${Math.round(lx)}  Y ${Math.round(ly)}`, lx, ly + R + 22, { align: "center" })

    // The list beside the lens, on the side with room (none in a narrow frame).
    const right = lx + R + 170 < w
    const x = right ? lx + R + 22 : lx - R - 22
    const align = right ? "left" : "right"
    const top = clamp(ly - 54, 24, h - 140)
    if (!right && x < 150) return
    labelRow(ctx, p, [[`ZOOM ×${ZOOM}`, p.star], [`K ${hits.length}`, p.label]], x, top, { align })
    hits.forEach(({ i, d }, rank) =>
      labelRow(
        ctx,
        p,
        [
          [String(rank + 1), p.label],
          [s.names[i], rank === 0 ? p.star : p.label],
          [(d / 400).toFixed(4), p.label],
        ],
        x,
        top + 24 + rank * 18,
        { align }
      )
    )
  },
}

export function ZoomLens() {
  return <SceneCanvas scene={scene} />
}
