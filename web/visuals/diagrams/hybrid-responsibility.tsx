"use client"

import { clamp } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  label,
  type CanvasScene,
  type Palette,
} from "../scene"
import { arrow, labelRow, mono, prefersStill, readout, textWidth } from "./lib"

// Who runs what in Hybrid Cloud (Hybrid Cloud page, "Hybrid Cloud Puts Kubernetes Operations in Your Hands",
// 2026-11-26), instead of the site's two-column PNG (hybrid-cloud-agentic.png). Drawn as layers, not as the
// Architecture Diagram section's two planes: Qdrant Cloud on top, the customer's Kubernetes cluster under it. What
// Qdrant operates has an indigo edge: the control plane and the container registry in Qdrant Cloud, and in the
// customer's cluster the Cloud Agent, the Kubernetes Operator and the Qdrant clusters they configure and manage.
// What the customer runs has a quiet edge: the Kubernetes environment, load balancers and block storage. Both
// connections are opened from inside, outbound on port 443 (the agent to the control plane, the cluster pulling
// images and charts from the registry); nothing is opened inbound. Status goes up and instructions and images come
// down over them. Checked against the page's FAQ and /documentation/hybrid-cloud/ (grpc.cloud.qdrant.io,
// api.cloud.qdrant.io and registry.cloud.qdrant.io, all outbound on 443), 2026-11-26.

const BUILD = 1.6
const FADE_AT = 11
const CYCLE = FADE_AT + 1.2

type State = { w: number; h: number; p: Palette; still: boolean }
type Box = { x: number; y: number; w: number; h: number }

