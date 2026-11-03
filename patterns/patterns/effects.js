// Effects shared by every recipe: the lenticular refraction and the mono noise.

import { hexToRgba } from "./tokens.js";

// Lenticular refraction. Lenses run across the image along angle A, and each lens
// shifts what's behind it. sample(x, y, channel) returns the source color, 0 to 1.
export function refract(px, size, refraction, seed, sample) {
  const a = (refraction.a * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const cx = (refraction.x / 100) * size;
  const cy = (refraction.y / 100) * size;
  const lens = Math.max(1, (refraction.r / 100) * size);
  // Measured against the Figma export: at strength -100 each lens keeps 62% of the
  // source inside it, and the edges between lenses are sharp 1px steps.
  const strength = (refraction.strength / 100) * 0.38;
  const soft = 0.003;
  const spread = (refraction.dispersion / 100) * 0.04; // color fringing per channel
  const frost = (refraction.frost / 100) * lens * 0.1;
  const rand = mulberry32(seed);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x - cx) * ux + (y - cy) * uy;
      const f = u / lens - Math.floor(u / lens); // 0 to 1 across one lens
      const edge = smoothstep(0, soft, f) * smoothstep(0, soft, 1 - f);
      const shift = strength * (f - 0.5) * lens * edge + (rand() - 0.5) * frost;
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        const s = shift * (1 + (c - 1) * spread);
        px[i + c] = 255 * sample(x + s * ux, y + s * uy, c);
      }
      px[i + 3] = 255;
    }
  }
}

// Scattered specks, like Figma's mono noise effect.
export function drawNoise(ctx, size, noise) {
  const [r, g, b] = hexToRgba(noise.color);
  ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${noise.opacity / 100})`;
  const rand = mulberry32(noise.seed);
  const cell = Math.max(1, noise.size / 2);
  const chance = (noise.density / 100) * 0.055; // tuned to match Figma's speck count
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      if (rand() < chance) ctx.fillRect(x, y, cell * (0.5 + rand()), cell * (0.5 + rand()));
    }
  }
}

export const clamp = (v) => Math.min(1, Math.max(0, v));

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
