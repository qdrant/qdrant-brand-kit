"use client"

import { clamp } from "../rand"
import { SceneCanvas, chip, clear, type CanvasScene, type Palette } from "../scene"
import { TAU } from "./lib"

// Halftone field: a dot grid whose dot sizes print a smooth light from the top right. The light breathes
// slowly, a faint ripple runs out from it, and a dashed contour marks where it falls to half.

type State = { w: number; h: number; p: Palette; pitch: number; lx: number; ly: number; reach: number }

const GAMMA = 1.6

const scene: CanvasScene<State> = {
  setup({ width: w, height: h }, p) {
    return {
      w,
      h,
      p,
      // Finer dots on a usual frame, coarser on a very large one, to keep the dot count modest.
      pitch: w * h > 360_000 ? 16 : 12,
      lx: w * 1.02,
      ly: -h * 0.14,
      reach: Math.hypot(w, h) * 0.86,
    }
  },
  draw(ctx, s, t) {
    const { p, w, h, pitch, lx, ly, reach } = s
    clear(ctx, p, w, h)

    const breathe = 0.9 + 0.1 * Math.sin(t * 0.5)
    const max = pitch * 0.44
    // Three tones: the largest dots, in the most light, are the brightest.
    const tones = [new Path2D(), new Path2D(), new Path2D()]
    for (let row = 0, y = pitch / 2; y < h + pitch; row++, y += pitch)
      for (let x = row % 2 ? pitch : pitch / 2; x < w + pitch; x += pitch) {
        const d = Math.hypot(x - lx, y - ly) / reach
        const drift =
          0.06 *
          Math.sin(x * 0.011 + y * 0.007 - t * 0.25) *
          Math.sin(y * 0.013 - x * 0.004 + t * 0.18)
        const ripple = 0.03 * Math.sin(d * 22 - t * 1.1)
        const light = clamp(1 - d + drift + ripple) ** GAMMA * breathe
        const r = max * light
        if (r < 0.4) continue
        const path = tones[light > 0.5 ? 0 : light > 0.22 ? 1 : 2]
        path.moveTo(x + r, y)
        path.arc(x, y, r, 0, TAU)
      }
    ctx.fillStyle = p.bright
    ctx.fill(tones[0])
    ctx.fillStyle = p.glow
    ctx.fill(tones[1])
    ctx.globalAlpha = 0.6
    ctx.fill(tones[2])
    ctx.globalAlpha = 1

    // The half-light contour, measured like a drawing: where (1 - d) ^ GAMMA * breathe = 0.5.
    const half = (1 - (0.5 / breathe) ** (1 / GAMMA)) * reach
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.arc(lx, ly, half, Math.PI * 0.5, Math.PI)
    ctx.stroke()
    ctx.setLineDash([])
    const a = Math.PI * 0.7
    const mx = lx + Math.cos(a) * half
    const my = ly + Math.sin(a) * half
    ctx.fillStyle = p.star
    ctx.beginPath()
    ctx.arc(mx, my, 2, 0, TAU)
    ctx.fill()
    chip(ctx, p, "I 0.50", mx + 8, my)
  },
}

export function Halftone() {
  return <SceneCanvas scene={scene} />
}
