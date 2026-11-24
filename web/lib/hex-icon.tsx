"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { icons } from "./icon"

// A Lucide icon drawn as a field of small hexagons, upright like the logo's brandmark (design lead, 2026-11-24,
// exploring): the hexagons on the icon's lines are full size, the ones around them get smaller with distance, like a
// halftone, and a slow wave from the center makes them a touch larger in rings, so the icon reads as organic rather
// than pixelated. The shape is always the Lucide icon's own: it's measured, never redrawn.
//
// How: the Lucide icon is rendered hidden at its 24-unit size, and every cell of a hex grid asks the browser whether
// it falls inside the icon's lines drawn thicker and thicker (isPointInStroke). The thinnest band it falls in sets its
// size. It runs in the browser once per icon and options, after the first render.

export type HexIconOptions = {
  // Cells across the icon's 24 units. More is finer.
  density?: number
  // How strong the concentric rings are, 0 to 1.
  rings?: number
  // How far the halftone reaches past the lines, 0 to 1.
  halo?: number
}

type Cell = { x: number; y: number; r: number }

const cache = new Map<string, Cell[]>()

// The bands, from the line out: the stroke width each one is tested at (Lucide's own is 2) and the cell's size in it.
const bands = (halo: number) => [
  { width: 2, size: 1 },
  { width: 2.5, size: 0.6 },
  { width: 2.5 + 1.6 * halo, size: 0.34 },
  { width: 2.5 + 3.4 * halo, size: 0.18 },
]

function measure(svg: SVGSVGElement, { density = 18, rings = 0.9, halo = 0.3 }: HexIconOptions): Cell[] {
  const shapes = [...svg.querySelectorAll<SVGGeometryElement>("path, circle, ellipse, line, polyline, polygon, rect")]
  const step = 24 / density
  const rowStep = (step * Math.sqrt(3)) / 2
  const out: Cell[] = []
  const point = svg.createSVGPoint()
  const ringLength = 24 / 3.2
  for (let row = 0, y = 0; y <= 24; row++, y = row * rowStep) {
    for (let col = 0; ; col++) {
      const x = col * step + (row % 2 ? step / 2 : 0)
      if (x > 24) break
      point.x = x
      point.y = y
      let size = 0
      for (const band of bands(halo)) {
        const hit = shapes.some((shape) => {
          shape.style.strokeWidth = String(band.width)
          return shape.isPointInStroke(point)
        })
        if (hit) {
          size = band.size
          break
        }
      }
      if (!size) continue
      const distance = Math.hypot(x - 12, y - 12)
      const wave = 0.5 + 0.5 * Math.cos((2 * Math.PI * distance) / ringLength)
      // A full cell is 0.88 of half the step, so neighbors never touch.
      const r = step * 0.44 * size * (1 - rings * 0.4 + rings * 0.4 * wave)
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
  const key = `${name}:${options.density ?? 18}:${options.rings ?? 0.9}:${options.halo ?? 0.3}`
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
