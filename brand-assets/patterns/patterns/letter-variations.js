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
