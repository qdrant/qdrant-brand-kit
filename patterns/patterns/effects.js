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
  // source inside it.
  const strength = (refraction.strength / 100) * 0.38;
  // Lens edges are always sharp, about 1px, in every pattern. Smoothness is kept in
  // the presets as a record of the Figma value, but it doesn't soften the edges.
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

// Brand grade. Pulls every hue toward the nearest brand anchor hue, raises
// saturation and lifts the light, so an image can only produce bright, on-palette
// colors. anchors = hex colors (resolved tokens).
// grade = { hueSnap: %, minSaturation: %, minLightness: %, maxLightness: %, lift: gamma }
export function brandGrade(px, anchors, grade) {
  const hues = anchors.map((hex) => rgbToHsl(...hexToRgba(hex))[0]);
  const snap = grade.hueSnap / 100;
  const minSat = grade.minSaturation / 100;
  const lo = grade.minLightness / 100;
  const hi = grade.maxLightness / 100;
  for (let i = 0; i < px.length; i += 4) {
    const [h, s, l] = rgbToHsl(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255);
    const target = nearestHue(h, hues);
    const nh = h + hueDelta(h, target) * snap;
    // Lift: a gamma below 1 opens up the shadows, then squeeze into lo..hi.
    const nl = lo + (hi - lo) * Math.pow(l, grade.lift);
    const [r, g, b] = hslToRgb((nh + 360) % 360, Math.max(s, minSat), nl);
    px[i] = r * 255;
    px[i + 1] = g * 255;
    px[i + 2] = b * 255;
  }
}

// Contrast, after the blur. Stretches the image's own lightness range (1st to 99th
// percentile) to low..high, with an S-curve for punch, so every library image ends
// up with real darks and highlights. Hue and saturation stay. Works on any RGBA
// array with values 0 to 255, including floats.
// contrast = { low: %, high: %, curve: %, midtones: gamma, below 1 is brighter }
export function stretchContrast(px, contrast) {
  const lightness = new Float32Array(px.length / 4);
  for (let i = 0; i < px.length; i += 4) lightness[i / 4] = rgbToHsl(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255)[2];
  const sorted = lightness.slice().sort();
  const p1 = sorted[Math.floor(sorted.length * 0.01)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const lo = contrast.low / 100;
  const hi = contrast.high / 100;
  const k = contrast.curve / 100;
  for (let i = 0; i < px.length; i += 4) {
    const [h, s] = rgbToHsl(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255);
    const t = Math.pow(clamp((lightness[i / 4] - p1) / Math.max(0.001, p99 - p1)), contrast.midtones ?? 1);
    const curved = t + k * (t * t * (3 - 2 * t) - t);
    const [r, g, b] = hslToRgb(h, s, lo + (hi - lo) * curved);
    px[i] = r * 255;
    px[i + 1] = g * 255;
    px[i + 2] = b * 255;
  }
}

// Brand check. Share of colored pixels whose hue falls outside the brand range: the
// short arc between two anchors (red to violet runs through magenta and purple),
// plus `tolerance` degrees on each side. Brown and burnt red (a warm hue that is also
// dark and dull) always fail. Near-white, near-black and gray count as neutral.
export function brandCheck(px, anchors, { tolerance = 30, maxOffBrand = 2 } = {}) {
  const [a, b] = anchors.map((hex) => rgbToHsl(...hexToRgba(hex))[0]);
  const arc = hueDelta(a, b); // signed, short way round
  const inRange = (h) => {
    const t = hueDelta(a, h) * Math.sign(arc || 1);
    return t >= -tolerance && t <= Math.abs(arc) + tolerance;
  };
  let colored = 0;
  let off = 0;
  for (let i = 0; i < px.length; i += 16) {
    const [h, s, l] = rgbToHsl(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255);
    // Only true grays are neutral. Brown is a dull, dark orange, so it must still count.
    if (s < 0.05 || l < 0.04 || l > 0.96) continue;
    colored++;
    if (!inRange(h) || isBrown(h, s, l)) off++;
  }
  const offBrand = colored ? (off / colored) * 100 : 0;
  return { offBrand: Math.round(offBrand * 10) / 10, pass: offBrand <= maxOffBrand };
}

// Warm (red to yellow, -10° to 60°), darker than mid-tone and not vivid.
const isBrown = (h, s, l) => Math.abs(hueDelta(25, h)) <= 35 && l < 0.45 && s < 0.65;

const hueDelta = (from, to) => ((to - from + 540) % 360) - 180;
const nearestHue = (h, hues) => hues.reduce((best, x) => (Math.abs(hueDelta(h, x)) < Math.abs(hueDelta(h, best)) ? x : best));

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}
