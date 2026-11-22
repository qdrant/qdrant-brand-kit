"use client"

import { useEffect, useRef } from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// The engine for the website's canvas and WebGL visuals (the globe, the depth haze), from the studio's Space page
// (Juan, 2026-11-22). Every scene:
// - reads its colors from the --web-scene-* variables in styles/web.css, so it follows the theme;
// - draws only while it's on screen and the tab is visible;
// - draws one still frame when the visitor prefers reduced motion;
// - gets the pointer, relative to the canvas, from the element around it.

const KEYS = [
  "bg",
  "star",
  "dim",
  "grid",
  "line",
  "label",
  "surface",
  "haze",
  "violet",
  "glow",
  "bright",
  "accent",
  "plum",
  "faint",
  "ramp-0",
  "ramp-1",
  "ramp-2",
  "ramp-3",
  "ramp-4",
] as const

export type PaletteKey = (typeof KEYS)[number]
export type Palette = Record<PaletteKey, string> & { mono: string }
export type Size = { width: number; height: number; dpr: number }
export type Pointer = { x: number; y: number; inside: boolean; clicks: number }

export type CanvasScene<S> = {
  // Builds the scene for a size and the theme's colors: on load, on resize and when the theme changes.
  setup: (size: Size, palette: Palette) => S
  // Draws one frame, in CSS pixels. t is in seconds.
  draw: (
    ctx: CanvasRenderingContext2D,
    state: S,
    t: number,
    pointer: Pointer,
    size: Size
  ) => void
  // Still scenes draw once, and again when the pointer moves.
  animate?: boolean
}

export function readPalette(el: Element): Palette {
  const style = getComputedStyle(el)
  const palette = {
    mono: style.getPropertyValue("--qd-font-family-mono").trim() || "monospace",
  } as Palette
  for (const key of KEYS)
    palette[key] = style.getPropertyValue(`--web-scene-${key}`).trim() || "transparent"
  return palette
}

// Any CSS color as [r, g, b] (0 to 255), read back from a 1px canvas.
const rgbCache = new Map<string, [number, number, number]>()
export function rgb(color: string): [number, number, number] {
  const cached = rgbCache.get(color)
  if (cached) return cached
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return [0, 0, 0]
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data
  const value: [number, number, number] = [r, g, b]
  rgbCache.set(color, value)
  return value
}

// A palette color with an alpha, for gradients.
export function alpha(color: string, a: number) {
  const [r, g, b] = rgb(color)
  return `rgb(${r} ${g} ${b} / ${a})`
}

// Clears the frame and paints the scene's background. A wrapper can set --web-scene-bg: transparent to lay the
// scene over another background.
export function clear(ctx: CanvasRenderingContext2D, p: Palette, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = p.bg
  ctx.fillRect(0, 0, w, h)
}

// Mono labels in canvas scenes: 12px, the smallest size on the type scale.
export function label(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  text: string,
  x: number,
  y: number,
  options: { color?: string; align?: CanvasTextAlign; opacity?: number } = {}
) {
  ctx.save()
  ctx.font = `500 12px ${p.mono}`
  ctx.textBaseline = "middle"
  ctx.textAlign = options.align ?? "left"
  ctx.globalAlpha = options.opacity ?? 1
  ctx.fillStyle = options.color ?? p.label
  ctx.fillText(text, x, y)
  ctx.restore()
}

// A readout chip: mono text in a small hairline box, like an instrument's display.
export function chip(
  ctx: CanvasRenderingContext2D,
  p: Palette,
  text: string,
  x: number,
  y: number,
  opacity = 1
) {
  ctx.save()
  ctx.font = `500 12px ${p.mono}`
  const width = Math.ceil(ctx.measureText(text).width) + 16
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.roundRect(Math.round(x) + 0.5, Math.round(y - 12) + 0.5, width, 24, 4)
  ctx.fillStyle = alpha(p.surface, 0.9)
  ctx.fill()
  ctx.strokeStyle = p.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = p.star
  ctx.textBaseline = "middle"
  ctx.fillText(text, Math.round(x) + 8, Math.round(y) + 1)
  ctx.restore()
  return width
}

type Loop = {
  setup: (size: Size, palette: Palette) => void
  frame: (t: number, pointer: Pointer) => void
  animate: boolean
}

// Runs a scene on a canvas: sizes it, watches the theme, the pointer and visibility, and calls frame().
// Returns the cleanup.
export function runLoop(canvas: HTMLCanvasElement, loop: Loop) {
  const host = canvas.parentElement ?? canvas
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  const pointer: Pointer = { x: 0, y: 0, inside: false, clicks: 0 }
  const start = performance.now()
  let ready = false
  let visible = false
  let raf = 0

  const draw = (now: number) => {
    raf = 0
    if (!ready) return
    loop.frame(reduce ? 12 : (now - start) / 1000, pointer)
    if (loop.animate && !reduce && visible && !document.hidden)
      raf = requestAnimationFrame(draw)
  }
  const request = () => {
    if (!raf && visible) raf = requestAnimationFrame(draw)
  }
  let stopped = false
  const build = () => {
    if (stopped) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    loop.setup({ width: rect.width, height: rect.height, dpr }, readPalette(canvas))
    ready = true
    request()
  }
  const move = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = event.clientX - rect.left
    pointer.y = event.clientY - rect.top
    pointer.inside = true
    request()
  }
  const leave = () => {
    pointer.inside = false
    request()
  }
  const click = () => {
    pointer.clicks += 1
    request()
  }

  const resize = new ResizeObserver(build)
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    request()
  })
  const theme = new MutationObserver(build)
  resize.observe(canvas)
  seen.observe(canvas)
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  })
  host.addEventListener("pointermove", move)
  host.addEventListener("pointerleave", leave)
  host.addEventListener("click", click)
  document.addEventListener("visibilitychange", request)
  // Labels are drawn in Mona Sans Mono: draw again once the fonts are in.
  document.fonts?.ready.then(build)

  return () => {
    stopped = true
    cancelAnimationFrame(raf)
    resize.disconnect()
    seen.disconnect()
    theme.disconnect()
    host.removeEventListener("pointermove", move)
    host.removeEventListener("pointerleave", leave)
    host.removeEventListener("click", click)
    document.removeEventListener("visibilitychange", request)
  }
}