function rect(
  ctx: CanvasRenderingContext2D,
  b: Box,
  r: number,
  fill: string | null,
  stroke: string | null
) {
  ctx.beginPath()
  ctx.roundRect(Math.round(b.x) + 0.5, Math.round(b.y) + 0.5, Math.round(b.w), Math.round(b.h), r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

// A part, centered on x: a chip with its name, on two lines when one won't fit the width it has. Qdrant's parts have
// an indigo edge over a faint indigo fill; the customer's a quiet edge. Returns its box.
function part(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  text: string,
  cx: number,
  cy: number,
  maxW: number,
  qdrant: boolean,
  opacity: number,
  fullWidth = false
): Box {
  const words = text.split(" ")
  const one = textWidth(ctx, p, text) + 20 <= maxW
  const lines = one
    ? [text]
    : [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")]
  const width = fullWidth
    ? maxW
    : Math.min(maxW, Math.max(...lines.map((l) => textWidth(ctx, p, l))) + 20)
  const height = lines.length === 1 ? 26 : 40
  const b = { x: cx - width / 2, y: cy - height / 2, w: width, h: height }
  ctx.save()
  ctx.globalAlpha = opacity
  rect(
    ctx,
    b,
    5,
    qdrant ? alpha(p.glow, 0.1) : alpha(p.surface, 0.95),
    qdrant ? p.glow : p.line
  )
  ctx.font = mono(p)
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = p.star
  lines.forEach((l, i) =>
    ctx.fillText(l, Math.round(cx), Math.round(cy + 1 + (i - (lines.length - 1) / 2) * 15))
  )
  ctx.restore()
  return b
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const e = s.still ? FADE_AT - 1 : t % CYCLE
    const fade = s.still ? 1 : 1 - clamp((e - FADE_AT) / 1)
    const show = (at: number) => (s.still ? 1 : clamp((e - at) / 0.4)) * fade
    clear(ctx, p, w, h)

    const m = 16
    const narrow = w < 460
    const colA = Math.round(w * (narrow ? 0.27 : 0.3))
    const colB = Math.round(w * (narrow ? 0.73 : 0.7))
    const colW = Math.round(w * 0.4) - 12

    // The rows, spread over the frame's height.
    const legendY = h - 18
    const cloud = { x: m, y: 12, w: w - 2 * m, h: narrow ? 82 : 70 }
    const gapY = narrow ? 84 : 76
    const yours = { x: m, y: cloud.y + cloud.h + gapY, w: w - 2 * m, h: 0 }
    yours.h = legendY - 22 - yours.y
    const rowsY = [0.29, 0.52, 0.73, 0.9].map((k) => Math.round(yours.y + yours.h * k))

    // Qdrant Cloud.
    ctx.save()
    ctx.globalAlpha = show(0)
    rect(ctx, cloud, 10, null, alpha(p.line, 0.9))
    ctx.restore()
    label(ctx, p, "QDRANT CLOUD", w / 2, cloud.y + 16, { align: "center", color: p.star, opacity: show(0) })
    const partY = cloud.y + cloud.h - (narrow ? 26 : 22)
    const controlPlane = part(ctx, p, "CONTROL PLANE", colA, partY, colW, true, show(0.2))
    const registry = part(ctx, p, "CONTAINER REGISTRY", colB, partY, colW, true, show(0.3))

    // The customer's Kubernetes cluster.
    ctx.save()
    ctx.globalAlpha = show(0.5)
    rect(ctx, yours, 10, null, alpha(p.line, 0.9))
    ctx.restore()
    // Its name, centered between the two connections, on two lines when one would reach them.
    const name = "YOUR KUBERNETES CLUSTER"
    const nameLines =
      textWidth(ctx, p, name) + 32 <= colB - colA ? [name] : ["YOUR KUBERNETES", "CLUSTER"]
    nameLines.forEach((line, i) =>
      label(ctx, p, line, w / 2, yours.y + 16 + i * 15, {
        align: "center",
        color: p.star,
        opacity: show(0.5),
      })
    )
    const agent = part(ctx, p, "CLOUD AGENT", colA, rowsY[0]!, colW, true, show(0.7))
    const operator = part(ctx, p, "KUBERNETES OPERATOR", colB, rowsY[0]!, colW, true, show(0.8))
    part(ctx, p, "QDRANT CLUSTERS", w / 2, rowsY[1]!, w - 2 * m - 28, true, show(0.9), true)
    part(ctx, p, "LOAD BALANCERS", colA, rowsY[2]!, colW, false, show(1.1))
    part(ctx, p, "BLOCK STORAGE", colB, rowsY[2]!, colW, false, show(1.15))
    part(ctx, p, "KUBERNETES ENVIRONMENT", w / 2, rowsY[3]!, w - 2 * m - 28, false, show(1.2), true)


    // The two connections, opened from inside: arrows point up, to where they connect.
    const links = [
      { from: agent, to: controlPlane, x: colA },
      { from: operator, to: registry, x: colB },
    ]
    links.forEach(({ from, to, x }, i) => {
      const y1 = from.y
      const y0 = to.y + to.h
      const on = show(1.4 + i * 0.1)
      ctx.save()
      ctx.globalAlpha = on * 0.8
      ctx.strokeStyle = p.glow
      ctx.lineWidth = 1
      arrow(ctx, { x: x + 0.5, y: y1 }, { x: x + 0.5, y: y0 + 1 }, 6)
      ctx.restore()

      // Up: status and metrics (the agent); down: instructions, and images and charts (the registry).
      if (!s.still && e > BUILD && e < FADE_AT) {
        for (let k = 0; k < 2; k++) {
          const u = ((e - BUILD) * 0.32 + k * 0.5 + i * 0.25) % 1
          const upward = i === 0 && k === 0
          const y = upward ? y1 - (y1 - y0) * u : y0 + (y1 - y0) * u
          ctx.save()
          ctx.globalAlpha = on * Math.sin(u * Math.PI)
          ctx.fillStyle = p.bright
          if (upward) ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4)
          else {
            ctx.beginPath()
            ctx.arc(x + 0.5, y, 2.5, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }
      }
    })

    // The port, once, between the two connections: the key fact, marked in amaranth.
    // and under it, that nothing comes in.
    const portW = textWidth(ctx, p, "OUTBOUND  443") + 13 + 16
    const portY = Math.round(cloud.y + cloud.h + gapY / 2 - 8)
    readout(ctx, p, [["OUTBOUND", p.label], "443"], w / 2 - portW / 2, portY, {
      opacity: show(1.5),
      mark: p.accent,
      align: "left",
    })
    labelRow(
      ctx,
      p,
      [
        ["INBOUND", p.label],
        ["NONE", p.star],
      ],
      w / 2,
      portY + 24,
      { align: "center", opacity: show(1.5) }
    )

    // The legend.
    const items: [string, boolean][] = [
      ["QDRANT OPERATES", true],
      ["YOU RUN", false],
    ]
    const widths = items.map(([text]) => textWidth(ctx, p, text) + 18)
    const total = widths[0]! + widths[1]! + 24
    let x = (w - total) / 2
    items.forEach(([text, qdrant], i) => {
      ctx.save()
      ctx.globalAlpha = show(1.6)
      rect(
        ctx,
        { x, y: legendY - 5, w: 10, h: 10 },
        2,
        qdrant ? alpha(p.glow, 0.1) : alpha(p.surface, 0.95),
        qdrant ? p.glow : p.line
      )
      ctx.restore()
      label(ctx, p, text, x + 18, legendY, { color: p.label, opacity: show(1.6) })
      x += widths[i]! + 24
    })
  },
}

export function HybridResponsibility() {
  return <SceneCanvas scene={scene} />
}
