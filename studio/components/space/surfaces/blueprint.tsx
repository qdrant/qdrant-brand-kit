"use client"

import { useEffect, useRef, useState } from "react"

import { CardCopy } from "./card-copy"

// Blueprint: a dashed 8px grid inside the card, with rulers along the top and left edges that meet at an
// origin marked in the accent. The two corners carry their coordinates in the rulers' frame; the far one is
// measured in the browser.

// The rulers' width: the grid and its coordinates start here.
const RULER = 20
const LABELS = [64, 128, 192, 256]

export function Blueprint() {
  const ref = useRef<HTMLDivElement>(null)
  const [far, setFar] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const resize = new ResizeObserver(() =>
      setFar({ x: el.clientWidth - RULER, y: el.clientHeight - RULER })
    )
    resize.observe(el)
    return () => resize.disconnect()
  }, [])

  return (
    <div ref={ref} className="spsurf spsurf-card spsurf-blueprint">
      <div aria-hidden className="spsurf-blueprint__grid" />
      <div aria-hidden className="spsurf-blueprint__ruler spsurf-blueprint__ruler--x">
        {LABELS.map((n) => (
          <span key={n} className="sp-readout" style={{ left: n }}>
            {n}
          </span>
        ))}
      </div>
      <div aria-hidden className="spsurf-blueprint__ruler spsurf-blueprint__ruler--y" />
      <span aria-hidden className="spsurf-blueprint__origin" />
      <span aria-hidden className="spsurf-blueprint__coord spsurf-blueprint__coord--near sp-readout">
        X 0 Y 0
      </span>
      <span aria-hidden className="spsurf-blueprint__coord spsurf-blueprint__coord--far sp-readout">
        X {far.x} Y {far.y}
      </span>
      <div className="spsurf-blueprint__body">
        <CardCopy />
      </div>
    </div>
  )
}
