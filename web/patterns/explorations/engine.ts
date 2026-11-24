// The generative pattern engine from Qdrant Pattern Studio (the "Deploy Card" page's pattern layer, 2026-11-23),
// ported to readable TypeScript with only what the explored looks use: the square and hex grid layouts and the
// burst, hexagon, gradient and letter fields, and hexagon, circle, line and ASCII elements (the ramp only). The
// sphere layout and the graph are left out (Orbit, Vector graph and Bloom weren't brought in).
//
// A look is a set of params. compute() turns them, a canvas size and a phase (0 to 2π over one loop) into a list
// of marks; draw() paints them in one color. Colors come from the caller, never from here.

export type Params = {
  layout: "grid" | "hex" | "burst"
  cell: number
  padding: number
  count: number
  spread: number
  burstSpeed: number
  depthShade: number
  shape: "none" | "hexagon" | "gradient" | "text"
  text: string
  textFont: string
  size: number
  shaping: "fill" | "outline" | "rings" | "glow"
  softness: number
  outlineWidth: number
  ringFrequency: number
  ringSpeed: number
  ringFade: number
  noiseAmount: number
  blend: "mix" | "add" | "multiply"
  noiseScale: number
  octaves: number
  drift: number
  warp: number
  seed: number
  zoom: number
  // The field's unit in px. 0 (Pattern Studio's way) measures it as half the canvas's short side, so a look drawn
  // for a tall card packs tighter on a wide one; a fixed unit keeps its spacing on any card.
  unitPx: number
  // Moves the field's center, in units of half the canvas's short side (negative y is up). 0 in Pattern Studio.
  offsetX: number
  offsetY: number
  rotation: number
  fieldTurns: number
  twist: number
  threshold: number
  density: "continuous" | "stochastic"
  invert: boolean
  element: "hexagon" | "circle" | "line" | "ascii"
  // ASCII marks: one character of the ramp per mark, picked by its value (darkest first), in glyphFont.
  ramp: string
  glyphFont: string
  // Circles and hexagons filled, or drawn as outlines strokeWidth px wide (the brand's Hexagon patterns).
  paint: "fill" | "stroke"
  strokeWidth: number
  scale: number
  sizeByValue: boolean
  minSize: number
  lineLength: number
  lineWidth: number
  orientation: "fixed" | "contour" | "gradient" | "flow" | "value" | "radial" | "random"
  angleAmount: number
  elementRotation: number
  elementTurns: number
  alphaByValue: boolean
  minAlpha: number
}

// Pattern Studio's defaults, under the pasted hex rings pattern, as the Deploy Card page merges them.
export const BASE: Params = {
  layout: "grid",
  cell: 16,
  padding: 0,
  count: 1600,
  spread: 1.2,
  burstSpeed: 1,
  depthShade: 0.8,
  shape: "hexagon",
  text: "QDRANT",
  textFont: '"Mona Sans", sans-serif',
  size: 0.6,
  shaping: "rings",
  softness: 0.05,
  outlineWidth: 0.02,
  ringFrequency: 4,
  ringSpeed: 1,
  ringFade: 1.2,
  noiseAmount: 0.35,
  blend: "multiply",
  noiseScale: 2,
  octaves: 3,
  drift: 0.5,
  warp: 0.15,
  seed: 7,
  zoom: 1,
  unitPx: 0,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  fieldTurns: 0,
  twist: 0,
  threshold: 0.05,
  density: "continuous",
  invert: false,
  element: "circle",
  ramp: " .:-=+*#%@",
  // Pattern Studio draws its letters in Geist Mono; the website's mono is Mona Sans Mono (primitives/typography).
  glyphFont: '"Mona Sans Mono", ui-monospace, monospace',
  paint: "fill",
  strokeWidth: 1.5,
  scale: 0.9,
  sizeByValue: true,
  minSize: 0,
  lineLength: 1,
  lineWidth: 1.5,
  orientation: "contour",
  angleAmount: 1,
  elementRotation: 0,
  elementTurns: 0,
  alphaByValue: false,
  minAlpha: 0.2,
}

// One mark: a line, circle or hexagon at (x, y), in CSS pixels.
export type Mark = { x: number; y: number; size: number; angle: number; alpha: number; kind: 0 | 1 | 2 | 3; glyph: string }

