"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import { CardCopy } from "./card-copy"

// Orbit border: a single light travels the card's hairline border like a satellite: a 3px bright dot with a
// soft glow, and a trail of about 40px in three steps along the border. The border is measured in the
// browser and traced as an SVG path along the middle of the 1px border; each layer is one dash of that path,
// moved by a CSS animation (surfaces.css). The head has its own SVG, so the glow (a CSS drop-shadow) lights
// only the dot.

// The card's corner radius, var(--radius-2xl).
const RADIUS = 16

// Dash lengths in px, longest and faintest first.
const TRAIL = [
  { length: 40, className: "spsurf-orbit__trail spsurf-orbit__trail--3" },
  { length: 24, className: "spsurf-orbit__trail spsurf-orbit__trail--2" },
  { length: 12, className: "spsurf-orbit__trail spsurf-orbit__trail--1" },
]
// The head: a 1px dash with round caps 3px wide, which reads as a 3px dot.
const HEAD = [{ length: 1, className: "spsurf-orbit__head" }]

type Layer = { length: number; className: string }

function Dashes({ layers, d, total }: { layers: Layer[]; d: string; total: number }) {
  return layers.map(({ length, className }) => (
    <path
      key={className}
      d={d}
      className={className}
      style={
        {
          "--spsurf-dash": `${length}px`,
          "--spsurf-len": `${total}px`,
          strokeDasharray: `${length} ${total - length}`,
        } as CSSProperties
      }
    />
  ))
}

// A rounded rectangle along the middle of the border, clockwise from the top-left, and its length.
function trace(w: number, h: number) {
  const i = 0.5
  const r = RADIUS - i
  const arc = `A${r} ${r} 0 0 1`
  const d = [
    `M${RADIUS} ${i}`,
    `H${w - RADIUS}`,
    `${arc} ${w - i} ${RADIUS}`,
    `V${h - RADIUS}`,
    `${arc} ${w - RADIUS} ${h - i}`,
    `H${RADIUS}`,
    `${arc} ${i} ${h - RADIUS}`,
    `V${RADIUS}`,
    `${arc} ${RADIUS} ${i}`,
    "Z",
  ].join(" ")
  const length = 2 * (w - 2 * RADIUS) + 2 * (h - 2 * RADIUS) + 2 * Math.PI * r
  return { d, length }
}

export function OrbitBorder() {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const resize = new ResizeObserver(() => setBox({ w: el.offsetWidth, h: el.offsetHeight }))
    resize.observe(el)
    return () => resize.disconnect()
  }, [])

  const path = box && trace(box.w, box.h)

  return (
    <div ref={ref} className="spsurf spsurf-card spsurf-body spsurf-orbit">
      {box &&
        path &&
        [TRAIL, HEAD].map((layers, i) => (
          <svg
            key={i}
            aria-hidden
            className={i ? "spsurf-orbit__path spsurf-orbit__path--lit" : "spsurf-orbit__path"}
            width={box.w}
            height={box.h}
            viewBox={`0 0 ${box.w} ${box.h}`}
          >
            <Dashes layers={layers} d={path.d} total={path.length} />
          </svg>
        ))}
      <span className="spsurf-orbit__etch sp-readout">ORB 01</span>
      <CardCopy />
    </div>
  )
}
