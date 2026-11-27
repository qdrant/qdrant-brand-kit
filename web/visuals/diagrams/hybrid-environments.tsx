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
import {
  arrow,
  hexCorners,
  labelRow,
  mono,
  poly,
  prefersStill,
  textWidth,
  type Pt,
} from "./lib"

// Hybrid Cloud environments (Hybrid Cloud page hero, 2026-11-26), instead of the site's PNG of an environment's page
// (hybrid-cloud-hero.png): four Kubernetes clusters the customer runs, on AWS (EKS), GCP (GKE), Azure (AKS) and any
// conformant distribution, each with its Cloud Agent, the Qdrant Operator and a Qdrant cluster, all managed from the
// one Qdrant Cloud control plane. Each Cloud Agent opens an outbound connection to the control plane on port 443;
// nothing is opened inbound. Over it, status and metrics go up and management instructions come back: one
// environment at a time gets an instruction, and its Operator adds a node to its Qdrant cluster (marked in amaranth
// while it happens). The data stays in each environment. Checked against /documentation/hybrid-cloud/ and the page's
// FAQ (EKS, GKE, AKS or any other conformant distribution; outbound on 443 to api.cloud.qdrant.io and
// grpc.cloud.qdrant.io), 2026-11-26. Wide, the environments flank the control plane two by two; narrow, they sit in
// two rows above and below it.

const ENVS = [
  { provider: "AWS", distro: "EKS" },
  { provider: "AZURE", distro: "AKS" },
  { provider: "GCP", distro: "GKE" },
  { provider: "ANY CONFORMANT", distro: "DISTRIBUTION" },
]

const START = 0.6
const STEP = 2.6
const HOLD_AT = START + ENVS.length * STEP
const FADE_AT = HOLD_AT + 2
const CYCLE = FADE_AT + 1.2

type Box = { x: number; y: number; w: number; h: number }
type Env = Box & { port: Pt; side: "left" | "right" | "top" | "bottom" }
type Layout = { envs: Env[]; cp: Box; cpPorts: Pt[]; caption: Pt; wide: boolean }
type State = { w: number; h: number; p: Palette; still: boolean; layout: Layout }

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

// A component in an environment: a mono chip, its edge indigo for the Cloud Agent, which owns the connection.
function chip(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  text: string,
  x: number,
  y: number,
  edge: string,
  opacity: number
) {
  const width = Math.ceil(textWidth(ctx, p, text)) + 16
  ctx.save()
  ctx.globalAlpha = opacity
  rect(ctx, { x, y: y - 12, w: width, h: 24 }, 4, alpha(p.surface, 0.95), edge)
  ctx.font = mono(p)
  ctx.textBaseline = "middle"
  ctx.fillStyle = p.star
  ctx.fillText(text, Math.round(x) + 8, Math.round(y) + 1)
  ctx.restore()
  return width
}

// Wide (a frame at least 2.5 times as wide as tall), two environments flank the control plane on each side, laid out in the frame's height; narrow,
// they sit in two rows above and below it, each as tall as its content.
const ROOMY = 240
const narrowEnvH = (envW: number) => (envW >= ROOMY ? 118 : 166)

function layout(w: number, h: number): Layout {
  const wide = w / h >= 2.5
  if (wide) {
    const envW = Math.min(300, (w - 48 - 300) / 2)
    const gapY = 16
    const envH = Math.min(128, (h - 24 - gapY) / 2)
    const top = (h - (2 * envH + gapY)) / 2
    const cp = { w: 220, h: 76, x: (w - 220) / 2, y: h / 2 - 38 - 14 }
    const envs: Env[] = ENVS.map((_, i) => {
      const right = i >= 2
      const x = right ? w - 24 - envW : 24
      const y = top + (i % 2) * (envH + gapY)
      return {
        x,
        y,
        w: envW,
        h: envH,
        side: right ? "left" : "right",
        port: { x: right ? x : x + envW, y: Math.round(y + envH * 0.44) },
      }
    })
    const cpPorts = envs.map((env, i) => ({
      x: env.side === "right" ? cp.x : cp.x + cp.w,
      y: cp.y + 24 + (i % 2) * 28,
    }))
    return { envs, cp, cpPorts, caption: { x: w / 2, y: cp.y + cp.h + 24 }, wide }
  }
  const gap = 12
  const envW = (w - 32 - gap) / 2
  const envH = narrowEnvH(envW)
  const cpH = 64
  const link = 40
  const total = 2 * envH + cpH + 2 * link + 28
  const top = Math.max(8, (h - total) / 2)
  const cp = { w: Math.min(220, w - 64), h: cpH, x: 0, y: top + envH + link }
  cp.x = (w - cp.w) / 2
  const envs: Env[] = ENVS.map((_, i) => {
    const bottom = i >= 2
    const x = 16 + (i % 2) * (envW + gap)
    const y = bottom ? cp.y + cpH + link : top
    return {
      x,
      y,
      w: envW,
      h: envH,
      side: bottom ? "top" : "bottom",
      port: { x: x + envW / 2, y: bottom ? y : y + envH },
    }
  })
  const cpPorts = envs.map((env, i) => ({
    x: cp.x + cp.w * (i % 2 ? 0.72 : 0.28),
    y: env.side === "bottom" ? cp.y : cp.y + cp.h,
  }))
  return { envs, cp, cpPorts, caption: { x: w / 2, y: top + total - 8 }, wide }
}