const TAU = Math.PI * 2
const DEG = Math.PI / 180
const BIG = 1e20

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp((v - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
const mod = (a: number, b: number) => ((a % b) + b) % b
// Reads a number from an array or typed array (the package checks every index).
const at = (a: ArrayLike<number>, i: number) => a[i] ?? 0

// The tone curve the Deploy Card page passes to the engine: a soft S-curve.
const TONE = [
  0, 0.0012, 0.0024, 0.0037, 0.0051, 0.0065, 0.0079, 0.0094, 0.0109, 0.0124, 0.014, 0.0157, 0.0174, 0.0191,
  0.0209, 0.0227, 0.0245, 0.0264, 0.0283, 0.0303, 0.0323, 0.0343, 0.0364, 0.0385, 0.0407, 0.0429, 0.0451, 0.0473,
  0.0496, 0.0519, 0.0543, 0.0567, 0.0591, 0.0616, 0.064, 0.0666, 0.0691, 0.0717, 0.0743, 0.0769, 0.0796, 0.0823,
  0.085, 0.0877, 0.0905, 0.0933, 0.0961, 0.099, 0.1019, 0.1048, 0.1077, 0.1106, 0.1136, 0.1166, 0.1196, 0.1226,
  0.1257, 0.1287, 0.1318, 0.135, 0.1381, 0.1412, 0.1444, 0.1476, 0.1508, 0.1541, 0.1576, 0.1612, 0.1649, 0.1687,
  0.1727, 0.1768, 0.181, 0.1854, 0.1898, 0.1944, 0.1991, 0.2039, 0.2088, 0.2138, 0.2189, 0.2242, 0.2295, 0.2349,
  0.2404, 0.246, 0.2517, 0.2575, 0.2634, 0.2694, 0.2754, 0.2815, 0.2877, 0.294, 0.3003, 0.3068, 0.3132, 0.3198,
  0.3264, 0.3331, 0.3398, 0.3466, 0.3534, 0.3603, 0.3673, 0.3743, 0.3813, 0.3884, 0.3955, 0.4027, 0.4099, 0.4171,
  0.4243, 0.4316, 0.4389, 0.4463, 0.4536, 0.461, 0.4684, 0.4758, 0.4832, 0.4907, 0.4981, 0.5055, 0.513, 0.5204,
  0.5279, 0.5353, 0.5428, 0.5502, 0.5576, 0.565, 0.5724, 0.5798, 0.5872, 0.5945, 0.6018, 0.6091, 0.6163, 0.6236,
  0.6308, 0.6379, 0.645, 0.6521, 0.6591, 0.6661, 0.6731, 0.68, 0.6868, 0.6936, 0.7003, 0.707, 0.7136, 0.7202,
  0.7266, 0.7331, 0.7394, 0.7457, 0.7519, 0.758, 0.764, 0.77, 0.7759, 0.7817, 0.7874, 0.793, 0.7985, 0.8039,
  0.8092, 0.8145, 0.8196, 0.8246, 0.8295, 0.8343, 0.839, 0.8436, 0.848, 0.8524, 0.8566, 0.8607, 0.8647, 0.8685,
  0.8722, 0.8758, 0.8792, 0.8826, 0.8857, 0.8888, 0.8916, 0.8944, 0.897, 0.8994, 0.9017, 0.9041, 0.9064, 0.9087,
  0.911, 0.9133, 0.9156, 0.9179, 0.9202, 0.9224, 0.9247, 0.9269, 0.9291, 0.9313, 0.9335, 0.9357, 0.9378, 0.94,
  0.9421, 0.9442, 0.9463, 0.9483, 0.9503, 0.9523, 0.9543, 0.9562, 0.9582, 0.96, 0.9619, 0.9637, 0.9655, 0.9673,
  0.969, 0.9707, 0.9724, 0.974, 0.9755, 0.9771, 0.9786, 0.98, 0.9815, 0.9828, 0.9842, 0.9854, 0.9867, 0.9879,
  0.989, 0.9901, 0.9911, 0.9921, 0.9931, 0.9939, 0.9948, 0.9955, 0.9963, 0.9969, 0.9975, 0.9981, 0.9985, 0.999,
  0.9993, 0.9996, 0.9998, 1,
]
const tone = (v: number) => at(TONE, clamp(Math.round(v * (TONE.length - 1)), 0, TONE.length - 1))

// ---- Randomness and noise ----

function mulberry(seed: number) {
  let t = seed | 0
  return () => {
    t = (t + 1831565813) | 0
    let e = Math.imul(t ^ (t >>> 15), 1 | t)
    e = (e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ e
    return ((e ^ (e >>> 14)) >>> 0) / 4294967296
  }
}

// A stable random number in [0, 1) for three integers.
function hash(a: number, b: number, c: number) {
  let r = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2246822519)) | 0
  r = Math.imul(r ^ (r >>> 13), 1274126177)
  r ^= r >>> 16
  return (r >>> 0) / 4294967296
}

const GRAD = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]

