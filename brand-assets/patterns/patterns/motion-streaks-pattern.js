// Motion-Streaks-Pattern (recipe)
// A token gradient with soft light streaks on top, at a set opacity. The streaks are
// a line-for-line port of Figma's "Motion streaks" shader fill (WGSL), drawn on the
// CPU so it runs anywhere a canvas does. Like the shader, every size is measured
// against the canvas's short side, so the look holds at any size and shape.
//
// The streak values can be changed within the approved ranges (STREAK_RANGES); the
// preset holds the defaults. Colors are always token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";
import { gradientSampler, makeFrame } from "./effects.js";

// Approved by Vanesa on 2026-11-24. Length, density and softness sit on the 8 grid.
// Direction: only the approved angles (124° is the usual; 0°, 144°, 160°,
// 288° and 320° approved in the Pattern Library review). Any other angle snaps to the
// nearest one, measured around the circle.
export const STREAK_RANGES = {
  length: [16, 80],
  density: [8, 64],
  softness: [32, 64],
};
export const STREAK_DIRECTIONS = [0, 124, 144, 160, 288, 320];
const ON_GRID = ["length", "density", "softness"];

// The shader's hash, in 32-bit floats like the GPU.
const f = Math.fround;
function streakHash(v) {
  const t = f(f(Math.sin(f(f(f(v) * f(127.1)) + f(311.7)))) * f(43758.5453));
  return f(t - Math.floor(t));
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Rounds length, density and softness to the 8 grid and keeps them in the approved
// ranges. Direction snaps to the nearest approved angle.
export function streakSettings(base, overrides = {}) {
  const s = { ...base, ...overrides };
  for (const key of ON_GRID) {
    const [lo, hi] = STREAK_RANGES[key];
    s[key] = clamp(Math.round(Number(s[key]) / 8) * 8, lo, hi);
  }
  const wanted = ((Number(s.direction) % 360) + 360) % 360;
  const gap = (d) => Math.min(Math.abs(d - wanted), 360 - Math.abs(d - wanted));
  s.direction = STREAK_DIRECTIONS.reduce((best, d) => (gap(d) < gap(best) ? d : best));
  return s;
}

// Light and coverage per pixel, exactly as the shader sums them. Each streak only
// touches the pixels where it's still visible, so this stays fast at large sizes.
function streakField(width, height, s) {
  const light = new Float32Array(width * height);
  const coverage = new Float32Array(width * height);
  const shortSide = Math.max(Math.min(width, height), 1);
  const extent = [width / shortSide, height / shortSide];
  const angle = s.direction * 0.01745329252;
  const along = [Math.cos(angle), Math.sin(angle)];
  const across = [-along[1], along[0]];
  const lengthValue = Math.max(s.length * 0.01, 0.02);
  const softValue = clamp(s.softness * 0.01, 0, 1);
  const pixelWidth = 1 / shortSide;
  const count = Math.min(120, Math.ceil(s.density * 1.2));

  for (let i = 0; i < count; i++) {
    const seed = i + 19;
    const enabled = clamp(s.density * 1.2 - i, 0, 1);
    if (enabled <= 0) continue;
    const ox = (streakHash(seed) - 0.5) * extent[0] * 1.2;
    const oy = (streakHash(seed + 83.3) - 0.5) * extent[1] * 1.2;
    const halfLength = lengthValue * (0.18 + 0.5 * streakHash(seed + 37));
    const w = Math.max(pixelWidth * 0.7, (0.0008 + softValue * 0.014) * (0.35 + streakHash(seed + 51.8)));
    const haloW = w * 4 + softValue * 0.01;
    const intensity = (0.28 + 0.85 * streakHash(seed + 93.1) ** 2) * enabled;

    // Beyond 1.6 half-lengths along and 6 halo widths across, a streak adds < 1e-6.
    const ra = halfLength * 1.6;
    const rc = haloW * 6;
    const hx = Math.abs(along[0]) * ra + Math.abs(across[0]) * rc;
    const hy = Math.abs(along[1]) * ra + Math.abs(across[1]) * rc;
    const cx = ox * shortSide + width / 2;
    const cy = oy * shortSide + height / 2;
    const x0 = Math.max(0, Math.floor(cx - hx * shortSide));
    const x1 = Math.min(width - 1, Math.ceil(cx + hx * shortSide));
    const y0 = Math.max(0, Math.floor(cy - hy * shortSide));
    const y1 = Math.min(height - 1, Math.ceil(cy + hy * shortSide));

    for (let py = y0; py <= y1; py++) {
      const dy = (py + 0.5 - height / 2) / shortSide - oy;
      for (let px = x0; px <= x1; px++) {
        const dx = (px + 0.5 - width / 2) / shortSide - ox;
        const x = dx * along[0] + dy * along[1];
        const y = dx * across[0] + dy * across[1];
        const longitudinal = Math.exp(-((Math.abs(x / halfLength)) ** 4) * 2.5);
        const asymmetry = 0.64 + 0.36 * smoothstep(-halfLength, halfLength, x);
        const core = Math.exp(-0.5 * (Math.abs(y) / w) ** 2);
        const halo = Math.exp(-0.5 * (Math.abs(y) / haloW) ** 2);
        const trail = longitudinal * asymmetry * (core + halo * 0.15) * intensity;
        const k = py * width + px;
        light[k] += trail;
        coverage[k] += trail * 1.35;
      }
    }
  }
  return { light, coverage };
}

// color = { from, to, streak } token references, from colorwayTokens() in tokens.js.
// frame = makeFrame(width, height). options.streaks overrides length, direction,
// density or softness, clamped to the approved ranges.
export function render(canvas, tokens, preset, color, frame = makeFrame(), options = {}) {
  const { gradient } = preset.settings;
  const s = streakSettings(preset.settings.streaks, options.streaks);
  const { width, height } = frame;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(width, height);
  const px = image.data;

  const from = hexToRgba(resolveToken(tokens, color.from));
  const to = hexToRgba(resolveToken(tokens, color.to));
  const streak = hexToRgba(resolveToken(tokens, color.streak));
  const background = gradientSampler(from, to, gradient.angle, frame, gradient.fromStop, gradient.toStop);
  const { light, coverage } = streakField(width, height, s);
  const opacity = s.opacity / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const k = y * width + x;
      const alpha = (1 - Math.exp(-coverage[k])) * opacity;
      const glow = clamp(light[k] - 0.7, 0, 1) * 0.55;
      for (let c = 0; c < 3; c++) {
        const top = streak[c] + (1 - streak[c]) * glow;
        px[k * 4 + c] = Math.round((background(x + 0.5, y + 0.5, c) * (1 - alpha) + top * alpha) * 255);
      }
      px[k * 4 + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}
