// Pattern Studio's engine, compiled from qdrant-pattern-studio/src/pattern/pattern-engine.ts
// (commit e42a1d2) so generative patterns match the tool exactly. It's the same code
// the tool's "Copy code" export uses.
//
// Two small additions, each marked "patterns:" in a comment:
//   - params.unit: the field's unit in px. The tool uses half the short side; the
//     patterns repo sets it from the canvas area so a pattern keeps its scale at any
//     format (see generative-pattern.js).
//   - params.backdropColors: the backdrop gradient as resolved brand tokens.
// To update the engine, compile the new source the same way and re-apply them.
//
// Animation: compute(params, state, phase, tone) draws one moment of the loop.
// phase goes from 0 to 2 pi. Static patterns use a fixed phase.

function createPatternEngine() {
  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const mod = (a, n) => (a % n + n) % n;
  function mulberry32(seed) {
    let a = seed | 0;
    return () => {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeNoise(seed) {
    const random = mulberry32(seed * 9973 + 17);
    const order = [];
    for (let i = 0; i < 256; i += 1) order[i] = i;
    for (let i = 255; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const swap = order[i];
      order[i] = order[j];
      order[j] = swap;
    }
    const p = new Uint8Array(512);
    for (let i = 0; i < 512; i += 1) p[i] = order[i & 255];
    const g = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y, z) => {
      const k = h % 12 * 3;
      return g[k] * x + g[k + 1] * y + g[k + 2] * z;
    };
    return (xIn, yIn, zIn) => {
      let X = Math.floor(xIn);
      let Y = Math.floor(yIn);
      let Z = Math.floor(zIn);
      const x = xIn - X;
      const y = yIn - Y;
      const z = zIn - Z;
      X &= 255;
      Y &= 255;
      Z &= 255;
      const u = fade(x);
      const v = fade(y);
      const w = fade(z);
      const A = p[X] + Y;
      const AA = p[A] + Z;
      const AB = p[A + 1] + Z;
      const B = p[X + 1] + Y;
      const BA = p[B] + Z;
      const BB = p[B + 1] + Z;
      return mix(
        mix(mix(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u), mix(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u), v),
        mix(
          mix(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
          mix(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
          v
        ),
        w
      );
    };
  }
  function fbm(state, x, y, z, octaves) {
    const noise = state.noise;
    let sum = 0;
    let amplitude = 1;
    let frequency = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i += 1) {
      sum += amplitude * noise(x * frequency, y * frequency, z + i * 17.13);
      norm += amplitude;
      amplitude *= 0.5;
      frequency *= 2.03;
    }
    return clamp(0.5 + 0.9 * sum / norm, 0, 1);
  }
  function hash(a, b, seed) {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(seed | 0, 2246822519) | 0;
    h = Math.imul(h ^ h >>> 13, 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function sdHexagon(xIn, yIn, r) {
    const kx = -0.866025404;
    const ky = 0.5;
    const kz = 0.577350269;
    let x = Math.abs(xIn);
    let y = Math.abs(yIn);
    const d = 2 * Math.min(kx * x + ky * y, 0);
    x -= d * kx;
    y -= d * ky;
    x -= clamp(x, -kz * r, kz * r);
    y -= r;
    return Math.hypot(x, y) * Math.sign(y);
  }
  function sdBox(x, y, b) {
    const qx = Math.abs(x) - b;
    const qy = Math.abs(y) - b;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
  }
  function sdTriangle(xIn, yIn, r) {
    const k = Math.sqrt(3);
    let x = Math.abs(xIn) - r;
    let y = -yIn + r / k;
    if (x + k * y > 0) {
      const tx = (x - k * y) / 2;
      const ty = (-k * x - y) / 2;
      x = tx;
      y = ty;
    }
    x -= clamp(x, -2 * r, 0);
    return -Math.hypot(x, y) * Math.sign(y);
  }
  function edt1d(f, n, d, v, z) {
    let k = 0;
    v[0] = 0;
    z[0] = -1e20;
    z[1] = 1e20;
    for (let q = 1; q < n; q += 1) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k -= 1;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k += 1;
      v[k] = q;
      z[k] = s;
      z[k + 1] = 1e20;
    }
    k = 0;
    for (let q = 0; q < n; q += 1) {
      while (z[k + 1] < q) k += 1;
      const dq = q - v[k];
      d[q] = dq * dq + f[v[k]];
    }
  }
  function edt(grid, w, h) {
    const n = Math.max(w, h);
    const f = new Float64Array(n);
    const d = new Float64Array(n);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    for (let x = 0; x < w; x += 1) {
      for (let y = 0; y < h; y += 1) f[y] = grid[y * w + x];
      edt1d(f, h, d, v, z);
      for (let y = 0; y < h; y += 1) grid[y * w + x] = d[y];
    }
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) f[x] = grid[y * w + x];
      edt1d(f, w, d, v, z);
      for (let x = 0; x < w; x += 1) grid[y * w + x] = d[x];
    }
  }
  function buildMask(params, state) {
    const key = params.text + "|" + params.textFont + "|" + state.fontEpoch;
    if (state.maskKey === key && state.mask) return;
    state.maskKey = key;
    const n = 640;
    const unit = n / 4;
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = n;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const text = (params.text || " ").slice(0, 48);
    const font = (size) => "800 " + size + "px " + params.textFont;
    context.font = font(200);
    let metrics = context.measureText(text);
    const fontSize = Math.min(200 * (3 * unit) / Math.max(1, metrics.width), 2.2 * unit);
    context.font = font(fontSize);
    metrics = context.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.7;
    const descent = metrics.actualBoundingBoxDescent || 0;
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    context.fillText(text, n / 2, n / 2 + (ascent - descent) / 2);
    const data = context.getImageData(0, 0, n, n).data;
    const outside = new Float64Array(n * n);
    const inside = new Float64Array(n * n);
    for (let i = 0; i < n * n; i += 1) {
      const isInside = data[i * 4 + 3] > 127;
      outside[i] = isInside ? 0 : 1e20;
      inside[i] = isInside ? 1e20 : 0;
    }
    edt(outside, n, n);
    edt(inside, n, n);
    const sdf = new Float32Array(n * n);
    for (let i = 0; i < n * n; i += 1) sdf[i] = (Math.sqrt(outside[i]) - Math.sqrt(inside[i])) / unit;
    state.mask = { n, sdf, unit };
  }
  function textDistance(state, x, y) {
    const { n, sdf, unit } = state.mask;
    const px = (x + 2) * unit - 0.5;
    const py = (y + 2) * unit - 0.5;
    const cx = clamp(px, 0, n - 1.001);
    const cy = clamp(py, 0, n - 1.001);
    const extra = Math.hypot(px - cx, py - cy) / unit;
    const ix = cx | 0;
    const iy = cy | 0;
    const fx = cx - ix;
    const fy = cy - iy;
    const i = iy * n + ix;
    const a = sdf[i];
    const b = sdf[i + 1];
    const c = sdf[i + n];
    const d = sdf[i + n + 1];
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy + extra;
  }
  function shapeDistance(params, state, xIn, yIn) {
    let x = xIn;
    let y = yIn;
    if (params.repeat > 1) {
      const c = 2 / params.repeat;
      const h = c / 2;
      x = (mod(x + h, c) - h) / h;
      y = (mod(y + h, c) - h) / h;
    }
    const r = params.size;
    switch (params.shape) {
      case "circle":
        return Math.hypot(x, y) - r;
      case "hexagon":
        return sdHexagon(x, y, r);
      case "ring":
        return Math.abs(Math.hypot(x, y) - r) - r * 0.18;
      case "box":
        return sdBox(x, y, r);
      case "triangle":
        return sdTriangle(x, y, r);
      case "gradient":
        return x / Math.max(r, 0.05);
      case "text":
        return textDistance(state, x / r, y / r) * r;
      default:
        return 0;
    }
  }
  function shapeValue(params, d, phase) {
    const s = Math.max(params.softness, 1e-3);
    switch (params.shaping) {
      case "fill":
        return 1 - smooth(-s, s, d);
      case "outline":
        return 1 - smooth(0, s, Math.abs(d) - params.outlineWidth);
      case "rings":
        return (0.5 + 0.5 * Math.cos(TAU * d * params.ringFrequency - phase * params.ringSpeed)) * (params.ringFade > 0 ? Math.exp(-Math.max(d, 0) * params.ringFade) : 1);
      default:
        return Math.exp(-Math.max(d, 0) / s);
    }
  }
  function blend(params, value, noise) {
    const a = params.noiseAmount;
    if (a <= 0) return value;
    if (params.blend === "mix") return mix(value, noise, a);
    if (params.blend === "add") return value + (noise - 0.5) * 2 * a;
    return value * (1 - a + a * noise * 1.6);
  }
  function finish(params, tone, value) {
    const toned = clamp(tone(clamp(value, 0, 1)), 0, 1);
    return params.invert ? 1 - toned : toned;
  }
  const domainOut = [0, 0];
  function domain(params, nx, ny, phase) {
    let x = nx / params.zoom;
    let y = ny / params.zoom;
    const r = params.rotation * DEG + params.fieldTurns * phase;
    if (r) {
      const c = Math.cos(r);
      const s = Math.sin(r);
      const tx = x * c - y * s;
      y = x * s + y * c;
      x = tx;
    }
    if (params.twist) {
      const a = params.twist * Math.hypot(x, y);
      const c = Math.cos(a);
      const s = Math.sin(a);
      const tx = x * c - y * s;
      y = x * s + y * c;
      x = tx;
    }
    domainOut[0] = x;
    domainOut[1] = y;
  }
  function field(params, state, nx, ny, phase, tone) {
    domain(params, nx, ny, phase);
    let x = domainOut[0];
    let y = domainOut[1];
    const lx = params.drift * Math.cos(phase);
    const ly = params.drift * Math.sin(phase);
    if (params.warp > 0) {
      const ws = params.noiseScale * 0.75;
      const noise = state.noise;
      x += params.warp * noise(x * ws + lx, y * ws + ly, 11.3);
      y += params.warp * noise(x * ws + lx + 41.7, y * ws + ly - 13.1, 5.7);
    }
    const needsNoise = params.shape === "none" || params.noiseAmount > 0;
    const n = needsNoise ? fbm(state, x * params.noiseScale + lx, y * params.noiseScale + ly, 0.5, params.octaves) : 0.5;
    const value = params.shape === "none" ? n : blend(params, shapeValue(params, shapeDistance(params, state, x, y), phase), n);
    return finish(params, tone, value);
  }
  function maskValue(params, state, nx, ny, phase) {
    if (params.shape === "none") return 1;
    domain(params, nx, ny, phase);
    return shapeValue(params, shapeDistance(params, state, domainOut[0], domainOut[1]), phase);
  }
  function hexToRgb(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    const n = parseInt(h, 16) || 0;
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function makeRamp(colors) {
    const stops = colors.length ? colors : ["#F0F3FA"];
    const rgb = stops.map(hexToRgb);
    const cache = [];
    for (let i = 0; i <= 128; i += 1) {
      const t = i / 128 * (rgb.length - 1);
      const k = Math.min(Math.floor(t), Math.max(rgb.length - 2, 0));
      const f = t - k;
      const a = rgb[k];
      const b = rgb[Math.min(k + 1, rgb.length - 1)];
      const c = [0, 1, 2].map((j) => Math.round(mix(a[j], b[j], rgb.length === 1 ? 0 : f)));
      cache.push("#" + c.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase());
    }
    return {
      at: (t) => cache[Math.round(clamp(t, 0, 1) * 128)],
      pick: (u) => stops[Math.min(stops.length - 1, Math.floor(u * stops.length))] ?? cache[0]
    };
  }
  function createState() {
    return { noise: null, seed: null, mask: null, maskKey: null, fontEpoch: 0, ramp: null, rampKey: "", graphKey: "", graphNeighbors: null };
  }
  function prepare(params, state) {
    if (state.seed !== params.seed || !state.noise) {
      state.noise = makeNoise(params.seed);
      state.seed = params.seed;
    }
    if (params.shape === "text") buildMask(params, state);
    const rampKey = params.colors.join(",");
    if (state.rampKey !== rampKey || !state.ramp) {
      state.ramp = makeRamp(params.colors);
      state.rampKey = rampKey;
    }
  }
  function normalize(v) {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function sphereScreenRadius(params) {
    return params.radius * (params.unit ?? Math.min(params.width, params.height) / 2) / (1 - params.perspective * 0.5); // patterns: unit
  }
  const MAX_NEIGHBORS = 6;
  function nearestNeighbors(points) {
    const n = points.length;
    const result = new Int32Array(n * MAX_NEIGHBORS).fill(-1);
    const best = new Float64Array(MAX_NEIGHBORS);
    for (let i = 0; i < n; i += 1) {
      best.fill(Infinity);
      const a = points[i];
      for (let j = 0; j < n; j += 1) {
        if (j === i) continue;
        const b = points[j];
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const dz = a[2] - b[2];
        const d = dx * dx + dy * dy + dz * dz;
        if (d >= best[MAX_NEIGHBORS - 1]) continue;
        let slot = MAX_NEIGHBORS - 1;
        while (slot > 0 && best[slot - 1] > d) {
          best[slot] = best[slot - 1];
          result[i * MAX_NEIGHBORS + slot] = result[i * MAX_NEIGHBORS + slot - 1];
          slot -= 1;
        }
        best[slot] = d;
        result[i * MAX_NEIGHBORS + slot] = j;
      }
    }
    return result;
  }
  function buildGraphLinks(params, state, points, nodeX, nodeY, nodeValue, nodeDepth, nodeVisible) {
    const n = points.length;
    const key = params.distribution + "|" + n + "|" + (params.distribution === "volume" ? params.seed : 0);
    if (state.graphKey !== key || !state.graphNeighbors) {
      state.graphNeighbors = nearestNeighbors(points);
      state.graphKey = key;
    }
    const neighbors = state.graphNeighbors;
    const links = [];
    const seen = /* @__PURE__ */ new Set();
    const linksPerPoint = Math.max(1, Math.min(MAX_NEIGHBORS, Math.round(params.graphNeighbors)));
    for (let i = 0; i < n; i += 1) {
      if (!nodeVisible[i] || hash(i, 21, params.graphSeed) >= params.graphDensity) continue;
      for (let m = 0; m < linksPerPoint; m += 1) {
        let j = neighbors[i * MAX_NEIGHBORS + m];
        if (hash(i * 8 + m, 23, params.graphSeed) < params.graphLongLinks) j = Math.floor(hash(i * 8 + m, 24, params.graphSeed) * n);
        if (j < 0 || j === i || !nodeVisible[j]) continue;
        const lo = Math.min(i, j);
        const hi = Math.max(i, j);
        const edgeKey = lo * n + hi;
        if (seen.has(edgeKey)) continue;
        seen.add(edgeKey);
        const variation = params.graphWidthVariation * (hash(lo, hi * 7 + 25, params.strokeSeed) * 2 - 1);
        const width = Math.max(0.1, params.graphWidth * (1 + variation));
        const depth = (nodeDepth[i] + nodeDepth[j]) / 2;
        links.push({
          x: nodeX[i],
          y: nodeY[i],
          x2: nodeX[j],
          y2: nodeY[j],
          size: width,
          angle: 0,
          color: state.ramp.at((nodeValue[i] + nodeValue[j]) / 2),
          alpha: params.graphOpacity * mix(1, depth, params.depthShade),
          kind: 4,
          glyph: ""
        });
      }
    }
    return links;
  }
  const BACKDROPS = {
    darkViolet: ["#0B0F19", "#392689"],
    mediumViolet: ["#090E1A", "#6047FF"],
    lightViolet: ["#6047FF", "#9494FF"],
    red: ["#0B0F19", "#A11E3E"]
  };
  function backdropStops(params) {
    if (params.backdropColors) return params.backdropColors; // patterns: brand tokens, resolved
    return params.backdrop === "none" ? null : BACKDROPS[params.backdrop] ?? null;
  }
  const KIND = { line: 0, circle: 1, hexagon: 2, ascii: 3 };
  function compute(params, state, phase, tone) {
    prepare(params, state);
    const W = params.width;
    const H = params.height;
    const U = params.unit ?? Math.min(W, H) / 2; // patterns: unit can be set by the caller
    const cx0 = W / 2;
    const cy0 = H / 2;
    const cell = params.cell;
    const items = [];
    const glyphSet = params.glyphs === "word" ? params.word || "Q" : params.ramp || " .:#";
    const rotationBase = params.elementRotation * DEG + params.elementTurns * phase;
    const lx = params.drift * Math.cos(phase);
    const ly = params.drift * Math.sin(phase);
    const ramp = state.ramp;
    function push(xIn, yIn, value, angleIn, index, perspective) {
      if (value < params.threshold) return false;
      if (params.density === "stochastic" && hash(index, 7, params.seed) > value) return false;
      const size = cell * params.scale * perspective * (params.sizeByValue ? mix(params.minSize, 1, value) : 1);
      if (size < 0.25) return false;
      let x = xIn;
      let y = yIn;
      if (params.jitter) {
        x += (hash(index, 3, params.seed) - 0.5) * params.jitter * cell;
        y += (hash(index, 4, params.seed) - 0.5) * params.jitter * cell;
      }
      if (x < -size * 2 || y < -size * 2 || x > W + size * 2 || y > H + size * 2) return false;
      const kind = params.element === "mixed" ? value < 0.34 ? 0 : value < 0.67 ? 1 : 2 : KIND[params.element];
      let glyph = "";
      if (kind === 3) {
        if (params.glyphs === "ramp") glyph = glyphSet[Math.round(value * (glyphSet.length - 1))] ?? "";
        else if (params.glyphs === "word") glyph = glyphSet[index % glyphSet.length] ?? "";
        else glyph = glyphSet[Math.floor(hash(index, 5, params.seed) * glyphSet.length)] ?? "";
        if (!glyph || glyph === " ") return false;
      }
      const angle = angleIn + rotationBase;
      let color;
      switch (params.colorMap) {
        case "x":
          color = ramp.at(x / W);
          break;
        case "y":
          color = ramp.at(y / H);
          break;
        case "radial":
          color = ramp.at(Math.hypot(x - cx0, y - cy0) / Math.hypot(cx0, cy0));
          break;
        case "random":
          color = ramp.pick(hash(index, 11, params.seed));
          break;
        case "angle":
          color = ramp.at(mod(angle, Math.PI) / Math.PI);
          break;
        default:
          color = ramp.at(value);
      }
      items.push({ x, y, size, angle, color, alpha: params.alphaByValue ? mix(params.minAlpha, 1, value) : 1, kind, glyph });
      return true;
    }
    function angleFor(index, value, nx, ny, gx, gy, natural) {
      switch (params.orientation) {
        case "contour":
          return natural !== null ? natural : gx || gy ? Math.atan2(gy, gx) + Math.PI / 2 : 0;
        case "gradient":
          return natural !== null ? natural + Math.PI / 2 : gx || gy ? Math.atan2(gy, gx) : 0;
        case "flow":
          return state.noise(nx * params.noiseScale * 0.6 + lx, ny * params.noiseScale * 0.6 + ly, 99.5) * TAU * params.angleAmount;
        case "value":
          return value * Math.PI * params.angleAmount;
        case "radial":
          return Math.atan2(ny, nx);
        case "random":
          return Math.floor(hash(index, 9, params.seed) * 6) * (Math.PI / 3);
        default:
          return 0;
      }
    }
    const snap = (v) => Math.round((v - cell / 2) / cell) * cell + cell / 2;
    const needsGradient = params.orientation === "contour" || params.orientation === "gradient";
    if (params.layout === "grid" || params.layout === "hex") {
      const hex = params.layout === "hex";
      const rowHeight = hex ? cell * Math.sqrt(3) / 2 : cell;
      const cols = Math.max(1, Math.floor((W - params.padding * 2) / cell));
      const rows = Math.max(1, Math.floor((H - params.padding * 2) / rowHeight));
      const ox = (W - cols * cell) / 2 + cell / 2;
      const oy = (H - rows * rowHeight) / 2 + rowHeight / 2;
      const e = cell / U;
      for (let j = 0; j < rows; j += 1) {
        const odd = hex && j % 2 === 1;
        const n = odd ? cols - 1 : cols;
        for (let i = 0; i < n; i += 1) {
          const x = ox + i * cell + (odd ? cell / 2 : 0);
          const y = oy + j * rowHeight;
          const nx = (x - cx0) / U;
          const ny = (y - cy0) / U;
          const value = field(params, state, nx, ny, phase, tone);
          let gx = 0;
          let gy = 0;
          if (needsGradient) {
            gx = field(params, state, nx + e, ny, phase, tone) - value;
            gy = field(params, state, nx, ny + e, phase, tone) - value;
          }
          const index = j * cols + i;
          push(x, y, value, angleFor(index, value, nx, ny, gx, gy, null), index, 1);
        }
      }
    } else if (params.layout === "sphere") {
      const count = params.count;
      const R = params.radius * U;
      const points = [];
      if (params.distribution === "rings") {
        const lat = Math.max(3, Math.round(Math.sqrt(count / 1.3)));
        let index = 0;
        for (let k = 0; k <= lat; k += 1) {
          const phi = Math.PI * k / lat;
          const y = Math.cos(phi);
          const r = Math.sin(phi);
          const m = Math.max(1, Math.round(lat * 2 * r));
          for (let q = 0; q < m; q += 1) {
            const t = TAU * q / m;
            points.push([Math.cos(t) * r, y, Math.sin(t) * r, index]);
            index += 1;
          }
        }
      } else if (params.distribution === "volume") {
        const random = mulberry32(params.seed * 31 + 7);
        for (let i = 0; i < count; i += 1) {
          const u = random() * 2 - 1;
          const t = random() * TAU;
          const r0 = Math.cbrt(random());
          const s = Math.sqrt(1 - u * u);
          points.push([Math.cos(t) * s * r0, u * r0, Math.sin(t) * s * r0, i]);
        }
      } else {
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i += 1) {
          const y = 1 - 2 * (i + 0.5) / count;
          const r = Math.sqrt(1 - y * y);
          const t = i * golden;
          points.push([Math.cos(t) * r, y, Math.sin(t) * r, i]);
        }
      }
      const forward = normalize([-params.orbit.position[0], -params.orbit.position[1], -params.orbit.position[2]]);
      const right = normalize(cross(forward, params.orbit.up));
      const up = cross(right, forward);
      const spin = params.sphereTurns * phase;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const projected = points.map(([x0, y0, z0, index]) => {
        const x1 = x0 * cs - z0 * sn;
        const z1 = x0 * sn + z0 * cs;
        const vx = x1 * right[0] + y0 * right[1] + z1 * right[2];
        const vy = x1 * up[0] + y0 * up[1] + z1 * up[2];
        const vz = -(x1 * forward[0] + y0 * forward[1] + z1 * forward[2]);
        return [x0, y0, z0, vx, vy, vz, index];
      }).sort((a, b) => a[5] - b[5]);
      const firstNode = items.length;
      const pointCount = points.length;
      const nodeX = new Float32Array(pointCount);
      const nodeY = new Float32Array(pointCount);
      const nodeValue = new Float32Array(pointCount);
      const nodeDepth = new Float32Array(pointCount);
      const nodeVisible = new Uint8Array(pointCount);
      for (const [x0, y0, z0, vx, vy, vz, index] of projected) {
        const perspective = 1 / (1 - params.perspective * vz * 0.5);
        let sx = cx0 + vx * R * perspective;
        let sy = cy0 - vy * R * perspective;
        if (params.snap) {
          sx = snap(sx);
          sy = snap(sy);
        }
        const nx = (sx - cx0) / U;
        const ny = (sy - cy0) / U;
        let value = mix(1, (vz + 1) / 2, params.depthShade) * maskValue(params, state, nx, ny, phase);
        if (params.noiseAmount > 0) {
          value = blend(params, value, fbm(state, x0 * params.noiseScale + lx, y0 * params.noiseScale + ly, z0 * params.noiseScale, params.octaves));
        }
        value = finish(params, tone, value);
        const visible = push(sx, sy, value, angleFor(index, value, nx, ny, 0, 0, 0), index, perspective);
        nodeX[index] = sx;
        nodeY[index] = sy;
        nodeValue[index] = value;
        nodeDepth[index] = (vz + 1) / 2;
        nodeVisible[index] = visible ? 1 : 0;
      }
      if (params.graph) {
        const links = buildGraphLinks(params, state, points, nodeX, nodeY, nodeValue, nodeDepth, nodeVisible);
        items.splice(firstNode, 0, ...links);
      }
    } else {
      for (let i = 0; i < params.count; i += 1) {
        const a = hash(i, 1, params.seed) * TAU;
        const dd = mix(0.08, 1, Math.sqrt(hash(i, 2, params.seed)));
        const zz = mod(hash(i, 3, params.seed) + phase / TAU * params.burstSpeed, 1);
        const wz = 1 - zz * 0.96;
        const k = 0.25 / wz;
        const rr = U * params.spread * dd * k;
        let sx = cx0 + Math.cos(a) * rr;
        let sy = cy0 + Math.sin(a) * rr;
        if (params.snap) {
          sx = snap(sx);
          sy = snap(sy);
        }
        const nx = (sx - cx0) / U;
        const ny = (sy - cy0) / U;
        let value = smooth(0, 0.25, zz) * mix(1, zz, params.depthShade) * maskValue(params, state, nx, ny, phase);
        if (params.noiseAmount > 0) value = blend(params, value, fbm(state, nx * params.noiseScale + lx, ny * params.noiseScale + ly, 3.3, params.octaves));
        value = finish(params, tone, value);
        push(sx, sy, value, angleFor(i, value, nx, ny, 0, 0, a), i, Math.min(k * 2, 6));
      }
    }
    return items;
  }
  function hexagonPoints(x, y, r, a) {
    const points = [];
    for (let k = 0; k < 6; k += 1) {
      const t = a + k * Math.PI / 3;
      points.push(x + Math.cos(t) * r, y + Math.sin(t) * r);
    }
    return points;
  }
  const glyphFont = (params, size) => "500 " + Math.max(1, Math.round(size)) + "px " + params.glyphFont;
  function drawCanvas(context, params, items, opacity = 1) {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const stroked = params.paint === "stroke" && (params.element === "circle" || params.element === "hexagon");
    const backdrop = backdropStops(params);
    if (backdrop) {
      context.globalAlpha = opacity;
      const gradient = context.createLinearGradient(0, 0, 0, params.height);
      gradient.addColorStop(0, backdrop[0]);
      gradient.addColorStop(1, backdrop[1]);
      context.fillStyle = gradient;
      context.fillRect(0, 0, params.width, params.height);
    }
    let font = "";
    for (const item of items) {
      context.globalAlpha = item.alpha * opacity;
      if (item.kind === 4) {
        context.strokeStyle = item.color;
        context.lineWidth = item.size;
        context.beginPath();
        context.moveTo(item.x, item.y);
        context.lineTo(item.x2, item.y2);
        context.stroke();
      } else if (item.kind === 0) {
        const h = item.size * params.lineLength / 2;
        const c = Math.cos(item.angle) * h;
        const s = Math.sin(item.angle) * h;
        context.strokeStyle = item.color;
        context.lineWidth = params.lineWidth;
        context.beginPath();
        context.moveTo(item.x - c, item.y - s);
        context.lineTo(item.x + c, item.y + s);
        context.stroke();
      } else if (item.kind === 1) {
        context.beginPath();
        context.arc(item.x, item.y, item.size / 2, 0, TAU);
        if (stroked) {
          context.lineWidth = params.strokeWidth;
          context.strokeStyle = item.color;
          context.stroke();
        } else {
          context.fillStyle = item.color;
          context.fill();
        }
      } else if (item.kind === 2) {
        const p = hexagonPoints(item.x, item.y, item.size / 2, item.angle);
        context.beginPath();
        context.moveTo(p[0], p[1]);
        for (let q = 2; q < 12; q += 2) context.lineTo(p[q], p[q + 1]);
        context.closePath();
        if (stroked) {
          context.lineWidth = params.strokeWidth;
          context.strokeStyle = item.color;
          context.stroke();
        } else {
          context.fillStyle = item.color;
          context.fill();
        }
      } else {
        const next = glyphFont(params, item.size);
        if (next !== font) {
          context.font = next;
          font = next;
        }
        context.fillStyle = item.color;
        context.fillText(item.glyph, item.x, item.y);
      }
    }
    context.restore();
  }
  function appendSvg(container, params, items, offsetX, offsetY, opacity = 1) {
    const NS = "http://www.w3.org/2000/svg";
    const doc = container.ownerDocument;
    const r = (v) => String(Math.round(v * 100) / 100);
    const group = doc.createElementNS(NS, "g");
    group.setAttribute("transform", "translate(" + r(offsetX) + " " + r(offsetY) + ")");
    group.setAttribute("stroke-linecap", "round");
    group.setAttribute("stroke-linejoin", "round");
    group.setAttribute("data-qdrant-pattern", params.element);
    if (opacity < 1) group.setAttribute("opacity", r(opacity));
    const backdrop = backdropStops(params);
    if (backdrop) {
      const id = "qdrant-backdrop-" + params.backdrop;
      const defs = doc.createElementNS(NS, "defs");
      const gradient = doc.createElementNS(NS, "linearGradient");
      gradient.setAttribute("id", id);
      gradient.setAttribute("x1", "0");
      gradient.setAttribute("y1", "0");
      gradient.setAttribute("x2", "0");
      gradient.setAttribute("y2", "1");
      backdrop.forEach((color, index) => {
        const stop = doc.createElementNS(NS, "stop");
        stop.setAttribute("offset", String(index));
        stop.setAttribute("stop-color", color);
        gradient.append(stop);
      });
      defs.append(gradient);
      group.append(defs);
      const rect = doc.createElementNS(NS, "rect");
      rect.setAttribute("width", r(params.width));
      rect.setAttribute("height", r(params.height));
      rect.setAttribute("fill", "url(#" + id + ")");
      group.append(rect);
    }
    const stroked = params.paint === "stroke" && (params.element === "circle" || params.element === "hexagon");
    for (const item of items) {
      let node;
      if (item.kind === 4) {
        node = doc.createElementNS(NS, "line");
        node.setAttribute("x1", r(item.x));
        node.setAttribute("y1", r(item.y));
        node.setAttribute("x2", r(item.x2));
        node.setAttribute("y2", r(item.y2));
        node.setAttribute("stroke", item.color);
        node.setAttribute("stroke-width", r(item.size));
      } else if (item.kind === 0) {
        const h = item.size * params.lineLength / 2;
        const c = Math.cos(item.angle) * h;
        const s = Math.sin(item.angle) * h;
        node = doc.createElementNS(NS, "line");
        node.setAttribute("x1", r(item.x - c));
        node.setAttribute("y1", r(item.y - s));
        node.setAttribute("x2", r(item.x + c));
        node.setAttribute("y2", r(item.y + s));
        node.setAttribute("stroke", item.color);
        node.setAttribute("stroke-width", r(params.lineWidth));
      } else if (item.kind === 1 || item.kind === 2) {
        if (item.kind === 1) {
          node = doc.createElementNS(NS, "circle");
          node.setAttribute("cx", r(item.x));
          node.setAttribute("cy", r(item.y));
          node.setAttribute("r", r(item.size / 2));
        } else {
          node = doc.createElementNS(NS, "polygon");
          node.setAttribute("points", hexagonPoints(item.x, item.y, item.size / 2, item.angle).map(r).join(" "));
        }
        if (stroked) {
          node.setAttribute("fill", "none");
          node.setAttribute("stroke", item.color);
          node.setAttribute("stroke-width", r(params.strokeWidth));
        } else {
          node.setAttribute("fill", item.color);
        }
      } else {
        node = doc.createElementNS(NS, "text");
        node.setAttribute("x", r(item.x));
        node.setAttribute("y", r(item.y));
        node.setAttribute("font-family", params.glyphFont.replace(/"/g, "'"));
        node.setAttribute("font-weight", "500");
        node.setAttribute("font-size", String(Math.max(1, Math.round(item.size))));
        node.setAttribute("text-anchor", "middle");
        node.setAttribute("dominant-baseline", "central");
        node.setAttribute("fill", item.color);
        node.textContent = item.glyph;
      }
      if (item.alpha < 1) node.setAttribute("opacity", r(item.alpha));
      group.append(node);
    }
    container.append(group);
    return items.length;
  }
  return { createState, compute, drawCanvas, appendSvg, sphereScreenRadius };
}
export {
  createPatternEngine
};
