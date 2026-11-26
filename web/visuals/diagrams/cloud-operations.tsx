"use client"

import { clamp, ease } from "./rand"
import {
  SceneCanvas,
  alpha,
  clear,
  label,
  type CanvasScene,
  type Palette,
} from "../scene"
import { labelRow, mono, prefersStill, textWidth, type Pt } from "./lib"

// Cluster operations in Qdrant Cloud (Cloud page, "Offload Operations to Qdrant Cloud", 2026-11-26), instead of the
// site's list of four cards over a photo (infrastructure.png). One cluster, three shards with a replication factor
// of 2 on three nodes, goes through the operations the page lists, one after another, with no operator action:
// - upgrades: rolling, one node at a time, while each shard's other replica keeps serving (zero downtime needs a
//   replication factor of 2 or more);
// - scaling: a fourth node joins (horizontal scaling);
// - sharding: replicas move to the new node, so every node carries a fair share (automatic shard rebalancing);
// - backups: every node's data goes to scheduled backups, kept for their retention;
// - monitoring: RAM on every node, against the 80% alert threshold.
// Checked against /documentation/cloud/ (Update, Scale, Backup and Monitor Clusters) and
// /documentation/cloud/cluster-monitoring/ (alerts on memory or disk above 80%), 2026-11-26. Shard numbers and RAM
// levels are illustrative. The active step is marked in amaranth; connectors are indigo.

const STAGES = [
  { name: "UPGRADES", detail: "ROLLING, ZERO DOWNTIME" },
  { name: "SCALING", detail: "HORIZONTAL: A NODE JOINS" },
  { name: "SHARDING", detail: "AUTOMATIC SHARD REBALANCING" },
  { name: "BACKUPS", detail: "SCHEDULED, WITH RETENTION" },
  { name: "MONITORING", detail: "METRICS, LOGS, ALERTS AT 80%" },
] as const

const START = 0.6
const STAGE = 3.4
const FADE_AT = START + STAGES.length * STAGE
const CYCLE = FADE_AT + 1.4
// Reduced motion: the finished state, all four nodes balanced and watched.
const STILL = START + 4 * STAGE + 1.6

// Replicas per node, as [shard, shard] (null: an empty slot). Three nodes, replication factor 2.
const BEFORE: (number | null)[][] = [
  [0, 1],
  [1, 2],
  [2, 0],
  [null, null],
]
// Rebalancing moves node 0's shard 1 and node 2's shard 0 to the new node.
const MOVES = [
  { from: { node: 0, slot: 1 }, to: { node: 3, slot: 0 } },
  { from: { node: 2, slot: 1 }, to: { node: 3, slot: 1 } },
]
// RAM per node, 0 to 1, before and after the new node takes its share.
const RAM_BEFORE = [0.66, 0.62, 0.64, 0]
const RAM_AFTER = [0.42, 0.6, 0.44, 0.58]
// How high a moving replica's arc rises over the nodes.
const LIFT = 96

type State = { w: number; h: number; p: Palette; still: boolean }

function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | null,
  stroke: string | null,
  dash?: number[]
) {
  ctx.beginPath()
  ctx.roundRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h), r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.save()
    if (dash) ctx.setLineDash(dash)
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
  }
}

// A shard replica: a chip with its name, or an empty dashed slot.
function shard(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  x: number,
  y: number,
  w: number,
  name: string,
  options: { opacity?: number; edge?: string } = {}
) {
  ctx.save()
  ctx.globalAlpha = options.opacity ?? 1
  box(ctx, x, y, w, 22, 4, alpha(p.surface, 0.95), options.edge ?? p.line)
  ctx.font = mono(p)
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = p.star
  ctx.fillText(name, Math.round(x + w / 2), Math.round(y + 12))
  ctx.restore()
}

