// Effects shared by the recipes: slice shift, noise and the linear gradient.
//
// Every effect draws into a frame of any width and height. Pixel values in presets
// (strip widths, offsets, noise grain) are written for a 1080 x 1080
// canvas and scale with the frame, so a pattern keeps its look at any size or shape.

import { hexToRgba } from "./tokens.js";

// The size every preset value is written for.
export const REFERENCE_SIZE = 1080;

// A canvas of any size. scale is relative to 1080 x 1080, by area, so a wide banner
// and a tall one of the same area get the same grain and strip widths.
export function makeFrame(width = REFERENCE_SIZE, height = REFERENCE_SIZE) {
  return { width, height, scale: Math.sqrt(width * height) / REFERENCE_SIZE };
}

// Scattered specks, like Figma's mono noise effect.
export function drawNoise(ctx, frame, noise) {
  const { width, height, scale } = frame;
  const [r, g, b] = hexToRgba(noise.color);
  ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${noise.opacity / 100})`;
  const rand = mulberry32(noise.seed);
  const cell = Math.max(1, (noise.size / 2) * scale);
  const chance = (noise.density / 100) * 0.055; // tuned to match Figma's speck count
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      if (rand() < chance) ctx.fillRect(x, y, cell * (0.5 + rand()), cell * (0.5 + rand()));
    }
  }
}

const clamp = (v) => Math.min(1, Math.max(0, v));

// Small seeded random, so the same settings always give the same image.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Slice shift: a direct port of Figma's "Slice shift" shader (version 2).
// The plane is rotated by angle A around (x, y) and cut into strips `r` px wide.
// Each strip's content moves sideways by strip number x r x shift, and every strip
// except the center one slides along its length by a random amount up to
// randomOffset / 2 px either way. Softness blends neighboring strips. Like Figma, the
// source repeats past its edges. sample(x, y, channel) returns the color, 0 to 1.
// Pixel values (r, randomOffset, softness) scale with the frame.
export function sliceShift(px, frame, slice, sample) {
  const { width: w, height: h, scale } = frame;
  const angle = (-slice.a * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cx = (slice.x / 100) * w;
  const cy = (slice.y / 100) * h;
  const width = Math.max(Math.abs(slice.r) * scale, 0.0001);
  const shift = slice.shift / 100;
  const randomOffset = slice.randomOffset * scale;
  const softness = Math.min(Math.max(slice.softness * scale, 0), width / 2);
  const normalizedSoftness = softness / width;

  // One strip's sample position for a rotated point (rx, ry). Returns [x, y, fraction].
  const sliceAt = (rx, ry, blendOffset) => {
    const slicePosition = (rx - blendOffset) / width + 0.5;
    const index = Math.floor(slicePosition);
    const displacement = (figmaRandom(index, index, 0) - 0.5) * (Math.abs(slicePosition - 0.5) >= 0.5 ? 1 : 0);
    const x = rx - index * width * shift;
    const y = ry + displacement * randomOffset;
    // Rotate back (inverse rotation) and move to the center.
    return [cos * x + sin * y + cx, -sin * x + cos * y + cy, slicePosition - Math.floor(slicePosition)];
  };

  for (let py = 0; py < h; py++) {
    for (let px_ = 0; px_ < w; px_++) {
      const lx = px_ + 0.5 - cx;
      const ly = py + 0.5 - cy;
      const rx = cos * lx - sin * ly;
      const ry = sin * lx + cos * ly;
      const [ax, ay, fa] = sliceAt(rx, ry, -softness);
      const [bx, by, fb] = sliceAt(rx, ry, softness);
      let blend = 1;
      if (normalizedSoftness > 0) {
        const overlap = 1.001 - normalizedSoftness <= fb + 1 - fa ? 1 : 0;
        const t = clamp((fa / (normalizedSoftness * 2)) * overlap);
        blend = t * t * (3 - 2 * t);
      }
      const o = (py * w + px_) * 4;
      for (let c = 0; c < 3; c++) {
        const colorA = sample(wrap(ax, w), wrap(ay, h), c);
        const colorB = blend < 1 ? sample(wrap(bx, w), wrap(by, h), c) : colorA;
        px[o + c] = 255 * (colorB + (colorA - colorB) * blend);
      }
      px[o + 3] = 255;
    }
  }
}

const wrap = (v, size) => ((v % size) + size) % size;

// Ordered dither (8 x 8 Bayer): turns color values from 0 to 255 (any precision) into
// 8-bit pixels, nudging each by less than one level in a fixed pattern. Smooth gradients
// stay smooth instead of breaking into bands, the pattern is invisible at normal size, and
// it survives image compression better than random grain (Vanesa, 2026-11-26).
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

export function orderedDither(exact, out, width) {
  for (let i = 0, p = 0; i < exact.length; i += 4, p++) {
    const x = p % width;
    const y = (p - x) / width;
    const t = (BAYER_8[(y & 7) * 8 + (x & 7)] + 0.5) / 64 - 0.5;
    for (let c = 0; c < 3; c++) out[i + c] = Math.max(0, Math.min(255, Math.floor(exact[i + c] + 0.5 + t)));
    out[i + 3] = 255;
  }
}


// Figma's shader random: a float in [0, 1) from three floats, bit for bit.
const f32 = new Float32Array(3);
const u32 = new Uint32Array(f32.buffer);
const one = new Float32Array(1);
const oneBits = new Uint32Array(one.buffer);
function figmaRandom(a, b, c) {
  f32[0] = a;
  f32[1] = b;
  f32[2] = c;
  let x = u32[0];
  let y = u32[1];
  let z = u32[2];
  for (let i = 0; i < 3; i++) {
    const nx = Math.imul(((x >>> 8) ^ y) >>> 0, 1103515245) >>> 0;
    const ny = Math.imul(((y >>> 8) ^ z) >>> 0, 1103515245) >>> 0;
    const nz = Math.imul(((z >>> 8) ^ x) >>> 0, 1103515245) >>> 0;
    x = nx;
    y = ny;
    z = nz;
  }
  oneBits[0] = ((127 << 23) | ((x ^ y ^ z) & 0x7fffff)) >>> 0;
  return one[0] - 1;
}

// A linear gradient between two colors ([r, g, b, a], 0 to 1), as a sample function.
// angle is CSS style: 0 = to top, 90 = to right, 180 = to bottom, and like CSS the
// gradient spans the whole frame at any shape. `fromStop` and `toStop` are the color
// stops in %, like Figma's (a stop can sit past 100%).
export function gradientSampler(from, to, angle, frame, fromStop = 0, toStop = 100) {
  const { width, height } = frame;
  const g = (angle * Math.PI) / 180;
  const gx = Math.sin(g);
  const gy = -Math.cos(g);
  const length = Math.abs(width * gx) + Math.abs(height * gy);
  const a = fromStop / 100;
  const b = toStop / 100;
  return (x, y, channel) => {
    const along = ((x - width / 2) * gx + (y - height / 2) * gy) / length + 0.5;
    const t = clamp((along - a) / (b - a));
    return from[channel] + (to[channel] - from[channel]) * t;
  };
}
