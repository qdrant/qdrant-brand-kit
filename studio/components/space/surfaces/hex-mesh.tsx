"use client"

import { useEffect, useRef } from "react"

import { CardCopy } from "./card-copy"

// Hex mesh: a hairline hexagon lattice in the card, fading toward the copy. Around the pointer it shows
// brighter, and the cell under the pointer is outlined in the accent, with its column and row in a readout.
// At rest the lens sits in the top right. The lattice is a CSS mask (surfaces.css); this file only tracks
// the pointer and snaps it to a cell.

// The lattice tile in surfaces.css: flat-top hexagons with 15px sides, rows 26px apart (15 x sqrt 3, rounded
// to whole pixels so the tile repeats cleanly). Columns sit 22.5px apart; even columns have their centers at
// y = 19.5 + 26n, odd ones at y = 6.5 + 26n.
const SIDE = 15
const ROW = 26

function cellAt(x: number, y: number) {
  const guess = Math.floor((x - SIDE) / (1.5 * SIDE))
  let best = { col: 0, row: 0, x: 0, y: 0, d: Infinity }
  for (let col = guess - 1; col <= guess + 2; col++) {
    const cx = SIDE + 1.5 * SIDE * col
    const y0 = ((col % 2) + 2) % 2 === 0 ? 19.5 : 6.5
    const row = Math.round((y - y0) / ROW)
    const cy = y0 + row * ROW
    const d = (x - cx) ** 2 + (y - cy) ** 2
    if (d < best.d) best = { col, row, x: cx, y: cy, d }
  }
  return best
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0")

export function HexMesh() {
  const ref = useRef<HTMLDivElement>(null)
  const cell = useRef<SVGSVGElement>(null)
  const readout = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const place = (x: number, y: number) => {
      el.style.setProperty("--spsurf-mx", `${x}px`)
      el.style.setProperty("--spsurf-my", `${y}px`)
      const hit = cellAt(x, y)
      if (cell.current) cell.current.style.translate = `${hit.x - 16}px ${hit.y - 14}px`
      if (readout.current) readout.current.textContent = `HEX ${pad(hit.col)}.${pad(hit.row)}`
    }
    // Coordinates inside the border, where the lattice starts.
    const rest = () => place(el.clientWidth * 0.72, el.clientHeight * 0.24)
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      place(event.clientX - rect.left - el.clientLeft, event.clientY - rect.top - el.clientTop)
    }
    rest()
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", rest)
    return () => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", rest)
    }
  }, [])

  return (
    <div ref={ref} className="spsurf spsurf-card spsurf-hexmesh">
      <div aria-hidden className="spsurf-hexmesh__field">
        <div className="spsurf-hexmesh__lattice" />
        <div className="spsurf-hexmesh__lit" />
        <svg ref={cell} className="spsurf-hexmesh__cell" width="32" height="28" viewBox="0 0 32 28">
          <polygon points="1,14 8.5,1 23.5,1 31,14 23.5,27 8.5,27" />
        </svg>
      </div>
      <span ref={readout} className="spsurf-hexmesh__readout sp-readout">
        HEX 00.00
      </span>
      <div className="spsurf-body">
        <CardCopy />
      </div>
    </div>
  )
}
