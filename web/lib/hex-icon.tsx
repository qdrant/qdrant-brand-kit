"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { icons } from "./icon"

// A Lucide icon drawn as a field of small hexagons, upright like the logo's brandmark (design lead, 2026-11-24,
// exploring). The icon is filled, not outlined: its shapes are solid hexagons, and the lines drawn inside another
// shape (a shield's check, a chip's inner square, a database's seams) are cut out as gaps, as filled icons show detail.
// The hexagons are largest at the center and get smaller toward the outer edges, so the icon reads as organic. A faint
// halftone past the outline is an option (halo), off by default: in a filled icon it blurs the gaps. The shape is always the Lucide icon's own: it's measured, never redrawn.
//
// How: the Lucide icon is rendered hidden at its 24-unit size, and every cell of a hex grid asks the browser whether
// it falls inside a shape (isPointInFill) or on its line (isPointInStroke). A shape whose center lies inside a bigger
// shape is a detail: its line is cut out instead. It runs in the browser once per icon and options.

export type HexIconOptions = {
  // Cells across the icon's 24 units. More is finer.
  density?: number
  // How much smaller the hexagons get from the center to the edges, 0 to 1.
  falloff?: number
  // How far the halftone reaches past the outline, 0 to 1.
  halo?: number
}

type Cell = { x: number; y: number; r: number }

const cache = new Map<string, Cell[]>()

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function measure(svg: SVGSVGElement, { density = 18, falloff = 0.55, halo = 0 }: HexIconOptions): Cell[] {
  const shapes = [...svg.querySelectorAll<SVGGeometryElement>("path, circle, ellipse, line, polyline, polygon, rect")]
  const point = svg.createSVGPoint()
  const at = (x: number, y: number) => {
    point.x = x
    point.y = y
    return point
  }
  const inStroke = (shape: SVGGeometryElement, width: number, p: DOMPoint) => {
    shape.style.strokeWidth = String(width)
    return shape.isPointInStroke(p)
  }
  // A detail is a shape whose center lies inside a bigger shape's fill.
  const boxes = shapes.map((shape) => shape.getBBox())
  const isDetail = shapes.map((shape, i) => {
    const b = boxes[i]!
    const center = at(b.x + b.width / 2, b.y + b.height / 2)
    return shapes.some((other, j) => {
      const o = boxes[j]!
      return j !== i && o.width * o.height > b.width * b.height && other.isPointInFill(center)
    })
  })
  const outer = shapes.filter((_, i) => !isDetail[i])
  const details = shapes.filter((_, i) => isDetail[i])
  // A thin open line (like a layer's chevron) stays a line: filling it would turn it into a wedge.
  const isClosed = (shape: SVGGeometryElement) =>
    shape.tagName !== "path" && shape.tagName !== "polyline" && shape.tagName !== "line"
      ? true
      : /z\s*$/i.test(shape.getAttribute("d") ?? "")
  const fills = shapes.filter((shape, i) => {
    const b = boxes[i]!
    return isClosed(shape) || b.height / Math.max(b.width, 0.01) > 0.35
  })
  const lines = outer.filter((shape) => !fills.includes(shape))

  const step = 24 / density
  const rowStep = (step * Math.sqrt(3)) / 2
  const out: Cell[] = []
  for (let row = 0, y = 0; y <= 24; row++, y = row * rowStep) {
    for (let col = 0; ; col++) {
      const x = col * step + (row % 2 ? step / 2 : 0)
      if (x > 24) break
      const p = at(x, y)
      let size = 0
      if (details.some((shape) => inStroke(shape, 1.5, p))) size = 0
      else if (
        fills.some((shape) => shape.isPointInFill(p)) ||
        outer.some((shape) => inStroke(shape, 2, p)) ||
        lines.some((shape) => inStroke(shape, 2.4, p))
      )
        size = 1
      else if (halo > 0 && outer.some((shape) => inStroke(shape, 2 + 2.4 * halo, p))) size = 0.3
      if (!size) continue
      // Largest at the center, smaller toward the edges.
      const f = 1 - falloff * smoothstep(1, 12.5, Math.hypot(x - 12, y - 12))
      // A full cell is 0.9 of half the step, so neighbors never touch.
      const r = step * 0.45 * size * f
      if (r >= 0.12) out.push({ x, y, r })
    }
  }
  for (const shape of shapes) shape.style.strokeWidth = ""
  return out
}

// A pointy-top hexagon: points at the top and the bottom, like the brandmark.
const hexPoints = ({ x, y, r }: Cell) =>
  [-90, -30, 30, 90, 150, 210]
    .map((a) => {
      const t = (a * Math.PI) / 180
      return `${(x + r * Math.cos(t)).toFixed(2)},${(y + r * Math.sin(t)).toFixed(2)}`
    })
    .join(" ")

export function HexIcon({
  name,
  className,
  ...options
}: { name: string; className?: string } & HexIconOptions) {
  const key = `${name}:${options.density ?? 18}:${options.falloff ?? 0.55}:${options.halo ?? 0}`
  const [, measured] = React.useState(0)
  const cells = cache.get(key)
  const Icon = icons[name]
  // The hidden icon measures itself as it mounts, once per icon and options; the result is cached for every copy.
  const probe = React.useCallback(
    (node: HTMLSpanElement | null) => {
      const svg = node?.querySelector("svg")
      if (!svg || cache.has(key)) return
      cache.set(key, measure(svg, options))
      measured((n) => n + 1)
    },
    // options are part of key
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )

  if (!Icon) return null
  return (
    <span className={cn("relative inline-block size-8 shrink-0", className)} aria-hidden>
      {!cells && (
        <span ref={probe} className="pointer-events-none invisible absolute size-6">
          <Icon />
        </span>
      )}
      {cells && (
        <svg viewBox="-1 -1 26 26" className="size-full overflow-visible" fill="currentColor">
          {cells.map((cell) => (
            <polygon key={`${cell.x.toFixed(2)}-${cell.y.toFixed(2)}`} points={hexPoints(cell)} />
          ))}
        </svg>
      )}
    </span>
  )
}