// A 2D canvas scene that fills its parent (which must be positioned).
export function SceneCanvas<S>({
  scene,
  className,
}: {
  scene: CanvasScene<S>
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    let state: S | null = null
    let size: Size = { width: 0, height: 0, dpr: 1 }
    return runLoop(canvas, {
      animate: scene.animate ?? true,
      setup(next, palette) {
        size = next
        state = scene.setup(next, palette)
      },
      frame(t, pointer) {
        if (!state) return
        ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
        scene.draw(ctx, state, t, pointer, size)
      },
    })
  }, [scene])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  )
}

const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`

// A WebGL2 fragment shader that fills its parent. It gets:
//   uniform vec2 u_res;      the drawing buffer's size, in device pixels
//   uniform float u_time;    seconds
//   uniform vec2 u_pointer;  the pointer in device pixels (y up), or (-1, -1) when it's away
//   uniform float u_dpr;     device pixels per CSS pixel
//   uniform vec3 u_c0 ...    the palette colors listed in `colors`, in order
// Browsers keep about 16 WebGL contexts alive at once, so a shader holds its context only while it's on screen or
// near it, and gives it back when it scrolls away.
export function SceneShader({
  fragment,
  colors,
  className,
}: {
  fragment: string
  colors: readonly PaletteKey[]
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let live: (() => void) | null = null
    let wanted = false

    const start = () => {
      if (live || !wanted) return
      const gl =
        contexts.get(canvas) ?? canvas.getContext("webgl2", { antialias: false, alpha: false })
      if (!gl) return
      contexts.set(canvas, gl)
      if (gl.isContextLost()) {
        // It continues on webglcontextrestored.
        try {
          loseContext.get(canvas)?.restoreContext()
        } catch {
          // Lost by the browser, not by us: it can't be restored here.
        }
        return
      }
      if (!loseContext.has(canvas)) {
        const ext = gl.getExtension("WEBGL_lose_context")
        if (ext) loseContext.set(canvas, ext)
      }
      live = mount(gl, canvas, fragment, colors)
    }
    const end = () => {
      live?.()
      live = null
      // Only a context this canvas already has: asking for one here would create it.
      const gl = contexts.get(canvas)
      if (gl && !gl.isContextLost()) loseContext.get(canvas)?.loseContext()
    }
    const lost = (event: Event) => {
      event.preventDefault() // so the context can be restored later
      live?.()
      live = null
    }
    const near = new IntersectionObserver(
      ([entry]) => {
        wanted = entry?.isIntersecting ?? false
        if (wanted) start()
        else end()
      },
      { rootMargin: "200px" }
    )
    canvas.addEventListener("webglcontextlost", lost)
    canvas.addEventListener("webglcontextrestored", start)
    near.observe(canvas)
    return () => {
      near.disconnect()
      wanted = false
      end()
      canvas.removeEventListener("webglcontextlost", lost)
      canvas.removeEventListener("webglcontextrestored", start)
    }
  }, [fragment, colors])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  )
}

const contexts = new WeakMap<HTMLCanvasElement, WebGL2RenderingContext>()
const loseContext = new WeakMap<HTMLCanvasElement, WEBGL_lose_context>()

// Compiles the shader into the context and runs it. Returns the cleanup.
function mount(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  fragment: string,
  colors: readonly PaletteKey[]
) {
  const program = link(gl, VERTEX, fragment)
  if (!program) return () => {}
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  // One triangle that covers the screen.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, "position")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  gl.useProgram(program)
  const at = (name: string) => gl.getUniformLocation(program, name)
  const uRes = at("u_res")
  const uTime = at("u_time")
  const uPointer = at("u_pointer")
  const uDpr = at("u_dpr")
  let size: Size = { width: 0, height: 0, dpr: 1 }

  const stop = runLoop(canvas, {
    animate: true,
    setup(next, palette) {
      size = next
      gl.viewport(0, 0, canvas.width, canvas.height)
      colors.forEach((key, i) => {
        const [r, g, b] = rgb(palette[key])
        gl.uniform3f(at(`u_c${i}`), r / 255, g / 255, b / 255)
      })
    },
    frame(t, pointer) {
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform1f(uDpr, size.dpr)
      if (pointer.inside)
        gl.uniform2f(uPointer, pointer.x * size.dpr, canvas.height - pointer.y * size.dpr)
      else gl.uniform2f(uPointer, -1, -1)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
  })
  return () => {
    stop()
    if (!gl.isContextLost()) {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }
}

function link(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }
  const vs = compile(gl.VERTEX_SHADER, vertex)
  const fs = compile(gl.FRAGMENT_SHADER, fragment)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }
  return program
}

// GLSL helpers the shaders share: value noise, fbm, and the 4 x 4 Bayer matrix for ordered dithering.
export const GLSL_NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
float bayer4(vec2 cell) {
  int x = int(mod(cell.x, 4.0)), y = int(mod(cell.y, 4.0));
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[y * 4 + x]) + 0.5) / 16.0;
}
`
