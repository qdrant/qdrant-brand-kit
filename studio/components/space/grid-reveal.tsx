"use client"

import { useEffect, useRef } from "react"

// Grid reveal: a quiet hairline grid. Around the pointer a brighter grid and its intersections show, with a
// crosshair that snaps to the 8px grid and reads its position. With no pointer, the lens drifts on its own.
const SNAP = 8

export function GridReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const readout = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    let inside = false
    let visible = false
    let raf = 0
    const start = performance.now()

    const place = (x: number, y: number) => {
      const sx = Math.round(x / SNAP) * SNAP
      const sy = Math.round(y / SNAP) * SNAP
      el.style.setProperty("--mx", `${x}px`)
      el.style.setProperty("--my", `${y}px`)
      el.style.setProperty("--sx", `${sx}px`)
      el.style.setProperty("--sy", `${sy}px`)
      if (readout.current)
        readout.current.textContent = `X ${String(sx).padStart(4, "0")}  Y ${String(sy).padStart(4, "0")}`
    }
    const drift = (now: number) => {
      raf = 0
      if (inside || !visible) return
      const t = reduce ? 4 : (now - start) / 1000
      const { width, height } = el.getBoundingClientRect()
      place(
        width * (0.62 + 0.24 * Math.sin(t * 0.21)),
        height * (0.5 + 0.28 * Math.sin(t * 0.33 + 1))
      )
      if (!reduce) raf = requestAnimationFrame(drift)
    }
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      inside = true
      place(event.clientX - rect.left, event.clientY - rect.top)
    }
    const leave = () => {
      inside = false
      if (!raf) raf = requestAnimationFrame(drift)
    }
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(drift)
    })
    seen.observe(el)
    host.addEventListener("pointermove", move)
    host.addEventListener("pointerleave", leave)
    return () => {
      cancelAnimationFrame(raf)
      seen.disconnect()
      host.removeEventListener("pointermove", move)
      host.removeEventListener("pointerleave", leave)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden className="sp-reveal pointer-events-none absolute inset-0">
      <div className="sp-reveal__base" />
      <div className="sp-reveal__lens" />
      <div className="sp-reveal__cross" />
      <span ref={readout} className="sp-reveal__readout sp-readout" />
    </div>
  )
}
