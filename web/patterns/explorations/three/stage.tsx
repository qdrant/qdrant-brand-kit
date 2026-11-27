"use client"

import * as React from "react"
import { Color, SRGBColorSpace, WebGLRenderer, type Camera, type Material, type Object3D, type Texture } from "three"

import { readPalette, type Palette, type PaletteKey } from "../../../visuals/scene"
import type { PatternKind } from "../../types"
import { clamp, measureGuards, type Guard } from "../cosmos"

// The three.js stage (marketing designer, 2026-11-27): the one runner every three.js scene on the website goes
// through, so each scene only describes what it draws. Like visuals/scene.tsx, it:
// - reads its colors from the --web-scene-* variables in styles/web.css, and builds the scene again when the theme
//   changes;
// - holds a WebGL context only while it's near the screen (browsers keep about 16 at once), and gives it back,
//   with every geometry, material and texture, when it scrolls away;
// - draws only while the tab is visible, and one still frame (t = 12) for reduced motion;
// - caps the pixel ratio (1.5 by default) and asks for the low-power GPU.
// What it adds for a scene: the pointer over its section or card, eased; how far it has scrolled through the
// viewport; and the text guard's boxes, so a background keeps its marks off the letters.
//
// Never import this file directly: it pulls in three.js. Load a scene through ./index.tsx (threePattern or
// threeVisual), which loads three.js only when the scene is on the page.

export type StageKind = PatternKind | "visual"
export type StageSize = { width: number; height: number; dpr: number }

// The pointer, eased: x from -1 (left) to 1 (right), y from -1 (bottom) to 1 (top), as three.js's normalized device
// coordinates (ready for a Raycaster), 0 at the center where it rests when the pointer leaves; hover from 0 to 1.
export type StagePointer = { x: number; y: number; hover: number }

export type StageTick = {
  // Seconds since the scene started (12 when still) and since the last frame (at most 0.1).
  t: number
  dt: number
  // Reduced motion: draw one calm frame.
  still: boolean
  pointer: StagePointer
  // How far the stage has travelled through the viewport, 0 (below) to 1 (above).
  scroll: number
  size: StageSize
  // Text and controls over the stage, in CSS pixels from its top left. Empty for a visual.
  guards: Guard[]
}

export type StageContext = {
  renderer: WebGLRenderer
  size: StageSize
  palette: Palette
  // A --web-scene-* color as a three.js Color, in sRGB like the CSS.
  color: (key: PaletteKey) => Color
}

export type StageBuild = {
  scene: Object3D
  camera: Camera
  // Called before each render: move things here.
  frame?: (tick: StageTick) => void
  // Called after the canvas changes size. A PerspectiveCamera's aspect is already updated.
  resize?: (size: StageSize) => void
  // Anything the stage can't find in the scene graph (render targets, extra textures).
  dispose?: () => void
}

export type ThreeScene = {
  // Builds the scene: on load, when it comes back on screen and when the theme changes.
  build: (ctx: StageContext) => StageBuild
  // Still scenes draw once, and again when the pointer moves or the size changes. Animated by default.
  animate?: boolean
  maxDpr?: number
  antialias?: boolean
}

// ---- Helpers --------------------------------------------------------------------------------------------------------

let probe: CanvasRenderingContext2D | null = null
// Any CSS color (oklch, color-mix…) as a three.js Color, through a 1px canvas.
export function cssColor(css: string) {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  const out = new Color()
  if (!probe) return out
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = css
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  return out.setRGB((d[0] ?? 0) / 255, (d[1] ?? 0) / 255, (d[2] ?? 0) / 255, SRGBColorSpace)
}

// Frees every geometry, material and texture under an object.
export function disposeTree(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Object3D & { geometry?: { dispose(): void }; material?: Material | Material[] }
    mesh.geometry?.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if ((value as Texture | null)?.isTexture) (value as Texture).dispose()
      }
      material.dispose()
    }
  })
}

// How far an element has travelled through the viewport, 0 to 1, through the studio's frame when it's in one.
function scrollProgress(el: Element) {
  const r = el.getBoundingClientRect()
  let top = r.top
  let height = r.height
  let vh = window.innerHeight
  const frame = window.frameElement
  if (frame) {
    const f = frame.getBoundingClientRect()
    const scale = f.width / Math.max(1, window.innerWidth)
    top = f.top + r.top * scale
    height = r.height * scale
    vh = window.parent.innerHeight
  }
  return clamp((vh - top) / Math.max(1, vh + height))
}

// The section (a background), the card (a surface) or the element around it (a visual) the stage listens to.
function scopeOf(host: HTMLElement, kind: StageKind) {
  if (kind === "surface") return host.closest<HTMLElement>(".web-plate")
  if (kind === "background") return host.closest(".web-pattern")?.parentElement as HTMLElement | null
  return host.parentElement ?? host
}

// ---- The stage ------------------------------------------------------------------------------------------------------

