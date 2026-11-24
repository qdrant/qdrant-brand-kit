"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { icons } from "./icon"

// A product mark (marks, below) or a Lucide icon drawn as a field of small hexagons, upright like the logo's
// brandmark (design lead, 2026-11-24, exploring). The Products menu uses the marks.
//
// Four styles to compare (design lead, 2026-11-24):
// - halftone: 14 across, four sizes from the center out, largest in the middle.
// - tones: a fine grid, 22 across; solid parts in full hexagons, shaded parts in small ones, two tones in one mark
//   (after halftone-dot icon sets).
// - outline: 20 across; full hexagons along each shape's edge, small ones inside it, so a mark reads as an outline
//   with a light fill.
// - matrix: a coarse grid, 13 across, even hexagons like an LED matrix, a little smaller along the edges, in the mark's
//   color on its tinted tile like the others, with nothing behind it (the menu's, design lead, 2026-11-24).
//
// How: the shapes are rendered hidden at their 24-unit size and every cell of a hex grid asks the browser whether it's
// inside them (isPointInFill; for a Lucide icon also isPointInStroke). It runs in the browser once per mark and style.

export type HexStyle = "halftone" | "tones" | "outline" | "matrix"

type Cell = { x: number; y: number; r: number }

const cache = new Map<string, Cell[]>()

const densities: Record<HexStyle, number> = { halftone: 14, tones: 22, outline: 20, matrix: 13 }

// Qdrant's product marks: custom, from simple solid shapes on the 24-unit grid, each about the same weight. Shapes are
// drawn in order: data-hole cuts out; data-shade shades what's already drawn, and data-shade-add draws a shaded area
// (both in the tones style only; the others ignore them). They're product marks, not UI icons: UI icons stay Lucide.
export const marks: Record<string, { name: string; shapes: React.ReactNode }> = {
  engine: {
    name: "Vector Search Engine",
    // Search: a magnifying glass. The lens is centered on a grid point of the matrix (13 across) so its ring comes out
    // even, and the handle runs along the grid's 60-degree line so it's a clean bar; the lens shaded.
    shapes: (
      <>
        <circle cx="11.077" cy="9.593" r="7.6" />
        <circle data-hole cx="11.077" cy="9.593" r="4.4" />
        <circle data-shade-add cx="11.077" cy="9.593" r="4.4" />
        <polygon points="13.97,16.01 16.57,14.51 20.27,20.91 17.67,22.41" />
      </>
    ),
  },
  cloud: {
    name: "Managed Cloud",
    // A cloud of three circles on a flat base; its base shaded.
    shapes: (
      <>
        <circle cx="7" cy="15" r="4.5" />
        <circle cx="12.5" cy="9.5" r="6.5" />
        <circle cx="18" cy="14" r="5" />
        <rect x="7" y="14" width="11" height="5.5" />
        <rect data-shade x="0" y="15" width="24" height="9" />
      </>
    ),
  },
  hybrid: {
    name: "Hybrid Cloud",
    // A globe, anywhere you run it: a solid circle with its meridian and equator cut out; its left half shaded.
    shapes: (
      <>
        <circle cx="12" cy="12" r="10.5" />
        <ellipse data-hole cx="12" cy="12" rx="5.8" ry="12" />
        <ellipse cx="12" cy="12" rx="3.6" ry="10.5" />
        <rect data-hole x="0" y="10.9" width="24" height="2.2" />
        <rect data-shade x="0" y="0" width="12" height="24" />
      </>
    ),
  },
  private: {
    name: "Private Cloud",
    // A padlock: a shackle over a solid body with a keyhole; the shackle shaded.
    shapes: (
      <>
        <circle cx="12" cy="9" r="6.5" />
        <circle data-hole cx="12" cy="9" r="3.4" />
        <rect data-shade x="0" y="0" width="24" height="11" />
        <rect x="3.5" y="10.5" width="17" height="12" rx="1.5" />
        <circle data-hole cx="12" cy="15.5" r="1.8" />
        <rect data-hole x="11.2" y="15.5" width="1.6" height="3.5" />
      </>
    ),
  },
  edge: {
    name: "Edge",
    // A robot head like Qbot's: a rounded helmet with a tab on top and an ear on each side, its visor cut out (shaded
    // in the tones style) and two eyes inside it.
    shapes: (
      <>
        <rect x="9" y="1" width="6" height="4" rx="1" />
        <rect x="0.5" y="9" width="3.5" height="6" rx="1.5" />
        <rect x="20" y="9" width="3.5" height="6" rx="1.5" />
        <rect x="3" y="3.5" width="18" height="17.5" rx="7" />
        <rect data-hole x="5.5" y="7.5" width="13" height="10" rx="4" />
        <rect data-shade-add x="5.5" y="7.5" width="13" height="10" rx="4" />
        <circle cx="9" cy="12.5" r="2" />
        <circle cx="15" cy="12.5" r="2" />
      </>
    ),
  },
  serverless: {
    name: "Serverless",
    // A lightning bolt; its lower half shaded.
    shapes: (
      <>
        <polygon points="17.5,0.5 2,15.5 10.5,15.5 6.5,23.5 22.5,8 13.5,8" />
        <rect data-shade x="0" y="13" width="24" height="11" />
      </>
    ),
  },
}

