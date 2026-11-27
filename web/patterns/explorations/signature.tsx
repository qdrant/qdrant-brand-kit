"use client"

import * as React from "react"

import { ASSETS } from "../../lib/assets"
import { readPalette, type PaletteKey } from "../../visuals/scene"
import { definePattern, type PatternKind, type PatternNote } from "../types"
import { TAU, clamp, cosmos, measureGuards, type Env } from "./cosmos"
import { mulberry } from "./engine"

// Signature (2026-11-27, exploring): patterns from Qdrant's own world rather than generic shapes, after the design
// lead's notes ("elevate the brand"; what makes Qdrant recognizable: the astronaut, the space, the mascot, the noise;
// "the space itself"). Read from the brand's own references (brand-assets/imagery: violet Milky Way skies over night
// dunes, worn white suits, a glowing LED panel; brand-assets/mascot: Qbot's LED visor), and built from the brand's
// own materials where they exist:
// - The sky and the dunes: a Milky Way that turns as slowly as a long exposure, over dune ridges in parallax, with a
//   live film grain (the noise). WebGL, on its own small runner below (eased parallax, the scroll and a text guard
//   inside the shader), since the shared one (visuals/scene.tsx) has none of those.
// - The LED panel: Qbot's visor and the panel in the references, as a dot-matrix that lights where the pointer
//   touches it, shows a vector search as light, and scrolls the visor's own line ("Don't get lost in vector space").
// - Qbot: an approved 3D pose (brand-assets/mascot/3d/references), as it is, with mascot.css's glow, placed by the
//   mascot rules (beside the lower part of the text, cut by the bottom edge), leaning toward the pointer.
// - The noise: the approved Mesh-Dithered and Motion-Streaks patterns, rendered by the brand's own pattern engine
//   (brand-assets/patterns, served by the studio at /repo), unchanged, with a slow drift and a live grain on top.

const REPO = ASSETS.replace(/\/web\/assets$/, "")
const PATTERNS = `${REPO}/brand-assets/patterns`

const SPACE: PatternNote = {
  rule: "Space, subtly: avoid nebula gradients, planets and glows",
  source: "design-system/DESIGN.md, References: Space, subtly (2026-11-14)",
  text: "It shows the space itself, as the design lead asked on 2026-11-27: a Milky Way, which is a nebula gradient. Bolder than the space rule allows; keeping it means updating that rule, for the design lead to decide.",
}
const OWN: PatternNote = {
  rule: "Patterns come from the brand",
  source: "brand-assets/imagery/styles/default/references; web/guidelines.ts, Patterns and effects",
  text: "Drawn from the brand's own image references (night skies over dunes), not a third party's. Stars never sit under letters (a text guard inside the shader); the sky's light and the grain do.",
}
const LED: PatternNote = {
  rule: "Never redraw an approved part",
  source: "AGENTS.md, Never; brand-assets/mascot",
  text: "The dot-matrix is Qbot's visor and the reference's LED panel, as a material, not Qbot's face: no eyes, no expressions. The visor's line (\"Don't get lost in vector space\") is from an approved pose. Lit LEDs are drawn as dots with a faint halo, never blurred.",
}
const QBOT: PatternNote = {
  rule: "Qbot in a creative",
  source: "guidelines/README.md section 6; brand-assets/mascot/3d/mascot.css",
  text: "An approved pose (curious) as it is, with .qd-mascot--glow. Placed by the creative rules, as the web has none yet: beside the lower part of the text, never beside the heading, cut by the bottom edge, face whole. It's one hero: never with another visual.",
}
const ENGINE: PatternNote = {
  rule: "Animating an approved pattern needs the visual designer's yes",
  source: "pattern-motion-recommendations (2026-11-26); brand-assets/patterns/README.md",
  text: "The pattern is rendered by the brand's own engine and isn't changed; only the frame moves (a slow drift) and a live grain sits on top. The meshes in brand-assets/patterns/meshes are the repo's test examples, not the library.",
}
const MOVE: PatternNote = {
  rule: "Slow or still, and subtle",
  source: "web/AGENTS.md, Adding a pattern",
  text: "Bolder than the website's patterns so far: it leans with the pointer (eased, about a second behind) and with the scroll. At rest it turns slowly; for reduced motion it holds still.",
}

// ---- Shared pieces ---------------------------------------------------------------------------------------------------

// The section (a background) or the card (a surface) a layer belongs to.
function scopeOf(host: HTMLElement, kind: PatternKind) {
  return kind === "surface"
    ? host.closest<HTMLElement>(".web-plate")
    : (host.closest(".web-pattern")?.parentElement as HTMLElement | null)
}

// How far the layer has travelled through the viewport, 0 to 1, through the studio's frame when it's in one.
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

// Any CSS color (oklch, color-mix…) as 0–1 RGB, through a 1 px canvas.
let probe: CanvasRenderingContext2D | null = null
function toRgb(color: string): [number, number, number] {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!probe) return [0, 0, 0]
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  return [(d[0] ?? 0) / 255, (d[1] ?? 0) / 255, (d[2] ?? 0) / 255]
}

// The pointer over a scope, eased: x and y from -1 to 1 (0 at the center, where it rests when the pointer leaves),
// and hover from 0 to 1. Read every frame by the layer's own loop.
function easedPointer(scope: HTMLElement, host: HTMLElement) {
  const target = { x: 0, y: 0, h: 0 }
  const now = { x: 0, y: 0, h: 0 }
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    target.x = clamp(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, -1, 1)
    target.y = clamp(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1, -1, 1)
    target.h = 1
  }
  const leave = () => {
    target.x = 0
    target.y = 0
    target.h = 0
  }
  scope.addEventListener("pointermove", move)
  scope.addEventListener("pointerleave", leave)
  return {
    now,
    step(dt: number, still: boolean) {
      // About a second to catch up: the layer follows the hand, it never snaps to it.
      const k = still ? 1 : 1 - Math.exp(-dt * 2.4)
      now.x += (target.x - now.x) * k
      now.y += (target.y - now.y) * k
      now.h += (target.h - now.h) * k
    },
    stop() {
      scope.removeEventListener("pointermove", move)
      scope.removeEventListener("pointerleave", leave)
    },
  }
}

