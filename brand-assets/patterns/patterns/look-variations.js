// Open looks: generative patterns agents may vary on their own (visual designer, 2026-11-25).
//
// Approved looks: data bars (Generative-Dash-Pattern), hyperspace (Generative-Burst-Pattern)
// and hex pulse (Generative-Pulse-Pattern, Generative-Rings-Pattern). The Pattern Studio
// connector isn't needed: the repo has the same engine, so a variation is only new engine
// values. A preset with settings.look.ranges is an open look. A variation may change only
// the keys in ranges, and each value stays inside its range:
//
//   - numbers: [min, max], from the pattern as approved and its approved variants;
//   - words (paint, colorMap, element, shape): one of the listed choices;
//   - cell: on the 8 grid; seed: any whole number in its range.
//
// Colors never change here: they come from the colorway and its rules.
// No DOM here, so the validator can use the same rules.

export const isOpenLook = (preset) => Boolean(preset?.settings?.look?.ranges);

// What breaks the look's rules in a set of changes. Empty when it's fine.
export function lookProblems(preset, changes = {}) {
  const ranges = preset?.settings?.look?.ranges;
  if (!ranges) return [`${preset?.name ?? "this pattern"} isn't an open look; use its approved variants`];
  const problems = [];
  for (const [key, value] of Object.entries(changes)) {
    const range = ranges[key];
    if (!range) {
      problems.push(`${key} can't change in this look`);
      continue;
    }
    if (typeof range[0] === "number") {
      if (typeof value !== "number" || value < range[0] || value > range[1]) problems.push(`${key} is ${value}; keep it between ${range[0]} and ${range[1]}`);
      else if (key === "cell" && value % 8 !== 0) problems.push(`cell is ${value}; use the 8 grid`);
      else if ((key === "seed" || key === "count") && !Number.isInteger(value)) problems.push(`${key} is ${value}; use a whole number`);
    } else if (!range.includes(value)) problems.push(`${key} is "${value}"; use ${range.join(" or ")}`);
  }
  return problems;
}

// Applies a variation to the preset's engine, or throws if it breaks the rules.
export function varyLook(preset, changes = {}) {
  const problems = lookProblems(preset, changes);
  if (problems.length) throw new Error(`${preset.name}: ${problems.join("; ")}`);
  return { ...preset, settings: { ...preset.settings, engine: { ...preset.settings.engine, ...changes } } };
}

// Variation number n of an open look, for rotating through new looks: the same n always
// gives the same values, and 0 is the pattern as approved. Each variation changes two to
// four of the look's values, so it stays close to what was approved.
export function lookVariation(preset, n) {
  const ranges = preset?.settings?.look?.ranges;
  if (!ranges || !n) return {};
  let a = (n * 7919 + 101) | 0;
  const random = () => {
    a = (a + 1831565813) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const keys = Object.keys(ranges);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const changes = {};
  for (const key of keys.slice(0, Math.min(keys.length, 2 + Math.floor(random() * 3)))) {
    const range = ranges[key];
    if (typeof range[0] !== "number") changes[key] = range[Math.floor(random() * range.length)];
    else if (key === "cell") changes[key] = Math.min(range[1], Math.max(range[0], Math.round((range[0] + random() * (range[1] - range[0])) / 8) * 8));
    else if (key === "seed" || key === "count") changes[key] = Math.round(range[0] + random() * (range[1] - range[0]));
    else changes[key] = Math.round((range[0] + random() * (range[1] - range[0])) * 100) / 100;
  }
  return changes;
}
