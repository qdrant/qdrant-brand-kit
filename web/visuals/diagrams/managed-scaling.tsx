"use client"

import { clamp, ease } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  type CanvasScene,
  type Palette,
} from "../scene"
import { TAU, arrow, labelRow, prefersStill, readout, textWidth } from "./lib"
import { SHARD, box, nodeName, shard } from "./cluster-marks"

// Fully managed (qdrant.tech/documentation/cloud, Managed Cloud, checked 2026-11-26): Qdrant Cloud runs the cluster,
// with "vertical and horizontal scaling, automatic shard rebalancing, and resharding", scheduled backups, rolling
// upgrades and monitoring. Drawn: Qdrant Cloud above a cluster of three nodes holding eight shards. Scaling adds a
// fourth node (marked as the result), then the rebalancing moves one shard from each of the two fullest nodes onto
// it, so every node holds two. The operations listed are the docs' own; the finished state, four balanced nodes, is
// the reduced-motion frame.

const CYCLE = 12
const OPS = ["SCALING", "BACKUPS", "UPGRADES", "MONITORING"] as const
// Shards per node before and after: each entry is a shard's number.
const BEFORE = [[0, 1, 2], [3, 4, 5], [6, 7], []] as const
const AFTER = [
  [0, 1],
  [3, 4],
  [6, 7],
  [2, 5],
] as const
// The two moves, in order: the shard, and when it leaves.
const MOVES = [
  { shard: 2, at: 2.4 },
  { shard: 5, at: 3.1 },
] as const
const TRAVEL = 0.9

type State = { w: number; h: number; p: Palette; still: boolean }