// A point along the arc from a to b, rising over the nodes.
function arc(a: Pt, b: Pt, lift: number, u: number): Pt {
  const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - lift }
  const v = 1 - u
  return {
    x: v * v * a.x + 2 * v * u * c.x + u * u * b.x,
    y: v * v * a.y + 2 * v * u * c.y + u * u * b.y,
  }
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill() }
  },
  draw(ctx, s, t) {
    const { p, w, h } = s
    const e = s.still ? STILL : t % CYCLE
    const fade = s.still
      ? 1
      : clamp(e / START) * (1 - clamp((e - FADE_AT) / 1))
    const stageAt = (i: number) => (e - START - i * STAGE) / STAGE // 0 to 1 while stage i runs
    const active = Math.min(
      STAGES.length - 1,
      Math.max(0, Math.floor((e - START) / STAGE))
    )
    clear(ctx, p, w, h)
    ctx.globalAlpha = 1

    // The steps, wrapped onto as many rows as the width needs, the active one marked in amaranth.
    const gap = 20
    const widths = STAGES.map((st) => textWidth(ctx, p, st.name) + 12)
    const rows: number[][] = [[]]
    let rowWidth = 0
    widths.forEach((width, i) => {
      const row = rows[rows.length - 1]!
      if (row.length && rowWidth + gap + width > w - 32) {
        rows.push([i])
        rowWidth = width
      } else {
        row.push(i)
        rowWidth += (row.length > 1 ? gap : 0) + width
      }
    })
    // Everything centered in the frame's height: the steps, the detail, the cluster, the backups and the caption.
    const needed = rows.length * 22 + 34 + 194 + 40 + 30 + 30
    let y = Math.max(20, Math.round((h - needed) / 2) + 10)
    for (const row of rows) {
      const total =
        row.reduce((sum, i) => sum + widths[i]!, 0) + gap * (row.length - 1)
      let x = (w - total) / 2
      for (const i of row) {
        const on = i === active && e >= START
        ctx.save()
        ctx.globalAlpha = fade
        if (on) {
          ctx.fillStyle = p.accent
          ctx.fillRect(Math.round(x), y - 2, 5, 5)
        }
        ctx.restore()
        label(ctx, p, STAGES[i]!.name, x + 12, y, {
          color: on ? p.star : p.label,
          opacity: fade * (on ? 1 : 0.75),
        })
        x += widths[i]! + gap
      }
      y += 22
    }
    // The active step's detail, crossfading between steps.
    const local = stageAt(active)
    const detailIn = s.still ? 1 : clamp(local * 6) * clamp((1 - local) * 8)
    label(ctx, p, STAGES[active]!.detail, w / 2, y + 6, {
      align: "center",
      color: p.label,
      opacity: fade * detailIn,
    })
    y += 34

    // The nodes: their width fits four; three sit centered until the fourth joins, then they slide over.
    const nodeGap = w < 460 ? 8 : 14
    const pad = w < 460 ? 10 : 16
    const nw = Math.min(118, (w - 32 - 2 * pad - 3 * nodeGap) / 4)
    const nh = 130
    const joined = s.still ? 1 : ease(stageAt(1) * 1.6)
    const rowX = (n: number) => (w - (n * nw + (n - 1) * nodeGap)) / 2
    const x3 = rowX(3)
    const x4 = rowX(4)
    const nodeX = (i: number) =>
      i < 3
        ? x3 + i * (nw + nodeGap) + (x4 - x3) * joined
        : x3 + (x4 - x3) * joined + 3 * (nw + nodeGap) + (1 - joined) * 16

    // The cluster around them, growing as the fourth node joins.
    const frameX = nodeX(0) - pad
    const frameW = (3 + joined) * (nw + nodeGap) - nodeGap + 2 * pad
    const frameY = y
    const nodeY = frameY + 30
    const frameH = 30 + nh + 34
    ctx.save()
    ctx.globalAlpha = fade
    box(ctx, frameX, frameY, frameW, frameH, 10, null, alpha(p.line, 0.8))
    ctx.restore()
    labelRow(
      ctx,
      p,
      [
        ["CLUSTER", p.star],
        ["REPLICATION FACTOR 2", p.label],
      ],
      frameX + pad,
      frameY + 15,
      { opacity: fade }
    )

    // Rebalancing: how far each move has gone (0 before, 1 after).
    const moved = MOVES.map((_, m) =>
      s.still ? 1 : ease(clamp((stageAt(2) - 0.1 - m * 0.4) / 0.35))
    )
    const slotOf = (node: number, slot: number): Pt => ({
      x: nodeX(node) + 8,
      y: nodeY + 30 + slot * 30,
    })
    const chipW = nw - 16
    const named = (i: number) => (chipW >= 64 ? `SHARD ${i}` : `S${i}`)

    // Upgrades: one node at a time, in order.
    const upgrading = (i: number) => {
      if (s.still || i > 2 || stageAt(0) < 0 || stageAt(0) > 1) return 0
      const k = stageAt(0) * 3 - i
      return k > 0.08 && k < 0.92 ? Math.sin(((k - 0.08) / 0.84) * Math.PI) : 0
    }
    const updatingNode = [0, 1, 2].find((i) => upgrading(i) > 0.05)
    const serving = new Set(
      updatingNode === undefined
        ? []
        : BEFORE[updatingNode]!.filter((x): x is number => x !== null)
    )

    // Monitoring: the RAM meters come forward, with the alert threshold.
    const watching = s.still
      ? 1
      : clamp(stageAt(4) * 5)
    const backing = s.still ? 0 : stageAt(3)

    for (let i = 0; i < 4; i++) {
      const x = nodeX(i)
      // The new node shows once the cluster has grown room for it.
      const visible = i < 3 ? 1 : clamp((joined - 0.45) / 0.55)
      if (visible <= 0) continue
      const up = upgrading(i)
      ctx.save()
      ctx.globalAlpha = fade * visible
      box(
        ctx,
        x,
        nodeY,
        nw,
        nh,
        8,
        alpha(p.surface, 0.95),
        up > 0 ? alpha(p.glow, 0.4 + 0.6 * up) : p.line
      )
      ctx.restore()
      label(ctx, p, `NODE ${i}`, x + nw / 2, nodeY + 14, {
        align: "center",
        color: p.star,
        opacity: fade * visible,
      })

      // Its replicas.
      for (let slot = 0; slot < 2; slot++) {
        const at = slotOf(i, slot)
        const before = BEFORE[i]![slot] ?? null
        const leaving = MOVES.findIndex(
          (m) => m.from.node === i && m.from.slot === slot
        )
        const arriving = MOVES.findIndex(
          (m) => m.to.node === i && m.to.slot === slot
        )
        const empty =
          (before === null && (arriving < 0 || moved[arriving]! < 1)) ||
          (leaving >= 0 && moved[leaving]! > 0)
        if (empty) {
          ctx.save()
          ctx.globalAlpha = fade * visible * 0.7
          box(ctx, at.x, at.y, chipW, 22, 4, null, alpha(p.line, 0.8), [3, 3])
          ctx.restore()
        }
        if (before !== null && !(leaving >= 0 && moved[leaving]! > 0)) {
          const keepsServing = up === 0 && serving.has(before)
          shard(ctx, p, at.x, at.y, chipW, named(before), {
            opacity: fade * visible * (1 - 0.6 * up),
            edge: keepsServing ? p.glow : undefined,
          })
        }
        if (arriving >= 0 && moved[arriving]! >= 1) {
          const m = MOVES[arriving]!
          shard(
            ctx,
            p,
            at.x,
            at.y,
            chipW,
            named(BEFORE[m.from.node]![m.from.slot]!),
            { opacity: fade }
          )
        }
      }

      // Its RAM.
      const ram =
        i < 3
          ? RAM_BEFORE[i]! +
            (RAM_AFTER[i]! - RAM_BEFORE[i]!) *
              (s.still ? 1 : ease(clamp((stageAt(2) - 0.2) / 0.8)))
          : RAM_AFTER[i]! * (s.still ? 1 : ease(clamp((stageAt(2) - 0.2) / 0.8)))
      const wiggle = s.still ? 0 : Math.sin(t * 1.3 + i * 1.7) * 0.015
      const mx = x + 8
      const my = nodeY + nh - 16
      const mw = nw - 16
      label(ctx, p, "RAM", mx, my - 12, {
        color: p.label,
        opacity: fade * visible,
      })
      ctx.save()
      ctx.globalAlpha = fade * visible
      ctx.fillStyle = alpha(p.line, 0.6)
      ctx.fillRect(Math.round(mx), Math.round(my), Math.round(mw), 4)
      ctx.fillStyle = watching > 0 ? alpha(p.glow, 0.5 + 0.5 * watching) : p.dim
      ctx.fillRect(
        Math.round(mx),
        Math.round(my),
        Math.round(mw * clamp(ram + wiggle)),
        4
      )
      // The alert threshold, 80%.
      ctx.globalAlpha = fade * visible * (0.35 + 0.65 * watching)
      ctx.fillStyle = p.star
      ctx.fillRect(Math.round(mx + mw * 0.8), Math.round(my) - 3, 1, 10)
      ctx.restore()

      // A word under the node while something happens to it.
      const note =
        up > 0.05 ? "UPDATING" : i === 3 && !s.still && stageAt(1) > 0 && stageAt(1) < 1 ? "JOINS" : ""
      if (note)
        label(ctx, p, note, x + nw / 2, nodeY + nh + 16, {
          align: "center",
          color: p.label,
          opacity: fade * (up > 0 ? up : clamp(stageAt(1) * 4) * clamp((1 - stageAt(1)) * 4)),
        })
    }

    // Replicas in flight, on an indigo arc over the nodes.
    MOVES.forEach((m, k) => {
      const u = moved[k]!
      if (u <= 0 || u >= 1) return
      const a = slotOf(m.from.node, m.from.slot)
      const b = slotOf(m.to.node, m.to.slot)
      ctx.save()
      ctx.globalAlpha = fade * 0.7
      ctx.strokeStyle = p.glow
      ctx.lineWidth = 1
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      for (let j = 0; j <= 24; j++) {
        const q = arc(
          { x: a.x + chipW / 2, y: a.y },
          { x: b.x + chipW / 2, y: b.y },
          LIFT,
          (j / 24) * u
        )
        if (j) ctx.lineTo(q.x, q.y)
        else ctx.moveTo(q.x, q.y)
      }
      ctx.stroke()
      ctx.restore()
      const q = arc(a, b, LIFT, u)
      shard(
        ctx,
        p,
        q.x,
        q.y,
        chipW,
        named(BEFORE[m.from.node]![m.from.slot]!),
        { opacity: fade, edge: p.bright }
      )
    })

    // Backups, under the cluster: every node's data goes down to them while the step runs.
    const bw = Math.min(200, w - 64)
    const bx = (w - bw) / 2
    const by = frameY + frameH + 40
    const backupsOn = s.still ? 1 : 0.55 + 0.45 * clamp(backing * 5) * clamp((1 - backing) * 5)
    ctx.save()
    ctx.globalAlpha = fade
    box(
      ctx,
      bx,
      by,
      bw,
      30,
      6,
      alpha(p.surface, 0.95),
      backing > 0 && backing < 1 ? alpha(p.glow, backupsOn) : p.line
    )
    ctx.restore()
    label(ctx, p, "BACKUPS", w / 2, by + 16, {
      align: "center",
      color: p.star,
      opacity: fade,
    })
    if (backing > 0 && backing < 1) {
      const nodes = joined > 0.5 ? 4 : 3
      for (let i = 0; i < nodes; i++) {
        const from = { x: nodeX(i) + nw / 2, y: frameY + frameH }
        const to = { x: bx + (bw * (i + 1)) / (nodes + 1), y: by }
        const k = ease(clamp((backing - 0.05 - i * 0.08) / 0.3))
        const out = clamp((1 - backing) * 5)
        ctx.save()
        ctx.globalAlpha = fade * 0.6 * out
        ctx.strokeStyle = p.glow
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k)
        ctx.stroke()
        // A packet of data on its way down.
        const d = (backing * 3 + i * 0.25) % 1
        if (k >= 1) {
          ctx.globalAlpha = fade * out
          ctx.fillStyle = p.bright
          ctx.fillRect(
            Math.round(from.x + (to.x - from.x) * d) - 2,
            Math.round(from.y + (to.y - from.y) * d) - 2,
            4,
            4
          )
        }
        ctx.restore()
      }
    }

    label(ctx, p, "NO OPERATOR ACTION", w / 2, by + 30 + 22, {
      align: "center",
      color: p.label,
      opacity: fade,
    })
  },
}

export function CloudOperations() {
  return <SceneCanvas scene={scene} />
}
