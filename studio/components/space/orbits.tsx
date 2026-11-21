"use client"

import { useEffect, useRef, useState } from "react"

// Orbits (range search): a query at the center and tilted orbit lines at fixed distances, measured like a
// drawing, with degree ticks and a dimension line. Results travel their orbits; the ones inside the second
// ring are within range and lit. SVG drawn at the frame's size in px, so lines stay hairlines.

const TILT = -14
const RINGS = [0.25, 0.5, 0.75, 1]
const SATELLITES = [1, 2, 2, 3]
const PERIODS = [16, 26, 38, 54]

export function Orbits() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number; still: boolean } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const resize = new ResizeObserver(([entry]) =>
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height, still })
    )
    resize.observe(el)
    return () => resize.disconnect()
  }, [])

  return (
    <div ref={ref} aria-hidden className="sp-orbits pointer-events-none absolute inset-0">
      {size && <Drawing {...size} />}
    </div>
  )
}

function Drawing({ w, h, still }: { w: number; h: number; still: boolean }) {
  const cx = w * 0.5
  const cy = h * 0.52
  const max = Math.min(w * 0.44, h * 0.69)
  const turn = (TILT * Math.PI) / 180
  // A point on ring i at angle a (radians), with the tilt applied: for labels and ticks drawn upright.
  const on = (rx: number, a: number, out = 0) => {
    const ry = rx * 0.42
    const x = Math.cos(a) * (rx + out)
    const y = Math.sin(a) * (ry + out)
    return {
      x: cx + x * Math.cos(turn) - y * Math.sin(turn),
      y: cy + x * Math.sin(turn) + y * Math.cos(turn),
    }
  }
  const outer = max
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180
    const long = i % 9 === 0
    return { from: on(outer, a, 3), to: on(outer, a, long ? 12 : 7), long }
  })
  const dimEnd = on(max * 0.75, 0)

  return (
    <svg width={w} height={h} className="absolute inset-0">
      <g transform={`rotate(${TILT} ${cx} ${cy})`}>
        {RINGS.map((f, i) => (
          <ellipse
            key={f}
            cx={cx}
            cy={cy}
            rx={max * f}
            ry={max * f * 0.42}
            className={i === 3 ? "sp-stroke-line sp-dashed" : "sp-stroke-line"}
          />
        ))}
        {RINGS.flatMap((f, i) => {
          const rx = max * f
          const ry = rx * 0.42
          const path = `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0`
          return Array.from({ length: SATELLITES[i] }, (_, j) => {
            const offset = (PERIODS[i] * (j + i * 0.37)) / SATELLITES[i]
            const lit = i < 2
            const a = ((offset / PERIODS[i]) * 2 + 1) * Math.PI
            return (
              <circle
                key={`${i}-${j}`}
                r={lit ? 3 : 2.2}
                cx={still ? cx + Math.cos(a) * rx : 0}
                cy={still ? cy + Math.sin(a) * ry : 0}
                className={lit ? "sp-fill-bright" : "sp-fill-dim"}
              >
                {!still && (
                  <animateMotion
                    dur={`${PERIODS[i]}s`}
                    begin={`-${offset}s`}
                    repeatCount="indefinite"
                    path={path}
                  />
                )}
              </circle>
            )
          })
        })}
      </g>

      <g className="sp-stroke-line">
        {ticks.map(({ from, to }, i) => (
          <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        ))}
      </g>

      {/* The dimension line, center to the third ring, with end ticks. */}
      <g className="sp-stroke-label">
        <line x1={cx} y1={cy} x2={dimEnd.x} y2={dimEnd.y} />
        {[{ x: cx, y: cy }, dimEnd].map(({ x, y }, i) => (
          <line
            key={i}
            x1={x + 5 * Math.sin(turn)}
            y1={y - 5 * Math.cos(turn)}
            x2={x - 5 * Math.sin(turn)}
            y2={y + 5 * Math.cos(turn)}
          />
        ))}
      </g>
      <text
        x={(cx + dimEnd.x) / 2}
        y={(cy + dimEnd.y) / 2 - 10}
        className="sp-svg-label"
        textAnchor="middle"
      >
        R 0.30
      </text>

      {/* Each ring's distance, just inside it at the bottom, where the rings are farthest apart. */}
      {RINGS.map((f, i) => {
        const { x, y } = on(max * f, Math.PI / 2, -6)
        return (
          <text key={f} x={x + 8} y={y} className="sp-svg-label" textAnchor="start">
            {`D ≤ ${(0.1 * (i + 1)).toFixed(2)}`}
          </text>
        )
      })}

      <circle cx={cx} cy={cy} r={9} className="sp-stroke-accent" />
      <circle cx={cx} cy={cy} r={3.5} className="sp-fill-accent" />
    </svg>
  )
}
