"use client"

import { useEffect, useRef, useState } from "react"

import { type } from "@qdrant/web/lib/type"

import { rng } from "./rand"
import { SceneCanvas, clear, alpha, label, type CanvasScene, type Palette } from "./scene"

// Card surfaces for web sections. They wrap ordinary content; the effects live in the surface, never in a
// design-system component (web/AGENTS.md). The copy is a placeholder: real copy comes from the page's Figma.

function CardCopy() {
  return (
    <div className="flex flex-col gap-2">
      <span className={type.kicker}>Kicker</span>
      <h3 className={type.h6}>Card title</h3>
      <p className={type.small}>
        Placeholder supporting text, one or two lines. The copy comes from the page&apos;s Figma.
      </p>
    </div>
  )
}

// Glass layers (Glass Engine): a translucent card over two cutaway layers, with etched telemetry, corner
// marks and a ruler. On hover the layers open apart.
export function GlassCard() {
  return (
    <div className="sp-glass">
      <div className="sp-glass__layer sp-glass__layer--2" />
      <div className="sp-glass__layer sp-glass__layer--1" />
      <div className="sp-glass__card">
        <span className="sp-glass__etch sp-readout">MOD 03 / 12</span>
        <span className="sp-corner sp-corner--tl" />
        <span className="sp-corner sp-corner--tr" />
        <span className="sp-corner sp-corner--bl" />
        <span className="sp-corner sp-corner--br" />
        <CardCopy />
        <div className="sp-glass__ruler" />
      </div>
    </div>
  )
}

// Annotated: a plain card measured like a drawing: crop marks, its real width and height on dimension
// lines, and its padding. The marks turn to the accent on hover.
export function AnnotatedCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const resize = new ResizeObserver(() =>
      setBox({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) })
    )
    resize.observe(el)
    return () => resize.disconnect()
  }, [])

  return (
    <div className="sp-annot">
      <div className="sp-annot__dim sp-annot__dim--x">
        <span className="sp-readout">{box.w}</span>
      </div>
      <div className="sp-annot__dim sp-annot__dim--y">
        <span className="sp-readout">{box.h}</span>
      </div>
      <div ref={ref} className="sp-annot__card">
        <span className="sp-annot__crop sp-annot__crop--tl" />
        <span className="sp-annot__crop sp-annot__crop--tr" />
        <span className="sp-annot__crop sp-annot__crop--bl" />
        <span className="sp-annot__crop sp-annot__crop--br" />
        <span className="sp-annot__pad">
          <span className="sp-readout">24</span>
        </span>
        <CardCopy />
      </div>
    </div>
  )
}

// Radar sweep: a dome of range rings swept from left to right. Stars glow as the sweep passes and fade
// after it; three are results, and show their score while lit.
type Blip = { a: number; r: number; size: number; hit: string | null }
type SweepState = { w: number; h: number; p: Palette; blips: Blip[] }

const sweep: CanvasScene<SweepState> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(8)
    const blips: Blip[] = Array.from({ length: 70 }, (_, i) => ({
      a: Math.PI * (1.04 + rand() * 0.92),
      r: 0.12 + Math.sqrt(rand()) * 0.86,
      size: 0.7 + rand() * 1.1,
      hit: i < 3 ? (0.96 - i * 0.04).toFixed(2) : null,
    }))
    return { w, h, p, blips }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const cx = w / 2
    const cy = h - 12
    const R = Math.min(w * 0.46, h - 24)
    const angle = Math.PI + ((t * 0.32) % 1.2) * Math.PI
    clear(ctx, p, w, h)

    ctx.strokeStyle = p.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    for (const f of [0.25, 0.5, 0.75, 1]) {
      ctx.moveTo(cx + R * f, cy)
      ctx.arc(cx, cy, R * f, 0, Math.PI, true)
    }
    for (let k = 1; k < 6; k++) {
      const a = Math.PI + (k * Math.PI) / 6
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R)
    }
    ctx.moveTo(cx - R - 8, cy + 0.5)
    ctx.lineTo(cx + R + 8, cy + 0.5)
    ctx.stroke()

    if (angle < Math.PI * 2) {
      const wedge = ctx.createConicGradient(angle - 0.7, cx, cy)
      const end = 0.7 / (Math.PI * 2)
      wedge.addColorStop(0, alpha(p.glow, 0))
      wedge.addColorStop(end, alpha(p.glow, 0.22))
      wedge.addColorStop(end + 0.0001, alpha(p.glow, 0))
      ctx.fillStyle = wedge
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, R, Math.PI, Math.PI * 2)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = p.glow
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R)
      ctx.stroke()
    }

    for (const blip of s.blips) {
      const behind = angle - blip.a
      const glow = behind >= 0 ? Math.exp(-behind / 0.9) : 0
      const x = cx + Math.cos(blip.a) * blip.r * R
      const y = cy + Math.sin(blip.a) * blip.r * R
      ctx.globalAlpha = 0.15 + glow * 0.85
      ctx.fillStyle = blip.hit && glow > 0.05 ? p.accent : p.star
      ctx.beginPath()
      ctx.arc(x, y, blip.size + glow * 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      if (blip.hit && glow > 0.05) label(ctx, p, blip.hit, x + 8, y - 8, { opacity: glow })
    }
  },
}

