"use client"

import { clamp, ease } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import {
  TAU,
  hexCorners,
  labelRow,
  poly,
  prefersStill,
  readout,
  textWidth,
} from "./lib"
import { SHARD, box, nodeName, shard } from "./cluster-marks"

// Private Cloud, on-premise (qdrant.tech/documentation/private-cloud, checked 2026-11-26): Qdrant clusters run in your
// own Kubernetes, on your own storage and compute, managed by the Qdrant operator, and Private Cloud "has no connection
// to Qdrant Cloud". Drawn: your infrastructure as an indigo perimeter; inside it, your applications querying a
// Qdrant cluster of nodes in Kubernetes, linked to the operator that manages them, every query and answer staying
// inside; outside, Qdrant Cloud, dim, with no connection. Wide, the applications and Qdrant Cloud show; narrow, the
// cluster takes the width. Queries keep coming, so there's no cycle; the reduced-motion frame holds a few in flight.

const PERIOD = 0.9
const GO = 1.1
const DWELL = 0.25

type State = { w: number; h: number; p: Palette; still: boolean }

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const time = s.still ? 12 : t
    const fade = clamp(time / 0.6)
    const wide = w >= 720

    const pad = Math.round(clamp(h * 0.08, 12, 24))
    const outside = wide ? Math.round(clamp(w * 0.19, 190, 240)) : 0
    const x0 = pad
    const x1 = w - pad - outside
    const y0 = pad
    const y1 = h - pad
    const cy = (y0 + y1) / 2

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // The perimeter: your infrastructure.
    box(ctx, p, x0, y0, x1 - x0, y1 - y0, {
      opacity: fade,
      radius: 8,
      stroke: alpha(p.glow, 0.85),
      fill: alpha(p.glow, 0.04),
    })
    labelRow(
      ctx,
      p,
      [
        ["YOUR INFRASTRUCTURE", p.star],
        ["ON-PREMISE", p.bright],
      ],
      x0 + 16,
      y0 + 20,
      { opacity: fade }
    )

    // Kubernetes, with the Qdrant operator and the cluster's nodes.
    const appsX = x0 + 96
    const kx0 = wide ? x0 + 196 : x0 + 12
    const kx1 = x1 - (wide ? 24 : 12)
    const ky0 = y0 + 40
    const ky1 = y1 - 12
    box(ctx, p, kx0, ky0, kx1 - kx0, ky1 - ky0, { opacity: fade })
    labelRow(ctx, p, [["KUBERNETES", p.star]], kx0 + 14, ky0 + 19, {
      opacity: fade,
    })
    const opW = textWidth(ctx, p, "QDRANT OPERATOR") + 16
    readout(ctx, p, [["QDRANT OPERATOR", p.star]], kx1 - 10, ky0 + 19, {
      opacity: fade,
      align: "right",
    })

    const N = wide ? 4 : 3
    const inner = wide ? 14 : 8
    const gap = wide ? 12 : 6
    const nodeW = (kx1 - kx0 - 2 * inner - (N - 1) * gap) / N
    const cols = nodeW >= 96 ? 3 : 2
    const per = 3
    const rows = Math.ceil(per / cols)
    const nodeH = 30 + rows * SHARD + (rows - 1) * 6 + 12
    // Wide, room for the operator's links above the nodes and the queries' lane below; narrow, the links only.
    const nodesTop = Math.round(
      ky0 + 38 + Math.min(26, (ky1 - ky0 - 38 - nodeH) * 0.5)
    )
    const nodesBottom = nodesTop + nodeH
    const laneY = Math.round((nodesBottom + ky1) / 2) + 0.5
    const nodeX = (n: number) => kx0 + inner + n * (nodeW + gap)
    const mid = (n: number) => Math.round(nodeX(n) + nodeW / 2) + 0.5
    const shardAt = (n: number, i: number) => ({
      x: nodeX(n) + 10 + (i % cols) * (SHARD + 6),
      y: nodesTop + 30 + Math.floor(i / cols) * (SHARD + 6),
    })

    // The operator manages every node: a dashed link from it to each one.
    const busY =
      Math.round(nodesTop - Math.min(14, (nodesTop - ky0 - 31) / 2)) + 0.5
    const opX = Math.round(kx1 - 10 - opW / 2) + 0.5
    ctx.save()
    ctx.setLineDash([2, 3])
    ctx.strokeStyle = alpha(p.label, 0.6 * fade)
    ctx.beginPath()
    ctx.moveTo(opX, ky0 + 32)
    ctx.lineTo(opX, busY)
    ctx.moveTo(Math.min(mid(0), opX), busY)
    ctx.lineTo(Math.max(mid(N - 1), opX), busY)
    for (let n = 0; n < N; n++) {
      ctx.moveTo(mid(n), busY)
      ctx.lineTo(mid(n), nodesTop)
    }
    ctx.stroke()
    ctx.restore()

    // Queries: from an application along the lane to a node, and the answer back, all inside the perimeter. Narrow,
    // the shards answer without the applications.
    const apps = [-1, 0, 1].map((k) => ({
      x: appsX,
      y: Math.round(cy + 14 + k * 46) + 0.5,
    }))
    const trunkX = Math.round(kx0 - 24) + 0.5
    if (wide) {
      ctx.strokeStyle = alpha(p.glow, 0.35 * fade)
      ctx.beginPath()
      for (const app of apps) {
        ctx.moveTo(app.x + 12, app.y)
        ctx.lineTo(trunkX, app.y)
      }
      ctx.moveTo(trunkX, apps[0]!.y)
      ctx.lineTo(trunkX, laneY)
      ctx.lineTo(mid(N - 1), laneY)
      for (let n = 0; n < N; n++) {
        ctx.moveTo(mid(n), laneY)
        ctx.lineTo(mid(n), nodesBottom)
      }
      ctx.stroke()
    }

    for (let n = 0; n < N; n++) {
      box(ctx, p, nodeX(n), nodesTop, nodeW, nodeH, {
        opacity: fade,
        radius: 4,
      })
      nodeName(ctx, p, `NODE ${n + 1}`, nodeX(n) + 10, nodesTop + 15, {
        opacity: fade,
      })
    }

    const lit = new Map<string, number>()
    const dots: { x: number; y: number; going: boolean }[] = []
    const first = Math.max(0, Math.floor((time - (2 * GO + DWELL)) / PERIOD))
    const last = Math.floor(time / PERIOD)
    for (let i = first; i <= last; i++) {
      const e = time - i * PERIOD
      if (e < 0) continue
      const app = apps[i % 3]!
      const n = (i * 7 + 1) % N
      const k = (i * 5 + 2) % per
      const glow =
        clamp((e - GO) / 0.15) * (1 - clamp((e - GO - DWELL - 0.4) / 0.4))
      const key = `${n}-${k}`
      lit.set(key, Math.max(lit.get(key) ?? 0, glow))
      if (!wide) continue
      const going = e < GO
      const back = e > GO + DWELL && e < 2 * GO + DWELL
      if (!going && !back) continue
      const u = going ? ease(e / GO) : 1 - ease((e - GO - DWELL) / GO)
      const route = [
        { x: app.x + 12, y: app.y },
        { x: trunkX, y: app.y },
        { x: trunkX, y: laneY },
        { x: mid(n), y: laneY },
        { x: mid(n), y: nodesBottom },
      ]
      const lengths = route
        .slice(1)
        .map((b, j) => Math.hypot(b.x - route[j]!.x, b.y - route[j]!.y))
      let left = u * lengths.reduce((sum, l) => sum + l, 0)
      for (let j = 0; j < lengths.length; j++) {
        const l = lengths[j]!
        if (left <= l || j === lengths.length - 1) {
          const a = route[j]!
          const b = route[j + 1]!
          const f = l ? Math.min(1, left / l) : 0
          dots.push({
            x: a.x + (b.x - a.x) * f,
            y: a.y + (b.y - a.y) * f,
            going,
          })
          break
        }
        left -= l
      }
    }
    for (let n = 0; n < N; n++)
      for (let k = 0; k < per; k++) {
        const at = shardAt(n, k)
        shard(ctx, p, at.x, at.y, {
          opacity: fade,
          lit: lit.get(`${n}-${k}`) ?? 0,
        })
      }
    for (const dot of dots) {
      ctx.fillStyle = alpha(dot.going ? p.bright : p.glow, fade)
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, dot.going ? 2.5 : 2, 0, TAU)
      ctx.fill()
    }

    if (wide) {
      // Your applications.
      labelRow(ctx, p, [["APPLICATIONS", p.label]], appsX, apps[0]!.y - 30, {
        align: "center",
        opacity: fade,
      })
      for (const app of apps) {
        poly(ctx, hexCorners(app.x, app.y, 10))
        ctx.fillStyle = alpha(p.glow, 0.16 * fade)
        ctx.fill()
        ctx.strokeStyle = alpha(p.glow, 0.8 * fade)
        ctx.stroke()
      }

      // Outside: Qdrant Cloud, with no connection.
      const chipW = textWidth(ctx, p, "QDRANT CLOUD") + 16
      const ox = x1 + Math.round((w - x1 - chipW) / 2) + 12
      readout(ctx, p, ["QDRANT CLOUD"], ox, cy, { opacity: 0.55 * fade })
      labelRow(ctx, p, [["NO CONNECTION", p.label]], ox + chipW / 2, cy + 30, {
        align: "center",
        opacity: fade,
      })
      ctx.save()
      ctx.setLineDash([2, 4])
      ctx.strokeStyle = alpha(p.label, 0.6 * fade)
      ctx.beginPath()
      ctx.moveTo(ox - 6, cy)
      ctx.lineTo(x1 + 18, cy)
      ctx.stroke()
      ctx.restore()
      ctx.strokeStyle = alpha(p.label, 0.8 * fade)
      ctx.beginPath()
      ctx.moveTo(x1 + 14, cy - 6)
      ctx.lineTo(x1 + 14, cy + 6)
      ctx.stroke()
    }
  },
}

export function OnPremise() {
  return <SceneCanvas scene={scene} />
}