type Noise = (x: number, y: number, z: number) => number

// 3D Perlin noise, shuffled by the seed.
function perlin(seed: number): Noise {
  const rand = mulberry(seed * 9973 + 17)
  const order: number[] = []
  for (let i = 0; i < 256; i += 1) order[i] = i
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const k = at(order, i)
    order[i] = at(order, j)
    order[j] = k
  }
  const P = new Uint8Array(512)
  for (let i = 0; i < 512; i += 1) P[i] = at(order, i & 255)
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const grad = (h: number, x: number, y: number, z: number) => {
    const i = (h % 12) * 3
    return at(GRAD, i) * x + at(GRAD, i + 1) * y + at(GRAD, i + 2) * z
  }
  return (x, y, z) => {
    let X = Math.floor(x)
    let Y = Math.floor(y)
    let Z = Math.floor(z)
    const u = x - X
    const v = y - Y
    const w = z - Z
    X &= 255
    Y &= 255
    Z &= 255
    const fu = fade(u)
    const fv = fade(v)
    const fw = fade(w)
    const a = at(P, X) + Y
    const aa = at(P, a) + Z
    const ab = at(P, a + 1) + Z
    const b = at(P, X + 1) + Y
    const ba = at(P, b) + Z
    const bb = at(P, b + 1) + Z
    return lerp(
      lerp(
        lerp(grad(at(P, aa), u, v, w), grad(at(P, ba), u - 1, v, w), fu),
        lerp(grad(at(P, ab), u, v - 1, w), grad(at(P, bb), u - 1, v - 1, w), fu),
        fv
      ),
      lerp(
        lerp(grad(at(P, aa + 1), u, v, w - 1), grad(at(P, ba + 1), u - 1, v, w - 1), fu),
        lerp(grad(at(P, ab + 1), u, v - 1, w - 1), grad(at(P, bb + 1), u - 1, v - 1, w - 1), fu),
        fv
      ),
      fw
    )
  }
}

function fbm(noise: Noise, x: number, y: number, z: number, octaves: number) {
  let sum = 0
  let amp = 1
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i += 1) {
    sum += amp * noise(x * freq, y * freq, z + i * 17.13)
    norm += amp
    amp *= 0.5
    freq *= 2.03
  }
  return clamp(0.5 + (0.9 * sum) / norm, 0, 1)
}

// ---- Fields (signed distances, in units of half the canvas's short side) ----

function sdHexagon(x: number, y: number, r: number) {
  const kx = -0.866025404
  const ky = 0.5
  let px = Math.abs(x)
  let py = Math.abs(y)
  const d = 2 * Math.min(kx * px + ky * py, 0)
  px -= d * kx
  py -= d * ky
  px -= clamp(px, -0.577350269 * r, 0.577350269 * r)
  py -= r
  return Math.hypot(px, py) * Math.sign(py)
}

// A letter's signed distance field, from the text drawn on a 640px canvas (exact Euclidean distance transform).
type Mask = { n: number; sdf: Float32Array; unit: number }

function edt1d(f: Float64Array, len: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0
  v[0] = 0
  z[0] = -BIG
  z[1] = BIG
  for (let q = 1; q < len; q += 1) {
    let s = (at(f, q) + q * q - (at(f, at(v, k)) + at(v, k) * at(v, k))) / (2 * q - 2 * at(v, k))
    while (s <= at(z, k)) {
      k -= 1
      s = (at(f, q) + q * q - (at(f, at(v, k)) + at(v, k) * at(v, k))) / (2 * q - 2 * at(v, k))
    }
    k += 1
    v[k] = q
    z[k] = s
    z[k + 1] = BIG
  }
  k = 0
  for (let q = 0; q < len; q += 1) {
    while (at(z, k + 1) < q) k += 1
    const dq = q - at(v, k)
    d[q] = dq * dq + at(f, at(v, k))
  }
}