export function SweepCard() {
  return (
    <div className="sp-card">
      <div className="sp-card__visual">
        <SceneCanvas scene={sweep} />
      </div>
      <div className="p-6">
        <CardCopy />
      </div>
    </div>
  )
}

// Constellation: a card whose header holds a small field of stars. Point at it and the pointer becomes a
// query: its six nearest stars connect to it, ranked, while the rest dim. At rest it idles at half strength.
type ConState = { w: number; h: number; p: Palette; stars: { x: number; y: number }[]; qx: number; qy: number; on: number; last: number }

const constellation: CanvasScene<ConState> = {
  setup({ width: w, height: h }, p) {
    const rand = rng(17)
    const stars = Array.from({ length: 46 }, () => ({ x: 12 + rand() * (w - 24), y: 12 + rand() * (h - 24) }))
    return { w, h, p, stars, qx: w * 0.62, qy: h * 0.5, on: 0.4, last: -1 }
  },
  draw(ctx, s, t, pointer) {
    const { p, w, h } = s
    const dt = s.last < 0 ? 1 : Math.min(0.1, t - s.last)
    s.last = t
    const k = Math.min(1, dt * 7)
    const tx = pointer.inside ? pointer.x : w * (0.6 + 0.12 * Math.sin(t * 0.4))
    const ty = pointer.inside ? pointer.y : h * (0.5 + 0.18 * Math.sin(t * 0.55 + 1))
    s.qx += (tx - s.qx) * k
    s.qy += (ty - s.qy) * k
    s.on += ((pointer.inside ? 1 : 0.45) - s.on) * k

    clear(ctx, p, w, h)
    const ranked = s.stars
      .map((star, i) => [Math.hypot(star.x - s.qx, star.y - s.qy), i] as const)
      .sort((a, b) => a[0] - b[0])
    const near = new Map(ranked.slice(0, 6).map(([d, i], rank) => [i, { d, rank }]))

    ctx.lineWidth = 1
    for (const [i, { rank }] of near) {
      const star = s.stars[i]
      ctx.globalAlpha = s.on * (1 - rank * 0.12)
      ctx.strokeStyle = p.glow
      ctx.beginPath()
      ctx.moveTo(s.qx, s.qy)
      ctx.lineTo(star.x, star.y)
      ctx.stroke()
    }
    s.stars.forEach((star, i) => {
      const hit = near.get(i)
      ctx.globalAlpha = hit ? 0.5 + 0.5 * s.on : 0.55 - 0.3 * s.on
      ctx.fillStyle = hit ? p.star : p.dim
      ctx.beginPath()
      ctx.arc(star.x, star.y, hit ? 2 : 1.3, 0, Math.PI * 2)
      ctx.fill()
      // The rank sits on the far side of the star from the query, off its line.
      if (hit && hit.rank < 3) {
        const d = Math.max(1, hit.d)
        const lx = star.x + ((star.x - s.qx) / d) * 10
        const ly = star.y + ((star.y - s.qy) / d) * 10
        label(ctx, p, String(hit.rank + 1), lx, ly, { opacity: s.on, align: "center" })
      }
    })
    ctx.globalAlpha = 1
    ctx.strokeStyle = p.accent
    ctx.beginPath()
    ctx.arc(s.qx, s.qy, 4, 0, Math.PI * 2)
    ctx.stroke()
  },
}

export function ConstellationCard() {
  return (
    <div className="sp-card">
      <div className="sp-card__visual cursor-crosshair">
        <SceneCanvas scene={constellation} />
      </div>
      <div className="p-6">
        <CardCopy />
      </div>
    </div>
  )
}
