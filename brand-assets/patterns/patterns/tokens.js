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
  const tokens = { from: ref(colorway.from), to: ref(colorway.to) };
  // Motion streaks also take the streak color.
  if (colorway.streak) tokens.streak = ref(colorway.streak);
  return tokens;
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
