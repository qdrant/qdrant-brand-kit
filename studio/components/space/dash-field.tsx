"use client"

import { useEffect, useRef, useState } from "react"

// Dash field: the brand's Generative-Dash-Pattern (brand-assets/patterns), drawn by the pattern library
// itself, never redrawn here, used as a section's star field. It fades out where the copy sits. The
// pattern is a grid of its own, so no other grid goes on top. Patterns render slowly, so it renders once
// per size (web/AGENTS.md).

const PATTERNS = "/repo/brand-assets/patterns"
const PRESET = "generative-dash-pattern"

type Library = {
  loadTokens: (url: string) => Promise<unknown>
  loadPreset: (id: string, base: string) => Promise<unknown>
  renderPattern: (
    canvas: HTMLCanvasElement,
    tokens: unknown,
    preset: unknown,
    options: { width: number; height: number; colorway?: number }
  ) => unknown
}

export function DashField() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let cancelled = false
    let timer = 0
    let last = ""
    // The pattern library runs in the browser as it is: an ES module served from the repo at /repo/.
    const url = `${PATTERNS}/patterns/index.js`
    const loaded = (
      import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url) as Promise<Library>
    ).then(async (lib) => {
      const [tokens, preset] = await Promise.all([
        lib.loadTokens(`${PATTERNS}/tokens/placeholder.tokens.json`),
        lib.loadPreset(PRESET, `${PATTERNS}/presets`),
      ])
      return { lib, tokens, preset }
    })

    const render = async () => {
      const { lib, tokens, preset } = await loaded
      const rect = canvas.getBoundingClientRect()
      const scale = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.round(rect.width * scale)
      const height = Math.round(rect.height * scale)
      const key = `${width}x${height}`
      if (cancelled || width < 1 || height < 1 || key === last) return
      last = key
      lib.renderPattern(canvas, tokens, preset, { width, height, colorway: 0 })
      setReady(true)
    }
    const resize = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(render, 250)
    })
    resize.observe(canvas)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      resize.disconnect()
    }
  }, [])

  return (
    <>
      <canvas
        ref={ref}
        aria-hidden
        className="sp-dash pointer-events-none absolute inset-0 size-full transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      />
      <span className="sp-readout pointer-events-none absolute right-4 bottom-4">
        Generative-Dash-Pattern
      </span>
    </>
  )
}
