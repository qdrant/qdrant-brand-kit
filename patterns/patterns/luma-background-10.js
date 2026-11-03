// Luma-Background-10
// A gradient, bent into diagonal bands by a lenticular refraction, with noise on top.
// Every number below matches the Figma panel. Colors are token names, never hex.

import { resolveToken, hexToRgba } from "./tokens.js";

export const name = "Luma-Background-10";

export const defaults = {
  size: 1080,
  gradient: {
    from: "{color.secondary.500}",
    to: "{color.secondary.300}",
    angle: 180, // degrees, 180 = top to bottom
  },
  refraction: {
    pattern: "lenticular",
    strength: -100, // -100 to 100
    smoothness: 29, // %
    frost: 0, // %
    dispersion: 100, // %
    x: 50, // % of width
    y: 50, // % of height
    r: 24, // lens width, % of size
    a: -120, // degrees
  },
  noise: {
    color: "{color.pattern.noise}",
    size: 4, // px
    density: 16, // %
    seed: 10,
  },
};

export function render(canvas, tokens, params = defaults) {
  const { size, gradient, refraction, noise } = params;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);
  const px = image.data;

  const from = hexToRgba(resolveToken(tokens, gradient.from));
  const to = hexToRgba(resolveToken(tokens, gradient.to));

  // Gradient direction, CSS style: 0 = to top, 90 = to right, 180 = to bottom.
  const g = (gradient.angle * Math.PI) / 180;
  const gx = Math.sin(g);
  const gy = -Math.cos(g);
  const gradientAt = (x, y, channel) => {
    const t = clamp((x / size - 0.5) * gx + (y / size - 0.5) * gy + 0.5);
    return from[channel] + (to[channel] - from[channel]) * t;
  };

  // Lenses run across the image along angle A. Each lens shifts what's behind it.
  const a = (refraction.a * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const cx = (refraction.x / 100) * size;
  const cy = (refraction.y / 100) * size;
  const lens = Math.max(1, (refraction.r / 100) * size);
  const strength = refraction.strength / 100;
  const soft = Math.max(0.001, refraction.smoothness / 200);
  const spread = (refraction.dispersion / 100) * 0.04; // color fringing per channel
  const frost = (refraction.frost / 100) * lens * 0.1;
  const rand = mulberry32(noise.seed + 1);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x - cx) * ux + (y - cy) * uy;
      const f = u / lens - Math.floor(u / lens); // 0 to 1 across one lens
      // Sawtooth, softened at the lens edges by smoothness.
      const edge = smoothstep(0, soft, f) * smoothstep(0, soft, 1 - f);
      const shift = strength * (f - 0.5) * lens * edge + (rand() - 0.5) * frost;
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        const s = shift * (1 + (c - 1) * spread);
        px[i + c] = 255 * gradientAt(x + s * ux, y + s * uy, c);
      }
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  drawNoise(ctx, tokens, size, noise);
}

// Scattered specks, like Figma's mono noise effect.
function drawNoise(ctx, tokens, size, noise) {
  const [r, g, b, alpha] = hexToRgba(resolveToken(tokens, noise.color));
  ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${alpha})`;
  const rand = mulberry32(noise.seed);
  const cell = Math.max(1, noise.size / 2);
  const chance = (noise.density / 100) * 0.055; // tuned to match Figma's speck count
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      if (rand() < chance) ctx.fillRect(x, y, cell * (0.5 + rand()), cell * (0.5 + rand()));
    }
  }
}

const clamp = (v) => Math.min(1, Math.max(0, v));

function smoothstep(a, b, v) {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

// Small seeded random, so the same settings always give the same image.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
