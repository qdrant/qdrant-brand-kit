// Letter layers: what can change when a tool makes a variation (Vanesa, 2026-11-24).
//
//   - Color mapping: any (field value, x, y, radial, random, angle).
//   - Glyphs: ramp, word or random, but the characters are always the letters QDRANT.
//   - Scale: a little (SCALE_RANGE).
//   - Noise: anything (amount, blend, scale, octaves, drift, warp, seed).
//   - Never jitter. Never a shape in the middle: the field is noise only.
//
// No DOM here, so the validator can use the same rules.

export const LETTERS = "QDRANT";
export const COLOR_MAPS = ["value", "x", "y", "radial", "random", "angle"];
export const GLYPH_MODES = ["ramp", "word", "random"];
export const SCALE_RANGE = [0.45, 0.65];
export const NOISE_KEYS = ["noiseAmount", "blend", "noiseScale", "octaves", "drift", "warp", "seed"];
const CHANGEABLE = ["colorMap", "glyphs", "scale", ...NOISE_KEYS];

// Ranges the variant generator picks from. By the rules, noise may be anything; the
// generator keeps each layer's own noise amount and blend, because those set how many
// letters show ("add" or a low amount leaves almost none), and varies the rest.
export const NOISE_RANGES = {
  noiseScale: [2, 9],
  octaves: [1, 4],
  drift: [0, 1.5],
  warp: [0, 0.35],
  seed: [1, 999],
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// A letter layer: Pattern Studio's ascii elements.
export const isLetterLayer = (preset) => preset?.recipe === "generative-pattern" && preset.settings?.engine?.element === "ascii";

// What breaks the rules in a letter layer's engine settings. Empty when it's fine.
export function letterLayerProblems(engine) {
  const problems = [];
  const shapeless = engine.shape === "none" || (engine.shape === "text" && !engine.text);
  if (!shapeless) problems.push(`has a ${engine.shape === "text" ? `"${engine.text}" text` : engine.shape} shape in the middle; use shape "none", or "text" with no text`);
  if (!GLYPH_MODES.includes(engine.glyphs)) problems.push(`glyphs is "${engine.glyphs}"; use ${GLYPH_MODES.join(", ")}`);
  const characters = engine.glyphs === "word" ? engine.word : engine.ramp;
  if (characters !== LETTERS) problems.push(`its ${engine.glyphs === "word" ? "word" : "characters"} are "${characters}"; always "${LETTERS}"`);
  if (engine.jitter) problems.push(`jitter is ${engine.jitter}; never jitter`);
  if (!(engine.scale >= SCALE_RANGE[0] && engine.scale <= SCALE_RANGE[1])) problems.push(`scale is ${engine.scale}; keep it between ${SCALE_RANGE[0]} and ${SCALE_RANGE[1]}`);
  if (engine.colorMap && !COLOR_MAPS.includes(engine.colorMap)) problems.push(`colorMap is "${engine.colorMap}"; use ${COLOR_MAPS.join(", ")}`);
  return problems;
}

// Variant number n of a letter layer, for rotating through looks: the same n always
// gives the same variant, and 0 is the layer as approved. Every variant keeps the rules.
export function letterVariation(n) {
  if (!n) return {};
  let a = (n * 9973 + 17) | 0;
  const random = () => {
    a = (a + 1831565813) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (list) => list[Math.floor(random() * list.length)];
  const between = ([lo, hi], step = 0.01) => Math.round((lo + random() * (hi - lo)) / step) * step;
  return {
    colorMap: pick(COLOR_MAPS.filter((m) => m !== "angle")),
    glyphs: pick(GLYPH_MODES),
    scale: Number(between(SCALE_RANGE).toFixed(2)),
    noiseScale: Number(between(NOISE_RANGES.noiseScale, 0.1).toFixed(1)),
    octaves: between(NOISE_RANGES.octaves, 1),
    drift: Number(between(NOISE_RANGES.drift).toFixed(2)),
    warp: Number(between(NOISE_RANGES.warp).toFixed(2)),
    seed: between(NOISE_RANGES.seed, 1),
  };
}

// The allowed part of a Pattern Studio variation (pattern_variations or create_pattern
// params from the MCP connector). Everything else (shape, element, colors, jitter...) is
// dropped, and the letters stay QDRANT.
export function fromStudioParams(params = {}) {
  const changes = {};
  for (const key of CHANGEABLE) if (key in params) changes[key] = params[key];
  if (changes.glyphs && !GLYPH_MODES.includes(changes.glyphs)) delete changes.glyphs;
  if (changes.colorMap && !COLOR_MAPS.includes(changes.colorMap)) delete changes.colorMap;
  return changes;
}

// A variation of a letter layer: only the allowed settings change, scale stays in its
// range, and the letters stay QDRANT. Throws on anything else, so a tool can't drift
// off-brand by accident.
export function varyLetterLayer(layer, changes = {}) {
  const wrong = Object.keys(changes).filter((key) => !CHANGEABLE.includes(key));
  if (wrong.length) throw new Error(`Letter layers can't change ${wrong.join(", ")}. Allowed: ${CHANGEABLE.join(", ")}`);
  if (changes.glyphs && !GLYPH_MODES.includes(changes.glyphs)) throw new Error(`glyphs must be one of ${GLYPH_MODES.join(", ")}`);
  if (changes.colorMap && !COLOR_MAPS.includes(changes.colorMap)) throw new Error(`colorMap must be one of ${COLOR_MAPS.join(", ")}`);
  const engine = { ...layer.settings.engine, ...changes, ramp: LETTERS, word: LETTERS, jitter: 0 };
  if ("scale" in changes) engine.scale = clamp(Number(changes.scale), ...SCALE_RANGE);
  return { ...layer, settings: { ...layer.settings, engine } };
}