// ---- A small WebGL runner ---------------------------------------------------------------------------------------------
// Like visuals/scene.tsx's SceneShader (draws only near the screen, gives its context back off screen, holds still
// for reduced motion), plus what these need: the eased pointer, the scroll, and the text guard's boxes as uniforms,
// so a shader can keep its marks (stars) off the letters while its light and grain go on under them.

const MAX_GUARDS = 48
const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`

const GLSL = `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0., a = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = m * p; a *= .5; }
  return s;
}
// 1 under the text guard's boxes (each grown by 10 x 8 px, with 6 px corners), fading out over 18 px.
float guardAt(vec2 px) {
  float g = 0.;
  for (int i = 0; i < ${MAX_GUARDS}; i++) {
    if (i >= u_guards) break;
    vec4 r = u_guard[i];
    vec2 q = abs(px - (r.xy + r.zw * .5)) - (r.zw * .5 + vec2(10., 8.)) + 6.;
    float d = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - 6.;
    g = max(g, 1. - smoothstep(0., 18., d));
  }
  return g;
}`

const HEADER = (colors: number) => `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_dpr;
uniform float u_time;
uniform vec2 u_ptr;
uniform float u_hover;
uniform float u_scroll;
uniform vec4 u_guard[${MAX_GUARDS}];
uniform int u_guards;
${Array.from({ length: colors }, (_, i) => `uniform vec3 u_c${i};`).join("\n")}
out vec4 color;
${GLSL}`

function compile(gl: WebGL2RenderingContext, fragment: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s))
      gl.deleteShader(s)
      return null
    }
    return s
  }
  const v = make(gl.VERTEX_SHADER, VERTEX)
  const f = make(gl.FRAGMENT_SHADER, fragment)
  const p = gl.createProgram()
  if (!v || !f || !p) return null
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  gl.deleteShader(v)
  gl.deleteShader(f)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(p))
    return null
  }
  return p
}

function SignatureShader({
  body,
  colors,
  kind,
  maxDpr = 1.5,
}: {
  body: string
  colors: readonly PaletteKey[]
  kind: PatternKind
  maxDpr?: number
}) {
  const host = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = host.current
    const canvas = el?.querySelector("canvas")
    const scope = el ? scopeOf(el, kind) : null
    if (!el || !canvas || !scope) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    const pointer = easedPointer(scope, el)
    const guards = new Float32Array(MAX_GUARDS * 4)
    let guardCount = 0
    let gl: WebGL2RenderingContext | null = null
    let lose: WEBGL_lose_context | null = null
    let program: WebGLProgram | null = null
    let at: (name: string) => WebGLUniformLocation | null = () => null
    let raf = 0
    let near = false
    let dpr = 1
    const start = performance.now()
    let last = start

    const measure = () => {
      const list = measureGuards(scope, el, kind).slice(0, MAX_GUARDS)
      guards.fill(0)
      list.forEach((g, i) => guards.set([g.x, g.y, g.w, g.h], i * 4))
      guardCount = list.length
    }
    const fit = () => {
      if (!gl || !program) return
      const r = el.getBoundingClientRect()
      dpr = Math.min(maxDpr, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.round(r.width * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      const palette = readPalette(canvas)
      colors.forEach((key, i) => gl?.uniform3f(at(`u_c${i}`), ...toRgb(palette[key])))
    }
    const draw = (now: number) => {
      if (!gl || !program) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      pointer.step(dt, reduce)
      gl.uniform2f(at("u_res"), canvas.width, canvas.height)
      gl.uniform1f(at("u_dpr"), dpr)
      gl.uniform1f(at("u_time"), reduce ? 12 : (now - start) / 1000)
      gl.uniform2f(at("u_ptr"), pointer.now.x, pointer.now.y)
      gl.uniform1f(at("u_hover"), pointer.now.h)
      gl.uniform1f(at("u_scroll"), scrollProgress(canvas))
      gl.uniform4fv(at("u_guard"), guards)
      gl.uniform1i(at("u_guards"), guardCount)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = (now: number) => {
      draw(now)
      raf = near && !reduce && !document.hidden ? requestAnimationFrame(loop) : 0
    }
    const run = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const init = () => {
      gl = canvas.getContext("webgl2", { antialias: false, alpha: false })
      if (!gl || gl.isContextLost()) {
        lose?.restoreContext()
        return
      }
      lose ??= gl.getExtension("WEBGL_lose_context")
      program = compile(gl, HEADER(colors.length) + body)
      if (!program) return
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const pos = gl.getAttribLocation(program, "position")
      gl.enableVertexAttribArray(pos)
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
      gl.useProgram(program)
      const cache = new Map<string, WebGLUniformLocation | null>()
      const prog = program
      const ctx = gl
      at = (name) => {
        if (!cache.has(name)) cache.set(name, ctx.getUniformLocation(prog, name))
        return cache.get(name) ?? null
      }
      fit()
      run()
    }
    const release = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (gl && !gl.isContextLost()) {
        if (program) gl.deleteProgram(program)
        lose?.loseContext()
      }
      program = null
    }
    const restored = () => {
      if (near) init()
    }
    const lost = (e: Event) => {
      e.preventDefault()
      program = null
    }
    canvas.addEventListener("webglcontextlost", lost)
    canvas.addEventListener("webglcontextrestored", restored)
    // Holds its context only near the screen: browsers keep about 16 at once.
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry?.isIntersecting ?? false
        if (near) {
          if (program) run()
          else init()
        } else release()
      },
      { rootMargin: "200px" }
    )
    io.observe(canvas)
    const ro = new ResizeObserver(() => {
      measure()
      fit()
      if (reduce) requestAnimationFrame(draw)
    })
    ro.observe(scope)
    const timers = [250, 1200, 3000].map((ms) => window.setTimeout(measure, ms))
    void document.fonts?.ready.then(measure)
    const visible = () => {
      if (!document.hidden && near && program) run()
    }
    document.addEventListener("visibilitychange", visible)
    measure()
    return () => {
      io.disconnect()
      ro.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
      document.removeEventListener("visibilitychange", visible)
      canvas.removeEventListener("webglcontextlost", lost)
      canvas.removeEventListener("webglcontextrestored", restored)
      pointer.stop()
      release()
    }
  }, [body, colors, kind, maxDpr])

  return (
    <div
      ref={host}
      className="absolute inset-0"
      // A background takes the section's own color, so its edges never show.
      style={kind === "background" ? ({ "--web-scene-bg": "var(--background)" } as React.CSSProperties) : undefined}
    >
      <canvas aria-hidden className="absolute inset-0 size-full" />
    </div>
  )
}

// ---- The sky ------------------------------------------------------------------------------------------------------------
// A Milky Way in the brand's violets: a band of light with dark dust lanes and a few amaranth knots, crossed by three
// depths of stars (most faint, a few bright, one in a hundred amaranth, like the panel's lights in the references).
// The sky turns about a degree a minute, leans away from the pointer and with the scroll, the nearer stars more than
// the far ones. With dunes: three ridges along the bottom, the nearest darkest, each lit faintly along its crest by
// the sky and each moving more than the one behind it. The grain over everything changes every frame.

const SKY_COLORS: readonly PaletteKey[] = ["bg", "haze", "violet", "plum", "glow", "star", "accent", "dim"]

const sky = (dunes: boolean) => `
vec2 starLayer(vec2 sky, float cell, float density, float rmin, float rmax, float seed, float pxPerUnit) {
  vec2 g = sky * pxPerUnit / cell;
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec2 h = hash22(id + seed);
  float on = step(1. - density, hash12(id + seed * 1.7));
  float m = pow(hash12(id + seed * 3.1), 7.);
  float r = mix(rmin, rmax, m);
  float d = length(f - (.15 + .7 * h)) * cell;
  return vec2(clamp((r - d) * u_dpr + .5, 0., 1.) * on * mix(.32, 1., m), hash12(id + seed * 5.3));
}
void main() {
  vec3 bg = u_c0, haze = u_c1, violet = u_c2, plum = u_c3, glow = u_c4, star = u_c5, accent = u_c6;
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_dpr;
  vec2 res = u_res / u_dpr;
  vec2 uv = (px - .5 * res) / res.y;
  float t = u_time;
  float ang = -.36 + t * .0035 + (u_scroll - .5) * .07;
  mat2 R = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));
  vec2 lean = u_ptr * vec2(.016, .011);
  vec2 s = R * (uv - lean);

  // The band, its structure and its dust lanes.
  float w = fbm(s * 1.3 + vec2(t * .004, 0.));
  float across = s.y + .1 + (w - .5) * .28;
  float band = exp(-across * across * 7.);
  float core = exp(-across * across * 30.);
  float n1 = fbm(s * vec2(1.6, 4.) + 3.1 + t * .002);
  float n2 = fbm(s * vec2(5., 10.) - 1.7);
  float lanes = smoothstep(.5, .78, fbm(s * vec2(2.4, 11.) + vec2(7., t * .003))) * exp(-across * across * 18.);
  float light = clamp((band * (.25 + .75 * n1) + core * .55 * n2) * (1. - lanes * .8), 0., 1.2);

  vec3 col = bg;
  col = mix(col, haze, smoothstep(0., 1., px.y / res.y) * .35);
  col = mix(col, haze, clamp(light * 1.2, 0., 1.) * .8);
  col = mix(col, violet, clamp(light * light * 1.4, 0., 1.) * .75);
  col = mix(col, plum, clamp(core * n2 * .9, 0., 1.) * .45);
  col = mix(col, glow, clamp(pow(light, 3.) * .6, 0., 1.) * .3);
  col = mix(col, accent, smoothstep(.7, .86, fbm(s * 7. + 11.)) * core * .1);

  // Stars: three depths, denser in the band, kept off the letters.
  float keep = 1. - guardAt(px);
  for (int i = 0; i < 3; i++) {
    float k = float(i);
    vec2 sk = R * (uv - lean * (.5 + k * .7));
    float cell = k == 0. ? 6. : (k == 1. ? 16. : 46.);
    float density = k == 0. ? .05 + .32 * band : (k == 1. ? .1 + .22 * band : .22);
    vec2 st = starLayer(sk, cell, density, .3 + k * .15, .8 + k * .45, 1. + k * 13., res.y);
    vec3 sc = st.y > .985 ? accent : (st.y > .75 ? mix(star, glow, .35) : star);
    col = mix(col, sc, st.x * keep);
  }