// The connection's path from an environment to the control plane, as a point at u (0 at the agent, 1 at the control
// plane): a smooth S between the two ports.
function along(a: Pt, b: Pt, horizontal: boolean, u: number): Pt {
  const v = 1 - u
  const c1 = horizontal ? { x: (a.x + b.x) / 2, y: a.y } : { x: a.x, y: (a.y + b.y) / 2 }
  const c2 = horizontal ? { x: (a.x + b.x) / 2, y: b.y } : { x: b.x, y: (a.y + b.y) / 2 }
  return {
    x: v * v * v * a.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * b.x,
    y: v * v * v * a.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * b.y,
  }
}

function hex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  poly(ctx, hexCorners(x, y, r))
}

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return { w, h, p, still: prefersStill(), layout: layout(w, h) }
  },
  draw(ctx, s, t) {
    const { p, w, h, layout: L } = s
    const e = s.still ? HOLD_AT + 1 : t % CYCLE
    const fade = s.still ? 1 : clamp(e / START) * (1 - clamp((e - FADE_AT) / 1))
    clear(ctx, p, w, h)

    // The connections, under everything: an indigo line from each agent to the control plane, its arrow at the
    // control plane, the direction the connection is opened in.
    L.envs.forEach((env, i) => {
      const a = env.port
      const b = L.cpPorts[i]!
      ctx.save()
      ctx.globalAlpha = fade * 0.6
      ctx.strokeStyle = p.glow
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let j = 0; j <= 32; j++) {
        const q = along(a, b, L.wide, j / 32)
        if (j) ctx.lineTo(q.x, q.y)
        else ctx.moveTo(q.x, q.y)
      }
      ctx.stroke()
      const end = along(a, b, L.wide, 0.97)
      ctx.globalAlpha = fade * 0.9
      arrow(ctx, end, b, 6)
      ctx.restore()

      // Status and metrics going up, steadily.
      if (!s.still) {
        for (let k = 0; k < 2; k++) {
          const u = (t * 0.22 + k * 0.5 + i * 0.13) % 1
          const q = along(a, b, L.wide, u)
          ctx.save()
          ctx.globalAlpha = fade * Math.sin(u * Math.PI) * 0.9
          ctx.fillStyle = p.bright
          ctx.fillRect(Math.round(q.x) - 2, Math.round(q.y) - 2, 4, 4)
          ctx.restore()
        }
      }
      // An instruction coming back to the environment whose turn it is.
      const local = (e - START - i * STEP) / STEP
      if (!s.still && local > 0 && local < 0.4) {
        const u = 1 - ease(local / 0.4)
        const q = along(a, b, L.wide, u)
        ctx.save()
        ctx.globalAlpha = fade
        ctx.strokeStyle = p.bright
        ctx.fillStyle = alpha(p.surface, 1)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(q.x, q.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }
    })

    // The control plane.
    const { cp } = L
    ctx.save()
    ctx.globalAlpha = fade
    rect(ctx, cp, 10, alpha(p.surface, 0.98), p.glow)
    ctx.restore()
    label(ctx, p, "QDRANT CLOUD", cp.x + cp.w / 2, cp.y + cp.h / 2 - 9, {
      align: "center",
      color: p.star,
      opacity: fade,
    })
    label(ctx, p, "CONTROL PLANE", cp.x + cp.w / 2, cp.y + cp.h / 2 + 9, {
      align: "center",
      color: p.label,
      opacity: fade,
    })
    labelRow(
      ctx,
      p,
      [
        ["OUTBOUND ONLY", p.label],
        ["PORT 443", p.star],
      ],
      L.caption.x,
      L.caption.y,
      { align: "center", opacity: fade }
    )

    // The environments.
    L.envs.forEach((env, i) => {
      const local = (e - START - i * STEP) / STEP
      const growing = s.still ? 1 : ease(clamp((local - 0.4) / 0.25))
      const marked = !s.still && local > 0.4 && local < 1
      ctx.save()
      ctx.globalAlpha = fade
      rect(ctx, env, 10, alpha(p.surface, 0.95), alpha(p.line, 0.9))
      ctx.restore()

      // Its name: the provider and the distribution, on two lines when one won't fit.
      const { provider, distro } = ENVS[i]!
      const left = env.x + 14
      let y = env.y + 18
      const oneLine =
        textWidth(ctx, p, `${provider}  ${distro}`) + 26 <= env.w
      if (marked) {
        ctx.save()
        ctx.globalAlpha = fade * clamp((local - 0.4) * 8) * clamp((1 - local) * 8)
        ctx.fillStyle = p.accent
        ctx.fillRect(Math.round(left), y - 2, 5, 5)
        ctx.restore()
      }
      if (oneLine) {
        labelRow(
          ctx,
          p,
          [
            [provider, p.star],
            [distro, p.label],
          ],
          left + 12,
          y,
          { opacity: fade }
        )
      } else {
        label(ctx, p, provider, left + 12, y, { color: p.star, opacity: fade })
        y += 16
        label(ctx, p, distro, left + 12, y, { color: p.star, opacity: fade })
      }

      // Its components: the Cloud Agent on the side facing the control plane, then the Operator; wide, at the
      // heights the frame gives, narrow, stacked.
      const roomy = env.w >= ROOMY
      y = L.wide ? Math.round(env.y + env.h * 0.44) : y + 30
      if (roomy) {
        const agentW = Math.ceil(textWidth(ctx, p, "CLOUD AGENT")) + 16
        const operatorW = Math.ceil(textWidth(ctx, p, "OPERATOR")) + 16
        const facesRight = env.side === "right"
        const agentX = facesRight ? env.x + env.w - 14 - agentW : left
        const operatorX = facesRight ? agentX - 10 - operatorW : agentX + agentW + 10
        chip(ctx, p, "CLOUD AGENT", agentX, y, p.glow, fade)
        chip(ctx, p, "OPERATOR", operatorX, y, p.line, fade)
        // The agent's line reaches the box's edge on the wide layout.
        if (L.wide) {
          ctx.save()
          ctx.globalAlpha = fade * 0.6
          ctx.strokeStyle = p.glow
          ctx.lineWidth = 1
          ctx.beginPath()
          if (facesRight) {
            ctx.moveTo(agentX + agentW, y + 0.5)
            ctx.lineTo(env.x + env.w, y + 0.5)
          } else {
            ctx.moveTo(env.x, y + 0.5)
            ctx.lineTo(agentX, y + 0.5)
          }
          ctx.stroke()
          ctx.restore()
        }
      } else {
        chip(ctx, p, "CLOUD AGENT", left, y, p.glow, fade)
        y += 30
        chip(ctx, p, "OPERATOR", left, y, p.line, fade)
      }

      // Its Qdrant cluster: two nodes, and a third the Operator adds when the instruction arrives.
      y = L.wide ? Math.round(env.y + env.h * 0.78) : y + 36
      const r = 9
      for (let k = 0; k < 3; k++) {
        const x = left + r + k * (2 * r + 6)
        const on = k < 2 ? 1 : growing
        if (on <= 0) continue
        const isNew = k === 2 && marked
        ctx.save()
        ctx.globalAlpha = fade * on
        hex(ctx, x, y, r * (k < 2 ? 1 : 0.6 + 0.4 * on))
        ctx.fillStyle = alpha(isNew ? p.accent : p.glow, isNew ? 0.3 : 0.16)
        ctx.fill()
        ctx.strokeStyle = isNew ? p.accent : p.glow
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      }
      // The cluster's name beside its nodes, or under them in a narrow box.
      if (roomy) {
        label(ctx, p, "QDRANT CLUSTER", left + 3 * (2 * r + 6) + 4, y, {
          color: p.label,
          opacity: fade,
        })
      } else {
        label(ctx, p, "QDRANT CLUSTER", left, y + 24, {
          color: p.label,
          opacity: fade,
        })
      }
    })
  },
}

export function HybridEnvironments() {
  return <SceneCanvas scene={scene} />
}