function edt(grid: Float64Array, w: number, h: number) {
  const n = Math.max(w, h)
  const f = new Float64Array(n)
  const d = new Float64Array(n)
  const v = new Int32Array(n)
  const z = new Float64Array(n + 1)
  for (let x = 0; x < w; x += 1) {
    for (let y = 0; y < h; y += 1) f[y] = at(grid, y * w + x)
    edt1d(f, h, d, v, z)
    for (let y = 0; y < h; y += 1) grid[y * w + x] = at(d, y)
  }
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) f[x] = at(grid, y * w + x)
    edt1d(f, w, d, v, z)
    for (let x = 0; x < w; x += 1) grid[y * w + x] = at(d, x)
  }
}

const masks = new Map<string, Mask>()

function textMask(text: string, font: string): Mask | null {
  // Drawn again once the web fonts are in, so the letter is Mona Sans and not the fallback.
  const key = `${text}|${font}|${document.fonts?.status ?? ""}`
  const cached = masks.get(key)
  if (cached) return cached
  const N = 640
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = N
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  const s = (text || " ").slice(0, 48)
  const fontAt = (px: number) => `800 ${px}px ${font}`
  ctx.font = fontAt(200)
  let m = ctx.measureText(s)
  const px = Math.min(96000 / Math.max(1, m.width), 352)
  ctx.font = fontAt(px)
  m = ctx.measureText(s)
  const ascent = m.actualBoundingBoxAscent || px * 0.7
  const descent = m.actualBoundingBoxDescent || 0
  ctx.fillStyle = "#fff"
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  ctx.fillText(s, N / 2, N / 2 + (ascent - descent) / 2)
  const data = ctx.getImageData(0, 0, N, N).data
  const outside = new Float64Array(N * N)
  const inside = new Float64Array(N * N)
  for (let i = 0; i < N * N; i += 1) {
    const ink = at(data, i * 4 + 3) > 127
    outside[i] = ink ? 0 : BIG
    inside[i] = ink ? BIG : 0
  }
  edt(outside, N, N)
  edt(inside, N, N)
  const unit = N / 4
  const sdf = new Float32Array(N * N)
  for (let i = 0; i < N * N; i += 1) sdf[i] = (Math.sqrt(at(outside, i)) - Math.sqrt(at(inside, i))) / unit
  const mask = { n: N, sdf, unit }
  masks.set(key, mask)
  return mask
}

function sampleMask({ n, sdf, unit }: Mask, x: number, y: number) {
  const sx = (x + 2) * unit - 0.5
  const sy = (y + 2) * unit - 0.5
  const cx = clamp(sx, 0, n - 1.001)
  const cy = clamp(sy, 0, n - 1.001)
  const out = Math.hypot(sx - cx, sy - cy) / unit
  const ix = cx | 0
  const iy = cy | 0
  const fx = cx - ix
  const fy = cy - iy
  const i = iy * n + ix
  const top = at(sdf, i) + (at(sdf, i + 1) - at(sdf, i)) * fx
  const bottom = at(sdf, i + n) + (at(sdf, i + n + 1) - at(sdf, i + n)) * fx
  return top * (1 - fy) + bottom * fy + out
}

// ---- The engine ----

export type State = { noise: Noise; mask: Mask | null }

export function createState(p: Params): State {
  // Canvas text doesn't ask for a web font by itself: load the glyphs' font, which the frames draw with once it's in.
  if (p.element === "ascii") void document.fonts?.load(`500 16px ${p.glyphFont}`)
  return { noise: perlin(p.seed), mask: p.shape === "text" ? textMask(p.text, p.textFont) : null }
}

function field(p: Params, s: State, x: number, y: number) {
  switch (p.shape) {
    case "hexagon":
      return sdHexagon(x, y, p.size)
    case "gradient":
      return x / Math.max(p.size, 0.05)
    case "text":
      return s.mask ? sampleMask(s.mask, x / p.size, y / p.size) * p.size : 1
    default:
      return 0
  }
}

function shape(p: Params, d: number, phase: number) {
  const soft = Math.max(p.softness, 0.001)
  switch (p.shaping) {
    case "fill":
      return 1 - smoothstep(-soft, soft, d)
    case "outline":
      return 1 - smoothstep(0, soft, Math.abs(d) - p.outlineWidth)
    case "rings":
      return (
        (0.5 + 0.5 * Math.cos(TAU * d * p.ringFrequency - phase * p.ringSpeed)) *
        (p.ringFade > 0 ? Math.exp(-Math.max(d, 0) * p.ringFade) : 1)
      )
    default:
      return Math.exp(-Math.max(d, 0) / soft)
  }
}

