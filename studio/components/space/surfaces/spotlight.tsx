"use client"

import { useEffect, useRef } from "react"

import { CardCopy } from "./card-copy"

// Spotlight: a soft light follows the pointer across the card's surface, and lights the hairline border
// near it. At rest it falls from above, at half strength; when the pointer leaves it glides back. The light
// and the border are CSS gradients (surfaces.css); this file only passes the pointer.
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty("--spsurf-sx", `${event.clientX - rect.left}px`)
      el.style.setProperty("--spsurf-sy", `${event.clientY - rect.top}px`)
    }
    const leave = () => {
      el.style.removeProperty("--spsurf-sx")
      el.style.removeProperty("--spsurf-sy")
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
    }
  }, [])

  return (
    <div ref={ref} className="spsurf spsurf-card spsurf-body spsurf-spot">
      <span aria-hidden className="spsurf-spot__light" />
      <span aria-hidden className="spsurf-spot__rim" />
      <CardCopy />
    </div>
  )
}
