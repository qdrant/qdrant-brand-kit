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