function blend(p: Params, v: number, n: number) {
  const a = p.noiseAmount
  if (a <= 0) return v
  if (p.blend === "mix") return lerp(v, n, a)
  if (p.blend === "add") return v + (n - 0.5) * 2 * a
  return v * (1 - a + a * n * 1.6)
}

const finish = (p: Params, v: number) => {
  const t = clamp(tone(clamp(v, 0, 1)), 0, 1)
  return p.invert ? 1 - t : t
}

// Rotates and zooms a point in field space.
function turn(p: Params, x: number, y: number, phase: number): [number, number] {
  let a = (x - p.offsetX) / p.zoom
  let b = (y - p.offsetY) / p.zoom
  const r = p.rotation * DEG + p.fieldTurns * phase
  if (r) {
    const c = Math.cos(r)
    const s = Math.sin(r)
    ;[a, b] = [a * c - b * s, a * s + b * c]
  }
  if (p.twist) {
    const t = p.twist * Math.hypot(a, b)
    const c = Math.cos(t)
    const s = Math.sin(t)
    ;[a, b] = [a * c - b * s, a * s + b * c]
  }
  return [a, b]
}

// The value (0 to 1) of the look at a point in field space.
function value(p: Params, s: State, x: number, y: number, phase: number) {
  let [a, b] = turn(p, x, y, phase)
  const dx = p.drift * Math.cos(phase)
  const dy = p.drift * Math.sin(phase)
  if (p.warp > 0) {
    const k = p.noiseScale * 0.75
    a += p.warp * s.noise(a * k + dx, b * k + dy, 11.3)
    b += p.warp * s.noise(a * k + dx + 41.7, b * k + dy - 13.1, 5.7)
  }
  const n =
    p.shape === "none" || p.noiseAmount > 0 ? fbm(s.noise, a * p.noiseScale + dx, b * p.noiseScale + dy, 0.5, p.octaves) : 0.5
  return finish(p, p.shape === "none" ? n : blend(p, shape(p, field(p, s, a, b), phase), n))
}

// The field's shape alone, for the burst layout.
function shapeOnly(p: Params, s: State, x: number, y: number, phase: number) {
  if (p.shape === "none") return 1
  const [a, b] = turn(p, x, y, phase)
  return shape(p, field(p, s, a, b), phase)
}

const KIND = { line: 0, circle: 1, hexagon: 2, ascii: 3 } as const