function slot(shardId: number, layout: readonly (readonly number[])[]) {
  for (let n = 0; n < layout.length; n++) {
    const i = layout[n]!.indexOf(shardId)
    if (i >= 0) return { node: n, i }
  }
  return { node: 0, i: 0 }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const e = s.still ? 6 : t % CYCLE
    const fade = clamp(e / 0.5) * (1 - clamp((e - (CYCLE - 1.2)) / 1))

    const pad = Math.round(clamp(w * 0.045, 12, 24))
    const W = w - 2 * pad
    const inner = w < 460 ? 8 : 12
    const gap = w < 460 ? 6 : 10
    const nodeW = (W - 2 * inner - 3 * gap) / 4
    const cols = nodeW >= 96 ? 3 : 2
    const rows = Math.ceil(3 / cols)
    const nodeH = 30 + rows * SHARD + (rows - 1) * 6 + 12
    // Room under the nodes for the moving shards' arcs, so they cross no names.
    const clusterH = 38 + nodeH + inner + 22
    // Narrow, the operations row is left out so the cluster keeps its size.
    const ops = w >= 460
    const fixed = 24 + (ops ? 30 : 0) + clusterH + 12
    const free = h - 2 * pad - fixed
    const A = clamp(free * 0.55, 24, 72)
    const B = clamp(free * 0.3, 14, 40)
    const top = Math.round((h - (fixed + A + B)) / 2)
    const chipY = top + 12
    const opsY = chipY + (ops ? 30 : 0)
    const clusterTop = Math.round(opsY + 6 + A)
    const nodesTop = clusterTop + 38
    const statusY = Math.round(clusterTop + clusterH + B + 6)
    const cx = w / 2

    clear(ctx, p, w, h)
    ctx.lineWidth = 1

    // Qdrant Cloud and what it runs for you; scaling lights up while the cluster grows.
    const scaling = clamp((e - 0.8) / 0.3) * (1 - clamp((e - 4.4) / 0.4))
    const chipW = textWidth(ctx, p, "QDRANT CLOUD") + 16
    readout(ctx, p, ["QDRANT CLOUD"], cx - chipW / 2, chipY, { opacity: fade })
    if (ops)
      labelRow(
        ctx,
        p,
        OPS.map((op, i): [string, string] => [
          op,
          i === 0 && scaling > 0.5 ? p.bright : p.label,
        ]),
        cx,
        opsY,
        { align: "center", opacity: fade }
      )

    // The connector into the cluster, with a pulse while scaling.
    ctx.strokeStyle = alpha(
      scaling > 0 ? p.glow : p.line,
      (0.6 + 0.4 * scaling) * fade
    )
    arrow(ctx, { x: cx, y: opsY + 12 }, { x: cx, y: clusterTop - 4 }, 5)
    const pulse = clamp((e - 0.8) / 0.6)
    if (pulse > 0 && pulse < 1) {
      const y = opsY + 12 + (clusterTop - 4 - opsY - 12) * ease(pulse)
      ctx.fillStyle = alpha(p.bright, fade)
      ctx.beginPath()
      ctx.arc(cx, y, 2.5, 0, TAU)
      ctx.fill()
    }

    // The cluster.
    box(ctx, p, pad, clusterTop, W, clusterH, { opacity: fade })
    labelRow(ctx, p, [["CLUSTER", p.star]], pad + inner + 2, clusterTop + 19, {
      opacity: fade,
    })
    const grown = e >= 1.7
    labelRow(
      ctx,
      p,
      [
        ["NODES", p.label],
        [grown ? "4" : "3", grown ? p.bright : p.star],
      ],
      w - pad - inner - 2,
      clusterTop + 19,
      { align: "right", opacity: fade }
    )

    const nodeX = (n: number) => pad + inner + n * (nodeW + gap)
    const shardAt = (n: number, i: number) => ({
      x: nodeX(n) + 10 + (i % cols) * (SHARD + 6),
      y: nodesTop + 30 + Math.floor(i / cols) * (SHARD + 6),
    })
    const added = ease((e - 1.4) / 0.6)
    for (let n = 0; n < 4; n++) {
      const on = (n === 3 ? added : 1) * fade
      if (on <= 0) continue
      box(ctx, p, nodeX(n), nodesTop, nodeW, nodeH, {
        opacity: on,
        radius: 4,
        stroke: n === 3 && added < 1 ? alpha(p.glow, 0.8) : p.line,
        dash: n === 3 && added < 1 ? [3, 3] : undefined,
      })
      nodeName(
        ctx,
        p,
        w < 460 ? `N${n + 1}` : `NODE ${n + 1}`,
        nodeX(n) + 10,
        nodesTop + 15,
        {
          opacity: on,
          mark: n === 3 ? p.accent : undefined,
        }
      )
    }

    // The shards: still ones in place, the two moving ones on an arc over the nodes.
    const moving = new Map<number, number>(
      MOVES.map((m) => [m.shard, (e - m.at) / TRAVEL])
    )
    for (let id = 0; id < 8; id++) {
      const k = moving.get(id)
      const from = slot(id, BEFORE)
      const to = slot(id, AFTER)
      const a = shardAt(from.node, from.i)
      const b = shardAt(to.node, to.i)
      // A finished move leaves its trail for a while; the reduced-motion frame keeps it, so the move still reads.
      const trail =
        k !== undefined && k >= 1
          ? s.still
            ? 0.6
            : 0.6 * (1 - clamp((e - 5.2) / 0.8))
          : 0
      if (trail > 0) {
        const c = { x: (a.x + b.x) / 2, y: nodesTop + nodeH + 44 }
        ctx.save()
        ctx.setLineDash([2, 3])
        ctx.strokeStyle = alpha(p.glow, trail * fade)
        ctx.beginPath()
        ctx.moveTo(a.x + SHARD / 2, a.y + SHARD / 2)
        ctx.quadraticCurveTo(
          c.x + SHARD / 2,
          c.y + SHARD / 2,
          b.x + SHARD / 2,
          b.y + SHARD / 2
        )
        ctx.stroke()
        ctx.restore()
        ctx.strokeStyle = alpha(p.glow, trail * fade)
        ctx.beginPath()
        ctx.roundRect(
          Math.round(a.x) + 0.5,
          Math.round(a.y) + 0.5,
          SHARD - 1,
          SHARD - 1,
          3
        )
        ctx.setLineDash([2, 2])
        ctx.stroke()
        ctx.setLineDash([])
      }
      if (k === undefined || k <= 0 || k >= 1) {
        const at = k !== undefined && k >= 1 ? b : a
        shard(ctx, p, at.x, at.y, { opacity: fade })
        continue
      }
      const u = ease(k)
      const c = { x: (a.x + b.x) / 2, y: nodesTop + nodeH + 44 }
      const along = (v: number) => ({
        x: (1 - v) ** 2 * a.x + 2 * (1 - v) * v * c.x + v * v * b.x,
        y: (1 - v) ** 2 * a.y + 2 * (1 - v) * v * c.y + v * v * b.y,
      })
      ctx.save()
      ctx.setLineDash([2, 3])
      ctx.strokeStyle = alpha(p.glow, 0.7 * fade)
      ctx.beginPath()
      for (let i = 0; i <= 24; i++) {
        const pt = along((i / 24) * u)
        const x = pt.x + SHARD / 2
        const y = pt.y + SHARD / 2
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.stroke()
      ctx.restore()
      const pt = along(u)
      shard(ctx, p, pt.x, pt.y, { opacity: fade, lit: 1 })
    }

    // What's happening, in the docs' words.
    const horizontal = clamp((e - 1.2) / 0.3) * (1 - clamp((e - 2.6) / 0.4))
    const rebalance = clamp((e - 2.4) / 0.3) * (1 - clamp((e - 4.4) / 0.4))
    labelRow(
      ctx,
      p,
      [
        ["HORIZONTAL SCALING", horizontal > 0.5 ? p.bright : p.label],
        ["SHARD REBALANCING", rebalance > 0.5 ? p.bright : p.label],
      ],
      cx,
      statusY,
      { align: "center", opacity: fade }
    )
  },
}

export function ManagedScaling() {
  return <SceneCanvas scene={scene} />
}
