// Loads a W3C design tokens file and turns "{color.secondary.500}" into its value.

export async function loadTokens(url) {
  const response = await fetch(url);
  return response.json();
}

export function resolveToken(tokens, value) {
  const match = typeof value === "string" && value.match(/^\{(.+)\}$/);
  if (!match) return value;
  const node = match[1].split(".").reduce((obj, key) => obj?.[key], tokens);
  if (node?.$value === undefined) throw new Error(`Unknown token ${value}`);
  return resolveToken(tokens, node.$value);
}

// "#RRGGBB" or "#RRGGBBAA" to [r, g, b, a], each 0 to 1.
export function hexToRgba(hex) {
  const h = hex.replace("#", "");
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), h.length === 8 ? n(6) : 1];
}

// A colorway is a pair of token paths. "{family}" in a path is filled in with the
// chosen color family, so one colorway can work for every family.
export function colorwayTokens(colorway, family) {
  const ref = (path) => `{${path.replace("{family}", family)}}`;
  return { from: ref(colorway.from), to: ref(colorway.to) };
}

// The families that have every step a colorway needs, limited to the colorway's own
// `families` list when it has one (so neutral can't make a gray gradient).
export function familiesFor(tokens, colorway) {
  return (colorway.families ?? Object.keys(tokens.color)).filter((family) =>
    [colorway.from, colorway.to].every((path) => {
      const steps = path.replace("{family}", family).split(".").slice(1);
      return steps.reduce((node, key) => node?.[key], tokens.color)?.$value !== undefined;
    })
  );
}

// The color tokens in a palette list, as [{ ref: "{color.secondary.500}", hex }].
// Each entry is a whole family ("secondary") or one step ("neutral.950").
export function paletteTokens(tokens, entries) {
  return entries.flatMap((entry) => {
    const [family, step] = entry.split(".");
    const steps = step ? [step] : Object.keys(tokens.color[family] ?? {}).filter((k) => tokens.color[family][k].$type === "color");
    return steps.map((s) => {
      const ref = `{color.${family}.${s}}`;
      return { ref, hex: resolveToken(tokens, ref) };
    });
  });
}

// The palette token that looks closest to an RGB color (0 to 1), measured in OKLab,
// a color space where distance matches how different two colors look.
export function nearestToken(r, g, b, palette) {
  return nearestTokenWithDistance(r, g, b, palette).token;
}

// Same, plus how far away it is (OKLab distance; about 0.02 is barely visible).
export function nearestTokenWithDistance(r, g, b, palette) {
  const lab = oklab(r, g, b);
  let token = palette[0];
  let best = Infinity;
  for (const t of palette) {
    t.lab ??= oklab(...hexToRgba(t.hex));
    const d = (lab[0] - t.lab[0]) ** 2 + (lab[1] - t.lab[1]) ** 2 + (lab[2] - t.lab[2]) ** 2;
    if (d < best) {
      best = d;
      token = t;
    }
  }
  return { token, distance: Math.sqrt(best) };
}

function oklab(r, g, b) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