export function ThreeStage({ scene: def, kind = "visual" }: { scene: ThreeScene; kind?: StageKind }) {
  const host = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = host.current
    const scope = el ? scopeOf(el, kind) : null
    if (!el || !scope) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    const animate = def.animate !== false && !reduce
    const target = { x: 0, y: 0, hover: 0 }
    const pointer: StagePointer = { x: 0, y: 0, hover: 0 }
    const size: StageSize = { width: 1, height: 1, dpr: 1 }
    let guards: Guard[] = []
    let renderer: WebGLRenderer | null = null
    let built: StageBuild | null = null
    let near = false
    let raf = 0
    const start = performance.now()
    let last = start

    const measure = () => {
      if (kind !== "visual") guards = measureGuards(scope, el, kind)
    }
    const fit = () => {
      if (!renderer || !built) return
      const r = el.getBoundingClientRect()
      size.width = Math.max(1, r.width)
      size.height = Math.max(1, r.height)
      size.dpr = Math.min(def.maxDpr ?? 1.5, window.devicePixelRatio || 1)
      renderer.setPixelRatio(size.dpr)
      renderer.setSize(size.width, size.height, false)
      const camera = built.camera as Camera & { isPerspectiveCamera?: boolean; aspect?: number }
      if (camera.isPerspectiveCamera) {
        camera.aspect = size.width / size.height
        ;(camera as Camera & { updateProjectionMatrix(): void }).updateProjectionMatrix()
      }
      built.resize?.(size)
    }
    const draw = (now: number) => {
      if (!renderer || !built) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      // About a second to catch up: the scene follows the hand, it never snaps to it.
      const k = animate ? 1 - Math.exp(-dt * 2.4) : 1
      pointer.x += (target.x - pointer.x) * k
      pointer.y += (target.y - pointer.y) * k
      pointer.hover += (target.hover - pointer.hover) * k
      built.frame?.({
        t: reduce ? 12 : (now - start) / 1000,
        dt: reduce ? 0 : dt,
        still: reduce,
        pointer,
        scroll: scrollProgress(el),
        size,
        guards,
      })
      renderer.render(built.scene, built.camera)
    }
    const loop = (now: number) => {
      raf = 0
      draw(now)
      if (animate && near && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const request = () => {
      if (!raf && near && !document.hidden) raf = requestAnimationFrame(loop)
    }

    const unbuild = () => {
      if (!built) return
      built.dispose?.()
      disposeTree(built.scene)
      built = null
    }
    const build = () => {
      if (!renderer) return
      unbuild()
      const palette = readPalette(el)
      built = def.build({ renderer, size, palette, color: (key) => cssColor(palette[key]) })
      fit()
      request()
    }
    const lost = (e: Event) => {
      e.preventDefault()
      release()
      if (near) window.setTimeout(init, 500)
    }
    // A new canvas each time: a canvas whose context was given back can't make another.
    const init = () => {
      if (renderer || !near) return
      const canvas = document.createElement("canvas")
      canvas.style.cssText = "display:block;width:100%;height:100%"
      try {
        renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: def.antialias ?? true,
          powerPreference: "low-power",
        })
      } catch {
        return // No WebGL: the section shows without its scene.
      }
      renderer.setClearColor(0x000000, 0)
      canvas.addEventListener("webglcontextlost", lost)
      el.appendChild(canvas)
      build()
    }
    function release() {
      cancelAnimationFrame(raf)
      raf = 0
      unbuild()
      if (!renderer) return
      const canvas = renderer.domElement
      canvas.removeEventListener("webglcontextlost", lost)
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
      renderer = null
    }

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = clamp(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, -1, 1)
      target.y = clamp(1 - ((e.clientY - r.top) / Math.max(1, r.height)) * 2, -1, 1)
      target.hover = 1
      request()
    }
    const leave = () => {
      target.x = 0
      target.y = 0
      target.hover = 0
      request()
    }
    scope.addEventListener("pointermove", move)
    scope.addEventListener("pointerleave", leave)
    if (kind !== "visual") scope.addEventListener("pointerenter", measure)

    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry?.isIntersecting ?? false
        if (near) {
          if (renderer) request()
          else init()
        } else release()
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    const ro = new ResizeObserver(() => {
      measure()
      fit()
      request()
    })
    ro.observe(el)
    if (scope !== el) ro.observe(scope)
    const theme = new MutationObserver(build)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] })
    document.addEventListener("visibilitychange", request)
    const timers = [250, 1200, 3000].map((ms) => window.setTimeout(measure, ms))
    void document.fonts?.ready.then(measure)
    measure()

    return () => {
      release()
      io.disconnect()
      ro.disconnect()
      theme.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
      scope.removeEventListener("pointermove", move)
      scope.removeEventListener("pointerleave", leave)
      scope.removeEventListener("pointerenter", measure)
      document.removeEventListener("visibilitychange", request)
    }
  }, [def, kind])

  return <div ref={host} aria-hidden className="pointer-events-none absolute inset-0" />
}