// Every mark for one frame. phase runs from 0 to 2π over the loop.
export function compute(p: Params, s: State, width: number, height: number, phase: number): Mark[] {
  const unit = p.unitPx > 0 ? p.unitPx : Math.min(width, height) / 2
  const cx = width / 2
  const cy = height / 2
  const cell = p.cell
  const marks: Mark[] = []
  const spin = p.elementRotation * DEG + p.elementTurns * phase
  const fx = p.drift * Math.cos(phase)
  const fy = p.drift * Math.sin(phase)

  const push = (x: number, y: number, v: number, angle: number, index: number, grow: number) => {
    if (v < p.threshold || (p.density === "stochastic" && hash(index, 7, p.seed) > v)) return
    const size = cell * p.scale * grow * (p.sizeByValue ? lerp(p.minSize, 1, v) : 1)
    if (size < 0.25) return
    if (x < -size * 2 || y < -size * 2 || x > width + size * 2 || y > height + size * 2) return
    const kind = KIND[p.element]
    const glyph = kind === 3 ? (p.ramp[Math.round(v * (p.ramp.length - 1))] ?? "") : ""
    if (kind === 3 && (!glyph || glyph === " ")) return
    marks.push({
      x,
      y,
      size,
      angle: angle + spin,
      alpha: p.alphaByValue ? lerp(p.minAlpha, 1, v) : 1,
      kind,
      glyph,
    })
  }

  const orient = (index: number, v: number, nx: number, ny: number, gx: number, gy: number, given: number | null) => {
    switch (p.orientation) {
      case "contour":
        return given === null ? (gx || gy ? Math.atan2(gy, gx) + Math.PI / 2 : 0) : given
      case "gradient":
        return given === null ? (gx || gy ? Math.atan2(gy, gx) : 0) : given + Math.PI / 2
      case "flow":
        return s.noise(nx * p.noiseScale * 0.6 + fx, ny * p.noiseScale * 0.6 + fy, 99.5) * TAU * p.angleAmount
      case "value":
        return v * Math.PI * p.angleAmount
      case "radial":
        return Math.atan2(ny, nx)
      case "random":
        return Math.floor(hash(index, 9, p.seed) * 6) * (Math.PI / 3)
      default:
        return 0
    }
  }

  if (p.layout === "burst") {
    for (let i = 0; i < p.count; i += 1) {
      const angle = hash(i, 1, p.seed) * TAU
      const reach = lerp(0.08, 1, Math.sqrt(hash(i, 2, p.seed)))
      const life = mod(hash(i, 3, p.seed) + (phase / TAU) * p.burstSpeed, 1)
      const depth = 0.25 / (1 - life * 0.96)
      const dist = unit * p.spread * reach * depth
      const x = cx + Math.cos(angle) * dist
      const y = cy + Math.sin(angle) * dist
      const nx = (x - cx) / unit
      const ny = (y - cy) / unit
      let v = smoothstep(0, 0.25, life) * lerp(1, life, p.depthShade) * shapeOnly(p, s, nx, ny, phase)
      if (p.noiseAmount > 0) v = blend(p, v, fbm(s.noise, nx * p.noiseScale + fx, ny * p.noiseScale + fy, 3.3, p.octaves))
      v = finish(p, v)
      push(x, y, v, orient(i, v, nx, ny, 0, 0, angle), i, Math.min(depth * 2, 6))
    }
    return marks
  }

  const hex = p.layout === "hex"
  const rowH = hex ? (cell * Math.sqrt(3)) / 2 : cell
  const cols = Math.max(1, Math.floor((width - p.padding * 2) / cell))
  const rows = Math.max(1, Math.floor((height - p.padding * 2) / rowH))
  const x0 = (width - cols * cell) / 2 + cell / 2
  const y0 = (height - rows * rowH) / 2 + rowH / 2
  const eps = cell / unit
  const slope = p.orientation === "contour" || p.orientation === "gradient"
  for (let r = 0; r < rows; r += 1) {
    const odd = hex && r % 2 === 1
    const n = odd ? cols - 1 : cols
    for (let c = 0; c < n; c += 1) {
      const x = x0 + c * cell + (odd ? cell / 2 : 0)
      const y = y0 + r * rowH
      const nx = (x - cx) / unit
      const ny = (y - cy) / unit
      const v = value(p, s, nx, ny, phase)
      let gx = 0
      let gy = 0
      if (slope) {
        gx = value(p, s, nx + eps, ny, phase) - v
        gy = value(p, s, nx, ny + eps, phase) - v
      }
      const index = r * cols + c
      push(x, y, v, orient(index, v, nx, ny, gx, gy, null), index, 1)
    }
  }
  return marks
}

// Paints the marks in one color.
export function draw(ctx: CanvasRenderingContext2D, p: Params, marks: Mark[], color: string) {
  ctx.save()
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.fillStyle = color
  ctx.strokeStyle = color
  const stroke = p.paint === "stroke"
  const paint = () => {
    if (!stroke) return ctx.fill()
    ctx.lineWidth = p.strokeWidth
    ctx.stroke()
    ctx.lineWidth = p.lineWidth
  }
  ctx.lineWidth = p.lineWidth
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  let font = ""
  for (const m of marks) {
    ctx.globalAlpha = m.alpha
    if (m.kind === 0) {
      const half = (m.size * p.lineLength) / 2
      const dx = Math.cos(m.angle) * half
      const dy = Math.sin(m.angle) * half
      ctx.beginPath()
      ctx.moveTo(m.x - dx, m.y - dy)
      ctx.lineTo(m.x + dx, m.y + dy)
      ctx.stroke()
    } else if (m.kind === 3) {
      const next = `500 ${Math.max(1, Math.round(m.size))}px ${p.glyphFont}`
      if (next !== font) ctx.font = font = next
      ctx.fillText(m.glyph, m.x, m.y)
    } else if (m.kind === 1) {
      ctx.beginPath()
      ctx.arc(m.x, m.y, m.size / 2, 0, TAU)
      paint()
    } else {
      ctx.beginPath()
      for (let i = 0; i < 6; i += 1) {
        const a = m.angle + (i * Math.PI) / 3
        const x = m.x + Math.cos(a) * (m.size / 2)
        const y = m.y + Math.sin(a) * (m.size / 2)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      paint()
    }
  }
  ctx.restore()
}
