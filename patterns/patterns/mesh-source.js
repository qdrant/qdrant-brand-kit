// Image source, shared by every image recipe. Turns a library image into a mesh
// gradient: code, not an image. It's a small grid of points (about 11 x 11), and each
// point is a brand color token, like "{color.secondary.700}". For each point, the
// code reads the color of the blurred, brand-graded image there and picks the
// closest token in the brand palette, so a pattern can't drift off-brand. Recipes
// draw smooth curves between the points, so the PNG isn't needed once the mesh is
// made. When the token values change, every mesh follows.
//
// The steps and their values (grade, blur, contrast) come from the shared preset
// files, so they're the same in every image pattern of a group.
//
// The source image is a placeholder: in the tool it's picked from the Design Lab
// library by the "source" rule in mesh-pattern.shared.json (design-approved images
// from the space moodboard only, never the mascot, never Luma). The tool makes the
// mesh once and keeps only the mesh. The files in sources/ are test examples, and
// meshes/ holds their meshes.

import { resolveToken, hexToRgba, paletteTokens, nearestToken } from "./tokens.js";
import { brandGrade, stretchContrast } from "./effects.js";

// Image to mesh: { size: n, colors: ["{color.secondary.700}", ...] }, row by row from
// the top left.
export function imageToMesh(image, tokens, settings) {
  const { size, grade, blur, contrast, mesh } = settings;
  const anchors = grade.anchors.map((ref) => resolveToken(tokens, ref));

  // Step 1: fill the square like CSS object-fit: cover, and grade it to the brand.
  const tile = document.createElement("canvas");
  tile.width = tile.height = size;
  const scale = Math.max(size / image.width, size / image.height);
  const tctx = tile.getContext("2d");
  tctx.drawImage(image, (size - image.width * scale) / 2, (size - image.height * scale) / 2, image.width * scale, image.height * scale);
  const graded = tctx.getImageData(0, 0, size, size).data;
  brandGrade(graded, anchors, grade);

  // Step 2: blur. Average the image down to a small grid and blur that. Fewer grid
  // cells for a bigger blur. This grid is the mesh.
  const sigma = blur.radius * FIGMA_BLUR_TO_CSS;
  const n = Math.min(64, Math.max(6, Math.round((size * GRID_PER_BLUR) / sigma)));
  const grid = shrink(graded, size, n);
  blurGrid(grid, n, 1);

  // Step 3: contrast, on the grid.
  stretchContrast(grid, contrast);

  // Step 4: snap every point to the closest brand token.
  const palette = paletteTokens(tokens, mesh.palette);
  const colors = [];
  for (let g = 0; g < n * n; g++) colors.push(nearestToken(grid[g * 4] / 255, grid[g * 4 + 1] / 255, grid[g * 4 + 2] / 255, palette).ref);
  return { size: n, colors };
}

// A source is a mesh (has colors) or an image (made into a mesh first).
// Returns { sample(x, y, channel) -> 0 to 1, anchors: brand hex colors, palette: tokens }.
export function prepareImage(source, tokens, settings) {
  const anchors = settings.grade.anchors.map((ref) => resolveToken(tokens, ref));
  const mesh = source.colors ? source : imageToMesh(source, tokens, settings);
  const grid = new Float32Array(mesh.size * mesh.size * 4);
  mesh.colors.forEach((ref, g) => {
    const [r, gr, b] = hexToRgba(resolveToken(tokens, ref));
    grid[g * 4] = r * 255;
    grid[g * 4 + 1] = gr * 255;
    grid[g * 4 + 2] = b * 255;
  });
  const palette = paletteTokens(tokens, settings.mesh.palette);
  return { sample: smoothSampler(grid, mesh.size, settings.size), anchors, palette };
}

// Box-average the image down to an n x n grid of RGBA floats (0 to 255).
function shrink(px, size, n) {
  const grid = new Float32Array(n * n * 4);
  const counts = new Float32Array(n * n);
  for (let y = 0; y < size; y++) {
    const gy = Math.min(n - 1, Math.floor((y / size) * n));
    for (let x = 0; x < size; x++) {
      const gx = Math.min(n - 1, Math.floor((x / size) * n));
      const g = gy * n + gx;
      const i = (y * size + x) * 4;
      grid[g * 4] += px[i];
      grid[g * 4 + 1] += px[i + 1];
      grid[g * 4 + 2] += px[i + 2];
      counts[g]++;
    }
  }
  for (let g = 0; g < n * n; g++) for (let c = 0; c < 3; c++) grid[g * 4 + c] /= counts[g];
  return grid;
}

// Gaussian blur on the grid, mirrored at the edges so they don't darken.
function blurGrid(grid, n, sigma) {
  const r = Math.ceil(sigma * 3);
  const weights = Array.from({ length: 2 * r + 1 }, (_, k) => Math.exp(-((k - r) ** 2) / (2 * sigma * sigma)));
  const total = weights.reduce((a, b) => a + b, 0);
  const mirror = (i) => (i < 0 ? -i - 1 : i >= n ? 2 * n - i - 1 : i);
  for (const horizontal of [true, false]) {
    const copy = grid.slice();
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let k = -r; k <= r; k++) {
            const sx = horizontal ? mirror(x + k) : x;
            const sy = horizontal ? y : mirror(y + k);
            sum += copy[(sy * n + sx) * 4 + c] * weights[k + r];
          }
          grid[(y * n + x) * 4 + c] = sum / total;
        }
      }
    }
  }
}

// Reads the grid at full size with cubic B-spline weights: smooth everywhere, no
// overshoot, no visible grid. Edge wrap "Zero": outside, keep the nearest edge.
function smoothSampler(grid, n, size) {
  const bspline = (t) => [(1 - t) ** 3 / 6, (3 * t ** 3 - 6 * t ** 2 + 4) / 6, (-3 * t ** 3 + 3 * t ** 2 + 3 * t + 1) / 6, t ** 3 / 6];
  const at = (gx, gy, c) => grid[(Math.min(n - 1, Math.max(0, gy)) * n + Math.min(n - 1, Math.max(0, gx))) * 4 + c];
  return (x, y, c) => {
    const fx = (x / size) * n - 0.5;
    const fy = (y / size) * n - 0.5;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const wx = bspline(fx - ix);
    const wy = bspline(fy - iy);
    let sum = 0;
    for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) sum += wy[j] * wx[k] * at(ix - 1 + k, iy - 1 + j, c);
    return sum / 255;
  };
}

// Figma's layer blur value to a CSS blur radius in pixels.
const FIGMA_BLUR_TO_CSS = 0.12;

// How many grid cells per blur radius. Fewer cells = bigger, softer shapes.
const GRID_PER_BLUR = 1.2;
