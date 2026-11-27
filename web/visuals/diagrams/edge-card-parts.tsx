import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// The parts the Qdrant Edge page's four "Search Locally, Sync Centrally" cards share (2026-11-26), so they read as
// one family: a 280 x 210 drawing (4:3) in SVG that follows the theme through the --web-scene-* variables, on a
// quiet dot grid, with the server and Edge Shards drawn the same way in each, mono 12px labels, indigo connectors
// and amaranth for the one key item. At 280px wide, a label is 12px.

export const W = 280
export const H = 210

const LINE = "var(--web-scene-line)"
const GLOW = "var(--web-scene-glow)"
const ACCENT = "var(--web-scene-accent)"

// The drawing, with its description for screen readers.
export function CardSvg({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative aspect-[4/3] w-full", className)}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle,var(--web-scene-line)_1px,transparent_1.5px)] bg-size-[14px_14px] bg-center opacity-50"
      />
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        className="relative block size-full font-mono"
        fill="none"
      >
        {children}
      </svg>
    </div>
  )
}

// A mono label, uppercase in the source, 12px at 280px wide.
export function Label({
  x,
  y,
  children,
  anchor = "middle",
  tone = "label",
}: {
  x: number
  y: number
  children: string
  anchor?: "start" | "middle" | "end"
  tone?: "label" | "star"
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
      fill={`var(--web-scene-${tone})`}
    >
      {children}
    </text>
  )
}

export type Fill = "empty" | "data" | "key"

// A segment: a small upright bar, empty (an outline), data (indigo) or the key one (amaranth).
export function Segment({
  x,
  y,
  w = 8,
  h = 14,
  fill = "data",
}: {
  x: number
  y: number
  w?: number
  h?: number
  fill?: Fill
}) {
  const color = fill === "key" ? ACCENT : GLOW
  return (
    <rect
      x={x + 0.5}
      y={y + 0.5}
      width={w - 1}
      height={h - 1}
      rx={1.5}
      fill={fill === "empty" ? "none" : color}
      fillOpacity={fill === "data" ? 0.55 : 1}
      stroke={fill === "empty" ? LINE : color}
    />
  )
}

// A box on the surface color with a hairline: a server or a device.
export function Box({
  x,
  y,
  w,
  h,
  dashed,
  stroke = LINE,
  opacity = 1,
}: {
  x: number
  y: number
  w: number
  h: number
  dashed?: boolean
  stroke?: string
  opacity?: number
}) {
  return (
    <rect
      x={x + 0.5}
      y={y + 0.5}
      width={w - 1}
      height={h - 1}
      rx={4}
      fill="var(--web-scene-surface)"
      stroke={stroke}
      strokeDasharray={dashed ? "4 4" : undefined}
      opacity={opacity}
    />
  )
}

// An Edge Shard: a small box holding its segments, centered on (cx, cy).
export function Shard({
  cx,
  cy,
  segments,
  w = 34,
  h = 24,
  dashed,
  opacity,
}: {
  cx: number
  cy: number
  segments: Fill[]
  w?: number
  h?: number
  dashed?: boolean
  opacity?: number
}) {
  const sw = 6
  const gap = 3
  const total = segments.length * sw + (segments.length - 1) * gap
  return (
    <g opacity={opacity}>
      <Box x={cx - w / 2} y={cy - h / 2} w={w} h={h} dashed={dashed} />
      {segments.map((fill, i) => (
        <Segment
          key={i}
          x={cx - total / 2 + i * (sw + gap)}
          y={cy - 6}
          w={sw}
          h={12}
          fill={fill}
        />
      ))}
    </g>
  )
}

// A connector in indigo, with an open arrowhead at its end (and at its start, for both ways).
export function Arrow({
  d,
  end,
  start,
  dashed,
  color = GLOW,
}: {
  d: string
  end?: { x: number; y: number; angle: number }
  start?: { x: number; y: number; angle: number }
  dashed?: boolean
  color?: string
}) {
  const head = (h: { x: number; y: number; angle: number }) => {
    const a = (h.angle * Math.PI) / 180
    const l = 6
    const p1 = `${h.x - l * Math.cos(a - 0.45)},${h.y - l * Math.sin(a - 0.45)}`
    const p2 = `${h.x - l * Math.cos(a + 0.45)},${h.y - l * Math.sin(a + 0.45)}`
    return `M${p1} L${h.x},${h.y} L${p2}`
  }
  return (
    <g
      stroke={color}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} strokeDasharray={dashed ? "3 3" : undefined} />
      {end && <path d={head(end)} />}
      {start && <path d={head(start)} />}
    </g>
  )
}

// The angle from a to b, in degrees, for an arrowhead.
export const angle = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