// The hex grid's cells, in rows; odd rows sit half a step to the right.
function grid(density: number) {
  const step = 24 / density
  const rowStep = (step * Math.sqrt(3)) / 2
  const rows: { x: number; y: number }[][] = []
  for (let row = 0, y = 0; y <= 24.001; row++, y = row * rowStep) {
    const cells: { x: number; y: number }[] = []
    for (let col = 0; ; col++) {
      const x = col * step + (row % 2 ? step / 2 : 0)
      if (x > 24.001) break
      cells.push({ x, y })
    }
    rows.push(cells)
  }
  return { step, rows }
}

// The six neighbors of a cell in the offset grid.
const neighbors = (row: number, col: number) => {
  const shift = row % 2 ? 0 : -1
  return [
    [row, col - 1],
    [row, col + 1],
    [row - 1, col + shift],
    [row - 1, col + shift + 1],
    [row + 1, col + shift],
    [row + 1, col + shift + 1],
  ] as const
}

// A mark's cells in a style: 1 solid, 0.5 shaded (tones only), 0 off; then each cell's size.
function measureMark(svg: SVGSVGElement, style: HexStyle): Cell[] {
  const shapes = [...svg.querySelectorAll<SVGGeometryElement>("circle, ellipse, path, polygon, rect")]
  const point = svg.createSVGPoint()
  const { step, rows } = grid(densities[style])
  const tones = style === "tones"
  const state = rows.map((cells) =>
    cells.map(({ x, y }) => {
      point.x = x
      point.y = y
      let s = 0
      for (const shape of shapes) {
        if (!shape.isPointInFill(point)) continue
        if (shape.hasAttribute("data-hole")) s = 0
        else if (shape.hasAttribute("data-shade")) s = tones && s > 0 ? 0.5 : s
        else if (shape.hasAttribute("data-shade-add")) s = tones ? 0.5 : s
        else s = 1
      }
      return s
    })
  )
  const on = (row: number, col: number) => (state[row]?.[col] ?? 0) > 0
  const out: Cell[] = []
  rows.forEach((cells, row) =>
    cells.forEach(({ x, y }, col) => {
      const s = state[row]![col]!
      if (!s) return
      const edge = neighbors(row, col).some(([r, c]) => !on(r, c))
      let r: number
      if (style === "halftone") {
        const ring = Math.min(3, Math.floor(Math.hypot(x - 12, y - 12) / 3.6))
        r = step * 0.52 * (1 - (0.6 * ring) / 3)
      } else if (style === "tones") r = step * (s === 1 ? 0.5 : 0.28)
      else if (style === "outline") r = step * (edge ? 0.5 : 0.24)
      else r = step * (edge ? 0.33 : 0.44)
      out.push({ x, y, r })
    })
  )
  return out
}

// A Lucide icon's cells (halftone only): inside a shape or on its line; a shape inside a bigger one is a detail and
// its line is cut out; thin open lines stay lines.
function measureIcon(svg: SVGSVGElement): Cell[] {
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
  const isClosed = (shape: SVGGeometryElement) =>
    shape.tagName !== "path" && shape.tagName !== "polyline" && shape.tagName !== "line"
      ? true
      : /z\s*$/i.test(shape.getAttribute("d") ?? "")
  const fills = shapes.filter((shape, i) => {
    const b = boxes[i]!
    return isClosed(shape) || b.height / Math.max(b.width, 0.01) > 0.35
  })
  const lines = outer.filter((shape) => !fills.includes(shape))
  const { step, rows } = grid(densities.halftone)
  const out: Cell[] = []
  for (const cells of rows)
    for (const { x, y } of cells) {
      const p = at(x, y)
      if (details.some((shape) => inStroke(shape, 1.5, p))) continue
      const hit =
        fills.some((shape) => shape.isPointInFill(p)) ||
        outer.some((shape) => inStroke(shape, 2, p)) ||
        lines.some((shape) => inStroke(shape, 2.4, p))
      if (!hit) continue
      const ring = Math.min(3, Math.floor(Math.hypot(x - 12, y - 12) / 3.6))
      out.push({ x, y, r: step * 0.52 * (1 - (0.6 * ring) / 3) })
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
  mark,
  variant = "halftone",
  className,
}: {
  // A Lucide icon (halftone only), or one of the product marks.
  name?: string
  mark?: string
  variant?: HexStyle
  className?: string
}) {
  const markData = mark ? marks[mark] : undefined
  const style: HexStyle = markData ? variant : "halftone"
  const key = markData ? `mark:${mark}:${style}` : `icon:${name}`
  const [, measured] = React.useState(0)
  const cells = cache.get(key)
  const Icon = !markData && name ? icons[name] : undefined
  // The hidden shapes measure themselves as they mount, once per mark and style; the result is cached for every copy.
  const probe = React.useCallback(
    (node: HTMLSpanElement | null) => {
      const svg = node?.querySelector("svg")
      if (!svg) return
      // Another copy may have measured it first: then just draw.
      if (!cache.has(key)) cache.set(key, markData ? measureMark(svg, style) : measureIcon(svg))
      measured((n) => n + 1)
    },
    [key, markData, style]
  )

  if (!Icon && !markData) return null
  return (
    <span className={cn("relative inline-block size-8 shrink-0", className)} aria-hidden>
      {!cells && (
        <span ref={probe} className="pointer-events-none invisible absolute size-6">
          {markData ? (
            <svg viewBox="0 0 24 24" width="24" height="24">
              {markData.shapes}
            </svg>
          ) : (
            Icon && <Icon />
          )}
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