${
  dunes
    ? `
  // Dunes, far to near: smooth slopes and sharp crests (a ridged noise), the far ones paler with the sky's haze,
  // the near one darkest, each lit along its crest.
  float lift = (u_scroll - .5) * 28.;
  for (int i = 0; i < 3; i++) {
    float k = float(i);
    float x = px.x + u_ptr.x * (8. + k * 16.) + k * 913.;
    float amp = res.y * (.17 - k * .035);
    float base = res.y * (.84 + k * .055) - lift * (k + 1.) * .5;
    // The ridge here and 2 px to the right, for the slope: faces turned to the sky are lit, the others in shadow.
    float n0 = vnoise(vec2(x / (640. - k * 150.), k * 3.1)) * .65 + vnoise(vec2(x / (270. - k * 50.), k * 5.7)) * .35;
    float n1 = vnoise(vec2((x + 2.) / (640. - k * 150.), k * 3.1)) * .65 + vnoise(vec2((x + 2.) / (270. - k * 50.), k * 5.7)) * .35;
    float c0 = smoothstep(0., 1., 1. - abs(2. * n0 - 1.));
    float c1 = smoothstep(0., 1., 1. - abs(2. * n1 - 1.));
    float ridge = base - c0 * amp;
    float slope = ((base - c1 * amp) - ridge) * .5;
    float inside = smoothstep(ridge - .7, ridge + .7, px.y);
    vec3 lit = k == 0. ? mix(bg, mix(haze, violet, .35), .75) : (k == 1. ? mix(bg, haze, .55) : mix(bg, haze, .28));
    vec3 shade = mix(bg, lit, k == 2. ? .25 : .45);
    vec3 sand = mix(shade, lit, clamp(.5 - slope * 2.2, 0., 1.));
    float crest = exp(-max(px.y - ridge, 0.) / (1.4 + k * 1.2));
    sand = mix(sand, mix(violet, glow, .3), crest * (.6 - k * .15));
    sand = mix(sand, bg * .85, smoothstep(ridge, ridge + res.y * .3, px.y) * (.3 + k * .2));
    col = mix(col, sand, inside);
  }`
    : ""
}
  // The noise: a fine grain, new every frame.
  col += (hash12(floor(px * u_dpr) + fract(t * .37) * vec2(113., 71.)) - .5) * .05;
  color = vec4(col, 1.);
}`

const MILKY = sky(false)
const DUNES = sky(true)

const milkyWay = definePattern({
  id: "sig-milky-way",
  name: "Milky Way",
  kind: "background",
  status: "exploring",
  description:
    "A violet Milky Way with dust lanes and three depths of stars, turning as slowly as a long exposure, with a live grain. It leans with the pointer and the scroll.",
  notes: [SPACE, OWN, MOVE],
  Layer: () => <SignatureShader body={MILKY} colors={SKY_COLORS} kind="background" />,
})

const duneNight = definePattern({
  id: "sig-dune-night",
  name: "Dune night",
  kind: "background",
  status: "exploring",
  description:
    "The brand's night: a Milky Way over three dune ridges, each lit along its crest and moving more than the one behind it. Needs room under the content.",
  notes: [SPACE, OWN, MOVE],
  Layer: () => <SignatureShader body={DUNES} colors={SKY_COLORS} kind="background" />,
})

// ---- Qbot in the sky -------------------------------------------------------------------------------------------------
// The approved curious pose over the Milky Way, beside the lower part of the text, cut by the bottom edge. It drifts
// a few pixels and leans toward the pointer.

const POSE = { name: "curious", left: 175, top: 3, right: 863, bottom: 925 }

function QbotSky() {
  const host = React.useRef<HTMLDivElement>(null)
  const figure = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = host.current
    const fig = figure.current
    const scope = el ? scopeOf(el, "background") : null
    if (!el || !fig || !scope) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    const pointer = easedPointer(scope, el)
    // Its top meets the bottom of the heading (never beside it); a quarter of it goes below the edge.
    const place = () => {
      const heading = scope.querySelector("h1, h2")
      const base = el.getBoundingClientRect()
      const top = heading ? heading.getBoundingClientRect().bottom - base.top + 8 : base.height * 0.35
      const height = Math.max(160, (base.height - top) / 0.76)
      fig.style.top = `${top}px`
      fig.style.height = `${height}px`
      fig.style.setProperty("--qd-mascot-glow-scale", String(height / 800))
    }
    const ro = new ResizeObserver(place)
    ro.observe(scope)
    void document.fonts?.ready.then(place)
    place()
    let raf = 0
    let last = performance.now()
    const start = last
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      pointer.step(dt, reduce)
      const t = reduce ? 0 : (now - start) / 1000
      const { x, y } = pointer.now
      fig.style.transform =
        `perspective(1200px) translateY(${Math.sin(t * 0.55) * 6}px) ` +
        `rotateY(${x * 9}deg) rotateX(${-y * 5}deg) rotate(${Math.sin(t * 0.37) * 1.2 + x * 1.5}deg)`
      if (!reduce) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      pointer.stop()
    }
  }, [])

  const w = POSE.right - POSE.left
  const h = POSE.bottom - POSE.top
  return (
    <div ref={host} className="absolute inset-0 overflow-hidden">
      <SignatureShader body={MILKY} colors={SKY_COLORS} kind="background" />
      <link rel="stylesheet" href={`${REPO}/brand-assets/mascot/3d/mascot.css`} precedence="default" />
      {/* On the right of the content's column, from the heading's bottom down; hidden on narrow screens, where it
          would sit under the text. */}
      <div
        ref={figure}
        className="absolute hidden will-change-transform lg:block"
        style={{ right: "max(32px, calc((100% - 1200px) / 2))", aspectRatio: `${w} / ${h}` }}
      >
        <img
          alt=""
          src={`${REPO}/brand-assets/mascot/3d/references/${POSE.name}.png`}
          className="qd-mascot qd-mascot--glow size-full"
          style={
            {
              objectViewBox: `inset(${POSE.top}px ${1024 - POSE.right}px ${1024 - POSE.bottom}px ${POSE.left}px)`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}

const qbotSky = definePattern({
  id: "sig-qbot-sky",
  name: "Qbot in the sky",
  kind: "background",
  status: "exploring",
  description:
    "Qbot (the approved curious pose) over the Milky Way, beside the lower part of the text and cut by the bottom edge. It drifts and leans toward the pointer. For sections with text on the left.",
  notes: [QBOT, SPACE, MOVE],
  Layer: QbotSky,
})

// ---- The LED panel ----------------------------------------------------------------------------------------------------
// A dot-matrix of LEDs, mostly off (the panel itself, barely there), lit in white by stars that drift across it and
// in amaranth where the pointer touches it, fading like phosphor.

// A 5 × 7 dot font, for the visor's line only.
const FONT: Record<string, string> = {
  A: "01110100011000111111100011000110001",
  C: "01110100011000010000100001000101110",
  D: "11110100011000110001100011000111110",
  E: "11111100001000011110100001000011111",
  G: "01110100011000010111100011000101111",
  I: "01110001000010000100001000010001110",
  L: "10000100001000010000100001000011111",
  N: "10001110011010110011100011000110001",
  O: "01110100011000110001100011000101110",
  P: "11110100011000111110100001000010000",
  R: "11110100011000111110101001001010001",
  S: "01111100001000001110000010000111110",
  T: "11111001000010000100001000010000100",
  V: "10001100011000110001100010101000100",
  "'": "00100001000100000000000000000000000",
  " ": "00000000000000000000000000000000000",
}
const LINE = "DON'T GET LOST IN VECTOR SPACE"
// The line as columns of 7 bits, one blank column between letters.
const LINE_COLS = (() => {
  const cols: number[] = []
  for (const ch of LINE) {
    const g = FONT[ch] ?? FONT[" "] ?? ""
    for (let c = 0; c < 5; c += 1) {
      let bits = 0
      for (let r = 0; r < 7; r += 1) if (g[r * 5 + c] === "1") bits |= 1 << r
      cols.push(bits)
    }
    cols.push(0)
  }
  for (let i = 0; i < 18; i += 1) cols.push(0)
  return cols
})()

// Dots at a few strengths, drawn in batches.
function dots(levels = 8) {
  const paths = Array.from({ length: levels }, () => new Path2D())
  return {
    add(x: number, y: number, r: number, a: number) {
      if (a <= 0.03) return
      const p = paths[Math.min(levels - 1, Math.floor(clamp(a) * levels))]
      p?.moveTo(x + r, y)
      p?.arc(x, y, r, 0, TAU)
    },
    fill(ctx: CanvasRenderingContext2D, color: string, strength = 1) {
      ctx.fillStyle = color
      paths.forEach((p, i) => {
        ctx.globalAlpha = ((i + 0.5) / levels) * strength
        ctx.fill(p)
      })
      ctx.globalAlpha = 1
    },
  }
}

// The panel's off LEDs as a repeating tile at the canvas's resolution, so thousands cost one fill.
const tiles = new WeakMap<CanvasRenderingContext2D, { key: string; pattern: CanvasPattern | null }>()
function offGrid(ctx: CanvasRenderingContext2D, pitch: number, r: number, color: string) {
  const dpr = ctx.getTransform().a || 1
  const key = `${pitch}-${r}-${dpr}-${color}`
  const cached = tiles.get(ctx)
  if (cached?.key === key) return cached.pattern
  const tile = document.createElement("canvas")
  tile.width = Math.round(pitch * dpr)
  tile.height = Math.round(pitch * dpr)
  const t = tile.getContext("2d")
  if (t) {
    t.fillStyle = color
    t.beginPath()
    t.arc(tile.width / 2, tile.height / 2, r * dpr, 0, TAU)
    t.fill()
  }
  const pattern = ctx.createPattern(tile, "repeat")
  pattern?.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]))
  tiles.set(ctx, { key, pattern })
  return pattern
}

type Field = {
  cols: number
  rows: number
  lit: Float32Array
  hue: Uint8Array
  stars: { x: number; y: number; v: number; b: number }[]
}

const PITCH = 9

// per: one star for this many cells.
function field(w: number, h: number, seed: number, per = 220): Field {
  const cols = Math.ceil(w / PITCH) + 1
  const rows = Math.ceil(h / PITCH) + 1
  const rand = mulberry(seed)
  return {
    cols,
    rows,
    lit: new Float32Array(cols * rows),
    hue: new Uint8Array(cols * rows),
    stars: Array.from({ length: Math.round((cols * rows) / per) }, () => ({
      x: rand() * cols,
      y: rand() * rows,
      v: 0.15 + rand() * 0.35,
      b: 0.25 + rand() ** 3 * 0.75,
    })),
  }
}

// Lights the cells around the pointer, amaranth, strongest at its center.
function touch(f: Field, e: Env, ox = 0, oy = 0, reach = 3.2) {
  if (e.hover <= 0.01) return
  const cx = (e.px - ox) / PITCH
  const cy = (e.py - oy) / PITCH
  for (let y = Math.floor(cy - reach); y <= Math.ceil(cy + reach); y += 1)
    for (let x = Math.floor(cx - reach); x <= Math.ceil(cx + reach); x += 1) {
      if (x < 0 || y < 0 || x >= f.cols || y >= f.rows) continue
      const d = Math.hypot(x - cx, y - cy)
      if (d > reach) continue
      const i = y * f.cols + x
      const v = (1 - d / reach) ** 1.5 * e.hover
      if (v > (f.lit[i] ?? 0)) {
        f.lit[i] = v
        f.hue[i] = 1
      }
    }
}

function drawField(ctx: CanvasRenderingContext2D, f: Field, e: Env, ox = 0, oy = 0, strength = 1) {
  const { p } = e
  const white = dots()
  const red = dots()
  for (let y = 0; y < f.rows; y += 1)
    for (let x = 0; x < f.cols; x += 1) {
      const i = y * f.cols + x
      const v = f.lit[i] ?? 0
      if (v < 0.03) continue
      const b = f.hue[i] ? red : white
      const X = ox + x * PITCH + PITCH / 2
      const Y = oy + y * PITCH + PITCH / 2
      // The LED and its faint halo: two dots, no blur.
      b.add(X, Y, PITCH * 0.42, v * 0.22)
      b.add(X, Y, PITCH * 0.19, v)
    }
  white.fill(ctx, p.star, strength)
  red.fill(ctx, p.accent, strength)
}

const ledField = cosmos({
  id: "sig-led-field",
  name: "LED field",
  kind: "background",
  description:
    "The section as an LED panel, Qbot's visor material: its dots barely there, white stars drifting across, and amaranth light where the pointer touches it, fading like phosphor.",
  notes: [LED, MOVE],
  seed: 301,
  spec: {
    init: (w, h) => ({ f: field(w, h, 301) }),
    frame(ctx, s, e) {
      const { w, h, p } = e
      if (s.f.cols !== Math.ceil(w / PITCH) + 1 || s.f.rows !== Math.ceil(h / PITCH) + 1) s.f = field(w, h, 301)
      const f = s.f
      const fade = Math.exp(-e.dt * 1.6)
      for (let i = 0; i < f.lit.length; i += 1) f.lit[i] = (f.lit[i] ?? 0) * fade
      for (const q of f.stars) {
        q.x -= e.dt * q.v
        if (q.x < 0) q.x += f.cols
        const i = Math.floor(q.y) * f.cols + Math.floor(q.x)
        if (q.b > (f.lit[i] ?? 0)) {
          f.lit[i] = q.b
          f.hue[i] = 0
        }
      }
      touch(f, e)
      const grid = offGrid(ctx, PITCH, 1.1, p.line)
      if (grid) {
        ctx.globalAlpha = 0.5
        ctx.fillStyle = grid
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1
      }
      drawField(ctx, f, e)
    },
  },
})

// ---- The LED monolith -------------------------------------------------------------------------------------------------
// The panel from the references as an object: a tall slab on the right, leaning away, its LEDs showing a vector
// search as light (a query lights, then its nearest neighbours, along dotted paths) and, along its foot, the visor's
// line scrolling by. The pointer lights it where it touches.

// The slab's LEDs keep a real pitch (about 9 px on its near edge), so its grid follows its size.
type Slab = {
  cols: number
  rows: number
  lit: Float32Array
  hue: Uint8Array
  // The search's points, as fractions of the slab, above the line along its foot.
  nodes: [number, number][]
  query: number
  clock: number
}

function slab(cols: number, rows: number, seed: number): Slab {
  const rand = mulberry(seed)
  return {
    cols,
    rows,
    lit: new Float32Array(cols * rows),
    hue: new Uint8Array(cols * rows),
    nodes: Array.from({ length: 16 }, () => [0.08 + rand() * 0.84, 0.05 + rand() * 0.7]),
    query: 0,
    clock: 0,
  }
}

const ledMonolith = cosmos({
  id: "sig-led-monolith",
  name: "LED monolith",
  kind: "background",
  description:
    "A tall LED slab on the right, leaning away: a vector search plays on it as light (a query, then its nearest neighbours), and the visor's line scrolls along its foot. The pointer lights it where it touches. For sections with text on the left.",
  notes: [LED, MOVE],
  seed: 307,
  spec: {
    init: () => ({ s: slab(1, 1, 307) }),
    frame(ctx, st, e) {
      const { w, h, p, t } = e
      // The slab's corners: the near (left) edge taller than the far one, so it reads as turned away. It's as tall as
      // the section allows (up to 640 px) and about half as wide.
      // Only where there's room beside the text: on narrow screens it would sit under it.
      if (w < 960) return
      const tall = Math.min(h * 0.9, 640)
      const wide = Math.min(tall * 0.5, w * 0.22)
      const x0 = Math.max(w * 0.62, Math.min(w - wide - 64, (w + 1200) / 2 - wide - 40))
      const x1 = x0 + wide
      const top = (h - tall) / 2
      const TL: [number, number] = [x0, top]
      const BL: [number, number] = [x0 - tall * 0.02, top + tall]
      const TR: [number, number] = [x1, top + tall * 0.1]
      const BR: [number, number] = [x1 + tall * 0.01, top + tall * 0.9]
      const cols = Math.max(12, Math.round(wide / 9))
      const rows = Math.max(20, Math.round(tall / 9))
      if (st.s.cols !== cols || st.s.rows !== rows) st.s = slab(cols, rows, 307)
      const s = st.s
      const SLAB_COLS = cols
      const SLAB_ROWS = rows
      const at = (u: number, v: number): [number, number] => {
        const top = [TL[0] + (TR[0] - TL[0]) * u, TL[1] + (TR[1] - TL[1]) * u]
        const bot = [BL[0] + (BR[0] - BL[0]) * u, BL[1] + (BR[1] - BL[1]) * u]
        return [
          (top[0] ?? 0) + ((bot[0] ?? 0) - (top[0] ?? 0)) * v,
          (top[1] ?? 0) + ((bot[1] ?? 0) - (top[1] ?? 0)) * v,
        ]
      }
      const fade = Math.exp(-e.dt * 1.1)
      for (let i = 0; i < s.lit.length; i += 1) s.lit[i] = (s.lit[i] ?? 0) * fade
      const light = (c: number, r: number, v: number, hue: number) => {
        if (c < 0 || r < 0 || c >= SLAB_COLS || r >= SLAB_ROWS) return
        const i = r * SLAB_COLS + c
        if (v > (s.lit[i] ?? 0)) {
          s.lit[i] = v
          s.hue[i] = hue
        }
      }

      // The search, every six seconds: the query, then its three nearest nodes, each along a dotted path.
      s.clock += e.dt
      if (s.clock > 6) {
        s.clock = 0
        s.query = (s.query + 5) % s.nodes.length
      }
      const cells = s.nodes.map(([u, v]): [number, number] => [Math.floor(u * cols), Math.floor(v * (rows - 12))])
      const q = cells[s.query] ?? [0, 0]
      const ranked = cells
        .map((n, i) => ({ n, i, d: Math.hypot(n[0] - q[0], n[1] - q[1]) }))
        .filter((r) => r.i !== s.query)
        .sort((a, b) => a.d - b.d)
      for (const n of cells) light(n[0], n[1], 0.35, 0)
      if (s.clock < 4.5) light(q[0], q[1], 1, 1)
      ranked.slice(0, 3).forEach((r, k) => {
        const reach = clamp((s.clock - 0.6 - k * 0.5) / 1.2)
        const steps = Math.max(1, Math.round(r.d))
        for (let j = 0; j <= steps * reach; j += 2)
          light(
            Math.round(q[0] + ((r.n[0] - q[0]) * j) / steps),
            Math.round(q[1] + ((r.n[1] - q[1]) * j) / steps),
            0.6,
            1
          )
        if (reach >= 1 && s.clock < 4.5) light(r.n[0], r.n[1], 1, 0)
      })

      // The visor's line along the foot, one column every 0.12 s.
      // Redrawn every frame, without the phosphor fade, so the letters stay crisp as they move.
      const shift = Math.floor(t / 0.12)
      s.lit.fill(0, (SLAB_ROWS - 11) * SLAB_COLS, (SLAB_ROWS - 4) * SLAB_COLS)
      for (let c = 0; c < SLAB_COLS; c += 1) {
        const bits = LINE_COLS[(c + shift) % LINE_COLS.length] ?? 0
        for (let r = 0; r < 7; r += 1) if (bits & (1 << r)) light(c, SLAB_ROWS - 11 + r, 0.9, 1)
      }

      // The pointer, where it touches the slab.
      if (e.hover > 0.01)
        for (let r = 0; r < SLAB_ROWS; r += 1)
          for (let c = 0; c < SLAB_COLS; c += 1) {
            const [X, Y] = at((c + 0.5) / SLAB_COLS, (r + 0.5) / SLAB_ROWS)
            const d = Math.hypot(X - e.px, Y - e.py)
            if (d < 34) light(c, r, (1 - d / 34) * e.hover, 1)
          }

      // The slab: its edge, its off LEDs and its lit ones, each sized by how near that part of the slab is.
      ctx.lineWidth = 1
      ctx.strokeStyle = p.line
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.moveTo(...TL)
      ctx.lineTo(...TR)
      ctx.lineTo(...BR)
      ctx.lineTo(...BL)
      ctx.closePath()
      ctx.stroke()
      ctx.globalAlpha = 1
      const off = dots(2)
      const white = dots()
      const red = dots()
      for (let r = 0; r < SLAB_ROWS; r += 1)
        for (let c = 0; c < SLAB_COLS; c += 1) {
          const u = (c + 0.5) / SLAB_COLS
          const [X, Y] = at(u, (r + 0.5) / SLAB_ROWS)
          const size = 1 - u * 0.3
          off.add(X, Y, 1.05 * size, 0.9)
          const v = s.lit[r * SLAB_COLS + c] ?? 0
          if (v < 0.03) continue
          const b = s.hue[r * SLAB_COLS + c] ? red : white
          b.add(X, Y, 3.6 * size, v * 0.2)
          b.add(X, Y, 1.7 * size, v)
        }
      off.fill(ctx, p.line, 0.9)
      white.fill(ctx, p.star)
      red.fill(ctx, p.accent)
    },
  },
})

// ---- The LED card ------------------------------------------------------------------------------------------------------
// The panel in a card: its dots across the card's top, a few stars drifting, and the pointer lighting it in amaranth.

const ledCard = cosmos({
  id: "sig-led-card",
  name: "LED card",
  kind: "surface",
  description:
    "An LED panel across the card's top, Qbot's visor material: a few white stars drifting, and amaranth light where the pointer touches it, fading like phosphor.",
  notes: [LED],
  seed: 311,
  spec: {
    init: (w, h) => ({ f: field(w, h, 311, 90) }),
    frame(ctx, s, e) {
      const { w, h, p } = e
      if (s.f.cols !== Math.ceil(w / PITCH) + 1 || s.f.rows !== Math.ceil(h / PITCH) + 1) s.f = field(w, h, 311, 90)
      const f = s.f
      const fade = Math.exp(-e.dt * 1.4)
      for (let i = 0; i < f.lit.length; i += 1) f.lit[i] = (f.lit[i] ?? 0) * fade
      for (const q of f.stars) {
        q.x -= e.dt * q.v * 0.6
        if (q.x < 0) q.x += f.cols
        const i = Math.floor(q.y) * f.cols + Math.floor(q.x)
        if (q.b > (f.lit[i] ?? 0)) {
          f.lit[i] = q.b
          f.hue[i] = 0
        }
      }
      touch(f, e, 0, 0, 3.8)
      const grid = offGrid(ctx, PITCH, 1.15, p.line)
      if (grid) {
        ctx.globalAlpha = 1
        ctx.fillStyle = grid
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1
      }
      drawField(ctx, f, e)
    },
  },
})

// ---- The noise: the brand's own patterns -------------------------------------------------------------------------------
// An approved pattern, drawn by the brand's pattern engine at the section's size (once per size, as web/AGENTS.md
// asks of the brand patterns), unchanged, along the section's bottom: the frame drifts very slowly and leans with the
// pointer, and a live film grain sits on top. The text above stays on the plain background.

type Tokens = unknown
type Preset = { name: string; colorways?: unknown[] }
type EngineModule = {
  loadTokens: (url: string) => Promise<Tokens>
  loadPreset: (id: string, base: string) => Promise<Preset>
  renderPattern: (
    canvas: HTMLCanvasElement,
    tokens: Tokens,
    preset: Preset,
    options: { width: number; height: number; mesh?: unknown; colorway?: number }
  ) => unknown
}

// Loaded from the studio's /repo route at run time, as plain ES modules, so the bundler never touches them.
const importAtRuntime = new Function("url", "return import(url)") as (url: string) => Promise<EngineModule>
let engine: Promise<{ mod: EngineModule; tokens: Tokens }> | null = null
function loadEngine() {
  engine ??= importAtRuntime(`${PATTERNS}/patterns/index.js`).then(async (mod) => ({
    mod,
    tokens: await mod.loadTokens(`${PATTERNS}/tokens/placeholder.tokens.json`),
  }))
  return engine
}

function BrandPattern({ preset, mesh, colorway = 0 }: { preset: string; mesh?: string; colorway?: number }) {
  const host = React.useRef<HTMLDivElement>(null)
  const art = React.useRef<HTMLCanvasElement>(null)
  const grain = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const el = host.current
    const canvas = art.current
    const noise = grain.current
    const scope = el ? scopeOf(el, "background") : null
    if (!el || !canvas || !noise || !scope) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    const pointer = easedPointer(scope, el)
    let alive = true
    let size = ""
    let timer = 0

    const render = async () => {
      const r = el.getBoundingClientRect()
      // Drawn a little larger than the box, so the drift never shows an edge; capped, then scaled up by CSS.
      const scale = Math.min(1, 1400 / Math.max(1, r.width * 1.12))
      const width = Math.round(r.width * 1.12 * scale)
      const height = Math.round(r.height * 1.12 * scale)
      const key = `${width}x${height}`
      if (width < 2 || height < 2 || key === size) return
      size = key
      try {
        const { mod, tokens } = await loadEngine()
        const p = await mod.loadPreset(preset, `${PATTERNS}/presets`)
        const m = mesh ? await fetch(`${PATTERNS}/meshes/${mesh}`).then((res) => res.json()) : undefined
        if (!alive) return
        mod.renderPattern(canvas, tokens, p, { width, height, mesh: m, colorway })
        canvas.style.opacity = "1"
      } catch (err) {
        console.warn("Brand pattern", preset, err)
      }
    }
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(render, 200)
    })
    ro.observe(el)
    void render()

    // The grain: four noise tiles made once, one shown each frame at a random offset.
    const g = noise.getContext("2d")
    const tilesList = Array.from({ length: 4 }, () => {
      const c = document.createElement("canvas")
      c.width = 128
      c.height = 128
      const t = c.getContext("2d")
      if (t) {
        const img = t.createImageData(128, 128)
        for (let i = 0; i < img.data.length; i += 4) {
          const v = Math.random() * 255
          img.data[i] = v
          img.data[i + 1] = v
          img.data[i + 2] = v
          img.data[i + 3] = 255
        }
        t.putImageData(img, 0, 0)
      }
      return c
    })
    let raf = 0
    let last = performance.now()
    const start = last
    let frame = 0
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      pointer.step(dt, reduce)
      const t = reduce ? 0 : (now - start) / 1000
      const { x, y } = pointer.now
      canvas.style.transform =
        `translate(${-x * 14 + Math.sin(t * 0.03) * 18}px, ${-y * 8 + Math.cos(t * 0.025) * 10}px) ` +
        `scale(${1.02 + Math.sin(t * 0.02) * 0.02})`
      frame += 1
      if (g && frame % 4 === 0) {
        const r = noise.getBoundingClientRect()
        if (noise.width !== Math.round(r.width)) noise.width = Math.max(1, Math.round(r.width))
        if (noise.height !== Math.round(r.height)) noise.height = Math.max(1, Math.round(r.height))
        const tile = tilesList[Math.floor(Math.random() * tilesList.length)]
        const pattern = tile ? g.createPattern(tile, "repeat") : null
        if (pattern) {
          pattern.setTransform(new DOMMatrix([1, 0, 0, 1, Math.random() * 128, Math.random() * 128]))
          g.clearRect(0, 0, noise.width, noise.height)
          g.fillStyle = pattern
          g.fillRect(0, 0, noise.width, noise.height)
        }
      }
      if (!reduce) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      ro.disconnect()
      pointer.stop()
    }
  }, [preset, mesh, colorway])

  return (
    <div
      ref={host}
      className="absolute inset-0 overflow-hidden"
      // Full along the bottom, gone before the content: its dither never sits under the text, the buttons or the
      // facts. Paired with room under the content (the explorations' pad).
      style={{
        maskImage: "linear-gradient(to top, #000 0%, #000 16%, transparent 44%)",
        WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 16%, transparent 44%)",
      }}
    >
      <canvas
        ref={art}
        aria-hidden
        className="absolute -inset-[6%] h-[112%] w-[112%] opacity-0 transition-opacity duration-1000 will-change-transform"
      />
      <canvas ref={grain} aria-hidden className="absolute inset-0 size-full opacity-[0.07] mix-blend-overlay" />
    </div>
  )
}

const brandNoise = definePattern({
  id: "sig-brand-noise",
  name: "Brand noise",
  kind: "background",
  status: "exploring",
  description:
    "The approved Mesh-Dithered-Pattern-A (on the astronauts-over-a-crater mesh), drawn by the brand's own engine along the section's bottom, drifting slowly under a live grain. It leans with the pointer.",
  notes: [ENGINE, MOVE],
  Layer: () => <BrandPattern preset="mesh-dithered-pattern-a" mesh="astronauts-crater.mesh-dithered-pattern.json" />,
})

const brandStreaks = definePattern({
  id: "sig-brand-streaks",
  name: "Brand streaks",
  kind: "background",
  status: "exploring",
  description:
    "The approved Motion-Streaks-Pattern-A, drawn by the brand's own engine along the section's bottom, drifting slowly under a live grain. It leans with the pointer.",
  notes: [ENGINE, MOVE],
  Layer: () => <BrandPattern preset="motion-streaks-pattern-a" />,
})

export const signaturePatterns = [
  milkyWay,
  duneNight,
  qbotSky,
  ledField,
  ledMonolith,
  ledCard,
  brandNoise,
  brandStreaks,
]
